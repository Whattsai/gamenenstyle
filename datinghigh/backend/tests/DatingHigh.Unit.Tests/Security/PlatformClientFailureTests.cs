using System.Net;using DatingHigh.Domain;using DatingHigh.Infrastructure;
namespace DatingHigh.Unit.Tests.Security;
public class PlatformClientFailureTests
{
    private sealed class FailureHandler(string mode):HttpMessageHandler
    {
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken cancellationToken)
        {
            if(mode=="timeout"){await Task.Delay(Timeout.Infinite,cancellationToken);throw new InvalidOperationException();}
            if(mode=="network")throw new HttpRequestException("controlled dependency failure");
            return new HttpResponseMessage(HttpStatusCode.OK){Content=new StringContent("{invalid-json")};
        }
    }
    [Theory,Trait("Case","PF-UT-063"),Trait("Case","PF-BDD-041")]
    [InlineData("timeout")][InlineData("network")][InlineData("invalid-json")]
    public async Task PrivateBridge_TimeoutNetworkOrMalformedResponse_FailsClosed(string mode)
    {
        using var http=new HttpClient(new FailureHandler(mode)){BaseAddress=new Uri("http://platform.internal/"),Timeout=TimeSpan.FromMilliseconds(100)};var client=new CloudflarePlatformClient(http);var error=await Assert.ThrowsAsync<DomainException>(()=>client.ExecuteAsync("platform.ready",new{}));Assert.Equal("DEPENDENCY_UNAVAILABLE",error.Code);Assert.Equal(503,error.Status);
    }
}
