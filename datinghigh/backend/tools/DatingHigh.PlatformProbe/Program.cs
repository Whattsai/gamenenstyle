using System.Security.Claims;
using System.Text;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
using DatingHigh.Infrastructure;
var options=AuthOptions.Load(Environment.GetEnvironmentVariable);
using var http=new HttpClient{BaseAddress=new Uri("http://platform.internal/"),Timeout=TimeSpan.FromSeconds(15)};
var platform=new CloudflarePlatformClient(http);
if(args.Length==0||args[0]=="probe")
{
    await new Readiness(platform,options).CheckAsync();Console.WriteLine("{\"status\":\"passed\",\"boundary\":\"dotnet-outbound-d1-r2\"}");return;
}
if(args[0]!="private-test"||options.Environment!="local")throw new DomainException("RESOURCE_FORBIDDEN",403);
// 憑證只經 stdin 與記憶體，不能放 command line、檔案或輸出。
var input=await Console.In.ReadToEndAsync();if(input.Length>16384)throw new DomainException("INVALID_REQUEST");var payload=JsonNode.Parse(input)!;
async Task<CurrentUser> User(string field)
{
    var principal=new AccessTokens(options,TimeProvider.System).Validate(payload[field]!.GetValue<string>());
    var user=new CurrentUser(principal.FindFirstValue("sub")!,principal.FindFirstValue("sid")!,long.Parse(principal.FindFirstValue("cv")!,System.Globalization.CultureInfo.InvariantCulture),long.Parse(principal.FindFirstValue("exp")!,System.Globalization.CultureInfo.InvariantCulture)*1000);
    var validated=await platform.ExecuteAsync("session.validate",new{accountId=user.AccountId,sessionId=user.SessionId,cv=user.CredentialVersion,accessExpiresAt=user.AccessExpiresAt});
    if(validated["rows"]!.AsArray().Count!=1)throw new DomainException("SESSION_REVOKED",401);return user;
}
var a=await User("accessTokenA");var b=await User("accessTokenB");if(a.AccountId==b.AccountId)throw new DomainException("INVALID_REQUEST");
var store=new PrivateObjectStore(platform);var id=EntityId.New();var bytes=Encoding.UTF8.GetBytes("private-owner-A");
try
{
    await store.PutAsync(a,"foundation-test",id,bytes);
    try{await store.GetAsync(b,"foundation-test",id);throw new InvalidOperationException("Cross-owner object was readable");}catch(DomainException e)when(e.Status==404){}
    await store.PutAsync(b,"foundation-test",id,Encoding.UTF8.GetBytes("private-owner-B"));
    var afterWrite=await store.GetAsync(a,"foundation-test",id);if(!bytes.SequenceEqual(afterWrite))throw new InvalidOperationException("Cross-owner write modified owner data");
    await store.DeleteAsync(b,"foundation-test",id);
    var afterDelete=await store.GetAsync(a,"foundation-test",id);if(!bytes.SequenceEqual(afterDelete))throw new InvalidOperationException("Cross-owner delete modified owner data");
    Console.WriteLine("{\"status\":\"passed\",\"boundary\":\"dotnet-private-object-ownership\"}");
}
finally{await store.DeleteAsync(a,"foundation-test",id);await store.DeleteAsync(b,"foundation-test",id);}
