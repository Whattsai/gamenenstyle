using DatingHigh.Domain;
using DatingHigh.Infrastructure;
namespace DatingHigh.Unit.Tests.Security;
public class KeyRingRetentionTests
{
    private static readonly byte[] A=Enumerable.Range(0,32).Select(x=>(byte)x).ToArray(),B=Enumerable.Range(1,32).Select(x=>(byte)x).ToArray();
    private static AuthOptions Options=>new("local","issuer","audience",A,A,A,"http://localhost:8081","Log");
    [Fact,Trait("Case","PF-UT-079")]
    public void LoadSecrets_RestartWithUnexpiredArtifacts_RetainsSymmetricSecrets()
    {
        var first=new AccessTokens(Options,TimeProvider.System);var token=first.Issue(EntityId.New(),EntityId.New(),1,DateTimeOffset.UtcNow.AddMinutes(10));
        Assert.NotNull(new AccessTokens(Options,TimeProvider.System).Validate(token));var id=EntityId.New();Assert.Equal(new ChallengeCrypto(A).CodeMac(id,"register_email","a@example.com",1,"000001"),new ChallengeCrypto(A).CodeMac(id,"register_email","a@example.com",1,"000001"));
    }
    [Fact,Trait("Case","PF-UT-080")]
    public void RotateSecret_AccessCodeOrRateLimitSecretChanged_AppliesDefinedInvalidation()
    {
        var token=new AccessTokens(Options,TimeProvider.System).Issue(EntityId.New(),EntityId.New(),1,DateTimeOffset.UtcNow.AddMinutes(10));Assert.Throws<DomainException>(()=>new AccessTokens(Options with{AccessKey=B},TimeProvider.System).Validate(token));
        var id=EntityId.New();Assert.NotEqual(new ChallengeCrypto(A).CodeMac(id,"register_email","a@example.com",0,"000001"),new ChallengeCrypto(B).CodeMac(id,"register_email","a@example.com",0,"000001"));
        Assert.NotEqual(new ChallengeCrypto(A).SubjectHash("local","email","a@example.com"),new ChallengeCrypto(B).SubjectHash("local","email","a@example.com"));
    }
}
