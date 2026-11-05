namespace DatingHigh.Application.Media;

/// <summary>供應商可以替換；呼叫一次只允許得到一張安全的角色插畫。</summary>
public interface IAvatarImageGenerator
{
    Task<CompressedImage> GenerateAsync(IReadOnlyList<PrivateMediaContent> photos,string styleId,CancellationToken ct=default);
}
