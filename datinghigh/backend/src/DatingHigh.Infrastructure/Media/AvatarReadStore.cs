using System.Globalization;
using DatingHigh.Application;
using DatingHigh.Application.Media;
using DatingHigh.Domain;

namespace DatingHigh.Infrastructure.Media;

/// <summary>受控私人表情 binary bridge；不持久化、不重試，Worker 在 R2 等待後再次驗證。</summary>
public sealed class AvatarReadStore(HttpClient http):IAvatarReadStore
{
    public async Task<PrivateMediaContent> ReadAsync(CurrentUser user,AvatarReadScope scope,string targetId,string version,string expression,CancellationToken ct=default)
    {
        AvatarReadService.Validate(scope,targetId,version,expression);
        using var request=new HttpRequestMessage(HttpMethod.Get,$"v1/avatar/{(scope==AvatarReadScope.RoundPartner?"rounds":"assets")}/{targetId}/{version}/{expression}");
        request.Headers.Add("X-DatingHigh-Media-Account-Id",user.AccountId);request.Headers.Add("X-DatingHigh-Media-Session-Id",user.SessionId);
        request.Headers.Add("X-DatingHigh-Media-Cv",user.CredentialVersion.ToString(CultureInfo.InvariantCulture));request.Headers.Add("X-DatingHigh-Media-Expires-At",user.AccessExpiresAt.ToString(CultureInfo.InvariantCulture));
        try{
            using var response=await http.SendAsync(request,HttpCompletionOption.ResponseHeadersRead,ct);
            if(!response.IsSuccessStatusCode){var status=(int)response.StatusCode;throw new DomainException(status switch{401=>"SESSION_REVOKED",403=>"RESOURCE_FORBIDDEN",404=>"AVATAR_NOT_FOUND",409=>"AVATAR_VERSION_CONFLICT",_=>"STORAGE_UNAVAILABLE"},status is 401 or 403 or 404 or 409?status:503);}
            if(response.Content.Headers.ContentType?.MediaType!="image/webp"||response.Content.Headers.ContentLength>2000000)throw new DomainException("STORAGE_UNAVAILABLE",503);
            using var input=await response.Content.ReadAsStreamAsync(ct);using var output=new MemoryStream();var chunk=new byte[16384];int count;
            while((count=await input.ReadAsync(chunk,ct))>0){if(output.Length+count>2000000)throw new DomainException("STORAGE_UNAVAILABLE",503);await output.WriteAsync(chunk.AsMemory(0,count),ct);}
            if(output.Length<1||response.Content.Headers.ContentLength is long length&&length!=output.Length)throw new DomainException("STORAGE_UNAVAILABLE",503);
            return new(output.ToArray(),"image/webp");
        }catch(HttpRequestException){throw new DomainException("STORAGE_UNAVAILABLE",503);}
    }
}
