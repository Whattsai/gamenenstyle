using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;

namespace DatingHigh.Api.Tests;

[Collection("HTTP contracts")]
public sealed class CardPreviewEndpointTests
{
    [Fact,Trait("Case","AP-API-037"),Trait("Case","AP-API-038")]
    public async Task OwnCardPreview_HasExplicitConsentNotice_ExcludesAuthBirthAndPrivatePreferences()
    {
        using var fixture=new ApiFixture();using var client=fixture.Native(true);
        var response=await client.GetAsync("/api/v1/me/card-preview");Assert.Equal(HttpStatusCode.OK,response.StatusCode);
        var body=(await response.Content.ReadFromJsonAsync<JsonNode>())!;
        Assert.Contains("不代表已授權",body["notice"]!.GetValue<string>());
        foreach(var key in new[]{"birthDate","preferredAgeMin","preferredAgeMax","preferredRegionCodes","sharedInterestWeight","email","revision","avatarAttempt"})Assert.Null(body[key]);
        Assert.NotNull(body["personalPhotos"]);
        Assert.Equal(HttpStatusCode.NotFound,(await client.GetAsync("/api/v1/users/other/card")).StatusCode);
        using var anonymous=fixture.Native();Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.GetAsync("/api/v1/me/card-preview")).StatusCode);
    }
}
