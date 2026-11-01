using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Infrastructure;
using DatingHigh.Domain;
namespace DatingHigh.Unit.Tests.Security;
public class PrivateObjectStoreTests
{
    private sealed class Platform:IPlatformClient
    {
        public JsonNode? Payload;
        public Task<JsonNode> ExecuteAsync(string c,object p,CancellationToken ct=default){Payload=JsonSerializer.SerializeToNode(p);return Task.FromResult<JsonNode>(new JsonObject{["content"]=Convert.ToBase64String([1,2,3])});}
    }
    [Fact,Trait("Case","PF-UT-052")]
    public async Task AuthorizeResource_ValidatedCurrentUser_DerivesOwnerFromContext()
    {
        var p=new Platform();var user=new CurrentUser(EntityId.New(),EntityId.New(),2,DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeMilliseconds());var id=EntityId.New();var store=new PrivateObjectStore(p);
        await store.PutAsync(user,"foundation-test",id,new byte[]{1,2,3});Assert.Equal(user.AccountId,p.Payload!["accountId"]!.GetValue<string>());Assert.Null(p.Payload["owner"]);Assert.Equal(new byte[]{1,2,3},await store.GetAsync(user,"foundation-test",id));
        await Assert.ThrowsAsync<DomainException>(()=>store.PutAsync(user,"foundation-test",id,new byte[8193]));
    }
}
