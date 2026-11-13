using System.Text.Json.Nodes;

namespace DatingHigh.Application.Media;

/// <summary>前景表情 binary bridge，不向公開 API 暴露 lease 或私人 key。</summary>
public interface IAvatarExpressionStore
{
    Task<JsonNode> PublishAsync(CurrentUser user,string workflow,string expression,string requestId,string lease,CompressedImage image,CancellationToken ct=default);
}
