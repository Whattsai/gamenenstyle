using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class ProfileProjectionTests
{
    private static JsonObject Own()=>new(){["nickname"]="星河",["bio"]="喜歡手作",["occupation"]="工程師",["birthDate"]="1995-01-01",["regionCode"]="TW-TPE",["traitTagIds"]=new JsonArray("warm"),["interestTagIds"]=new JsonArray("handcraft"),["topicTagIds"]=new JsonArray("creative_chat"),["valueTagIds"]=new JsonArray("creativity"),["selectedAvatarType"]="builtin",["selectedAvatarRef"]="male-01",["preferredAgeMin"]=25,["preferredAgeMax"]=35,["preferredRegionCodes"]=new JsonArray("TW-TPE"),["sharedInterestWeight"]=60,["personalPhotos"]=new JsonArray(new JsonObject{["assetId"]=EntityId.New()}),["email"]="must-not-share@example.test"};
    [Fact]
    public void NewField_IsPrivateByDefaultUntilExplicitlyOpened()
    {
        var field=new ProfileField("future","未來欄位","text",99,"future_column","text",Shareable:true);
        Assert.False(ProfileFields.Visible(field,new Dictionary<string,bool>()));
        Assert.True(ProfileFields.Visible(field,new Dictionary<string,bool>{{"future",true}}));
        Assert.False(ProfileFields.Visible(field with{Shareable=false},new Dictionary<string,bool>{{"future",true}}));
    }
    [Fact,Trait("Case","AP-UT-022"),Trait("Case","AP-UT-024")]
    public void ProjectionWhitelists_MatchingAndCandidateNeverExposeContactOrRealPhotos()
    {
        var own=Own();var matching=ProfileProjections.MatchingInput(own,new DateOnly(2026,11,3));
        Assert.Equal(31,matching["age"]!.GetValue<int>());Assert.Equal(60,matching["sharedInterestWeight"]!.GetValue<int>());
        Assert.Null(matching["personalPhotos"]);Assert.Null(matching["occupation"]);Assert.Null(matching["email"]);Assert.Null(matching["birthDate"]);
        var candidate=ProfileProjections.CandidatePersona(own);
        Assert.Equal("male-01",candidate["selectedAvatarRef"]!.GetValue<string>());
        foreach(var key in new[]{"personalPhotos","occupation","birthDate","email","preferredAgeMin","sharedInterestWeight"})Assert.Null(candidate[key]);
        own["nickname"]="修改後";Assert.Equal("星河",candidate["nickname"]!.GetValue<string>());
    }
    [Fact,Trait("Case","AP-UT-020"),Trait("Case","AP-UT-028")]
    public void CurrentCardWhitelist_PreservesCurrentOccupationAndPhotos_ExcludesPrivateFilters()
    {
        var card=ProfileProjections.CurrentCardFields(Own(),new DateOnly(2026,11,3));
        Assert.Equal("工程師",card["occupation"]!.GetValue<string>());Assert.Single(card["personalPhotos"]!.AsArray());
        foreach(var key in new[]{"email","birthDate","preferredAgeMin","preferredAgeMax","preferredRegionCodes","sharedInterestWeight"})Assert.Null(card[key]);
    }
    [Fact]
    public void CardVisibility_ClosedFieldsAreAbsent_AndNewFieldsDefaultClosed()
    {
        var own=Own();own["gender"]="male";own["romanticOrientation"]=new JsonArray("female");
        own["cardVisibility"]=new JsonObject{["nickname"]=false,["personalPhotos"]=false,["ageBand"]=false};
        var card=ProfileProjections.CurrentCardFields(own,new DateOnly(2026,11,5));
        foreach(var key in new[]{"nickname","personalPhotos","ageBand","gender","romanticOrientation"})Assert.False(card.ContainsKey(key));
        var matching=ProfileProjections.MatchingInput(own,new DateOnly(2026,11,5));
        Assert.Equal("male",matching["gender"]!.GetValue<string>());
        Assert.Equal("female",matching["romanticOrientation"]![0]!.GetValue<string>());
    }
    [Fact,Trait("Case","AP-UT-085"),Trait("Case","AP-UT-087")]
    public async Task FutureConsentIntegration_DefaultDeny_CannotBeEnabledByClientBoolean()
    {
        var user=new CurrentUser(EntityId.New(),EntityId.New(),1,long.MaxValue);
        var error=await Assert.ThrowsAsync<DomainException>(()=>new DenyCurrentCardAuthorization().AuthorizeAsync(user,EntityId.New(),EntityId.New()));
        Assert.Equal(403,error.Status);
    }
}
