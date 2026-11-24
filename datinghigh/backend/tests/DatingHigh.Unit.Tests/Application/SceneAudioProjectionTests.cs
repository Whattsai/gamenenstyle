using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
namespace DatingHigh.Unit.Tests.Application;
public sealed class SceneAudioProjectionTests
{
    [Fact]
    public void EndingMix_UsesTheAuthorizedExitArea_NotTheOldIndoorLocation()
    {
        var scene=JsonNode.Parse("""{"areas":[{"id":"shelves","audioMix":{"ambienceGain":0.3,"musicGain":0.6,"private":"never"}},{"id":"street","audioMix":{"ambienceGain":1,"musicGain":0}}]}""")!.AsObject();
        var content=new SceneTrackContent(scene,new(),[]);var me=new TrackProgress("i","inviter","i01","shelves",1);
        var stage=JsonNode.Parse("""{"currentShotId":"exit","shots":[{"id":"exit","areaId":"street"}]}""")!.AsObject();
        var outside=SceneAudioProjection.Mix(content,me,stage)!;Assert.Equal(0,outside["musicGain"]!.GetValue<double>());Assert.Equal(1,outside["ambienceGain"]!.GetValue<double>());
        var indoor=SceneAudioProjection.Mix(content,me,null)!;Assert.Equal(.6,indoor["musicGain"]!.GetValue<double>());Assert.Null(indoor["private"]);
        Assert.Null(SceneAudioProjection.Mix(new(JsonNode.Parse("""{"areas":[{"id":"shelves"}]}""")!.AsObject(),new(),[]),me,null));
    }
}
