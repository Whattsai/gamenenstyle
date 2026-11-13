using System.Text.Json.Nodes;
using DatingHigh.Application.Media;
using DatingHigh.Application.RateLimiting;
using DatingHigh.Domain;

namespace DatingHigh.Application;

/// <summary>每次 HTTP 最多製作一種固定表情；不建立背景作業、不自動重試或重新傳真人照片。</summary>
public sealed class AvatarExpressionService(IPlatformClient platform,IAvatarCandidateStore candidates,IAvatarExpressionStore store,IAvatarExpressionGenerator generator,IRateLimiter limiter)
{
    private static readonly string[] Expressions=["neutral","smile","surprised","thoughtful","concerned"];
    private static Dictionary<string,object?> Auth(CurrentUser user)=>new(){["accountId"]=user.AccountId,["sessionId"]=user.SessionId,["cv"]=user.CredentialVersion,["accessExpiresAt"]=user.AccessExpiresAt};
    private static string Id(JsonObject input,string key){var value=input.Maybe(key);if(!EntityId.IsValid(value))throw new DomainException("INVALID_AVATAR_SELECTION");return value!;}
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
            if(input.Count!=4||input.Any(p=>!new[]{"attemptId","index","clientRequestId","expectedRevision"}.Contains(p.Key))||input.Number("index") is <1 or >4||input.Number("expectedRevision") is <1 or >int.MaxValue)throw new DomainException("INVALID_AVATAR_SELECTION");
            payload["attemptId"]=Id(input,"attemptId");payload["index"]=input.Number("index");payload["clientRequestId"]=Id(input,"clientRequestId");payload["expectedRevision"]=input.Number("expectedRevision");
            payload["proposedAssetId"]=EntityId.New();payload["generatorModel"]=generator.Model;payload["promptVersion"]=generator.ExpressionPromptVersion;
            return await platform.ExecuteAsync("avatar.attempt.expression.begin",payload,ct);
        }
        payload["workflowId"]=Id(input,"workflowId");
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
            var master=await candidates.ReadAsync(user,lease.Text("attemptId"),checked((int)lease.Number("index")),ct);
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
