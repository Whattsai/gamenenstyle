#if UNITY_EDITOR || BRICKHIGH_INTERNAL_UI
using System;
using System.Collections;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using BrickHigh.Domain;
using BrickHigh.Presentation;
using BrickHigh.UnityRuntime;
using Newtonsoft.Json.Linq;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using UnityEngine.UI;

namespace BrickHigh.PreviewEntry
{
    /// <summary>只編入內部 F-Catalog Player 的實際畫面驗證器；正常啟動不自動操作或退出。</summary>
    public sealed class InternalPreviewAcceptance : MonoBehaviour
    {
        private CatalogPreviewView view;
        private CatalogPreviewController controller;
        private Camera camera;
        private string directory, build, pack;
        private int frame;
        private readonly JArray captures = new JArray();
        private readonly JArray operations = new JArray();

        public void Begin(CatalogPreviewView view, CatalogPreviewController controller, Camera camera, string build, string pack)
        {
            this.view = view; this.controller = controller; this.camera = camera; this.build = build; this.pack = pack;
            controller.Changed += MarkInternal;
            MarkInternal();
            directory = Environment.GetEnvironmentVariable("BRICKHIGH_ACCEPTANCE_OUTPUT");
            if (string.IsNullOrWhiteSpace(directory)) return;
            // 只讓明確指定輸出目錄的內部驗收在失焦時繼續，避免截圖 coroutine 永久暫停。
            UnityEngine.Application.runInBackground = true;
            // 只在已授權內部驗收期間接收失焦時的合成輸入事件；
            // 正常 Player 不執行此元件，仍使用 Unity Input System 的原生焦點政策。
            InputSystem.settings.backgroundBehavior = InputSettings.BackgroundBehavior.IgnoreFocus;
            if (!Path.IsPathRooted(directory)) throw new InvalidOperationException("驗證需新的明確輸出位置。");
            // PreviewBootstrap 會先在同一 acceptance root 寫 bootstrap/diagnostic；這不應被誤判成舊驗證證據。
            // 真正會被本探針產生的 frames/result/progress 必須保持全新，避免覆寫上一輪結果。
            if (Directory.Exists(Path.Combine(directory, "frames"))
                || File.Exists(Path.Combine(directory, "result.json"))
                || File.Exists(Path.Combine(directory, "progress.json")))
                throw new InvalidOperationException("驗證輸出已包含既有探針證據。");
            Directory.CreateDirectory(directory);
            Directory.CreateDirectory(Path.Combine(directory, "frames"));
            WriteProgress("AcceptanceStarted");
            StartCoroutine(Guarded(Run()));
        }
        private void MarkInternal() => view.BannerText.text = "內部幾何測試・品質未核准";
        private IEnumerator Guarded(IEnumerator routine)
        {
            while (true)
            {
                object next;
                try { if (!routine.MoveNext()) break; next = routine.Current; }
                catch (Exception error)
                {
                    File.WriteAllText(Path.Combine(directory, "result.json"), Report(false, error.GetType().Name + ": " + error.Message).ToString());
                    Debug.LogError("InternalPreviewAcceptance: " + error.Message);
                    UnityEngine.Application.Quit(15); yield break;
                }
                yield return next;
            }
        }
        private IEnumerator Run()
        {
            Screen.SetResolution(1280, 720, FullScreenMode.Windowed);
            float deadline = BeginWait("InitialCatalogLoad");
            while (controller.State.IsLoading) { GuardWait(deadline, "InitialCatalogLoad"); yield return null; }
            Require(controller.State.Rows.Count > 0, "EmptyInitialCatalog");
            Require(UnityEngine.Application.companyName == "GameNenStyle" && UnityEngine.Application.productName == "BrickHighPreview", "ApplicationIdentity");
            var variants = controller.State.Rows.ToArray();
            // 由Input System佇列送入按鍵，讓真正Player的Update及UI模組接收。
            // 這是自動輸入驗證，並非桌面HID操作或使用者核准。
            var keyboard = InputSystem.AddDevice<Keyboard>();
            try
            {
                keyboard.MakeCurrent();
                EventSystem.current.SetSelectedGameObject(null);
                foreach (var target in new[] { view.SearchInput.gameObject, view.FamilyInput.gameObject, view.TierDropdown.gameObject })
                {
                    // 在新 Player 視窗失焦或首幀 InputSystem 尚未接收事件時，
                    // 只對「沒有任何選取」重送最多三次實體 Update 經過的 Tab。
                    // 若焦點落在錯誤元件，仍立即判定失敗，不能直接指定正確焦點。
                    GameObject selected = null;
                    for (int attempt = 0; attempt < 3; attempt++)
                    {
                        keyboard.MakeCurrent();
                        InputSystem.QueueStateEvent(keyboard, new KeyboardState(Key.Tab));
                        yield return null;
                        yield return new WaitForEndOfFrame();
                        selected = EventSystem.current.currentSelectedGameObject;
                        keyboard.MakeCurrent();
                        InputSystem.QueueStateEvent(keyboard, new KeyboardState());
                        yield return null;
                        if (selected != null) break;
                        yield return new WaitForEndOfFrame();
                    }
                    Require(selected == target, "KeyboardTab:" + target.name
                        + ":actual=" + (selected == null ? "null" : selected.name));
                }
                keyboard.MakeCurrent();
                InputSystem.QueueStateEvent(keyboard, new KeyboardState(Key.Tab, Key.LeftShift));
                yield return null;
                yield return new WaitForEndOfFrame();
                Require(EventSystem.current.currentSelectedGameObject == view.FamilyInput.gameObject, "KeyboardReverseTab");
                keyboard.MakeCurrent();
                InputSystem.QueueStateEvent(keyboard, new KeyboardState());
                yield return null;
                deadline = BeginWait("KeyboardFilterLoad");
                while (controller.State.IsLoading) { GuardWait(deadline, "KeyboardFilterLoad"); yield return null; }
                EventSystem.current.SetSelectedGameObject(view.ResultViewport.content.GetChild(0).gameObject);
                for (int i = 1; i < variants.Length; i++)
                {
                    keyboard.MakeCurrent();
                    InputSystem.QueueStateEvent(keyboard, new KeyboardState(Key.DownArrow));
                    yield return null;
                    yield return new WaitForEndOfFrame();
                    var selectedRow = EventSystem.current.currentSelectedGameObject;
                    Require(selectedRow != null && selectedRow.transform.parent == view.ResultViewport.content, "KeyboardRowFocus");
                    Require(selectedRow.GetComponentInChildren<Text>().text.StartsWith(variants[i].Name + " · "), "KeyboardRowIdentity");
                    keyboard.MakeCurrent();
                    InputSystem.QueueStateEvent(keyboard, new KeyboardState());
                    yield return null;
                }
                yield return PressKeys(keyboard, Key.Enter);
                deadline = BeginWait("KeyboardSubmitVariant");
                while (controller.State.IsLoading) { GuardWait(deadline, "KeyboardSubmitVariant"); yield return null; }
                Require(controller.Instance != null && controller.State.SelectedDetails?.VariantId == variants.Last().VariantId,
                    "KeyboardSubmitVariant");
                var resetPosition = camera.transform.position;
                yield return PressKeys(keyboard, Key.Tab);
                Require(EventSystem.current.currentSelectedGameObject == view.PreviewInput, "KeyboardPreviewFocus");
                yield return PressKeys(keyboard, Key.RightArrow);
                Require(EventSystem.current.currentSelectedGameObject == view.PreviewInput && camera.transform.position != resetPosition,
                    "KeyboardCameraOrbit");
                yield return PressKeys(keyboard, Key.Tab);
                Require(EventSystem.current.currentSelectedGameObject == view.ResetViewButton.gameObject, "KeyboardResetFocus");
                yield return PressKeys(keyboard, Key.Enter);
                Require(Vector3.Distance(camera.transform.position, resetPosition) < .000001f, "KeyboardResetSubmit");
                operations.Add("input-system-tab-reverse-list-submit-orbit-reset");
            }
            finally { InputSystem.RemoveDevice(keyboard); }
            foreach (var variant in variants)
            {
                Task<bool> selected = controller.SelectAsync(variant.VariantId);
                string loadStage = "ModelLoad:" + variant.Name;
                deadline = BeginWait(loadStage);
                while (!selected.IsCompleted) { GuardWait(deadline, loadStage); yield return null; }
                Require(selected.GetAwaiter().GetResult() && controller.Instance != null, loadStage + ":" + controller.State.ErrorCode);
                yield return new WaitForEndOfFrame();
                CheckGlyphs();
                var modelRenderers = controller.Instance.GetComponentsInChildren<Renderer>(true);
                Require(modelRenderers.Length > 0 && modelRenderers.All(r =>
                    r.sharedMaterials != null && r.sharedMaterials.Length > 0
                    && r.sharedMaterials.All(m => m != null && m.shader != null
                        && m.shader.isSupported && m.shader.name != "Hidden/InternalErrorShader")),
                    "MissingMaterial");
                Capture(variant, "initial");
                var bounds = BoundsOf(controller.Instance);
                float distance = Mathf.Max(bounds.extents.magnitude * 3.4f, .02f);
                var directions = new[] { Vector3.back, Vector3.right, Vector3.forward, Vector3.left, Vector3.up, Vector3.down };
                var names = new[] { "front", "right", "back", "left", "top", "bottom" };
                for (int i = 0; i < directions.Length; i++)
                {
                    camera.transform.position = bounds.center + directions[i] * distance;
                    camera.transform.LookAt(bounds.center, i >= 4 ? Vector3.forward : Vector3.up);
                    yield return new WaitForEndOfFrame();
                    Capture(variant, names[i]);
                }
                // 經同一 UI 輸入接點運行旋轉、縮放與重設，保存真正 Player 畫面。
                var events = EventSystem.current;
                events.SetSelectedGameObject(view.PreviewInput);
                var orbit = view.PreviewInput.GetComponent<PreviewCameraController>();
                orbit.ResetView();
                for (int i = 0; i < 12; i++)
                {
                    orbit.ApplyKeyboard(new Vector2(15, 0), i < 4 ? .1f : 0, false);
                    yield return new WaitForEndOfFrame();
                    Capture(variant, "orbit-" + i);
                }
                view.ResetViewButton.onClick.Invoke();
                operations.Add(new JObject { ["variantId"] = variant.VariantId.ToString(), ["modelLoaded"] = true, ["sixViews"] = true, ["orbitZoomReset"] = true });
            }
            view.SearchInput.SetTextWithoutNotify("__沒有此模型__");
            view.SearchInput.onEndEdit.Invoke(view.SearchInput.text);
            deadline = BeginWait("EmptySearchState");
            while (controller.State.IsLoading) { GuardWait(deadline, "EmptySearchState"); yield return null; }
            Require(controller.State.Rows.Count == 0 && view.StatusText.text.Contains("找不到"), "EmptySearchState");
            yield return new WaitForEndOfFrame();
            Capture(null, "empty-search");
            view.ClearButton.onClick.Invoke();
            deadline = BeginWait("ClearFilters");
            while (controller.State.IsLoading) { GuardWait(deadline, "ClearFilters"); yield return null; }
            Require(controller.State.Rows.Count == variants.Length, "ClearFilters");
            var first = controller.SelectAsync(variants[0].VariantId);
            deadline = BeginWait("ReloadAfterClear");
            while (!first.IsCompleted) { GuardWait(deadline, "ReloadAfterClear"); yield return null; }
            Require(first.GetAwaiter().GetResult() && controller.Instance != null, "ReloadAfterClear");
            Screen.SetResolution(720, 960, FullScreenMode.Windowed);
            for (int i = 0; i < 4; i++) yield return new WaitForEndOfFrame();
            CheckGlyphs(); Capture(variants[0], "portrait");
            operations.Add("empty-search-clear-portrait");
            WriteProgress("Completed");
            File.WriteAllText(Path.Combine(directory, "result.json"), Report(true, null).ToString());
            view.Dispose();
            UnityEngine.Application.Quit(0);
        }
        private float BeginWait(string stage, float timeoutSeconds = 30f)
        {
            WriteProgress(stage);
            return Time.realtimeSinceStartup + timeoutSeconds;
        }
        private static void GuardWait(float deadline, string stage)
        {
            if (Time.realtimeSinceStartup > deadline) throw new TimeoutException(stage);
        }
        private void WriteProgress(string stage)
        {
            if (string.IsNullOrWhiteSpace(directory) || !Directory.Exists(directory)) return;
            File.WriteAllText(Path.Combine(directory, "progress.json"), new JObject {
                ["stage"] = stage, ["frameCount"] = frame, ["captureCount"] = captures.Count,
                ["operationCount"] = operations.Count, ["realtimeSeconds"] = Time.realtimeSinceStartup,
                ["lastActivityAt"] = DateTime.UtcNow.ToString("O"),
                ["isFocused"] = UnityEngine.Application.isFocused, ["runInBackground"] = UnityEngine.Application.runInBackground
            }.ToString());
        }
        private JObject Report(bool success, string error) => new JObject {
            ["success"] = success, ["error"] = error, ["purpose"] = "F-Catalog", ["readyAsset"] = false, ["visualApproved"] = false,
            ["buildId"] = build, ["packId"] = pack, ["unityVersion"] = UnityEngine.Application.unityVersion,
            ["gpu"] = SystemInfo.graphicsDeviceName, ["graphicsApi"] = SystemInfo.graphicsDeviceType.ToString(),
            ["cpu"] = SystemInfo.processorType, ["memoryMb"] = SystemInfo.systemMemorySize,
            ["colorSpace"] = QualitySettings.activeColorSpace.ToString(), ["company"] = UnityEngine.Application.companyName,
            ["product"] = UnityEngine.Application.productName, ["persistentDataPath"] = UnityEngine.Application.persistentDataPath,
            ["ambientColor"] = new JArray(RenderSettings.ambientLight.r, RenderSettings.ambientLight.g, RenderSettings.ambientLight.b),
            ["lights"] = new JArray(FindObjectsByType<Light>(FindObjectsSortMode.None).Select(light => new JObject {
                ["kind"] = light.type.ToString(), ["intensity"] = light.intensity,
                ["rotation"] = new JArray(light.transform.eulerAngles.x, light.transform.eulerAngles.y, light.transform.eulerAngles.z) })),
            ["operations"] = operations, ["captures"] = captures };
        private static IEnumerator PressKeys(Keyboard keyboard, params Key[] keys)
        {
            keyboard.MakeCurrent();
            InputSystem.QueueStateEvent(keyboard, new KeyboardState(keys));
            yield return null;
            yield return new WaitForEndOfFrame();
            keyboard.MakeCurrent();
            InputSystem.QueueStateEvent(keyboard, new KeyboardState());
            yield return null;
            yield return new WaitForEndOfFrame();
        }
        private void Capture(VariantDetails variant, string name)
        {
            WriteProgress("Capture:" + (variant?.Name ?? "none") + ":" + name);
            var image = new Texture2D(Screen.width, Screen.height, TextureFormat.RGB24, false);
            var previousTarget = RenderTexture.active;
            RenderTexture.active = null;
            try
            {
                image.ReadPixels(new Rect(0, 0, Screen.width, Screen.height), 0, 0);
                image.Apply();
                string key = "frames/frame" + (frame++).ToString("D5") + ".png";
                File.WriteAllBytes(Path.Combine(directory, key), image.EncodeToPNG());
                captures.Add(new JObject { ["file"] = key, ["view"] = name, ["variantId"] = variant?.VariantId.ToString(),
                    ["sourceRevision"] = variant?.Model.RevisionId.ToString(), ["runtimeBuildId"] = variant?.RuntimeBuildId,
                    ["width"] = image.width, ["height"] = image.height, ["verticalFov"] = camera.fieldOfView,
                    ["cameraPosition"] = new JArray(camera.transform.position.x, camera.transform.position.y, camera.transform.position.z),
                    ["cameraRotation"] = new JArray(camera.transform.eulerAngles.x, camera.transform.eulerAngles.y, camera.transform.eulerAngles.z) });
            }
            finally { RenderTexture.active = previousTarget; Destroy(image); }
        }
        private void CheckGlyphs()
        {
            foreach (var text in view.GetComponentsInChildren<Text>(true))
                foreach (char glyph in text.text.Distinct())
                    if (!char.IsControl(glyph) && !char.IsWhiteSpace(glyph)) Require(text.font.HasCharacter(glyph), "MissingGlyph:" + ((int)glyph).ToString("X4"));
        }
        private static Bounds BoundsOf(GameObject model)
        {
            var renderers = model.GetComponentsInChildren<Renderer>();
            Require(renderers.Length > 0, "MissingRenderer");
            var bounds = renderers[0].bounds;
            foreach (var renderer in renderers.Skip(1)) bounds.Encapsulate(renderer.bounds);
            return bounds;
        }
        private static void Require(bool condition, string error) { if (!condition) throw new InvalidOperationException(error); }
    }
}
#endif
