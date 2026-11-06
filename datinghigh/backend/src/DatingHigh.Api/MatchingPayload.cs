using System.Text.Json;
using DatingHigh.Domain;

namespace DatingHigh.Api;

/// <summary>配對搜尋數值的嚴格 JSON；其餘配對 POST 沿用字串／空物件契約。</summary>
public sealed record MatchingSearchInput(int Offset,int Limit)
{
    public static async Task<MatchingSearchInput> ReadAsync(HttpRequest request,CancellationToken ct)
    {
        if(!request.HasJsonContentType())throw new DomainException("INVALID_REQUEST");
        using var buffer=new MemoryStream();
        var bytes=new byte[4096];int read;
        while((read=await request.Body.ReadAsync(bytes,ct))>0){if(buffer.Length+read>16384)throw new DomainException("REQUEST_TOO_LARGE",413);await buffer.WriteAsync(bytes.AsMemory(0,read),ct);}
        try{
            using var doc=JsonDocument.Parse(buffer.ToArray(),new JsonDocumentOptions{MaxDepth=2});
            if(doc.RootElement.ValueKind!=JsonValueKind.Object)throw new DomainException("INVALID_REQUEST");
            var fields=new Dictionary<string,int>(StringComparer.Ordinal);
            foreach(var entry in doc.RootElement.EnumerateObject())
                if(entry.Name is not("offset" or "limit")||!entry.Value.TryGetInt32(out var number)||!fields.TryAdd(entry.Name,number))throw new DomainException("INVALID_REQUEST");
            if(fields.Count!=2||fields["offset"] is <0 or >5000||fields["limit"] is <1 or >20)throw new DomainException("INVALID_REQUEST");
            return new(fields["offset"],fields["limit"]);
        }catch(Exception e)when(e is JsonException or InvalidOperationException){throw new DomainException("INVALID_REQUEST");}
    }
}
