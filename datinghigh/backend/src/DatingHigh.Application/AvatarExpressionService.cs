using System.Text.Json.Nodes;
using DatingHigh.Application.Media;
using DatingHigh.Application.RateLimiting;
using DatingHigh.Domain;

namespace DatingHigh.Application;

/// <summary>每次 HTTP 最多製作一種固定表情；不建立背景作業、不自動重試或重新傳真人照片。</summary>
public sealed class AvatarExpressionService(IPlatformClient platform,IAvatarCandidateStore candidates,IAvatarExpressionStore store,IAvatarExpressionGenerator generator,IRateLimiter limiter,IPrivateMediaStore? savedMedia=null)
{
    private static readonly string[] Expressions=["neutral","smile","surprised","thoughtful","concerned","pose-stand","pose-sit","pose-read","pose-hold"];
    private static Dictionary<string,object?> Auth(CurrentUser user)=>new(){["accountId"]=user.AccountId,["sessionId"]=user.SessionId,["cv"]=user.CredentialVersion,["accessExpiresAt"]=user.AccessExpiresAt};
    private static string Id(JsonObject input,string key){var value=input.Maybe(key);if(!EntityId.IsValid(value))throw new DomainException("INVALID_AVATAR_SELECTION");return value!;}
    /// <summary>本人前景檢視完整姿態成品；不能指定 owner 或任意素材位置。</summary>
    public Task<PrivateMediaContent> PreviewAsync(CurrentUser user,string workflow,string pose,CancellationToken ct=default)
    {
        if(!EntityId.IsValid(workflow)||pose is not("stand" or "sit" or "read" or "hold"))throw new DomainException("INVALID_AVATAR_SELECTION");
        return store.PreviewAsync(user,workflow,pose,ct);
    }
    public async Task<JsonNode> ExecuteAsync(CurrentUser user,string action,JsonObject input,CancellationToken ct=default)
    {
        try{return await ExecuteCoreAsync(user,action,input,ct);}
        catch(Exception e)when(e is InvalidOperationException or KeyNotFoundException or FormatException){throw new DomainException("INVALID_AVATAR_SELECTION");}
    }
    private async Task<JsonNode> ExecuteCoreAsync(CurrentUser user,string action,JsonObject input,CancellationToken ct)
    {
        var payload=Auth(user);
        if(action=="status"){
            if(input.Count!=0)throw new DomainException("INVALID_AVATAR_SELECTION");
            return await platform.ExecuteAsync("avatar.attempt.expression.status",payload,ct);
        }
        if(action=="begin"){
            if(!generator.SupportsStaticPoses)throw new DomainException("IMAGE_PROVIDER_UNAVAILABLE",503);
            var saved=input.ContainsKey("assetId");
            if(input.Count!=(saved?3:4)||input.Any(p=>!(saved?new[]{"assetId","clientRequestId","expectedRevision"}:new[]{"attemptId","index","clientRequestId","expectedRevision"}).Contains(p.Key))||!saved&&input.Number("index") is <1 or >4||input.Number("expectedRevision") is <1 or >int.MaxValue)throw new DomainException("INVALID_AVATAR_SELECTION");
            if(saved)payload["assetId"]=Id(input,"assetId");else{payload["attemptId"]=Id(input,"attemptId");payload["index"]=input.Number("index");}
            payload["clientRequestId"]=Id(input,"clientRequestId");payload["expectedRevision"]=input.Number("expectedRevision");
            payload["staticRequired"]=true;payload["proposedAssetId"]=EntityId.New();payload["generatorModel"]=generator.Model;payload["promptVersion"]=generator.ExpressionPromptVersion;
            return await platform.ExecuteAsync("avatar.attempt.expression.begin",payload,ct);
        }
        payload["workflowId"]=Id(input,"workflowId");
        if(action=="review"){
            if(input.Count!=2||input.Maybe("packageVersion") is not string version||!System.Text.RegularExpressions.Regex.IsMatch(version,"^[0-9a-f]{64}$"))throw new DomainException("INVALID_AVATAR_SELECTION");
            payload["packageVersion"]=version;return await platform.ExecuteAsync("avatar.attempt.expression.review",payload,ct);
        }
        if(action=="cancel"){
            if(input.Count!=1)throw new DomainException("INVALID_AVATAR_SELECTION");
            return await platform.ExecuteAsync("avatar.attempt.expression.cancel",payload,ct);
        }
        if(action!="next"||input.Count is <3 or >4||input.Any(p=>!new[]{"workflowId","expression","clientRequestId","retryUncertain"}.Contains(p.Key))||!Expressions.Contains(input.Maybe("expression")))throw new DomainException("INVALID_AVATAR_SELECTION");
        string workflow=input.Text("workflowId"),requestId=Id(input,"clientRequestId"),expression=input.Text("expression");
        payload["expression"]=expression;payload["clientRequestId"]=requestId;payload["retryUncertain"]=input["retryUncertain"]?.GetValue<bool>()??false;
        var lease=await platform.ExecuteAsync("avatar.attempt.expression.next",payload,ct);
        if(lease["completed"]?.GetValue<bool>()==true)return lease["progress"]!.DeepClone();
        var etag=lease.Text("lease");var providerCompleted=false;
        try{
            await limiter.ConsumeAsync("avatar_expression.v1","account",user.AccountId,ct);
            var saved=lease["savedSource"]?.GetValue<bool>()==true;
            var master=saved?await (savedMedia??throw new DomainException("STORAGE_UNAVAILABLE",503)).ReadPhotoAsync(user,lease.Text("assetId"),ct):await candidates.ReadAsync(user,lease.Text("attemptId"),checked((int)lease.Number("index")),ct);
            if(saved&&Convert.ToHexStringLower(System.Security.Cryptography.SHA256.HashData(master.Bytes.Span))!=lease.Text("sourceImageSha256"))throw new DomainException("AVATAR_SOURCE_CHANGED",409);
            var image=await generator.GenerateExpressionAsync(master,expression,ct);providerCompleted=true;
            return await store.PublishAsync(user,workflow,expression,requestId,etag,image,ct);
        }catch(Exception error){
            using var cleanup=new CancellationTokenSource(TimeSpan.FromSeconds(5));var failed=Auth(user);
            failed["workflowId"]=workflow;failed["clientRequestId"]=requestId;failed["lease"]=etag;
            failed["uncertain"]=providerCompleted||error is OperationCanceledException or HttpRequestException||error is DomainException{Code:"IMAGE_PROVIDER_UNCERTAIN"};
            try{await platform.ExecuteAsync("avatar.attempt.expression.fail",failed,cleanup.Token);}catch(Exception failure)when(failure is DomainException or OperationCanceledException or HttpRequestException){/* 本人再進前景只讀查回，不排程續產。 */}
            throw;
        }
    }
}
