using System.Text.Json.Nodes;
using DatingHigh.Application;

namespace DatingHigh.Unit.Tests.Application;

public sealed class SceneAreaObservationTests
{
    [Fact]
    public void NestedAreaPredicates_ObserveBothRoles_ButPastNodeFactsDoNotLockThePartner()
    {
        var conditions=JsonNode.Parse("""{"all":[{"actor_area_is":{"role":"inviter","areaId":"corner"}},{"any":[{"actor_area_is":{"role":"acceptor","areaId":"corner"}},{"actor_area_is":{"role":"acceptor","areaId":"shelves"}}]}]}""");
        Assert.Equal(new[]{"acceptor","inviter"},SceneAreaObservation.Roles(conditions));
        Assert.Empty(SceneAreaObservation.Roles(JsonNode.Parse("""{"track_node_entered":{"role":"acceptor","nodeId":"a01"}}""")));
    }
}
