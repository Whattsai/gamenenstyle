using System.Text.Json;
using System.Text.Json.Nodes;
using DatingHigh.Domain;
using DatingHigh.Application.Media;

namespace DatingHigh.Application;

/// <summary>本人全部真人照排序的完整 JSON 契約；拒絕不完整、未知／重複鍵與外部提供 owner。</summary>
public sealed record PhotoOrderInput(long ExpectedRevision, string[] AssetIds)
{
    public static PhotoOrderInput Parse(ReadOnlyMemory<byte> utf8)
    {
        if (utf8.IsEmpty || utf8.Length > 16_384) throw new DomainException("INVALID_PROFILE");
        try
        {
            using var json = JsonDocument.Parse(utf8, new JsonDocumentOptions { MaxDepth = 4 });
            if (json.RootElement.ValueKind != JsonValueKind.Object)
                throw new DomainException("INVALID_PROFILE");

            var fields = new Dictionary<string,JsonElement>(StringComparer.Ordinal);
            foreach(var property in json.RootElement.EnumerateObject())
            {
                if (property.Name is not("assetIds" or "expectedRevision") ||
                    !fields.TryAdd(property.Name,property.Value))
                    throw new DomainException("INVALID_PROFILE");
            }

            if (fields.Count != 2 ||
                fields["expectedRevision"].ValueKind != JsonValueKind.Number ||
                !fields["expectedRevision"].TryGetInt64(out var revision) ||
                revision is < 1 or > int.MaxValue ||
                fields["assetIds"].ValueKind != JsonValueKind.Array)
                throw new DomainException("INVALID_PROFILE");

            var ids = fields["assetIds"].EnumerateArray().Select(value =>
                value.ValueKind == JsonValueKind.String ? value.GetString() : null).ToArray();
            if (ids.Length is < 1 or > 5 ||
                ids.Any(id => !EntityId.IsValid(id)) ||
                ids.Distinct(StringComparer.Ordinal).Count() != ids.Length)
                throw new DomainException("INVALID_PROFILE");
            return new PhotoOrderInput(revision,ids.Select(id=>id!).ToArray());
        }
        catch(JsonException) { throw new DomainException("INVALID_PROFILE"); }
        catch(InvalidOperationException) { throw new DomainException("INVALID_PROFILE"); }
    }
}

/// <summary>本人私人照片 metadata 與排序；不提供物件路徑、Blob bytes 或跨帳號資料。</summary>
public sealed class PersonalPhotosService(IPlatformClient platform,IPrivateMediaStore media,IImageCompressionService compression)
{
    private static object Auth(CurrentUser user) => new {
        accountId=user.AccountId,sessionId=user.SessionId,
        cv=user.CredentialVersion,accessExpiresAt=user.AccessExpiresAt
    };

    private async Task EnsureSession(CurrentUser user,CancellationToken ct)
    {
        var result=await platform.ExecuteAsync("session.validate",Auth(user),ct);
        if(result["rows"]?.AsArray().Count!=1)
            throw new DomainException("SESSION_REVOKED",401);
    }

    /// <summary>僅投影當下有效的 owner ready 照片，不對外回傳私人 R2 storage key。</summary>
    public async Task<JsonObject> ListAsync(CurrentUser user,CancellationToken ct=default)
    {
        var result=await platform.ExecuteAsync("profile.photo.list",Auth(user),ct);
        var rows=result["rows"]?.AsArray()??throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        var photos=new JsonArray();
        foreach(var item in rows)
        {
            if(item is null)throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
            photos.Add(new JsonObject{
                ["assetId"]=item.Text("asset_id"),
                ["mimeType"]=item.Text("mime_type"),
                ["displayOrder"]=item.Number("display_order"),
                ["createdAt"]=item.Number("created_at")
            });
        }
        // 空集合與已撤銷 Session 都可能是 D1 零列；回應前必須重新查有效 family。
        await EnsureSession(user,ct);
        return new JsonObject{["photos"]=photos};
    }

    /// <summary>安全解碼成功才原子占位，R2 寫入與 ready 提交失敗則補償。</summary>
    public async Task<JsonObject> UploadAsync(CurrentUser user,Stream input,string mime,CancellationToken ct=default)
    {
        var image=await compression.CompressAsync(input,options:new(mime),ct:ct);
        await platform.ExecuteAsync("profile.ensure",new{
            accountId=user.AccountId,sessionId=user.SessionId,cv=user.CredentialVersion,
            accessExpiresAt=user.AccessExpiresAt,profileId=EntityId.New()
        },ct);
        var assetId=EntityId.New();
        var reserved=await platform.ExecuteAsync("profile.photo.reserve",new{
            accountId=user.AccountId,sessionId=user.SessionId,cv=user.CredentialVersion,
            accessExpiresAt=user.AccessExpiresAt,assetId,objectKey=$"private/{user.AccountId}/photos/{assetId}",mimeType=image.MimeType
        },ct);
        if(reserved["rows"]?.AsArray().Count!=1)
        {
            await EnsureSession(user,ct);throw new DomainException("PHOTO_LIMIT_REACHED",409);
        }
        try{await media.SavePhotoAsync(user,assetId,image,ct);}
        catch
        {
            // 與 client 斷線取消分開；若 Session 也失效，Worker GC 會處理逾時 pending。
            using var cleanup=new CancellationTokenSource(TimeSpan.FromSeconds(5));
            try{
                await platform.ExecuteAsync("profile.photo.cancel-upload",new{
                    accountId=user.AccountId,sessionId=user.SessionId,cv=user.CredentialVersion,
                    accessExpiresAt=user.AccessExpiresAt,assetId
                },cleanup.Token);
                await media.DeletePhotoAsync(user,assetId,cleanup.Token);
            }catch(Exception error)when(error is DomainException or HttpRequestException or OperationCanceledException){/* D1 tombstone／逾時 pending 交由既有 cron 重試清理。 */}
            throw;
        }
        var listed=await ListAsync(user,ct);
        var photo=listed["photos"]!.AsArray().SingleOrDefault(p=>p?["assetId"]?.GetValue<string>()==assetId);
        return photo?.DeepClone().AsObject()??throw new DomainException("STORAGE_UNAVAILABLE",503);
    }

    /// <summary>每次開啟都在 Worker 重驗有效 Session 與本人 ready 資產。</summary>
    public Task<PrivateMediaContent> ReadAsync(CurrentUser user,string assetId,CancellationToken ct=default)
    {
        if(!EntityId.IsValid(assetId))throw new DomainException("INVALID_REQUEST");
        return media.ReadPhotoAsync(user,assetId,ct);
    }

    /// <summary>先使後續私人讀取失效，再嘗試實體刪除；儲存故障由 cron 安全重試。</summary>
    public async Task DeleteAsync(CurrentUser user,string assetId,CancellationToken ct=default)
    {
        if(!EntityId.IsValid(assetId))throw new DomainException("INVALID_REQUEST");

        // 只允許公開刪除本人 ready 照片；pending 佔位由上傳補償的內部命令處理。
        var listed=await platform.ExecuteAsync("profile.photo.list",Auth(user),ct);
        var photos=listed["rows"]?.AsArray()??throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        if(!photos.Any(row=>row is not null && row.Text("asset_id")==assetId))
        {
            await EnsureSession(user,ct);
            throw new DomainException("PHOTO_NOT_FOUND",404);
        }

        var current=await platform.ExecuteAsync("profile.read",Auth(user),ct);
        var profile=current["rows"]?.AsArray().FirstOrDefault();
        if(profile is null)
        {
            await EnsureSession(user,ct);
            throw new DomainException("PROFILE_VERSION_CONFLICT",409);
        }

        var result=await platform.ExecuteAsync("profile.photo.delete-compact",new {
            accountId=user.AccountId,sessionId=user.SessionId,
            cv=user.CredentialVersion,accessExpiresAt=user.AccessExpiresAt,
            expectedRevision=profile.Number("revision"),assetId
        },ct);
        var changes=result["changes"]?.AsArray();
        if(changes is null || changes.Count!=3)
            throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        if(changes[0]?.GetValue<long>()==0)
        {
            await EnsureSession(user,ct);
            throw new DomainException("PROFILE_VERSION_CONFLICT",409);
        }
        if(changes[0]?.GetValue<long>()!=1 || changes[1]?.GetValue<long>()!=1)
            throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        using var cleanup=new CancellationTokenSource(TimeSpan.FromSeconds(5));
        try{await media.DeletePhotoAsync(user,assetId,cleanup.Token);}
        catch(Exception error)when(error is DomainException or HttpRequestException or OperationCanceledException){/* 已提交軟刪除，私人 bytes 由 Worker cron 以 tombstone 重試清理。 */}
    }

    /// <summary>D1 同一 batch 核驗全部 ready IDs 並原子重排；不把變更零列當成功。</summary>
    public async Task<long> ReorderAsync(CurrentUser user,PhotoOrderInput input,CancellationToken ct=default)
    {
        var response=await platform.ExecuteAsync("profile.photo.reorder",new{
            accountId=user.AccountId,sessionId=user.SessionId,
            cv=user.CredentialVersion,accessExpiresAt=user.AccessExpiresAt,
            expectedRevision=input.ExpectedRevision,assetIds=input.AssetIds
        },ct);
        var changes=response["changes"]?.AsArray();
        if(changes is null || changes.Count!=2)
            throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        var profileChanged=changes[0]?.GetValue<long>()??-1;
        if(profileChanged==0)
        {
            await EnsureSession(user,ct);
            throw new DomainException("PROFILE_VERSION_CONFLICT",409);
        }
        var photoChanged=changes[1]?.GetValue<long>()??-1;
        var rows=response["rows"]?.AsArray();
        if(profileChanged!=1 || photoChanged!=input.AssetIds.Length ||
           rows is null || rows.Count!=input.AssetIds.Length+1 ||
           rows[0] is null)
            throw new DomainException("DEPENDENCY_UNAVAILABLE",503);
        return rows[0]!.Number("revision");
    }
}
