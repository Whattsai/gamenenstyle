namespace DatingHigh.Application.Media;

/// <summary>受控串流取回的私人圖片內容；不含 R2 key。</summary>
public sealed record PrivateMediaContent(ReadOnlyMemory<byte> Bytes,string MimeType);
/// <summary>只有可信用例可呼叫，owner 固定取自已驗證 CurrentUser。</summary>
public interface IPrivateMediaStore
{
    Task SavePhotoAsync(CurrentUser user,string assetId,CompressedImage image,CancellationToken ct=default);
    Task<PrivateMediaContent> ReadPhotoAsync(CurrentUser user,string assetId,CancellationToken ct=default);
    Task DeletePhotoAsync(CurrentUser user,string assetId,CancellationToken ct=default);
}
