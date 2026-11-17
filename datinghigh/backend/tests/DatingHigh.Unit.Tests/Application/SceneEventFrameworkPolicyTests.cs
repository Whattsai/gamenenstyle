using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class SceneEventFrameworkPolicyTests
{
    private static NarrativeCandidate Narrative(string id,string[]? codes=null,string? group=null,int? order=null,string[]? prerequisites=null) =>
        new(id,id,"scene",codes??["romance"],"published",group,order,prerequisites??[]);
    private static PairCompletion Done(string narrative,string scene="scene",string low="A",string high="B") =>new(low,high,scene,narrative);

    [Fact]
    public void SEFUT190_191_199_CategoryEligibilityFiltersNarrativeBeforeWeighting()
    {
        var narratives=new[]{Narrative("romantic"),Narrative("mystery",["mystery"]),Narrative("shared",["romance","mystery"])};
        Assert.Equal(new[]{"mystery","shared"},NarrativeEligibilityPolicy.Eligible(narratives,"scene","mystery","A","B",[]).Select(n=>n.CatalogId));
        Assert.Equal(new[]{"romantic","shared"},NarrativeEligibilityPolicy.Eligible(narratives,"scene","romance","A","B",[]).Select(n=>n.CatalogId));
        Assert.Empty(NarrativeEligibilityPolicy.Eligible(narratives,"scene","unknown","A","B",[]));
        Assert.Empty(NarrativeEligibilityPolicy.Eligible([narratives[1] with{Status="retired"}],"scene","mystery","A","B",[]));
    }

    [Fact]
    public void SEFUT022_023_073_074_OrderedAndUnorderedCandidatesShareEligiblePool()
    {
        var all=new[]{Narrative("one",group:"series",order:1),Narrative("two",group:"series",order:2,prerequisites:["one"]),Narrative("three",group:"series",order:3),Narrative("independent")};
        Assert.Equal(new[]{"one","independent"},NarrativeEligibilityPolicy.Eligible(all,"scene","romance","A","B",[]).Select(n=>n.CatalogId));
        Assert.Equal(new[]{"one","two","independent"},NarrativeEligibilityPolicy.Eligible(all,"scene","romance","B","A",[Done("one")]).Select(n=>n.CatalogId));
        Assert.DoesNotContain(NarrativeEligibilityPolicy.Eligible(all,"scene","romance","A","C",[Done("one")]),n=>n.NarrativeId=="two");
    }

    [Theory]
    [InlineData(0,"new")][InlineData(1,"new")][InlineData(2,"new")][InlineData(3,"old")]
    public void SEFUT016_017_019_020_WeightIsExactlyThreeToOne(int draw,string expected)
    {
        Assert.Equal(expected,SceneSelectionPolicy.Choose(["new","old"],x=>x=="old",bound=>{Assert.Equal(4,bound);return draw;}));
    }

    [Fact]
    public void SEFUT088_089_AllPlayedStillSelectableAndInvalidRngRejected()
    {
        Assert.Equal("old",SceneSelectionPolicy.Choose(["old"],_=>true,_=>0));
        Assert.Throws<DomainException>(()=>SceneSelectionPolicy.Choose(Array.Empty<string>(),_=>true,_=>0));
        Assert.Throws<DomainException>(()=>SceneSelectionPolicy.Choose(["old"],_=>true,bound=>bound));
    }

    [Fact]
    public void SEFUT007_008_196_197_RecommendationUsesOnlyPlayableCategoriesAndStableBalancedRank()
    {
        StoryCategoryCandidate[] categories=[new("romance-id","romance",["reading"],2,"published"),new("mystery-id","mystery",["puzzle"],1,"published"),new("empty-id","empty",["reading"],0,"published")];
        SceneCandidate[] scenes=[new("scene","rain-bookshop",["romance","mystery","empty"],"published")];
        var result=StoryCategoryRecommendationPolicy.Rank(categories,scenes,[Narrative("romantic"),Narrative("mystery",["mystery"])],["reading","puzzle"],["reading"],"A","B",[]);
        Assert.Equal(new[]{"romance-id","mystery-id"},result.Select(c=>c.CategoryId));
        Assert.Throws<DomainException>(()=>StoryCategoryRecommendationPolicy.Rank(categories,scenes,[],[],[],"A","B",[]));
    }

    [Fact]
    public void SEFUT052_085_086_NextConsentUsesLatestRealActorsInCompletedEpisode()
    {
        NextConsent[] votes=[new(1,"A",true,1),new(1,"A",false,2),new(2,"B",true,3),new(1,"outsider",true,4)];
        Assert.False(PlaythroughLifecyclePolicy.BothAgreed(votes,1,"A","B"));
        Assert.True(PlaythroughLifecyclePolicy.BothAgreed([..votes,new(1,"A",true,5),new(1,"B",true,6)],1,"A","B"));
        Assert.False(PlaythroughLifecyclePolicy.BothAgreed([..votes,new(1,"B",true,6)],1,"A","B"));
    }
}
