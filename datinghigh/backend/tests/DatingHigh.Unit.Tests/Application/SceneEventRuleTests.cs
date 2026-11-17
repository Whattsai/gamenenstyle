using System.Text.Json.Nodes;
using DatingHigh.Domain;
namespace DatingHigh.Unit.Tests.Application;
public sealed class SceneEventRuleTests
{
    [Theory]
    [InlineData("{\"track_node_entered\":{\"role\":\"inviter\",\"nodeId\":\"i01\"}}",true)]
    [InlineData("{\"track_node_entered\":{\"role\":\"acceptor\",\"nodeId\":\"a08\"}}",false)]
    [InlineData("{\"actor_area_is\":{\"role\":\"acceptor\",\"areaId\":\"shelves\"}}",true)]
    [InlineData("{\"shared_event_completed\":\"narrative:rain-bookshop-last-order:counter-meet\"}",false)]
    [InlineData("{\"track_event_completed\":{\"role\":\"inviter\",\"bindingKey\":\"narrative:rain-bookshop-last-order:arrive-inviter\"}}",false)]
    [InlineData("{\"world_object_state\":{\"objectId\":\"order-tag-27\",\"state\":\"on-bag\"}}",true)]
    [InlineData("{\"all\":[{\"actor_area_is\":{\"role\":\"inviter\",\"areaId\":\"entrance\"}},{\"not\":{\"actor_area_is\":{\"role\":\"inviter\",\"areaId\":\"window\"}}}]}",true)]
    [InlineData("{\"any\":[{\"actor_area_is\":{\"role\":\"inviter\",\"areaId\":\"window\"}},{\"actor_area_is\":{\"role\":\"acceptor\",\"areaId\":\"entrance\"}}]}",false)]
    public void ConditionsReadOnlyRoleQualifiedCommittedFacts(string json,bool expected){var c=SceneTrackTestContent.Content();var s=SceneTrackTestContent.Initial(c);Assert.Equal(expected,SceneEventTrackPolicy.Evaluate(c,s,JsonNode.Parse(json)!.AsObject()));Assert.Empty(s.Instances);}
    [Theory]
    [InlineData("{\"script\":\"true\"}")][InlineData("{\"node_entered\":\"entry\"}")][InlineData("{\"all\":[]}")]
    [InlineData("{\"track_node_entered\":{\"role\":\"shared\",\"nodeId\":\"i01\"}}")]
    [InlineData("{\"track_event_completed\":{\"role\":\"acceptor\",\"bindingKey\":\"narrative:rain-bookshop-last-order:arrive-inviter\"}}")]
    [InlineData("{\"any\":[{\"actor_area_is\":{\"role\":\"inviter\",\"areaId\":\"entrance\"}},{\"script\":\"ignored\"}]}")]
    public void InvalidOrLegacyDslFailsEvenInUnvisitedBranch(string json){var c=SceneTrackTestContent.Content();Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.Evaluate(c,SceneTrackTestContent.Initial(c),JsonNode.Parse(json)!.AsObject()));}
    [Fact] public void DepthAndNodeCountAreBounded(){var c=SceneTrackTestContent.Content();JsonObject r=new(){["actor_area_is"]=new JsonObject{["role"]="inviter",["areaId"]="entrance"}};for(var i=0;i<10;i++)r=new(){["not"]=r};Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.ValidateCondition(c,r));var wide=new JsonArray();for(var i=0;i<65;i++)wide.Add(new JsonObject{["narrative_completed"]="other-story"});Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.ValidateCondition(c,new(){["all"]=wide}));}
}
