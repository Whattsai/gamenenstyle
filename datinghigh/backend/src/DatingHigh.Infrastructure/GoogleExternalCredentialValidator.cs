using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using DatingHigh.Application;
using DatingHigh.Domain;
namespace DatingHigh.Infrastructure;
/// <summary>以成熟 JWT 元件驗證固定 Google JWKS；client 不可指定信任來源。</summary>
public sealed class GoogleExternalCredentialValidator:IExternalCredentialValidator
{
    private readonly IReadOnlyDictionary<string,string[]> _allowed;
    private readonly IConfigurationManager<OpenIdConnectConfiguration> _configuration;
    private readonly TimeProvider _clock;
    private sealed class GoogleJwksRetriever(IPlatformClient? keySource):IConfigurationRetriever<OpenIdConnectConfiguration>
    {
        public async Task<OpenIdConnectConfiguration> GetConfigurationAsync(string address,IDocumentRetriever retriever,CancellationToken ct)
        {
            var document=keySource is null?await retriever.GetDocumentAsync("https://www.googleapis.com/oauth2/v3/certs",ct):(await keySource.ExecuteAsync("external.google-jwks",new{},ct)).ToJsonString();
            var config=new OpenIdConnectConfiguration{Issuer="https://accounts.google.com"};
            foreach(var key in new JsonWebKeySet(document).GetSigningKeys())config.SigningKeys.Add(key);return config;
        }
    }
    public GoogleExternalCredentialValidator(IReadOnlyDictionary<string,string[]> allowed,IConfigurationManager<OpenIdConnectConfiguration>? configuration=null,TimeProvider? clock=null,IPlatformClient? keySource=null)
    {
        _allowed=allowed;_clock=clock??TimeProvider.System;
        _configuration=configuration??new ConfigurationManager<OpenIdConnectConfiguration>("https://www.googleapis.com/oauth2/v3/certs",new GoogleJwksRetriever(keySource),new HttpDocumentRetriever{RequireHttps=true});
    }
    public async Task<VerifiedExternalIdentity> ValidateAsync(string provider,string platform,string credential,CancellationToken cancellationToken=default)
    {
        if(provider!="google") throw new DomainException("UNSUPPORTED_PROVIDER");
        if(!_allowed.TryGetValue(platform,out var audiences) || audiences.Length==0) throw new DomainException("EXTERNAL_PROVIDER_UNAVAILABLE",503);
        try
        {
            var config=await _configuration.GetConfigurationAsync(cancellationToken);
            var handler=new JwtSecurityTokenHandler{MapInboundClaims=false,MaximumTokenSizeInBytes=16384};
            var user=handler.ValidateToken(credential,new TokenValidationParameters
            {
                ValidateIssuerSigningKey=true,IssuerSigningKeys=config.SigningKeys,ValidAlgorithms=[SecurityAlgorithms.RsaSha256],
                ValidateIssuer=true,ValidIssuers=["https://accounts.google.com","accounts.google.com"],ValidateAudience=true,ValidAudiences=audiences,
                RequireExpirationTime=true,RequireSignedTokens=true,ValidateLifetime=true,ClockSkew=TimeSpan.FromSeconds(30),
                LifetimeValidator=(_,exp,_,_)=>exp.HasValue&&exp.Value>_clock.GetUtcNow().UtcDateTime.AddSeconds(-30)
            },out var token);
            var jwt=(JwtSecurityToken)token;var azp=user.FindFirstValue("azp");
            if(jwt.Audiences.Any(a=>!audiences.Contains(a,StringComparer.Ordinal)) || jwt.Audiences.Count()>1&&azp is null || azp is not null&&!audiences.Contains(azp,StringComparer.Ordinal) || !long.TryParse(user.FindFirstValue("iat"),out var issuedAt) || issuedAt>_clock.GetUtcNow().ToUnixTimeSeconds()+30 || user.FindFirstValue("email_verified")!="true")throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);
            var subject=user.FindFirstValue("sub");if(string.IsNullOrWhiteSpace(subject)||subject.Length>512)throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);
            string email;try{email=EmailAddress.Normalize(user.FindFirstValue("email")??"");}catch(DomainException){throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);}
            var domain=email.Split('@')[1];if(domain!="gmail.com"&&user.FindFirstValue("hd")!=domain)throw new DomainException("EXTERNAL_EMAIL_UNTRUSTED",401);
            return new("google",subject,email);
        }
        catch(SecurityTokenSignatureKeyNotFoundException){_configuration.RequestRefresh();throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);}
        catch(SecurityTokenException){throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);}
        catch(ArgumentException){throw new DomainException("EXTERNAL_CREDENTIAL_INVALID",401);}
        catch(Exception e)when(e is HttpRequestException or IOException or InvalidOperationException){throw new DomainException("DEPENDENCY_UNAVAILABLE",503);}
    }
}
