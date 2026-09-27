#if UNITY_EDITOR
using System;
using System.Linq;
using BrickHigh.Application;
using BrickHigh.Domain;
using BrickHigh.Presentation;
using BrickHigh.UnityRuntime;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;
using UnityEngine.EventSystems;

namespace BrickHigh.Tests
{
    /// <summary>驗證實際 uGUI 樹與畫面自有資源。</summary>
    public sealed class CatalogPreviewViewTests
    {
        private GameObject host;
        private Camera camera;
        private EventSystem events;
        private Font font;
        private CatalogPreviewView view;

        /// <summary>Tab及Shift+Tab走完整操作鏈並略過不可用按鈕，無須先用滑鼠取得焦點。</summary>
        [Test, NUnit.Framework.Property("TDD", "UT-105")]
        public void KeyboardTab_TraversesControlsAndSkipsDisabledActions()
        {
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            view.NextPageButton.interactable = false;
            view.RetryButton.interactable = false;
            events.SetSelectedGameObject(null);
            var expected = new[] { view.SearchInput.gameObject, view.FamilyInput.gameObject,
                view.TierDropdown.gameObject, view.SlotDropdown.gameObject,
                view.SearchPanel.Find("SearchButton").gameObject, view.ClearButton.gameObject,
                view.PreviewInput, view.ResetViewButton.gameObject, view.ExitButton.gameObject,
                view.SearchInput.gameObject };
            foreach (var target in expected)
            {
                view.AdvanceKeyboardFocus(false);
                Assert.That(events.currentSelectedGameObject, Is.SameAs(target));
            }
            view.AdvanceKeyboardFocus(true);
            Assert.That(events.currentSelectedGameObject, Is.SameAs(view.ExitButton.gameObject));
        }

        /// <summary>預覽區方向鍵保留鏡頭控制焦點，不被Button自動導覽搶走。</summary>
        [Test, NUnit.Framework.Property("TDD", "UT-105")]
        public void KeyboardMove_PreviewArea_DoesNotNavigateAwayFromCamera()
        {
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            events.SetSelectedGameObject(view.PreviewInput);
            ExecuteEvents.Execute(view.PreviewInput, new AxisEventData(events) { moveDir = MoveDirection.Down }, ExecuteEvents.moveHandler);
            Assert.That(events.currentSelectedGameObject, Is.SameAs(view.PreviewInput));
        }

        /// <summary>實際方向鍵事件能跨越列池，移動到最後一筆且始終完整可見。</summary>
        [Test, NUnit.Framework.Property("TDD", "UT-105")]
        public void KeyboardMove_VirtualList_ReachesOffscreenRowsWithoutSelectingAnotherVariant()
        {
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            view.GetComponent<Canvas>().renderMode = RenderMode.WorldSpace;
            ((RectTransform)view.transform).sizeDelta = new Vector2(1280, 720);
            view.RefreshLayout(1280, 720);
            Guid snapshot = Guid.NewGuid();
            using (var state = new CatalogPreviewPresenter<ModelLease>(snapshot, PackageKind.Release))
            {
                var rows = Enumerable.Range(0, 50).Select(i => {
                    Guid variant = Guid.NewGuid();
                    return new VariantDetails(variant, "模型" + i, "System", "Active", BrickTier.Basic,
                        new ModelReference(snapshot, variant, Guid.NewGuid()), "{}", "{}", "build-1");
                }).ToArray();
                var request = state.BeginSearch(new VariantQuery());
                state.CompleteSearch(request, CatalogResult<VariantPage>.Success(new VariantPage(rows, null)));
                view.RenderState(state, null);
                events.SetSelectedGameObject(view.ResultViewport.content.GetChild(0).gameObject);
                for (int i = 1; i < 50; i++)
                {
                    ExecuteEvents.Execute(events.currentSelectedGameObject,
                        new AxisEventData(events) { moveDir = MoveDirection.Down }, ExecuteEvents.moveHandler);
                    Assert.That(events.currentSelectedGameObject.GetComponentInChildren<UnityEngine.UI.Text>().text,
                        Does.StartWith("模型" + i + " · "));
                    var row = events.currentSelectedGameObject.GetComponent<RectTransform>();
                    float top = -row.anchoredPosition.y - view.ResultViewport.content.anchoredPosition.y;
                    Assert.That(top, Is.GreaterThanOrEqualTo(-.1f));
                    Assert.That(top + row.rect.height, Is.LessThanOrEqualTo(view.ResultViewport.viewport.rect.height + .1f));
                }
                ExecuteEvents.Execute(events.currentSelectedGameObject,
                    new AxisEventData(events) { moveDir = MoveDirection.Up }, ExecuteEvents.moveHandler);
                Assert.That(events.currentSelectedGameObject.GetComponentInChildren<UnityEngine.UI.Text>().text,
                    Does.StartWith("模型48 · "));
                Assert.That(state.SelectedDetails, Is.Null, "鍵盤焦點移動不能自行載入模型。");
            }
        }

        /// <summary>每個案例使用獨立的 Unity 畫面資源。</summary>
        [SetUp]
        public void SetUp()
        {
            host = new GameObject("Preview UI fixture");
            camera = new GameObject("Camera").AddComponent<Camera>();
            camera.transform.SetParent(host.transform);
            events = new GameObject("Events", typeof(EventSystem)).GetComponent<EventSystem>();
            events.transform.SetParent(host.transform);
            font = new Font();
        }

        /// <summary>清除測試畫面，不保留任何臨時 RenderTexture。</summary>
        [TearDown]
        public void TearDown()
        {
            view?.Dispose();
            UnityEngine.Object.DestroyImmediate(host);
            UnityEngine.Object.DestroyImmediate(font);
        }

        /// <summary>需要外部注入字型，並生成可供鍵盤選取的搜尋、篩選與操作元件。</summary>
        [Test, NUnit.Framework.Property("TDD", "UT-097"), NUnit.Framework.Property("TDD", "UT-105")]
        public void Create_RequiredControls_UsesInjectedFontAndBoundedRows()
        {
            Assert.Throws<ArgumentNullException>(() => CatalogPreviewView.Create(null, camera, host.transform, events));
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            Assert.That(view.SearchInput, Is.Not.Null);
            Assert.That(view.FamilyInput, Is.Not.Null);
            Assert.That(view.TierDropdown, Is.Not.Null);
            Assert.That(view.SlotDropdown, Is.Not.Null);
            Assert.That(view.ResultViewport, Is.Not.Null);
            Assert.That(view.NextPageButton, Is.Not.Null);
            Assert.That(view.ClearButton, Is.Not.Null);
            Assert.That(view.RetryButton, Is.Not.Null);
            Assert.That(view.ResetViewButton, Is.Not.Null);
            Assert.That(view.ExitButton, Is.Not.Null);
            Assert.That(view.PreviewInput, Is.Not.Null);
            Assert.That(view.VisibleRowCount, Is.InRange(1, 12));
            Assert.That(events.GetComponent<BaseInputModule>()?.GetType().Name, Is.EqualTo("InputSystemUIInputModule"));
            Assert.That(view.GetComponentsInChildren<UnityEngine.UI.Text>(true).All(x => x.font == font), Is.True);
        }

        /// <summary>完整引用的版本、來源公尺尺寸及 Unknown 生產狀態在技術預覽同時可讀。</summary>
        [Test, NUnit.Framework.Property("TDD", "UT-101"), NUnit.Framework.Property("TDD", "UT-139")]
        public void RenderState_SelectedPreviewVariant_ShowsVersionDimensionsAndUnknown()
        {
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            Guid snapshot = Guid.NewGuid(), variant = Guid.NewGuid(), revision = Guid.NewGuid();
            using (var state = new CatalogPreviewPresenter<ModelLease>(snapshot, PackageKind.Preview))
            {
                var request = state.BeginSearch(new VariantQuery());
                var rows = new[] { new VariantDetails(variant, "透明印刷件", "System", "Unknown", BrickTier.Special,
                    new ModelReference(snapshot, variant, revision), "{}",
                    "{\"widthMeters\":0.032,\"heightMeters\":0.0096,\"depthMeters\":0.016}", "build-7") };
                state.CompleteSearch(request, CatalogResult<VariantPage>.Success(new VariantPage(rows, null)));
                state.BeginSelect(variant);
                view.RenderState(state, null);
                Assert.That(view.BannerText.text, Is.EqualTo("技術預覽・非完整模型庫"));
                Assert.That(view.DetailsText.text, Does.Contain("透明印刷件"));
                Assert.That(view.DetailsText.text, Does.Contain(revision.ToString("D")));
                Assert.That(view.DetailsText.text, Does.Contain("build-7"));
                Assert.That(view.DetailsText.text, Does.Contain("32 × 9.6 × 16 mm"));
                Assert.That(view.DetailsText.text, Does.Contain("生產狀態待查"));
                Assert.That(view.DetailsText.text.Split('\n')[1], Is.EqualTo("生產狀態待查"),
                    "直式初始詳細資料前兩行必須直接顯示來源狀態。");
                Assert.That(view.VisibleRowCount, Is.LessThanOrEqualTo(12));
            }
        }

        /// <summary>空結果保留清除入口；暫時模型錯誤提供單次重試。</summary>
        [Test, NUnit.Framework.Property("TDD", "UT-110"), NUnit.Framework.Property("TDD", "UT-118")]
        public void RenderState_EmptyAndRetry_UsesPresenterActions()
        {
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            Guid snapshot = Guid.NewGuid(), variant = Guid.NewGuid();
            using (var state = new CatalogPreviewPresenter<ModelLease>(snapshot, PackageKind.Release))
            {
                var search = state.BeginSearch(new VariantQuery());
                state.CompleteSearch(search, CatalogResult<VariantPage>.Success(new VariantPage(Array.Empty<VariantDetails>(), null)));
                view.RenderState(state, null);
                Assert.That(view.StatusText.text, Is.EqualTo("找不到符合條件的模型。"));
                Assert.That(view.ClearButton.interactable, Is.True);
                var again = state.BeginSearch(new VariantQuery());
                state.CompleteSearch(again, CatalogResult<VariantPage>.Success(new VariantPage(new[] {
                    new VariantDetails(variant, "磚", "System", "Active", BrickTier.Basic,
                        new ModelReference(snapshot, variant, Guid.NewGuid()), "{}", "{}", "build-1") }, null)));
                var load = state.BeginSelect(variant);
                state.CompleteModel(load, CatalogResult<ModelLease>.Failure(CatalogErrorCode.StorageUnavailable));
                view.RenderState(state, null);
                Assert.That(view.RetryButton.interactable, Is.True);
                Assert.That(view.StatusText.text, Does.StartWith("載入失敗，請重試。"));
                Assert.That(view.StatusText.text, Does.Contain("診斷 ID"));
            }
        }

        /// <summary>直式畫面改為上下欄位，離開與重開各持有新的 RenderTexture。</summary>
        [Test, NUnit.Framework.Property("TDD", "UT-105"), NUnit.Framework.Property("TDD", "UT-121"), NUnit.Framework.Property("TDD", "UT-123")]
        public void RefreshLayoutAndDispose_ReentryOwnsFreshRenderTexture()
        {
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            var first = view.RenderTexture;
            Assert.That(camera.targetTexture, Is.SameAs(first));
            view.RefreshLayout(600, 900);
            Assert.That(view.Flow, Is.EqualTo(PreviewPanelFlow.Vertical));
            Assert.That(view.SearchPanel.anchorMin.y, Is.GreaterThan(view.PreviewPanel.anchorMin.y));
            view.Dispose();
            Assert.That(camera.targetTexture, Is.Null);
            Assert.That(view.RenderTexture, Is.Null);
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            Assert.That(view.RenderTexture, Is.Not.SameAs(first));
        }

        /// <summary>僅呈現同包入口提供的真實覆蓋數字，不從當頁結果推算全量。</summary>
        [Test, NUnit.Framework.Property("TDD", "UT-139")]
        public void SetCoverage_PreviewSummary_ShowsActualCountsAndSubset()
        {
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            var coverage = new CatalogCoverage { C = 120, A = 90, R = 10, U = 20, G = 7, V = 65 };
            view.SetCoverage(coverage, 3);
            Assert.That(view.CoverageText.text, Does.Contain("C=120"));
            Assert.That(view.CoverageText.text, Does.Contain("A=90"));
            Assert.That(view.CoverageText.text, Does.Contain("R=10"));
            Assert.That(view.CoverageText.text, Does.Contain("U=20"));
            Assert.That(view.CoverageText.text, Does.Contain("G=7"));
            Assert.That(view.CoverageText.text, Does.Contain("V=65"));
            Assert.That(view.CoverageText.text, Does.Contain("本包子集合：3"));
            Assert.Throws<ArgumentOutOfRangeException>(() => view.SetCoverage(coverage, -1));
        }

        /// <summary>以實際矩形角點檢查直式清單與模型區域均有足夠且未越界的畫面。</summary>
        [Test, NUnit.Framework.Property("TDD", "UT-105")]
        public void RefreshLayout_NarrowCanvas_KeepsResultsAndModelVisible()
        {
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            view.GetComponent<Canvas>().renderMode = RenderMode.WorldSpace;
            var canvasRect = (RectTransform)view.transform;
            foreach (var sample in new[] { new Vector2(720, 960), new Vector2(720, 720) })
            {
                canvasRect.sizeDelta = sample;
                view.RefreshLayout(sample.x, sample.y);
                Canvas.ForceUpdateCanvases();
                float resultHeight = WorldHeight(view.ResultViewport.GetComponent<RectTransform>());
                float modelHeight = WorldHeight(view.PreviewInput.GetComponent<RectTransform>());
                Assert.That(resultHeight, Is.GreaterThanOrEqualTo(sample.y == 960 ? 176 : 44),
                    "虛擬清單至少能顯示完整列。");
                Assert.That(modelHeight, Is.GreaterThanOrEqualTo(150), "模型仍可觀察與拖曳。");
                AssertInside(view.ResultViewport.GetComponent<RectTransform>(), view.SearchPanel);
                AssertInside(view.PreviewInput.GetComponent<RectTransform>(), view.PreviewPanel);
            }
        }

        private static float WorldHeight(RectTransform rect)
        {
            var corners = new Vector3[4];
            rect.GetWorldCorners(corners);
            return corners[1].y - corners[0].y;
        }

        /// <summary>1080p 的長清單不能因固定十列池而留下空白，滾動到底仍可見末列。</summary>
        [Test, NUnit.Framework.Property("TDD", "UT-097")]
        public void RenderState_TallViewport_VirtualRowsCoverEveryVisiblePosition()
        {
            view = CatalogPreviewView.Create(font, camera, host.transform, events);
            view.GetComponent<Canvas>().renderMode = RenderMode.WorldSpace;
            ((RectTransform)view.transform).sizeDelta = new Vector2(1920, 1080);
            view.RefreshLayout(1920, 1080);
            Guid snapshot = Guid.NewGuid();
            using (var state = new CatalogPreviewPresenter<ModelLease>(snapshot, PackageKind.Preview))
            {
                var search = state.BeginSearch(new VariantQuery());
                var items = Enumerable.Range(0, 50).Select(i =>
                {
                    Guid variant = Guid.NewGuid();
                    return new VariantDetails(variant, "模型" + i, "System", "Unknown", BrickTier.Basic,
                        new ModelReference(snapshot, variant, Guid.NewGuid()), "{}", "{}", "fixture");
                }).ToArray();
                state.CompleteSearch(search, CatalogResult<VariantPage>.Success(new VariantPage(items, null)));
                view.RenderState(state, null);
                Canvas.ForceUpdateCanvases();
                foreach (float position in new[] { 1f, .5f, 0f })
                {
                    view.ResultViewport.verticalNormalizedPosition = position;
                    view.ResultViewport.onValueChanged.Invoke(new Vector2(0, position));
                    Canvas.ForceUpdateCanvases();
                    float offset = view.ResultViewport.content.anchoredPosition.y;
                    float height = view.ResultViewport.viewport.rect.height;
                    int first = Mathf.FloorToInt(offset / 44);
                    int last = Mathf.Min(49, Mathf.CeilToInt((offset + height) / 44) - 1);
                    var labels = view.ResultViewport.content.GetComponentsInChildren<UnityEngine.UI.Text>()
                        .Select(label => label.text).ToArray();
                    for (int i = first; i <= last; i++)
                        Assert.That(labels.Any(label => label.StartsWith(items[i].Name + " · ")), Is.True,
                            "可見列不得因虛擬池不足而空白：" + i);
                    Assert.That(view.VisibleRowCount, Is.LessThan(50), "不將全部頁面建立為常駐 UI。");
                }
            }
        }

        private static void AssertInside(RectTransform child, RectTransform parent)
        {
            var inner = new Vector3[4]; var outer = new Vector3[4];
            child.GetWorldCorners(inner); parent.GetWorldCorners(outer);
            Assert.That(inner[0].x, Is.GreaterThanOrEqualTo(outer[0].x - .01f));
            Assert.That(inner[2].x, Is.LessThanOrEqualTo(outer[2].x + .01f));
            Assert.That(inner[0].y, Is.GreaterThanOrEqualTo(outer[0].y - .01f));
            Assert.That(inner[2].y, Is.LessThanOrEqualTo(outer[2].y + .01f));
        }

        /// <summary>真隨包字型在橫向與直式尺寸皆保有可讀像素及完整文字內容。</summary>
        [TestCase(1280, 720), TestCase(720, 960), TestCase(720, 720), NUnit.Framework.Property("TDD", "UT-105")]
        public void RealFont_ViewportText_RemainsReadableAndComplete(int width, int height)
        {
            var bundled = AssetDatabase.LoadAssetAtPath<Font>("Assets/BrickHigh/Fonts/NotoSansCJKtc-Regular.otf");
            Assert.That(bundled, Is.Not.Null, "必須用實際隨包 Noto 字型驗證。");
            view = CatalogPreviewView.Create(bundled, camera, host.transform, events);
            var canvas = view.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.WorldSpace;
            ((RectTransform)view.transform).sizeDelta = new Vector2(width, height);
            view.RefreshLayout(width, height);
            Guid snapshot = Guid.NewGuid(), variant = Guid.NewGuid();
            using (var state = new CatalogPreviewPresenter<ModelLease>(snapshot, PackageKind.Preview))
            {
                var search = state.BeginSearch(new VariantQuery());
                var details = new VariantDetails(variant, "內部幾何探針 3001.dat 透明", "System", "Unknown", BrickTier.Basic,
                    new ModelReference(snapshot, variant, Guid.NewGuid()), "{}",
                    "{\"widthMeters\":0.032,\"heightMeters\":0.0112,\"depthMeters\":0.016}", Guid.NewGuid().ToString("D"));
                state.CompleteSearch(search, CatalogResult<VariantPage>.Success(new VariantPage(new[] { details }, null)));
                state.BeginSelect(variant);
                view.SetCoverage(new CatalogCoverage { C = 8, A = 0, R = 0, U = 8, G = 8, V = 0 }, 8);
                view.RenderState(state, null);
                Canvas.ForceUpdateCanvases();
                Assert.That(view.GetComponent<UnityEngine.UI.CanvasScaler>().uiScaleMode,
                    Is.EqualTo(UnityEngine.UI.CanvasScaler.ScaleMode.ConstantPixelSize), "直式畫面不得縮成 5–8px 文字。");
                var title = view.SearchPanel.Find("Title").GetComponent<UnityEngine.UI.Text>();
                Assert.That(title.fontSize, Is.GreaterThanOrEqualTo(20));
                Assert.That(view.CoverageText.fontSize, Is.GreaterThanOrEqualTo(14));
                foreach (var text in new[] { title, view.BannerText, view.CoverageText })
                {
                    Assert.That(text.preferredHeight, Is.LessThanOrEqualTo(text.rectTransform.rect.height + .5f), text.name);
                    Assert.That(text.cachedTextGenerator.characterCountVisible, Is.GreaterThanOrEqualTo(text.text.Length - 1), text.name);
                }
                Assert.That(view.CoverageText.text, Does.Contain("本包子集合：8"));
                Assert.That(view.DetailsText.text, Does.Contain("生產狀態待查"));
                var scroll = view.DetailsText.GetComponentInParent<UnityEngine.UI.ScrollRect>();
                Assert.That(scroll, Is.Not.Null, "完整 GUID 與 Unknown 必須可捲動讀取。");
                Assert.That(scroll.content.rect.height, Is.GreaterThanOrEqualTo(view.DetailsText.preferredHeight - .5f));
                Assert.That(view.DetailsText.cachedTextGenerator.characterCountVisible,
                    Is.GreaterThanOrEqualTo(view.DetailsText.text.Length - 1));
                if (width == 1280)
                    Assert.That(scroll.viewport.rect.height, Is.GreaterThanOrEqualTo(view.DetailsText.preferredHeight - .5f),
                        "橫向常用尺寸應直接看見 Unknown 生產狀態。");
            }
        }
    }
}
#endif
