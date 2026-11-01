using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
namespace DatingHigh.Domain;

/// <summary>可安全投影至 HTTP 的領域錯誤。</summary>
public sealed class DomainException(string code, int status=400, int? retryAfter=null) : Exception(code)
{
    public string Code { get; }=code;
    public int Status { get; }=status;
    public int? RetryAfter { get; }=retryAfter;
    public object? Recovery { get; init; }
}

/// <summary>全平台共用的 ASCII Email 唯一鍵。</summary>
public static partial class EmailAddress
{
    [GeneratedRegex(@"^[a-z0-9!#$%&'*+/=?^_`{}~\-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?$",RegexOptions.CultureInvariant)]
    private static partial Regex Pattern();
    public static string Normalize(string input)
    {
        var trimmed=input.Trim();
        if(trimmed.Any(c=>c>127))throw new DomainException("INVALID_EMAIL");
        var email=trimmed.ToLowerInvariant();
        if(email.Length>254 || email.Length==0 || email.Any(c=>c>127) || email.IndexOf('@')>64 || !Pattern().IsMatch(email))
            throw new DomainException("INVALID_EMAIL");
        return email;
    }
}

/// <summary>保留原始秘密且拒絕非嚴格 Unicode 的密碼規則。</summary>
public static class PasswordPolicy
{
    public static void Validate(string password)
    {
        try
        {
            if(new UTF8Encoding(false,true).GetByteCount(password)>512) throw new DomainException("INVALID_PASSWORD");
            var runes=password.EnumerateRunes().ToArray();
            if(runes.Length is <12 or >128 || runes.Any(r=>Rune.GetUnicodeCategory(r)==UnicodeCategory.Control))
                throw new DomainException("INVALID_PASSWORD");
        }
        catch(EncoderFallbackException) { throw new DomainException("INVALID_PASSWORD"); }
    }
}

/// <summary>平台識別規則；識別碼不能作為秘密。</summary>
public static class EntityId
{
    public static string New()=>Guid.CreateVersion7().ToString("D");
    public static bool IsValid(string? value)=>Guid.TryParseExact(value,"D",out var id) && id.Version==7 && id.ToString("D")==value;
}

/// <summary>未提供後續資源政策時一律拒絕。</summary>
public sealed class ResourceAccessPolicy
{
    public bool CanAccess(string kind,string owner,string account)=>kind=="account" && owner==account;
    public static string PrivateKey(string account,string purpose,string objectId)
    {
        if(!EntityId.IsValid(account) || purpose!="foundation-test" || !EntityId.IsValid(objectId)) throw new DomainException("RESOURCE_FORBIDDEN",403);
        return $"private/{account}/{purpose}/{objectId}";
    }
}
