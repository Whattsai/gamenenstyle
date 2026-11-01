using DatingHigh.Domain;
using DatingHigh.Infrastructure;
namespace DatingHigh.Unit.Tests.Security;
public class CryptoPolicyTests
{
    private static readonly byte[] Key=Enumerable.Range(0,32).Select(x=>(byte)x).ToArray();
    [Fact, Trait("Case","PF-UT-013")]
    public void VerifyCode_BindingOrStateMismatch_RejectsWithoutCompletion()
    {
        var id=EntityId.New(); var c=new ChallengeCrypto(Key); var mac=c.CodeMac(id,"register_email","a@example.com",0,"000001");
        Assert.Equal(64,mac.Length); Assert.True(ChallengeCrypto.EqualsHash(mac,c.CodeMac(id,"register_email","a@example.com",0,"000001")));
        foreach(var wrong in new[]{c.CodeMac(id,"reset_password","a@example.com",0,"000001"),c.CodeMac(id,"register_email","b@example.com",0,"000001"),c.CodeMac(id,"register_email","a@example.com",1,"000001")})
            Assert.False(ChallengeCrypto.EqualsHash(mac,wrong));
        Assert.Equal(43,ChallengeCrypto.RandomToken().Length);
    }
    [Fact, Trait("Case","PF-UT-058")]
    public void HashSubject_PipeDelimitedCanonicalInput_ProducesStableHmacInDotNet()
    {
        var h=new ChallengeCrypto(Key);
        Assert.Equal(h.SubjectHash("local","email","a@b.com"),h.SubjectHash("local","email","a@b.com"));
        Assert.NotEqual(h.SubjectHash("local","email","a@b.com"),h.SubjectHash("staging","email","a@b.com"));
        Assert.NotEqual(h.SubjectHash("local","session","a"),h.SubjectHash("local","account","a"));
    }
    [Fact, Trait("Case","PF-UT-035")]
    public void CalculateExpiry_AbsoluteIdleAndAccessBoundaries_ClampsDeadlines()
    {
        var now=DateTimeOffset.UtcNow; var session=SessionLifetime.Create(now);
        Assert.Equal(now.AddDays(30),session.Absolute); Assert.Equal(now.AddDays(7),session.Idle);
        Assert.Equal(session.Absolute,SessionLifetime.Refresh(now.AddDays(29),session.Absolute));
        Assert.Equal(now.AddMinutes(1),SessionLifetime.Access(now,now.AddMinutes(1),session.Absolute));
    }
    [Fact, Trait("Case","PF-UT-064")]
    public void EntityIds_TrustedGeneration_AreCanonicalVersionSeven()
    {
        Assert.True(EntityId.IsValid(EntityId.New())); Assert.False(EntityId.IsValid(Guid.NewGuid().ToString()));
        Assert.False(EntityId.IsValid(EntityId.New().ToUpperInvariant()));
    }
    [Fact, Trait("Case","PF-UT-053")]
    public void AuthorizeResource_UnknownTypeOrMissingParticipantPolicy_DeniesAccess()
    {
        Assert.False(new ResourceAccessPolicy().CanAccess("match","a","a"));
        Assert.False(new ResourceAccessPolicy().CanAccess("account","b","a"));
    }
    [Fact, Trait("Case","PF-UT-054")]
    public void BuildPrivateKey_TraversalOrInvalidPurpose_RejectsUntrustedPath()
    {
        var id=EntityId.New(); Assert.Equal($"private/{id}/foundation-test/{id}",ResourceAccessPolicy.PrivateKey(id,"foundation-test",id));
        foreach(var purpose in new[]{"../", "%2f", "photos", "_system"}) Assert.Throws<DomainException>(()=>ResourceAccessPolicy.PrivateKey(id,purpose,id));
    }
}
