using System.Net;
using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Infrastructure.Media;

namespace DatingHigh.Unit.Tests.Infrastructure;

public sealed class AvatarCandidateStoreTests
{
    [Theory]
    [InlineData("{\"code\":\"AVATAR_DUPLICATE_IMAGE\"}","AVATAR_DUPLICATE_IMAGE")]
    [InlineData("{\"code\":\"AVATAR_SOURCE_CHANGED\"}","AVATAR_SOURCE_CHANGED")]
    [InlineData("{\"code\":\"private-untrusted-detail\"}","AVATAR_GENERATION_IN_PROGRESS")]
    [InlineData("not JSON","AVATAR_GENERATION_IN_PROGRESS")]
    public async Task CandidateConflict_PreservesOnlyKnownPrivateErrorCodes(string body,string expected)
    {
        var calls=0;using var http=new HttpClient(new Handler(()=>{calls++;return new(HttpStatusCode.Conflict){Content=new StringContent(body)};})){BaseAddress=new("http://platform.internal/")};
        var store=new AvatarCandidateStore(http);var user=new CurrentUser(EntityId.New(),EntityId.New(),1,long.MaxValue);
        var error=await Assert.ThrowsAsync<DomainException>(()=>store.ReadAsync(user,EntityId.New(),1));
        Assert.Equal(409,error.Status);Assert.Equal(expected,error.Code);Assert.Equal(1,calls);
    }

    [Fact]
    public async Task CandidateConflict_OversizedPrivateBody_IsNotReflectedOrReadWithoutLimit()
    {
        using var http=new HttpClient(new Handler(()=>new(HttpStatusCode.Conflict){Content=new StringContent(new string('x',10000))})){BaseAddress=new("http://platform.internal/")};
        var error=await Assert.ThrowsAsync<DomainException>(()=>new AvatarCandidateStore(http).ReadAsync(new(EntityId.New(),EntityId.New(),1,long.MaxValue),EntityId.New(),1));
        Assert.Equal("AVATAR_GENERATION_IN_PROGRESS",error.Code);
    }
    private sealed class Handler(Func<HttpResponseMessage> response):HttpMessageHandler
    {protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken ct)=>Task.FromResult(response());}
}
