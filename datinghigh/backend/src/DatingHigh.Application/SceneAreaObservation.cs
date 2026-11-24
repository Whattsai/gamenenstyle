using System.Text.Json.Nodes;

namespace DatingHigh.Application;

/// <summary>目前區域會改變；讀過的區域在提交批次中重驗，不能藉對方過往到訪推定仍在場。</summary>
public static class SceneAreaObservation
{
    public static string[] Roles(params JsonNode?[] conditions)
    {
        var roles=new HashSet<string>(StringComparer.Ordinal);
        void Visit(JsonNode? node){
            if(node is JsonArray array){foreach(var child in array)Visit(child);return;}
            if(node is not JsonObject obj)return;
            if(obj["actor_area_is"] is JsonObject area){var role=area["role"]?.GetValue<string>();if(role is "inviter" or "acceptor")roles.Add(role);}
            foreach(var child in obj)Visit(child.Value);
        }
        foreach(var condition in conditions)Visit(condition);
        return roles.Order(StringComparer.Ordinal).ToArray();
    }
}
