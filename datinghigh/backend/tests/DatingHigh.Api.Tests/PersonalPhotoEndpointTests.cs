using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Api.Tests;

/// <summary>真人照 metadata／排序的 HTTP 安全測試；真 D1 CAS 由 Miniflare 獨立驗證。</summary>
[Collection("HTTP contracts")]
public sealed class PersonalPhotoEndpointTests
{
    private static string[] NewIds()=>[EntityId.New(),EntityId.New(),EntityId.New()];

    [Fact,Trait("Case","AP-API-016")]
    public async Task GetOwnPhotos_ReturnsOnlyOrderedReadyMetadata_WithoutStorageKey()
    {
        using var f=new ApiFixture();using var client=f.Native(true);
        var ids=NewIds();
        f.Store.SeedPersonalPhotos(ids);
        var response=await client.GetAsync("/api/v1/me/photos");
        Assert.Equal(HttpStatusCode.OK,response.StatusCode);
        Assert.Contains("no-store",response.Headers.CacheControl?.ToString());
        var body=(await response.Content.ReadFromJsonAsync<JsonNode>())!;
        var photos=body["photos"]!.AsArray();
        Assert.Equal(3,photos.Count);
        Assert.Equal(ids,photos.Select(p=>p!["assetId"]!.GetValue<string>()));
        Assert.Equal(new[]{0,1,2},photos.Select(p=>p!["displayOrder"]!.GetValue<int>()));
        var serialized=body.ToJsonString();
        Assert.DoesNotContain("objectKey",serialized,StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("private/",serialized,StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("accountId",serialized,StringComparison.OrdinalIgnoreCase);
    }

    [Theory,Trait("Case","AP-API-019"),Trait("Case","AP-API-021")]
    [InlineData("android")]
    [InlineData("web")]
    public async Task ReorderOwnReadyPhotos_AtomicallyReturnsNextRevision(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);
        // D1 的完整排序是在 profile revision 上做 CAS；測試環境建立本人 profile。
        Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/api/v1/me/dating-profile")).StatusCode);
        var ids=NewIds();f.Store.SeedPersonalPhotos(ids);
        var desired=new[]{ids[2],ids[0],ids[1]};
        var result=await client.PutAsJsonAsync("/api/v1/me/photos/order",
            new{expectedRevision=1,assetIds=desired});
        Assert.Equal(HttpStatusCode.OK,result.StatusCode);
        Assert.Equal(2,(await result.Content.ReadFromJsonAsync<JsonNode>())!["revision"]!.GetValue<int>());
        var list=(await (await client.GetAsync("/api/v1/me/photos")).Content.ReadFromJsonAsync<JsonNode>())!;
        Assert.Equal(desired,list["photos"]!.AsArray().Select(p=>p!["assetId"]!.GetValue<string>()));
        Assert.Equal(new[]{0,1,2},list["photos"]!.AsArray().Select(p=>p!["displayOrder"]!.GetValue<int>()));
        Assert.Equal(HttpStatusCode.Conflict,
            (await client.PutAsJsonAsync("/api/v1/me/photos/order",
                new{expectedRevision=1,assetIds=ids})).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict,
            (await client.PutAsJsonAsync("/api/v1/me/photos/order",
                new{expectedRevision=2,assetIds=desired})).StatusCode);
    }

    [Fact,Trait("Case","AP-API-020")]
    public async Task Reorder_RejectsMissingDuplicateForeignAndUnownedIds_WithoutChanges()
    {
        using var f=new ApiFixture();using var client=f.Native(true);
        await client.GetAsync("/api/v1/me/dating-profile");
        var ids=NewIds();f.Store.SeedPersonalPhotos(ids);
        foreach(var invalid in new[]{
            new[]{ids[0],ids[1]},new[]{ids[0],ids[1],ids[1]},
            new[]{ids[0],ids[1],EntityId.New()}
        })
        {
            var response=await client.PutAsJsonAsync("/api/v1/me/photos/order",
                new{expectedRevision=1,assetIds=invalid});
            Assert.True(response.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.Conflict);
        }
        var current=(await (await client.GetAsync("/api/v1/me/photos")).Content.ReadFromJsonAsync<JsonNode>())!;
        Assert.Equal(ids,current["photos"]!.AsArray().Select(p=>p!["assetId"]!.GetValue<string>()));
    }

    [Fact,Trait("Case","AP-API-020")]
    public async Task Reorder_RejectsUnknownFieldsAndDuplicateJsonKeys()
    {
        using var f=new ApiFixture();using var client=f.Native(true);
        var id=EntityId.New();
        foreach(var body in new[]{
            $"{{\"expectedRevision\":1,\"assetIds\":[\"{id}\"],\"accountId\":\"forged\"}}",
            $"{{\"expectedRevision\":1,\"assetIds\":[\"{id}\"],\"assetIds\":[\"{id}\"]}}",
            "{\"expectedRevision\":1,\"assetIds\":[]}",
            "{\"expectedRevision\":0,\"assetIds\":[\"not-an-id\"]}",
            "{\"expectedRevision\":\"1\",\"assetIds\":[]}",
            "{}"
        })
        {
            var response=await client.PutAsync("/api/v1/me/photos/order",
                new StringContent(body,Encoding.UTF8,"application/json"));
            Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);
            Assert.Equal("INVALID_PROFILE",(await response.Content.ReadFromJsonAsync<JsonNode>())!["code"]!.GetValue<string>());
        }
        Assert.DoesNotContain("profile.photo.reorder",f.Store.Commands);
    }

    [Fact,Trait("Case","AP-API-022")]
    public async Task DeleteOwnReadyPhoto_SoftDeletesAndCompactsRemainingMetadata()
    {
        using var f=new ApiFixture();using var client=f.Native(true);
        Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/api/v1/me/dating-profile")).StatusCode);
        var ids=NewIds();f.Store.SeedPersonalPhotos(ids);
        var removed=await client.DeleteAsync("/api/v1/me/photos/"+ids[1]);
        Assert.Equal(HttpStatusCode.NoContent,removed.StatusCode);
        var current=(await (await client.GetAsync("/api/v1/me/photos")).Content.ReadFromJsonAsync<JsonNode>())!;
        Assert.Equal(new[]{ids[0],ids[2]},
            current["photos"]!.AsArray().Select(p=>p!["assetId"]!.GetValue<string>()));
        Assert.Equal(new[]{0,1},current["photos"]!.AsArray().Select(p=>p!["displayOrder"]!.GetValue<int>()));
        var profile=(await (await client.GetAsync("/api/v1/me/dating-profile")).Content.ReadFromJsonAsync<JsonNode>())!;
        Assert.Equal(2,profile["revision"]!.GetValue<int>());
        // 重複刪除不得回假成功，已刪照不可經 GET 列出。
        Assert.Equal(HttpStatusCode.NotFound,(await client.DeleteAsync("/api/v1/me/photos/"+ids[1])).StatusCode);
    }

    [Fact,Trait("Case","AP-API-023")]
    public async Task DeletePhoto_GuessedIdRevocationAndMalformedId_NeverMutateOtherPhotos()
    {
        using var f=new ApiFixture();using var client=f.Native(true);
        await client.GetAsync("/api/v1/me/dating-profile");
        var ids=NewIds();f.Store.SeedPersonalPhotos(ids);
        Assert.Equal(HttpStatusCode.NotFound,
            (await client.DeleteAsync("/api/v1/me/photos/"+EntityId.New())).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,
            (await client.DeleteAsync("/api/v1/me/photos/not-valid")).StatusCode);
        f.Store.Revoked=true;
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.DeleteAsync("/api/v1/me/photos/"+ids[0])).StatusCode);
        f.Store.Revoked=false;
        var list=(await (await client.GetAsync("/api/v1/me/photos")).Content.ReadFromJsonAsync<JsonNode>())!;
        Assert.Equal(ids,list["photos"]!.AsArray().Select(p=>p!["assetId"]!.GetValue<string>()));
    }

    [Fact,Trait("Case","AP-API-024")]
    public async Task DeletePhoto_WebRequiresOriginalStrictOriginAndJsonCsrf()
    {
        using var f=new ApiFixture();using var web=f.Native(true,"web");
        await web.GetAsync("/api/v1/me/dating-profile");
        var ids=NewIds();f.Store.SeedPersonalPhotos(ids);
        // 原 Foundation 寫入的 Web CSRF 閘門：Origin + X-DatingHigh-Client + JSON。
        using(var request=new HttpRequestMessage(HttpMethod.Delete,"/api/v1/me/photos/"+ids[0])){
            request.Content=JsonContent.Create(new{});
            Assert.Equal(HttpStatusCode.NoContent,(await web.SendAsync(request)).StatusCode);
        }
        web.DefaultRequestHeaders.Remove("Origin");
        web.DefaultRequestHeaders.Add("Origin","https://forged.example");
        using var forged=new HttpRequestMessage(HttpMethod.Delete,"/api/v1/me/photos/"+ids[1]);
        forged.Content=JsonContent.Create(new{});
        Assert.Equal(HttpStatusCode.Forbidden,(await web.SendAsync(forged)).StatusCode);
    }

    [Fact,Trait("Case","AP-API-017"),Trait("Case","AP-API-018"),Trait("Case","AP-API-021")]
    public async Task Photos_ReadWriteRequireSessionAndExactWebOrigin_KeepFoundationLimits()
    {
        using var f=new ApiFixture();using var anonymous=f.Native();
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await anonymous.GetAsync("/api/v1/me/photos")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await anonymous.PutAsJsonAsync("/api/v1/me/photos/order",
                new{expectedRevision=1,assetIds=new[]{EntityId.New()}})).StatusCode);
        using var web=f.Native(true,"web");
        web.DefaultRequestHeaders.Remove("Origin");
        web.DefaultRequestHeaders.Add("Origin","https://attacker.invalid");
        Assert.Equal(HttpStatusCode.Forbidden,
            (await web.PutAsJsonAsync("/api/v1/me/photos/order",
                new{expectedRevision=1,assetIds=new[]{EntityId.New()}})).StatusCode);
        using var native=f.Native(true);
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge,
            (await native.PutAsync("/api/v1/me/photos/order",
                new StringContent(new string('z',17000),Encoding.UTF8,"application/json"))).StatusCode);
        f.Store.Revoked=true;
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await native.GetAsync("/api/v1/me/photos")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await native.PutAsJsonAsync("/api/v1/me/photos/order",
                new{expectedRevision=1,assetIds=new[]{EntityId.New()}})).StatusCode);
    }
}
