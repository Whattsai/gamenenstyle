using System.Text.Json.Nodes;
using DatingHigh.Domain;
namespace DatingHigh.Unit.Tests;
internal static class SceneTrackTestContent
{
    public static JsonObject Source(){var root=new DirectoryInfo(AppContext.BaseDirectory);while(root is not null&&!File.Exists(Path.Combine(root.FullName,"contracts","rain-bookshop-last-order.json")))root=root.Parent;return JsonNode.Parse(File.ReadAllText(Path.Combine(root!.FullName,"contracts","rain-bookshop-last-order.json")))!.AsObject();}
    public static SceneTrackContent Content()=>SceneEventTrackPolicy.Compile(Source(),"romance");
    public static TrackState Initial(SceneTrackContent c)=>SceneEventTrackPolicy.Initial(c,"019a281e-0000-7000-8000-000000000001","019a281e-0000-7000-8000-000000000002");
}
