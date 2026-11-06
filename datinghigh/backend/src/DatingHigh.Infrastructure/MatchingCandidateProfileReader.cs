using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;

namespace DatingHigh.Infrastructure;

/// <summary>固定受限查詢，不提供 SQL、名片、原照或虛構輪次入口。</summary>
public sealed class MatchingCandidateProfileReader(IPlatformClient platform):IMatchingCandidateProfileReader
{
    public async Task<JsonArray> SearchAsync(CurrentUser user,CancellationToken ct=default) =>
        (await platform.ExecuteAsync("match.candidate.search",MatchingSessionService.Auth(user),ct))["rows"]!.AsArray();
    public async Task<JsonNode?> PersonaAsync(CurrentUser u,string candidateId,CancellationToken ct=default) =>
        (await platform.ExecuteAsync("match.candidate.persona.read",new {accountId=u.AccountId,sessionId=u.SessionId,cv=u.CredentialVersion,accessExpiresAt=u.AccessExpiresAt,candidateId},ct))["rows"]?.AsArray().LastOrDefault();
}
