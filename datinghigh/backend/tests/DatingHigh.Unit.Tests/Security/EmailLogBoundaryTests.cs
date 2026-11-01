using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
using Microsoft.Extensions.Logging;
namespace DatingHigh.Unit.Tests.Security;
public class EmailLogBoundaryTests
{
    private sealed class CaptureFactory:ILoggerFactory
    {
        public readonly List<(string Category,string Text)> Entries=[];
        public ILogger CreateLogger(string categoryName)=>new Capture(categoryName,Entries);
        public void AddProvider(ILoggerProvider provider){}public void Dispose(){}
        private sealed class Capture(string category,List<(string,string)> entries):ILogger
        {
            public IDisposable? BeginScope<TState>(TState state)where TState:notnull=>null;public bool IsEnabled(LogLevel level)=>true;
            public void Log<TState>(LogLevel level,EventId id,TState state,Exception? exception,Func<TState,Exception?,string> formatter)=>entries.Add((category,formatter(state,exception)));
        }
    }
    private sealed class Platform:IPlatformClient
    {
        public int Calls;public Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken cancellationToken=default){Calls++;return Task.FromResult<JsonNode>(new JsonObject());}
    }
    [Fact,Trait("Case","PF-UT-105")]
    public async Task LocalCode_OnlyExplicitLocalLog_UsesDedicatedCategoryAndCloudLogIsRejected()
    {
        var options=new AuthOptions("local","issuer","audience",new byte[32],new byte[32],new byte[32],"http://localhost:8081","Log");var platform=new Platform();using var logs=new CaptureFactory();
        var challenge=JsonNode.Parse("{\"state\":\"active\",\"purpose\":\"register_email\",\"challenge_id\":\"019a281e-0000-7000-8000-000000000001\",\"email_normalized\":\"test@example.com\",\"generation\":0,\"expires_at\":1800000600000}")!;
        await new EmailCodeSender(options,platform,logs).SendAsync(challenge,"000001");Assert.Single(logs.Entries);Assert.Equal("LocalEmailVerification",logs.Entries[0].Category);Assert.Equal(0,platform.Calls);
        logs.Entries.Clear();var cloud=options with{Environment="staging",WebOrigin="https://stage.example.com"};await Assert.ThrowsAsync<DomainException>(()=>new EmailCodeSender(cloud,platform,logs).SendAsync(challenge,"000001"));Assert.Empty(logs.Entries);Assert.False(Readiness.OptionsValid(cloud));
        await new EmailCodeSender(cloud with{EmailDeliveryMode="Cloudflare"},platform,logs).SendAsync(challenge,"000001");Assert.Equal(1,platform.Calls);Assert.Empty(logs.Entries);
        challenge["state"]="consumed";await Assert.ThrowsAsync<DomainException>(()=>new EmailCodeSender(options,platform,logs).SendAsync(challenge,"000001"));Assert.Empty(logs.Entries);
    }
}
