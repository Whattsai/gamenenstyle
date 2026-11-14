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
    private sealed class Context:IAsyncDisposable
    {
        public readonly RealPlatform Platform=new(framework:true);public readonly ApiFixture Factory=new();
        public readonly List<CurrentUser> Users=[];public readonly List<HttpClient> Clients=[];public string Round="";
        public StoryDialogueService Service=>new(Platform,new CloudflareRoundRealtimeNotifier(Platform),new RateLimiter(Platform,Platform.Options,Platform.Clock));
        public Context(){Factory.AdditionalServices=services=>{services.RemoveAll<IPlatformClient>();services.AddSingleton<IPlatformClient>(Platform);services.RemoveAll<TimeProvider>();services.AddSingleton<TimeProvider>(Platform.Clock);services.RemoveAll<AuthOptions>();services.AddSingleton(Platform.Options);};}
        public async Task Seed(bool eventFixture=false,int eventProbability=1,bool linearFixture=false){
            var profiles=new List<string>();
            for(var n=0;n<3;n++){
                var email=$"framework-{n}@example.test";await Platform.Seed(true,email);var login=RealPlatform.Json((await Platform.App.Login(email,RealPlatform.Password,"android","127.0.0.1",default)).Body);
                var user=new CurrentUser(login["account"]!.Text("accountId"),login["session"]!.Text("sessionId"),1,Platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());Users.Add(user);
                var service=new DatingProfileService(Platform,Platform.Clock);await service.ReadAsync(user);profiles.Add((await Platform.Sql("SELECT profile_id FROM user_profiles WHERE account_id=?",user.AccountId))[0]!.Text("profile_id"));
                await service.SaveAsync(user,new(1,$"場景旅人{n}","喜歡閱讀",null,"1990-01-01",null,["warm"],["reading"],[],[],null,null,null,null,null,null,null,[],50,"diverse",["diverse"],new()));
                await Platform.ExecuteAsync("profile.avatar.builtin",new{accountId=user.AccountId,sessionId=user.SessionId,cv=1,accessExpiresAt=user.AccessExpiresAt,expectedRevision=2,avatarId="male-01"});
                var client=Factory.Native();client.DefaultRequestHeaders.Authorization=new("Bearer",login["tokens"]!.Text("accessToken"));Clients.Add(client);
            }
            if(eventFixture)await Platform.ExecuteAsync("$test-framework-events",new{probability=eventProbability});
            if(linearFixture)await Platform.ExecuteAsync("$test-framework-linear",new{});
            var matching=new MatchingSessionService(Platform,new MatchingCandidateProfileReader(Platform),new RateLimiter(Platform,Platform.Options,Platform.Clock),Platform.Clock);
            var invitation=await matching.InviteAsync(Users[0],profiles[1],EntityId.New());Round=(await matching.ResolveAsync(Users[1],invitation.Text("invitationId"),"accept")).Text("roundId");
        }
        public async Task<JsonObject> Action(int actor,string type,string choice,string? definition=null){
            var snapshot=await Service.ExperienceAsync(Users[actor],Round);var p=new JsonObject{["storySessionId"]=snapshot["storySessionId"]!.DeepClone(),["episodeSeq"]=snapshot["episodeSeq"]!.DeepClone(),["nodeId"]=snapshot["currentNode"]!["id"]!.DeepClone(),["expectedRevision"]=snapshot["progressRevision"]!.DeepClone(),["choiceId"]=choice};if(definition is not null)p["definitionId"]=definition;
            return await Service.CommandAsync(Users[actor],Round,type,EntityId.New(),p);
        }
        public async ValueTask DisposeAsync(){foreach(var c in Clients)c.Dispose();Factory.Dispose();await Platform.DisposeAsync();}
    }

    [Theory][InlineData(true,"ending-together")][InlineData(false,"ending-two-pages")]
    public async Task FirstStory_TwoRealPlayersCompleteAndConsentStartsExactlyOneNewPinnedEpisode(bool same,string ending)
    {
        await using var c=new Context();await c.Seed();var first=await c.Service.ExperienceAsync(c.Users[0],c.Round);
        Assert.Equal("playing",first.Text("phase"));Assert.Equal("rain-bookshop-lost-note",first.Text("storyId"));Assert.NotNull(first["scenePresentation"]);Assert.NotNull(first["audioCues"]);
        await c.Action(0,"interaction.submit","back","bookmark");await c.Action(0,"story.choice.submit","enter");await c.Action(1,"story.choice.submit","browse");await c.Action(0,"story.choice.submit","stay");await c.Action(0,"story.choice.submit","choose");
        await c.Action(0,"interaction.submit","warm","reading-path");var waiting=await c.Service.ExperienceAsync(c.Users[1],c.Round);Assert.True(waiting["interaction"]!["partnerHasSubmitted"]!.GetValue<bool>());Assert.Null(waiting["interaction"]!["myChoice"]);
        await c.Action(1,"interaction.submit",same?"warm":"adventure","reading-path");var complete=await c.Service.ExperienceAsync(c.Users[0],c.Round);
        Assert.Equal("completed",complete.Text("phase"));Assert.Equal(ending,complete["currentNode"]!.Text("id"));Assert.Empty(complete["objects"]!.AsArray());Assert.Null(complete["interaction"]);
        await c.Service.CommandAsync(c.Users[0],c.Round,"message.send",EntityId.New(),new(){["text"]="這章完了，還想和你聊聊。"});
        var request=EntityId.New();var body=new{clientRequestId=request,completedEpisodeSeq=1,agree=true};
        Assert.Equal(HttpStatusCode.OK,(await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/next",body)).StatusCode);
        var consent=await c.Service.ExperienceAsync(c.Users[0],c.Round);Assert.True(consent["myAgreedNext"]!.GetValue<bool>());Assert.False(consent["partnerAgreedNext"]!.GetValue<bool>());
        Assert.Equal(HttpStatusCode.OK,(await c.Clients[1].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/next",new{clientRequestId=EntityId.New(),completedEpisodeSeq=1,agree=true})).StatusCode);
        Assert.Equal(HttpStatusCode.OK,(await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/next",body)).StatusCode);
        var second=await c.Service.ExperienceAsync(c.Users[0],c.Round);Assert.Equal(2,second.Number("episodeSeq"));Assert.Equal("entry",second["currentNode"]!.Text("id"));Assert.NotEqual(first.Text("storySessionId"),second.Text("storySessionId"));
        Assert.Equal(2,(await c.Platform.Sql("SELECT * FROM game_story_sessions")).Count);Assert.Single((await c.Service.EventsAsync(c.Users[1],c.Round,0,null,100))["events"]!.AsArray(),e=>e!.Text("type")=="message.committed");
        Assert.DoesNotContain("manifest.json",second.ToJsonString());Assert.DoesNotContain("triggerConditions",second.ToJsonString());
    }

    [Fact]
    public async Task LinearTwoNodeNarrative_OneEndingCompletesWithoutInventingAnEventAndCanReplay()
    {
        await using var c=new Context();await c.Seed(linearFixture:true);var snapshot=await c.Service.ExperienceAsync(c.Users[0],c.Round);Assert.Equal("playing",snapshot.Text("phase"));Assert.Empty(snapshot["events"]!.AsArray());Assert.Null(snapshot["interaction"]);
        var payload=new JsonObject{["storySessionId"]=snapshot["storySessionId"]!.DeepClone(),["episodeSeq"]=1,["nodeId"]="entry",["expectedRevision"]=snapshot["progressRevision"]!.DeepClone(),["choiceId"]="finish"};var request=EntityId.New();var receipt=await c.Service.CommandAsync(c.Users[0],c.Round,"story.choice.submit",request,payload);
        var completed=await c.Clients[1].GetFromJsonAsync<JsonObject>($"/api/v1/game-rounds/{c.Round}/experience");Assert.NotNull(completed);Assert.Equal("completed",completed.Text("phase"));Assert.Equal("ending-only",completed["currentNode"]!.Text("id"));Assert.Empty(await c.Platform.Sql("SELECT * FROM game_event_instances"));Assert.Empty(await c.Platform.Sql("SELECT * FROM game_scene_visits WHERE left_at IS NULL"));
        Assert.True(JsonNode.DeepEquals(receipt,await c.Service.CommandAsync(c.Users[0],c.Round,"story.choice.submit",request,payload)));Assert.Single(await c.Platform.Sql("SELECT * FROM game_round_events WHERE kind='chapter.completed'"));
        await c.Service.CommandAsync(c.Users[1],c.Round,"message.send",EntityId.New(),new(){["text"]="單一收尾後仍可聊天。"});foreach(var actor in new[]{0,1})Assert.Equal(HttpStatusCode.OK,(await c.Clients[actor].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/next",new{clientRequestId=EntityId.New(),completedEpisodeSeq=1,agree=true})).StatusCode);
        var next=await c.Clients[0].GetFromJsonAsync<JsonObject>($"/api/v1/game-rounds/{c.Round}/experience");Assert.NotNull(next);Assert.Equal(2,next.Number("episodeSeq"));Assert.Equal("entry",next["currentNode"]!.Text("id"));Assert.Equal("rain-bookshop",next.Text("sceneId"));Assert.Equal("rain-bookshop-lost-note",next.Text("storyId"));Assert.Equal("v50",next.Text("version"));Assert.Equal(snapshot.Text("selectedCategoryId"),next.Text("selectedCategoryId"));Assert.Single((await c.Service.EventsAsync(c.Users[0],c.Round,0,null,100))["events"]!.AsArray(),e=>e!.Text("type")=="message.committed");
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

    [Theory][InlineData(false,1)][InlineData(true,1)][InlineData(false,0)]
    public async Task HiddenSceneAndGlobalEvents_UseCommittedConditionsAndPersistDrawsThenSealOrRespectRoundRepeat(bool completeGlobal,int probability)
    {
        await using var c=new Context();await c.Seed(eventFixture:true,eventProbability:probability);
        var initial=await c.Service.ExperienceAsync(c.Users[0],c.Round);Assert.Empty(initial["events"]!.AsArray());Assert.Empty(initial["objects"]!.AsArray());Assert.Empty(initial["scenePresentation"]!["hotspots"]!.AsArray());Assert.Empty(await c.Platform.Sql("SELECT * FROM game_event_instances"));Assert.DoesNotContain("global-note",initial.ToJsonString());Assert.DoesNotContain("翻看手寫書籤",initial.ToJsonString());
        async Task<HttpResponseMessage> Event(string binding){var s=await c.Service.ExperienceAsync(c.Users[0],c.Round);return await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/event",new{clientRequestId=EntityId.New(),storySessionId=s.Text("storySessionId"),expectedRevision=s.Number("progressRevision"),bindingId=binding,actionId="back"});}
        Assert.Equal(HttpStatusCode.Conflict,(await Event("global:global:global-note")).StatusCode);Assert.Empty(await c.Platform.Sql("SELECT * FROM game_event_instances"));
        await c.Action(0,"story.choice.submit","enter");var unlocked=await c.Service.ExperienceAsync(c.Users[0],c.Round);
        if(probability==0){
            Assert.Empty(unlocked["events"]!.AsArray());var cursor=unlocked.Number("eventSeq");Assert.Equal(cursor,(await c.Service.ExperienceAsync(c.Users[1],c.Round)).Number("eventSeq"));
            Assert.Single(await c.Platform.Sql("SELECT * FROM game_event_instances WHERE status='cancelled'"));Assert.Equal(HttpStatusCode.Conflict,(await Event("scene:rain-bookshop:bookmark")).StatusCode);
            Assert.DoesNotContain("global-note",(await c.Service.EventsAsync(c.Users[0],c.Round,0,null,100)).ToJsonString());
        }else{
            Assert.Single(unlocked["events"]!.AsArray());Assert.Equal("scene:rain-bookshop:bookmark",unlocked["events"]![0]!.Text("bindingId"));Assert.DoesNotContain("global-note",unlocked.ToJsonString());
            Assert.Equal(HttpStatusCode.Conflict,(await Event("global:global:global-note")).StatusCode);Assert.Equal(HttpStatusCode.OK,(await Event("scene:rain-bookshop:bookmark")).StatusCode);
            var global=await c.Service.ExperienceAsync(c.Users[1],c.Round);Assert.Contains(global["events"]!.AsArray(),e=>e!.Text("bindingId")=="global:global:global-note");Assert.DoesNotContain("triggerConditions",global.ToJsonString());Assert.DoesNotContain("contentPins",global.ToJsonString());
            if(completeGlobal)Assert.Equal(HttpStatusCode.OK,(await Event("global:global:global-note")).StatusCode);
        }
        await c.Action(1,"story.choice.submit","browse");await c.Action(0,"story.choice.submit","stay");await c.Action(0,"story.choice.submit","choose");await c.Action(0,"interaction.submit","warm","reading-path");await c.Action(1,"interaction.submit","adventure","reading-path");
        Assert.Equal("completed",(await c.Service.ExperienceAsync(c.Users[1],c.Round)).Text("phase"));Assert.Empty(await c.Platform.Sql("SELECT * FROM game_event_instances WHERE status='active'"));Assert.Empty(await c.Platform.Sql("SELECT * FROM game_scene_visits WHERE left_at IS NULL"));var sealedEvents=(await c.Platform.Sql("SELECT * FROM game_round_events")).Count;Assert.Equal(HttpStatusCode.Conflict,(await Event("global:global:global-note")).StatusCode);Assert.Equal(sealedEvents,(await c.Platform.Sql("SELECT * FROM game_round_events")).Count);
        if(completeGlobal){
            foreach(var actor in new[]{0,1})Assert.Equal(HttpStatusCode.OK,(await c.Clients[actor].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/next",new{clientRequestId=EntityId.New(),completedEpisodeSeq=1,agree=true})).StatusCode);
            await c.Action(0,"story.choice.submit","enter");Assert.Equal(HttpStatusCode.OK,(await Event("scene:rain-bookshop:bookmark")).StatusCode);var second=await c.Service.ExperienceAsync(c.Users[0],c.Round);Assert.Equal(2,second.Number("episodeSeq"));Assert.DoesNotContain(second["events"]!.AsArray(),e=>e!.Text("bindingId")=="global:global:global-note");
            Assert.Single(await c.Platform.Sql("SELECT * FROM game_event_instances WHERE binding_id='global:global:global-note' AND status='completed'"));
            var inspections=await c.Platform.Sql("SELECT story_session_id FROM game_event_instances WHERE binding_id='scene:rain-bookshop:bookmark' AND status='completed'");Assert.Equal(2,inspections.Count);Assert.Equal(2,inspections.Select(i=>i!.Text("story_session_id")).Distinct().Count());
            Assert.Equal(HttpStatusCode.OK,(await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/end",new{})).StatusCode);
            var matching=new MatchingSessionService(c.Platform,new MatchingCandidateProfileReader(c.Platform),new RateLimiter(c.Platform,c.Platform.Options,c.Platform.Clock),c.Platform.Clock);var target=(await c.Platform.Sql("SELECT profile_id FROM user_profiles WHERE account_id=?",c.Users[2].AccountId)).Single()!.Text("profile_id");var invite=await matching.InviteAsync(c.Users[0],target,EntityId.New());c.Round=(await matching.ResolveAsync(c.Users[2],invite.Text("invitationId"),"accept")).Text("roundId");
            await c.Action(0,"story.choice.submit","enter");Assert.Equal(HttpStatusCode.OK,(await Event("scene:rain-bookshop:bookmark")).StatusCode);Assert.Contains((await c.Service.ExperienceAsync(c.Users[2],c.Round))["events"]!.AsArray(),e=>e!.Text("bindingId")=="global:global:global-note");
        }
    }

    [Fact]
    public async Task GenericEventHttp_UsesTheActiveSceneBindingAndRecoversOnlyTheOriginalPayload()
    {
        await using var c=new Context();await c.Seed();var snapshot=await c.Service.ExperienceAsync(c.Users[0],c.Round);
        var payload=new JsonObject{["clientRequestId"]=EntityId.New(),["storySessionId"]=snapshot["storySessionId"]!.DeepClone(),["bindingId"]="scene:rain-bookshop:bookmark",["actionId"]="back",["expectedRevision"]=snapshot["progressRevision"]!.DeepClone()};
        var path=$"/api/v1/game-rounds/{c.Round}/story/event";
        var response=await c.Clients[0].PostAsJsonAsync(path,payload);Assert.Equal(HttpStatusCode.OK,response.StatusCode);
        var receipt=await response.Content.ReadFromJsonAsync<JsonObject>();
        response=await c.Clients[0].PostAsJsonAsync(path,payload);Assert.Equal(HttpStatusCode.OK,response.StatusCode);
        Assert.True(JsonNode.DeepEquals(receipt,await response.Content.ReadFromJsonAsync<JsonObject>()));
        var changed=payload.DeepClone().AsObject();changed["actionId"]="other";Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[0].PostAsJsonAsync(path,changed)).StatusCode);
        payload["clientRequestId"]=EntityId.New();Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[1].PostAsJsonAsync(path,payload)).StatusCode);
        Assert.Single(await c.Platform.Sql("SELECT event_instance_id FROM game_event_instances WHERE binding_id='scene:rain-bookshop:bookmark' AND status='completed'"));
        Assert.Equal("playing",(await c.Service.ExperienceAsync(c.Users[0],c.Round)).Text("phase"));
    }

    [Fact]
    public async Task FrameworkEndpoints_RejectOutsidersArbitraryEffectsAndServerOwnedTransitions()
    {
        await using var c=new Context();await c.Seed();
        foreach(var suffix in new[]{"story/next","story/event"})Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/{suffix}",new{clientRequestId=EntityId.New()})).StatusCode);
        var snapshot=await c.Service.ExperienceAsync(c.Users[0],c.Round);
        var response=await c.Clients[0].PostAsJsonAsync($"/api/v1/game-rounds/{c.Round}/story/event",new{clientRequestId=EntityId.New(),storySessionId=snapshot.Text("storySessionId"),bindingId="narrative:rain-bookshop-lost-note:bookmark",actionId="back",expectedRevision=snapshot.Number("progressRevision"),nextNodeId="ending-together",presentationEffects=new{expressionId="smile"}});
        Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);Assert.Equal("playing",(await c.Service.ExperienceAsync(c.Users[0],c.Round)).Text("phase"));
    }
}
