using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class SceneEventStageProjectionTests
{
    [Fact]
    public void PublicActorVisibilityFlag_RemovesTheClerkAfterTheyLeave_WithoutPublishingThePredicate()
    {
        var scene=JsonNode.Parse("""{"stage":{"areaVisuals":[{"areaId":"counter","defaultShotId":"counter","backgroundAsset":"bg","layers":[]}],"shots":[{"id":"counter","areaId":"counter","actors":[{"actorId":"clerk","whenFlagEquals":{"key":"rainfall","value":"steady"}}]}],"embeddedInteractables":[]},"npcs":[{"id":"clerk","label":"店員","appearance":{},"hitMasks":[],"private":"never"}]}""")!.AsObject();
        var me=new TrackProgress("i","inviter","i01","counter",1);var state=new TrackState(1,JsonNode.Parse("""{"flags":{"rainfall":"steady"}}""")!.AsObject(),[me],new Dictionary<string,TrackInstance>());
        var visible=SceneEventStageProjection.Project(new(scene,new(),[]),me,new JsonObject(),[],[],state)!;Assert.Single(visible["shots"]![0]!["actors"]!.AsArray());Assert.NotNull(visible["npcs"]![0]!["hitMasks"]);Assert.DoesNotContain("whenFlagEquals",visible.ToJsonString());Assert.DoesNotContain("never",visible.ToJsonString());
        state.World["flags"]!["rainfall"]="heavy";var gone=SceneEventStageProjection.Project(new(scene,new(),[]),me,new JsonObject(),[],[],state)!;Assert.Empty(gone["shots"]![0]!["actors"]!.AsArray());Assert.Empty(gone["npcs"]!.AsArray());
    }
    [Fact]
    public void AuthorizedCut_ShowsItsPublicWorldObjects_WithoutAddingUnprojectedPrivateObjects()
    {
        var scene=JsonNode.Parse("""{"stage":{"areaVisuals":[{"areaId":"shelves","defaultShotId":"shelves","backgroundAsset":"bg","layers":[]},{"areaId":"entrance","defaultShotId":"seep","backgroundAsset":"entry","layers":[]}],"shots":[{"id":"shelves","areaId":"shelves","actors":[]},{"id":"seep","areaId":"entrance","actors":[]}],"embeddedInteractables":[{"id":"water","objectId":"waterline","areaId":"entrance","state":"seeping"},{"id":"hidden","objectId":"private-paper","areaId":"entrance","state":"ready"}]},"npcs":[]}""")!.AsObject();
        var world=JsonNode.Parse("""[{"id":"waterline","areaId":"entrance","state":"seeping","holderRole":null}]""")!.AsArray();
        var result=SceneEventStageProjection.Project(new(scene,new(),[]),new("i","inviter","i01","shelves",1),new JsonObject(),world,JsonNode.Parse("""[{"type":"shot","shotId":"seep","durationMs":700}]""")!.AsArray())!;
        Assert.Single(result["embeddedInteractables"]!.AsArray());Assert.Equal("water",result["embeddedInteractables"]![0]!.Text("id"));Assert.DoesNotContain("private-paper",result.ToJsonString());
    }
    [Fact]
    public void CompletedExit_UsesItsCommittedShotAfterReload_WithVisiblePlayers()
    {
        var scene=JsonNode.Parse("""{"stage":{"areaVisuals":[{"areaId":"shelves","defaultShotId":"shelves","backgroundAsset":"bg","layers":[]},{"areaId":"street","defaultShotId":"exit","backgroundAsset":"street-bg","layers":[]}],"shots":[{"id":"shelves","areaId":"shelves","actors":[],"audioCueIds":[]},{"id":"exit","areaId":"street","actors":[{"actorId":"inviter"},{"actorId":"acceptor"}],"audioCueIds":[]}],"embeddedInteractables":[]},"npcs":[]}""")!.AsObject();
        var me=new TrackProgress("i","inviter","i01","shelves",1);var state=new TrackState(1,new(),[me,new("a","acceptor","a01","shelves",1)],new Dictionary<string,TrackInstance>(),Completed:true);
        var result=SceneEventStageProjection.Project(new(scene,new(),[]),me,new JsonObject(),[],JsonNode.Parse("""[{"type":"shot","shotId":"exit","durationMs":700}]""")!.AsArray(),state)!;
        Assert.Equal("exit",result.Text("currentShotId"));Assert.Equal(2,result["shots"]!.AsArray().Single(s=>s!.Text("id")=="exit")!["actors"]!.AsArray().Count);
    }
    [Fact]
    public void APlayerInAnotherArea_CannotBeRenderedByAStaticShotOrCommittedCue()
    {
        var scene=JsonNode.Parse("""{"stage":{"version":"scene-stage.v1","areaVisuals":[{"areaId":"shelves","defaultShotId":"shelves","backgroundAsset":"bg","layers":[]}],"shots":[{"id":"shelves","areaId":"shelves","actors":[{"actorId":"inviter"},{"actorId":"acceptor"}],"audioCueIds":[]}],"embeddedInteractables":[]},"npcs":[]}""")!.AsObject();
        var me=new TrackProgress("i","inviter","i01","shelves",1);var other=new TrackProgress("a","acceptor","a01","corner",1);
        var state=new TrackState(1,new(),[me,other],new Dictionary<string,TrackInstance>());
        var result=SceneEventStageProjection.Project(new(scene,new(),[]),me,new JsonObject(),[],[],state)!;
        Assert.Single(result["shots"]![0]!["actors"]!.AsArray());Assert.DoesNotContain("acceptor",result.ToJsonString());
    }
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
