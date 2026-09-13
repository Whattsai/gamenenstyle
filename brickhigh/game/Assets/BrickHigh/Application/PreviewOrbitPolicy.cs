using System;

namespace BrickHigh.Application
{
    /// <summary>以模型外接球取景的鏡頭狀態；不改模型座標、尺寸或材質。</summary>
    public sealed class PreviewOrbitPolicy
    {
        private readonly double radius;
        private double fittedDistance, zoom = 1;
        /// <summary>水平環繞角度，範圍 [-180,180)。</summary>
        public double Yaw { get; private set; } = 35;
        /// <summary>仰角限制在 ±85 度，避免極點翻轉。</summary>
        public double Pitch { get; private set; } = 25;
        /// <summary>鏡頭距離始終在模型外，縮放不影響模型比例。</summary>
        public double Distance => Math.Max(radius * 1.1, fittedDistance * zoom);
        /// <summary>近裁切面不切入外接球。</summary>
        public double NearClip => (Distance - radius) * .25;
        /// <summary>遠裁切面涵蓋整個外接球。</summary>
        public double FarClip => Distance + radius * 2;
        /// <summary>建立公尺尺度取景；有限界限避免轉成 Unity float 時溢位。</summary>
        public PreviewOrbitPolicy(double radius, double verticalFov, double aspect)
        {
            if (!Finite(radius) || radius < 1e-6 || radius > 1e6) throw new ArgumentOutOfRangeException(nameof(radius));
            this.radius = radius;
            Resize(verticalFov, aspect);
        }
        /// <summary>視窗比例改變時重新計算取景，但保留旋轉與使用者縮放倍率。</summary>
        public void Resize(double verticalFov, double aspect)
        {
            if (!Finite(verticalFov) || verticalFov < 1 || verticalFov > 170) throw new ArgumentOutOfRangeException(nameof(verticalFov));
            if (!Finite(aspect) || aspect < .01 || aspect > 100) throw new ArgumentOutOfRangeException(nameof(aspect));
            double half = verticalFov * Math.PI / 360;
            double limitingAngle = Math.Min(half, Math.Atan(Math.Tan(half) * aspect));
            fittedDistance = radius * 1.1 / Math.Sin(limitingAngle);
        }
        /// <summary>套用角度增量；文字輸入焦點或非有限輸入均不改動鏡頭。</summary>
        public bool Orbit(double yawDelta, double pitchDelta, bool textFocused)
        {
            if (textFocused || !Finite(yawDelta) || !Finite(pitchDelta)) return false;
            Yaw = ((Yaw + yawDelta % 360 + 540) % 360) - 180;
            Pitch = Math.Max(-85, Math.Min(85, Pitch + pitchDelta));
            return true;
        }
        /// <summary>正值靠近；每次輸入及總倍率皆有界，不允許穿過模型。</summary>
        public bool Zoom(double steps, bool textFocused)
        {
            if (textFocused || !Finite(steps)) return false;
            zoom = Math.Max(.1, Math.Min(8, zoom * Math.Exp(-Math.Max(-100, Math.Min(100, steps)) * .12)));
            return true;
        }
        /// <summary>重設為固定斜上方視角與完整取景，不變動來源模型。</summary>
        public bool Reset(bool textFocused)
        {
            if (textFocused) return false;
            Yaw = 35; Pitch = 25; zoom = 1; return true;
        }
        private static bool Finite(double value) => !double.IsNaN(value) && !double.IsInfinity(value);
    }
}
