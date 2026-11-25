# StoryDialogueAndExit 實作與驗證紀錄

## 2026-11-25 結案與現行實作對照

使用者明確確認本 SPEC 完成驗收。本次僅以文件、程式與既有測試證據核對及收斂，不重新執行測試、Gemini、清庫或部署。產品驗收與歷史逐項技術核證是不同粒度：BDD 原72/115、TDD 原211/295。原未核證 43 BDD／84 TDD 從開發清單移除，不更改成通過；下表保留已存在功能、未實作及被取代範圍的區分。原追溯 JSON 為歷史技術證據，不作現行待辦。

| 原 BDD ID（SD-BDD-） | 查核項 | 結案處置／證據 |
|---|---|---|
| 020 | V3 人工 Gate B | 使用者明確確認；V4 Gate 不包含 |
| 056～060 | 2/3候選、等待、選擇、結果 | story-dialogue-ui.test.tsx；共用候選類別實作；隔離 fixture 不當作第二個正式故事 |
| 069 | 第二個正式完整故事 | 尚未交付，歸 StoryContentExpansion，不在本 SPEC |
| 070 | 多房間／雲端實測 | 保留本地隔離與重連證據，雲端冷啟動、hibernation／成本實測不列已核證 |
| 080、082～096 | 角色安全載入、前景採用、四姿態五表情、ACL／換角 | story-static-actors.test.tsx、avatar-adoption.ts、avatar-static-adoption.integration.test.ts；現行四姿態取代僅五表情舊條件 |
| 097～111 | Web／Android 舞台、聊天室、探索、合作、音效、場景／結局、Gate B | story-dialogue-ui.test.tsx、scene-event-framework.spec.ts、scene-v3-stage.test.ts、SceneEventFramework 已驗收；V3 三結局，非舊兩結局全矩陣代簽 |
| 112～115 | 非正式清理、新角色重建 | 既有精確清理及 replay 證據；未重新刪資料、未重跑真供應商及雙實體裝置矩陣 |

共用能力及素材驗收以 [SceneEventFramework Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) 為準。任何未曾執行的個別舊測試不得改記 passed；本次不啟動新 SPEC。


**現行跨 SPEC 分工（2026-11-25）**：使用者確認雨聲書店 V3 已實際遊玩驗收，[SceneEventFramework V3](../verification/SPEC-001-SceneEventFramework-Verification.md) 已依使用者決策縮減範圍並結案。首場 V4 新版技術／本人 Gate B 與舊版清理歸 [RainBookshopV4](SPEC-001-RainBookshopV4-Verification.md)，AffectionAndFeedback 完成後才進 [StoryContentExpansion](SPEC-001-StoryContentExpansion-Verification.md)。此決策不補勾本 SPEC 的歷史獨立聊天／授權／退出／平台測試，也不宣稱原十條已完成。下方 Gate B 待確認屬原版本歷史。

## 角色素材保留政策

依使用者指示，版本庫只保留正式程式使用的80張角色WebP及contracts/builtin-avatar-packs.json；選角／名片／配對由avatar-assets.ts直接匯入同一public來源的16張neutral，劇情讀取同目錄五表情。舊JPG、來源PNG、review／expressions／重複manifest、另一套WebP與離線製作比對工具已移除。歷史段落提及的製作路徑僅描述當時證據，不表示檔案仍保留；人工定稿的確認紀錄仍在本文件。角色ID、80張成品bytes／SHA及avatarVersion不變；本次不增加平台驗收完成數。

素材精簡驗證：工具43/43、相關client三檔70/70、client typecheck、Web export及Android Metro bundle export通過；80張WebP逐檔SHA與avatarVersion保持原目錄值。client首次並行執行有一項供應商用量不明提示逾時，單項及三檔序列重跑通過，未修改該測試或產品邏輯。24項Web E2E僅完成載入清單檢查，兩份原生picker腳本完成語法／素材路徑檢查，未重跑裝置操作；Android export不當成APK／實機驗收。素材測試先重現仍匯入舊assets目錄而失敗，再改為共用public來源後通過。另修正avatar-catalog原先回傳不存在的舊JPG網址：先以HTTP契約測試重現舊version失敗，再由Domain嵌入同一正式目錄並回傳neutral WebP；ProfileReadContractTests／AvatarEndpointTests共23/23通過（含Web／native header的HTTP fixture，非裝置驗收）。

## 2026-11-13 素材定稿與舞台修整（續行，未結案）

簽入前素材清理：未選用的 `female-01/alpha-cleanup-candidate.png` 移至 Git 忽略的 `.local/art-review-archive/`，並移除正式 review 的未選用項；`male-01`、`male-02`、`female-02` 的表情紀錄依既有人工確認改為 `approved-by-user`。16款master、80張表情來源PNG、prompt／核准紀錄、兩平台WebP及場景來源均保留。素材／工具測試43/43通過，另核對16份核准紀錄與80張來源，既有來源SHA均相符。此為版控內容清理，未改產品程式、未重產圖片、不增加Gate B或平台驗收完成數。

2026-11-13後續收尾：default local實際CLEAN-RESET與新profile Web／Android完整角色流程均已完成；完整測試結果為tools43/43、Client231/231、Worker253/253、.NET API195/195、Integration32/32、Unit321/321。Android 503續做按鈕已修復並能送出狀態查詢及下一表情請求；後續 API 仍回503，完整五表情成功採用尚未證明。本人Gate B、真實第二手機及逐幀效能仍保留未驗。

本輪最新結果（`2026-11-13T01:02:28.537Z`）：Android新B1完整10項通過，包含候選確認取消、Home背景停止下一張／正式採用、返回不自動續產、取消部分套組保留原角色、重新採用只做缺漏四張、五檔無損R2核對、免費／保存切回、重開App同包且沒有額外生成、僅一筆ready正式資產。最新 `.local/evidence/avatar-native-full-body-replay.json` 已更新；五圖SHA與先前已確認無損成品完全相同，avatarVersion因新asset ID而不同，這是新資產隔離而非重新生成。供應商請求0，虛構來源fixture／正式adapter重播的範圍維持。完整client最後230/230通過，Worker253/253、.NET319 Unit／32 Integration／195 API、兩個typecheck與Web export均通過；tools42/42、`git diff HEAD --check`通過。下方7項與較早client總數保留為歷史輪次。

最新Android成品補驗：已確認的Gemini無損五表情經正式Application／B1與隔離D1/R2注入真對方角色後，Web↔Android雙結局24項於 `2026-11-12T23:52:52.798Z` 通過，證據 `.local/evidence/story-android-2.5d-approved-gemini-both.json`；進場、兩結局PNG已目視透明邊緣／前景遮擋。另個資B1候選預覽、取消確認保留舊角色、五表情採用、免費／保存切回、App重開不重產及唯一正式資產7項於 `2026-11-13T00:35:35.200Z` 通過，證據 `.local/evidence/avatar-native-full-body-replay.json`。後者用虛構來源fixture與已確認供應商生成回應重播，供應商呼叫0，不把它冒稱真人照片picker或另一輪真Gemini生成。

先失敗測試發現個資B1只看navigation focus，切背景仍可能續產。新增AppState active與generation fence，背景後停住後續表情及正式採用；返回不自動續做，須本人先查回進度再繼續。另原client表情next僅30／45秒會早於provider90秒期限中止，已與候選POST統一110秒，逾時只報uncertain、不重送。三項B1復原／進度UX、六項Web／Android虛擬時間deadline及背景實際component失敗→通過；client完整226/226、typecheck及Web export通過。Android Home實際中斷與最新Web成品整套正在補驗，下文較早結果保留其時間／範圍。

使用者已逐批確認全部16款全身及80張五表情，正式透明WebP與穩定角色ID已接入選角／名片／配對及Round授權讀圖；完整prompt與確認紀錄在各 `frontend/client/assets/avatars/full-body.v1/<id>/`。原16張JPG hash不變。tools最後41/41（含素材、內容前景白名單），client完整216/216；舞台3/3、Domain presentation11/11、client typecheck／Web export／E2eHost build通過。

正式素材Web補驗先重現隔離host沒有ASSETS接線而無法換角，再限定固定角色／hash檔案補入測試bridge；16張選角解碼與對方五表情讀取成功。後續截圖覆核發現原背景前景桌子讓角色似站在桌上，另用內建ImageGen產製清空桌面背景與透明桌面前景（`rain-bookshop-clean-v2.png`、`rain-bookshop-foreground-v2.png`），完整prompt見同目錄provenance。前景與背景共用鏡頭矩陣；遠景不顯示桌面與其熱區，近景才疊桌面遮擋。只修改尚未發布的scene-01/v2，不覆寫已發布v1／不製作其他劇本。

新分層場景Web整套5/5通過；額外強化等待解碼／布局穩定後的正式美術單項1/1通過，截圖含手機遠景／桌邊中景及桌面中景。Android同一分層版本使用正式免費全身角色，雙結局24項檢查於 `2026-11-12T16:14:10Z` 通過，證據 `.local/evidence/story-android-2.5d-approved-art-both.json`。仍不代表真Gemini或本人Gate B。新增ACK競態測試先重現切換房間後舊回應帶回上一房間私訊，再對mutation／恢復／end／歷史查詢加generation fence；15項story UI通過。

真Gemini：使用者重新提供既有兩張授權來源，僅在RAM讀入／上傳，不複製來源照到報告或版本庫。依[Google官方文件](https://ai.google.dev/gemini-api/docs/generate-content/image-generation?hl=en)，模型不直接產生透明背景；既有SkiaSharp新增 `AvatarChromaMask`，只處理表情prompt保留洋紅底及有限邊帶，不猜任意照片背景；真alpha原bytes保留，非法底／空人物拒絕。JPEG背景差異、封閉空隙、白衣／膚色／淡粉衣、黑色細線與邊緣染色有先失敗後修復證據，mask＋expression共13/13。未新增套件、未換模型。

真Web UI於 `2026-11-12T17:08:15Z` 完成一張候選＋五次表情、ready採用與五檔SHA核對，5張各896×1200／約101～103KB；隔離真D1/R2，非default local。結果 `.local/evidence/avatar-full-body-gemini/20261112T170652864Z/result.json`。**使用者已拒絕該版角色相似度**，成功流程不代表畫質驗收；透明邊緣也未定稿。修正測試舊成功文案後才完整通過，早先中斷／透明度失敗保留原紀錄，不記成功。測試截圖後改為只截成功提示，避免額外保存來源照片畫面。

使用者明確要求「完全以舊版prompt去改成全身，不要自己重新寫一個prompt導致測過的prompt特徵消失」。因此 `datinghigh-adv-full-body.v2` 重新取回 Git 中完整 `datinghigh-adv-portrait.v3` 兩段主／STYLE ONLY prompt，僅更改取景、腿鞋限制及對應畫幅座標；原眼皮／眼距、眼鏡形狀、瀏海、原型線稿／cel shading／腮紅／光點、服裝與手勢要求保留。測試先確認簡寫版遺失原句而失敗，再恢復通過（generator10/10）。新一張候選於 `2026-11-12T17:24:34Z` 真UI生成，單張流程1/1；provider實際回報仍 `gemini-3.1-flash-image`。結果 `20261112T172434837Z`，與先前第三版／11月4日生成圖的本機比對頁已提供使用者；**等待該候選相似度確認，尚未生成其五表情或採用**。

本輪.NET整套（全身prompt恢復前）Unit318/318、Integration31/31、API195/195通過；其後完整舊prompt保留的generator10/10通過。Worker serial全套251/251；先前和client同時執行的3項5秒timeout未當成功，獨立序列重跑才通過。本次新增過期表情／ready Manifest孤兒清理：每張帶orphanAfter，僅固定路徑、到期且D1非ready才刪；ready套組、未到期與其他模組保留。真Miniflare D1/R2先失敗後通過，三檔34/34；每帳號可重用的adoption checkpoint不作無條件刪除，以免競態刪掉新的前景鎖。使用者已回覆新候選「相似度與畫風可以，繼續五表情」，並對同一master的五表情回覆「五表情與角色一致性可以」。原候選SHA比對相同後，隔離host只重播已確認候選，**候選Gemini請求0、表情Gemini真請求5**，`20261112T172938742Z` 完成B1／D1/R2採用1/1，不能誤稱本輪又真產了候選。

邊緣實圖比對確認有損WebP會比去背PNG多出塊狀色邊。先失敗測試後新增共用 `LosslessWebp`，正式Gemini表情採既有2MB上限，五張無損WebP仍896×1200、約338～343KB。與去背PNG逐像素核對alpha最大誤差0、半透明邊緣合成色差≤1級。原照片200KB／JPEG與免費80檔不變，沒有重產人物或更換模型。Skia premul往返本身有低alpha量化，測試改驗合成色階而非假設straight RGB逐bytes相等。

Worker ingress原先只認ALPH子區塊；依[WebP RFC9649](https://www.rfc-editor.org/rfc/rfc9649.html)補齊靜態VP8L嵌入alpha、版本／畫布匹配及ICCP順序，仍拒絕偽alpha／不符尺寸／metadata／動畫。格式2/2、.NET圖片／prompt相關51/51、真Skia→D1/R2→本人授權讀圖有損／無損兩組2/2通過。最後使用**已取得且身份／五表情獲確認的供應商原始生成圖**做HTTP回應重播，經正式Gemini adapter新去背／無損編碼與B1採用再通過1/1（`20261112T174529223Z`）；此輪真供應商請求0，報告明記replay，與前一輪5次真請求分開。最新Web成品比對頁只提供生成圖，不提供來源照片；Android正式成品實景續驗中。

Worker全套在GC補強後252/252通過（無損容器補強之前），其後無損格式2/2與跨層2/2通過。CLEAN-RESET readiness補一項先失敗後修復：SD-UT-061本身含實際reset後結果，不能反過來作首次reset前置；其他30項開發前技術證據仍必須verified，Gate B及reset結果仍另記，不放寬目標／帳號／備份／無writer條件。此政策測試1/1，尚未因此清除任何實際資料。

最新Web成品整套5/5通過，使用 `DATINGHIGH_E2E_STORY_APPROVED_PACK=20261112T174529223Z` 明確重播已確認無損成品，隔離真Application／D1／R2／DO，供應商呼叫0。報告 `.local/evidence/story-web-approved-gemini-results.json`；同選／異選結局、真訊息、永久退出、重連查回原ID、POV／WS換包與全16款解碼均成功。因新增手動微動開關，相關單項再驗另記，不能把前一輪截圖冒稱含新按鈕。

性能退化補強：先失敗測試後加入「關閉場景微動」，停止並移除裝飾動畫，保留鏡位、角色、光色與熱區；切背景同樣停止。client完整228/228與typecheck通過，之後新增「真畫面特寫→返回不提交、明確選項才寫入」單項1/1通過。未以這些功能虛構FPS或峰值記憶體數據。

該次逐項覆核另將SD-UT-055／066／069／071／081的純UI／協調器完整斷言升為verified，並附各自測試錨點；對應BDD／IT／API／ET缺項保持partial。該時間點TDD為185/295（62.7%）、BDD72/115（62.6%）；較新的整體追溯數字見本紀錄前段。正式完整Gate B、實際CLEAN-RESET與其餘逐條新增案例覆核仍未完成。

本次最後一輪完整後端回歸：`dotnet test backend/DatingHigh.slnx --no-restore '-m:1'`，API195/195、Integration32/32、Unit319/319全部通過。`npm --prefix cloudflare test -- --maxWorkers=1 --testTimeout=30000` 完整253/253通過，Worker typecheck通過。最初透過npm轉送 `-m:1` 被PowerShell拆成 `-m: 1`，該次僅命令參數錯誤未執行測試；改直接dotnet後才記完整成功。

Web微動補驗：最新匯出後，在已確認Gemini成品的桌面與手機各關閉／開啟場景微動，場景與聊天仍可操作，並完成授權讀圖／WS換角單項1/1；報告 `.local/evidence/story-web-approved-gemini-motion-results.json`。另以先失敗測試補上「begin回覆之前已切背景」：回前景只GET查回正在製作的workflow，仍不送表情或正式選角；個資畫面完整43/43通過（含迅速返回前景的競態），之後Web export及client typecheck通過。Android Home／取消部分套組／缺漏重用實測續行。

## 2026-11-12 開發續接紀錄（未結案）

### 本輪續接更新：授權讀圖、事件換角與 v2 舞台

已接上 `AvatarReadService`／`AvatarReadStore`、Worker `round-avatar.ts`：本人保存角色與同房對方五表情分用途授權，投影不含 owner／private key／來源照片／provider metadata。每次 binary read 在非同步素材讀取後再次確認 Session、原配對、恰好兩筆 claims、active 與目前選角；改選、退出、撤銷、第三人及 SHA 不符拒絕。已確認的免費套組由 `builtin-avatar.ts` 讀版控 metadata，使用相同 Round 授權讀圖通道；未備齊的免費角色不以舊半身圖替代。

正式採用提交後才送 `avatar.updated` 不透明版本提示，同房 DO 隔離與 client 去重／重連校正已接線。前端只在初載、前景／重連與版本提示讀 metadata，不做角色 DB 定時輪詢。五張圖片保持掛載，全部解碼且當前一句結束後原子換套組；失敗保留原角色並可明確重載。素材不再就緒或授權移除時清空私人角色；退出／撤銷後的晚到回應不能恢復私人畫面。

`contracts/story-scenes.json` 產製來源推進至 **scene-01/v2**（新 catalog ID `019a281e-0000-7000-8000-000000000102`），未覆寫已發布 R2 v1，**尚未發布本地／雲端 v2 catalog**。新增經工具／Domain 驗證的 `scenePresentation`、節點 camera／固定非語言 expression、歸一化熱區／原生幾何前景、兩結局光色與遠中近鏡；`StoryStage` 與 narrative／聊天各自限定捲動區，不再整頁長捲。聊天草稿／節點保持，探索以局部 Modal 進入與返回，不因熱區點擊自動提交。原創短 WAV 的 `audioCues`、本人手勢開音、音量／靜音及背景暫停已接線；美術／運鏡品質仍須雙平台及本人 Gate B，不能將幾何前景或 fixture 角色當作正式體驗已驗收。

**本輪 Red → Green**：R2 單張已寫入但進度寫失敗，以同 lease 收據恢復而不重呼 provider；Round／本人讀圖 ACL；未就緒改選／退出／撤銷的晚到回應；WS 同房提示與去重；五表情解碼／句尾切換；跨尺寸鏡頭與熱區同矩陣；非法鏡位／script／任意 URL／非音訊 cue 拒絕；音量、靜音及平台拒絕播放；免費正式套組授權讀取。測試見 `round-avatar-r2.integration.test.ts`、`avatar-adoption-r2.integration.test.ts`、`story-dialogue-websocket.test.ts`、`AvatarExpressionEndpointTests.cs`、`PersonalMediaIntegrationTests.cs`、`StoryPresentationTests.cs` 與 client 的 story／portrait／geometry／audio 測試。

**完整執行結果**：.NET solution 一次整套 **Unit 310/310、Integration 31/31、API 195/195**；Worker 全套 **248/248**（加入免費正式套組前），其後 Round 圖像整合 **10/10**；client 全套 **213/213**，其後撤銷競態補強的 story UI **14/14**；tools **39/39**、兩模組型別與 Web export 通過。Web scene suite **4/4**，含真 D1／R2／DO 雙結局、遺失 ACK、角色提示換圖、圖片重用與有界聊天。Web 新角色明確使用 Skia 幾何 fixture，只驗傳輸／授權／布局，**不是真 Gemini／原畫品質證據**。首次 Web 雙結局在手機 reload 後未重新展開預設收合聊天室而失敗，修正測試操作後整套通過。

**Android 最新整套已通過**：在本 workspace `.local/android/avd` 新建專用 `DatingHighQA31`、ADB5038／emulator-5556，不使用或修改既有其他專案 AVD。同一最終 UI 的 together／different 雙結局共 **22 項操作檢查**於 `2026-11-12T14:33:37Z` 通過，證據 `.local/evidence/story-android-2.5d-technical-both.json`。涵蓋初次進場單一對方角色、取消退出、手勢開音／音量／靜音、雙向真人訊息、探索、前景游標恢復、合作雙結尾、完成後聊天、Web 結束清原生私人畫面及重開拒私人歷史。角色 provider 是明示 Skia 幾何 fixture，不代表正式美術、真 Gemini 或本人 Gate B。過程修正新裝 App 登入入口、聊天入口位置、合作選項超出手機區域及新節點敘事捲動位置；`ScrollView` ref 型別錯誤也已修正並通過 typecheck。iOS／無障礙專項依既定決策不列待補。

**最後回歸**：Worker 全套 **251/251**、client 全套 **214/214**、Web export 通過；最終 UI 的 Web suite 再跑 **4/4**，雙結局、角色版本提示換套組與遺失 ACK 原 ID 查回均成功。這些數量代表實際執行測試，不直接代入 295 項規劃案例完成數。

### 免費美術的使用者確認紀錄

使用者補充：「不需要那麼麻煩 直接你產生去比對就好 過程讓我確認」。因此採 **內建 ImageGen 直接延伸／與保留原畫視覺比對／使用者逐批確認**，不加入鎖回原圖的上半身合成流程。早先探索的像素差異數據只留為製作紀錄，不作新增的逐像素驗收門檻；仍須保留角色身份、原衣裝／髮型／氣質及穩定 ID，原16款檔案未覆寫。

`female-01` 全身方向（「可以 很好」）及五表情（「五表情可以定稿」）、`male-01／02`、`female-02` 全身（「三款全身方向都可以」）及五表情（「三套五表情都可以定稿」）先逐步確認。其後依下段完成全部16套。`tools/AvatarAssetPacker` 使用既有共用壓縮輸出 **80 張 1086×1448 透明 WebP**，各約142～199KB；SHA／尺寸／版次在 `contracts/builtin-avatar-packs.json`，source PNG／完整 prompt／確認紀錄保存在各 `full-body.v1/<id>/` 與既有 `provenance.json`。比對工具為本機8093 `tools/preview-avatar-art.mjs`，不是產品新增畫面。

後續使用者已逐批確認 `male-03／04`、`female-03／04`、`male-05／06`、`female-05／06` 以及 `male-07／08`、`female-07／08` 的全身與五表情（三批各回覆「四款全身方向都可以」「四套五表情都可以定稿」）。因此 **16 款全身方向／16 套五表情已人工確認**。`avatar-assets.ts` 已由 `tools/generate-builtin-avatar-assets.mjs` 依正式 neutral WebP 重建，選角、本人名片與配對免費化身共用新版來源；原ID維持。新素材驗證先重現仍import舊JPG的失敗，再改接正式全身；tools最後 **40/40**，含80檔SHA、版本、尺寸、選角對應與原16JPG hash不變。此為美術確認與素材檢查，不代替正式舞台完整雙平台實玩。

**CLEAN-RESET 已在 default local 完成**：`tools/avatar-reset-policy.mjs`、`tools/local.mjs avatar-reset-preview／avatar-reset-apply` 只接受明確 local DatingHigh DB／FILES、具名測試帳號與不可變指紋清單；阻止 active Round／claims／B1，先備份，再以 D1 CAS 清選角與指定 generated_avatar，最後按精確 R2 key／etag 刪除。2026-11-13實際清理3個閒置profile、6筆generated_avatar及47個avatar R2物件，兩個active-round帳號排除；計畫 `.local/avatar-reset/avatar-reset-20261113-b.json` 顯示 `complete`，47/47物件刪除，備份存在。三組帳號／非角色profile／個人照片 D1／R2保護hash前後一致；沒有新增D1 table／marker／job，也沒有更動原16張原畫。真 Miniflare D1／R2整合案例 SD-IT-095／096與local reset均通過；新增 `npm run dev:platform:stop` 固定loopback wrapper，避免以任意程序命令停服務。

**目前保留**：Android 503後按鈕已能啟動狀態查詢與下一表情請求，但該次 API 再回503，故成功補齊五表情並正式採用仍未驗；真實第二手機／實體低階裝置及逐幀FPS／jank未驗；本人Gate B仍待試玩。Web／Android新profile完整角色流程採已核准圖像回放，供應商呼叫0，且不是新一輪視覺核准。新功能未全數完成，尚未開始其餘九場或production；最新逐案追溯為211/295（71.5%），BDD 72/115，不能以局部測試取代未通過案例。

以下為上一輪續接紀錄，保留其當時的測試結果與缺項；以上列續接更新為較新現況。

本輪承接 MVP、Story／Avatar 的最新 SPEC、BDD、TDD 與 RiskAudit。已新增 `AvatarExpressionService`／binary store、Worker `avatar-adoption.ts`、`avatar-expression-manifest.ts`、`avatar-expression-store.ts` 與透明 WebP ingress；前端 `avatar-adoption.ts` 接入個資畫面。首次候選 prompt 改為全身；B1 每次 HTTP 最多產一種固定表情，前景依序 await，五張 R2 hash／MIME／尺寸皆符合才 CAS 發布 immutable ready，之後才走既有 D1 採用。沒有新增或修改 D1 schema。

取消用既有 Profile revision 作 D1 fence，阻止晚到採用；失敗保留不可公開 pending／同一套組，不再刪並行者可能已提交的 bytes。生成資產 pending GC 改為兩小時，照片仍三十分鐘。已完成表情／相同候選取消後續做重用原 asset ID；切回正式生成角色先驗本人清單與 ready Manifest，未備齊套組拒絕。模型 allowlist／預設未更換，未觸發真 Gemini，未清本地或遠端 D1／R2。

`ImageCompressionService` 新增保透明 WebP 與最小尺寸選項，原照片 JPEG／200KB 預設維持；不夠畫質下限時拒絕。表情 provider 只收選中候選，不重送真人照片；opaque／近乎全透明輸出拒絕。舞台先改為只顯示對方角色，聊天室可收合且保留草稿／節點；**尚未完成 2.5D 舞台**。

Red → Green 證據：舊 prompt 的全身斷言、alpha 被鋪白、尺寸下限、直接繞過 B1 的採用、同帳號鎖、取消後晚到 D1 提交、取消後重用成功表情及聊天室收合均有先失敗後修復。測試位置：`backend/tests/DatingHigh.Unit.Tests/{Application/AvatarExpressionServiceTests,Infrastructure/AvatarExpressionGeneratorTests,Infrastructure/ImageCompressionTests}.cs`、`cloudflare/tests/avatar-{adoption-d1.integration,adoption-r2.integration,expression-manifest,expression-r2.integration}.test.ts`、`cloudflare/tests/transparent-webp.test.ts`、`frontend/client/tests/unit/{avatar-adoption,story-visual-policy,story-dialogue-ui,dating-profile-screen}.test.*`。合成 binary 的 R2 測試不代表影像解碼／身份一致性或人工畫質已通過；`.NET` 真 Skia → bridge → Miniflare 的整合另驗。

本輪已執行：Worker 全套 **236/236**、client 全套 **196/196**、.NET Unit **300/300**，Worker／client 型別檢查通過。首次 .NET 整套出現 Integration 5 項、API 4 項失敗；已修正時鐘傳遞／新版 B1 fixture／Skia sRGB WebP ingress，後續重跑結果續記於本節，不把首次失敗隱藏。

後續重跑：Integration 全套30/31，剩餘 ProfileBounds 已在修正可信注入時鐘後單獨通過；真 D1 配對 API 14/14、新表情 HTTP 邊界5/5、root tools37/37、Web export 通過。新測試一度因同專案測試 DLL 被上一輪占用而建置失敗，待釋放後已依序補跑通過。API 首次整套183/187的四項失敗均在14項 MatchingRealD1 重跑中通過，未將分組補驗冒稱同一次整套成功。

另以失敗測試捕捉四候選＋五表情會超出原8次／小時候選額度；新增 `avatar_expression.v1` 每帳號20次／小時，候選仍8次／小時，認證額度不變。.NET Unit 全套300項再驗通過；Worker 最後回歸另記。

免費 `male-01` 一張 ImageGen 全身延伸**候選**保存在 `frontend/client/assets/avatars/full-body.v1/male-01/master-candidate.png`，prompt／原圖與候選 SHA 見既有 `assets/avatars/provenance.json`。原16款圖未覆寫；此候選未完成上半身像素對齊／人工確認，未進 runtime catalog，不能稱為正式 full-body 或五表情套組。

**未完成範圍**：16款原圖鎖定外延與80種表情、真 Gemini 全身／表情品質及可靠去背、完整私人 Round 表情投影 ACL、`avatar.updated` WS／安全句尾換角、版本快取、2.5D 遠中近鏡／熱區／光色／完整 P1～P5、可預覽可重試 CLEAN-RESET wrapper、真 Web／Android 重新驗收與本人 Gate B。候選關閉／ready／D1 提交的更多故障窗口仍須逐條補驗。其餘九場、雲端量測與 production 均未執行。

進度仍保守維持 **TDD 175/295（59.3%）／BDD 71/115（61.7%）**：新108項有局部程式證據，尚未逐項滿足完整斷言，因此不改 `[ ]`。追溯工具已支援295／115／30 AC，新增項固定保留 partial；不再錯把舊187項報告當最新版。

最後回歸：獨立表情額度落地後 Worker **236/236**、.NET Unit **300/300**；真 Skia／B1／D1／R2 跨層與 ProfileBounds 分組 **2/2** 通過。client 全套 **196/196** 後，前景 generation guard／取消結果文案追加的相關四檔 **52/52** 再驗通過；兩個 typecheck、Web export、root tools **37/37**、相對 Markdown 連結及 `git diff --check` 通過。沒有執行本輪 Web E2E／Android／真 Gemini／cloud。Overview 已同步系統、分層、runtime、模組、相依、放置、工作流、API／資料；Docker、部署 binding、環境 key 與原生套件無變更，部署／環境模板無新增內容。

日期：2026-11-08。文件包為 [MVP](../../requirements/MVP-001-LoveGameDatingApp.md)、[SPEC](../specs/SPEC-001-StoryDialogueAndExit.md)、[BDD](../bdd/SPEC-001-StoryDialogueAndExit-BDD.md)、[TDD](../tdd/SPEC-001-StoryDialogueAndExit-TDD.md)、[RiskAudit](../specs/SPEC-001-StoryDialogueAndExit-RiskAudit.md)。

## 已實作範圍

只有正式 `scene-01 雨聲書店 v1`：完整無環節點圖、支線合流、個人書籤探索、雙人合作兩種結局、三種本人建議、自由訊息、逐句／略過演出、原創背景與本人點擊雨聲。Web／Android共用renderer與標準WebSocket，沒有固定對方、假回覆、假已讀或好感數據。章節完成可聊天，不能啟動第二場。

0005新增恰好四表、Round7→9欄、claims只更名、零Trigger；Foundation六表54欄、Avatar兩表27欄維持。D1是Session／Round／claim／revision／receipt與事件序號權威。DO只負責transport／ephemeral presence／安全提示，HTTP與WS共用Application，通知port不含Cloudflare型別。獨立R2提供immutable manifest與hash素材，不讀私人FILES。

任一原始玩家二次確認後永久結束，原子釋放兩筆claim、取消active互動，雙端清空私人畫面；舊游標不能回讀，原成員僅安全ended，原pair不再配對。結束確認已改為置中Modal，標題與結束入口固定在捲動區外。

## Red → Green 與稽核修復

1. 首輪真D1因缺0005／固定命令失敗，逐步補入schema與同batch初始化；每一接受步驟注入零列證明整批回滾。
2. 節點／chapter.completed事件被注入零列時曾留部分進度，新增事件存在guard後回滾；互動insert零列也先重現再加同batch changes guard。
3. N2第二票的Session或selected事件零列曾部分提交；各補入「兩票必有Session／Session必有正確selected事件」guard，失敗第二票整批撤銷。
4. 插入非法第三claim曾讓舊名片查詢誤認成員；現在呼叫者必須是原pair，claim總數與pair內數均恰為二。
5. 發布完整圖若入口不是SQL初始化的entry，曾可通過；已統一發布與Domain驗證的固定入口契約。R2上傳後逐物件讀回驗SHA才發布Catalog。
6. readiness曾只看partial索引WHERE而接受非unique替身；先重現再改為檢查完整索引結構。新部署preflight另驗獨立內容bucket／Room DO／Worker-first素材路徑。
7. 最後End覆核重現active互動未取消；正式End與local CLI已同批取消，另以取消UPDATE零列驗證ended及claim釋放整批回滾。
8. N1新投票原回通用409，失敗HTTP測試後對齊STORY_ALREADY_SELECTED；已提交相同requestId仍回原receipt。
9. 原生背景回前景／新訊息測試必須捲到實際控制項，單一UiAutomator程序獨占裝置；測試不與Web export或會關閉8081的其他suite並行。退出測試另以畫面確認Expo SDK58的浮動開發按鈕攔截右上角點擊；Story suite用SDK既有 `__expo_disable_fab`／`__expo_disable_auto_launch`／`__expo_disable_onboarding` 當次launch參數關閉開發覆蓋層，不改產品權限、帳號或裝置全域偏好。
10. Windows真local測試改用固定Ubuntu WSL Docker wrapper，僅查DatingHigh local container，不切換其他專案Docker程序；憑證與本地碼僅在RAM。

## 執行證據與環境

- `.NET`：全套283 Unit、31 Integration、187 API已通過；含通知失敗後原receipt補驗，Domain14項另再驗。實際測試數不能直接代入187個規劃ID。
- Worker：真Miniflare D1／獨立R2／Room DO；完整check:foundation時219項通過；最後transport缺binding補驗後Worker全套220項通過，End取消互動補強後真Story／Matching D1共80項再驗通過。SQL故障、FK／UNIQUE／並行與rollback不是HTTP fixture替代品。
- Client：完整189項通過，包括unknown原ID、safe offers、合作等待、斷線不重送及45秒ACK逾時。
- Web：真Application／Miniflare D1／Room DO／R2，兩條完整結局均通過；故意丟ACK但D1真commit的補驗通過，原ID只有一筆。舊Matching Web12項通過。trace／video關閉，場景截圖不作SQL證據。
- 真default local：Foundation3項、Story1項通過，實際Worker→Linux Container→D1／獨立R2及Room DO；新建合成帳號、隨機秘密只在RAM、最後登出；最終真local也先經DO／Application提交active探索實例，再以帶取消guard的End成功結束。
- local CLI：真正Wrangler local D1建新named instance，指定Round結束、取消互動、重播、第二房間及失敗release回滾均通過；測試結束只清自己建立且驗明路徑的instance。
- Android：使用自己的DatingHighQA31／emulator-5556／ADB5038，重建含expo-audio的development APK；UI XML僅RAM、無trace／video。兩種結局完整suite均通過（共22個操作檢查），包括初入房取消、章節後取消、Web end清原生畫面與ended重開拒私人歷史；不是只計途中步驟。

## 逐項深度稽核

[追溯JSON](story-dialogue-exit-traceability.json)保存187個TDD原始斷言、79個BDD、實作與測試行號、覆核理由及保留缺項。[固定人工判讀對照工具](../../../tools/audit-story-traceability.mjs)只檢查ID／錨點及計數，不因測試名稱存在自動批准。規劃把SQL斷言放在UT或UI斷言放在API者，以適當邊界的更強證據補驗，不能假稱fake SQL是原子證據。

本次覆核為TDD175/187（93.6%）、BDD71/79（89.9%），前端9/15（60%）；Android完整兩結局已通過。Gate B與正式多故事UX、雲端量測保留待驗，未達完整100%。原TDD SD-IT-041的「保留舊active」前提與後來SD-RQ-02=A矛盾，已依最新確認決策改為受控清舊後保留claim schema與原子保障，不偷偷替舊Round造候選。

## 量測的實際含義

真local一次事件createdAt到對方授權讀回258ms；ACK到對方讀回153ms，含一次冪等重播。這不是精確D1 commit到畫面繪製延遲或p95。隔離真Room DO兩房presence送達91ms、重連354ms，沒有跨房presence；不含Container，不當作雲端hibernation。數據來自忽略目錄的story-live.json／story-room-isolation.json，各自記環境與時間。未量測雲端DO喚醒、Container冷啟動、成本或長時間負載。

## 本地操作與交付邊界

default local已透過受控wrapper暫停寫入、備份、只清舊三張遊戲／邀請資料、套0005並發布scene-01；帳號／Profile／媒體保留。升級備份位於本地忽略目錄，未提交。內容SHA、完整來源prompt與原創音訊來源見 [provenance](../../../contracts/story-assets/provenance.json)，背景由OpenAI內建image_gen產生，未引入第三方角色素材。

執行入口：`npm run content:publish:local`、`npm run test:story:live`、`npm run test:story:web`、`npm run test:story:android`（先明選裝置與ADB port）。Web先export並build E2eHost；native需重建APK且獨占UiAutomator。開發平台維持localhost:8787、Web localhost:8081。

Gate B需使用者完整玩第一場，確認節奏、視覺／人物比例、等待、音效、支線及對話UX；未確認不製作其餘九場，不勾MVP十場AC。依 [SPEC §6.4](../specs/SPEC-001-StoryDialogueAndExit.md) 的明確Gate B限制。iOS依D-052暫緩，無障礙依D-051不列待補。History／Housekeeping／Affection／名片交換／後續遊戲未實作假頁；staging／production均未部署。

## 最終執行摘要

`npm run check:foundation`完整通過（283 Unit／31 Integration／187 API／219 Worker／189 Client，兩個typecheck與37工具測試）；之後新增的transport依賴失敗測試使Worker全套220項通過。最終End取消互動補強：真D1 Story47＋Matching33＝80項、Story API11項及Web3項再驗通過；local CLI另有真Wrangler1項，Foundation live3項、Story live1項通過。Android雙結局22項操作檢查完整通過，Gate B明確保留pending-user-playthrough。測試數與175個已覆核規劃ID分開計算。

Overview影響矩陣已同步全部受影響文件：系統定位、分層、runtime、模組、相依、coding／放置／工作流、API／資料契約、部署／環境設定；未因整理入口自動啟動其他SPEC。Git diff／連結與secret／artifact範圍掃描另於交付前執行。

## 2026-11-13 續接：斷線、換裝置、鍵盤與素材重驗

- Web斷線情境 1/1 通過：離線後保留草稿並停用送出，同房重連後才可送出；真D1事件只提交一則。第二個390×850行動瀏覽器工作階段 1/1 通過：同帳號新登入可回到原配對房間聊天，舊裝置重新整理後回登入。這是瀏覽器第二工作階段，不是兩支實體手機的裝置矩陣。
- Android QA31 原生首場同選故事 14項操作通過，包含 IME 開啟時角色、輸入框、傳送與退出按鈕都在鍵盤上方；App背景後回前景補同步、同房雙向訊息、結局後聊天、正式退出與結束後不再顯示私密內容。證據 `.local/evidence/story-android-2.5d-approved-art-together.json`；Gate B仍待使用者親自試玩。
- 圖片品質單元測試 8/8 通過：拒絕缺腿、缺腳／鞋、鞋底裁切的表情圖，並接受鞋寬小於褲管的合格圖片。此檢查只抓全身幾何缺失；身份相似度與畫風仍須人工判斷。
- 2 GiB級 QA 模擬器離散記憶體樣本：進場 App PSS 401,060 KiB、鍵盤開啟 422,577 KiB、結尾 429,861 KiB；本次採樣峰值約420 MiB，當時最低系統可用記憶體 649,456 KiB（約634 MiB）。整場原生流程完成；未取得逐幀FPS／jank剖析，也不是實體低階手機或發佈建置基準。
- 隔離 Web API/Application/D1/R2 的新帳號完整化身流程 1/1 通過：上傳兩張既有授權照片、建立候選、順序完成五表情、正式採用與雜湊核對。證據 `.local/evidence/avatar-full-body-gemini/20261113T031902718Z/result.json`；1候選＋5表情、896×1200，供應商請求0。此為重播已核准候選／表情的技術驗證，不是新Gemini生成或新的視覺核准；新輸出記錄維持 `pending-user-review`。
- 較早一輪、修正前的原生 B1 供應商故障情境已確認503後保留舊角色與兩張已存表情，沒有半套ready資產；當時Android「繼續製作」按鈕未觸發下一個表情API。後續續做修正見本節末尾追加紀錄。單元測試、Web重播成功流程通過，不能取代原生端完整採用驗證。截圖 `.local/evidence/avatar-native-provider-failure.png`。
- 舊角色只完成只讀預覽，未套用清理：三個閒置帳號、六筆生成角色資產、47個相關R2物件；帳號與個人照片都保留。另兩個有進行中故事回合的帳號排除。預覽 `developmentReady=false`，所需30項重置前技術案例僅7項已覆核為verified；工具因此拒絕apply。本輪測試使用隔離資料，未改本地角色資料。

本次回歸：工具42/42、Client231/231、Worker253/253、.NET API195/195、Integration32/32、Unit321/321；兩個Web特例各1/1。前述測試通過與TDD逐案例完整覆核、Android原生重試及實際CLEAN-RESET分開記錄。

## 2026-11-13 後續：CLEAN-RESET與新角色重驗

- 本機清理預覽 `developmentReady=true` 後，wrapper先建立忽略的本地備份，再完成3個閒置角色的D1 CAS與47個avatar R2 key／etag刪除；6筆generated_avatar記錄已清空。active Round中的兩個帳號未列入計畫。清理完成後，3組帳號／非角色profile／personal_photo D1與R2 bytes保護hash均相同；沒有清帳號或照片。
- 新profile Web全流程1/1：用先前核准的主圖、五表情回放，隔離測試profile從兩張已授權來源照片、候選、B1五表情到正式採用並逐SHA核對成功；candidate 1、expression 5、外部provider call 0。輸出 `.local/evidence/avatar-full-body-gemini/20261113T044812805Z/result.json` 的本輪 `visualApproval` 仍是 `pending-user-review`，表示這次技術重播未要求再做視覺定稿。
- 新profile Android QA31全流程通過：候選取消保留舊角色、五表情生成／採用、免費及已保存角色切回、App重開重用同一五圖與SHA；供應商呼叫0。2 GiB級模擬器的離散PSS樣本為323,265 → 422,690 → 440,054 → 458,028 KiB，最低可用記憶體597,660 KiB；這是採樣峰值，不是連續峰值、實體低階手機或FPS/jank剖析。成功回放 `.local/evidence/avatar-native-full-body-replay.json`。
- 初次以provider層注入503驗失敗處理：原選角保留、沒有半套ready資產通過；修正前Android原生點「繼續製作尚未完成的表情」未送出status或下一張expression API。修正後的續做證據與限制見下方追加紀錄；Web與單元明確重試通過不代替原生端完整採用證據。
- 完整回歸：tools 43/43、Client 231/231、Worker 253/253、.NET API 195/195、Integration 32/32、Unit 321/321；新增reset相關UT／IT標記與traceability已同步。工作項目整體仍未結案。

### 2026-11-13 Android 503 續做修正

- Red → Green：重現原生 `fetch` 拒絕帶 body 的 GET；`produceAvatarExpressions` 的 resume 狀態查詢改為不傳第三個 body 參數。回歸先因實際參數 `{}` 失敗，修正後 Client 目標檔 **4/4** 通過。
- Android QA31 操作「繼續製作尚未完成的表情」後，`GET /api/v1/me/avatar/expressions` 收到 **200**，接著 `POST /api/v1/me/avatar/expressions/next` 已送達 API。該次下一表情請求仍回 **503**，所以只驗證按鈕已進入續做流程；沒有證據宣稱五表情已補齊或正式採用成功。
- SD-BDD-086 維持 **partial**，TDD／BDD總數不變：**211/295（71.5%）／72/115（62.6%）**。此輪未重跑長測試套件。
