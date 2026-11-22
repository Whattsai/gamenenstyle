using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace DatingHigh.Domain;

/// <summary>雙人主線的 immutable 內容；不包含私人角色圖或執行狀態。</summary>
public sealed record SceneTrackContent(JsonObject Scene,JsonObject Narrative,TrackBindingDefinition[] Bindings)
{
    public JsonObject Node(string role,string id)=>Narrative["tracks"]![role]!["nodes"]!.AsArray().Single(n=>n!["id"]!.GetValue<string>()==id)!.AsObject();
}
/// <summary>具來源與角色範圍的同一事件定義。</summary>
public sealed record TrackBindingDefinition(string Key,string TrackScope,string ModuleType,JsonObject Raw)
{
    public bool ChangesWorld=>(Raw["startEffects"]?.AsArray().Count??0)>0||Raw["completionEffects"]!.AsArray().Count>0||Raw["actions"]!.AsArray().Any(a=>a!["worldEffects"]!.AsArray().Count>0);
}
/// <summary>由原邀請紀錄決定角色的玩家進度。</summary>
public sealed record TrackProgress(string AccountId,string Role,string NodeId,string AreaId,long Revision);
/// <summary>唯一事件實例與真人各自提交的操作。</summary>
public sealed record TrackInstance(string BindingKey,string TrackScope,string Status,long Revision,JsonObject State);
/// <summary>同 Round 既有場次的事件去重事實，不跨配對共用。</summary>
public sealed record TrackOccurrence(string BindingKey,string TrackScope,string RepeatGroup,string Status);
/// <summary>單一場次的已提交快照；角色進度、共享世界及事件不能各自成為事實來源。</summary>
public sealed record TrackState(long SharedRevision,JsonObject World,TrackProgress[] Progress,IReadOnlyDictionary<string,TrackInstance> Instances,bool Completed=false,string[]? CompletedNarratives=null,TrackOccurrence[]? History=null);
/// <summary>Client 只提交本人操作及 CAS，不指定身分、下一節點或效果。</summary>
public sealed record TrackActionRequest(string BindingKey,string ActionId,JsonObject Params,long ExpectedTrackRevision,long? ExpectedSharedRevision,long? ExpectedEventRevision);
/// <summary>供 Application 同一次 D1 batch 提交的純規則結果。</summary>
public sealed record TrackTransition(TrackState State,TrackBindingDefinition Binding,TrackInstance Instance,TrackProgress[] ChangedProgress,bool SharedChanged,JsonArray PresentationSteps,string? EndingId);
/// <summary>只包含本人目前合法操作的安全投影來源。</summary>
public sealed record AvailableTrackAction(string BindingKey,string ActionId,string Label,JsonObject Params,string ModuleType,long? EventRevision,bool NeedsSharedRevision);

/// <summary>雙 Track、角色限定 DSL、共享物件與真人合作的純領域規則；無 I/O、計時器或 Client 權威。</summary>
public static class SceneEventTrackPolicy
{
    private static readonly string[] Roles=["inviter","acceptor"];
    private static string Text(JsonNode n,string key)=>n[key]!.GetValue<string>();
    private static void Invalid()=>throw new DomainException("INVALID_STORY_CONTENT");
    private static void Conflict()=>throw new DomainException("EVENT_STATE_CONFLICT",409);
    private static void Only(JsonObject o,params string[] keys){if(o.Any(p=>!keys.Contains(p.Key,StringComparer.Ordinal)))Invalid();}
    private static bool Has(JsonNode? array,string value)=>array?.AsArray().Any(v=>v!.GetValue<string>()==value)==true;
    private static JsonObject Clone(JsonObject o)=>o.DeepClone().AsObject();
    private static string BindingKey(JsonNode b)=>$"{Text(b,"scope")}:{Text(b,"sourceId")}:{Text(b,"bindingId")}";
    private static string Step(JsonNode a)=>a["stepId"]?.GetValue<string>()??Text(a,"actionId");

    public static SceneTrackContent Compile(JsonObject source,string categoryCode)
    {
        try{
            var scene=Clone(source["scene"]!.AsObject());var narrative=Clone(source["narrative"]!.AsObject());
            if(Text(scene,"schemaVersion")!="scene-event.v2"||Text(narrative,"schemaVersion")!="scene-event.v2"||!Has(narrative["eligibleCategoryCodes"],categoryCode)||!Has(scene["categoryCodes"],categoryCode))Invalid();
            var definitions=source["eventDefinitions"]!.AsArray().ToDictionary(d=>Text(d!["reference"]!,"key"),d=>d!,StringComparer.Ordinal);
            var bindings=new List<TrackBindingDefinition>();
            foreach(var (list,scope,owner)in new[]{(narrative["eventBindings"]!,"narrative",Text(narrative,"narrativeId")),(narrative["sharedEventBindings"]!,"narrative",Text(narrative,"narrativeId")),(scene["sceneEventBindings"]!,"scene",Text(scene,"sceneId")),(source["pool"]!["eventBindings"]!,"global",Text(source["pool"]!,"poolId"))})foreach(var item in list.AsArray()){
                var b=Clone(item!.AsObject());var reference=b["definition"]!;var d=definitions.GetValueOrDefault(Text(reference,"key"))??throw new DomainException("INVALID_STORY_CONTENT");if(Text(b,"scope")!=scope||Text(b,"sourceId")!=owner||!JsonNode.DeepEquals(reference,d["reference"]))Invalid();
                var module=Text(d!["manifest"]!,"moduleType");if(module is not("move-area" or "inspect-object" or "manipulate-object" or "talk-to-npc" or "cooperative-action" or "cooperative-choice"))Invalid();
                if(scope=="global"&&b["requiredCapabilities"]!.AsArray().Any(capability=>!Has(scene["sceneCapabilities"],capability!.GetValue<string>())))continue;
                if(Text(b,"trackScope") is not("inviter" or "acceptor" or "shared")||b["requiredForEnding"]!.GetValue<bool>()&&(Text(b,"narrativeRole")!="main"||b["probability"]!.GetValue<double>()<1||b["completionMode"]?.GetValue<string>()=="repeatable"))Invalid();
                foreach(var a in b["actions"]!.AsArray()){
                    if(!Roles.Contains(Text(a!,"role"))||Text(b,"trackScope")!="shared"&&Text(a!,"role")!=Text(b,"trackScope"))Invalid();
                    var expected=module switch{"move-area"=>new[]{"areaId"},"inspect-object"=>["objectId"],"manipulate-object"=>Text(a!,"actionId")=="place"?["objectId","targetSlotId"]:["objectId"],"talk-to-npc"=>["npcId","dialogueOptionId"],_=>["optionId"]};
                    var p=a!["params"]!.AsObject();if(p.Count!=expected.Length||p.Any(v=>!expected.Contains(v.Key)||v.Value is not JsonValue value||!value.TryGetValue<string>(out _)))Invalid();
                    if(!Has(d["manifest"]!["actions"],Text(a,"actionId")))Invalid();
                }
                bindings.Add(new(BindingKey(b),Text(b,"trackScope"),module,b));
            }
            if(bindings.Count>256||bindings.Select(b=>b.Key).Distinct(StringComparer.Ordinal).Count()!=bindings.Count)Invalid();
            var c=new SceneTrackContent(scene,narrative,bindings.ToArray());
            foreach(var r in Roles){var track=narrative["tracks"]![r]!;_=c.Node(r,Text(track,"entry"));var ids=track["nodes"]!.AsArray().Select(n=>Text(n!,"id")).ToArray();if(ids.Length is 0 or >256||ids.Distinct().Count()!=ids.Length)Invalid();foreach(var node in track["nodes"]!.AsArray())if(!scene["areas"]!.AsArray().Any(a=>Text(a!,"id")==Text(node!,"areaId")))Invalid();}
            foreach(var b in c.Bindings){ValidateCondition(c,b.Raw["triggerConditions"]!.AsObject());foreach(var a in b.Raw["actions"]!.AsArray()){ValidateCondition(c,a!["conditions"]!.AsObject());if(a["nextNode"] is JsonNode next)_=c.Node(Text(a,"role"),next.GetValue<string>());}}
            foreach(var ending in narrative["endings"]!.AsArray())ValidateCondition(c,ending!["conditions"]!.AsObject());
            if(narrative["safetyExit"] is JsonObject safety){
                Only(safety,"endingId","conditions");ValidateCondition(c,safety["conditions"]!.AsObject());
                var targets=narrative["endings"]!.AsArray().Where(e=>Text(e!,"id")==Text(safety,"endingId")).ToArray();
                if(targets.Length!=1||!JsonNode.DeepEquals(targets[0]!["conditions"],safety["conditions"]))Invalid();
            }
            return c;
        }catch(Exception e)when(e is InvalidOperationException or ArgumentException or KeyNotFoundException or NullReferenceException){throw new DomainException("INVALID_STORY_CONTENT");}
    }

    public static TrackState Initial(SceneTrackContent c,string inviterAccountId,string acceptorAccountId)
    {
        if(inviterAccountId==acceptorAccountId||!EntityId.IsValid(inviterAccountId)||!EntityId.IsValid(acceptorAccountId))throw new DomainException("INVALID_STORY_REQUEST");
        var objects=new JsonObject();foreach(var o in c.Scene["sceneObjects"]!.AsArray())objects[Text(o!,"id")]=Text(o!,"initialState");
        var flags=new JsonObject();foreach(var f in c.Scene["sharedFlags"]!.AsArray())flags[Text(f!,"id")]=Text(f!,"initialValue");
        return new(1,new(){["objects"]=objects,["flags"]=flags},Roles.Select(r=>{var node=c.Node(r,Text(c.Narrative["tracks"]![r]!,"entry"));return new TrackProgress(r=="inviter"?inviterAccountId:acceptorAccountId,r,Text(node,"id"),Text(node,"areaId"),1);}).ToArray(),new Dictionary<string,TrackInstance>(StringComparer.Ordinal));
    }

    public static void ValidateCondition(SceneTrackContent c,JsonObject condition)
    {
        var count=0;
        void Visit(JsonNode? n,int depth){
            if(n is not JsonObject o||o.Count!=1||++count>64||depth>8){Invalid();return;}var p=o.Single();
            if(p.Key is "all" or "any"){if(p.Value is not JsonArray a||a.Count is <1 or >32){Invalid();return;}foreach(var child in a)Visit(child,depth+1);return;}
            if(p.Key=="not"){Visit(p.Value,depth+1);return;}
            if(p.Key=="narrative_completed"){if(p.Value is not JsonValue v||!v.TryGetValue<string>(out var id)||!Regex.IsMatch(id,"^[a-z][a-z0-9-]{0,63}$"))Invalid();return;}
            if(p.Key=="shared_event_completed"){if(!c.Bindings.Any(b=>b.Key==p.Value!.GetValue<string>()&&b.TrackScope=="shared"))Invalid();return;}
            if(p.Key is not("track_node_entered" or "actor_area_is" or "track_event_completed" or "track_choice_committed" or "world_object_state" or "shared_flag_equals")||p.Value is not JsonObject){Invalid();return;}
            var arg=p.Value.AsObject();
            void Exact(params string[] fields){if(arg.Count!=fields.Length)Invalid();Only(arg,fields);}
            switch(p.Key){
                case "track_node_entered":Exact("role","nodeId");if(!Roles.Contains(Text(arg,"role")))Invalid();_=c.Node(Text(arg,"role"),Text(arg,"nodeId"));break;
                case "actor_area_is":Exact("role","areaId");if(!Roles.Contains(Text(arg,"role"))||!c.Scene["areas"]!.AsArray().Any(a=>Text(a!,"id")==Text(arg,"areaId")))Invalid();break;
                case "track_event_completed":Exact("role","bindingKey");if(!c.Bindings.Any(b=>b.Key==Text(arg,"bindingKey")&&b.TrackScope==Text(arg,"role")&&Roles.Contains(b.TrackScope)))Invalid();break;
                case "track_choice_committed":Exact("role","bindingKey","actionId","optionId");if(!c.Bindings.Any(b=>b.Key==Text(arg,"bindingKey")&&b.Raw["actions"]!.AsArray().Any(a=>Text(a!,"role")==Text(arg,"role")&&Text(a!,"actionId")==Text(arg,"actionId")&&a!["params"]?["optionId"]?.GetValue<string>()==Text(arg,"optionId"))))Invalid();break;
                case "world_object_state":Exact("objectId","state");if(!c.Scene["sceneObjects"]!.AsArray().Any(o=>Text(o!,"id")==Text(arg,"objectId")&&o!["states"]!.AsArray().Any(s=>Text(s!,"id")==Text(arg,"state"))))Invalid();break;
                case "shared_flag_equals":Exact("key","value");if(!c.Scene["sharedFlags"]!.AsArray().Any(f=>Text(f!,"id")==Text(arg,"key")&&Has(f!["values"],Text(arg,"value"))))Invalid();break;
                default:Invalid();break;
            }
        }
        Visit(condition,0);
    }

    public static bool Evaluate(SceneTrackContent c,TrackState s,JsonObject rule)
    {
        ValidateCondition(c,rule);
        bool Test(JsonNode n){var p=n.AsObject().Single();var a=p.Value!;
            return p.Key switch{
                "all"=>a.AsArray().All(n=>Test(n!)),"any"=>a.AsArray().Any(n=>Test(n!)),"not"=>!Test(a),
                "actor_area_is"=>s.Progress.Any(p=>p.Role==Text(a,"role")&&p.AreaId==Text(a,"areaId")),
                "track_node_entered"=>Entered(c,s,Text(a,"role"),Text(a,"nodeId")),
                "track_event_completed"=>s.Instances.TryGetValue(Text(a,"bindingKey"),out var i)&&i.TrackScope==Text(a,"role")&&i.Status=="completed",
                "shared_event_completed"=>s.Instances.TryGetValue(a.GetValue<string>(),out var i)&&i.TrackScope=="shared"&&i.Status=="completed",
                "track_choice_committed"=>s.Instances.TryGetValue(Text(a,"bindingKey"),out var i)&&i.State["submissions"]?[Text(a,"role")] is JsonObject submitted&&submitted.Any(p=>p.Value?["actionId"]?.GetValue<string>()==Text(a,"actionId")&&p.Value?["params"]?["optionId"]?.GetValue<string>()==Text(a,"optionId")),
                "world_object_state"=>s.World["objects"]?[Text(a,"objectId")]?.GetValue<string>()==Text(a,"state"),
                "shared_flag_equals"=>s.World["flags"]?[Text(a,"key")]?.GetValue<string>()==Text(a,"value"),
                "narrative_completed"=>(s.CompletedNarratives??[]).Contains(a.GetValue<string>(),StringComparer.Ordinal),_=>false
            };
        }return Test(rule);
    }
    private static bool Entered(SceneTrackContent c,TrackState s,string role,string nodeId)=>s.Progress.Any(p=>p.Role==role&&p.NodeId==nodeId)||Text(c.Narrative["tracks"]![role]!,"entry")==nodeId||s.Instances.Values.Any(i=>i.State["enteredNodeIndexes"]?[role] is JsonArray entered&&entered.Any(index=>Text(c.Narrative["tracks"]![role]!["nodes"]![index!.GetValue<int>()]!,"id")==nodeId)||i.State["submissions"]?[role] is JsonObject submissions&&submissions.Any(p=>p.Value?["nodeId"]?.GetValue<string>()==nodeId||p.Value?["nextNode"]?.GetValue<string>()==nodeId));
    private static JsonNode ObjectState(SceneTrackContent c,TrackState s,string objectId)
    {
        var obj=c.Scene["sceneObjects"]!.AsArray().SingleOrDefault(o=>Text(o!,"id")==objectId)??throw new DomainException("INVALID_STORY_REQUEST");
        return obj["states"]!.AsArray().SingleOrDefault(state=>Text(state!,"id")==s.World["objects"]?[objectId]?.GetValue<string>())??throw new DomainException("INVALID_STORY_CONTENT");
    }
    private static void Effects(SceneTrackContent c,TrackState s,JsonArray effects,string? role)
    {
        foreach(var e in effects){
            if(Text(e!,"type")=="object"){
                var id=Text(e!,"objectId");var obj=c.Scene["sceneObjects"]!.AsArray().SingleOrDefault(o=>Text(o!,"id")==id)??throw new DomainException("INVALID_STORY_CONTENT");
                if(!obj["transitions"]!.AsArray().Any(t=>Text(t!,"from")==Text(e!,"from")&&Text(t!,"to")==Text(e!,"to")&&Text(t!,"actionId")==Text(e!,"actionId")))Invalid();
                if(s.World["objects"]![id]?.GetValue<string>()!=Text(e!,"from"))Conflict();
                var old=ObjectState(c,s,id);if(role is not null&&old["holder"] is JsonNode holder&&holder.GetValue<string>()!=role)Conflict();
                s.World["objects"]![id]=Text(e!,"to");
            }else if(Text(e!,"type")=="flag"){
                var id=Text(e!,"flagId");if(!c.Scene["sharedFlags"]!.AsArray().Any(f=>Text(f!,"id")==id&&Has(f!["values"],Text(e!,"value"))))Invalid();s.World["flags"]![id]=Text(e!,"value");
            }else Invalid();
        }
    }

    private static bool ReservedForRequiredMain(SceneTrackContent c,TrackBindingDefinition binding)=>!binding.Raw["requiredForEnding"]!.GetValue<bool>()&&c.Bindings.Any(main=>main.TrackScope==binding.TrackScope&&main.Raw["requiredForEnding"]!.GetValue<bool>()&&Text(main.Raw,"repeatGroup")==Text(binding.Raw,"repeatGroup"));

    public static TrackInstance[] Activate(SceneTrackContent c,TrackState s,string actorAccountId,Func<double> draw)
    {
        var me=s.Progress.SingleOrDefault(p=>p.AccountId==actorAccountId)??throw new DomainException("RESOURCE_FORBIDDEN",403);
        if(s.Completed)return [];var decisions=new List<TrackInstance>();
        foreach(var b in c.Bindings.Where(b=>b.TrackScope==me.Role||b.TrackScope=="shared").OrderBy(b=>Text(b.Raw,"scope") switch{"narrative"=>0,"scene"=>1,_=>2}).ThenBy(b=>b.Key,StringComparer.Ordinal)){
            if(ReservedForRequiredMain(c,b)||Text(b.Raw,"selectionMode")!="weighted_random"||s.Instances.ContainsKey(b.Key)||!Evaluate(c,s,b.Raw["triggerConditions"]!.AsObject()))continue;
            bool SameGroup(string key)=>c.Bindings.Any(other=>other.Key==key&&other.TrackScope==b.TrackScope&&Text(other.Raw,"repeatGroup")==Text(b.Raw,"repeatGroup"));
            if(s.Instances.Values.Concat(decisions).Any(i=>SameGroup(i.BindingKey))||Text(b.Raw,"repeatScope")=="round"&&(s.History??[]).Any(i=>i.TrackScope==b.TrackScope&&i.RepeatGroup==Text(b.Raw,"repeatGroup")&&i.Status=="completed"))continue;
            var value=draw();if(!double.IsFinite(value)||value<0||value>=1)Invalid();
            decisions.Add(new(b.Key,b.TrackScope,value<b.Raw["probability"]!.GetValue<double>()?"active":"cancelled",1,new JsonObject{["submissions"]=new JsonObject()}));
        }return decisions.ToArray();
    }

    public static TrackTransition Apply(SceneTrackContent c,TrackState original,string actorAccountId,TrackActionRequest request)
    {
        var me=original.Progress.SingleOrDefault(p=>p.AccountId==actorAccountId)??throw new DomainException("RESOURCE_FORBIDDEN",403);
        if(original.Completed||me.Revision!=request.ExpectedTrackRevision)Conflict();
        var b=c.Bindings.SingleOrDefault(b=>b.Key==request.BindingKey)??throw new DomainException("INVALID_STORY_REQUEST");
        if(b.TrackScope!="shared"&&b.TrackScope!=me.Role)throw new DomainException("RESOURCE_FORBIDDEN",403);
        if(ReservedForRequiredMain(c,b))Conflict();
        var shared=b.TrackScope=="shared"||b.ChangesWorld;
        if(shared?request.ExpectedSharedRevision!=original.SharedRevision:request.ExpectedSharedRevision is not null)Conflict();
        original.Instances.TryGetValue(b.Key,out var previous);
        if(previous is null&&Text(b.Raw,"selectionMode")=="weighted_random")Conflict();
        if(previous?.Status is "completed" or "cancelled"||request.ExpectedEventRevision!=previous?.Revision)Conflict();
        if(previous is null&&(original.Instances.Values.Any(i=>i.TrackScope==b.TrackScope&&c.Bindings.Any(other=>other.Key==i.BindingKey&&Text(other.Raw,"repeatGroup")==Text(b.Raw,"repeatGroup")))||Text(b.Raw,"repeatScope")=="round"&&(original.History??[]).Any(i=>i.TrackScope==b.TrackScope&&i.RepeatGroup==Text(b.Raw,"repeatGroup")&&i.Status=="completed")))Conflict();
        if(previous is null&&!Evaluate(c,original,b.Raw["triggerConditions"]!.AsObject()))Conflict();
        var s=original with{World=Clone(original.World),Progress=[..original.Progress],Instances=new Dictionary<string,TrackInstance>(original.Instances,StringComparer.Ordinal)};
        var state=previous is null?new JsonObject{["submissions"]=new JsonObject()}:Clone(previous.State);
        var submissions=state["submissions"]!.AsObject();var mine=submissions[me.Role]?.AsObject()??new JsonObject();
        var firstSubmission=submissions.Count==0;
        if(firstSubmission)Effects(c,s,b.Raw["startEffects"]?.AsArray()??[],null);
        // Check committed eligibility before matching a private parameter whitelist.
        // Otherwise 400 versus 409 can reveal an unshared correct object/answer.
        var eligible=b.Raw["actions"]!.AsArray().Where(a=>Text(a!,"role")==me.Role&&Evaluate(c,s,a!["conditions"]!.AsObject())).ToArray();
        if(eligible.Length==0)Conflict();
        var action=eligible.SingleOrDefault(a=>Text(a!,"actionId")==request.ActionId&&JsonNode.DeepEquals(a!["params"],request.Params))??throw new DomainException("INVALID_STORY_REQUEST");
        if(b.Raw["completionMode"]?.GetValue<string>()!="repeatable"&&mine.ContainsKey(Step(action)))Conflict();
        var targetId=action["targetObjectId"]?.GetValue<string>()??request.Params["objectId"]?.GetValue<string>();
        if(targetId is not null){var target=c.Scene["sceneObjects"]!.AsArray().Single(o=>Text(o!,"id")==targetId)!;var visibility=target["visibility"]?.GetValue<string>()??"public";if(visibility!="public"&&visibility!=me.Role)throw new DomainException("RESOURCE_FORBIDDEN",403);var location=ObjectState(c,s,targetId);var holder=location["holder"]?.GetValue<string>();if(holder is not null?holder!=me.Role:Text(location,"areaId")!=me.AreaId)Conflict();}
        if(b.ModuleType=="move-area"){
            var target=Text(request.Params,"areaId");var area=c.Scene["areas"]!.AsArray().Single(a=>Text(a!,"id")==me.AreaId)!;
            if(!Has(area["adjacent"],target))Conflict();
            me=me with{AreaId=target};
        }else if(b.ModuleType is "inspect-object" or "manipulate-object"){
            var objectId=Text(request.Params,"objectId");var objectState=ObjectState(c,s,objectId);var holder=objectState["holder"]?.GetValue<string>();
            if(holder is not null?holder!=me.Role:Text(objectState,"areaId")!=me.AreaId)Conflict();
            if(b.ModuleType=="manipulate-object"){
                if(request.ActionId=="pick"&&holder is not null||request.ActionId=="place"&&holder!=me.Role)Conflict();
                if(request.ActionId=="place"&&!c.Scene["slots"]!.AsArray().Any(slot=>Text(slot!,"id")==Text(request.Params,"targetSlotId")&&Text(slot!,"areaId")==me.AreaId&&Has(slot!["acceptedObjects"],objectId)))Conflict();
            }
        }else if(b.ModuleType=="talk-to-npc"&&!c.Scene["npcs"]!.AsArray().Any(n=>Text(n!,"id")==Text(request.Params,"npcId")&&Text(n!,"areaId")==me.AreaId&&Has(n!["dialogueOptions"],Text(request.Params,"dialogueOptionId"))))Conflict();
        Effects(c,s,action["worldEffects"]!.AsArray(),me.Role);
        var next=action["nextNode"]?.GetValue<string>()??me.NodeId;_=c.Node(me.Role,next);
        var fact=new JsonObject{["actionId"]=request.ActionId,["params"]=request.Params.DeepClone(),["nodeId"]=me.NodeId,["nextNode"]=next};
        mine[Step(action)]=fact;if(submissions[me.Role] is null)submissions[me.Role]=mine;
        me=me with{NodeId=next,Revision=me.Revision+1};s.Progress[Array.FindIndex(s.Progress,p=>p.AccountId==actorAccountId)]=me;
        var complete=b.Raw["completionMode"]?.GetValue<string>()!="repeatable"&&b.Raw["requiredActions"]!.AsArray().All(r=>submissions[Text(r!,"role")]?[Step(r!)]?["actionId"]?.GetValue<string>()==Text(r!,"actionId"));
        var instance=new TrackInstance(b.Key,b.TrackScope,complete?"completed":"active",(previous?.Revision??0)+1,state);
        var instances=(Dictionary<string,TrackInstance>)s.Instances;instances[b.Key]=instance;
        if(complete){
            Effects(c,s,b.Raw["completionEffects"]!.AsArray(),null);
            foreach(var role in Roles)if(b.Raw["transitions"]![role=="inviter"?"inviterNextNode":"acceptorNextNode"] is JsonNode target){
                if(role!=me.Role&&(b.TrackScope!="shared"||!b.Raw["requiredActions"]!.AsArray().Any(a=>Text(a!,"role")==role)))Invalid();
                var index=Array.FindIndex(s.Progress,p=>p.Role==role);var p=s.Progress[index];_=c.Node(role,target.GetValue<string>());
                s.Progress[index]=p with{NodeId=target.GetValue<string>(),Revision=p.Revision+(role==me.Role?0:1)};
            }
        }
        RememberEntered(c,state,me.Role,fact["nodeId"]!.GetValue<string>(),next);
        foreach(var p in s.Progress.Where(p=>p!=original.Progress.Single(old=>old.Role==p.Role)))RememberEntered(c,state,p.Role,original.Progress.Single(old=>old.Role==p.Role).NodeId,p.NodeId);
        string? endingId=null;
        // 安全收尾優先於一般合作與最終意願；不為了等未完成的救書操作而留在危險區。
        var safety=c.Narrative["safetyExit"] as JsonObject;
        if(safety is not null&&Evaluate(c,s,safety["conditions"]!.AsObject()))endingId=Text(safety,"endingId");
        else if(c.Narrative["endingRequires"]!.AsArray().All(k=>s.Instances.TryGetValue(k!.GetValue<string>(),out var i)&&i.Status=="completed")){
            var endings=c.Narrative["endings"]!.AsArray().Where(e=>e!["id"]!.GetValue<string>()!=safety?["endingId"]?.GetValue<string>()&&Evaluate(c,s,e["conditions"]!.AsObject())).ToArray();if(endings.Length!=1)Invalid();endingId=Text(endings[0]!,"id");
        }
        if(endingId is not null){
            state["endingId"]=endingId;s=s with{Completed=true};shared=true;
            foreach(var (k,i)in instances.ToArray())if(i.Status=="active")instances[k]=i with{Status="cancelled",Revision=i.Revision+1};
        }
        s=s with{SharedRevision=original.SharedRevision+(shared?1:0)};
        var steps=new JsonArray();if(firstSubmission)foreach(var step in b.Raw["startPresentationSteps"]?.AsArray()??[])steps.Add(step!.DeepClone());foreach(var step in action["presentationSteps"]!.AsArray())steps.Add(step!.DeepClone());
        return new(s,b,instance,s.Progress.Where(p=>p!=original.Progress.Single(old=>old.Role==p.Role)).ToArray(),shared,steps,endingId);
    }

    public static AvailableTrackAction[] Available(SceneTrackContent c,TrackState s,string actorAccountId)
    {
        if(s.Completed)return [];
        var me=s.Progress.SingleOrDefault(p=>p.AccountId==actorAccountId)??throw new DomainException("RESOURCE_FORBIDDEN",403);var result=new List<AvailableTrackAction>();
        foreach(var b in c.Bindings.Where(b=>b.TrackScope=="shared"||b.TrackScope==me.Role))foreach(var a in b.Raw["actions"]!.AsArray().Where(a=>Text(a!,"role")==me.Role)){
            s.Instances.TryGetValue(b.Key,out var instance);var shared=b.TrackScope=="shared"||b.ChangesWorld;
            try{_=Apply(c,s,actorAccountId,new(b.Key,Text(a!,"actionId"),a!["params"]!.AsObject(),me.Revision,shared?s.SharedRevision:null,instance?.Revision));result.Add(new(b.Key,Text(a,"actionId"),Text(a,"label"),Clone(a["params"]!.AsObject()),b.ModuleType,instance?.Revision,shared));}
            catch(DomainException e)when(e.Code is "EVENT_STATE_CONFLICT" or "INVALID_STORY_REQUEST" or "RESOURCE_FORBIDDEN"){}
        }return result.ToArray();
    }
    // Immutable narrative node order bounds a role's complete visit history to 256 small indexes.
    private static void RememberEntered(SceneTrackContent c,JsonObject state,string role,params string[] ids)
    {
        var history=state["enteredNodeIndexes"]?.AsObject()??new JsonObject();if(state["enteredNodeIndexes"] is null)state["enteredNodeIndexes"]=history;
        var indexes=history[role]?.AsArray().Select(v=>v!.GetValue<int>()).ToHashSet()??[];var nodes=c.Narrative["tracks"]![role]!["nodes"]!.AsArray();
        foreach(var id in ids)indexes.Add(Array.FindIndex(nodes.ToArray(),n=>Text(n!,"id")==id));
        history[role]=new JsonArray(indexes.Order().Select(i=>(JsonNode)JsonValue.Create(i)!).ToArray());
    }
}
