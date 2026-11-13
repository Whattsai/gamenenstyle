using System.Text.Json.Nodes;
using DatingHigh.Application.Media;
using DatingHigh.Domain;

namespace DatingHigh.Application;

/// <summary>私人表情讀取的固定用途；同輪對方與本人保存資產分開授權。</summary>
public enum AvatarReadScope {Own,RoundPartner}
/// <summary>只含已授權用途與公開版本，不接受 owner 或 R2 key。</summary>
public interface IAvatarReadStore
{
    Task<PrivateMediaContent> ReadAsync(CurrentUser user,AvatarReadScope scope,string targetId,string version,string expression,CancellationToken ct=default);
}
/// <summary>授權在 Worker／D1 每次重驗；API 僅投影固定公開欄位。</summary>
public sealed class AvatarReadService(IPlatformClient platform,IAvatarReadStore media)
{
    public static void Validate(AvatarReadScope scope,string targetId,string? version=null,string? expression=null)
    {
        if(!Enum.IsDefined(scope)||!EntityId.IsValid(targetId)||version is not null&&!System.Text.RegularExpressions.Regex.IsMatch(version,"^[0-9a-f]{64}$")||expression is not null&&expression is not("neutral" or "smile" or "surprised" or "thoughtful" or "concerned"))throw new DomainException("INVALID_AVATAR_SELECTION");
    }
    private static JsonObject Pick(JsonNode source,params string[] names)=>new(source.AsObject().Where(p=>names.Contains(p.Key,StringComparer.Ordinal)).Select(p=>new KeyValuePair<string,JsonNode?>(p.Key,p.Value?.DeepClone())));
    public async Task<JsonObject> ProjectionAsync(CurrentUser user,AvatarReadScope scope,string targetId,CancellationToken ct=default)
    {
        Validate(scope,targetId);
        var payload=new Dictionary<string,object?>{["accountId"]=user.AccountId,["sessionId"]=user.SessionId,["cv"]=user.CredentialVersion,["accessExpiresAt"]=user.AccessExpiresAt,[scope==AvatarReadScope.RoundPartner?"roundId":"assetId"]=targetId};
        var result=await platform.ExecuteAsync(scope==AvatarReadScope.RoundPartner?"avatar.round.projection":"avatar.expression.projection",payload,ct);
        var safe=Pick(result,"avatarAssetId","avatarVersion","expressionSpecVersion","avatarAssetSpecVersion","framing","pose");
        if(result["stageAnchors"] is JsonObject anchors){var points=new JsonObject();foreach(var point in new[]{"head","feet"})if(anchors[point] is JsonObject value)points[point]=Pick(value,"x","y");safe["stageAnchors"]=points;}
        var expressions=new JsonObject();foreach(var expression in new[]{"neutral","smile","surprised","thoughtful","concerned"})if(result["expressions"]?[expression] is JsonObject image)expressions[expression]=Pick(image,"url","sha256","mimeType","width","height","byteSize");safe["expressions"]=expressions;
        return safe;
    }
    public Task<PrivateMediaContent> ReadAsync(CurrentUser user,AvatarReadScope scope,string targetId,string version,string expression,CancellationToken ct=default)
    {Validate(scope,targetId,version,expression);return media.ReadAsync(user,scope,targetId,version,expression,ct);}
}
