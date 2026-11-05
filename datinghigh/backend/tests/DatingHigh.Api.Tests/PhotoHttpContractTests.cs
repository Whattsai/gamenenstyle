using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
using SkiaSharp;

namespace DatingHigh.Api.Tests;

// 真HTTP／Skia壓縮，Repository及R2回覆為受控fixture；SQL原子性／跨owner見真Miniflare整合。
[Collection("HTTP contracts")]
public sealed class PhotoHttpContractTests
{
    private static byte[] Picture(){using var bitmap=new SKBitmap(300,400);var bytes=bitmap.GetPixelSpan();new Random(731).NextBytes(bytes);for(var n=3;n<bytes.Length;n+=4)bytes[n]=255;using var image=SKImage.FromBitmap(bitmap);using var png=image.Encode(SKEncodedImageFormat.Png,100);return png.ToArray();}
    private static ByteArrayContent Binary(byte[] bytes,string mime="image/png"){var content=new ByteArrayContent(bytes);content.Headers.ContentType=new(mime);return content;}
    private static void NoStore(HttpResponseMessage r)=>Assert.Contains("no-store",r.Headers.CacheControl?.ToString());
    private static async Task Problem(HttpResponseMessage r,int status,string code){Assert.Equal(status,(int)r.StatusCode);NoStore(r);Assert.Equal("application/problem+json",r.Content.Headers.ContentType?.MediaType);var dto=(await r.Content.ReadFromJsonAsync<JsonNode>())!;Assert.Equal(code,dto.Text("code"));Assert.Equal(status,dto.Number("status"));Assert.False(string.IsNullOrWhiteSpace(dto.Text("traceId")));foreach(var field in new[]{"objectKey","private/","accountId","sessionId","accessToken","refreshToken"})Assert.DoesNotContain(field,dto.ToJsonString());}

    [Theory,Trait("Case","AP-API-013"),Trait("Case","AP-API-040")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task BinaryPhotoPost_UsesItsOwnLimit_AndReturnsOnlySafeCompressedReadyMetadata(string platform)
    {
        using var f=new ApiFixture();JsonNode? reserved=null;
        f.Store.CommandOverride=(command,p)=>{if(command!="profile.photo.reserve")return null;reserved=p.DeepClone();f.Store.SeedPersonalPhotos([p.Text("assetId")]);return new JsonObject{["rows"]=new JsonArray(new JsonObject{["asset_id"]=p.Text("assetId")})};};
        using var client=f.Native(true,platform);var raw=Picture();Assert.InRange(raw.Length,16385,8*1024*1024);using var body=Binary(raw);
        using var r=await client.PostAsync("/api/v1/me/photos",body);Assert.Equal(HttpStatusCode.Created,r.StatusCode);NoStore(r);Assert.Equal("application/json",r.Content.Headers.ContentType?.MediaType);
        var dto=(await r.Content.ReadFromJsonAsync<JsonNode>())!.AsObject();Assert.Equal(new[]{"assetId","createdAt","displayOrder","mimeType"},dto.Select(v=>v.Key).Order().ToArray());var id=dto.Text("assetId");Assert.True(EntityId.IsValid(id));Assert.Equal("image/jpeg",dto.Text("mimeType"));
        Assert.Equal($"private/{f.Store.AccountId}/photos/{id}",reserved!.Text("objectKey"));var stored=f.Photos.Content[id];Assert.InRange(stored.Bytes.Length,1,200000);Assert.False(raw.AsSpan().SequenceEqual(stored.Bytes.Span));using var decoded=SKBitmap.Decode(stored.Bytes.ToArray());Assert.Equal(300,decoded.Width);Assert.Equal(400,decoded.Height);
        Assert.DoesNotContain("objectKey",dto.ToJsonString());Assert.DoesNotContain("private/",dto.ToJsonString());
    }

    [Theory,Trait("Case","AP-API-014")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task PhotoPost_InvalidHugeFullAndRevoked_ExposeSafeProblemsAndNoStoredBytes(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);using var invalid=Binary([1,2,3]);using var bad=await client.PostAsync("/api/v1/me/photos",invalid);await Problem(bad,400,"INVALID_IMAGE");Assert.DoesNotContain("profile.photo.reserve",f.Store.Commands);
        using var huge=Binary(new byte[8*1024*1024+1]);using var tooLarge=await client.PostAsync("/api/v1/me/photos",huge);await Problem(tooLarge,413,"IMAGE_TOO_LARGE");
        f.Store.SeedPersonalPhotos(Enumerable.Range(0,5).Select(_=>EntityId.New()));f.Store.CommandOverride=(c,p)=>c=="profile.photo.reserve"?new JsonObject{["rows"]=new JsonArray()}:null;
        using var valid=Binary(Picture());using var full=await client.PostAsync("/api/v1/me/photos",valid);await Problem(full,409,"PHOTO_LIMIT_REACHED");
        f.Store.Revoked=true;using var again=Binary(Picture());using var revoked=await client.PostAsync("/api/v1/me/photos",again);await Problem(revoked,401,"SESSION_REVOKED");Assert.Empty(f.Photos.Content);Assert.Empty(f.Photos.Deleted);
    }

    [Theory,Trait("Case","AP-API-015"),Trait("Case","AP-API-021"),Trait("Case","AP-API-040")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task PhotoWrites_EnforceOriginalTransportOriginContentTypeAndJsonLimits(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);
        using var json=JsonContent.Create(new{raw="not an image"});using var badPhoto=await client.PostAsync("/api/v1/me/photos",json);await Problem(badPhoto,400,"INVALID_IMAGE");
        using var wrong=new StringContent("{}",Encoding.UTF8,"text/plain");using var badType=await client.PutAsync("/api/v1/me/photos/order",wrong);await Problem(badType,400,"INVALID_REQUEST");
        using var large=new StringContent(new string('x',16385),Encoding.UTF8,"application/json");using var tooLarge=await client.PutAsync("/api/v1/me/photos/order",large);await Problem(tooLarge,413,"REQUEST_TOO_LARGE");
        client.DefaultRequestHeaders.Remove("Origin");client.DefaultRequestHeaders.Add("Origin","https://attacker.invalid");using var image=Binary(Picture());using var origin=await client.PostAsync("/api/v1/me/photos",image);await Problem(origin,platform=="web"?403:400,platform=="web"?"ORIGIN_FORBIDDEN":"INVALID_PLATFORM");
        Assert.DoesNotContain(f.Store.Commands,c=>c.StartsWith("profile.",StringComparison.Ordinal));Assert.Empty(f.Photos.Content);
        using var swapped=f.Native(false,platform);if(platform=="web")swapped.DefaultRequestHeaders.Authorization=new("Bearer",f.Token());else swapped.DefaultRequestHeaders.Add("Cookie",$"datinghigh_access_dev={f.Token()}");
        using var source=Binary(Picture());using var rejected=await swapped.PostAsync("/api/v1/me/photos",source);await Problem(rejected,401,"ACCESS_TOKEN_MISSING");
    }

    [Theory,Trait("Case","AP-API-020")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task Reorder_InvalidForeignDuplicateAndStale_DoNotChangeListOrRevision(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);await client.GetAsync("/api/v1/me/dating-profile");var ids=new[]{EntityId.New(),EntityId.New(),EntityId.New()};f.Store.SeedPersonalPhotos(ids);
        foreach(var submitted in new[]{new[]{ids[0],ids[1]},new[]{ids[0],ids[1],EntityId.New()},new[]{ids[0],ids[1],ids[1]}}){using var r=await client.PutAsJsonAsync("/api/v1/me/photos/order",new{expectedRevision=1,assetIds=submitted});await Problem(r,submitted.Distinct().Count()!=submitted.Length?400:409,submitted.Distinct().Count()!=submitted.Length?"INVALID_PROFILE":"PROFILE_VERSION_CONFLICT");}
        using var stale=await client.PutAsJsonAsync("/api/v1/me/photos/order",new{expectedRevision=2,assetIds=ids.Reverse().ToArray()});await Problem(stale,409,"PROFILE_VERSION_CONFLICT");
        var profile=(await client.GetFromJsonAsync<JsonNode>("/api/v1/me/dating-profile"))!;Assert.Equal(1,profile.Number("revision"));Assert.Equal(ids,profile["personalPhotos"]!.AsArray().Select(v=>v!.Text("assetId")));
        f.Store.Revoked=true;using var revoked=await client.PutAsJsonAsync("/api/v1/me/photos/order",new{expectedRevision=1,assetIds=ids.Reverse().ToArray()});await Problem(revoked,401,"SESSION_REVOKED");
    }

    [Theory,Trait("Case","AP-API-022")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task Delete_204RemovesCurrentMetadataAndBytes_WithoutAResponseBody(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);await client.GetAsync("/api/v1/me/dating-profile");var ids=new[]{EntityId.New(),EntityId.New(),EntityId.New()};f.Store.SeedPersonalPhotos(ids);f.Photos.Content[ids[1]]=new(new byte[]{1,2,3},"image/jpeg");
        using var request=new HttpRequestMessage(HttpMethod.Delete,$"/api/v1/me/photos/{ids[1]}"){Content=JsonContent.Create(new{})};using var r=await client.SendAsync(request);Assert.Equal(HttpStatusCode.NoContent,r.StatusCode);NoStore(r);Assert.Empty(await r.Content.ReadAsByteArrayAsync());Assert.Contains(ids[1],f.Photos.Deleted);
        var profile=(await client.GetFromJsonAsync<JsonNode>("/api/v1/me/dating-profile"))!;Assert.Equal(2,profile.Number("revision"));Assert.Equal(new[]{ids[0],ids[2]},profile["personalPhotos"]!.AsArray().Select(v=>v!.Text("assetId")));Assert.Equal(new long[]{0,1},profile["personalPhotos"]!.AsArray().Select(v=>v!.Number("displayOrder")));
        using var removed=await client.GetAsync($"/api/v1/me/media/{ids[1]}");await Problem(removed,404,"PHOTO_NOT_FOUND");
    }

    [Theory,Trait("Case","AP-API-026")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task MediaRead_MissingRevokedAndOwnerQuery_DoNotRevealPrivateLocation(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);var id=EntityId.New();using var missing=await client.GetAsync($"/api/v1/me/media/{id}");await Problem(missing,404,"PHOTO_NOT_FOUND");
        using var query=await client.GetAsync($"/api/v1/me/media/{id}?accountId={EntityId.New()}");await Problem(query,400,"INVALID_REQUEST");
        f.Store.Revoked=true;using var revoked=await client.GetAsync($"/api/v1/me/media/{id}");await Problem(revoked,401,"SESSION_REVOKED");Assert.Empty(f.Photos.Content);
    }
}
