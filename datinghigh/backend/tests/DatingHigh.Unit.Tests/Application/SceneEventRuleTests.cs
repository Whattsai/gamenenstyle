using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class SceneEventRuleTests
{
    private static EventFacts Facts() =>new(["shelves"],["inspect"],["narrative:rain:bookmark"],new Dictionary<string,string>{{"letter","found"}},["chapter-one"]);
    private static JsonObject Rule(string value)=>JsonNode.Parse(value)!.AsObject();

    [Theory]
    [InlineData("{\"node_entered\":\"shelves\"}",true)]
    [InlineData("{\"choice_committed\":\"inspect\"}",true)]
    [InlineData("{\"event_completed\":\"narrative:rain:bookmark\"}",true)]
    [InlineData("{\"narrative_completed\":\"chapter-one\"}",true)]
    [InlineData("{\"flag_equals\":{\"key\":\"letter\",\"value\":\"found\"}}",true)]
    [InlineData("{\"flag_equals\":{\"key\":\"unknown\",\"value\":\"found\"}}",false)]
    [InlineData("{\"all\":[{\"node_entered\":\"shelves\"},{\"not\":{\"choice_committed\":\"missing\"}}]}",true)]
    [InlineData("{\"any\":[{\"node_entered\":\"missing\"},{\"event_completed\":\"missing\"}]}",false)]
    public void SEFUT034_046_047_ConditionUsesOnlyCommittedFacts(string json,bool expected) =>Assert.Equal(expected,EventRulePolicy.Evaluate(Rule(json),Facts()));

    [Theory]
    [InlineData("{\"script\":\"true\"}")]
    [InlineData("{\"profile\":\"email\"}")]
    [InlineData("{\"node_entered\":\"shelves\",\"event_completed\":\"bookmark\"}")]
    [InlineData("{\"all\":[]}")]
    [InlineData("{\"all\":[{\"node_entered\":\"missing\"},{\"script\":\"true\"}]}")]
    [InlineData("{\"flag_equals\":{\"key\":\"letter\",\"value\":\"found\",\"url\":\"https://invalid.test\"}}")]
    public void Condition_InvalidDslIsRejectedEvenInUnvisitedBranch(string json) =>Assert.Throws<DomainException>(()=>EventRulePolicy.Evaluate(Rule(json),Facts()));

    [Fact]
    public void Condition_DepthAndSizeAreBounded()
    {
        JsonObject rule=Rule("{\"node_entered\":\"shelves\"}");for(var i=0;i<10;i++)rule=new(){["not"]=rule};
        Assert.Throws<DomainException>(()=>EventRulePolicy.Evaluate(rule,Facts()));
        var wide=new JsonArray();for(var i=0;i<65;i++)wide.Add(Rule("{\"node_entered\":\"shelves\"}"));
        Assert.Throws<DomainException>(()=>EventRulePolicy.Evaluate(new(){["all"]=wide},Facts()));
    }

    [Fact]
    public void BindingNamespacesCannotContainTheirOwnSeparator()
    {
        Assert.Throws<DomainException>(()=>EventRulePolicy.ValidateBinding(Binding() with{SourceId="rain:other"}));
        Assert.Throws<DomainException>(()=>EventRulePolicy.ValidateBinding(Binding() with{BindingId="rain:other"}));
    }

    private static EventBinding Binding(string scope="narrative",string id="bookmark",string role="side",string repeat="playthrough") =>
        new(scope,"rain",id,"inspect-bookmark","v1","bookmark",role,"hidden","weighted_random",1,repeat,["bookshop"],Rule("{\"node_entered\":\"shelves\"}"),false);

    [Theory]
    [InlineData("scene")]
    [InlineData("global")]
    public void MainRoleMustBeDeclaredByTheNarrativeBinding(string scope)
    {
        Assert.Throws<DomainException>(()=>EventRulePolicy.ValidateBinding(Binding(scope,role:"main") with{RequiredForEnding=true}));
        EventRulePolicy.ValidateBinding(Binding(role:"main") with{RequiredForEnding=true});
    }
    [Fact]
    public void ARequiredEndingEventCannotBePermanentlyCancelledByItsRandomDraw()
    {
        Assert.Throws<DomainException>(()=>EventRulePolicy.ValidateBinding(Binding(role:"main") with{RequiredForEnding=true,Probability=.5}));
        EventRulePolicy.ValidateBinding(Binding(role:"main") with{RequiredForEnding=true,Probability=1});
    }

    [Fact]
    public void SEFUT031_032_037_038_094_ThreeSourcesUseQualifiedKeysAndMainWinsSemanticDuplicate()
    {
        var main=Binding(role:"main");var side=Binding("scene");var global=Binding("global");
        var other=Binding("scene","lamp") with{RepeatGroup="lamp",EventId="inspect-lamp"};
        var globalOther=Binding("global","letter") with{RepeatGroup="letter",EventId="inspect-letter"};
        var incompatible=Binding("global","aquarium") with{RepeatGroup="aquarium",RequiredCapabilities=["aquarium"]};
        var selected=EventRulePolicy.Candidates([global,side,main,other,globalOther,incompatible],["bookshop"],Facts(),[],"round","session",_=>0);
        Assert.Equal(new[]{"narrative:rain:bookmark","scene:rain:lamp","global:rain:letter"},selected.Select(b=>b.Key));
        Assert.Equal("v1",main.EventVersion);Assert.Equal("side",side.NarrativeRole);
    }

    [Fact]
    public void SEFUT040_041_043_044_RepeatScopeUsesSessionOrRoundAndCompletedSemanticKey()
    {
        EventOccurrence[] history=[new("round","session-one","narrative:rain:bookmark","bookmark","completed")];
        Assert.Empty(EventRulePolicy.Candidates([Binding()],["bookshop"],Facts(),history,"round","session-one",_=>0));
        Assert.Single(EventRulePolicy.Candidates([Binding()],["bookshop"],Facts(),history,"round","session-two",_=>0));
        Assert.Empty(EventRulePolicy.Candidates([Binding(repeat:"round")],["bookshop"],Facts(),history,"round","session-two",_=>0));
        Assert.Single(EventRulePolicy.Candidates([Binding(repeat:"round")],["bookshop"],Facts(),history,"other-round","session-two",_=>0));
    }

    [Fact]
    public void SEFUT034_035_036_HiddenRandomConditionalOnlyRevealsAfterEligibleDraw()
    {
        var binding=Binding() with{Probability=.5};
        Assert.Empty(EventRulePolicy.Candidates([binding],["different-scene"],Facts(),[],"round","session",_=>throw new Exception("RNG must not run")));
        Assert.Empty(EventRulePolicy.Candidates([binding],["bookshop"],Facts(),[],"round","session",_=>.75));
        Assert.Single(EventRulePolicy.Candidates([binding],["bookshop"],Facts(),[],"round","session",_=>.25));
    }
}
