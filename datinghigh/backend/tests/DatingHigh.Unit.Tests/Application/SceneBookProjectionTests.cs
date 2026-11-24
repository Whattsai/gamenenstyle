using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
namespace DatingHigh.Unit.Tests.Application;
public sealed class SceneBookProjectionTests
{
    [Fact]
    public void PublicCopyOnTheTable_UsesTheOriginalPages_AndOnlyItsVisibleObjectId()
    {
        var scene=JsonNode.Parse("""{"books":[{"id":"original","objectId":"shelf-book","copies":["table-book"],"title":"原創","category":"人生","summary":"摘要","pages":["一","二"]}]}""")!.AsObject();
        var result=SceneBookProjection.Project(new(scene,new(),[]),new("i","inviter","i01","window",1),JsonNode.Parse("""[{"id":"table-book","areaId":"window"},{"id":"shelf-book","areaId":"shelves"}]""")!.AsArray());
        Assert.Single(result);Assert.Equal("table-book",result[0]!.Text("objectId"));Assert.Equal(2,result[0]!["pages"]!.AsArray().Count);Assert.Null(result[0]!["copies"]);
    }
    [Fact]
    public void Books_OnlyVisibleCurrentAreaObjects_WhitelistOriginalPagesWithoutPrivateFacts()
    {
        var scene=JsonNode.Parse("""{"books":[{"id":"public-book","objectId":"public","title":"雨後","category":"愛情","summary":"原創摘要","pages":["第一頁","第二頁"],"privateResonance":"secret"},{"id":"private-book","objectId":"private","title":"私有","category":"成長","summary":"不應投影","pages":["secret"]}]}""")!.AsObject();
        var content=new SceneTrackContent(scene,new(),[]);var me=new TrackProgress("i","inviter","i01","shelves",1);
        var world=JsonNode.Parse("""[{"id":"public","areaId":"shelves"},{"id":"elsewhere","areaId":"corner"}]""")!.AsArray();
        var result=SceneBookProjection.Project(content,me,world);
        Assert.Single(result);Assert.Equal("第一頁",result[0]!["pages"]![0]!.GetValue<string>());Assert.DoesNotContain("secret",result.ToJsonString());
        Assert.Empty(SceneBookProjection.Project(content,me with{AreaId="corner"},world));
    }
}
