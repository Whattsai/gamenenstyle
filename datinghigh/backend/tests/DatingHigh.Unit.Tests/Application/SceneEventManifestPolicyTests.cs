using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class SceneEventManifestPolicyTests
{
    private static JsonObject Content()=>JsonNode.Parse("""
        {"narrative":{"narrativeId":"rain","version":"v1","title":"雨聲書店","summary":"共同閱讀","entry":"entry","eligibleCategoryCodes":["romance"],
          "scene":{"id":"bookshop","version":"v1"},"globalPool":{"id":"global","version":"v1"},
          "nodes":[{"id":"entry","title":"開場","visual":"book","objects":[],"interactionId":"route","lines":[{"speaker":"旁白","text":"一起選一本書。"}],"choices":[]},
          {"id":"ending-same","title":"同一頁","visual":"together","objects":[],"ending":true,"lines":[{"speaker":"旁白","text":"同一頁。"}],"choices":[]},
          {"id":"ending-other","title":"兩頁","visual":"two-pages","objects":[],"ending":true,"lines":[{"speaker":"旁白","text":"並肩讀書。"}],"choices":[]}],
          "suggestions":[],"eventBindings":[{"scope":"narrative","sourceId":"rain","bindingId":"route","definition":{"eventId":"reading-path","version":"v1","key":"story-content/events/reading-path/v1/manifest.json","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},"narrativeRole":"main","visibility":"visible","selectionMode":"fixed","probability":1,"repeatScope":"playthrough","repeatGroup":"reading-path","requiredCapabilities":["bookshop"],"triggerConditions":{"node_entered":"entry"},"requiredForEnding":true,"outcomeTransitions":{"same":"ending-same","different":"ending-other"}}]},
         "scene":{"sceneId":"bookshop","version":"v1","time":"午後","place":"書店","event":"一起找書","locale":"zh-TW","sceneCapabilities":["bookshop"],"assets":[],"backgroundAsset":"background","audioAsset":"rain","sceneEventBindings":[]},
         "pool":{"poolId":"global","version":"v1","eventBindings":[]},
         "eventDefinitions":[{"reference":{"eventId":"reading-path","version":"v1","key":"story-content/events/reading-path/v1/manifest.json","sha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},"manifest":{"id":"reading-path","eventId":"reading-path","version":"v1","moduleType":"cooperative-choice","title":"閱讀方向","prompt":"選一個方向","options":[{"id":"warm","label":"日常"},{"id":"adventure","label":"冒險"}]}}],"pins":[]}
        """)!.AsObject();

    [Fact]
    public void Compile_BindingOwnsOutcomeAndRoleWhileSharedDefinitionRemainsUnchanged()
    {
        var source=Content();var before=source.DeepClone();var compiled=SceneEventManifestPolicy.Compile(source,"romance");
        Assert.Equal("route",compiled.Manifest["interactions"]![0]!["id"]!.GetValue<string>());
        Assert.Equal("ending-same",compiled.Manifest["interactions"]![0]!["sameNext"]!.GetValue<string>());
        Assert.Equal("narrative:rain:route",compiled.Bindings.Single().Key);
        Assert.Equal("reading-path",compiled.Bindings.Single().EventId);
        Assert.True(JsonNode.DeepEquals(before,source));StoryGraphPolicy.Validate(compiled.Manifest);
    }

    [Fact]
    public void Compile_RefusesWrongCategoryOrSceneVersion()
    {
        Assert.Throws<DomainException>(()=>SceneEventManifestPolicy.Compile(Content(),"mystery"));
        var content=Content();content["scene"]!["version"]="v2";Assert.Throws<DomainException>(()=>SceneEventManifestPolicy.Compile(content,"romance"));
    }
    [Theory][InlineData(true)][InlineData(false)]
    public void Compile_RefusesRandomFailureThatWouldLeaveTheOnlyCooperativeRouteBlocked(bool required)
    {
        var content=Content();var binding=content["narrative"]!["eventBindings"]![0]!;binding["requiredForEnding"]=required;binding["selectionMode"]="weighted_random";binding["probability"]=.5;
        Assert.Throws<DomainException>(()=>SceneEventManifestPolicy.Compile(content,"romance"));
    }

    [Fact]
    public void Compile_DoesNotCopyAdapterMetadataIntoRenderableNodesOrDefinitions()
    {
        var content=Content();content["narrative"]!["nodes"]![0]!["privatePhoto"]="private/not-a-scene-asset";
        content["eventDefinitions"]![0]!["manifest"]!["privateOwner"]="private/not-a-scene-asset";
        var result=SceneEventManifestPolicy.Compile(content,"romance");Assert.DoesNotContain("private/",result.Manifest.ToJsonString());
    }

    [Fact]
    public void Compile_RefusesDanglingDefinitionOrForgedBindingScope()
    {
        var content=Content();content["narrative"]!["eventBindings"]![0]!["definition"]!["version"]="v2";
        Assert.Throws<DomainException>(()=>SceneEventManifestPolicy.Compile(content,"romance"));
        content=Content();content["narrative"]!["eventBindings"]![0]!["scope"]="global";
        Assert.Throws<DomainException>(()=>SceneEventManifestPolicy.Compile(content,"romance"));
    }
    [Fact]
    public void Compile_SceneObjectRemainsRenderableWithoutASecondNarrativeBinding()
    {
        var content=Content();content["narrative"]!["nodes"]![0]!["objects"]=new JsonArray("bookmark");
        var binding=content["narrative"]!["eventBindings"]![0]!.DeepClone();binding["scope"]="scene";binding["sourceId"]="bookshop";binding["bindingId"]="bookmark";binding["definition"]!["eventId"]="bookmark";binding["narrativeRole"]="side";binding["requiredForEnding"]=false;binding.AsObject().Remove("outcomeTransitions");
        content["scene"]!["sceneEventBindings"]!.AsArray().Add(binding);
        var definition=content["eventDefinitions"]![0]!.DeepClone();definition["reference"]!["eventId"]="bookmark";definition["manifest"]!["id"]="bookmark";definition["manifest"]!["eventId"]="bookmark";definition["manifest"]!["moduleType"]="inspect-object";content["eventDefinitions"]!.AsArray().Add(definition);
        var compiled=SceneEventManifestPolicy.Compile(content,"romance");Assert.Equal("scene:bookshop:bookmark",compiled.EventDefinitions["scene:bookshop:bookmark"]["id"]!.GetValue<string>());
        Assert.Equal("inspect-object",StoryGraphPolicy.Definition(compiled.Manifest,"bookmark")["moduleType"]!.GetValue<string>());
    }
}
