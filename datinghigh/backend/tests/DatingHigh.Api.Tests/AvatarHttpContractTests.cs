using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Domain;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DatingHigh.Api.Tests;

// 僅驗HTTP DTO／認證傳輸／錯誤投影。腳本化private回覆不模擬SQL、R2 CAS或provider計費；
// 這些性質的證據在真Miniflare、Application整合及已授權的Web／Android Gemini測試。
[Collection("HTTP contracts")]
public sealed class AvatarHttpContractTests
{
    private const string Generate="/api/v1/me/avatar/generations",Select="/api/v1/me/avatar/selection";
    [Theory,Trait("Case","AP-API-028"),Trait("Case","AP-API-042")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task Generation_ReturnsExactlyOneSafeCamelCaseResult_FromOneProviderInvocation(string platform)
    {
        using var f=new ApiFixture();var h=new ScriptedAvatar(f);using var client=f.Native(true,platform);
        using var r=await client.PostAsJsonAsync(Generate,h.Generation());Assert.Equal(HttpStatusCode.OK,r.StatusCode);NoStore(r);
        var dto=(await r.Content.ReadFromJsonAsync<JsonNode>())!.AsObject();
        Assert.Equal(new[]{"attemptId","expiresAt","index","maxCandidates","producedCount"},dto.Select(v=>v.Key).Order().ToArray());
        Assert.Equal(h.Attempt,dto.Text("attemptId"));Assert.Equal(1,dto.Number("index"));Assert.Equal(1,dto.Number("producedCount"));Assert.Equal(4,dto.Number("maxCandidates"));Assert.Equal(h.Expires,dto.Number("expiresAt"));
        Assert.Equal(1,h.ProviderCalls);Assert.Equal(1,h.PublishCalls);Assert.Equal(2,h.SourceReads);
        foreach(var hidden in new[]{"lease","sourceAssetIds","objectKey","fixture-private","accountId","sessionId","tokens"})Assert.DoesNotContain(hidden,dto.ToJsonString());
    }

    [Theory,Trait("Case","AP-API-043")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task Continuation_ForwardsAttemptStyleCountAndRequest_WithoutSchedulingOtherImages(string platform)
    {
        using var f=new ApiFixture();var h=new ScriptedAvatar(f){NextIndex=2};using var client=f.Native(true,platform);var input=h.Generation();
        using var r=await client.PostAsJsonAsync(Generate,input);Assert.Equal(HttpStatusCode.OK,r.StatusCode);var dto=(await r.Content.ReadFromJsonAsync<JsonNode>())!;
        Assert.Equal(2,dto.Number("index"));Assert.Equal(2,dto.Number("producedCount"));Assert.Equal(1,h.ProviderCalls);Assert.Equal(1,h.PublishCalls);
        var forwarded=Assert.IsAssignableFrom<JsonNode>(h.Begin);Assert.Equal(h.Attempt,forwarded.Text("attemptId"));Assert.Equal(input["clientRequestId"]!.GetValue<string>(),forwarded.Text("clientRequestId"));Assert.Equal("warm",forwarded.Text("styleId"));Assert.Equal(1,forwarded.Number("expectedProducedCount"));
        foreach(var bad in new[]{new JsonObject{["styleId"]="unknown",["clientRequestId"]=EntityId.New(),["expectedProducedCount"]=1},new JsonObject{["styleId"]="warm",["clientRequestId"]=EntityId.New(),["expectedProducedCount"]=1,["attemptId"]="not-a-uuid"}}){using var rejected=await client.PostAsJsonAsync(Generate,bad);await Problem(rejected,400,"INVALID_AVATAR_SELECTION");}
        Assert.Equal(1,h.ProviderCalls);
    }

    [Theory,Trait("Case","AP-API-029")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task GenerationFailures_Project503Or429_AndDoNotPublishOrAutomaticallyRetry(string platform)
    {
        foreach(var code in new[]{"IMAGE_PROVIDER_UNAVAILABLE","IMAGE_PROVIDER_NO_IMAGE","RATE_LIMITED"}){
            using var f=new ApiFixture();var h=new ScriptedAvatar(f){NextIndex=2};using var client=f.Native(true,platform);
            if(code=="RATE_LIMITED")f.Store.DenyRate=true;else h.ProviderFailure=new(code,503);
            using var r=await client.PostAsJsonAsync(Generate,h.Generation());await Problem(r,code=="RATE_LIMITED"?429:503,code);
            Assert.Equal(code=="RATE_LIMITED"?0:1,h.ProviderCalls);Assert.Equal(0,h.PublishCalls);Assert.NotNull(h.Failure);Assert.False(h.Failure!["uncertain"]!.GetValue<bool>());
            using var earlier=await client.GetAsync(h.Candidate(1));Assert.Equal(HttpStatusCode.OK,earlier.StatusCode);Assert.Equal(new byte[]{1,2,3},await earlier.Content.ReadAsByteArrayAsync());
            Assert.DoesNotContain(f.Store.Commands,c=>c.StartsWith("profile.avatar.",StringComparison.Ordinal));
            var calls=h.ProviderCalls;f.Store.Revoked=true;using var revoked=await client.PostAsJsonAsync(Generate,h.Generation());await Problem(revoked,401,"SESSION_REVOKED");Assert.Equal(calls,h.ProviderCalls);
        }
    }

    [Theory,Trait("Case","AP-API-031"),Trait("Case","AP-API-032")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task CandidateRead_ReturnsPrivateBinary_AndMapsExpiryMissingAndRevocation(string platform)
    {
        using var f=new ApiFixture();var h=new ScriptedAvatar(f);using var client=f.Native(true,platform);
        using var ok=await client.GetAsync(h.Candidate(1));Assert.Equal(HttpStatusCode.OK,ok.StatusCode);NoStore(ok);Assert.Equal("nosniff",ok.Headers.GetValues("X-Content-Type-Options").Single());Assert.Equal("image/jpeg",ok.Content.Headers.ContentType?.MediaType);Assert.Equal(new byte[]{1,2,3},await ok.Content.ReadAsByteArrayAsync());
        using var missing=await client.GetAsync(h.Candidate(2));await Problem(missing,404,"AVATAR_CANDIDATE_NOT_FOUND");
        h.ReadFailure=new("AVATAR_CANDIDATE_EXPIRED",410);using var expired=await client.GetAsync(h.Candidate(1));await Problem(expired,410,"AVATAR_CANDIDATE_EXPIRED");
        var reads=h.CandidateReads;f.Store.Revoked=true;using var revoked=await client.GetAsync(h.Candidate(1));await Problem(revoked,401,"SESSION_REVOKED");Assert.Equal(reads,h.CandidateReads);
    }

    [Theory,Trait("Case","AP-API-030"),Trait("Case","AP-API-036")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task AvatarWrites_KeepStrictJsonGlobalLimitAndOriginRules_WithoutBusinessCommands(string platform)
    {
        using var f=new ApiFixture();var h=new ScriptedAvatar(f);using var client=f.Native(true,platform);
        foreach(var route in new[]{Generate,Select}){
            using var wrongType=new HttpRequestMessage(route==Generate?HttpMethod.Post:HttpMethod.Put,route){Content=new StringContent("{}",Encoding.UTF8,"text/plain")};using var rejectedType=await client.SendAsync(wrongType);await Problem(rejectedType,400,"INVALID_REQUEST");
            foreach(var json in new[]{"{\"accountId\":\"forged\"}","{\"type\":\"builtin\",\"builtinAvatarId\":\"male-01\",\"expectedRevision\":1,\"expectedRevision\":1}"}){
                using var request=new HttpRequestMessage(route==Generate?HttpMethod.Post:HttpMethod.Put,route){Content=new StringContent(json,Encoding.UTF8,"application/json")};using var r=await client.SendAsync(request);await Problem(r,400,"INVALID_AVATAR_SELECTION");
            }
            using var large=new HttpRequestMessage(route==Generate?HttpMethod.Post:HttpMethod.Put,route){Content=new StringContent(new string('x',16385),Encoding.UTF8,"application/json")};using var tooLarge=await client.SendAsync(large);await Problem(tooLarge,413,"REQUEST_TOO_LARGE");
        }
        client.DefaultRequestHeaders.Remove("Origin");client.DefaultRequestHeaders.Add("Origin","https://attacker.invalid");
        using var origin=await client.PostAsJsonAsync(Generate,h.Generation());await Problem(origin,platform=="web"?403:400,platform=="web"?"ORIGIN_FORBIDDEN":"INVALID_PLATFORM");
        Assert.Equal(0,h.ProviderCalls);Assert.Null(h.Begin);Assert.Null(h.Selection);
        Assert.DoesNotContain(f.Store.Commands,c=>c.StartsWith("avatar.",StringComparison.Ordinal)||c.StartsWith("profile.",StringComparison.Ordinal));
    }

    [Theory,Trait("Case","AP-API-034")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task Selection_ReturnsOnlyCommittedReceipt_ForBuiltinSavedOrTemporaryChoice(string platform)
    {
        using var f=new ApiFixture();var h=new ScriptedAvatar(f);using var client=f.Native(true,platform);
        foreach(var input in new[]{new JsonObject{["type"]="builtin",["builtinAvatarId"]="female-07",["expectedRevision"]=1},new JsonObject{["type"]="generated",["assetId"]=h.Saved,["expectedRevision"]=1},new JsonObject{["type"]="generated",["attemptId"]=h.Attempt,["index"]=1,["expectedRevision"]=1}}){
            using var r=await client.PutAsJsonAsync(Select,input);Assert.Equal(HttpStatusCode.OK,r.StatusCode);NoStore(r);var dto=(await r.Content.ReadFromJsonAsync<JsonNode>())!.AsObject();Assert.Equal(2,dto.Number("revision"));
            Assert.Equal(input.ContainsKey("attemptId")?new[]{"assetId","revision"}:new[]{"revision"},dto.Select(v=>v.Key).Order().ToArray());
            if(input.ContainsKey("attemptId")){Assert.True(EntityId.IsValid(dto.Text("assetId")));Assert.NotEqual(h.Attempt,dto.Text("assetId"));Assert.Equal(dto.Text("assetId"),h.Selection!.Text("proposedAssetId"));}
        }
        Assert.Equal(0,h.ProviderCalls);Assert.Equal(0,h.PublishCalls);Assert.Equal(0,h.SourceReads);
    }

    [Theory,Trait("Case","AP-API-035")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task Selection_RejectedInputsStaleRevisionAndUnavailableSavedAsset_MapSafeProblems(string platform)
    {
        using var f=new ApiFixture();var h=new ScriptedAvatar(f);using var client=f.Native(true,platform);
        using var invalid=await client.PutAsJsonAsync(Select,new{type="builtin",builtinAvatarId="male-99",expectedRevision=1});await Problem(invalid,400,"INVALID_AVATAR_SELECTION");Assert.Null(h.Selection);
        h.DenySelection=true;using var stale=await client.PutAsJsonAsync(Select,new{type="builtin",builtinAvatarId="male-01",expectedRevision=1});await Problem(stale,409,"PROFILE_VERSION_CONFLICT");
        using var foreign=await client.PutAsJsonAsync(Select,new{type="generated",assetId=h.Saved,expectedRevision=1});await Problem(foreign,400,"INVALID_AVATAR_SELECTION");
        f.Store.Revoked=true;var commands=f.Store.Commands.Count;using var revoked=await client.PutAsJsonAsync(Select,new{type="builtin",builtinAvatarId="male-01",expectedRevision=1});await Problem(revoked,401,"SESSION_REVOKED");Assert.All(f.Store.Commands.Skip(commands),c=>Assert.Equal("session.validate",c));Assert.Equal(0,h.ProviderCalls);
    }

    [Theory,Trait("Case","AP-API-044")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task Generation_ProjectsReplayAndRejectedLease_WithoutProviderOrLimiterConsumption(string platform)
    {
        using var f=new ApiFixture();var h=new ScriptedAvatar(f){Replay=true};using var client=f.Native(true,platform);
        using var replay=await client.PostAsJsonAsync(Generate,h.Generation());Assert.Equal(HttpStatusCode.OK,replay.StatusCode);Assert.Equal(1,(await replay.Content.ReadFromJsonAsync<JsonNode>())!.Number("producedCount"));
        foreach(var code in new[]{"AVATAR_GENERATION_IN_PROGRESS","AVATAR_LIMIT_REACHED","AVATAR_ATTEMPT_CLOSED"}){h.BeginFailure=new(code,409);using var r=await client.PostAsJsonAsync(Generate,h.Generation());await Problem(r,409,code);}
        Assert.Equal(0,h.ProviderCalls);Assert.Equal(0,h.SourceReads);Assert.Equal(0,h.PublishCalls);Assert.DoesNotContain("rate-limit.consume",f.Store.Commands);
    }

    private static void NoStore(HttpResponseMessage r)=>Assert.Contains("no-store",r.Headers.CacheControl?.ToString());
    private static async Task Problem(HttpResponseMessage r,int status,string code)
    {
        Assert.Equal(status,(int)r.StatusCode);NoStore(r);Assert.Equal("application/problem+json",r.Content.Headers.ContentType?.MediaType);
        var dto=(await r.Content.ReadFromJsonAsync<JsonNode>())!;Assert.Equal(code,dto.Text("code"));Assert.Equal(status,dto.Number("status"));Assert.False(string.IsNullOrEmpty(dto.Text("traceId")));
        foreach(var hidden in new[]{"lease","sourceAssetIds","objectKey","fixture-private","accessToken","refreshToken"})Assert.DoesNotContain(hidden,dto.ToJsonString());
    }

    private sealed class ScriptedAvatar:IAvatarImageGenerator,IAvatarCandidateStore,IPrivateMediaStore
    {
        private readonly MemoryPlatform store;
        public readonly string Attempt=EntityId.New(),Saved=EntityId.New(),SourceA=EntityId.New(),SourceB=EntityId.New();
        public readonly long Expires=DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeMilliseconds();
        public int NextIndex=1,ProviderCalls,PublishCalls,SourceReads,CandidateReads;public bool Replay,DenySelection;
        public DomainException? ProviderFailure,ReadFailure,BeginFailure;public JsonNode? Begin,Failure,Selection;
        public ScriptedAvatar(ApiFixture f){store=f.Store;store.CommandOverride=Reply;f.AdditionalServices=services=>{services.RemoveAll<IAvatarImageGenerator>();services.AddSingleton<IAvatarImageGenerator>(this);services.RemoveAll<IAvatarCandidateStore>();services.AddSingleton<IAvatarCandidateStore>(this);services.RemoveAll<IPrivateMediaStore>();services.AddSingleton<IPrivateMediaStore>(this);};}
        public JsonObject Generation(){var input=new JsonObject{["styleId"]="warm",["clientRequestId"]=EntityId.New(),["expectedProducedCount"]=NextIndex-1};if(NextIndex>1)input["attemptId"]=Attempt;return input;}
        public string Candidate(int index)=>$"/api/v1/me/avatar/candidates/{Attempt}/{index}";
        private JsonObject Result()=>new(){["attemptId"]=Attempt,["index"]=(long)NextIndex,["producedCount"]=(long)NextIndex,["expiresAt"]=Expires,["lease"]="fixture-private-lease",["sourceAssetIds"]=new JsonArray(SourceA,SourceB),["objectKey"]="fixture-private-key"};
        private JsonNode? Reply(string command,JsonNode p){
            if(command=="avatar.attempt.begin"){Begin=p.DeepClone();if(BeginFailure is not null)throw BeginFailure;var dto=Result();dto["completed"]=Replay;return dto;}
            if(command=="avatar.attempt.fail"){Failure=p.DeepClone();return new JsonObject{["acknowledged"]=true};}
            if(command=="avatar.attempt.select"){Selection=p.DeepClone();return new JsonObject{["revision"]=2L,["assetId"]=p.Text("proposedAssetId")};}
            if(command is "profile.avatar.builtin" or "profile.avatar.generated"){Selection=p.DeepClone();return new JsonObject{["rows"]=DenySelection?new JsonArray():new JsonArray(new JsonObject{["revision"]=2L})};}
            return null;
        }
        private void Owner(CurrentUser user){Assert.Equal(store.AccountId,user.AccountId);Assert.Equal(store.SessionId,user.SessionId);}
        public Task<CompressedImage> GenerateAsync(IReadOnlyList<PrivateMediaContent> photos,string styleId,CancellationToken ct=default){ProviderCalls++;Assert.Equal(2,photos.Count);if(ProviderFailure is not null)throw ProviderFailure;return Task.FromResult(new CompressedImage(new byte[]{7,8,9},"image/jpeg",300,400));}
        public Task<JsonNode> PublishAsync(CurrentUser user,string attemptId,string requestId,string lease,CompressedImage image,CancellationToken ct=default){Owner(user);PublishCalls++;Assert.Equal(Attempt,attemptId);return Task.FromResult<JsonNode>(Result());}
        public Task<PrivateMediaContent> ReadAsync(CurrentUser user,string attemptId,int index,CancellationToken ct=default){Owner(user);CandidateReads++;if(ReadFailure is not null)throw ReadFailure;if(attemptId!=Attempt||index!=1)throw new DomainException("AVATAR_CANDIDATE_NOT_FOUND",404);return Task.FromResult(new PrivateMediaContent(new byte[]{1,2,3},"image/jpeg"));}
        public Task<PrivateMediaContent> ReadPhotoAsync(CurrentUser user,string assetId,CancellationToken ct=default){Owner(user);Assert.Contains(assetId,new[]{SourceA,SourceB});SourceReads++;return Task.FromResult(new PrivateMediaContent(new byte[]{1},"image/jpeg"));}
        public Task SavePhotoAsync(CurrentUser user,string assetId,CompressedImage image,CancellationToken ct=default)=>throw new InvalidOperationException("Avatar HTTP routes must not upload source photos");
        public Task DeletePhotoAsync(CurrentUser user,string assetId,CancellationToken ct=default)=>throw new InvalidOperationException("Avatar HTTP routes must not delete source photos");
    }
}
