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

/// <summary>正式 v2 內容與真 D1／R2 的 HTTP；不代簽真平台 UI 或人工 Gate。</summary>
public sealed class SceneEventTrackEndpointTests
{
    [Theory][InlineData(2,false)][InlineData(3,false)][InlineData(2,true)]
    public async Task CategoryDecisionReason_UsesLatestRealBallots_AndIsOmittedBeforeSelection(int count,bool same)
    {
        await using var c=new SceneTrackHttpContext();await c.Seed(categories:count);var offers=(await c.Snapshot(0))["offers"]!.AsArray();var first=offers[0]!.Text("categoryId");var second=offers[1]!.Text("categoryId");
        async Task Vote(int actor,string categoryId){var response=await c.Clients[actor].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/vote",new{clientRequestId=EntityId.New(),episodeSeq=1,categoryId});Assert.Equal(HttpStatusCode.OK,response.StatusCode);}
        var oldCatalog=(await c.Platform.Sql("SELECT catalog_id FROM content_story_catalog WHERE status='published'"))[0]!.Text("catalog_id");var votesBefore=(await c.Platform.Sql("SELECT * FROM game_round_events")).ToJsonString();
        var invalid=await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/vote",new{clientRequestId=EntityId.New(),episodeSeq=1,categoryId=oldCatalog});Assert.Contains(invalid.StatusCode,new[]{HttpStatusCode.BadRequest,HttpStatusCode.Conflict});Assert.Equal(votesBefore,(await c.Platform.Sql("SELECT * FROM game_round_events")).ToJsonString());
        await Vote(0,second);
        var waiting=await c.Snapshot(1);Assert.Null(waiting["selectionReason"]);Assert.Null(waiting["myVote"]);Assert.True(waiting["partnerHasVoted"]!.GetValue<bool>());
        await Vote(0,first);
        await Vote(1,same?first:second);
        foreach(var actor in new[]{0,1}){var selected=await c.Snapshot(actor);Assert.Equal(first,selected.Text("selectedCategoryId"));Assert.Contains(same?"相同":"原邀請方",selected.Text("selectionReason"));}
    }
    [Fact]
    public async Task EntriesAndIndependentProgress_AreActorScoped_AndUnknownParamsCannotWrite()
    {
        await using var c=new SceneTrackHttpContext();await c.Seed();var first=await c.Snapshot(0);var partner=await c.Snapshot(1);Assert.Equal("inviter",first["myTrack"]!.Text("role"));Assert.Equal("i01",first["myTrack"]!.Text("nodeId"));Assert.Equal("a01",partner["myTrack"]!.Text("nodeId"));
        Assert.DoesNotContain("tracks",first.ToJsonString());Assert.DoesNotContain("manifest.json",first.ToJsonString());Assert.DoesNotContain("triggerConditions",first.ToJsonString());Assert.DoesNotContain("reserve-ledger",first.ToJsonString());
        var p=await c.Payload(0,"arrive-inviter");var before=(await c.Platform.Sql("SELECT COUNT(*) AS n FROM game_round_events"))[0]!.Number("n");var invalid=p.DeepClone().AsObject();invalid["params"]!["accountId"]=c.Users[1].AccountId;Assert.Equal(HttpStatusCode.BadRequest,(await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/event",invalid)).StatusCode);Assert.Equal(before,(await c.Platform.Sql("SELECT COUNT(*) AS n FROM game_round_events"))[0]!.Number("n"));
        var receipt=await c.Send(0,"arrive-inviter");var after=await c.Snapshot(1);Assert.True(JsonNode.DeepEquals(partner["myTrack"],after["myTrack"]));Assert.Equal("i02",(await c.Snapshot(0))["myTrack"]!.Text("nodeId"));
        Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].GetAsync($"/api/v1/game-rounds/{c.Round}/experience")).StatusCode);
        var history=await c.Service.EventsAsync(c.Users[1],c.Round,0,null,100);Assert.DoesNotContain("pickup-slip-27",history.ToJsonString());Assert.DoesNotContain("i02",history.ToJsonString());Assert.DoesNotContain("params",history.ToJsonString());
    }
    [Fact]
    public async Task Receipt_ReplaysBeforeR2AndRejectsChangedPayloadOrStaleTrack_WithoutForgingPartner()
    {
        await using var c=new SceneTrackHttpContext();await c.Seed();var p=await c.Payload(0,"arrive-inviter");var path=$"/api/v1/game-rounds/{c.Round}/story/event";var first=await c.Clients[0].PostAsJsonAsync(path,p);Assert.Equal(HttpStatusCode.OK,first.StatusCode);var receipt=await first.Content.ReadFromJsonAsync<JsonObject>();Assert.True(JsonNode.DeepEquals(receipt,await(await c.Clients[0].PostAsJsonAsync(path,p)).Content.ReadFromJsonAsync<JsonObject>()));
        await c.Platform.ExecuteAsync("$test-content-mode",new{mode="missing"});Assert.True(JsonNode.DeepEquals(receipt,await(await c.Clients[0].PostAsJsonAsync(path,p)).Content.ReadFromJsonAsync<JsonObject>()));await c.Platform.ExecuteAsync("$test-content-mode",new{mode="normal"});
        var changed=p.DeepClone().AsObject();changed["params"]!["objectId"]="reserve-bag-27";Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[0].PostAsJsonAsync(path,changed)).StatusCode);changed["clientRequestId"]=EntityId.New();Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[0].PostAsJsonAsync(path,changed)).StatusCode);
        var forged=p.DeepClone().AsObject();forged["clientRequestId"]=EntityId.New();forged["role"]="acceptor";Assert.Equal(HttpStatusCode.BadRequest,(await c.Clients[0].PostAsJsonAsync(path,forged)).StatusCode);
        Assert.Empty(await c.Platform.Sql("SELECT * FROM game_round_events WHERE kind='message.committed'"));
    }
    [Theory][InlineData("look_back","look_back","e01")][InlineData("look_back","rest_chat","e02")]
    public async Task RainBookshop_TrueHttpActorsCompleteBothEndings_KeepChat_AndConsentInitializesNewTracks(string i,string a,string ending)
    {
        await using var c=new SceneTrackHttpContext();await c.Seed();await c.BeforeFinal();await c.Send(0,"final-exchange",i);Assert.Equal("playing",(await c.Snapshot(1)).Text("phase"));var oldAction=await c.Payload(1,"final-exchange",a);await c.Send(1,"final-exchange",a);
        var complete=await c.Snapshot(0);Assert.Equal("completed",complete.Text("phase"));Assert.Equal(ending,complete.Text("endingId"));Assert.Empty(complete["availableEvents"]!.AsArray());Assert.Empty(await c.Platform.Sql("SELECT * FROM game_event_instances WHERE status='active'"));Assert.Empty(await c.Platform.Sql("SELECT * FROM game_scene_visits WHERE left_at IS NULL"));
        oldAction["clientRequestId"]=EntityId.New();var completedBefore=(await c.Platform.Sql("SELECT * FROM game_round_events")).ToJsonString();Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[1].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/event",oldAction)).StatusCode);Assert.Equal(completedBefore,(await c.Platform.Sql("SELECT * FROM game_round_events")).ToJsonString());
        Assert.Equal("active",(await c.Platform.Sql("SELECT status FROM game_rounds"))[0]!.Text("status"));Assert.Single(await c.Platform.Sql("SELECT * FROM game_round_events WHERE kind='chapter.completed'"));
        await c.Service.CommandAsync(c.Users[0],c.Round,"message.send",EntityId.New(),new(){["text"]="訂單完成了，繼續聊聊。"});
        foreach(var actor in new[]{0,1})Assert.Equal(HttpStatusCode.OK,(await c.Clients[actor].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/next",new{clientRequestId=EntityId.New(),completedEpisodeSeq=1,agree=true})).StatusCode);
        var next=await c.Snapshot(1);Assert.Equal(2,next.Number("episodeSeq"));Assert.Equal("a01",next["myTrack"]!.Text("nodeId"));Assert.NotEqual(complete.Text("storySessionId"),next.Text("storySessionId"));Assert.Equal(4,(await c.Platform.Sql("SELECT * FROM game_story_participant_progress")).Count);Assert.Single((await c.Service.EventsAsync(c.Users[1],c.Round,0,null,100))["events"]!.AsArray(),e=>e!.Text("type")=="message.committed");
        Assert.Equal(HttpStatusCode.OK,(await c.Clients[1].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/end",new{})).StatusCode);var ended=await c.Snapshot(0);Assert.Equal(new[]{"phase","roundId"},ended.Select(p=>p.Key).Order());Assert.Empty(await c.Platform.Sql("SELECT * FROM game_active_round_claims"));
    }
    [Theory][InlineData("missing")][InlineData("corrupt")]
    public async Task PinnedContentFault_IsExplicitAndReadOnly_RestoreKeepsOriginalSession(string mode)
    {
        await using var c=new SceneTrackHttpContext();await c.Seed();var initial=await c.Snapshot(0);var before=(await c.Platform.Sql("SELECT * FROM game_round_events")).ToJsonString();
        await c.Platform.ExecuteAsync("$test-content-mode",new{mode});var response=await c.Clients[0].GetAsync($"/api/v1/game-rounds/{c.Round}/experience");Assert.Equal(HttpStatusCode.ServiceUnavailable,response.StatusCode);Assert.Equal("INVALID_STORY_CONTENT",(await response.Content.ReadFromJsonAsync<JsonObject>())!.Text("code"));Assert.Equal(before,(await c.Platform.Sql("SELECT * FROM game_round_events")).ToJsonString());
        await c.Platform.ExecuteAsync("$test-content-mode",new{mode="normal"});var restored=await c.Snapshot(0);Assert.Equal(initial.Text("storySessionId"),restored.Text("storySessionId"));Assert.True(JsonNode.DeepEquals(initial["myTrack"],restored["myTrack"]));Assert.True(JsonNode.DeepEquals(initial["world"],restored["world"]));
    }
    [Fact]
    public async Task ActualTagRetrieval_TwoAcceptorRequestsHaveOneCasWinner_InviterCannotForgeIt()
    {
        await using var c=new SceneTrackHttpContext();await c.Seed();await c.BeforeFinal(stopBeforeRetrieve:true);
        var p=await c.Payload(1,"wind-rescue","retrieve-tag");var path=$"/api/v1/game-rounds/{c.Round}/story/event";var inviter=await c.Snapshot(0);var acceptor=await c.Snapshot(1);
        var forged=p.DeepClone().AsObject();forged["expectedTrackRevision"]=inviter["myTrack"]!["revision"]!.DeepClone();
        var before=(await c.Platform.Sql("SELECT world_state_json,shared_revision FROM game_story_sessions")).ToJsonString();
        Assert.Equal(HttpStatusCode.BadRequest,(await c.Clients[0].PostAsJsonAsync(path,forged)).StatusCode);Assert.Equal(before,(await c.Platform.Sql("SELECT world_state_json,shared_revision FROM game_story_sessions")).ToJsonString());
        var second=p.DeepClone().AsObject();second["clientRequestId"]=EntityId.New();var responses=await Task.WhenAll(c.Clients[1].PostAsJsonAsync(path,p),c.Clients[1].PostAsJsonAsync(path,second));
        Assert.Single(responses,r=>r.StatusCode==HttpStatusCode.OK);Assert.Single(responses,r=>r.StatusCode==HttpStatusCode.Conflict);
        var current=await c.Snapshot(1);Assert.Equal(acceptor["myTrack"]!.Number("revision")+1,current["myTrack"]!.Number("revision"));Assert.True(JsonNode.DeepEquals(inviter["myTrack"],(await c.Snapshot(0))["myTrack"]));
        Assert.Equal("held-acceptor",current["world"]!["objects"]!.AsArray().Single(o=>o!.Text("id")=="order-tag-27")!.Text("state"));
        Assert.Single(await c.Platform.Sql("SELECT event_id FROM game_round_events WHERE kind='story.track.updated' AND json_extract(json_extract(payload_json,'$.requestPayload'),'$.params.optionId')='retrieve-tag'"));
        Assert.Empty(await c.Platform.Sql("SELECT * FROM game_round_events WHERE kind='message.committed'"));
    }
    [Fact]
    public async Task PartnerEventQuery_RedactsPrivatePresentationAndRoleDetails()
    {
        await using var c=new SceneTrackHttpContext();await c.Seed();await c.Send(0,"arrive-inviter");await c.Send(0,"inspect-slip");var events=(await c.Service.EventsAsync(c.Users[1],c.Round,0,null,100))["events"]!.AsArray();
        Assert.DoesNotContain("pickup-slip-27",events.ToJsonString());Assert.DoesNotContain(events,e=>e!.Text("type")=="story.track.updated");Assert.Contains(events,e=>e!.Text("type")=="room.snapshot_hint");
    }
    [Fact]
    public async Task SameSceneOwnAvatar_UsesCallerCurrentAdoption_AndEndedOrOutsiderCannotRead()
    {
        await using var c=new SceneTrackHttpContext();await c.Seed();await c.Platform.Sql("UPDATE user_profiles SET selected_avatar_ref='female-08' WHERE account_id=?",c.Users[0].AccountId);
        var path=$"/api/v1/game-rounds/{c.Round}/my-avatar";var response=await c.Clients[0].GetAsync(path);Assert.Equal(HttpStatusCode.OK,response.StatusCode);var own=(await response.Content.ReadFromJsonAsync<JsonObject>())!;Assert.Equal("female-08",own.Text("avatarAssetId"));Assert.Equal(5,own["expressions"]!.AsObject().Count);foreach(var image in own["expressions"]!.AsObject()){var url=image.Value!.Text("url");Assert.StartsWith(path+"/",url);var bytes=await c.Clients[0].GetAsync(url);Assert.Equal(HttpStatusCode.OK,bytes.StatusCode);Assert.Equal("image/webp",bytes.Content.Headers.ContentType!.MediaType);Assert.True((await bytes.Content.ReadAsByteArrayAsync()).Length>1000);}
        Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].GetAsync(path)).StatusCode);Assert.DoesNotContain("private/",own.ToJsonString());
        await c.Service.EndAsync(c.Users[1],c.Round);Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[0].GetAsync(path)).StatusCode);
    }

    [Fact]
    public async Task AcceptorRelogin_RestoresA02WhileInviterAndGlobalCursorHaveAdvanced()
    {
        await using var c=new SceneTrackHttpContext();await c.Seed();await c.Send(1,"arrive-acceptor");var own=await c.Snapshot(1);Assert.Equal("a02",own["myTrack"]!.Text("nodeId"));
        await c.Send(0,"arrive-inviter");await c.Send(0,"inspect-slip");await c.Send(0,"pick-slip");await c.Send(0,"move-inviter-counter");var current=await c.Snapshot(0);Assert.True(current.Number("eventSeq")>own.Number("eventSeq"));
        var before=(await c.Platform.Sql("SELECT * FROM game_story_participant_progress ORDER BY role")).ToJsonString();var sessionId=own.Text("storySessionId");
        var login=RealPlatform.Json((await c.Platform.App.Login("track-http-1@example.test",RealPlatform.Password,"android","127.0.0.1",default)).Body);
        c.Clients[1].DefaultRequestHeaders.Authorization=new("Bearer",login["tokens"]!.Text("accessToken"));var restored=await c.Snapshot(1);
        Assert.Equal(sessionId,restored.Text("storySessionId"));Assert.True(JsonNode.DeepEquals(own["myTrack"],restored["myTrack"]));Assert.Equal("shelves",restored["myTrack"]!.Text("areaId"));
        Assert.Contains(restored["availableEvents"]!.AsArray(),e=>e!.Text("bindingId").EndsWith(":inspect-bag"));Assert.DoesNotContain(restored["availableEvents"]!.AsArray(),e=>e!.Text("bindingId").EndsWith(":inspect-slip"));
        Assert.Equal(before,(await c.Platform.Sql("SELECT * FROM game_story_participant_progress ORDER BY role")).ToJsonString());Assert.Single(await c.Platform.Sql("SELECT * FROM game_story_sessions"));
    }

    [Fact]
    public async Task NextEpisode_HttpFreezesLatestSavedInterestsForBothActorsAndKeepsOriginalOffers()
    {
        await using var c=new SceneTrackHttpContext();await c.Seed(categories:3);var original=await c.Snapshot(0);var offers=original["offers"]!.AsArray();var romance=offers.Single(o=>o!.Text("title")=="浪漫")!.Text("categoryId");
        foreach(var actor in new[]{0,1})Assert.Equal(HttpStatusCode.OK,(await c.Clients[actor].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/vote",new{clientRequestId=EntityId.New(),episodeSeq=1,categoryId=romance})).StatusCode);
        await c.BeforeFinal();await c.Send(0,"final-exchange","rest_chat");await c.Send(1,"final-exchange","rest_chat");var frozenOriginal=(await c.Platform.Sql("SELECT story_offer_category_ids_json FROM game_rounds"))[0]!.Text("story_offer_category_ids_json");
        await c.Platform.Sql("UPDATE user_profiles SET interests_json=json_set(interests_json,'$.interestTagIds',json(?)) WHERE account_id=?",new JsonArray("puzzle").ToJsonString(),c.Users[1].AccountId);
        async Task Next(int actor){Assert.Equal(HttpStatusCode.OK,(await c.Clients[actor].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/next",new{clientRequestId=EntityId.New(),completedEpisodeSeq=1,agree=true})).StatusCode);}
        await Next(0);await c.Platform.Sql("UPDATE user_profiles SET interests_json=json_set(interests_json,'$.interestTagIds',json(?)) WHERE account_id=?",new JsonArray("puzzle").ToJsonString(),c.Users[0].AccountId);await Next(1);
        var second=await c.Snapshot(0);var other=await c.Snapshot(1);Assert.Equal(2,second.Number("episodeSeq"));Assert.Equal(new[]{"懸疑","旅程","浪漫"},second["offers"]!.AsArray().Select(o=>o!.Text("title")));Assert.True(JsonNode.DeepEquals(second["offers"],other["offers"]));Assert.DoesNotContain("interestTagIds",second.ToJsonString());
        await c.Platform.Sql("UPDATE user_profiles SET interests_json=json_set(interests_json,'$.interestTagIds',json(?)) WHERE account_id=?",new JsonArray("reading").ToJsonString(),c.Users[0].AccountId);Assert.True(JsonNode.DeepEquals(second["offers"],(await c.Snapshot(0))["offers"]));Assert.Equal(frozenOriginal,(await c.Platform.Sql("SELECT story_offer_category_ids_json FROM game_rounds"))[0]!.Text("story_offer_category_ids_json"));
        Assert.Equal("completed",(await c.Platform.Sql("SELECT chapter_status FROM game_story_sessions WHERE episode_seq=1"))[0]!.Text("chapter_status"));
    }

    [Theory][InlineData("main","pickup-slip-27","i-left")][InlineData("side","other-paper","i-right")]
    public async Task BranchAndDefinitionReuse_RealHttpPersistsOnlyChosenRouteAndRejoins(string purpose,string paper,string node)
    {
        await using var c=new SceneTrackHttpContext();await c.Seed(engineFixture:purpose);var initial=await c.Snapshot(0);var partner=await c.Snapshot(1);var entry=initial["availableEvents"]!.AsArray().Single(e=>e!.Text("bindingId").EndsWith(":arrive-inviter"))!;Assert.Equal(purpose=="main",entry["main"]!.GetValue<bool>());
        var payload=await c.Payload(0,"arrive-inviter",paper);var path=$"/api/v1/game-rounds/{c.Round}/story/event";var response=await c.Clients[0].PostAsJsonAsync(path,payload);Assert.Equal(HttpStatusCode.OK,response.StatusCode);var receipt=await response.Content.ReadAsStringAsync();var chosen=await c.Snapshot(0);Assert.Equal(node,chosen["myTrack"]!.Text("nodeId"));Assert.True(JsonNode.DeepEquals(partner["myTrack"],(await c.Snapshot(1))["myTrack"]));
        var row=(await c.Platform.Sql("SELECT event_id,event_version,state_json FROM game_event_instances WHERE binding_id=?",entry.Text("bindingId"))).Single()!;Assert.Equal(c.EngineFixture!["definition"]!.Text("eventId"),row.Text("event_id"));Assert.Equal(c.EngineFixture["definition"]!.Text("version"),row.Text("event_version"));
        var fact=JsonNode.Parse(row.Text("state_json"))!["submissions"]!["inviter"]!["inspect"]!;Assert.Equal(paper,fact["params"]!.Text("objectId"));Assert.Equal(node,fact.Text("nextNode"));
        var before=(await c.Platform.Sql("SELECT * FROM game_round_events")).ToJsonString();Assert.Equal(receipt,await(await c.Clients[0].PostAsJsonAsync(path,payload)).Content.ReadAsStringAsync());var other=payload.DeepClone().AsObject();other["clientRequestId"]=EntityId.New();other["params"]!["objectId"]=paper=="other-paper"?"pickup-slip-27":"other-paper";Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[0].PostAsJsonAsync(path,other)).StatusCode);Assert.Equal(before,(await c.Platform.Sql("SELECT * FROM game_round_events")).ToJsonString());
        await c.Send(0,"inspect-slip");Assert.Equal("i03",(await c.Snapshot(0))["myTrack"]!.Text("nodeId"));await c.Send(0,"pick-slip");await c.Send(0,"move-inviter-counter");Assert.Equal("counter",(await c.Snapshot(0))["myTrack"]!.Text("areaId"));Assert.True(JsonNode.DeepEquals(partner["myTrack"],(await c.Snapshot(1))["myTrack"]));
    }

    [Fact]
    public async Task BeforePrivateClueIsShared_AnswerProbesHaveTheSameSafeConflictAndNeverWrite()
    {
        await using var c=new SceneTrackHttpContext();await c.Seed();await c.BeforeFinal(stopBeforeShare:true);var snapshot=await c.Snapshot(0);var tables=new[]{"game_round_events","game_story_participant_progress","game_event_instances","game_story_sessions"};var before=new List<string>();foreach(var table in tables)before.Add((await c.Platform.Sql("SELECT * FROM "+table)).ToJsonString());
        foreach(var candidate in new[]{"book-wednesday","book-rain","unknown-book"}){
            var response=await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/event",new{clientRequestId=EntityId.New(),storySessionId=snapshot.Text("storySessionId"),bindingId=$"narrative:{snapshot.Text("storyId")}:pick-book",actionId="pick",@params=new{objectId=candidate},expectedTrackRevision=snapshot["myTrack"]!.Number("revision"),expectedSharedRevision=snapshot.Number("sharedRevision")});
            Assert.Equal(HttpStatusCode.Conflict,response.StatusCode);var problem=(await response.Content.ReadFromJsonAsync<JsonObject>())!;Assert.Equal("EVENT_STATE_CONFLICT",problem.Text("code"));Assert.DoesNotContain("book-rain",problem.ToJsonString());
        }
        for(var i=0;i<tables.Length;i++)Assert.Equal(before[i],(await c.Platform.Sql("SELECT * FROM "+tables[i])).ToJsonString());
        await c.Send(1,"share-order-clue");await c.Send(0,"read-shared-clue");await c.Send(0,"pick-book");Assert.Contains((await c.Snapshot(0))["world"]!["objects"]!.AsArray(),o=>o!.Text("id")=="book-rain"&&o!.Text("state")=="held-inviter");
    }
}
