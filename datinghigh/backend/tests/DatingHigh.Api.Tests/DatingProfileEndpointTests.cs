using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Api.Tests;

/// <summary>AvatarAndPreferences HTTP：驗證既有平台授權與新增完整 JSON 的獨立處理。</summary>
[Collection("HTTP contracts")]
public sealed class DatingProfileEndpointTests
{
    private static object Full(long revision = 1) => new
    {
        expectedRevision = revision, nickname = " 星河旅人 ", bio = "喜歡手作",
        occupation = "工程師", birthDate = "1995-08-12", regionCode = "TW-TPE",
        traitTagIds = new[] { "warm" }, interestTagIds = new[] { "puzzle" },
        topicTagIds = new[] { "creative_chat" }, valueTagIds = new[] { "creativity" },
        weekendPreference = "explore", sleepSchedule = "night_owl", conversationStyle = "warm",
        expectedInteractionFrequency = "weekly", relationshipMode = "friends_first",
        preferredAgeMin = 25, preferredAgeMax = 35,
        preferredRegionCodes = new[] { "TW-TPE" }, sharedInterestWeight = 60
    };

    [Theory,Trait("Case","AP-API-041")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task ProfilePutGet_RetainsAllPreferenceKeysAndRetiredCode_WithoutChangingItsMeaning(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);await client.GetAsync("/api/v1/me/dating-profile");
        using var first=await client.PutAsJsonAsync("/api/v1/me/dating-profile",Full());Assert.Equal(HttpStatusCode.OK,first.StatusCode);
        var options=ProfileCatalog.Groups["interestTagIds"];var index=Array.FindIndex(options,v=>v.Id=="puzzle");var original=options[index];
        try{
            options[index]=original with{Active=false};
            var catalog=(await client.GetFromJsonAsync<JsonNode>("/api/v1/profile-catalog"))!;var retired=catalog["groups"]!["interestTagIds"]!.AsArray().Single(v=>v!["id"]!.GetValue<string>()=="puzzle")!;Assert.False(retired["active"]!.GetValue<bool>());Assert.Equal(original.Label,retired["label"]!.GetValue<string>());
            var update=JsonSerializer.SerializeToNode(Full(2))!;update["bio"]="只改自介保留代碼";
            using var changed=await client.PutAsJsonAsync("/api/v1/me/dating-profile",update);Assert.Equal(HttpStatusCode.OK,changed.StatusCode);
            using var response=await client.GetAsync("/api/v1/me/dating-profile");Assert.Equal(HttpStatusCode.OK,response.StatusCode);Assert.Contains("no-store",response.Headers.CacheControl?.ToString());var read=(await response.Content.ReadFromJsonAsync<JsonNode>())!;
            foreach(var field in update.AsObject().Where(v=>v.Key!="expectedRevision"&&v.Key!="nickname"))Assert.Equal(field.Value?.ToJsonString(),read[field.Key]?.ToJsonString());
            Assert.Equal("星河旅人",read["nickname"]!.GetValue<string>());Assert.Equal(3,read["revision"]!.GetValue<long>());Assert.Equal("puzzle",read["interestTagIds"]![0]!.GetValue<string>());
            foreach(var json in new[]{update.ToJsonString().Replace("\"expectedRevision\":2","\"expectedRevision\":3,\"unexpected\":true"),update.ToJsonString().Replace("\"expectedRevision\":2","\"expectedRevision\":3,\"bio\":\"duplicate\"")}){
                using var invalid=await client.PutAsync("/api/v1/me/dating-profile",new StringContent(json,Encoding.UTF8,"application/json"));Assert.Equal(HttpStatusCode.BadRequest,invalid.StatusCode);Assert.Equal("INVALID_PROFILE",(await invalid.Content.ReadFromJsonAsync<JsonNode>())!["code"]!.GetValue<string>());
            }
            var after=(await client.GetFromJsonAsync<JsonNode>("/api/v1/me/dating-profile"))!;Assert.Equal(3,after["revision"]!.GetValue<long>());Assert.Equal(read.ToJsonString(),after.ToJsonString());
        }finally{options[index]=original;}
    }

    [Fact, Trait("Case", "AP-API-007")]
    public async Task OwnProfileRead_AuthenticatedNative_ReturnsCurrentFieldsWithoutSecrets()
    {
        using var fixture = new ApiFixture();
        using var client = fixture.Native(true);
        var response = await client.GetAsync("/api/v1/me/dating-profile");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = (await response.Content.ReadFromJsonAsync<JsonNode>())!;
        Assert.Equal(1, body["revision"]!.GetValue<long>());
        Assert.False(body["profileReady"]!.GetValue<bool>());
        Assert.Empty(body["personalPhotos"]!.AsArray());
        var json = body.ToJsonString();
        Assert.DoesNotContain("email_normalized", json);
        Assert.DoesNotContain("object_key", json);
        Assert.DoesNotContain("private/", json);
        Assert.Contains("profile.read", fixture.Store.Commands);
    }

    [Theory, Trait("Case", "AP-API-010"), Trait("Case", "AP-API-011")]
    [InlineData("android")]
    [InlineData("web")]
    public async Task OwnProfilePut_AcceptsNestedArraysAndOptimisticRevision(string clientPlatform)
    {
        using var fixture = new ApiFixture();
        using var client = fixture.Native(true, clientPlatform);
        var saved = await client.PutAsJsonAsync("/api/v1/me/dating-profile", Full());
        Assert.Equal(HttpStatusCode.OK, saved.StatusCode);
        var result = (await saved.Content.ReadFromJsonAsync<JsonNode>())!;
        Assert.Equal(2, result["revision"]!.GetValue<long>());
        Assert.Contains("profile.update", fixture.Store.Commands);
        var stale = await client.PutAsJsonAsync("/api/v1/me/dating-profile", Full());
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        var problem = (await stale.Content.ReadFromJsonAsync<JsonNode>())!;
        Assert.Equal("PROFILE_VERSION_CONFLICT", problem["code"]!.GetValue<string>());
    }

    [Fact, Trait("Case", "AP-API-011")]
    public async Task ProfilePut_RejectsUnknownAndDuplicatePropertiesBeforeD1()
    {
        using var fixture = new ApiFixture();
        using var client = fixture.Native(true);
        // JSON serializer 預設將中文字編碼成 \u，透過 ASCII 固定欄位插入重複 nickname。
        var malformed = JsonSerializer.Serialize(Full()).Replace(
            "\"expectedRevision\":1,", "\"expectedRevision\":1,\"nickname\":\"甲乙\",", StringComparison.Ordinal);
        var duplicate = await client.PutAsync("/api/v1/me/dating-profile",
            new StringContent(malformed, Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
        var data = JsonSerializer.SerializeToNode(Full())!.AsObject();
        data["accountId"] = fixture.Store.AccountId;
        var forged = await client.PutAsJsonAsync("/api/v1/me/dating-profile", data);
        Assert.Equal(HttpStatusCode.BadRequest, forged.StatusCode);
        Assert.DoesNotContain("profile.update", fixture.Store.Commands);
    }

    [Fact, Trait("Case", "AP-API-012"), Trait("Case", "AP-API-008")]
    public async Task ProfilePut_EnforcesValidSessionOriginAndOriginalJsonSizePolicy()
    {
        using var fixture = new ApiFixture();
        using var anonymous = fixture.Native();
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await anonymous.GetAsync("/api/v1/me/dating-profile")).StatusCode);
        using var web = fixture.Native(true, "web");
        web.DefaultRequestHeaders.Remove("Origin");
        web.DefaultRequestHeaders.Add("Origin", "https://forged.example");
        Assert.Equal(HttpStatusCode.Forbidden,
            (await web.PutAsJsonAsync("/api/v1/me/dating-profile", Full())).StatusCode);
        using var native = fixture.Native(true);
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge,
            (await native.PutAsync("/api/v1/me/dating-profile",
                new StringContent(new string('x', 17000), Encoding.UTF8, "application/json"))).StatusCode);
        fixture.Store.Revoked = true;
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await native.PutAsJsonAsync("/api/v1/me/dating-profile", Full())).StatusCode);
    }
}
