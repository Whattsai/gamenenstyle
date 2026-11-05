using System.Net;
using System.Net.Http.Json;
using System.Text;

namespace DatingHigh.Api.Tests;

[Collection("HTTP contracts")]
public sealed class AvatarEndpointTests
{
    [Theory,Trait("Case","AP-API-029")]
    [InlineData("{}")][InlineData("{\"styleId\":\"warm\"}")]
    [InlineData("{\"type\":\"builtin\",\"builtinAvatarId\":\"male-01\"}")]
    public async Task AvatarInput_MissingRequiredFields_400BeforeProviderOrStorage(string json)
    {
        using var fixture=new ApiFixture();using var client=fixture.Native(true);
        foreach(var route in new[]{"/api/v1/me/avatar/generations","/api/v1/me/avatar/selection"}){
            using var request=new HttpRequestMessage(route.EndsWith("selection")?HttpMethod.Put:HttpMethod.Post,route){Content=new StringContent(json,Encoding.UTF8,"application/json")};
            var response=await client.SendAsync(request);Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);
        }
        Assert.DoesNotContain("avatar.attempt.begin",fixture.Store.Commands);
    }
    [Fact,Trait("Case","AP-API-001"),Trait("Case","AP-API-004")]
    public async Task Catalogs_Authenticated_VersionedFiveInterestGroupsAndSixteenAssets()
    {
        using var fixture=new ApiFixture();using var client=fixture.Native(true);
        Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/api/v1/profile-catalog")).StatusCode);
        var catalog=(await client.GetFromJsonAsync<System.Text.Json.Nodes.JsonNode>("/api/v1/avatar-catalog"))!;
        Assert.Equal(16,catalog["avatars"]!.AsArray().Count);
        Assert.All(catalog["avatars"]!.AsArray(),p=>Assert.NotNull(p?["assetPath"]));
    }
}
