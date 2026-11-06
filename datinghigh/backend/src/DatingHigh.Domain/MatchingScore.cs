namespace DatingHigh.Domain;

/// <summary>受限的配對計分輸入；不含帳號憑證、真人照片或名片。</summary>
public sealed record MatchingInput(string BirthDate, string Gender, string[] Orientation,
    string? Region, string[] Interests, string[] Topics, string[] Values, string?[] Lifestyle,
    int? PreferredAgeMin, int? PreferredAgeMax, string[] PreferredRegions, int InterestWeight);

/// <summary>match-score-v1 純計分規則，僅於最終分數四捨五入。</summary>
public static class MatchingScore
{
    public const string RegionVersion = "tw-county-representatives-v1";
    // 固定縣市代表點，僅作概略地理契合，不代表玩家位置。
    public static readonly IReadOnlyDictionary<string, (double Lat, double Lon)> Regions =
        new Dictionary<string, (double, double)>(StringComparer.Ordinal)
        {
            ["TW-TPE"]=(25.033,121.5654), ["TW-NWT"]=(25.012,121.465), ["TW-KEE"]=(25.128,121.741),
            ["TW-TAO"]=(24.994,121.301), ["TW-HSZ"]=(24.814,120.967), ["TW-HSQ"]=(24.839,121.018),
            ["TW-MIA"]=(24.565,120.820), ["TW-TXG"]=(24.147,120.674), ["TW-CHA"]=(24.075,120.544),
            ["TW-NAN"]=(23.960,120.971), ["TW-YUN"]=(23.709,120.543), ["TW-CYI"]=(23.481,120.449),
            ["TW-CYQ"]=(23.459,120.292), ["TW-TNN"]=(22.999,120.227), ["TW-KHH"]=(22.627,120.301),
            ["TW-PIF"]=(22.676,120.494), ["TW-ILA"]=(24.753,121.754), ["TW-HUA"]=(23.987,121.601),
            ["TW-TTT"]=(22.758,121.144), ["TW-PEN"]=(23.571,119.579), ["TW-KIN"]=(24.449,118.377),
            ["TW-LIE"]=(26.160,119.951)
        };

    /// <summary>臺灣日曆整歲，閏日成年與原個資規則一致。</summary>
    public static int Age(string birthDate, DateOnly today)
    {
        var birth = DatingProfileRules.ParseBirthDate(birthDate, today);
        var age = today.Year - birth.Year;
        return birth.AddYears(age) > today ? age - 1 : age;
    }

    /// <summary>新搜尋／新邀請的雙向相容性；舊邀請接受不得呼叫本方法重驗性向。</summary>
    public static bool Compatible(MatchingInput a, MatchingInput b, DateOnly today) =>
        Age(a.BirthDate, today) >= 18 && Age(b.BirthDate, today) >= 18 &&
        a.Orientation.Contains(b.Gender, StringComparer.Ordinal) && b.Orientation.Contains(a.Gender, StringComparer.Ordinal);

    public static double Jaccard(string[] a, string[] b)
    {
        var union = a.Union(b, StringComparer.Ordinal).Count();
        return union == 0 ? 0 : (double)a.Intersect(b, StringComparer.Ordinal).Count() / union;
    }

    public static double AgeSide(int? min, int? max, int age) =>
        Math.Max(0, 100 - 5 * Math.Max(0, Math.Max(min.HasValue ? min.Value - age : 0, max.HasValue ? age - max.Value : 0)));
    public static double DistanceScore(double km) => 100 * Math.Exp(-km / 150);
    public static double Distance(string from, string to)
    {
        if (from == to) return 0;
        var a = Regions[from]; var b = Regions[to];
        static double Rad(double value) => value * Math.PI / 180;
        var h = Math.Pow(Math.Sin(Rad(b.Lat-a.Lat)/2), 2) + Math.Cos(Rad(a.Lat))*Math.Cos(Rad(b.Lat))*Math.Pow(Math.Sin(Rad(b.Lon-a.Lon)/2), 2);
        return 6371 * 2 * Math.Asin(Math.Sqrt(Math.Clamp(h, 0, 1)));
    }
    public static double RegionSide(string[] preferred, string? region)
    {
        if (region is null || !Regions.ContainsKey(region)) return 50;
        var mapped = preferred.Where(Regions.ContainsKey).ToArray();
        return mapped.Length == 0 ? 50 : DistanceScore(mapped.Min(p => Distance(p, region)));
    }
    private static double? Average(double? a, double? b) => a.HasValue && b.HasValue ? (a+b)/2 : a ?? b;

    /// <summary>65／20／15，未啟用面向正規化；分量維持雙精度。</summary>
    public static int Calculate(MatchingInput a, MatchingInput b, DateOnly today)
    {
        var interest = .6*Jaccard(a.Interests,b.Interests)+.2*Jaccard(a.Topics,b.Topics)+.2*Jaccard(a.Values,b.Values);
        var comparable = a.Lifestyle.Zip(b.Lifestyle).Where(p => p.First is not null && p.Second is not null).ToArray();
        var lifestyle = comparable.Length == 0 ? 0 : (double)comparable.Count(p => p.First == p.Second)/comparable.Length;
        var w = (a.InterestWeight + b.InterestWeight)/200d;
        var basis = 100*(w*interest+(1-w)*lifestyle);
        double? Side(MatchingInput source, MatchingInput target) => source.PreferredAgeMin.HasValue || source.PreferredAgeMax.HasValue
            ? AgeSide(source.PreferredAgeMin,source.PreferredAgeMax,Age(target.BirthDate,today)) : null;
        var age = Average(Side(a,b),Side(b,a));
        var region = Average(a.PreferredRegions.Length > 0 ? RegionSide(a.PreferredRegions,b.Region) : null,
            b.PreferredRegions.Length > 0 ? RegionSide(b.PreferredRegions,a.Region) : null);
        return Math.Clamp((int)Math.Round((65*basis+(age.HasValue?20*age.Value:0)+(region.HasValue?15*region.Value:0)) /
            (65+(age.HasValue?20:0)+(region.HasValue?15:0)), MidpointRounding.AwayFromZero), 0, 100);
    }
}
