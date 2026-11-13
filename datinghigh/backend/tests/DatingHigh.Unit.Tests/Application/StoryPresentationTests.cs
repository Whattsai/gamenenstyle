using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class StoryPresentationTests
{
    private static JsonObject Content()
    {
        var file=Path.Combine(AppContext.BaseDirectory,"../../../../../../contracts/story-scenes.json");
        var story=JsonNode.Parse(File.ReadAllText(Path.GetFullPath(file)))!["stories"]![0]!.DeepClone().AsObject();
        story["scenePresentation"]=JsonNode.Parse("""{"version":"2.5d.v1","backgroundAsset":"rain-bookshop","cameras":[{"id":"wide","scale":1,"focus":{"x":0.5,"y":0.5},"portrait":{"x":0.5,"headY":0.08,"height":0.9},"foreground":false,"tint":"#aabbcc","tintOpacity":0.1}],"hotspots":[{"id":"bookmark","definitionId":"bookmark","label":"書籤","x":0.7,"y":0.8}],"foreground":[{"id":"desk","x":0,"y":0.75,"width":1,"height":0.25,"color":"#513531"}]}""");
        foreach(var node in story["nodes"]!.AsArray())node!["presentation"]=JsonNode.Parse("""{"cameraId":"wide","expression":"neutral","hotspotIds":["bookmark"]}""");
        return story;
    }
    [Fact] public void VersionedLocalPresentation_IsValid()=>StoryGraphPolicy.Validate(Content());
    [Fact] public void RegisteredForeground_UsesOnlyAnImageFromTheSameManifest()
    {
        var story=Content();story["scenePresentation"]!["foregroundAsset"]="rain-bookshop";
        StoryGraphPolicy.Validate(story);
        foreach(var invalid in new[]{"rain","private/avatar","https://other.test/foreground.png"}){
            story["scenePresentation"]!["foregroundAsset"]=invalid;
            Assert.Equal("INVALID_STORY_CONTENT",Assert.Throws<DomainException>(()=>StoryGraphPolicy.Validate(story)).Code);
        }
    }
    [Theory][InlineData("private/account")][InlineData("rain-bookshop")]
    public void AudioCue_RejectsPrivateOrNonAudioReferences(string asset)
    {
        var story=Content();story["audioCues"]=new JsonObject{["pageTurn"]=asset,["transition"]="rain"};
        Assert.Equal("INVALID_STORY_CONTENT",Assert.Throws<DomainException>(()=>StoryGraphPolicy.Validate(story)).Code);
    }
    [Theory][InlineData("camera")][InlineData("expression")][InlineData("bounds")][InlineData("hotspot")][InlineData("asset")][InlineData("script")][InlineData("color")]
    public void Presentation_RejectsMissingReferencesUnsafeValuesAndUnscriptedEmotions(string field)
    {
        var story=Content();var p=story["scenePresentation"]!;
        if(field=="camera")story["nodes"]![0]!["presentation"]!["cameraId"]="missing";
        if(field=="expression")story["nodes"]![0]!["presentation"]!["expression"]="real-emotion";
        if(field=="bounds")p["cameras"]![0]!["portrait"]!["height"]=99;
        if(field=="hotspot")p["hotspots"]![0]!["definitionId"]="reading-path";
        if(field=="asset")p["backgroundAsset"]="private/user";
        if(field=="script")p["cameras"]![0]!["script"]="alert(1)";
        if(field=="color")p["foreground"]![0]!["color"]="url(https://other.test)";
        Assert.Equal("INVALID_STORY_CONTENT",Assert.Throws<DomainException>(()=>StoryGraphPolicy.Validate(story)).Code);
    }
}
