using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Api.Tests;

/// <summary>HTTP契約及Cookie／Bearer邊界；不作真SQL或原生UI的替代證據。</summary>
[Collection("HTTP contracts")]
public sealed class ProfileReadContractTests
{
    [Theory,Trait("Case","AP-API-007"),Trait("Case","AP-API-009"),Trait("Case","AP-API-018")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task OwnProfileAndPhotoReads_ReturnExactSafeFieldsAndOrderedCurrentMetadata(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);var ids=new[]{EntityId.New(),EntityId.New()};f.Store.SeedPersonalPhotos(ids);
        using var response=await client.GetAsync("/api/v1/me/dating-profile");Assert.Equal(HttpStatusCode.OK,response.StatusCode);Assert.Contains("no-store",response.Headers.CacheControl?.ToString());
        var dto=(await response.Content.ReadFromJsonAsync<JsonNode>())!.AsObject();
        var expected=new[]{"nickname","bio","occupation","birthDate","regionCode","traitTagIds","interestTagIds","topicTagIds","valueTagIds","weekendPreference","sleepSchedule","conversationStyle","expectedInteractionFrequency","relationshipMode","preferredAgeMin","preferredAgeMax","preferredRegionCodes","sharedInterestWeight","avatarAttempt","avatarAttemptUnavailable","selectedAvatarType","selectedAvatarRef","revision","personalPhotos","generatedAvatars","profileReady"};
        Assert.Equal(expected.Order().ToArray(),dto.Select(p=>p.Key).Order().ToArray());Assert.Equal(1,dto["revision"]!.GetValue<long>());Assert.False(dto["profileReady"]!.GetValue<bool>());Assert.Null(dto["avatarAttempt"]);Assert.Empty(dto["generatedAvatars"]!.AsArray());
        using var photos=await client.GetAsync("/api/v1/me/photos");Assert.Equal(HttpStatusCode.OK,photos.StatusCode);Assert.Contains("no-store",photos.Headers.CacheControl?.ToString());var list=(await photos.Content.ReadFromJsonAsync<JsonNode>())!["photos"]!.AsArray();
        Assert.Equal(dto["personalPhotos"]!.ToJsonString(),list.ToJsonString());Assert.Equal(ids,list.Select(p=>p!["assetId"]!.GetValue<string>()));Assert.Equal(new[]{0,1},list.Select(p=>p!["displayOrder"]!.GetValue<int>()));
        foreach(var photo in list)Assert.Equal(new[]{"assetId","createdAt","displayOrder","mimeType"},photo!.AsObject().Select(p=>p.Key).Order().ToArray());
        var json=dto.ToJsonString();foreach(var forbidden in new[]{"accountId","sessionId","objectKey","email","private/","accessToken","refreshToken"})Assert.DoesNotContain(forbidden,json,StringComparison.OrdinalIgnoreCase);
    }

    [Theory,Trait("Case","AP-API-001"),Trait("Case","AP-API-003"),Trait("Case","AP-API-004"),Trait("Case","AP-API-006")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task Catalogs_WebCookieAndNativeBearer_ReturnCompleteVersionedSafeDto(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);
        using var profile=await client.GetAsync("/api/v1/profile-catalog");Assert.Equal(HttpStatusCode.OK,profile.StatusCode);
        Assert.Contains("no-store",profile.Headers.CacheControl?.ToString());Assert.Equal("application/json",profile.Content.Headers.ContentType?.MediaType);
        var dto=(await profile.Content.ReadFromJsonAsync<JsonNode>())!.AsObject();Assert.Equal(new[]{"groups","version"},dto.Select(p=>p.Key).Order().ToArray());Assert.False(string.IsNullOrWhiteSpace(dto["version"]!.GetValue<string>()));
        var groups=dto["groups"]!.AsObject();Assert.Equal(new[]{"conversationStyle","expectedInteractionFrequency","interestTagIds","regionCode","relationshipMode","sleepSchedule","topicTagIds","traitTagIds","valueTagIds","weekendPreference"},groups.Select(p=>p.Key).Order().ToArray());
        foreach(var group in groups){var options=group.Value!.AsArray();Assert.NotEmpty(options);var ids=options.Select(v=>v!["id"]!.GetValue<string>()).ToArray();Assert.Equal(ids.Length,ids.Distinct().Count());foreach(var option in options){Assert.False(string.IsNullOrWhiteSpace(option!["label"]!.GetValue<string>()));Assert.True(option["active"]!.GetValue<bool>());}}
        Assert.Equal(new[]{"culture","food","outdoor","psychology","screen"},groups["interestTagIds"]!.AsArray().Select(v=>v!["category"]!.GetValue<string>()).Distinct().Order().ToArray());
        using var avatars=await client.GetAsync("/api/v1/avatar-catalog");Assert.Equal(HttpStatusCode.OK,avatars.StatusCode);Assert.Contains("no-store",avatars.Headers.CacheControl?.ToString());
        var catalog=(await avatars.Content.ReadFromJsonAsync<JsonNode>())!;Assert.Equal("2026-11-03.v2",catalog["version"]!.GetValue<string>());var list=catalog["avatars"]!.AsArray();Assert.Equal(16,list.Count);
        Assert.Equal(16,list.Select(v=>v!["id"]!.GetValue<string>()).Distinct().Count());
        foreach(var group in new[]{"male","female"})Assert.Equal(8,list.Count(v=>v!["group"]!.GetValue<string>()==group));
        foreach(var item in list){var id=item!["id"]!.GetValue<string>();Assert.True(BuiltinAvatarCatalog.Contains(id));Assert.Equal($"/avatars/{id}.jpg",item["assetPath"]!.GetValue<string>());Assert.Equal("3:4",item["aspectRatio"]!.GetValue<string>());}
        foreach(var result in new[]{dto.ToJsonString(),catalog.ToJsonString()}){Assert.DoesNotContain(f.Store.Email,result);Assert.DoesNotContain("private/",result);Assert.DoesNotContain("objectKey",result);}
        Assert.DoesNotContain(f.Store.Commands,c=>c.StartsWith("profile.",StringComparison.Ordinal)||c.StartsWith("avatar.attempt.",StringComparison.Ordinal));
    }

    [Theory,Trait("Case","AP-API-002"),Trait("Case","AP-API-005"),Trait("Case","AP-API-008"),Trait("Case","AP-API-017")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task OwnGetRoutes_RejectRevocationAndOwnerQueryWithoutWritesOrPrivateDto(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);
        var routes=new[]{"profile-catalog","avatar-catalog","me/dating-profile","me/photos","me/card-preview","me/media/019a281e-0000-7000-8000-000000000010","me/avatar/candidates/019a281e-0000-7000-8000-000000000050/1"};
        foreach(var route in routes){using var queried=await client.GetAsync($"/api/v1/{route}?accountId={EntityId.New()}");await Problem(queried,HttpStatusCode.BadRequest,"INVALID_REQUEST");}
        Assert.Empty(f.Store.Commands);
        f.Store.Revoked=true;
        foreach(var route in routes){using var response=await client.GetAsync($"/api/v1/{route}");await Problem(response,HttpStatusCode.Unauthorized,"SESSION_REVOKED");}
        Assert.All(f.Store.Commands,c=>Assert.Equal("session.validate",c));
        using var anonymous=f.Native(false,platform);foreach(var route in routes){using var response=await anonymous.GetAsync($"/api/v1/{route}");await Problem(response,HttpStatusCode.Unauthorized,"ACCESS_TOKEN_MISSING");}
    }

    [Theory,Trait("Case","AP-API-003"),Trait("Case","AP-API-006"),Trait("Case","AP-API-009"),Trait("Case","AP-API-018")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task OwnGetRoutes_RejectBodyAndKeepOriginalGlobalJsonLimit(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);
        foreach(var route in new[]{"profile-catalog","avatar-catalog","me/dating-profile","me/photos","me/card-preview","me/media/019a281e-0000-7000-8000-000000000010","me/avatar/candidates/019a281e-0000-7000-8000-000000000050/1"}){
            using var request=new HttpRequestMessage(HttpMethod.Get,$"/api/v1/{route}"){Content=new StringContent("{\"accountId\":\"forged\"}",Encoding.UTF8,"application/json")};
            using var rejected=await client.SendAsync(request);await Problem(rejected,HttpStatusCode.BadRequest,"INVALID_REQUEST");
            using var oversized=new HttpRequestMessage(HttpMethod.Get,$"/api/v1/{route}"){Content=new StringContent(new string('x',16385),Encoding.UTF8,"application/json")};
            using var tooLarge=await client.SendAsync(oversized);await Problem(tooLarge,HttpStatusCode.RequestEntityTooLarge,"REQUEST_TOO_LARGE");
        }
        Assert.DoesNotContain(f.Store.Commands,c=>c.StartsWith("profile.",StringComparison.Ordinal)||c.StartsWith("avatar.attempt.",StringComparison.Ordinal));
    }

    [Theory,Trait("Case","AP-API-003"),Trait("Case","AP-API-006"),Trait("Case","AP-API-009"),Trait("Case","AP-API-018")]
    [InlineData("profile-catalog")][InlineData("avatar-catalog")][InlineData("me/dating-profile")][InlineData("me/photos")]
    [InlineData("me/card-preview")][InlineData("me/media/019a281e-0000-7000-8000-000000000010")][InlineData("me/avatar/candidates/019a281e-0000-7000-8000-000000000050/1")]
    public async Task OwnGetRoutes_DoNotSwapWebCookieAndNativeBearerOrLetOriginPretendNative(string route)
    {
        using var f=new ApiFixture();using var web=f.Native(false,"web");web.DefaultRequestHeaders.Authorization=new("Bearer",f.Token());
        using var webRejected=await web.GetAsync($"/api/v1/{route}");await Problem(webRejected,HttpStatusCode.Unauthorized,"ACCESS_TOKEN_MISSING");
        foreach(var platform in new[]{"android","ios"}){
            using var native=f.Native(false,platform);native.DefaultRequestHeaders.Add("Cookie",$"datinghigh_access_dev={f.Token()}");
            using var cookieRejected=await native.GetAsync($"/api/v1/{route}");await Problem(cookieRejected,HttpStatusCode.Unauthorized,"ACCESS_TOKEN_MISSING");
            native.DefaultRequestHeaders.Authorization=new("Bearer",f.Token());native.DefaultRequestHeaders.Add("Origin","http://localhost:8081");
            using var disguised=await native.GetAsync($"/api/v1/{route}");await Problem(disguised,HttpStatusCode.BadRequest,"INVALID_PLATFORM");
        }
        Assert.Empty(f.Store.Commands);
    }

    private static async Task Problem(HttpResponseMessage response,HttpStatusCode status,string code)
    {
        Assert.Equal(status,response.StatusCode);Assert.Equal("application/problem+json",response.Content.Headers.ContentType?.MediaType);Assert.Contains("no-store",response.Headers.CacheControl?.ToString());
        var problem=(await response.Content.ReadFromJsonAsync<JsonNode>())!;Assert.Equal((int)status,problem["status"]!.GetValue<int>());Assert.Equal(code,problem["code"]!.GetValue<string>());Assert.False(string.IsNullOrEmpty(problem["traceId"]!.GetValue<string>()));
        Assert.Null(problem["accountId"]);Assert.Null(problem["personalPhotos"]);Assert.Null(problem["objectKey"]);
    }
}
