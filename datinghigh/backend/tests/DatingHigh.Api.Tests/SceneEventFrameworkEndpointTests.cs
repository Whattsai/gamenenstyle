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

/// <summary>分層正式首條內容，真 Application／HTTP／Miniflare D1／R2；不代表人工 Gate。</summary>
public sealed class SceneEventFrameworkEndpointTests
{
    [Fact]
    public async Task OwnSelectedAvatarNotReady_BlocksEntryTicketAndCommandsWithoutWritingButAllowsExit()
    {
        await using var c=new Context();await c.Seed();
        await c.Platform.Sql("UPDATE user_profiles SET selected_avatar_type=NULL,selected_avatar_ref=NULL WHERE account_id=?",c.Users[0].AccountId);
        var before=(await c.Platform.Sql("SELECT COUNT(*) AS n FROM game_round_events"))[0]!.Number("n");
        var blocked=await c.Clients[0].GetAsync($"/api/v1/game-rounds/{c.Round}/experience");Assert.Equal(HttpStatusCode.Conflict,blocked.StatusCode);Assert.Equal("OWN_AVATAR_PACK_NOT_READY",(await blocked.Content.ReadFromJsonAsync<JsonObject>())!.Text("code"));
        var error=await Assert.ThrowsAsync<DomainException>(()=>c.Service.TicketAsync(c.Users[0],c.Round,EntityId.New(),"android"));Assert.Equal("OWN_AVATAR_PACK_NOT_READY",error.Code);
        error=await Assert.ThrowsAsync<DomainException>(()=>c.Service.CommandAsync(c.Users[0],c.Round,"message.send",EntityId.New(),new(){["text"]="不可寫入"}));Assert.Equal("OWN_AVATAR_PACK_NOT_READY",error.Code);
        Assert.Equal(before,(await c.Platform.Sql("SELECT COUNT(*) AS n FROM game_round_events"))[0]!.Number("n"));
        Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].GetAsync($"/api/v1/game-rounds/{c.Round}/experience")).StatusCode);
        Assert.Equal("playing",(await c.Service.ExperienceAsync(c.Users[1],c.Round)).Text("phase"));
        await c.Platform.Sql("UPDATE user_profiles SET selected_avatar_type='builtin',selected_avatar_ref='male-01' WHERE account_id=?",c.Users[0].AccountId);
        Assert.Equal(HttpStatusCode.OK,(await c.Clients[0].GetAsync($"/api/v1/game-rounds/{c.Round}/experience")).StatusCode);
        await c.Platform.Sql("UPDATE user_profiles SET selected_avatar_type=NULL,selected_avatar_ref=NULL WHERE account_id=?",c.Users[0].AccountId);
        Assert.Equal(HttpStatusCode.OK,(await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/end",new{})).StatusCode);
        Assert.Equal("ended",(await c.Service.ExperienceAsync(c.Users[0],c.Round)).Text("phase"));
    }
    private sealed class Context:SceneTrackHttpContext {}
    [Fact]
    public async Task MinimalTwoActorNarrative_CompletesOnlyAfterBothRealActions_AndCanReplay()
    {
        await using var c=new Context();await c.Seed(linear:true);var first=await c.Snapshot(0);Assert.Equal("i01",first["myTrack"]!.Text("nodeId"));
        await c.Send(0,"final-exchange","rest_chat");Assert.Equal("playing",(await c.Snapshot(1)).Text("phase"));var p=await c.Payload(1,"final-exchange","rest_chat");var path=$"/api/v1/game-rounds/{c.Round}/story/event";
        var response=await c.Clients[1].PostAsJsonAsync(path,p);Assert.Equal(HttpStatusCode.OK,response.StatusCode);var receipt=await response.Content.ReadAsStringAsync();Assert.Equal(receipt,await(await c.Clients[1].PostAsJsonAsync(path,p)).Content.ReadAsStringAsync());
        var done=await c.Snapshot(0);Assert.Equal("ending-only",done.Text("endingId"));Assert.Empty(done["availableEvents"]!.AsArray());Assert.Single(await c.Platform.Sql("SELECT * FROM game_round_events WHERE kind='chapter.completed'"));Assert.Empty(await c.Platform.Sql("SELECT * FROM game_scene_visits WHERE left_at IS NULL"));
        await c.Service.CommandAsync(c.Users[1],c.Round,"message.send",EntityId.New(),new(){["text"]="簡單的相遇之後也可以聊天。"});foreach(var actor in new[]{0,1})await c.Service.CommandAsync(c.Users[actor],c.Round,"story.next.requested",EntityId.New(),new(){["completedEpisodeSeq"]=1,["agree"]=true});
        Assert.Equal(2,(await c.Snapshot(0)).Number("episodeSeq"));Assert.Equal("i01",(await c.Snapshot(0))["myTrack"]!.Text("nodeId"));Assert.Equal("a01",(await c.Snapshot(1))["myTrack"]!.Text("nodeId"));
    }

    [Fact]
    public async Task FrameworkPrivacy_EndedRoundHasOnlySafeStatusAndRevokedFamilyIsUnauthorized()
    {
        await using var c=new Context();await c.Seed();
        Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].GetAsync($"/api/v1/game-rounds/{c.Round}/experience")).StatusCode);
        Assert.Equal(HttpStatusCode.OK,(await c.Clients[1].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/end",new{})).StatusCode);
        var ended=await c.Clients[0].GetFromJsonAsync<JsonObject>($"/api/v1/game-rounds/{c.Round}/experience");Assert.NotNull(ended);Assert.Equal("ended",ended.Text("phase"));Assert.Equal(new[]{"phase","roundId"},ended.Select(p=>p.Key).Order());
        await c.Platform.Sql("UPDATE auth_sessions SET revoked_at=? WHERE session_id=?",c.Platform.Clock.GetUtcNow().ToUnixTimeMilliseconds(),c.Users[0].SessionId);
        Assert.Equal(HttpStatusCode.Unauthorized,(await c.Clients[0].GetAsync($"/api/v1/game-rounds/{c.Round}/experience")).StatusCode);
    }

    [Theory][InlineData(0)][InlineData(1)]
    public async Task HiddenSceneAndGlobalEvents_UseCommittedTriggerAndPersistDraws(int probability)
    {
        await using var c=new Context();await c.Seed(probability:probability);var initial=await c.Snapshot(0);Assert.DoesNotContain("hidden-note",initial.ToJsonString());Assert.Empty(await c.Platform.Sql("SELECT * FROM game_event_instances"));
        await c.Send(0,"arrive-inviter");var reached=await c.Snapshot(0);var instances=await c.Platform.Sql("SELECT * FROM game_event_instances WHERE binding_id='scene:rain-bookshop:hidden-note'");Assert.Single(instances);Assert.Equal(probability==1?"active":"cancelled",instances[0]!.Text("status"));
        var revision=reached.Number("sharedRevision");await c.Snapshot(0);Assert.Equal(revision,(await c.Snapshot(0)).Number("sharedRevision"));Assert.Single(await c.Platform.Sql("SELECT * FROM game_round_events WHERE kind='story.state.updated'"));Assert.DoesNotContain("hidden-note",(await c.Snapshot(1)).ToJsonString());Assert.DoesNotContain("hidden-note",(await c.Service.EventsAsync(c.Users[1],c.Round,0,null,100)).ToJsonString());
        if(probability==1){await c.Send(0,"hidden-note");Assert.Contains((await c.Snapshot(0))["availableEvents"]!.AsArray(),e=>e!.Text("bindingId")=="global:global:global-note");await c.Send(0,"global-note");Assert.Equal("completed",(await c.Platform.Sql("SELECT status FROM game_event_instances WHERE binding_id='global:global:global-note'"))[0]!.Text("status"));}
        else Assert.DoesNotContain(reached["availableEvents"]!.AsArray(),e=>e!.Text("bindingId").EndsWith(":hidden-note"));
    }
    [Fact]
    public async Task GenericEventHttp_StrictFieldsAndRoleScopeRejectBeforeAnyWrite()
    {
        await using var c=new Context();await c.Seed();var payload=await c.Payload(0,"arrive-inviter");var path=$"/api/v1/game-rounds/{c.Round}/story/event";var before=await c.Platform.Sql("SELECT * FROM game_round_events");
        foreach(var key in new[]{"role","nextNode","state","actorAccountId","worldEffects","eventVersion"}){var p=payload.DeepClone().AsObject();p[key]="forged";Assert.Equal(HttpStatusCode.BadRequest,(await c.Clients[0].PostAsJsonAsync(path,p)).StatusCode);}
        var other=payload.DeepClone().AsObject();other["params"]!["objectId"]="reserve-bag-27";Assert.Equal(HttpStatusCode.BadRequest,(await c.Clients[0].PostAsJsonAsync(path,other)).StatusCode);Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].PostAsJsonAsync(path,payload)).StatusCode);
        foreach(var oldType in new[]{"story.choice.submit","interaction.submit"})Assert.Equal(400,(await Assert.ThrowsAsync<DomainException>(()=>c.Service.CommandAsync(c.Users[0],c.Round,oldType,EntityId.New(),new()))).Status);
        Assert.True(JsonNode.DeepEquals(before,await c.Platform.Sql("SELECT * FROM game_round_events")));
    }
}
