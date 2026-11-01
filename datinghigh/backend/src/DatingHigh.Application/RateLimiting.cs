namespace DatingHigh.Application.RateLimiting;
/// <summary>受信任用例選擇政策及已確認的對象。</summary>
public sealed record RateLimitDescriptor(string PolicyKey,string SubjectType,string CanonicalSubject);
/// <summary>固定視窗額度結果；故障不回 Allowed。</summary>
public sealed record RateLimitDecision(bool Allowed,int RetryAfterSeconds);
/// <summary>共用固定視窗限流契約。</summary>
public interface IRateLimiter
{
    Task<RateLimitDecision> TryConsumeAsync(IEnumerable<RateLimitDescriptor> descriptors,CancellationToken cancellationToken=default);
}
public static class RateLimitExtensions
{
    public static async Task ConsumeAsync(this IRateLimiter limiter,string policy,string type,string subject,CancellationToken cancellationToken=default)
    {
        var decision=await limiter.TryConsumeAsync([new(policy,type,subject)],cancellationToken);
        if(!decision.Allowed)throw new DatingHigh.Domain.DomainException("RATE_LIMITED",429,decision.RetryAfterSeconds);
    }
}
