using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Domain;

namespace DatingHigh.Infrastructure.Media;

/// <summary>只傳已安全壓縮的透明 WebP；憑證及 server lease 不出現在 URI 或日誌。</summary>
public sealed class AvatarExpressionStore(HttpClient http):IAvatarExpressionStore
{
    public async Task<JsonNode> PublishAsync(CurrentUser user,string workflow,string expression,string requestId,string lease,CompressedImage image,CancellationToken ct=default)
    {
        if(!EntityId.IsValid(workflow)||!EntityId.IsValid(requestId)||expression is not("neutral" or "smile" or "surprised" or "thoughtful" or "concerned")||image.MimeType!="image/webp"||image.Bytes.Length is <1 or >2000000)throw new DomainException("INVALID_AVATAR_SELECTION");
        using var request=new HttpRequestMessage(HttpMethod.Put,$"v1/avatar/expressions/{workflow}/{expression}");
        request.Headers.Add("X-DatingHigh-Media-Account-Id",user.AccountId);request.Headers.Add("X-DatingHigh-Media-Session-Id",user.SessionId);
        request.Headers.Add("X-DatingHigh-Media-Cv",user.CredentialVersion.ToString(System.Globalization.CultureInfo.InvariantCulture));request.Headers.Add("X-DatingHigh-Media-Expires-At",user.AccessExpiresAt.ToString(System.Globalization.CultureInfo.InvariantCulture));
        request.Headers.Add("X-DatingHigh-Avatar-Request-Id",requestId);request.Headers.TryAddWithoutValidation("If-Match",lease);
        request.Content=new ReadOnlyMemoryContent(image.Bytes);request.Content.Headers.ContentType=new("image/webp");
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
