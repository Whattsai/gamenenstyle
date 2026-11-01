namespace DatingHigh.Infrastructure;
/// <summary>各環境獨立且跨重啟穩定的秘密與發行設定。</summary>
public sealed record AuthOptions(string Environment,string Issuer,string Audience,byte[] AccessKey,byte[] EmailKey,byte[] RateKey,string WebOrigin,string EmailDeliveryMode)
{
    public static AuthOptions Load(Func<string,string?> get)
    {
        static byte[] Decode(string? value){try{return Convert.FromBase64String(value??"");}catch(FormatException){return [];}}
        return new(get("APP_ENV")??"unset",get("ACCESS_TOKEN_ISSUER")??"",get("ACCESS_TOKEN_AUDIENCE")??"",Decode(get("ACCESS_TOKEN_SECRET")),Decode(get("EMAIL_CODE_HMAC_KEY")),Decode(get("RATE_LIMIT_HMAC_KEY")),get("WEB_ORIGIN")??"",get("EmailDeliveryMode")??"");
    }
}
