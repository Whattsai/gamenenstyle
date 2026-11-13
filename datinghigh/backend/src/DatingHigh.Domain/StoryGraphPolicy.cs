using System.Text.Json.Nodes;

namespace DatingHigh.Domain;

/// <summary>資料驅動的無腳本 ADV 圖與共用互動定義；不引用資料庫或傳輸。</summary>
public static class StoryGraphPolicy
{
    public static string Text(JsonNode node,string key)=>node[key]?.GetValue<string>()??throw new DomainException("INVALID_STORY_CONTENT");
    public static JsonObject Node(JsonObject manifest,string id)=>manifest["nodes"]!.AsArray().SingleOrDefault(n=>n is not null&&Text(n,"id")==id)?.AsObject()??throw new DomainException("EVENT_STATE_CONFLICT",409);
    public static JsonObject Definition(JsonObject manifest,string id)=>manifest["interactions"]!.AsArray().SingleOrDefault(n=>n is not null&&Text(n,"id")==id)?.AsObject()??throw new DomainException("INVALID_STORY_REQUEST");
    public static JsonObject Option(JsonObject definition,string id)=>definition["options"]!.AsArray().SingleOrDefault(n=>n is not null&&Text(n,"id")==id)?.AsObject()??throw new DomainException("INVALID_STORY_REQUEST");
    public static string Choice(JsonObject node,string id)=>node["choices"]!.AsArray().SingleOrDefault(n=>n is not null&&Text(n,"id")==id)?["next"]?.GetValue<string>()??throw new DomainException("INVALID_STORY_REQUEST");
    public static void Validate(JsonObject manifest)
    {
        try{
            if(Text(manifest,"entry")!="entry"||Text(manifest,"locale")!="zh-TW"||string.IsNullOrWhiteSpace(Text(manifest,"time"))||string.IsNullOrWhiteSpace(Text(manifest,"place"))||string.IsNullOrWhiteSpace(Text(manifest,"event")))throw new DomainException("INVALID_STORY_CONTENT");
            var nodes=manifest["nodes"]!.AsArray().Select(n=>n!.AsObject()).ToDictionary(n=>Text(n,"id"),StringComparer.Ordinal);
            var definitions=manifest["interactions"]!.AsArray().Select(n=>n!.AsObject()).ToDictionary(n=>Text(n,"id"),StringComparer.Ordinal);
            if(nodes.Count is <4 or >2000||nodes.Values.Count(n=>n["ending"]?.GetValue<bool>()==true)<2)throw new DomainException("INVALID_STORY_CONTENT");
            foreach(var d in definitions.Values){
                if(Text(d,"moduleType") is not("inspect-object" or "cooperative-choice")||Text(d,"version").Length>32||d["options"]!.AsArray().Count<2)throw new DomainException("INVALID_STORY_CONTENT");
                _=d["options"]!.AsArray().Select(n=>Text(n!,"id")).ToDictionary(x=>x);
            }
            var visited=new HashSet<string>();var path=new HashSet<string>();
            void Visit(string id){
                if(path.Contains(id)||!nodes.TryGetValue(id,out var node))throw new DomainException("INVALID_STORY_CONTENT");
                if(visited.Contains(id))return;path.Add(id);
                var next=node["choices"]!.AsArray().Select(c=>Text(c!,"next")).ToList();
                if(node["interactionId"]?.GetValue<string>() is string refId){var d=definitions[refId];if(Text(d,"moduleType")!="cooperative-choice")throw new DomainException("INVALID_STORY_CONTENT");next.Add(Text(d,"sameNext"));next.Add(Text(d,"differentNext"));}
                if(node["objects"] is JsonArray objects)foreach(var obj in objects)if(Text(definitions[obj!.GetValue<string>()],"moduleType")!="inspect-object")throw new DomainException("INVALID_STORY_CONTENT");
                if(node["ending"]?.GetValue<bool>()!=true&&next.Count==0)throw new DomainException("INVALID_STORY_CONTENT");
                foreach(var line in node["lines"]!.AsArray())if(Text(line!,"speaker") is not("旁白" or "店員・NPC"))throw new DomainException("INVALID_STORY_CONTENT");
                foreach(var target in next)Visit(target);path.Remove(id);visited.Add(id);
            }
            Visit(Text(manifest,"entry"));if(visited.Count!=nodes.Count)throw new DomainException("INVALID_STORY_CONTENT");
            foreach(var a in manifest["assets"]!.AsArray())if(!System.Text.RegularExpressions.Regex.IsMatch(Text(a!,"key"),@"^story-content/assets/[0-9a-f]{64}$")||Text(a!,"sha256")!=Text(a!,"key").Split('/')[^1])throw new DomainException("INVALID_STORY_CONTENT");
            StoryPresentationPolicy.Validate(manifest);
        }catch(Exception e)when(e is InvalidOperationException or KeyNotFoundException or ArgumentException or NullReferenceException){throw new DomainException("INVALID_STORY_CONTENT");}
    }
}
