using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
namespace DatingHigh.Unit.Tests.Security;
public class AccessTokenValidationTests
{
    private readonly DateTimeOffset _now=DateTimeOffset.UtcNow;
    private readonly AuthOptions _options=new("local","issuer","audience",Enumerable.Range(0,32).Select(i=>(byte)i).ToArray(),new byte[32],new byte[32],"http://localhost:8081","Log");
    private sealed class Clock(DateTimeOffset now):TimeProvider{public override DateTimeOffset GetUtcNow()=>now;}
    [Fact, Trait("Case","PF-UT-037")]
    public void ValidateAccess_RequiredClaimsSecretAndTimes_RequiresPlatformHs256Jwt()
    {
        var service=new AccessTokens(_options,new Clock(_now));var token=service.Issue(EntityId.New(),EntityId.New(),1,_now.AddMinutes(10));
        var principal=service.Validate(token);Assert.NotNull(principal.FindFirstValue("sid"));Assert.Null(principal.FindFirstValue("email"));
        var jwt=new JwtSecurityTokenHandler().ReadJwtToken(token);
        foreach(var missing in new[]{"iss","aud","sub","sid","cv","jti","iat","nbf","exp"})
        {
            var payload=new JwtPayload();foreach(var item in jwt.Payload)payload[item.Key]=item.Value;payload.Remove(missing);
            var changed=new JwtSecurityToken(new JwtHeader(new SigningCredentials(new SymmetricSecurityKey(_options.AccessKey),SecurityAlgorithms.HmacSha256)){["typ"]="at+jwt"},payload);
            var bad=new JwtSecurityTokenHandler().WriteToken(changed);Assert.Throws<DomainException>(()=>service.Validate(bad));
        }
        Assert.Throws<DomainException>(()=>new AccessTokens(_options with{AccessKey=new byte[32]},new Clock(_now)).Validate(token));
        var expired=new AccessTokens(_options,new Clock(_now.AddMinutes(11)));
        Assert.Equal("ACCESS_TOKEN_EXPIRED",Assert.Throws<DomainException>(()=>expired.Validate(token)).Code);
    }
}

