namespace DatingHigh.Application;
/// <summary>只由已驗證 Access 的呼叫端建立，不接受公開 request body 綁定。</summary>
public sealed record CurrentUser(string AccountId,string SessionId,long CredentialVersion,long AccessExpiresAt);
/// <summary>私人檔案內部介面；本份沒有公開媒體 API。</summary>
public interface IPrivateObjectStore
{
    Task PutAsync(CurrentUser user,string purpose,string objectId,ReadOnlyMemory<byte> content,CancellationToken cancellationToken=default);
    Task<byte[]> GetAsync(CurrentUser user,string purpose,string objectId,CancellationToken cancellationToken=default);
    Task DeleteAsync(CurrentUser user,string purpose,string objectId,CancellationToken cancellationToken=default);
}
