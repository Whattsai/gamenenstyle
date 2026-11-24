# 影片素材處理工作流（Leon）

> 創意剪輯交給 CapCut / 學員。這份只處理**重複性技術工作 + 上架**。
> 所有指令**在 macOS 實測可用（Apple Silicon / Intel 皆可）**。
> ⚠️ **Windows 學員注意：** 下面用到的字體路徑（`/System/Library/Fonts/...`）和部分指令是 Mac 專屬，Windows 上不能照貼。Windows 要上字幕，請改用 CapCut／剪映的自動字幕功能（跨平台、有介面、不用打指令）。

---

## 前置：取得 ffmpeg

第一次使用，自動裝靜態 ffmpeg（不需要 Homebrew）：

```bash
pip3 install imageio-ffmpeg -q
FF=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
echo "ffmpeg 路徑：$FF"
```

之後指令都用 `"$FF"` 代替 ffmpeg。

---

## 常用處理

### 1. 橫式轉直式 9:16（Reels / 限時 / 短影音）

```bash
# 裁切填滿（會切掉左右）
"$FF" -y -i input.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" \
  -c:a copy output-9x16.mp4
```

```bash
# 背景模糊填滿（不切畫面，上下補模糊）
"$FF" -y -i input.mp4 -vf \
  "split[a][b];[a]scale=1080:1920,boxblur=20[bg];[b]scale=1080:-1[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" \
  -c:a copy output-9x16-blur.mp4
```

### 2. 轉方形 1:1（FB / IG 動態）

```bash
"$FF" -y -i input.mp4 \
  -vf "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080" \
  -c:a copy output-1x1.mp4
```

### 📐 字幕規範（強制遵守，每次上字幕都照這個）

> 以 **1080×1920 直式（9:16）** 輸出為準。所有數值依此基準。

**① 位置——放在垂直 55–70%，不要貼底部**

| 區域 | 狀況 | 處理 |
|------|------|------|
| 頂部 10% | 帳號名稱 / 追蹤鈕會壓到 | 不放字幕 |
| 底部 15–20% | 平台 UI 危險區（說明文字、音樂、進度條） | 不放字幕 |
| 右側邊緣 | 按讚/留言/分享按鈕擋到 | 字幕寬度 ≤ 畫面 85% |
| **垂直 55–70%（安全區）** | ✅ 字幕放這裡 | y ≈ 1056–1344 px |

→ ffmpeg 主字幕建議 `y=1150` 左右（約 60% 處）。

**② 大小**
- 主字幕：**單行 72px、兩行 64px、三行 58px**（行數越多字級略縮，確保不超寬）
- 一行最多 **12 個中文字寬**（中英混排照「視覺寬度」算：中文=1、英數=0.5）→ 這樣才穩在畫面 85% 安全寬內、不出血。超過就**自動斷行、平衡分配**
- ⚠️ **不要手算斷行**——多句字幕一律用下面第 4 步的 `burn_subs.py`，它會把字數上限、斷行、字級全部把關好。手寫最常見的包就是「某句太長、左右出血被切掉」
- Hook 開場句可放大到 **100px+**、置中，當標題用
- 驗收：手機放桌上、一個手臂遠，看得清楚才過關

**③ 字體（繁中可商用）**
- 首選 **思源黑體 Noto Sans TC Bold/Black**（免費商用、小螢幕最清晰、廣告首選）
- 替代 **台北黑體**（免費商用、更現代）
- UGC 手寫感 → jf open 粒粒體 / 芫荽（只用短句）
- ❌ 避免：細體、明體/宋體、來路不明字體（商用授權風險）
- 📦 **課程已隨附這套字型**：`leon-design/assets/NotoSansTC-Bold.ttf`（Noto Sans TC Bold，OFL 可商用）。`burn_subs.py` 會自動用它，你不用另外找；想在 CapCut／剪映也用同一套，雙擊該檔按「安裝字型」即可。

**④ 樣式**
- **白字 + 黑色描邊（粗 8–12px）** 或半透明黑底色塊——任何背景都讀得清楚，不要只用陰影
- 重點詞換色（黃色或品牌色），一句最多強調 1–2 個詞
- **逐句出現**（跟著語速），不要整段一次貼上
- Whisper / CapCut 自動字幕，**生成後一定逐句校對**——中文辨識錯字率不低，廣告素材出錯字很傷專業感

---

### 3. 燒中文字幕（手動單句，符合規範）

以下命令可在影片資料夾執行；先設定 `NORA_PROJECT_ROOT` 為已安裝技能的專案絕對路徑，後續共用這個變數。

```bash
NORA_PROJECT_ROOT="/你的專案絕對路徑"
# 用課程隨附字型（最穩、一定在）；沒有再 fallback
FONT="$NORA_PROJECT_ROOT/.agents/skills/leon-design/assets/NotoSansTC-Bold.ttf"
[ -f "$FONT" ] || FONT="$HOME/Library/Fonts/NotoSansTC-Bold.otf"
[ -f "$FONT" ] || FONT="/System/Library/Fonts/PingFang.ttc"

"$FF" -y -i input.mp4 -vf \
  "drawtext=text='一支手機也能拍出質感':fontfile=$FONT:fontsize=80:fontcolor=white:borderw=10:bordercolor=black:x=(w-text_w)/2:y=1150" \
  -c:a copy output-subtitled.mp4
```

> 規範對照：fontsize=80（70–90 範圍）、borderw=10（8–12 描邊）、y=1150（垂直 60%，安全區）、置中。

### 4. 燒整支字幕（⭐ 推薦：用 burn_subs.py，自動斷行＋自動字級，保證不出血）

> **多句字幕不要手寫斷行**——最容易出包的就是「某句太長、左右出血被切掉」，或 `-map` 寫太死把影像漏掉變成只有聲音。
> 課程附了一支**已實測**的腳本 `scripts/burn_subs.py`，把斷行、字級、置中、安全區位置、影像/音訊軌全部固定處理好。你只要做三件事：①影片轉直式（第 1/2 步）→ ②聽打成 SRT 並**校對錯字**（第 5 步）→ ③跑這支腳本。

```bash
# 在影片資料夾裡執行（資料夾要有：直式影片 + 校對好的 SRT）
pip3 install imageio-ffmpeg   # 只有第一次要裝
python3 "$NORA_PROJECT_ROOT/.agents/skills/leon-design/scripts/burn_subs.py" vertical.mp4 subs.srt output-final.mp4
```

腳本自動幫你把關（你不用手算）：
- **每行 ≤ 12 個中文字寬** → 永遠在畫面 85% 安全寬內，**不出血**（中英混排照視覺寬度算）
- **平衡斷行**：一句拆成幾行盡量等長、英文字（GitHub／Claude…）不拆開、不留孤兒單字
- **字級隨行數自動縮**：單行 72／兩行 64／三行 58 px
- **每行各自置中**、落在垂直 55–70% 安全區（避開上方追蹤鈕、下方進度條）
- **白字粗黑邊**（borderw=10，亮暗背景都清楚）、**逐句出現**
- **影像＋音訊都帶**（內建 `-map 0:v -map 0:a?`，不會發生「只有聲音沒畫面」）

> 🔧 想微調字級／位置／每行字數：改腳本最上面的 `MAXLINE / FS / CENTER_Y` 幾個數字即可。
> 🪟 Windows 學員：這支用 macOS 字體路徑，請改用 CapCut／剪映上字幕（見本文件開頭提醒）。
> ⚠️ macOS 上 `subtitles=`（libass）常認不得字體名、靜默不出字幕——所以本腳本一律用 `drawtext` + 直接指定字體檔，避開這個雷。

---

#### （原理／備援）手動逐句 drawtext

> 想理解底層、或只有一兩句短字幕想快速燒，可以手動。**但多句、長句一律用上面的腳本，別自己手寫斷行。**

```bash
FONT="$NORA_PROJECT_ROOT/.agents/skills/leon-design/assets/NotoSansTC-Bold.ttf"   # 課程隨附字型，保證存在

"$FF" -y -i vertical.mp4 -vf "\
drawtext=text='第一句字幕':fontfile=$FONT:fontsize=64:fontcolor=white:borderw=10:bordercolor=black:x=(w-text_w)/2:y=1180:enable='between(t,0.8,1.7)',\
drawtext=text='第二句字幕':fontfile=$FONT:fontsize=64:fontcolor=white:borderw=10:bordercolor=black:x=(w-text_w)/2:y=1180:enable='between(t,1.7,3.5)'" \
  -map 0:v -map 0:a? -c:a copy output-final.mp4
```

> 規範對照：borderw=10、y=1180（垂直約 60%、安全區）、置中、`enable=between(t,起,迄)` 逐句出現。
> ⚠️ **手動時兩個必守**：①一行 ≤ 12 個中文字寬，超過自己斷成兩行、長句字級降到 58–64；②若你加了 `-map`，**一定要含 `0:v`**，否則影像會被丟掉、輸出只剩聲音。

**燒完一定抽幾格畫面驗證位置與錯字：**
```bash
"$FF" -y -ss 7.0 -i output-final.mp4 -frames:v 1 check.png   # 抽第7秒看字幕
```

### 5. 自動聽打字幕（faster-whisper ⭐ 實測推薦）

> 比 openai-whisper 輕（不用裝 torch），中文辨識準確度好。實測 8 秒影片 3 句全對。

```bash
pip3 install faster-whisper -q
```

```python
from faster_whisper import WhisperModel
import datetime, subprocess

# 先用 ffmpeg 抽音訊（16kHz 單聲道，whisper 最佳輸入）
FF="<ffmpeg 路徑>"
subprocess.run([FF,"-y","-i","input.mp4","-vn","-ar","16000","-ac","1","audio.wav"])

def ts(s):
    td=datetime.timedelta(seconds=s); h,r=divmod(td.seconds,3600); m,sec=divmod(r,60)
    return f"{h:02d}:{m:02d}:{sec:02d},{int(td.microseconds/1000):03d}"

model=WhisperModel("small", device="cpu", compute_type="int8")  # 第一次下載約460MB
segments,_=model.transcribe("audio.wav", language="zh", beam_size=5)

srt=[]
for i,seg in enumerate(segments,1):
    print(f"[{seg.start:.1f}s → {seg.end:.1f}s] {seg.text.strip()}")  # 給人校對
    srt.append(f"{i}\n{ts(seg.start)} --> {ts(seg.end)}\n{seg.text.strip()}\n")
open("subs.srt","w").write("\n".join(srt))
```

> 拿到每句的「起迄時間 + 文字」後，**先讓人校對錯字**，再用第 4 步的 drawtext 逐句燒進影片
> （`enable='between(t,起,迄)'` 直接套用上面的時間）。

### 6. 剪頭尾 / 指定區間

```bash
# 從第 3 秒剪到第 18 秒
"$FF" -y -i input.mp4 -ss 00:00:03 -to 00:00:18 -c copy clip.mp4
```

### 7. 長片自動切多支（每 30 秒一段）

```bash
"$FF" -y -i input.mp4 -c copy -f segment -segment_time 30 \
  -reset_timestamps 1 clip_%03d.mp4
```

### 8. 加背景音樂

```bash
"$FF" -y -i video.mp4 -i music.mp3 -filter_complex \
  "[1:a]volume=0.3[bg];[0:a][bg]amix=inputs=2:duration=first" \
  -c:v copy output-bgm.mp4
```

### 9. 批次處理（資料夾內所有片轉直式）

```bash
for f in *.mp4; do
  "$FF" -y -i "$f" \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" \
    -c:a copy "reels_$f"
done
```

---

## 上傳 Cloudinary（拿公開 URL）

> 🔒 **憑證從設定檔讀，不要寫死在腳本裡。** 先讀 `.agents/skills/hello-nora/platform-settings.md`；下面的程式**不含**任何金鑰——它從選定品牌 `cloudinary-config.md` 讀 Cloud Name / API Key / API Secret，僅新檔不存在時才讀同品牌舊 `meta-config.md` 的 Cloudinary 區塊。建立憑證前先執行 `--check-secrets`，錯誤不回顯金鑰。

```python
import hashlib, time, subprocess, json, os, re
from pathlib import Path
# 從設定檔即時讀 Cloudinary 憑證（金鑰不寫進這支腳本）
name = os.environ["NORA_BRAND"]  # Nora brief 選定的 _brand* 目錄名稱
if not re.fullmatch(r"_brand[^/\\:]*", name): raise SystemExit("請指定單一品牌目錄")
brand = Path(os.environ["NORA_PROJECT_ROOT"]).absolute() / ".agents/skills" / name
if brand.resolve() != brand: raise SystemExit("品牌路徑不可經過連結")
cfg = brand / "cloudinary-config.md"
legacy = not cfg.exists()
if legacy: cfg = brand / "meta-config.md"
if cfg.resolve().parent != brand: raise SystemExit("設定路徑不可超出品牌")
text = cfg.read_text(encoding="utf-8")
if legacy:
    section = re.search(r"(?mis)^## Cloudinary[^\n]*\n(.*?)(?=^## |\Z)", text)
    text = section[1] if section else ""
def grab(label):
    # 抓「label：值」或「label**：值」，容忍中英冒號與 markdown 符號
    m = re.search(label + r"[^：:]*[：:]\s*`?([^\s`*\[\]]+)", text)
    if not m: raise SystemExit(f"在 {cfg.name} 找不到 {label}，請先補齊本品牌 Cloudinary 設定")
    return m.group(1)
CLOUD, KEY, SECRET = grab("Cloud Name"), grab("API Key"), grab("API Secret")

ts=int(time.time())
sig=hashlib.sha1(f"timestamp={ts}{SECRET}".encode()).hexdigest()
r=subprocess.run(["curl","-s","-X","POST",
  f"https://api.cloudinary.com/v1_1/{CLOUD}/video/upload",  # 影片用 video/upload
  "-F","file=@output-9x16.mp4",
  "-F",f"api_key={KEY}","-F",f"timestamp={ts}","-F",f"signature={sig}"],
  capture_output=True,text=True)
try:
    url = json.loads(r.stdout).get("secure_url")
except ValueError:
    url = None
if r.returncode or not url: raise SystemExit("Cloudinary 上傳失敗；請檢查本品牌設定，不回顯原始回應")
print(url)
```

---

## 交給 Maya 發布到 FB 粉專

拿到 Cloudinary 影片 URL 後，交給 Maya 用 Meta Graph API 發布：

```
POST /{粉專ID}/videos
  file_url = <Cloudinary 影片 URL>
  description = <文案>
  # 排程：published=false + scheduled_publish_time=<unix 時間>
  access_token = <Page Token>
```

> ⚠️ FB 影片上傳偶爾回 `is_transient` 暫時性錯誤，重試即可。
> ⚠️ 這裡指 **IG Reels（影片）**：用同一個 `instagram_content_publish` 權限，但透過 API 發 Reels 限制較多、有時要走額外審核，**先以 FB 粉專為主**。（IG「圖片貼文」發自己帳號照 Unit 7 設定即可，不用送審。）

---

## ✅ 完整範例：學員影片 → 上字幕直式成品（實測流程）

這是實測跑通的完整管線，照順序做：

```
① 取得 ffmpeg
   pip3 install imageio-ffmpeg -q
   FF=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")

② 看影片規格（確認尺寸、長度、有無聲音）
   "$FF" -i input.mov 2>&1 | grep -E "Duration|Stream"

③ 聽打字幕（faster-whisper，見第 5 步）→ 拿到 subs.srt + 逐句時間，先校對錯字
   （⚠️ 第一次跑會自動裝套件＋下載辨識模型約 460MB，畫面可能卡幾分鐘沒動靜，是正常的、別中斷）

④ 橫式 → 直式 9:16（背景模糊，不裁人）
   "$FF" -y -i input.mov -filter_complex \
     "[0:v]split[a][b];[a]scale=1080:1920,boxblur=22[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p[v]" \
     -map "[v]" -map 0:a -c:v libx264 -c:a aac vertical.mp4

⑤ 燒字幕（用測過的腳本，自動斷行＋縮字級＋不出血＋帶影像）→ output-final.mp4
   python3 .agents/skills/leon-design/scripts/burn_subs.py vertical.mp4 subs.srt output-final.mp4

⑥ 抽格驗證——挑「最長那句」的時間點看，確認沒出血、沒錯字
   "$FF" -y -ss 9 -i output-final.mp4 -frames:v 1 check.png

⑦ （要發布才做）上傳 Cloudinary → 交 Maya 發 FB 粉專
```

**用到的工具總整理：**

| 工具 | 用途 | 安裝 |
|------|------|------|
| `scripts/burn_subs.py` | **燒字幕主力**：讀 SRT 自動斷行＋縮字級＋置中＋帶影像，保證不出血 | 課程內附，需 imageio-ffmpeg |
| `imageio-ffmpeg` | 提供 ffmpeg 二進位（免 Homebrew） | `pip3 install imageio-ffmpeg` |
| `faster-whisper` | 中文語音聽打 → 字幕 | `pip3 install faster-whisper` |
| `ffmpeg`（drawtext） | 轉尺寸、燒字幕、剪輯 | 同上 imageio-ffmpeg |
| Cloudinary | 影片托管拿公開 URL | 帳號（見 cloudinary-config.md；舊格式依平台規約） |
| Meta Graph API | 發布 / 排程到 FB 粉專 | Page Token（見 meta-config.md） |

**字幕格式規範**：見本文件最上方「📐 字幕規範」段落（位置垂直 55–70%、字級依行數 58–72px、白字粗黑邊、逐句出現、自動字幕必校對）。**多句字幕一律用 `scripts/burn_subs.py`，不要手寫斷行。**
