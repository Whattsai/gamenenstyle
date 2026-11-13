using System.Net;
using System.Text;
using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Api.Tests;

[Collection("HTTP contracts")]
public sealed class AvatarExpressionEndpointTests
{
    [Theory]
    [InlineData("begin","{}")]
    [InlineData("next","{\"workflowId\":\"../foreign\",\"expression\":\"smile\",\"clientRequestId\":\"invalid\"}")]
    [InlineData("cancel","{\"workflowId\":\"invalid\",\"ownerAccountId\":\"foreign\"}")]
    [InlineData("begin","{\"index\":1,\"index\":2}")]
    public async Task InvalidForegroundPayload_RejectsBeforePrivateStoreOrProvider(string action,string body)
    {
        using var fixture=new ApiFixture();using var client=fixture.Native(true);
        var response=await client.PostAsync($"/api/v1/me/avatar/expressions/{action}",new StringContent(body,Encoding.UTF8,"application/json"));
        Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);
        Assert.DoesNotContain(fixture.Store.Commands,c=>c.StartsWith("avatar.attempt.expression.",StringComparison.Ordinal));
        Assert.Contains("no-store",response.Headers.CacheControl?.ToString());
    }

    [Fact]
    public async Task UnauthenticatedStatus_CannotReadAnyAdoption()
    {
        using var fixture=new ApiFixture();using var client=fixture.Native();
        Assert.Equal(HttpStatusCode.Unauthorized,(await client.GetAsync("/api/v1/me/avatar/expressions")).StatusCode);
        Assert.DoesNotContain("avatar.attempt.expression.status",fixture.Store.Commands);
    }
    [Fact]
    public async Task PartnerProjection_HttpUsesAuthenticatedRoundAndDoesNotExposePrivatePackFields()
    {
        using var fixture=new ApiFixture();var round=EntityId.New();var called=false;
        fixture.Store.CommandOverride=(command,payload)=>{
            if(command!="avatar.round.projection")return null;called=true;
            Assert.Equal(round,payload["roundId"]!.GetValue<string>());Assert.Equal(fixture.Store.AccountId,payload["accountId"]!.GetValue<string>());
            return JsonNode.Parse("{\"avatarAssetId\":\"safe-asset\",\"avatarVersion\":\"safe-version\",\"ownerAccountId\":\"private-owner\",\"expressions\":{\"neutral\":{\"url\":\"/authorized\",\"objectKey\":\"private/key\"}}}");
        };
        using var client=fixture.Native(true);var response=await client.GetAsync($"/api/v1/game-rounds/{round}/partner-avatar");
        Assert.Equal(HttpStatusCode.OK,response.StatusCode);Assert.True(called);
        var body=await response.Content.ReadAsStringAsync();Assert.DoesNotContain("private",body);Assert.Contains("/authorized",body);
        Assert.Contains("no-store",response.Headers.CacheControl?.ToString());
    }
    [Theory]
    [InlineData("wrong-version","neutral")][InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","angry")]
    public async Task InvalidPrivateMediaRoute_RejectsBeforeStorage(string version,string expression)
    {
        using var fixture=new ApiFixture();using var client=fixture.Native(true);
        var response=await client.GetAsync($"/api/v1/game-rounds/{EntityId.New()}/partner-avatar/{version}/{expression}");
        Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);
    }
}
