using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DatingHigh.Domain;
using DatingHigh.Application;
using DatingHigh.Integration.Tests;

namespace DatingHigh.Api.Tests;

/// <summary>正式 V3 資料經 HTTP／Application／真 Miniflare D1 與 R2，不代表人工試玩。</summary>
public sealed class SceneEventV3EndpointTests(V3StoryPlatform fixture):IClassFixture<V3StoryPlatform>
{
    [Fact]
    public async Task PublishedClerk_HasOpaqueHitMasks_AndOnlyTheActorChoosesNpcDialogue()
    {
        await using var c=new SceneTrackHttpContext(platform:fixture.Platform);await c.Seed();await c.Send(0,"iv3-enter");await c.Send(0,"iv3-browse");await c.Send(0,"iv3-book","growth");await c.Send(0,"iv3-walk","counter");
        var before=await c.Snapshot(0);var clerk=before["stage"]!["npcs"]!.AsArray().Single(n=>n!.Text("id")=="clerk")!;Assert.Equal(10,clerk["hitMasks"]!.AsArray().Count);Assert.DoesNotContain("whenFlagEquals",before["stage"]!.ToJsonString());
        await c.Send(0,"iv3-clerk");var reply=await c.Snapshot(0);Assert.Equal("iv3-clerk",reply["myTrack"]!.Text("nodeId"));Assert.Contains(reply["currentNode"]!["lines"]!.AsArray(),line=>line!.Text("speaker")=="店員・NPC");
        Assert.Empty(await c.Platform.Sql("SELECT * FROM game_round_events WHERE round_id=? AND kind='message.committed'",c.Round));Assert.Equal("av3-01",(await c.Snapshot(1))["myTrack"]!.Text("nodeId"));
    }
    private static async Task Opening(SceneTrackHttpContext c,bool decline=false,bool stopBeforeWeather=false)
    {
        await c.Seed();var initial=await c.Snapshot(0);Assert.Equal("rain-bookshop-before-rain-stops",initial.Text("storyId"));Assert.Equal("iv3-01",initial["myTrack"]!.Text("nodeId"));Assert.Equal("av3-01",(await c.Snapshot(1))["myTrack"]!.Text("nodeId"));
        await c.Send(0,"iv3-enter");await c.Send(0,"iv3-browse");await c.Send(0,"iv3-book","growth");
        await c.Send(1,"av3-enter");await c.Send(1,"av3-browse");await c.Send(1,"av3-book","family");await c.Send(1,"av3-resonance","family-memory");
        var inviter=await c.Snapshot(0);Assert.DoesNotContain("family-memory",inviter.ToJsonString());Assert.DoesNotContain(inviter["knownClues"]!.AsArray(),v=>v!.Text("id")=="own-book-family");
        await c.Send(1,"av3-walk","reading-corner");await c.Send(1,"av3-sit");await c.Send(1,"av3-read");
        if(decline){await c.Send(0,"iv3-walk","reading-corner");await c.Send(0,"iv3-notice");await c.Send(0,"iv3-pause");await c.Send(0,"iv3-approach");await c.Send(0,"iv3-greeting","tissue");await c.Send(1,"av3-see-greeting");await c.Send(1,"av3-response","decline");await c.Send(0,"iv3-understand","respect");}
        if(!stopBeforeWeather){await c.Send(0,"sv3-weather");await c.Send(1,"sv3-weather");}
    }
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task ARealPartnerCommit_BetweenEvaluationAndD1Commit_RejectsTheStaleConversation(bool areaRace)
    {
        await using var c=new SceneTrackHttpContext(platform:fixture.Platform);await Opening(c,stopBeforeWeather:true);
        var binding=areaRace?"iv3-greeting":"iv3-clerk";
        if(areaRace){await c.Send(0,"iv3-walk","reading-corner");await c.Send(0,"iv3-notice");await c.Send(0,"iv3-pause");await c.Send(0,"iv3-approach");}
        else await c.Send(0,"iv3-walk","counter");
        var payload=await c.Payload(0,binding,areaRace?"concern":null);var own=(await c.Snapshot(0))["myTrack"]!.DeepClone();
        c.BeforeActionCommit=()=>c.Send(1,areaRace?"av3-walk":"sv3-weather",areaRace?"shelves":null);
        var response=await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/event",payload);Assert.Equal(HttpStatusCode.Conflict,response.StatusCode);
        Assert.True(JsonNode.DeepEquals(own,(await c.Snapshot(0))["myTrack"]));
        Assert.Empty(await c.Platform.Sql("SELECT * FROM game_round_events WHERE round_id=? AND client_request_id=?",c.Round,payload.Text("clientRequestId")));
        Assert.Empty(await c.Platform.Sql("SELECT * FROM game_event_instances WHERE story_session_id=? AND binding_id=?",payload.Text("storySessionId"),payload.Text("bindingId")));
    }
    [Theory]
    [InlineData("iv3-greeting")]
    [InlineData("iv3-clerk")]
    public async Task RainChange_ClosesAPreviouslyAvailableOptionalConversation(string binding)
    {
        await using var c=new SceneTrackHttpContext(platform:fixture.Platform);await Opening(c,stopBeforeWeather:true);
        if(binding=="iv3-greeting"){
            await c.Send(0,"iv3-walk","reading-corner");await c.Send(0,"iv3-notice");await c.Send(0,"iv3-pause");await c.Send(0,"iv3-approach");
        }else await c.Send(0,"iv3-walk","counter");
        Assert.Contains((await c.Snapshot(0))["availableEvents"]!.AsArray(),e=>e!.Text("bindingId").EndsWith(":"+binding));
        await c.Send(0,"sv3-weather");await c.Send(1,"sv3-weather");var raining=await c.Snapshot(0);
        Assert.Equal("heavy",raining["world"]!["flags"]!.Text("rainfall"));Assert.DoesNotContain(raining["availableEvents"]!.AsArray(),e=>e!.Text("bindingId").EndsWith(":"+binding));
    }
    [Theory]
    [InlineData("concern","open-up","listen")]
    [InlineData("book","books-only","books")]
    [InlineData("tissue","decline","respect")]
    public async Task Greeting_UsesOnlyTheChosenShot_AndTissueIsIndependentOfConversation(string greeting,string response,string acknowledgment)
    {
        await using var c=new SceneTrackHttpContext(platform:fixture.Platform);await Opening(c,stopBeforeWeather:true);await c.Send(0,"iv3-walk","reading-corner");
        await c.Send(1,"av3-walk","shelves");Assert.DoesNotContain((await c.Snapshot(0))["availableEvents"]!.AsArray(),e=>e!.Text("bindingId").EndsWith(":iv3-notice"));await c.Send(1,"av3-walk","reading-corner");
        await c.Send(0,"iv3-notice");await c.Send(0,"iv3-pause");await c.Send(0,"iv3-approach");await c.Send(0,"iv3-greeting",greeting);
        var offered=await c.Snapshot(1);Assert.DoesNotContain(offered["availableEvents"]!.AsArray(),e=>e!.Text("bindingId").EndsWith(":av3-response"));await c.Send(1,"av3-see-greeting");
        var seen=await c.Snapshot(1);Assert.Equal("sh-greeting-"+greeting,seen["stage"]!.Text("currentShotId"));
        foreach(var other in new[]{"concern","tissue","book"}.Where(g=>g!=greeting))Assert.DoesNotContain("sh-greeting-"+other,seen["stage"]!.ToJsonString());
        if(greeting=="tissue"){
            await c.Send(1,"av3-tissue","accept-tissue");var accepted=await c.Snapshot(1);Assert.Contains(accepted["world"]!["objects"]!.AsArray(),o=>o!.Text("id")=="tissue"&&o!.Text("state")=="accepted");
            Assert.Contains(accepted["availableEvents"]!.AsArray(),e=>e!.Text("bindingId").EndsWith(":av3-response")&&e!["actions"]!.AsArray().Any(a=>a!["params"]!.Text("optionId")=="decline"));
        }
        await c.Send(1,"av3-response",response);var known=await c.Snapshot(0);var understand=known["availableEvents"]!.AsArray().Single(e=>e!.Text("bindingId").EndsWith(":iv3-understand"))!;
        Assert.Equal(acknowledgment,understand["actions"]!.AsArray().Single()!["params"]!.Text("optionId"));await c.Send(0,"iv3-understand",acknowledgment);
        Assert.Empty(await c.Platform.Sql("SELECT * FROM game_round_events WHERE round_id=? AND kind='message.committed'",c.Round));
    }
    private static async Task BeforeWish(SceneTrackHttpContext c,bool stopBeforeFind=false)
    {
        foreach(var actor in new[]{0,1}){var prefix=actor==0?"iv3":"av3";if((await c.Snapshot(actor))["myTrack"]!.Text("areaId")=="reading-corner")await c.Send(actor,prefix+"-walk","shelves");await c.Send(actor,prefix+"-walk","safe-storage");await c.Send(actor,prefix+"-safety");}
        await c.Send(0,"sv3-help");await c.Send(1,"sv3-help");
        await c.Send(1,"av3-list");Assert.DoesNotContain((await c.Snapshot(0))["knownClues"]!.AsArray(),v=>v!.Text("id")=="private-list");
        await c.Send(1,"av3-share-list");Assert.Contains((await c.Snapshot(0))["knownClues"]!.AsArray(),v=>v!.Text("id")=="shared-list");
        await c.Send(0,"iv3-walk","shelves");if(stopBeforeFind)return;await c.Send(0,"iv3-find");await c.Send(0,"iv3-pick");await c.Send(0,"iv3-walk","safe-storage");await c.Send(0,"iv3-box");await c.Send(1,"av3-check");await c.Send(1,"av3-pick-box");await c.Send(1,"av3-store");
        foreach(var actor in new[]{0,1}){var prefix=actor==0?"iv3":"av3";await c.Send(actor,prefix+"-walk","counter");await c.Send(actor,prefix+"-walk","window");await c.Send(actor,prefix+"-coffee");await c.Send(actor,prefix+"-recommend",actor==0?"growth":"family");}
    }
    [Theory]
    [InlineData("keep-talking","keep-talking","ev3-01-more-talk")]
    [InlineData("keep-talking","share-books","ev3-02-book-recommendation")]
    [InlineData("keep-talking","quiet-rest","ev3-03-gentle-distance")]
    [InlineData("share-books","keep-talking","ev3-02-book-recommendation")]
    [InlineData("share-books","share-books","ev3-02-book-recommendation")]
    [InlineData("share-books","quiet-rest","ev3-03-gentle-distance")]
    [InlineData("quiet-rest","keep-talking","ev3-03-gentle-distance")]
    [InlineData("quiet-rest","share-books","ev3-03-gentle-distance")]
    [InlineData("quiet-rest","quiet-rest","ev3-03-gentle-distance")]
    public async Task RealStory_FinalWishesCommitOneEnding_WithoutAutomaticChat(string inviter,string acceptor,string ending)
    {
        await using var c=new SceneTrackHttpContext(platform:fixture.Platform);await Opening(c,decline:inviter=="quiet-rest");await BeforeWish(c);
        await c.Send(0,"sv3-final-wish",inviter);var waiting=await c.Snapshot(1);Assert.Equal("playing",waiting.Text("chapterStatus"));
        var payload=await c.Payload(1,"sv3-final-wish",acceptor);var response=await c.Clients[1].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/event",payload);Assert.Equal(HttpStatusCode.OK,response.StatusCode);
        var completed=await c.Snapshot(0);Assert.Equal("completed",completed.Text("chapterStatus"));Assert.Equal(ending,completed.Text("endingId"));Assert.Equal(ending,(await c.Snapshot(1)).Text("endingId"));
        Assert.Empty(await c.Platform.Sql("SELECT * FROM game_round_events WHERE kind='message.committed'"));Assert.Single(await c.Platform.Sql("SELECT * FROM game_round_events WHERE round_id=? AND kind='chapter.completed'",c.Round));
        var before=(await c.Platform.Sql("SELECT * FROM game_round_events")).ToJsonString();Assert.Equal(HttpStatusCode.OK,(await c.Clients[1].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/event",payload)).StatusCode);Assert.Equal(before,(await c.Platform.Sql("SELECT * FROM game_round_events")).ToJsonString());
    }
    [Fact]
    public async Task CompletedPresentation_UsesThePublishedEndingShotCamera_AfterReload()
    {
        await using var c=new SceneTrackHttpContext(platform:fixture.Platform);await Opening(c);await BeforeWish(c);
        await c.Send(0,"sv3-final-wish","keep-talking");await c.Send(1,"sv3-final-wish","keep-talking");
        foreach(var actor in new[]{0,1}){
            var snapshot=await c.Snapshot(actor);var stage=snapshot["stage"]!;
            var shot=stage["shots"]!.AsArray().Single(s=>s!.Text("id")==stage.Text("currentShotId"))!;
            Assert.Equal("coffee-talk",shot.Text("cameraId"));Assert.Equal(shot.Text("cameraId"),snapshot["currentNode"]!["presentation"]!.Text("cameraId"));
        }
    }
    [Fact]
    public async Task WrongSharedListComparison_DoesNotCompleteFindOrMoveTheBook_AndCanRecover()
    {
        await using var c=new SceneTrackHttpContext(platform:fixture.Platform);await Opening(c);await BeforeWish(c,stopBeforeFind:true);
        var before=await c.Snapshot(0);await c.Send(0,"iv3-find","try-love");var wrong=await c.Snapshot(0);Assert.Equal("iv3-recheck",wrong["myTrack"]!.Text("nodeId"));Assert.True(JsonNode.DeepEquals(before["world"],wrong["world"]));
        Assert.Equal("active",(await c.Platform.Sql("SELECT status FROM game_event_instances WHERE story_session_id=? AND binding_id LIKE '%:iv3-find'",wrong.Text("storySessionId"))).Single()!.Text("status"));
        await c.Send(0,"iv3-find","compare");Assert.Equal("iv3-07",(await c.Snapshot(0))["myTrack"]!.Text("nodeId"));await c.Send(0,"iv3-pick");Assert.Contains((await c.Snapshot(0))["world"]!["objects"]!.AsArray(),o=>o!.Text("id")=="book-growth"&&o!.Text("state")=="held"&&o!.Text("holderRole")=="inviter");
    }
    [Fact]
    public async Task DangerExit_OverridesUnfinishedCooperation_AndDoesNotServeCoffee()
    {
        await using var c=new SceneTrackHttpContext(platform:fixture.Platform);await Opening(c);await c.Send(0,"sv3-water-warning");
        foreach(var actor in new[]{0,1}){var s=await c.Snapshot(actor);Assert.Equal("completed",s.Text("chapterStatus"));Assert.Equal("safety-exit",s.Text("endingId"));Assert.All(s["world"]!["objects"]!.AsArray().Where(o=>o!.Text("id").StartsWith("coffee-")),o=>Assert.Equal("not-served",o!.Text("state")));}
        Assert.Empty(await c.Platform.Sql("SELECT * FROM game_round_events WHERE kind='message.committed'"));
    }
}

public sealed class V3StoryPlatform:IAsyncLifetime
{
    internal readonly RealPlatform Platform=new(tracks:true,storyV3:true);
    public Task InitializeAsync()=>Task.CompletedTask;
    public async Task DisposeAsync()=>await Platform.DisposeAsync();
}
