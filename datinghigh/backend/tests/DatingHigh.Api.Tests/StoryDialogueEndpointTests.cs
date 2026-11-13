using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
using DatingHigh.Integration.Tests;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DatingHigh.Api.Tests;

/// <summary>真 Application／HTTP／Miniflare D1／R2；DO handshake 另由 Worker 實測。</summary>
public sealed class StoryDialogueEndpointTests
{
    private sealed class Context:IAsyncDisposable
    {
        public readonly RealPlatform Platform=new();public readonly ApiFixture Factory=new();public readonly List<CurrentUser> Users=[];public readonly List<string> Profiles=[];public readonly List<HttpClient> Clients=[];public string Round="";
        public StoryDialogueService Service=>new(Platform,new CloudflareRoundRealtimeNotifier(Platform),new RateLimiter(Platform,Platform.Options,Platform.Clock));
        public Context(){Factory.AdditionalServices=services=>{services.RemoveAll<IPlatformClient>();services.AddSingleton<IPlatformClient>(Platform);services.RemoveAll<TimeProvider>();services.AddSingleton<TimeProvider>(Platform.Clock);services.RemoveAll<AuthOptions>();services.AddSingleton(Platform.Options);};}
        public async Task Seed(int catalogCount=1){
            if(catalogCount>1)await Platform.ExecuteAsync("$test-story-catalogs",new{count=catalogCount});
            for(var n=0;n<3;n++){
                var email=$"story-{n}@example.test";await Platform.Seed(true,email);var login=RealPlatform.Json((await Platform.App.Login(email,RealPlatform.Password,"android","127.0.0.1",default)).Body);
                var user=new CurrentUser(login["account"]!.Text("accountId"),login["session"]!.Text("sessionId"),1,Platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());Users.Add(user);
                var profiles=new DatingProfileService(Platform,Platform.Clock);await profiles.ReadAsync(user);Profiles.Add((await Platform.Sql("SELECT profile_id FROM user_profiles WHERE account_id=?",user.AccountId))[0]!.Text("profile_id"));
                await profiles.SaveAsync(user,new(1,$"故事旅人{n}","喜歡閱讀",null,"1990-01-01",null,["warm"],["reading"],[],[],null,null,null,null,null,null,null,[],50,"diverse",["diverse"],new()));
                await Platform.ExecuteAsync("profile.avatar.builtin",new{accountId=user.AccountId,sessionId=user.SessionId,cv=1,accessExpiresAt=user.AccessExpiresAt,expectedRevision=2,avatarId="male-01"});
                var client=Factory.Native();client.DefaultRequestHeaders.Authorization=new("Bearer",login["tokens"]!.Text("accessToken"));Clients.Add(client);
            }
            var matching=new MatchingSessionService(Platform,new MatchingCandidateProfileReader(Platform),new RateLimiter(Platform,Platform.Options,Platform.Clock),Platform.Clock);
            var invitation=await matching.InviteAsync(Users[0],Profiles[1],EntityId.New());Round=(await matching.ResolveAsync(Users[1],invitation.Text("invitationId"),"accept")).Text("roundId");
        }
        public async Task<JsonObject> Action(int actor,string type,string choice,string? definition=null,string? requestId=null){
            var snapshot=await Service.ExperienceAsync(Users[actor],Round);var p=new JsonObject{["storySessionId"]=snapshot["storySessionId"]!.DeepClone(),["episodeSeq"]=1,["nodeId"]=snapshot["currentNode"]!["id"]!.DeepClone(),["expectedRevision"]=snapshot["progressRevision"]!.DeepClone(),["choiceId"]=choice};if(definition is not null)p["definitionId"]=definition;
            return await Service.CommandAsync(Users[actor],Round,type,requestId??EntityId.New(),p);
        }
        public async ValueTask DisposeAsync(){foreach(var client in Clients)client.Dispose();Factory.Dispose();await Platform.DisposeAsync();}
    }
    [Theory][InlineData(true,true,"ending-together")][InlineData(false,false,"ending-two-pages")]
    public async Task SD_API_014_022_023_036_037_FullFirstStory_BranchCooperationAndChatRemainReal(bool side,bool same,string ending)
    {
        await using var c=new Context();await c.Seed();var initial=await c.Service.ExperienceAsync(c.Users[0],c.Round);Assert.Equal("playing",initial.Text("phase"));Assert.Equal(1,initial["episodeSeq"]!.GetValue<int>());Assert.Null(initial["offers"]);
        var inspect=await c.Action(0,"interaction.submit","back","bookmark");Assert.True(inspect.Number("eventSeq")>1);
        await c.Action(0,"story.choice.submit","enter");await c.Action(1,"story.choice.submit","browse");await c.Action(0,"story.choice.submit",side?"follow":"stay");
        if(side)await c.Action(1,"story.choice.submit","return");await c.Action(0,"story.choice.submit","choose");
        await c.Action(0,"interaction.submit","warm","reading-path");var waiting=await c.Service.ExperienceAsync(c.Users[0],c.Round);Assert.Equal("warm",waiting["interaction"]!.Text("myChoice"));Assert.Equal("cooperate",waiting["currentNode"]!.Text("id"));
        await c.Service.CommandAsync(c.Users[0],c.Round,"message.send",EntityId.New(),new(){["text"]="等你的時候，我在讀書籤。"});
        await c.Action(1,"interaction.submit",same?"warm":"adventure","reading-path");
        foreach(var user in c.Users.Take(2)){var snapshot=await c.Service.ExperienceAsync(user,c.Round);Assert.Equal(ending,snapshot["currentNode"]!.Text("id"));Assert.Equal("completed",snapshot.Text("chapterStatus"));Assert.Equal("active",(await c.Service.StatusAsync(user,c.Round)).Text("status"));}
        await c.Service.CommandAsync(c.Users[1],c.Round,"message.send",EntityId.New(),new(){["text"]="本章結束，我還想再聊一會兒。"});
        var events=await c.Service.EventsAsync(c.Users[0],c.Round,0,null,100);Assert.Contains(events["events"]!.AsArray(),e=>e!.Text("type")=="chapter.completed");Assert.Equal(2,(await c.Platform.Sql("SELECT * FROM game_active_round_claims")).Count);
    }
    [Fact]
    public async Task SD_API_001_006_007_008_029_032_ThirdPartyRevocationAndEnd_HideAllPrivateContent()
    {
        await using var c=new Context();await c.Seed();
        foreach(var suffix in new[]{"experience","status","story/offers"})Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].GetAsync($"/api/v1/game-rounds/{c.Round}/{suffix}")).StatusCode);
        foreach(var (suffix,body) in new (string,object)[]{("realtime-ticket",new{deviceId=EntityId.New()}),("events/query",new{afterSeq=0,limit=50}),("end",new{})})Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/{suffix}",body)).StatusCode);
        var selected=await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/vote",new{clientRequestId=EntityId.New(),episodeSeq=1,catalogId="019a281e-0000-7000-8000-000000000001"});Assert.True(selected.StatusCode==HttpStatusCode.Conflict,await selected.Content.ReadAsStringAsync());Assert.Equal("STORY_ALREADY_SELECTED",(await selected.Content.ReadFromJsonAsync<JsonObject>())!.Text("code"));
        await c.Action(0,"interaction.submit","back","bookmark");var ended=await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/end",new{});Assert.Equal(HttpStatusCode.OK,ended.StatusCode);
        foreach(var client in c.Clients.Take(2)){
            var response=await client.GetAsync($"/api/v1/game-rounds/{c.Round}/experience");var safe=(await response.Content.ReadFromJsonAsync<JsonObject>())!;Assert.Equal(new[]{"phase","roundId"},safe.Select(p=>p.Key).Order());Assert.True(response.Headers.CacheControl?.NoStore);
            Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/events/query",new{afterSeq=0,limit=50})).StatusCode);
        }
        Assert.Equal("cancelled",(await c.Platform.Sql("SELECT status FROM game_interaction_instances"))[0]!.Text("status"));Assert.Empty(await c.Platform.Sql("SELECT * FROM game_active_round_claims"));Assert.NotEmpty(await c.Platform.Sql("SELECT * FROM game_round_events"));
        var error=await Assert.ThrowsAsync<DomainException>(()=>c.Service.CommandAsync(c.Users[1],c.Round,"message.send",EntityId.New(),new(){["text"]="太遲了"}));Assert.Equal("ROUND_NOT_ACTIVE",error.Code);
    }
    [Theory][InlineData("{\"afterSeq\":0,\"limit\":50,\"limit\":1}")][InlineData("{\"afterSeq\":0,\"limit\":101}")][InlineData("{\"afterSeq\":0,\"limit\":2,\"actor\":\"forged\"}")]
    public async Task SD_API_004_013_StrictJsonAndBoundedCursor_RejectBeforeDisclosure(string body)
    {
        await using var c=new Context();await c.Seed();var response=await c.Clients[0].PostAsync($"/api/v1/game-rounds/{c.Round}/events/query",new StringContent(body,System.Text.Encoding.UTF8,"application/json"));Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);Assert.True(response.Headers.CacheControl?.NoStore);
    }
    [Fact]
    public async Task SD_API_009_TicketFlood_IsBoundedAcrossRequests()
    {
        await using var c=new Context();await c.Seed();
        for(var n=0;n<30;n++)Assert.Equal(HttpStatusCode.OK,(await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/realtime-ticket",new{deviceId=EntityId.New()})).StatusCode);
        var response=await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/realtime-ticket",new{deviceId=EntityId.New()});Assert.Equal(HttpStatusCode.TooManyRequests,response.StatusCode);Assert.True(response.Headers.CacheControl?.NoStore);Assert.NotNull(response.Headers.RetryAfter);
    }
    [Theory][InlineData(2)][InlineData(3)]
    public async Task SD_API_015_016_017_018_019_028_034_SafeOffersAndLatestVote_HaveNoHiddenPartnerChoice(int count)
    {
        await using var c=new Context();await c.Seed(count);
        var initial=await c.Service.ExperienceAsync(c.Users[0],c.Round);var offers=initial["offers"]!.AsArray();Assert.Equal(count,offers.Count);Assert.Null(initial["assets"]);Assert.Null(initial["currentNode"]);
        foreach(var offer in offers)Assert.Equal(new[]{"catalogId","previewUrl","rank","reason","storyId","summary","title","version"},offer!.AsObject().Select(p=>p.Key).Order());
        var first=offers[0]!.Text("catalogId");var other=offers[1]!.Text("catalogId");var requestId=EntityId.New();
        var receipt=await c.Service.CommandAsync(c.Users[0],c.Round,"story.vote.submit",requestId,new(){["episodeSeq"]=1,["catalogId"]=first});
        Assert.Equal(receipt.ToJsonString(),(await c.Service.CommandAsync(c.Users[0],c.Round,"story.vote.submit",requestId,new(){["episodeSeq"]=1,["catalogId"]=first})).ToJsonString());
        var partner=await c.Service.ExperienceAsync(c.Users[1],c.Round);Assert.True(partner["partnerHasVoted"]!.GetValue<bool>());Assert.Null(partner["myVote"]);
        var events=await c.Service.EventsAsync(c.Users[1],c.Round,0,null,100);Assert.DoesNotContain(first,events.ToJsonString());Assert.Equal("story.vote_status",events["events"]![0]!.Text("type"));
        await c.Service.CommandAsync(c.Users[1],c.Round,"story.vote.submit",EntityId.New(),new(){["episodeSeq"]=1,["catalogId"]=other});
        var selected=await c.Service.ExperienceAsync(c.Users[1],c.Round);Assert.Equal(first,selected.Text("catalogId"));Assert.Equal("雙方選擇不同，採原邀請方的選擇",selected.Text("selectionReason"));Assert.Equal("playing",selected.Text("phase"));
        Assert.Equal(receipt.ToJsonString(),(await c.Service.CommandAsync(c.Users[0],c.Round,"story.vote.submit",requestId,new(){["episodeSeq"]=1,["catalogId"]=first})).ToJsonString());
    }
    [Fact]
    public async Task SD_API_030_036_RevokedFamilyAndSecondEpisode_AreRejectedAtAllCurrentCommands()
    {
        await using var c=new Context();await c.Seed();
        foreach(var type in new[]{"story.vote.submit","story.choice.submit","interaction.submit"}){
            var error=await Assert.ThrowsAsync<DomainException>(()=>c.Service.CommandAsync(c.Users[0],c.Round,type,EntityId.New(),new(){["episodeSeq"]=2}));Assert.Equal(400,error.Status);
        }
        await c.Platform.Sql("UPDATE auth_sessions SET revoked_at=? WHERE session_id=?",c.Platform.Clock.GetUtcNow().ToUnixTimeMilliseconds(),c.Users[0].SessionId);
        foreach(var type in new[]{"story.vote.submit","story.choice.submit","interaction.submit","message.send"}){var error=await Assert.ThrowsAsync<DomainException>(()=>c.Service.CommandAsync(c.Users[0],c.Round,type,EntityId.New(),new(){["text"]="revoked"}));Assert.Equal("SESSION_REVOKED",error.Code);}
        foreach(var suffix in new[]{"experience","status","story/offers"})Assert.Equal(HttpStatusCode.Unauthorized,(await c.Clients[0].GetAsync($"/api/v1/game-rounds/{c.Round}/{suffix}")).StatusCode);
        foreach(var (suffix,body) in new (string,object)[]{("realtime-ticket",new{deviceId=EntityId.New()}),("events/query",new{afterSeq=0,limit=50}),("end",new{})})Assert.Equal(HttpStatusCode.Unauthorized,(await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/{suffix}",body)).StatusCode);
    }

    private sealed class FailedNotifier:IRoundRealtimeNotifier{public Task NotifyAsync(string roundId,bool ended,CancellationToken ct=default)=>throw new HttpRequestException("Controlled notification failure");}
    [Fact]
    public async Task SD_API_010_035_NotificationFailure_PreservesCommittedReceiptAndOneEvent()
    {
        await using var c=new Context();await c.Seed();var service=new StoryDialogueService(c.Platform,new FailedNotifier(),new RateLimiter(c.Platform,c.Platform.Options,c.Platform.Clock));var request=EntityId.New();
        var first=await service.CommandAsync(c.Users[0],c.Round,"message.send",request,new(){["text"]="Committed before failed notification"});var replay=await service.CommandAsync(c.Users[0],c.Round,"message.send",request,new(){["text"]="Committed before failed notification"});Assert.Equal(first.ToJsonString(),replay.ToJsonString());
        var events=await service.EventsAsync(c.Users[1],c.Round,0,null,100);Assert.Single(events["events"]!.AsArray(),e=>e!.Maybe("clientRequestId")==request);
    }

}
