using NUnit.Framework;
using BrickHigh.Domain;

namespace BrickHigh.Tests
{
    public class MetadataValidationPolicyTests
    {
        [Test, Property("TDD", "UT-085")]
        public void MetadataValidationPolicy_ToleranceBoundary_UsesInclusiveLimit()
        {
            Assert.That(MetadataValidationPolicy.DimensionMatches(0.008, 0.0081), Is.True);
            Assert.That(MetadataValidationPolicy.DimensionMatches(0.008, 0.0081001), Is.False);
            Assert.That(MetadataValidationPolicy.DimensionMatches(1, 1.005), Is.True);
            Assert.That(MetadataValidationPolicy.ConnectorMatches(0.00005), Is.True);
            Assert.That(MetadataValidationPolicy.ConnectorMatches(0.00005001), Is.False);
        }

        [Test, Property("TDD", "UT-086")]
        public void MetadataValidationPolicy_NonFiniteMetadata_RejectsInput()
        {
            foreach (var value in new[] { double.NaN, double.PositiveInfinity, -1, 0 })
            {
                Assert.That(MetadataValidationPolicy.PositiveFinite(value), Is.False);
                Assert.That(MetadataValidationPolicy.DimensionMatches(value, 1), Is.False);
            }
            Assert.That(MetadataValidationPolicy.Normalized(new Vector3d(1, 0, 0)), Is.True);
            Assert.That(MetadataValidationPolicy.Normalized(new Vector3d(2, 0, 0)), Is.False);
        }

        [Test, Property("TDD", "UT-087")]
        public void MetadataValidationPolicy_AssetBudget_EnforcesEachLimit()
        {
            Assert.That(MetadataValidationPolicy.WithinBudget(20L * 1024 * 1024, 2048, 2048, 256 * 1024), Is.True);
            Assert.That(MetadataValidationPolicy.WithinBudget(20L * 1024 * 1024 + 1, 2048, 2048, 256 * 1024), Is.False);
            Assert.That(MetadataValidationPolicy.WithinBudget(1, 2049, 1, 1), Is.False);
            Assert.That(MetadataValidationPolicy.WithinBudget(1, 1, 1, 256 * 1024 + 1), Is.False);
        }
    }
}
