using System.Net;using System.Net.Http.Json;using System.Text.Json.Nodes;using DatingHigh.Domain;
namespace DatingHigh.Api.Tests;
[Collection("HTTP contracts")]
public class LogoutConditionTests
{
    [Theory,Trait("Case","PF-API-023"),Trait("Case","PF-UT-051")]
    [InlineData(false)][InlineData(true)]
    public async Task WebLogout_RefreshCookieChanged_RejectsExpectedFamilyWithoutRevokingOrClearingNewCookies(bool accessPresent)
    {
        using var f=new ApiFixture();using var c=f.Native(platform:"web");var original=f.Store.SessionId;var originalAccess=f.Token();f.Store.RefreshSessionId=EntityId.New();f.Store.RefreshToken=new string('r',43);
        c.DefaultRequestHeaders.Add("Cookie",$"datinghigh_refresh_dev={f.Store.RefreshToken}"+(accessPresent?$"; datinghigh_access_dev={originalAccess}":""));
        using var request=new HttpRequestMessage(HttpMethod.Delete,"/api/v1/session"){Content=JsonContent.Create(new{sessionId=original})};var response=await c.SendAsync(request);
        Assert.Equal(HttpStatusCode.Conflict,response.StatusCode);Assert.Equal("SESSION_CHANGED",(await response.Content.ReadFromJsonAsync<JsonNode>())!["code"]!.GetValue<string>());Assert.False(response.Headers.Contains("Set-Cookie"));Assert.DoesNotContain("session.revoke",f.Store.Commands);Assert.False(f.Store.Revoked);
    }
    [Fact,Trait("Case","PF-API-022")]
    public async Task WebLogout_MatchingRefreshWithoutAccess_RevokesOnlyAuthenticatedFamilyAndClearsCookies()
    {
        using var f=new ApiFixture();using var c=f.Native(platform:"web");f.Store.RefreshToken=new string('r',43);c.DefaultRequestHeaders.Add("Cookie",$"datinghigh_refresh_dev={f.Store.RefreshToken}");
        using var request=new HttpRequestMessage(HttpMethod.Delete,"/api/v1/session"){Content=JsonContent.Create(new{sessionId=f.Store.SessionId})};var response=await c.SendAsync(request);
        Assert.Equal(HttpStatusCode.NoContent,response.StatusCode);Assert.True(f.Store.Revoked);Assert.True(response.Headers.Contains("Set-Cookie"));
    }
    [Fact,Trait("Case","PF-API-023")]
    public async Task WebLogout_ClientSessionIdAloneGrantsNoRevocationAuthority()
    {
        using var f=new ApiFixture();using var c=f.Native(platform:"web");using var request=new HttpRequestMessage(HttpMethod.Delete,"/api/v1/session"){Content=JsonContent.Create(new{sessionId=f.Store.SessionId})};var response=await c.SendAsync(request);
        Assert.Equal(HttpStatusCode.NoContent,response.StatusCode);Assert.DoesNotContain("session.revoke",f.Store.Commands);
    }
    [Fact,Trait("Case","PF-API-023")]
    public async Task Logout_InvalidCondition_RejectsBeforeRevocation()
    {
        using var f=new ApiFixture();using var c=f.Native(true);using var request=new HttpRequestMessage(HttpMethod.Delete,"/api/v1/session"){Content=JsonContent.Create(new{sessionId="invalid"})};var response=await c.SendAsync(request);
        Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);Assert.DoesNotContain("session.revoke",f.Store.Commands);
    }
}
