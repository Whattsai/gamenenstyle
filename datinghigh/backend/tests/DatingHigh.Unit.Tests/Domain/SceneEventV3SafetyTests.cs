using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Domain;

public sealed class SceneEventV3SafetyTests
{
    private const string I="019a281e-0000-7000-8000-000000000001", A="019a281e-0000-7000-8000-000000000002";
    private static JsonObject Source()
    {
        var root=new DirectoryInfo(AppContext.BaseDirectory);
        while(root is not null&&!File.Exists(Path.Combine(root.FullName,"contracts","rain-bookshop-last-order.json")))root=root.Parent;
        var source=JsonNode.Parse(File.ReadAllText(Path.Combine(root!.FullName,"contracts","rain-bookshop-last-order.json")))!.AsObject();
        source["scene"]!["sharedFlags"]!.AsArray().Add(new JsonObject{["id"]="water",["values"]=new JsonArray("safe","danger"),["initialValue"]="safe",["publicValues"]=new JsonArray("safe","danger")});
        source["narrative"]!["endings"]!.AsArray().Add(new JsonObject{["id"]="safety-exit",["title"]="安全撤離",["lines"]=new JsonArray(new JsonObject{["speaker"]="旁白",["text"]="先離開危險區域。"}),["conditions"]=new JsonObject{["shared_flag_equals"]=new JsonObject{["key"]="water",["value"]="danger"}},["presentationSteps"]=new JsonArray()});
        source["narrative"]!["safetyExit"]=new JsonObject{["endingId"]="safety-exit",["conditions"]=new JsonObject{["shared_flag_equals"]=new JsonObject{["key"]="water",["value"]="danger"}}};
        return source;
    }
    [Fact]
    public void SEF_UT_547_DangerCanCompleteWithoutNormalCooperation_AndDoesNotAdvancePartner()
    {
        var c=SceneEventTrackPolicy.Compile(Source(),"romance");var initial=SceneEventTrackPolicy.Initial(c,I,A);
        var b=c.Bindings.Single(b=>b.Key.EndsWith(":arrive-inviter"));
        b.Raw["actions"]![0]!["worldEffects"]!.AsArray().Add(new JsonObject{["type"]="flag",["flagId"]="water",["value"]="danger"});
        var result=SceneEventTrackPolicy.Apply(c,initial,I,new(b.Key,"inspect",new(){["objectId"]="pickup-slip-27"},1,1,null));
        Assert.True(result.State.Completed);Assert.Equal("safety-exit",result.EndingId);
        Assert.Equal(initial.Progress[1],result.State.Progress[1]);Assert.Single(result.ChangedProgress);
        Assert.Equal(2,result.State.SharedRevision);Assert.False(initial.Completed);Assert.Equal("safe",initial.World["flags"]!["water"]!.GetValue<string>());
        Assert.Empty(SceneEventTrackPolicy.Available(c,result.State,A));
        Assert.Equal("EVENT_STATE_CONFLICT",Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.Apply(c,result.State,I,new(b.Key,"inspect",new(){["objectId"]="pickup-slip-27"},2,2,result.Instance.Revision))).Code);
    }
    [Theory]
    [InlineData("missing")]
    [InlineData("e01")]
    public void SafetyExitMustReferenceExactlyOneEndingWithTheSamePredicate(string ending)
    {
        var source=Source();source["narrative"]!["safetyExit"]!["endingId"]=ending;
        Assert.Equal("INVALID_STORY_CONTENT",Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.Compile(source,"romance")).Code);
    }
}
