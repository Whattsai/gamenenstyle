using System.Text.Json;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
using DatingHigh.Application;
namespace DatingHigh.Api;

/// <summary>輸入一次解析，拒絕重複、未知與非字串欄位。</summary>
public sealed class RequestPayload(Dictionary<string,string> values)
{
    public string Required(string name)=>values.TryGetValue(name,out var value)&&value.Length>0?value:throw new DomainException("INVALID_REQUEST");
    public string? Optional(string name)=>values.GetValueOrDefault(name);
    public void Only(params string[] names)
    {
        if(values.Keys.Except(names,StringComparer.Ordinal).Any()) throw new DomainException("INVALID_REQUEST");
    }
    public static async Task<RequestPayload> Read(HttpRequest request,CancellationToken ct)
    {
        if(request.ContentLength>16384) throw new DomainException("REQUEST_TOO_LARGE",413);
        using var buffer=new MemoryStream();var chunk=new byte[4096];int read;
        while((read=await request.Body.ReadAsync(chunk,ct))>0)
        {
            if(buffer.Length+read>16384) throw new DomainException("REQUEST_TOO_LARGE",413);await buffer.WriteAsync(chunk.AsMemory(0,read),ct);
        }
        if(buffer.Length==0) return new([]);
        if(!request.HasJsonContentType()) throw new DomainException("INVALID_REQUEST");
        try
        {
            using var json=JsonDocument.Parse(buffer.ToArray(),new JsonDocumentOptions{MaxDepth=8});
            if(json.RootElement.ValueKind!=JsonValueKind.Object) throw new DomainException("INVALID_REQUEST");
            var values=new Dictionary<string,string>(StringComparer.Ordinal);
            foreach(var property in json.RootElement.EnumerateObject())
                if(property.Value.ValueKind!=JsonValueKind.String || !values.TryAdd(property.Name,property.Value.GetString()!)) throw new DomainException("INVALID_REQUEST");
            return new(values);
        }
        catch(Exception e)when(e is JsonException or InvalidOperationException){throw new DomainException("INVALID_REQUEST");}
    }
}

/// <summary>Web 僅 Cookie、原生僅 Bearer/body；Origin 不可偽裝原生。</summary>
public static class HttpContract
{
    public static RequestPayload Payload(this HttpContext c)=>(RequestPayload)c.Items["payload"]!;
    public static string ClientPlatform(this HttpContext c)=>(string)c.Items["platform"]!;
    public static string Ip(this HttpContext c)
    {
        var raw=c.Request.Headers["X-DatingHigh-Internal-Client-Ip"].ToString();
        if(!System.Net.IPAddress.TryParse(raw,out var parsed)) throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        return parsed.IsIPv4MappedToIPv6?parsed.MapToIPv4().ToString():parsed.ToString();
    }
    private static string CookieName(bool access,AuthOptions options)=>options.Environment=="local"?$"datinghigh_{(access?"access":"refresh")}_dev":$"__Host-datinghigh_{(access?"access":"refresh")}";
    public static string? AccessCredential(this HttpContext c,AuthOptions options)=>c.ClientPlatform()=="web"?c.Request.Cookies[CookieName(true,options)]:c.Request.Headers.Authorization.ToString().StartsWith("Bearer ",StringComparison.Ordinal)?c.Request.Headers.Authorization.ToString()[7..]:null;
    public static string? RefreshCredential(this HttpContext c,AuthOptions options)=>c.ClientPlatform()=="web"?c.Request.Cookies[CookieName(false,options)]:c.Payload().Optional("refreshToken");
    private static CookieOptions Cookie(AuthOptions options,DateTimeOffset? expires)=>new(){HttpOnly=true,Secure=options.Environment!="local",SameSite=SameSiteMode.Strict,Path="/",Expires=expires};
    public static IResult Login(this HttpContext c,AuthOptions options,AuthApplication.LoginResult result)
    {
        c.Response.Headers["X-DatingHigh-Session"]=result.SessionId;
        if(c.ClientPlatform()=="web")
        {
            var a=Cookie(options,result.AccessExpiry);a.MaxAge=result.AccessExpiry-DateTimeOffset.UtcNow;
            var r=Cookie(options,result.RefreshExpiry);r.MaxAge=result.RefreshExpiry-DateTimeOffset.UtcNow;
            c.Response.Cookies.Append(CookieName(true,options),result.Access,a);c.Response.Cookies.Append(CookieName(false,options),result.Refresh,r);
        }
        return Results.Json(result.Body,statusCode:result.Status);
    }
    public static void ClearCookies(this HttpContext c,AuthOptions options)
    {
        c.Response.Cookies.Delete(CookieName(true,options),Cookie(options,null));c.Response.Cookies.Delete(CookieName(false,options),Cookie(options,null));
    }
    public static async Task Problem(HttpContext c,DomainException e)
    {
        c.Response.StatusCode=e.Status;c.Response.ContentType="application/problem+json";c.Response.Headers.CacheControl="no-store";
        if(e.RetryAfter.HasValue)c.Response.Headers.RetryAfter=e.RetryAfter.Value.ToString(System.Globalization.CultureInfo.InvariantCulture);
        var body=new Dictionary<string,object?>{{"type",$"urn:datinghigh:problem:{e.Code.ToLowerInvariant().Replace('_','-')}"},{"title",e.Status>=500?"服務暫時無法使用，請稍後再試":e.Code=="INVALID_CREDENTIALS"?"Email 或密碼不正確":"請確認輸入或重新登入"},{"status",e.Status},{"code",e.Code},{"traceId",c.TraceIdentifier}};
        if(e.Code=="EMAIL_DELIVERY_FAILED"&&e.Status==503&&e.Recovery is not null)body["recovery"]=e.Recovery;
        await c.Response.WriteAsJsonAsync(body,options:(JsonSerializerOptions?)null,contentType:"application/problem+json");
    }
}
