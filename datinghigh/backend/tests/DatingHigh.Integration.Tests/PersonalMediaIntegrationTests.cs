using System.Net;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Domain;
using DatingHigh.Infrastructure.Media;
using DatingHigh.Infrastructure;
using SkiaSharp;

namespace DatingHigh.Integration.Tests;

/// <summary>真 .NET 壓縮／HttpClient binary bridge → Worker dispatch → Miniflare D1/R2。</summary>
public sealed class PersonalMediaIntegrationTests
{
    [Fact,Trait("Case","AP-IT-006"),Trait("Case","AP-IT-007"),Trait("Case","AP-IT-008"),Trait("Case","AP-IT-014"),Trait("Case","AP-IT-020"),Trait("Case","AP-IT-024"),Trait("Case","AP-IT-027")]
    public async Task ProfileAndPhotos_SurviveCrossPlatformFamilyReplacement_AndOwnPreviewStaysCurrent()
    {
        await using var p=new RealPlatform();var old=await User(p);var profiles=new DatingProfileService(p,p.Clock);
        var first=await profiles.ReadAsync(old);var profileId=(await p.Sql("SELECT profile_id FROM user_profiles WHERE account_id=?",old.AccountId))[0]!.Text("profile_id");
        ProfileUpdateInput Form(long revision,string? occupation)=>ProfileUpdateInput.Parse(System.Text.Json.JsonSerializer.SerializeToUtf8Bytes(new{
            expectedRevision=revision,nickname="星河旅人",bio="喜歡手作",occupation,birthDate="1995-01-01",regionCode="TW-TPE",
            traitTagIds=new[]{"warm"},interestTagIds=new[]{"puzzle"},topicTagIds=new[]{"creative_chat"},valueTagIds=new[]{"creativity"},
            weekendPreference="explore",sleepSchedule="night_owl",conversationStyle="warm",expectedInteractionFrequency="weekly",relationshipMode="friends_first",
            preferredAgeMin=25,preferredAgeMax=35,preferredRegionCodes=new[]{"TW-TPE"},sharedInterestWeight=60, gender="diverse",romanticOrientation=new[]{"male","female"},cardVisibility=new Dictionary<string,bool>()
        }),p.Clock);
        var input=Form(1,"工程師");Assert.Equal(2,await profiles.SaveAsync(old,input));
        var saved=await profiles.ReadAsync(old);var expected=System.Text.Json.JsonSerializer.SerializeToNode(input,new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web))!.AsObject();
        foreach(var field in expected.Where(v=>v.Key!="expectedRevision"))Assert.Equal(field.Value?.ToJsonString(),saved[field.Key]?.ToJsonString());
        var jsonRow=(await p.Sql("SELECT interests_json,preferences_json FROM user_profiles WHERE account_id=?",old.AccountId))[0]!;
        Assert.Equal(new[]{"interestTagIds","topicTagIds","valueTagIds"},JsonNode.Parse(jsonRow.Text("interests_json"))!.AsObject().Select(v=>v.Key).Order().ToArray());
        Assert.Equal(new[]{"conversationStyle","expectedInteractionFrequency","preferredAgeMax","preferredAgeMin","preferredRegionCodes","relationshipMode","sharedInterestWeight","sleepSchedule","weekendPreference"},JsonNode.Parse(jsonRow.Text("preferences_json"))!.AsObject().Select(v=>v.Key).Order().ToArray());
        using var http=new HttpClient(new Bridge(p)){BaseAddress=new("http://platform.internal/")};var media=new PrivateMediaStore(http);var provider=new OneImageProvider();
        var avatars=new AvatarService(p,media,new AvatarCandidateStore(http),provider,new RateLimiter(p,p.Options,p.Clock));
        Assert.Equal(3,(await avatars.SelectAsync(old,new JsonObject{["type"]="builtin",["builtinAvatarId"]="male-03",["expectedRevision"]=2L})).Number("revision"));
        Assert.Equal(4,(await avatars.SelectAsync(old,new JsonObject{["type"]="builtin",["builtinAvatarId"]="female-07",["expectedRevision"]=3L})).Number("revision"));
        Assert.Empty((await Service(p).ListAsync(old))["photos"]!.AsArray());Assert.True((await profiles.ReadAsync(old))["profileReady"]!.GetValue<bool>());Assert.Equal(0,provider.Calls);
        using var source=new MemoryStream(Picture());var photo=await Service(p).UploadAsync(old,source,"image/png");var asset=photo.Text("assetId");
        var login=RealPlatform.Json((await p.App.Login(RealPlatform.Email,RealPlatform.Password,"web","127.0.0.1",default)).Body);
        var current=new CurrentUser(login["account"]!.Text("accountId"),login["session"]!.Text("sessionId"),1,old.AccessExpiresAt);
        Assert.NotEqual(old.SessionId,current.SessionId);Assert.Equal(old.AccountId,current.AccountId);
        Assert.Equal("SESSION_REVOKED",(await Assert.ThrowsAsync<DomainException>(()=>profiles.ReadAsync(old))).Code);
        var immutableBefore=new JsonObject{["profiles"]=(await p.Sql("SELECT * FROM user_profiles ORDER BY account_id")).DeepClone(),["media"]=(await p.Sql("SELECT * FROM user_media_assets ORDER BY asset_id")).DeepClone()}.ToJsonString();
        foreach(var action in new Func<Task>[] {async()=>{await Service(p).ReadAsync(old,asset);},async()=>{await avatars.SelectAsync(old,new JsonObject{["type"]="builtin",["builtinAvatarId"]="male-01",["expectedRevision"]=4L});}}){var denied=await Assert.ThrowsAsync<DomainException>(action);Assert.Equal(401,denied.Status);Assert.Equal("SESSION_REVOKED",denied.Code);}
        Assert.Equal(immutableBefore,new JsonObject{["profiles"]=(await p.Sql("SELECT * FROM user_profiles ORDER BY account_id")).DeepClone(),["media"]=(await p.Sql("SELECT * FROM user_media_assets ORDER BY asset_id")).DeepClone()}.ToJsonString());
        var reread=await profiles.ReadAsync(current);Assert.Equal(4,reread.Number("revision"));Assert.Equal("female-07",reread.Text("selectedAvatarRef"));Assert.Equal("工程師",reread.Text("occupation"));
        foreach(var field in expected.Where(v=>v.Key!="expectedRevision"))Assert.Equal(field.Value?.ToJsonString(),reread[field.Key]?.ToJsonString());
        Assert.Equal(asset,Assert.Single(reread["personalPhotos"]!.AsArray())!.Text("assetId"));Assert.InRange((await media.ReadPhotoAsync(current,asset)).Bytes.Length,1,200000);
        var preview=new OwnCardPreviewService(profiles,p.Clock);var card=await preview.ReadAsync(current);Assert.Equal("工程師",card.Text("occupation"));Assert.Equal(asset,Assert.Single(card["personalPhotos"]!.AsArray())!.Text("assetId"));
        foreach(var key in new[]{"birthDate","preferredAgeMin","preferredAgeMax","preferredRegionCodes","sharedInterestWeight","email","accountId","sessionId"})Assert.Null(card[key]);
        Assert.Contains("不代表已授權",card.Text("notice"));Assert.Equal(403,(await Assert.ThrowsAsync<DomainException>(()=>new DenyCurrentCardAuthorization().AuthorizeAsync(current,EntityId.New(),EntityId.New()))).Status);
        Assert.Equal(5,await profiles.SaveAsync(current,Form(4,null)));var minimal=await profiles.ReadAsync(current);Assert.True(minimal["profileReady"]!.GetValue<bool>());Assert.Null(minimal["occupation"]);Assert.Null((await preview.ReadAsync(current))["occupation"]);
        await Service(p).DeleteAsync(current,asset);Assert.Empty((await preview.ReadAsync(current))["personalPhotos"]!.AsArray());Assert.Equal(404,(await Assert.ThrowsAsync<DomainException>(()=>media.ReadPhotoAsync(current,asset))).Status);
        Assert.Equal(profileId,Assert.Single(await p.Sql("SELECT profile_id FROM user_profiles WHERE account_id=?",current.AccountId))!.Text("profile_id"));
        Assert.Equal(1,(await p.Sql("SELECT credential_version FROM auth_accounts WHERE account_id=?",current.AccountId))[0]!.Number("credential_version"));Assert.Equal(0,provider.Calls);
    }
    [Fact]
    public async Task RealCompressionFailures_RejectOversizeForgedAndUncompressibleSourcesWithoutD1OrR2Changes()
    {
        await using var p=new RealPlatform();var user=await User(p);var photos=Service(p);using var valid=new MemoryStream(Picture());var saved=await photos.UploadAsync(user,valid,"image/png");
        var original=(await photos.ReadAsync(user,saved.Text("assetId"))).Bytes.ToArray();
        async Task<string> Snapshot()=>new JsonObject{["profiles"]=(await p.Sql("SELECT * FROM user_profiles")).DeepClone(),["media"]=(await p.Sql("SELECT * FROM user_media_assets ORDER BY asset_id")).DeepClone(),["objects"]=(await p.ExecuteAsync("$test-r2-list",new{})).DeepClone()}.ToJsonString();
        var before=await Snapshot();
        using var bitmap=new SKBitmap(128,8192);var pixels=bitmap.GetPixelSpan();new Random(937).NextBytes(pixels);for(var n=3;n<pixels.Length;n+=4)pixels[n]=255;
        using var image=SKImage.FromBitmap(bitmap);using var data=image.Encode(SKEncodedImageFormat.Png,100);Assert.InRange(data.Size,1,8*1024*1024);
        foreach(var (bytes,mime,code,status) in new[]{(new byte[8*1024*1024+1],"image/png","IMAGE_TOO_LARGE",413),(new byte[]{1,2,3},"image/jpeg","INVALID_IMAGE",400),(data.ToArray(),"image/png","COMPRESSED_IMAGE_TOO_LARGE",413)}){
            using var input=new MemoryStream(bytes);var error=await Assert.ThrowsAsync<DomainException>(()=>photos.UploadAsync(user,input,mime));Assert.Equal(code,error.Code);Assert.Equal(status,error.Status);Assert.Equal(before,await Snapshot());Assert.Equal(original,(await photos.ReadAsync(user,saved.Text("assetId"))).Bytes.ToArray());
        }
    }

    [Fact]
    public async Task SharedCompression_IndependentSegmentedCallerWithExact200000Bytes_DoesNotTouchD1OrR2()
    {
        await using var p=new RealPlatform();var user=await User(p);await new DatingProfileService(p,p.Clock).ReadAsync(user);
        var before=(await p.Sql("SELECT * FROM user_profiles")).ToJsonString();var objects=(await p.ExecuteAsync("$test-r2-list",new{})).ToJsonString();
        IImageCompressionService reusable=new ImageCompressionService();
        foreach(var (width,height) in new[]{(160,200),(333,777),(800,600)}){
            using var bitmap=new SKBitmap(width,height);using(var canvas=new SKCanvas(bitmap))canvas.Clear(SKColors.Coral);using var image=SKImage.FromBitmap(bitmap);using var encoded=image.Encode(SKEncodedImageFormat.Jpeg,90);var exact=new byte[200000];encoded.ToArray().CopyTo(exact,0);
            using var segmented=new SegmentedPhoto(exact);var result=await reusable.CompressAsync(segmented,200000,new("image/jpeg"));Assert.InRange(result.Bytes.Length,1,200000);Assert.Equal("image/jpeg",result.MimeType);Assert.Equal(width,result.Width);Assert.Equal(height,result.Height);Assert.True(result.Bytes.Span.IndexOf("Exif"u8)<0);using var decoded=SKBitmap.Decode(result.Bytes.ToArray());Assert.Equal(width,decoded.Width);Assert.Equal(height,decoded.Height);
        }
        Assert.Equal(before,(await p.Sql("SELECT * FROM user_profiles")).ToJsonString());Assert.Empty(await p.Sql("SELECT * FROM user_media_assets"));Assert.Equal(objects,(await p.ExecuteAsync("$test-r2-list",new{})).ToJsonString());
    }
    private sealed class SegmentedPhoto(byte[] bytes):MemoryStream(bytes,false)
    {
        public override bool CanSeek=>false;
        public override ValueTask<int> ReadAsync(Memory<byte> buffer,CancellationToken ct=default)=>base.ReadAsync(buffer[..Math.Min(buffer.Length,97)],ct);
    }

    private static byte[] Picture()
    {
        using var bitmap=new SKBitmap(600,800);using(var canvas=new SKCanvas(bitmap))canvas.Clear(SKColors.Coral);
        using var image=SKImage.FromBitmap(bitmap);using var data=image.Encode(SKEncodedImageFormat.Png,100);return data.ToArray();
    }
    private static async Task<CurrentUser> User(RealPlatform platform)
    {
        await platform.Seed(true);
        var result=await platform.App.Login(RealPlatform.Email,RealPlatform.Password,"android","127.0.0.1",default);
        var json=RealPlatform.Json(result.Body);
        return new(json["account"]!.Text("accountId"),json["session"]!.Text("sessionId"),1,platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());
    }
    private static PersonalPhotosService Service(RealPlatform platform)=>new(platform,
        new PrivateMediaStore(new HttpClient(new Bridge(platform)){BaseAddress=new("http://platform.internal/")}),new ImageCompressionService());

    [Fact,Trait("Case","AP-IT-002"),Trait("Case","AP-IT-004")]
    public async Task UploadReadOrderDelete_RealD1R2_HidesTombstoneAndPreservesOtherPhotos()
    {
        await using var platform=new RealPlatform();var user=await User(platform);var service=Service(platform);
        var photos=new List<string>();
        for(var n=0;n<3;n++){
            using var input=new MemoryStream(Picture());
            var metadata=await service.UploadAsync(user,input,"image/png");
            var id=metadata.Text("assetId");photos.Add(id);
            var actual=await service.ReadAsync(user,id);Assert.InRange(actual.Bytes.Length,1,200000);
            Assert.Equal("image/jpeg",actual.MimeType);
            using var decoded=SKBitmap.Decode(actual.Bytes.ToArray());Assert.Equal(600,decoded.Width);Assert.Equal(800,decoded.Height);
        }
        await service.ReorderAsync(user,new(1,[photos[2],photos[0],photos[1]]));
        await service.DeleteAsync(user,photos[0]);
        var list=await service.ListAsync(user);
        Assert.Equal(new[]{photos[2],photos[1]},list["photos"]!.AsArray().Select(p=>p!.Text("assetId")));
        Assert.Equal(404,(await Assert.ThrowsAsync<DomainException>(()=>service.ReadAsync(user,photos[0]))).Status);
        Assert.Equal("deleted",(await platform.Sql("SELECT status FROM user_media_assets WHERE asset_id=?",photos[0]))[0]!.Text("status"));
        Assert.Equal(404,(await Assert.ThrowsAsync<DomainException>(()=>service.ReadAsync(user,EntityId.New()))).Status);
        var other=user with{AccountId=EntityId.New()};
        Assert.Equal(401,(await Assert.ThrowsAsync<DomainException>(()=>service.ReadAsync(other,photos[1]))).Status);
    }

    [Fact,Trait("Case","AP-IT-057"),Trait("Case","AP-IT-058")]
    public async Task IndependentClients_ConcurrentFifthAndSixth_One409AndExactlyFiveReady()
    {
        await using var platform=new RealPlatform();var user=await User(platform);
        var first=Service(platform);var second=Service(platform);
        for(var n=0;n<4;n++){using var source=new MemoryStream(Picture());await first.UploadAsync(user,source,"image/png");}
        async Task<int> Upload(PersonalPhotosService client){
            using var source=new MemoryStream(Picture());
            try{await client.UploadAsync(user,source,"image/png");return 201;}
            catch(DomainException e){Assert.Equal("PHOTO_LIMIT_REACHED",e.Code);return e.Status;}
        }
        Assert.Equal(new[]{201,409},(await Task.WhenAll(Upload(first),Upload(second))).Order().ToArray());
        Assert.Equal(5,(await first.ListAsync(user))["photos"]!.AsArray().Count);
        Assert.Equal(5,(await platform.Sql("SELECT asset_id FROM user_media_assets WHERE status IN ('pending','ready')")).Count);
        var stored=await platform.ExecuteAsync("$test-r2-list",new{});Assert.False(stored["truncated"]!.GetValue<bool>());Assert.Equal(5,stored["keys"]!.AsArray().Count);
        var original=(await first.ListAsync(user))["photos"]!.AsArray().Select(p=>p!.Text("assetId")).ToArray();
        var removed=original[2];await second.DeleteAsync(user,removed);
        Assert.Equal(4,(await first.ListAsync(user))["photos"]!.AsArray().Count);
        using var replacement=new MemoryStream(Picture());var added=await first.UploadAsync(user,replacement,"image/png");
        Assert.DoesNotContain(added.Text("assetId"),original);
        var current=(await second.ListAsync(user))["photos"]!.AsArray().Select(p=>p!.Text("assetId")).ToArray();
        Assert.Equal(5,current.Length);Assert.DoesNotContain(removed,current);Assert.Contains(added.Text("assetId"),current);
        Assert.Equal(original.Where(id=>id!=removed).Order(),current.Where(id=>id!=added.Text("assetId")).Order());
        Assert.Equal("deleted",(await platform.Sql("SELECT status FROM user_media_assets WHERE asset_id=?",removed))[0]!.Text("status"));
        Assert.Equal(404,(await Assert.ThrowsAsync<DomainException>(()=>second.ReadAsync(user,removed))).Status);
        Assert.Equal(404,(await Assert.ThrowsAsync<DomainException>(()=>second.DeleteAsync(user,removed))).Status);
        Assert.Equal(5,(await platform.Sql("SELECT asset_id FROM user_media_assets WHERE status IN ('pending','ready')")).Count);
        Assert.Equal(5,(await new OwnCardPreviewService(new DatingProfileService(platform,platform.Clock),platform.Clock).ReadAsync(user))["personalPhotos"]!.AsArray().Count);
        Assert.DoesNotContain(removed,(await new OwnCardPreviewService(new DatingProfileService(platform,platform.Clock),platform.Clock).ReadAsync(user))["personalPhotos"]!.ToJsonString());
        Assert.Equal(409,await Upload(second));
        stored=await platform.ExecuteAsync("$test-r2-list",new{});Assert.False(stored["truncated"]!.GetValue<bool>());Assert.Equal(5,stored["keys"]!.AsArray().Count);
    }

    [Fact,Trait("Case","AP-IT-038")]
    public async Task ForeignCandidateAndFormalSelection_RealApplicationD1R2_LeavesBothOwnersUnchanged()
    {
        await using var platform=new RealPlatform();var owner=await User(platform);
        const string otherEmail="second-owner@example.test";await platform.Seed(true,otherEmail);
        var login=RealPlatform.Json((await platform.App.Login(otherEmail,RealPlatform.Password,"android","127.0.0.1",default)).Body);
        var other=new CurrentUser(login["account"]!.Text("accountId"),login["session"]!.Text("sessionId"),1,owner.AccessExpiresAt);
        using var http=new HttpClient(new Bridge(platform)){BaseAddress=new("http://platform.internal/")};
        var media=new PrivateMediaStore(http);var provider=new OneImageProvider();
        AvatarService Avatars()=>new(platform,media,new AvatarCandidateStore(http),provider,new RateLimiter(platform,platform.Options,platform.Clock));
        var avatars=Avatars();await new DatingProfileService(platform,platform.Clock).ReadAsync(other);
        await platform.Sql("UPDATE user_profiles SET gender='male' WHERE account_id=?",other.AccountId);
        await avatars.SelectAsync(other,new JsonObject{["type"]="builtin",["builtinAvatarId"]="male-02",["expectedRevision"]=1L});
        var photos=Service(platform);for(var i=0;i<2;i++){using var input=new MemoryStream(Picture());await photos.UploadAsync(owner,input,"image/png");}
        var generated=await avatars.GenerateAsync(owner,new JsonObject{["styleId"]="warm",["clientRequestId"]=EntityId.New(),["expectedProducedCount"]=0L});
        var attempt=generated.Text("attemptId");
        async Task<string> Snapshot()=>new JsonObject{["profiles"]=(await platform.Sql("SELECT * FROM user_profiles ORDER BY account_id")).DeepClone(),["assets"]=(await platform.Sql("SELECT * FROM user_media_assets ORDER BY asset_id")).DeepClone()}.ToJsonString();
        var before=await Snapshot();
        var temporary=new JsonObject{["type"]="generated",["attemptId"]=attempt,["index"]=1L,["expectedRevision"]=2L};
        Assert.Equal(404,(await Assert.ThrowsAsync<DomainException>(()=>Avatars().SelectAsync(other,temporary))).Status);
        Assert.Equal(404,(await Assert.ThrowsAsync<DomainException>(()=>Avatars().ReadCandidateAsync(other,attempt,1))).Status);
        Assert.Equal(before,await Snapshot());Assert.NotEmpty((await avatars.ReadCandidateAsync(owner,attempt,1)).Bytes.ToArray());
        temporary["expectedRevision"]=1L;var adopted=await avatars.SelectAsync(owner,temporary);var asset=adopted.Text("assetId");before=await Snapshot();
        var foreign=await Assert.ThrowsAsync<DomainException>(()=>Avatars().SelectAsync(other,new JsonObject{["type"]="generated",["assetId"]=asset,["expectedRevision"]=2L}));
        Assert.Equal(400,foreign.Status);Assert.Equal("INVALID_AVATAR_SELECTION",foreign.Code);
        Assert.Equal(404,(await Assert.ThrowsAsync<DomainException>(()=>media.ReadPhotoAsync(other,asset))).Status);
        Assert.Equal(before,await Snapshot());Assert.NotEmpty((await media.ReadPhotoAsync(owner,asset)).Bytes.ToArray());
        Assert.Equal(1,provider.Calls);Assert.Single(await platform.Sql("SELECT asset_id FROM user_media_assets WHERE kind='generated_avatar' AND status='ready'"));
        Assert.Equal("male-02",(await platform.Sql("SELECT selected_avatar_ref FROM user_profiles WHERE account_id=?",other.AccountId))[0]!.Text("selected_avatar_ref"));
    }

    private sealed class OneImageProvider:IAvatarImageGenerator
    {
        public int Calls;
        public async Task<CompressedImage> GenerateAsync(IReadOnlyList<PrivateMediaContent> photos,string styleId,CancellationToken ct=default)
        {
            Calls++;Assert.Equal(2,photos.Count);using var source=new MemoryStream(Picture());return await new ImageCompressionService().CompressAsync(source,ct:ct);
        }
    }

    private sealed class Bridge(RealPlatform platform):HttpMessageHandler
    {
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)
        {
            var headers=request.Headers.ToDictionary(p=>p.Key,p=>string.Join(",",p.Value));
            if(request.Content?.Headers.ContentType is not null)headers["Content-Type"]=request.Content.Headers.ContentType.ToString();
            var result=await platform.ExecuteAsync("$test-media",new{
                assetId=request.RequestUri!.Segments.Last(),path=request.RequestUri.AbsolutePath,method=request.Method.Method,headers,
                content=request.Content is null?null:Convert.ToBase64String(await request.Content.ReadAsByteArrayAsync(ct))
            },ct);
            var response=new HttpResponseMessage((HttpStatusCode)result.Number("status")){
                Content=new ByteArrayContent(Convert.FromBase64String(result.Text("content")))
            };
            var mime=result.Maybe("mime");if(mime is not null)response.Content.Headers.ContentType=new(mime);
            return response;
        }
    }
}
