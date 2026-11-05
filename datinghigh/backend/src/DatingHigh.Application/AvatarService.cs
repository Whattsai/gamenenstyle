using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application.Media;
using DatingHigh.Application.RateLimiting;
using DatingHigh.Domain;

namespace DatingHigh.Application;

/// <summary>完整 JSON 與 generation／selection 白名單；不接受 owner、key 或任意 prompt。</summary>
public static class AvatarInput
{
    public static JsonObject Parse(ReadOnlyMemory<byte> bytes,bool selection)
    {
        try{
            using var json=JsonDocument.Parse(bytes,new JsonDocumentOptions{MaxDepth=3});
            if(json.RootElement.ValueKind!=JsonValueKind.Object)throw new DomainException("INVALID_AVATAR_SELECTION");
            var values=new JsonObject();
            var allowed=selection?new[]{"type","builtinAvatarId","assetId","attemptId","index","expectedRevision"}:new[]{"styleId","attemptId","clientRequestId","expectedProducedCount"};
            foreach(var item in json.RootElement.EnumerateObject()){
                if(!allowed.Contains(item.Name,StringComparer.Ordinal)||values.ContainsKey(item.Name))throw new DomainException("INVALID_AVATAR_SELECTION");
                values[item.Name]=JsonNode.Parse(item.Value.GetRawText());
            }
            if(selection){
                if(values.Number("expectedRevision") is <1 or >int.MaxValue)throw new DomainException("INVALID_AVATAR_SELECTION");
                if(values.Text("type")=="builtin"){
                    if(values.Count!=3||!BuiltinAvatarCatalog.Contains(values.Text("builtinAvatarId")))throw new DomainException("INVALID_AVATAR_SELECTION");
                }else if(values.Text("type")=="generated"){
                    if(values.ContainsKey("assetId")){
                        if(values.Count!=3||!EntityId.IsValid(values.Text("assetId")))throw new DomainException("INVALID_AVATAR_SELECTION");
                    }else if(values.Count!=4||!EntityId.IsValid(values.Text("attemptId"))||values.Number("index") is <1 or >4)
                        throw new DomainException("INVALID_AVATAR_SELECTION");
                }else throw new DomainException("INVALID_AVATAR_SELECTION");
            }else{
                if(values.Count is <3 or >4||!EntityId.IsValid(values.Text("clientRequestId"))||
                   values.Text("styleId") is not("warm" or "moon" or "sakura" or "forest")||
                   values.Number("expectedProducedCount") is <0 or >3||
                   values.Maybe("attemptId") is string attempt&&!EntityId.IsValid(attempt))throw new DomainException("INVALID_AVATAR_SELECTION");
            }
            return values;
        }catch(Exception error)when(error is JsonException or InvalidOperationException or KeyNotFoundException or FormatException or DomainException){throw new DomainException("INVALID_AVATAR_SELECTION");}
    }
}

/// <summary>圖片另走 binary 通道，不把大型圖片塞進 16 KiB prepared command。</summary>
public interface IAvatarCandidateStore
{
    Task<JsonNode> PublishAsync(CurrentUser user,string attemptId,string requestId,string lease,CompressedImage image,CancellationToken ct=default);
    Task<PrivateMediaContent> ReadAsync(CurrentUser user,string attemptId,int index,CancellationToken ct=default);
}

/// <summary>只有本人明確操作才呼叫一張 provider；lease 與來源驗證全由真 R2／D1 守護。</summary>
public sealed class AvatarService(IPlatformClient platform,IPrivateMediaStore photos,IAvatarCandidateStore candidates,IAvatarImageGenerator generator,IRateLimiter limiter)
{
    private static Dictionary<string,object?> Auth(CurrentUser user)=>new(){["accountId"]=user.AccountId,["sessionId"]=user.SessionId,["cv"]=user.CredentialVersion,["accessExpiresAt"]=user.AccessExpiresAt};
    public async Task<JsonObject> GenerateAsync(CurrentUser user,JsonObject input,CancellationToken ct=default)
    {
        // 跨容器額度保護成本；未知結果不在此重送。
        var payload=Auth(user);payload["proposedAttemptId"]=EntityId.New();payload["attemptId"]=input.Maybe("attemptId");
        payload["styleId"]=input.Text("styleId");payload["clientRequestId"]=input.Text("clientRequestId");payload["expectedProducedCount"]=input.Number("expectedProducedCount");
        var lease=await platform.ExecuteAsync("avatar.attempt.begin",payload,ct);
        if(lease["completed"]?.GetValue<bool>()==true)return Public(lease);
        var attempt=lease.Text("attemptId");var request=input.Text("clientRequestId");var etag=lease.Text("lease");
        var providerCompleted=false;
        try{
            // 冪等重讀／已滿四張在取得 lease 前即返回，不耗用新的供應商額度。
            await limiter.ConsumeAsync("avatar_generate.v1","account",user.AccountId,ct);
            var sources=new List<PrivateMediaContent>();
            foreach(var source in lease["sourceAssetIds"]!.AsArray())sources.Add(await photos.ReadPhotoAsync(user,source!.GetValue<string>(),ct));
            var image=await generator.GenerateAsync(sources,input.Text("styleId"),ct);
            providerCompleted=true;
            return Public(await candidates.PublishAsync(user,attempt,request,etag,image,ct));
        }catch(Exception error){
            // 發送後取消／網路錯誤均可能已計費；保留既有候選且不能自動重開 lease。
            var unknown=providerCompleted||error is OperationCanceledException or HttpRequestException||error is DomainException {Code:"IMAGE_PROVIDER_UNCERTAIN"};
            using var cleanup=new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var failed=Auth(user);failed["attemptId"]=attempt;failed["clientRequestId"]=request;failed["lease"]=etag;failed["uncertain"]=unknown;
            try{await platform.ExecuteAsync("avatar.attempt.fail",failed,cleanup.Token);}catch(Exception failure)when(failure is DomainException or OperationCanceledException or HttpRequestException){/* 仍由短效 lease 拒絕重複付費。 */}
            throw;
        }
    }
    private static JsonObject Public(JsonNode result)=>new(){
        ["attemptId"]=result.Text("attemptId"),["index"]=result.Number("index"),["producedCount"]=result.Number("producedCount"),
        ["maxCandidates"]=4,["expiresAt"]=result.Number("expiresAt")
    };
    public async Task<JsonNode> SelectAsync(CurrentUser user,JsonObject input,CancellationToken ct=default)
    {
        var payload=Auth(user);payload["expectedRevision"]=input.Number("expectedRevision");
        var command="profile.avatar.builtin";
        if(input.Text("type")=="builtin"){
            var own=(await platform.ExecuteAsync("profile.read",Auth(user),ct))["rows"]?.AsArray().FirstOrDefault();
            if(own is null){
                if((await platform.ExecuteAsync("session.validate",Auth(user),ct))["rows"]?.AsArray().Count!=1)throw new DomainException("SESSION_REVOKED",401);
                throw new DomainException("INVALID_AVATAR_SELECTION");
            }
            if(own.Number("revision")!=input.Number("expectedRevision"))throw new DomainException("PROFILE_VERSION_CONFLICT",409);
            if(!BuiltinAvatarCatalog.Allowed(input.Text("builtinAvatarId"),own.Maybe("gender")))throw new DomainException("INVALID_AVATAR_SELECTION");
            payload["avatarId"]=input.Text("builtinAvatarId");
        }
        else if(input.ContainsKey("assetId")){command="profile.avatar.generated";payload["assetId"]=input.Text("assetId");}
        else{command="avatar.attempt.select";payload["attemptId"]=input.Text("attemptId");payload["index"]=input.Number("index");payload["proposedAssetId"]=EntityId.New();return await platform.ExecuteAsync(command,payload,ct);}
        var result=await platform.ExecuteAsync(command,payload,ct);
        var row=result["rows"]?.AsArray().FirstOrDefault();
        if(row is null){
            if((await platform.ExecuteAsync("session.validate",Auth(user),ct))["rows"]?.AsArray().Count!=1)throw new DomainException("SESSION_REVOKED",401);
            if(input.ContainsKey("assetId")){
                // 條件寫入已拒絕；只用本人清單區分不可選資產與版本衝突，不回傳他人資料。
                var saved=await platform.ExecuteAsync("profile.avatar.list",Auth(user),ct);
                if(saved["rows"]?.AsArray().Any(asset=>asset?.Text("asset_id")==input.Text("assetId"))!=true)
                    throw new DomainException("INVALID_AVATAR_SELECTION");
            }
            throw new DomainException("PROFILE_VERSION_CONFLICT",409);
        }
        return new JsonObject{["revision"]=row.Number("revision")};
    }
    public Task<PrivateMediaContent> ReadCandidateAsync(CurrentUser user,string attempt,int index,CancellationToken ct=default)
    {
        if(!EntityId.IsValid(attempt)||index is <1 or >4)throw new DomainException("INVALID_AVATAR_SELECTION");
        return candidates.ReadAsync(user,attempt,index,ct);
    }
}
