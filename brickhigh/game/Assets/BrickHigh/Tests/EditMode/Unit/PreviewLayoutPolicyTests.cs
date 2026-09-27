using System;
using BrickHigh.Application;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    /// <summary>驗證預覽欄位在視窗尺寸變化時仍可操作。</summary>
    public sealed class PreviewLayoutPolicyTests
    {
        /// <summary>窄視窗讓清單與模型預覽上下排列，寬視窗回到左右排列。</summary>
        [Test, Property("TDD", "UT-105")]
        public void Resolve_NarrowWindow_StacksPanelsWithoutHidingControls()
        {
            Assert.That(PreviewLayoutPolicy.Resolve(600, 900), Is.EqualTo(PreviewPanelFlow.Vertical));
            Assert.That(PreviewLayoutPolicy.Resolve(1280, 720), Is.EqualTo(PreviewPanelFlow.Horizontal));
            Assert.That(PreviewLayoutPolicy.Resolve(700, 700), Is.EqualTo(PreviewPanelFlow.Vertical));
        }

        /// <summary>尺寸尚未建立或不是有限值時不產生無法顯示的佈局。</summary>
        [Test]
        public void Resolve_InvalidDimensions_RejectsLayout()
        {
            Assert.Throws<ArgumentOutOfRangeException>(() => PreviewLayoutPolicy.Resolve(0, 720));
            Assert.Throws<ArgumentOutOfRangeException>(() => PreviewLayoutPolicy.Resolve(float.NaN, 720));
        }
    }
}
