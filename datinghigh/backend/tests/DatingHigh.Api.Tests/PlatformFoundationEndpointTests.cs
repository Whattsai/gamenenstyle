using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
namespace DatingHigh.Api.Tests;
[CollectionDefinition("HTTP contracts",DisableParallelization=true)]public class HttpCollection;
[Collection("HTTP contracts")]
public class PlatformFoundationEndpointTests
{
    private static async Task<JsonNode> Body(HttpResponseMessage r)=>(await r.Content.ReadFromJsonAsync<JsonNode>())!;
    [Theory,Trait("Case","PF-API-001")]
    [InlineData("web")][InlineData("ios")][InlineData("android")]
    public async Task RequestEmailRegistration_ValidRequest_ReturnsContractSuccess(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(false,platform);var r=await client.PostAsJsonAsync("/api/v1/email-registrations",new{email="new@example.com",clientPlatform=platform});
        Assert.Equal(HttpStatusCode.Accepted,r.StatusCode);var b=await Body(r);Assert.NotNull(b["challengeId"]);Assert.NotNull(b["flowToken"]);Assert.Null(b["code"]);Assert.DoesNotContain("account.register-email",f.Store.Commands);
    }
    [Fact,Trait("Case","PF-API-002")]
    public async Task RequestEmailRegistration_RejectedInputOrAuthorization_EnforcesContractBoundary()
    {
        using var f=new ApiFixture();using var client=f.Native();
        Assert.Equal(HttpStatusCode.BadRequest,(await client.PostAsJsonAsync("/api/v1/email-registrations",new{email="invalid",clientPlatform="android"})).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync("/api/v1/email-registrations",new{email="owner@example.com",clientPlatform="android"})).StatusCode);
        f.Store.DenyRate=true;var rate=await client.PostAsJsonAsync("/api/v1/email-registrations",new{email="new@example.com",clientPlatform="android"});Assert.Equal(HttpStatusCode.TooManyRequests,rate.StatusCode);Assert.NotNull(rate.Headers.RetryAfter);
    }
    [Fact,Trait("Case","PF-API-003")]
    public async Task RequestEmailRegistration_DependencyOrExecutionFailure_ReturnsHonestFailure()
    {
        using var f=new ApiFixture();using var client=f.Native();f.Sender.Fail=true;var r=await client.PostAsJsonAsync("/api/v1/email-registrations",new{email="new@example.com",clientPlatform="android"});
        Assert.Equal(HttpStatusCode.ServiceUnavailable,r.StatusCode);var failure=await Body(r);Assert.Equal("EMAIL_DELIVERY_FAILED",failure["code"]!.GetValue<string>());Assert.NotNull(failure["recovery"]?["flowToken"]);Assert.NotNull(failure["recovery"]?["challengeId"]);Assert.Null(failure["recovery"]?["code"]);
        f.Store.FaultCommand="rate-limit.consume";var fault=await client.PostAsJsonAsync("/api/v1/email-registrations",new{email="new@example.com",clientPlatform="android"});Assert.Equal(HttpStatusCode.ServiceUnavailable,fault.StatusCode);
    }
    [Fact,Trait("Case","PF-API-004")]
    public async Task ConfirmEmailRegistration_ValidRequest_ReturnsContractSuccess()
    {
        using var f=new ApiFixture();using var client=f.Native();var metadata=await Body(await client.PostAsJsonAsync("/api/v1/email-registrations",new{email="new@example.com",clientPlatform="android"}));
        var response=await client.PostAsJsonAsync("/api/v1/accounts",new{challengeId=metadata["challengeId"]!.GetValue<string>(),flowToken=metadata["flowToken"]!.GetValue<string>(),code=f.Sender.Code,password="A valid test password",clientPlatform="android"});
        Assert.Equal(HttpStatusCode.Created,response.StatusCode);var body=await Body(response);Assert.NotNull(body["tokens"]!["accessToken"]);Assert.Equal("new@example.com",body["account"]!["email"]!.GetValue<string>());Assert.Equal(body["session"]!["sessionId"]!.GetValue<string>(),Assert.Single(response.Headers.GetValues("X-DatingHigh-Session")));
    }
    [Fact,Trait("Case","PF-API-013")]
    public async Task CreatePasswordSession_ValidRequest_ReturnsContractSuccess()
    {
        using var f=new ApiFixture();using var client=f.Native();var old=f.Store.SessionId;
        var response=await client.PostAsJsonAsync("/api/v1/sessions",new{email="owner@example.com",password="A valid test password",clientPlatform="android"});
        Assert.Equal(HttpStatusCode.Created,response.StatusCode);Assert.NotEqual(old,f.Store.SessionId);Assert.True(response.Headers.Contains("X-DatingHigh-Session"));
    }
    [Fact,Trait("Case","PF-API-014")]
    public async Task CreatePasswordSession_RejectedInputOrAuthorization_EnforcesContractBoundary()
    {
        using var f=new ApiFixture();using var client=f.Native();var old=f.Store.SessionId;
        foreach(var email in new[]{"owner@example.com","unknown@example.com"}){var r=await client.PostAsJsonAsync("/api/v1/sessions",new{email,password="A wrong test password",clientPlatform="android"});Assert.Equal(HttpStatusCode.Unauthorized,r.StatusCode);Assert.Equal("INVALID_CREDENTIALS",(await Body(r))["code"]!.GetValue<string>());}
        Assert.Equal(old,f.Store.SessionId);
    }
    [Fact,Trait("Case","PF-API-015")]
    public async Task CreatePasswordSession_DependencyOrExecutionFailure_ReturnsHonestFailure()
    {
        using var f=new ApiFixture();using var client=f.Native();var old=f.Store.SessionId;f.Store.FaultCommand="session.create";
        var r=await client.PostAsJsonAsync("/api/v1/sessions",new{email="owner@example.com",password="A valid test password",clientPlatform="android"});Assert.Equal(HttpStatusCode.ServiceUnavailable,r.StatusCode);Assert.Equal(old,f.Store.SessionId);
        f.Store.FaultCommand=null;f.Store.DenyWrites=true;Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync("/api/v1/sessions",new{email="owner@example.com",password="A valid test password",clientPlatform="android"})).StatusCode);
    }
    [Theory,Trait("Case","PF-API-020"),Trait("Case","PF-API-026"),Trait("Case","PF-API-044")]
    [InlineData("/api/v1/session")][InlineData("/api/v1/me")][InlineData("/api/v1/me/identities")]
    public async Task ProtectedReads_MissingOrRevokedAccess_RejectBeforeHandler(string path)
    {
        using var f=new ApiFixture();using var anonymous=f.Native();Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.GetAsync(path)).StatusCode);
        using var client=f.Native(true);Assert.Equal(HttpStatusCode.OK,(await client.GetAsync(path)).StatusCode);f.Store.Revoked=true;
        var r=await client.GetAsync(path);Assert.Equal(HttpStatusCode.Unauthorized,r.StatusCode);Assert.Equal("SESSION_REVOKED",(await Body(r))["code"]!.GetValue<string>());
    }
    [Fact,Trait("Case","PF-API-025"),Trait("Case","PF-API-043")]
    public async Task OwnerProjection_OnlySafeSummary_RejectsOwnerOverride()
    {
        using var f=new ApiFixture();using var client=f.Native(true);var me=await client.GetAsync("/api/v1/me");var body=await me.Content.ReadAsStringAsync();Assert.Contains("owner@example.com",body);Assert.DoesNotContain("password_hash",body);Assert.DoesNotContain("subject",body);
        Assert.Equal(HttpStatusCode.BadRequest,(await client.GetAsync("/api/v1/me?owner=other")).StatusCode);
        var identities=await Body(await client.GetAsync("/api/v1/me/identities"));Assert.Empty(identities["identities"]!.AsArray());
    }
    [Theory,Trait("Case","PF-API-021"),Trait("Case","PF-API-027"),Trait("Case","PF-API-045")]
    [InlineData("/api/v1/session")][InlineData("/api/v1/me")][InlineData("/api/v1/me/identities")]
    public async Task ProtectedReads_D1Failure_NeverReturnFakeData(string path)
    {
        using var f=new ApiFixture();using var client=f.Native(true);f.Store.FaultCommand="session.validate";var r=await client.GetAsync(path);Assert.Equal(HttpStatusCode.ServiceUnavailable,r.StatusCode);Assert.DoesNotContain("owner@example.com",await r.Content.ReadAsStringAsync());
    }
    [Fact,Trait("Case","PF-API-028")]
    public async Task ChangePassword_ValidRequest_ReturnsContractSuccess()
    {
        using var f=new ApiFixture();using var client=f.Native(true);var r=await client.PutAsJsonAsync("/api/v1/me/password",new{currentPassword="A valid test password",newPassword="A different password"});Assert.Equal(HttpStatusCode.NoContent,r.StatusCode);Assert.Equal(HttpStatusCode.Unauthorized,(await client.GetAsync("/api/v1/me")).StatusCode);
    }
    [Fact,Trait("Case","PF-API-029"),Trait("Case","PF-API-030")]
    public async Task ChangePassword_WrongCurrentOrD1Failure_DoesNotClaimSuccess()
    {
        using var f=new ApiFixture();using var client=f.Native(true);var original=f.Store.PasswordHash;
        Assert.Equal(HttpStatusCode.Unauthorized,(await client.PutAsJsonAsync("/api/v1/me/password",new{currentPassword="A wrong test password",newPassword="A different password"})).StatusCode);
        f.Store.FaultCommand="account.change-password";Assert.Equal(HttpStatusCode.ServiceUnavailable,(await client.PutAsJsonAsync("/api/v1/me/password",new{currentPassword="A valid test password",newPassword="A different password"})).StatusCode);Assert.Equal(original,f.Store.PasswordHash);
    }
    [Fact,Trait("Case","PF-API-031"),Trait("Case","PF-API-033")]
    public async Task RequestReset_KnownUnknownAndSenderFailure_ReturnSamePublicShape()
    {
        using var f=new ApiFixture();using var client=f.Native();f.Sender.Fail=true;var keys=new List<string[]>();
        foreach(var email in new[]{"owner@example.com","unknown@example.com"}){var r=await client.PostAsJsonAsync("/api/v1/password-reset-requests",new{email,clientPlatform="android"});Assert.Equal(HttpStatusCode.Accepted,r.StatusCode);var b=await Body(r);Assert.Equal("若此 Email 可處理，將收到驗證碼",b["message"]!.GetValue<string>());keys.Add(b.AsObject().Select(p=>p.Key).Order().ToArray());}
        Assert.Equal(keys[0],keys[1]);
    }
    [Fact,Trait("Case","PF-API-022"),Trait("Case","PF-API-024")]
    public async Task Logout_AbsentOrValidCredential_IsIdempotentAndHonestOnFailure()
    {
        using var f=new ApiFixture();using var anonymous=f.Native();Assert.Equal(HttpStatusCode.NoContent,(await anonymous.SendAsync(new(HttpMethod.Delete,"/api/v1/session"){Content=JsonContent.Create(new{})})).StatusCode);
        using var client=f.Native(true);f.Store.FaultCommand="session.revoke";Assert.Equal(HttpStatusCode.ServiceUnavailable,(await client.SendAsync(new(HttpMethod.Delete,"/api/v1/session"){Content=JsonContent.Create(new{})})).StatusCode);Assert.False(f.Store.Revoked);
        f.Store.FaultCommand=null;Assert.Equal(HttpStatusCode.NoContent,(await client.SendAsync(new(HttpMethod.Delete,"/api/v1/session"){Content=JsonContent.Create(new{})})).StatusCode);Assert.True(f.Store.Revoked);
    }
    [Fact,Trait("Case","PF-UT-043"),Trait("Case","PF-UT-044"),Trait("Case","PF-UT-046"),Trait("Case","PF-UT-048")]
    public async Task WebTransport_OriginJsonClientHeaderAndCookies_EnforcesAllGuards()
    {
        using var f=new ApiFixture();using var client=f.CreateClient();client.DefaultRequestHeaders.Add("X-DatingHigh-Internal-Client-Ip","127.0.0.1");
        var body=new{email="owner@example.com",password="A valid test password",clientPlatform="web"};
        Assert.Equal(HttpStatusCode.Forbidden,(await client.PostAsJsonAsync("/api/v1/sessions",body)).StatusCode);
        client.DefaultRequestHeaders.Add("Origin","http://localhost:8081");client.DefaultRequestHeaders.Add("X-DatingHigh-Client","web");
        var r=await client.PostAsJsonAsync("/api/v1/sessions",body);Assert.Equal(HttpStatusCode.Created,r.StatusCode);var json=await r.Content.ReadAsStringAsync();Assert.DoesNotContain("accessToken",json);Assert.DoesNotContain("refreshToken",json);
        Assert.All(r.Headers.GetValues("Set-Cookie"),cookie=>{Assert.Contains("httponly",cookie,StringComparison.OrdinalIgnoreCase);Assert.Contains("samesite=strict",cookie,StringComparison.OrdinalIgnoreCase);Assert.DoesNotContain("domain=",cookie,StringComparison.OrdinalIgnoreCase);});
        Assert.Equal(HttpStatusCode.BadRequest,(await client.PostAsJsonAsync("/api/v1/sessions",new{email="owner@example.com",password="A valid test password",clientPlatform="android"})).StatusCode);
    }
    [Fact,Trait("Case","PF-API-005")]
    public async Task JsonBoundary_UnknownDuplicateMalformedOrOversized_RejectsBeforeSideEffects()
    {
        using var f=new ApiFixture();using var client=f.Native();
        foreach(var body in new[]{"{", "{\"email\":\"a@b.com\",\"email\":\"b@c.com\"}","{\"owner\":\"victim\"}","{\"email\":42}"})Assert.Equal(HttpStatusCode.BadRequest,(await client.PostAsync("/api/v1/accounts",new StringContent(body,Encoding.UTF8,"application/json"))).StatusCode);
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge,(await client.PostAsync("/api/v1/accounts",new StringContent(new string('x',16385),Encoding.UTF8,"application/json"))).StatusCode);Assert.DoesNotContain("account.register-email",f.Store.Commands);
    }
    [Fact,Trait("Case","PF-API-049"),Trait("Case","PF-API-052"),Trait("Case","PF-API-054")]
    public async Task Health_SeparateLivenessAndReadiness_FailClosedWithoutLeakage()
    {
        using var f=new ApiFixture();using var client=f.CreateClient();Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/health/live")).StatusCode);Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/health/ready")).StatusCode);
        f.Store.FaultCommand="platform.ready";Assert.Equal(HttpStatusCode.ServiceUnavailable,(await client.GetAsync("/health/ready")).StatusCode);Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/health/live")).StatusCode);
    }
    [Fact,Trait("Case","PF-UT-067"),Trait("Case","PF-API-050")]
    public async Task Routing_SixProtectedRoutesExplicitlyAuthorize_UnknownApiRemains404()
    {
        using var f=new ApiFixture();using var client=f.Native();var endpoints=f.Services.GetRequiredService<EndpointDataSource>().Endpoints;
        Assert.Equal(6,endpoints.Count(e=>e.Metadata.GetOrderedMetadata<IAuthorizeData>().Any(a=>a.Policy=="PlatformAccess")));
        var r=await client.GetAsync("/api/v1/not-existing");Assert.Equal(HttpStatusCode.NotFound,r.StatusCode);Assert.Equal("application/problem+json",r.Content.Headers.ContentType!.MediaType);
    }
}
