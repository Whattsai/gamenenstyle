using System.Security.Claims;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using DatingHigh.Application;
using DatingHigh.Application.RateLimiting;
using DatingHigh.Domain;
namespace DatingHigh.Application;

/// <summary>認證用例；權杖僅在原子資料提交成功後曝光。</summary>
public sealed class AuthApplication(IPlatformClient platform,IPasswordHashService passwords,IAccessTokenIssuer access,IAuthCryptography cryptography,TimeProvider clock,IRateLimiter limiter,IEmailCodeSender sender,IExternalCredentialValidator external,ILogger<AuthApplication> logger)
{
    private long Now=>clock.GetUtcNow().ToUnixTimeMilliseconds();
    private IAuthCryptography Crypto=>cryptography;
    private async Task<JsonNode> First(string command,object payload,CancellationToken ct)=> (await platform.ExecuteAsync(command,payload,ct))["rows"]!.AsArray().FirstOrDefault()?.DeepClone()??new JsonObject();
    private static void Written(JsonNode result,string code="CREDENTIAL_CHANGED")
    {
        if(result["changes"]!.AsArray().Last()!.GetValue<long>()==0) throw new DomainException(code,409);
    }
    private async Task Deliver(JsonNode challenge,string code,CancellationToken ct)
    {
        if(challenge["account_id"] is null && challenge.Text("purpose")=="reset_password") return;
        using var deadline=new CancellationTokenSource(TimeSpan.FromSeconds(10),clock);
        using var timeout=CancellationTokenSource.CreateLinkedTokenSource(ct,deadline.Token);
        try { await sender.SendAsync(challenge,code,timeout.Token).WaitAsync(TimeSpan.FromSeconds(10),clock,ct); }
        catch(Exception e) when(e is not OperationCanceledException || !ct.IsCancellationRequested)
        {
            logger.LogWarning("Email delivery failed Challenge={Challenge} Purpose={Purpose}",challenge.Text("challenge_id"),challenge.Text("purpose"));
            if(challenge.Text("purpose")=="register_email") throw new DomainException("EMAIL_DELIVERY_FAILED",503);
        }
    }
    private object Metadata(JsonNode c,string flow)=>new{challengeId=c.Text("challenge_id"),flowToken=flow,expiresAt=DateTimeOffset.FromUnixTimeMilliseconds(c.Number("expires_at")),absoluteExpiresAt=DateTimeOffset.FromUnixTimeMilliseconds(c.Number("absolute_expires_at")),resendAfter=DateTimeOffset.FromUnixTimeMilliseconds(c.Number("resend_after")),message=c.Text("purpose")=="reset_password"?"若此 Email 可處理，將收到驗證碼":"驗證碼已寄出，請查看信箱"};
    public async Task<object> RequestCode(string email,string clientPlatform,string purpose,string ip,CancellationToken ct)
    {
        await platform.ExecuteAsync("platform.ready",new{},ct);
        await limiter.ConsumeAsync("email_code_send.v1","ip",ip,ct);email=EmailAddress.Normalize(email);
        await limiter.ConsumeAsync("email_code_send.v1","email",email,ct);
        var account=await First("account.lookup-credentials",new{email},ct);
        if(purpose=="register_email" && !account.IsEmpty()) throw new DomainException("EMAIL_ALREADY_REGISTERED",409);
        var challengeId=EntityId.New();var flow=Crypto.RandomToken();var code=Crypto.Code();
        var challenge=await First("email.challenge.create",new{challengeId,purpose,email,clientPlatform,flowTokenHash=Crypto.Sha(flow),codeMac=Crypto.CodeMac(challengeId,purpose,email,0,code),accountId=purpose=="reset_password"?account.Maybe("account_id"):null,cv=purpose=="reset_password"&&!account.IsEmpty()?(long?)account.Number("credential_version"):null},ct);
        try{await Deliver(challenge,code,ct);}catch(DomainException e)when(e.Code=="EMAIL_DELIVERY_FAILED"){throw new DomainException(e.Code,e.Status){Recovery=Metadata(challenge,flow)};}return Metadata(challenge,flow);
    }
    public async Task<JsonNode> GetChallenge(string id,string flow,string purpose,CancellationToken ct)
    {
        if(!EntityId.IsValid(id)) throw new DomainException("INVALID_OR_EXPIRED_CODE");
        var c=await First("email.challenge.get",new{challengeId=id},ct);
        if(c.IsEmpty() || !Crypto.EqualsHash(c.Maybe("flow_token_hash"),Crypto.Sha(flow)) || c.Text("purpose")!=purpose) throw new DomainException("INVALID_OR_EXPIRED_CODE");
        return c;
    }
    private static object Proof(JsonNode c)=>new{challengeId=c.Text("challenge_id"),generation=c.Number("generation"),codeMac=c.Text("code_mac"),flowTokenHash=c.Text("flow_token_hash")};
    private async Task<JsonNode> Verify(string id,string flow,string code,string purpose,CancellationToken ct)
    {
        var c=await GetChallenge(id,flow,purpose,ct);await limiter.ConsumeAsync("email_code_verify.v1","email",c.Text("email_normalized"),ct);
        var valid=c.Text("state")=="active" && c.Number("failed_attempts")<5 && c.Number("expires_at")>Now && c.Number("absolute_expires_at")>Now;
        if(!valid) throw new DomainException(purpose=="reset_password"?"INVALID_OR_EXPIRED_CODE":c.Text("state")=="locked"?"CODE_LOCKED":"CODE_EXPIRED",purpose=="reset_password"?400:410);
        if(!Regex.IsMatch(code,"^[0-9]{6}$") || !Crypto.EqualsHash(c.Maybe("code_mac"),Crypto.CodeMac(id,purpose,c.Text("email_normalized"),(int)c.Number("generation"),code)))
        {
            await platform.ExecuteAsync("email.challenge.fail-attempt",Proof(c),ct);throw new DomainException("INVALID_OR_EXPIRED_CODE");
        }
        if(purpose=="reset_password" && c["account_id"] is null) throw new DomainException("INVALID_OR_EXPIRED_CODE");
        return c;
    }
    public async Task<object> Resend(string id,string flow,string ip,CancellationToken ct)
    {
        await platform.ExecuteAsync("platform.ready",new{},ct);
        await limiter.ConsumeAsync("email_code_send.v1","ip",ip,ct);
        var raw=await First("email.challenge.get",new{challengeId=id},ct);
        if(raw.IsEmpty()) throw new DomainException("INVALID_OR_EXPIRED_CODE");
        var c=await GetChallenge(id,flow,raw.Text("purpose"),ct);
        if(c.Text("state")!="active" || c.Number("absolute_expires_at")<=Now) throw new DomainException("CODE_EXPIRED",410);
        if(c.Number("resend_after")>Now) throw new DomainException("RATE_LIMITED",429,(int)Math.Max(1,Math.Ceiling((c.Number("resend_after")-Now)/1000d)));
        await limiter.ConsumeAsync("email_code_send.v1","email",c.Text("email_normalized"),ct);
        var code=Crypto.Code();var next=await First("email.challenge.resend",new{challengeId=id,generation=c.Number("generation"),codeMac=c.Text("code_mac"),flowTokenHash=c.Text("flow_token_hash"),newCodeMac=Crypto.CodeMac(id,c.Text("purpose"),c.Text("email_normalized"),(int)c.Number("generation")+1,code)},ct);
        if(next.IsEmpty()) throw new DomainException("RATE_LIMITED",429,60);
        try{await Deliver(next,code,ct);}catch(DomainException e)when(e.Code=="EMAIL_DELIVERY_FAILED"){throw new DomainException(e.Code,e.Status){Recovery=Metadata(next,flow)};}return Metadata(next,flow);
    }
    public async Task<JsonNode> Validate(ClaimsPrincipal user,CancellationToken ct)
    {
        var row=await First("session.validate",Auth(user),ct);
        if(row.IsEmpty()) throw new DomainException("SESSION_REVOKED",401);return row;
    }
    public object Auth(ClaimsPrincipal user)=>new{accountId=user.FindFirst("sub")?.Value,sessionId=user.FindFirst("sid")?.Value,cv=long.Parse(user.FindFirst("cv")!.Value,System.Globalization.CultureInfo.InvariantCulture),accessExpiresAt=long.Parse(user.FindFirst("exp")!.Value,System.Globalization.CultureInfo.InvariantCulture)*1000};
    private sealed record PendingPair(string SessionId,string TokenId,string TokenHash,string Refresh,string Access,DateTimeOffset Absolute,DateTimeOffset Idle,DateTimeOffset AccessExpiry);
    private PendingPair Prepare(string account,long cv,string? sid=null,long? absolute=null)
    {
        var now=clock.GetUtcNow();var lifetime=SessionLifetime.Create(now);var abs=absolute.HasValue?DateTimeOffset.FromUnixTimeMilliseconds(absolute.Value):lifetime.Absolute;
        var idle=SessionLifetime.Refresh(now,abs);var exp=SessionLifetime.Access(now,idle,abs);var session=sid??EntityId.New();var refresh=Crypto.RandomToken();
        return new(session,EntityId.New(),Crypto.Sha(refresh),refresh,access.Issue(account,session,cv,exp),abs,idle,exp);
    }
    private static object PairInput(PendingPair p,string account,string clientPlatform,long cv)=>new{accountId=account,sessionId=p.SessionId,tokenId=p.TokenId,tokenHash=p.TokenHash,clientPlatform,absoluteExpiresAt=p.Absolute.ToUnixTimeMilliseconds(),idleExpiresAt=p.Idle.ToUnixTimeMilliseconds(),cv};
    private static Dictionary<string,object?> Fields(object o)=>System.Text.Json.JsonSerializer.Deserialize<Dictionary<string,object?>>(System.Text.Json.JsonSerializer.Serialize(o))!;
    public sealed record LoginResult(object Body,string Access,string Refresh,DateTimeOffset AccessExpiry,DateTimeOffset RefreshExpiry,string SessionId,int Status);
    private async Task<LoginResult> Result(PendingPair p,string account,string clientPlatform,int status,CancellationToken ct)
    {
        var row=await First("account.lookup-credentials",new{email=account},ct);
        var auth=new{accountId=row.Text("account_id"),sessionId=p.SessionId,cv=row.Number("credential_version"),accessExpiresAt=p.AccessExpiry.ToUnixTimeMilliseconds()};
        var dto=await AccountDto(row,auth,ct);
        object tokens=clientPlatform=="web"?new{accessExpiresAt=p.AccessExpiry,refreshExpiresAt=p.Idle}:new{tokenType="Bearer",accessToken=p.Access,refreshToken=p.Refresh,accessExpiresAt=p.AccessExpiry,refreshExpiresAt=p.Idle};
        return new(new{account=dto,session=new{sessionId=p.SessionId,absoluteExpiresAt=p.Absolute,idleExpiresAt=p.Idle},tokens},p.Access,p.Refresh,p.AccessExpiry,p.Idle,p.SessionId,status);
    }
    public async Task<object> AccountDto(JsonNode row,object auth,CancellationToken ct)
    {
        var identities=await platform.ExecuteAsync("identity.list",auth,ct);
        return new{accountId=row.Text("account_id"),email=row.Text("email_normalized"),emailVerified=true,hasLocalPassword=row["password_hash"] is not null,linkedProviders=identities["rows"]!.AsArray().Select(i=>i!.Text("provider")).ToArray(),createdAt=DateTimeOffset.FromUnixTimeMilliseconds(row.Number("created_at"))};
    }
    public async Task<LoginResult> Register(string id,string flow,string code,string password,string clientPlatform,CancellationToken ct)
    {
        PasswordPolicy.Validate(password);var c=await Verify(id,flow,code,"register_email",ct);
        if(c.Text("client_platform")!=clientPlatform) throw new DomainException("INVALID_PLATFORM");
        var account=EntityId.New();var p=Prepare(account,1);var payload=Fields(PairInput(p,account,clientPlatform,1));payload.Remove("cv");
        foreach(var kv in Fields(Proof(c))) payload[kv.Key]=kv.Value;payload["passwordHash"]=passwords.Hash(password);
        Written(await platform.ExecuteAsync("account.register-email",payload,ct),"INVALID_OR_EXPIRED_CODE");
        return await Result(p,c.Text("email_normalized"),clientPlatform,201,ct);
    }
    public async Task<LoginResult> Login(string email,string password,string clientPlatform,string ip,CancellationToken ct)
    {
        await limiter.ConsumeAsync("password_login.v1","ip",ip,ct);email=EmailAddress.Normalize(email);await limiter.ConsumeAsync("password_login.v1","email",email,ct);
        var row=await First("account.lookup-credentials",new{email},ct);
        if(!passwords.Verify(password,row.Maybe("password_hash")) || row.IsEmpty() || row.Text("status")!="active") throw new DomainException("INVALID_CREDENTIALS",401);
        var p=Prepare(row.Text("account_id"),row.Number("credential_version"));Written(await platform.ExecuteAsync("session.create",PairInput(p,row.Text("account_id"),clientPlatform,row.Number("credential_version")),ct));
        if(passwords.NeedsRehash(row.Text("password_hash")))
        {
            // 等價升級不改 cv；並行修改密碼或新登入時，由原 hash、cv 與目前 family 條件拒絕覆寫。
            try{await platform.ExecuteAsync("account.rehash",new{accountId=row.Text("account_id"),sessionId=p.SessionId,cv=row.Number("credential_version"),accessExpiresAt=p.AccessExpiry.ToUnixTimeMilliseconds(),oldHash=row.Text("password_hash"),passwordHash=passwords.Hash(password)},ct);}
            catch(DomainException e)when(e.Status==503){logger.LogWarning("Equivalent password upgrade deferred Account={Account}",row.Text("account_id"));}
        }
        return await Result(p,email,clientPlatform,201,ct);
    }
    public async Task<LoginResult> ExternalLogin(string provider,string credential,string clientPlatform,string ip,CancellationToken ct)
    {
        await limiter.ConsumeAsync("external_credential.v1","ip",ip,ct);var identity=await external.ValidateAsync(provider,clientPlatform,credential,ct);
        var row=await First("identity.lookup",new{provider=identity.Provider,subject=identity.Subject},ct);
        if(!row.IsEmpty() && row.Text("email_normalized")!=identity.EmailNormalized) throw new DomainException("EXTERNAL_EMAIL_CHANGED",409);
        if(!row.IsEmpty() && row.Text("status")!="active") throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);
        var fresh=row.IsEmpty();var account=fresh?EntityId.New():row.Text("account_id");var cv=fresh?1:row.Number("credential_version");var p=Prepare(account,cv);
        var payload=Fields(PairInput(p,account,clientPlatform,cv));
        if(fresh){payload.Remove("cv");payload["identityId"]=EntityId.New();payload["provider"]=identity.Provider;payload["subject"]=identity.Subject;payload["email"]=identity.EmailNormalized;}
        Written(await platform.ExecuteAsync(fresh?"account.register-external":"session.create",payload,ct));return await Result(p,identity.EmailNormalized,clientPlatform,fresh?201:200,ct);
    }
    public async Task Reset(string id,string flow,string code,string newPassword,CancellationToken ct)
    {
        PasswordPolicy.Validate(newPassword);var c=await Verify(id,flow,code,"reset_password",ct);var payload=Fields(Proof(c));payload["passwordHash"]=passwords.Hash(newPassword);Written(await platform.ExecuteAsync("account.reset-password",payload,ct));
    }
    public async Task ChangePassword(ClaimsPrincipal user,string current,string next,CancellationToken ct)
    {
        var row=await Validate(user,ct);await limiter.ConsumeAsync("credential_change.v1","account",row.Text("account_id"),ct);
        if(row["password_hash"] is null) throw new DomainException("PASSWORD_NOT_SET",409);
        if(!passwords.Verify(current,row.Text("password_hash"))) throw new DomainException("CURRENT_PASSWORD_INVALID",401);
        PasswordPolicy.Validate(next);var payload=Fields(Auth(user));payload["passwordHash"]=passwords.Hash(next);Written(await platform.ExecuteAsync("account.change-password",payload,ct));
    }
    public async Task Link(ClaimsPrincipal user,string provider,string credential,string clientPlatform,string ip,CancellationToken ct)
    {
        var row=await Validate(user,ct);await limiter.ConsumeAsync("external_credential.v1","ip",ip,ct);var i=await external.ValidateAsync(provider,clientPlatform,credential,ct);
        if(row.Text("email_normalized")!=i.EmailNormalized) throw new DomainException("EXTERNAL_EMAIL_MISMATCH",409);
        var payload=Fields(Auth(user));payload["identityId"]=EntityId.New();payload["provider"]=i.Provider;payload["subject"]=i.Subject;payload["email"]=i.EmailNormalized;
        Written(await platform.ExecuteAsync("identity.external.link",payload,ct),"EXTERNAL_IDENTITY_IN_USE");
    }
    public async Task Unlink(ClaimsPrincipal user,string provider,string current,CancellationToken ct)
    {
        if(provider!="google") throw new DomainException("UNSUPPORTED_PROVIDER");var row=await Validate(user,ct);await limiter.ConsumeAsync("credential_change.v1","account",row.Text("account_id"),ct);
        if(row["password_hash"] is null) throw new DomainException("LAST_LOGIN_METHOD",409);
        if(!passwords.Verify(current,row.Text("password_hash"))) throw new DomainException("CURRENT_PASSWORD_INVALID",401);
        var payload=Fields(Auth(user));payload["provider"]=provider;Written(await platform.ExecuteAsync("identity.external.unlink",payload,ct));
    }
    public async Task<LoginResult> Refresh(string token,string clientPlatform,string ip,CancellationToken ct)
    {
        await limiter.ConsumeAsync("session_refresh.v1","ip",ip,ct);
        if(!Regex.IsMatch(token,"^[A-Za-z0-9_-]{43}$")) throw new DomainException("REFRESH_INVALID",401);
        var r=await First("session.lookup-refresh",new{tokenHash=Crypto.Sha(token)},ct);
        if(r.IsEmpty()) throw new DomainException("REFRESH_INVALID",401);
        var sid=r.Text("session_id");
        if(r["consumed_at"] is not null && Now-r.Number("consumed_at")>30000)
        {
            await platform.ExecuteAsync("session.revoke",new{sessionId=sid,reason="refresh_reuse"},ct);throw new DomainException("REFRESH_TOKEN_REUSE",401);
        }
        if(r["revoked_at"] is not null || r.Text("status")!="active" || r.Number("account_cv")!=r.Number("credential_version")) throw new DomainException("REFRESH_REVOKED",401);
        if(r.Number("absolute_expires_at")<=Now || r.Number("idle_expires_at")<=Now) throw new DomainException("REFRESH_EXPIRED",401);
        if(r.Text("client_platform")!=clientPlatform) throw new DomainException("REFRESH_INVALID",401);
        await limiter.ConsumeAsync("session_refresh.v1","session",sid,ct);
        var generation=r.Number("current_generation");var previous=r.Text("token_id");
        if(r["consumed_at"] is not null)
        {
            if(r.Number("generation")!=generation-1) throw new DomainException("REFRESH_RETRY",409);
            // head 的 ID 只在可信 handler 解析，原 token 的替代關係指向唯一目前 head。
            previous=r.Text("replaced_by_token_id");
        }
        var p=Prepare(r.Text("account_id"),r.Number("credential_version"),sid,r.Number("absolute_expires_at"));
        var payload=new{accountId=r.Text("account_id"),sessionId=sid,cv=r.Number("credential_version"),accessExpiresAt=p.AccessExpiry.ToUnixTimeMilliseconds(),expectedGeneration=generation,previousTokenId=previous,tokenId=p.TokenId,tokenHash=p.TokenHash,idleExpiresAt=p.Idle.ToUnixTimeMilliseconds()};
        Written(await platform.ExecuteAsync("session.refresh",payload,ct),"REFRESH_RETRY");
        // 將帳號 Email 從固定 Account 查詢取得，不能由 client 指定。
        var validated=await First("session.validate",new{accountId=r.Text("account_id"),sessionId=sid,cv=r.Number("credential_version"),accessExpiresAt=p.AccessExpiry.ToUnixTimeMilliseconds()},ct);
        if(validated.IsEmpty()) throw new DomainException("SESSION_REVOKED",401);
        return await Result(p,validated.Text("email_normalized"),clientPlatform,200,ct);
    }
    public async Task Logout(string? accessToken,string? refreshToken,CancellationToken ct,string? expectedSessionId=null)
    {
        if(expectedSessionId is not null&&!EntityId.IsValid(expectedSessionId))throw new DomainException("INVALID_REQUEST");
        void MatchTarget(string? candidate){if(expectedSessionId is not null&&candidate is not null&&candidate!=expectedSessionId)throw new DomainException("SESSION_CHANGED",409);}
        string? sid=null;
        if(!string.IsNullOrEmpty(accessToken)){try{sid=access.Validate(accessToken).FindFirst("sid")?.Value;}catch(DomainException){}}
        MatchTarget(sid);
        if(!string.IsNullOrEmpty(refreshToken))
        {
            var row=await First("session.lookup-refresh",new{tokenHash=Crypto.Sha(refreshToken)},ct);
            if(!row.IsEmpty()){MatchTarget(row.Text("session_id"));if(sid is not null && sid!=row.Text("session_id")) throw new DomainException("CREDENTIAL_FAMILY_MISMATCH");sid=row.Text("session_id");}
        }
        if(sid is not null) await platform.ExecuteAsync("session.revoke",new{sessionId=sid,reason="logout"},ct);
    }
}
