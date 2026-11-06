using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
using DatingHigh.Integration.Tests;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DatingHigh.Api.Tests;

// HTTP 與真正 Application／Miniflare D1 串接，DB 每次在獨立測試 namespace 新建，無公開 SQL endpoint。
public sealed class MatchingRealD1Tests
{
    private sealed class Context: IAsyncDisposable
    {
        public readonly RealPlatform Platform=new();
        public readonly ApiFixture Factory=new();
        public readonly List<CurrentUser> Users=[];
        public readonly List<string> Profiles=[];
        public readonly List<HttpClient> Clients=[];
        public Context(){Factory.AdditionalServices=services=>{
            services.RemoveAll<IPlatformClient>();services.AddSingleton<IPlatformClient>(Platform);
            services.RemoveAll<TimeProvider>();services.AddSingleton<TimeProvider>(Platform.Clock);
            services.RemoveAll<AuthOptions>();services.AddSingleton(Platform.Options);
        };}
        public async Task Seed(int count=3)
        {
            for(var n=0;n<count;n++){
                var email=$"matching-{n}@example.test";await Platform.Seed(true,email);
                var login=RealPlatform.Json((await Platform.App.Login(email,RealPlatform.Password,"android","127.0.0.1",default)).Body);
                var u=new CurrentUser(login["account"]!.Text("accountId"),login["session"]!.Text("sessionId"),1,Platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());Users.Add(u);
                var profiles=new DatingProfileService(Platform,Platform.Clock);await profiles.ReadAsync(u);Profiles.Add((await Platform.Sql("SELECT profile_id FROM user_profiles WHERE account_id=?",u.AccountId))[0]!.Text("profile_id"));
                await profiles.SaveAsync(u,Form(1));
                await Platform.ExecuteAsync("profile.avatar.builtin",new{accountId=u.AccountId,sessionId=u.SessionId,cv=1,accessExpiresAt=u.AccessExpiresAt,expectedRevision=2,avatarId="male-01"});
                var client=Factory.Native();client.DefaultRequestHeaders.Authorization=new("Bearer",login["tokens"]!.Text("accessToken"));Clients.Add(client);
            }
        }
        public async Task<JsonObject> Search(int n,int offset=0,int limit=20){var r=await Clients[n].PostAsJsonAsync("/api/v1/match-candidates/search",new{offset,limit});Assert.Equal(HttpStatusCode.OK,r.StatusCode);return (await r.Content.ReadFromJsonAsync<JsonObject>())!;}
        public async Task<JsonObject> Invite(int from,int to,string? request=null){var r=await Clients[from].PostAsJsonAsync("/api/v1/match-invitations",new{candidateId=Profiles[to],clientRequestId=request??EntityId.New()});Assert.True(r.IsSuccessStatusCode,$"Invitation status {(int)r.StatusCode}");return (await r.Content.ReadFromJsonAsync<JsonObject>())!;}
        public async Task<JsonObject> Resolve(int n,string id,string action){var r=await Clients[n].PostAsJsonAsync($"/api/v1/match-invitations/{id}/{action}",new{});Assert.Equal(HttpStatusCode.OK,r.StatusCode);return (await r.Content.ReadFromJsonAsync<JsonObject>())!;}
        public async ValueTask DisposeAsync(){foreach(var c in Clients)c.Dispose();Factory.Dispose();await Platform.DisposeAsync();}
    }
    private static ProfileUpdateInput Form(long revision)=>new(revision,"星河旅人","喜歡散步","工程師","1990-01-01","TW-TPE",["warm"],["coffee"],["daily_chat"],["kindness"],"explore","early_bird","warm","daily","friends_first",null,null,[],50,"diverse",["male","female","diverse"],new());
    private static async Task<JsonObject> Json(HttpResponseMessage r)=>(await r.Content.ReadFromJsonAsync<JsonObject>())!;
    [Fact]
    public async Task MS_API_017_018_019_022_023_025_026_027_RealThreePlayers_RequireMutualConsentAndHidePrivateFields()
    {
        await using var c=new Context();await c.Seed();
        Assert.Equal(2,(await c.Search(0))["items"]!.AsArray().Count);
        var request=EntityId.New();var ab=await c.Invite(0,1,request);var id=ab.Text("invitationId");
        Assert.Equal(id,(await c.Invite(0,1,request)).Text("invitationId"));
        Assert.Empty((await c.Platform.Sql("SELECT * FROM game_rounds")));
        var list=await Json(await c.Clients[1].GetAsync("/api/v1/match-invitations"));Assert.Single(list["incoming"]!.AsArray());
        var text=list.ToJsonString();foreach(var forbidden in new[]{"occupation","birthDate","romanticOrientation","preferredAge","object_key","account_id","email"})Assert.DoesNotContain(forbidden,text);
        Assert.Empty((await Json(await c.Clients[2].GetAsync("/api/v1/match-invitations")))["incoming"]!.AsArray());
        Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].PostAsJsonAsync($"/api/v1/match-invitations/{id}/accept",new{})).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[0].PostAsJsonAsync($"/api/v1/match-invitations/{id}/accept",new{})).StatusCode);
        await c.Invite(2,0);var accepted=await c.Resolve(1,id,"accept");var round=accepted.Text("roundId");
        foreach(var n in new[]{0,1}){
            var own=await Json(await c.Clients[n].GetAsync("/api/v1/game-rounds"));Assert.Equal(round,Assert.Single(own["items"]!.AsArray())!.Text("roundId"));
            Assert.Equal(round,(await Json(await c.Clients[n].GetAsync("/api/v1/game-rounds/"+round))).Text("roundId"));
        }
        Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[2].GetAsync("/api/v1/game-rounds/"+round)).StatusCode);
        Assert.Empty((await c.Search(2))["items"]!.AsArray());
        Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[2].PostAsJsonAsync("/api/v1/match-invitations",new{candidateId=c.Profiles[0],clientRequestId=EntityId.New()})).StatusCode);
        var third=await Json(await c.Clients[2].GetAsync("/api/v1/match-invitations"));Assert.Equal("other_round_started",Assert.Single(third["outgoing"]!.AsArray())!.Text("invalidatedReason"));
        Assert.Equal(2,(await c.Platform.Sql("SELECT * FROM game_round_participants")).Count);
    }
    [Fact]
    public async Task MS_API_010_028_031_ProfileChanges_UseLatestSearchButPreserveOldPendingAndUnrelatedProjection()
    {
        await using var c=new Context();await c.Seed();var ab=await c.Invite(0,1);
        var before=(await c.Platform.Sql("SELECT * FROM match_conditions WHERE account_id=?",c.Users[1].AccountId)).ToJsonString();
        var profiles=new DatingProfileService(c.Platform,c.Platform.Clock);
        await profiles.SaveAsync(c.Users[1],Form(3) with{Occupation="另一份工作",CardVisibility=new(){["occupation"]=false}});
        Assert.Equal(before,(await c.Platform.Sql("SELECT * FROM match_conditions WHERE account_id=?",c.Users[1].AccountId)).ToJsonString());
        Assert.Contains((await c.Search(0))["items"]!.AsArray(),i=>i!.Text("candidateId")==c.Profiles[1]);
        await profiles.SaveAsync(c.Users[1],Form(4) with{RomanticOrientation=[]});
        Assert.DoesNotContain((await c.Search(2))["items"]!.AsArray(),i=>i!.Text("candidateId")==c.Profiles[1]);
        Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[2].PostAsJsonAsync("/api/v1/match-invitations",new{candidateId=c.Profiles[1],clientRequestId=EntityId.New()})).StatusCode);
        Assert.Equal("accepted",(await c.Resolve(1,ab.Text("invitationId"),"accept")).Text("status"));
    }
    [Theory][InlineData("cancel")][InlineData("decline")]
    public async Task MS_API_004_020_021_RejectAndCancel_KeepDistinctPairHistory(string action)
    {
        await using var c=new Context();await c.Seed(2);var invite=await c.Invite(0,1);
        await c.Resolve(action=="cancel"?0:1,invite.Text("invitationId"),action);
        foreach(var n in new[]{0,1})Assert.Equal(action=="cancel"?1:0,(await c.Search(n))["items"]!.AsArray().Count);
        var retry=await c.Clients[1].PostAsJsonAsync("/api/v1/match-invitations",new{candidateId=c.Profiles[0],clientRequestId=EntityId.New()});
        Assert.Equal(action=="cancel"?HttpStatusCode.Created:HttpStatusCode.Conflict,retry.StatusCode);
    }
    [Fact]
    public async Task MS_API_002_011_014_015_RealReadinessRevocationStrictJsonAndSharedRateLimit()
    {
        await using var c=new Context();await c.Seed(2);
        var profiles=new DatingProfileService(c.Platform,c.Platform.Clock);await profiles.SaveAsync(c.Users[0],Form(3) with{RomanticOrientation=[]});
        var unready=await c.Clients[0].PostAsJsonAsync("/api/v1/match-candidates/search",new{offset=0,limit=20});Assert.Equal(HttpStatusCode.Conflict,unready.StatusCode);Assert.Equal("PROFILE_NOT_READY",(await Json(unready)).Text("code"));
        await profiles.SaveAsync(c.Users[0],Form(4));
        foreach(var body in new[]{"{\"candidateId\":\"x\",\"clientRequestId\":\"x\",\"score\":100}","{\"candidateId\":\"x\",\"clientRequestId\":\"x\",\"clientRequestId\":\"y\"}"}){
            var invalid=await c.Clients[0].PostAsync("/api/v1/match-invitations",new StringContent(body,Encoding.UTF8,"application/json"));Assert.Equal(HttpStatusCode.BadRequest,invalid.StatusCode);
        }
        for(var n=0;n<10;n++)await c.Invite(0,1,EntityId.New());
        var limited=await c.Clients[0].PostAsJsonAsync("/api/v1/match-invitations",new{candidateId=c.Profiles[1],clientRequestId=EntityId.New()});Assert.Equal(HttpStatusCode.TooManyRequests,limited.StatusCode);Assert.NotNull(limited.Headers.RetryAfter);Assert.True(limited.Headers.CacheControl?.NoStore);
        Assert.Single(await c.Platform.Sql("SELECT * FROM match_invitations"));
        var id=(await c.Platform.Sql("SELECT invitation_id FROM match_invitations"))[0]!.Text("invitation_id");
        await c.Platform.Sql("UPDATE auth_sessions SET revoked_at=? WHERE session_id=?",c.Platform.Clock.GetUtcNow().ToUnixTimeMilliseconds(),c.Users[1].SessionId);
        Assert.Equal(HttpStatusCode.Unauthorized,(await c.Clients[1].PostAsJsonAsync($"/api/v1/match-invitations/{id}/accept",new{})).StatusCode);
        Assert.Empty(await c.Platform.Sql("SELECT * FROM game_rounds"));
    }
    [Fact]
    public async Task MS_API_030_FreshIsolatedDatabase_HasFourTablesNoProductionOrLegacyData()
    {
        await using var c=new Context();
        foreach(var table in new[]{"match_conditions","match_invitations","game_rounds","game_round_participants"})Assert.Empty(await c.Platform.Sql("SELECT * FROM "+table));
        Assert.Empty((await c.Platform.ExecuteAsync("$test-r2-list",new{}))["keys"]!.AsArray());
        Assert.Empty(await c.Platform.Sql("SELECT name FROM sqlite_master WHERE type='trigger'"));
    }
    [Fact]
    public async Task MS_API_016_029_MS_IT_002_020_AllCandidatesRankBeforePaginationWithStableTieAndSafePersona()
    {
        await using var c=new Context();await c.Seed(22);
        var profiles=new DatingProfileService(c.Platform,c.Platform.Clock);
        for(var n=1;n<21;n++)await profiles.SaveAsync(c.Users[n],Form(3) with{InterestTagIds=[],TopicTagIds=[],ValueTagIds=[],WeekendPreference=null,SleepSchedule=null,ConversationStyle=null,ExpectedInteractionFrequency=null,RelationshipMode=null});
        var first=(await c.Search(0))["items"]!.AsArray();Assert.Equal(20,first.Count);
        Assert.Equal(c.Profiles[21],first[0]!.Text("candidateId"));Assert.Equal(100,first[0]!.Number("score"));
        Assert.Equal(20,(await c.Search(0))["nextOffset"]!.GetValue<int>());
        Assert.Equal(first.Skip(1).Select(r=>r!.Text("candidateId")).Order(StringComparer.Ordinal),first.Skip(1).Select(r=>r!.Text("candidateId")));
        var last=(await c.Search(0,20))["items"]!.AsArray();Assert.Single(last);
        Assert.Empty((await c.Search(0,5000))["items"]!.AsArray());Assert.Single((await c.Search(0,0,1))["items"]!.AsArray());
        var personaResponse=await c.Clients[0].GetAsync("/api/v1/match-candidates/"+c.Profiles[21]);Assert.Equal(HttpStatusCode.OK,personaResponse.StatusCode);
        var persona=await Json(personaResponse);Assert.Equal(100,persona.Number("score"));Assert.Equal("星河旅人",persona["persona"]!.Text("nickname"));
        foreach(var key in new[]{"birthDate","email","occupation","regionCode","romanticOrientation","preferredAgeMin","objectKey"})Assert.DoesNotContain(key,persona.ToJsonString());
        Assert.Equal(100,Assert.Single((await c.Search(21))["items"]!.AsArray(),r=>r!.Text("candidateId")==c.Profiles[0])!.Number("score"));
        await profiles.SaveAsync(c.Users[21],Form(3) with{InterestTagIds=[],TopicTagIds=[],ValueTagIds=[],WeekendPreference=null,SleepSchedule=null,ConversationStyle=null,ExpectedInteractionFrequency=null,RelationshipMode=null});
        Assert.All((await c.Search(0))["items"]!.AsArray(),r=>Assert.Equal(0,r!.Number("score")));
    }
    [Fact]
    public async Task MS_API_005_007_008_009_MS_IT_038_040_041_CrossPairRaceAndEndedHistoryStayExclusive()
    {
        await using var c=new Context();await c.Seed();
        var ab=await c.Invite(0,1);var ac=await c.Invite(0,2);
        var attempts=await Task.WhenAll(c.Clients[1].PostAsJsonAsync($"/api/v1/match-invitations/{ab.Text("invitationId")}/accept",new{}),
            c.Clients[2].PostAsJsonAsync($"/api/v1/match-invitations/{ac.Text("invitationId")}/accept",new{}));
        Assert.Single(attempts,r=>r.StatusCode==HttpStatusCode.OK);Assert.Single(attempts,r=>r.StatusCode==HttpStatusCode.Conflict);
        var round=(await c.Platform.Sql("SELECT round_id FROM game_rounds"))[0]!.Text("round_id");
        var u=c.Users[0];await c.Platform.ExecuteAsync("game.round.end",new{accountId=u.AccountId,sessionId=u.SessionId,cv=1,accessExpiresAt=u.AccessExpiresAt,roundId=round});
        Assert.Empty(await c.Platform.Sql("SELECT * FROM game_round_participants"));
        Assert.Equal(HttpStatusCode.Forbidden,(await c.Clients[0].GetAsync("/api/v1/game-rounds/"+round)).StatusCode);
        var winner=attempts[0].IsSuccessStatusCode?1:2;
        Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[winner].PostAsJsonAsync("/api/v1/match-invitations",new{candidateId=c.Profiles[0],clientRequestId=EntityId.New()})).StatusCode);
        // 永久pair不依賴family、方向或配對私有條件；重登與改偏好仍保留歷史。
        var login=RealPlatform.Json((await c.Platform.App.Login($"matching-{winner}@example.test",RealPlatform.Password,"android","127.0.0.1",default)).Body);
        c.Clients[winner].DefaultRequestHeaders.Authorization=new("Bearer",login["tokens"]!.Text("accessToken"));
        var renewed=new CurrentUser(c.Users[winner].AccountId,login["session"]!.Text("sessionId"),1,c.Platform.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());
        await new DatingProfileService(c.Platform,c.Platform.Clock).SaveAsync(renewed,Form(3) with{SharedInterestWeight=0});
        foreach(var (from,to) in new[]{(0,winner),(winner,0)}){
            Assert.DoesNotContain((await c.Search(from))["items"]!.AsArray(),r=>r!.Text("candidateId")==c.Profiles[to]);
            Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[from].PostAsJsonAsync("/api/v1/match-invitations",new{candidateId=c.Profiles[to],clientRequestId=EntityId.New()})).StatusCode);
        }
        var loser=winner==1?2:1;await c.Invite(0,loser);
    }
    [Fact]
    public async Task MS_API_001_003_NonemptyOneWayOrientationAndOccupiedCandidatesFailWithoutSensitiveReasons()
    {
        await using var c=new Context();await c.Seed();var profiles=new DatingProfileService(c.Platform,c.Platform.Clock);
        await profiles.SaveAsync(c.Users[1],Form(3) with{RomanticOrientation=["male"]});
        Assert.DoesNotContain((await c.Search(0))["items"]!.AsArray(),r=>r!.Text("candidateId")==c.Profiles[1]);
        var denied=await c.Clients[0].PostAsJsonAsync("/api/v1/match-invitations",new{candidateId=c.Profiles[1],clientRequestId=EntityId.New()});
        Assert.Equal(HttpStatusCode.Conflict,denied.StatusCode);Assert.Equal("MATCH_STATE_CONFLICT",(await Json(denied)).Text("code"));Assert.Empty(await c.Platform.Sql("SELECT * FROM match_invitations"));
        await profiles.SaveAsync(c.Users[1],Form(4));var ab=await c.Invite(0,1);await c.Resolve(1,ab.Text("invitationId"),"accept");
        Assert.Empty((await c.Search(2))["items"]!.AsArray());
        Assert.Equal(HttpStatusCode.Conflict,(await c.Clients[2].PostAsJsonAsync("/api/v1/match-invitations",new{candidateId=c.Profiles[1],clientRequestId=EntityId.New()})).StatusCode);
        Assert.Single(await c.Platform.Sql("SELECT * FROM match_invitations"));Assert.Single(await c.Platform.Sql("SELECT * FROM game_rounds"));
    }
    [Fact]
    public async Task MS_API_008_009_RealSimultaneousReverseIntentAndRequestReplayNeverCreateTwoRooms()
    {
        await using var c=new Context();await c.Seed(2);
        var attempts=await Task.WhenAll(c.Invite(0,1),c.Invite(1,0));
        Assert.Contains(attempts,r=>r.Text("status")=="accepted");
        Assert.Single(await c.Platform.Sql("SELECT * FROM game_rounds"));
        Assert.Single(await c.Platform.Sql("SELECT * FROM match_invitations"));
        Assert.Equal(2,(await c.Platform.Sql("SELECT * FROM game_round_participants")).Count);
    }
    [Fact]
    public async Task MS_IT_003_004_013To018_023To032_SavedPreferencesProduceSymmetricSoftScoresWithoutFiltering()
    {
        await using var c=new Context();await c.Seed(2);var form=Form(3);
        var different=form with{InterestTagIds=["hiking"],TopicTagIds=["film_chat"],ValueTagIds=["honesty"]};
        var examples=new (string Id,ProfileUpdateInput A,ProfileUpdateInput B,int? Expected)[]{
            ("003/014",form with{PreferredAgeMin=25,PreferredAgeMax=35},form with{BirthDate="1986-01-01"},94),
            ("004",form with{PreferredRegionCodes=["TW-TPE"]},form with{RegionCode="TW-KIN"},null),
            ("013",form,form,100),
            ("015",form,form with{PreferredRegionCodes=["TW-TPE"]},100),
            ("016",form with{PreferredRegionCodes=["TW-TPE"]},form with{RegionCode=null},91),
            ("017-nearest",form with{PreferredRegionCodes=["TW-TPE","TW-KHH"]},form with{RegionCode="TW-TNN"},null),
            ("017-single",form with{PreferredRegionCodes=["TW-KHH"]},form with{RegionCode="TW-TNN"},null),
            ("018",form,different,50),
            ("023-low",form with{PreferredAgeMin=25,PreferredAgeMax=35},form with{BirthDate="2001-01-01"},100),
            ("023-high",form with{PreferredAgeMin=25,PreferredAgeMax=35},form with{BirthDate="1991-01-01"},100),
            ("024",form with{PreferredAgeMin=25,PreferredAgeMax=35},form,99),
            ("025",form with{PreferredAgeMin=25,PreferredAgeMax=35},form with{BirthDate="1971-01-01"},76),
            ("026",form with{PreferredRegionCodes=["TW-TPE"]},form,100),
            ("027",form with{PreferredRegionCodes=["TW-TPE"]},form with{RegionCode="TW-KHH"},null),
            ("028",form with{PreferredAgeMin=25,PreferredAgeMax=35},form with{BirthDate="1986-01-01",PreferredAgeMin=18,PreferredAgeMax=120},97),
            ("029",form with{PreferredRegionCodes=["TW-TPE"]},form with{PreferredRegionCodes=["TW-TPE"],RegionCode="TW-KHH"},null),
            ("030",form with{SharedInterestWeight=0},different with{SharedInterestWeight=0},100),
            ("031",form with{SharedInterestWeight=100},different with{SharedInterestWeight=100},0),
            ("032",form with{InterestTagIds=["coffee","hiking"],SharedInterestWeight=34,PreferredAgeMin=25,PreferredAgeMax=35,PreferredRegionCodes=["TW-TPE"]},form with{InterestTagIds=["coffee","anime"],SharedInterestWeight=67,RegionCode=null},78)
        };
        long revision=3;var profiles=new DatingProfileService(c.Platform,c.Platform.Clock);var scores=new Dictionary<string,long>();
        foreach(var example in examples){
            await profiles.SaveAsync(c.Users[0],example.A with{ExpectedRevision=revision});await profiles.SaveAsync(c.Users[1],example.B with{ExpectedRevision=revision});revision++;
            var a=Assert.Single((await c.Search(0))["items"]!.AsArray())!;var b=Assert.Single((await c.Search(1))["items"]!.AsArray())!;
            Assert.Equal(c.Profiles[1],a.Text("candidateId"));Assert.Equal(a.Number("score"),b.Number("score"));Assert.InRange(a.Number("score"),0,100);
            if(example.Expected.HasValue)Assert.Equal(example.Expected.Value,a.Number("score"));scores[example.Id]=a.Number("score");
        }
        Assert.Equal(scores["017-nearest"],scores["017-single"]);Assert.InRange(scores["004"],1,99);Assert.InRange(scores["027"],1,99);
    }
    [Theory][InlineData("accept-zero")][InlineData("accept-second-participant")]
    public async Task MS_API_012_TrueD1Fault_Returns503WithoutPartialRoundOrInvalidation(string fault)
    {
        await using var c=new Context();await c.Seed();var ab=await c.Invite(0,1);await c.Invite(2,0);await c.Invite(1,2);
        var before=(await c.Platform.Sql("SELECT * FROM match_invitations ORDER BY invitation_id")).ToJsonString();
        await c.Platform.ExecuteAsync("$test-arm-matching-fault",new{mode=fault});
        var response=await c.Clients[1].PostAsJsonAsync($"/api/v1/match-invitations/{ab.Text("invitationId")}/accept",new{});
        Assert.Equal(HttpStatusCode.ServiceUnavailable,response.StatusCode);Assert.Equal("DEPENDENCY_UNAVAILABLE",(await Json(response)).Text("code"));
        Assert.Equal(before,(await c.Platform.Sql("SELECT * FROM match_invitations ORDER BY invitation_id")).ToJsonString());Assert.Empty(await c.Platform.Sql("SELECT * FROM game_rounds"));Assert.Empty(await c.Platform.Sql("SELECT * FROM game_round_participants"));
        Assert.Equal("accepted",(await c.Resolve(1,ab.Text("invitationId"),"accept")).Text("status"));
    }
    [Fact]
    public async Task MS_API_031_TrueProjectionFault_IsSkippedForUnrelatedFieldsAndRollsBackRelatedFields()
    {
        await using var c=new Context();await c.Seed(2);
        var conditions=(await c.Platform.Sql("SELECT * FROM match_conditions ORDER BY account_id")).ToJsonString();
        await c.Platform.ExecuteAsync("$test-arm-matching-fault",new{mode="profile-projection-zero"});
        var unrelated=await c.Clients[0].PutAsJsonAsync("/api/v1/me/dating-profile",Form(3) with{Occupation="只改工作",CardVisibility=new(){["occupation"]=false}});Assert.Equal(HttpStatusCode.OK,unrelated.StatusCode);
        Assert.True((await c.Platform.ExecuteAsync("$test-matching-fault-state",new{}))["armed"]!.GetValue<bool>());
        var source=(await c.Platform.Sql("SELECT * FROM user_profiles ORDER BY account_id")).ToJsonString();
        var related=await c.Clients[0].PutAsJsonAsync("/api/v1/me/dating-profile",Form(4) with{RegionCode="TW-KHH"});Assert.Equal(HttpStatusCode.ServiceUnavailable,related.StatusCode);
        Assert.Equal(source,(await c.Platform.Sql("SELECT * FROM user_profiles ORDER BY account_id")).ToJsonString());
        Assert.Equal(conditions,(await c.Platform.Sql("SELECT * FROM match_conditions ORDER BY account_id")).ToJsonString());
    }
}
