using System.Net.Http.Json;
using System.Text.Json.Nodes;
using System.Text.Json;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Domain;

namespace DatingHigh.Infrastructure.Media;

/// <summary>短效候選的受控 binary bridge，lease 不會送到公開 client。</summary>
public sealed class AvatarCandidateStore(HttpClient http):IAvatarCandidateStore
{
    private static HttpRequestMessage Request(CurrentUser user,string path,HttpMethod method)
    {
        var request=new HttpRequestMessage(method,path);
        request.Headers.Add("X-DatingHigh-Media-Account-Id",user.AccountId);request.Headers.Add("X-DatingHigh-Media-Session-Id",user.SessionId);
        request.Headers.Add("X-DatingHigh-Media-Cv",user.CredentialVersion.ToString(System.Globalization.CultureInfo.InvariantCulture));
        request.Headers.Add("X-DatingHigh-Media-Expires-At",user.AccessExpiresAt.ToString(System.Globalization.CultureInfo.InvariantCulture));return request;
    }
    private async Task<HttpResponseMessage> Send(HttpRequestMessage request,CancellationToken ct)
    {
        try{
            var response=await http.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,ct);
            if(response.IsSuccessStatusCode)return response;
            using(response){
                var status=(int)response.StatusCode;
                var code=status==409?await ConflictCode(response.Content,ct):status switch{401=>"SESSION_REVOKED",404=>"AVATAR_CANDIDATE_NOT_FOUND",410=>"AVATAR_CANDIDATE_EXPIRED",_=>"STORAGE_UNAVAILABLE"};
                throw new DomainException(code,status);
            }
        }catch(HttpRequestException){throw new DomainException("STORAGE_UNAVAILABLE",503);}
    }
    private static async Task<string> ConflictCode(HttpContent content,CancellationToken ct)
    {
        const string fallback="AVATAR_GENERATION_IN_PROGRESS";
        if(content.Headers.ContentLength>4096)return fallback;
        using var stream=await content.ReadAsStreamAsync(ct);var bytes=new byte[4097];var length=0;
        while(length<bytes.Length){var read=await stream.ReadAsync(bytes.AsMemory(length),ct);if(read==0)break;length+=read;}
        if(length>4096)return fallback;
        try{
            using var json=JsonDocument.Parse(bytes.AsMemory(0,length),new JsonDocumentOptions{MaxDepth=3});
            if(json.RootElement.ValueKind!=JsonValueKind.Object||!json.RootElement.TryGetProperty("code",out var code)||code.ValueKind!=JsonValueKind.String)return fallback;
            return code.GetString() is "AVATAR_DUPLICATE_IMAGE" or "AVATAR_SOURCE_CHANGED" or "AVATAR_ATTEMPT_CLOSED" or "AVATAR_LIMIT_REACHED"?code.GetString()!:fallback;
        }catch(JsonException){return fallback;}
    }
    public async Task<JsonNode> PublishAsync(CurrentUser user,string attemptId,string requestId,string lease,CompressedImage image,CancellationToken ct=default)
    {
        using var request=Request(user,$"v1/avatar/candidates/{attemptId}",HttpMethod.Put);
        request.Headers.Add("X-DatingHigh-Avatar-Request-Id",requestId);request.Headers.TryAddWithoutValidation("If-Match",lease);
        request.Content=new ReadOnlyMemoryContent(image.Bytes);request.Content.Headers.ContentType=new(image.MimeType);
        using var response=await Send(request,ct);
        return await response.Content.ReadFromJsonAsync<JsonNode>(ct)??throw new DomainException("STORAGE_UNAVAILABLE",503);
    }
    public async Task<PrivateMediaContent> ReadAsync(CurrentUser user,string attemptId,int index,CancellationToken ct=default)
    {
        using var request=Request(user,$"v1/avatar/candidates/{attemptId}/{index}",HttpMethod.Get);
        using var response=await Send(request,ct);
        if(response.Content.Headers.ContentType?.MediaType!="image/jpeg"||response.Content.Headers.ContentLength>2000000)
            throw new DomainException("STORAGE_UNAVAILABLE",503);
        using var source=await response.Content.ReadAsStreamAsync(ct);using var buffer=new MemoryStream();
        var chunk=new byte[16384];int read;
        while((read=await source.ReadAsync(chunk,ct))>0){if(buffer.Length+read>2000000)throw new DomainException("STORAGE_UNAVAILABLE",503);await buffer.WriteAsync(chunk.AsMemory(0,read),ct);}
        if(buffer.Length==0)throw new DomainException("STORAGE_UNAVAILABLE",503);
        return new(buffer.ToArray(),"image/jpeg");
    }
}
