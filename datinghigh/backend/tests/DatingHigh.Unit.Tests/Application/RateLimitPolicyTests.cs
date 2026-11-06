using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.RateLimiting;
using DatingHigh.Infrastructure;
using DatingHigh.Domain;
namespace DatingHigh.Unit.Tests.Application;
public class RateLimitPolicyTests
{
    private sealed class Clock:TimeProvider{public long Milliseconds=1800000000000;public override DateTimeOffset GetUtcNow()=>DateTimeOffset.FromUnixTimeMilliseconds(Milliseconds);}
    private sealed class Platform:IPlatformClient
    {
        public List<JsonNode> Calls=[];public int Count=1;public bool Fail;public long Expiry=1800000060001;public Dictionary<string,long> Expiries=[];
        public Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken ct=default)
        {
            if(Fail)throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
            var p=JsonSerializer.SerializeToNode(payload)!;Calls.Add(p);
            return Task.FromResult(JsonSerializer.SerializeToNode(new{rows=p["entries"]!.AsArray().Select(entry=>new{attempt_count=Count,expires_at=Expiries.GetValueOrDefault(entry!.Text("policyKey"),Expiry)})})!);
        }
    }
    private static RateLimiter Create(Platform platform,Clock clock)=>new(platform,new("local","i","a",new byte[32],new byte[32],new byte[32],"http://localhost:8081","Log"),clock);
    [Fact,Trait("Case","PF-UT-055")]
    public void ResolveRatePolicy_NineAuthenticationEntries_UsesStaticRateLimitPolicies()
    {
        Assert.Equal(9,RateLimitPolicies.Entries.Count(e=>e.Key.Policy is not("avatar_generate.v1" or "matching_search.v1" or "matching_invite.v1")));Assert.Equal((3600000L,8),RateLimitPolicies.Entries[("avatar_generate.v1","account")]);Assert.Equal((3600000L,5),RateLimitPolicies.Entries[("email_code_send.v1","email")]);Assert.Equal((60000L,120),RateLimitPolicies.Entries[("session_refresh.v1","ip")]);Assert.Equal((900000L,10),RateLimitPolicies.Entries[("credential_change.v1","account")]);
        Assert.Equal((60000L,30),RateLimitPolicies.Entries[("matching_search.v1","account")]);Assert.Equal((3600000L,10),RateLimitPolicies.Entries[("matching_invite.v1","account")]);
    }
    [Fact,Trait("Case","PF-UT-056")]
    public async Task ConsumeRatePolicy_UnknownPolicySubjectOrClientQuota_RejectsConfiguration()
    {
        var p=new Platform();var limiter=Create(p,new());
        foreach(var d in new[]{new RateLimitDescriptor("unknown","email","a@example.com"),new("password_login.v1","account",EntityId.New())})await Assert.ThrowsAsync<DomainException>(()=>limiter.TryConsumeAsync([d]));Assert.Empty(p.Calls);
    }
    [Fact,Trait("Case","PF-UT-057")]
    public async Task RunProtectedAction_DeniedOrFailedAttempt_StopsSideEffectWithoutRefund()
    {
        var p=new Platform{Count=31};var limiter=Create(p,new());var ip=new RateLimitDescriptor("email_code_send.v1","ip","127.0.0.1");
        Assert.False((await limiter.TryConsumeAsync([new("email_code_send.v1","email","a@example.com"),ip])).Allowed);Assert.Single(p.Calls);Assert.Single(p.Calls[0]["entries"]!.AsArray());
        Assert.False((await limiter.TryConsumeAsync([ip])).Allowed);Assert.Single(p.Calls);
    }
    [Fact,Trait("Case","PF-UT-059")]
    public async Task ResolveSubject_WorkerTrustedClientIpAndVerifiedEntities_RejectsUntrustedInput()
    {
        var p=new Platform();var limiter=Create(p,new());await limiter.TryConsumeAsync([new("password_login.v1","ip","::ffff:127.0.0.1"),new("password_login.v1","ip","127.0.0.1")]);Assert.Single(p.Calls[0]["entries"]!.AsArray());
        await Assert.ThrowsAsync<DomainException>(()=>limiter.TryConsumeAsync([new("session_refresh.v1","session","victim")]));
    }
    [Fact,Trait("Case","PF-UT-061")]
    public async Task CalculateWindow_ExactBoundary_CreatesNextFixedWindow()
    {
        var p=new Platform();var clock=new Clock();var limiter=Create(p,clock);var d=new RateLimitDescriptor("session_refresh.v1","ip","127.0.0.1");
        await limiter.TryConsumeAsync([d]);clock.Milliseconds+=59999;await limiter.TryConsumeAsync([d]);Assert.Single(p.Calls);clock.Milliseconds++;await limiter.TryConsumeAsync([d]);Assert.Equal(2,p.Calls.Count);
    }
    [Fact,Trait("Case","PF-UT-062")]
    public async Task EvaluateCounts_OverLimitMultipleBuckets_ReturnsSaturatedRetryAfter()
    {
        var p=new Platform{Count=999,Expiries=new(){["password_login.v1"]=1800000001001,["email_code_send.v1"]=1800000125500}};var result=await Create(p,new()).TryConsumeAsync([new("password_login.v1","email","a@example.com"),new("email_code_send.v1","email","a@example.com")]);Assert.False(result.Allowed);Assert.Equal(126,result.RetryAfterSeconds);Assert.Equal(2,p.Calls.Single()["entries"]!.AsArray().Count);
        var minimum=new Platform{Count=999,Expiry=1800000000001};Assert.Equal(1,(await Create(minimum,new()).TryConsumeAsync([new("password_login.v1","email","a@example.com")])).RetryAfterSeconds);
    }
    [Fact,Trait("Case","PF-UT-063")]
    public async Task ConsumeAndCleanup_DependencyFailureOrExpiredBuckets_FailsClosedAndBoundsWork()
    {
        var p=new Platform{Fail=true};await Assert.ThrowsAsync<DomainException>(()=>Create(p,new()).TryConsumeAsync([new("password_login.v1","email","a@example.com")]));Assert.Empty(p.Calls);
    }
}
