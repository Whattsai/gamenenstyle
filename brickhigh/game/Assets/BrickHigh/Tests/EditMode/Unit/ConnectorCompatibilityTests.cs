using System.Collections.Generic;
using BrickHigh.Domain;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class ConnectorCompatibilityTests
    {
        [TestCase("system-stud-v1", "system-tube-v1")]
        [TestCase("duplo-stud-v1", "duplo-tube-v1")]
        [TestCase("technic-pin-v1", "technic-hole-v1")]
        [TestCase("technic-axle-v1", "technic-axle-hole-v1")]
        [TestCase("clip-v1", "bar-v1")]
        [TestCase("ball-v1", "socket-v1")]
        [Property("TDD", "UT-022")]
        public void ConnectorCompatibility_MatchingProfiles_AllowsPair(string first, string second)
        {
            var profiles = Pair(first, second);
            Assert.That(ConnectorCompatibilityPolicy.CanPair(first, second, profiles), Is.True);
            Assert.That(ConnectorCompatibilityPolicy.CanPair(second, first, profiles), Is.True);
        }

        [Test, Property("TDD", "UT-022")]
        public void ConnectorCompatibility_RequiresMutualDeclarationAndReviewableFreedom()
        {
            var profiles = Pair("system-stud-v1", "system-tube-v1");
            profiles["system-tube-v1"] = new ConnectorProfileDefinition("system-tube-v1", new string[0], new[] { "fixed" });
            Assert.That(ConnectorCompatibilityPolicy.CanPair("system-stud-v1", "system-tube-v1", profiles), Is.False);

            profiles = Pair("system-stud-v1", "system-tube-v1");
            profiles["system-tube-v1"] = new ConnectorProfileDefinition("system-tube-v1", new[] { "system-stud-v1" }, new string[0]);
            Assert.That(ConnectorCompatibilityPolicy.CanPair("system-stud-v1", "system-tube-v1", profiles), Is.False);
        }

        [Test, Property("TDD", "UT-022")]
        public void ConnectorCompatibility_SameFamilyName_DoesNotInferCompatibility()
        {
            var profiles = Pair("system-stud-v1", "system-tube-v1");
            Assert.That(ConnectorCompatibilityPolicy.CanPair("system-stud-v1", "system-stud-v1", profiles), Is.False);
            Assert.That(ConnectorCompatibilityPolicy.CanPair("system-stud-v1", "technic-hole-v1", profiles), Is.False);
            Assert.That(ConnectorCompatibilityPolicy.CanPair("unknown-v1", "unknown-v1", profiles), Is.False);
        }

        [Test, Property("TDD", "UT-023")]
        public void ConnectorCompatibility_InsertionCavity_RemainsOpen()
        {
            var insertion = new InsertionProbe(
                new Vector3d(0, .012, 0), new Vector3d(0, .001, 0), .002);
            var sealedProxy = new[]
            {
                new CollisionBox(new Vector3d(0, .0065, 0), new Vector3d(.016, .011, .016))
            };
            Assert.That(CollisionProxyPolicy.InsertionPathRemainsOpen(sealedProxy, insertion), Is.False,
                "整體包圍盒會封死接點的插入路徑。 ");

            var cavityProxy = new[]
            {
                new CollisionBox(new Vector3d(-.006, .0065, 0), new Vector3d(.004, .011, .016)),
                new CollisionBox(new Vector3d(.006, .0065, 0), new Vector3d(.004, .011, .016))
            };
            Assert.That(CollisionProxyPolicy.InsertionPathRemainsOpen(cavityProxy, insertion), Is.True,
                "簡化碰撞代理保留中央空腔時，插入 fixture 應可成立。 ");
        }

        [Test, Property("TDD", "UT-023")]
        public void ConnectorCompatibility_ShallowCavity_DoesNotInflateAlongInsertionAxis()
        {
            var insertion = new InsertionProbe(
                new Vector3d(0, 0, 0), new Vector3d(0, .001, 0), .002);
            var shallowCeiling = new[]
            {
                new CollisionBox(new Vector3d(0, .003, 0), new Vector3d(.016, .001, .016))
            };
            Assert.That(CollisionProxyPolicy.InsertionPathRemainsOpen(shallowCeiling, insertion), Is.True,
                "平端圓柱探針不可沿插入軸額外膨脹，否則淺 plate 空腔會被誤判封死。 ");

            var radialWall = new[]
            {
                new CollisionBox(new Vector3d(.0025, .0005, 0), new Vector3d(.001, .001, .016))
            };
            Assert.That(CollisionProxyPolicy.InsertionPathRemainsOpen(radialWall, insertion), Is.False,
                "半徑仍必須擴張徑向兩軸，不能為了淺空腔而放寬側壁碰撞。 ");
        }

        [Test, Property("TDD", "UT-024")]
        public void ConnectorCompatibility_RequiredConnector_RejectsMissing()
        {
            Assert.That(ConnectorCompatibilityPolicy.HasRequiredConnectorEvidence(true, 0, null), Is.False);
            Assert.That(ConnectorCompatibilityPolicy.HasRequiredConnectorEvidence(true, 1, null), Is.True);
            Assert.That(ConnectorCompatibilityPolicy.HasRequiredConnectorEvidence(false, 0, "此裝飾件沒有接合用途"), Is.True);
            Assert.That(ConnectorCompatibilityPolicy.HasRequiredConnectorEvidence(false, 0, " "), Is.False);
        }

        private static Dictionary<string, ConnectorProfileDefinition> Pair(string first, string second) =>
            new Dictionary<string, ConnectorProfileDefinition>
            {
                [first] = new ConnectorProfileDefinition(first, new[] { second }, new[] { "explicit-fixture-freedom" }),
                [second] = new ConnectorProfileDefinition(second, new[] { first }, new[] { "explicit-fixture-freedom" })
            };
    }
}
