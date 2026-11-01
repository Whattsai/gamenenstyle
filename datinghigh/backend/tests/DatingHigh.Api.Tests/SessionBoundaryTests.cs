using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DatingHigh.Domain;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using DatingHigh.Infrastructure;
namespace DatingHigh.Api.Tests;
[Collection("HTTP contracts")]
public class SessionBoundaryTests
{
    [Fact,Trait("Case","PF-API-002"),Trait("Case","PF-API-005")]
    public async Task Json_InvalidEscapedUnicode_Returns400BeforeAnyBusinessOperation()
    {
        using var f=new ApiFixture();using var c=f.Native();using var request=new HttpRequestMessage(HttpMethod.Post,"/api/v1/email-registrations"){Content=new StringContent("{\"email\":\"test\\uD800@example.com\",\"clientPlatform\":\"android\"}",System.Text.Encoding.UTF8,"application/json")};
        var result=await c.SendAsync(request);Assert.Equal(HttpStatusCode.BadRequest,result.StatusCode);Assert.Empty(f.Store.Commands);
    }
    private sealed class EarlierClock:TimeProvider{public override DateTimeOffset GetUtcNow()=>DateTimeOffset.UtcNow.AddMinutes(-5);}
    [Theory,Trait("Case","PF-API-020"),Trait("Case","PF-API-026"),Trait("Case","PF-API-029"),Trait("Case","PF-API-041"),Trait("Case","PF-API-044"),Trait("Case","PF-API-047")]
    [InlineData("GET","/api/v1/session")][InlineData("GET","/api/v1/me")][InlineData("PUT","/api/v1/me/password")][InlineData("POST","/api/v1/me/identities/google")][InlineData("GET","/api/v1/me/identities")][InlineData("DELETE","/api/v1/me/identities/google")]
    public async Task ProtectedRouteMatrix_MissingInvalidExpiredOrRevoked_NeverRunsBusinessHandler(string method,string path)
    {
        using var f=new ApiFixture();using var c=f.Native();var expired=new AccessTokens(f.Services.GetRequiredService<AuthOptions>(),new EarlierClock()).Issue(f.Store.AccountId,f.Store.SessionId,1,DateTimeOffset.UtcNow.AddMinutes(-1));
        foreach(var token in new string?[]{null,"invalid-proof",expired,f.Token()})
        {
            f.Store.Revoked=token is not null&&token!=expired&&token!="invalid-proof";
            c.DefaultRequestHeaders.Authorization=token is null?null:new("Bearer",token);
            using var request=new HttpRequestMessage(new HttpMethod(method),path);if(method!="GET")request.Content=JsonContent.Create(new{});
            var r=await c.SendAsync(request);Assert.Equal(HttpStatusCode.Unauthorized,r.StatusCode);Assert.DoesNotContain(f.Store.Commands,command=>command is "identity.list" or "identity.external.link" or "identity.external.unlink" or "account.change-password" or "rate-limit.consume");
        }
    }
    [Theory,Trait("Case","PF-API-053")]
    [InlineData("ACCESS_TOKEN_SECRET","invalid")][InlineData("WEB_ORIGIN","http://invalid.example")][InlineData("APP_ENV","staging")]
    public async Task Readiness_InvalidSecretsOriginOrCloudLog_RejectsWithoutLeakingConfiguration(string key,string value)
    {
        using var f=new ApiFixture();var previous=Environment.GetEnvironmentVariable(key);Environment.SetEnvironmentVariable(key,value);
        try{using var client=f.CreateClient();if(key=="APP_ENV"){client.DefaultRequestHeaders.Remove("X-DatingHigh-Internal-Environment");client.DefaultRequestHeaders.Add("X-DatingHigh-Internal-Environment",value);}
        var response=await client.GetAsync("/health/ready");Assert.Equal(HttpStatusCode.ServiceUnavailable,response.StatusCode);var body=(await response.Content.ReadFromJsonAsync<JsonNode>())!;Assert.NotNull(body["traceId"]);Assert.Equal("DEPENDENCY_UNAVAILABLE",body["code"]?.GetValue<string>());Assert.DoesNotContain("platform.ready",f.Store.Commands);}
        finally{Environment.SetEnvironmentVariable(key,previous);}
    }
    [Fact,Trait("Case","PF-API-016"),Trait("Case","PF-API-018")]
    public async Task Refresh_NativeContractAndDependencyFault_IssuesOnlyConfirmedPair()
    {
        using var f=new ApiFixture();using var c=f.Native();f.Store.RefreshToken=new string('r',43);
        var p=new{clientPlatform="android",refreshToken=f.Store.RefreshToken};var success=await c.PostAsJsonAsync("/api/v1/session/refresh",p);Assert.Equal(HttpStatusCode.OK,success.StatusCode);var body=(await success.Content.ReadFromJsonAsync<JsonNode>())!;Assert.NotNull(body["tokens"]?["accessToken"]);Assert.NotEqual(f.Store.RefreshToken,body["tokens"]?["refreshToken"]?.GetValue<string>());Assert.True(success.Headers.Contains("X-DatingHigh-Session"));
        f.Store.FaultCommand="session.refresh";var failed=await c.PostAsJsonAsync("/api/v1/session/refresh",p);Assert.Equal(HttpStatusCode.ServiceUnavailable,failed.StatusCode);Assert.DoesNotContain("accessToken",await failed.Content.ReadAsStringAsync());
    }
    [Fact,Trait("Case","PF-API-019")]
    public async Task GetSession_AuthorizedOwner_ReturnsMetadataWithoutRawCredentials()
    {
        using var f=new ApiFixture();using var c=f.Native(true);var r=await c.GetAsync("/api/v1/session");Assert.Equal(HttpStatusCode.OK,r.StatusCode);var b=(await r.Content.ReadFromJsonAsync<JsonNode>())!;Assert.Equal(f.Store.AccountId,b["account"]?["accountId"]?.GetValue<string>());Assert.NotNull(b["tokenMetadata"]?["accessExpiresAt"]);Assert.Null(b["tokens"]);Assert.True(r.Headers.Contains("X-DatingHigh-Session"));
    }
    [Fact,Trait("Case","PF-API-023"),Trait("Case","PF-UT-045")]
    public async Task Logout_DifferentCredentialFamilies_RejectsWithoutAnyRevocation()
    {
        using var f=new ApiFixture();using var c=f.Native(true);f.Store.RefreshToken=new string('r',43);f.Store.RefreshSessionId=EntityId.New();
        using var request=new HttpRequestMessage(HttpMethod.Delete,"/api/v1/session"){Content=JsonContent.Create(new{refreshToken=f.Store.RefreshToken})};var r=await c.SendAsync(request);Assert.Equal(HttpStatusCode.BadRequest,r.StatusCode);Assert.False(f.Store.Revoked);Assert.DoesNotContain("session.revoke",f.Store.Commands);
    }
}
