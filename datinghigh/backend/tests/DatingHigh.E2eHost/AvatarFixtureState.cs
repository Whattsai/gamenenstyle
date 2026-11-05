using System.Net;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Domain;
using DatingHigh.Infrastructure.Media;
using DatingHigh.Integration.Tests;

namespace DatingHigh.E2eHost;

// 僅loopback測試Host明選profile使用：真Application／D1／R2，只有圖片供應商被受控替換。
internal sealed class AvatarFixtureState: IAvatarImageGenerator,IDisposable
{
    private readonly RealPlatform platform;
    private readonly HttpClient bridge;
    private readonly object gate=new();
    private string next="normal";
    private int calls;
    private CompressedImage? last;
    private ProfileOption? retiredOriginal;
    public PrivateMediaStore Media {get;}
    public AvatarCandidateStore Candidates {get;}
    public AvatarFixtureState(RealPlatform source)
    {
        platform=source;bridge=new(new MediaBridge(source)){BaseAddress=new("http://platform.internal/")};
        Media=new(bridge);Candidates=new(bridge);
    }
    public void Reset(){lock(gate){RestoreCatalog();next="normal";calls=0;last=null;}}
    public void RetireChoice()
    {
        lock(gate){var options=ProfileCatalog.Groups["interestTagIds"];var index=Array.FindIndex(options,option=>option.Id=="puzzle");retiredOriginal??=options[index];options[index]=options[index] with{Active=false};}
    }
    private void RestoreCatalog()
    {
        if(retiredOriginal is null)return;var options=ProfileCatalog.Groups["interestTagIds"];var index=Array.FindIndex(options,option=>option.Id=="puzzle");options[index]=retiredOriginal;retiredOriginal=null;
    }
    public bool Configure(string mode)
    {
        if(mode is not("normal" or "unavailable" or "no-image" or "rate-limited" or "uncertain" or "duplicate" or "slow"))return false;
        lock(gate)next=mode;return true;
    }
    public async Task<CompressedImage> GenerateAsync(IReadOnlyList<PrivateMediaContent> photos,string styleId,CancellationToken ct=default)
    {
        if(photos.Count is <2 or >5||photos.Any(photo=>photo.MimeType!="image/jpeg"||photo.Bytes.Length is <1 or >200000))throw new InvalidOperationException("Invalid controlled source contract");
        string mode;int number;CompressedImage? previous;lock(gate){mode=next;next="normal";number=++calls;previous=last;}
        if(mode=="slow")await Task.Delay(3000,ct);
        if(mode=="unavailable")throw new DomainException("IMAGE_PROVIDER_UNAVAILABLE",503);
        if(mode=="no-image")throw new DomainException("IMAGE_PROVIDER_NO_IMAGE",503);
        if(mode=="rate-limited")throw new DomainException("RATE_LIMITED",429);
        if(mode=="uncertain")throw new DomainException("IMAGE_PROVIDER_UNCERTAIN",503);
        if(mode=="duplicate")return previous??throw new InvalidOperationException("Controlled duplicate requires an earlier result");
        // 既有內建插畫只作測試回應，不作真Gemini、風格或相似度證據。
        using var input=new MemoryStream(Picture(number));var image=await new ImageCompressionService().CompressAsync(input,2000000,new("image/jpeg"),ct);
        lock(gate)last=image;return image;
    }
    private static byte[] Picture(int number)
    {
        var slot=number%16;var group=slot<8?"male":"female";var index=slot%8+1;
        return File.ReadAllBytes(Path.GetFullPath($"frontend/client/assets/avatars/{group}-{index:00}.jpg"));
    }
    private async Task<CurrentUser> Current()
    {
        var rows=await platform.Sql("SELECT s.account_id,s.session_id,a.credential_version FROM auth_sessions s JOIN auth_accounts a ON a.account_id=s.account_id WHERE s.revoked_at IS NULL AND a.status='active'");
        if(rows.Count!=1)throw new InvalidOperationException("Controlled avatar profile requires exactly one active fixture account");var row=rows[0]!;
        return new(row.Text("account_id"),row.Text("session_id"),row.Number("credential_version"),platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());
    }
    public async Task<JsonNode> SeedPhotos(int count,CancellationToken ct)
    {
        var user=await Current();var service=new PersonalPhotosService(platform,Media,new ImageCompressionService());
        for(var n=0;n<count;n++){using var input=new MemoryStream(Picture(n+20));await service.UploadAsync(user,input,"image/jpeg",ct);}
        // 受控照片fixture明確選用多元性別以滿足舊CAS案例前提；正式應用不推測既有帳號。
        await platform.Sql("UPDATE user_profiles SET gender=COALESCE(gender,'diverse') WHERE account_id=?",user.AccountId);
        return new JsonObject{["count"]=(await service.ListAsync(user,ct))["photos"]!.AsArray().Count};
    }
    public async Task<JsonNode> AdvanceRevision()
    {
        var user=await Current();var row=(await platform.ExecuteAsync("profile.read",new{accountId=user.AccountId,sessionId=user.SessionId,cv=user.CredentialVersion,accessExpiresAt=user.AccessExpiresAt}))["rows"]![0]!;
        await platform.Sql("UPDATE user_profiles SET gender='diverse' WHERE account_id=?",user.AccountId);
        return await platform.ExecuteAsync("profile.avatar.builtin",new{accountId=user.AccountId,sessionId=user.SessionId,cv=user.CredentialVersion,accessExpiresAt=user.AccessExpiresAt,expectedRevision=row.Number("revision"),avatarId="female-07"});
    }
    public async Task<JsonNode> Snapshot()
    {
        int count;lock(gate)count=calls;
        return new JsonObject{["providerCalls"]=count,["profiles"]=(await platform.Sql("SELECT account_id,revision,nickname,occupation,gender,romantic_orientation_json,card_visibility_json,interests_json,preferences_json,selected_avatar_type,selected_avatar_ref FROM user_profiles ORDER BY account_id")).DeepClone(),["assets"]=(await platform.Sql("SELECT asset_id,account_id,kind,status,display_order FROM user_media_assets ORDER BY asset_id")).DeepClone()};
    }
    public void Dispose(){lock(gate)RestoreCatalog();bridge.Dispose();}

    private sealed class MediaBridge(RealPlatform platform):HttpMessageHandler
    {
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)
        {
            var headers=request.Headers.ToDictionary(item=>item.Key,item=>string.Join(",",item.Value));
            if(request.Content?.Headers.ContentType is not null)headers["Content-Type"]=request.Content.Headers.ContentType.ToString();
            var result=await platform.ExecuteAsync("$test-media",new{path=request.RequestUri!.AbsolutePath,method=request.Method.Method,headers,content=request.Content is null?null:Convert.ToBase64String(await request.Content.ReadAsByteArrayAsync(ct))},ct);
            var response=new HttpResponseMessage((HttpStatusCode)result.Number("status")){Content=new ByteArrayContent(Convert.FromBase64String(result.Text("content")))};
            var mime=result.Maybe("mime");if(mime is not null)response.Content.Headers.ContentType=new(mime);return response;
        }
    }
}
