using DatingHigh.Application;using DatingHigh.Domain;using DatingHigh.Infrastructure;
namespace DatingHigh.Integration.Tests;
public class ChallengeIntegrationTests
{
    [Fact,Trait("Case","PF-IT-004")]
    public async Task RealD1_ChallengeBindingAndStrictPassword_AllRejectionsLeaveCredentialsUntouched()
    {
        foreach(var purpose in new[]{"register_email","reset_password"})foreach(var variant in new[]{"flow","purpose","generation","consumed","locked","ten-minute","absolute","surrogate","emoji"})
        {
            await using var c=new RealPlatform();if(purpose=="reset_password")await c.Seed(true);var m=await c.Request(purpose);var id=m.Text("challengeId");var code=c.Sender.LastCode;
            var row=Assert.Single(await c.Sql("SELECT * FROM auth_email_challenges WHERE challenge_id=?",id))!;Assert.Equal("000001",code);
            Assert.Equal(new ChallengeCrypto(c.Options.EmailKey).CodeMac(id,purpose,RealPlatform.Email,0,code),row.Text("code_mac"));Assert.Equal(ChallengeCrypto.Sha(m.Text("flowToken")),row.Text("flow_token_hash"));Assert.NotEqual(code,row.Text("code_mac"));
            if(variant=="purpose")await c.Sql("UPDATE auth_email_challenges SET purpose=? WHERE challenge_id=?",purpose=="register_email"?"reset_password":"register_email",id);
            if(variant=="generation")await c.Sql("UPDATE auth_email_challenges SET generation=1 WHERE challenge_id=?",id);
            if(variant is "consumed" or "locked")await c.Sql("UPDATE auth_email_challenges SET state=? WHERE challenge_id=?",variant,id);
            if(variant=="ten-minute")c.Clock.Advance(TimeSpan.FromMinutes(10));if(variant=="absolute")c.Clock.Advance(TimeSpan.FromMinutes(30));
            var flow=variant=="flow"?new string('z',43):m.Text("flowToken");var password=variant=="surrogate"?"Valid password\ud800":variant=="emoji"?string.Concat(Enumerable.Repeat("😀",12)):RealPlatform.Password;
            async Task Complete(){if(purpose=="register_email")await c.App.Register(id,flow,code,password,"android",default);else await c.App.Reset(id,flow,code,password,default);}
            if(variant=="emoji")await Complete();else await Assert.ThrowsAsync<DomainException>(Complete);
            var accounts=await c.Sql("SELECT credential_version,password_hash FROM auth_accounts");Assert.Equal(variant=="emoji"||purpose=="reset_password"?1:0,accounts.Count);if(purpose=="reset_password")Assert.Equal(variant=="emoji"?2:1,accounts[0]!.Number("credential_version"));
        }
    }
    [Theory,Trait("Case","PF-IT-007")]
    [InlineData("local","success")][InlineData("local","failure")][InlineData("local","timeout")]
    [InlineData("google-only","success")][InlineData("google-only","failure")][InlineData("google-only","timeout")]
    [InlineData("unknown","success")][InlineData("unknown","failure")][InlineData("unknown","timeout")]
    public async Task RealD1_ResetRequestAndResend_KnownUnknownAndSenderOutcomesHaveOnePublicShape(string kind,string mode)
    {
        await using var c=new RealPlatform();if(kind!="unknown")await c.Seed(kind=="local");c.Sender.Mode=mode;
        async Task<System.Text.Json.Nodes.JsonNode> Finish(Task<object> pending,int expectedCalls){if(mode=="timeout"&&kind!="unknown"){for(var i=0;i<1000&&c.Sender.Calls<expectedCalls;i++)await Task.Delay(1);Assert.Equal(expectedCalls,c.Sender.Calls);c.Clock.Advance(TimeSpan.FromSeconds(10));}return RealPlatform.Json(await pending);}
        var requested=await Finish(c.App.RequestCode(RealPlatform.Email,"android","reset_password","127.0.0.1",default),1);Assert.Equal(new[]{"absoluteExpiresAt","challengeId","expiresAt","flowToken","message","resendAfter"},requested.AsObject().Select(p=>p.Key).Order().ToArray());
        c.Clock.Advance(TimeSpan.FromSeconds(60));var resent=await Finish(c.App.Resend(requested.Text("challengeId"),requested.Text("flowToken"),"127.0.0.1",default),2);Assert.Equal(requested.AsObject().Select(p=>p.Key).Order(),resent.AsObject().Select(p=>p.Key).Order());Assert.Equal(requested.Text("message"),resent.Text("message"));
        Assert.Equal(kind=="unknown"?0:2,c.Sender.Calls);var row=Assert.Single(await c.Sql("SELECT * FROM auth_email_challenges"))!;Assert.Equal(1,row.Number("generation"));
        if(kind=="unknown"){Assert.Null(row["account_id"]);await Assert.ThrowsAsync<DomainException>(()=>c.App.Reset(requested.Text("challengeId"),requested.Text("flowToken"),"000001",RealPlatform.Password,default));}
    }
    [Fact,Trait("Case","PF-IT-018")]
    public async Task RealD1_MixedChallengesAndPurposes_TheSixthEmailAttemptCannotSendOrCreateChallenge()
    {
        await using var c=new RealPlatform();var first=await c.Request();c.Clock.Advance(TimeSpan.FromSeconds(60));await c.App.Resend(first.Text("challengeId"),first.Text("flowToken"),"127.0.0.1",default);
        var current=await c.Request();await c.App.Register(current.Text("challengeId"),current.Text("flowToken"),c.Sender.LastCode,RealPlatform.Password,"android",default);
        var reset=await c.Request("reset_password");c.Clock.Advance(TimeSpan.FromSeconds(60));await c.App.Resend(reset.Text("challengeId"),reset.Text("flowToken"),"127.0.0.1",default);Assert.Equal(5,c.Sender.Calls);
        var count=(await c.Sql("SELECT challenge_id FROM auth_email_challenges")).Count;var denied=await Assert.ThrowsAsync<DomainException>(()=>c.App.RequestCode(RealPlatform.Email,"android","reset_password","127.0.0.1",default));Assert.Equal(429,denied.Status);Assert.Equal(5,c.Sender.Calls);Assert.Equal(count,(await c.Sql("SELECT challenge_id FROM auth_email_challenges")).Count);
    }
    [Fact,Trait("Case","PF-IT-018"),Trait("Case","PF-BDD-057")]
    public async Task RealD1_ConcurrentMixedPurposeRequestsAndResends_ShareOneEmailQuotaWithoutRefund()
    {
        await using var c=new RealPlatform();var registration=await c.Request();await c.Seed(true);var reset=await c.Request("reset_password");c.Clock.Advance(TimeSpan.FromSeconds(60));Assert.Equal(2,c.Sender.Calls);
        var start=new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var actions=new Func<Task<object>>[]{
            ()=>c.App.Resend(registration.Text("challengeId"),registration.Text("flowToken"),"192.0.2.1",default),
            ()=>c.App.Resend(reset.Text("challengeId"),reset.Text("flowToken"),"192.0.2.2",default),
            ()=>c.App.RequestCode(RealPlatform.Email.ToUpperInvariant(),"android","reset_password","192.0.2.3",default),
            ()=>c.App.RequestCode(RealPlatform.Email,"android","reset_password","192.0.2.4",default),
            ()=>c.App.RequestCode(RealPlatform.Email.ToUpperInvariant(),"android","reset_password","192.0.2.5",default),
            ()=>c.App.RequestCode(RealPlatform.Email,"android","register_email","192.0.2.6",default)
        };
        var tasks=actions.Select(async action=>{await start.Task;try{await action();return (DomainException?)null;}catch(DomainException error){return error;}}).ToArray();start.SetResult();var outcomes=await Task.WhenAll(tasks);
        Assert.True(outcomes.Count(error=>error?.Status==429)>=3);Assert.All(outcomes.Where(error=>error?.Status==429),error=>Assert.True(error!.RetryAfter>=1));Assert.All(outcomes.Where(error=>error is not null),error=>Assert.Contains(error!.Status,new[]{409,429}));Assert.InRange(c.Sender.Calls,2,5);
        var calls=c.Sender.Calls;var denied=await Assert.ThrowsAsync<DomainException>(()=>c.App.RequestCode(RealPlatform.Email,"android","reset_password","192.0.2.7",default));Assert.Equal(429,denied.Status);Assert.True(denied.RetryAfter>=1);Assert.Equal(calls,c.Sender.Calls);
        var buckets=await c.Sql("SELECT subject_type,attempt_count FROM common_rate_limit_buckets WHERE policy_key='email_code_send.v1'");Assert.Equal(6,Assert.Single(buckets,row=>row!.Text("subject_type")=="email")!.Number("attempt_count"));Assert.Equal(9,buckets.Where(row=>row!.Text("subject_type")=="ip").Sum(row=>row!.Number("attempt_count")));
    }
    [Fact,Trait("Case","PF-IT-017"),Trait("Case","PF-BDD-057")]
    public async Task RealD1_OneIpAcrossDifferentEmailAddresses_RejectsBeforeAnotherSend()
    {
        await using var c=new RealPlatform();for(var index=0;index<30;index++)await c.App.RequestCode($"quota-{index}@example.com","android","register_email","192.0.2.1",default);Assert.Equal(30,c.Sender.Calls);
        var error=await Assert.ThrowsAsync<DomainException>(()=>c.App.RequestCode("quota-last@example.com","android","register_email","192.0.2.1",default));Assert.Equal(429,error.Status);Assert.True(error.RetryAfter>=1);Assert.Equal(30,c.Sender.Calls);
        var buckets=await c.Sql("SELECT subject_type,attempt_count FROM common_rate_limit_buckets WHERE policy_key='email_code_send.v1'");Assert.Equal(31,Assert.Single(buckets,row=>row!.Text("subject_type")=="ip")!.Number("attempt_count"));Assert.Equal(30,buckets.Count(row=>row!.Text("subject_type")=="email"));
    }
}
