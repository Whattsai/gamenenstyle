using DatingHigh.Domain;
using DatingHigh.Infrastructure;
using DatingHigh.Application;
using System.Text.Json.Nodes;
namespace DatingHigh.Unit.Tests.Application;
public class AuthApplicationTests
{
    [Fact,Trait("Case","PF-UT-013"),Trait("Case","PF-UT-021")]
    public async Task ChallengeRejection_WrongFlowPurposeGenerationStateOrUnknownAccount_NeverMutatesCredentials()
    {
        foreach(var variant in new[]{"flow","purpose","generation","consumed","locked","expired","absolute","unknown","id"})
        {
            var c=new AuthTestContext();var challenge=c.Challenge("reset_password");
            switch(variant){case "purpose":challenge["purpose"]="register_email";break;case "generation":challenge["generation"]=1L;break;case "consumed":challenge["state"]="consumed";break;case "locked":challenge["state"]="locked";challenge["failed_attempts"]=5L;break;case "expired":challenge["expires_at"]=c.Store.Now;break;case "absolute":challenge["absolute_expires_at"]=c.Store.Now;break;case "unknown":challenge["account_id"]=null;break;}
            await Assert.ThrowsAsync<DomainException>(()=>c.App.Reset(variant=="id"?EntityId.New():Id(challenge),variant=="flow"?"wrong":c.Flow,AuthTestContext.Code,AuthTestContext.Password,default));Assert.DoesNotContain("account.reset-password",c.Store.Commands);
        }
    }
    [Theory,Trait("Case","PF-UT-014")]
    [InlineData(599999,true)][InlineData(600000,false)][InlineData(1800000,false)]
    public async Task RegistrationCode_ExactExpiry_UsesStrictServerTime(int elapsed,bool accepted)
    {
        var c=new AuthTestContext();var challenge=c.Challenge();c.Clock.Advance(TimeSpan.FromMilliseconds(elapsed));
        if(accepted)Assert.Equal(201,(await c.App.Register(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,"android",default)).Status);
        else{await Assert.ThrowsAsync<DomainException>(()=>c.App.Register(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,"android",default));Assert.DoesNotContain("account.register-email",c.Store.Commands);}
    }
    [Fact,Trait("Case","PF-UT-009"),Trait("Case","PF-UT-114")]
    public async Task Login_StaleSupportedHash_UsesConditionalEquivalentUpgrade()
    {
        var c=new AuthTestContext();var salt=new byte[16];var key=System.Security.Cryptography.Rfc2898DeriveBytes.Pbkdf2(System.Text.Encoding.UTF8.GetBytes(AuthTestContext.Password),salt,100000,System.Security.Cryptography.HashAlgorithmName.SHA256,32);
        var old=$"pbkdf2-sha256$v1$100000${Convert.ToBase64String(salt)}${Convert.ToBase64String(key)}";c.Store.PasswordHash=old;
        var result=await c.App.Login(c.Store.Email,AuthTestContext.Password,"android","127.0.0.1",default);
        var upgrade=Assert.Single(c.Store.Calls,x=>x.Command=="account.rehash");Assert.Equal(old,upgrade.Payload.Text("oldHash"));Assert.Equal(result.SessionId,upgrade.Payload.Text("sessionId"));Assert.Equal(1,upgrade.Payload.Number("cv"));Assert.Equal(1,c.Store.Cv);
    }
    private static string Id(JsonNode c)=>c.Text("challenge_id");
    [Fact,Trait("Case","PF-UT-010")]
    public async Task RequestRegistration_ValidUnregisteredEmail_CreatesChallengeOnly()
    {
        var c=new AuthTestContext();var metadata=AuthTestContext.Json(await c.App.RequestCode(" NEW@EXAMPLE.COM ","android","register_email","127.0.0.1",default));
        Assert.Equal(1,c.Sender.Calls);Assert.NotNull(metadata["flowToken"]);Assert.Null(metadata["code"]);Assert.DoesNotContain(c.Store.Commands,x=>x.StartsWith("account.register",StringComparison.Ordinal));Assert.Equal("new@example.com",c.Store.Challenge!.Text("email_normalized"));
    }
    [Fact,Trait("Case","PF-UT-011")]
    public async Task ConfirmRegistration_ValidPurposeBoundCodeOrExternalIdentity_BuildsOneAtomicCompletion()
    {
        var c=new AuthTestContext();var challenge=c.Challenge();var result=await c.App.Register(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,"android",default);
        Assert.Equal(201,result.Status);Assert.Single(c.Store.Calls,x=>x.Command=="account.register-email");Assert.DoesNotContain("email.challenge.consume",c.Store.Commands);
        var payload=c.Store.Calls.Single(x=>x.Command=="account.register-email").Payload;Assert.Equal(challenge.Text("code_mac"),payload.Text("codeMac"));Assert.Null(payload["owner"]);Assert.NotEqual(AuthTestContext.Password,payload.Text("passwordHash"));
    }
    [Fact,Trait("Case","PF-UT-012")]
    public async Task ConfirmRegistration_ConflictOrIncompleteWrite_DoesNotIssueTokens()
    {
        var c=new AuthTestContext();var challenge=c.Challenge();c.Store.WriteCount=0;
        await Assert.ThrowsAsync<DomainException>(()=>c.App.Register(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,"android",default));Assert.Equal("active",challenge.Text("state"));
        c.Store.Fault="account.register-email";Assert.Equal(503,(await Assert.ThrowsAsync<DomainException>(()=>c.App.Register(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,"android",default))).Status);
    }
    [Fact,Trait("Case","PF-UT-014")]
    public async Task EvaluateChallenge_TimeAndResendBoundaries_UsesServerClock()
    {
        var c=new AuthTestContext();var challenge=c.Challenge();Assert.Equal(429,(await Assert.ThrowsAsync<DomainException>(()=>c.App.Resend(Id(challenge),c.Flow,"127.0.0.1",default))).Status);
        c.Clock.Advance(TimeSpan.FromSeconds(60));await c.App.Resend(Id(challenge),c.Flow,"127.0.0.1",default);Assert.Equal(1,challenge.Number("generation"));
        c.Clock.Advance(TimeSpan.FromMinutes(30));Assert.Equal(410,(await Assert.ThrowsAsync<DomainException>(()=>c.App.Register(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,"android",default))).Status);
    }
    [Fact,Trait("Case","PF-UT-015")]
    public async Task RecordWrongCode_FifthFailureOrResend_PreservesCumulativeLockout()
    {
        var c=new AuthTestContext();var challenge=c.Challenge();await Assert.ThrowsAsync<DomainException>(()=>c.App.Register(Id(challenge),c.Flow,"111111",AuthTestContext.Password,"android",default));Assert.Contains("email.challenge.fail-attempt",c.Store.Commands);
        challenge["failed_attempts"]=5L;challenge["state"]="locked";Assert.Equal("CODE_LOCKED",(await Assert.ThrowsAsync<DomainException>(()=>c.App.Register(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,"android",default))).Code);Assert.DoesNotContain("account.register-email",c.Store.Commands);
    }
    [Fact,Trait("Case","PF-UT-016")]
    public async Task SendCode_UnpersistedOrUnapprovedChallenge_DoesNotInvokeSender()
    {
        var c=new AuthTestContext();c.Store.Fault="email.challenge.create";await Assert.ThrowsAsync<DomainException>(()=>c.App.RequestCode("new@example.com","android","register_email","127.0.0.1",default));Assert.Equal(0,c.Sender.Calls);
    }
    [Fact,Trait("Case","PF-UT-017")]
    public async Task SendCode_TenSecondTimeoutOrRegistrationSenderFailure_Returns503EmailDeliveryFailed()
    {
        var c=new AuthTestContext();c.Sender.Hang=true;var request=c.App.RequestCode("new@example.com","android","register_email","127.0.0.1",default);var rejected=Assert.ThrowsAsync<DomainException>(()=>request);
        Assert.False(request.IsCompleted);c.Clock.Advance(TimeSpan.FromSeconds(10));Assert.Equal("EMAIL_DELIVERY_FAILED",(await rejected).Code);Assert.Equal("active",c.Store.Challenge!.Text("state"));
    }
    [Fact,Trait("Case","PF-UT-018"),Trait("Case","PF-UT-019")]
    public async Task RequestReset_KnownUnknownOrExternalOnly_ReturnsSamePublicShape()
    {
        var c=new AuthTestContext();c.Sender.Fail=true;var known=AuthTestContext.Json(await c.App.RequestCode(c.Store.Email,"android","reset_password","127.0.0.1",default));var unknown=AuthTestContext.Json(await c.App.RequestCode("unknown@example.com","android","reset_password","127.0.0.1",default));
        Assert.Equal(known.AsObject().Select(x=>x.Key),unknown.AsObject().Select(x=>x.Key));Assert.Equal("若此 Email 可處理，將收到驗證碼",known.Text("message"));Assert.Equal(1,c.Sender.Calls);
        c.Store.PasswordHash=null;await c.App.RequestCode(c.Store.Email,"android","reset_password","127.0.0.1",default);Assert.Equal(2,c.Sender.Calls);
    }
    [Fact,Trait("Case","PF-UT-020"),Trait("Case","PF-UT-021")]
    public async Task ResetPassword_ValidBoundChallenge_UpdatesCredentialAndRequiresLogin()
    {
        var c=new AuthTestContext();var challenge=c.Challenge("reset_password");await c.App.Reset(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,default);Assert.Contains("account.reset-password",c.Store.Commands);Assert.DoesNotContain("session.create",c.Store.Commands);Assert.DoesNotContain("identity.external.unlink",c.Store.Commands);
        c.Store.WriteCount=0;await Assert.ThrowsAsync<DomainException>(()=>c.App.Reset(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,default));
    }
    [Fact,Trait("Case","PF-UT-028")]
    public async Task CompleteExternalSignIn_ExistingIdentityAndMatchingEmail_CreatesSession()
    {
        var c=new AuthTestContext();c.Store.HasIdentity=true;var id=c.Store.AccountId;var r=await c.App.ExternalLogin("google","valid","android","127.0.0.1",default);Assert.Equal(200,r.Status);Assert.Equal(id,c.Store.AccountId);Assert.Contains("session.create",c.Store.Commands);Assert.DoesNotContain("account.register-external",c.Store.Commands);
    }
    [Fact,Trait("Case","PF-UT-029")]
    public async Task CompleteExternalSignIn_NewIdentityAndTrustedUnusedEmail_CreatesAccountAndSessionDirectly()
    {
        var c=new AuthTestContext();c.External.Email="new@gmail.com";var r=await c.App.ExternalLogin("google","valid","android","127.0.0.1",default);Assert.Equal(201,r.Status);Assert.Contains("account.register-external",c.Store.Commands);Assert.DoesNotContain("email.challenge.create",c.Store.Commands);Assert.Null(c.Store.PasswordHash);
    }
    [Fact,Trait("Case","PF-UT-030"),Trait("Case","PF-UT-032")]
    public async Task ExternalIdentity_EmailMismatchOrLastMethod_RejectsAutomaticMutation()
    {
        var c=new AuthTestContext();c.Store.HasIdentity=true;c.External.Email="other@gmail.com";Assert.Equal("EXTERNAL_EMAIL_CHANGED",(await Assert.ThrowsAsync<DomainException>(()=>c.App.ExternalLogin("google","valid","android","127.0.0.1",default))).Code);
        Assert.Equal("EXTERNAL_EMAIL_MISMATCH",(await Assert.ThrowsAsync<DomainException>(()=>c.App.Link(c.User,"google","valid","android","127.0.0.1",default))).Code);
        c.Store.PasswordHash=null;Assert.Equal("LAST_LOGIN_METHOD",(await Assert.ThrowsAsync<DomainException>(()=>c.App.Unlink(c.User,"google",AuthTestContext.Password,default))).Code);
    }
    [Fact,Trait("Case","PF-UT-031"),Trait("Case","PF-UT-033")]
    public async Task ManageIdentity_SameIdentityLinkOrPasswordVerifiedUnlink_AppliesCorrectSessionPolicy()
    {
        var c=new AuthTestContext();await c.App.Link(c.User,"google","valid","android","127.0.0.1",default);await c.App.Link(c.User,"google","valid","android","127.0.0.1",default);
        Assert.All(c.Store.Calls.Where(x=>x.Command=="identity.external.link"),call=>{Assert.Null(call.Payload["currentPassword"]);Assert.Equal(1,call.Payload.Number("cv"));});Assert.DoesNotContain("session.create",c.Store.Commands);Assert.DoesNotContain("session.revoke",c.Store.Commands);
        await c.App.Unlink(c.User,"google",AuthTestContext.Password,default);Assert.Contains("identity.external.unlink",c.Store.Commands);
    }
    [Fact,Trait("Case","PF-UT-034"),Trait("Case","PF-UT-036")]
    public async Task CreateSession_ZeroRowsDisabledOrChangedCredential_IssuesNoPair()
    {
        var c=new AuthTestContext();var old=c.Store.SessionId;var r=await c.App.Login(c.Store.Email,AuthTestContext.Password,"android","127.0.0.1",default);Assert.NotEqual(old,r.SessionId);Assert.Single(c.Store.Calls,x=>x.Command=="session.create");Assert.DoesNotContain("account.change-password",c.Store.Commands);
        c.Store.WriteCount=0;await Assert.ThrowsAsync<DomainException>(()=>c.App.Login(c.Store.Email,AuthTestContext.Password,"android","127.0.0.1",default));
        c.Store.Status="disabled";Assert.Equal("INVALID_CREDENTIALS",(await Assert.ThrowsAsync<DomainException>(()=>c.App.Login(c.Store.Email,AuthTestContext.Password,"android","127.0.0.1",default))).Code);
    }
    [Fact,Trait("Case","PF-UT-038"),Trait("Case","PF-UT-039")]
    public async Task ValidateAndProjectSession_D1Authority_ExposesOnlySafeOwnerMetadata()
    {
        var c=new AuthTestContext();var user=c.User;var row=await c.App.Validate(user,default);var dto=AuthTestContext.Json(await c.App.AccountDto(row,c.App.Auth(user),default));Assert.Equal(c.Store.Email,dto.Text("email"));Assert.Null(dto["password_hash"]);Assert.Null(dto["subject"]);Assert.Null(dto["tokens"]);
        c.Store.DenyValidation=true;Assert.Equal("SESSION_REVOKED",(await Assert.ThrowsAsync<DomainException>(()=>c.App.Validate(user,default))).Code);
    }
    [Fact,Trait("Case","PF-UT-040"),Trait("Case","PF-UT-042")]
    public async Task RefreshSession_CurrentTokenAndValidFamily_BuildsConditionalSuccessor()
    {
        var c=new AuthTestContext();var r=await c.App.Refresh(c.Store.RefreshToken,"android","127.0.0.1",default);Assert.Equal(200,r.Status);var p=c.Store.Calls.Single(x=>x.Command=="session.refresh").Payload;Assert.Equal(0,p.Number("expectedGeneration"));Assert.Equal(c.Store.PreviousId,p.Text("previousTokenId"));Assert.Equal(64,p.Text("tokenHash").Length);
        c.Store.Fault="session.refresh";Assert.Equal(503,(await Assert.ThrowsAsync<DomainException>(()=>c.App.Refresh(c.Store.RefreshToken,"android","127.0.0.1",default))).Status);
    }
    [Fact,Trait("Case","PF-UT-041")]
    public async Task RefreshSession_ConsumedToken_HandlesGraceRetryConflictAndReuseRevocation()
    {
        var c=new AuthTestContext();c.Store.ConsumedAt=c.Store.Now-29000;c.Store.Generation=1;await c.App.Refresh(c.Store.RefreshToken,"android","127.0.0.1",default);Assert.Equal(c.Store.HeadId,c.Store.Calls.Single(x=>x.Command=="session.refresh").Payload.Text("previousTokenId"));
        c.Store.Generation=2;Assert.Equal("REFRESH_RETRY",(await Assert.ThrowsAsync<DomainException>(()=>c.App.Refresh(c.Store.RefreshToken,"android","127.0.0.1",default))).Code);
        c.Store.ConsumedAt=c.Store.Now-30001;c.Store.DenySessionQuota=true;Assert.Equal("REFRESH_TOKEN_REUSE",(await Assert.ThrowsAsync<DomainException>(()=>c.App.Refresh(c.Store.RefreshToken,"android","127.0.0.1",default))).Code);Assert.Equal(c.Store.SessionId,c.Store.Calls.Last(x=>x.Command=="session.revoke").Payload.Text("sessionId"));
    }
    private sealed class CountingPassword:IPasswordHashService
    {
        public int VerifyCalls;public string Hash(string password)=>throw new InvalidOperationException("Unexpected password hash");public bool Verify(string password,string? hash){VerifyCalls++;return true;}public bool NeedsRehash(string hash)=>false;
    }
    private sealed class CountingCrypto(AuthOptions options):IAuthCryptography
    {
        private readonly AuthCryptography inner=new(options);public int CodeMacCalls;public string RandomToken()=>inner.RandomToken();public string Code()=>inner.Code();public string Sha(string value)=>inner.Sha(value);public bool EqualsHash(string? left,string? right)=>inner.EqualsHash(left,right);public string CodeMac(string id,string purpose,string email,int generation,string code){CodeMacCalls++;return inner.CodeMac(id,purpose,email,generation,code);}
    }
    [Theory,Trait("Case","PF-UT-063"),Trait("Case","PF-BDD-041")]
    [InlineData("request")][InlineData("resend")][InlineData("register")][InlineData("reset")][InlineData("login")][InlineData("external")][InlineData("link")][InlineData("change")][InlineData("refresh")]
    public async Task RateLimitDependencyFailure_StopsExpensiveChecksAndWrites(string operation)
    {
        foreach(var denied in new[]{false,true}){
        var c=new AuthTestContext();var challenge=c.Challenge(operation=="reset"?"reset_password":"register_email");var passwords=new CountingPassword();var crypto=new CountingCrypto(c.Options);var app=new AuthApplication(c.Store,passwords,new AccessTokens(c.Options,c.Clock),crypto,c.Clock,new RateLimiter(c.Store,c.Options,c.Clock),c.Sender,c.External,Microsoft.Extensions.Logging.Abstractions.NullLogger<AuthApplication>.Instance);c.Store.Fault="rate-limit.consume";
        if(denied){c.Store.Fault=null;c.Store.DenyAllQuota=true;}
        async Task Run(){switch(operation){case "request":await app.RequestCode("new@example.com","android","register_email","127.0.0.1",default);break;case "resend":await app.Resend(Id(challenge),c.Flow,"127.0.0.1",default);break;case "register":await app.Register(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,"android",default);break;case "reset":await app.Reset(Id(challenge),c.Flow,AuthTestContext.Code,AuthTestContext.Password,default);break;case "login":await app.Login(c.Store.Email,AuthTestContext.Password,"android","127.0.0.1",default);break;case "external":await app.ExternalLogin("google","controlled-proof","android","127.0.0.1",default);break;case "link":await app.Link(c.User,"google","controlled-proof","android","127.0.0.1",default);break;case "change":await app.ChangePassword(c.User,AuthTestContext.Password,AuthTestContext.Password,default);break;case "refresh":await app.Refresh(c.Store.RefreshToken,"android","127.0.0.1",default);break;default:throw new InvalidOperationException();}}
        var error=await Assert.ThrowsAsync<DomainException>(Run);Assert.Equal(denied?"RATE_LIMITED":"DEPENDENCY_UNAVAILABLE",error.Code);Assert.Equal(denied?429:503,error.Status);if(denied)Assert.True(error.RetryAfter>=1);Assert.Equal(0,c.Sender.Calls);Assert.Equal(0,passwords.VerifyCalls);Assert.Equal(0,c.External.Calls);Assert.Equal(0,crypto.CodeMacCalls);Assert.DoesNotContain(c.Store.Commands,command=>new[]{"email.challenge.create","email.challenge.resend","account.register-email","account.reset-password","account.change-password","session.create","session.refresh","identity.external.link"}.Contains(command));}
    }
    [Fact,Trait("Case","PF-UT-049"),Trait("Case","PF-UT-050")]
    public async Task RevokeSession_ExpiredConsumedAbsentOrAlreadyRevoked_RemainsSafeAndIdempotent()
    {
        var c=new AuthTestContext();await c.App.Logout(null,null,default);Assert.DoesNotContain("session.revoke",c.Store.Commands);
        c.Store.ConsumedAt=c.Store.Now-30001;await c.App.Logout(null,c.Store.RefreshToken,default);Assert.Equal(c.Store.SessionId,c.Store.Calls.Last(x=>x.Command=="session.revoke").Payload.Text("sessionId"));
        var old=c.Token;c.Store.SessionId=EntityId.New();Assert.Equal("CREDENTIAL_FAMILY_MISMATCH",(await Assert.ThrowsAsync<DomainException>(()=>c.App.Logout(old,c.Store.RefreshToken,default))).Code);
    }
}

