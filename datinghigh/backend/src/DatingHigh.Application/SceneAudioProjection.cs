using System.Text.Json.Nodes;
using DatingHigh.Domain;
namespace DatingHigh.Application;
/// <summary>聲音混合只來自已發布的目前鏡位Area，不推論私人情緒或未提交意願。</summary>
public static class SceneAudioProjection
{
    public static JsonObject? Mix(SceneTrackContent content,TrackProgress me,JsonObject? stage)
    {
        var area=stage is null?me.AreaId:stage["shots"]!.AsArray().Single(shot=>shot!.Text("id")==stage.Text("currentShotId"))!.Text("areaId");
        var mix=content.Scene["areas"]!.AsArray().Single(a=>a!.Text("id")==area)!["audioMix"];
        return mix is null?null:new JsonObject{["ambienceGain"]=mix["ambienceGain"]!.DeepClone(),["musicGain"]=mix["musicGain"]!.DeepClone()};
    }
}
