using System;
using System.Collections.Generic;
using System.Linq;

namespace BrickHigh.Domain
{
    /// <summary>固定快照中的版本化接點 profile 定義；實際內容由 runtime_profiles 提供。</summary>
    public sealed class ConnectorProfileDefinition
    {
        /// <summary>版本化 profile ID，例如 system-stud-v1。</summary>
        public string ProfileId { get; }
        /// <summary>明確宣告可配對的另一端 profile；不得由 family 名稱推定。</summary>
        public IReadOnlyList<string> CompatibleWith { get; }
        /// <summary>此接合允許的自由度描述；至少一項，讓驗收可核對而非隱含猜測。</summary>
        public IReadOnlyList<string> DegreesOfFreedom { get; }

        public ConnectorProfileDefinition(string profileId, IEnumerable<string> compatibleWith, IEnumerable<string> degreesOfFreedom)
        {
            ProfileId = profileId;
            CompatibleWith = (compatibleWith ?? Array.Empty<string>()).ToArray();
            DegreesOfFreedom = (degreesOfFreedom ?? Array.Empty<string>()).ToArray();
        }
    }

    /// <summary>canonical 公尺座標中的軸對齊簡化碰撞盒。</summary>
    public readonly struct CollisionBox
    {
        /// <summary>碰撞盒中心點。</summary>
        public Vector3d Center { get; }
        /// <summary>碰撞盒完整尺寸，三軸都必須為有限正值。</summary>
        public Vector3d Size { get; }

        public CollisionBox(Vector3d center, Vector3d size)
        {
            Center = center;
            Size = size;
        }
    }

    /// <summary>用來驗證接點插入路徑是否被簡化碰撞代理封死的圓柱近似探針。</summary>
    public readonly struct InsertionProbe
    {
        /// <summary>插入路徑起點。</summary>
        public Vector3d Start { get; }
        /// <summary>插入路徑終點。</summary>
        public Vector3d End { get; }
        /// <summary>探針半徑，用於保留實際插接所需的淨空。</summary>
        public double Radius { get; }

        public InsertionProbe(Vector3d start, Vector3d end, double radius)
        {
            Start = start;
            End = end;
            Radius = radius;
        }
    }

    /// <summary>接點插入路徑與簡化碰撞代理的 fail-closed 規則。</summary>
    public static class CollisionProxyPolicy
    {
        /// <summary>只有探針的整段路徑都不碰到任何碰撞盒時，才視為保留插接空腔。</summary>
        public static bool InsertionPathRemainsOpen(IReadOnlyList<CollisionBox> boxes, InsertionProbe probe)
        {
            if (boxes == null || !Valid(probe)) return false;
            foreach (var box in boxes)
            {
                if (!Valid(box) || SegmentIntersectsExpandedBox(probe, box)) return false;
            }
            return true;
        }

        private static bool Valid(CollisionBox box) => Finite(box.Center.X) && Finite(box.Center.Y) && Finite(box.Center.Z)
            && Positive(box.Size.X) && Positive(box.Size.Y) && Positive(box.Size.Z);

        private static bool Valid(InsertionProbe probe)
        {
            if (!Finite(probe.Start.X) || !Finite(probe.Start.Y) || !Finite(probe.Start.Z)
                || !Finite(probe.End.X) || !Finite(probe.End.Y) || !Finite(probe.End.Z)
                || !Positive(probe.Radius)) return false;
            var dx = probe.End.X - probe.Start.X;
            var dy = probe.End.Y - probe.Start.Y;
            var dz = probe.End.Z - probe.Start.Z;
            return dx * dx + dy * dy + dz * dz > 1e-18;
        }

        private static bool SegmentIntersectsExpandedBox(InsertionProbe probe, CollisionBox box)
        {
            var halfX = box.Size.X / 2 + probe.Radius;
            var halfY = box.Size.Y / 2 + probe.Radius;
            var halfZ = box.Size.Z / 2 + probe.Radius;
            var tMin = 0d;
            var tMax = 1d;
            return IntersectsAxis(probe.Start.X, probe.End.X - probe.Start.X, box.Center.X - halfX, box.Center.X + halfX, ref tMin, ref tMax)
                && IntersectsAxis(probe.Start.Y, probe.End.Y - probe.Start.Y, box.Center.Y - halfY, box.Center.Y + halfY, ref tMin, ref tMax)
                && IntersectsAxis(probe.Start.Z, probe.End.Z - probe.Start.Z, box.Center.Z - halfZ, box.Center.Z + halfZ, ref tMin, ref tMax);
        }

        private static bool IntersectsAxis(double origin, double delta, double min, double max, ref double tMin, ref double tMax)
        {
            if (Math.Abs(delta) <= 1e-15) return origin >= min && origin <= max;
            var first = (min - origin) / delta;
            var second = (max - origin) / delta;
            if (first > second) { var temporary = first; first = second; second = temporary; }
            if (first > tMin) tMin = first;
            if (second < tMax) tMax = second;
            return tMin <= tMax;
        }

        private static bool Finite(double value) => !double.IsNaN(value) && !double.IsInfinity(value);
        private static bool Positive(double value) => Finite(value) && value > 0;
    }

    /// <summary>版本化接點 profile 的最小相容規則；不以 family 名稱推定可插接。</summary>
    public static class ConnectorCompatibilityPolicy
    {
        /// <summary>只有雙方 profile 都存在、互相宣告且自由度可核對時才允許配對。</summary>
        public static bool CanPair(string firstProfile, string secondProfile,
            IReadOnlyDictionary<string, ConnectorProfileDefinition> profiles)
        {
            if (profiles == null || string.IsNullOrWhiteSpace(firstProfile) || string.IsNullOrWhiteSpace(secondProfile)
                || string.Equals(firstProfile, secondProfile, StringComparison.Ordinal)
                || !profiles.TryGetValue(firstProfile, out var first) || !profiles.TryGetValue(secondProfile, out var second))
                return false;
            return Valid(first) && Valid(second)
                && first.CompatibleWith.Contains(secondProfile, StringComparer.Ordinal)
                && second.CompatibleWith.Contains(firstProfile, StringComparer.Ordinal);
        }

        /// <summary>profile 必須有一致 ID、至少一個配對目標及明確自由度，不接受空白或重複值。</summary>
        public static bool Valid(ConnectorProfileDefinition profile)
        {
            if (profile == null || string.IsNullOrWhiteSpace(profile.ProfileId)
                || profile.CompatibleWith.Count == 0 || profile.DegreesOfFreedom.Count == 0)
                return false;
            return profile.CompatibleWith.All(x => !string.IsNullOrWhiteSpace(x))
                && profile.DegreesOfFreedom.All(x => !string.IsNullOrWhiteSpace(x))
                && profile.CompatibleWith.Distinct(StringComparer.Ordinal).Count() == profile.CompatibleWith.Count
                && profile.DegreesOfFreedom.Distinct(StringComparer.Ordinal).Count() == profile.DegreesOfFreedom.Count;
        }

        /// <summary>需要接合的零件必須至少有一個接點；無接點零件只有在明確不需要接合且附理由時才有效。</summary>
        public static bool HasRequiredConnectorEvidence(bool connectorsRequired, int connectorCount, string noConnectorsReason)
        {
            if (connectorCount < 0) return false;
            if (connectorsRequired) return connectorCount > 0;
            return connectorCount > 0 || !string.IsNullOrWhiteSpace(noConnectorsReason);
        }
    }
}
