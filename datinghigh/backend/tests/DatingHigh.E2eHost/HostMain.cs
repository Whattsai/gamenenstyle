using System.Globalization;using System.Net;using System.Security.Cryptography;using System.Text.Json;using System.Text.Json.Nodes;
using DatingHigh.Application;using DatingHigh.Domain;using DatingHigh.Infrastructure;using DatingHigh.Integration.Tests;
using Microsoft.AspNetCore.Hosting.Server;using Microsoft.AspNetCore.Hosting.Server.Features;using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection.Extensions;using Microsoft.Extensions.Logging.Abstractions;
using System.Collections.Concurrent;
namespace DatingHigh.E2eHost;

// Test-only loopback host. Production API and D1/Worker code run unchanged; provider faults and clock are controlled here.
public static class HostMain
{
    public static async Task Main()
    {
        await using var platform=new RealPlatform();platform.Clock.SetUtcNow(DateTimeOffset.UtcNow);var crypto=new SequenceCodes(platform.Options);var realGoogle=Environment.GetEnvironmentVariable("DATINGHIGH_E2E_REAL_GOOGLE")=="1";
        foreach(var pair in new Dictionary<string,string>{["APP_ENV"]="local",["WEB_ORIGIN"]=platform.Options.WebOrigin,["ACCESS_TOKEN_ISSUER"]=platform.Options.Issuer,["ACCESS_TOKEN_AUDIENCE"]=platform.Options.Audience,["ACCESS_TOKEN_SECRET"]=Convert.ToBase64String(platform.Options.AccessKey),["EMAIL_CODE_HMAC_KEY"]=Convert.ToBase64String(platform.Options.EmailKey),["RATE_LIMIT_HMAC_KEY"]=Convert.ToBase64String(platform.Options.RateKey),["EmailDeliveryMode"]="Log"})Environment.SetEnvironmentVariable(pair.Key,pair.Value);
        var racing=new CredentialRacePlatform(platform);await using var factory=new Factory(platform,crypto,racing,realGoogle);using var api=factory.CreateClient(new WebApplicationFactoryClientOptions{HandleCookies=false,AllowAutoRedirect=false});
        var builder=WebApplication.CreateBuilder();builder.Logging.ClearProviders();builder.WebHost.UseUrls("http://127.0.0.1:0");var host=builder.Build();var key=Convert.ToHexString(RandomNumberGenerator.GetBytes(32));var mailBase=0;
        var denyNativeWrites=false;var delayNativeWritesMs=0;long clockAdvance=0,clockObserved=0;var nativeMetrics=new ConcurrentQueue<JsonElement>();var requests=new ConcurrentQueue<object>();var starts=new ConcurrentQueue<object>();var faults=new List<(string Path,string Mode,int Delay)>();var faultLock=new object();
        var terminations=new ConcurrentQueue<object>();
        host.MapGet("/_test/native-mode",(HttpContext context)=>{context.Response.Headers.CacheControl="no-store";return Results.Json(new{denyWrites=denyNativeWrites,delayWritesMs=delayNativeWritesMs,clockAdvance=Interlocked.Read(ref clockAdvance)});});
        host.MapPost("/_test/native-clock",async(HttpContext context)=>{var item=await context.Request.ReadFromJsonAsync<JsonElement>();var observed=item.GetProperty("milliseconds").GetInt64();if(observed<0||observed>Interlocked.Read(ref clockAdvance))return Results.BadRequest();Interlocked.Exchange(ref clockObserved,observed);return Results.Json(new{recorded=true});});
        host.MapPost("/_test/native-metrics",async(HttpContext context)=>{
            var item=await context.Request.ReadFromJsonAsync<JsonElement>();if(item.EnumerateObject().Any(p=>p.Name is not("operation" or "key" or "fields" or "persisted"))||item.GetProperty("key").GetString() is not("datinghigh.refresh" or "datinghigh.email-flow" or "datinghigh.pending-revoke"))return Results.BadRequest();nativeMetrics.Enqueue(item.Clone());return Results.Json(new{recorded=true});
        });
        host.MapPost("/_test/control",async(HttpContext context)=>{
            if(context.Request.Headers["X-DatingHigh-Test-Control"]!=key)return Results.StatusCode(403);
            var body=await context.Request.ReadFromJsonAsync<JsonElement>();var op=body.GetProperty("op").GetString();
            if(op=="reset"){
                terminations.Clear();
                foreach(var sql in new[]{"UPDATE auth_refresh_tokens SET replaced_by_token_id=NULL","DELETE FROM auth_refresh_tokens","DELETE FROM auth_email_challenges","DELETE FROM auth_sessions","DELETE FROM auth_external_identities","DELETE FROM auth_accounts","DELETE FROM common_rate_limit_buckets"})await platform.Sql(sql);
                crypto.Reset();racing.Reset();await platform.Provider("success");mailBase=platform.MailCalls;requests.Clear();starts.Clear();nativeMetrics.Clear();lock(faultLock)faults.Clear();denyNativeWrites=false;delayNativeWritesMs=0;
                if(body.TryGetProperty("accountKind",out var kind)){if(kind.GetString() is not("local" or "google-only" or "none"))return Results.BadRequest();string? email=null;if(body.TryGetProperty("email",out var supplied)){if(!realGoogle)return Results.BadRequest();try{email=EmailAddress.Normalize(supplied.GetString()??"");}catch(DomainException){return Results.BadRequest();}}if(kind.GetString()!="none")await platform.Seed(kind.GetString()=="local",email);}
                else if(body.TryGetProperty("seed",out var seed)&&seed.GetBoolean())await platform.Seed(true);return Results.Json(new{ready=true});
            }
            if(op=="provider"){await platform.Provider(body.GetProperty("mode").GetString()!,false);return Results.Json(new{configured=true});}
            if(op=="align-send-window"){var now=platform.Clock.GetUtcNow().ToUnixTimeMilliseconds();var advance=(now/3600000+1)*3600000-now;platform.Clock.Advance(TimeSpan.FromMilliseconds(advance));Interlocked.Add(ref clockAdvance,advance);return Results.Json(new{aligned=true});}
            if(op=="advance"){var milliseconds=body.GetProperty("milliseconds").GetInt32();if(milliseconds is <0 or >1800000)return Results.BadRequest();platform.Clock.Advance(TimeSpan.FromMilliseconds(milliseconds));Interlocked.Add(ref clockAdvance,milliseconds);return Results.Json(new{advanced=true,clockAdvance=Interlocked.Read(ref clockAdvance)});}
            if(op=="mail-progress")return Results.Json(new{calls=platform.MailCalls-mailBase});
            if(op=="challenge"){
                var id=body.GetProperty("id").GetString()!;if(!EntityId.IsValid(id))return Results.BadRequest();
                if(body.TryGetProperty("failures",out var failures)){var count=failures.GetInt32();if(count is <0 or >5)return Results.BadRequest();await platform.Sql("UPDATE auth_email_challenges SET failed_attempts=? WHERE challenge_id=?",count,id);}
                var rows=await platform.Sql("SELECT challenge_id,generation,failed_attempts,state,absolute_expires_at FROM auth_email_challenges WHERE challenge_id=?",id);return Results.Json(rows.FirstOrDefault());
            }
            if(op=="provider-stats")return Results.Json(await platform.ProviderStats());
            if(op=="native-mode"){var delay=body.TryGetProperty("delayWritesMs",out var configuredDelay)?configuredDelay.GetInt32():0;if(delay is <0 or >30000)return Results.BadRequest();denyNativeWrites=body.GetProperty("denyWrites").GetBoolean();delayNativeWritesMs=delay;return Results.Json(new{configured=true});}
            if(op=="native-metrics")return Results.Json(nativeMetrics);
            if(op=="native-clock-observed")return Results.Json(new{milliseconds=Interlocked.Read(ref clockObserved)});
            if(op=="account-state")return Results.Json(new{accounts=await platform.Sql("SELECT account_id,credential_version,status,password_hash IS NOT NULL AS has_local_password FROM auth_accounts"),sessions=await platform.Sql("SELECT session_id,account_id,client_platform,credential_version,current_generation,revoked_at IS NOT NULL AS revoked FROM auth_sessions"),identities=await platform.Sql("SELECT account_id,provider FROM auth_external_identities")});
            if(op=="race-credential-version"){racing.Arm();return Results.Json(new{configured=true});}
            if(op=="clear-refreshes"){await platform.Sql("UPDATE auth_refresh_tokens SET replaced_by_token_id=NULL");await platform.Sql("DELETE FROM auth_refresh_tokens");return Results.Json(new{cleared=true});}
            if(op=="fault-response"){
                var path=body.GetProperty("path").GetString();var mode=body.GetProperty("mode").GetString();var delay=body.TryGetProperty("milliseconds",out var ms)?ms.GetInt32():0;
                if(!AllowedPath(path)||mode is null||(!FaultResponses.ContainsKey(mode)&&mode is not("drop" or "delay" or "hang-before" or "hang-after"))||delay is <0 or >46000)return Results.BadRequest();lock(faultLock)faults.Add((path!,mode,delay));return Results.Json(new{configured=true});
            }
            if(op=="request-stats")return Results.Json(requests);
            if(op=="request-starts")return Results.Json(starts);
            if(op=="request-terminations")return Results.Json(terminations);
            if(op=="shutdown"){context.Response.OnCompleted(()=>{host.Lifetime.StopApplication();return Task.CompletedTask;});return Results.Json(new{stopping=true});}
            return Results.NotFound();
        });
        host.Map("/{**path}",async context=>{
            var path=context.Request.Path.ToString();
            var started=System.Diagnostics.Stopwatch.GetTimestamp();starts.Enqueue(new{path,method=context.Request.Method,receivedAt=DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()});string? mode;int delay;
            lock(faultLock){var fault=faults.FindIndex(f=>f.Path==path);mode=fault>=0?faults[fault].Mode:null;delay=fault>=0?faults[fault].Delay:0;if(fault>=0)faults.RemoveAt(fault);}
            if(mode is not null&&FaultResponses.TryGetValue(mode,out var rejection)){requests.Enqueue(new{path,method=context.Request.Method,status=rejection.Status,stage="proxy"});context.Response.StatusCode=rejection.Status;await context.Response.WriteAsJsonAsync(new{code=rejection.Code,traceId="controlled-proxy-trace"});return;}
            if(mode=="hang-before"){requests.Enqueue(new{path,method=context.Request.Method,status=0,stage="before-handler"});try{await Task.Delay(Timeout.Infinite,context.RequestAborted);}catch(OperationCanceledException){}terminations.Enqueue(new{path,method=context.Request.Method,elapsedMilliseconds=System.Diagnostics.Stopwatch.GetElapsedTime(started).TotalMilliseconds});return;}
            if(mode=="delay"){try{await Task.Delay(delay,context.RequestAborted);}catch(OperationCanceledException){requests.Enqueue(new{path,method=context.Request.Method,status=0,stage="before-handler"});return;}}
            using var request=new HttpRequestMessage(new HttpMethod(context.Request.Method),context.Request.Path+context.Request.QueryString);
            request.Content=new StreamContent(context.Request.Body);
            foreach(var header in context.Request.Headers){if(header.Key.Equals("Host",StringComparison.OrdinalIgnoreCase)||header.Key.StartsWith("X-DatingHigh-Internal-",StringComparison.OrdinalIgnoreCase))continue;if(!request.Headers.TryAddWithoutValidation(header.Key,header.Value.ToArray()))request.Content.Headers.TryAddWithoutValidation(header.Key,header.Value.ToArray());}
            request.Headers.Add("X-DatingHigh-Internal-Environment","local");request.Headers.Add("X-DatingHigh-Internal-Request-Id",Guid.NewGuid().ToString("D"));request.Headers.Add("X-DatingHigh-Internal-Client-Ip","127.0.0.1");
            using var response=await api.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,context.RequestAborted);requests.Enqueue(new{path,method=context.Request.Method,status=(int)response.StatusCode,stage="api"});
            if(mode=="hang-after"){try{await Task.Delay(Timeout.Infinite,context.RequestAborted);}catch(OperationCanceledException){}return;}
            if(mode=="drop"){context.Abort();return;}context.Response.StatusCode=(int)response.StatusCode;
            foreach(var header in response.Headers.Concat(response.Content.Headers)){if(!header.Key.Equals("Transfer-Encoding",StringComparison.OrdinalIgnoreCase))context.Response.Headers[header.Key]=header.Value.ToArray();}
            context.Response.Headers.Date=platform.Clock.GetUtcNow().ToString("R",CultureInfo.InvariantCulture);await response.Content.CopyToAsync(context.Response.Body,context.RequestAborted);
        });
        await host.StartAsync();var url=host.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.Single();Console.WriteLine(JsonSerializer.Serialize(new{url,key}));await host.WaitForShutdownAsync();await host.DisposeAsync();
    }
    private static bool AllowedPath(string? path)=>path is "/api/v1/session" or "/api/v1/session/refresh" or "/api/v1/sessions" or "/api/v1/accounts" or "/api/v1/email-registrations" or "/api/v1/password-reset-requests" or "/api/v1/password-resets" or "/api/v1/me" or "/api/v1/me/password" or "/api/v1/me/identities" or "/api/v1/me/identities/google"||(path?.StartsWith("/api/v1/email-challenges/",StringComparison.Ordinal)==true&&path.EndsWith("/resend",StringComparison.Ordinal)&&EntityId.IsValid(path[25..^7]));
    private static readonly IReadOnlyDictionary<string,(int Status,string Code)> FaultResponses=new Dictionary<string,(int,string)>{["refresh-conflict"]=(409,"REFRESH_RETRY"),["access-expired"]=(401,"ACCESS_TOKEN_EXPIRED"),["access-missing"]=(401,"ACCESS_TOKEN_MISSING"),["access-invalid"]=(401,"ACCESS_TOKEN_INVALID"),["session-revoked"]=(401,"SESSION_REVOKED"),["refresh-reuse"]=(401,"REFRESH_TOKEN_REUSE"),["refresh-revoked"]=(401,"REFRESH_REVOKED"),["refresh-expired"]=(401,"REFRESH_EXPIRED"),["server-error"]=(500,"INTERNAL_ERROR"),["unavailable"]=(503,"DEPENDENCY_UNAVAILABLE"),["gateway-timeout"]=(504,"DEPENDENCY_UNAVAILABLE")};
    private sealed class CredentialRacePlatform(RealPlatform platform):IPlatformClient
    {
        private int armed;public void Arm()=>Interlocked.Exchange(ref armed,1);public void Reset()=>Interlocked.Exchange(ref armed,0);
        public async Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken cancellationToken=default)
        {
            if(command=="account.change-password"&&Interlocked.Exchange(ref armed,0)==1){var account=JsonSerializer.SerializeToNode(payload)!["accountId"]!.GetValue<string>();if(!EntityId.IsValid(account))throw new InvalidOperationException("Invalid controlled account");await platform.Sql("UPDATE auth_accounts SET credential_version=credential_version+1 WHERE account_id=?",account);}
            return await platform.ExecuteAsync(command,payload,cancellationToken);
        }
    }
    private sealed class Factory(RealPlatform platform,SequenceCodes crypto,CredentialRacePlatform racing,bool realGoogle):WebApplicationFactory<global::Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder){builder.UseContentRoot(Path.GetFullPath("backend/src/DatingHigh.Api"));builder.ConfigureLogging(log=>log.ClearProviders());builder.ConfigureServices(services=>{
            services.RemoveAll<IPlatformClient>();services.AddSingleton<IPlatformClient>(racing);services.RemoveAll<TimeProvider>();services.AddSingleton<TimeProvider>(platform.Clock);services.RemoveAll<IAuthCryptography>();services.AddSingleton<IAuthCryptography>(crypto);
            services.RemoveAll<IEmailCodeSender>();services.AddSingleton<IEmailCodeSender>(new EmailCodeSender(platform.Options with{Environment="staging",EmailDeliveryMode="Cloudflare"},platform,NullLoggerFactory.Instance));
            services.RemoveAll<IExternalCredentialValidator>();if(realGoogle){var clients=(Environment.GetEnvironmentVariable("DATINGHIGH_E2E_GOOGLE_CLIENTS")??"").Split(',',StringSplitOptions.RemoveEmptyEntries|StringSplitOptions.TrimEntries);if(clients.Length==0||clients.Any(id=>!id.EndsWith(".apps.googleusercontent.com",StringComparison.Ordinal)))throw new InvalidOperationException("Missing real Google test client IDs");services.AddSingleton<IExternalCredentialValidator>(new GoogleExternalCredentialValidator(new Dictionary<string,string[]>{["android"]=clients}));}else services.AddSingleton<IExternalCredentialValidator>(new ControlledGoogle());
        });}
    }
    private sealed class SequenceCodes(AuthOptions options):IAuthCryptography
    {
        private readonly AuthCryptography real=new(options);private int next;public void Reset()=>next=0;
        public string Code()=>Interlocked.Increment(ref next).ToString("D6",CultureInfo.InvariantCulture);public string RandomToken()=>real.RandomToken();public string Sha(string value)=>real.Sha(value);
        public string CodeMac(string id,string purpose,string email,int generation,string code)=>real.CodeMac(id,purpose,email,generation,code);public bool EqualsHash(string? left,string? right)=>real.EqualsHash(left,right);
    }
    // 僅供 UI／Cookie 故障測試；不代表真 Google proof、JWKS 或 OAuth 驗收。
    private sealed class ControlledGoogle:IExternalCredentialValidator
    {
        public Task<VerifiedExternalIdentity> ValidateAsync(string provider,string platform,string credential,CancellationToken cancellationToken=default)
        {
            if(provider!="google"||credential!="controlled-memory-proof")throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);
            return Task.FromResult(new VerifiedExternalIdentity("google","controlled-google-only-subject",RealPlatform.Email));
        }
    }
}
