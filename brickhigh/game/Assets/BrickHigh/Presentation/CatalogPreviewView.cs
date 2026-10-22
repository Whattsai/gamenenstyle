using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using BrickHigh.Application;
using BrickHigh.Domain;
using BrickHigh.UnityRuntime;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.UI;
using UnityEngine.UI;
using Object = UnityEngine.Object;

namespace BrickHigh.Presentation
{
    /// <summary>由外部本機包入口建立的 uGUI 預覽；只透過控制器操作固定 session。</summary>
    public sealed class CatalogPreviewView : MonoBehaviour, IDisposable
    {
        private const int PoolSize = 10;
        private const float RowHeight = 44;
        private readonly List<Button> rowButtons = new List<Button>();
        private readonly List<Text> rowLabels = new List<Text>();
        private IReadOnlyList<VariantDetails> rows = Array.Empty<VariantDetails>();
        private Font font;
        private Camera camera;
        private EventSystem events;
        private CatalogPreviewController controller;
        private VariantQuery submittedQuery;
        private RawImage modelImage;
        private RectTransform resultContent;
        private RectTransform detailsViewport;
        private Button searchButton;
        private PreviewCameraController cameraInput;
        private RenderTexture texture;
        private RenderTexture previousTarget;
        private GameObject boundInstance;
        private bool ownsEvents;
        private bool disposed;
        private bool deferExitDestroy;

        /// <summary>離開按鈕觸發時，讓外部場景入口接續切換。</summary>
        public event Action ExitRequested;
        /// <summary>文字或貨號查詢。</summary>
        public InputField SearchInput { get; private set; }
        /// <summary>系列名稱精確篩選。</summary>
        public InputField FamilyInput { get; private set; }
        /// <summary>款式篩選。</summary>
        public Dropdown TierDropdown { get; private set; }
        /// <summary>人物部位篩選。</summary>
        public Dropdown SlotDropdown { get; private set; }
        /// <summary>可滾動的有界當頁清單。</summary>
        public ScrollRect ResultViewport { get; private set; }
        /// <summary>當頁持續重用的清單列數量。</summary>
        public int VisibleRowCount => rowButtons.Count;
        /// <summary>下一頁按鈕。</summary>
        public Button NextPageButton { get; private set; }
        /// <summary>清除所有搜尋條件的按鈕。</summary>
        public Button ClearButton { get; private set; }
        /// <summary>暫時載入失敗的重試按鈕。</summary>
        public Button RetryButton { get; private set; }
        /// <summary>重設實際模型取景的按鈕。</summary>
        public Button ResetViewButton { get; private set; }
        /// <summary>退出並釋放畫面資源的按鈕。</summary>
        public Button ExitButton { get; private set; }
        /// <summary>可接收 raycast 與鍵盤選取的模型預覽區域。</summary>
        public GameObject PreviewInput { get; private set; }
        /// <summary>左側搜尋與清單欄位。</summary>
        public RectTransform SearchPanel { get; private set; }
        /// <summary>右側模型與詳情欄位。</summary>
        public RectTransform PreviewPanel { get; private set; }
        /// <summary>目前欄位排列方向。</summary>
        public PreviewPanelFlow Flow { get; private set; }
        /// <summary>預覽專用的 RenderTexture；Dispose 後為 null。</summary>
        public RenderTexture RenderTexture => texture;
        /// <summary>技術預覽固定提示。</summary>
        public Text BannerText { get; private set; }
        /// <summary>版本與尺寸摘要。</summary>
        public Text DetailsText { get; private set; }
        /// <summary>載入、空狀態及固定錯誤文案。</summary>
        public Text StatusText { get; private set; }
        /// <summary>字型缺少或無法確認字形時的可見提示；不代表畫面已核准。</summary>
        public Text FontWarningText { get; private set; }
        /// <summary>由同包入口提供的來源涵蓋數字與實際子集合數。</summary>
        public Text CoverageText { get; private set; }

        /// <summary>建立可直接綁定控制器的程序式場景；Font 由具授權的隨包資產注入。</summary>
        public static CatalogPreviewView Create(Font font, Camera camera, Transform parent = null, EventSystem events = null)
        {
            if (font == null) throw new ArgumentNullException(nameof(font));
            if (camera == null) throw new ArgumentNullException(nameof(camera));
            var root = new GameObject("CatalogPreviewView", typeof(RectTransform), typeof(Canvas),
                typeof(CanvasScaler), typeof(GraphicRaycaster), typeof(CatalogPreviewView));
            if (parent != null) root.transform.SetParent(parent, false);
            var view = root.GetComponent<CatalogPreviewView>();
            view.Initialize(font, camera, events);
            return view;
        }

        /// <summary>將已用真實本機包開啟的控制器接上畫面，立即開始首頁查詢。</summary>
        public void Bind(CatalogPreviewController openedController)
        {
            if (disposed) throw new ObjectDisposedException(nameof(CatalogPreviewView));
            if (openedController == null) throw new ArgumentNullException(nameof(openedController));
            if (controller != null) throw new InvalidOperationException("預覽畫面已綁定控制器。");
            controller = openedController;
            controller.Changed += ControllerChanged;
            SubmitSearch(true);
        }

        /// <summary>顯示同包目錄真實覆蓋資料；不以當頁清單推算完整度。</summary>
        public void SetCoverage(CatalogCoverage coverage, int packagedVariantCount)
        {
            if (disposed) throw new ObjectDisposedException(nameof(CatalogPreviewView));
            if (coverage == null) throw new ArgumentNullException(nameof(coverage));
            if (packagedVariantCount < 0 || coverage.C < 0 || coverage.G < 0 || coverage.V < 0)
                throw new ArgumentOutOfRangeException(nameof(packagedVariantCount));
            CoverageText.text = "來源 C=" + coverage.C + "  G=" + coverage.G + "  V=" + coverage.V +
                "\n本包子集合：" + packagedVariantCount + (coverage.ScopeReviewed ? "" : " ・來源範圍待審查");
            RefreshFontWarning();
        }

        /// <summary>依 Presenter 的固定快照狀態更新文字與可操作控制，絕不自行取得資產。</summary>
        public void RenderState(CatalogPreviewPresenter<ModelLease> state, GameObject instance)
        {
            if (disposed || state == null) return;
            BannerText.text = state.Banner;
            rows = state.Rows;
            resultContent.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, Mathf.Max(1, rows.Count * RowHeight));
            UpdateRows();
            NextPageButton.interactable = state.CanNextPage;
            ClearButton.interactable = state.CanClear;
            searchButton.interactable = state.CanSearch;
            RetryButton.interactable = state.CanRetry;
            RetryButton.GetComponentInChildren<Text>().text = state.RetryText;
            string message = state.Message;
            StatusText.text = string.IsNullOrEmpty(state.DiagnosticId) || string.IsNullOrEmpty(message)
                ? message : message + "  診斷 ID：" + state.DiagnosticId;
            DetailsText.text = FormatDetails(state.SelectedDetails);
            FitDetailsContent(true);
            modelImage.enabled = instance != null && state.Model != null;
            if (boundInstance != instance)
            {
                cameraInput.Unbind();
                boundInstance = instance;
                if (instance != null && TryWorldBounds(instance, out var bounds))
                    cameraInput.Bind(camera, bounds, events);
            }
        }

        /// <summary>視窗長寬變化時重排欄位與 RenderTexture，保留鏡頭旋轉及縮放。</summary>
        public void RefreshLayout(float width, float height)
        {
            if (disposed) return;
            Flow = PreviewLayoutPolicy.Resolve(width, height);
            if (Flow == PreviewPanelFlow.Horizontal)
            {
                Stretch(SearchPanel, 0, 0, .38f, 1);
                Stretch(PreviewPanel, .38f, 0, 1, 1);
                Top((RectTransform)SearchPanel.Find("Title"), 6, 48);
                Top(BannerText.rectTransform, 56, 32);
                Top(SearchInput.GetComponent<RectTransform>(), 94, 38);
                Top(FamilyInput.GetComponent<RectTransform>(), 137, 38);
                Top(TierDropdown.GetComponent<RectTransform>(), 180, 38);
                Top(SlotDropdown.GetComponent<RectTransform>(), 223, 38);
                Top(searchButton.GetComponent<RectTransform>(), 266, 38);
                Top(ClearButton.GetComponent<RectTransform>(), 309, 38);
                ResultViewport.GetComponent<RectTransform>().offsetMin = new Vector2(12, 58);
                ResultViewport.GetComponent<RectTransform>().offsetMax = new Vector2(-12, -355);
                LayoutPreview(false);
            }
            else
            {
                Stretch(SearchPanel, 0, .5f, 1, 1);
                Stretch(PreviewPanel, 0, 0, 1, .5f);
                Top((RectTransform)SearchPanel.Find("Title"), 4, 48);
                Top(BannerText.rectTransform, 54, 32);
                Top(SearchInput.GetComponent<RectTransform>(), 88, 34);
                Top(FamilyInput.GetComponent<RectTransform>(), 126, 34);
                Column(TierDropdown.GetComponent<RectTransform>(), 0, .5f, 164, 34);
                Column(SlotDropdown.GetComponent<RectTransform>(), .5f, 1, 164, 34);
                Column(searchButton.GetComponent<RectTransform>(), 0, .5f, 202, 34);
                Column(ClearButton.GetComponent<RectTransform>(), .5f, 1, 202, 34);
                ResultViewport.GetComponent<RectTransform>().offsetMin = new Vector2(12, 50);
                ResultViewport.GetComponent<RectTransform>().offsetMax = new Vector2(-12, -244);
                LayoutPreview(true);
            }
            int targetWidth = Mathf.Clamp(Mathf.RoundToInt(width * (Flow == PreviewPanelFlow.Horizontal ? .62f : 1f)), 256, 2048);
            int targetHeight = Mathf.Clamp(Mathf.RoundToInt(height * (Flow == PreviewPanelFlow.Horizontal ? 1f : .5f)
                - (Flow == PreviewPanelFlow.Horizontal ? 338 : 208)), 128, 2048);
            ResizeTexture(targetWidth, targetHeight);
            FitDetailsContent(false);
            UpdateRows();
        }

        private void LayoutPreview(bool compact)
        {
            var coverage = CoverageText.rectTransform;
            coverage.anchoredPosition = new Vector2(0, -6);
            coverage.sizeDelta = new Vector2(-24, 70);
            var modelArea = PreviewInput.GetComponent<RectTransform>();
            modelArea.offsetMin = new Vector2(12, compact ? 128 : 258);
            modelArea.offsetMax = new Vector2(-12, -80);
            detailsViewport.anchoredPosition = new Vector2(0, compact ? 70 : 84);
            detailsViewport.sizeDelta = new Vector2(-24, compact ? 54 : 170);
            var status = StatusText.rectTransform;
            status.anchoredPosition = new Vector2(0, compact ? 40 : 48);
            status.sizeDelta = new Vector2(-24, compact ? 28 : 32);
            foreach (var button in new[] { RetryButton, ResetViewButton, ExitButton })
            {
                var rect = button.GetComponent<RectTransform>();
                rect.anchoredPosition = new Vector2(0, compact ? 4 : 8);
                rect.sizeDelta = new Vector2(-12, compact ? 32 : 36);
            }
        }

        private void FitDetailsContent(bool resetScroll)
        {
            if (DetailsText == null || detailsViewport == null) return;
            Canvas.ForceUpdateCanvases();
            var content = DetailsText.rectTransform;
            content.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical,
                Mathf.Max(detailsViewport.rect.height, Mathf.Ceil(DetailsText.preferredHeight) + 2));
            if (resetScroll) detailsViewport.GetComponent<ScrollRect>().verticalNormalizedPosition = 1;
        }

        /// <summary>解除狀態通知，關閉 session／lease，釋放專用紋理並還原借用 Camera。</summary>
        public void Dispose()
        {
            if (disposed) return;
            disposed = true;
            if (controller != null)
            {
                controller.Changed -= ControllerChanged;
                controller.Dispose();
                controller = null;
            }
            cameraInput?.Unbind();
            boundInstance = null;
            if (camera != null && camera.targetTexture == texture) camera.targetTexture = previousTarget;
            if (modelImage != null) modelImage.texture = null;
            if (texture != null) { texture.Release(); DestroyOwned(texture); texture = null; }
            if (ownsEvents && events != null && !deferExitDestroy) DestroyOwned(events.gameObject);
            ExitRequested = null;
#if UNITY_EDITOR
            if (deferExitDestroy && !UnityEngine.Application.isPlaying)
            {
                var ownedView = gameObject;
                UnityEditor.EditorApplication.delayCall += () => { if (ownedView != null) Object.DestroyImmediate(ownedView); };
                return;
            }
#endif
            DestroyOwned(gameObject);
        }

        private void Initialize(Font suppliedFont, Camera suppliedCamera, EventSystem suppliedEvents)
        {
            font = suppliedFont; camera = suppliedCamera; previousTarget = camera.targetTexture;
            var canvas = GetComponent<Canvas>(); canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            GetComponent<CanvasScaler>().uiScaleMode = CanvasScaler.ScaleMode.ConstantPixelSize;
            GetComponent<CanvasScaler>().scaleFactor = 1;
            events = suppliedEvents;
            if (events == null)
            {
                events = new GameObject("CatalogPreviewEventSystem", typeof(EventSystem)).GetComponent<EventSystem>();
                events.transform.SetParent(transform, false); ownsEvents = true;
            }
            if (events.GetComponent<InputSystemUIInputModule>() == null) events.gameObject.AddComponent<InputSystemUIInputModule>();
            var background = Panel("Background", transform, new Color(.07f, .09f, .13f));
            Stretch(background, 0, 0, 1, 1);
            SearchPanel = Panel("SearchPanel", background, new Color(.11f, .14f, .19f));
            PreviewPanel = Panel("PreviewPanel", background, new Color(.08f, .11f, .16f));
            BuildSearch(); BuildPreview();
            RefreshLayout(Mathf.Max(320, Screen.width), Mathf.Max(320, Screen.height));
        }

        private void BuildSearch()
        {
            var title = Label("Title", SearchPanel, "模型預覽", 25, TextAnchor.MiddleLeft);
            Top(title.rectTransform, 12, 32);
            BannerText = Label("PackageBanner", SearchPanel, "", 15, TextAnchor.MiddleLeft);
            Top(BannerText.rectTransform, 47, 24);
            SearchInput = Input("SearchInput", SearchPanel, "貨號或名稱", 77);
            FamilyInput = Input("FamilyInput", SearchPanel, "系列", 120);
            TierDropdown = Choice("TierDropdown", SearchPanel, new[] { "所有款式", "Basic", "Advanced", "Special" }, 163);
            SlotDropdown = Choice("SlotDropdown", SearchPanel, new[] { "所有部位", "Head", "Body", "Hands", "Legs", "Headwear", "HandEquipment", "Accessory" }, 206);
            searchButton = Action("SearchButton", SearchPanel, "搜尋", 249);
            ClearButton = Action("ClearButton", SearchPanel, "清除條件", 292);
            var viewport = Panel("ResultViewport", SearchPanel, new Color(.08f, .1f, .14f));
            viewport.anchorMin = Vector2.zero; viewport.anchorMax = Vector2.one;
            viewport.offsetMin = new Vector2(12, 58); viewport.offsetMax = new Vector2(-12, -338);
            viewport.gameObject.AddComponent<Mask>().showMaskGraphic = true;
            var contentObject = new GameObject("Content", typeof(RectTransform));
            contentObject.transform.SetParent(viewport, false);
            resultContent = contentObject.GetComponent<RectTransform>();
            resultContent.anchorMin = new Vector2(0, 1); resultContent.anchorMax = new Vector2(1, 1);
            resultContent.pivot = new Vector2(.5f, 1); resultContent.anchoredPosition = Vector2.zero;
            resultContent.sizeDelta = new Vector2(0, 1);
            ResultViewport = viewport.gameObject.AddComponent<ScrollRect>();
            ResultViewport.viewport = viewport; ResultViewport.content = resultContent;
            ResultViewport.horizontal = false; ResultViewport.vertical = true;
            ResultViewport.movementType = ScrollRect.MovementType.Clamped;
            ResultViewport.onValueChanged.AddListener(_ => UpdateRows());
            for (int i = 0; i < PoolSize; i++)
            {
                var row = Button("VariantRow" + i, resultContent, "", 0, 14);
                rowButtons.Add(row); rowLabels.Add(row.GetComponentInChildren<Text>());
                row.gameObject.SetActive(false);
            }
            NextPageButton = Action("NextPageButton", SearchPanel, "下一頁", 0);
            var nextRect = (RectTransform)NextPageButton.transform;
            nextRect.anchorMin = new Vector2(0, 0); nextRect.anchorMax = new Vector2(1, 0);
            nextRect.pivot = new Vector2(.5f, 0); nextRect.anchoredPosition = new Vector2(0, 10);
            nextRect.sizeDelta = new Vector2(-24, 40);
            searchButton.onClick.AddListener(() => SubmitSearch(true));
            SearchInput.onEndEdit.AddListener(_ => SubmitSearch(false));
            FamilyInput.onEndEdit.AddListener(_ => SubmitSearch(false));
            TierDropdown.onValueChanged.AddListener(_ => SubmitSearch(false));
            SlotDropdown.onValueChanged.AddListener(_ => SubmitSearch(false));
            SearchInput.onValueChanged.AddListener(_ => RefreshFontWarning());
            FamilyInput.onValueChanged.AddListener(_ => RefreshFontWarning());
            TierDropdown.onValueChanged.AddListener(_ => RefreshFontWarning());
            SlotDropdown.onValueChanged.AddListener(_ => RefreshFontWarning());
            ClearButton.onClick.AddListener(() =>
            {
                SearchInput.SetTextWithoutNotify(""); FamilyInput.SetTextWithoutNotify("");
                TierDropdown.SetValueWithoutNotify(0); SlotDropdown.SetValueWithoutNotify(0);
                submittedQuery = Query();
                RefreshFontWarning();
                if (controller != null) Run(() => controller.ClearFiltersAsync());
            });
            NextPageButton.onClick.AddListener(() => { if (controller != null) Run(() => controller.NextPageAsync()); });
        }

        private void BuildPreview()
        {
            CoverageText = Label("Coverage", PreviewPanel, "", 14, TextAnchor.MiddleLeft);
            var coverageRect = CoverageText.rectTransform;
            coverageRect.anchorMin = new Vector2(0, 1); coverageRect.anchorMax = new Vector2(1, 1);
            coverageRect.pivot = new Vector2(.5f, 1); coverageRect.anchoredPosition = new Vector2(0, -6);
            coverageRect.sizeDelta = new Vector2(-24, 70);
            var modelArea = Panel("PreviewInput", PreviewPanel, new Color(.12f, .17f, .23f));
            modelArea.anchorMin = new Vector2(0, 0); modelArea.anchorMax = Vector2.one;
            modelArea.offsetMin = new Vector2(12, 258); modelArea.offsetMax = new Vector2(-12, -80);
            PreviewInput = modelArea.gameObject;
            var select = modelArea.gameObject.AddComponent<Button>();
            select.targetGraphic = modelArea.GetComponent<Image>();
            select.navigation = new Navigation { mode = Navigation.Mode.None };
            select.onClick.AddListener(() => events.SetSelectedGameObject(PreviewInput));
            cameraInput = modelArea.gameObject.AddComponent<PreviewCameraController>();
            var raw = new GameObject("ModelTexture", typeof(RectTransform), typeof(RawImage));
            raw.transform.SetParent(modelArea, false);
            modelImage = raw.GetComponent<RawImage>(); modelImage.raycastTarget = false;
            Stretch((RectTransform)raw.transform, 0, 0, 1, 1);
            modelImage.enabled = false;
            detailsViewport = Panel("DetailsViewport", PreviewPanel, new Color(.08f, .11f, .16f));
            detailsViewport.anchorMin = new Vector2(0, 0); detailsViewport.anchorMax = new Vector2(1, 0);
            detailsViewport.pivot = new Vector2(.5f, 0); detailsViewport.anchoredPosition = new Vector2(0, 84);
            detailsViewport.sizeDelta = new Vector2(-24, 170);
            detailsViewport.gameObject.AddComponent<RectMask2D>();
            DetailsText = Label("Details", detailsViewport, "", 14, TextAnchor.UpperLeft);
            var detailsRect = DetailsText.rectTransform;
            detailsRect.anchorMin = new Vector2(0, 1); detailsRect.anchorMax = new Vector2(1, 1);
            detailsRect.pivot = new Vector2(.5f, 1); detailsRect.anchoredPosition = Vector2.zero;
            detailsRect.sizeDelta = new Vector2(0, 170);
            DetailsText.horizontalOverflow = HorizontalWrapMode.Wrap;
            DetailsText.verticalOverflow = VerticalWrapMode.Overflow;
            var detailsScroll = detailsViewport.gameObject.AddComponent<ScrollRect>();
            detailsScroll.viewport = detailsViewport;
            detailsScroll.content = detailsRect;
            detailsScroll.horizontal = false;
            detailsScroll.vertical = true;
            detailsScroll.movementType = ScrollRect.MovementType.Clamped;
            StatusText = Label("Status", PreviewPanel, "", 14, TextAnchor.MiddleLeft);
            var statusRect = StatusText.rectTransform;
            statusRect.anchorMin = new Vector2(0, 0); statusRect.anchorMax = new Vector2(1, 0);
            statusRect.pivot = new Vector2(.5f, 0); statusRect.anchoredPosition = new Vector2(0, 48);
            statusRect.sizeDelta = new Vector2(-24, 32);
            StatusText.horizontalOverflow = HorizontalWrapMode.Wrap;
            RetryButton = BottomAction("RetryButton", "重試", 0, .33f);
            ResetViewButton = BottomAction("ResetViewButton", "重設視角", .33f, .67f);
            ExitButton = BottomAction("ExitButton", "離開預覽", .67f, 1);
            RetryButton.onClick.AddListener(() => { if (controller != null) Run(() => controller.RetryAsync()); });
            ResetViewButton.onClick.AddListener(() => cameraInput.ResetView());
            ExitButton.onClick.AddListener(() => { ExitRequested?.Invoke(); deferExitDestroy = true; Dispose(); });

            var warningPanel = Panel("FontWarning", PreviewPanel, new Color(.48f, .16f, .12f, .96f));
            warningPanel.anchorMin = Vector2.one; warningPanel.anchorMax = Vector2.one;
            warningPanel.pivot = Vector2.one; warningPanel.anchoredPosition = new Vector2(-12, -82);
            warningPanel.sizeDelta = new Vector2(270, 24);
            warningPanel.GetComponent<Image>().raycastTarget = false;
            FontWarningText = Label("Label", warningPanel, "", 12, TextAnchor.MiddleCenter);
            Stretch(FontWarningText.rectTransform, 0, 0, 1, 1);
            FontWarningText.color = new Color(1f, .91f, .86f);
            FontWarningText.horizontalOverflow = HorizontalWrapMode.Overflow;
            warningPanel.gameObject.SetActive(false);
        }

        private Button BottomAction(string name, string label, float left, float right)
        {
            var button = Button(name, PreviewPanel, label, 0, 14);
            var rect = (RectTransform)button.transform;
            rect.anchorMin = new Vector2(left, 0); rect.anchorMax = new Vector2(right, 0);
            rect.pivot = new Vector2(.5f, 0); rect.anchoredPosition = new Vector2(0, 8);
            rect.sizeDelta = new Vector2(-12, 36);
            return button;
        }

        private VariantQuery Query() => new VariantQuery
        {
            QueryText = string.IsNullOrWhiteSpace(SearchInput.text) ? null : SearchInput.text,
            Family = string.IsNullOrWhiteSpace(FamilyInput.text) ? null : FamilyInput.text,
            Tier = TierDropdown.value == 0 ? (BrickTier?)null : (BrickTier)(TierDropdown.value - 1),
            Slot = SlotDropdown.value == 0 ? (CharacterSlot?)null : (CharacterSlot)(SlotDropdown.value - 1),
            Limit = 50
        };

        private void SubmitSearch(bool force)
        {
            if (disposed || controller == null) return;
            var query = Query();
            // Tab離開未改動欄位不可重查，否則會清空使用者正要操作的清單焦點。
            if (!force && submittedQuery != null && query.QueryText == submittedQuery.QueryText &&
                query.Family == submittedQuery.Family && query.Tier == submittedQuery.Tier && query.Slot == submittedQuery.Slot) return;
            submittedQuery = query.Copy();
            Run(() => controller.SearchAsync(query));
        }

        private async void Run(Func<Task<bool>> action)
        {
            if (disposed || controller == null) return;
            try { await action(); }
            catch (Exception error)
            {
                if (!disposed) { Debug.LogException(error); StatusText.text = "載入失敗，請重試。"; }
            }
        }

        private void ControllerChanged()
        {
            if (!disposed && controller != null) RenderState(controller.State, controller.Instance);
        }

        private void UpdateRows()
        {
            if (resultContent == null) return;
            var currentFocus = events.currentSelectedGameObject;
            var selectedRow = currentFocus != null && currentFocus.transform.parent == resultContent
                ? currentFocus.GetComponent<CatalogRowNavigation>() : null;
            Guid? focusedVariant = selectedRow != null ? selectedRow.VariantId : (Guid?)null;
            // 捲動重用列時保留資料身分，不能讓焦點悄悄變成另一個變體。
            if (focusedVariant.HasValue) events.SetSelectedGameObject(null);
            // 依實際可見高度配置有界池；較高視窗不能只建立固定十列。
            int required = Mathf.Clamp(Mathf.CeilToInt(ResultViewport.viewport.rect.height / RowHeight) + 1, PoolSize, 100);
            while (rowButtons.Count < required)
            {
                var row = Button("VariantRow" + rowButtons.Count, resultContent, "", 0, 14);
                rowButtons.Add(row); rowLabels.Add(row.GetComponentInChildren<Text>());
                row.gameObject.SetActive(false);
            }
            int maxFirst = Mathf.Max(0, rows.Count - rowButtons.Count);
            int first = Mathf.Clamp(Mathf.FloorToInt(resultContent.anchoredPosition.y / RowHeight), 0, maxFirst);
            for (int i = 0; i < rowButtons.Count; i++)
            {
                int index = first + i;
                var button = rowButtons[i];
                button.gameObject.SetActive(index < rows.Count);
                if (index >= rows.Count) continue;
                VariantDetails details = rows[index];
                var navigation = button.GetComponent<CatalogRowNavigation>() ?? button.gameObject.AddComponent<CatalogRowNavigation>();
                navigation.Index = index; navigation.VariantId = details.VariantId; navigation.Move = MoveRow;
                button.navigation = new Navigation { mode = Navigation.Mode.None };
                rowLabels[i].text = details.Name + " · " + details.VariantId.ToString("N").Substring(0, 8);
                var rect = (RectTransform)button.transform;
                rect.anchorMin = new Vector2(0, 1); rect.anchorMax = new Vector2(1, 1);
                rect.pivot = new Vector2(.5f, 1); rect.anchoredPosition = new Vector2(0, -index * RowHeight);
                rect.sizeDelta = new Vector2(0, RowHeight - 2);
                button.onClick.RemoveAllListeners();
                Guid selected = details.VariantId;
                button.onClick.AddListener(() => { if (controller != null) Run(() => controller.SelectAsync(selected)); });
                if (focusedVariant == details.VariantId) events.SetSelectedGameObject(button.gameObject);
            }
            RefreshFontWarning();
        }

        private void RefreshFontWarning()
        {
            if (FontWarningText == null) return;
            var missing = new SortedSet<int>();
            foreach (var label in GetComponentsInChildren<Text>(true))
            {
                if (label == FontWarningText || !label.isActiveAndEnabled || string.IsNullOrEmpty(label.text)) continue;
                CollectMissingGlyphs(label.text, missing);
            }
            // InputField 的顯示 Text 會到稍後才刷新，直接檢查正在輸入的值。
            if (SearchInput != null) CollectMissingGlyphs(SearchInput.text, missing);
            if (FamilyInput != null) CollectMissingGlyphs(FamilyInput.text, missing);

            if (missing.Count == 0)
            {
                FontWarningText.text = "";
                FontWarningText.transform.parent.gameObject.SetActive(false);
                return;
            }

            int first = missing.Min;
            string count = missing.Count > 1 ? " (+" + (missing.Count - 1).ToString(CultureInfo.InvariantCulture) + ")" : "";
            FontWarningText.text = "FONT GLYPH NOT VERIFIED: U+" + first.ToString("X4", CultureInfo.InvariantCulture) + count;
            FontWarningText.transform.parent.gameObject.SetActive(true);
        }

        private void CollectMissingGlyphs(string value, SortedSet<int> missing)
        {
            if (string.IsNullOrEmpty(value)) return;
            for (int i = 0; i < value.Length; i++)
            {
                char current = value[i];
                if (char.IsControl(current)) continue;
                int scalar = current;
                if (char.IsHighSurrogate(current) && i + 1 < value.Length && char.IsLowSurrogate(value[i + 1]))
                {
                    scalar = char.ConvertToUtf32(current, value[++i]);
                    // 舊版 uGUI 逐一查詢 UTF-16 字元，無法在此確認增補平面的完整字形。
                    missing.Add(scalar);
                }
                else if (!font.HasCharacter(current)) missing.Add(scalar);
            }
        }

        private void MoveRow(int index, MoveDirection direction)
        {
            if (disposed) return;
            if (direction == MoveDirection.Right) { events.SetSelectedGameObject(PreviewInput); return; }
            if (direction == MoveDirection.Left) { events.SetSelectedGameObject(ClearButton.gameObject); return; }
            int next = index + (direction == MoveDirection.Down ? 1 : direction == MoveDirection.Up ? -1 : 0);
            if (next < 0) { events.SetSelectedGameObject(ClearButton.gameObject); return; }
            if (next >= rows.Count)
            {
                events.SetSelectedGameObject(NextPageButton.IsInteractable() ? NextPageButton.gameObject : PreviewInput);
                return;
            }
            float height = ResultViewport.viewport.rect.height;
            float offset = resultContent.anchoredPosition.y;
            float top = next * RowHeight;
            if (top < offset) offset = top;
            else if (top + RowHeight > offset + height) offset = top + RowHeight - height;
            ResultViewport.StopMovement();
            resultContent.anchoredPosition = new Vector2(0, Mathf.Clamp(offset, 0, Mathf.Max(0, rows.Count * RowHeight - height)));
            UpdateRows();
            var target = rowButtons.FirstOrDefault(button => button.gameObject.activeSelf &&
                button.GetComponent<CatalogRowNavigation>().Index == next);
            if (target != null) events.SetSelectedGameObject(target.gameObject);
        }

        private void ResizeTexture(int width, int height)
        {
            if (texture != null && texture.width == width && texture.height == height) return;
            if (texture != null)
            {
                if (camera.targetTexture == texture) camera.targetTexture = previousTarget;
                modelImage.texture = null;
                texture.Release(); DestroyOwned(texture);
            }
            texture = new RenderTexture(width, height, 24, RenderTextureFormat.ARGB32) { name = "CatalogPreviewView" };
            camera.targetTexture = texture; camera.aspect = (float)width / height;
            modelImage.texture = texture;
            cameraInput.RefreshProjection();
        }

        private void Update()
        {
            var keyboard = Keyboard.current;
            if (!disposed && keyboard != null && keyboard.tabKey.wasPressedThisFrame)
                AdvanceKeyboardFocus(keyboard.leftShiftKey.isPressed || keyboard.rightShiftKey.isPressed);
            if (!disposed && (Screen.width != lastWidth || Screen.height != lastHeight))
            {
                lastWidth = Screen.width; lastHeight = Screen.height;
                if (lastWidth > 0 && lastHeight > 0) RefreshLayout(lastWidth, lastHeight);
            }
        }

        /// <summary>Tab導覽入口，保留可操作控制的穩定順序並略過不可用項目。</summary>
        public void AdvanceKeyboardFocus(bool reverse)
        {
            if (disposed) return;
            var current = events.currentSelectedGameObject;
            if (current != null && !current.transform.IsChildOf(transform)) return;
            // 展開中的選單先收起，再回到它在主要操作鏈的位置。
            foreach (var dropdown in new[] { TierDropdown, SlotDropdown })
            {
                if (current != null && current != dropdown.gameObject && current.transform.IsChildOf(dropdown.transform))
                {
                    current = dropdown.gameObject;
                    dropdown.Hide();
                }
            }
            var controls = new List<Selectable> { SearchInput, FamilyInput, TierDropdown, SlotDropdown, searchButton, ClearButton };
            var row = rowButtons.FirstOrDefault(button => button.gameObject == current) ??
                rowButtons.FirstOrDefault(button => button.gameObject.activeSelf &&
                    -((RectTransform)button.transform).anchoredPosition.y >= resultContent.anchoredPosition.y - .1f);
            if (row != null && row.gameObject.activeSelf) controls.Add(row);
            controls.AddRange(new Selectable[] { NextPageButton, PreviewInput.GetComponent<Button>(), RetryButton, ResetViewButton, ExitButton });
            controls.RemoveAll(control => !control.isActiveAndEnabled || !control.IsInteractable());
            if (controls.Count == 0) return;
            int index = controls.FindIndex(control => control.gameObject == current);
            int next = index < 0 ? (reverse ? controls.Count - 1 : 0)
                : (index + (reverse ? -1 : 1) + controls.Count) % controls.Count;
            events.SetSelectedGameObject(controls[next].gameObject);
        }

        private int lastWidth, lastHeight;
        private void OnDestroy() { if (!disposed) Dispose(); }

        private static void DestroyOwned(Object value)
        {
#if UNITY_EDITOR
            if (!UnityEngine.Application.isPlaying) { Object.DestroyImmediate(value); return; }
#endif
            Object.Destroy(value);
        }

        private static bool TryWorldBounds(GameObject instance, out Bounds bounds)
        {
            var renderers = instance.GetComponentsInChildren<Renderer>(true);
            if (renderers.Length == 0) { bounds = default; return false; }
            bounds = renderers[0].bounds;
            for (int i = 1; i < renderers.Length; i++) bounds.Encapsulate(renderers[i].bounds);
            return true;
        }

        private static string FormatDetails(VariantDetails details)
        {
            if (details == null) return "請從清單選取模型。";
            var size = Dimensions.From(details.MetadataJson);
            return "名稱：" + details.Name + "\n尺寸：" + size +
                "\n變體：" + details.VariantId.ToString("D") +
                "\n版本：" + details.Model.RevisionId.ToString("D") +
                "\nRuntimeBuild：" + details.RuntimeBuildId;
        }

        [Serializable]
        private sealed class Dimensions
        {
            public float widthMeters, heightMeters, depthMeters;
            public float[] bounds;
            public static string From(string json)
            {
                Dimensions data = null;
                try { if (!string.IsNullOrWhiteSpace(json)) data = JsonUtility.FromJson<Dimensions>(json); }
                catch (ArgumentException) { }
                if (data == null) return "待查";
                float[] values = data.bounds != null && data.bounds.Length == 3 ? data.bounds
                    : new[] { data.widthMeters, data.heightMeters, data.depthMeters };
                return string.Join(" × ", values.Select(Format).ToArray()) + " mm";
            }
            private static string Format(float meters) => float.IsNaN(meters) || float.IsInfinity(meters) || meters <= 0
                ? "待查" : (meters * 1000).ToString("0.#", CultureInfo.InvariantCulture);
        }

        private RectTransform Panel(string name, Transform parent, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>(); image.color = color; image.raycastTarget = true;
            return go.GetComponent<RectTransform>();
        }

        private Text Label(string name, Transform parent, string content, int size, TextAnchor anchor)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var label = go.GetComponent<Text>();
            label.font = font; label.fontSize = size; label.text = content;
            label.color = new Color(.94f, .96f, 1); label.alignment = anchor; label.raycastTarget = false;
            return label;
        }

        private Button Button(string name, Transform parent, string label, int top, int fontSize)
        {
            var rect = Panel(name, parent, new Color(.21f, .31f, .42f));
            var button = rect.gameObject.AddComponent<Button>();
            button.targetGraphic = rect.GetComponent<Image>();
            button.navigation = new Navigation { mode = Navigation.Mode.Automatic };
            var text = Label("Label", rect, label, fontSize, TextAnchor.MiddleCenter);
            Stretch(text.rectTransform, 0, 0, 1, 1);
            if (top != 0) Top(rect, top, 38);
            return button;
        }

        private Button Action(string name, Transform parent, string label, int top) => Button(name, parent, label, top, 16);

        private InputField Input(string name, Transform parent, string placeholder, int top)
        {
            var rect = Panel(name, parent, new Color(.92f, .94f, .98f));
            Top(rect, top, 38);
            var input = rect.gameObject.AddComponent<InputField>();
            var text = Label("Text", rect, "", 16, TextAnchor.MiddleLeft);
            text.color = new Color(.08f, .1f, .15f); text.supportRichText = false;
            text.rectTransform.offsetMin = new Vector2(8, 0); text.rectTransform.offsetMax = new Vector2(-8, 0);
            Stretch(text.rectTransform, 0, 0, 1, 1);
            var hint = Label("Placeholder", rect, placeholder, 16, TextAnchor.MiddleLeft);
            hint.color = new Color(.4f, .43f, .48f); Stretch(hint.rectTransform, 0, 0, 1, 1);
            hint.rectTransform.offsetMin = new Vector2(8, 0); hint.rectTransform.offsetMax = new Vector2(-8, 0);
            input.textComponent = text; input.placeholder = hint;
            input.navigation = new Navigation { mode = Navigation.Mode.Automatic };
            return input;
        }

        private Dropdown Choice(string name, Transform parent, IEnumerable<string> options, int top)
        {
            var rect = Panel(name, parent, new Color(.92f, .94f, .98f)); Top(rect, top, 38);
            var dropdown = rect.gameObject.AddComponent<Dropdown>();
            var caption = Label("Caption", rect, "", 16, TextAnchor.MiddleLeft);
            caption.color = new Color(.08f, .1f, .15f); Stretch(caption.rectTransform, 0, 0, 1, 1);
            caption.rectTransform.offsetMin = new Vector2(8, 0); caption.rectTransform.offsetMax = new Vector2(-8, 0);
            var template = Panel("Template", rect, new Color(.91f, .93f, .97f));
            template.anchorMin = new Vector2(0, 0); template.anchorMax = new Vector2(1, 0);
            template.pivot = new Vector2(.5f, 1); template.anchoredPosition = Vector2.zero;
            template.sizeDelta = new Vector2(0, 210);
            var scroll = template.gameObject.AddComponent<ScrollRect>();
            scroll.horizontal = false; scroll.vertical = true;
            var viewport = Panel("Viewport", template, new Color(.91f, .93f, .97f));
            Stretch(viewport, 0, 0, 1, 1); viewport.gameObject.AddComponent<Mask>();
            var content = new GameObject("Content", typeof(RectTransform)).GetComponent<RectTransform>();
            content.SetParent(viewport, false); Stretch(content, 0, 0, 1, 1);
            var item = Panel("Item", content, Color.white);
            item.anchorMin = new Vector2(0, 1); item.anchorMax = new Vector2(1, 1);
            item.pivot = new Vector2(.5f, 1); item.anchoredPosition = Vector2.zero;
            item.sizeDelta = new Vector2(0, 32);
            var toggle = item.gameObject.AddComponent<Toggle>();
            toggle.targetGraphic = item.GetComponent<Image>();
            var check = Panel("Checkmark", item, new Color(.18f, .41f, .64f));
            check.anchorMin = new Vector2(0, .5f); check.anchorMax = new Vector2(0, .5f);
            check.sizeDelta = new Vector2(12, 12); check.anchoredPosition = new Vector2(12, 0);
            toggle.graphic = check.GetComponent<Image>();
            var itemText = Label("ItemLabel", item, "", 15, TextAnchor.MiddleLeft);
            itemText.color = new Color(.08f, .1f, .15f); Stretch(itemText.rectTransform, 0, 0, 1, 1);
            itemText.rectTransform.offsetMin = new Vector2(28, 0);
            scroll.viewport = viewport; scroll.content = content;
            dropdown.template = template; dropdown.captionText = caption; dropdown.itemText = itemText;
            dropdown.options = options.Select(x => new Dropdown.OptionData(x)).ToList();
            dropdown.RefreshShownValue();
            template.gameObject.SetActive(false);
            dropdown.navigation = new Navigation { mode = Navigation.Mode.Automatic };
            return dropdown;
        }

        private static void Top(RectTransform rect, float top, float height)
        {
            rect.anchorMin = new Vector2(0, 1); rect.anchorMax = new Vector2(1, 1);
            rect.pivot = new Vector2(.5f, 1); rect.anchoredPosition = new Vector2(0, -top);
            rect.sizeDelta = new Vector2(-24, height);
        }

        private static void Column(RectTransform rect, float left, float right, float top, float height)
        {
            rect.anchorMin = new Vector2(left, 1); rect.anchorMax = new Vector2(right, 1);
            rect.pivot = new Vector2(.5f, 1); rect.anchoredPosition = new Vector2(0, -top);
            rect.sizeDelta = new Vector2(-18, height);
        }

        private static void Stretch(RectTransform rect, float left, float bottom, float right, float top)
        {
            rect.anchorMin = new Vector2(left, bottom); rect.anchorMax = new Vector2(right, top);
            rect.offsetMin = Vector2.zero; rect.offsetMax = Vector2.zero;
        }
    }
}
