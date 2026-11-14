using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application.RateLimiting;
using DatingHigh.Domain;

namespace DatingHigh.Application;

/// <summary>沿用 Round 的授權、傳輸與 renderer；內容規則由 Domain 判定，提交由固定 D1 命令 CAS。</summary>
public sealed class SceneEventFrameworkService(IPlatformClient platform,IRoundRealtimeNotifier notifier,IRateLimiter limiter)
{
    private static readonly JsonSerializerOptions Json=new(JsonSerializerDefaults.Web);
    private static JsonObject Auth(CurrentUser u,string roundId)=>JsonSerializer.SerializeToNode(new{accountId=u.AccountId,sessionId=u.SessionId,cv=u.CredentialVersion,accessExpiresAt=u.AccessExpiresAt,roundId},Json)!.AsObject();
    private async Task<JsonArray> Rows(string command,JsonObject payload,CancellationToken ct)=>(await platform.ExecuteAsync(command,payload,ct))["rows"]?.AsArray()??throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
    private static JsonNode? Record(JsonArray rows,string type)=>rows.FirstOrDefault(r=>r?.Maybe("record_type")==type);
    private static IEnumerable<JsonNode> Records(JsonArray rows,string type)=>rows.Where(r=>r?.Maybe("record_type")==type).Select(r=>r!);
    private async Task<JsonArray> Snapshot(CurrentUser u,string roundId,CancellationToken ct)=>await Rows("story.snapshot",Auth(u,roundId),ct);
    private static string Required(JsonObject p,string key)=>p[key]?.GetValue<string>()??throw new DomainException("INVALID_STORY_REQUEST");
    private static int Episode(JsonObject p,string key){var episode=p[key]?.GetValue<int>()??0;if(episode<1||episode==int.MaxValue)throw new DomainException("INVALID_STORY_REQUEST");return episode;}
    private static JsonObject State(JsonNode instance)=>JsonNode.Parse(instance.Text("state_json"))!.AsObject();
    private static double Random()=>RandomNumberGenerator.GetInt32(1<<24)/(double)(1<<24);
    private async Task<CompiledSceneEventContent> Content(CurrentUser u,string roundId,JsonNode story,CancellationToken ct)
    {
        var p=Auth(u,roundId);p["catalogId"]=story["catalog_id"]!.DeepClone();var result=await platform.ExecuteAsync("story.framework.content.read",p,ct);
        return SceneEventManifestPolicy.Compile(result["content"]!.AsObject(),story.Text("selected_category_code"));
    }
    private static EventFacts Facts(JsonArray rows,CompiledSceneEventContent content,JsonNode story)
    {
        var facts=Records(rows,"fact_event").Select(r=>JsonNode.Parse(r.Text("payload_json"))!).ToArray();if(facts.Length>4000)throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        var completed=Records(rows,"event_instance").Where(r=>r.Text("status")=="completed").ToArray();var flags=new Dictionary<string,string>(StringComparer.Ordinal);
        foreach(var instance in completed)if(State(instance).Maybe("result") is string result)flags[instance.Text("binding_id")]=result;
        return new([content.Manifest.Text("entry"),story.Text("current_node_id"),..facts.Select(f=>f.Maybe("nodeId")).OfType<string>().Distinct()],facts.Select(f=>f.Maybe("choiceId")).OfType<string>().ToArray(),completed.Select(r=>r.Text("binding_id")).ToArray(),flags,Records(rows,"completed_narrative").Select(r=>r.Text("story_id")).ToArray());
    }
    private async Task<bool> Activate(CurrentUser u,string roundId,JsonArray rows,JsonNode story,CompiledSceneEventContent content,CancellationToken ct)
    {
        if(story.Text("chapter_status")!="playing")return false;
        var history=Records(rows,"event_history").Select(h=>new EventOccurrence(h.Text("round_id"),h.Text("story_session_id"),h.Text("binding_id"),h.Text("repeat_group"),h.Text("status"))).ToList();
        // 失敗機率以 cancelled Instance 保存本場裁定，重連不重擲；未達前置完全不建立 Instance。
        foreach(var h in Records(rows,"event_instance").Where(h=>h.Text("status")=="cancelled"))history.Add(new(roundId,story.Text("story_session_id"),h.Text("binding_id"),h.Text("repeat_group"),"cancelled"));
        var candidates=EventRulePolicy.Candidates(content.Bindings.Select(b=>b with{SelectionMode="fixed"}),content.SceneCapabilities,Facts(rows,content,story),history,roundId,story.Text("story_session_id"),_=>0);
        if(candidates.Length==0)return false;
        var instances=new JsonArray();foreach(var candidate in candidates.Take(16)){
            var original=content.Bindings.Single(b=>b.Key==candidate.Key);var selected=original.SelectionMode=="fixed"||Random()<original.Probability;
            instances.Add(new JsonObject{["instanceId"]=EntityId.New(),["bindingId"]=original.Key,["eventId"]=original.EventId,["eventVersion"]=original.EventVersion,["repeatGroup"]=original.RepeatGroup,["repeatScope"]=original.RepeatScope,["status"]=selected?"active":"cancelled",["stateJson"]=new JsonObject{["answers"]=new JsonObject(),["activationNodeId"]=story["current_node_id"]!.DeepClone()}.ToJsonString(),["eventSequenceId"]=EntityId.New()});
        }
        var p=Auth(u,roundId);p["storySessionId"]=story["story_session_id"]!.DeepClone();p["episodeSeq"]=story["episode_seq"]!.DeepClone();p["nodeId"]=story["current_node_id"]!.DeepClone();p["expectedRevision"]=story["progress_revision"]!.DeepClone();p["instances"]=instances;
        p["activationEventId"]=EntityId.New();await Rows("story.framework.events.activate",p,ct);try{await notifier.NotifyAsync(roundId,false,ct);}catch(Exception e)when(e is not OperationCanceledException){}return true;
    }
    private static JsonObject Definition(JsonObject source)
    {
        var result=new JsonObject();foreach(var key in new[]{"id","bindingId","version","moduleType","title","prompt","options"})result[key]=source[key]?.DeepClone();return result;
    }
    public async Task<JsonObject> ExperienceAsync(CurrentUser u,string roundId,JsonArray rows,CancellationToken ct=default)
    {
        for(var attempt=0;attempt<20;attempt++){
            var story=Record(rows,"story");if(story is null)return Pending(u,roundId,rows);
            var content=await Content(u,roundId,story,ct);
            try{if(await Activate(u,roundId,rows,story,content,ct)){rows=await Snapshot(u,roundId,ct);continue;}}
            catch(DomainException e)when(e.Code=="EVENT_STATE_CONFLICT"&&attempt<3){rows=await Snapshot(u,roundId,ct);continue;}
            var result=Project(u,roundId,rows,story,content);await Rows("story.framework.authorize",Auth(u,roundId),ct);return result;
        }
        throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
    }
    private static JsonObject Pending(CurrentUser u,string roundId,JsonArray rows)
    {
        var round=Record(rows,"round")!;var offers=new JsonArray();foreach(var id in JsonNode.Parse(Record(rows,"offers")!.Text("category_ids_json"))!.AsArray()){
            var category=Records(rows,"category").Single(c=>c.Text("category_id")==id!.GetValue<string>());offers.Add(new JsonObject{["categoryId"]=id!.DeepClone(),["title"]=category["title"]!.DeepClone(),["rank"]=offers.Count+1,["summary"]="一起探索這個主題的故事",["reason"]="適合兩人輕鬆探索"});
        }
        var votes=Records(rows,"vote").ToArray();var my=votes.FirstOrDefault(v=>v.Text("actor_account_id")==u.AccountId);
        return new(){["roundId"]=roundId,["episodeSeq"]=round["episode_seq"]!.DeepClone(),["eventSeq"]=round["last_event_seq"]!.DeepClone(),["phase"]="pending_category_selection",["offers"]=offers,["myVote"]=my is null?null:JsonNode.Parse(my.Text("payload_json"))?["categoryId"]?.DeepClone(),["partnerHasVoted"]=votes.Any(v=>v.Text("actor_account_id")!=u.AccountId)};
    }
    private static JsonObject Project(CurrentUser u,string roundId,JsonArray rows,JsonNode story,CompiledSceneEventContent content)
    {
        var manifest=content.Manifest;var round=Record(rows,"round")!;var completed=story.Text("chapter_status")=="completed";var node=StoryGraphPolicy.Node(manifest,story.Text("current_node_id")).DeepClone().AsObject();
        var result=new JsonObject{["roundId"]=roundId,["episodeSeq"]=story["episode_seq"]!.DeepClone(),["eventSeq"]=round["last_event_seq"]!.DeepClone(),["phase"]=completed?"completed":"playing",["storySessionId"]=story["story_session_id"]!.DeepClone(),["catalogId"]=story["catalog_id"]!.DeepClone(),["selectedCategoryId"]=story["selected_category_id"]!.DeepClone(),["sceneId"]=content.SceneId,["storyId"]=content.NarrativeId,["version"]=manifest["version"]!.DeepClone(),["title"]=manifest["title"]!.DeepClone(),["chapterStatus"]=story["chapter_status"]!.DeepClone(),["progressRevision"]=story["progress_revision"]!.DeepClone(),["currentNode"]=node};
        foreach(var key in new[]{"backgroundAsset","audioAsset","audioCues","suggestions"})result[key]=manifest[key]?.DeepClone();
        result["assets"]=new JsonArray(manifest["assets"]!.AsArray().Select(a=>(JsonNode)new JsonObject{["id"]=a!["id"]!.DeepClone(),["url"]="/story-content/assets/"+a.Text("sha256"),["sha256"]=a["sha256"]!.DeepClone(),["mimeType"]=a["mimeType"]!.DeepClone(),["byteLength"]=a["byteLength"]!.DeepClone()}).ToArray());
        var active=completed?[]:Records(rows,"event_instance").Where(i=>i.Text("status")=="active").ToArray();var objects=new JsonArray();var events=new JsonArray();var allowed=new Dictionary<string,string>(StringComparer.Ordinal);
        foreach(var instance in active){
            var binding=content.Bindings.Single(b=>b.Key==instance.Text("binding_id"));var definition=Definition(content.EventDefinitions[binding.Key]);var state=State(instance);var answers=state["answers"]!.AsObject();
            var projection=new JsonObject{["bindingId"]=binding.Key,["eventInstanceId"]=instance["event_instance_id"]!.DeepClone(),["eventSeq"]=instance["event_seq"]?.DeepClone(),["main"]=binding.NarrativeRole=="main",["revision"]=instance["revision"]!.DeepClone(),["status"]="active",["definition"]=definition.DeepClone(),["myChoice"]=answers[u.AccountId]?.DeepClone(),["partnerHasSubmitted"]=answers.Any(a=>a.Key!=u.AccountId),["presentationEffects"]=binding.PresentationEffects?.DeepClone()};events.Add(projection);
            if(definition.Text("moduleType")=="inspect-object"){objects.Add(definition.DeepClone());allowed.TryAdd(binding.EventId,definition.Text("id"));}
            if(definition.Text("moduleType")=="cooperative-choice"&&binding.Scope=="narrative"&&node.Maybe("interactionId")==binding.BindingId)result["interaction"]=projection.DeepClone();
        }
        result["objects"]=objects;result["events"]=events;
        if(result["interaction"] is null)node.Remove("interactionId");
        node["objects"]=new JsonArray(objects.Select(o=>JsonValue.Create(o!.Text("id"))).ToArray());
        // 靜態座標不是資格；未啟動的 hidden／已封存事件連名稱都不送到 Client。
        if(manifest["scenePresentation"] is JsonObject presentation){var safe=presentation.DeepClone().AsObject();var hotspots=new JsonArray();foreach(var h in safe["hotspots"]!.AsArray())if(allowed.TryGetValue(h!.Text("definitionId"),out var definitionId)){var visible=h!.DeepClone();visible["definitionId"]=definitionId;hotspots.Add(visible);}safe["hotspots"]=hotspots;result["scenePresentation"]=safe;
            if(node["presentation"] is JsonObject p)p["hotspotIds"]=new JsonArray(p["hotspotIds"]!.AsArray().Where(id=>hotspots.Any(h=>h!.Text("id")==id!.GetValue<string>())).Select(id=>id!.DeepClone()).ToArray());
        }
        var consents=Records(rows,"consent").Select(c=>new{Actor=c.Text("actor_account_id"),Agree=JsonNode.Parse(c.Text("payload_json"))!["agree"]!.GetValue<bool>()}).ToArray();
        result["myAgreedNext"]=consents.Any(c=>c.Actor==u.AccountId&&c.Agree);result["partnerAgreedNext"]=consents.Any(c=>c.Actor!=u.AccountId&&c.Agree);
        var votes=Records(rows,"vote").Select(v=>JsonNode.Parse(v.Text("payload_json"))!).ToArray();result["selectionReason"]=votes.Length==2?(votes.Select(v=>v.Maybe("categoryId")).Distinct().Count()==1?"雙方選擇了相同主題":"雙方選擇不同，採原邀請方的主題"):null;
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
            StoryDialogueService.Only(input,"text","choiceId");if((input["text"] is null)==(input["choiceId"] is null))throw new DomainException("INVALID_STORY_REQUEST");var text=input["text"]?.GetValue<string>();
            if(text is null){var story=Record(rows,"story")??throw new DomainException("STORY_SELECTION_PENDING",409);var content=await Content(u,roundId,story,ct);text=content.Manifest["suggestions"]!.AsArray().SingleOrDefault(s=>s!.Text("id")==Required(input,"choiceId"))?.Text("text")??throw new DomainException("INVALID_STORY_REQUEST");}
            p["text"]=StoryMessagePolicy.Validate(text);command="story.message.send";
        }else if(type is "story.choice.submit" or "interaction.submit" or "story.event.submit"){
            var eventCommand=type=="story.event.submit";StoryDialogueService.Only(input,eventCommand?["storySessionId","bindingId","actionId","expectedRevision"]:["storySessionId","episodeSeq","nodeId","expectedRevision","choiceId","definitionId"]);
            var sessionId=Required(input,"storySessionId");StoryDialogueService.Id(sessionId);var request=JsonSerializer.Serialize(new{type,payload=input.OrderBy(p=>p.Key,StringComparer.Ordinal).ToDictionary(p=>p.Key,p=>p.Value)},Json);
            var lookup=Auth(u,roundId);lookup["clientRequestId"]=requestId;var receipt=await Rows("story.receipt",lookup,ct);if(receipt.Count>0){if(receipt[0]!.Maybe("request_payload")!=request)throw new DomainException("EVENT_STATE_CONFLICT",409);return new(){["clientRequestId"]=requestId,["eventSeq"]=receipt[0]!["sequence"]!.DeepClone()};}
            var story=Record(rows,"story")??throw new DomainException("STORY_SELECTION_PENDING",409);
            if(story.Text("story_session_id")!=sessionId||story.Text("chapter_status")!="playing"||story.Number("progress_revision")!=input["expectedRevision"]?.GetValue<long>()||!eventCommand&&(story.Number("episode_seq")!=Episode(input,"episodeSeq")||story.Text("current_node_id")!=Required(input,"nodeId")))throw new DomainException("EVENT_STATE_CONFLICT",409);
            var content=await Content(u,roundId,story,ct);var node=StoryGraphPolicy.Node(content.Manifest,story.Text("current_node_id"));var next=node.Text("id");JsonObject? instanceUpdate=null;
            var choiceId=Required(input,eventCommand?"actionId":"choiceId");var body=new JsonObject();string? completedBinding=null;
            if(type=="story.choice.submit"){if(input["definitionId"] is not null)throw new DomainException("INVALID_STORY_REQUEST");next=StoryGraphPolicy.Choice(node,choiceId);body["choiceId"]=choiceId;}
            else{
                var aliases=eventCommand?[]:content.Bindings.Where(b=>(b.BindingId==Required(input,"definitionId")||b.Key==Required(input,"definitionId"))&&Records(rows,"event_instance").Any(i=>i.Text("binding_id")==b.Key&&i.Text("status")=="active")).ToArray();
                var key=eventCommand?Required(input,"bindingId"):aliases.Length==1?aliases[0].Key:throw new DomainException("INVALID_STORY_REQUEST");
                var instance=Records(rows,"event_instance").SingleOrDefault(i=>i.Text("binding_id")==key&&i.Text("status")=="active")??throw new DomainException("EVENT_STATE_CONFLICT",409);
                var definition=content.EventDefinitions[key];var option=StoryGraphPolicy.Option(definition,choiceId);var cooperative=definition.Text("moduleType")=="cooperative-choice";var state=State(instance);var answers=state["answers"]!.AsObject();answers[u.AccountId]=choiceId;
                var round=Record(rows,"round")!;if(answers.Any(a=>a.Key!=round.Text("account_low_id")&&a.Key!=round.Text("account_high_id")))throw new DomainException("EVENT_STATE_CONFLICT",409);
                var complete=!cooperative||answers.Count==2;var same=answers.Select(a=>a.Value!.GetValue<string>()).Distinct().Count()==1;
                if(complete){state["result"]=cooperative?same?"same":"different":choiceId;completedBinding=key;if(cooperative&&node.Maybe("interactionId")==definition.Text("id"))next=definition.Text(same?"sameNext":"differentNext");}
                instanceUpdate=new(){["instanceId"]=instance["event_instance_id"]!.DeepClone(),["bindingId"]=key,["eventVersion"]=instance["event_version"]!.DeepClone(),["expectedRevision"]=instance["revision"]!.DeepClone(),["status"]=complete?"completed":"active",["stateJson"]=state.ToJsonString()};
                body["bindingId"]=key;body["definitionId"]=definition["id"]!.DeepClone();body["result"]=cooperative?complete?"resolved":"pending_one":option.Maybe("result");
            }
            var ending=StoryGraphPolicy.Node(content.Manifest,next)["ending"]?.GetValue<bool>()==true;
            if(ending&&content.Bindings.Any(b=>b.RequiredForEnding&&b.Key!=completedBinding&&!Records(rows,"event_instance").Any(i=>i.Text("binding_id")==b.Key&&i.Text("status")=="completed")))throw new DomainException("EVENT_STATE_CONFLICT",409);
            body["nodeId"]=next;body["chapterStatus"]=ending?"completed":"playing";
            p["nodeEventId"]=EntityId.New();p["completionEventId"]=EntityId.New();p["storySessionId"]=sessionId;p["episodeSeq"]=story["episode_seq"]!.DeepClone();p["expectedRevision"]=story["progress_revision"]!.DeepClone();p["nodeId"]=node.Text("id");p["nextNodeId"]=next;p["completed"]=ending;p["kind"]=type=="story.choice.submit"?"story.choice.committed":"interaction.updated";p["payload"]=body.ToJsonString();p["requestPayload"]=request;p["instance"]=instanceUpdate;command="story.framework.action.commit";
        }else throw new DomainException("INVALID_STORY_REQUEST");
        await limiter.ConsumeAsync("story_mutation.v1","account",u.AccountId,ct);var committed=(await Rows(command,p,ct)).LastOrDefault()??throw new DomainException("EVENT_STATE_CONFLICT",409);
        try{await notifier.NotifyAsync(roundId,false,ct);}catch(Exception e)when(e is not OperationCanceledException){}
        return new(){["clientRequestId"]=requestId,["eventSeq"]=committed["sequence"]!.DeepClone()};
    }
}
