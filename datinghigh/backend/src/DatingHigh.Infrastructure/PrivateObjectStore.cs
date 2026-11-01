using DatingHigh.Application;
using DatingHigh.Domain;
namespace DatingHigh.Infrastructure;
/// <summary>owner 固定取自已驗證 context，handler 最後再查 family。</summary>
public sealed class PrivateObjectStore(IPlatformClient platform):IPrivateObjectStore
{
    private static object Payload(CurrentUser user,string purpose,string objectId,string? content=null)
    {
        ResourceAccessPolicy.PrivateKey(user.AccountId,purpose,objectId);
        var payload=new Dictionary<string,object>{{"accountId",user.AccountId},{"sessionId",user.SessionId},{"cv",user.CredentialVersion},{"accessExpiresAt",user.AccessExpiresAt},{"purpose",purpose},{"objectId",objectId}};
        if(content is not null)payload["content"]=content;return payload;
    }
    public async Task PutAsync(CurrentUser user,string purpose,string objectId,ReadOnlyMemory<byte> content,CancellationToken cancellationToken=default)
    {
        if(content.Length>8192)throw new DomainException("OBJECT_TOO_LARGE",413);
        await platform.ExecuteAsync("object.private.put",Payload(user,purpose,objectId,Convert.ToBase64String(content.Span)),cancellationToken);
    }
    public async Task<byte[]> GetAsync(CurrentUser user,string purpose,string objectId,CancellationToken cancellationToken=default)
    {
        var result=await platform.ExecuteAsync("object.private.get",Payload(user,purpose,objectId),cancellationToken);return Convert.FromBase64String(result.Text("content"));
    }
    public async Task DeleteAsync(CurrentUser user,string purpose,string objectId,CancellationToken cancellationToken=default)=>await platform.ExecuteAsync("object.private.delete",Payload(user,purpose,objectId),cancellationToken);
}
