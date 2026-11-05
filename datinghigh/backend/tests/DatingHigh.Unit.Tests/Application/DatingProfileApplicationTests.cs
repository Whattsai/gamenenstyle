using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
using Microsoft.Extensions.Time.Testing;

namespace DatingHigh.Unit.Tests.Application;

/// <summary>本人交友資料 Application 的嚴格輸入、時區、權限及樂觀鎖測試；SQL 另由 Miniflare 驗證。</summary>
[Collection("Profile catalog compatibility")]
public sealed class DatingProfileApplicationTests
{
    private static readonly FakeTimeProvider Clock =
        new(new DateTimeOffset(2026, 11, 2, 8, 0, 0, TimeSpan.Zero));

    private static readonly CurrentUser Owner =
        new("019a281e-0000-7000-8000-000000000001",
            "019a281e-0000-7000-8000-000000000002", 1, 1800000000000);

    private static readonly string Valid = JsonSerializer.Serialize(new
    {
        expectedRevision = 1,
        nickname = " 星河旅人 ",
        bio = "喜歡劇情與手作",
        occupation = " 工程師 ",
        birthDate = "1995-08-12",
        regionCode = "TW-TPE",
        traitTagIds = new[] { "warm" },
        interestTagIds = new[] { "puzzle" },
        topicTagIds = new[] { "creative_chat" },
        valueTagIds = new[] { "creativity" },
        weekendPreference = "explore",
        sleepSchedule = "night_owl",
        conversationStyle = "warm",
        expectedInteractionFrequency = "weekly",
        relationshipMode = "friends_first",
        preferredAgeMin = 25,
        preferredAgeMax = 35,
        preferredRegionCodes = new[] { "TW-TPE" },
        sharedInterestWeight = 60, gender="diverse",romanticOrientation=new[]{"male","female"},cardVisibility=new Dictionary<string,bool>()
    });

    private static ProfileUpdateInput Read(string json) =>
        ProfileUpdateInput.Parse(Encoding.UTF8.GetBytes(json), Clock);

    [Theory]
    [InlineData("gender","\"unknown\"")]
    [InlineData("romanticOrientation","[\"male\",\"male\"]")]
    [InlineData("romanticOrientation","[\"other\"]")]
    [InlineData("cardVisibility","{\"birthDate\":true}")]
    [InlineData("cardVisibility","{\"preferredAgeMin\":true}")]
    [InlineData("cardVisibility","{\"nickname\":1}")]
    public void ProfileExtension_InvalidValuesAreRejected(string key,string value)
    {
        var json=JsonNode.Parse(Valid)!;json[key]=JsonNode.Parse(value);
        Assert.Equal("INVALID_PROFILE",Assert.Throws<DomainException>(()=>Read(json.ToJsonString())).Code);
    }
    [Fact]
    public void ProfileExtension_EmptyGenderAndOrientationCanBeSaved()
    {
        var json=JsonNode.Parse(Valid)!;json["gender"]=null;json["romanticOrientation"]=new JsonArray();
        var input=Read(json.ToJsonString());Assert.Null(input.Gender);Assert.Empty(input.RomanticOrientation!);
    }
    [Theory]
    [InlineData(null,"[]",false)]
    [InlineData("male","[]",false)]
    [InlineData(null,"[\"female\"]",false)]
    [InlineData("male","[\"female\"]",true)]
    [InlineData("female","[\"male\"]",false)]
    public async Task ProfileReady_RequiresSavedGenderAndNonemptyOrientation(string? gender,string orientation,bool ready)
    {
        var store=new ProfilePlatformSpy{ProfileOverrides=new JsonObject{["gender"]=gender,["romantic_orientation_json"]=orientation}};
        var own=await new DatingProfileService(store,Clock).ReadAsync(Owner);
        Assert.Equal(ready,own["profileReady"]!.GetValue<bool>());
    }
    [Fact,Trait("Case","AP-UT-017")]
    public async Task VersionedCatalog_AllFiveInterestCategories_PersistStableCodesRatherThanLabels()
    {
        Assert.False(string.IsNullOrWhiteSpace(ProfileCatalog.Version));
        var options=ProfileCatalog.Groups["interestTagIds"].GroupBy(v=>v.Category).Select(g=>g.First()).ToArray();
        Assert.Equal(new[]{"culture","food","outdoor","psychology","screen"},options.Select(v=>v.Category).Order().ToArray());
        var json=JsonNode.Parse(Valid)!;json["interestTagIds"]=new JsonArray(options.Select(v=>JsonValue.Create(v.Id)).ToArray());
        var store=new ProfilePlatformSpy();await new DatingProfileService(store,Clock).SaveAsync(Owner,Read(json.ToJsonString()));
        var saved=store.Calls.Single(c=>c.Command=="profile.update").Payload;
        Assert.Equal(options.Select(v=>v.Id).Order(),saved["interestTagIds"]!.AsArray().Select(v=>v!.GetValue<string>()).Order());
        Assert.Equal(new[]{"creative_chat"},saved["topicTagIds"]!.AsArray().Select(v=>v!.GetValue<string>()));
        Assert.Equal(new[]{"creativity"},saved["valueTagIds"]!.AsArray().Select(v=>v!.GetValue<string>()));
        foreach(var option in options)Assert.DoesNotContain(option.Label,saved["interestTagIds"]!.ToJsonString());
    }

    [Theory]
    [InlineData("regionCode","preferredRegionCodes","TW-LIE")]
    [InlineData("preferredRegionCodes","regionCode","TW-LIE")]
    [InlineData("traitTagIds","conversationStyle","warm")]
    [InlineData("conversationStyle","traitTagIds","warm")]
    public async Task RetiredChoice_InAnotherSavedField_DoesNotAuthorizeAddingItHere(string key,string existingKey,string code)
    {
        var group=key=="preferredRegionCodes"?"regionCode":key;var options=ProfileCatalog.Groups[group];var index=Array.FindIndex(options,v=>v.Id==code);var original=options[index];
        try{
            options[index]=original with{Active=false};var json=JsonNode.Parse(Valid)!;
            json[key]=key.EndsWith("TagIds",StringComparison.Ordinal)||key=="preferredRegionCodes"?new JsonArray(code):JsonValue.Create(code);
            var old=new JsonObject();
            if(key=="traitTagIds")old["traits_json"]="[]";
            if(existingKey=="regionCode")old["region_code"]=code;
            else if(existingKey=="traitTagIds")old["traits_json"]=new JsonArray(code).ToJsonString();
            else{
                var preferences=new JsonObject{[existingKey]=existingKey=="preferredRegionCodes"?new JsonArray(code):JsonValue.Create(code)};
                old["preferences_json"]=preferences.ToJsonString();
            }
            var store=new ProfilePlatformSpy{ProfileOverrides=old};
            Assert.Equal("INVALID_PROFILE",(await Assert.ThrowsAsync<DomainException>(()=>new DatingProfileService(store,Clock).SaveAsync(Owner,Read(json.ToJsonString())))).Code);
            Assert.DoesNotContain(store.Calls,c=>c.Command=="profile.update");
        }finally{options[index]=original;}
    }

    [Fact,Trait("Case","AP-UT-018")]
    public async Task RetiredCatalogCode_RemainsReadableAndCanBePreservedWhenEditingOtherFields()
    {
        // 只在隔離、禁並行的測試中將既有代碼停用；不憑空增加產品歷史代碼。
        var options=ProfileCatalog.Groups["interestTagIds"];var index=Array.FindIndex(options,v=>v.Id=="puzzle");var original=options[index];
        try{
            options[index]=original with{Active=false};var store=new ProfilePlatformSpy();var service=new DatingProfileService(store,Clock);
            var current=await service.ReadAsync(Owner);Assert.Equal(new[]{"puzzle"},current["interestTagIds"]!.AsArray().Select(v=>v!.GetValue<string>()));
            var retained=ProfileCatalog.Groups["interestTagIds"].Single(v=>v.Id=="puzzle");Assert.False(retained.Active);Assert.Equal(original.Label,retained.Label);Assert.Equal(original.Category,retained.Category);
            var json=JsonNode.Parse(Valid)!;json["bio"]="只修改自介";await service.SaveAsync(Owner,Read(json.ToJsonString()));
            var saved=store.Calls.Single(c=>c.Command=="profile.update").Payload;Assert.Equal(new[]{"puzzle"},saved["interestTagIds"]!.AsArray().Select(v=>v!.GetValue<string>()));
            Assert.Equal("只修改自介",saved.Text("bio"));
        }finally{options[index]=original;}
    }

    [Fact]
    public void ProfileTagSets_UseCanonicalOrdinalOrderWithoutMutatingMeaning()
    {
        var json=JsonNode.Parse(Valid)!;json["traitTagIds"]=new JsonArray("warm","calm");
        json["preferredRegionCodes"]=new JsonArray("TW-TPE","TW-KHH");
        var value=Read(json.ToJsonString());
        Assert.Equal(new[]{"calm","warm"},value.TraitTagIds);
        Assert.Equal(new[]{"TW-KHH","TW-TPE"},value.PreferredRegionCodes);
    }

    [Theory]
    [InlineData("traitTagIds")][InlineData("interestTagIds")][InlineData("topicTagIds")][InlineData("valueTagIds")]
    [InlineData("regionCode")][InlineData("preferredRegionCodes")][InlineData("weekendPreference")][InlineData("sleepSchedule")]
    [InlineData("conversationStyle")][InlineData("expectedInteractionFrequency")][InlineData("relationshipMode")]
    public async Task RetiredChoice_CannotBeNewlyAddedThroughApiButExistingSavedValueCanBePreserved(string key)
    {
        var catalog=ProfileCatalog.Groups[key=="preferredRegionCodes"?"regionCode":key];var index=catalog.Length-1;var original=catalog[index];
        try{
            catalog[index]=original with{Active=false};var json=JsonNode.Parse(Valid)!;
            var multiple=key.EndsWith("TagIds",StringComparison.Ordinal)||key=="preferredRegionCodes";
            json[key]=multiple?new JsonArray(original.Id):JsonValue.Create(original.Id);
            var input=Read(json.ToJsonString());var store=new ProfilePlatformSpy();var service=new DatingProfileService(store,Clock);
            var error=await Assert.ThrowsAsync<DomainException>(()=>service.SaveAsync(Owner,input));
            Assert.Equal(400,error.Status);Assert.Equal("INVALID_PROFILE",error.Code);Assert.DoesNotContain(store.Calls,c=>c.Command=="profile.update");
            var old=new JsonObject();
            if(key=="regionCode")old["region_code"]=original.Id;
            else if(key=="traitTagIds")old["traits_json"]=new JsonArray(original.Id).ToJsonString();
            else if(key is "interestTagIds" or "topicTagIds" or "valueTagIds"){
                var interests=new JsonObject{["interestTagIds"]=new JsonArray("puzzle"),["topicTagIds"]=new JsonArray(),["valueTagIds"]=new JsonArray()};
                interests[key]=new JsonArray(original.Id);old["interests_json"]=interests.ToJsonString();
            }else{
                var preferences=new JsonObject{["weekendPreference"]=null,["sleepSchedule"]=null,["conversationStyle"]=null,["expectedInteractionFrequency"]=null,["relationshipMode"]=null,["preferredAgeMin"]=null,["preferredAgeMax"]=null,["preferredRegionCodes"]=new JsonArray(),["sharedInterestWeight"]=50};
                preferences[key]=multiple?new JsonArray(original.Id):JsonValue.Create(original.Id);old["preferences_json"]=preferences.ToJsonString();
            }
            store.ProfileOverrides=old;Assert.Equal(2,await service.SaveAsync(Owner,input));
            var saved=store.Calls.Single(c=>c.Command=="profile.update").Payload;Assert.Equal(json[key]!.ToJsonString(),saved[key]!.ToJsonString());
            store.Calls.Clear();old["revision"]=2L;
            Assert.Equal("PROFILE_VERSION_CONFLICT",(await Assert.ThrowsAsync<DomainException>(()=>service.SaveAsync(Owner,input))).Code);
            Assert.DoesNotContain(store.Calls,c=>c.Command=="profile.update");
            store.Revoke=true;Assert.Equal("SESSION_REVOKED",(await Assert.ThrowsAsync<DomainException>(()=>service.SaveAsync(Owner,input))).Code);
        }finally{catalog[index]=original;}
    }

    [Fact,Trait("Case","AP-UT-101")]
    public async Task MaximumReachableCatalogSets_PersistCanonicalCodesWithoutDroppingSelections()
    {
        var json=JsonNode.Parse(Valid)!;
        foreach(var (key,maximum) in new[]{("traitTagIds",5),("interestTagIds",12),("topicTagIds",8),("valueTagIds",8),("preferredRegionCodes",10)}){
            var options=ProfileCatalog.Groups[key=="preferredRegionCodes"?"regionCode":key].Take(maximum).Select(v=>v.Id).ToArray();
            json[key]=new JsonArray(options.Select(v=>JsonValue.Create(v)).ToArray());
        }
        var input=Read(json.ToJsonString());Assert.Equal(5,input.TraitTagIds.Length);Assert.Equal(12,input.InterestTagIds.Length);
        // 現行topic只有6個代碼；保留規劃上限8，不捏造兩個歷史／產品選項。
        Assert.Equal(6,input.TopicTagIds.Length);Assert.Equal(8,input.ValueTagIds.Length);Assert.Equal(10,input.PreferredRegionCodes.Length);
        var store=new ProfilePlatformSpy();await new DatingProfileService(store,Clock).SaveAsync(Owner,input);
        var saved=store.Calls.Single(c=>c.Command=="profile.update").Payload;
        foreach(var key in new[]{"traitTagIds","interestTagIds","topicTagIds","valueTagIds","preferredRegionCodes"})
            Assert.Equal(json[key]!.AsArray().Select(v=>v!.GetValue<string>()).Order(),saved[key]!.AsArray().Select(v=>v!.GetValue<string>()));
    }

    [Theory,Trait("Case","AP-UT-101"),Trait("Case","AP-UT-102")]
    [InlineData("traitTagIds",5)][InlineData("interestTagIds",12)][InlineData("topicTagIds",8)]
    [InlineData("valueTagIds",8)][InlineData("preferredRegionCodes",10)]
    public void TagCollections_RejectWrongTypeUnknownDuplicateAndOversizedInput(string key,int maximum)
    {
        var codes=ProfileCatalog.Groups[key=="preferredRegionCodes"?"regionCode":key].Select(v=>v.Id).ToArray();
        JsonNode[] invalid=[JsonValue.Create(codes[0])!,new JsonArray("unknown-code"),new JsonArray(codes[0],codes[0]),
            new JsonArray(Enumerable.Range(0,maximum+1).Select(n=>JsonValue.Create(codes[n%codes.Length])).ToArray())];
        foreach(var value in invalid){var json=JsonNode.Parse(Valid)!;json[key]=value.DeepClone();Assert.Equal("INVALID_PROFILE",Assert.Throws<DomainException>(()=>Read(json.ToJsonString())).Code);}
    }

    [Theory,Trait("Case","AP-UT-102")]
    [InlineData(null,null,true)][InlineData(18,120,true)][InlineData(120,120,true)]
    [InlineData(17,35,false)][InlineData(25,121,false)][InlineData(40,25,false)]
    [InlineData(25,null,false)][InlineData(null,35,false)]
    public void PreferredAgePair_UsesInclusiveLimitsAndRejectsAnIncompleteOrReversedPair(int? minimum,int? maximum,bool accepted)
    {
        var json=JsonNode.Parse(Valid)!;json["preferredAgeMin"]=minimum;json["preferredAgeMax"]=maximum;
        if(accepted){var input=Read(json.ToJsonString());Assert.Equal(minimum,input.PreferredAgeMin);Assert.Equal(maximum,input.PreferredAgeMax);}
        else Assert.Equal("INVALID_PROFILE",Assert.Throws<DomainException>(()=>Read(json.ToJsonString())).Code);
    }

    [Fact, Trait("Case", "AP-UT-013")]
    public void ValidFullInput_TrimsUnicodeAndPreservesFixedSchema()
    {
        var form = Read(Valid);
        Assert.Equal(1, form.ExpectedRevision);
        Assert.Equal("星河旅人", form.Nickname);
        Assert.Equal("工程師", form.Occupation);
        Assert.Equal("1995-08-12", form.BirthDate);
        Assert.Equal(new[] { "puzzle" }, form.InterestTagIds);
        Assert.Equal(new[] { "creative_chat" }, form.TopicTagIds);
        Assert.Equal(new[] { "TW-TPE" }, form.PreferredRegionCodes);
    }

    [Theory, Trait("Case", "AP-UT-081")]
    [InlineData("{\"expectedRevision\":1,\"nickname\":\"甲乙\",\"nickname\":\"丙丁\"}")]
    [InlineData("{\"expectedRevision\":1,\"nickname\":\"甲乙\",\"authEmail\":\"attack@example.test\"}")]
    [InlineData("{\"expectedRevision\":1,\"nickname\":\"甲乙\"}")]
    [InlineData("[]")]
    public void MalformedIncompleteOrDuplicateInput_RejectsBeforePersistence(string json)
    {
        Assert.Equal("INVALID_PROFILE", Assert.Throws<DomainException>(() => Read(json)).Code);
    }

    [Theory, Trait("Case", "AP-UT-081")]
    [InlineData("nickname", "a")]
    [InlineData("nickname", "a\u0001b")]
    [InlineData("birthDate", "2009-08-12")]
    [InlineData("birthDate", "2026-02-30")]
    [InlineData("regionCode", "TW-????")]
    [InlineData("preferredAgeMin", "42")]
    [InlineData("sharedInterestWeight", "101")]
    public void InvalidBusinessFields_RejectsBeforePersistence(string key, string replacement)
    {
        var data = JsonNode.Parse(Valid)!.AsObject();
        data[key] = key is "preferredAgeMin" or "sharedInterestWeight"
            ? JsonValue.Create(int.Parse(replacement)) : JsonValue.Create(replacement);
        var ex = Assert.Throws<DomainException>(() => Read(data.ToJsonString()));
        Assert.Equal("INVALID_PROFILE", ex.Code);
    }

    [Fact, Trait("Case", "AP-UT-081")]
    public void NestedDuplicateIdsOrUnknownPreference_Rejected()
    {
        var data = JsonNode.Parse(Valid)!.AsObject();
        data["topicTagIds"] = JsonSerializer.SerializeToNode(new[] { "puzzle", "puzzle" });
        Assert.Equal("INVALID_PROFILE", Assert.Throws<DomainException>(() => Read(data.ToJsonString())).Code);
        data = JsonNode.Parse(Valid)!.AsObject();
        data["preferredRegionCodes"] = JsonSerializer.SerializeToNode(new[] { "TW-TPE", "TW-TPE" });
        Assert.Equal("INVALID_PROFILE", Assert.Throws<DomainException>(() => Read(data.ToJsonString())).Code);
        data = JsonNode.Parse(Valid)!.AsObject();
        data["preferencesJson"] = "{\"futureKey\":42}";
        Assert.Equal("INVALID_PROFILE", Assert.Throws<DomainException>(() => Read(data.ToJsonString())).Code);
    }

    [Fact, Trait("Case", "AP-UT-014")]
    public async Task Save_UsesVerifiedOwnerSessionAndReturnsRevision_CasConflictRejected()
    {
        var store = new ProfilePlatformSpy();
        var service = new DatingProfileService(store, Clock);
        var input = Read(Valid);
        var saved = await service.SaveAsync(Owner, input);
        Assert.Equal(2, saved);
        Assert.Equal(2,store.Calls.Count);
        Assert.Equal("profile.ensure",store.Calls[0].Command);
        Assert.Equal("profile.update", store.Calls[1].Command);
        var payload = store.Calls[1].Payload;
        Assert.Equal(Owner.AccountId, payload["accountId"]!.GetValue<string>());
        Assert.Equal(Owner.SessionId, payload["sessionId"]!.GetValue<string>());
        Assert.Equal("星河旅人", payload["nickname"]!.GetValue<string>());
        Assert.Equal("工程師", payload["occupation"]!.GetValue<string>());
        Assert.Equal(new[] { "creative_chat" }, payload["topicTagIds"]!.AsArray().Select(i => i!.GetValue<string>()));
        Assert.Null(payload["email"]);
        Assert.Null(payload["objectKey"]);
        store.Success = false;
        var ex = await Assert.ThrowsAsync<DomainException>(() => service.SaveAsync(Owner, input));
        Assert.Equal(409, ex.Status);
        Assert.Equal("PROFILE_VERSION_CONFLICT", ex.Code);
        store.Revoke = true;
        var revoked = await Assert.ThrowsAsync<DomainException>(() => service.SaveAsync(Owner, input));
        Assert.Equal(401, revoked.Status);
        Assert.Equal("SESSION_REVOKED", revoked.Code);
    }

    [Fact, Trait("Case", "AP-UT-054")]
    public async Task Read_CurrentProfileAndPhotosOnly_NoSecretsOrUserFacingEmail()
    {
        var store = new ProfilePlatformSpy();
        var service = new DatingProfileService(store, Clock);
        var result = await service.ReadAsync(Owner);
        Assert.Equal(1, result["revision"]!.GetValue<long>());
        Assert.True(result["profileReady"]!.GetValue<bool>());
        Assert.Equal("工程師", result["occupation"]!.GetValue<string>());
        Assert.Equal("male-01", result["selectedAvatarRef"]!.GetValue<string>());
        Assert.Single(result["generatedAvatars"]!.AsArray());
        Assert.Equal("019a281e-0000-7000-8000-000000000012",
            result["personalPhotos"]!.AsArray()[0]!["assetId"]!.GetValue<string>());
        var output = result.ToJsonString();
        Assert.DoesNotContain("email", output, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("object_key", output, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("private/", output, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(new[] { "profile.ensure", "profile.read", "profile.photo.list", "profile.avatar.list", "avatar.attempt.status" },
            store.Calls.Select(x => x.Command));
        store.Revoke = true;
        var ex = await Assert.ThrowsAsync<DomainException>(() => service.ReadAsync(Owner));
        Assert.Equal(401, ex.Status);
    }

    [Fact,Trait("Case","AP-UT-015"),Trait("Case","AP-UT-016"),Trait("Case","AP-UT-048")]
    public async Task Read_AdultMinimumWithOptionalOccupationAndNoPhotos_IsReadyAndKeepsBirthdayPrivate()
    {
        var store=new ProfilePlatformSpy{ProfileOverrides=new(){["occupation"]=null,["birth_date"]="2008-11-02",["selected_avatar_ref"]="female-07"},PhotoRows=new()};
        var service=new DatingProfileService(store,Clock);var input=JsonNode.Parse(Valid)!;input["occupation"]=null;input["birthDate"]="2008-11-02";
        Assert.Equal(2,await service.SaveAsync(Owner,Read(input.ToJsonString())));store.ProfileOverrides["revision"]=2L;
        var saved=store.Calls.Single(c=>c.Command=="profile.update").Payload;Assert.Null(saved["occupation"]);Assert.Equal("2008-11-02",saved.Text("birthDate"));
        var own=await service.ReadAsync(Owner);
        Assert.True(own["profileReady"]!.GetValue<bool>());Assert.Null(own["occupation"]);Assert.Empty(own["personalPhotos"]!.AsArray());
        Assert.Equal("2008-11-02",own.Text("birthDate"));Assert.Equal("female-07",own.Text("selectedAvatarRef"));
        var card=await new OwnCardPreviewService(service,Clock).ReadAsync(Owner);
        Assert.Null(card["birthDate"]);Assert.Null(card["occupation"]);Assert.Empty(card["personalPhotos"]!.AsArray());
        Assert.Equal("15–19 歲",card.Text("ageBand"));Assert.All(store.Calls,c=>Assert.DoesNotContain(c.Command,new[]{"profile.avatar.builtin","avatar.attempt.begin"}));
    }

    [Fact,Trait("Case","AP-UT-027"),Trait("Case","AP-UT-028")]
    public async Task OwnPreview_AlwaysReadsCurrentFieldsAndPhotos_GrantsNoOtherPlayerPermission()
    {
        var store=new ProfilePlatformSpy();var service=new OwnCardPreviewService(new DatingProfileService(store,Clock),Clock);
        var first=await service.ReadAsync(Owner);Assert.Equal("工程師",first.Text("occupation"));Assert.Single(first["personalPhotos"]!.AsArray());
        Assert.Equal(new[]{"puzzle"},first["interestTagIds"]!.AsArray().Select(v=>v!.GetValue<string>()));
        Assert.Equal(new[]{"assetId","createdAt","displayOrder","mimeType"},first["personalPhotos"]![0]!.AsObject().Select(v=>v.Key).Order().ToArray());
        store.ProfileOverrides=new(){["occupation"]="設計師",["bio"]="現在喜歡散步"};store.PhotoRows=new();
        var second=await service.ReadAsync(Owner);Assert.Equal("設計師",second.Text("occupation"));Assert.Equal("現在喜歡散步",second.Text("bio"));Assert.Empty(second["personalPhotos"]!.AsArray());
        Assert.Equal("工程師",first.Text("occupation"));Assert.Single(first["personalPhotos"]!.AsArray());
        Assert.Equal(2,store.Calls.Count(c=>c.Command=="profile.read"));Assert.Equal(2,store.Calls.Count(c=>c.Command=="profile.photo.list"));
        Assert.Contains("本人預覽不代表已授權",second.Text("notice"));
        foreach(var key in new[]{"email","birthDate","preferredAgeMin","preferredAgeMax","preferredRegionCodes","sharedInterestWeight","accountId","sessionId","selectedAvatarRef","object_key"})Assert.Null(second[key]);
        Assert.Equal(403,(await Assert.ThrowsAsync<DomainException>(()=>new DenyCurrentCardAuthorization().AuthorizeAsync(Owner,EntityId.New(),EntityId.New()))).Status);
        store.Revoke=true;Assert.Equal(401,(await Assert.ThrowsAsync<DomainException>(()=>service.ReadAsync(Owner))).Status);
    }

    [Theory]
    [InlineData("2008-11-02",true)][InlineData("2008-11-03",false)][InlineData(null,false)]
    public async Task Read_TrustedTaiwanAgeBoundary_CannotTreatMissingOrUnderageBirthdayAsReady(string? birthday,bool ready)
    {
        var store=new ProfilePlatformSpy{ProfileOverrides=new JsonObject{["birth_date"]=birthday},PhotoRows=[]};
        var own=await new DatingProfileService(store,Clock).ReadAsync(Owner);
        Assert.Equal(ready,own["profileReady"]!.GetValue<bool>());
        Assert.Equal(birthday,own["birthDate"]?.GetValue<string>());
        Assert.DoesNotContain(store.Calls,c=>c.Command=="profile.update");
    }

    private sealed class ProfilePlatformSpy : IPlatformClient
    {
        public bool Success = true;
        public bool Revoke;
        public JsonObject? ProfileOverrides;
        public JsonArray? PhotoRows;
        public readonly List<(string Command, JsonNode Payload)> Calls = [];

        public Task<JsonNode> ExecuteAsync(string command, object payload, CancellationToken cancellationToken = default)
        {
            Calls.Add((command, JsonSerializer.SerializeToNode(payload)!));
            if(command=="profile.avatar.list")return Task.FromResult<JsonNode>(new JsonObject{["rows"]=new JsonArray(new JsonObject{["asset_id"]="019a281e-0000-7000-8000-000000000099",["mime_type"]="image/jpeg",["created_at"]=1L})});
            if(command=="avatar.attempt.status")return Task.FromResult<JsonNode>(new JsonObject{["attempt"]=null});
            if (command == "profile.update")
                return Task.FromResult(JsonSerializer.SerializeToNode(new
                {
                    rows = Success ? new[] { new { revision = 2 } } : Array.Empty<object>(),
                    changes = new[] { Success ? 1 : 0 }
                })!);
            if (command == "session.validate")
                return Task.FromResult(JsonSerializer.SerializeToNode(new
                {
                    rows = Revoke ? Array.Empty<object>() : new object[] { new { account_id = Owner.AccountId } },
                    changes = new[] { 0 }
                })!);
            if (command == "profile.ensure")
                return Task.FromResult(JsonSerializer.SerializeToNode(new { rows = Array.Empty<object>(), changes = new[] { 0 } })!);
            if (command == "profile.read")
            {
                var rows = Revoke ? Array.Empty<object>() : new object[] { new
                {
                    profile_id = "019a281e-0000-7000-8000-000000000009",
                    nickname = "星河旅人", bio = "喜歡手作", occupation = "工程師", birth_date = "1995-08-12",
                    region_code = "TW-TPE", traits_json = "[\"warm\"]",
                    interests_json = "{\"interestTagIds\":[\"puzzle\"],\"topicTagIds\":[],\"valueTagIds\":[]}",
                    gender="diverse",romantic_orientation_json="[\"male\",\"female\"]",card_visibility_json="{}",preferences_json = "{\"weekendPreference\":null,\"sleepSchedule\":null,\"conversationStyle\":null,\"expectedInteractionFrequency\":null,\"relationshipMode\":null,\"preferredAgeMin\":null,\"preferredAgeMax\":null,\"preferredRegionCodes\":[],\"sharedInterestWeight\":50}",
                    selected_avatar_type = "builtin", selected_avatar_ref = "male-01",
                    revision = 1, created_at = 1, updated_at = 1
                } };
                var result=JsonSerializer.SerializeToNode(new { rows, changes = new[] { 0 } })!;
                if(!Revoke&&ProfileOverrides is not null)foreach(var field in ProfileOverrides)result["rows"]![0]![field.Key]=field.Value?.DeepClone();
                return Task.FromResult(result);
            }
            if (command == "profile.photo.list")
                if(PhotoRows is not null)return Task.FromResult<JsonNode>(new JsonObject{["rows"]=PhotoRows.DeepClone()});
            if (command == "profile.photo.list")
                return Task.FromResult(JsonSerializer.SerializeToNode(new
                {
                    rows = new[] { new { asset_id = "019a281e-0000-7000-8000-000000000012",
                        mime_type = "image/jpeg", display_order = 0, created_at = 1 } },
                    changes = new[] { 0 }
                })!);
            throw new InvalidOperationException(command);
        }
    }
}
