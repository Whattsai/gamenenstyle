using System;

namespace BrickHigh.Application
{
    /// <summary>清單與模型預覽的排列方向。</summary>
    public enum PreviewPanelFlow { Horizontal, Vertical }

    /// <summary>依畫面可用尺寸決定原生預覽主要欄位排列。</summary>
    public static class PreviewLayoutPolicy
    {
        /// <summary>寬度不足或視窗接近正方形時改為上下排列。</summary>
        public static PreviewPanelFlow Resolve(float width, float height)
        {
            if (float.IsNaN(width) || float.IsInfinity(width) || width <= 0 ||
                float.IsNaN(height) || float.IsInfinity(height) || height <= 0)
                throw new ArgumentOutOfRangeException(nameof(width), "畫面尺寸必須是有限正數。");
            return width >= 900 && width / height >= 1.2f
                ? PreviewPanelFlow.Horizontal : PreviewPanelFlow.Vertical;
        }
    }
}
