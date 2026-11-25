# SPEC-001-StoryDialogueAndExit — 結案風險稽核

**2026-11-25：使用者確認本 SPEC 已驗收。** 現行風險依已實作功能與既有證據收斂；取消或被取代的舊設計不再列為待辦。個別未核證技術斷言並未改為通過。

| 風險範圍 | 現行控制 | 實作／證據 |
|---|---|---|
| RA-01～06 | 分場唯一、候選原子凍結、真兩人成員、有效 Session、同意續場 | 原核證、Matching 及 SceneEventFramework |
| RA-07～10 | 標準 WS、重連 cursor、requestId、未知結果復原、結束競態與永久排除 | 原核證、story-dialogue-ui.test.tsx |
| RA-11～16 | 內容版本、素材完整性、等待不代答、正式首場、失權拒絕 | SceneEventFramework 驗證；正式多內容及雲端成本不算已核證 |
| 視覺與清理增量 | 四靜態姿態／五表情，套組載入、私人 ACL、聊天收合及清理範圍 | story-static-actors.test.tsx、avatar-static-adoption.integration.test.ts、Verification |

[結案對照及證據限制](../verification/SPEC-001-StoryDialogueAndExit-Verification.md)；[SPEC](SPEC-001-StoryDialogueAndExit.md)。
