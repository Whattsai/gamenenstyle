using System.Security.Claims;
namespace DatingHigh.Application;
public interface IPasswordHashService
{
    string Hash(string password);
    bool Verify(string password,string? hash);
    bool NeedsRehash(string hash);
}
public interface IAccessTokenIssuer
{
    string Issue(string accountId,string sessionId,long cv,DateTimeOffset expiresAt);
    ClaimsPrincipal Validate(string token);
}
public interface IAuthCryptography
{
    string RandomToken();
    string Code();
    string Sha(string value);
    string CodeMac(string id,string purpose,string email,int generation,string code);
    bool EqualsHash(string? left,string? right);
}
