namespace DatingHigh.Application.Media;

/// <summary>供應商可以替換；呼叫一次只允許得到一張安全的角色插畫。</summary>
public interface IAvatarImageGenerator
{
    Task<CompressedImage> GenerateAsync(IReadOnlyList<PrivateMediaContent> photos,string styleId,CancellationToken ct=default);
}

/// <summary>僅由選定的全身候選衍生固定表情；不得重新傳送真人來源。</summary>
public interface IAvatarExpressionGenerator
{
    string Model {get;}
    string ExpressionPromptVersion {get;}
    bool SupportsStaticPoses {get;}
    Task<CompressedImage> GenerateExpressionAsync(PrivateMediaContent master,string expression,CancellationToken ct=default);
}
