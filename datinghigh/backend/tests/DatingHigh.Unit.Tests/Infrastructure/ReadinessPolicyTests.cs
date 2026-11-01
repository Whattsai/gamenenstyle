using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Infrastructure;
using DatingHigh.Domain;
namespace DatingHigh.Unit.Tests.Infrastructure;
public class ReadinessPolicyTests
{
    private static AuthOptions Options=>new("local","issuer","audience",new byte[32],new byte[32],new byte[32],"http://localhost:8081","Log");
    private sealed class Platform:IPlatformClient
    {
        public string Probe="datinghigh-foundation-v1";public int Calls;
        public Task<JsonNode> ExecuteAsync(string c,object p,CancellationToken ct=default){Calls++;return Task.FromResult<JsonNode>(new JsonObject{["status"]="ready",["probe"]=Probe});}
    }
    [Fact,Trait("Case","PF-UT-076")]
    public async Task EvaluateReady_EnvironmentSchemaSecretsAndSender_RequiresAllDependencies()
    {
        foreach(var bad in new[]{Options with{AccessKey=[]},Options with{EmailKey=new byte[31]},Options with{RateKey=[]},Options with{Environment="staging"},Options with{Environment="production",EmailDeliveryMode="Log",WebOrigin="https://example.com"},Options with{WebOrigin="http://localhost:8081/path"},Options with{Environment="test"}})Assert.False(Readiness.OptionsValid(bad));
        Assert.True(Readiness.OptionsValid(Options));var p=new Platform();await new Readiness(p,Options).CheckAsync();Assert.Equal(1,p.Calls);
        p.Probe="corrupted";Assert.Equal(503,(await Assert.ThrowsAsync<DomainException>(()=>new Readiness(p,Options).CheckAsync())).Status);
    }
}
