using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using DatingHigh.Domain;

namespace DatingHigh.Application;

/// <summary>本人交友資料的完整 PUT 輸入；只接受明確列出的欄位，不讓外部設定 accountId 或資產歸屬。</summary>
public sealed record ProfileUpdateInput(
    long ExpectedRevision, string Nickname, string Bio, string? Occupation,
    string? BirthDate, string? RegionCode,
    string[] TraitTagIds, string[] InterestTagIds, string[] TopicTagIds, string[] ValueTagIds,
    string? WeekendPreference, string? SleepSchedule, string? ConversationStyle,
    string? ExpectedInteractionFrequency, string? RelationshipMode,
    int? PreferredAgeMin, int? PreferredAgeMax, string[] PreferredRegionCodes,
    int SharedInterestWeight)
{
    private static readonly HashSet<string> Keys = new(StringComparer.Ordinal)
    {
        "expectedRevision", "nickname", "bio", "occupation", "birthDate", "regionCode",
        "traitTagIds", "interestTagIds", "topicTagIds", "valueTagIds",
        "weekendPreference", "sleepSchedule", "conversationStyle",
        "expectedInteractionFrequency", "relationshipMode",
        "preferredAgeMin", "preferredAgeMax", "preferredRegionCodes", "sharedInterestWeight"
    };

    private static readonly Regex TagPattern = new(
        "^[a-z][a-z0-9_]{0,31}$", RegexOptions.CultureInvariant | RegexOptions.Compiled);
    private static readonly Regex RegionPattern = new(
        "^TW-[A-Z]{2,4}$", RegexOptions.CultureInvariant | RegexOptions.Compiled);

    /// <summary>以嚴格 JSON 完整取代輸入解析；日期必須依伺服器可信台灣日期核對。</summary>
    public static ProfileUpdateInput Parse(ReadOnlyMemory<byte> utf8, TimeProvider clock)
    {
        if (utf8.IsEmpty || utf8.Length > 16_384)
            throw new DomainException("INVALID_PROFILE");
        try
        {
            using var json = JsonDocument.Parse(utf8, new JsonDocumentOptions { MaxDepth = 6 });
            if (json.RootElement.ValueKind != JsonValueKind.Object)
                throw new DomainException("INVALID_PROFILE");

            var fields = new Dictionary<string, JsonElement>(StringComparer.Ordinal);
            foreach (var entry in json.RootElement.EnumerateObject())
                if (!Keys.Contains(entry.Name) || !fields.TryAdd(entry.Name, entry.Value))
                    throw new DomainException("INVALID_PROFILE");
            if (fields.Count != Keys.Count)
                throw new DomainException("INVALID_PROFILE");

            long revision = Long(fields["expectedRevision"]);
            if (revision is < 1 or > int.MaxValue)
                throw new DomainException("INVALID_PROFILE");

            var nickname = DatingProfileRules.NormalizeNickname(String(fields, "nickname"));
            if (nickname.Length == 0) throw new DomainException("INVALID_PROFILE");
            var bio = DatingProfileRules.NormalizeBio(String(fields, "bio"));
            var occupation = DatingProfileRules.NormalizeOccupation(OptionalString(fields, "occupation"));
            var birth = OptionalString(fields, "birthDate");
            if (birth is not null)
            {
                var today = DatingProfileRules.TaiwanToday(clock);
                if (!DatingProfileRules.IsAdult(DatingProfileRules.ParseBirthDate(birth, today), today))
                    throw new DomainException("INVALID_PROFILE");
            }

            var region = OptionalString(fields, "regionCode");
            if (region is not null && !RegionPattern.IsMatch(region)) throw new DomainException("INVALID_PROFILE");

            var traits = Tags(fields, "traitTagIds", 5);
            var interests = Tags(fields, "interestTagIds", 12);
            var topics = Tags(fields, "topicTagIds", 8);
            var values = Tags(fields, "valueTagIds", 8);
            var weekend = Choice(fields, "weekendPreference");
            var sleep = Choice(fields, "sleepSchedule");
            var conversation = Choice(fields, "conversationStyle");
            var frequency = Choice(fields, "expectedInteractionFrequency");
            var relationship = Choice(fields, "relationshipMode");
            var minAge = Age(fields, "preferredAgeMin");
            var maxAge = Age(fields, "preferredAgeMax");
            if (minAge.HasValue != maxAge.HasValue || minAge > maxAge)
                throw new DomainException("INVALID_PROFILE");
            var regions = Tags(fields, "preferredRegionCodes", 10, RegionPattern);
            var weight = Integer(fields["sharedInterestWeight"]);
            if (weight is < 0 or > 100) throw new DomainException("INVALID_PROFILE");

            foreach(var (group,codes) in new (string,string[])[]{
                ("traitTagIds",traits),("interestTagIds",interests),("topicTagIds",topics),("valueTagIds",values),
                ("regionCode",regions.Concat(region is null?[]:new[]{region}).ToArray())
            })if(codes.Any(code=>!ProfileCatalog.Contains(group,code)))throw new DomainException("INVALID_PROFILE");
            foreach(var (group,code) in new[]{("weekendPreference",weekend),("sleepSchedule",sleep),("conversationStyle",conversation),
                ("expectedInteractionFrequency",frequency),("relationshipMode",relationship)})
                if(code is not null&&!ProfileCatalog.Contains(group,code))throw new DomainException("INVALID_PROFILE");

            return new(revision, nickname, bio, occupation, birth, region,
                traits, interests, topics, values, weekend, sleep, conversation,
                frequency, relationship, minAge, maxAge, regions, weight);
        }
        catch (JsonException) { throw new DomainException("INVALID_PROFILE"); }
        catch (InvalidOperationException) { throw new DomainException("INVALID_PROFILE"); }
        catch (FormatException) { throw new DomainException("INVALID_PROFILE"); }
    }

    private static int Integer(JsonElement e) =>
        e.ValueKind == JsonValueKind.Number && e.TryGetInt32(out var n) ? n : throw new DomainException("INVALID_PROFILE");

    private static long Long(JsonElement e) =>
        e.ValueKind == JsonValueKind.Number && e.TryGetInt64(out var n) ? n : throw new DomainException("INVALID_PROFILE");

    private static string String(Dictionary<string, JsonElement> values, string key) =>
        values[key].ValueKind == JsonValueKind.String
            ? values[key].GetString() ?? throw new DomainException("INVALID_PROFILE")
            : throw new DomainException("INVALID_PROFILE");

    private static string? OptionalString(Dictionary<string, JsonElement> values, string key) =>
        values[key].ValueKind == JsonValueKind.Null
            ? null
            : String(values, key);

    private static string? Choice(Dictionary<string, JsonElement> values, string key)
    {
        var code = OptionalString(values, key);
        if (code is not null && !TagPattern.IsMatch(code))
            throw new DomainException("INVALID_PROFILE");
        return code;
    }

    private static int? Age(Dictionary<string, JsonElement> values, string key)
    {
        if (values[key].ValueKind == JsonValueKind.Null) return null;
        var n = Integer(values[key]);
        if (n is < 18 or > 120) throw new DomainException("INVALID_PROFILE");
        return n;
    }

    private static string[] Tags(Dictionary<string, JsonElement> values, string key, int maximum,
        Regex? pattern = null)
    {
        var array = values[key];
        if (array.ValueKind != JsonValueKind.Array || array.GetArrayLength() > maximum)
            throw new DomainException("INVALID_PROFILE");
        var valid = pattern ?? TagPattern;
        var codes = array.EnumerateArray().Select(item =>
            item.ValueKind == JsonValueKind.String ? item.GetString() : null).ToArray();
        if (codes.Any(value => value is null || !valid.IsMatch(value)) ||
            codes.Distinct(StringComparer.Ordinal).Count() != codes.Length)
            throw new DomainException("INVALID_PROFILE");
        return codes.Select(code => code!).OrderBy(code=>code,StringComparer.Ordinal).ToArray();
    }
}

/// <summary>本人交友資料應用用例，僅以已驗證的 Session identity 呼叫內部固定 D1 指令。</summary>
public sealed class DatingProfileService(IPlatformClient platform, TimeProvider clock)
{
    private static object Auth(CurrentUser user) => new
    {
        accountId = user.AccountId, sessionId = user.SessionId,
        cv = user.CredentialVersion, accessExpiresAt = user.AccessExpiresAt
    };

    /// <summary>儲存完整輸入；無變更列視為版本／登入狀態衝突，不可回假成功。</summary>
    public async Task<long> SaveAsync(CurrentUser user, ProfileUpdateInput input,
        CancellationToken cancellationToken = default)
    {
        // PUT 可在初次 GET 前直接提交，須先以唯一 accountId 作冪等建立；失效 Session 在 D1 拒絕。
        await platform.ExecuteAsync("profile.ensure", new
        {
            accountId = user.AccountId, sessionId = user.SessionId,
            cv = user.CredentialVersion, accessExpiresAt = user.AccessExpiresAt,
            profileId = EntityId.New()
        }, cancellationToken);
        var retired=RetiredSelections(input).ToArray();
        if(retired.Length>0)
        {
            // 停用值只能保留本人該欄位已保存的代碼；不能靠手工PUT繞過前端的停用選項。
            var previous=(await platform.ExecuteAsync("profile.read",Auth(user),cancellationToken))["rows"]?.AsArray().FirstOrDefault();
            if(previous is null)throw new DomainException("SESSION_REVOKED",401);
            if(previous.Number("revision")!=input.ExpectedRevision)throw new DomainException("PROFILE_VERSION_CONFLICT",409);
            foreach(var (key,code) in retired)
                if(!PreviousCodes(previous,key).Contains(code,StringComparer.Ordinal))throw new DomainException("INVALID_PROFILE");
        }
        var result = await platform.ExecuteAsync("profile.update", new
        {
            accountId = user.AccountId, sessionId = user.SessionId,
            cv = user.CredentialVersion, accessExpiresAt = user.AccessExpiresAt,
            expectedRevision = input.ExpectedRevision,
            nickname = input.Nickname, bio = input.Bio, occupation = input.Occupation,
            birthDate = input.BirthDate, regionCode = input.RegionCode,
            traitTagIds = input.TraitTagIds,
            interestTagIds = input.InterestTagIds, topicTagIds = input.TopicTagIds,
            valueTagIds = input.ValueTagIds,
            weekendPreference = input.WeekendPreference, sleepSchedule = input.SleepSchedule,
            conversationStyle = input.ConversationStyle,
            expectedInteractionFrequency = input.ExpectedInteractionFrequency,
            relationshipMode = input.RelationshipMode,
            preferredAgeMin = input.PreferredAgeMin, preferredAgeMax = input.PreferredAgeMax,
            preferredRegionCodes = input.PreferredRegionCodes,
            sharedInterestWeight = input.SharedInterestWeight
        }, cancellationToken);
        var item = result["rows"]?.AsArray().FirstOrDefault();
        if (item is null)
        {
            // 0 列可表示並行 revision 過期，也可能是驗簽後 Session 在提交前被撤銷。
            // 重新查 D1 有效 family，禁止將後者誤回傳版本衝突。
            var session = await platform.ExecuteAsync("session.validate", Auth(user), cancellationToken);
            if (session["rows"]?.AsArray().Count == 0)
                throw new DomainException("SESSION_REVOKED", 401);
            throw new DomainException("PROFILE_VERSION_CONFLICT", 409);
        }
        return item.Number("revision");
    }

    /// <summary>目錄可停用而不改義；只針對本次提交的停用選項檢查既存值。</summary>
    private static IEnumerable<(string Key,string Code)> RetiredSelections(ProfileUpdateInput input)
    {
        var values=new (string Key,string[] Codes)[]{
            ("traitTagIds",input.TraitTagIds),("interestTagIds",input.InterestTagIds),("topicTagIds",input.TopicTagIds),
            ("valueTagIds",input.ValueTagIds),("preferredRegionCodes",input.PreferredRegionCodes),
            ("regionCode",input.RegionCode is null?[]:[input.RegionCode]),
            ("weekendPreference",input.WeekendPreference is null?[]:[input.WeekendPreference]),
            ("sleepSchedule",input.SleepSchedule is null?[]:[input.SleepSchedule]),
            ("conversationStyle",input.ConversationStyle is null?[]:[input.ConversationStyle]),
            ("expectedInteractionFrequency",input.ExpectedInteractionFrequency is null?[]:[input.ExpectedInteractionFrequency]),
            ("relationshipMode",input.RelationshipMode is null?[]:[input.RelationshipMode])
        };
        foreach(var (key,codes) in values)
            foreach(var code in codes)
                if(ProfileCatalog.Groups[key=="preferredRegionCodes"?"regionCode":key].Any(option=>option.Id==code&&!option.Active))yield return (key,code);
    }

    /// <summary>只讀目前D1列的同一欄位，不以其他偏好中的相同代碼授權新選。</summary>
    private static string[] PreviousCodes(JsonNode previous,string key)
    {
        try
        {
            JsonNode? value=key switch{
                "regionCode"=>JsonValue.Create(previous.Maybe("region_code")),
                "traitTagIds"=>JsonNode.Parse(previous.Text("traits_json")),
                "interestTagIds" or "topicTagIds" or "valueTagIds"=>JsonNode.Parse(previous.Text("interests_json"))?[key],
                _=>JsonNode.Parse(previous.Text("preferences_json"))?[key]
            };
            if(value is null)return [];
            return value is JsonArray array?array.Select(item=>item?.GetValue<string>()??throw new DomainException("DEPENDENCY_UNAVAILABLE",503)).ToArray():[value.GetValue<string>()];
        }
        catch(Exception error)when(error is JsonException or InvalidOperationException)
        {throw new DomainException("DEPENDENCY_UNAVAILABLE",503);}
    }

    /// <summary>只投影本人可見資料，不複製登入 email、D1 R2 key、Access 或第三方憑證。</summary>
    public async Task<JsonObject> ReadAsync(CurrentUser user, CancellationToken cancellationToken = default)
    {
        await platform.ExecuteAsync("profile.ensure", new
        {
            accountId = user.AccountId, sessionId = user.SessionId, cv = user.CredentialVersion,
            accessExpiresAt = user.AccessExpiresAt, profileId = EntityId.New()
        }, cancellationToken);

        var response = await platform.ExecuteAsync("profile.read", Auth(user), cancellationToken);
        var item = response["rows"]?.AsArray().FirstOrDefault();
        if (item is null) throw new DomainException("SESSION_REVOKED", 401);

        var photosResponse = await platform.ExecuteAsync("profile.photo.list", Auth(user), cancellationToken);
        var photos = new JsonArray();
        foreach (var photo in photosResponse["rows"]?.AsArray() ?? throw new DomainException("DEPENDENCY_UNAVAILABLE",503))
        {
            if (photo is null) throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
            photos.Add(new JsonObject
            {
                ["assetId"] = photo.Text("asset_id"),
                ["mimeType"] = photo.Text("mime_type"),
                ["displayOrder"] = photo.Number("display_order"),
                ["createdAt"] = photo.Number("created_at")
            });
        }

        var generatedResponse=await platform.ExecuteAsync("profile.avatar.list",Auth(user),cancellationToken);
        var generated=new JsonArray();
        foreach(var avatar in generatedResponse["rows"]?.AsArray()??throw new DomainException("DEPENDENCY_UNAVAILABLE",503))
        {
            if(avatar is null)throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
            generated.Add(new JsonObject{["assetId"]=avatar.Text("asset_id"),["mimeType"]=avatar.Text("mime_type"),["createdAt"]=avatar.Number("created_at")});
        }
        JsonNode ParseStored(string key) =>
            JsonNode.Parse(item.Text(key)) ?? throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        var traits = ParseStored("traits_json");
        var interests = ParseStored("interests_json");
        var preferences = ParseStored("preferences_json");
        JsonNode? attempt=null;var attemptUnavailable=false;
        try{attempt=(await platform.ExecuteAsync("avatar.attempt.status",Auth(user),cancellationToken))["attempt"]?.DeepClone();}
        catch(DomainException error)when(error.Status==503){attemptUnavailable=true;}

        var result = new JsonObject
        {
            ["nickname"] = item.Text("nickname"), ["bio"] = item.Text("bio"),
            ["occupation"] = item.Maybe("occupation"), ["birthDate"] = item.Maybe("birth_date"),
            ["regionCode"] = item.Maybe("region_code"),
            ["traitTagIds"] = traits, ["interestTagIds"] = interests["interestTagIds"]?.DeepClone(),
            ["topicTagIds"] = interests["topicTagIds"]?.DeepClone(),
            ["valueTagIds"] = interests["valueTagIds"]?.DeepClone(),
            ["weekendPreference"] = preferences["weekendPreference"]?.DeepClone(),
            ["sleepSchedule"] = preferences["sleepSchedule"]?.DeepClone(),
            ["conversationStyle"] = preferences["conversationStyle"]?.DeepClone(),
            ["expectedInteractionFrequency"] = preferences["expectedInteractionFrequency"]?.DeepClone(),
            ["relationshipMode"] = preferences["relationshipMode"]?.DeepClone(),
            ["preferredAgeMin"] = preferences["preferredAgeMin"]?.DeepClone(),
            ["preferredAgeMax"] = preferences["preferredAgeMax"]?.DeepClone(),
            ["preferredRegionCodes"] = preferences["preferredRegionCodes"]?.DeepClone()??new JsonArray(),
            ["sharedInterestWeight"] = preferences["sharedInterestWeight"]?.DeepClone()??JsonValue.Create(50),
            ["avatarAttempt"]=attempt,["avatarAttemptUnavailable"]=attemptUnavailable,
            ["selectedAvatarType"] = item.Maybe("selected_avatar_type"),
            ["selectedAvatarRef"] = item.Maybe("selected_avatar_ref"),
            ["revision"] = item.Number("revision"),
            ["personalPhotos"] = photos,
            ["generatedAvatars"]=generated,
            ["profileReady"] = DatingProfileRules.IsReady(
                item.Text("nickname"), item.Maybe("birth_date"),
                item.Maybe("selected_avatar_type"), item.Maybe("selected_avatar_ref"),
                DatingProfileRules.TaiwanToday(clock),item.Maybe("selected_avatar_type")=="generated"&&item["selected_avatar_ready"]?.GetValue<long>()==1)
        };
        return result;
    }
}
