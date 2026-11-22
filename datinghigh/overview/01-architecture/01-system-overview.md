# 系統概覽

DatingHigh（心動迴路）是戀愛養成交友平台，以個人資料與化身、雙向配對、雙人互動劇情及即時聊天組成主要體驗。本人名片預覽或配對成立不代表授權他人查看名片與真人照片。

本文件描述現行系統結構。需求進度、人工確認、測試結果與平台缺項由各需求的 `docs/verification/` 文件維護。

## 技術輪廓與主要模組

| 模組 | 責任 |
|---|---|
| PlatformFoundation | Email／Google 身分、密碼、Session family、登入恢復與撤銷 |
| AvatarAndPreferences | 本人資料、性別／性向、分享設定、名片預覽、私人照片、免費角色與 Gemini 化身 |
| MatchingSessions | 雙向計分、候選探索、72小時邀請、雙方確認與單場占用 |
| StoryDialogueAndExit | 版本化劇情、分支與合作互動、即時聊天、房間狀態與永久退出 |
| SceneEventFramework | 類別票決、Scene／Narrative 釘選、三來源事件、自然收尾及雙同意下一場 |
| Expo／React Native client | Web／Android 共用畫面、API client、導覽、登入恢復與場景呈現 |
| .NET 四層 | Domain 純規則、Application 用例、Infrastructure adapter、Api HTTP 傳輸 |
| Cloudflare 平台 | Worker 公開入口、API Container、Room DO、D1、私人 FILES 與獨立 STORY_CONTENT |
| 本地工具與測試 | 隔離 instance、資料 wrappers、離線素材打包、建置與平台驗證 |

## 系統資料流

登入／恢復後由 `/start` 依本人資料與目前輪次分流至 `/profile`、`/matching` 或 `/game-round/{roundId}`。候選探索由 Application 使用完整適格集合計算 `match-score-v1`，排序後分頁；接受邀請以 D1 batch 建立雙人房間及唯一占用。

`user_profiles` 是個資唯一事實來源；搜尋投影只隨配對輸入或資格改變。私人照片與生成角色保存在 FILES；免費角色的內容定址 WebP 由靜態資產供應。本人／同房五表情讀取皆經受保護的角色通道，不公開私人 R2 key。

劇情內容由 manifest 驅動，角色、鏡位、熱區、光色與音訊由共用 renderer 呈現。HTTP 與 WebSocket 命令共用 Application 用例，以 D1 提交為權威；Room DO 處理連線、presence 與通知。故事公開素材使用獨立 STORY_CONTENT，與私人媒體分離。

舞台內容可宣告 `scene-stage.v1` 的 Area 背景、鏡位與原位物件；Application 只投影本人目前鏡位及已提交演出。client 的 `EmbeddedSceneStage` 與 `ActorMotionRenderer` 分別處理幾何與 atlas 圖層，沒有生圖或權威寫入責任。正式角色入口仍採既有五表情 ready 契約；本機 Rig 審查入口與正式採用分開，範圍及證據見 [SceneEventFramework 驗證](../../docs/verification/SPEC-001-SceneEventFramework-Verification.md)。

## 儲存與內容

D1 migration 基線為 `0007_scene_event_tracks.sql`，共21張自有表、零 Trigger。Foundation 六表54欄、AvatarAndPreferences 兩表27欄的邊界保持；場景內容與執行六表共43欄，欄位與索引見 [資料契約](../03-contracts/02-data-contracts.md)。環境實際採用版本依各自 EXPECTED_MIGRATION，不能由本地升級推定雲端已部署。

正式首條內容以 `contracts/scene-event-content.json` 組合 `contracts/rain-bookshop-last-order.json`，素材在 `contracts/story-assets/`；發布為 Scene、Narrative、EventDefinition、GlobalPool 四層 immutable R2。免費角色 metadata 在 `contracts/builtin-avatar-packs.json`。發布前驗證 DSL、相依、SHA、版本與核准紀錄，已發布版本不可覆寫；首條人工 Gate 通過前不得製作其餘九條。

## 啟動點

- 前端：`frontend/client/package.json` 的 `expo-router/entry`，進入 `app/_layout.tsx` 與 `app/index.tsx`。
- API：`backend/src/DatingHigh.Api/Program.cs`。
- Worker：`cloudflare/src/index.ts`，設定在 `cloudflare/wrangler*.jsonc`。
- 本地平台：`npm run dev:platform` 呼叫 `tools/local.mjs`。
- 本地 Web：`tools/serve-web.mjs` 提供 Expo 匯出檔。

接續閱讀 [分層邊界](02-layer-boundary.md)、[執行流程](03-runtime-flow.md)、[模組地圖](04-module-map.md) 與 [相依地圖](05-dependency-map.md)。啟動方式見 [README](../../README.md)，開發原則見 [AGENTS.md](../../AGENTS.md)。
