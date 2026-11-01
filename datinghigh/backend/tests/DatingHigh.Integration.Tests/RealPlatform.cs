using System.Diagnostics;using System.Text.Json;using System.Text.Json.Nodes;
using DatingHigh.Application;using DatingHigh.Domain;using DatingHigh.Infrastructure;
using Microsoft.Extensions.Logging.Abstractions;using Microsoft.Extensions.Time.Testing;
using Microsoft.Extensions.Logging;
namespace DatingHigh.Integration.Tests;

internal sealed class RealPlatform:IPlatformClient,IAsyncDisposable
{
    private static readonly string Root=FindRoot();private static readonly string Runner=BuildRunner();
    private readonly Process process;private readonly Task<string> stderr;private readonly SemaphoreSlim io=new(1);
    public readonly FakeTimeProvider Clock=new(new DateTimeOffset(2026,10,29,0,0,0,TimeSpan.Zero));
    public readonly AuthOptions Options=new("local","integration-issuer","integration-audience",new byte[32],Enumerable.Repeat((byte)1,32).ToArray(),Enumerable.Repeat((byte)2,32).ToArray(),"http://localhost:8081","Log");
    public readonly ControlledSender Sender=new();public const string Password="A real D1 integration password";public const string Email="owner@example.com";
    private int mailCalls;public int MailCalls=>Volatile.Read(ref mailCalls);public readonly List<string> DeliveryWarnings=[];
    public AuthApplication App=>new(this,new PasswordHashService(),new AccessTokens(Options,Clock),new LeadingZeroCode(Options),Clock,new RateLimiter(this,Options,Clock),Sender,new ControlledExternal(),NullLogger<AuthApplication>.Instance);
    public AuthApplication CloudApp{
        get{var cloud=Options with{Environment="staging",EmailDeliveryMode="Cloudflare",WebOrigin="https://staging.test.invalid"};return new(this,new PasswordHashService(),new AccessTokens(cloud,Clock),new LeadingZeroCode(cloud),Clock,new RateLimiter(this,cloud,Clock),new EmailCodeSender(cloud,this,NullLoggerFactory.Instance),new ControlledExternal(),new WarningLog(DeliveryWarnings));}
    }
    public Task<JsonNode> Provider(string mode,bool reset=true)=>ExecuteAsync("$test-provider",new{mode,reset});
    public Task<JsonNode> ProviderStats()=>ExecuteAsync("$test-provider-stats",new{});
    public RealPlatform()
    {
        var utf8=new System.Text.UTF8Encoding(false,true);
        var start=new ProcessStartInfo("node"){RedirectStandardInput=true,RedirectStandardOutput=true,RedirectStandardError=true,StandardInputEncoding=utf8,StandardOutputEncoding=utf8,StandardErrorEncoding=utf8,UseShellExecute=false,CreateNoWindow=true};start.ArgumentList.Add(Runner);start.ArgumentList.Add(Root);
        process=Process.Start(start)??throw new InvalidOperationException("Cannot start isolated D1 runner");stderr=process.StandardError.ReadToEndAsync();
        if(process.StandardOutput.ReadLine()!="{\"ready\":true}")throw new InvalidOperationException("Isolated D1 runner did not start");
    }
    private static string FindRoot(){var directory=new DirectoryInfo(AppContext.BaseDirectory);while(directory is not null){if(File.Exists(Path.Combine(directory.FullName,"cloudflare","wrangler.jsonc")))return directory.FullName;directory=directory.Parent;}throw new InvalidOperationException("Foundation root not found");}
    private static string BuildRunner()
    {
        var output=Path.Combine(Root,"cloudflare","node_modules",".cache","foundation-test-runner.cjs");Directory.CreateDirectory(Path.GetDirectoryName(output)!);
        var info=new ProcessStartInfo("node"){WorkingDirectory=Root,RedirectStandardOutput=true,RedirectStandardError=true,UseShellExecute=false,CreateNoWindow=true};
        foreach(var argument in new[]{Path.Combine(Root,"cloudflare","node_modules","esbuild","bin","esbuild"),"tests/integration/platform-runner.ts","--bundle","--platform=node","--format=cjs","--packages=external",$"--outfile={output}"})info.ArgumentList.Add(argument);
        using var build=Process.Start(info)??throw new InvalidOperationException("Cannot compile D1 test runner");var outputRead=build.StandardOutput.ReadToEndAsync();var errorRead=build.StandardError.ReadToEndAsync();build.WaitForExit();Task.WaitAll(outputRead,errorRead);if(build.ExitCode!=0)throw new InvalidOperationException("D1 test runner compilation failed");return output;
    }
    public async Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken cancellationToken=default)
    {
        await io.WaitAsync(cancellationToken);try{
            await process.StandardInput.WriteLineAsync(JsonSerializer.Serialize(new{command,payload,now=Clock.GetUtcNow().ToUnixTimeMilliseconds()}));await process.StandardInput.FlushAsync();
            if(command=="email.code.send")Interlocked.Increment(ref mailCalls);
            // A cancelled sender may finish late; drain its private IPC response before accepting another command.
            var line=await process.StandardOutput.ReadLineAsync().WaitAsync(TimeSpan.FromSeconds(20));var envelope=line is null?null:JsonNode.Parse(line);
            if(envelope?["error"] is JsonObject error)throw new DomainException(error.Maybe("code")??"DEPENDENCY_UNAVAILABLE",(int)error.Number("status"));
            if(envelope?["result"] is not JsonNode result)throw new DomainException("DEPENDENCY_UNAVAILABLE",503);return result.DeepClone();
        }finally{io.Release();}
    }
    public async Task<JsonArray> Sql(string sql,params object?[] values)=>(await ExecuteAsync("$test-sql",new{sql,values}))["rows"]!.AsArray();
    public async Task Seed(bool localPassword,string? email=null){var normalized=EmailAddress.Normalize(email??Email);var time=Clock.GetUtcNow().ToUnixTimeMilliseconds();var account=EntityId.New();await Sql("INSERT INTO auth_accounts VALUES(?,?,?,?,?,?,?,?)",account,normalized,time,localPassword?new PasswordHashService().Hash(Password):null,"active",1,time,time);if(!localPassword)await Sql("INSERT INTO auth_external_identities VALUES(?,?,?,?,?)",EntityId.New(),account,"google","controlled-google-only-subject",time);}
    public static JsonNode Json(object value)=>JsonSerializer.SerializeToNode(value)!;
    public async Task<JsonNode> Request(string purpose="register_email")=>Json(await App.RequestCode(Email,"android",purpose,"127.0.0.1",default));
    public async ValueTask DisposeAsync(){process.StandardInput.Close();using var deadline=new CancellationTokenSource(TimeSpan.FromSeconds(10));try{await process.WaitForExitAsync(deadline.Token);}catch(OperationCanceledException){process.Kill(true);}await stderr;process.Dispose();io.Dispose();}
    internal sealed class ControlledSender:IEmailCodeSender
    {
        public int Calls;public string Mode="success",LastCode="";
        public Task SendAsync(JsonNode challenge,string code,CancellationToken cancellationToken=default){Interlocked.Increment(ref Calls);LastCode=code;return Mode switch{"failure"=>Task.FromException(new HttpRequestException("Controlled sender rejection")),"timeout"=>Task.Delay(Timeout.Infinite,cancellationToken),_=>Task.CompletedTask};}
    }
    private sealed class ControlledExternal:IExternalCredentialValidator{public Task<VerifiedExternalIdentity> ValidateAsync(string provider,string platform,string credential,CancellationToken cancellationToken=default)=>throw new InvalidOperationException("Real Google is outside this isolated test");}
    private sealed class WarningLog(List<string> messages):ILogger<AuthApplication>
    {
        public IDisposable? BeginScope<TState>(TState state)where TState:notnull=>null;public bool IsEnabled(LogLevel level)=>true;
        public void Log<TState>(LogLevel level,EventId id,TState state,Exception? exception,Func<TState,Exception?,string> formatter){if(level>=LogLevel.Warning)messages.Add(formatter(state,exception));}
    }
    private sealed class LeadingZeroCode(AuthOptions options):IAuthCryptography
    {
        private readonly AuthCryptography real=new(options);
        public string Code()=>"000001";public string RandomToken()=>real.RandomToken();public string Sha(string value)=>real.Sha(value);
        public string CodeMac(string id,string purpose,string email,int generation,string code)=>real.CodeMac(id,purpose,email,generation,code);
        public bool EqualsHash(string? left,string? right)=>real.EqualsHash(left,right);
    }
}
