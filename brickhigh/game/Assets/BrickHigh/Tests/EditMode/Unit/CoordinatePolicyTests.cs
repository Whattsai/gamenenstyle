using NUnit.Framework;
using BrickHigh.Domain;

namespace BrickHigh.Tests
{
    public class CoordinatePolicyTests
    {
        [Test, Property("TDD", "UT-019")]
        public void CoordinatePolicy_LDrawPoint_ConvertsMeters()
        {
            var point = CoordinatePolicy.FromLDraw(new Vector3d(20, -24, 10));
            Assert.That(point.X, Is.EqualTo(0.008).Within(1e-12));
            Assert.That(point.Y, Is.EqualTo(0.0096).Within(1e-12));
            Assert.That(point.Z, Is.EqualTo(-0.004).Within(1e-12));
            Assert.That(CoordinatePolicy.RootScale, Is.EqualTo(1));
        }

        [Test, Property("TDD", "UT-020")]
        public void CoordinatePolicy_CanonicalBasis_ConvertsRotation()
        {
            var point = CoordinatePolicy.ToUnity(CoordinatePolicy.FromLDraw(new Vector3d(20, -24, 10)));
            Assert.That(point.Z, Is.EqualTo(0.004).Within(1e-12));
            var rotation = new double[] { 0, 0, 1, 0, 1, 0, -1, 0, 0 };
            Assert.That(CoordinatePolicy.RotationToUnity(rotation), Is.EqualTo(new double[] { 0, 0, -1, 0, 1, 0, 1, 0, 0 }));
        }

        [Test, Property("TDD", "UT-021")]
        public void CoordinatePolicy_AlreadyConvertedMesh_AvoidsSecondMirror()
        {
            var imported = new Vector3d(0.008, 0.0096, 0.004);
            Assert.That(CoordinatePolicy.ImportedPoint(imported, true).Z, Is.EqualTo(imported.Z));
            Assert.That(CoordinatePolicy.TangentHandedness(1, false), Is.EqualTo(-1));
            Assert.That(CoordinatePolicy.TangentHandedness(-1, true), Is.EqualTo(-1));
            Assert.That(CoordinatePolicy.TriangleToUnity(new[] { 0, 1, 2 }, false), Is.EqualTo(new[] { 0, 2, 1 }));
            Assert.That(CoordinatePolicy.TriangleToUnity(new[] { 0, 2, 1 }, true), Is.EqualTo(new[] { 0, 2, 1 }));
        }
    }
}
