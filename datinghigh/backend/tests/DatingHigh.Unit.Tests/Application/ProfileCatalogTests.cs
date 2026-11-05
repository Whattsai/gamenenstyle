using System.Text;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class ProfileCatalogTests
{
    [Fact,Trait("Case","AP-UT-017"),Trait("Case","AP-UT-018")]
    public void UnknownButWellFormedCatalogCodes_CannotPersist()
    {
        var json=JsonNode.Parse("""{"expectedRevision":1,"nickname":"星河","bio":"","occupation":null,"birthDate":"1995-01-01","regionCode":"TW-TPE","traitTagIds":[],"interestTagIds":["made_up"],"topicTagIds":[],"valueTagIds":[],"weekendPreference":null,"sleepSchedule":null,"conversationStyle":null,"expectedInteractionFrequency":null,"relationshipMode":null,"preferredAgeMin":null,"preferredAgeMax":null,"preferredRegionCodes":[],"sharedInterestWeight":50}""")!;
        Assert.Throws<DomainException>(()=>ProfileUpdateInput.Parse(Encoding.UTF8.GetBytes(json.ToJsonString()),TimeProvider.System));
        json["interestTagIds"]=new JsonArray();json["regionCode"]="TW-FAKE";
        Assert.Throws<DomainException>(()=>ProfileUpdateInput.Parse(Encoding.UTF8.GetBytes(json.ToJsonString()),TimeProvider.System));
    }
}
