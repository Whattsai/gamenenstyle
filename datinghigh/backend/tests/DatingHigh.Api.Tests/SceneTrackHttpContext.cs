using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
using DatingHigh.Application.Media;
using DatingHigh.Infrastructure.Media;
using DatingHigh.Integration.Tests;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DatingHigh.Api.Tests;

internal class SceneTrackHttpContext:IAsyncDisposable
{
    public readonly RealPlatform Platform=new(tracks:true);public readonly ApiFixture Factory=new();public readonly List<CurrentUser> Users=[];public readonly List<HttpClient> Clients=[];public readonly List<string> Profiles=[];public string Round="";
    public StoryDialogueService Service=>new(Platform,new CloudflareRoundRealtimeNotifier(Platform),new RateLimiter(Platform,Platform.Options,Platform.Clock));
    private readonly HttpClient media;
    public JsonObject? EngineFixture {get;private set;}
    public SceneTrackHttpContext(){media=new(new MediaBridge(Platform)){BaseAddress=new("http://platform.internal/")};Factory.AdditionalServices=services=>{services.RemoveAll<IPlatformClient>();services.AddSingleton<IPlatformClient>(Platform);services.RemoveAll<TimeProvider>();services.AddSingleton<TimeProvider>(Platform.Clock);services.RemoveAll<AuthOptions>();services.AddSingleton(Platform.Options);services.RemoveAll<IAvatarReadStore>();services.AddSingleton<IAvatarReadStore>(new AvatarReadStore(media));};}
    public async Task Seed(int categories=1,int? probability=null,bool linear=false,string? engineFixture=null){
        if(engineFixture is not null)EngineFixture=(await Platform.ExecuteAsync("$test-framework-branches",new{purpose=engineFixture})).AsObject();
        if(categories>1)await Platform.ExecuteAsync("$test-framework-categories",new{count=categories});
        if(probability is not null)await Platform.ExecuteAsync("$test-framework-events",new{probability=probability.Value});
        if(linear)await Platform.ExecuteAsync("$test-framework-linear",new{});
        var profiles=new List<string>();for(var n=0;n<3;n++){
            var email=$"track-http-{n}@example.test";await Platform.Seed(true,email);var login=RealPlatform.Json((await Platform.App.Login(email,RealPlatform.Password,"android","127.0.0.1",default)).Body);var user=new CurrentUser(login["account"]!.Text("accountId"),login["session"]!.Text("sessionId"),1,Platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());Users.Add(user);
            var service=new DatingProfileService(Platform,Platform.Clock);await service.ReadAsync(user);profiles.Add((await Platform.Sql("SELECT profile_id FROM user_profiles WHERE account_id=?",user.AccountId))[0]!.Text("profile_id"));await service.SaveAsync(user,new(1,$"雙軌玩家{n}","喜歡閱讀",null,"1990-01-01",null,["warm"],["reading"],[],[],null,null,null,null,null,null,null,[],50,"diverse",["diverse"],new()));await Platform.ExecuteAsync("profile.avatar.builtin",new{accountId=user.AccountId,sessionId=user.SessionId,cv=1,accessExpiresAt=user.AccessExpiresAt,expectedRevision=2,avatarId="male-01"});
            var client=Factory.Native();client.DefaultRequestHeaders.Authorization=new("Bearer",login["tokens"]!.Text("accessToken"));Clients.Add(client);
        }
        Profiles.AddRange(profiles);var matching=new MatchingSessionService(Platform,new MatchingCandidateProfileReader(Platform),new RateLimiter(Platform,Platform.Options,Platform.Clock),Platform.Clock);var invitation=await matching.InviteAsync(Users[0],profiles[1],EntityId.New());Round=(await matching.ResolveAsync(Users[1],invitation.Text("invitationId"),"accept")).Text("roundId");
    }
    public async Task<JsonObject> Snapshot(int actor)=>(await Clients[actor].GetFromJsonAsync<JsonObject>($"/api/v1/game-rounds/{Round}/experience"))!;
    public async Task<JsonObject> Payload(int actor,string binding,string? option=null){
        var s=await Snapshot(actor);var e=s["availableEvents"]!.AsArray().Single(e=>e!.Text("bindingId").EndsWith(":"+binding));var a=e!["actions"]!.AsArray().First(a=>option is null||a!["params"]?["optionId"]?.GetValue<string>()==option||a["params"]?["objectId"]?.GetValue<string>()==option);var p=new JsonObject{["clientRequestId"]=EntityId.New(),["storySessionId"]=s["storySessionId"]!.DeepClone(),["bindingId"]=e["bindingId"]!.DeepClone(),["actionId"]=a!["actionId"]!.DeepClone(),["params"]=a["params"]!.DeepClone(),["expectedTrackRevision"]=s["myTrack"]!["revision"]!.DeepClone()};if(e["needsSharedRevision"]!.GetValue<bool>())p["expectedSharedRevision"]=s["sharedRevision"]!.DeepClone();if(e["revision"] is JsonNode revision)p["expectedEventRevision"]=revision.DeepClone();return p;
    }
    public async Task<JsonObject> Send(int actor,string binding,string? option=null){var p=await Payload(actor,binding,option);var response=await Clients[actor].PostAsJsonAsync($"/api/v1/game-rounds/{Round}/story/event",p);Assert.Equal(HttpStatusCode.OK,response.StatusCode);return(await response.Content.ReadFromJsonAsync<JsonObject>())!;}
    public async Task BeforeFinal(bool stopBeforeRetrieve=false,bool stopBeforeShare=false){
        await Send(0,"arrive-inviter");await Send(0,"inspect-slip");await Send(0,"pick-slip");await Send(0,"move-inviter-counter");await Send(0,"place-slip");await Send(1,"arrive-acceptor");await Send(1,"inspect-bag");await Send(1,"pick-bag");await Send(1,"move-acceptor-counter");await Send(1,"place-bag");
        await Send(0,"counter-meet");Assert.Equal("i03",(await Snapshot(0))["myTrack"]!.Text("nodeId"));await Send(1,"counter-meet");
        await Send(0,"move-inviter-shelves");await Send(0,"compare-books","book-wednesday");await Send(1,"query-title");await Send(1,"inspect-ledger");
        var privateClue=await Snapshot(0);Assert.DoesNotContain(privateClue["knownClues"]!.AsArray(),clue=>clue!.Text("id")=="shared-order");Assert.DoesNotContain(privateClue["availableEvents"]!.AsArray(),e=>e!.Text("bindingId").EndsWith(":pick-book"));
        if(stopBeforeShare)return;
        await Send(1,"share-order-clue");Assert.Contains((await Snapshot(0))["knownClues"]!.AsArray(),clue=>clue!.Text("id")=="shared-order"&&clue!.Text("text").Contains("《海邊的雨天》"));
        await Send(1,"move-acceptor-window");await Send(1,"pick-sleeve");await Send(1,"move-acceptor-counter");await Send(1,"deliver-sleeve");
        await Send(0,"read-shared-clue");await Send(0,"pick-book");await Send(0,"move-inviter-counter");await Send(0,"deliver-book");await Send(0,"wind-rescue","start");await Send(0,"wind-rescue","hold-bag");await Send(1,"move-acceptor-window");if(stopBeforeRetrieve)return;await Send(1,"wind-rescue","retrieve-tag");await Send(1,"move-acceptor-counter");await Send(1,"wind-rescue","place-tag");
        Assert.Equal("i08",(await Snapshot(0))["myTrack"]!.Text("nodeId"));Assert.Equal("a08",(await Snapshot(1))["myTrack"]!.Text("nodeId"));await Send(1,"verify-order");
    }
    public async ValueTask DisposeAsync(){foreach(var c in Clients)c.Dispose();Factory.Dispose();media.Dispose();await Platform.DisposeAsync();}
    private sealed class MediaBridge(RealPlatform platform):HttpMessageHandler
    {
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct){var headers=request.Headers.ToDictionary(h=>h.Key,h=>string.Join(",",h.Value));var result=await platform.ExecuteAsync("$test-media",new{path=request.RequestUri!.AbsolutePath,method=request.Method.Method,headers,content=(string?)null},ct);var response=new HttpResponseMessage((HttpStatusCode)result.Number("status")){Content=new ByteArrayContent(Convert.FromBase64String(result.Text("content")))};if(result.Maybe("mime") is string mime)response.Content.Headers.ContentType=new(mime);return response;}
    }
}
