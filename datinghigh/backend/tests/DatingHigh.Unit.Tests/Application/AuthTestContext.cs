using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Time.Testing;
namespace DatingHigh.Unit.Tests.Application;

// 僅用於 Application 用例的外部回應 spy；SQL、CAS 與 rollback 另由真 D1 測試驗證。
internal sealed class AuthTestContext
{
    public readonly FakeTimeProvider Clock=new(new DateTimeOffset(2026,10,29,0,0,0,TimeSpan.Zero));
    public readonly AuthOptions Options=new("local","test-issuer","test-audience",Enumerable.Range(0,32).Select(i=>(byte)i).ToArray(),new byte[32],new byte[32],"http://localhost:8081","Log");
    public readonly PlatformSpy Store=new();public readonly SenderSpy Sender=new();public readonly ExternalSpy External=new();
    public string Flow="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";public const string Code="000001";public const string Password="A valid unit test password";
    public AuthTestContext(){Store.Now=Clock.GetUtcNow().ToUnixTimeMilliseconds();Store.PasswordHash=new PasswordHashService().Hash(Password);Store.RefreshToken=ChallengeCrypto.RandomToken();}
    public AuthApplication App=>new(Store,new PasswordHashService(),new AccessTokens(Options,Clock),new AuthCryptography(Options),Clock,new RateLimiter(Store,Options,Clock),Sender,External,NullLogger<AuthApplication>.Instance);
    public ClaimsPrincipal User=>new AccessTokens(Options,Clock).Validate(new AccessTokens(Options,Clock).Issue(Store.AccountId,Store.SessionId,Store.Cv,Clock.GetUtcNow().AddMinutes(10)));
    public string Token=>new AccessTokens(Options,Clock).Issue(Store.AccountId,Store.SessionId,Store.Cv,Clock.GetUtcNow().AddMinutes(10));
    public JsonNode Challenge(string purpose="register_email")
    {
        var id=EntityId.New();var email=purpose=="register_email"?"new@example.com":Store.Email;
        return Store.Challenge=Json(new{challenge_id=id,purpose,email_normalized=email,client_platform="android",flow_token_hash=ChallengeCrypto.Sha(Flow),code_mac=new ChallengeCrypto(Options.EmailKey).CodeMac(id,purpose,email,0,Code),generation=0,failed_attempts=0,account_id=purpose=="reset_password"?Store.AccountId:null,bound_credential_version=purpose=="reset_password"?(long?)Store.Cv:null,state="active",created_at=Store.Now,expires_at=Store.Now+600000,absolute_expires_at=Store.Now+1800000,resend_after=Store.Now+60000});
    }
    public static JsonNode Json(object o)=>JsonSerializer.SerializeToNode(o)!;
    internal sealed class SenderSpy:IEmailCodeSender
    {
        public int Calls;public bool Fail,Hang;public string? LastCode;
        public Task SendAsync(JsonNode c,string code,CancellationToken ct=default){Calls++;LastCode=code;if(Fail)throw new HttpRequestException("Controlled failure");return Hang?Task.Delay(Timeout.Infinite,ct):Task.CompletedTask;}
    }
    internal sealed class ExternalSpy:IExternalCredentialValidator
    {
        public string Email="owner@example.com";public string Subject="CaseSensitiveSubject";public int Calls;
        public Task<VerifiedExternalIdentity> ValidateAsync(string provider,string platform,string credential,CancellationToken ct=default)
        {
            Calls++;if(provider!="google")throw new DomainException("UNSUPPORTED_PROVIDER");if(credential=="invalid")throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);return Task.FromResult(new VerifiedExternalIdentity(provider,Subject,Email));
        }
    }
    internal sealed class PlatformSpy:IPlatformClient
    {
        public string AccountId=EntityId.New(),SessionId=EntityId.New(),Email="owner@example.com",Status="active",RefreshToken="";public string? PasswordHash;
        public long Now,Cv=1,Generation;public long WriteCount=1;public bool HasIdentity,DenyValidation,DenySessionQuota,DenyAllQuota;public long? ConsumedAt;
        public string? Fault;public JsonNode? Challenge;public readonly string PreviousId=EntityId.New(),HeadId=EntityId.New();
        public readonly List<(string Command,JsonNode Payload)> Calls=[];
        public string[] Commands=>Calls.Select(c=>c.Command).ToArray();
        private JsonNode Account()=>Json(new{account_id=AccountId,email_normalized=Email,email_verified_at=Now,password_hash=PasswordHash,status=Status,credential_version=Cv,created_at=Now,updated_at=Now});
        private JsonNode Current(){var row=Account();row["session_id"]=SessionId;row["client_platform"]="android";row["absolute_expires_at"]=Now+2592000000;row["idle_expires_at"]=Now+604800000;return row;}
        public Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken ct=default)
        {
            var p=Json(payload);Calls.Add((command,p));if(command==Fault)throw new DomainException("DEPENDENCY_UNAVAILABLE",503);var rows=new List<JsonNode>();
            switch(command)
            {
                case "platform.ready":return Task.FromResult(Json(new{status="ready",probe="datinghigh-foundation-v1"}));
                case "rate-limit.consume":foreach(var e in p["entries"]!.AsArray())rows.Add(Json(new{attempt_count=DenyAllQuota||DenySessionQuota&&e!["subjectType"]!.GetValue<string>()=="session"?999:1,expires_at=Now+60000}));break;
                case "account.lookup-credentials":if(p.Text("email")==Email)rows.Add(Account());break;
                case "identity.lookup":if(HasIdentity)rows.Add(Account());break;
                case "identity.list":if(HasIdentity)rows.Add(Json(new{provider="google",created_at=Now}));break;
                case "session.validate":if(!DenyValidation)rows.Add(Current());break;
                case "email.challenge.get":if(Challenge is not null&&p.Text("challengeId")==Challenge.Text("challenge_id"))rows.Add(Challenge);break;
                case "email.challenge.create":Challenge=Json(new{challenge_id=p.Text("challengeId"),purpose=p.Text("purpose"),email_normalized=p.Text("email"),client_platform=p.Text("clientPlatform"),flow_token_hash=p.Text("flowTokenHash"),code_mac=p.Text("codeMac"),generation=0,failed_attempts=0,account_id=p.Maybe("accountId"),bound_credential_version=p["cv"]?.GetValue<long>(),state="active",created_at=Now,expires_at=Now+600000,absolute_expires_at=Now+1800000,resend_after=Now+60000});rows.Add(Challenge);break;
                case "account.register-email":if(WriteCount>0){Email=Challenge!.Text("email_normalized");AccountId=p.Text("accountId");SessionId=p.Text("sessionId");PasswordHash=p.Text("passwordHash");Challenge!["state"]="consumed";}break;
                case "account.register-external":if(WriteCount>0){Email=p.Text("email");AccountId=p.Text("accountId");SessionId=p.Text("sessionId");PasswordHash=null;HasIdentity=true;}break;
                case "session.create":if(WriteCount>0)SessionId=p.Text("sessionId");break;
                case "session.lookup-refresh":if(p.Text("tokenHash")==ChallengeCrypto.Sha(RefreshToken))rows.Add(Json(new{token_id=PreviousId,session_id=SessionId,account_id=AccountId,client_platform="android",credential_version=Cv,account_cv=Cv,status=Status,current_generation=Generation,generation=0,consumed_at=ConsumedAt,replaced_by_token_id=HeadId,absolute_expires_at=Now+2592000000,idle_expires_at=Now+604800000,revoked_at=(long?)null}));break;
                case "email.challenge.resend":if(WriteCount>0&&Challenge is not null){Challenge["generation"]=Challenge.Number("generation")+1;Challenge["code_mac"]=p.Text("newCodeMac");rows.Add(Challenge);}break;
            }
            return Task.FromResult(Json(new{rows,changes=command=="session.create"?new[]{0,WriteCount,WriteCount}:new[]{WriteCount}}));
        }
    }
}

