namespace DatingHigh.Domain;

/// <summary>已發布類別的推薦資料，興趣只供內部排名。</summary>
public sealed record StoryCategoryCandidate(string CategoryId,string Code,string[] Tags,int Priority,string Status);
/// <summary>版本化場景及其類別關聯。</summary>
public sealed record SceneCandidate(string CatalogId,string SceneId,string[] CategoryCodes,string Status);
/// <summary>主線抽選輸入；穩定 ID 與內容版目錄 ID 分開。</summary>
public sealed record NarrativeCandidate(string CatalogId,string NarrativeId,string SceneCatalogId,string[] EligibleCategoryCodes,string Status,string? SequenceGroup,int? SequenceOrder,string[] Prerequisites);
/// <summary>僅含同一對玩家已完成內容的安全事實。</summary>
public sealed record PairCompletion(string AccountLowId,string AccountHighId,string SceneId,string NarrativeId);
/// <summary>同一完成場次上，真人提交的同意或撤回。</summary>
public sealed record NextConsent(int CompletedEpisodeSeq,string Actor,bool Agree,long Sequence);

/// <summary>先檢查類別、場景和有序前置，再讓所有合格主線參與抽選。</summary>
public static class NarrativeEligibilityPolicy
{
    public static PairCompletion[] ForPair(IEnumerable<PairCompletion> history,string a,string b)
    {
        if(a==b)throw new DomainException("INVALID_STORY_REQUEST");
        var low=string.CompareOrdinal(a,b)<0?a:b;var high=low==a?b:a;
        return history.Where(h=>h.AccountLowId==low&&h.AccountHighId==high).ToArray();
    }

    public static NarrativeCandidate[] Eligible(IEnumerable<NarrativeCandidate> catalog,string sceneCatalogId,string categoryCode,string a,string b,IEnumerable<PairCompletion> history)
    {
        var all=catalog.ToArray();var completed=ForPair(history,a,b).Select(h=>h.NarrativeId).ToHashSet(StringComparer.Ordinal);
        return all.Where(n=>n.Status=="published"&&n.SceneCatalogId==sceneCatalogId&&n.EligibleCategoryCodes.Contains(categoryCode,StringComparer.Ordinal)
            &&n.Prerequisites.All(completed.Contains)&&SequenceEligible(n,all,completed)).ToArray();
    }

    private static bool SequenceEligible(NarrativeCandidate n,NarrativeCandidate[] all,HashSet<string> completed)
    {
        if(n.SequenceGroup is null)return n.SequenceOrder is null;
        if(n.SequenceOrder is null or <1)return false;
        if(n.SequenceOrder==1)return true;
        // 上一章可已退休；完成事實以穩定主線 ID 比對，不因版本更新失去解鎖。
        return all.Any(previous=>previous.SequenceGroup==n.SequenceGroup&&previous.SequenceOrder==n.SequenceOrder-1&&completed.Contains(previous.NarrativeId));
    }
}

/// <summary>可注入 RNG 的 3:1 抽選；正式呼叫端須使用安全隨機來源。</summary>
public static class SceneSelectionPolicy
{
    public static T Choose<T>(IReadOnlyList<T> candidates,Func<T,bool> completed,Func<int,int> random)
    {
        if(candidates.Count==0)throw new DomainException("NO_PLAYABLE_STORY",409);
        if(candidates.Count>2000)throw new DomainException("INVALID_STORY_CONTENT");
        var weights=candidates.Select(c=>completed(c)?1:3).ToArray();var total=weights.Sum();var draw=random(total);
        if(draw<0||draw>=total)throw new DomainException("INVALID_STORY_CONTENT");
        for(var index=0;index<candidates.Count;index++){if(draw<weights[index])return candidates[index];draw-=weights[index];}
        throw new DomainException("INVALID_STORY_CONTENT");
    }
}

/// <summary>推薦真正有同類別、場景和已解鎖主線的類別；不對外輸出私人興趣。</summary>
public static class StoryCategoryRecommendationPolicy
{
    public static StoryCategoryCandidate[] Rank(IEnumerable<StoryCategoryCandidate> categories,IEnumerable<SceneCandidate> scenes,IEnumerable<NarrativeCandidate> narratives,string[] aTags,string[] bTags,string a,string b,IEnumerable<PairCompletion> history)
    {
        var sceneList=scenes.Where(s=>s.Status=="published").ToArray();var narrativeList=narratives.ToArray();var facts=history.ToArray();
        var result=categories.Where(c=>c.Status=="published"&&sceneList.Any(s=>s.CategoryCodes.Contains(c.Code,StringComparer.Ordinal)
            &&NarrativeEligibilityPolicy.Eligible(narrativeList,s.CatalogId,c.Code,a,b,facts).Length>0))
            .Select(c=>new{Category=c,Shared=c.Tags.Intersect(aTags).Intersect(bTags).Count(),A=c.Tags.Intersect(aTags).Count(),B=c.Tags.Intersect(bTags).Count()})
            .OrderByDescending(x=>x.Shared).ThenByDescending(x=>Math.Min(x.A,x.B)).ThenByDescending(x=>x.A+x.B)
            .ThenBy(x=>x.Category.Priority).ThenBy(x=>x.Category.Code,StringComparer.Ordinal).DistinctBy(x=>x.Category.Code).Take(3).Select(x=>x.Category).ToArray();
        if(result.Length==0)throw new DomainException("NO_PLAYABLE_STORY",409);
        return result;
    }
}

/// <summary>同意只聚合指定已完成場次的雙方最後有效提交；交易仍須重驗最新場次。</summary>
public static class PlaythroughLifecyclePolicy
{
    public static bool BothAgreed(IEnumerable<NextConsent> votes,int episode,string a,string b)
    {
        if(episode<1||a==b)throw new DomainException("INVALID_STORY_REQUEST");
        var latest=votes.Where(v=>v.CompletedEpisodeSeq==episode&&(v.Actor==a||v.Actor==b)).GroupBy(v=>v.Actor)
            .Select(g=>g.MaxBy(v=>v.Sequence)!).ToArray();
        return latest.Length==2&&latest.All(v=>v.Agree);
    }
}
