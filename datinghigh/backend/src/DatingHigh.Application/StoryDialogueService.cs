using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Domain;
using DatingHigh.Application.RateLimiting;

namespace DatingHigh.Application;

/// <summary>只通知已提交的變更；平台 adapter 不持有遊戲業務或私人訊息。</summary>
public interface IRoundRealtimeNotifier
{
    Task NotifyAsync(string roundId,bool ended,CancellationToken ct=default);
}

/// <summary>同一套用例供 HTTP 與標準 WS 使用；D1 是最終授權與線性化邊界。</summary>
public sealed class StoryDialogueService(IPlatformClient platform,IRoundRealtimeNotifier notifier,IRateLimiter limiter)
{
    private static readonly JsonSerializerOptions Json=new(JsonSerializerDefaults.Web);
    public static void Id(string value){if(!EntityId.IsValid(value))throw new DomainException("INVALID_STORY_REQUEST");}
    private static JsonObject Auth(CurrentUser u,string roundId)=>JsonSerializer.SerializeToNode(new{accountId=u.AccountId,sessionId=u.SessionId,cv=u.CredentialVersion,accessExpiresAt=u.AccessExpiresAt,roundId},Json)!.AsObject();
    private async Task<JsonArray> Rows(string command,JsonObject payload,CancellationToken ct)=>(await platform.ExecuteAsync(command,payload,ct))["rows"]?.AsArray()??throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
    private async Task Notify(string roundId,bool ended,CancellationToken ct){try{await notifier.NotifyAsync(roundId,ended,ct);}catch(Exception e)when(e is not OperationCanceledException){/* 提交已成功，客戶端以原 requestId／cursor 恢復。 */}}
    public async Task<JsonObject> StatusAsync(CurrentUser u,string roundId,CancellationToken ct=default)
    {
        Id(roundId);var rows=await Rows("story.round.status",Auth(u,roundId),ct);
        if(rows.Count==0){var valid=await platform.ExecuteAsync("session.validate",MatchingSessionService.Auth(u),ct);throw valid["rows"]!.AsArray().Count==0?new DomainException("SESSION_REVOKED",401):new DomainException("RESOURCE_FORBIDDEN",403);}
        return new(){["roundId"]=roundId,["status"]=rows[0]!["status"]!.DeepClone()};
    }
    private async Task AvatarReady(CurrentUser u,CancellationToken ct){var result=await platform.ExecuteAsync("avatar.current.readiness",MatchingSessionService.Auth(u),ct);if(result["ready"]?.GetValue<bool>()!=true)throw new DomainException("OWN_AVATAR_PACK_NOT_READY",409);}
    private async Task Active(CurrentUser u,string roundId,CancellationToken ct){if((await StatusAsync(u,roundId,ct)).Text("status")!="active")throw new DomainException("ROUND_NOT_ACTIVE",409);await AvatarReady(u,ct);}
    private async Task<JsonArray> Snapshot(CurrentUser u,string roundId,CancellationToken ct){await Active(u,roundId,ct);return await Rows("story.snapshot",Auth(u,roundId),ct);}
    private static JsonNode? Record(JsonArray rows,string type)=>rows.FirstOrDefault(r=>r?.Maybe("record_type")==type);
    public async Task<JsonObject> ExperienceAsync(CurrentUser u,string roundId,CancellationToken ct=default)
    {
        var status=await StatusAsync(u,roundId,ct);if(status.Text("status")=="ended")return new(){["roundId"]=roundId,["phase"]="ended"};
        await AvatarReady(u,ct);var rows=await Rows("story.snapshot",Auth(u,roundId),ct);
        var result=await new SceneEventFrameworkService(platform,notifier,limiter).ExperienceAsync(u,roundId,rows,ct);await Active(u,roundId,ct);return result;
    }
    public async Task<JsonObject> EventsAsync(CurrentUser u,string roundId,long? afterSeq,long? beforeSeq,int limit,CancellationToken ct=default)
    {
        Id(roundId);if((afterSeq is null)==(beforeSeq is null)||afterSeq<0||beforeSeq<1||limit is <1 or >100)throw new DomainException("INVALID_STORY_REQUEST");await Active(u,roundId,ct);
        var p=Auth(u,roundId);p["afterSeq"]=afterSeq;p["beforeSeq"]=beforeSeq;p["limit"]=limit;var rows=await Rows("story.events.query",p,ct);
        var events=new JsonArray(rows.OrderBy(r=>r!.Number("sequence")).Select(r=>(JsonNode)new JsonObject{["eventSeq"]=r!["sequence"]!.DeepClone(),["type"]=r["kind"]!.DeepClone(),["actorAccountId"]=r["actor_account_id"]?.DeepClone(),["clientRequestId"]=r["client_request_id"]?.DeepClone(),["createdAt"]=r["created_at"]!.DeepClone(),["payload"]=JsonNode.Parse(r.Text("payload_json"))}).ToArray());
        return new(){["events"]=events,["cursor"]=rows.Count==0?afterSeq??beforeSeq:afterSeq is not null?rows.Max(r=>r!.Number("sequence")):rows.Min(r=>r!.Number("sequence")),["hasMore"]=rows.Count==limit};
    }
    public async Task<JsonObject> TicketAsync(CurrentUser u,string roundId,string deviceId,string clientPlatform,CancellationToken ct=default)
    {
        Id(deviceId);await Active(u,roundId,ct);await limiter.ConsumeAsync("story_ticket.v1","account",u.AccountId,ct);var p=Auth(u,roundId);p["deviceId"]=deviceId;p["clientPlatform"]=clientPlatform;
        return (await platform.ExecuteAsync("round.realtime.ticket",p,ct)).AsObject();
    }
    public async Task<JsonObject> EndAsync(CurrentUser u,string roundId,CancellationToken ct=default)
    {
        await StatusAsync(u,roundId,ct);await Rows("game.round.end",Auth(u,roundId),ct);var status=await StatusAsync(u,roundId,ct);
        if(status.Text("status")!="ended")throw new DomainException("EVENT_STATE_CONFLICT",409);await Notify(roundId,true,ct);return status;
    }
    public static void Only(JsonObject value,params string[] keys){if(value.Any(p=>!keys.Contains(p.Key,StringComparer.Ordinal)))throw new DomainException("INVALID_STORY_REQUEST");}
    public async Task<JsonObject> CommandAsync(CurrentUser u,string roundId,string type,string requestId,JsonObject input,CancellationToken ct=default)
    {
        Id(roundId);Id(requestId);await Active(u,roundId,ct);
        var rows=await Rows("story.snapshot",Auth(u,roundId),ct);
        return await new SceneEventFrameworkService(platform,notifier,limiter).CommandAsync(u,roundId,type,requestId,input,rows,ct);
    }
}
