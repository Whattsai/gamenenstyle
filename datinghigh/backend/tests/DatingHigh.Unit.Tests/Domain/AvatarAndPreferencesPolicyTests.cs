using DatingHigh.Domain;

namespace DatingHigh.Unit.Tests.Domain;

/// <summary>AvatarAndPreferences 領域邊界：先確認規則失敗，再建立實作。</summary>
public sealed class AvatarAndPreferencesPolicyTests
{
    [Theory, Trait("Case", "AP-UT-099")]
    [InlineData(" 星河旅人 ", "星河旅人")]
    [InlineData("🌟🌙", "🌟🌙")]
    [InlineData("a🌟", "a🌟")]
    public void NormalizeNickname_ValidUnicodeScalars_PreservesExpectedText(string input, string expected)
    {
        Assert.Equal(expected, DatingProfileRules.NormalizeNickname(input));
    }

    [Theory, Trait("Case", "AP-UT-100")]
    [InlineData("a")]
    [InlineData("abcdefghijklmn")]
    [InlineData("a\u0001b")]
    public void NormalizeNickname_BadLengthControlsOrSurrogates_Rejects(string input)
    {
        Assert.Equal("INVALID_PROFILE", Assert.Throws<DomainException>(() => DatingProfileRules.NormalizeNickname(input)).Code);
    }

    [Fact, Trait("Case", "AP-UT-100")]
    public void NormalizeNickname_IsolatedSurrogate_ConstructedAtRuntime_Rejects()
    {
        foreach (var invalid in new[] { (char)0xD800, (char)0xDC00 })
        {
            var text = new string(new[] { 'a', invalid, 'b' });
            Assert.Equal("INVALID_PROFILE", Assert.Throws<DomainException>(() => DatingProfileRules.NormalizeNickname(text)).Code);
        }
    }

    [Fact, Trait("Case", "AP-UT-047")]
    public void Occupation_OptionalEmptyAndTrim_AreAccepted()
    {
        Assert.Null(DatingProfileRules.NormalizeOccupation(null));
        Assert.Null(DatingProfileRules.NormalizeOccupation("  "));
        Assert.Equal("軟體工程師", DatingProfileRules.NormalizeOccupation("  軟體工程師  "));
        Assert.Equal(new string('a', 60), DatingProfileRules.NormalizeOccupation(new string('a', 60)));
    }

    [Fact, Trait("Case", "AP-UT-081")]
    public void ProfileText_InvalidOccupationAndBiography_AreRejected()
    {
        Assert.Equal("INVALID_PROFILE", Assert.Throws<DomainException>(() => DatingProfileRules.NormalizeOccupation(new string('a', 61))).Code);
        Assert.Equal("INVALID_PROFILE", Assert.Throws<DomainException>(() => DatingProfileRules.NormalizeBio(new string('a', 41))).Code);
        Assert.Equal("INVALID_PROFILE", Assert.Throws<DomainException>(() => DatingProfileRules.NormalizeBio("\u0000")).Code);
    }

    [Theory, Trait("Case", "AP-UT-113")]
    [InlineData("2008-02-29", "2026-02-27", false)]
    [InlineData("2008-02-29", "2026-02-28", true)]
    [InlineData("2008-03-01", "2026-02-28", false)]
    [InlineData("2008-03-01", "2026-03-01", true)]
    [InlineData("2008-11-03", "2026-11-02", false)]
    [InlineData("2008-11-02", "2026-11-02", true)]
    public void TaiwanCalendar_AgeBoundaryAndLeapDay_UsesDateOnly(string birthDate, string today, bool adult)
    {
        var localDate = DateOnly.ParseExact(today, "yyyy-MM-dd");
        var parsed = DatingProfileRules.ParseBirthDate(birthDate, localDate);
        Assert.Equal(adult, DatingProfileRules.IsAdult(parsed, localDate));
    }

    [Fact, Trait("Case", "AP-UT-113")]
    public void TaiwanToday_FixedUtcClock_SwitchesAdultEligibilityAtTaiwanMidnight()
    {
        var clock = new Microsoft.Extensions.Time.Testing.FakeTimeProvider(
            new DateTimeOffset(2026, 11, 1, 15, 59, 59, TimeSpan.Zero));
        var birthday = new DateOnly(2008, 11, 2);
        Assert.Equal(new DateOnly(2026, 11, 1), DatingProfileRules.TaiwanToday(clock));
        Assert.False(DatingProfileRules.IsAdult(birthday, DatingProfileRules.TaiwanToday(clock)));
        clock.Advance(TimeSpan.FromSeconds(1));
        Assert.Equal(new DateOnly(2026, 11, 2), DatingProfileRules.TaiwanToday(clock));
        Assert.True(DatingProfileRules.IsAdult(birthday, DatingProfileRules.TaiwanToday(clock)));
        var leapClock = new Microsoft.Extensions.Time.Testing.FakeTimeProvider(
            new DateTimeOffset(2026, 2, 27, 15, 59, 59, TimeSpan.Zero));
        var leapBirthday = new DateOnly(2008, 2, 29);
        Assert.False(DatingProfileRules.IsAdult(leapBirthday, DatingProfileRules.TaiwanToday(leapClock)));
        leapClock.Advance(TimeSpan.FromSeconds(1));
        Assert.True(DatingProfileRules.IsAdult(leapBirthday, DatingProfileRules.TaiwanToday(leapClock)));
    }

    [Theory, Trait("Case", "AP-UT-083")]
    [InlineData("2008-02-30")]
    [InlineData("2099-01-01")]
    [InlineData("2026-1-1")]
    [InlineData("not-a-date")]
    public void BirthDate_InvalidOrFutureDate_Rejects(string birthDate)
    {
        Assert.Equal("INVALID_PROFILE", Assert.Throws<DomainException>(
            () => DatingProfileRules.ParseBirthDate(birthDate, new DateOnly(2026, 11, 2))).Code);
    }

    [Fact, Trait("Case", "AP-UT-039")]
    public void FreeAvatar_WithoutUploadedPhotos_CanCompleteProfile()
    {
        var today = new DateOnly(2026, 11, 2);
        Assert.True(DatingProfileRules.IsReady("星河旅人", "1995-08-12", "builtin", "female-01", today));
        Assert.False(DatingProfileRules.IsReady("星河旅人", "2009-08-12", "builtin", "female-01", today));
        Assert.False(DatingProfileRules.IsReady("星河旅人", null, "builtin", "female-01", today));
        Assert.False(DatingProfileRules.IsReady("", "1995-08-12", "builtin", "female-01", today));
        Assert.False(DatingProfileRules.IsReady("星河旅人", "1995-08-12", null, null, today));
        Assert.False(DatingProfileRules.IsReady("星河旅人", "1995-08-12", "builtin", "female-09", today));
    }

    [Fact, Trait("Case", "AP-UT-009")]
    public void BuiltinCatalog_IsSixteenDistinctStableIds()
    {
        Assert.Equal(16, BuiltinAvatarCatalog.Ids.Count);
        Assert.Equal(16, BuiltinAvatarCatalog.Ids.Distinct(StringComparer.Ordinal).Count());
        foreach (var prefix in new[] { "male", "female" })
        {
            for (var i = 1; i <= 8; i++)
                Assert.True(BuiltinAvatarCatalog.Contains($"{prefix}-{i:00}"));
        }
        Assert.False(BuiltinAvatarCatalog.Contains("male-09"));
        Assert.False(BuiltinAvatarCatalog.Contains("../female-01"));
    }

    [Theory, Trait("Case", "AP-UT-061")]
    [InlineData(4, 0, true)]
    [InlineData(3, 1, true)]
    [InlineData(5, 0, false)]
    [InlineData(4, 1, false)]
    [InlineData(0, 5, false)]
    public void PersonalPhotoQuota_IncludesPendingAndReady(int ready, int pending, bool canAdd)
    {
        Assert.Equal(canAdd, DatingProfileRules.CanReservePhoto(ready, pending));
    }

    [Theory, Trait("Case", "AP-UT-041")]
    [InlineData(0, false)]
    [InlineData(1, false)]
    [InlineData(2, true)]
    [InlineData(5, true)]
    [InlineData(6, false)]
    public void AiGeneration_RequiresTwoToFiveReadyPhotos(int count, bool allowed)
    {
        Assert.Equal(allowed, DatingProfileRules.CanGenerateFrom(count));
    }

    [Fact, Trait("Case", "AP-UT-119")]
    public void CandidateBudget_RejectsFifthBeforeProviderCall()
    {
        var started = DateTimeOffset.Parse("2026-11-02T09:00:00+08:00");
        Assert.True(AvatarAttemptRules.CanRequestNext(3, false, false, started, started.AddMinutes(59)));
        Assert.False(AvatarAttemptRules.CanRequestNext(4, false, false, started, started.AddMinutes(59)));
        Assert.False(AvatarAttemptRules.CanRequestNext(3, true, false, started, started.AddMinutes(59)));
        Assert.False(AvatarAttemptRules.CanRequestNext(3, false, true, started, started.AddMinutes(59)));
    }

    [Fact, Trait("Case", "AP-UT-073")]
    public void CandidateExpiry_AtExactlySixtyMinutes_RejectsReadAndSelection()
    {
        var started = DateTimeOffset.Parse("2026-11-02T09:00:00+08:00");
        Assert.True(AvatarAttemptRules.IsReadable(1, 2, started, started.AddMinutes(59).AddSeconds(59)));
        Assert.False(AvatarAttemptRules.IsReadable(1, 2, started, started.AddMinutes(60)));
        Assert.False(AvatarAttemptRules.IsReadable(3, 2, started, started.AddMinutes(1)));
        Assert.False(AvatarAttemptRules.IsReadable(0, 2, started, started.AddMinutes(1)));
        Assert.False(AvatarAttemptRules.IsReadable(5, 4, started, started.AddMinutes(1)));
    }
}
