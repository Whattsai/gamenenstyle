using System.Security.Cryptography;
using System.Text;
using DatingHigh.Application;
using DatingHigh.Domain;
namespace DatingHigh.Infrastructure;
/// <summary>設定、D1 migration 與 R2 讀回內容必須共同就緒。</summary>
public sealed class Readiness(IPlatformClient platform,AuthOptions options)
{
    public static bool OptionsValid(AuthOptions o)
    {
        if(o.AccessKey.Length<32||o.EmailKey.Length<32||o.RateKey.Length<32||o.Issuer.Length==0||o.Audience.Length==0||!Uri.TryCreate(o.WebOrigin,UriKind.Absolute,out var origin)||origin.GetLeftPart(UriPartial.Authority)!=o.WebOrigin)return false;
        return o.Environment=="local"?origin.IsLoopback&&origin.Scheme is "http" or "https"&&o.EmailDeliveryMode=="Log":o.Environment is "staging" or "production"&&origin.Scheme=="https"&&o.EmailDeliveryMode=="Cloudflare";
    }
    public async Task CheckAsync(CancellationToken cancellationToken=default)
    {
        if(!OptionsValid(options))throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        var result=await platform.ExecuteAsync("platform.ready",new{},cancellationToken);
        var expected=SHA256.HashData(Encoding.UTF8.GetBytes("datinghigh-foundation-v1"));
        if(result["status"]?.GetValue<string>()!="ready"||result["probe"] is null||!CryptographicOperations.FixedTimeEquals(expected,SHA256.HashData(Encoding.UTF8.GetBytes(result["probe"]!.GetValue<string>()))))throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
    }
}
