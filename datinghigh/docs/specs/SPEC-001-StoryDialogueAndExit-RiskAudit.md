# SPEC-001-StoryDialogueAndExit — 實作前風險與缺漏稽核（RiskAudit）

**稽核日期**：2026-11-08；**目前狀態**：**Ready for well-done（規劃決策與缺漏已回寫；尚未執行任何 TDD）**。`SD-RQ-01=B`、`SD-RQ-02=A` 均已由使用者確認。
**來源**：[已確認 MVP](../requirements/MVP-001-LoveGameDatingApp.md) → [已確認 SDD](SPEC-001-StoryDialogueAndExit.md) → [BDD 79 場景](../bdd/SPEC-001-StoryDialogueAndExit-BDD.md) → [TDD 187 測試](../tdd/SPEC-001-StoryDialogueAndExit-TDD.md)。
**驗證依據**：重新讀取最新 SDD、0004 真 Schema、Matching 的 `matching-commands.ts`、架構與開發規則。並非程式碼執行通過證據；只進行規劃稽核。

## 一、需求追溯完整性

| 指標 | 結果 |
|---|---|
| 本 SPEC 可驗收條件 | 20/20 已映射 BDD；實際驗收 0/20 |
| BDD Gherkin | 79/79 都映射至少 2 個 TDD ID；實際驗收 0/79 |
| TDD 規劃案例 | 187 項：Unit 50、Integration 61、API 37、E2E 39；實際驗收 0/187 |
| 已確認產品來源 | `AC-005-01..03`、`AC-012-02..04`、`AC-020-06..07` 的終止交集；`AC-012-01` 留後續 Affection |
| 明確未交付 | 首場以外 9 個劇本、**第 2 個獨立劇本的正式啟動 API／UI／業務流程**、後續完整 OnlineGames／名片交換／好感計分、iOS（暫緩）、無障礙專項（不納入）、Housekeeping／History（未來 MVP） |

| SPEC 驗收 | Gherkin BDD | 已規劃 TDD 代表項（完整對照見 TDD） |
|---|---|---|
| `SD-AC-001` | `SD-BDD-042`、`SD-BDD-043`、`SD-BDD-068` | `SD-IT-024`、`SD-API-001`、`SD-API-029`、`SD-IT-025`、`SD-API-002`（其餘 3 項見 TDD 完整矩陣） |
| `SD-AC-002` | `SD-BDD-001`、`SD-BDD-002`、`SD-BDD-003`、`SD-BDD-004`、`SD-BDD-023`、`SD-BDD-024`、`SD-BDD-033`、`SD-BDD-034`、`SD-BDD-035`、`SD-BDD-056`、`SD-BDD-057`、`SD-BDD-074` | `SD-UT-001`、`SD-IT-001`、`SD-IT-038`、`SD-UT-002`、`SD-IT-002`（其餘 24 項見 TDD 完整矩陣） |
| `SD-AC-003` | `SD-BDD-007`、`SD-BDD-032`、`SD-BDD-055`、`SD-BDD-064` | `SD-UT-007`、`SD-ET-001`、`SD-UT-032`、`SD-ET-018`、`SD-API-014`（其餘 3 項見 TDD 完整矩陣） |
| `SD-AC-004` | `SD-BDD-008`、`SD-BDD-009`、`SD-BDD-061` | `SD-UT-008`、`SD-ET-002`、`SD-UT-009`、`SD-ET-003`、`SD-API-020`（其餘 2 項見 TDD 完整矩陣） |
| `SD-AC-005` | `SD-BDD-009`、`SD-BDD-036`、`SD-BDD-037`、`SD-BDD-044`、`SD-BDD-061`、`SD-BDD-068`、`SD-BDD-070`、`SD-BDD-076`、`SD-BDD-079` | `SD-UT-009`、`SD-ET-003`、`SD-UT-036`、`SD-IT-018`、`SD-UT-037`（其餘 16 項見 TDD 完整矩陣） |
| `SD-AC-006` | `SD-BDD-010`、`SD-BDD-011`、`SD-BDD-012`、`SD-BDD-063`、`SD-BDD-076` | `SD-UT-010`、`SD-ET-004`、`SD-UT-011`、`SD-ET-005`、`SD-UT-012`（其餘 5 項見 TDD 完整矩陣） |
| `SD-AC-007` | `SD-BDD-013`、`SD-BDD-014`、`SD-BDD-015`、`SD-BDD-064` | `SD-UT-013`、`SD-ET-007`、`SD-UT-014`、`SD-ET-008`、`SD-UT-015`（其餘 3 項見 TDD 完整矩陣） |
| `SD-AC-008` | `SD-BDD-016`、`SD-BDD-027`、`SD-BDD-028`、`SD-BDD-029`、`SD-BDD-065`、`SD-BDD-066` | `SD-UT-016`、`SD-IT-007`、`SD-ET-035`、`SD-UT-027`、`SD-ET-014`（其餘 8 項見 TDD 完整矩陣） |
| `SD-AC-009` | `SD-BDD-016`、`SD-BDD-029`、`SD-BDD-066`、`SD-BDD-067` | `SD-UT-016`、`SD-IT-007`、`SD-ET-035`、`SD-UT-029`、`SD-ET-016`（其餘 4 項見 TDD 完整矩陣） |
| `SD-AC-010` | `SD-BDD-017`、`SD-BDD-048`、`SD-BDD-049`、`SD-BDD-078` | `SD-UT-017`、`SD-ET-010`、`SD-IT-030`、`SD-API-007`、`SD-IT-031`（其餘 5 項見 TDD 完整矩陣） |
| `SD-AC-011` | `SD-BDD-017`、`SD-BDD-049`、`SD-BDD-067` | `SD-UT-017`、`SD-ET-010`、`SD-IT-031`、`SD-API-008`、`SD-API-032`（其餘 2 項見 TDD 完整矩陣） |
| `SD-AC-012` | `SD-BDD-018`、`SD-BDD-043`、`SD-BDD-050`、`SD-BDD-051`、`SD-BDD-062`、`SD-BDD-070` | `SD-UT-018`、`SD-IT-008`、`SD-IT-025`、`SD-API-002`、`SD-API-030`（其餘 11 項見 TDD 完整矩陣） |
| `SD-AC-013` | `SD-BDD-019`、`SD-BDD-030`、`SD-BDD-052`、`SD-BDD-053` | `SD-UT-019`、`SD-ET-011`、`SD-UT-030`、`SD-IT-014`、`SD-IT-034`（其餘 5 項見 TDD 完整矩陣） |
| `SD-AC-014` | `SD-BDD-010`、`SD-BDD-031`、`SD-BDD-032`、`SD-BDD-063` | `SD-UT-010`、`SD-ET-004`、`SD-UT-031`、`SD-ET-017`、`SD-UT-032`（其餘 3 項見 TDD 完整矩陣） |
| `SD-AC-015` | `SD-BDD-020` | `SD-UT-020`、`SD-ET-012`、`SD-ET-036` |
| `SD-AC-016` | `SD-BDD-002`、`SD-BDD-003`、`SD-BDD-005`、`SD-BDD-006`、`SD-BDD-025`、`SD-BDD-026`、`SD-BDD-045`、`SD-BDD-046`、`SD-BDD-056`、`SD-BDD-057`、`SD-BDD-058`、`SD-BDD-059`、`SD-BDD-060`、`SD-BDD-075`、`SD-BDD-079` | `SD-UT-002`、`SD-IT-002`、`SD-IT-039`、`SD-UT-003`、`SD-IT-003`（其餘 33 項見 TDD 完整矩陣） |
| `SD-AC-017` | `SD-BDD-001`、`SD-BDD-005`、`SD-BDD-006`、`SD-BDD-037`、`SD-BDD-038`、`SD-BDD-039`、`SD-BDD-045`、`SD-BDD-047`、`SD-BDD-072`、`SD-BDD-073`、`SD-BDD-074`、`SD-BDD-075`、`SD-BDD-076`、`SD-BDD-077`、`SD-BDD-078`、`SD-BDD-079` | `SD-UT-001`、`SD-IT-001`、`SD-IT-038`、`SD-UT-005`、`SD-IT-005`（其餘 38 項見 TDD 完整矩陣） |
| `SD-AC-018` | `SD-BDD-001`、`SD-BDD-002`、`SD-BDD-003`、`SD-BDD-033`、`SD-BDD-055`、`SD-BDD-069`、`SD-BDD-077` | `SD-UT-001`、`SD-IT-001`、`SD-IT-038`、`SD-UT-002`、`SD-IT-002`（其餘 13 項見 TDD 完整矩陣） |
| `SD-AC-019` | `SD-BDD-018`、`SD-BDD-070` | `SD-UT-018`、`SD-IT-008`、`SD-IT-037`、`SD-ET-034` |
| `SD-AC-020` | `SD-BDD-021`、`SD-BDD-022`、`SD-BDD-034`、`SD-BDD-040`、`SD-BDD-041`、`SD-BDD-053`、`SD-BDD-054`、`SD-BDD-071`、`SD-BDD-072`、`SD-BDD-073`、`SD-BDD-074`、`SD-BDD-077`、`SD-BDD-079` | `SD-UT-021`、`SD-IT-009`、`SD-UT-022`、`SD-IT-010`、`SD-IT-041`（其餘 30 項見 TDD 完整矩陣） |

**追溯結論**：20/20 項 SDD 驗收皆可對應 BDD 和 TDD，**有規劃並不等於已實作**。使用者已確認 `SD-RQ-01=B` 的多場次資料模型（本期只玩第 1 場）、`SD-RQ-02=A` 的非正式舊遊戲測資重建；兩項缺漏均已寫入 SDD／BDD／TDD。

## 二、已識別實作風險（依嚴重度）

### 高風險（10 項，均有已確認決策或技術緩解）

| ID | 已發現風險及會發生的問題 | 依據 | 決策／處置 | 規劃測試 |
|---|---|---|---|---|
| `SD-RA-01` | **已依 SD-RQ-01=B 解決規劃衝突**：`game_story_sessions` 原 `UNIQUE(round_id)` 限死單輪只能一場，現在新增 `episode_seq`、`UNIQUE(round_id,episode_seq)` 與單輪 playing 的部分唯一索引；候選與投票必須按場次隔離。**影響：若只移除 UNIQUE 而不區隔選票與節點，未來第二場仍會混資料** | SDD §2、§4.3～4.4、§5、§8 | **使用者 SD-RQ-01=B 已確認**：資料層可放多個獨立 StorySession，但本期 App、API、WS 只支援 episode=1；第 2 場候選用 events.frozen，不加表 | `SD-BDD-072～079`、`SD-UT-043～050`、`SD-IT-050～061`、`SD-API-036/037`、`SD-ET-038/039`；待 Well-Done 真測 |
| `SD-RA-02` | 既有 game_rounds 7→9 欄中的 story_offer_catalog_ids_json TEXT NOT NULL 無 DEFAULT；0004 本地資料若已有舊 Round，直接 ALTER TABLE 加欄可能失敗，不能憑空替舊 Round 釘選新劇本。**影響：非正式 DB 升級可能中斷或為了通過任意寫入假候選；更不能無授權清除資料** | §4.3、0004_matching_sessions.sql | **使用者已確認 SD-RQ-02=A（2026-11-08）**：尚未上線；實作期清除已確認非正式環境的全部舊遊戲資料及其必要關聯測資，再以新 Schema 建立測試資料；不做舊 Round 遷移；本輪不執行清除 | SD-BDD-021/022/071、SD-UT-042、SD-IT-048/049；真 D1 清除／重建／拒絕未知環境 |
| `SD-RA-03` | 現有 match.invite.resolve action=accept 多段 prepared SQL 以 changes()=1 串接；在同批加入候選、單場初始化／event 後若錯排插入，會破壞原先 changes() 保護。**影響：受邀者可能看到 accepted 但沒有完整房間，或某人仍被佔用** | §4.3、matching-commands.ts | 已有明確技術處理：維持同 batch 線性化、逐句 guard 並以真 D1 故障注入 | SD-IT-001、SD-IT-002、SD-IT-003、SD-IT-038 |
| `SD-RA-04` | 取消 Votes 專用表改存共用 game_round_events，最晚有效投票需依**同 episodeSeq** 的 actor MAX(sequence) 還原，若用整個 Round 最後事件或在 UI 端結算，邀請方決勝會錯。**影響：兩人看到不同劇本或後提交的人不當取得決定權** | §2.4、§4.3、§5 | 已按 episodeSeq＋actor 的最後有效事件及同 D1 batch 結算規劃 | SD-BDD-005/006/025/038/039、SD-IT-005/006/013/021/042/053/060 |
| `SD-RA-05` | 同事件流包含未結算投票 catalogId；HTTP events/query、WS 快照、重連補漏若回傳原始 payload，另一方會提早知道對方選項。**影響：玩家投票隱私和真實選擇獨立性被破壞** | §2.3、§5.2 | 由伺服器依 actor／round／episodeSeq／是否結算做事件投影；不能只前端隱藏 | SD-BDD-046、SD-IT-028/044/053、SD-API-005 |
| `SD-RA-06` | 投票事件做伺服器隱藏後，afterSeq／beforeSeq 的游標翻頁與 page limit 不能因此漏掉下一則合法事件或洩露隱藏 event。**影響：玩家重連無法補齊對話，或可由事件 payload 看見對方票** | §5.2 | 游標可在隱藏事件上前進但不返回敏感 payload，保持全局 sequence、episodeSeq 與授權投影一致 | SD-IT-044/056、SD-BDD-018/046 |
| `SD-RA-07` | WebSocket ticket 一次性且短效，DO Hibernation 附件是非權威；新登入撤舊 family 後舊 socket 仍可能存活。**影響：被踢下線的舊裝置可假扮本人續傳訊息** | §4.1、§4.1.2 | WS transport 每次授權需重驗並用真 D1 guard；重播票拒絕 | SD-BDD-043/050、SD-API-002/030/033 |
| `SD-RA-08` | D1 已提交但 DO 廣播失敗／Container 冷啟動，UI 若視 WS 推送為唯一真相或以新 requestId 補送會重複聊天與互動。**影響：發話看起來消失、重複扣用戶操作、不同裝置順序不一致** | §4.1、§5.2 | 事件序號、同 requestId 回查 receipt、HTTP snapshot／有界補漏 | SD-BDD-018/051/062、SD-IT-033/045、SD-API-010/035 |
| `SD-RA-09` | game_round_participants → game_active_round_claims 為既有 UNIQUE 佔用表的更名；Matching、readiness、CLI維運／所有對應測試可能仍引用舊名。**影響：正式接受、查詢、結束或本地維運可能部分失效** | §4.3、AGENTS/MatchingSessions | 更名不合併表；全入口實際查詢覆蓋、既有資料與占用 UNIQUE 回歸 | SD-BDD-022/040/054、SD-IT-010/041 |
| `SD-RA-10` | story、interaction、chat 及 end 並行時，若只先 GET 判斷 active，已結束後仍可追加合法樣貌的事件；未來名片也可能在 ended 後繼續揭露。**影響：用戶結束後仍被訊息打擾，甚至取得後續更新的真人照片** | §2.11/12、§4.3 | 在每個固定 SQL batch 中驗 active、episodeSeq、對應 Session、Claim、revision，end 與 commit 線性化 | SD-BDD-016/048/049、SD-IT-030/043/055/061 |

### 中風險（6 項；實作前規則已明確）

| ID | 已發現風險及會發生的問題 | 依據 | 決策／處置 | 規劃測試 |
|---|---|---|---|---|
| `SD-RA-11` | **第 1 場 Round 候選 JSON** 是最多三個 Catalog ID，無法以直接多欄 FK 保護每一元素；若來源合法但排名時 Publish／Retire 競態，可能指向不可玩的劇本。**影響：配對成立卻無法進場或玩家選了不完整場景** | §4.3、§5.1 | 接受同批驗 Catalog、狀態、互異與排名；未來新場候選則在共用 offers.frozen event 同批 guard，兩者均禁止回溯改動 | SD-BDD-001～004/030/033/034、SD-IT-003/052/059 |
| `SD-RA-12` | content_story_catalog 同 story_id 只允許一個 published，變更版次需保留已釘選舊 Round；沒有明確的受控發布器與 R2 hash/asset 驗證會產生破圖／失連。**影響：舊玩家載入新版錯台詞、支線不可到達或看到私人照片** | §4.3、§6.1 | immutable manifest、R2 content ACL、同劇本發布版本唯一索引與Retire時舊檔保留 | SD-BDD-019/030/052/053、SD-IT-014/034/035/046/047 |
| `SD-RA-13` | 真雙人非同步合作可能等很久，假 NPC 回覆、假已讀或逾時代答會誤導玩家。**影響：玩家以為另一方已答應或已讀，結果偏離真選擇** | §2.5～9、§6.3 | 個人探索不中斷，雙人閘門保持 pending、明確顯示來源，不加倒數處罰 | SD-BDD-010/011/012/026/031/063 |
| `SD-RA-14` | 第一個完整劇本和 MVP 的十個劇情完成度不可混算；場景圖、3:4 立繪、分支與音效若只有 intro 便勾選完成會誤報品質。**影響：玩家只玩得到片段卻顯示 MVP 已完成** | §1、§3、§6.4 | 首場完整 Gate A 技術＋Gate B 使用者實玩分別保存；其餘九場未達標不勾 | SD-BDD-007/013/014/020/064、SD-ET-036 |
| `SD-RA-15` | 原生 WebSocket 與 Cloudflare DO 是傳輸 Adapter，若把 DO ID 或 Hibernation 物件放進 Domain／UI，將來換平台仍需改寫遊戲邏輯。**影響：未來搬離 Cloudflare 時大量重寫劇情及前端** | §4.1.2、§4.2 | 固定 JSON Wire Contract／IRoundRealtimeNotifier；本期只部署一套 DO Adapter | SD-BDD-018/070、SD-UT-018、SD-IT-037 |
| `SD-RA-16` | SD-Q3 明確禁止 ended 後玩家讀聊天；History／Housekeeping 不在本 SPEC，不能因沒有保留天數就自行物理刪除。**影響：越權查舊聊天或誤刪必要的永久配對排除證據** | §2.14、§7、§9 | 本期只做存取拒絕，History/搬移/保留天數留未來 MVP | SD-BDD-017/049、SD-API-008/032、SD-ET-010/031 |

### 低風險／明確排除

- 目前 Cloudflare DO 的併發數、真實流量／費用尚無執行量測；以 TDD 容量測試作實測，不杜撰 SLA 或要求另建 SignalR。
- 正式資料保留、History、Housekeeping 不在本期規劃或開發清單。此項不列為「尚欠一個保留天數答案」，避免違反已確認範圍。
- 先本地 Web／Android 驗證，雲端正式部署／iOS 不得被本地結果冒稱已驗收。

## 三、測試覆蓋已補強及待決策缺漏

### 已於 Phase 3 納入 TDD 的關鍵風險覆蓋

| 類別 | 覆蓋要點 | TDD |
|---|---|---|
| 真 SQL accept rollback | 插入 Round、Claim、N=1 StorySession、Event 任意一段失敗都 rollback；Profile／Catalog 競態 | `SD-IT-038～040`（詳見 TDD） |
| Event 投票與重放 | A 改票、B 投票時序、最後有效事件、同 requestId 不覆寫更新票 | `SD-IT-042`、`SD-BDD-025/038/039` |
| 私人投票的伺服器投影 | WS／HTTP events、補漏游標與 next-page 保留序號又不揭露對方實際票 | `SD-BDD-046`、專項真 D1／API 測試 |
| 已提交事件遺失推播 | DO crash 後原 requestId receipt、游標同步與 exactly-once 業務效果 | `SD-BDD-051` 與補強整合測試 |
| 四新表／改名完整回歸 | 不新增 Offers／Votes；驗證 live Claim UNIQUE、Matching、local policy、API 全路徑 | `SD-BDD-021/022/040/054` 與整合測試 |
| 極端訊息／權限 | Unicode scalar 上下界、危險字元、跨 Round、Session family 撤銷、end 競態 | `SD-BDD-036/042～050` |

### 兩項缺漏均已依使用者決策補回

| 缺漏 ID | 來源 | 使用者確認的處置 | 已回寫位置及狀態 |
|---|---|---|---|
| `SD-GAP-01` | `SD-RA-01` | **已確認 B**：單輪可依序儲存多獨立劇本 Session；本期只啟動第一場，未來第二場從 episodeSeq=2 開始，不共享原場候選或選票 | **已補回 SDD §2／§4.3～4.4／§5、BDD-072～079、TDD UT-043～050／IT-050～061／API-036～037／ET-038～039**；規劃完成，待實作 |
| `SD-GAP-02` | `SD-RA-02` | **已決定**：尚未上線，舊遊戲資料不做相容轉換；僅在實作期對經確認的非正式 DatingHigh DB 清除全部舊 Round／Claim／必要關聯測資，再用新 Schema 測試 | **已回寫 BDD-071、UT-042、IT-048～049 與 SDD §4.3；已補回文件，程式碼未執行** |

## 四、實作前風險決策（兩題均已確認）

### SD-RQ-01：已確認 B（多場次 Schema、當期只啟動第 1 場）

**使用者決策（2026-11-08）**：選 B。現在於 `game_story_sessions` 增加 `episode_seq` 並將 `UNIQUE(round_id)` 調整成 `UNIQUE(round_id,episode_seq)`，同時建立「每個 Round 最多一筆 `chapter_status='playing'`」的部分唯一索引。第 1 場配對當下推薦 JSON 永遠不覆寫；未來第 2 場以上的候選由共用 `game_round_events(kind='story.episode.offers.frozen')` 記錄，選票／結算的 `payload_json` 均帶 `episodeSeq`，遊玩節點綁 `storySessionId`。不新增 Episode／Offers／Votes 實體表。

**目前玩家看得到的功能**：每輪只進行第 1 個獨立劇本，完成後繼續自由聊天和未來其他模組，不新增第二場入口。**未來擴充**：基礎多場續玩的資料結構無需再因單輪一場限制而 Migration，但仍須補 Application／API／UI 及相應真雙端驗證，不能宣稱未來所有需求一概無資料變更。

**風險緩解與測試**：`SD-BDD-072～079`、`SD-UT-043～050`、`SD-IT-050～061`、`SD-API-036～037`、`SD-ET-038～039`。第二場的資料模型可於隔離真 D1 測試，但本期公開端點與 UI 不准開始第 2 場。**狀態：已補回文件**，無待問選項。

### SD-RQ-02：已確認，尚未上線，清除舊遊戲測資直接使用新版結構

**使用者決策（2026-11-08）**：採 **A**。無需保留現有舊遊戲資料或替既有 Round 補入假 Catalog ID；在進入實作／套用本 SPEC 的新 Schema 時，針對已確認的 DatingHigh 非正式測試 DB，**清除全部舊遊戲 Round、帳號占用與必要關聯測資**，直接使用新表和新測試案例重建。

**邊界**：不是清除正式資料、未知環境或其他專案；帳號／Profile／與遊戲無關的資料不得被「清遊戲」指令波及。需要因 FK 連帶處理的邀請／事件依實際引用關係一併清理並驗證完整，不能留下舊 accepted 邀請卻無 Round 的孤兒業務狀態。此處只是**規劃授權，不在 perfect-plan 立即執行資料刪除**；不做舊版 Room 資料移植或相容層。

**測試回寫**：新增 `SD-BDD-071`、`SD-UT-042`、`SD-IT-048/049` 驗證非正式環境範圍、清除順序、交易 rollback、沒有孤兒資料，以及新 Schema 直接建立真單／雙候選 Round。

## 五、稽核結論與 perfect-plan 階段

- **Phase 2 SDD**：2026-11-08 使用者已確認；未擅自增加第 5 張表、Offers／Votes、特殊單故事開關、Housekeeping。
- **Phase 3 BDD/TDD**：79 場景、187 個待驗收 TDD ID（50 Unit／61 真 D1 Integration／37 API／39 E2E），全部尚未執行，實作驗收仍為 0%。
- **Phase 4 RiskAudit**：辨識 **10 高＋6 中** 風險，兩項需要使用者決策的 `SD-RQ-01=B` 與 `SD-RQ-02=A` 均已確認及回寫文件；其餘 14 項技術風險的設計約束及驗證項目已追溯。**無待回答的產品／資料問題**。
- **Phase 5 規劃交接**：**Ready for well-done**；兩題決策及缺漏補回，TDD 末尾完成規劃交接表及實作注意事項。**這只是可開發規劃交接，不代表程式功能或測試已通過**。
- **工作範圍**：本次只有 Markdown 規劃文件；沒有新增 SQL migration、執行刪除、修改 Runtime、建立 WebSocket 或通過任何實測。
