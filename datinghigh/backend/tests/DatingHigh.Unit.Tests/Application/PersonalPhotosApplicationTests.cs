using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

// Application的呼叫次序／錯誤及補償；固定SQL的條件與rollback另由真Miniflare驗證。
public sealed class PersonalPhotosApplicationTests
{
    private static readonly CurrentUser User=new(EntityId.New(),EntityId.New(),1,long.MaxValue);
    private static MemoryStream Original()=>new(Enumerable.Range(0,64).Select(n=>(byte)n).ToArray());

    [Theory,Trait("Case","AP-UT-056"),Trait("Case","AP-UT-058"),Trait("Case","AP-UT-060")]
    [InlineData("IMAGE_TOO_LARGE",413)][InlineData("INVALID_IMAGE",400)][InlineData("COMPRESSED_IMAGE_TOO_LARGE",413)]
    public async Task InvalidCompression_RejectsBeforeAnyRepositoryOrMediaIo(string code,int status)
    {
        var f=new Fixture{CompressionFailure=new(code,status)};using var input=Original();
        var error=await Assert.ThrowsAsync<DomainException>(()=>f.Service.UploadAsync(User,input,"image/png"));
        Assert.Same(f.CompressionFailure,error);Assert.Equal(new[]{"compress"},f.Events);
        Assert.Null(f.NewAsset);Assert.Single(f.Photos);Assert.Equal(new byte[]{42,43},f.Photos[f.Existing]);
    }

    [Theory,Trait("Case","AP-UT-061"),Trait("Case","AP-UT-062"),Trait("Case","AP-UT-066")]
    [InlineData(true,409,"PHOTO_LIMIT_REACHED")][InlineData(false,401,"SESSION_REVOKED")]
    public async Task DeniedReservation_DistinguishesQuotaAndRevokedFamily_WithoutWritingBytes(bool active,int status,string code)
    {
        var f=new Fixture{ReserveAllowed=false,Active=active};for(var n=0;n<4;n++)f.Photos[EntityId.New()]=[42,43];using var input=Original();
        var error=await Assert.ThrowsAsync<DomainException>(()=>f.Service.UploadAsync(User,input,"image/png"));
        Assert.Equal(status,error.Status);Assert.Equal(code,error.Code);
        Assert.Equal(new[]{"compress","profile.ensure","profile.photo.reserve","session.validate"},f.Events);
        Assert.Equal(5,f.Photos.Count);Assert.False(f.Ready);Assert.False(f.Deleted);
    }

    [Fact,Trait("Case","AP-UT-003"),Trait("Case","AP-UT-004")]
    public async Task Upload_SendsOnlyReencodedBytesAfterReservation_AndReturnsSafeReadyMetadata()
    {
        var f=new Fixture();using var first=Original();var firstSaved=await f.Service.UploadAsync(User,first,"image/png");
        using var input=Original();var output=await f.Service.UploadAsync(User,input,"image/png");
        Assert.Equal(Enumerable.Repeat(new[]{"compress","profile.ensure","profile.photo.reserve","save","profile.photo.list","session.validate"},2).SelectMany(x=>x),f.Events);
        Assert.NotEqual(firstSaved.Text("assetId"),output.Text("assetId"));Assert.Equal(3,f.Photos.Count);
        Assert.Equal(new byte[]{7,8,9},f.Photos[f.NewAsset!]);Assert.Equal("image/jpeg",output.Text("mimeType"));
        Assert.Equal(f.NewAsset,output.Text("assetId"));Assert.Equal(new[]{"assetId","createdAt","displayOrder","mimeType"},output.Select(p=>p.Key).Order().ToArray());
        Assert.Equal($"private/{User.AccountId}/photos/{f.NewAsset}",f.Reservation!.Text("objectKey"));
        Assert.DoesNotContain("bytes",f.Reservation!.ToJsonString(),StringComparison.OrdinalIgnoreCase);
        Assert.Equal(new byte[]{42,43},f.Photos[f.Existing]);
    }

    [Fact,Trait("Case","AP-UT-077"),Trait("Case","AP-UT-078")]
    public async Task StorageFailure_CancelsPendingBeforeDeletingCopy_AndRetryUsesANewIdentity()
    {
        var f=new Fixture{SaveFailure=new("STORAGE_UNAVAILABLE",503)};using var first=Original();
        var error=await Assert.ThrowsAsync<DomainException>(()=>f.Service.UploadAsync(User,first,"image/png"));
        Assert.Same(f.SaveFailure,error);var failedAsset=f.NewAsset;Assert.True(f.Deleted);Assert.False(f.Ready);
        Assert.Equal(new[]{"compress","profile.ensure","profile.photo.reserve","save","profile.photo.cancel-upload","delete"},f.Events);
        Assert.Single(f.Photos);Assert.Equal(new byte[]{42,43},f.Photos[f.Existing]);
        f.SaveFailure=null;using var retry=Original();var saved=await f.Service.UploadAsync(User,retry,"image/png");
        Assert.NotEqual(failedAsset,saved.Text("assetId"));Assert.Equal(2,f.Photos.Count);Assert.True(f.Ready);
    }

    [Fact]
    public async Task CancelledCaller_DoesNotCancelTheBoundedCompensationToken()
    {
        using var caller=new CancellationTokenSource();var f=new Fixture{OnSave=caller.Cancel,CancelSave=true};using var input=Original();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(()=>f.Service.UploadAsync(User,input,"image/png",caller.Token));
        Assert.True(caller.IsCancellationRequested);Assert.True(f.Deleted);Assert.Single(f.Photos);
        Assert.Equal(new[]{"profile.photo.cancel-upload","delete"},f.Events.TakeLast(2));
    }

    [Fact]
    public async Task LostReadyAcknowledgement_CannotCancelOrPhysicallyDeleteCommittedPhoto()
    {
        var f=new Fixture{CommitBeforeFailure=true,SaveFailure=new("STORAGE_UNAVAILABLE",503)};using var input=Original();
        await Assert.ThrowsAsync<DomainException>(()=>f.Service.UploadAsync(User,input,"image/png"));
        Assert.True(f.Ready);Assert.False(f.Deleted);Assert.Equal(new byte[]{7,8,9},f.Photos[f.NewAsset!]);
        Assert.Equal(new byte[]{42,43},f.Photos[f.Existing]);Assert.Equal(2,f.Photos.Count);
    }

    private sealed class Fixture:IPlatformClient,IPrivateMediaStore,IImageCompressionService
    {
        public readonly string Existing=EntityId.New();public readonly Dictionary<string,byte[]> Photos=[];
        public readonly List<string> Events=[];public string? NewAsset;public JsonNode? Reservation;
        public bool Active=true,ReserveAllowed=true,Ready,Deleted,CancelSave,CommitBeforeFailure;
        public DomainException? CompressionFailure,SaveFailure;public Action? OnSave;
        public Fixture(){Photos[Existing]=[42,43];}
        public PersonalPhotosService Service=>new(this,this,this);
        private static JsonNode Rows(params JsonObject[] rows)=>new JsonObject{["rows"]=new JsonArray(rows.Cast<JsonNode?>().ToArray())};
        public Task<CompressedImage> CompressAsync(Stream input,int targetBytes=200000,ImageCompressionOptions? options=null,CancellationToken ct=default)
        {
            Events.Add("compress");Assert.Equal(200000,targetBytes);Assert.Equal("image/png",options!.DeclaredMimeType);
            if(CompressionFailure is not null)throw CompressionFailure;
            return Task.FromResult(new CompressedImage(new byte[]{7,8,9},"image/jpeg",300,400));
        }
        public Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken ct=default)
        {
            ct.ThrowIfCancellationRequested();Events.Add(command);var p=JsonSerializer.SerializeToNode(payload)!;
            Assert.Equal(User.AccountId,p.Text("accountId"));Assert.Equal(User.SessionId,p.Text("sessionId"));
            JsonNode result;
            switch(command){
                case "profile.ensure":result=Rows();break;
                case "profile.photo.reserve":Reservation=p;NewAsset=p.Text("assetId");Ready=false;Deleted=false;result=ReserveAllowed?Rows(new JsonObject{["asset_id"]=NewAsset}):Rows();break;
                case "session.validate":result=Active?Rows(new JsonObject{["account_id"]=User.AccountId}):Rows();break;
                case "profile.photo.cancel-upload":if(!Ready)Deleted=true;result=Rows();break;
                case "profile.photo.list":result=Rows(new JsonObject{["asset_id"]=NewAsset,["mime_type"]="image/jpeg",["display_order"]=1L,["created_at"]=1L});break;
                default:throw new InvalidOperationException("Unexpected photo Application command");
            }
            return Task.FromResult(result);
        }
        public Task SavePhotoAsync(CurrentUser user,string assetId,CompressedImage image,CancellationToken ct=default)
        {
            Events.Add("save");Assert.Equal(User,user);Assert.Equal(NewAsset,assetId);OnSave?.Invoke();
            if(CancelSave)throw new OperationCanceledException(ct);
            if(SaveFailure is null||CommitBeforeFailure){Photos[assetId]=image.Bytes.ToArray();Ready=true;}
            if(SaveFailure is not null)throw SaveFailure;return Task.CompletedTask;
        }
        public Task DeletePhotoAsync(CurrentUser user,string assetId,CancellationToken ct=default)
        {
            ct.ThrowIfCancellationRequested();Events.Add("delete");Assert.Equal(User,user);Assert.Equal(NewAsset,assetId);
            if(!Deleted)throw new DomainException("PHOTO_UPLOAD_CONFLICT",409);Photos.Remove(assetId);return Task.CompletedTask;
        }
        public Task<PrivateMediaContent> ReadPhotoAsync(CurrentUser user,string assetId,CancellationToken ct=default)=>throw new InvalidOperationException("Upload must not read another photo");
    }
}
