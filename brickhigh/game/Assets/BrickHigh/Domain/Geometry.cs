using System;

namespace BrickHigh.Domain
{
    /// <summary>與 UnityEngine 無關的公尺座標。</summary>
    public readonly struct Vector3d
    {
        /// <summary>三個局部座標分量。</summary>
        public readonly double X, Y, Z;
        /// <summary>建立不含隱含單位轉換的向量。</summary>
        public Vector3d(double x, double y, double z) { X = x; Y = y; Z = z; }
    }

    /// <summary>LDraw 與 canonical／Unity 的唯一基底轉換。</summary>
    public static class CoordinatePolicy
    {
        /// <summary>來源 GLB 根節點維持單位比例。</summary>
        public const double RootScale = 1;
        /// <summary>將 LDU 轉為右手座標公尺。</summary>
        public static Vector3d FromLDraw(Vector3d p) => new Vector3d(p.X * .0004, -p.Y * .0004, -p.Z * .0004);
        /// <summary>使用 M=diag(1,1,-1) 轉為 Unity 基底。</summary>
        public static Vector3d ToUnity(Vector3d p) => new Vector3d(p.X, p.Y, -p.Z);
        /// <summary>已由匯入器轉換的網格不再鏡像。</summary>
        public static Vector3d ImportedPoint(Vector3d p, bool alreadyConverted) => alreadyConverted ? p : ToUnity(p);
        /// <summary>旋轉使用 M R M^-1，而非直接複製 quaternion。</summary>
        public static double[] RotationToUnity(double[] rowMajor)
        {
            if (rowMajor == null || rowMajor.Length != 9) throw new ArgumentException("旋轉矩陣必須為 3×3。");
            var output = new double[9];
            var sign = new[] { 1, 1, -1 };
            for (int row = 0; row < 3; row++)
                for (int col = 0; col < 3; col++) output[row * 3 + col] = rowMajor[row * 3 + col] * sign[row] * sign[col];
            return output;
        }
        /// <summary>反射基底時只反轉一次切線手性。</summary>
        public static double TangentHandedness(double value, bool alreadyConverted) => alreadyConverted ? value : -value;
        /// <summary>反射基底時只反轉一次面繞序。</summary>
        public static int[] TriangleToUnity(int[] indices, bool alreadyConverted)
        {
            if (indices == null || indices.Length % 3 != 0) throw new ArgumentException("三角形索引數量無效。");
            var result = (int[])indices.Clone();
            if (!alreadyConverted)
                for (int i = 0; i < result.Length; i += 3)
                { int original = result[i + 1]; result[i + 1] = result[i + 2]; result[i + 2] = original; }
            return result;
        }
    }

    /// <summary>逐件尺寸、接點與來源資產預算。</summary>
    public static class MetadataValidationPolicy
    {
        /// <summary>正值且不是 NaN 或 Infinity。</summary>
        public static bool PositiveFinite(double value) => value > 0 && !double.IsNaN(value) && !double.IsInfinity(value);
        /// <summary>尺寸容差 max(0.1mm,0.5%)，只容忍浮點運算的捨入誤差。</summary>
        public static bool DimensionMatches(double reference, double actual) => PositiveFinite(reference) && PositiveFinite(actual)
            && Math.Abs(reference - actual) <= Math.Max(.0001, .005 * reference) + 1e-12;
        /// <summary>接點位置誤差不得超過 0.05mm。</summary>
        public static bool ConnectorMatches(double errorMeters) => !double.IsNaN(errorMeters) && errorMeters >= 0 && errorMeters <= .00005;
        /// <summary>法向與切線需為有限的單位向量。</summary>
        public static bool Normalized(Vector3d p) => Math.Abs(p.X * p.X + p.Y * p.Y + p.Z * p.Z - 1) <= 1e-6;
        /// <summary>來源壓縮預算不等同於執行時記憶體。</summary>
        public static bool WithinBudget(long glbBytes, int textureWidth, int textureHeight, long previewBytes) =>
            glbBytes > 0 && glbBytes <= 20L * 1024 * 1024 && textureWidth > 0 && textureWidth <= 2048
            && textureHeight > 0 && textureHeight <= 2048 && previewBytes > 0 && previewBytes <= 256L * 1024;
    }
}
