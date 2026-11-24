#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
燒中文字幕到直式（1080×1920）影片 —— 自動斷行＋自動字級，保證字幕不出血、置中、落在安全區。

為什麼要用這支腳本（而不是手寫指令）：
  手寫 drawtext 最常見的包就是「斷行沒有每行字數上限」→ 長句斷完還是太長 → 左右出血被切掉；
  以及 -map 寫太死把影像漏掉 → 輸出只有聲音。這支腳本把這些固定處理好，照著跑就不會錯。

用法（在影片資料夾裡）：
    python3 burn_subs.py [影片檔] [字幕SRT] [輸出檔]
    # 不帶參數時用預設： vertical.mp4  subs.srt  output-subtitled.mp4

前置：
    - 影片需為直式 1080×1920（先用 video-processing.md 第 1/2 步轉好）。
    - 字幕 SRT 建議先用 faster-whisper 聽打（第 5 步），**校對錯字後**再丟進來。
    - 依賴 imageio-ffmpeg： pip3 install imageio-ffmpeg
    - 字體：優先用課程隨附的 Noto Sans TC Bold（leon-design/assets/，跟著 Leon 一起裝），沒有再退到系統中文字型；真的都找不到會明確提示你裝字型，不會硬噴一堆紅字。Windows 學員請改用 CapCut／剪映上字幕（見 video-processing.md 開頭提醒）。
"""
import sys, re, math, subprocess, os, glob

try:
    import imageio_ffmpeg
    FF = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FF = "ffmpeg"  # 退而用系統 ffmpeg

VIDEO = sys.argv[1] if len(sys.argv) > 1 else "vertical.mp4"
SRT   = sys.argv[2] if len(sys.argv) > 2 else "subs.srt"
OUT   = sys.argv[3] if len(sys.argv) > 3 else "output-subtitled.mp4"

def find_font():
    """優先用課程隨附的 Noto Sans TC Bold；沒有再退到系統中文字型；全找不到才回 None，讓主程式好好提示（不要讓 ffmpeg 硬噴）。"""
    here = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        # ① 課程隨附字型（跟著 leon-design skill 一起裝，最穩、Mac/Windows 都在）
        os.path.join(here, "..", "assets", "NotoSansTC-Bold.ttf"),
        # ② 學員自己裝過的思源黑體
        os.path.expanduser("~/Library/Fonts/NotoSansTC-Bold.ttf"),
        os.path.expanduser("~/Library/Fonts/NotoSansTC-Bold.otf"),
        # ③ 系統內建中文字型（退路）
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/Supplemental/PingFang.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            return os.path.abspath(p)
    # 最後保險：掃常見字型資料夾，撿第一個 .ttc（macOS 幾乎一定有東西可用）
    for d in ("/System/Library/Fonts", "/System/Library/Fonts/Supplemental",
              "/Library/Fonts", os.path.expanduser("~/Library/Fonts")):
        hits = sorted(glob.glob(os.path.join(d, "*.ttc")))
        if hits:
            return hits[0]
    return None

FONT = find_font()   # 自動偵測；Windows 請改用 CapCut（見 video-processing.md）

# ===== 字幕規範（要微調就改這幾個數字）=====
MAXLINE  = 12          # 每行最多「視覺長度」(中文=1、英數=0.5) → 保證 ≤ 畫面 85% 寬、不出血
SPACING  = 18          # 行距 px
CENTER_Y = 1200        # 字幕區塊垂直中心：1080×1920 下約 62%，落在 55–70% 安全區
FS       = {1: 72, 2: 64, 3: 58}   # 行數 → 字級（皆在安全寬度內）；4 行以上用 54
BORDER   = 10          # 黑色描邊粗細（白字粗黑邊，亮暗背景都看得清）
BRK      = set("，、。！？；：」）")  # 優先在這些標點後斷行

def vlen(s):
    return sum(1 if ord(c) > 0x2000 else 0.5 for c in s)

def wrap_lines(t):
    """平衡斷行：先算需要幾行→盡量平均；英數詞不拆開；不留孤兒字；每行 ≤ MAXLINE。"""
    toks = re.findall(r'[A-Za-z0-9]+|[^A-Za-z0-9]', t)   # 英數詞=1個token，其餘逐字
    n = max(1, math.ceil(vlen(t) / MAXLINE))
    target = vlen(t) / n
    lines, cur, curlen = [], "", 0.0
    for tk in toks:
        sp = tk.strip() == ""
        if sp and not cur:
            continue                       # 不讓行首是空白
        if not sp and curlen + vlen(tk) > MAXLINE and cur.strip():
            lines.append(cur.rstrip()); cur, curlen = "", 0.0   # 硬上限保護
            if sp:
                continue
        cur += tk; curlen += vlen(tk)
        if len(lines) < n - 1 and cur.strip():
            if curlen >= target or (tk[-1:] in BRK and curlen >= target * 0.6):
                lines.append(cur.rstrip()); cur, curlen = "", 0.0
    if cur.strip():
        lines.append(cur.rstrip())
    return [ln.strip("， 、。") for ln in lines if ln.strip()]

def parse_srt(path):
    raw = open(path, encoding="utf-8-sig").read().strip()
    cues = []
    for b in re.split(r"\n\s*\n", raw):
        m = re.search(r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)", b)
        if not m:
            continue
        g = list(map(int, m.groups()))
        st = g[0]*3600 + g[1]*60 + g[2] + g[3]/1000.0
        en = g[4]*3600 + g[5]*60 + g[6] + g[7]/1000.0
        txt = " ".join(l.strip() for l in b.splitlines()
                       if "-->" not in l and not l.strip().isdigit() and l.strip())
        if txt:
            cues.append((st, en, txt))
    return cues

def main():
    if not FONT:
        print("⚠️ 找不到可用的中文字型——請先安裝一個中文字型（macOS 內建 PingFang，"
              "或自行安裝思源黑體 Noto Sans CJK），再重跑這支腳本。")
        print("   Windows 學員：請改用 CapCut／剪映上字幕（見 video-processing.md）。")
        sys.exit(1)
    cues = parse_srt(SRT)
    if not cues:
        print(f"⚠️ 讀不到字幕，檢查 {SRT} 路徑與格式（要 SRT）"); sys.exit(1)

    nodes = []
    for i, (st, en, txt) in enumerate(cues, 1):
        ls = wrap_lines(txt)
        n = len(ls); fs = FS.get(n, 54)
        block = n * fs + (n - 1) * SPACING
        y0 = int(CENTER_Y - block / 2)
        for j, ln in enumerate(ls):
            fn = f".sub_{i:03d}_{j}.txt"
            open(fn, "w", encoding="utf-8").write(ln)
            y = y0 + j * (fs + SPACING)
            nodes.append(
                f"drawtext=textfile={fn}:fontfile={FONT}:fontsize={fs}:"
                f"fontcolor=white:borderw={BORDER}:bordercolor=black:"
                f"x=(w-text_w)/2:y={y}:enable='between(t,{st:.3f},{en:.3f})'"
            )

    cmd = [FF, "-y", "-i", VIDEO, "-vf", ",".join(nodes),
           "-map", "0:v", "-map", "0:a?",          # 影像必帶、音訊有就帶（漏影像/無音訊都不會出包）
           "-c:v", "libx264", "-preset", "fast", "-crf", "20",
           "-c:a", "copy", OUT]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode == 0:
        print(f"✅ 完成：{OUT}（{len(cues)} 句字幕，自動斷行＋縮字級，置中、不出血、含影像＋音訊）")
        print("→ 記得抽一格驗證：挑一句最長的字幕時間點，看有沒有出血、錯字（見 video-processing.md 驗證步驟）")
    else:
        print(r.stderr[-1200:]); print("RC=", r.returncode); sys.exit(1)

if __name__ == "__main__":
    main()
