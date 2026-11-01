using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DatingHigh.Application;
using DatingHigh.Domain;
namespace DatingHigh.Infrastructure;
/// <summary>容器透過 outbound handler 存取 D1/R2。</summary>
public sealed class CloudflarePlatformClient(HttpClient http):IPlatformClient
{
    public async Task<JsonNode> ExecuteAsync(string command,object payload,CancellationToken cancellationToken=default)
    {
        try
        {
            using var response=await http.PostAsJsonAsync($"v1/commands/{command}",payload,cancellationToken);
            var node=await response.Content.ReadFromJsonAsync<JsonNode>(cancellationToken);
            if(!response.IsSuccessStatusCode) throw new DomainException(node?["code"]?.GetValue<string>()??"DEPENDENCY_UNAVAILABLE",(int)response.StatusCode);
            return node??throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        }
        catch(Exception e) when(e is HttpRequestException or TaskCanceledException or System.Text.Json.JsonException) { throw new DomainException("DEPENDENCY_UNAVAILABLE",503); }
    }
}
