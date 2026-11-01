using DatingHigh.Application;using DatingHigh.Domain;using System.Text.Json.Nodes;
namespace DatingHigh.Integration.Tests;
public class CloudflareEmailIntegrationTests
{
    [Theory,Trait("Case","PF-IT-033")]
    [InlineData("register_email","success")][InlineData("register_email","failure")][InlineData("register_email","timeout")]
    [InlineData("reset_password","success")][InlineData("reset_password","failure")][InlineData("reset_password","timeout")]
    public async Task RealAdapterAndWorker_DeliveryAndResend_KeepOneDeadlineAndPurposeSpecificFailure(string purpose,string mode)
    {
        await using var c=new RealPlatform();if(purpose=="reset_password")await c.Seed(true);await c.Provider(mode);var app=c.CloudApp;
        async Task<JsonNode> Finish(Task<object> operation,int calls)
        {
            if(mode=="timeout"){
                var deadline=DateTime.UtcNow.AddSeconds(30);while(c.MailCalls<calls&&DateTime.UtcNow<deadline)await Task.Delay(5);
                Assert.Equal(calls,c.MailCalls);await Task.Delay(10);
                c.Clock.Advance(TimeSpan.FromMilliseconds(9999));Assert.False(operation.IsCompleted);c.Clock.Advance(TimeSpan.FromMilliseconds(1));
            }
            if(purpose=="register_email"&&mode!="success"){
                var error=await Assert.ThrowsAsync<DomainException>(async()=>await operation.WaitAsync(TimeSpan.FromSeconds(30)));Assert.Equal(503,error.Status);Assert.Equal("EMAIL_DELIVERY_FAILED",error.Code);return RealPlatform.Json(error.Recovery!);
            }
            return RealPlatform.Json(await operation.WaitAsync(TimeSpan.FromSeconds(30)));
        }
        var first=await Finish(app.RequestCode(RealPlatform.Email,"android",purpose,"127.0.0.1",default),1);var id=first.Text("challengeId");var flow=first.Text("flowToken");
        var row=Assert.Single(await c.Sql("SELECT * FROM auth_email_challenges WHERE challenge_id=?",id))!;var absolute=row.Number("absolute_expires_at");Assert.Equal("active",row.Text("state"));
        await c.Sql("UPDATE auth_email_challenges SET failed_attempts=4 WHERE challenge_id=?",id);c.Clock.Advance(TimeSpan.FromSeconds(60));
        var second=await Finish(app.Resend(id,flow,"127.0.0.1",default),2);Assert.Equal(id,second.Text("challengeId"));Assert.Equal(flow,second.Text("flowToken"));
        row=Assert.Single(await c.Sql("SELECT * FROM auth_email_challenges WHERE challenge_id=?",id))!;Assert.Equal(1,row.Number("generation"));Assert.Equal(4,row.Number("failed_attempts"));Assert.Equal(absolute,row.Number("absolute_expires_at"));
        var stats=await c.ProviderStats();Assert.Equal(2,stats.Number("calls"));Assert.True(stats["templatesValid"]!.GetValue<bool>());
        Assert.Equal(mode=="success"?0:2,c.DeliveryWarnings.Count);Assert.All(c.DeliveryWarnings,text=>{Assert.DoesNotContain("000001",text);Assert.DoesNotContain("provider-private",text);});
        await c.Provider("success",false);c.Clock.Advance(TimeSpan.FromSeconds(60));await app.Resend(id,flow,"127.0.0.1",default);
        if(purpose=="register_email")Assert.Equal(201,(await app.Register(id,flow,"000001",RealPlatform.Password,"android",default)).Status);
        else{await app.Reset(id,flow,"000001",RealPlatform.Password,default);Assert.Equal(2,Assert.Single(await c.Sql("SELECT credential_version FROM auth_accounts"))!.Number("credential_version"));}
    }
    [Fact,Trait("Case","PF-IT-033")]
    public async Task RealAdapterAndWorker_ArbitraryTemplateOrInactiveChallenge_NeverReachesEmailProvider()
    {
        await using var c=new RealPlatform();await c.Provider("success");var m=RealPlatform.Json(await c.CloudApp.RequestCode(RealPlatform.Email,"android","register_email","127.0.0.1",default));
        var payload=new JsonObject{["challengeId"]=m.Text("challengeId"),["generation"]=0,["code"]="000001"};
        foreach(var field in new[]{"to","from","subject","html"}){var invalid=payload.DeepClone().AsObject();invalid[field]="unapproved";Assert.Equal(400,(await Assert.ThrowsAsync<DomainException>(()=>c.ExecuteAsync("email.code.send",invalid))).Status);}
        var stale=payload.DeepClone().AsObject();stale["generation"]=1;await Assert.ThrowsAsync<DomainException>(()=>c.ExecuteAsync("email.code.send",stale));
        await c.Sql("UPDATE auth_email_challenges SET state='consumed'");await Assert.ThrowsAsync<DomainException>(()=>c.ExecuteAsync("email.code.send",payload));Assert.Equal(1,(await c.ProviderStats()).Number("calls"));
    }
}
