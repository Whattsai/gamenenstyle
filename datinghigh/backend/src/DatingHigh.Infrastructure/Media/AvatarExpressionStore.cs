using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Domain;

namespace DatingHigh.Infrastructure.Media;

/// <summary>只傳已安全壓縮的透明 WebP；憑證及 server lease 不出現在 URI 或日誌。</summary>
public sealed class AvatarExpressionStore(HttpClient http):IAvatarExpressionStore
{
    public async Task<PrivateMediaContent> PreviewAsync(CurrentUser user,string workflow,string pose,CancellationToken ct=default)
    {
        if(!EntityId.IsValid(workflow)||pose is not("stand" or "sit" or "read" or "hold"))throw new DomainException("INVALID_AVATAR_SELECTION");
        using var request=new HttpRequestMessage(HttpMethod.Get,$"v1/avatar/expressions/{workflow}/pose-{pose}");
        request.Headers.Add("X-DatingHigh-Media-Account-Id",user.AccountId);request.Headers.Add("X-DatingHigh-Media-Session-Id",user.SessionId);
        request.Headers.Add("X-DatingHigh-Media-Cv",user.CredentialVersion.ToString(System.Globalization.CultureInfo.InvariantCulture));request.Headers.Add("X-DatingHigh-Media-Expires-At",user.AccessExpiresAt.ToString(System.Globalization.CultureInfo.InvariantCulture));
        using var response=await http.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,ct);
        if(!response.IsSuccessStatusCode){var status=(int)response.StatusCode;throw new DomainException(status switch{401=>"SESSION_REVOKED",403=>"RESOURCE_FORBIDDEN",404=>"AVATAR_ADOPTION_NOT_FOUND",409=>"AVATAR_PACK_NOT_READY",_=>"STORAGE_UNAVAILABLE"},status is 401 or 403 or 404 or 409?status:503);}
        if(response.Content.Headers.ContentType?.MediaType!="image/png"||response.Content.Headers.ContentLength>20000000)throw new DomainException("STORAGE_UNAVAILABLE",503);
        using var input=await response.Content.ReadAsStreamAsync(ct);using var output=new MemoryStream();var buffer=new byte[16384];int count;
        while((count=await input.ReadAsync(buffer,ct))>0){if(output.Length+count>20000000)throw new DomainException("STORAGE_UNAVAILABLE",503);await output.WriteAsync(buffer.AsMemory(0,count),ct);}
        if(output.Length<1||response.Content.Headers.ContentLength is long length&&length!=output.Length)throw new DomainException("STORAGE_UNAVAILABLE",503);
        return new(output.ToArray(),"image/png");
    }
    public async Task<JsonNode> PublishAsync(CurrentUser user,string workflow,string expression,string requestId,string lease,CompressedImage image,CancellationToken ct=default)
    {
        if(!EntityId.IsValid(workflow)||!EntityId.IsValid(requestId)||expression is not("neutral" or "smile" or "surprised" or "thoughtful" or "concerned" or "pose-stand" or "pose-sit" or "pose-read" or "pose-hold")||image.MimeType!=(expression.StartsWith("pose-",StringComparison.Ordinal)?"image/png":"image/webp")||image.Bytes.Length<1||image.Bytes.Length>(expression.StartsWith("pose-",StringComparison.Ordinal)?20000000:2000000))throw new DomainException("INVALID_AVATAR_SELECTION");
        using var request=new HttpRequestMessage(HttpMethod.Put,$"v1/avatar/expressions/{workflow}/{expression}");
        request.Headers.Add("X-DatingHigh-Media-Account-Id",user.AccountId);request.Headers.Add("X-DatingHigh-Media-Session-Id",user.SessionId);
        request.Headers.Add("X-DatingHigh-Media-Cv",user.CredentialVersion.ToString(System.Globalization.CultureInfo.InvariantCulture));request.Headers.Add("X-DatingHigh-Media-Expires-At",user.AccessExpiresAt.ToString(System.Globalization.CultureInfo.InvariantCulture));
        request.Headers.Add("X-DatingHigh-Avatar-Request-Id",requestId);request.Headers.TryAddWithoutValidation("If-Match",lease);
        request.Content=new ReadOnlyMemoryContent(image.Bytes);request.Content.Headers.ContentType=new(image.MimeType);
        using var response=await http.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,ct);
        if(!response.IsSuccessStatusCode){
            var code=(int)response.StatusCode switch{401=>"SESSION_REVOKED",410=>"AVATAR_CANDIDATE_EXPIRED",409=>"AVATAR_ADOPTION_IN_PROGRESS",_=>"STORAGE_UNAVAILABLE"};
            if(response.Content.Headers.ContentLength is >=1 and <=4096){
                try{var problem=await response.Content.ReadFromJsonAsync<JsonNode>(ct);if(problem?["code"]?.GetValue<string>() is "INVALID_IMAGE" or "AVATAR_EXPRESSION_MISMATCH" or "AVATAR_SOURCE_CHANGED" or "AVATAR_ADOPTION_NOT_FOUND")code=problem["code"]!.GetValue<string>();}catch(System.Text.Json.JsonException){/* 不反射非契約內容。 */}
            }
            throw new DomainException(code,(int)response.StatusCode);
        }
        return await response.Content.ReadFromJsonAsync<JsonNode>(ct)??throw new DomainException("STORAGE_UNAVAILABLE",503);
    }
}
