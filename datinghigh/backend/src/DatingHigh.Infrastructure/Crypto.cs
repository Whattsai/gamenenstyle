using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using DatingHigh.Domain;
namespace DatingHigh.Infrastructure;

/// <summary>驗證碼及固定視窗限流的雜湊協定。</summary>
public sealed class ChallengeCrypto(byte[] key)
{
    public static string RandomToken()=>Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).TrimEnd('=').Replace('+','-').Replace('/','_');
    public static string Code()=>RandomNumberGenerator.GetInt32(1000000).ToString("D6",CultureInfo.InvariantCulture);
    public static string Sha(string text)=>Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(text)));
    private string Mac(string value)=>Convert.ToHexStringLower(HMACSHA256.HashData(key,Encoding.UTF8.GetBytes(value)));
    public string CodeMac(string id,string purpose,string email,int generation,string code)=>Mac($"{id}|{purpose}|{email}|{generation.ToString(CultureInfo.InvariantCulture)}|{code}");
    public string SubjectHash(string environment,string type,string subject)=>Mac($"v1|{environment}|{type}|{subject}");
    public static bool EqualsHash(string? a,string? b)=>a is not null && b is not null && CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(a),Encoding.ASCII.GetBytes(b));
}
