using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
using DatingHigh.Application;
namespace DatingHigh.Api;
/// <summary>每次 Access 驗簽後必查 D1 primary 的有效 family。</summary>
public sealed class PlatformAuthentication(IOptionsMonitor<AuthenticationSchemeOptions> settings,ILoggerFactory logger,UrlEncoder encoder,AuthOptions authOptions,AccessTokens tokens,AuthApplication app):AuthenticationHandler<AuthenticationSchemeOptions>(settings,logger,encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        try
        {
            var token=Context.AccessCredential(authOptions);if(string.IsNullOrEmpty(token)) throw new DomainException("ACCESS_TOKEN_MISSING",401);
            var user=tokens.Validate(token);var row=await app.Validate(user,Context.RequestAborted);
            Context.Items["currentRow"]=row;Context.Response.Headers["X-DatingHigh-Session"]=row.Text("session_id");
            return AuthenticateResult.Success(new AuthenticationTicket(user,Scheme.Name));
        }
        catch(DomainException e){Context.Items["authError"]=e;return AuthenticateResult.Fail(e.Code);}
    }
    protected override Task HandleChallengeAsync(AuthenticationProperties properties)=>HttpContract.Problem(Context,Context.Items["authError"] as DomainException??new DomainException("ACCESS_TOKEN_MISSING",401));
}
