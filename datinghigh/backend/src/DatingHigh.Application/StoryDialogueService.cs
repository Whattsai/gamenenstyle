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
    private async Task Active(CurrentUser u,string roundId,CancellationToken ct){if((await StatusAsync(u,roundId,ct)).Text("status")!="active")throw new DomainException("ROUND_NOT_ACTIVE",409);}
    private async Task<JsonArray> Snapshot(CurrentUser u,string roundId,CancellationToken ct){await Active(u,roundId,ct);return await Rows("story.snapshot",Auth(u,roundId),ct);}
    private static JsonNode? Record(JsonArray rows,string type)=>rows.FirstOrDefault(r=>r?.Maybe("record_type")==type);
    private async Task<JsonObject> Manifest(CurrentUser u,string roundId,string catalogId,CancellationToken ct)
    {
        var payload=Auth(u,roundId);payload["catalogId"]=catalogId;
        var result=await platform.ExecuteAsync("story.content.read",payload,ct);
        var manifest=result["manifest"]?.AsObject()??throw new DomainException("DEPENDENCY_UNAVAILABLE",503);StoryGraphPolicy.Validate(manifest);return manifest;
    }
    private static JsonArray Assets(JsonObject manifest)=>new(manifest["assets"]!.AsArray().Select(a=>(JsonNode)new JsonObject{
        ["id"]=a!["id"]!.DeepClone(),["url"]="/story-content/assets/"+a.Text("sha256"),["sha256"]=a["sha256"]!.DeepClone(),["mimeType"]=a["mimeType"]!.DeepClone(),["byteLength"]=a["byteLength"]!.DeepClone()
    }).ToArray());
    public async Task<JsonObject> ExperienceAsync(CurrentUser u,string roundId,CancellationToken ct=default)
    {
        var status=await StatusAsync(u,roundId,ct);if(status.Text("status")=="ended")return new(){["roundId"]=roundId,["phase"]="ended"};
        var rows=await Rows("story.snapshot",Auth(u,roundId),ct);var round=Record(rows,"round")!;var story=Record(rows,"story");
        var votes=rows.Where(r=>r?.Maybe("record_type")=="vote").ToArray();
        var result=new JsonObject{["roundId"]=roundId,["episodeSeq"]=1,["eventSeq"]=round["last_event_seq"]!.DeepClone(),["phase"]=story is null?"pending_story_selection":"playing"};
        var my= votes.FirstOrDefault(v=>v!.Text("actor_account_id")==u.AccountId);result["myVote"]=my is null?null:JsonNode.Parse(my.Text("payload_json"))?["catalogId"]?.DeepClone();
        result["partnerHasVoted"]=votes.Any(v=>v!.Text("actor_account_id")!=u.AccountId);
        if(story is null){
            var offers=new JsonArray();foreach(var catalog in JsonNode.Parse(round.Text("story_offer_catalog_ids_json"))!.AsArray()){
                var manifest=await Manifest(u,roundId,catalog!.GetValue<string>(),ct);
                offers.Add(new JsonObject{["catalogId"]=catalog.DeepClone(),["rank"]=offers.Count+1,["storyId"]=manifest["storyId"]!.DeepClone(),["version"]=manifest["version"]!.DeepClone(),["title"]=manifest["title"]!.DeepClone(),["summary"]=manifest["summary"]!.DeepClone(),["previewUrl"]="/story-content/assets/"+manifest["assets"]!.AsArray().Single(a=>a!.Text("id")==manifest.Text("backgroundAsset"))!.Text("sha256"),["reason"]="適合兩人輕鬆探索"});
            }result["offers"]=offers;
        }else{
            var manifest=await Manifest(u,roundId,story.Text("catalog_id"),ct);var node=StoryGraphPolicy.Node(manifest,story.Text("current_node_id"));
            result["storySessionId"]=story["story_session_id"]!.DeepClone();result["catalogId"]=story["catalog_id"]!.DeepClone();result["storyId"]=manifest["storyId"]!.DeepClone();result["version"]=manifest["version"]!.DeepClone();result["title"]=manifest["title"]!.DeepClone();result["chapterStatus"]=story["chapter_status"]!.DeepClone();result["progressRevision"]=story["progress_revision"]!.DeepClone();result["currentNode"]=node.DeepClone();result["assets"]=Assets(manifest);result["backgroundAsset"]=manifest["backgroundAsset"]!.DeepClone();result["audioAsset"]=manifest["audioAsset"]!.DeepClone();result["suggestions"]=manifest["suggestions"]!.DeepClone();
            result["selectionReason"]=votes.Length==2?(votes.Select(v=>JsonNode.Parse(v!.Text("payload_json"))!.Text("catalogId")).Distinct().Count()==1?"雙方選擇了相同故事":"雙方選擇不同，採原邀請方的選擇"):null;
            if(manifest["scenePresentation"] is JsonObject presentation)result["scenePresentation"]=presentation.DeepClone();
            if(manifest["audioCues"] is JsonObject cues)result["audioCues"]=cues.DeepClone();
            var objects=new JsonArray();foreach(var obj in node["objects"]!.AsArray())objects.Add(StoryGraphPolicy.Definition(manifest,obj!.GetValue<string>()).DeepClone());result["objects"]=objects;
            if(node["interactionId"] is JsonNode refId){
                var definition=StoryGraphPolicy.Definition(manifest,refId.GetValue<string>());var interaction=rows.FirstOrDefault(r=>r?.Maybe("record_type")=="interaction"&&r.Maybe("node_id")==node.Text("id")&&r.Maybe("definition_id")==definition.Text("id"));
                var answers=interaction is null?new JsonObject():JsonNode.Parse(interaction.Text("state_json"))!.AsObject();
                result["interaction"]=new JsonObject{["definition"]=definition.DeepClone(),["myChoice"]=answers[u.AccountId]?.DeepClone(),["partnerHasSubmitted"]=answers.Any(a=>a.Key!=u.AccountId),["status"]=interaction?.Maybe("status")??"active"};
            }
        }
        await Active(u,roundId,ct);return result;
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
    private static string Required(JsonObject p,string key)=>p[key]?.GetValue<string>()??throw new DomainException("INVALID_STORY_REQUEST");
    public async Task<JsonObject> CommandAsync(CurrentUser u,string roundId,string type,string requestId,JsonObject input,CancellationToken ct=default)
    {
        Id(roundId);Id(requestId);await Active(u,roundId,ct);
        var p=Auth(u,roundId);p["clientRequestId"]=requestId;p["eventId"]=EntityId.New();string command;
        if(type=="story.vote.submit"){
            Only(input,"episodeSeq","catalogId");StorySelectionPolicy.CurrentEdition(input["episodeSeq"]?.GetValue<int>()??0);var catalog=Required(input,"catalogId");Id(catalog);
            var lookup=Auth(u,roundId);lookup["clientRequestId"]=requestId;var receipt=await Rows("story.receipt",lookup,ct);
            var rows=await Snapshot(u,roundId,ct);if(receipt.Count==0&&Record(rows,"story") is not null)throw new DomainException("STORY_ALREADY_SELECTED",409);
            if(!JsonNode.Parse(Record(rows,"round")!.Text("story_offer_catalog_ids_json"))!.AsArray().Any(n=>n!.GetValue<string>()==catalog))throw new DomainException("INVALID_STORY_VOTE");
            p["episodeSeq"]=1;p["catalogId"]=catalog;p["storySessionId"]=EntityId.New();p["selectedEventId"]=EntityId.New();command="story.selection.vote";
        }else if(type=="message.send"){
            Only(input,"text","choiceId");if((input["text"] is null)==(input["choiceId"] is null))throw new DomainException("INVALID_STORY_REQUEST");
            string text;if(input["choiceId"] is not null){var rows=await Snapshot(u,roundId,ct);var story=Record(rows,"story")??throw new DomainException("STORY_SELECTION_PENDING",409);var manifest=await Manifest(u,roundId,story.Text("catalog_id"),ct);text=manifest["suggestions"]!.AsArray().SingleOrDefault(s=>s!.Text("id")==Required(input,"choiceId"))?.Text("text")??throw new DomainException("INVALID_STORY_REQUEST");}else text=Required(input,"text");
            p["text"]=StoryMessagePolicy.Validate(text);command="story.message.send";
        }else if(type is "story.choice.submit" or "interaction.submit"){
            Only(input,"storySessionId","episodeSeq","nodeId","expectedRevision","choiceId","definitionId");StorySelectionPolicy.CurrentEdition(input["episodeSeq"]?.GetValue<int>()??0);var sessionId=Required(input,"storySessionId");Id(sessionId);
            var request=JsonSerializer.Serialize(new{type,storySessionId=sessionId,episodeSeq=1,nodeId=Required(input,"nodeId"),expectedRevision=input["expectedRevision"]?.GetValue<long>()??0,choiceId=Required(input,"choiceId"),definitionId=input["definitionId"]?.GetValue<string>()},Json);
            var lookup=Auth(u,roundId);lookup["clientRequestId"]=requestId;var receipt=await Rows("story.receipt",lookup,ct);
            if(receipt.Count>0){if(receipt[0]!.Maybe("request_payload")!=request)throw new DomainException("EVENT_STATE_CONFLICT",409);return new(){["clientRequestId"]=requestId,["eventSeq"]=receipt[0]!["sequence"]!.DeepClone()};}
            var rows=await Snapshot(u,roundId,ct);var story=Record(rows,"story")??throw new DomainException("STORY_SELECTION_PENDING",409);
            if(story.Text("story_session_id")!=sessionId||story.Text("chapter_status")!="playing"||story.Text("current_node_id")!=Required(input,"nodeId")||story.Number("progress_revision")!=input["expectedRevision"]?.GetValue<long>())throw new DomainException("EVENT_STATE_CONFLICT",409);
            var manifest=await Manifest(u,roundId,story.Text("catalog_id"),ct);var node=StoryGraphPolicy.Node(manifest,story.Text("current_node_id"));var next=node.Text("id");JsonObject? interaction=null;var payload=new JsonObject{["choiceId"]=input["choiceId"]!.DeepClone()};
            if(type=="story.choice.submit"){if(input["definitionId"] is not null)throw new DomainException("INVALID_STORY_REQUEST");next=StoryGraphPolicy.Choice(node,Required(input,"choiceId"));}
            else{
                var definitionId=Required(input,"definitionId");var definition=StoryGraphPolicy.Definition(manifest,definitionId);var cooperative=definition.Text("moduleType")=="cooperative-choice";
                if(cooperative?node.Maybe("interactionId")!=definitionId:!node["objects"]!.AsArray().Any(n=>n!.GetValue<string>()==definitionId))throw new DomainException("INVALID_STORY_REQUEST");
                var option=StoryGraphPolicy.Option(definition,Required(input,"choiceId"));var previous=rows.FirstOrDefault(r=>r?.Maybe("record_type")=="interaction"&&r.Maybe("node_id")==node.Text("id")&&r.Maybe("definition_id")==definitionId);
                var state=previous is null?new JsonObject():JsonNode.Parse(previous.Text("state_json"))!.AsObject();if(previous?.Maybe("status")=="completed")throw new DomainException("EVENT_STATE_CONFLICT",409);
                state[u.AccountId]=input["choiceId"]!.DeepClone();var completed=cooperative&&state.Count==2;
                if(completed)next=definition.Text(state.Select(s=>s.Value!.GetValue<string>()).Distinct().Count()==1?"sameNext":"differentNext");
                interaction=new(){["instanceId"]=previous?.Maybe("interaction_instance_id")??EntityId.New(),["definitionId"]=definitionId,["definitionVersion"]=definition["version"]!.DeepClone(),["expectedRevision"]=previous?.Number("revision")??0,["status"]=completed?"completed":"active",["stateJson"]=state.ToJsonString()};
                payload["definitionId"]=definitionId;payload["choiceId"]=null;payload["result"]=cooperative?completed?"resolved":"pending_one":option.Maybe("result");
            }
            var ending=StoryGraphPolicy.Node(manifest,next)["ending"]?.GetValue<bool>()==true;
            p["nodeEventId"]=EntityId.New();p["completionEventId"]=EntityId.New();p["storySessionId"]=sessionId;p["episodeSeq"]=1;p["expectedRevision"]=story["progress_revision"]!.DeepClone();p["nodeId"]=node.Text("id");p["nextNodeId"]=next;p["completed"]=ending;p["kind"]=type=="interaction.submit"?"interaction.updated":"story.choice.committed";payload["nodeId"]=next;payload["chapterStatus"]=ending?"completed":"playing";p["payload"]=payload.ToJsonString();p["requestPayload"]=request;p["interaction"]=interaction;command="story.action.commit";
        }else throw new DomainException("INVALID_STORY_REQUEST");
        await limiter.ConsumeAsync("story_mutation.v1","account",u.AccountId,ct);
        var result=await Rows(command,p,ct);var committed=result.LastOrDefault()??throw new DomainException("EVENT_STATE_CONFLICT",409);await Notify(roundId,false,ct);
        return new(){["clientRequestId"]=requestId,["eventSeq"]=committed["sequence"]!.DeepClone()};
    }
}
