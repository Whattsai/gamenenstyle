using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Domain;

namespace DatingHigh.Api;

/// <summary>劇情端點的有界 JSON；遞迴拒絕重複鍵，不改動認證 parser。</summary>
public static class StoryPayload
{
    public static async Task<JsonObject> ReadAsync(HttpRequest request,CancellationToken ct)
    {
        if(!request.HasJsonContentType())throw new DomainException("INVALID_STORY_REQUEST");
        using var buffer=new MemoryStream();var chunk=new byte[4096];int read;
        while((read=await request.Body.ReadAsync(chunk,ct))>0){if(buffer.Length+read>16384)throw new DomainException("REQUEST_TOO_LARGE",413);await buffer.WriteAsync(chunk.AsMemory(0,read),ct);}
        try{
            using var doc=JsonDocument.Parse(buffer.ToArray(),new JsonDocumentOptions{MaxDepth=8});
            void Validate(JsonElement e){if(e.ValueKind==JsonValueKind.Object){var seen=new HashSet<string>(StringComparer.Ordinal);foreach(var p in e.EnumerateObject()){if(!seen.Add(p.Name))throw new DomainException("INVALID_STORY_REQUEST");Validate(p.Value);}}else if(e.ValueKind==JsonValueKind.Array)foreach(var item in e.EnumerateArray())Validate(item);}
            Validate(doc.RootElement);return JsonNode.Parse(doc.RootElement.GetRawText()) as JsonObject??throw new DomainException("INVALID_STORY_REQUEST");
        }catch(Exception e)when(e is JsonException or InvalidOperationException){throw new DomainException("INVALID_STORY_REQUEST");}
    }
}
