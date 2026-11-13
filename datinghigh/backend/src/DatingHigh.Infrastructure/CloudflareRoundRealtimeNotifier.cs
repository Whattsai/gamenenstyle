using DatingHigh.Application;

namespace DatingHigh.Infrastructure;

/// <summary>Cloudflare 唯一即時通知 adapter；只傳安全的快照提示，不廣播原始私人事件。</summary>
public sealed class CloudflareRoundRealtimeNotifier(IPlatformClient platform):IRoundRealtimeNotifier
{
    public async Task NotifyAsync(string roundId,bool ended,CancellationToken ct=default)=>
        _=await platform.ExecuteAsync("round.realtime.notify",new{roundId,ended},ct);
}
