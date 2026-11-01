using DatingHigh.Domain;
namespace DatingHigh.Unit.Tests.Domain;
public class EmailAddressTests
{
    [Fact, Trait("Case", "PF-UT-004")]
    public void NormalizeEmail_AsciiAddressWithOuterWhitespace_ReturnsInvariantLowercase()
    {
        Assert.Equal("a.b+tag@gmail.com", EmailAddress.Normalize(" A.B+TAG@Gmail.com "));
    }
    [Fact, Trait("Case", "PF-UT-005")]
    public void ValidateEmail_LengthBoundaries_AcceptsOnlySupportedAsciiAddrSpec()
    {
        Assert.Equal(new string('a',64)+"@example.com",EmailAddress.Normalize(new string('a',64)+"@example.com"));
        foreach(var bad in new[]{new string('a',65)+"@example.com","測試@example.com","K@example.com","a@K.com","Name <a@b.com>","a(comment)@b.com","a..b@c.com","a@b","a b@c.com","a|b@c.com"})
            Assert.Throws<DomainException>(()=>EmailAddress.Normalize(bad));
    }
    [Fact, Trait("Case", "PF-UT-006")]
    public void CreateEmailKey_EquivalentAddresses_UsesOneUniquenessKey()
    {
        Assert.Equal(EmailAddress.Normalize(" A@B.COM "),EmailAddress.Normalize("a@b.com"));
        Assert.NotEqual(EmailAddress.Normalize("a.b@gmail.com"),EmailAddress.Normalize("ab@gmail.com"));
        Assert.NotEqual(EmailAddress.Normalize("a+tag@gmail.com"),EmailAddress.Normalize("a@gmail.com"));
    }
}
