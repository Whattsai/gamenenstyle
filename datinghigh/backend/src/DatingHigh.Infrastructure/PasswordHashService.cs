using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using DatingHigh.Domain;
namespace DatingHigh.Infrastructure;

/// <summary>使用 BCL PBKDF2 與固定時間比對；不使用 Identity。</summary>
public sealed class PasswordHashService:DatingHigh.Application.IPasswordHashService
{
    private const int Cost=600000;
    private static readonly string Dummy=Create("dummy password never used",Cost);
    public string Hash(string password) { PasswordPolicy.Validate(password); return Create(password,Cost); }
    private static string Create(string password,int cost)
    {
        var salt=RandomNumberGenerator.GetBytes(16);
        var derived=Rfc2898DeriveBytes.Pbkdf2(new UTF8Encoding(false,true).GetBytes(password),salt,cost,HashAlgorithmName.SHA256,32);
        return $"pbkdf2-sha256$v1${cost}${Convert.ToBase64String(salt)}${Convert.ToBase64String(derived)}";
    }
    public bool Verify(string password,string? hash)
    {
        try
        {
            var parts=(hash??Dummy).Split('$');
            if(parts.Length!=5 || parts[0]!="pbkdf2-sha256" || parts[1]!="v1" || !int.TryParse(parts[2],NumberStyles.None,CultureInfo.InvariantCulture,out var cost) || cost is <100000 or >600000) return false;
            var salt=Convert.FromBase64String(parts[3]); var key=Convert.FromBase64String(parts[4]);
            if(salt.Length!=16 || key.Length!=32) return false;
            PasswordPolicy.Validate(password);
            var derived=Rfc2898DeriveBytes.Pbkdf2(new UTF8Encoding(false,true).GetBytes(password),salt,cost,HashAlgorithmName.SHA256,32);
            return CryptographicOperations.FixedTimeEquals(key,derived) && hash is not null;
        }
        catch(Exception e) when(e is FormatException or DomainException or EncoderFallbackException) { return false; }
    }
    public bool NeedsRehash(string hash)=>!hash.StartsWith($"pbkdf2-sha256$v1${Cost}$",StringComparison.Ordinal);
}
