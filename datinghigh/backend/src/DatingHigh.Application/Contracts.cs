using System.Text.Json.Nodes;
namespace DatingHigh.Application;
/// <summary>固定內部資料指令，不提供任意 SQL。</summary>
public interface IPlatformClient
{
    Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken cancellationToken=default);
}
/// <summary>已驗證的 provider 身分。</summary>
public sealed record VerifiedExternalIdentity(string Provider,string Subject,string EmailNormalized);
/// <summary>各 provider 自行驗證憑證，不信任 client profile。</summary>
public interface IExternalCredentialValidator
{
    Task<VerifiedExternalIdentity> ValidateAsync(string provider,string platform,string credential,CancellationToken cancellationToken=default);
}
/// <summary>僅在持久化後寄送驗證碼。</summary>
public interface IEmailCodeSender
{
    Task SendAsync(JsonNode challenge,string code,CancellationToken cancellationToken=default);
}
