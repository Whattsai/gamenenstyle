using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using DatingHigh.Domain;
namespace DatingHigh.Infrastructure;
/// <summary>平台 Access JWT 的簽發與嚴格類型驗證。</summary>
public sealed class AccessTokens(AuthOptions options,TimeProvider clock):DatingHigh.Application.IAccessTokenIssuer
{
    public TokenValidationParameters Parameters=>new()
    {
        ValidateIssuer=true,ValidIssuer=options.Issuer,ValidateAudience=true,ValidAudience=options.Audience,
        ValidateIssuerSigningKey=true,IssuerSigningKey=new SymmetricSecurityKey(options.AccessKey),
        ValidAlgorithms=[SecurityAlgorithms.HmacSha256],ValidTypes=["at+jwt"],ClockSkew=TimeSpan.FromSeconds(30),
        RequireExpirationTime=true,RequireSignedTokens=true,ValidateLifetime=true,
        LifetimeValidator=(nbf,exp,_,_)=>
        {
            if(!nbf.HasValue || !exp.HasValue || nbf.Value>exp.Value) throw new SecurityTokenInvalidLifetimeException();
            if(exp.Value<=clock.GetUtcNow().UtcDateTime.AddSeconds(-30)) throw new SecurityTokenExpiredException();
            if(nbf.Value>clock.GetUtcNow().UtcDateTime.AddSeconds(30)) throw new SecurityTokenNotYetValidException();
            return true;
        }
    };
    public string Issue(string account,string session,long cv,DateTimeOffset expires)
    {
        var now=clock.GetUtcNow();
        var jwt=new JwtSecurityToken(options.Issuer,options.Audience,[new Claim("sub",account),new Claim("sid",session),new Claim("cv",cv.ToString(System.Globalization.CultureInfo.InvariantCulture)),new Claim("jti",EntityId.New()),new Claim("iat",now.ToUnixTimeSeconds().ToString(System.Globalization.CultureInfo.InvariantCulture),ClaimValueTypes.Integer64)],now.UtcDateTime,expires.UtcDateTime,new SigningCredentials(new SymmetricSecurityKey(options.AccessKey),SecurityAlgorithms.HmacSha256));
        jwt.Header["typ"]="at+jwt"; return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
    public ClaimsPrincipal Validate(string token)
    {
        try
        {
            var handler=new JwtSecurityTokenHandler{MapInboundClaims=false};
            var principal=handler.ValidateToken(token,Parameters,out var validated);
            if(validated is not JwtSecurityToken jwt || !EntityId.IsValid(principal.FindFirstValue("sub")) || !EntityId.IsValid(principal.FindFirstValue("sid")) || !EntityId.IsValid(principal.FindFirstValue("jti")) || !long.TryParse(principal.FindFirstValue("cv"),out var cv) || cv<1 || !long.TryParse(principal.FindFirstValue("iat"),out var iat) || iat>clock.GetUtcNow().ToUnixTimeSeconds()+30 || jwt.ValidTo-jwt.ValidFrom>TimeSpan.FromMinutes(10))
                throw new DomainException("ACCESS_TOKEN_INVALID",401);
            return principal;
        }
        catch(SecurityTokenExpiredException) { throw new DomainException("ACCESS_TOKEN_EXPIRED",401); }
        catch(SecurityTokenException) { throw new DomainException("ACCESS_TOKEN_INVALID",401); }
        catch(ArgumentException) { throw new DomainException("ACCESS_TOKEN_INVALID",401); }
    }
}
