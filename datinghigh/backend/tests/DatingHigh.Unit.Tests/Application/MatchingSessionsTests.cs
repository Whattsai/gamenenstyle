using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.RateLimiting;
using DatingHigh.Domain;
using Microsoft.Extensions.Time.Testing;

namespace DatingHigh.Unit.Tests.Application;

// 用例次序、DTO及錯誤隔離；資格／互斥／投影的SQL證據另在真Miniflare測試。
public sealed class MatchingSessionsTests
{
    private static readonly CurrentUser User=new(EntityId.New(),EntityId.New(),1,long.MaxValue);
    private sealed class Fixture:IPlatformClient,IMatchingCandidateProfileReader,IRateLimiter
    {
        public readonly List<(string Command,JsonNode Payload)> Calls=[];
        public readonly List<RateLimitDescriptor> Limits=[];
        public JsonArray Search=[];
        public JsonNode? Persona=Profile(EntityId.New());
        public Func<string,JsonArray> Response=command=>command=="session.validate"?[new JsonObject{["ok"]=1}]:[];
        public RateLimitDecision Decision=new(true,0);
        public MatchingSessionService Service=>new(this,this,this,new FakeTimeProvider(DateTimeOffset.Parse("2026-11-06T00:00:00Z")));
        public Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken cancellationToken=default)
        {
            Calls.Add((command,JsonSerializer.SerializeToNode(payload)!));
            return Task.FromResult<JsonNode>(new JsonObject{["rows"]=Response(command).DeepClone()});
        }
        public Task<JsonArray> SearchAsync(CurrentUser user,CancellationToken ct=default)=>Task.FromResult((JsonArray)Search.DeepClone());
        public Task<JsonNode?> PersonaAsync(CurrentUser user,string candidateId,CancellationToken ct=default)=>Task.FromResult(Persona?.DeepClone());
        public Task<RateLimitDecision> TryConsumeAsync(IEnumerable<RateLimitDescriptor> descriptors,CancellationToken cancellationToken=default){Limits.AddRange(descriptors);return Task.FromResult(Decision);}
    }
    private static JsonObject Profile(string id)=>new(){["profile_id"]=id,["birth_date"]="1990-01-01",["gender"]="diverse",["romantic_orientation_json"]="[\"diverse\"]",["region_code"]="TW-TPE",["interests_json"]="{\"interestTagIds\":[\"coffee\"]}",["preferences_json"]="{\"sharedInterestWeight\":100}",["nickname"]="星河旅人",["bio"]="喜歡散步",["selected_avatar_type"]="builtin",["selected_avatar_ref"]="male-01",["occupation"]="不可外洩",["object_key"]="private-test-only"};
    private static JsonObject Invitation(string id,string status="pending",string? initiator=null)=>new(){["invitation_id"]=id,["status"]=status,["initiator_account_id"]=initiator??User.AccountId,["round_id"]=status=="accepted"?EntityId.New():null};

    [Fact]
    public async Task Search_RanksEntireSetBeforePaging_AndProjectsOnlySafeIdentifiers()
    {
        var f=new Fixture();var own=Profile(EntityId.New());own["own_profile_id"]=own["profile_id"]!.DeepClone();f.Search.Add(own);
        var low=Profile(EntityId.New());low["interests_json"]="{}";f.Search.Add(low);
        var high=Profile(EntityId.New());f.Search.Add(high);
        var result=await f.Service.SearchAsync(User,0,1);var item=Assert.Single(result["items"]!.AsArray())!;
        Assert.Equal(high.Text("profile_id"),item.Text("candidateId"));Assert.Equal(60,item["score"]!.GetValue<int>());Assert.Equal(1,result["nextOffset"]!.GetValue<int>());
        Assert.Equal(new[]{"candidateId","invitationId","invitationState","score"},item.AsObject().Select(p=>p.Key).Order());
        Assert.Equal(new RateLimitDescriptor("matching_search.v1","account",User.AccountId),Assert.Single(f.Limits));
    }
    [Theory][InlineData(false,"PROFILE_NOT_READY",409)][InlineData(true,"GAME_IN_PROGRESS",409)]
    public async Task EmptyProjection_DistinguishesUnreadyFromOccupied(bool occupied,string code,int status)
    {
        var f=new Fixture();f.Response=command=>command=="session.validate"?[new JsonObject()]:command=="game.round.list"&&occupied?[new JsonObject{["round_id"]=EntityId.New()}]:[];
        var error=await Assert.ThrowsAsync<DomainException>(()=>f.Service.SearchAsync(User,0,20));Assert.Equal(code,error.Code);Assert.Equal(status,error.Status);
    }
    [Fact]
    public async Task EmptyProjection_WithRevokedSession_StopsBeforeReadinessFallback()
    {
        var f=new Fixture{Response=_=>[]};var error=await Assert.ThrowsAsync<DomainException>(()=>f.Service.SearchAsync(User,0,20));
        Assert.Equal("SESSION_REVOKED",error.Code);Assert.Equal("session.validate",Assert.Single(f.Calls).Command);
    }
    [Theory][InlineData(-1,20)][InlineData(5001,20)][InlineData(0,0)][InlineData(0,21)]
    public async Task InvalidPage_DoesNotConsumeOrQuery(int offset,int limit)
    {
        var f=new Fixture();await Assert.ThrowsAsync<DomainException>(()=>f.Service.SearchAsync(User,offset,limit));Assert.Empty(f.Calls);Assert.Empty(f.Limits);
    }
    [Fact]
    public async Task RateDenial_StopsBeforeWriteAndPreservesRetryAfter()
    {
        var f=new Fixture{Decision=new(false,42)};var error=await Assert.ThrowsAsync<DomainException>(()=>f.Service.InviteAsync(User,EntityId.New(),EntityId.New()));
        Assert.Equal("RATE_LIMITED",error.Code);Assert.Equal(429,error.Status);Assert.Empty(f.Calls);
    }
    [Fact]
    public async Task Invite_OnlyReceiverExplicitIntentResolvesReversePending()
    {
        var id=EntityId.New();var f=new Fixture{Response=command=>command=="match.invite.create"?[Invitation(id,initiator:EntityId.New())]:[Invitation(id,"accepted")]};
        var result=await f.Service.InviteAsync(User,EntityId.New(),EntityId.New());Assert.Equal("accepted",result.Text("status"));
        Assert.Equal(new[]{"match.invite.create","match.invite.resolve"},f.Calls.Select(c=>c.Command));
        var resolve=f.Calls[1].Payload;Assert.Equal(id,resolve.Text("invitationId"));Assert.Equal("accept",resolve.Text("action"));
        Assert.All(f.Calls,c=>{Assert.Equal(User.AccountId,c.Payload.Text("accountId"));Assert.Equal(User.SessionId,c.Payload.Text("sessionId"));});
    }
    [Fact]
    public async Task OwnPendingReplay_DoesNotAcceptOrStartRoom()
    {
        var f=new Fixture{Response=_=>[Invitation(EntityId.New())]};var result=await f.Service.InviteAsync(User,EntityId.New(),EntityId.New());
        Assert.Equal("pending",result.Text("status"));Assert.Equal("outgoing",result.Text("direction"));Assert.Null(result["roundId"]);Assert.Single(f.Calls);
    }
    [Theory][InlineData("expired","INVITATION_EXPIRED",410)][InlineData("invalidated","MATCH_STATE_CONFLICT",409)][InlineData("cancelled","MATCH_STATE_CONFLICT",409)]
    public async Task Resolve_TerminalStatesNeverMasqueradeAsAcceptance(string status,string code,int http)
    {
        var f=new Fixture{Response=_=>[Invitation(EntityId.New(),status)]};var error=await Assert.ThrowsAsync<DomainException>(()=>f.Service.ResolveAsync(User,EntityId.New(),"accept"));Assert.Equal(code,error.Code);Assert.Equal(http,error.Status);
    }
    [Theory][InlineData("accept","accepted")][InlineData("decline","declined")][InlineData("cancel","cancelled")]
    public async Task Resolve_ProjectsOnlyTheExpectedTerminalOutcome(string action,string status)
    {
        var f=new Fixture{Response=_=>[Invitation(EntityId.New(),status)]};Assert.Equal(status,(await f.Service.ResolveAsync(User,EntityId.New(),action)).Text("status"));Assert.Single(f.Calls);
    }
    [Fact]
    public async Task MissingInvitationAndRound_RecheckSessionBeforeSafeForbidden()
    {
        var f=new Fixture();var a=await Assert.ThrowsAsync<DomainException>(()=>f.Service.ResolveAsync(User,EntityId.New(),"accept"));Assert.Equal("RESOURCE_FORBIDDEN",a.Code);
        var b=await Assert.ThrowsAsync<DomainException>(()=>f.Service.RoundAsync(User,EntityId.New()));Assert.Equal("RESOURCE_FORBIDDEN",b.Code);
        Assert.Equal(new[]{"match.invite.resolve","session.validate","game.round.get","session.validate"},f.Calls.Select(c=>c.Command));
    }
    [Fact]
    public async Task Candidate_UsesSeparatePersonaRecheck_AndStripsPrivateSourceFields()
    {
        var f=new Fixture();var own=Profile(EntityId.New());own["own_profile_id"]=own["profile_id"]!.DeepClone();f.Search.Add(own);var target=Profile(EntityId.New());f.Search.Add(target);
        var result=await f.Service.CandidateAsync(User,target.Text("profile_id"));Assert.Equal("星河旅人",result["persona"]!.Text("nickname"));
        foreach(var key in new[]{"occupation","object_key","birth_date","romantic_orientation_json","preferences_json"})Assert.DoesNotContain(key,result.ToJsonString());
        f.Persona=null;Assert.Equal("RESOURCE_FORBIDDEN",(await Assert.ThrowsAsync<DomainException>(()=>f.Service.CandidateAsync(User,target.Text("profile_id")))).Code);
    }
    [Fact]
    public async Task Lists_KeepIncomingOutgoingSeparate_WithoutReturningSourceColumns()
    {
        var outgoing=Invitation(EntityId.New());var incoming=Invitation(EntityId.New(),initiator:EntityId.New());outgoing["nickname"]="甲";incoming["nickname"]="乙";incoming["account_id"]="private";
        var f=new Fixture{Response=command=>command=="match.invite.list"?[outgoing,incoming]:[new JsonObject()]};var lists=await f.Service.InvitationsAsync(User);
        Assert.Equal("outgoing",Assert.Single(lists["outgoing"]!.AsArray())!.Text("direction"));Assert.Equal("incoming",Assert.Single(lists["incoming"]!.AsArray())!.Text("direction"));Assert.DoesNotContain("account_id",lists.ToJsonString());
    }
}
