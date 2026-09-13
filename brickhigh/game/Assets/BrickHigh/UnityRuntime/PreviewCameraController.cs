using System;
using BrickHigh.Application;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;
using UnityEngine.UI;

namespace BrickHigh.UnityRuntime
{
    /// <summary>放在預覽區域的 uGUI 輸入接點；只操作借用的 Camera，不持有模型或資產租約。</summary>
    [RequireComponent(typeof(RectTransform))]
    public sealed class PreviewCameraController : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler, IScrollHandler
    {
        private Camera view;
        private EventSystem inputEvents;
        private PreviewOrbitPolicy orbit;
        private Vector3 center;
        private int? draggingPointer;
        private float previousFov, previousAspect;

        /// <summary>綁定已驗證模型的世界 bounds；不設定模型 transform，不取得 Camera 所有權。</summary>
        public void Bind(Camera camera, Bounds modelBounds, EventSystem eventSystem)
        {
            UnityThread.RequireMain();
            if (camera == null) throw new ArgumentNullException(nameof(camera));
            if (eventSystem == null) throw new ArgumentNullException(nameof(eventSystem));
            if (camera.orthographic) throw new ArgumentException("預覽需要透視鏡頭。", nameof(camera));
            Vector3 size = modelBounds.size, position = modelBounds.center;
            if (!Finite(position.x) || !Finite(position.y) || !Finite(position.z)
                || !Finite(size.x) || !Finite(size.y) || !Finite(size.z) || size.x < 0 || size.y < 0 || size.z < 0)
                throw new ArgumentOutOfRangeException(nameof(modelBounds));
            var next = new PreviewOrbitPolicy(modelBounds.extents.magnitude, camera.fieldOfView, camera.aspect);
            view = camera; inputEvents = eventSystem; center = position; orbit = next; draggingPointer = null;
            previousFov = camera.fieldOfView; previousAspect = camera.aspect;
            Apply();
        }
        /// <summary>解除借用及拖曳；不銷毀 Camera、模型、共用 mesh 或材質。</summary>
        public void Unbind() { UnityThread.RequireMain(); draggingPointer = null; orbit = null; view = null; inputEvents = null; }
        private bool TextFocused
        {
            get
            {
                var selected = inputEvents != null ? inputEvents.currentSelectedGameObject : null;
                // 選取當幀即隔離輸入，不等待 InputField 下一幀才更新 isFocused。
                return selected != null && selected.GetComponentInParent<InputField>() != null;
            }
        }
        private bool CanOperate
        {
            get
            {
                if (TextFocused) { draggingPointer = null; return false; }
                return isActiveAndEnabled && orbit != null && view != null && inputEvents != null;
            }
        }
        /// <summary>只有在預覽區域開始的左鍵拖曳可取得該指標的操作權。</summary>
        public void OnBeginDrag(PointerEventData eventData)
        {
            if (!CanOperate || eventData == null || eventData.button != PointerEventData.InputButton.Left || draggingPointer.HasValue) return;
            draggingPointer = eventData.pointerId;
        }
        /// <summary>只接受原拖曳指標；文字焦點會永久結束這次拖曳。</summary>
        public void OnDrag(PointerEventData eventData)
        {
            if (!CanOperate || eventData == null || draggingPointer != eventData.pointerId) return;
            if (orbit.Orbit(eventData.delta.x * .25, -eventData.delta.y * .25, false)) Apply();
        }
        /// <summary>拖曳結束後不再接收晚到位移。</summary>
        public void OnEndDrag(PointerEventData eventData)
        { if (eventData != null && draggingPointer == eventData.pointerId) draggingPointer = null; }
        /// <summary>只處理 uGUI 派送至此預覽區域的滾輪事件。</summary>
        public void OnScroll(PointerEventData eventData)
        {
            if (CanOperate && eventData != null && orbit.Zoom(eventData.scrollDelta.y, false)) Apply();
        }
        /// <summary>按鈕或鍵盤呼叫的重設入口；文字焦點期間不觸發。</summary>
        public void ResetView() { if (CanOperate && orbit.Reset(false)) Apply(); }
        /// <summary>僅當預覽區域本身被選取時接受鍵盤，其他清單與按鈕保留自己的導覽。</summary>
        public void ApplyKeyboard(Vector2 degrees, float zoomSteps, bool reset)
        {
            if (!CanOperate || inputEvents.currentSelectedGameObject != gameObject) return;
            if (reset) orbit.Reset(false);
            else { orbit.Orbit(degrees.x, degrees.y, false); orbit.Zoom(zoomSteps, false); }
            Apply();
        }
        /// <summary>畫面重排後同步鏡頭投影；保留使用者旋轉及縮放。</summary>
        public void RefreshProjection()
        {
            if (orbit == null || view == null) return;
            orbit.Resize(view.fieldOfView, view.aspect);
            previousFov = view.fieldOfView; previousAspect = view.aspect; Apply();
        }
        private void Update()
        {
            if (!CanOperate) return;
            var keyboard = Keyboard.current;
            if (keyboard == null || inputEvents.currentSelectedGameObject != gameObject) return;
            float time = Mathf.Min(Time.unscaledDeltaTime, .1f);
            var degrees = new Vector2((keyboard.rightArrowKey.isPressed ? 1 : 0) - (keyboard.leftArrowKey.isPressed ? 1 : 0),
                (keyboard.upArrowKey.isPressed ? 1 : 0) - (keyboard.downArrowKey.isPressed ? 1 : 0)) * (90 * time);
            float zoom = ((keyboard.pageUpKey.isPressed ? 1 : 0) - (keyboard.pageDownKey.isPressed ? 1 : 0)) * (8 * time);
            if (degrees != Vector2.zero || zoom != 0 || keyboard.homeKey.wasPressedThisFrame)
                ApplyKeyboard(degrees, zoom, keyboard.homeKey.wasPressedThisFrame);
        }
        private void LateUpdate()
        {
            if (view != null && orbit != null && (view.fieldOfView != previousFov || view.aspect != previousAspect)) RefreshProjection();
        }
        private void Apply()
        {
            double yaw = orbit.Yaw * Math.PI / 180, pitch = orbit.Pitch * Math.PI / 180;
            var direction = new Vector3((float)(Math.Sin(yaw) * Math.Cos(pitch)), (float)Math.Sin(pitch), (float)(-Math.Cos(yaw) * Math.Cos(pitch)));
            view.transform.position = center + direction * (float)orbit.Distance;
            view.transform.LookAt(center, Vector3.up);
            view.nearClipPlane = (float)orbit.NearClip; view.farClipPlane = (float)orbit.FarClip;
        }
        private void OnDisable() { draggingPointer = null; }
        private void OnDestroy() { orbit = null; view = null; inputEvents = null; }
        private static bool Finite(float value) => !float.IsNaN(value) && !float.IsInfinity(value);
    }
}
