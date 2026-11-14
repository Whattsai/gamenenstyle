using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace DatingHigh.Domain;

/// <summary>從已提交事件投影而來的事實，不接受玩家自報旗標或私人 Profile。</summary>
public sealed record EventFacts(string[] EnteredNodes,string[] CommittedChoices,string[] CompletedBindings,IReadOnlyDictionary<string,string> Flags,string[] CompletedNarratives);
/// <summary>單次事件執行事實；去重不跨配對。</summary>
public sealed record EventOccurrence(string RoundId,string StorySessionId,string BindingKey,string RepeatGroup,string Status);
/// <summary>事件用途、出現規則及來源彼此獨立；內容由 immutable Manifest 擁有。</summary>
public sealed record EventBinding(string Scope,string SourceId,string BindingId,string EventId,string EventVersion,string RepeatGroup,string NarrativeRole,string Visibility,string SelectionMode,double Probability,string RepeatScope,string[] RequiredCapabilities,JsonObject TriggerConditions,bool RequiredForEnding,JsonObject? PresentationEffects=null)
{
    public string Key=>$"{Scope}:{SourceId}:{BindingId}";
}

/// <summary>有界且無腳本的事件 DSL 與候選合併政策；RNG 結果須由呼叫端在 D1 提交。</summary>
public static class EventRulePolicy
{
    private static void Fail()=>throw new DomainException("INVALID_STORY_CONTENT");
    private static string Identifier(JsonNode? value)
    {
        if(value is not JsonValue scalar||!scalar.TryGetValue<string>(out var text)||!Regex.IsMatch(text,"^[a-z][a-z0-9:.-]{0,159}$")){Fail();return "";}
        return text;
    }

    public static void ValidateCondition(JsonObject condition)
    {
        var count=0;
        void Check(JsonNode? node,int depth)
        {
            if(depth>8||++count>64||node is not JsonObject obj||obj.Count!=1){Fail();return;}
            var property=obj.Single();
            switch(property.Key){
                case "all":case "any":
                    if(property.Value is not JsonArray children||children.Count is <1 or >32){Fail();return;}
                    foreach(var child in children)Check(child,depth+1);break;
                case "not":Check(property.Value,depth+1);break;
                case "node_entered":case "choice_committed":case "event_completed":case "narrative_completed":_=Identifier(property.Value);break;
                case "flag_equals":
                    if(property.Value is not JsonObject flag||flag.Count!=2||!flag.ContainsKey("key")||!flag.ContainsKey("value")){Fail();return;}
                    _=Identifier(flag["key"]);_=Identifier(flag["value"]);break;
                default:Fail();break;
            }
        }
        Check(condition,0);
    }

    public static bool Evaluate(JsonObject condition,EventFacts facts)
    {
        // 先驗完整樹，避免短路求值藏入任意腳本或無界規則。
        ValidateCondition(condition);
        bool Test(JsonNode node)
        {
            var p=node.AsObject().Single();
            return p.Key switch{
                "all"=>p.Value!.AsArray().All(n=>Test(n!)),"any"=>p.Value!.AsArray().Any(n=>Test(n!)),"not"=>!Test(p.Value!),
                "node_entered"=>facts.EnteredNodes.Contains(Identifier(p.Value),StringComparer.Ordinal),
                "choice_committed"=>facts.CommittedChoices.Contains(Identifier(p.Value),StringComparer.Ordinal),
                "event_completed"=>facts.CompletedBindings.Contains(Identifier(p.Value),StringComparer.Ordinal),
                "narrative_completed"=>facts.CompletedNarratives.Contains(Identifier(p.Value),StringComparer.Ordinal),
                "flag_equals"=>facts.Flags.TryGetValue(Identifier(p.Value!["key"]),out var value)&&value==Identifier(p.Value["value"]),
                _=>false
            };
        }
        return Test(condition);
    }

    public static void ValidateBinding(EventBinding binding)
    {
        // 完整鍵用冒號分隔來源，局部來源／繫結識別不能再含分隔符。
        if(!Regex.IsMatch(binding.SourceId,"^[a-z][a-z0-9.-]{0,63}$")||!Regex.IsMatch(binding.BindingId,"^[a-z][a-z0-9.-]{0,63}$"))Fail();
        if(binding.Scope is not("narrative" or "scene" or "global")||binding.NarrativeRole is not("main" or "side")
            ||binding.Visibility is not("visible" or "hidden")||binding.SelectionMode is not("fixed" or "weighted_random")
            ||binding.RepeatScope is not("playthrough" or "round")||!double.IsFinite(binding.Probability)||binding.Probability is <0 or >1
            ||binding.RequiredCapabilities.Length>32||(binding.RequiredForEnding&&binding.NarrativeRole!="main")
            ||binding.RequiredForEnding&&binding.SelectionMode=="weighted_random"&&binding.Probability<1
            ||binding.Scope!="narrative"&&binding.NarrativeRole=="main")Fail();
        foreach(var id in new[]{binding.SourceId,binding.BindingId,binding.EventId,binding.EventVersion,binding.RepeatGroup}.Concat(binding.RequiredCapabilities))_=Identifier(JsonValue.Create(id));
        ValidateCondition(binding.TriggerConditions);
    }

    public static EventBinding[] Candidates(IEnumerable<EventBinding> bindings,string[] capabilities,EventFacts facts,IEnumerable<EventOccurrence> history,string roundId,string sessionId,Func<EventBinding,double> random)
    {
        var all=bindings.ToArray();if(all.Length>256)Fail();foreach(var binding in all)ValidateBinding(binding);
        if(all.Select(b=>b.Key).Distinct(StringComparer.Ordinal).Count()!=all.Length)Fail();
        var occurrences=history.Where(h=>h.RoundId==roundId).ToArray();var candidates=new List<EventBinding>();var groups=new HashSet<string>(StringComparer.Ordinal);
        foreach(var binding in all.OrderBy(b=>b.NarrativeRole=="main"?0:1).ThenBy(b=>b.Scope=="narrative"?0:b.Scope=="scene"?1:2).ThenBy(b=>b.Key,StringComparer.Ordinal)){
            if(!binding.RequiredCapabilities.All(c=>capabilities.Contains(c,StringComparer.Ordinal))||!Evaluate(binding.TriggerConditions,facts))continue;
            if(occurrences.Any(h=>h.StorySessionId==sessionId&&h.BindingKey==binding.Key))continue;
            if(occurrences.Any(h=>h.RepeatGroup==binding.RepeatGroup&&((h.StorySessionId==sessionId&&h.Status is "active" or "completed")||(binding.RepeatScope=="round"&&h.Status=="completed"))))continue;
            if(groups.Contains(binding.RepeatGroup))continue;
            if(binding.SelectionMode=="weighted_random"){
                var draw=random(binding);if(!double.IsFinite(draw)||draw is <0 or >=1){Fail();return [];}
                if(draw>=binding.Probability)continue;
            }
            groups.Add(binding.RepeatGroup);candidates.Add(binding);
        }
        return candidates.ToArray();
    }
}
