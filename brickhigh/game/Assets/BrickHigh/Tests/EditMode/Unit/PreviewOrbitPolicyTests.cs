using System;
using BrickHigh.Application;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class PreviewOrbitPolicyTests
    {
        [Test, Property("TDD", "UT-103")]
        public void PreviewCameraController_CameraInput_UpdatesView()
        {
            var view = new PreviewOrbitPolicy(.02, 40, 1.5);
            double initial = view.Distance;
            Assert.That(view.Orbit(20, 10, false), Is.True);
            Assert.That(view.Yaw, Is.EqualTo(55));
            Assert.That(view.Pitch, Is.EqualTo(35));
            Assert.That(view.Zoom(1, false), Is.True);
            Assert.That(view.Distance, Is.LessThan(initial));
            view.Reset(false);
            Assert.That(view.Yaw, Is.EqualTo(35));
            Assert.That(view.Pitch, Is.EqualTo(25));
            Assert.That(view.Distance, Is.EqualTo(initial));
        }

        [Test, Property("TDD", "UT-104")]
        public void PreviewCameraController_TextFocus_BlocksCameraInput()
        {
            var view = new PreviewOrbitPolicy(.02, 40, 1.5);
            view.Orbit(10, 5, false); view.Zoom(1, false);
            var before = new[] { view.Yaw, view.Pitch, view.Distance };
            Assert.That(view.Orbit(20, 20, true), Is.False);
            Assert.That(view.Zoom(3, true), Is.False);
            Assert.That(view.Reset(true), Is.False);
            Assert.That(new[] { view.Yaw, view.Pitch, view.Distance }, Is.EqualTo(before));
        }

        [Test, Property("TDD", "UT-103")]
        public void Orbit_ExtremeAndInvalidInput_StaysFiniteAndOutsideModel()
        {
            var view = new PreviewOrbitPolicy(.02, 40, 1.5);
            view.Orbit(double.MaxValue, double.MaxValue, false);
            Assert.That(view.Yaw, Is.InRange(-180, 180));
            Assert.That(view.Pitch, Is.EqualTo(85));
            view.Zoom(double.MaxValue, false);
            Assert.That(view.Distance, Is.GreaterThan(.02));
            Assert.That(view.NearClip, Is.GreaterThan(0));
            Assert.That(view.NearClip, Is.LessThan(view.Distance - .02));
            view.Zoom(-double.MaxValue, false);
            Assert.That(view.Distance, Is.LessThan(10));
            Assert.That(view.FarClip, Is.GreaterThan(view.Distance + .02));
            Assert.That(view.Orbit(double.NaN, 0, false), Is.False);
            Assert.That(view.Zoom(double.PositiveInfinity, false), Is.False);
        }

        [TestCase(.3), TestCase(1), TestCase(3), Property("TDD", "UT-103")]
        public void Reset_AnyViewportAspect_FitsBoundingSphere(double aspect)
        {
            var view = new PreviewOrbitPolicy(.02, 40, aspect);
            double halfAngle = Math.Min(20 * Math.PI / 180, Math.Atan(Math.Tan(20 * Math.PI / 180) * aspect));
            Assert.That(view.Distance * Math.Sin(halfAngle), Is.GreaterThan(.02));
            view.Orbit(30, 20, false); view.Zoom(2, false);
            view.Resize(40, aspect / 2);
            Assert.That(view.Yaw, Is.EqualTo(65));
            view.Reset(false);
            double narrow = Math.Atan(Math.Tan(20 * Math.PI / 180) * aspect / 2);
            Assert.That(view.Distance * Math.Sin(Math.Min(20 * Math.PI / 180, narrow)), Is.GreaterThan(.02));
        }

        [Test, Property("TDD", "UT-103")]
        public void Configure_InvalidGeometryOrProjection_RejectsWithoutMutation()
        {
            Assert.Throws<ArgumentOutOfRangeException>(() => new PreviewOrbitPolicy(0, 40, 1));
            Assert.Throws<ArgumentOutOfRangeException>(() => new PreviewOrbitPolicy(double.NaN, 40, 1));
            Assert.Throws<ArgumentOutOfRangeException>(() => new PreviewOrbitPolicy(.02, 180, 1));
            var view = new PreviewOrbitPolicy(.02, 40, 1);
            double distance = view.Distance;
            Assert.Throws<ArgumentOutOfRangeException>(() => view.Resize(40, 0));
            Assert.That(view.Distance, Is.EqualTo(distance));
        }
    }
}
