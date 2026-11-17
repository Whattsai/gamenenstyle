using System.Globalization;
using System.Text;

namespace DatingHigh.Domain;

/// <summary>已發布內容的最小推薦輸入，不含私人 Profile 投影。</summary>
public sealed record StoryCandidate(string CatalogId,string StoryId,string Version,string[] Tags,int Priority);
/// <summary>可重現的雙方均衡推薦；交易內仍須重驗權威輸入。</summary>
public static class StoryRecommendationPolicy
{
    public static StoryCandidate[] Rank(IEnumerable<StoryCandidate> catalog,string[] a,string[] b)=>catalog
        .Select(c=>new{c,shared=c.Tags.Intersect(a).Intersect(b).Count(),a=c.Tags.Intersect(a).Count(),b=c.Tags.Intersect(b).Count()})
        .OrderByDescending(x=>x.shared).ThenByDescending(x=>Math.Min(x.a,x.b)).ThenByDescending(x=>x.a+x.b)
        .ThenBy(x=>x.c.Priority).ThenBy(x=>x.c.StoryId,StringComparer.Ordinal).DistinctBy(x=>x.c.StoryId).Take(3).Select(x=>x.c).ToArray();
}
/// <summary>真人選票的業務投影；事件 sequence 是提交順序。</summary>
public sealed record StoryVote(int EpisodeSeq,string Actor,string CatalogId,long Sequence);
/// <summary>只使用指定場次雙方的最後有效票；原邀請方只處理真人已提交票的平手。</summary>
public static class StorySelectionPolicy
{
    public static string? Resolve(IEnumerable<StoryVote> votes,int episode,string a,string b,string initiator)
    {
        if(initiator!=a&&initiator!=b)throw new DomainException("INVALID_STORY_VOTE");
        var latest=votes.Where(v=>v.EpisodeSeq==episode&&(v.Actor==a||v.Actor==b)).GroupBy(v=>v.Actor).ToDictionary(g=>g.Key,g=>g.MaxBy(v=>v.Sequence)!);
        return latest.Count==2?latest[initiator].CatalogId:null;
    }
}
/// <summary>純文字訊息依 Unicode scalar 驗證；UI 只以文字渲染。</summary>
public static class StoryMessagePolicy
{
    public static string Validate(string input)
    {
        try{
            _=new UTF8Encoding(false,true).GetByteCount(input);
            if(input.EnumerateRunes().Any(r=>Rune.GetUnicodeCategory(r)==UnicodeCategory.Control)||System.Text.RegularExpressions.Regex.IsMatch(input,@"<[^>]+>"))throw new DomainException("INVALID_STORY_REQUEST");
            var text=input.Trim();if(text.EnumerateRunes().Count() is <1 or >500)throw new DomainException("INVALID_STORY_REQUEST");return text;
        }catch(EncoderFallbackException){throw new DomainException("INVALID_STORY_REQUEST");}
    }
}
