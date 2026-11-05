# AvatarAndPreferences 驗證紀錄

## 2026-11-05 D-053 個人資料／化身／獨立名片修訂

本節為本次計畫的最新證據；下方2026-11-04的236/236與兩表24欄屬歷史版本，不擴推本次修訂。範圍限本地Web／Android；iOS暫緩、無障礙專項不納入；production／staging皆未發布。沒有新增Gemini真產圖、Google或收信證據；本次沒有呼叫真AI供應商。

### 實作與追溯

- [共用欄位定義](../../contracts/profile-fields.json)：.NET嵌入／Worker白名單／API目錄／前端表單及名片共用；catalog版本2026-11-05.v2。
- [0003](../../cloudflare/migrations/0003_profile_gender_card_visibility.sql)：user_profiles18欄、media9欄，共兩表27欄；Foundation六表54欄保留、零Trigger。已經正式wrapper套用default local。
- [DatingProfileService](../../backend/src/DatingHigh.Application/DatingProfileService.cs)、[commands](../../cloudflare/src/commands.ts)、[ProfileProjections](../../backend/src/DatingHigh.Application/ProfileProjections.cs)：新輸入、完成判定、原子化身清除、分享省略與配對獨立投影。
- [編輯頁](../../frontend/client/src/DatingProfileScreen.tsx)、[名片頁與可重用顯示](../../frontend/client/src/CardPreviewScreen.tsx)：條件儲存、草稿保護、下拉／返回、預覽前保存與每次focus讀取。
- BDD／TDD的AP-PC-001～008與[追溯](SPEC-001-AvatarAndPreferences-Traceability.md)、avatar-preferences-traceability.json.profileCardRevision同步；原275項歷史追溯不改寫。

### Red／Green與本輪執行

先加入失敗測試：CardVisibility_ClosedFieldsAreAbsent_AndNewFieldsDefaultClosed原投影仍洩露關閉欄位；真D1的profile extension原15欄未達18。再新增migration、驗證與條件SQL，以下Green另依環境記錄。

| 驗證 | 結果／精確範圍 |
|---|---|
| `dotnet test backend/DatingHigh.slnx --no-restore -m:1` | 完整批次405/405：API142、真整合31、Unit232；之後追加6個Unit案例，定向10/10（含4個重驗），目錄API最新3/3重驗。合計411個唯一後端案例有通過證據，並非單次完整411項；HTTP的iOS參數不等於iOS UI驗收 |
| `npm --prefix cloudflare test -- --maxWorkers=1 --testTimeout=30000 -t '^(?!GC drains)'` | 131/131選定案例通過；大型GC另跑 |
| Worker補跑 `-t 'GC drains|profile extension|gender and|changing gender|0003 upgrades'` | 12/12通過，其中GC一項補齊上列，其他是最新D1重驗；合計132個唯一Worker案例通過 |
| `npm --prefix frontend/client test -- --maxWorkers=1` | 最新150/150；含深度稽核追加的editor定義驅動畫面、名片離頁清除舊資料兩項Red→Green。uncertain分支另重驗4/4 |
| client／Worker `run typecheck` | 兩者exit0 |
| `npm test` | 工具／政策24/24 |
| `npm --prefix frontend/client run export:web`、`npm run build:e2e-host` | exit0；未帶native fault profile進Web export |
| `npx playwright test --config tests/playwright.config.ts profile-card-settings.spec.ts` | 最新2/2（43.1秒），在兩項稽核修正後重跑；真.NET／Miniflare D1／私人R2、受控圖片fixture，不呼叫Gemini |
| Android `profile-card-settings.mjs` | 完整all流程exit0：DatingHighQA31／Android API31 x86_64、emulator-5578、專用ADB5038；8／8／16、保存、返回／下拉取消與捨棄、獨立名片、隱藏欄位與零照片請求、登出重登入保留設定 |
| default local Worker／Linux Container bridge | 0003已套用、根context實際容器建置及wrapper restart ready成功；`npm run test:live` 3/3，擴充後`avatar-http-live.test.mjs` 1/1；原8082 Metro已還原，測試用8084／QA emulator已關閉 |
| Foundation組成檢查 | Tools24、上述Server／Worker／client、兩模組typecheck、build policy及Foundation既有證據評估依序通過；本次未執行單次`check:foundation`總命令，不借用歷史671項作本次結果。歷史全環境驗收仍未通過，不改寫為已驗收 |
| `git diff --check`、文件相對連結 | 已通過；交付前再檢查 |

Web已驗8／8／16、未儲存性別不提供免費角色、切換性別清除錯誤角色、語意修改後才顯示儲存、還原隱藏、獨立預覽先保存／重讀、關閉暱稱／職業／照片後不顯示且零媒體請求、重登保留、360px不橫向溢出、下拉取消／捨棄及409留原頁不重送。client另驗uncertain與保存後GET失敗不導頁、不自動重送。

真default local的擴充bridge另驗catalog v2、舊資料預設、新三欄完整往返、關閉欄位由伺服器省略、錯誤性別化身400、正確選用後完成判定、變更性別原子清除，以及舊revision409無部分寫入。不是僅HTTP fixture證據。

原生完整批次完成後，稽核另修正editor metadata與名片blur清除快取，已以失敗測試、最新client150項及Web2項驗證；未在這兩項共用修正後重跑Android。實際定義的editor與type目前相同，原生已驗路由返回會卸載名片；仍不把前述重驗宣稱為另一輪Android證據。

匿名本地執行記錄：`.local/profile-server-final.log`、`profile-server-new-cases.log`、`profile-server-catalog-final.log`、`profile-worker-focused-final.log`、`profile-worker-gc-final.log`、`profile-client-acceptance.log`、`profile-ui-audit-red.log`、`profile-web-acceptance.log`、`profile-android-final-success.log`、`profile-live-foundation.log`、`profile-live-avatar-acceptance.log`及`profile-platform-restart-verified.log`。這些為忽略的本機證據，版本庫的逐項對照見[追溯索引](SPEC-001-AvatarAndPreferences-Traceability.md)。

初輪回歸曾因宿主記憶體壓力出現逾時／ECONNRESET；改依序執行後重驗成功。大型GC的fixture牆鐘期限由120秒調為600秒，保留模擬時鐘的清理預算、批次／backlog及live媒體保留斷言，沒有放寬產品清理預算。Android第一次遭QA系統桌面ANR擋住，尚未進入表單，不記成功；其後修正測試工具的捲動／對話框定位與等待，完整批次exit0，未把早期失敗改記成功。既有Gemini產圖實作與素材未覆寫。

更新：2026-11-05（補記預覽恢復；驗收批次為2026-11-04）；對應 [SPEC](../specs/SPEC-001-AvatarAndPreferences.md)、[BDD](../bdd/SPEC-001-AvatarAndPreferences-BDD.md)、[TDD](../tdd/SPEC-001-AvatarAndPreferences-TDD.md)。本輪本地Web／Android責任範圍開發、逐項稽核與回歸完成；原始275項中的iOS及後續SPEC整合仍分開保留，未宣稱三平台或雲端全部驗收。歷史文件的「尚未上傳／AI／正式圖」是當時狀態，以下為本輪現況。

### 2026-11-04 本輪驗收範圍調整

使用者最新決策：無障礙專項設計、實作及驗收不納入目前整個遊戲MVP範圍（D-051），不列待補、不作完成阻擋；iOS開發／驗收則依D-052暫緩。原始規劃及歷史證據保留，不將排除或暫緩改記通過；原始275項的覆核比例不是調整範圍後的完成率，Web／Android其餘功能與故障斷言仍須逐項驗證。

「跨SPEC授權」指後續MatchingSessions的輪次／參與者、AffectionAndFeedback的雙方名片同意，以及StoryDialogueAndExit的終止狀態整合。本份依已確認SPEC只交付資料契約、分享欄位白名單及私人媒體界線；目前本人可管理／預覽，他人讀取預設拒絕。後續模組完成後再驗同輪有效同意可讀、跨輪／終止拒絕的新讀取；這項後續整合不要求在本份先實作其他SPEC。

**本輪Web／Android責任範圍**：236/236（100%）完整TDD ID已覆核；另列iOS暫緩13項、後續SPEC整合26項，均未改記通過。

## 2026-11-04 本輪結案證據

本輪 **TDD 236/236、BDD 65/65、UX 13/13**。原始索引仍保留275個TDD／73個BDD ID；iOS 13項與後續SPEC正向整合26項TDD／8項BDD另列，均沒有改記通過。AP-E2E-037／038原含iOS子斷言，本輪只驗Web／Android。各ID採完整斷言覆核，必要時組合隔離單元、真D1／R2、HTTP與實際UI證據；不以Trait或測試函式數換算需求完成。

| 最終批次 | 結果與證據邊界 |
|---|---|
| `npm run check:foundation` | **exit0，671/671**：Tools24、Unit220、API142、Integration31、Worker121、client133；兩模組typecheck通過。匿名摘要 `avatar-check-latest.json`。Foundation舊全環境報告仍為accepted=false、scopedAccepted=true，缺Google／收信／完整規劃矩陣及iOS／staging的欄位沒有被本次AP覆寫 |
| 受控供應商真整合 | `avatar-controlled-host.test.mjs` **3/3**（44.8秒）：已有1及2張時的503／429／unknown／無圖／重複圖、冪等與明確重試；1張即採用及3張回選第2張只存1正式圖、receipt重播不重增revision、重選既有正式圖；0／1照片拒絕與過期新輪。真HTTP／Application／Miniflare D1／R2，無Gemini呼叫；`avatar-controlled-host.json` |
| Web基本與隱私 | **6/6**（48.9秒）：16幅真框3:4、原生瀏覽器filechooser、超8MiB重試、照片順序／舊revision拒絕／刪除取消、成年／年齡pair／非法標籤回饋、實際UI登出重登重讀照片與角色；有效第二帳號猜已知／未知私人asset均404，只忽略不同traceId比較相同問題內容，無R2 key／URL |
| Web真Gemini四張 | 最新 **1/1**（約1.1分鐘）：第2張及第4張兩次真分頁競爭皆200／409，重播回同一結果；四張SHA互異、滿額後合法0～3契約的續產請求409、回選第2張只正式保存此圖，來源照片刪除並登出。`avatar-web-fourth-race.json`。前次送expectedProducedCount=4違反SPEC輸入範圍而得到400，是測試輸入錯誤，原exit1另存malformed-input摘要，未冒充通過 |
| Android受控矩陣 | API31專用QA **7/7**：busy連點、unavailable、no-image、429、unknown、duplicate、到期採用窗。有效候選保留、舊化身不變、無正式圖／自動續產，unknown續產停用，到期不可採用；`avatar-native-controlled.json`。只供應商受控，真正D1／R2／API，非真Gemini品質證據 |
| Android照片管理 | API31完整exit0：真picker超8MiB拒絕後有效重試、三張排序與舊revision不覆寫、刷新後排序、刪除取消／確認、五張上限及刪除後補回。QA相簿與程序生成大圖均清理；`avatar-native-managed-photos.json` |
| Android表單與重登 | API31完整exit0：Engineer及兩張壓縮照片的本人名片與未授權提示、未成年／不完整／逆序年齡不寫入、25～35合法保存、伺服器拒絕新停用標籤且revision不變、清空職業保存null、實際UI登出／登入後資料和照片重讀；`avatar-native-managed-profile.json`。輸入器修正為直接定位EditText清除舊值，並確認輸入框可見；先前失敗未記通過 |
| Android跨帳號拒絕 | API31完整exit0：真註冊第二帳號及有效Native Bearer、已知他人／未知asset皆404且無storage key／URL；Native UI登入B後無A照片或他人名片入口，A兩張照片不變；`avatar-native-privacy.json` |
| 目錄及壓縮真D1補驗 | 最大合法集合、重複／超量／未知／錯型／成對年齡與臺灣滿18歲界線；固定JSON與其他列不變。真Skia大圖／偽裝JPEG／無法壓至200KB均在D1／R2變更前拒絕；分段精確200000byte輸入不依賴Avatar／R2且不動DB；兩個競爭upload沒有第6個R2物件；停用碼僅同欄既存值可保留 |
| 最終秘密／資產／文件掃描 | 321個版本庫文字檔、17個Web輸出文字檔及462個證據文字檔的server secret命中均0；證據及47張版本庫圖片沒有原始照片直接副本；16圖SHA均對應provenance且互異；24份Markdown的960個本地連結無缺失，所有追溯行號有效。`avatar-source-scan.json`；正常`git diff --check`通過 |
| 清理失敗Web fixture | 限本次失敗批次的精確時間與ap專用前綴，經正式登入／刪照／登出API補清4個帳號、1張虛構照片；這些帳號active family為0。未更動其他資料或把清理視為原失敗測試通過 |

2026-11-04的操作狀態：Metro 8082於隔離原生測試前曾停止以釋放記憶體；當次背景及前景重啟遭自動審查以「blocked by policy」拒絕，當時尚未恢復。2026-11-05使用者要求開啟模擬器供實際驗證後，已恢復一般Metro8082（status200、packager-status:running），並將既有DatingHighQA31從無視窗模式重啟為可見的「Android Emulator - DatingHighQA31:5662」；保留App與資料，ADB5038／裝置emulator-5662連線及reverse8082完成，App已載入「歡迎回來」登入畫面，local平台8787 ready200。後續Google入口排障發現初次Metro使用EXPO_NO_DOTENV=1且沒有明確傳入公開Client ID，造成原生bundle缺少已存在於.env.local的EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID；server Android allowlist本來已包含同一ID。已正常停止原Metro並以標準命令重啟，確認Expo載入.env.local、Android bundle含設定的公開ID，模擬器畫面恢復「Sign in with Google」，原不可用提示消失。此處只確認設定及按鈕恢復，實際Google帳號授權由使用者操作，不冒充本次已完成新的真Google登入。之後的手動Google測試另發現API31映像的Google服務過舊且沒有可用Play商店，已改開既有Android36 Google Play版DatingHighQA，APK與本次build相同、Google服務26.43.30；真SDK現在明確提示裝置缺可用Google帳號，需使用者在Google Play登入。原生錯誤分類新增Red／Green及client139/139證據，詳細補記見PlatformFoundation驗證紀錄；開商店更新頁被自動審查拒絕，沒有宣稱本次真Google登入完成。這次僅恢復預覽與設定，沒有重跑或改寫上述671項歷史驗收結果；未發布SIT／production、未做Git commit。

## 已落地的流程

- 本人交友資料、版本化五類興趣／生活／擇偶目錄、臺灣18歲與Unicode驗證、revision CAS；登入Email不作公開暱稱。
- 8MiB專用照片binary入口，JPEG／PNG／WebP真解碼、方向校正、去metadata、≤200000 bytes；私人R2、pending原子配額、排序、軟刪後清實體圖及GC。
- 16款不同成年人物插畫。使用者要求依prototype.v2修正後，正式資產已全數重製成日系ADV線稿／cel shading方向。來源／prompt見 `frontend/client/assets/avatars/provenance.json`，真人測試照片未用於內建角色。
- Gemini以2～5張本人已存照片每次產1張，最多4張、可比較與回選；R2條件manifest防跨請求重複與超額。成功才加數、重播不再呼叫provider、未知用量不自動重試。候選60分鐘；確認採用只保存選中的1張正式圖並結束本輪。
- Web／原生共用資料、照片與化身畫面，第三方用途提示、未來付費／目前免費採用確認、本人名片預覽。手機固定區段導覽與儲存按鈕，預覽顯示分享標籤及照片。
- 配對／候選／名片白名單投影；跨帳號名片授權介面預設拒絕。後續SPEC的雙方同意、輪次與終止流程尚未建立，無他人名片公開路由。

## 真 Gemini 與人工品質回饋

授權來源為使用者提供的兩張本機照片；報告不收錄路徑、原始圖片、Email、token、key或Cookie。secret僅使用忽略的server設定。第一次402額度不足，使用者補額度後重跑。

1. 首版：使用者表示相似度不足。
2. 第二版：使用者確認相似度可以，但指出AI及內建人物偏離prototype風格。
3. 第三版：分開真人identity與prototype STYLE ONLY參考，採用清楚線稿、柔和cel shading與光點背景。使用者回覆「這個方向可以，繼續完成」，確認相似度／風格方向；16款內建角色同步重製。

真本地 Worker→Linux .NET→Gemini→私人R2／D1 流程：

| 驗證 | 實測結果 |
|---|---|
| 第一張即採用 | 1次真生成約16027ms；採用、正式媒體讀取、profileReady、關閉本輪通過 |
| 逐張至四張 | 耗時11608／10207／10996／13263ms，每次回1張且相同request重播不增圖；第5張409；回選第2張、正式保存、關閉本輪通過 |
| 同次照片管理 | 壓縮圖可讀且no-store／nosniff；競爭第5／6張為201／409，最多5張；刪除5張與名片排除私有資料通過 |
| Web真操作 | 最新 `avatar-gemini-live.spec.ts` 1/1通過（採用競態修正後重跑26.3秒）：兩張來源經真picker上傳、先顯示第三方用途、點擊才產1張、採用先取消再確認；切換免費角色後重新選用同一正式圖，正式圖數與生成request總數均恆1；清來源照與登出 |
| Web四張與競爭 | 六項Web整輪通過（2.2分鐘）；四張測試約1.2分鐘，兩分頁爭第2張200／409、同request重播不增圖、累積四張不同SHA-256的圖片且顯示contain、第4張後停用續產；回選第2張並確認，正式圖SHA-256與其相同，正式清單僅1張 |

2026-11-04另以相同兩張授權來源執行一次單張匿名量測：實際回報模型 `gemini-3.1-flash-image`、prompt `datinghigh-adv-portrait.v3`、10913ms；輸入1357 tokens，輸出1335 tokens，其中圖片1120 tokens；產出896×1200、276656bytes、恰1張。兩張來源保存版分別196022／83866bytes，皆移除EXIF；量測摘要 `.local/evidence/avatar-provider-metered.json` 只含白名單計數、尺寸與SHA，不保存供應商原始JSON、來源照或秘密。

依[Google官方標準費率](https://aistudio.google.com/docs/pricing#gemini-3.1-flash-image)於本次查核的輸入US$0.50／百萬tokens、文字／thinking輸出US$3／百萬、圖片輸出US$60／百萬計算：1357×0.50/10^6 + 1120×60/10^6 + (1335−1120)×3/10^6 = **約US$0.068524／這一次成功請求**。剩餘215個輸出token按文字／thinking費率估算；四次相同用量約US$0.274094，屬估算而非帳單或固定承諾。成本限制證據為單次一圖、最多四個成功索引、同帳號排他／request冪等及unknown不自動重送；失敗可能仍有供應商成本，MVP不扣使用者款。沒有存取專案帳單，未將估算標成實際扣款。

以上歷次耗時不是費用；本次補充的是實際token量測及官方費率估算。過程曾在服務重載時遇到unknown provider結果，系統保留候選並禁止自動重試；凍結平台後完整四張流程通過，沒有把失敗替換成假圖。匿名的單次測試摘要與日期可在本檔追溯，正式測試程式為 `tools/verify-avatar-live.mjs`。

## 已執行測試

下表保留歷次執行當下的結果與限制；最新完整批次以上方「本輪結案證據」為準。

| 命令／測試 | 結果與邊界 |
|---|---|
| `npm run check:foundation` | 最新完整exit0：Tools24／.NET Unit202／API142／Integration27／Worker120／client130，共645項；兩模組typecheck通過。含本人預覽／剛滿18歲與空職業、13指令不可變、候選索引及675物件多頁GC。匿名退出紀錄avatar-check-latest.json；Foundation scopedAccepted=true不等於本SPEC全部驗收 |
| 本輪定向Red／Green | 不可選正式圖誤回409的失敗案例先Red，修正400 INVALID_AVATAR_SELECTION後AvatarApplicationTests 10/10；其後補第3張無圖保留前2張讀取／採用為11/11。已有圖片重選不呼叫provider；產圖成功但發布失敗記unknown成本；已撤銷Session不允許探查資產清單 |
| 真本地Foundation bridge | `npm run test:live` 3/3；實際Worker／Container、私人儲存、Refresh寬限與重播、替換登入及較舊登出回歸通過 |
| Worker追加精確到期／已有2圖未知失敗 | `avatar-attempt-r2.integration.test.ts` 9/9；59:59可讀，60:00／60:01讀與採用410，未靠物理GC拒絕 |
| .NET共用壓縮 | 24個真Skia測試，含三種格式、精確200000 bytes多尺寸非seek分段、全部8種EXIF方向逐角核對及去metadata；128×8192高熵PNG真解碼後不能在品質下限內壓至200KB，回413且不回原檔；另有超限／像素炸彈／偽造／取消；人臉壓縮品質的獨立人工評分未取得 |
| .NET真媒體整合 | `PersonalMediaIntegrationTests.cs`：實際壓縮→HttpClient binary bridge→Miniflare D1／R2；3張上傳、排序／刪除、兩獨立client競爭配額 |
| .NET跨帳號候選／正式圖 | 新AP-IT-038測試經實際Application、AvatarCandidateStore／PrivateMediaStore與真Miniflare D1／R2；A／B均為有效帳號，B讀／採用A候選404，選用A正式圖400 INVALID_AVATAR_SELECTION、讀正式圖404；逐階段比較兩人profile／asset全部列完全相同，A仍可讀，provider始終1次。媒體整合3/3、全Integration25/25通過 |
| 讀取HTTP完整契約 | `ProfileReadContractTests` 19/19，整體API97/97；七條GET（目錄、本人資料／照片、名片預覽、媒體及候選）在Web Cookie／Android及iOS Bearer傳輸下驗目錄完整DTO、五類興趣、16 ID／path／版本、本人26欄與照片順序、no-store／ProblemDetails／撤銷／匿名／惡意query／GET body／16KiB上限；不互換Cookie／Bearer，Origin不能偽裝native。這些是HTTP層證據，不是iOS或Android UI驗收 |
| Web資料／照片／免費角色 | 最新 `avatar-preferences.spec.ts` 5/5（44.4秒），Chrome真local Cookie／API／D1／R2；16圖載入與鍵盤選用狀態、超8MiB提示後可重新上傳、空挑選取消0上傳0假成功、三張排序／revision衝突不覆寫／刪照取消與確認；含真人照欄位的本人預覽與刪後清舊預覽、reload、360px無橫向溢出及未主動生成不送出；另驗未成年／不存在日期／缺一邊及逆序年齡均提示、未送PUT，改正後空白職業null與25～35歲保存revision2 |
| Android build | `npm run build:android` exit0；實際安裝API36 x86_64專用QA emulator，原生ImagePicker／Crypto／FileSystem已入APK，Metro native bundle通過 |
| Android照片管理 | API31最新整輪exit0：真系統picker依序上傳三張虛構圖片、排序、刪除取消保留、三張確認刪除、重登API空清單，以及最後三個相簿fixture全部清理通過。匿名摘要 `.local/evidence/avatar-native-photos.json`。首次全功能後ADB rm逾時exit1及補清歷史獨立保留於avatar-native-photos-first-cleanup-timeout.json，未改寫原退出碼；TalkBack與超額／衝突原生矩陣未涵蓋 |
| Android真Gemini單張 | 2026-11-04 API31專用QA完整exit0：兩張授權來源只經本人API壓縮、不複製至模擬器相簿；原生用途說明、明確按開始後一張真圖、候選預覽、費用文案、取消保留、確認採用、目前化身、登出與重登私人正式圖／僅一張資產／本輪已關閉均通過；最後刪兩張來源並登出。匿名SHA／日期／APK見 `.local/evidence/avatar-native-gemini.json`；不是四候選或TalkBack驗收 |
| Android四候選真Gemini | API31完整exit0：四種風格及第三方用途先顯示，逐次明確點擊產4張；四張完整圖片框實測為246／245×327，符合3:4且無viewport裁切；第4張後續產停用、回選第2張selected狀態為true，取消保留再確認採用，重登後僅1張正式資產／本輪null／私人圖可讀。匿名SHA、框尺寸、日期／APK見 `.local/evidence/avatar-native-gemini-four.json`；兩張來源已刪除登出。TalkBack未驗 |
| Android圖片比例Red | 原生實際Image框寬248、高度至少797（被viewport截斷），不符合3:4；截圖顯示過長的卡片／只見部分背景。已讀本地React Native Image.android.js確認靜態source先帶入原始height，僅aspectRatio未覆寫。先以原生尺寸斷言失敗，再於內建圖style明確清除intrinsic height；原生基本流程新增實際比例斷言後整輪exit0；前端120/120與typecheck通過。這是Android實際Red／Green，不用Web替代 |
| Android基本流程 | 2026-11-04 API31 x86_64專用DatingHighQA31整項通過：原生登入、資料保存、空照片、系統picker取消、male-01選用、本人名片職業、登出；再登入以API確認暱稱／職業／生日／角色／0照片／profileReady一致。匿名摘要 `.local/evidence/avatar-native-basic.json` 含APK雜湊。之前失敗不列通過；最後驗證登入前先同程序health確認，登入mutation仍只送一次 |
| 套件漏洞 | Infrastructure含transitive NuGet查詢未報已知弱點；npm安裝audit 0弱點。這是查詢當下結果 |
| local migration／restart | 0002已套本專案default local；Wrapper重啟後ready200。未套SIT／production |
| 清理重掃競態 | 真D1／R2＋可控預算先Red再Green；新增media-cleanup.ts以ETag提交photoCursor／r2Cursor／pending頁，連續有限預算清理可前進，保留D1 tombstone |
| 跨Worker實例CAS | `avatar-worker-cas.integration.test.ts`：兩個分別打包執行的Worker runtime共用真Miniflare D1／R2，首次跨attempt排他、第4張競態、冪等重播、第5張拒絕及過期新輪通過；完整覆核AP-IT-068 |
| 採用失敗補償競態Red／Green | 同步gate在真D1／R2重現：第一筆D1失敗刪實體圖，第二筆提交後出現ready=1但formalExists=false。修正為既有媒體pending保留、條件ready提交及pending-only原子取消，失敗重試用新UUID；全Worker115/115及typecheck通過，含取消先於reserve／原family失效／ready不可取消、取消與提交並行、D1提交回覆遺失，以及R2關輪失敗後由status／begin修復receipt。未增加表／欄位或job |
| 本人資料與目錄真整合 | 新增真Application／D1／R2：Android→Web登入family替換保留19欄、interests三鍵／preferences九鍵、原profileUUID、照片與跨組免費角色；舊family401、cv不變、provider0；空職業profileReady與即時本人名片刪後更新通過。另在隔離序列測試暫停既有puzzle，讀取／改自介仍保留code／label／語意；finally恢復，未新增假歷史代碼或停用正式選項。UI先Red再補停用標示與可保留／禁止新選；相關Module Unit34/34、client130/130及新增Integration各1/1通過 |
| 化身HTTP矩陣 | `AvatarHttpContractTests` 24/24：Web Cookie、Android／iOS Bearer下200 DTO精確五鍵、每次一張、續產參數、503／429無發布、候選200／404／410／401、採用三種類型回執／400／409、原Origin與JSON限制、重播／滿額／關閉錯誤投影。只證明HTTP層，private scripted replies不冒充SQL／R2 CAS；已連結真D1／R2／Gemini補充證據 |
| 照片與停用目錄HTTP矩陣 | `PhotoHttpContractTests` 18/18及新增Profile legacy三模式3/3；使用真Skia與>16KiB虛構PNG、201四欄／200KB／MIME／尺寸、8MiB拒絕、quota／revocation／CSRF、排序失敗保持版本、204空body及私人媒體404；目錄暫停code後PUT／GET保留19欄／語意，未知／重複鍵400不改revision。含這些增補的全API142/142已在639項整體檢查內通過且整輪exit0 |
| 真本地照片傳輸 | `node --test tests/integration/avatar-http-live.test.mjs` 1/1（5.4秒），default Worker→Linux Container→D1／R2；Bearer超8MiB413、JSON仍16KiB、真Web Cookie登入、偽造Origin403且0照片、>16KiB真binary成功201、私人JPEG<=200KB/no-store/nosniff、公開command404；刪照404與空清單、登出均完成。只用虛構JPEG，不送Gemini；摘要avatar-http-live.json |
| 圖片失敗與預覽回歸 | Gemini不可解碼圖先Red（應503卻400），修正為503 IMAGE_PROVIDER_NO_IMAGE；private candidate bridge保留白名單409錯誤（重複圖／來源已變），讀取錯誤body上限4096，未知內容不反射；各3/3及5/5通過。Photo Application另9/9驗壓縮拒絕前無Repository／R2 IO、五張拒絕、撤銷分類、兩張只傳壓縮版、pending補償／獨立取消及ready回覆遺失不誤刪。前端先Red再補未成年具體提示、重複圖主動重試成本及成功變更後清除舊名片預覽；當前client130/130 |
| 候選到期確認窗Red／Green | 原本頁面已有到期timer，但已開啟的採用確認窗仍可提交。新增兩個失敗測試分別重現timer已觸發／背景延遲未觸發；到期時關閉採用窗，實際確認再核對serverNow，過期不送PUT／不自動生成。Unit定向24/24、完整client132/132與typecheck／export通過；Chrome到期視窗實測通過。這次共用UI增補後未重跑原生到期案例，不擴推Android／iOS |
| Web受控錯誤矩陣 | `avatar-expiry-ui.spec.ts` 最新6/6（40.6秒）完整exit0：到期確認窗，以及503 unavailable／uncertain、429、409 duplicate、410 expired；HTTP錯誤與候選讀取注入，真帳號／兩張虛構照片仍走local Cookie／D1／R2。驗舊化身不變、有效候選保留、到期不可採用、unknown續產停用、快轉20秒仍只一次請求；不呼叫真Gemini、不作真provider或R2 SQL證據。第一次主要斷言通過但登出測試路由寫錯造成exit1，原摘要另存；修正/session後整輪及照片／登出清理通過，失敗那五個fixture帳號已限定時間／前綴重新登入登出，active family為0 |
| 狀態與前端增補 | 既有Worker106項包含來源改變關輪、64失敗ID上限、關輪初始request不重開、Session到期／撤銷後僅允許原lease補償，及第二個有效帳號不可讀／採用他人圖；歷次client120/120及typecheck已涵蓋草稿CAS、候選到期、正式圖重選與Web輔助工具狀態；已先Red再以aria-pressed／aria-checked修正舊accessibilityState未映射 |
| 追溯工具Red／Green | Windows CRLF使原索引只保留名稱、漏掉完整要求；正規化換行並限制到下一案例／標題，275項均保留完整多行要求，Unix／Windows及三級標題回歸通過；另以實際Android鎖頭標籤補數字／十六進位XML entity單次解碼測試，未送provider的定位失敗不算AI通過；核准數仍由完整人工覆核決定 |
| 配額釋放／本人預覽 | 真Application／Miniflare D1／R2在第五／六張競爭後刪除其中一張、補入新圖，維持5張；舊圖404／再刪404、deleted不復活、其餘4張不變，當前本人名片只列5張有效圖。Unit新增保存null職業及剛滿18歲後profileReady／生日不外流，另驗預覽重讀新職業／自介／刪照及撤銷401；定向34/34通過 |
| 媒體不可變與索引 | 真D1全部13個媒體固定指令拒絕owner／kind／key／status等非法欄位；ready不可倒回pending、deleted不可復活、有效B及錯配family皆不能改A資產，兩人profile／全部asset逐列保持；D1檔25/25。真R2只允許本人已產1、2可讀，0／3／4／5及未知／他人attempt拒絕，B的R2查找key只從B身分推導；候選檔23/23及typecheck通過 |
| GC多頁積壓 | 真Miniflare D1／R2建立225張deleted照片、225張expired候選、225張到期orphan正式副本，分多次有限預算清完675物件；每輪pending最多100、四個ready或未到期物件的bytes保持，D1 tombstone保留。該檔13/13；是可控IO耗時的進度／安全證據，不是雲端長期負載測試 |
| 重試成本說明 | 逾期及未知結果原缺明確成本提示，前端先Red再補「重新嘗試可能增加第三方供應商成本；本 MVP 目前免費，不扣款。」；既有重複圖提示保留，沒有第二次送照同意窗或自動重送。client定向22/22及最新Web5/5確認 |
| BDD逐項覆核 | 17/73個業務場景的完整Given／When／Then／And已有檔案及行號證據；三平台UX仍0/13。完整275項TDD／73項BDD原始斷言均保留於追溯JSON，不因只缺iOS就抹除已具備的獨立業務證據，也不以業務測試替代iOS |
| 秘密／文件檢查 | 最新320個版本庫文字檔與17個Web文字輸出檔（其餘為圖片）檢查，server secrets命中0；20份相關Markdown的767個本地連結無缺失；47張版本庫圖片未發現兩張授權原始照片的直接副本，git diff --check通過；只輸出去敏計數，不輸出key |

## 2026-11-04 先前追加證據（各次執行當下紀錄）

- Android API31基本流程最新完整exit0：照片空狀態與用途、取消picker不報成功；逐16張量實際框為245／246×327／328，跨組選female-07及重登資料持久化通過。新摘要avatar-native-basic.json，先前版本另存before-D051。
- 停用目錄值的後端繞過先以11組失敗案例重現；修正為只能保留本人同欄位既存值，移除後不可重新加入。另驗四種跨欄同碼不可冒用及真D1兩帳號資料不變；Unit217／API142／Integration28整輪通過。沒有新增目錄代碼、表或欄位。
- Web靜態圖框先Red，height:undefined未能覆寫RNW原始高度；Web改height:auto後，最新真瀏覽器16圖框3:4及基本流程1/1通過（19.5秒）。Android保留已實測的undefined分支。
- 隔離E2eHost的受控供應商經真HTTP／Application／D1／R2，五種503／429／未知／重複故障保留兩張，重播不再呼叫供應商，未知結果維持鎖定；Node整合1/1通過（15.0秒），不作真Gemini品質證據。Android busy定向已完整通過，其餘批次以最後完整摘要為準。

## 本輪結案與範圍外事項

- 本地Web／Android責任範圍 **236/236 TDD、65/65 BDD、13/13 UX**，逐ID及證據見[索引](SPEC-001-AvatarAndPreferences-Traceability.md)與[追溯JSON](avatar-preferences-traceability.json)。
- 無障礙依D-051排除目前整個遊戲MVP，不列待補；iOS 13個TDD依D-052暫緩、不算通過。Android實證為API31專用QA，不擴推API36或其他裝置。
- 後續SPEC的有效同輪雙方同意、終止／換輪及Matching正向讀取尚未整合；本份已交付五項reader契約／白名單、本人媒體管理與跨帳號預設拒絕。26項TDD／8項BDD依原SPEC責任切分另列，不建立假授權或其他SPEC業務表。
- 雲端長期GC、SIT／production部署、正式收信及Foundation全環境Gate未在本輪發布／驗收；已有隔離真D1／R2多頁675物件清理及本地Container證據，不冒充雲端長期負載。
- Gemini實際token與耗時已量測、按官方費率估算；沒有存取專案帳單，不把估算標成實際扣款。MVP不向使用者扣款。
- Metro8082與可見Android API31模擬器已於2026-11-05恢復，App停留在登入畫面供使用者驗證；前次重啟被拒只保留為歷史操作紀錄，不代表Android沒有測試。平台8787 ready200；不擴推其他裝置或iOS。

Overview影響矩陣已檢查並同步：定位、分層、runtime、模組／相依、檔案放置、API／資料、部署／環境變數。Foundation認證政策、原六表54欄保持；本SPEC兩表24欄、零Trigger，未建立其餘SPEC業務表或假成功頁。
