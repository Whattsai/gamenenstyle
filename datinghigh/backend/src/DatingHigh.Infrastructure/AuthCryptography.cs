using DatingHigh.Application;
namespace DatingHigh.Infrastructure;
public sealed class AuthCryptography(AuthOptions options):IAuthCryptography
{
    public string RandomToken()=>ChallengeCrypto.RandomToken();
    public string Code()=>ChallengeCrypto.Code();
    public string Sha(string value)=>ChallengeCrypto.Sha(value);
    public string CodeMac(string id,string purpose,string email,int generation,string code)=>new ChallengeCrypto(options.EmailKey).CodeMac(id,purpose,email,generation,code);
    public bool EqualsHash(string? left,string? right)=>ChallengeCrypto.EqualsHash(left,right);
}
