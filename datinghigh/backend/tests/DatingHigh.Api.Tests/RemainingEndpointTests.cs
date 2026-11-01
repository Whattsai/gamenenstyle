using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
namespace DatingHigh.Api.Tests;
[Collection("HTTP contracts")]
public class RemainingEndpointTests
{
    private static async Task<JsonNode> Body(HttpResponseMessage r)=>(await r.Content.ReadFromJsonAsync<JsonNode>())!;
    private static async Task<JsonNode> Request(ApiFixture f,HttpClient client,string path="email-registrations",string email="new@example.com")=>await Body(await client.PostAsJsonAsync($"/api/v1/{path}",new{email,clientPlatform="android"}));
    private static object Confirm(JsonNode metadata,string? code,string field="password")=>new Dictionary<string,object?>{{"challengeId",metadata["challengeId"]!.GetValue<string>()},{"flowToken",metadata["flowToken"]!.GetValue<string>()},{"code",code},{field,"A different valid password"},{"clientPlatform","android"}};
    [Fact,Trait("Case","PF-API-006")]
    public async Task ConfirmRegistration_WriteFaultOrZeroRows_DoesNotExposeTokens()
    {
        using var f=new ApiFixture();using var c=f.Native();var m=await Request(f,c);f.Store.FaultCommand="account.register-email";
        var r=await c.PostAsJsonAsync("/api/v1/accounts",Confirm(m,f.Sender.Code));Assert.Equal(HttpStatusCode.ServiceUnavailable,r.StatusCode);Assert.DoesNotContain("accessToken",await r.Content.ReadAsStringAsync());
        f.Store.FaultCommand=null;f.Store.DenyWrites=true;Assert.Equal(HttpStatusCode.Conflict,(await c.PostAsJsonAsync("/api/v1/accounts",Confirm(m,f.Sender.Code))).StatusCode);
    }
    [Fact,Trait("Case","PF-API-010"),Trait("Case","PF-API-011"),Trait("Case","PF-API-012")]
    public async Task Resend_ValidCooldownWrongFlowAndSenderFailure_UsesPurposeContract()
    {
        using var f=new ApiFixture();using var c=f.Native();var m=await Request(f,c);var id=m["challengeId"]!.GetValue<string>();var body=new{flowToken=m["flowToken"]!.GetValue<string>()};
        Assert.Equal(HttpStatusCode.TooManyRequests,(await c.PostAsJsonAsync($"/api/v1/email-challenges/{id}/resend",body)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync($"/api/v1/email-challenges/{id}/resend",new{flowToken="wrong"})).StatusCode);
        f.Store.MakeResendable(id);Assert.Equal(HttpStatusCode.Accepted,(await c.PostAsJsonAsync($"/api/v1/email-challenges/{id}/resend",body)).StatusCode);
        f.Sender.Fail=true;Assert.Equal(HttpStatusCode.ServiceUnavailable,(await c.PostAsJsonAsync($"/api/v1/email-challenges/{id}/resend",body)).StatusCode);
        var reset=await Request(f,c,"password-reset-requests","owner@example.com");id=reset["challengeId"]!.GetValue<string>();f.Store.MakeResendable(id);Assert.Equal(HttpStatusCode.Accepted,(await c.PostAsJsonAsync($"/api/v1/email-challenges/{id}/resend",new{flowToken=reset["flowToken"]!.GetValue<string>()})).StatusCode);
    }
    [Fact,Trait("Case","PF-API-032")]
    public async Task ResetRequest_InvalidEmailAndGlobalDependencyFailure_RejectUniformly()
    {
        using var f=new ApiFixture();using var c=f.Native();Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/v1/password-reset-requests",new{email="invalid",clientPlatform="android"})).StatusCode);
        f.Store.FaultCommand="platform.ready";foreach(var email in new[]{"owner@example.com","unknown@example.com"})Assert.Equal(HttpStatusCode.ServiceUnavailable,(await c.PostAsJsonAsync("/api/v1/password-reset-requests",new{email,clientPlatform="android"})).StatusCode);
    }
    [Fact,Trait("Case","PF-API-034"),Trait("Case","PF-API-035"),Trait("Case","PF-API-036")]
    public async Task ResetPassword_SuccessWrongCodeAndFault_PreservesLoginBoundary()
    {
        using var f=new ApiFixture();using var c=f.Native();var m=await Request(f,c,"password-reset-requests","owner@example.com");var p=(Dictionary<string,object?>)Confirm(m,f.Sender.Code,"newPassword");p.Remove("clientPlatform");
        var correct=p["code"];p["code"]="wrong";Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/v1/password-resets",p)).StatusCode);p["code"]=correct;
        f.Store.FaultCommand="account.reset-password";Assert.Equal(HttpStatusCode.ServiceUnavailable,(await c.PostAsJsonAsync("/api/v1/password-resets",p)).StatusCode);f.Store.FaultCommand=null;
        Assert.Equal(HttpStatusCode.NoContent,(await c.PostAsJsonAsync("/api/v1/password-resets",p)).StatusCode);Assert.True(f.Store.Revoked);
        Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/v1/password-resets",p)).StatusCode);
    }
    [Fact,Trait("Case","PF-API-037"),Trait("Case","PF-API-038"),Trait("Case","PF-API-039")]
    public async Task ExternalLogin_FirstAndExistingProofOrInvalidProvider_UsesCorrectStatuses()
    {
        using var f=new ApiFixture();using var c=f.Native();var p=new{credential="new",clientPlatform="android"};
        var first=await c.PostAsJsonAsync("/api/v1/sessions/external/google",p);Assert.Equal(HttpStatusCode.Created,first.StatusCode);var firstBody=await Body(first);Assert.False(firstBody["account"]!["hasLocalPassword"]!.GetValue<bool>());Assert.Contains(firstBody["account"]!["linkedProviders"]!.AsArray(),v=>v!.GetValue<string>()=="google");Assert.NotNull(firstBody["tokens"]!["accessToken"]);Assert.NotNull(firstBody["tokens"]!["refreshToken"]);var account=f.Store.AccountId;
        Assert.Equal(HttpStatusCode.OK,(await c.PostAsJsonAsync("/api/v1/sessions/external/google",p)).StatusCode);Assert.Equal(account,f.Store.AccountId);
        Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/v1/sessions/external/facebook",p)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,(await c.PostAsJsonAsync("/api/v1/sessions/external/google",new{credential="bad",clientPlatform="android"})).StatusCode);
        foreach(var field in new[]{"provider","subject","email"}){var injected=new Dictionary<string,object>{{"credential","new"},{"clientPlatform","android"},{field,"forged"}};Assert.Equal(HttpStatusCode.BadRequest,(await c.PostAsJsonAsync("/api/v1/sessions/external/google",injected)).StatusCode);}
        Assert.Equal(HttpStatusCode.ServiceUnavailable,(await c.PostAsJsonAsync("/api/v1/sessions/external/google",new{credential="unavailable",clientPlatform="android"})).StatusCode);
        f.Store.FaultCommand="session.create";Assert.Equal(HttpStatusCode.ServiceUnavailable,(await c.PostAsJsonAsync("/api/v1/sessions/external/google",p)).StatusCode);
    }
    [Fact,Trait("Case","PF-API-040"),Trait("Case","PF-API-041"),Trait("Case","PF-API-042")]
    public async Task LinkIdentity_AuthenticatedSameEmailOrConflicts_PreservesSession()
    {
        using var f=new ApiFixture();using var c=f.Native(true);var p=new{credential="owner",clientPlatform="android"};var session=f.Store.SessionId;
        Assert.Equal(HttpStatusCode.OK,(await c.PostAsJsonAsync("/api/v1/me/identities/google",p)).StatusCode);Assert.Equal(session,f.Store.SessionId);Assert.False(f.Store.Revoked);
        Assert.Equal(HttpStatusCode.OK,(await c.PostAsJsonAsync("/api/v1/me/identities/google",p)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict,(await c.PostAsJsonAsync("/api/v1/me/identities/google",new{credential="different",clientPlatform="android"})).StatusCode);
        f.Store.FaultCommand="identity.external.link";Assert.Equal(HttpStatusCode.ServiceUnavailable,(await c.PostAsJsonAsync("/api/v1/me/identities/google",p)).StatusCode);
    }
    [Fact,Trait("Case","PF-BDD-013")]
    public async Task LinkIdentity_WebPreservesCookieAndSubsequentGoogleLoginKeepsOwner()
    {
        using var f=new ApiFixture();using var c=f.Native(true,"web");var owner=f.Store.AccountId;var session=f.Store.SessionId;
        var linked=await c.PostAsJsonAsync("/api/v1/me/identities/google",new{credential="owner",clientPlatform="web"});Assert.Equal(HttpStatusCode.OK,linked.StatusCode);var body=await Body(linked);Assert.Equal("google",body["provider"]!.GetValue<string>());Assert.True(body["linked"]!.GetValue<bool>());Assert.False(linked.Headers.Contains("Set-Cookie"));Assert.Equal(session,f.Store.SessionId);Assert.False(f.Store.Revoked);
        var login=await c.PostAsJsonAsync("/api/v1/sessions/external/google",new{credential="owner",clientPlatform="web"});Assert.Equal(HttpStatusCode.OK,login.StatusCode);Assert.Equal(owner,(await Body(login))["account"]!["accountId"]!.GetValue<string>());
    }
    [Fact,Trait("Case","PF-API-046"),Trait("Case","PF-API-047"),Trait("Case","PF-API-048")]
    public async Task UnlinkIdentity_LastLoginMethodWrongPasswordOrFault_ProtectsCredentials()
    {
        using var f=new ApiFixture();using var c=f.Native(true);f.Store.Linked=true;
        Task<HttpResponseMessage> Send(string password)=>c.SendAsync(new(HttpMethod.Delete,"/api/v1/me/identities/google"){Content=JsonContent.Create(new{currentPassword=password})});
        Assert.Equal(HttpStatusCode.Unauthorized,(await Send("A wrong current password")).StatusCode);var original=f.Store.PasswordHash;f.Store.PasswordHash=null;Assert.Equal(HttpStatusCode.Conflict,(await Send("A valid test password")).StatusCode);f.Store.PasswordHash=original;
        f.Store.FaultCommand="identity.external.unlink";Assert.Equal(HttpStatusCode.ServiceUnavailable,(await Send("A valid test password")).StatusCode);Assert.True(f.Store.Linked);f.Store.FaultCommand=null;
        Assert.Equal(HttpStatusCode.NoContent,(await Send("A valid test password")).StatusCode);Assert.False(f.Store.Linked);Assert.True(f.Store.Revoked);
    }
    [Fact,Trait("Case","PF-BDD-014")]
    public async Task UnlinkIdentity_WebClearsBothCookiesAndKeepsPasswordLogin()
    {
        using var f=new ApiFixture();using var c=f.Native(true,"web");f.Store.Linked=true;var owner=f.Store.AccountId;
        var response=await c.SendAsync(new(HttpMethod.Delete,"/api/v1/me/identities/google"){Content=JsonContent.Create(new{currentPassword="A valid test password"})});Assert.Equal(HttpStatusCode.NoContent,response.StatusCode);Assert.False(f.Store.Linked);Assert.True(f.Store.Revoked);
        var cookies=response.Headers.GetValues("Set-Cookie").ToArray();Assert.Equal(2,cookies.Length);Assert.Contains(cookies,s=>s.StartsWith("datinghigh_access_dev=")&&s.Contains("expires=",StringComparison.OrdinalIgnoreCase));Assert.Contains(cookies,s=>s.StartsWith("datinghigh_refresh_dev=")&&s.Contains("expires=",StringComparison.OrdinalIgnoreCase));
        var login=await c.PostAsJsonAsync("/api/v1/sessions",new{email="owner@example.com",password="A valid test password",clientPlatform="web"});Assert.Equal(HttpStatusCode.Created,login.StatusCode);Assert.Equal(owner,(await Body(login))["account"]!["accountId"]!.GetValue<string>());
    }
    [Fact,Trait("Case","PF-API-017")]
    public async Task Refresh_InvalidTokenTypeAndMissingNativeBody_RejectsAuthorization()
    {
        using var f=new ApiFixture();using var c=f.Native(true);foreach(var token in new[]{"",f.Token(),"not-a-refresh"})Assert.Equal(HttpStatusCode.Unauthorized,(await c.PostAsJsonAsync("/api/v1/session/refresh",new{clientPlatform="android",refreshToken=token})).StatusCode);
    }
    [Fact,Trait("Case","PF-UT-047")]
    public async Task Cors_Preflight_OnlyAllowsExactOriginMethodsAndHeaders()
    {
        using var f=new ApiFixture();using var c=f.CreateClient();
        foreach(var origin in new[]{"http://localhost:8081","https://evil.example"})
        {
            using var r=new HttpRequestMessage(HttpMethod.Options,"/api/v1/sessions");r.Headers.Add("Origin",origin);r.Headers.Add("Access-Control-Request-Method","POST");r.Headers.Add("Access-Control-Request-Headers","content-type,x-datinghigh-client");var response=await c.SendAsync(r);
            Assert.Equal(origin=="http://localhost:8081",response.Headers.Contains("Access-Control-Allow-Origin"));
        }
    }
}
