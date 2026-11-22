using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class SceneEventStageProjectionTests
{
    [Fact]
    public void OnlyCurrentAndCommittedShotsAndVisibleWorldObjectsAreProjected()
    {
        var scene=JsonNode.Parse("""
        {"stage":{"version":"scene-stage.v1","areaVisuals":[{"areaId":"shelves","defaultShotId":"shelves","backgroundAsset":"shelves-bg","layers":[]},{"areaId":"corner","defaultShotId":"corner","backgroundAsset":"corner-bg","layers":[]}],"shots":[{"id":"shelves","areaId":"shelves","cameraId":"wide","actors":[],"audioCueIds":[]},{"id":"corner","areaId":"corner","cameraId":"close","actors":[],"audioCueIds":[]},{"id":"private-tear","areaId":"corner","cameraId":"close","actors":[],"audioCueIds":[]}],"embeddedInteractables":[{"id":"public","objectId":"book","areaId":"shelves","state":"on-shelf"},{"id":"private","objectId":"private-book","areaId":"shelves","state":"on-shelf"}]},"npcs":[]}
        """)!.AsObject();
        var content=new SceneTrackContent(scene,new(),[]);
        var world=new JsonArray(new JsonObject{["id"]="book",["areaId"]="shelves",["state"]="on-shelf",["holderRole"]=null});
        var me=new TrackProgress("i","inviter","i01","shelves",1);
        var node=JsonNode.Parse("""{"presentation":{"shotId":"private-tear"}}""")!;
        var snapshot=SceneEventStageProjection.Project(content,me,node,world,[]);
        Assert.NotNull(snapshot);Assert.Equal("shelves",snapshot.Text("currentShotId"));
        Assert.Single(snapshot["shots"]!.AsArray());Assert.Single(snapshot["areaVisuals"]!.AsArray());Assert.Single(snapshot["embeddedInteractables"]!.AsArray());
        Assert.DoesNotContain("private",snapshot.ToJsonString());Assert.DoesNotContain("corner-bg",snapshot.ToJsonString());
        var committed=SceneEventStageProjection.Project(content,me,node,world,JsonNode.Parse("""[{"type":"shot","shotId":"corner","durationMs":200}]""")!.AsArray());
        Assert.Equal(2,committed!["shots"]!.AsArray().Count);Assert.DoesNotContain("private-tear",committed.ToJsonString());
    }
}
