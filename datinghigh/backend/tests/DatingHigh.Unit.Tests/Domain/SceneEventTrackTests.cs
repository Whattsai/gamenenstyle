using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Domain;

public sealed class SceneEventTrackTests
{
    private const string Inviter="019a281e-0000-7000-8000-000000000001",Acceptor="019a281e-0000-7000-8000-000000000002";
    private static JsonObject Source()
    {
        var root=new DirectoryInfo(AppContext.BaseDirectory);while(root is not null&&!File.Exists(Path.Combine(root.FullName,"contracts","rain-bookshop-last-order.json")))root=root.Parent;
        return JsonNode.Parse(File.ReadAllText(Path.Combine(root!.FullName,"contracts","rain-bookshop-last-order.json")))!.AsObject();
    }
    private static SceneTrackContent Content()=>SceneEventTrackPolicy.Compile(Source(),"romance");
    private static TrackState Initial(SceneTrackContent content)=>SceneEventTrackPolicy.Initial(content,Inviter,Acceptor);
    private static TrackTransition Send(SceneTrackContent c,TrackState s,string actor,string binding,string action,JsonObject parameters)
    {
        var b=c.Bindings.Single(b=>b.Key.EndsWith(":"+binding,StringComparison.Ordinal));var me=s.Progress.Single(p=>p.AccountId==actor);s.Instances.TryGetValue(b.Key,out var instance);
        return SceneEventTrackPolicy.Apply(c,s,actor,new(b.Key,action,parameters,me.Revision,b.TrackScope=="shared"||b.ChangesWorld?s.SharedRevision:null,instance?.Revision));
    }
    private static JsonObject Object(string id)=>new(){["objectId"]=id};
    private static TrackState Move(SceneTrackContent c,TrackState s,string actor,string area)=>Send(c,s,actor,"move-"+(actor==Inviter?"inviter":"acceptor")+"-"+area,"enter",new(){["areaId"]=area}).State;
    private static TrackState BeforeMeet(SceneTrackContent c)
    {
        var s=Initial(c);
        s=Send(c,s,Inviter,"arrive-inviter","inspect",Object("pickup-slip-27")).State;
        s=Send(c,s,Inviter,"inspect-slip","flip",Object("pickup-slip-27")).State;
        s=Send(c,s,Inviter,"pick-slip","pick",Object("pickup-slip-27")).State;s=Move(c,s,Inviter,"counter");
        s=Send(c,s,Inviter,"place-slip","place",new(){["objectId"]="pickup-slip-27",["targetSlotId"]="counter-slot"}).State;
        s=Send(c,s,Acceptor,"arrive-acceptor","inspect",Object("reserve-bag-27")).State;
        s=Send(c,s,Acceptor,"inspect-bag","inspect",Object("reserve-bag-27")).State;
        s=Send(c,s,Acceptor,"pick-bag","pick",Object("reserve-bag-27")).State;s=Move(c,s,Acceptor,"counter");
        return Send(c,s,Acceptor,"place-bag","place",new(){["objectId"]="reserve-bag-27",["targetSlotId"]="counter-slot"}).State;
    }
    private static TrackState BeforeRescue(SceneTrackContent c)
    {
        var s=BeforeMeet(c);s=Send(c,s,Inviter,"counter-meet","submit",new(){["optionId"]="confirm-slip"}).State;s=Send(c,s,Acceptor,"counter-meet","submit",new(){["optionId"]="confirm-bag"}).State;
        s=Move(c,s,Inviter,"shelves");s=Send(c,s,Inviter,"compare-books","inspect",Object("book-wednesday")).State;
        s=Send(c,s,Acceptor,"query-title","choose",new(){["npcId"]="clerk",["dialogueOptionId"]="query-title"}).State;
        s=Send(c,s,Acceptor,"inspect-ledger","inspect",Object("reserve-ledger")).State;
        s=Send(c,s,Acceptor,"share-order-clue","submit",new(){["optionId"]="share-clue"}).State;
        // A 可以先找封套；不推進還在等便條的 I。
        s=Move(c,s,Acceptor,"window");s=Send(c,s,Acceptor,"pick-sleeve","pick",Object("green-sleeve")).State;s=Move(c,s,Acceptor,"counter");
        s=Send(c,s,Acceptor,"deliver-sleeve","place",new(){["objectId"]="green-sleeve",["targetSlotId"]="counter-slot"}).State;
        Assert.Equal("i05",s.Progress[0].NodeId);Assert.False(s.Instances.ContainsKey("narrative:rain-bookshop-last-order:wind-rescue"));
        s=Send(c,s,Inviter,"read-shared-clue","submit",new(){["optionId"]="read-note"}).State;
        s=Send(c,s,Inviter,"pick-book","pick",Object("book-rain")).State;s=Move(c,s,Inviter,"counter");
        return Send(c,s,Inviter,"deliver-book","place",new(){["objectId"]="book-rain",["targetSlotId"]="counter-slot"}).State;
    }
    [Fact]
    public void PersonalBranches_RecordOnlyTheRealChoice_AndRejoinWithoutMovingPartner()
    {
        // An engine fixture extends the formal source in memory; it is not another published story.
        var source=Source();var narrative=source["narrative"]!;var nodes=narrative["tracks"]!["inviter"]!["nodes"]!.AsArray();
        var fork=nodes.Single(n=>n!["id"]!.GetValue<string>()=="i02")!;fork["id"]="i-left";
        var right=fork.DeepClone();right["id"]="i-right";nodes.Add(right);
        var objects=source["scene"]!["sceneObjects"]!.AsArray();var other=objects.Single(o=>o!["id"]!.GetValue<string>()=="pickup-slip-27")!.DeepClone();other["id"]="other-paper";objects.Add(other);
        var bindings=narrative["eventBindings"]!.AsArray();var entry=bindings.Single(b=>b!["bindingId"]!.GetValue<string>()=="arrive-inviter")!;
        var action=entry["actions"]![0]!;action["nextNode"]="i-left";var alternate=action.DeepClone();alternate["nextNode"]="i-right";alternate["params"]!["objectId"]="other-paper";alternate["targetObjectId"]="other-paper";entry["actions"]!.AsArray().Add(alternate);
        var join=bindings.Single(b=>b!["bindingId"]!.GetValue<string>()=="inspect-slip")!;
        join["triggerConditions"]=new JsonObject{["any"]=new JsonArray(new[]{"i-left","i-right"}.Select(id=>(JsonNode)new JsonObject{["track_node_entered"]=new JsonObject{["role"]="inviter",["nodeId"]=id}}).ToArray())};
        var content=SceneEventTrackPolicy.Compile(source,"romance");
        foreach(var (objectId,nodeId) in new[]{("pickup-slip-27","i-left"),("other-paper","i-right")}){
            var initial=Initial(content);var partner=initial.Progress.Single(p=>p.Role=="acceptor");
            var chosen=Send(content,initial,Inviter,"arrive-inviter","inspect",Object(objectId)).State;
            Assert.Equal(nodeId,chosen.Progress.Single(p=>p.Role=="inviter").NodeId);Assert.Equal(partner,chosen.Progress.Single(p=>p.Role=="acceptor"));
            var fact=chosen.Instances["narrative:rain-bookshop-last-order:arrive-inviter"].State["submissions"]!["inviter"]!["inspect"]!;
            Assert.Equal(objectId,fact["params"]!["objectId"]!.GetValue<string>());Assert.Equal(nodeId,fact["nextNode"]!.GetValue<string>());
            Assert.Throws<DomainException>(()=>Send(content,chosen,Inviter,"arrive-inviter","inspect",Object(objectId=="other-paper"?"pickup-slip-27":"other-paper")));
            var merged=Send(content,chosen,Inviter,"inspect-slip","flip",Object("pickup-slip-27")).State;
            Assert.Equal("i03",merged.Progress.Single(p=>p.Role=="inviter").NodeId);Assert.Equal(partner,merged.Progress.Single(p=>p.Role=="acceptor"));Assert.Equal("i01",initial.Progress[0].NodeId);
        }
    }
    [Fact]
    public void RandomPositive_FirstSubmissionAppliesStartEffectsAndCueExactlyOnce()
    {
        var c=Content();var b=c.Bindings.Single(b=>b.Key.EndsWith(":wind-rescue"));
        b.Raw["selectionMode"]="weighted_random";b.Raw["probability"]=1d;
        var initial=BeforeRescue(c);var decisions=SceneEventTrackPolicy.Activate(c,initial,Inviter,()=>0);
        var activated=initial with{Instances=initial.Instances.Concat(decisions.Select(i=>new KeyValuePair<string,TrackInstance>(i.BindingKey,i))).ToDictionary(p=>p.Key,p=>p.Value)};
        var first=Send(c,activated,Inviter,"wind-rescue","submit",new(){["optionId"]="start"});
        Assert.Equal("at-window",first.State.World["objects"]!["order-tag-27"]!.GetValue<string>());
        Assert.Contains(first.PresentationSteps,p=>p?["cueId"]?.GetValue<string>()=="fx-gust");
        var second=Send(c,first.State,Inviter,"wind-rescue","submit",new(){["optionId"]="hold-bag"});
        Assert.DoesNotContain(second.PresentationSteps,p=>p?["cueId"]?.GetValue<string>()=="fx-gust");
        Assert.Equal("at-window",second.State.World["objects"]!["order-tag-27"]!.GetValue<string>());
    }
    [Fact]
    public void NegativeRandomDecision_BlocksAliasesInTheSameRoleGroup_WithoutAnotherDraw()
    {
        var c=Content();var template=c.Bindings.Single(b=>b.Key.EndsWith(":arrive-inviter"));var optional=template.Raw.DeepClone().AsObject();
        optional["bindingId"]="optional-note";optional["repeatGroup"]="optional-note";optional["requiredForEnding"]=false;optional["narrativeRole"]="side";optional["selectionMode"]="weighted_random";optional["probability"]=.25;optional["actions"]![0]!.AsObject().Remove("nextNode");
        var original=new TrackBindingDefinition("narrative:rain-bookshop-last-order:optional-note","inviter",template.ModuleType,optional);
        TrackBindingDefinition Alias(string name,string mode){var raw=optional.DeepClone().AsObject();raw["scope"]="global";raw["sourceId"]="global";raw["bindingId"]=name;raw["selectionMode"]=mode;if(mode=="fixed")raw["probability"]=1;return new("global:global:"+name,"inviter",original.ModuleType,raw);}
        var randomAlias=Alias("random-alias","weighted_random");var fixedAlias=Alias("fixed-alias","fixed");c=c with{Bindings=[..c.Bindings,original,randomAlias,fixedAlias]};
        var state=Initial(c);var draws=0;var decisions=SceneEventTrackPolicy.Activate(c,state,Inviter,()=>{draws++;return .75;});Assert.Single(decisions);Assert.Equal(1,draws);
        var saved=state with{Instances=decisions.ToDictionary(i=>i.BindingKey)};
        Assert.Empty(SceneEventTrackPolicy.Activate(c,saved,Inviter,()=>throw new Exception("a negative semantic decision cannot reroll through an alias")));
        Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,saved,Inviter),a=>a.BindingKey==fixedAlias.Key);Assert.Contains(SceneEventTrackPolicy.Available(c,saved,Inviter),a=>a.BindingKey==template.Key);
        Assert.Throws<DomainException>(()=>Send(c,saved,Inviter,"fixed-alias","inspect",Object("pickup-slip-27")));
    }
    [Fact]
    public void RequiredMain_ReservesItsSemanticGroup_AndOptionalGlobalAliasCannotConsumeIt()
    {
        var c=Content();var main=c.Bindings.Single(b=>b.Key.EndsWith(":arrive-inviter"));var raw=main.Raw.DeepClone().AsObject();raw["scope"]="global";raw["sourceId"]="global";raw["bindingId"]="global-alias";raw["requiredForEnding"]=false;raw["narrativeRole"]="side";raw["selectionMode"]="weighted_random";raw["probability"]=.5;
        var alias=new TrackBindingDefinition("global:global:global-alias","inviter",main.ModuleType,raw);c=c with{Bindings=[..c.Bindings,alias]};var state=Initial(c);
        Assert.Empty(SceneEventTrackPolicy.Activate(c,state,Inviter,()=>throw new Exception("the required main must retain its group")));
        Assert.Contains(SceneEventTrackPolicy.Available(c,state,Inviter),a=>a.BindingKey==main.Key);
        raw["selectionMode"]="fixed";raw["probability"]=1;Assert.Throws<DomainException>(()=>Send(c,state,Inviter,"global-alias","inspect",Object("pickup-slip-27")));
        Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,state,Inviter),a=>a.BindingKey==alias.Key);
    }
    [Fact]
    public void RandomSide_UsesCommittedTriggerOnce_PersistsNegativeAndNeverRerollsOrLeaksOtherRole()
    {
        var c=Content();var b=c.Bindings.Single(b=>b.Key.EndsWith(":arrive-inviter"));b.Raw["requiredForEnding"]=false;b.Raw["narrativeRole"]="side";b.Raw["visibility"]="hidden";b.Raw["selectionMode"]="weighted_random";b.Raw["probability"]=.25;
        var s=Initial(c);var calls=0;var no=SceneEventTrackPolicy.Activate(c,s,Inviter,()=>{calls++;return .75;});
        Assert.Single(no);Assert.Equal("cancelled",no[0].Status);Assert.Equal(1,calls);Assert.Empty(s.Instances);
        var saved=s with{Instances=no.ToDictionary(i=>i.BindingKey)};Assert.Empty(SceneEventTrackPolicy.Activate(c,saved,Inviter,()=>throw new Exception("must not reroll")));
        Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,saved,Inviter),a=>a.BindingKey==b.Key);
        Assert.Empty(SceneEventTrackPolicy.Activate(c,s,Acceptor,()=>throw new Exception("must not activate partner's hidden event")));
        Assert.Throws<DomainException>(()=>Send(c,s,Inviter,"arrive-inviter","inspect",Object("pickup-slip-27")));
        var yes=SceneEventTrackPolicy.Activate(c,s,Inviter,()=>0);Assert.Equal("active",yes.Single().Status);
        saved=s with{Instances=yes.ToDictionary(i=>i.BindingKey)};Assert.Contains(SceneEventTrackPolicy.Available(c,saved,Inviter),a=>a.BindingKey==b.Key);
        Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.Activate(c,s,Inviter,()=>1));
        b.Raw["triggerConditions"]=new JsonObject{["track_node_entered"]=new JsonObject{["role"]="inviter",["nodeId"]="i08"}};
        Assert.Empty(SceneEventTrackPolicy.Activate(c,s,Inviter,()=>throw new Exception("unqualified must not draw")));
    }
    [Fact]
    public void Initial_TwoDifferentRolesEntriesAndAreas_NoThirdProgress()
    {
        var c=Content();var s=Initial(c);Assert.Equal(2,s.Progress.Length);
        Assert.Equal(("i01","entrance",1L),(s.Progress[0].NodeId,s.Progress[0].AreaId,s.Progress[0].Revision));
        Assert.Equal(("a01","shelves",1L),(s.Progress[1].NodeId,s.Progress[1].AreaId,s.Progress[1].Revision));
        Assert.Equal(1,s.SharedRevision);Assert.Empty(s.Instances);
        Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.Initial(c,Inviter,Inviter));
    }
    [Fact]
    public void PersonalAction_AdvancesOnlyCaller_LeavesInputAndPartnerUntouched()
    {
        var c=Content();var s=Initial(c);var result=Send(c,s,Inviter,"arrive-inviter","inspect",Object("pickup-slip-27"));
        Assert.Equal("i02",result.State.Progress[0].NodeId);Assert.Equal(s.Progress[1],result.State.Progress[1]);Assert.Equal("i01",s.Progress[0].NodeId);
        Assert.Equal(s.SharedRevision,result.State.SharedRevision);Assert.Single(result.ChangedProgress);Assert.Empty(s.Instances);
        Assert.Throws<DomainException>(()=>Send(c,s,Acceptor,"arrive-inviter","inspect",Object("pickup-slip-27")));
    }
    [Fact]
    public void SharedEvent_FirstRealSubmissionPersists_SecondSplitsBothTracks()
    {
        var c=Content();var s=BeforeMeet(c);var first=Send(c,s,Inviter,"counter-meet","submit",new(){["optionId"]="confirm-slip"});
        Assert.Equal("active",first.Instance.Status);Assert.Equal("i03",first.State.Progress[0].NodeId);Assert.Equal("a03",first.State.Progress[1].NodeId);
        Assert.Single(first.ChangedProgress);Assert.Equal(s.SharedRevision+1,first.State.SharedRevision);
        var second=Send(c,first.State,Acceptor,"counter-meet","submit",new(){["optionId"]="confirm-bag"});
        Assert.Equal("completed",second.Instance.Status);Assert.Equal("i04",second.State.Progress[0].NodeId);Assert.Equal("a04",second.State.Progress[1].NodeId);
        Assert.Equal("searching",second.State.World["flags"]!["order-status"]!.GetValue<string>());
        Assert.Throws<DomainException>(()=>Send(c,second.State,Acceptor,"counter-meet","submit",new(){["optionId"]="confirm-bag"}));
    }
    [Fact]
    public void InvalidActorParamsOrRevision_RejectsWithoutChangingAnyFact()
    {
        var c=Content();var s=Initial(c);var binding=c.Bindings.Single(b=>b.Key.EndsWith(":arrive-inviter"));
        foreach(var actor in new[]{Acceptor,"019a281e-0000-7000-8000-000000000003"})Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.Apply(c,s,actor,new(binding.Key,"inspect",Object("pickup-slip-27"),1,null,null)));
        foreach(var parameters in new[]{new JsonObject{["objectId"]="missing"},new JsonObject{["objectId"]="pickup-slip-27",["role"]="acceptor"},new JsonObject{["objectId"]="pickup-slip-27",["nextNode"]="i08"}})Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.Apply(c,s,Inviter,new(binding.Key,"inspect",parameters,1,null,null)));
        Assert.Throws<DomainException>(()=>SceneEventTrackPolicy.Apply(c,s,Inviter,new(binding.Key,"inspect",Object("pickup-slip-27"),2,null,null)));
        Assert.Equal("i01",s.Progress[0].NodeId);Assert.Empty(s.Instances);Assert.Equal(1,s.SharedRevision);
    }
    [Fact]
    public void PrivateNpcClue_RequiresCallerInteractionAndExplicitShare()
    {
        var c=Content();var s=BeforeMeet(c);s=Send(c,s,Inviter,"counter-meet","submit",new(){["optionId"]="confirm-slip"}).State;s=Send(c,s,Acceptor,"counter-meet","submit",new(){["optionId"]="confirm-bag"}).State;
        s=Move(c,s,Inviter,"shelves");s=Send(c,s,Inviter,"compare-books","inspect",Object("book-rain")).State;
        Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,s,Inviter),a=>a.BindingKey.EndsWith(":pick-book"));
        s=Send(c,s,Acceptor,"query-title","choose",new(){["npcId"]="clerk",["dialogueOptionId"]="query-title"}).State;
        s=Send(c,s,Acceptor,"inspect-ledger","inspect",Object("reserve-ledger")).State;
        Assert.Equal("private",s.World["flags"]!["order-clue"]!.GetValue<string>());
        Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,s,Inviter),a=>a.BindingKey.EndsWith(":read-shared-clue"));
        s=Send(c,s,Acceptor,"share-order-clue","submit",new(){["optionId"]="share-clue"}).State;
        Assert.Contains(SceneEventTrackPolicy.Available(c,s,Inviter),a=>a.BindingKey.EndsWith(":read-shared-clue"));
        Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,s,Inviter),a=>a.BindingKey.EndsWith(":query-title"));
    }
    [Fact]
    public void RoundRepeatHistory_BlocksOnlyTheSameRoleGroup_WhileFreshPlaythroughAndNewPairRemainEligible()
    {
        var c=Content();var b=c.Bindings.Single(b=>b.Key.EndsWith(":arrive-inviter"));b.Raw["repeatScope"]="round";
        var initial=Initial(c);var history=new[]{new TrackOccurrence(b.Key,"inviter",b.Raw["repeatGroup"]!.GetValue<string>(),"completed")};
        var next=initial with{History=history};Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,next,Inviter),a=>a.BindingKey==b.Key);
        Assert.Contains(SceneEventTrackPolicy.Available(c,next,Acceptor),a=>a.BindingKey.EndsWith(":arrive-acceptor"));
        Assert.Contains(SceneEventTrackPolicy.Available(c,initial,Inviter),a=>a.BindingKey==b.Key);
        b.Raw["repeatScope"]="playthrough";Assert.Contains(SceneEventTrackPolicy.Available(c,next,Inviter),a=>a.BindingKey==b.Key);
    }
    [Fact]
    public void RepeatGroup_IsIsolatedByRoleButDeduplicatedWithinSameRole()
    {
        var c=Content();var s=Initial(c);var first=c.Bindings.Single(b=>b.Key.EndsWith(":arrive-inviter"));var other=c.Bindings.Single(b=>b.Key.EndsWith(":arrive-acceptor"));
        first.Raw["repeatGroup"]="shared-kind";other.Raw["repeatGroup"]="shared-kind";
        s=Send(c,s,Inviter,"arrive-inviter","inspect",Object("pickup-slip-27")).State;
        Assert.Contains(SceneEventTrackPolicy.Available(c,s,Acceptor),a=>a.BindingKey==other.Key);
        var second=c.Bindings.Single(b=>b.Key.EndsWith(":inspect-slip"));second.Raw["repeatGroup"]="shared-kind";
        Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,s,Inviter),a=>a.BindingKey==second.Key);
    }
    [Fact]
    public void WindRescue_FirstTriggerMovesTagOnce_OnlyAcceptorCanRetrieve_AndOnlyA08IsReleased()
    {
        var c=Content();var s=BeforeRescue(c);var start=Send(c,s,Inviter,"wind-rescue","submit",new(){["optionId"]="start"});s=start.State;
        Assert.Equal("at-window",s.World["objects"]!["order-tag-27"]!.GetValue<string>());Assert.Contains(start.PresentationSteps,p=>p?["cueId"]?.GetValue<string>()=="fx-gust");
        var held=Send(c,s,Inviter,"wind-rescue","submit",new(){["optionId"]="hold-bag"});s=held.State;
        Assert.DoesNotContain(held.PresentationSteps,p=>p?["cueId"]?.GetValue<string>()=="fx-gust");Assert.Equal("active",held.Instance.Status);
        Assert.Throws<DomainException>(()=>Send(c,s,Inviter,"wind-rescue","submit",new(){["optionId"]="retrieve-tag"}));
        s=Move(c,s,Acceptor,"window");s=Send(c,s,Acceptor,"wind-rescue","submit",new(){["optionId"]="retrieve-tag"}).State;
        Assert.Equal("held-acceptor",s.World["objects"]!["order-tag-27"]!.GetValue<string>());Assert.Equal("active",s.Instances[held.Binding.Key].Status);
        s=Move(c,s,Acceptor,"counter");var last=Send(c,s,Acceptor,"wind-rescue","submit",new(){["optionId"]="place-tag"});
        Assert.Equal("completed",last.Instance.Status);Assert.Equal("i08",last.State.Progress[0].NodeId);Assert.Equal("a08",last.State.Progress[1].NodeId);Assert.Single(last.ChangedProgress);
        Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,last.State,Inviter),a=>a.BindingKey.EndsWith(":verify-order"));
    }
    [Theory]
    [InlineData("look_back","look_back","e01")]
    [InlineData("look_back","rest_chat","e02")]
    [InlineData("rest_chat","look_back","e02")]
    [InlineData("rest_chat","rest_chat","e02")]
    public void FinalChoices_SecondRealSubmissionCompletesWithoutExtraCommand_AndSealsSideEvents(string inviterChoice,string acceptorChoice,string ending)
    {
        var c=Content();var s=BeforeRescue(c);s=Send(c,s,Inviter,"wind-rescue","submit",new(){["optionId"]="hold-bag"}).State;
        s=Move(c,s,Acceptor,"window");s=Send(c,s,Acceptor,"wind-rescue","submit",new(){["optionId"]="retrieve-tag"}).State;s=Move(c,s,Acceptor,"counter");s=Send(c,s,Acceptor,"wind-rescue","submit",new(){["optionId"]="place-tag"}).State;
        Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,s,Inviter),a=>a.BindingKey.EndsWith(":final-exchange"));
        s=Send(c,s,Acceptor,"verify-order","submit",new(){["optionId"]="verify-order"}).State;
        var first=Send(c,s,Inviter,"final-exchange","submit",new(){["optionId"]=inviterChoice});Assert.False(first.State.Completed);Assert.Null(first.EndingId);
        var result=Send(c,first.State,Acceptor,"final-exchange","submit",new(){["optionId"]=acceptorChoice});
        Assert.True(result.State.Completed);Assert.Equal(ending,result.EndingId);Assert.DoesNotContain(result.State.Instances.Values,i=>i.Status=="active");Assert.Empty(SceneEventTrackPolicy.Available(c,result.State,Inviter));
        Assert.Equal("i08",result.State.Progress[0].NodeId);Assert.Equal("a08",result.State.Progress[1].NodeId);
        Assert.Throws<DomainException>(()=>Send(c,result.State,Acceptor,"final-exchange","submit",new(){["optionId"]=acceptorChoice}));
    }

    [Fact]
    public void RepeatableBinding_KeepsEnteredNodesAfterTheSameStepOverwritesItsLatestSubmission()
    {
        var source=Source();var narrative=source["narrative"]!;var nodes=narrative["tracks"]!["inviter"]!["nodes"]!.AsArray();
        foreach(var id in new[]{"i-loop-first","i-loop-second"}){var node=nodes[0]!.DeepClone();node["id"]=id;nodes.Add(node);}
        source["scene"]!["sharedFlags"]!.AsArray().Add(new JsonObject{["id"]="loop-once",["values"]=new JsonArray("no","yes"),["initialValue"]="no",["publicValues"]=new JsonArray()});
        var bindings=narrative["eventBindings"]!.AsArray();var entry=bindings.Single(b=>b!["bindingId"]!.GetValue<string>()=="arrive-inviter")!;
        JsonObject Entered(string id)=>new(){["track_node_entered"]=new JsonObject{["role"]="inviter",["nodeId"]=id}};
        var loop=entry.DeepClone();loop["bindingId"]="loop-observation";loop["repeatGroup"]="loop-observation";loop["narrativeRole"]="side";loop["requiredForEnding"]=false;loop["completionMode"]="repeatable";loop["actions"]=new JsonArray();
        foreach(var (objectId,condition,next) in new[]{("loop-paper-first",(JsonObject)new(){["shared_flag_equals"]=new JsonObject{["key"]="loop-once",["value"]="no"}},"i-loop-first"),("loop-paper-second",Entered("i-loop-first"),"i-loop-second"),("loop-paper-return",Entered("i-loop-second"),"i01")}){
            var obj=source["scene"]!["sceneObjects"]![0]!.DeepClone();obj["id"]=objectId;obj["previewPlacement"]=null;obj.AsObject().Remove("previewPlacement");source["scene"]!["sceneObjects"]!.AsArray().Add(obj);
            var action=entry["actions"]![0]!.DeepClone();action["params"]!["objectId"]=objectId;action["targetObjectId"]=objectId;action["conditions"]=condition;action["nextNode"]=next;action["presentationSteps"]=new JsonArray();
            action["worldEffects"]=objectId=="loop-paper-first"?new JsonArray(new JsonObject{["type"]="flag",["flagId"]="loop-once",["value"]="yes"}):new JsonArray();loop["actions"]!.AsArray().Add(action);
        }
        bindings.Add(loop);entry["triggerConditions"]=Entered("i-loop-first");
        var c=SceneEventTrackPolicy.Compile(source,"romance");var initial=Initial(c);var state=initial;
        foreach(var id in new[]{"loop-paper-first","loop-paper-second","loop-paper-return"})state=Send(c,state,Inviter,"loop-observation","inspect",Object(id)).State;
        Assert.Equal("i01",state.Progress.Single(p=>p.Role=="inviter").NodeId);Assert.Equal(initial.Progress.Single(p=>p.Role=="acceptor"),state.Progress.Single(p=>p.Role=="acceptor"));
        Assert.True(SceneEventTrackPolicy.Evaluate(c,state,Entered("i-loop-first")));Assert.False(SceneEventTrackPolicy.Evaluate(c,initial,Entered("i-loop-first")));
        Assert.Equal("i02",Send(c,state,Inviter,"arrive-inviter","inspect",Object("pickup-slip-27")).State.Progress.Single(p=>p.Role=="inviter").NodeId);
        Assert.Equal("i01",state.Progress.Single(p=>p.Role=="inviter").NodeId);
    }

    [Fact]
    public void SameImmutableDefinition_CanBeSideOrMainInDifferentNarrativeBindings()
    {
        var main=Source();var side=JsonNode.Parse(main.ToJsonString().Replace("rain-bookshop-last-order","fixture-side-story",StringComparison.Ordinal))!.AsObject();
        var mainBinding=main["narrative"]!["eventBindings"]![0]!;var sideBinding=side["narrative"]!["eventBindings"]![0]!;sideBinding["narrativeRole"]="side";sideBinding["requiredForEnding"]=false;
        Assert.True(JsonNode.DeepEquals(mainBinding["definition"],sideBinding["definition"]));Assert.True(JsonNode.DeepEquals(main["eventDefinitions"],side["eventDefinitions"]));
        var a=SceneEventTrackPolicy.Compile(main,"romance");var b=SceneEventTrackPolicy.Compile(side,"romance");var first=Send(a,Initial(a),Inviter,"arrive-inviter","inspect",Object("pickup-slip-27"));var second=Send(b,Initial(b),Inviter,"arrive-inviter","inspect",Object("pickup-slip-27"));
        Assert.Equal("main",first.Binding.Raw["narrativeRole"]!.GetValue<string>());Assert.Equal("side",second.Binding.Raw["narrativeRole"]!.GetValue<string>());Assert.NotEqual(first.Binding.Key,second.Binding.Key);
        Assert.Equal("completed",first.Instance.Status);Assert.Equal("completed",second.Instance.Status);Assert.Single(first.State.Instances);Assert.Single(second.State.Instances);
        Assert.Throws<DomainException>(()=>Send(a,first.State,Inviter,"arrive-inviter","inspect",Object("pickup-slip-27")));Assert.Throws<DomainException>(()=>Send(b,second.State,Inviter,"arrive-inviter","inspect",Object("pickup-slip-27")));
    }

    [Fact]
    public void LockedPrivateBookAnswer_CannotBeInferredFromDifferentParameterErrors()
    {
        var c=Content();var s=BeforeMeet(c);s=Send(c,s,Inviter,"counter-meet","submit",new(){["optionId"]="confirm-slip"}).State;s=Send(c,s,Acceptor,"counter-meet","submit",new(){["optionId"]="confirm-bag"}).State;
        s=Move(c,s,Inviter,"shelves");s=Send(c,s,Inviter,"compare-books","inspect",Object("book-wednesday")).State;s=Send(c,s,Acceptor,"query-title","choose",new(){["npcId"]="clerk",["dialogueOptionId"]="query-title"}).State;s=Send(c,s,Acceptor,"inspect-ledger","inspect",Object("reserve-ledger")).State;
        var before=s.World.ToJsonString();foreach(var candidate in new[]{"book-wednesday","book-rain","unknown-book"}){
            var error=Assert.Throws<DomainException>(()=>Send(c,s,Inviter,"pick-book","pick",Object(candidate)));Assert.Equal("EVENT_STATE_CONFLICT",error.Code);Assert.Equal(409,error.Status);
        }
        Assert.Equal(before,s.World.ToJsonString());Assert.Equal("private",s.World["flags"]!["order-clue"]!.GetValue<string>());Assert.DoesNotContain(SceneEventTrackPolicy.Available(c,s,Inviter),a=>a.BindingKey.EndsWith(":pick-book"));
    }
}
