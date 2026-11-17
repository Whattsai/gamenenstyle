using System.Text.Json;
using System.Text.Json.Nodes;
using System.Security.Cryptography;
using DatingHigh.Application.RateLimiting;
using DatingHigh.Domain;

namespace DatingHigh.Application;

/// <summary>唯一雙 Track 故事編排入口；Domain 求合法操作，固定 D1 指令同批提交所有執行事實。</summary>
public sealed class SceneEventFrameworkService(IPlatformClient platform,IRoundRealtimeNotifier notifier,IRateLimiter limiter)
{
    private static readonly JsonSerializerOptions Json=new(JsonSerializerDefaults.Web);
    private static JsonObject Auth(CurrentUser u,string roundId)=>JsonSerializer.SerializeToNode(new{accountId=u.AccountId,sessionId=u.SessionId,cv=u.CredentialVersion,accessExpiresAt=u.AccessExpiresAt,roundId},Json)!.AsObject();
    private async Task<JsonArray> Rows(string command,JsonObject payload,CancellationToken ct)=>(await platform.ExecuteAsync(command,payload,ct))["rows"]?.AsArray()??throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
    private static JsonNode? Record(JsonArray rows,string type)=>rows.FirstOrDefault(r=>r?.Maybe("record_type")==type);
    private static IEnumerable<JsonNode> Records(JsonArray rows,string type)=>rows.Where(r=>r?.Maybe("record_type")==type).Select(r=>r!);
    private static string Required(JsonObject p,string key)=>p[key]?.GetValue<string>()??throw new DomainException("INVALID_STORY_REQUEST");
    private static long Revision(JsonObject p,string key)=>p[key]?.GetValue<long>() is >0 and var value?value:throw new DomainException("INVALID_STORY_REQUEST");
    private static long? OptionalRevision(JsonObject p,string key)=>p.ContainsKey(key)?Revision(p,key):null;
    private static int Episode(JsonObject p,string key)=>p[key]?.GetValue<int>() is >0 and <int.MaxValue and var value?value:throw new DomainException("INVALID_STORY_REQUEST");
    private static JsonObject Pick(JsonNode source,params string[] keys){var result=new JsonObject();foreach(var key in keys)if(source[key] is JsonNode v)result[key]=v.DeepClone();return result;}
    private static JsonNode Canonical(JsonNode input)=>input is JsonObject o?new JsonObject(o.OrderBy(p=>p.Key,StringComparer.Ordinal).Select(p=>new KeyValuePair<string,JsonNode?>(p.Key,p.Value is null?null:Canonical(p.Value)))):input is JsonArray a?new JsonArray(a.Select(n=>n is null?null:Canonical(n)).ToArray()):input.DeepClone();
    private async Task<SceneTrackContent> Content(CurrentUser u,string roundId,JsonNode story,CancellationToken ct){var p=Auth(u,roundId);p["catalogId"]=story["catalog_id"]!.DeepClone();var result=await platform.ExecuteAsync("story.framework.content.read",p,ct);return SceneEventTrackPolicy.Compile(result["content"]!.AsObject(),story.Text("selected_category_code"));}
    private static TrackState State(JsonArray rows,JsonNode story)
    {
        var round=Record(rows,"round")!;var progress=Records(rows,"participant_progress").Select(p=>new TrackProgress(p.Text("account_id"),p.Text("role"),p.Text("current_node_id"),p.Text("current_area_id"),p.Number("revision"))).ToArray();
        if(progress.Length!=2||progress.Select(p=>p.Role).Distinct().Count()!=2||progress.Any(p=>p.AccountId!=round.Text("account_low_id")&&p.AccountId!=round.Text("account_high_id")||p.Role!=(p.AccountId==round.Text("initiator_account_id")?"inviter":"acceptor")))throw new DomainException("INVALID_STORY_CONTENT");
        var instances=Records(rows,"event_instance").ToDictionary(i=>i.Text("binding_id"),i=>new TrackInstance(i.Text("binding_id"),i.Text("track_scope"),i.Text("status"),i.Number("revision"),JsonNode.Parse(i.Text("state_json"))!.AsObject()),StringComparer.Ordinal);
        var history=Records(rows,"event_history").Where(i=>i.Text("story_session_id")!=story.Text("story_session_id")).Select(i=>new TrackOccurrence(i.Text("binding_id"),i.Text("track_scope"),i.Text("repeat_group"),i.Text("status"))).ToArray();
        return new(story.Number("shared_revision"),JsonNode.Parse(story.Text("world_state_json"))!.AsObject(),progress,instances,story.Text("chapter_status")=="completed",Records(rows,"completed_narrative").Select(n=>n.Text("story_id")).ToArray(),history);
    }
    public async Task<JsonObject> ExperienceAsync(CurrentUser u,string roundId,JsonArray rows,CancellationToken ct=default)
    {
        for(var attempt=0;attempt<3;attempt++){
            var story=Record(rows,"story");if(story is null)return Pending(u,roundId,rows);
            var c=await Content(u,roundId,story,ct);var state=State(rows,story);var decisions=SceneEventTrackPolicy.Activate(c,state,u.AccountId,()=>RandomNumberGenerator.GetInt32(int.MaxValue)/(double)int.MaxValue);
            if(decisions.Length==0){var result=Project(u,roundId,rows,story,c,state);await Rows("story.framework.authorize",Auth(u,roundId),ct);return result;}
            var p=Auth(u,roundId);p["eventId"]=EntityId.New();p["storySessionId"]=story["story_session_id"]!.DeepClone();p["episodeSeq"]=story["episode_seq"]!.DeepClone();p["expectedSharedRevision"]=state.SharedRevision;
            p["progressRevisions"]=new JsonArray(state.Progress.Select(q=>(JsonNode)new JsonObject{["accountId"]=q.AccountId,["role"]=q.Role,["revision"]=q.Revision}).ToArray());
            p["instances"]=new JsonArray(decisions.Select(i=>{var b=c.Bindings.Single(b=>b.Key==i.BindingKey);var d=b.Raw["definition"]!;return(JsonNode)new JsonObject{["instanceId"]=EntityId.New(),["bindingId"]=i.BindingKey,["eventId"]=d["eventId"]!.DeepClone(),["eventVersion"]=d["version"]!.DeepClone(),["repeatGroup"]=b.Raw["repeatGroup"]!.DeepClone(),["repeatScope"]=b.Raw["repeatScope"]!.DeepClone(),["trackScope"]=i.TrackScope,["status"]=i.Status};}).ToArray());
            try{await Rows("story.framework.events.activate",p,ct);try{await notifier.NotifyAsync(roundId,false,ct);}catch(Exception e)when(e is not OperationCanceledException){}}
            catch(DomainException e)when(e.Code=="EVENT_STATE_CONFLICT"){}
            rows=await Rows("story.snapshot",Auth(u,roundId),ct);
        }throw new DomainException("EVENT_STATE_CONFLICT",409);
    }
    private static JsonObject Pending(CurrentUser u,string roundId,JsonArray rows)
    {
        var round=Record(rows,"round")!;var offers=new JsonArray();foreach(var id in JsonNode.Parse(Record(rows,"offers")!.Text("category_ids_json"))!.AsArray()){
            var category=Records(rows,"category").Single(c=>c.Text("category_id")==id!.GetValue<string>());offers.Add(new JsonObject{["categoryId"]=id!.DeepClone(),["title"]=category["title"]!.DeepClone(),["rank"]=offers.Count+1,["summary"]="一起探索這個主題的故事",["reason"]="適合兩人輕鬆探索"});
        }
        var votes=Records(rows,"vote").ToArray();var my=votes.FirstOrDefault(v=>v.Text("actor_account_id")==u.AccountId);
        return new(){["roundId"]=roundId,["episodeSeq"]=round["episode_seq"]!.DeepClone(),["eventSeq"]=round["last_event_seq"]!.DeepClone(),["phase"]="pending_category_selection",["offers"]=offers,["myVote"]=my is null?null:JsonNode.Parse(my.Text("payload_json"))?["categoryId"]?.DeepClone(),["partnerHasVoted"]=votes.Any(v=>v.Text("actor_account_id")!=u.AccountId)};
    }
    private static JsonObject Project(CurrentUser u,string roundId,JsonArray rows,JsonNode story,SceneTrackContent c,TrackState state)
    {
        var me=state.Progress.Single(p=>p.AccountId==u.AccountId);var other=state.Progress.Single(p=>p.AccountId!=u.AccountId);var round=Record(rows,"round")!;var node=c.Node(me.Role,me.NodeId);var endingId=state.Instances.Values.Select(i=>i.State.Maybe("endingId")).FirstOrDefault(id=>id is not null);
        var current=Pick(node,"id","title","lines","presentation");current["objects"]=new JsonArray();current["choices"]=new JsonArray();current["visual"]="bookshop";
        // Area 是實際物理位置，節點可以先解鎖下一個地點，不能在尚未移動時偷換鏡位。
        current["presentation"]!["cameraId"]=c.Scene["areas"]!.AsArray().Single(a=>a!.Text("id")==me.AreaId)!["cameraId"]!.DeepClone();
        if(state.Completed){var ending=c.Narrative["endings"]!.AsArray().Single(e=>e!.Text("id")==endingId)!;current=Pick(ending,"id","title","lines");current["ending"]=true;current["objects"]=new JsonArray();current["choices"]=new JsonArray();current["presentation"]=new JsonObject{["cameraId"]=ending["presentationSteps"]!.AsArray().FirstOrDefault(s=>s!.Maybe("type")=="camera")?["cameraId"]?.DeepClone()??JsonValue.Create(me.AreaId),["expression"]="smile",["hotspotIds"]=new JsonArray()};}
        var result=new JsonObject{["roundId"]=roundId,["schemaVersion"]="scene-event.v2",["episodeSeq"]=story["episode_seq"]!.DeepClone(),["eventSeq"]=round["last_event_seq"]!.DeepClone(),["phase"]=state.Completed?"completed":"playing",["storySessionId"]=story["story_session_id"]!.DeepClone(),["selectedCategoryId"]=story["selected_category_id"]!.DeepClone(),["sceneId"]=c.Scene["sceneId"]!.DeepClone(),["storyId"]=c.Narrative["narrativeId"]!.DeepClone(),["version"]=c.Narrative["version"]!.DeepClone(),["title"]=c.Narrative["title"]!.DeepClone(),["chapterStatus"]=state.Completed?"completed":"playing",["sharedRevision"]=state.SharedRevision,["myTrack"]=new JsonObject{["role"]=me.Role,["nodeId"]=me.NodeId,["areaId"]=me.AreaId,["revision"]=me.Revision},["currentNode"]=current,["endingId"]=endingId,["partnerPresence"]=new JsonObject{["inSameArea"]=me.AreaId==other.AreaId},["objects"]=new JsonArray(),["events"]=new JsonArray()};
        var selectedVotes=Records(rows,"vote").Select(v=>JsonNode.Parse(v.Text("payload_json"))?.Maybe("categoryId")).Where(id=>id is not null).ToArray();
        if(selectedVotes.Length==2)result["selectionReason"]=selectedVotes[0]==selectedVotes[1]?"你們選擇了相同主題。":"你們選擇了不同主題，依原邀請方最後一次有效選擇開始。";
        foreach(var key in new[]{"backgroundAsset","audioAsset","audioCues"})result[key]=c.Scene[key]?.DeepClone();result["suggestions"]=c.Narrative["suggestions"]!.DeepClone();
        result["assets"]=new JsonArray(c.Scene["assets"]!.AsArray().Select(a=>(JsonNode)new JsonObject{["id"]=a!["id"]!.DeepClone(),["url"]="/story-content/assets/"+a.Text("sha256"),["sha256"]=a["sha256"]!.DeepClone(),["mimeType"]=a["mimeType"]!.DeepClone(),["byteLength"]=a["byteLength"]!.DeepClone()}).ToArray());
        var presentation=c.Scene["scenePresentation"]!.DeepClone().AsObject();presentation["hotspots"]=new JsonArray();result["scenePresentation"]=presentation;
        result["areas"]=new JsonArray(c.Scene["areas"]!.AsArray().Select(a=>(JsonNode)Pick(a!,"id","title")).ToArray());
        var objects=new JsonArray();foreach(var o in c.Scene["sceneObjects"]!.AsArray().Select(o=>o!)){
            var visibility=o!.Maybe("visibility")??"public";if(visibility!="public"&&visibility!=me.Role)continue;
            var value=state.World["objects"]![o.Text("id")]!.GetValue<string>();var objectState=o["states"]!.AsArray().Single(s=>s!.Text("id")==value)!;
            var projected=Pick(o,"id","label","rendererId","assetId","color","x","y");if(o["previewPlacement"] is JsonNode preview&&preview["roles"]!.AsArray().Any(role=>role!.GetValue<string>()==me.Role))projected["previewPlacement"]=Pick(preview,"slotId","areaId","hint");projected["state"]=value;projected["areaId"]=objectState["areaId"]!.DeepClone();projected["holderRole"]=objectState["holder"]?.DeepClone();objects.Add(projected);
        }
        var flags=new JsonObject();foreach(var f in c.Scene["sharedFlags"]!.AsArray().Select(f=>f!)){var value=state.World["flags"]![f!.Text("id")]!.GetValue<string>();if(f["publicValues"]!.AsArray().Any(v=>v!.GetValue<string>()==value))flags[f.Text("id")]=value;}
        result["world"]=new JsonObject{["objects"]=objects,["flags"]=flags};
        result["knownClues"]=new JsonArray((c.Narrative["clues"]?.AsArray()??[]).Select(clue=>clue!).Where(clue=>(clue!.Text("role")==me.Role||clue.Text("role")=="shared")&&SceneEventTrackPolicy.Evaluate(c,state,clue["conditions"]!.AsObject())).Select(clue=>(JsonNode)Pick(clue!,"id","text")).ToArray());
        var available=SceneEventTrackPolicy.Available(c,state,u.AccountId);var events=new JsonArray();foreach(var group in available.GroupBy(a=>a.BindingKey)){
            var b=c.Bindings.Single(b=>b.Key==group.Key);var first=group.First();var e=new JsonObject{["bindingId"]=group.Key,["trackScope"]=b.TrackScope,["moduleType"]=b.ModuleType,["main"]=b.Raw["narrativeRole"]!.GetValue<string>()=="main",["revision"]=first.EventRevision,["needsSharedRevision"]=first.NeedsSharedRevision,["actions"]=new JsonArray(group.Select(a=>(JsonNode)new JsonObject{["actionId"]=a.ActionId,["label"]=a.Label,["params"]=a.Params.DeepClone(),["targetObjectId"]=b.Raw["actions"]!.AsArray().Single(raw=>raw!.Text("role")==me.Role&&raw!.Text("actionId")==a.ActionId&&JsonNode.DeepEquals(raw!["params"],a.Params))?["targetObjectId"]?.DeepClone(),["dropSlotId"]=b.Raw["actions"]!.AsArray().Single(raw=>raw!.Text("role")==me.Role&&raw!.Text("actionId")==a.ActionId&&JsonNode.DeepEquals(raw!["params"],a.Params))?["dropSlotId"]?.DeepClone()}).ToArray())};
            if(b.TrackScope=="shared"&&b.Raw["lines"] is JsonNode lines)e["lines"]=lines.DeepClone();events.Add(e);
        }result["availableEvents"]=events;
        var waiting=state.Instances.Values.Where(i=>i.TrackScope=="shared"&&i.Status=="active").Select(i=>new JsonObject{["bindingId"]=i.BindingKey,["mySubmitted"]=i.State["submissions"]?[me.Role] is JsonObject mine&&mine.Count>0,["partnerHasSubmitted"]=i.State["submissions"]?[other.Role] is JsonObject theirs&&theirs.Count>0}).ToArray();result["cooperation"]=new JsonArray(waiting.Select(w=>(JsonNode)w).ToArray());
        var endingSteps=state.Completed?c.Narrative["endings"]!.AsArray().Single(e=>e!.Text("id")==endingId)!["presentationSteps"]!.AsArray():null;
        var cue=Record(rows,"cue_event");if(cue is not null){var body=JsonNode.Parse(cue.Text("payload_json"))!;var steps=body["presentationSteps"]?.DeepClone().AsArray()??new JsonArray();if(endingSteps is not null)foreach(var step in endingSteps)steps.Add(step!.DeepClone());result["presentationCue"]=new JsonObject{["eventSeq"]=cue["sequence"]!.DeepClone(),["steps"]=steps};}
        if(endingSteps is not null)result["endingPresentationSteps"]=endingSteps.DeepClone();
        var consents=Records(rows,"consent").Select(c=>new{Actor=c.Text("actor_account_id"),Agree=JsonNode.Parse(c.Text("payload_json"))!["agree"]!.GetValue<bool>()}).ToArray();result["myAgreedNext"]=consents.Any(c=>c.Actor==u.AccountId&&c.Agree);result["partnerAgreedNext"]=consents.Any(c=>c.Actor!=u.AccountId&&c.Agree);
        return result;
    }
    public async Task<JsonObject> CommandAsync(CurrentUser u,string roundId,string type,string requestId,JsonObject input,JsonArray rows,CancellationToken ct=default)
    {
        var p=Auth(u,roundId);p["clientRequestId"]=requestId;p["eventId"]=EntityId.New();string command;
        if(type is "story.next.requested" or "story.vote.submit"){
            if(type=="story.next.requested"){StoryDialogueService.Only(input,"completedEpisodeSeq","agree");p["completedEpisodeSeq"]=Episode(input,"completedEpisodeSeq");p["agree"]=input["agree"]?.GetValue<bool>()??throw new DomainException("INVALID_STORY_REQUEST");p["offersEventId"]=EntityId.New();command="story.framework.next";}
            else{StoryDialogueService.Only(input,"episodeSeq","categoryId");p["episodeSeq"]=Episode(input,"episodeSeq");var category=Required(input,"categoryId");StoryDialogueService.Id(category);p["categoryId"]=category;command="story.framework.vote";}
            foreach(var key in new[]{"storySessionId","sceneVisitId","categoryEventId","sceneEventId","narrativeEventId"})p[key]=EntityId.New();
        }else if(type=="message.send"){
            StoryDialogueService.Only(input,"text","choiceId");if((input["text"] is null)==(input["choiceId"] is null))throw new DomainException("INVALID_STORY_REQUEST");var text=input["text"]?.GetValue<string>();if(text is null){var story=Record(rows,"story")??throw new DomainException("STORY_SELECTION_PENDING",409);var content=await Content(u,roundId,story,ct);text=content.Narrative["suggestions"]!.AsArray().SingleOrDefault(s=>s!.Text("id")==Required(input,"choiceId"))?.Text("text")??throw new DomainException("INVALID_STORY_REQUEST");}p["text"]=StoryMessagePolicy.Validate(text);command="story.message.send";
        }else if(type=="story.event.submit"){
            StoryDialogueService.Only(input,"storySessionId","bindingId","actionId","params","expectedTrackRevision","expectedSharedRevision","expectedEventRevision");var sessionId=Required(input,"storySessionId");StoryDialogueService.Id(sessionId);var parameters=input["params"] as JsonObject??throw new DomainException("INVALID_STORY_REQUEST");
            var request=Canonical(input).ToJsonString();var lookup=Auth(u,roundId);lookup["clientRequestId"]=requestId;var receipt=await Rows("story.receipt",lookup,ct);if(receipt.Count>0){if(receipt[0]!.Maybe("request_payload")!=request)throw new DomainException("EVENT_STATE_CONFLICT",409);return new(){["clientRequestId"]=requestId,["eventSeq"]=receipt[0]!["sequence"]!.DeepClone()};}
            var story=Record(rows,"story")??throw new DomainException("STORY_SELECTION_PENDING",409);if(story.Text("story_session_id")!=sessionId)throw new DomainException("EVENT_STATE_CONFLICT",409);
            var content=await Content(u,roundId,story,ct);var state=State(rows,story);var result=SceneEventTrackPolicy.Apply(content,state,u.AccountId,new(Required(input,"bindingId"),Required(input,"actionId"),parameters,Revision(input,"expectedTrackRevision"),OptionalRevision(input,"expectedSharedRevision"),OptionalRevision(input,"expectedEventRevision")));var me=state.Progress.Single(p=>p.AccountId==u.AccountId);
            var old=Records(rows,"event_instance").SingleOrDefault(i=>i.Text("binding_id")==result.Binding.Key);var definition=result.Binding.Raw["definition"]!;
            p["storySessionId"]=sessionId;p["episodeSeq"]=story["episode_seq"]!.DeepClone();p["actorRole"]=me.Role;p["expectedTrackRevision"]=me.Revision;p["expectedSharedRevision"]=result.SharedChanged?state.SharedRevision:null;p["sharedChanged"]=result.SharedChanged;p["worldStateJson"]=result.State.World.ToJsonString();p["completed"]=result.State.Completed;p["endingId"]=result.EndingId;p["requestPayload"]=request;p["presentationSteps"]=result.PresentationSteps.DeepClone();p["stateEventId"]=EntityId.New();p["completionEventId"]=EntityId.New();
            p["progressUpdates"]=new JsonArray(result.ChangedProgress.Select(progress=>(JsonNode)new JsonObject{["accountId"]=progress.AccountId,["role"]=progress.Role,["expectedRevision"]=state.Progress.Single(prior=>prior.Role==progress.Role).Revision,["nodeId"]=progress.NodeId,["areaId"]=progress.AreaId}).ToArray());
            p["instance"]=new JsonObject{["instanceId"]=old?.Maybe("event_instance_id")??EntityId.New(),["bindingId"]=result.Binding.Key,["eventId"]=definition["eventId"]!.DeepClone(),["eventVersion"]=definition["version"]!.DeepClone(),["repeatGroup"]=result.Binding.Raw["repeatGroup"]!.DeepClone(),["repeatScope"]=result.Binding.Raw["repeatScope"]!.DeepClone(),["trackScope"]=result.Binding.TrackScope,["expectedRevision"]=old?.Number("revision"),["status"]=result.Instance.Status,["stateJson"]=result.Instance.State.ToJsonString()};command="story.framework.action.commit";
        }else throw new DomainException("INVALID_STORY_REQUEST");
        await limiter.ConsumeAsync("story_mutation.v1","account",u.AccountId,ct);var committed=(await Rows(command,p,ct)).LastOrDefault()??throw new DomainException("EVENT_STATE_CONFLICT",409);try{await notifier.NotifyAsync(roundId,false,ct);}catch(Exception e)when(e is not OperationCanceledException){}return new(){["clientRequestId"]=requestId,["eventSeq"]=committed["sequence"]!.DeepClone()};
    }
}
