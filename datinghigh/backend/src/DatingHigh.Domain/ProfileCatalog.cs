namespace DatingHigh.Domain;

/// <summary>版本化穩定代碼與顯示文字；資料庫只存代碼，不儲存翻譯或原型人物。</summary>
public sealed record ProfileOption(string Id,string Label,string? Category=null,bool Active=true);
/// <summary>興趣五大類及生活／配對選項；代碼停用仍保留相同語意供舊資料回讀。</summary>
public static class ProfileCatalog
{
    public const string Version="2026-11-05.v2";
    private static ProfileOption[] Options(params (string Id,string Label)[] values)=>values.Select(v=>new ProfileOption(v.Id,v.Label)).ToArray();
    public static readonly IReadOnlyDictionary<string,ProfileOption[]> Groups=new Dictionary<string,ProfileOption[]>{
        ["gender"]=Options(("male","男"),("female","女"),("diverse","多元")),
        ["romanticOrientation"]=Options(("male","男"),("female","女"),("diverse","多元")),
        ["traitTagIds"]=Options(("warm","溫暖"),("curious","好奇"),("calm","沉穩"),("humorous","幽默"),("thoughtful","體貼"),("creative","有創意"),("outgoing","外向"),("quiet","慢熟")),
        ["interestTagIds"]=[new("handcraft","手作","culture"),new("art","藝術展覽","culture"),new("reading","閱讀","culture"),new("hiking","健行","outdoor"),new("camping","露營","outdoor"),new("travel","旅行","outdoor"),new("coffee","咖啡","food"),new("cooking","料理","food"),new("foodie","美食","food"),new("film","電影","screen"),new("anime","動漫","screen"),new("drama","影集","screen"),new("puzzle","解謎","psychology"),new("psychology","心理測驗","psychology")],
        ["topicTagIds"]=Options(("puzzle_chat","解謎話題"),("creative_chat","創作分享"),("travel_chat","旅行故事"),("food_chat","美食交流"),("film_chat","影劇討論"),("daily_chat","生活日常")),
        ["valueTagIds"]=Options(("creativity","創造力"),("kindness","善良"),("honesty","誠實"),("independence","獨立"),("family","家庭"),("growth","成長"),("balance","生活平衡"),("respect","尊重")),
        ["weekendPreference"]=Options(("explore","出門探索"),("relax","在家放鬆"),("flexible","隨心安排")),
        ["sleepSchedule"]=Options(("early_bird","早睡早起"),("night_owl","夜貓子"),("flexible","彈性作息")),
        ["conversationStyle"]=Options(("warm","溫暖傾聽"),("playful","輕鬆幽默"),("deep","深入交流"),("direct","直接坦率")),
        ["expectedInteractionFrequency"]=Options(("daily","每天"),("weekly","每週幾次"),("flexible","順其自然")),
        ["relationshipMode"]=Options(("friends_first","先從朋友開始"),("serious","以穩定交往為目標"),("open_minded","先認識彼此")),
        ["regionCode"]=Options(("TW-TPE","臺北市"),("TW-NWT","新北市"),("TW-KEE","基隆市"),("TW-TAO","桃園市"),("TW-HSZ","新竹市"),("TW-HSQ","新竹縣"),("TW-MIA","苗栗縣"),("TW-TXG","臺中市"),("TW-CHA","彰化縣"),("TW-NAN","南投縣"),("TW-YUN","雲林縣"),("TW-CYI","嘉義市"),("TW-CYQ","嘉義縣"),("TW-TNN","臺南市"),("TW-KHH","高雄市"),("TW-PIF","屏東縣"),("TW-ILA","宜蘭縣"),("TW-HUA","花蓮縣"),("TW-TTT","臺東縣"),("TW-PEN","澎湖縣"),("TW-KIN","金門縣"),("TW-LIE","連江縣"))
    };
    public static bool Contains(string group,string code)=>Groups.TryGetValue(group,out var values)&&values.Any(v=>v.Id==code);
}
