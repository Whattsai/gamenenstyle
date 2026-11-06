using DatingHigh.Domain;
using Xunit;

namespace DatingHigh.Unit.Tests.Domain;

public class MatchingScoreTests
{
    private static readonly DateOnly Today = new(2026, 11, 6);
    private static MatchingInput Person() => new("1990-11-06", "diverse", ["male", "female", "diverse"],
        "TW-TPE", ["coffee"], ["daily_chat"], ["kindness"],
        ["explore", "early_bird", "warm", "daily", "friends_first"], null, null, [], 50);

    [Fact]
    public void MS_UT_002_013_028_029_050_Score_IsSymmetricAndRenormalizesOptionalDimensions()
    {
        var a = Person(); var b = Person();
        Assert.Equal(100, MatchingScore.Calculate(a, b, Today));
        b = b with { Interests = [], Topics = [], Values = [] };
        Assert.Equal(50, MatchingScore.Calculate(a, b, Today));
        a = a with { PreferredAgeMin = 25, PreferredAgeMax = 35 };
        b = b with { BirthDate = "1986-11-06" };
        Assert.Equal(56, MatchingScore.Calculate(a, b, Today)); // (65*50+20*75)/85
        b = b with { PreferredRegions = ["TW-TPE"] };
        Assert.Equal(63, MatchingScore.Calculate(a, b, Today));
        Assert.Equal(MatchingScore.Calculate(a, b, Today), MatchingScore.Calculate(b, a, Today));
    }

    [Theory]
    [InlineData(25, 100)][InlineData(35, 100)][InlineData(36, 95)]
    [InlineData(40, 75)][InlineData(45, 50)][InlineData(55, 0)][InlineData(24, 95)]
    public void MS_UT_003_023_024_025_AgeSide_UsesClosedIntervalAndFivePointsPerYear(int age, int expected) =>
        Assert.Equal(expected, MatchingScore.AgeSide(25, 35, age));

    [Fact]
    public void MS_UT_005_022_Compatibility_UsesMutualOrientationAndTaiwanBirthday()
    {
        var a = Person() with { Gender = "male", Orientation = ["female"] };
        var b = Person() with { Gender = "female", Orientation = ["male"], BirthDate = "2008-11-06" };
        Assert.True(MatchingScore.Compatible(a, b, Today));
        Assert.False(MatchingScore.Compatible(a, b with { BirthDate = "2008-11-07" }, Today));
        Assert.False(MatchingScore.Compatible(a, b with { Orientation = ["female"] }, Today));
    }

    [Fact]
    public void MS_UT_004_016_017_026_027_049_Regions_UseCompleteStableCoordinatesAndNearestPreference()
    {
        Assert.Equal(ProfileCatalog.Groups["regionCode"].Select(p => p.Id).Order(), MatchingScore.Regions.Keys.Order());
        foreach (var code in MatchingScore.Regions.Keys) Assert.Equal(100, MatchingScore.RegionSide([code], code));
        Assert.Equal(50, MatchingScore.RegionSide(["TW-TPE"], null));
        Assert.Equal(50, MatchingScore.RegionSide(["TW-TPE"], "unknown"));
        Assert.Equal(MatchingScore.RegionSide(["TW-KHH"], "TW-TNN"), MatchingScore.RegionSide(["TW-TPE", "TW-KHH"], "TW-TNN"));
        Assert.InRange(MatchingScore.DistanceScore(150), 36.78, 36.79);
        Assert.True(MatchingScore.DistanceScore(300) < MatchingScore.DistanceScore(150));
        Assert.True(MatchingScore.RegionSide(["TW-TPE"], "TW-LIE") < 100);
    }

    [Fact]
    public void MS_UT_018_030_031_032_050_InterestsAndLifestyle_RespectWeightsEmptySetsAndPrecision()
    {
        var a = Person(); var b = Person() with { Interests = [], Topics = [], Values = [] };
        Assert.Equal(0, MatchingScore.Jaccard([], []));
        Assert.Equal(1d / 3, MatchingScore.Jaccard(["a", "b"], ["b", "c"]));
        Assert.Equal(100, MatchingScore.Calculate(a with { InterestWeight = 0 }, b with { InterestWeight = 0 }, Today));
        Assert.Equal(0, MatchingScore.Calculate(a with { InterestWeight = 100 }, b with { InterestWeight = 100 }, Today));
        Assert.Equal(50, MatchingScore.Calculate(a, b, Today));
        Assert.Equal(0, MatchingScore.Calculate(a with { Lifestyle = [] }, b with { Lifestyle = [] }, Today));
        Assert.Equal(62, MatchingScore.Calculate(a with { PreferredAgeMin = 18, PreferredAgeMax = 120 }, b, Today));
        var preciseA=Person() with{Interests=["coffee","hiking"],InterestWeight=34,PreferredAgeMin=25,PreferredAgeMax=35,PreferredRegions=["TW-TPE"]};
        var preciseB=Person() with{Interests=["coffee","anime"],InterestWeight=67,Region=null};
        Assert.Equal(78,MatchingScore.Calculate(preciseA,preciseB,Today)); // B=79.8，總分78.37；提前將B取80會錯成79。
        Assert.Equal(50,MatchingScore.Calculate(a with{InterestWeight=0,Lifestyle=["same","first",null]},b with{InterestWeight=0,Lifestyle=["same","second","ignored"]},Today));
        Assert.Equal(100,MatchingScore.Calculate(a with{InterestWeight=0,Lifestyle=[null,"same"]},b with{InterestWeight=0,Lifestyle=["ignored","same"]},Today));
        Assert.Equal(0,MatchingScore.Calculate(a with{InterestWeight=0,Lifestyle=["only",null]},b with{InterestWeight=0,Lifestyle=[null,"other"]},Today));
    }
}
