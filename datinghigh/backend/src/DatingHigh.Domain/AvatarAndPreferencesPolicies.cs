using System.Buffers;
using System.Globalization;
using System.Text;

namespace DatingHigh.Domain;

/// <summary>個人資料的純領域驗證；不得讀取資料庫、外部服務或私人影像。</summary>
public static class DatingProfileRules
{
    public const int MinimumAge = 18;
    private static readonly TimeSpan TaiwanUtcOffset = TimeSpan.FromHours(8);

    /// <summary>以注入的可信時鐘取得台灣本地日期，避免 API 主機位於 UTC 而提早／延後成年。</summary>
    public static DateOnly TaiwanToday(TimeProvider clock) =>
        DateOnly.FromDateTime(clock.GetUtcNow().ToOffset(TaiwanUtcOffset).Date);
    public const int MaximumPersonalPhotos = 5;
    public const int MinimumAiSourcePhotos = 2;

    /// <summary>非空暱稱必須有 2～12 個 Unicode scalar，尚未填寫時允許空字串。</summary>
    public static string NormalizeNickname(string? value)
    {
        var normalized = (value ?? "").Trim();
        var count = CountSafeScalars(normalized);
        if (count != 0 && count is < 2 or > 12)
            throw new DomainException("INVALID_PROFILE");
        return normalized;
    }

    /// <summary>自我介紹最多 40 個 Unicode scalar。</summary>
    public static string NormalizeBio(string? value)
    {
        var normalized = (value ?? "").Trim();
        if (CountSafeScalars(normalized) > 40)
            throw new DomainException("INVALID_PROFILE");
        return normalized;
    }

    /// <summary>職業可不填；已填寫時最多 60 個 Unicode scalar。</summary>
    public static string? NormalizeOccupation(string? value)
    {
        var normalized = value?.Trim();
        if (string.IsNullOrEmpty(normalized))
            return null;
        if (CountSafeScalars(normalized) > 60)
            throw new DomainException("INVALID_PROFILE");
        return normalized;
    }

    /// <summary>生日採嚴格 ISO 日曆日期，交由呼叫端傳入可信的臺灣今日日期。</summary>
    public static DateOnly ParseBirthDate(string value, DateOnly taiwanToday)
    {
        if (value is null ||
            value.Length != 10 ||
            !DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var birthday) ||
            birthday > taiwanToday)
            throw new DomainException("INVALID_PROFILE");
        return birthday;
    }

    /// <summary>十八歲以生日滿整年的當地日界計算，閏日於非閏年使用二月末日。</summary>
    public static bool IsAdult(DateOnly birthday, DateOnly taiwanToday) =>
        birthday <= taiwanToday && birthday.AddYears(MinimumAge) <= taiwanToday;

    /// <summary>免費角色不需要真人照片；此處核對暱稱、成年與正式角色基礎條件，最終profileReady另由Application核對已存性別／性向及免費角色相容性。</summary>
    public static bool IsReady(string? nickname, string? birthDate, string? avatarType,
        string? avatarRef, DateOnly taiwanToday,bool generatedAvatarVerified=false)
    {
        try
        {
            if (CountSafeScalars(NormalizeNickname(nickname)) < 2 ||
                string.IsNullOrWhiteSpace(birthDate) ||
                !IsAdult(ParseBirthDate(birthDate, taiwanToday), taiwanToday))
                return false;

            return avatarType switch
            {
                "builtin" => BuiltinAvatarCatalog.Contains(avatarRef),
                // 已生成角色的 owner / ready 狀態需由受控 D1 指令核驗，這裡不得假設已驗證。
                "generated" => generatedAvatarVerified&&EntityId.IsValid(avatarRef),
                _ => false
            };
        }
        catch (DomainException)
        {
            return false;
        }
    }

    /// <summary>pending 同樣占用名額；真實並發上限仍必須由 D1 單一條件 INSERT 保證。</summary>
    public static bool CanReservePhoto(int ready, int pending) =>
        ready >= 0 && pending >= 0 && (long)ready + pending < MaximumPersonalPhotos;

    /// <summary>AI 來源必須是本人當前仍有效的 2～5 張 ready 真人照片。</summary>
    public static bool CanGenerateFrom(int readyCount) =>
        readyCount >= MinimumAiSourcePhotos && readyCount <= MaximumPersonalPhotos;

    private static int CountSafeScalars(string text)
    {
        var remaining = text.AsSpan();
        var count = 0;
        while (!remaining.IsEmpty)
        {
            if (Rune.DecodeFromUtf16(remaining, out var rune, out var consumed) != OperationStatus.Done ||
                Rune.GetUnicodeCategory(rune) is UnicodeCategory.Control or UnicodeCategory.Surrogate)
                throw new DomainException("INVALID_PROFILE");

            count++;
            remaining = remaining[consumed..];
        }
        return count;
    }
}

/// <summary>固定內建角色 ID 目錄；資產檔案是否具備仍需另行實體驗證。</summary>
public static class BuiltinAvatarCatalog
{
    private static readonly IReadOnlyList<string> Catalog = Array.AsReadOnly(
        new[] { "male", "female" }
            .SelectMany(prefix => Enumerable.Range(1, 8).Select(i => $"{prefix}-{i:00}"))
            .ToArray());

    public static IReadOnlyList<string> Ids => Catalog;

    /// <summary>以精確、大小寫敏感的目錄代碼檢查引用。</summary>
    public static bool Allowed(string? id,string? gender)=>Contains(id)&&(gender=="diverse"||gender is "male" or "female"&&id!.StartsWith(gender+"-",StringComparison.Ordinal));
    public static bool Contains(string? id) => id is not null && Catalog.Contains(id);
}

/// <summary>單輪 AI 產圖的純狀態邊界；跨 Worker 排他與 CAS 必須另由真 R2 實作。</summary>
public static class AvatarAttemptRules
{
    public const int MaximumSuccessfulCandidates = 4;
    public static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(60);

    /// <summary>是否可以向生成器發起下一張；不得自動替失敗請求追加張數。</summary>
    public static bool CanRequestNext(int successful, bool inFlight, bool closed,
        DateTimeOffset started, DateTimeOffset now) =>
        successful >= 0 && successful < MaximumSuccessfulCandidates &&
        !inFlight && !closed && IsWithinLifetime(started, now);

    /// <summary>只能讀到本輪確實成功寫入的 1～4 索引，60:00 即到期。</summary>
    public static bool IsReadable(int index, int successful, DateTimeOffset started,
        DateTimeOffset now) =>
        successful >= 0 && successful <= MaximumSuccessfulCandidates &&
        index >= 1 && index <= successful &&
        IsWithinLifetime(started, now);

    private static bool IsWithinLifetime(DateTimeOffset started, DateTimeOffset now) =>
        now >= started && now < started.Add(Lifetime);
}
