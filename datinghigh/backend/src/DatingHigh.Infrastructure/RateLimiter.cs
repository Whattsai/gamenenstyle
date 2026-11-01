using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Application.RateLimiting;
namespace DatingHigh.Infrastructure;
/// <summary>九筆認證政策，跨容器共享固定視窗。</summary>
public static class RateLimitPolicies
{
    public static readonly IReadOnlyDictionary<(string Policy,string Type),(long Window,int Limit)> Entries=new Dictionary<(string,string),(long,int)>
    {
        [("email_code_send.v1","email")]=(3600000,5),[("email_code_send.v1","ip")]=(3600000,30),
        [("email_code_verify.v1","email")]=(900000,10),[("password_login.v1","email")]=(900000,10),[("password_login.v1","ip")]=(900000,60),
        [("external_credential.v1","ip")]=(900000,30),[("credential_change.v1","account")]=(900000,10),
        [("session_refresh.v1","session")]=(60000,10),[("session_refresh.v1","ip")]=(60000,120)
    };
}
/// <summary>請求範圍的去重額度保留；超限與故障皆停止副作用。</summary>
public sealed class RateLimiter(IPlatformClient platform,AuthOptions options,TimeProvider clock):IRateLimiter
{
    private readonly Dictionary<string,RateLimitDecision> _consumed=[];
    public async Task ConsumeAsync(string policy,string type,string subject,CancellationToken cancellationToken=default)
    {
        var decision=await TryConsumeAsync([new(policy,type,subject)],cancellationToken);
        if(!decision.Allowed)throw new DomainException("RATE_LIMITED",429,decision.RetryAfterSeconds);
    }
    public async Task<RateLimitDecision> TryConsumeAsync(IEnumerable<RateLimitDescriptor> descriptors,CancellationToken cancellationToken=default)
    {
        var now=clock.GetUtcNow().ToUnixTimeMilliseconds();
        var retry=0;
        // IP 先 commit，拒絕後不再處理 subject；同階段的額度一批提交並取最晚 Retry-After。
        foreach(var group in descriptors.Distinct().GroupBy(d=>d.SubjectType=="ip"?0:1).OrderBy(g=>g.Key))
        {
            var entries=new List<object>();var pending=new List<(string Key,int Limit)>();
            foreach(var d in group)
            {
                if(!RateLimitPolicies.Entries.TryGetValue((d.PolicyKey,d.SubjectType),out var setting))throw new DomainException("INVALID_POLICY");
                var subject=d.SubjectType switch
                {
                    "email"=>EmailAddress.Normalize(d.CanonicalSubject),
                    "ip"=>System.Net.IPAddress.TryParse(d.CanonicalSubject,out var ip)?(ip.IsIPv4MappedToIPv6?ip.MapToIPv4():ip).ToString():throw new DomainException("INVALID_SUBJECT"),
                    "account" or "session"=>EntityId.IsValid(d.CanonicalSubject)?d.CanonicalSubject:throw new DomainException("INVALID_SUBJECT"),
                    _=>throw new DomainException("INVALID_SUBJECT")
                };
                var hash=new ChallengeCrypto(options.RateKey).SubjectHash(options.Environment,d.SubjectType,subject);
                var key=$"{d.PolicyKey}|{d.SubjectType}|{hash}|{now/setting.Window}";
                if(_consumed.TryGetValue(key,out var previous)){retry=Math.Max(retry,previous.RetryAfterSeconds);continue;}
                if(pending.Any(p=>p.Key==key))continue;
                entries.Add(new{bucketId=EntityId.New(),policyKey=d.PolicyKey,subjectType=d.SubjectType,subjectHash=hash});pending.Add((key,setting.Limit));
            }
            if(entries.Count>0)
            {
                var result=await platform.ExecuteAsync("rate-limit.consume",new{entries},cancellationToken);var rows=result["rows"]!.AsArray();
                if(rows.Count!=pending.Count)throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
                for(var i=0;i<rows.Count;i++)
                {
                    var row=rows[i]!;var wait=row.Number("attempt_count")>pending[i].Limit?(int)Math.Max(1,Math.Ceiling((row.Number("expires_at")-now)/1000d)):0;
                    _consumed[pending[i].Key]=new(wait==0,wait);retry=Math.Max(retry,wait);
                }
            }
            if(retry>0)return new(false,retry);
        }
        return new(true,0);
    }
}
