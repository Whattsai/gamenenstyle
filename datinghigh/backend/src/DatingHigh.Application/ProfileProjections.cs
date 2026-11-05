using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Application;

/// <summary>純投影白名單；本類不授權。跨帳號呼叫者必須另經未來服務的每次授權，不能直接公開。</summary>
public static class ProfileProjections
{
    private static JsonObject Copy(JsonObject own,params string[] keys)
    {
        var result=new JsonObject();foreach(var key in keys)result[key]=own[key]?.DeepClone();return result;
    }
    private static int? Age(JsonObject own,DateOnly today)
    {
        if(own.Maybe("birthDate") is not string value)return null;
        var birth=DatingProfileRules.ParseBirthDate(value,today);var age=today.Year-birth.Year;
        if(birth.AddYears(age)>today)age--;return age;
    }
    /// <summary>配對演算法可用目前年齡及偏好，不能取得照片／職業／登入資料。</summary>
    public static JsonObject MatchingInput(JsonObject own,DateOnly today)
    {
        var age=Age(own,today);if(age is null or <18)throw new DomainException("PROFILE_NOT_READY",409);
        var result=Copy(own,"gender","romanticOrientation","regionCode","interestTagIds","topicTagIds","valueTagIds","weekendPreference","sleepSchedule","conversationStyle","expectedInteractionFrequency","relationshipMode","preferredAgeMin","preferredAgeMax","preferredRegionCodes","sharedInterestWeight");
        result["age"]=age.Value;return result;
    }
    /// <summary>有限公開角色投影；只用遊戲化身引用，絕不以真人照片當一般頭像。</summary>
    public static JsonObject CandidatePersona(JsonObject own)=>Copy(own,"nickname","bio","traitTagIds","interestTagIds","selectedAvatarType","selectedAvatarRef");
    /// <summary>當前名片欄位，不建立快照或回傳私有擇偶條件。</summary>
    public static JsonObject CurrentCardFields(JsonObject own,DateOnly today)
    {
        var result=new JsonObject();
        var settings=own["cardVisibility"]?.Deserialize<Dictionary<string,bool>>()??new();
        foreach(var field in ProfileFields.All.Where(f=>ProfileFields.Visible(f,settings))){
            var key=field.CardKey??field.Key;
            if(key=="ageBand"){
                var age=Age(own,today);if(age.HasValue)result[key]=$"{age/5*5}–{age/5*5+4} 歲";
            }else if(key=="personalPhotos"){
                var photos=new JsonArray();
                foreach(var photo in own[key]?.AsArray()??new JsonArray()){
                    if(photo is null)continue;var safe=new JsonObject();
                    foreach(var name in new[]{"assetId","mimeType","displayOrder","createdAt"})safe[name]=photo[name]?.DeepClone();photos.Add(safe);
                }
                result[key]=photos;
            }else result[key]=own[field.Key]?.DeepClone();
        }
        return result;
    }
}

/// <summary>後續互動服務實作；必須每次驗同輪參與、雙方同意及未終止，不能信任 client boolean。</summary>
public interface ICurrentCardAuthorization
{
    Task AuthorizeAsync(CurrentUser requester,string ownerAccountId,string interactionId,CancellationToken ct=default);
}
/// <summary>尚未實作後續 SPEC 時，所有跨帳號名片授權一律拒絕。</summary>
public sealed class DenyCurrentCardAuthorization:ICurrentCardAuthorization
{
    public Task AuthorizeAsync(CurrentUser requester,string ownerAccountId,string interactionId,CancellationToken ct=default)=>throw new DomainException("RESOURCE_FORBIDDEN",403);
}
/// <summary>本人名片預覽用白名單；不是他人名片授權、歷史快照或交換流程。</summary>
public sealed class OwnCardPreviewService(DatingProfileService profiles,TimeProvider clock)
{
    public async Task<JsonObject> ReadAsync(CurrentUser user,CancellationToken ct=default)
    {
        var own=await profiles.ReadAsync(user,ct);
        var result=ProfileProjections.CurrentCardFields(own,DatingProfileRules.TaiwanToday(clock));
        result["notice"]="只有未來該輪雙方有效同意後，對方才可查看目前資料與照片；本人預覽不代表已授權。";
        return result;
    }
}
