using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using DatingHigh.Application.Media;
using DatingHigh.Domain;

namespace DatingHigh.Api.Tests;

[Collection("HTTP contracts")]
public sealed class PersonalMediaEndpointTests
{
    [Theory,Trait("Case","AP-API-025"),Trait("Case","AP-API-027")]
    [InlineData("web")][InlineData("android")][InlineData("ios")]
    public async Task ReadOwnMedia_Authenticated_ReturnsPrivateBytesWithNoStoreNosniff(string platform)
    {
        using var f=new ApiFixture();using var client=f.Native(true,platform);
        var id=EntityId.New();f.Photos.Content[id]=new PrivateMediaContent(new byte[]{1,2,3},"image/jpeg");
        var response=await client.GetAsync("/api/v1/me/media/"+id);
        Assert.Equal(HttpStatusCode.OK,response.StatusCode);
        Assert.Equal("image/jpeg",response.Content.Headers.ContentType?.MediaType);
        Assert.Equal(new byte[]{1,2,3},await response.Content.ReadAsByteArrayAsync());
        Assert.Contains("no-store",response.Headers.CacheControl?.ToString());
        Assert.Equal("nosniff",response.Headers.GetValues("X-Content-Type-Options").Single());
    }

    [Fact,Trait("Case","AP-API-026")]
    public async Task ReadMedia_MissingSessionBadIdAndUnknownAsset_FailClosed()
    {
        using var f=new ApiFixture();using var anonymous=f.Native();using var client=f.Native(true);
        Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.GetAsync("/api/v1/me/media/"+EntityId.New())).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,(await client.GetAsync("/api/v1/me/media/not-id")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await client.GetAsync("/api/v1/me/media/"+EntityId.New())).StatusCode);
    }

    [Fact,Trait("Case","AP-API-040")]
    public async Task UploadMedia_OnlyBinaryPhotoRouteKeeps8MiBLimitAndExactWebOrigin()
    {
        using var f=new ApiFixture();using var native=f.Native(true);using var web=f.Native(true,"web");
        using var huge=new ByteArrayContent(new byte[8*1024*1024+1]);huge.Headers.ContentType=new("image/jpeg");
        Assert.Equal(HttpStatusCode.RequestEntityTooLarge,(await native.PostAsync("/api/v1/me/photos",huge)).StatusCode);
        web.DefaultRequestHeaders.Remove("Origin");web.DefaultRequestHeaders.Add("Origin","https://attacker.invalid");
        using var image=new ByteArrayContent(new byte[]{1,2,3});image.Headers.ContentType=new("image/jpeg");
        Assert.Equal(HttpStatusCode.Forbidden,(await web.PostAsync("/api/v1/me/photos",image)).StatusCode);
        using var json=JsonContent.Create(new{assetId=EntityId.New()});
        Assert.Equal(HttpStatusCode.BadRequest,(await native.PostAsync("/api/v1/me/photos",json)).StatusCode);
        Assert.DoesNotContain("profile.photo.reserve",f.Store.Commands);
    }

    [Fact,Trait("Case","AP-UT-008"),Trait("Case","AP-API-022")]
    public async Task DeletePhoto_CommitTombstoneBeforePhysicalCleanup_StorageFailurePreservesDeletion()
    {
        using var f=new ApiFixture();using var client=f.Native(true);
        await client.GetAsync("/api/v1/me/dating-profile");
        var id=EntityId.New();f.Store.SeedPersonalPhotos([id]);
        f.Photos.Content[id]=new(new byte[]{1},"image/jpeg");
        Assert.Equal(HttpStatusCode.NoContent,(await client.DeleteAsync("/api/v1/me/photos/"+id)).StatusCode);
        Assert.Contains(id,f.Photos.Deleted);Assert.False(f.Photos.Content.ContainsKey(id));
        var second=EntityId.New();f.Store.SeedPersonalPhotos([second]);f.Photos.FailDelete=true;
        Assert.Equal(HttpStatusCode.NoContent,(await client.DeleteAsync("/api/v1/me/photos/"+second)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await client.DeleteAsync("/api/v1/me/photos/"+second)).StatusCode);
    }
}
