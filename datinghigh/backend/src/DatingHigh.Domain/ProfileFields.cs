using System.Text.Json;
namespace DatingHigh.Domain;

/// <summary>共用契約的欄位；新增欄位預設不分享，資料庫與固定命令仍須明確升級。</summary>
public sealed record ProfileField(string Key,string Label,string Type,int Order,string Storage,string Editor,
    bool Shareable=false,bool DefaultVisible=false,string? CardKey=null,string? CardLabel=null,int? MaxLength=null,int? Limit=null,string? Options=null);
public static class ProfileFields
{
    public static readonly IReadOnlyList<ProfileField> All=Load();
    private static ProfileField[] Load()
    {
        using var stream=typeof(ProfileFields).Assembly.GetManifestResourceStream("DatingHigh.profile-fields.json")!;
        return JsonSerializer.Deserialize<ProfileField[]>(stream,new JsonSerializerOptions{PropertyNameCaseInsensitive=true})!;
    }
    public static bool CanShare(string key)=>All.Any(f=>f.Shareable&&(f.CardKey??f.Key)==key);
    public static bool Visible(ProfileField field,IReadOnlyDictionary<string,bool> settings)=>
        field.Shareable&&(settings.TryGetValue(field.CardKey??field.Key,out var value)?value:field.DefaultVisible);
}
