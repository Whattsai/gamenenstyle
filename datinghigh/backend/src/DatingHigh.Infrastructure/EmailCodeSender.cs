using System.Text.Json.Nodes;
using Microsoft.Extensions.Logging;
using DatingHigh.Application;
using DatingHigh.Domain;
namespace DatingHigh.Infrastructure;
/// <summary>只有明確 local/Log 才允許專用驗證碼日誌。</summary>
public sealed class EmailCodeSender(AuthOptions options,IPlatformClient platform,ILoggerFactory loggerFactory):IEmailCodeSender
{
    public async Task SendAsync(JsonNode challenge,string code,CancellationToken cancellationToken=default)
    {
        if(challenge.Text("state")!="active") throw new DomainException("EMAIL_DELIVERY_FAILED",503);
        if(options.Environment=="local" && options.EmailDeliveryMode=="Log")
        {
            loggerFactory.CreateLogger("LocalEmailVerification").LogInformation("Purpose={Purpose} Challenge={Challenge} Recipient={Recipient} Generation={Generation} Code={Code} ExpiresAt={Expires}",challenge.Text("purpose"),challenge.Text("challenge_id"),challenge.Text("email_normalized"),challenge.Number("generation"),code,challenge.Number("expires_at"));
            return;
        }
        if(options.EmailDeliveryMode!="Cloudflare") throw new DomainException("EMAIL_DELIVERY_FAILED",503);
        await platform.ExecuteAsync("email.code.send",new{challengeId=challenge.Text("challenge_id"),generation=challenge.Number("generation"),code},cancellationToken);
    }
}
