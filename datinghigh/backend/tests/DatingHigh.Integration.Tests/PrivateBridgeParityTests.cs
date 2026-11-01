using DatingHigh.Domain;
using DatingHigh.Application;
using DatingHigh.Infrastructure;
namespace DatingHigh.Integration.Tests;

public class PrivateBridgeParityTests
{
    [Fact,Trait("Case","PF-BDD-003")]
    public async Task VerifiedRegistration_CommitsOneCompleteAccountAndRejectsReuse()
    {
        await using var platform = new RealPlatform();
        var challenge = await platform.Request();
        var id = challenge.Text("challengeId");var flow = challenge.Text("flowToken");
        var login = await platform.App.Register(id, flow, platform.Sender.LastCode, RealPlatform.Password, "android", default);
        Assert.Equal(201, login.Status);Assert.False(string.IsNullOrEmpty(login.Access));Assert.False(string.IsNullOrEmpty(login.Refresh));
        var account = Assert.Single(await platform.Sql("SELECT * FROM auth_accounts"))!;
        Assert.Equal(RealPlatform.Email, account.Text("email_normalized"));Assert.Equal("active",account.Text("status"));Assert.True(account.Number("email_verified_at")>0);
        Assert.True(new PasswordHashService().Verify(RealPlatform.Password,account.Text("password_hash")));
        Assert.Empty(await platform.Sql("SELECT identity_id FROM auth_external_identities"));
        var session = Assert.Single(await platform.Sql("SELECT * FROM auth_sessions"))!;Assert.Equal(login.SessionId,session.Text("session_id"));Assert.Equal(account.Text("account_id"),session.Text("account_id"));Assert.Equal(0,session.Number("current_generation"));
        var refresh = Assert.Single(await platform.Sql("SELECT * FROM auth_refresh_tokens"))!;Assert.Equal(login.SessionId,refresh.Text("session_id"));Assert.Equal(0,refresh.Number("generation"));
        Assert.Equal("consumed",Assert.Single(await platform.Sql("SELECT state FROM auth_email_challenges"))!.Text("state"));
        await Assert.ThrowsAsync<DomainException>(()=>platform.App.Register(id,flow,platform.Sender.LastCode,RealPlatform.Password,"android",default));
        Assert.Single(await platform.Sql("SELECT account_id FROM auth_accounts"));Assert.Single(await platform.Sql("SELECT session_id FROM auth_sessions"));Assert.Single(await platform.Sql("SELECT token_id FROM auth_refresh_tokens"));
    }
    [Fact]
    public async Task DuplicateGoogleEmail_ReturnsWorkerConflictAndLeavesExistingAccountIntact()
    {
        await using var platform = new RealPlatform();
        await platform.Seed(true);
        var now = platform.Clock.GetUtcNow().ToUnixTimeMilliseconds();
        var error = await Assert.ThrowsAsync<DomainException>(() => platform.ExecuteAsync("account.register-external", new {
            accountId = EntityId.New(), identityId = EntityId.New(), sessionId = EntityId.New(), tokenId = EntityId.New(),
            tokenHash = new string('a', 64), clientPlatform = "android", absoluteExpiresAt = now + 2592000000,
            idleExpiresAt = now + 604800000, provider = "google", subject = "controlled-subject", email = RealPlatform.Email
        }));
        Assert.Equal(409, error.Status);
        Assert.Equal("EMAIL_ALREADY_REGISTERED", error.Code);
        Assert.Single(await platform.Sql("SELECT account_id FROM auth_accounts"));
        Assert.Empty(await platform.Sql("SELECT identity_id FROM auth_external_identities"));
        Assert.Empty(await platform.Sql("SELECT session_id FROM auth_sessions"));
    }
}
