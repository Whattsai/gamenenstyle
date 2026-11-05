using System.Text.Json.Nodes;
using DatingHigh.Application.Media;

namespace DatingHigh.Application;

/// <summary>後續受信任服務的讀取請求識別；本身不是授權證明，不接受client boolean代替有效輪次／同意查核。</summary>
public sealed record ProfileReadRequest(CurrentUser Requester,string OwnerAccountId,string RoundId);

/// <summary>
/// 跨SPEC內部契約。本SPEC定義欄位投影及界線；MatchingSessions／AffectionAndFeedback實作每次授權後才提供adapter。
/// 目前不註冊實作、不公開HTTP路由，不能以猜測accountId／assetId讀取他人資料。
/// </summary>
public interface IAvatarAndPreferencesReader
{
    /// <summary>只限MatchingSessions：年齡、生理性別／戀愛性向、地區、興趣與私有偏好；性別／性向不受名片開放設定影響。後續候選須雙向包含對方性別；本契約不建立配對流程，無真人照／Email。</summary>
    Task<JsonObject> GetMatchingInputAsync(ProfileReadRequest request,CancellationToken ct=default);
    /// <summary>每次驗本輪參與：目前遊戲化身及有限公開人物資訊；無職業／生日／照片。</summary>
    Task<JsonObject> GetCandidatePersonaAsync(ProfileReadRequest request,CancellationToken ct=default);
    /// <summary>每次驗有效同輪雙方同意且未終止：當前名片分享欄位，不讀歷史版本或快照。</summary>
    Task<JsonObject> GetCurrentCardFieldsAsync(ProfileReadRequest request,CancellationToken ct=default);
    /// <summary>開串流前後重驗同輪授權、目前照片組開放設定及owner／ready／未刪；持舊assetId亦不可繞過新設定，只讀200KB保存版，無公開URL。</summary>
    Task<PrivateMediaContent> OpenAuthorizedCardPhotoAsync(ProfileReadRequest request,string assetId,CancellationToken ct=default);
    /// <summary>每次驗本輪參與；只回本人目前選用的免費／生成化身引用，不讀取真人來源。</summary>
    Task<JsonObject> GetCurrentAvatarAsync(ProfileReadRequest request,CancellationToken ct=default);
}
