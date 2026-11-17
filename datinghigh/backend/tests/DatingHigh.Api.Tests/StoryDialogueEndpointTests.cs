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
    private sealed class Context:SceneTrackHttpContext {}
    [Theory][InlineData("look_back","look_back","e01")][InlineData("rest_chat","look_back","e02")]
    public async Task FullFirstStory_BranchCooperationAndChatRemainReal(string inviter,string acceptor,string ending)
    {
        await using var c=new Context();await c.Seed();await c.BeforeFinal();await c.Send(0,"final-exchange",inviter);
        await c.Service.CommandAsync(c.Users[0],c.Round,"message.send",EntityId.New(),new(){["text"]="等你一起完成最後一單。"});await c.Send(1,"final-exchange",acceptor);
        foreach(var user in c.Users.Take(2)){var snapshot=await c.Service.ExperienceAsync(user,c.Round);Assert.Equal(ending,snapshot.Text("endingId"));Assert.Equal("completed",snapshot.Text("chapterStatus"));Assert.Equal("active",(await c.Service.StatusAsync(user,c.Round)).Text("status"));}
        await c.Service.CommandAsync(c.Users[1],c.Round,"message.send",EntityId.New(),new(){["text"]="本章結束，我還想再聊一會兒。"});Assert.Equal(2,(await c.Platform.Sql("SELECT * FROM game_active_round_claims")).Count);
    }
    [Fact]
    public async Task SD_API_001_006_007_008_029_032_ThirdPartyRevocationAndEnd_HideAllPrivateContent()
    {
        await using var c=new Context();await c.Seed();
        foreach(var suffix in new[]{"experience","status","story/offers"})Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].GetAsync($"/api/v1/game-rounds/{c.Round}/{suffix}")).StatusCode);
        foreach(var (suffix,body) in new (string,object)[]{("realtime-ticket",new{deviceId=EntityId.New()}),("events/query",new{afterSeq=0,limit=50}),("end",new{})})Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/{suffix}",body)).StatusCode);
        var selected=await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/vote",new{clientRequestId=EntityId.New(),episodeSeq=1,categoryId="019a281e-0000-7000-8000-000000004003"});Assert.True(selected.StatusCode==HttpStatusCode.Conflict,await selected.Content.ReadAsStringAsync());Assert.Equal("EVENT_STATE_CONFLICT",(await selected.Content.ReadFromJsonAsync<JsonObject>())!.Text("code"));
        await c.Send(0,"move-inviter-counter");var ended=await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/end",new{});Assert.Equal(HttpStatusCode.OK,ended.StatusCode);
        foreach(var client in c.Clients.Take(2)){
            var response=await client.GetAsync($"/api/v1/game-rounds/{c.Round}/experience");var safe=(await response.Content.ReadFromJsonAsync<JsonObject>())!;Assert.Equal(new[]{"phase","roundId"},safe.Select(p=>p.Key).Order());Assert.True(response.Headers.CacheControl?.NoStore);
            Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/events/query",new{afterSeq=0,limit=50})).StatusCode);
        }
        Assert.Equal("cancelled",(await c.Platform.Sql("SELECT status FROM game_event_instances"))[0]!.Text("status"));Assert.Empty(await c.Platform.Sql("SELECT * FROM game_active_round_claims"));Assert.NotEmpty(await c.Platform.Sql("SELECT * FROM game_round_events"));
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
        Assert.Equal("pending_category_selection",initial.Text("phase"));foreach(var offer in offers)Assert.Equal(new[]{"categoryId","rank","reason","summary","title"},offer!.AsObject().Select(p=>p.Key).Order());
        var first=offers[0]!.Text("categoryId");var other=offers[1]!.Text("categoryId");var requestId=EntityId.New();
        var receipt=await c.Service.CommandAsync(c.Users[0],c.Round,"story.vote.submit",requestId,new(){["episodeSeq"]=1,["categoryId"]=first});
        Assert.Equal(receipt.ToJsonString(),(await c.Service.CommandAsync(c.Users[0],c.Round,"story.vote.submit",requestId,new(){["episodeSeq"]=1,["categoryId"]=first})).ToJsonString());
        var partner=await c.Service.ExperienceAsync(c.Users[1],c.Round);Assert.True(partner["partnerHasVoted"]!.GetValue<bool>());Assert.Null(partner["myVote"]);
        var events=await c.Service.EventsAsync(c.Users[1],c.Round,0,null,100);Assert.DoesNotContain(first,events.ToJsonString());Assert.Contains(events["events"]!.AsArray(),e=>e!.Text("type")=="story.vote_status");
        await c.Service.CommandAsync(c.Users[1],c.Round,"story.vote.submit",EntityId.New(),new(){["episodeSeq"]=1,["categoryId"]=other});
        var selected=await c.Service.ExperienceAsync(c.Users[1],c.Round);Assert.Equal(first,selected.Text("selectedCategoryId"));Assert.Equal("playing",selected.Text("phase"));Assert.Equal("a01",selected["myTrack"]!.Text("nodeId"));
        Assert.Equal(receipt.ToJsonString(),(await c.Service.CommandAsync(c.Users[0],c.Round,"story.vote.submit",requestId,new(){["episodeSeq"]=1,["categoryId"]=first})).ToJsonString());
    }
    [Fact]
    public async Task SD_API_030_036_RevokedFamilyAndSecondEpisode_AreRejectedAtAllCurrentCommands()
    {
        await using var c=new Context();await c.Seed();
        foreach(var type in new[]{"story.vote.submit","story.choice.submit","interaction.submit"}){
            var error=await Assert.ThrowsAsync<DomainException>(()=>c.Service.CommandAsync(c.Users[0],c.Round,type,EntityId.New(),new(){["episodeSeq"]=2}));Assert.Equal(400,error.Status);
        }
        await c.Platform.Sql("UPDATE auth_sessions SET revoked_at=? WHERE session_id=?",c.Platform.Clock.GetUtcNow().ToUnixTimeMilliseconds(),c.Users[0].SessionId);
        foreach(var type in new[]{"story.vote.submit","story.event.submit","message.send"}){var error=await Assert.ThrowsAsync<DomainException>(()=>c.Service.CommandAsync(c.Users[0],c.Round,type,EntityId.New(),new(){["text"]="revoked"}));Assert.Equal("SESSION_REVOKED",error.Code);}
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
