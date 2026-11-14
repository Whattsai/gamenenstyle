using System.Net;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Domain;
using DatingHigh.Infrastructure.Media;
using DatingHigh.Infrastructure;
using DatingHigh.Integration.Tests;
using SkiaSharp;

namespace DatingHigh.E2eHost;

// 僅loopback測試Host明選profile使用：真Application／D1／R2，只有圖片供應商被受控替換。
internal sealed class AvatarFixtureState: IAvatarImageGenerator,IAvatarExpressionGenerator,IDisposable
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
    public AvatarExpressionStore Expressions {get;}
    public AvatarReadStore Reads {get;}
    public string Model=>"controlled-skia-fixture";
    public string ExpressionPromptVersion=>"controlled-skia.v1";
    public AvatarFixtureState(RealPlatform source)
    {
        platform=source;bridge=new(new MediaBridge(source)){BaseAddress=new("http://platform.internal/")};
        Media=new(bridge);Candidates=new(bridge);Expressions=new(bridge);Reads=new(bridge);
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
        // 共用正式虛構角色的唯一來源；只在 RAM 轉成測試上傳所宣告的 JPEG。
        var path=Path.GetFullPath("frontend/client/public"+BuiltinAvatarCatalog.AssetPath($"{group}-{index:00}"));
        using var source=SKBitmap.Decode(File.ReadAllBytes(path))??throw new InvalidOperationException("Controlled avatar source cannot decode");
        using var opaque=new SKBitmap(source.Width,source.Height);
        using(var canvas=new SKCanvas(opaque)){canvas.Clear(SKColors.White);using var pixels=SKImage.FromBitmap(source);canvas.DrawImage(pixels,0,0,new SKSamplingOptions(SKFilterMode.Nearest));}
        using var image=SKImage.FromBitmap(opaque);using var data=image.Encode(SKEncodedImageFormat.Jpeg,90);return data.ToArray();
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
    public async Task<JsonNode> CurrentPack(CancellationToken ct)
    {
        var user=await Current();var profile=(await platform.Sql("SELECT selected_avatar_type,selected_avatar_ref FROM user_profiles WHERE account_id=?",user.AccountId)).Single()!;
        if(profile.Text("selected_avatar_type")!="generated")throw new InvalidOperationException("Current fixture avatar is not generated");
        return await new AvatarReadService(platform,Reads).ProjectionAsync(user,AvatarReadScope.Own,profile.Text("selected_avatar_ref"),ct);
    }
    public async Task<JsonNode> StoryPack(int player,CancellationToken ct)
    {
        if(player is <0 or >1)throw new InvalidOperationException("Invalid controlled story player");
        var row=(await platform.Sql("SELECT s.account_id,s.session_id,a.credential_version FROM auth_sessions s JOIN auth_accounts a ON a.account_id=s.account_id WHERE s.revoked_at IS NULL AND a.email_normalized=?",$"matching-{player}@example.test")).Single()!;
        var user=new CurrentUser(row.Text("account_id"),row.Text("session_id"),row.Number("credential_version"),platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());
        var photos=new PersonalPhotosService(platform,Media,new ImageCompressionService());
        if((await photos.ListAsync(user,ct))["photos"]!.AsArray().Count==0)for(var n=0;n<2;n++){using var photo=new MemoryStream(Picture(n));await photos.UploadAsync(user,photo,"image/jpeg",ct);}
        IAvatarImageGenerator masterProvider=this;IAvatarExpressionGenerator expressionProvider=this;
        if(player==1&&Environment.GetEnvironmentVariable("DATINGHIGH_E2E_STORY_APPROVED_PACK") is string directory){var recorded=new RecordedApprovedPack(directory);masterProvider=recorded;expressionProvider=recorded;}
        var limiter=new RateLimiter(platform,platform.Options,platform.Clock);var avatars=new AvatarService(platform,Media,Candidates,masterProvider,limiter);
        var attempt=await avatars.GenerateAsync(user,new JsonObject{["styleId"]="warm",["clientRequestId"]=EntityId.New(),["expectedProducedCount"]=0L},ct);
        var profile=(await platform.Sql("SELECT revision FROM user_profiles WHERE account_id=?",user.AccountId)).Single()!;var revision=profile.Number("revision");
        var service=new AvatarExpressionService(platform,Candidates,Expressions,expressionProvider,limiter);var workflow=EntityId.New();
        await service.ExecuteAsync(user,"begin",new JsonObject{["attemptId"]=attempt.Text("attemptId"),["index"]=1L,["clientRequestId"]=workflow,["expectedRevision"]=revision},ct);
        foreach(var expression in new[]{"neutral","smile","surprised","thoughtful","concerned"})await service.ExecuteAsync(user,"next",new JsonObject{["workflowId"]=workflow,["expression"]=expression,["clientRequestId"]=EntityId.New()},ct);
        return await avatars.SelectAsync(user,new JsonObject{["type"]="generated",["attemptId"]=attempt.Text("attemptId"),["index"]=1L,["expectedRevision"]=revision},ct);
    }
    public async Task<CompressedImage> GenerateExpressionAsync(PrivateMediaContent master,string expression,CancellationToken ct=default)
    {
        // 技術驗證專用：透明幾何人形，不是假裝 Gemini／正式全身美術。
        using var bitmap=new SKBitmap(600,800);using(var canvas=new SKCanvas(bitmap)){
            canvas.Clear(SKColors.Transparent);using var ink=new SKPaint{Color=SKColors.Coral,IsAntialias=true};canvas.DrawCircle(300,100,58,ink);canvas.DrawRoundRect(new SKRect(225,170,375,460),30,30,ink);canvas.DrawRect(230,430,55,315,ink);canvas.DrawRect(315,430,55,315,ink);canvas.DrawRect(170,200,45,260,ink);canvas.DrawRect(385,200,45,260,ink);
            ink.Color=SKColors.DarkSlateBlue;canvas.DrawCircle(280,90,5,ink);canvas.DrawCircle(320,90,5,ink);canvas.DrawRect(280,125,40,expression=="surprised"?15:4,ink);
        }
        using var image=SKImage.FromBitmap(bitmap);using var data=image.Encode(SKEncodedImageFormat.Png,100);using var input=new MemoryStream(data.ToArray());
        return await new ImageCompressionService().CompressAsync(input,200000,new("image/png",PreserveTransparency:true,MinimumWidth:600,MinimumHeight:800),ct);
    }
    public void Dispose(){lock(gate)RestoreCatalog();bridge.Dispose();}

    // 只限明選的本機QA；重用已人工確認、SHA相符的Gemini成品，不呼叫供應商或載入來源照片。
    private sealed class RecordedApprovedPack:IAvatarImageGenerator,IAvatarExpressionGenerator
    {
        private readonly CompressedImage master;private readonly Dictionary<string,CompressedImage> images=[];
        public string Model=>"recorded-approved-gemini-art-no-provider";public string ExpressionPromptVersion=>"recorded-approved-full-body.v2";
        public RecordedApprovedPack(string directory){
            var source=Path.GetFullPath(directory);var allowed=Path.GetFullPath(".local/evidence/avatar-full-body-gemini")+Path.DirectorySeparatorChar;
            if(!source.StartsWith(allowed,StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("Invalid approved art directory");
            var result=JsonNode.Parse(File.ReadAllBytes(Path.Combine(source,"result.json")))!;
            if(result["visualApproval"]?.GetValue<string>()!="expressions-and-identity-approved-by-user")throw new InvalidOperationException("Approved expressions required");
            CompressedImage Read(string file,string mime,string sha){var bytes=File.ReadAllBytes(Path.Combine(source,file));if(bytes.Length is <1 or >2000000||Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(bytes))!=sha)throw new InvalidOperationException("Approved art SHA mismatch");using var bitmap=SKBitmap.Decode(bytes);if(bitmap is null)throw new InvalidOperationException("Approved art decode failed");return new(bytes,mime,bitmap.Width,bitmap.Height);}
            master=Read("candidate.jpg","image/jpeg",result["candidateSha256"]!.GetValue<string>());
            foreach(var expression in new[]{"neutral","smile","surprised","thoughtful","concerned"}){var item=result["expressions"]!.AsArray().Single(i=>i!["expression"]!.GetValue<string>()==expression)!;images[expression]=Read(expression+".webp","image/webp",item["sha256"]!.GetValue<string>());}
        }
        public Task<CompressedImage> GenerateAsync(IReadOnlyList<PrivateMediaContent> photos,string styleId,CancellationToken ct=default)=>Task.FromResult(master);
        public Task<CompressedImage> GenerateExpressionAsync(PrivateMediaContent source,string expression,CancellationToken ct=default)=>Task.FromResult(images[expression]);
    }

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
