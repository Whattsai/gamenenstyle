using System.Text.Json.Nodes;
using DatingHigh.Domain;
namespace DatingHigh.Application;
/// <summary>公開原創書籍只隨本人可見且同Area的實體物件投影；不傳私人選書／共鳴條件。</summary>
public static class SceneBookProjection
{
    public static JsonArray Project(SceneTrackContent content,TrackProgress me,JsonArray visibleWorld)
    {
        var ids=visibleWorld.Where(o=>o!.Maybe("areaId")==me.AreaId).Select(o=>o!.Text("id")).ToHashSet(StringComparer.Ordinal);
        return new JsonArray((content.Scene["books"]?.AsArray()??[]).SelectMany(book=>{
            var definition=book!;
            return new[]{definition.Text("objectId")}.Concat((definition["copies"]?.AsArray()??[]).Select(copy=>copy!.GetValue<string>())).Where(ids.Contains).Select(objectId=>{
                var safe=new JsonObject();foreach(var key in new[]{"id","title","category","summary","pages"})safe[key]=definition[key]?.DeepClone();safe["objectId"]=objectId;return (JsonNode)safe;
            });
        }).ToArray());
    }
}
