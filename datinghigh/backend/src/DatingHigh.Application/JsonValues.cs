using System.Text.Json.Nodes;
using DatingHigh.Domain;
namespace DatingHigh.Application;
/// <summary>將資料存取列的必要型別集中檢查。</summary>
public static class JsonValues
{
    public static string Text(this JsonNode n,string key)=>n[key]?.GetValue<string>()??throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
    public static long Number(this JsonNode n,string key)=>n[key]?.GetValue<long>()??throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
    public static string? Maybe(this JsonNode n,string key)=>n[key]?.GetValue<string>();
    public static bool IsEmpty(this JsonNode n)=>n is JsonObject o && o.Count==0;
}
