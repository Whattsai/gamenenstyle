using System.Text.Json.Nodes;
using DatingHigh.Domain;
namespace DatingHigh.Unit.Tests.Application;
public sealed class SceneEventManifestPolicyTests
{
    [Fact] public void CompilePreservesSourceAndIndependentRoleEntries(){var source=SceneTrackTestContent.Source();var original=source.DeepClone();var c=SceneEventTrackPolicy.Compile(source,"romance");Assert.True(JsonNode.DeepEquals(original,source));Assert.Equal("i01",c.Narrative["tracks"]!["inviter"]!["entry"]!.GetValue<string>());Assert.Equal("a01",c.Narrative["tracks"]!["acceptor"]!["entry"]!.GetValue<string>());Assert.Contains(c.Bindings,b=>b.TrackScope=="shared");}
    [Theory][InlineData("category")][InlineData("schema")][InlineData("role")][InlineData("module")][InlineData("params")][InlineData("next")][InlineData("duplicate")][InlineData("definition")][InlineData("random")]
    public void CompilerRefusesUntrustedOrInconsistentBindings(string field){var source=SceneTrackTestContent.Source();var b=source["narrative"]!["eventBindings"]![0]!;
        if(field=="category")source["narrative"]!["eligibleCategoryCodes"]=new JsonArray("mystery");if(field=="schema")source["narrative"]!["schemaVersion"]="scene-event.v1";if(field=="role")b["trackScope"]="unknown";if(field=="module")source["eventDefinitions"]![0]!["manifest"]!["moduleType"]="execute-script";if(field=="params")b["actions"]![0]!["params"]!["script"]="anything";if(field=="next")b["actions"]![0]!["nextNode"]="missing";if(field=="duplicate")source["narrative"]!["eventBindings"]!.AsArray().Add(b.DeepClone());if(field=="definition")b["definition"]!["sha256"]="b";if(field=="random")b["probability"]=.5;
        Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.Compile(source,"romance"));}
}
