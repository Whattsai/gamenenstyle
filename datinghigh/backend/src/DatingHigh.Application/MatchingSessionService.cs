using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Domain;
using DatingHigh.Application.RateLimiting;

namespace DatingHigh.Application;

/// <summary>未配對查詢專用受限 reader，不接受假 RoundId 或私人資料要求。</summary>
public interface IMatchingCandidateProfileReader
{
    Task<JsonArray> SearchAsync(CurrentUser user, CancellationToken ct = default);
    Task<JsonNode?> PersonaAsync(CurrentUser user, string candidateId, CancellationToken ct = default);
}

/// <summary>配對、雙方確認及持久輪次；所有寫入由固定 D1 原子命令執行。</summary>
public sealed class MatchingSessionService(IPlatformClient platform, IMatchingCandidateProfileReader reader,
    IRateLimiter limiter, TimeProvider clock)
{
    public static object Auth(CurrentUser u) => new { accountId=u.AccountId, sessionId=u.SessionId, cv=u.CredentialVersion, accessExpiresAt=u.AccessExpiresAt };
    private static void Id(string value) { if(!EntityId.IsValid(value)) throw new DomainException("INVALID_REQUEST"); }
    private async Task<JsonArray> Execute(string command, object payload, CancellationToken ct) =>
        (await platform.ExecuteAsync(command,payload,ct))["rows"]?.AsArray() ?? throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
    private async Task EnsureSession(CurrentUser u, CancellationToken ct)
    {
        if((await Execute("session.validate",Auth(u),ct)).Count==0)throw new DomainException("SESSION_REVOKED",401);
    }
    private async Task Ready(CurrentUser u, CancellationToken ct)
    {
        await EnsureSession(u,ct);
        if((await RoundsAsync(u,ct)).Count>0)throw new DomainException("GAME_IN_PROGRESS",409);
        throw new DomainException("PROFILE_NOT_READY",409);
    }
    private static string[] Strings(JsonNode? n) => n?.AsArray().Select(x=>x!.GetValue<string>()).ToArray() ?? [];
    private static MatchingInput Input(JsonNode row)
    {
        var interests=JsonNode.Parse(row.Text("interests_json"))!;
        var prefs=JsonNode.Parse(row.Text("preferences_json"))!;
        return new(row.Text("birth_date"),row.Text("gender"),Strings(JsonNode.Parse(row.Text("romantic_orientation_json"))),
            row.Maybe("region_code"),Strings(interests["interestTagIds"]),Strings(interests["topicTagIds"]),Strings(interests["valueTagIds"]),
            new[]{"weekendPreference","sleepSchedule","conversationStyle","expectedInteractionFrequency","relationshipMode"}.Select(p=>prefs[p]?.GetValue<string>()).ToArray(),
            prefs["preferredAgeMin"]?.GetValue<int>(),prefs["preferredAgeMax"]?.GetValue<int>(),Strings(prefs["preferredRegionCodes"]),prefs["sharedInterestWeight"]?.GetValue<int>()??50);
    }
    private static JsonObject Summary(JsonNode row,int score) => new() {
        ["candidateId"]=row["profile_id"]?.DeepClone(),["score"]=score,
        ["invitationState"]=row["invitation_state"]?.DeepClone(),["invitationId"]=row["invitation_id"]?.DeepClone()
    };

    /// <summary>完整合格集合評分後才分頁，不輸出配對私有輸入或分量。</summary>
    public async Task<JsonObject> SearchAsync(CurrentUser user,int offset,int limit,CancellationToken ct=default)
    {
        if(offset is <0 or >5000 || limit is <1 or >20)throw new DomainException("INVALID_REQUEST");
        await limiter.ConsumeAsync("matching_search.v1","account",user.AccountId,ct);
        var rows=await reader.SearchAsync(user,ct);
        var own=rows.FirstOrDefault(r=>r?["own_profile_id"] is not null);
        if(own is null) { await Ready(user,ct); throw new DomainException("PROFILE_NOT_READY",409); }
        var today=DatingProfileRules.TaiwanToday(clock);var input=Input(own);
        var ranked=rows.Where(r=>r is not null&&r["own_profile_id"] is null)
            .Select(r=>Summary(r!,MatchingScore.Calculate(input,Input(r!),today)))
            .OrderByDescending(r=>r["score"]!.GetValue<int>()).ThenBy(r=>r["candidateId"]!.GetValue<string>(),StringComparer.Ordinal).ToArray();
        return new(){["items"]=new JsonArray(ranked.Skip(offset).Take(limit).Select(r=>(JsonNode)r).ToArray()),
            ["nextOffset"]=offset+limit<ranked.Length?JsonValue.Create(offset+limit):null};
    }
    public static JsonObject Persona(JsonNode row) => new() {
        ["nickname"]=row["nickname"]?.DeepClone(),["bio"]=row["bio"]?.DeepClone(),
        ["traitTagIds"]=JsonNode.Parse(row.Maybe("traits_json")??"[]"),
        ["interestTagIds"]=JsonNode.Parse(row.Maybe("interests_json")??"{}")?["interestTagIds"]?.DeepClone()??new JsonArray(),
        ["selectedAvatarType"]=row["selected_avatar_type"]?.DeepClone(),["selectedAvatarRef"]=row["selected_avatar_ref"]?.DeepClone(),
        ["avatarDataUrl"]=row["avatar_data_url"]?.DeepClone()
    };
    public async Task<JsonObject> CandidateAsync(CurrentUser user,string candidateId,CancellationToken ct=default)
    {
        Id(candidateId);
        // 不消耗搜尋額度的受限內部查詢取得當次分數；單筆 reader 再次核對授權。
        var rows=await reader.SearchAsync(user,ct);var own=rows.FirstOrDefault(r=>r?["own_profile_id"] is not null);
        var candidate=rows.FirstOrDefault(r=>r?["profile_id"]?.GetValue<string>()==candidateId&&r?["own_profile_id"] is null);
        if(own is null||candidate is null){await EnsureSession(user,ct);throw new DomainException("RESOURCE_FORBIDDEN",403);}
        var persona=await reader.PersonaAsync(user,candidateId,ct);
        if(persona is null){await EnsureSession(user,ct);throw new DomainException("RESOURCE_FORBIDDEN",403);}
        var result=Summary(candidate,MatchingScore.Calculate(Input(own),Input(candidate),DatingProfileRules.TaiwanToday(clock)));
        result["persona"]=Persona(persona);return result;
    }
    private static JsonObject Invitation(JsonNode row,CurrentUser user) => new() {
        ["invitationId"]=row["invitation_id"]?.DeepClone(),["status"]=row["status"]?.DeepClone(),
        ["direction"]=row.Maybe("initiator_account_id")==user.AccountId?"outgoing":"incoming",
        ["candidateId"]=row["candidate_id"]?.DeepClone(),["invalidatedReason"]=row["invalidated_reason"]?.DeepClone(),
        ["expiresAt"]=row["expires_at"]?.DeepClone(),["roundId"]=row["round_id"]?.DeepClone()
    };
    private async Task<JsonObject> Outcome(JsonNode? row,CurrentUser u,CancellationToken ct)
    {
        if(row is null){await EnsureSession(u,ct);throw new DomainException("MATCH_STATE_CONFLICT",409);}
        if(row.Maybe("status")=="expired")throw new DomainException("INVITATION_EXPIRED",410);
        if(row.Maybe("status")=="invalidated")throw new DomainException("MATCH_STATE_CONFLICT",409);
        return Invitation(row,u);
    }
    public async Task<JsonObject> InviteAsync(CurrentUser u,string candidateId,string requestId,CancellationToken ct=default)
    {
        Id(candidateId);Id(requestId);
        await limiter.ConsumeAsync("matching_invite.v1","account",u.AccountId,ct);
        var rows=await Execute("match.invite.create",new {accountId=u.AccountId,sessionId=u.SessionId,cv=u.CredentialVersion,accessExpiresAt=u.AccessExpiresAt,
            candidateId,clientRequestId=requestId,invitationId=EntityId.New()},ct);
        var row=rows.LastOrDefault();
        if(row?.Maybe("status")=="pending" && row.Maybe("initiator_account_id")!=u.AccountId)
            return await ResolveAsync(u,row.Text("invitation_id"),"accept",ct);
        return await Outcome(row,u,ct);
    }
    public async Task<JsonObject> InvitationsAsync(CurrentUser u,CancellationToken ct=default)
    {
        var rows=await Execute("match.invite.list",Auth(u),ct);await EnsureSession(u,ct);
        var incoming=new JsonArray();var outgoing=new JsonArray();
        foreach(var row in rows.Where(r=>r is not null)){
            var item=Invitation(row!,u);item["persona"]=Persona(row!);
            (item["direction"]!.GetValue<string>()=="incoming"?incoming:outgoing).Add(item);
        }
        return new(){["incoming"]=incoming,["outgoing"]=outgoing};
    }
    public async Task<JsonObject> ResolveAsync(CurrentUser u,string invitationId,string action,CancellationToken ct=default)
    {
        Id(invitationId);
        var rows=await Execute("match.invite.resolve",new {accountId=u.AccountId,sessionId=u.SessionId,cv=u.CredentialVersion,accessExpiresAt=u.AccessExpiresAt,
            invitationId,action,roundId=EntityId.New(),participantLowId=EntityId.New(),participantHighId=EntityId.New()},ct);
        if(rows.Count==0){await EnsureSession(u,ct);throw new DomainException("RESOURCE_FORBIDDEN",403);}
        var result=await Outcome(rows.LastOrDefault(),u,ct);
        var expected=action switch {"accept"=>"accepted","decline"=>"declined","cancel"=>"cancelled",_=>throw new DomainException("INVALID_REQUEST")};
        if(result["status"]?.GetValue<string>()!=expected)throw new DomainException("MATCH_STATE_CONFLICT",409);
        return result;
    }
    private static JsonObject Round(JsonNode row)=>new(){["roundId"]=row["round_id"]?.DeepClone(),["status"]=row["status"]?.DeepClone(),
        ["startedAt"]=row["started_at"]?.DeepClone(),["candidateId"]=row["candidate_id"]?.DeepClone(),["persona"]=Persona(row)};
    public async Task<JsonArray> RoundsAsync(CurrentUser u,CancellationToken ct=default)
    {
        var rows=await Execute("game.round.list",Auth(u),ct);
        if(rows.Count==0)await EnsureSession(u,ct);
        return new(rows.Where(r=>r is not null).Select(r=>(JsonNode)Round(r!)).ToArray());
    }
    public async Task<JsonObject> RoundAsync(CurrentUser u,string roundId,CancellationToken ct=default)
    {
        Id(roundId);
        var rows=await Execute("game.round.get",new {accountId=u.AccountId,sessionId=u.SessionId,cv=u.CredentialVersion,accessExpiresAt=u.AccessExpiresAt,roundId},ct);
        if(rows.LastOrDefault() is not JsonNode row){await EnsureSession(u,ct);throw new DomainException("RESOURCE_FORBIDDEN",403);}return Round(row);
    }
}
