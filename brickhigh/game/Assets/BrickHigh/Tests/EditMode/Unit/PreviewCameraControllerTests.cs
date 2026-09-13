#if UNITY_EDITOR
using System;
using BrickHigh.UnityRuntime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using Property = NUnit.Framework.PropertyAttribute;

namespace BrickHigh.Tests
{
    public class PreviewCameraControllerTests
    {
        private GameObject root;
        private Camera camera;
        private PreviewCameraController controller;
        private EventSystem events;
        private Bounds bounds;
        private GameObject input;

        [SetUp] public void SetUp()
        {
            root = new GameObject("Camera fixture");
            camera = Child("Camera").AddComponent<Camera>();
            camera.fieldOfView = 40; camera.aspect = 1.5f;
            events = Child("Events").AddComponent<EventSystem>();
            controller = Child("Viewport", typeof(RectTransform)).AddComponent<PreviewCameraController>();
            input = Child("Search", typeof(RectTransform)); input.AddComponent<InputField>();
            bounds = new Bounds(new Vector3(.3f, .4f, .5f), new Vector3(.032f, .012f, .016f));
            controller.Bind(camera, bounds, events);
        }
        private GameObject Child(string name, params Type[] components)
        {
            var child = new GameObject(name, components); child.transform.SetParent(root.transform); return child;
        }
        [TearDown] public void TearDown() => UnityEngine.Object.DestroyImmediate(root);
        private PointerEventData Pointer(int id = 1) => new PointerEventData(events)
        { pointerId = id, button = PointerEventData.InputButton.Left, delta = new Vector2(60, 25), scrollDelta = new Vector2(0, 1) };

        [Test, Property("TDD", "UT-103")]
        public void PreviewCameraController_CameraInput_UpdatesView()
        {
            Vector3 original = camera.transform.position;
            var pointer = Pointer();
            controller.OnBeginDrag(pointer); controller.OnDrag(pointer); controller.OnEndDrag(pointer);
            Assert.That(Vector3.Distance(camera.transform.position, original), Is.GreaterThan(.001f));
            float distance = Vector3.Distance(camera.transform.position, bounds.center);
            controller.OnScroll(pointer);
            Assert.That(Vector3.Distance(camera.transform.position, bounds.center), Is.LessThan(distance));
            controller.ResetView();
            Assert.That(Vector3.Distance(camera.transform.position, original), Is.LessThan(1e-6f));
            AssertFits();
        }
        private void AssertFits()
        {
            foreach (float x in new[] { -1f, 1f }) foreach (float y in new[] { -1f, 1f }) foreach (float z in new[] { -1f, 1f })
            {
                var corner = bounds.center + Vector3.Scale(bounds.extents, new Vector3(x, y, z));
                Vector3 point = camera.WorldToViewportPoint(corner);
                Assert.That(point.x, Is.InRange(0f, 1f)); Assert.That(point.y, Is.InRange(0f, 1f));
                Assert.That(point.z, Is.InRange(camera.nearClipPlane, camera.farClipPlane));
            }
        }
        [Test, Property("TDD", "UT-104")]
        public void PreviewCameraController_TextFocus_BlocksCameraInput()
        {
            var pointer = Pointer();
            controller.OnBeginDrag(pointer);
            events.SetSelectedGameObject(input);
            Assert.That(events.currentSelectedGameObject, Is.SameAs(input));
            Vector3 original = camera.transform.position;
            controller.OnDrag(pointer);
            Assert.That(camera.transform.position, Is.EqualTo(original), "文字焦點期間不得拖曳。");
            controller.OnScroll(pointer);
            Assert.That(camera.transform.position, Is.EqualTo(original), "文字焦點期間不得縮放。");
            controller.ApplyKeyboard(new Vector2(30, 10), 2, true);
            Assert.That(camera.transform.position, Is.EqualTo(original), "文字焦點期間不得觸發快捷鍵。");
            controller.ResetView();
            Assert.That(camera.transform.position, Is.EqualTo(original));
            events.SetSelectedGameObject(controller.gameObject);
            controller.OnDrag(pointer);
            Assert.That(camera.transform.position, Is.EqualTo(original), "失焦後不復活先前拖曳。");
            controller.ApplyKeyboard(new Vector2(30, 10), 0, false);
            Assert.That(camera.transform.position, Is.Not.EqualTo(original));
            controller.ApplyKeyboard(Vector2.zero, 0, true);
            Assert.That(camera.transform.position, Is.EqualTo(original));
        }
        [Test, Property("TDD", "UT-103")]
        public void Drag_WithoutCaptureOrWithOtherPointer_DoesNotMoveCamera()
        {
            Vector3 original = camera.transform.position;
            controller.OnDrag(Pointer());
            controller.OnBeginDrag(Pointer()); controller.OnDrag(Pointer(2));
            Assert.That(camera.transform.position, Is.EqualTo(original));
            controller.OnEndDrag(Pointer()); controller.OnDrag(Pointer());
            events.SetSelectedGameObject(input);
            controller.ApplyKeyboard(new Vector2(30, 10), 2, false);
            Assert.That(camera.transform.position, Is.EqualTo(original));
            controller.Unbind(); controller.OnBeginDrag(Pointer()); controller.OnDrag(Pointer());
            Assert.That(camera.transform.position, Is.EqualTo(original));
        }
        [TestCase(.3f), TestCase(3f), Property("TDD", "UT-103")]
        public void Resize_ChangedAspect_RefitsWithoutChangingModelBounds(float aspect)
        {
            camera.aspect = aspect;
            controller.RefreshProjection(); controller.ResetView();
            AssertFits();
            Assert.That(bounds.size.x, Is.EqualTo(.032f));
        }
        [Test, Property("TDD", "UT-103")]
        public void Bind_InvalidBounds_LeavesPreviousViewUntouched()
        {
            Vector3 original = camera.transform.position;
            Assert.Throws<ArgumentOutOfRangeException>(() => controller.Bind(camera, new Bounds(Vector3.zero, Vector3.zero), events));
            Assert.That(camera.transform.position, Is.EqualTo(original));
        }
    }
}
#endif
