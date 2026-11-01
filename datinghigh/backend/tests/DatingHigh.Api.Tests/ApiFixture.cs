using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
namespace DatingHigh.Api.Tests;

// 這個 fixture 只驗 HTTP 邊界與故障投影；真 SQL 原子性由 Miniflare 整合測試驗證。
public sealed class ApiFixture:WebApplicationFactory<Program>
{
    public static readonly byte[] Key=Enumerable.Range(0,32).Select(x=>(byte)x).ToArray();
    public MemoryPlatform Store {get;}=new();
    public CaptureSender Sender {get;}=new();
    public ApiFixture()
    {
        foreach(var name in new[]{"ACCESS_TOKEN_SECRET","EMAIL_CODE_HMAC_KEY","RATE_LIMIT_HMAC_KEY"})Environment.SetEnvironmentVariable(name,Convert.ToBase64String(Key));
        Environment.SetEnvironmentVariable("APP_ENV","local");Environment.SetEnvironmentVariable("ACCESS_TOKEN_ISSUER","test-issuer");Environment.SetEnvironmentVariable("ACCESS_TOKEN_AUDIENCE","test-client");Environment.SetEnvironmentVariable("WEB_ORIGIN","http://localhost:8081");Environment.SetEnvironmentVariable("EmailDeliveryMode","Log");
    }
    protected override void ConfigureWebHost(IWebHostBuilder builder)=>builder.ConfigureServices(services=>
    {
        services.RemoveAll<IPlatformClient>();services.AddSingleton<IPlatformClient>(Store);
        services.RemoveAll<IEmailCodeSender>();services.AddSingleton<IEmailCodeSender>(Sender);
        services.RemoveAll<IExternalCredentialValidator>();services.AddSingleton<IExternalCredentialValidator>(new ControlledExternal());
    });
    public string Token()=>Services.GetRequiredService<AccessTokens>().Issue(Store.AccountId,Store.SessionId,1,DateTimeOffset.UtcNow.AddMinutes(10));
    public new HttpClient CreateClient(){var client=base.CreateClient();client.DefaultRequestHeaders.Add("X-DatingHigh-Internal-Environment","local");return client;}
    public HttpClient Native(bool authenticated=false,string platform="android")
    {
        var client=CreateClient();client.DefaultRequestHeaders.Add("X-DatingHigh-Client",platform);client.DefaultRequestHeaders.Add("X-DatingHigh-Internal-Client-Ip","127.0.0.1");
        if(platform=="web")client.DefaultRequestHeaders.Add("Origin","http://localhost:8081");
        if(authenticated){if(platform=="web")client.DefaultRequestHeaders.Add("Cookie",$"datinghigh_access_dev={Token()}");else client.DefaultRequestHeaders.Authorization=new("Bearer",Token());}return client;
    }
    private sealed class ControlledExternal:IExternalCredentialValidator
    {
        public Task<VerifiedExternalIdentity> ValidateAsync(string provider,string platform,string credential,CancellationToken ct=default)
        {
            if(provider!="google")throw new DomainException("UNSUPPORTED_PROVIDER");
            if(credential=="bad")throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);
            if(credential=="unavailable")throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
            return Task.FromResult(new VerifiedExternalIdentity("google","subject",credential=="new"?"new@gmail.com":credential=="different"?"other@gmail.com":"owner@example.com"));
        }
    }
}
public sealed class CaptureSender:IEmailCodeSender
{
    public bool Fail {get;set;}
    public string? Code {get;private set;}
    public Task SendAsync(JsonNode challenge,string code,CancellationToken ct=default)
    {
        if(Fail)throw new HttpRequestException("Controlled sender failure");Code=code;return Task.CompletedTask;
    }
}
public sealed class MemoryPlatform:IPlatformClient
{
    public string AccountId {get;private set;}=EntityId.New();public string SessionId {get;private set;}=EntityId.New();
    public string Email {get;private set;}="owner@example.com";public string? PasswordHash {get;set;}=new PasswordHashService().Hash("A valid test password");
    public string? FaultCommand {get;set;}public bool DenyWrites {get;set;}public bool Revoked {get;set;}public bool Linked {get;set;}public bool DenyRate {get;set;}
    public string? RefreshToken {get;set;}public string? RefreshSessionId {get;set;}
    public List<string> Commands {get;}=[];private readonly Dictionary<string,JsonNode> _challenges=[];
    public void MakeResendable(string id)=>_challenges[id]["resend_after"]=0;
    public void ExpireChallenge(string id)=>_challenges[id]["expires_at"]=1;
    private static JsonNode Json(object o)=>JsonSerializer.SerializeToNode(o)!;
    private JsonNode Account()=>Json(new{account_id=AccountId,email_normalized=Email,email_verified_at=1,password_hash=PasswordHash,status="active",credential_version=1,created_at=1,updated_at=1});
    private JsonNode Current()
    {
        var row=Account();row["session_id"]=SessionId;row["client_platform"]="android";row["absolute_expires_at"]=DateTimeOffset.UtcNow.AddDays(30).ToUnixTimeMilliseconds();row["idle_expires_at"]=DateTimeOffset.UtcNow.AddDays(7).ToUnixTimeMilliseconds();return row;
    }
    public Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken ct=default)
    {
        Commands.Add(command);if(command==FaultCommand)throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        var p=Json(payload);var rows=new List<JsonNode>();long changes=1;
        switch(command)
        {
            case "rate-limit.consume":rows.Add(Json(new{attempt_count=DenyRate?999:1,expires_at=DateTimeOffset.UtcNow.AddMinutes(1).ToUnixTimeMilliseconds()}));break;
            case "account.lookup-credentials":if(p.Text("email")==Email)rows.Add(Account());break;
            case "session.validate":if(!Revoked&&p.Text("sessionId")==SessionId&&p.Text("accountId")==AccountId)rows.Add(Current());break;
            case "identity.list":if(Linked)rows.Add(Json(new{provider="google",created_at=1}));break;
            case "identity.lookup":if(Linked)rows.Add(Account());break;
            case "email.challenge.create":
                var id=p.Text("challengeId");var now=DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                var c=Json(new{challenge_id=id,purpose=p.Text("purpose"),email_normalized=p.Text("email"),client_platform=p.Text("clientPlatform"),flow_token_hash=p.Text("flowTokenHash"),code_mac=p.Text("codeMac"),generation=0,failed_attempts=0,account_id=p.Maybe("accountId"),bound_credential_version=p["cv"]?.GetValue<long>(),state="active",created_at=now,expires_at=now+600000,absolute_expires_at=now+1800000,resend_after=now+60000});
                _challenges[id]=c;rows.Add(c);break;
            case "email.challenge.get":if(_challenges.TryGetValue(p.Text("challengeId"),out var challenge))rows.Add(challenge);break;
            case "email.challenge.resend":if(_challenges.TryGetValue(p.Text("challengeId"),out var resend)){resend["code_mac"]=p.Text("newCodeMac");resend["generation"]=resend.Number("generation")+1;rows.Add(resend);}break;
            case "account.register-email":
                if(!DenyWrites){AccountId=p.Text("accountId");SessionId=p.Text("sessionId");PasswordHash=p.Text("passwordHash");var register=_challenges[p.Text("challengeId")];Email=register.Text("email_normalized");register["state"]="consumed";}break;
            case "account.register-external":if(p.Text("email")==Email)throw new DomainException("EMAIL_ALREADY_REGISTERED",409);if(!DenyWrites){AccountId=p.Text("accountId");SessionId=p.Text("sessionId");Email=p.Text("email");PasswordHash=null;Linked=true;}break;
            case "session.create":if(!DenyWrites){SessionId=p.Text("sessionId");Revoked=false;}break;
            case "session.revoke":Revoked=true;break;
            case "session.lookup-refresh":if(RefreshToken is not null&&p.Text("tokenHash")==ChallengeCrypto.Sha(RefreshToken)){var r=Current();r["token_id"]=EntityId.New();r["session_id"]=RefreshSessionId??SessionId;r["account_cv"]=1;r["current_generation"]=0;r["generation"]=0;r["consumed_at"]=null;r["revoked_at"]=Revoked?1:null;rows.Add(r);}break;
            case "account.change-password":if(!DenyWrites){PasswordHash=p.Text("passwordHash");Revoked=true;}break;
            case "account.reset-password":if(!DenyWrites){PasswordHash=p.Text("passwordHash");Revoked=true;_challenges[p.Text("challengeId")]["state"]="consumed";}break;
            case "identity.external.link":if(!DenyWrites)Linked=true;break;
            case "identity.external.unlink":if(!DenyWrites){Linked=false;Revoked=true;}break;
            case "platform.ready":return Task.FromResult(Json(new{status="ready",probe="datinghigh-foundation-v1"}));
        }
        if(DenyWrites&&command is "session.create" or "account.register-email" or "account.register-external" or "account.change-password" or "account.reset-password" or "identity.external.link" or "identity.external.unlink")changes=0;
        return Task.FromResult(Json(new{rows,changes=command=="session.create"?new[]{0L,changes,changes}:new[]{changes}}));
    }
}
