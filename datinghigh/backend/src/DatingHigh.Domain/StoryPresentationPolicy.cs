using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace DatingHigh.Domain;

/// <summary>版本化原生合成參數；不允許腳本、任意 URL、姿勢或真人情緒推論。</summary>
public static class StoryPresentationPolicy
{
    private static void Fail()=>throw new DomainException("INVALID_STORY_CONTENT");
    private static string Text(JsonNode n,string key)=>StoryGraphPolicy.Text(n,key);
    private static void Only(JsonNode? n,params string[] keys){if(n is not JsonObject o||o.Count!=keys.Length||o.Any(p=>!keys.Contains(p.Key,StringComparer.Ordinal)))Fail();}
    private static double Number(JsonNode n,string key,double min,double max){var value=n[key]!.GetValue<double>();if(!double.IsFinite(value)||value<min||value>max)Fail();return value;}
    private static void LocalId(JsonNode n){if(!Regex.IsMatch(Text(n,"id"),"^[a-z][a-z0-9-]{0,63}$"))Fail();}
    private static void Color(JsonNode n,string key){if(!Regex.IsMatch(Text(n,key),"^#[0-9a-fA-F]{6}$"))Fail();}
    private static JsonArray List(JsonNode n,string key,int max){var list=n[key]!.AsArray();if(list.Count>max||list.Select(v=>Text(v!,"id")).Distinct(StringComparer.Ordinal).Count()!=list.Count)Fail();return list;}
    public static void Validate(JsonObject story)
    {
        if(story["audioCues"] is JsonNode cues){Only(cues,"pageTurn","transition");foreach(var key in new[]{"pageTurn","transition"})if(!story["assets"]!.AsArray().Any(a=>Text(a!,"id")==Text(cues,key)&&Text(a!,"mimeType")=="audio/wav"))Fail();}
        var nodes=story["nodes"]!.AsArray();var p=story["scenePresentation"];
        if(p is null){if(nodes.Any(n=>n!["presentation"] is not null))Fail();return;}
        Only(p,p["foregroundAsset"] is null?["version","backgroundAsset","cameras","hotspots","foreground"]:["version","backgroundAsset","foregroundAsset","cameras","hotspots","foreground"]);
        if(Text(p,"version")!="2.5d.v1"||!story["assets"]!.AsArray().Any(a=>Text(a!,"id")==Text(p,"backgroundAsset")&&Text(a!,"mimeType").StartsWith("image/",StringComparison.Ordinal)))Fail();
        if(p["foregroundAsset"] is not null&&!story["assets"]!.AsArray().Any(a=>Text(a!,"id")==Text(p,"foregroundAsset")&&Text(a!,"mimeType").StartsWith("image/",StringComparison.Ordinal)))Fail();
        var cameras=List(p,"cameras",12);var hotspots=List(p,"hotspots",24);var foreground=List(p,"foreground",24);if(cameras.Count==0)Fail();
        foreach(var c in cameras){
            Only(c,"id","scale","focus","portrait","foreground","tint","tintOpacity");LocalId(c!);Number(c!,"scale",1,2);Color(c!,"tint");Number(c!,"tintOpacity",0,.35);_=c!["foreground"]!.GetValue<bool>();
            var focus=c["focus"]!;Only(focus,"x","y");Number(focus,"x",0,1);Number(focus,"y",0,1);
            var portrait=c["portrait"]!;Only(portrait,"x","headY","height");Number(portrait,"x",.3,.7);Number(portrait,"headY",.04,.2);Number(portrait,"height",.7,2.2);
        }
        foreach(var h in hotspots){
            Only(h,"id","definitionId","label","x","y");LocalId(h!);Number(h!,"x",0,1);Number(h!,"y",0,1);
            if(Text(h!,"label").Length is <1 or >60||!story["interactions"]!.AsArray().Any(d=>Text(d!,"id")==Text(h!,"definitionId")&&Text(d!,"moduleType")=="inspect-object"))Fail();
        }
        foreach(var f in foreground){
            Only(f,"id","x","y","width","height","color");LocalId(f!);Color(f!,"color");var x=Number(f!,"x",0,1);var y=Number(f!,"y",0,1);var w=Number(f!,"width",double.Epsilon,1);var h=Number(f!,"height",double.Epsilon,1);if(x+w>1.001||y+h>1.001)Fail();
        }
        foreach(var n in nodes){
            var v=n!["presentation"]!;Only(v,"cameraId","expression","hotspotIds");
            if(!cameras.Any(c=>Text(c!,"id")==Text(v,"cameraId"))||Text(v,"expression") is not("neutral" or "smile" or "surprised" or "thoughtful" or "concerned"))Fail();
            var ids=v["hotspotIds"]!.AsArray().Select(h=>h!.GetValue<string>()).ToArray();if(ids.Distinct(StringComparer.Ordinal).Count()!=ids.Length||ids.Any(id=>!hotspots.Any(h=>Text(h!,"id")==id&&n["objects"]!.AsArray().Any(o=>o!.GetValue<string>()==Text(h!,"definitionId")))))Fail();
        }
    }
}
