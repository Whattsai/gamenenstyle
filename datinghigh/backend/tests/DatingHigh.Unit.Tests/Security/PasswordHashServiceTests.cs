using DatingHigh.Domain;
using DatingHigh.Infrastructure;
namespace DatingHigh.Unit.Tests.Security;
public class PasswordHashServiceTests
{
    [Fact, Trait("Case", "PF-UT-007")]
    public void ValidatePassword_ScalarAndUtf8Boundaries_EnforcesUnmodifiedSecret()
    {
        PasswordPolicy.Validate(new string('a',12)); PasswordPolicy.Validate(string.Concat(Enumerable.Repeat("😀",128)));
        foreach(var bad in new[]{new string('a',11),new string('a',129),"abcdefghijkl\0", "abcdefghijkl\n", "abcdefghijkl\uD800"})
            Assert.Throws<DomainException>(()=>PasswordPolicy.Validate(bad));
    }
    [Fact, Trait("Case", "PF-UT-008")]
    public void HashAndVerifyPassword_ValidAndUnknownAccount_UsesBclAndConstantTimePolicy()
    {
        var h = new PasswordHashService(); var secret=" A valid password "; var hash=h.Hash(secret);
        Assert.StartsWith("pbkdf2-sha256$v1$600000$",hash);
        Assert.True(h.Verify(secret,hash)); Assert.False(h.Verify(secret.Trim(),hash));
        Assert.False(h.Verify(secret,null)); Assert.NotEqual(hash,h.Hash(secret));
    }
    [Fact, Trait("Case", "PF-UT-009")]
    public void ParseAndRehashPassword_UnsupportedOrStaleParameters_RejectsOrUsesConditionalUpgrade()
    {
        var h = new PasswordHashService(); var hash=h.Hash("a long password");
        foreach(var bad in new[]{"garbage",hash.Replace("v1","v2"),hash.Replace("600000","999999999"),hash+"$extra"})
            Assert.False(h.Verify("a long password",bad));
        Assert.False(h.NeedsRehash(hash));
    }
}
