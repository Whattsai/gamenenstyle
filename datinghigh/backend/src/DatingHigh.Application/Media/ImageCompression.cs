namespace DatingHigh.Application.Media;

/// <summary>共用圖片處理的容量及解碼界線；不包含照片／化身／儲存業務。</summary>
public sealed record ImageCompressionOptions(string? DeclaredMimeType=null,long MaxPixels=24_000_000,int MaxDimension=8192,int MaxInputBytes=8*1024*1024);
/// <summary>只含重新編碼後的安全圖片；不保留原始 metadata。</summary>
public sealed record CompressedImage(ReadOnlyMemory<byte> Bytes,string MimeType,int Width,int Height);
/// <summary>受限串流、安全解碼、方向校正及去 metadata 的共用壓縮介面。</summary>
public interface IImageCompressionService
{
    Task<CompressedImage> CompressAsync(Stream input,int targetBytes=200_000,ImageCompressionOptions? options=null,CancellationToken ct=default);
}
