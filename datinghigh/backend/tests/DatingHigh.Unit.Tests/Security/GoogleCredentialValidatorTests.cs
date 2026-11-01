using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;using System.Text.Json.Nodes;using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
namespace DatingHigh.Unit.Tests.Security;
public class GoogleCredentialValidatorTests:IDisposable
{
    private readonly RSA _rsa=RSA.Create(2048);
    private readonly DateTimeOffset _now=DateTimeOffset.UtcNow;
    private RsaSecurityKey Key=>new(_rsa){KeyId="controlled-jwks-key"};
    private GoogleExternalCredentialValidator Validator()
    {
        var config=new OpenIdConnectConfiguration{Issuer="https://accounts.google.com"};config.SigningKeys.Add(Key);
        return new(new Dictionary<string,string[]>{["web"]=["web-client"],["ios"]=["ios-client"],["android"]=["android-client"]},new StaticConfigurationManager<OpenIdConnectConfiguration>(config),TimeProvider.System);
    }
    private string Token(string platform="web",string? email="A@gmail.com",string? hd=null,string issuer="https://accounts.google.com",string? subject="CaseSensitiveSub",bool verified=true,string? azp=null,int expiry=600,bool wrongKey=false)
    {
        var claims=new List<Claim>{new("email_verified",verified?"true":"false",ClaimValueTypes.Boolean),new("iat",_now.ToUnixTimeSeconds().ToString(),ClaimValueTypes.Integer64)};
        if(email is not null)claims.Add(new("email",email));if(subject is not null)claims.Add(new("sub",subject));if(hd is not null)claims.Add(new("hd",hd));if(azp is not null)claims.Add(new("azp",azp));
        using var other=RSA.Create(2048);var key=wrongKey?new RsaSecurityKey(other){KeyId=Key.KeyId}:Key;
        var jwt=new JwtSecurityToken(issuer,$"{platform}-client",claims,_now.AddMinutes(-20).UtcDateTime,_now.AddSeconds(expiry).UtcDateTime,new SigningCredentials(key,SecurityAlgorithms.RsaSha256));return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
    [Fact,Trait("Case","PF-UT-022"),Trait("Case","PF-UT-024"),Trait("Case","PF-UT-025")]
    public async Task ValidateGoogle_ValidSignatureIssuerAndAudience_ReturnsVerifiedIdentity()
    {
        var validator=Validator();foreach(var platform in new[]{"web","ios","android"}){var identity=await validator.ValidateAsync("google",platform,Token(platform));Assert.Equal("a@gmail.com",identity.EmailNormalized);Assert.Equal("CaseSensitiveSub",identity.Subject);}
        foreach(var bad in new[]{Token(issuer:"evil"),Token(azp:"other-app"),Token(expiry:-60),Token(wrongKey:true),Token("other")})Assert.Equal("EXTERNAL_CREDENTIAL_INVALID",(await Assert.ThrowsAsync<DomainException>(()=>validator.ValidateAsync("google","web",bad))).Code);
    }
    [Fact,Trait("Case","PF-UT-026")]
    public async Task ValidateGoogle_InvalidSubjectEmailOrUntrustedDomain_RejectsCredential()
    {
        var validator=Validator();
        foreach(var bad in new[]{Token(subject:null),Token(email:null),Token(verified:false),Token(email:"not-email")})Assert.Equal("EXTERNAL_CREDENTIAL_INVALID",(await Assert.ThrowsAsync<DomainException>(()=>validator.ValidateAsync("google","web",bad))).Code);
        Assert.Equal("EXTERNAL_EMAIL_UNTRUSTED",(await Assert.ThrowsAsync<DomainException>(()=>validator.ValidateAsync("google","web",Token(email:"a@example.com")))).Code);
        Assert.Equal("a@example.com",(await validator.ValidateAsync("google","web",Token(email:"A@EXAMPLE.com",hd:"example.com"))).EmailNormalized);
    }
    [Fact,Trait("Case","PF-BDD-029")]
    public async Task ValidateGoogle_InvalidAlgorithmIssuedAtOrMultiAudienceWithoutAuthorizedParty_Rejects()
    {
        string Make(string algorithm,string? issuedAt,bool multiple=false){var claims=new List<Claim>{new("email","owner@gmail.com"),new("email_verified","true",ClaimValueTypes.Boolean),new("sub","CaseSensitiveSub")};if(issuedAt is not null)claims.Add(new Claim("iat",issuedAt,ClaimValueTypes.Integer64));if(multiple)claims.Add(new Claim("aud","second-client"));return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken("https://accounts.google.com","web-client",claims,_now.AddMinutes(-1).UtcDateTime,_now.AddMinutes(10).UtcDateTime,new SigningCredentials(Key,algorithm)));}
        var config=new OpenIdConnectConfiguration{Issuer="https://accounts.google.com"};config.SigningKeys.Add(Key);var validator=new GoogleExternalCredentialValidator(new Dictionary<string,string[]>{["web"]=["web-client","second-client"],["android"]=["android-client"]},new StaticConfigurationManager<OpenIdConnectConfiguration>(config),TimeProvider.System);
        foreach(var proof in new[]{Make(SecurityAlgorithms.RsaSha384,_now.ToUnixTimeSeconds().ToString()),Make(SecurityAlgorithms.RsaSha256,null),Make(SecurityAlgorithms.RsaSha256,_now.AddHours(1).ToUnixTimeSeconds().ToString()),Make(SecurityAlgorithms.RsaSha256,_now.ToUnixTimeSeconds().ToString(),true),"controlled-opaque-access-token"})Assert.Equal("EXTERNAL_CREDENTIAL_INVALID",(await Assert.ThrowsAsync<DomainException>(()=>validator.ValidateAsync("google","web",proof))).Code);
        Assert.Equal("EXTERNAL_CREDENTIAL_INVALID",(await Assert.ThrowsAsync<DomainException>(()=>validator.ValidateAsync("google","android",Make(SecurityAlgorithms.RsaSha256,_now.ToUnixTimeSeconds().ToString())))).Code);
    }
    [Fact,Trait("Case","PF-UT-027")]
    public async Task ValidateGoogle_ReusedUnexpiredProofWithoutServerNonce_AllowsRevalidation()
    {
        var token=Token();var validator=Validator();Assert.Equal(await validator.ValidateAsync("google","web",token),await validator.ValidateAsync("google","web",token));
    }
    [Fact,Trait("Case","PF-UT-023")]
    public async Task ResolveValidator_UnsupportedProviderOrUnconfiguredClient_RejectsWithoutExpandingTrust()
    {
        var validator=Validator();Assert.Equal("UNSUPPORTED_PROVIDER",(await Assert.ThrowsAsync<DomainException>(()=>validator.ValidateAsync("facebook","web",Token()))).Code);
        Assert.Equal("EXTERNAL_PROVIDER_UNAVAILABLE",(await Assert.ThrowsAsync<DomainException>(()=>validator.ValidateAsync("google","unconfigured",Token()))).Code);
    }
    private sealed class KeyPlatform(JsonNode document):IPlatformClient
    {
        public List<string> Commands {get;}=[];public bool Unavailable {get;set;}
        public Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken cancellationToken=default){Commands.Add(command);Assert.Equal("external.google-jwks",command);Assert.Empty(JsonSerializer.SerializeToNode(payload)!.AsObject());if(Unavailable)throw new DomainException("DEPENDENCY_UNAVAILABLE",503);return Task.FromResult(document.DeepClone());}
    }
    private JsonNode PublicKeys(){var key=_rsa.ExportParameters(false);return JsonSerializer.SerializeToNode(new{keys=new[]{new{kty="RSA",use="sig",alg="RS256",kid=Key.KeyId,n=Base64UrlEncoder.Encode(key.Modulus!),e=Base64UrlEncoder.Encode(key.Exponent!)}}})!;}
    [Fact,Trait("Case","PF-UT-024")]
    public async Task ValidateGoogle_KeysFromFixedWorkerBridge_StillValidatesSignatureAndAudience()
    {
        var platform=new KeyPlatform(PublicKeys());var validator=new GoogleExternalCredentialValidator(new Dictionary<string,string[]>{["web"]=["web-client"]},keySource:platform);Assert.Equal("a@gmail.com",(await validator.ValidateAsync("google","web",Token())).EmailNormalized);Assert.Equal("EXTERNAL_CREDENTIAL_INVALID",(await Assert.ThrowsAsync<DomainException>(()=>validator.ValidateAsync("google","web",Token(wrongKey:true)))).Code);Assert.Single(platform.Commands);
    }
    [Fact,Trait("Case","PF-UT-024")]
    public async Task ValidateGoogle_WorkerKeySourceUnavailable_DoesNotAcceptCredential()
    {
        var platform=new KeyPlatform(PublicKeys()){Unavailable=true};var validator=new GoogleExternalCredentialValidator(new Dictionary<string,string[]>{["web"]=["web-client"]},keySource:platform);Assert.Equal("DEPENDENCY_UNAVAILABLE",(await Assert.ThrowsAsync<DomainException>(()=>validator.ValidateAsync("google","web",Token()))).Code);
    }
    public void Dispose()=>_rsa.Dispose();
}
