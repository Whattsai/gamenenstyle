using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;

namespace DatingHigh.Integration.Tests;

[CollectionDefinition("Catalog compatibility",DisableParallelization=true)]
public sealed class CatalogCompatibilityCollection { }

// 暫時停用一個既有代碼並在finally恢復；只影響測試程序，不修改正式目錄或捏造歷史資料。
[Collection("Catalog compatibility")]
public sealed class ProfileCatalogIntegrationTests
{
    [Fact]
    public async Task RetiredCode_NewOwnerAndReadditionAfterRemoval_RejectWithoutChangingEitherProfile()
    {
        await using var p=new RealPlatform();await p.Seed(true);const string otherEmail="catalog-second@example.test";await p.Seed(true,otherEmail);
        async Task<CurrentUser> Login(string email){var result=RealPlatform.Json((await p.App.Login(email,RealPlatform.Password,"android","127.0.0.1",default)).Body);return new(result["account"]!.Text("accountId"),result["session"]!.Text("sessionId"),1,p.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());}
        var first=await Login(RealPlatform.Email);var second=await Login(otherEmail);var service=new DatingProfileService(p,p.Clock);
        await service.ReadAsync(first);await service.ReadAsync(second);Assert.Equal(2,await service.SaveAsync(first,Form(p,1,"原本自介")));
        var options=ProfileCatalog.Groups["interestTagIds"];var index=Array.FindIndex(options,v=>v.Id=="puzzle");var original=options[index];
        async Task<string> Snapshot()=>new System.Text.Json.Nodes.JsonObject{["profiles"]=(await p.Sql("SELECT * FROM user_profiles ORDER BY account_id")).DeepClone(),["media"]=(await p.Sql("SELECT * FROM user_media_assets ORDER BY asset_id")).DeepClone()}.ToJsonString();
        try{
            options[index]=original with{Active=false};var before=await Snapshot();
            var denied=await Assert.ThrowsAsync<DomainException>(()=>service.SaveAsync(second,Form(p,1,"不可新增停用值")));
            Assert.Equal(400,denied.Status);Assert.Equal("INVALID_PROFILE",denied.Code);Assert.Equal(before,await Snapshot());
            Assert.Equal(3,await service.SaveAsync(first,Form(p,2,"可保留停用值")));Assert.Equal("puzzle",(await service.ReadAsync(first))["interestTagIds"]![0]!.GetValue<string>());
            Assert.Equal(4,await service.SaveAsync(first,Form(p,3,"移除停用值") with{InterestTagIds=[]}));Assert.Empty((await service.ReadAsync(first))["interestTagIds"]!.AsArray());
            before=await Snapshot();Assert.Equal("INVALID_PROFILE",(await Assert.ThrowsAsync<DomainException>(()=>service.SaveAsync(first,Form(p,4,"不可重新加入")))).Code);Assert.Equal(before,await Snapshot());
            Assert.Equal(1,(await service.ReadAsync(second)).Number("revision"));Assert.Empty((await service.ReadAsync(second))["interestTagIds"]!.AsArray());
        }finally{options[index]=original;}
    }
    [Fact]
    public async Task ProfileBounds_RealD1_MaximumReachableSetsTaiwanBirthdayAndInvalidWritesPreserveAllRows()
    {
        await using var p=new RealPlatform();p.Clock.SetUtcNow(new DateTimeOffset(2026,10,29,16,0,0,TimeSpan.Zero));await p.Seed(true);await p.Seed(true,"boundary-other@example.test");
        var login=RealPlatform.Json((await p.App.Login(RealPlatform.Email,RealPlatform.Password,"android","127.0.0.1",default)).Body);
        var user=new CurrentUser(login["account"]!.Text("accountId"),login["session"]!.Text("sessionId"),1,p.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());
        var service=new DatingProfileService(p,p.Clock);Assert.False((await service.ReadAsync(user))["profileReady"]!.GetValue<bool>());
        var json=JsonSerializer.SerializeToNode(Form(p,1,"界線驗證"),new JsonSerializerOptions(JsonSerializerDefaults.Web))!.AsObject();
        json["birthDate"]="2008-10-30";json["nickname"]="😀😀";
        foreach(var (key,maximum) in new[]{("traitTagIds",5),("interestTagIds",12),("topicTagIds",8),("valueTagIds",8),("preferredRegionCodes",10)})
            json[key]=new JsonArray(ProfileCatalog.Groups[key=="preferredRegionCodes"?"regionCode":key].Take(maximum).Select(v=>JsonValue.Create(v.Id)).ToArray());
        json["preferredAgeMin"]=18;json["preferredAgeMax"]=120;
        async Task<long> Save(JsonObject value)=>await service.SaveAsync(user,ProfileUpdateInput.Parse(JsonSerializer.SerializeToUtf8Bytes(value),p.Clock));
        async Task<string> Snapshot()=>new JsonObject{["profiles"]=(await p.Sql("SELECT * FROM user_profiles ORDER BY account_id")).DeepClone(),["assets"]=(await p.Sql("SELECT * FROM user_media_assets ORDER BY asset_id")).DeepClone()}.ToJsonString();
        Assert.Equal(2,await Save(json));Assert.Single((await p.ExecuteAsync("profile.avatar.builtin",new{accountId=user.AccountId,sessionId=user.SessionId,cv=user.CredentialVersion,accessExpiresAt=user.AccessExpiresAt,expectedRevision=2,avatarId="female-07"}))["rows"]!.AsArray());var own=await service.ReadAsync(user);Assert.True(own["profileReady"]!.GetValue<bool>());Assert.Equal("😀😀",own.Text("nickname"));
        foreach(var key in new[]{"traitTagIds","interestTagIds","topicTagIds","valueTagIds","preferredRegionCodes"})Assert.Equal(json[key]!.AsArray().Select(v=>v!.GetValue<string>()).Order(),own[key]!.AsArray().Select(v=>v!.GetValue<string>()));
        json["expectedRevision"]=3L;var before=await Snapshot();
        async Task Reject(JsonObject value){var error=await Assert.ThrowsAsync<DomainException>(()=>Save(value));Assert.Equal(400,error.Status);Assert.Equal("INVALID_PROFILE",error.Code);Assert.Equal(before,await Snapshot());}
        foreach(var (key,maximum) in new[]{("traitTagIds",5),("interestTagIds",12),("topicTagIds",8),("valueTagIds",8),("preferredRegionCodes",10)}){
            var code=json[key]![0]!.GetValue<string>();
            foreach(JsonNode value in new JsonNode[]{JsonValue.Create(code)!,new JsonArray("unknown-code"),new JsonArray(code,code),new JsonArray(Enumerable.Repeat(code,maximum+1).Select(v=>JsonValue.Create(v)).ToArray())}){var bad=(JsonObject)json.DeepClone();bad[key]=value.DeepClone();await Reject(bad);}
        }
        foreach(var (min,max) in new (int?,int?)[]{(17,120),(18,121),(40,25),(25,null),(null,35)}){var bad=(JsonObject)json.DeepClone();bad["preferredAgeMin"]=min;bad["preferredAgeMax"]=max;await Reject(bad);}
        foreach(var (key,value) in new[]{("birthDate","2008-10-31"),("nickname","😀"),("nickname",new string('a',13)),("nickname","a\u0001b")}){var bad=(JsonObject)json.DeepClone();bad[key]=value;await Reject(bad);}
        var unknown=(JsonObject)json.DeepClone();unknown["accountId"]=EntityId.New();await Reject(unknown);
        json["preferredAgeMin"]=null;json["preferredAgeMax"]=null;json["nickname"]=string.Concat(Enumerable.Repeat("😀",12));Assert.Equal(4,await Save(json));
        json["expectedRevision"]=4L;json["preferredAgeMin"]=120;json["preferredAgeMax"]=120;Assert.Equal(5,await Save(json));
        var last=await service.ReadAsync(user);Assert.Equal(120,last.Number("preferredAgeMin"));Assert.Equal(120,last.Number("preferredAgeMax"));Assert.True(last["profileReady"]!.GetValue<bool>());Assert.Empty(last["personalPhotos"]!.AsArray());
    }

    private static ProfileUpdateInput Form(RealPlatform p,long revision,string bio)=>ProfileUpdateInput.Parse(JsonSerializer.SerializeToUtf8Bytes(new{
        expectedRevision=revision,nickname="星河旅人",bio,occupation="工程師",birthDate="1995-01-01",regionCode="TW-TPE",
        traitTagIds=new[]{"warm"},interestTagIds=new[]{"puzzle"},topicTagIds=new[]{"creative_chat"},valueTagIds=new[]{"creativity"},
        weekendPreference="explore",sleepSchedule="night_owl",conversationStyle="warm",expectedInteractionFrequency="weekly",relationshipMode="friends_first",
        preferredAgeMin=25,preferredAgeMax=35,preferredRegionCodes=new[]{"TW-TPE"},sharedInterestWeight=60
    }),p.Clock);

    [Fact,Trait("Case","AP-IT-009")]
    public async Task RetiringKnownCode_RealApplicationD1_RetainsMeaningAndCanEditWithoutRewritingSelections()
    {
        await using var p=new RealPlatform();await p.Seed(true);
        var login=RealPlatform.Json((await p.App.Login(RealPlatform.Email,RealPlatform.Password,"android","127.0.0.1",default)).Body);
        var user=new CurrentUser(login["account"]!.Text("accountId"),login["session"]!.Text("sessionId"),1,p.Clock.GetUtcNow().AddMinutes(10).ToUnixTimeMilliseconds());
        var service=new DatingProfileService(p,p.Clock);await service.ReadAsync(user);Assert.Equal(2,await service.SaveAsync(user,Form(p,1,"原本自介")));
        var before=(await p.Sql("SELECT profile_id,interests_json FROM user_profiles WHERE account_id=?",user.AccountId))[0]!;
        var options=ProfileCatalog.Groups["interestTagIds"];var index=Array.FindIndex(options,v=>v.Id=="puzzle");var original=options[index];
        try{
            options[index]=original with{Active=false};var read=await service.ReadAsync(user);
            Assert.Equal(new[]{"puzzle"},read["interestTagIds"]!.AsArray().Select(v=>v!.GetValue<string>()));
            Assert.Equal(original.Label,options[index].Label);Assert.Equal(original.Category,options[index].Category);Assert.False(options[index].Active);
            Assert.Equal(3,await service.SaveAsync(user,Form(p,2,"只修改自介")));
            var after=(await p.Sql("SELECT profile_id,interests_json,bio,revision FROM user_profiles WHERE account_id=?",user.AccountId))[0]!;
            Assert.Equal(before.Text("profile_id"),after.Text("profile_id"));Assert.Equal(before.Text("interests_json"),after.Text("interests_json"));
            Assert.Equal("只修改自介",after.Text("bio"));Assert.Equal(3,after.Number("revision"));
            using var stored=JsonDocument.Parse(after.Text("interests_json"));Assert.Equal(new[]{"interestTagIds","topicTagIds","valueTagIds"},stored.RootElement.EnumerateObject().Select(v=>v.Name).Order().ToArray());
            Assert.Equal("puzzle",stored.RootElement.GetProperty("interestTagIds")[0].GetString());Assert.DoesNotContain(original.Label,after.Text("interests_json"));
            var current=await service.ReadAsync(user);Assert.Equal("puzzle",current["interestTagIds"]![0]!.GetValue<string>());Assert.Equal("creative_chat",current["topicTagIds"]![0]!.GetValue<string>());Assert.Equal("creativity",current["valueTagIds"]![0]!.GetValue<string>());
            Assert.Empty(await p.Sql("SELECT asset_id FROM user_media_assets"));
        }finally{options[index]=original;}
    }
}
