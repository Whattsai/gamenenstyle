using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Application;

/// <summary>只投影本人目前視角及已提交演出，絕不直接傳遞整份舞台或角色私人事實。</summary>
public static class SceneEventStageProjection
{
    public static JsonObject? Project(SceneTrackContent content,TrackProgress me,JsonNode currentNode,JsonArray visibleWorld,JsonArray committedSteps,TrackState? state=null)
    {
        if(content.Scene["stage"] is not JsonObject stage)return null;
        var shots=stage["shots"]!.AsArray().Select(s=>s!).ToArray();var visuals=stage["areaVisuals"]!.AsArray().Select(s=>s!).ToArray();
        var area=visuals.Single(v=>v!.Text("areaId")==me.AreaId)!;
        var requested=currentNode["presentation"]?.Maybe("shotId");
        var current=shots.FirstOrDefault(s=>s!.Maybe("id")==requested&&s.Text("areaId")==me.AreaId)?.Text("id")??area.Text("defaultShotId");
        // 結局的最後一個權威 Shot 是持久畫面；重連不能回到結局前的區域鏡頭。
        var finalShot=state?.Completed==true?committedSteps.LastOrDefault(p=>p?.Maybe("type")=="shot")?.Text("shotId"):null;
        if(finalShot is not null)current=finalShot;
        var allowed=new HashSet<string>(StringComparer.Ordinal){current};
        foreach(var step in committedSteps.Where(p=>p?.Maybe("type")=="shot"))allowed.Add(step!.Text("shotId"));
        var selected=shots.Where(s=>allowed.Contains(s!.Text("id"))).Select(s=>s!.DeepClone()).ToArray();
        foreach(var shot in selected)shot["actors"]=new JsonArray(shot["actors"]!.AsArray()
            .Where(a=>a!["whenFlagEquals"] is not JsonNode flag||state?.World["flags"]?.Maybe(flag.Text("key"))==flag.Text("value"))
            .Where(a=>state is null||shot.Text("id")==finalShot||a!.Text("actorId") is not("inviter" or "acceptor")||state.Progress.Any(p=>p.Role==a!.Text("actorId")&&p.AreaId==shot.Text("areaId")))
            .Select(a=>{var safe=a!.DeepClone().AsObject();safe.Remove("whenFlagEquals");return (JsonNode)safe;}).ToArray());
        if(selected.Length!=allowed.Count)throw new DomainException("INVALID_STORY_CONTENT",503);
        var areaIds=selected.Select(s=>s.Text("areaId")).ToHashSet(StringComparer.Ordinal);
        var actorIds=selected.SelectMany(s=>s["actors"]!.AsArray().Select(a=>a!.Text("actorId"))).ToHashSet(StringComparer.Ordinal);
        var embedded=stage["embeddedInteractables"]!.AsArray().Select(item=>item!).Where(item=>areaIds.Contains(item.Text("areaId"))&&visibleWorld.Select(o=>o!).Any(o=>o.Text("id")==item.Text("objectId")&&o.Text("state")==item.Text("state")&&o.Text("areaId")==item.Text("areaId")&&o["holderRole"] is null));
        var weather=stage["weather"];var level=weather is null?null:weather["levels"]!.AsArray().FirstOrDefault(l=>l!.Maybe("value")==state?.World["flags"]?.Maybe(weather.Text("flagId")));
        return new(){
            ["version"]="scene-stage.v1",["currentShotId"]=current,
            ["shots"]=new JsonArray(selected.Select(s=>s.DeepClone()).ToArray()),
            ["areaVisuals"]=new JsonArray(visuals.Where(v=>areaIds.Contains(v!.Text("areaId"))).Select(v=>v!.DeepClone()).ToArray()),
            ["embeddedInteractables"]=new JsonArray(embedded.Select(v=>v!.DeepClone()).ToArray()),
            ["weather"]=level is null?null:new JsonObject{["intensity"]=level["intensity"]!.DeepClone()},
            ["npcs"]=new JsonArray(content.Scene["npcs"]!.AsArray().Where(n=>actorIds.Contains(n!.Text("id"))).Select(n=>(JsonNode)new JsonObject{["id"]=n!["id"]!.DeepClone(),["label"]=n["label"]?.DeepClone(),["appearance"]=n["appearance"]?.DeepClone(),["hitMasks"]=n["hitMasks"]?.DeepClone()}).ToArray())
        };
    }
}
