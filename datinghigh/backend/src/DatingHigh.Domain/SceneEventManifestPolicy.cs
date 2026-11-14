using System.Text.Json.Nodes;

namespace DatingHigh.Domain;

/// <summary>分層內容的純領域編譯結果；Manifest 只攜帶共用 renderer 所需的白名單。</summary>
public sealed record CompiledSceneEventContent(string NarrativeId,string SceneId,JsonObject Manifest,EventBinding[] Bindings,JsonArray Pins,IReadOnlyDictionary<string,JsonObject> EventDefinitions,string[] SceneCapabilities);

/// <summary>組合已由 adapter 驗 SHA 的不可變內容，不讀資料庫、R2 或人物套組。</summary>
public static class SceneEventManifestPolicy
{
    private static string Text(JsonNode node,string key)=>StoryGraphPolicy.Text(node,key);
    private static void Fail()=>throw new DomainException("INVALID_STORY_CONTENT");
    private static string[] Strings(JsonNode node,string key)=>node[key]!.AsArray().Select(v=>v!.GetValue<string>()).ToArray();
    private static JsonObject Project(JsonNode source,params string[] keys)
    {
        var result=new JsonObject();foreach(var key in keys)if(source[key] is JsonNode value)result[key]=value.DeepClone();return result;
    }

    public static CompiledSceneEventContent Compile(JsonObject content,string selectedCategoryCode)
    {
        try{
            var narrative=content["narrative"]!.AsObject();var scene=content["scene"]!.AsObject();var pool=content["pool"]!.AsObject();
            var narrativeId=Text(narrative,"narrativeId");var sceneId=Text(scene,"sceneId");var poolId=Text(pool,"poolId");
            if(!Strings(narrative,"eligibleCategoryCodes").Contains(selectedCategoryCode,StringComparer.Ordinal)
                ||Text(narrative["scene"]!,"id")!=sceneId||Text(narrative["scene"]!,"version")!=Text(scene,"version")
                ||Text(narrative["globalPool"]!,"id")!=poolId||Text(narrative["globalPool"]!,"version")!=Text(pool,"version"))Fail();
            var definitions=content["eventDefinitions"]!.AsArray().Select(d=>d!.AsObject()).ToDictionary(d=>Text(d["reference"]!,"eventId")+"@"+Text(d["reference"]!,"version"),StringComparer.Ordinal);
            var bindings=new List<EventBinding>();var interactions=new JsonArray();var eventDefinitions=new Dictionary<string,JsonObject>(StringComparer.Ordinal);
            foreach(var (source,list,scope,sourceId)in new[]{(narrative,"eventBindings","narrative",narrativeId),(scene,"sceneEventBindings","scene",sceneId),(pool,"eventBindings","global",poolId)}){
                foreach(var raw in source[list]!.AsArray()){
                    var b=raw!.AsObject();var reference=b["definition"]!;var eventId=Text(reference,"eventId");var eventVersion=Text(reference,"version");
                    if(Text(b,"scope")!=scope||Text(b,"sourceId")!=sourceId||!definitions.TryGetValue(eventId+"@"+eventVersion,out var definitionRecord)){Fail();continue;}
                    var pinned=definitionRecord["reference"]!;var definition=definitionRecord["manifest"]!;
                    if(Text(pinned,"key")!=Text(reference,"key")||Text(pinned,"sha256")!=Text(reference,"sha256")||Text(definition,"eventId")!=eventId||Text(definition,"version")!=eventVersion)Fail();
                    var binding=new EventBinding(scope,sourceId,Text(b,"bindingId"),eventId,eventVersion,Text(b,"repeatGroup"),Text(b,"narrativeRole"),Text(b,"visibility"),Text(b,"selectionMode"),b["probability"]!.GetValue<double>(),Text(b,"repeatScope"),Strings(b,"requiredCapabilities"),b["triggerConditions"]!.DeepClone().AsObject(),b["requiredForEnding"]!.GetValue<bool>(),b["presentationEffects"]?.DeepClone().AsObject());
                    EventRulePolicy.ValidateBinding(binding);if(binding.RequiredCapabilities.Any(c=>!Strings(scene,"sceneCapabilities").Contains(c,StringComparer.Ordinal)))Fail();
                    Effects(binding.PresentationEffects,scene);bindings.Add(binding);
                    var compiled=Project(definition,"version","moduleType","title","prompt");compiled["id"]=scope=="narrative"?binding.BindingId:binding.Key;compiled["bindingId"]=binding.Key;
                    compiled["options"]=new JsonArray(definition["options"]!.AsArray().Select(o=>(JsonNode)Project(o!,"id","label","result")).ToArray());
                    if(Text(definition,"moduleType")=="cooperative-choice"&&b["outcomeTransitions"] is JsonNode transitions){
                        compiled["sameNext"]=Text(transitions,"same");compiled["differentNext"]=Text(transitions,"different");
                    }
                    eventDefinitions.Add(binding.Key,compiled);if(scope=="narrative")interactions.Add(compiled.DeepClone());
                }
            }
            if(bindings.Count>256||bindings.Select(b=>b.Key).Distinct(StringComparer.Ordinal).Count()!=bindings.Count)Fail();
            foreach(var node in narrative["nodes"]!.AsArray())if(node!["interactionId"] is JsonNode gateId&&node["choices"]!.AsArray().Count==0){
                var gate=bindings.SingleOrDefault(b=>b.Scope=="narrative"&&b.BindingId==gateId.GetValue<string>());
                if(gate is null||gate.SelectionMode=="weighted_random"&&gate.Probability<1)Fail();
            }
            // 舊節點／場景熱區以 Event 穩定 ID 指向物件；Graph adapter 的別名不產生第二份 Binding。
            var objectIds=narrative["nodes"]!.AsArray().SelectMany(n=>n!["objects"]!.AsArray().Select(o=>o!.GetValue<string>())).Concat(scene["scenePresentation"]?["hotspots"]?.AsArray().Select(h=>Text(h!,"definitionId"))??[]).Distinct(StringComparer.Ordinal);
            foreach(var objectId in objectIds)if(!interactions.Any(d=>Text(d!,"id")==objectId)){
                var binding=bindings.FirstOrDefault(b=>b.EventId==objectId&&Text(eventDefinitions[b.Key],"moduleType")=="inspect-object");if(binding is null){Fail();continue;}
                var alias=eventDefinitions[binding.Key].DeepClone();alias["id"]=objectId;interactions.Add(alias);
            }
            var manifest=Project(scene,"time","place","event","locale","backgroundAsset","audioAsset","scenePresentation","audioCues");
            manifest["storyId"]=narrativeId;manifest["version"]=Text(narrative,"version");manifest["title"]=Text(narrative,"title");manifest["summary"]=Text(narrative,"summary");manifest["entry"]=Text(narrative,"entry");
            manifest["assets"]=new JsonArray(scene["assets"]!.AsArray().Select(a=>(JsonNode)Project(a!,"id","key","sha256","mimeType","byteLength")).ToArray());
            manifest["nodes"]=new JsonArray(narrative["nodes"]!.AsArray().Select(n=>{
                var result=Project(n!,"id","title","visual","objects","interactionId","ending");
                result["lines"]=new JsonArray(n!["lines"]!.AsArray().Select(l=>(JsonNode)Project(l!,"speaker","text")).ToArray());
                result["choices"]=new JsonArray(n["choices"]!.AsArray().Select(c=>(JsonNode)Project(c!,"id","label","next")).ToArray());
                if(n["presentation"] is JsonNode presentation)result["presentation"]=Project(presentation,"cameraId","expression","hotspotIds");
                return (JsonNode)result;
            }).ToArray());
            manifest["suggestions"]=new JsonArray(narrative["suggestions"]!.AsArray().Select(s=>(JsonNode)Project(s!,"id","label","text")).ToArray());manifest["interactions"]=interactions;
            StoryGraphPolicy.Validate(manifest);
            return new(narrativeId,sceneId,manifest,bindings.ToArray(),content["pins"]!.DeepClone().AsArray(),eventDefinitions,Strings(scene,"sceneCapabilities"));
        }catch(Exception error)when(error is InvalidOperationException or KeyNotFoundException or ArgumentException or NullReferenceException){throw new DomainException("INVALID_STORY_CONTENT");}
    }

    private static void Effects(JsonObject? effect,JsonObject scene)
    {
        if(effect is null)return;
        if(effect.Any(p=>p.Key is not("cameraId" or "expressionId" or "audioCueId" or "hotspotVisibility")))Fail();
        var presentation=scene["scenePresentation"];
        if(effect["cameraId"] is JsonNode camera&&(presentation is null||!presentation["cameras"]!.AsArray().Any(c=>Text(c!,"id")==camera.GetValue<string>())))Fail();
        if(effect["expressionId"] is JsonNode expression&&expression.GetValue<string>() is not("neutral" or "smile" or "surprised" or "thoughtful" or "concerned"))Fail();
        if(effect["audioCueId"] is JsonNode audio&&(scene["audioCues"] is not JsonObject cues||!cues.ContainsKey(audio.GetValue<string>())))Fail();
        if(effect["hotspotVisibility"] is JsonObject hotspots)foreach(var pair in hotspots)if(pair.Value is null||!pair.Value.AsValue().TryGetValue<bool>(out _)||presentation is null||!presentation["hotspots"]!.AsArray().Any(h=>Text(h!,"id")==pair.Key))Fail();
    }
}
