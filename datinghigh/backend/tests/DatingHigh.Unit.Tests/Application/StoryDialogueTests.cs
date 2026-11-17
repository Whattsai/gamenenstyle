using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Application;

public sealed class StoryDialogueTests
{
    [Fact]
    public void SDUT004_Recommendation_RanksSharedThenBalanceThenTotalThenStablePriority()
    {
        StoryCandidate[] entries=[new("x","x","v1",["reading"],9),new("y","y","v1",["coffee"],1),new("z","z","v1",["reading","puzzle"],3),new("w","w","v1",[],0)];
        Assert.Equal(new[]{"z","x","y"},StoryRecommendationPolicy.Rank(entries,["reading","coffee","puzzle"],["reading","puzzle"]).Select(c=>c.CatalogId));
        Assert.Equal(new[]{"w","y","z"},StoryRecommendationPolicy.Rank(entries,[],[]).Select(c=>c.CatalogId));
    }
    [Theory][InlineData(1)][InlineData(500)]
    public void SDUT036_Message_CountsUnicodeScalars(int count)=>Assert.Equal(string.Concat(Enumerable.Repeat("😀",count)),StoryMessagePolicy.Validate(string.Concat(Enumerable.Repeat("😀",count))));
    [Theory][InlineData("")][InlineData(" \t ")][InlineData("a\u0000b")][InlineData("<script>alert(1)</script>")]
    public void SDUT036_Message_RejectsInvalidText(string text)=>Assert.Throws<DomainException>(()=>StoryMessagePolicy.Validate(text));
    [Fact]
    public void Message_RejectsUnpairedSurrogate()=>Assert.Throws<DomainException>(()=>StoryMessagePolicy.Validate(new string((char)0xd800,1)));
    [Fact]
    public void SDUT036_Message_Rejects501Scalars()=>Assert.Throws<DomainException>(()=>StoryMessagePolicy.Validate(new string('中',501)));
    [Fact]
    public void SDUT005_006_025_039_046_Selection_UsesLatestVoteInRequestedEpisodeAndOriginalInviter()
    {
        StoryVote[] votes=[new(1,"A","x",1),new(1,"A","y",2),new(2,"A","x",30),new(1,"B","x",3)];
        Assert.Equal("y",StorySelectionPolicy.Resolve(votes,1,"A","B","A"));
        Assert.Equal("x",StorySelectionPolicy.Resolve(votes,1,"A","B","B"));
        Assert.Null(StorySelectionPolicy.Resolve(votes,2,"A","B","A"));
        Assert.Equal("x",StorySelectionPolicy.Resolve([..votes,new(2,"B","y",31)],2,"A","B","A"));
        Assert.Equal("y",StorySelectionPolicy.Resolve([..votes,new(2,"B","y",31)],2,"A","B","B"));
    }
}
