# SPEC-001-RainBookshopV4 — TDD 測試清單

**來源**：[BDD](../bdd/SPEC-001-RainBookshopV4-BDD.md)、[SPEC](../specs/SPEC-001-RainBookshopV4.md)、[作者 JSON](../requirements/rain-bookshop-v4-draft.json)。
**狀態**：未開始；規劃已交接，待 well-done 實作。

## 開發進度總覽

整體：0/337（0%）；測試為規劃案例，不代表既有測試函式或通過數。禁止流水帳，唯一進度為本表與下方 checkbox。

| 測試層級 | 完成 | 待開始 | 狀態 |
|---|---:|---:|---|
| Unit | 0/175 | 175 | 未開始 |
| Integration | 0/57 | 57 | 未開始 |
| API | 0/18 | 18 | 未開始 |
| E2E | 0/87 | 87 | 未開始 |

里程碑：Unit → Integration → API → Web／Android E2E → Gate A → 本人 Gate B → 具名 local 清理及乾淨回歸。所有適用層級須有證據，未執行不勾選。

## Unit 測試

- [ ] **RB4-T-001** `EnterStore_Case1_VerifiesPrimaryRule`（高；RB4-BDD-001／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：兩位玩家各自釘選V4且尚未入店；動作：I點門把且A點傘桶。
  - 斷言：I與A分別到合法下一節點。

- [ ] **RB4-T-002** `EnterStore_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-001／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：兩位玩家各自釘選V4且尚未入店；動作：I點門把且A點傘桶。
  - 斷言：另一方未操作前其Track不變。

- [ ] **RB4-T-003** `EnterStore_Case3_VerifiesSideEffectFence`（高；RB4-BDD-001／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：兩位玩家各自釘選V4且尚未入店；動作：I點門把且A點傘桶。
  - 斷言：原場景融圖、門鈴與原文依角色呈現。

- [ ] **RB4-T-006** `NavigateAreas_Case1_VerifiesPrimaryRule`（高；RB4-BDD-002／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：本人可探索目前區域；動作：左右導航及小地圖選合法相鄰區。
  - 斷言：鏡位與Area依合法鄰接更新。

- [ ] **RB4-T-007** `NavigateAreas_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-002／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：本人可探索目前區域；動作：左右導航及小地圖選合法相鄰區。
  - 斷言：暖金點只示本人合法未探索或新事件。

- [ ] **RB4-T-008** `NavigateAreas_Case3_VerifiesSideEffectFence`（高；RB4-BDD-002／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：本人可探索目前區域；動作：左右導航及小地圖選合法相鄰區。
  - 斷言：不顯示平鋪移動按鈕海或漂浮星號。

- [ ] **RB4-T-011** `DiscoverObjects_Case1_VerifiesPrimaryRule`（高；RB4-BDD-003／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：本場首次進區、其後再次進同區；動作：先觀看呼吸光再長按空白與放開。
  - 斷言：首次只提示一次。

- [ ] **RB4-T-012** `DiscoverObjects_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-003／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：本場首次進區、其後再次進同區；動作：先觀看呼吸光再長按空白與放開。
  - 斷言：長按只短暫顯示合法物件輪廓。

- [ ] **RB4-T-013** `DiscoverObjects_Case3_VerifiesSideEffectFence`（高；RB4-BDD-003／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：本場首次進區、其後再次進同區；動作：先觀看呼吸光再長按空白與放開。
  - 斷言：掃視、取消或重連不提交主線。

- [ ] **RB4-T-016** `GestureFence_Case1_VerifiesPrimaryRule`（高；RB4-BDD-004／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：鏡頭縮放、手勢衝突或請求pending；動作：快速連點、滑動、拖出、取消或送舊revision。
  - 斷言：一次合法意圖最多一次提交。

- [ ] **RB4-T-017** `GestureFence_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-004／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：鏡頭縮放、手勢衝突或請求pending；動作：快速連點、滑動、拖出、取消或送舊revision。
  - 斷言：無效命中或取消不提交且物件復位。

- [ ] **RB4-T-018** `GestureFence_Case3_VerifiesSideEffectFence`（高；RB4-BDD-004／RB4-AC-001）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：鏡頭縮放、手勢衝突或請求pending；動作：快速連點、滑動、拖出、取消或送舊revision。
  - 斷言：409重新同步、未知結果只同ID查receipt。

- [ ] **RB4-T-021** `BookCatalog_Case1_VerifiesPrimaryRule`（高；RB4-BDD-005／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：20本書正式目錄可用；動作：逐一在5區開書並翻至末頁。
  - 斷言：16經典和4盲書ID、區域、素材符合原稿。

- [ ] **RB4-T-022** `BookCatalog_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-005／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：20本書正式目錄可用；動作：逐一在5區開書並翻至末頁。
  - 斷言：全文、卡片、字條、書籤與共鳴原文逐書相等。

- [ ] **RB4-T-023** `BookCatalog_Case3_VerifiesSideEffectFence`（高；RB4-BDD-005／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：20本書正式目錄可用；動作：逐一在5區開書並翻至末頁。
  - 斷言：合法預覽合回原位且不推進。

- [ ] **RB4-T-026** `BlindBook_Case1_VerifiesPrimaryRule`（高；RB4-BDD-006／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。
  - 斷言：揭封前只有合法包裝三標籤。

- [ ] **RB4-T-027** `BlindBook_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-006／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。
  - 斷言：有效揭封後才投影該書內容。

- [ ] **RB4-T-028** `BlindBook_Case3_VerifiesSideEffectFence`（高；RB4-BDD-006／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。
  - 斷言：取消／重送不誤選、不揭另一方私密書。

- [ ] **RB4-T-032** `InterestBadge_Case1_VerifiesPrimaryRule`（高；RB4-BDD-007／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：雙方有不同未公開興趣；動作：以本人身份讀書架或竄改owner。
  - 斷言：推薦貼紙只依本人已儲存興趣。

- [ ] **RB4-T-033** `InterestBadge_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-007／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：雙方有不同未公開興趣；動作：以本人身份讀書架或竄改owner。
  - 斷言：raw DTO不含對方興趣或未揭封內容。

- [ ] **RB4-T-034** `InterestBadge_Case3_VerifiesSideEffectFence`（高；RB4-BDD-007／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：雙方有不同未公開興趣；動作：以本人身份讀書架或竄改owner。
  - 斷言：越權讀取拒絕且不快取私人資料。

- [ ] **RB4-T-039** `Resonance_Case1_VerifiesPrimaryRule`（高；RB4-BDD-008／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：A選定草稿任一本書；動作：逐一選該書三項共鳴之一。
  - 斷言：只提交該書合法選項。

- [ ] **RB4-T-040** `Resonance_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-008／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：A選定草稿任一本書；動作：逐一選該書三項共鳴之一。
  - 斷言：原文內心獨白對本人呈現。

- [ ] **RB4-T-041** `Resonance_Case3_VerifiesSideEffectFence`（高；RB4-BDD-008／RB4-AC-002）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：A選定草稿任一本書；動作：逐一選該書三項共鳴之一。
  - 斷言：他人看不到未分享共鳴且預覽不等於選擇。

- [ ] **RB4-T-044** `VinylSync_Case1_VerifiesPrimaryRule`（高；RB4-BDD-009／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。
  - 斷言：共享曲目以權威版本同步。

- [ ] **RB4-T-045** `VinylSync_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-009／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。
  - 斷言：淡換及原文提示正確、不強制他方開聲音。

- [ ] **RB4-T-046** `VinylSync_Case3_VerifiesSideEffectFence`（高；RB4-BDD-009／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。
  - 斷言：背景停止播放器、回前景不自動播放。

- [ ] **RB4-T-050** `AmbientExplore_Case1_VerifiesPrimaryRule`（高；RB4-BDD-010／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：玩家等待對方主線操作；動作：查看小黑板、5則留言及阿澄3話題。
  - 斷言：所有原文及合法區域可用。

- [ ] **RB4-T-051** `AmbientExplore_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-010／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：玩家等待對方主線操作；動作：查看小黑板、5則留言及阿澄3話題。
  - 斷言：小黑板布丁伏筆保留。

- [ ] **RB4-T-052** `AmbientExplore_Case3_VerifiesSideEffectFence`（高；RB4-BDD-010／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：玩家等待對方主線操作；動作：查看小黑板、5則留言及阿澄3話題。
  - 斷言：探索不阻塞對方、非必經主線。

- [ ] **RB4-T-055** `FogWindow_Case1_VerifiesPrimaryRule`（高；RB4-BDD-011／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：窗區可見雨勢；動作：擦霧查看3階段雨勢並留下4種合法符號。
  - 斷言：擦霧純呈現不誤提交。

- [ ] **RB4-T-056** `FogWindow_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-011／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：窗區可見雨勢；動作：擦霧查看3階段雨勢並留下4種合法符號。
  - 斷言：符號由明確操作建立共享版本。

- [ ] **RB4-T-057** `FogWindow_Case3_VerifiesSideEffectFence`（高；RB4-BDD-011／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：窗區可見雨勢；動作：擦霧查看3階段雨勢並留下4種合法符號。
  - 斷言：離窗後／替換／轉場只依已確認生命週期投影。

- [ ] **RB4-T-060** `FogWitness_Case1_VerifiesPrimaryRule`（高；RB4-BDD-012／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：窗區符號存在且對方尚未見證；動作：背景讀取、同作者見證、舊符號見證及對方實際呈現。
  - 斷言：前3種不計印章。

- [ ] **RB4-T-061** `FogWitness_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-012／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：窗區符號存在且對方尚未見證；動作：背景讀取、同作者見證、舊符號見證及對方實際呈現。
  - 斷言：只接受對方在窗區對目前版本的合法見證。

- [ ] **RB4-T-062** `FogWitness_Case3_VerifiesSideEffectFence`（高；RB4-BDD-012／RB4-AC-003）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：窗區符號存在且對方尚未見證；動作：背景讀取、同作者見證、舊符號見證及對方實際呈現。
  - 斷言：成立事實保留到小票；替換／轉場／完成清可見符號。

- [ ] **RB4-T-066** `SameDifferentBook_Case1_VerifiesPrimaryRule`（高；RB4-BDD-013／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。
  - 斷言：以已提交ID比對。

- [ ] **RB4-T-067** `SameDifferentBook_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-013／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。
  - 斷言：I走iv4-04-same或diff及原文。

- [ ] **RB4-T-068** `SameDifferentBook_Case3_VerifiesSideEffectFence`（高；RB4-BDD-013／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。
  - 斷言：他人未提交時不揭露、不代選。

- [ ] **RB4-T-072** `TissueDistance_Case1_VerifiesPrimaryRule`（高；RB4-BDD-014／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。
  - 斷言：距離與原文cue依實際手勢。

- [ ] **RB4-T-073** `TissueDistance_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-014／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。
  - 斷言：A收不收面紙不等於是否聊天。

- [ ] **RB4-T-074** `TissueDistance_Case3_VerifiesSideEffectFence`（高；RB4-BDD-014／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。
  - 斷言：錯區或重送不提交額外行為。

- [ ] **RB4-T-078** `GiveSpaceReverse_Case1_VerifiesPrimaryRule`（高；RB4-BDD-015／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。
  - 斷言：I退開且A有獨立主動權。

- [ ] **RB4-T-079** `GiveSpaceReverse_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-015／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。
  - 斷言：聊書與音樂進各自原節點。

- [ ] **RB4-T-080** `GiveSpaceReverse_Case3_VerifiesSideEffectFence`（高；RB4-BDD-015／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。
  - 斷言：A保持安靜走respect/quiet、無假聊天。

- [ ] **RB4-T-084** `DeclineApproach_Case1_VerifiesPrimaryRule`（高；RB4-BDD-016／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。
  - 斷言：依草稿對應route與原文。

- [ ] **RB4-T-085** `DeclineApproach_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-016／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。
  - 斷言：拒絕不出現假聊天及不強制撮合。

- [ ] **RB4-T-086** `DeclineApproach_Case3_VerifiesSideEffectFence`（高；RB4-BDD-016／RB4-AC-004）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。
  - 斷言：安靜軌道仍能合法達導演。

- [ ] **RB4-T-090** `QuestionCard_Case1_VerifiesPrimaryRule`（高；RB4-BDD-017／RB4-AC-005）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。
  - 斷言：同場重連不重抽。

- [ ] **RB4-T-091** `QuestionCard_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-017／RB4-AC-005）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。
  - 斷言：第一份答案只本人可見。

- [ ] **RB4-T-092** `QuestionCard_Case3_VerifiesSideEffectFence`（高；RB4-BDD-017／RB4-AC-005）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。
  - 斷言：雙方提交後同時揭曉同頻／反差、到warm節點。

- [ ] **RB4-T-096** `QuestionCardGuard_Case1_VerifiesPrimaryRule`（高；RB4-BDD-018／RB4-AC-005）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：安靜軌道或他方未回答；動作：竄改題ID、他方答案、重送或提前查揭曉。
  - 斷言：拒非法操作且不變更revision。

- [ ] **RB4-T-097** `QuestionCardGuard_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-018／RB4-AC-005）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：安靜軌道或他方未回答；動作：竄改題ID、他方答案、重送或提前查揭曉。
  - 斷言：同ID同payload回原receipt、改payload409。

- [ ] **RB4-T-098** `QuestionCardGuard_Case3_VerifiesSideEffectFence`（高；RB4-BDD-018／RB4-AC-005）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：安靜軌道或他方未回答；動作：竄改題ID、他方答案、重送或提前查揭曉。
  - 斷言：quiet路不被問答阻塞。

- [ ] **RB4-T-101** `ChatSuggestions_Case1_VerifiesPrimaryRule`（高；RB4-BDD-019／RB4-AC-005）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：劇情依8個適用情境進展；動作：逐情境打開聊天、點一則或自由聊天。
  - 斷言：各情境3句原文及合法篩選。

- [ ] **RB4-T-102** `ChatSuggestions_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-019／RB4-AC-005）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：劇情依8個適用情境進展；動作：逐情境打開聊天、點一則或自由聊天。
  - 斷言：未點不發送、點擊由真人送出。

- [ ] **RB4-T-103** `ChatSuggestions_Case3_VerifiesSideEffectFence`（高；RB4-BDD-019／RB4-AC-005）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：劇情依8個適用情境進展；動作：逐情境打開聊天、點一則或自由聊天。
  - 斷言：聊天仍可用且不冒充NPC或對方。

- [ ] **RB4-T-107** `ClerkPersona_Case1_VerifiesPrimaryRule`（高；RB4-BDD-020／RB4-AC-006）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。
  - 斷言：角色分眾原文與表情正確。

- [ ] **RB4-T-108** `ClerkPersona_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-020／RB4-AC-006）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。
  - 斷言：阿澄赴入口防洪切電，不站原地觀望。

- [ ] **RB4-T-109** `ClerkPersona_Case3_VerifiesSideEffectFence`（高；RB4-BDD-020／RB4-AC-006）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。
  - 斷言：S/A×warm/quiet原文匹配且不代發真人訊息。

- [ ] **RB4-T-113** `DirectorTrigger_Case1_VerifiesPrimaryRule`（高；RB4-BDD-021／RB4-AC-007）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：I/A尚未全部達原稿warm/respect與warm/quiet；動作：兩方並行提交最後節奏點。
  - 斷言：滿足雙條件才觸發且warm必先完成提問卡。

- [ ] **RB4-T-114** `DirectorTrigger_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-021／RB4-AC-007）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：I/A尚未全部達原稿warm/respect與warm/quiet；動作：兩方並行提交最後節奏點。
  - 斷言：同場只建立一次director事件及ready。

- [ ] **RB4-T-115** `DirectorTrigger_Case3_VerifiesSideEffectFence`（高；RB4-BDD-021／RB4-AC-007）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：I/A尚未全部達原稿warm/respect與warm/quiet；動作：兩方並行提交最後節奏點。
  - 斷言：未完成彩蛋不阻塞、非按鈕觸發。

- [ ] **RB4-T-118** `StormPresentation_Case1_VerifiesPrimaryRule`（高；RB4-BDD-022／RB4-AC-007）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：伺服器已提交導演事件；動作：兩端接cue或斷線重連。
  - 斷言：原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞。

- [ ] **RB4-T-119** `StormPresentation_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-022／RB4-AC-007）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：伺服器已提交導演事件；動作：兩端接cue或斷線重連。
  - 斷言：原合法鏡位與權威世界一致。

- [ ] **RB4-T-120** `StormPresentation_Case3_VerifiesSideEffectFence`（高；RB4-BDD-022／RB4-AC-007）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：伺服器已提交導演事件；動作：兩端接cue或斷線重連。
  - 斷言：重連還原當前狀態不重播舊cue或假提交。

- [ ] **RB4-T-124** `ReadyGate_Case1_VerifiesPrimaryRule`（高；RB4-BDD-023／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。
  - 斷言：單方等待不扣秒。

- [ ] **RB4-T-125** `ReadyGate_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-023／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。
  - 斷言：雙ready原子建立唯一deadline與題組。

- [ ] **RB4-T-126** `ReadyGate_Case3_VerifiesSideEffectFence`（高；RB4-BDD-023／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。
  - 斷言：雙端同一權威倒數並顯示原文等待提示。

- [ ] **RB4-T-131** `DurationConfig_Case1_VerifiesPrimaryRule`（高；RB4-BDD-024／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：90秒正式內容與另一合法120秒測試版本；動作：發布新配置並讓新舊場次各自ready。
  - 斷言：總時長來自釘選durationSeconds不硬編碼。

- [ ] **RB4-T-132** `DurationConfig_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-024／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：90秒正式內容與另一合法120秒測試版本；動作：發布新配置並讓新舊場次各自ready。
  - 斷言：舊場次90秒、新場次120秒且不熱改deadline。

- [ ] **RB4-T-133** `DurationConfig_Case3_VerifiesSideEffectFence`（高；RB4-BDD-024／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：90秒正式內容與另一合法120秒測試版本；動作：發布新配置並讓新舊場次各自ready。
  - 斷言：無效整數、門檻越界、溢位或缺設定拒發。

- [ ] **RB4-T-136** `RescueSetPin_Case1_VerifiesPrimaryRule`（高；RB4-BDD-025／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：場次尚未抽題組；動作：種子抽選兩組各4步並重連。
  - 斷言：只釘選原兩組之一。

- [ ] **RB4-T-137** `RescueSetPin_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-025／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：場次尚未抽題組；動作：種子抽選兩組各4步並重連。
  - 斷言：每步書ID與區域、線索文字符合草稿。

- [ ] **RB4-T-138** `RescueSetPin_Case3_VerifiesSideEffectFence`（高；RB4-BDD-025／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：場次尚未抽題組；動作：種子抽選兩組各4步並重連。
  - 斷言：重連／重送不重抽且不向未授權方回完整解答。

- [ ] **RB4-T-141** `RescueSteps_Case1_VerifiesPrimaryRule`（高；RB4-BDD-026／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。
  - 斷言：權威狀態依角色與步驟轉移。

- [ ] **RB4-T-142** `RescueSteps_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-026／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。
  - 斷言：只有合法完整上架計1本。

- [ ] **RB4-T-143** `RescueSteps_Case3_VerifiesSideEffectFence`（高；RB4-BDD-026／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。
  - 斷言：原文成功回饋、無危險入口操作。

- [ ] **RB4-T-147** `ReverseClues_Case1_VerifiesPrimaryRule`（高；RB4-BDD-027／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。
  - 斷言：反轉線索只合法分享才揭露。

- [ ] **RB4-T-148** `ReverseClues_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-027／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。
  - 斷言：第3本下層、第4本完整鎖扣才增加計數。

- [ ] **RB4-T-149** `ReverseClues_Case3_VerifiesSideEffectFence`（高；RB4-BDD-027／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。
  - 斷言：兩組原文toast及合法結果完整。

- [ ] **RB4-T-153** `WrongRescue_Case1_VerifiesPrimaryRule`（高；RB4-BDD-028／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。
  - 斷言：錯書／槽／扣原文回饋。

- [ ] **RB4-T-154** `WrongRescue_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-028／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。
  - 斷言：不增加rescuedCount、不接受不合法持物或轉移。

- [ ] **RB4-T-155** `WrongRescue_Case3_VerifiesSideEffectFence`（高；RB4-BDD-028／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。
  - 斷言：UI復位，合法後續仍可完成。

- [ ] **RB4-T-159** `QuickCallouts_Case1_VerifiesPrimaryRule`（高；RB4-BDD-029／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。
  - 斷言：只顯示本人合法原文。

- [ ] **RB4-T-160** `QuickCallouts_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-029／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。
  - 斷言：明確點擊才發舞台泡泡。

- [ ] **RB4-T-161** `QuickCallouts_Case3_VerifiesSideEffectFence`（高；RB4-BDD-029／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。
  - 斷言：不寫假真人聊天、不洩未分享答案。

- [ ] **RB4-T-165** `WaterStages_Case1_VerifiesPrimaryRule`（高；RB4-BDD-030／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。
  - 斷言：各水位階段及原文播報正確。

- [ ] **RB4-T-166** `WaterStages_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-030／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。
  - 斷言：過期cue不重播、畫面ceil秒數一致。

- [ ] **RB4-T-167** `WaterStages_Case3_VerifiesSideEffectFence`（高；RB4-BDD-030／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。
  - 斷言：client改時鐘不影響D1 deadline。

- [ ] **RB4-T-171** `PauseIdle_Case1_VerifiesPrimaryRule`（高；RB4-BDD-031／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。
  - 斷言：未達15秒不暫緩、達門檻暫緩。

- [ ] **RB4-T-172** `PauseIdle_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-031／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。
  - 斷言：ping不更新有效活動。

- [ ] **RB4-T-173** `PauseIdle_Case3_VerifiesSideEffectFence`（高；RB4-BDD-031／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。
  - 斷言：保存剩餘時間且原稿暫緩提示正確。

- [ ] **RB4-T-177** `PauseReconnect_Case1_VerifiesPrimaryRule`（高；RB4-BDD-032／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。
  - 斷言：自動恢復且不要求確認按鈕。

- [ ] **RB4-T-178** `PauseReconnect_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-032／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。
  - 斷言：保存剩餘時間、無次數上限、不補扣暫緩秒。

- [ ] **RB4-T-179** `PauseReconnect_Case3_VerifiesSideEffectFence`（高；RB4-BDD-032／RB4-AC-008）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。
  - 斷言：重連／冷啟動不重設90秒。

- [ ] **RB4-T-184** `DeadlineRace_Case1_VerifiesPrimaryRule`（高；RB4-BDD-033／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：最後一本只差合法封箱；動作：在deadline-1、deadline、deadline+1ms與timeout競態提交。
  - 斷言：嚴格早於deadline完成才S。

- [ ] **RB4-T-185** `DeadlineRace_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-033／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：最後一本只差合法封箱；動作：在deadline-1、deadline、deadline+1ms與timeout競態提交。
  - 斷言：等於或晚於deadline拒操作，先按現有已救數結算。

- [ ] **RB4-T-186** `DeadlineRace_Case3_VerifiesSideEffectFence`（高；RB4-BDD-033／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：最後一本只差合法封箱；動作：在deadline-1、deadline、deadline+1ms與timeout競態提交。
  - 斷言：真D1原子交易只有一結果、同receipt不重複。

- [ ] **RB4-T-189** `GradeS_Case1_VerifiesPrimaryRule`（高；RB4-BDD-034／RB4-AC-009）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：4本在期限內完成；動作：伺服器提交最後合法封箱。
  - 斷言：立即S不等歸零。

- [ ] **RB4-T-190** `GradeS_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-034／RB4-AC-009）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：4本在期限內完成；動作：伺服器提交最後合法封箱。
  - 斷言：播放原文及布丁演出。

- [ ] **RB4-T-191** `GradeS_Case3_VerifiesSideEffectFence`（高；RB4-BDD-034／RB4-AC-009）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：4本在期限內完成；動作：伺服器提交最後合法封箱。
  - 斷言：走書籤／最終意願而非屋簷。

- [ ] **RB4-T-195** `GradeA_Case1_VerifiesPrimaryRule`（高；RB4-BDD-035／RB4-AC-009）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。
  - 斷言：A結算且停止救書。

- [ ] **RB4-T-196** `GradeA_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-035／RB4-AC-009）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。
  - 斷言：原文退至高處、拿鐵及毛巾。

- [ ] **RB4-T-197** `GradeA_Case3_VerifiesSideEffectFence`（高；RB4-BDD-035／RB4-AC-009）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。
  - 斷言：走書籤／最終意願。

- [ ] **RB4-T-201** `GradeB_Case1_VerifiesPrimaryRule`（高；RB4-BDD-036／RB4-AC-009）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：到期已救0或1本；動作：系統結算。
  - 斷言：B直接ev4-04-eaves-shelter。

- [ ] **RB4-T-202** `GradeB_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-036／RB4-AC-009）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：到期已救0或1本；動作：系統結算。
  - 斷言：停止救書且不可再進危險區或提交。

- [ ] **RB4-T-203** `GradeB_Case3_VerifiesSideEffectFence`（高；RB4-BDD-036／RB4-AC-009）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：到期已救0或1本；動作：系統結算。
  - 斷言：屋簷原文與專用鏡位，不走書籤或wish。

- [ ] **RB4-T-207** `AlarmRecovery_Case1_VerifiesPrimaryRule`（高；RB4-BDD-037／RB4-AC-009）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：nonce清理、deadline、idle alarm競爭或DO重啟；動作：模擬重複alarm、通知遺失、D1/R2故障及GET補償。
  - 斷言：最早到期不被新nonce覆蓋。

- [ ] **RB4-T-208** `AlarmRecovery_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-037／RB4-AC-009）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：nonce清理、deadline、idle alarm競爭或DO重啟；動作：模擬重複alarm、通知遺失、D1/R2故障及GET補償。
  - 斷言：舊session/generation無副作用，合法結果一次提交。

- [ ] **RB4-T-209** `AlarmRecovery_Case3_VerifiesSideEffectFence`（高；RB4-BDD-037／RB4-AC-009）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：nonce清理、deadline、idle alarm競爭或DO重啟；動作：模擬重複alarm、通知遺失、D1/R2故障及GET補償。
  - 斷言：故障保留權威狀態、503後重試恢復。

- [ ] **RB4-T-212** `Bookmark_Case1_VerifiesPrimaryRule`（高；RB4-BDD-038／RB4-AC-010）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。
  - 斷言：沿用草稿原句與本人短語。

- [ ] **RB4-T-213** `Bookmark_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-038／RB4-AC-010）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。
  - 斷言：未合法公開前對方看不到。

- [ ] **RB4-T-214** `Bookmark_Case3_VerifiesSideEffectFence`（高；RB4-BDD-038／RB4-AC-010）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。
  - 斷言：留書結局可原位翻對方已授權書籤。

- [ ] **RB4-T-219** `BookmarkValidation_Case1_VerifiesPrimaryRule`（高；RB4-BDD-039／RB4-AC-010）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：書籤操作可用；動作：送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note。
  - 斷言：非法輸入400且無寫入。

- [ ] **RB4-T-220** `BookmarkValidation_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-039／RB4-AC-010）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：書籤操作可用；動作：送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note。
  - 斷言：0與20合法及emoji scalar一致。

- [ ] **RB4-T-221** `BookmarkValidation_Case3_VerifiesSideEffectFence`（高；RB4-BDD-039／RB4-AC-010）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：書籤操作可用；動作：送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note。
  - 斷言：其他params仍為嚴格ID，禁止任意文字。

- [ ] **RB4-T-224** `WishMatrix_Case1_VerifiesPrimaryRule`（高；RB4-BDD-040／RB4-AC-010）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。
  - 斷言：兩人keep-talking才ev4-01。

- [ ] **RB4-T-225** `WishMatrix_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-040／RB4-AC-010）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。
  - 斷言：無quiet且至少一share-books才ev4-02。

- [ ] **RB4-T-226** `WishMatrix_Case3_VerifiesSideEffectFence`（高；RB4-BDD-040／RB4-AC-010）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。
  - 斷言：任一quiet即ev4-03；第一份未揭露。

- [ ] **RB4-T-230** `EndingArt_Case1_VerifiesPrimaryRule`（高；RB4-BDD-041／RB4-AC-010）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：四種結局各已合法提交；動作：看場景光色、距離、原文、互動並重連。
  - 斷言：四結局各自正式鏡位與素材。

- [ ] **RB4-T-231** `EndingArt_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-041／RB4-AC-010）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：四種結局各已合法提交；動作：看場景光色、距離、原文、互動並重連。
  - 斷言：S/A對應致謝與書籤，B專屬屋簷。

- [ ] **RB4-T-232** `EndingArt_Case3_VerifiesSideEffectFence`（高；RB4-BDD-041／RB4-AC-010）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：四種結局各已合法提交；動作：看場景光色、距離、原文、互動並重連。
  - 斷言：重連不退回結局前，不出現規格文字。

- [ ] **RB4-T-236** `ReceiptTitle_Case1_VerifiesPrimaryRule`（高；RB4-BDD-042／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。
  - 斷言：S_fast >=30000、其餘S_normal。

- [ ] **RB4-T-237** `ReceiptTitle_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-042／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。
  - 斷言：A/B稱號原文符合草稿。

- [ ] **RB4-T-238** `ReceiptTitle_Case3_VerifiesSideEffectFence`（高；RB4-BDD-042／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。
  - 斷言：書、黑膠、救援統計及阿澄附註只來自已提交事實。

- [ ] **RB4-T-242** `ReceiptCollection_Case1_VerifiesPrimaryRule`（高；RB4-BDD-043／RB4-AC-011）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：同Round含重複V4結局、其他pair、其他Round、V3與未完成；動作：完成本場並生成X/4。
  - 斷言：當前V4同版已完成不同結局含本場。

- [ ] **RB4-T-243** `ReceiptCollection_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-043／RB4-AC-011）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：同Round含重複V4結局、其他pair、其他Round、V3與未完成；動作：完成本場並生成X/4。
  - 斷言：其他Round/pair/版本或未完成不計。

- [ ] **RB4-T-244** `ReceiptCollection_Case3_VerifiesSideEffectFence`（高；RB4-BDD-043／RB4-AC-011）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：同Round含重複V4結局、其他pair、其他Round、V3與未完成；動作：完成本場並生成X/4。
  - 斷言：重播不重複累計且0..4有界。

- [ ] **RB4-T-247** `ReceiptBadges_Case1_VerifiesPrimaryRule`（高；RB4-BDD-044／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。
  - 斷言：各印章只對應原稿條件。

- [ ] **RB4-T-248** `ReceiptBadges_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-044／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。
  - 斷言：不成立不顯示、重送不重複。

- [ ] **RB4-T-249** `ReceiptBadges_Case3_VerifiesSideEffectFence`（高；RB4-BDD-044／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。
  - 斷言：小票無真實姓名、Email、照片、私密Profile或未授權內容。

- [ ] **RB4-T-253** `NaturalCompletion_Case1_VerifiesPrimaryRule`（高；RB4-BDD-045／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。
  - 斷言：不額外要求完成按鈕或支線。

- [ ] **RB4-T-254** `NaturalCompletion_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-045／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。
  - 斷言：聊天仍可用；雙方同意才建新場。

- [ ] **RB4-T-255** `NaturalCompletion_Case3_VerifiesSideEffectFence`（高；RB4-BDD-045／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。
  - 斷言：新場釘選合法版本、舊投影與cue清除。

- [ ] **RB4-T-260** `SafeExit_Case1_VerifiesPrimaryRule`（高；RB4-BDD-046／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：ready/running/paused/settled/completed任一階段；動作：一方確認退出並與救書或alarm競態。
  - 斷言：退出不受倒數或素材故障阻塞。

- [ ] **RB4-T-261** `SafeExit_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-046／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：ready/running/paused/settled/completed任一階段；動作：一方確認退出並與救書或alarm競態。
  - 斷言：解除占用、終止權限且pair排除。

- [ ] **RB4-T-262** `SafeExit_Case3_VerifiesSideEffectFence`（高；RB4-BDD-046／RB4-AC-011）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：ready/running/paused/settled/completed任一階段；動作：一方確認退出並與救書或alarm競態。
  - 斷言：無後續訊息／操作／私有圖或舊cue。

- [ ] **RB4-T-267** `StrictTransport_Case1_VerifiesPrimaryRule`（高；RB4-BDD-047／RB4-AC-012）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：有效及失效帳號、HTTP/WS相同操作；動作：送正確payload、偽造role/time、錯revision、重複ID與失權。
  - 斷言：兩transport同規則與receipt。

- [ ] **RB4-T-268** `StrictTransport_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-047／RB4-AC-012）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：有效及失效帳號、HTTP/WS相同操作；動作：送正確payload、偽造role/time、錯revision、重複ID與失權。
  - 斷言：400/401/403/409/503依既有契約，無狀態異動。

- [ ] **RB4-T-269** `StrictTransport_Case3_VerifiesSideEffectFence`（高；RB4-BDD-047／RB4-AC-012）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：有效及失效帳號、HTTP/WS相同操作；動作：送正確payload、偽造role/time、錯revision、重複ID與失權。
  - 斷言：拒公開system reconcile、raw manifest與私人key。

- [ ] **RB4-T-272** `AssetReadiness_Case1_VerifiesPrimaryRule`（高；RB4-BDD-048／RB4-AC-012）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready；動作：載入、恢復與點擊。
  - 斷言：fail closed，不以placeholder冒充。

- [ ] **RB4-T-273** `AssetReadiness_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-048／RB4-AC-012）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready；動作：載入、恢復與點擊。
  - 斷言：保留可用聊天/退出及重讀、現有錯誤碼。

- [ ] **RB4-T-274** `AssetReadiness_Case3_VerifiesSideEffectFence`（高；RB4-BDD-048／RB4-AC-012）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready；動作：載入、恢復與點擊。
  - 斷言：恢復原版且不重抽、不呼叫Gemini。

- [ ] **RB4-T-279** `AvatarReuse_Case1_VerifiesPrimaryRule`（高；RB4-BDD-049／RB4-AC-012）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：16免費角色及既有ready AI套組；動作：切換4姿態5表情、重連與失權。
  - 斷言：保持已核准身份／外觀、資產共用。

- [ ] **RB4-T-280** `AvatarReuse_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-049／RB4-AC-012）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：16免費角色及既有ready AI套組；動作：切換4姿態5表情、重連與失權。
  - 斷言：切換或重連不重產。

- [ ] **RB4-T-281** `AvatarReuse_Case3_VerifiesSideEffectFence`（高；RB4-BDD-049／RB4-AC-012）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：16免費角色及既有ready AI套組；動作：切換4姿態5表情、重連與失權。
  - 斷言：失權清圖；真provider證據與回放分開。

- [ ] **RB4-T-285** `PlatformPerformance_Case1_VerifiesPrimaryRule`（高；RB4-BDD-050／RB4-AC-012）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：正式V4完整資產、Web與Android現有驗收裝置；動作：連續探索、翻書、倒數、背景與重連。
  - 斷言：記錄載入／操作延遲／記憶體／動畫對V3基線。

- [ ] **RB4-T-286** `PlatformPerformance_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-050／RB4-AC-012）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：正式V4完整資產、Web與Android現有驗收裝置；動作：連續探索、翻書、倒數、背景與重連。
  - 斷言：離開與失權清資源且有界快取。

- [ ] **RB4-T-287** `PlatformPerformance_Case3_VerifiesSideEffectFence`（高；RB4-BDD-050／RB4-AC-012）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：正式V4完整資產、Web與Android現有驗收裝置；動作：連續探索、翻書、倒數、背景與重連。
  - 斷言：無實測不得標Gate A通過。

- [ ] **RB4-T-291** `GateA_Case1_VerifiesPrimaryRule`（高；RB4-BDD-051／RB4-AC-012）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：V4正式候選與真環境測試；動作：核對全部AC、兩題組、四結局及必要平台。
  - 斷言：真D1/R2/DO與HTTP/WS有精確證據。

- [ ] **RB4-T-292** `GateA_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-051／RB4-AC-012）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：V4正式候選與真環境測試；動作：核對全部AC、兩題組、四結局及必要平台。
  - 斷言：Web/Android及素材/內容/權限/效能逐項核對。

- [ ] **RB4-T-293** `GateA_Case3_VerifiesSideEffectFence`（高；RB4-BDD-051／RB4-AC-012）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：V4正式候選與真環境測試；動作：核對全部AC、兩題組、四結局及必要平台。
  - 斷言：未驗或失敗不得以局部測試通過代簽。

- [ ] **RB4-T-296** `CleanupScope_Case1_VerifiesPrimaryRule`（高；RB4-BDD-053／RB4-AC-013）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：Gate B已核准且已知local停寫；動作：預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境。
  - 斷言：不明環境／未授權／無備份拒清理。

- [ ] **RB4-T-297** `CleanupScope_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-053／RB4-AC-013）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：Gate B已核准且已知local停寫；動作：預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境。
  - 斷言：精確Round/Session/Invitation/claim/event/catalog及R2引用清單。

- [ ] **RB4-T-298** `CleanupScope_Case3_VerifiesSideEffectFence`（高；RB4-BDD-053／RB4-AC-013）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：Gate B已核准且已知local停寫；動作：預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境。
  - 斷言：保護帳號、個資、化身與其他故事或資產。

- [ ] **RB4-T-300** `CleanupAtomicity_Case1_VerifiesPrimaryRule`（高；RB4-BDD-054／RB4-AC-013）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：已確認清理範圍與備份；動作：故障注入D1交易或R2清理並重試。
  - 斷言：FK依賴及保護指紋正確、無孤兒。

- [ ] **RB4-T-301** `CleanupAtomicity_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-054／RB4-AC-013）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：已確認清理範圍與備份；動作：故障注入D1交易或R2清理並重試。
  - 斷言：測試pair排除與占用不殘留。

- [ ] **RB4-T-302** `CleanupAtomicity_Case3_VerifiesSideEffectFence`（高；RB4-BDD-054／RB4-AC-013）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：已確認清理範圍與備份；動作：故障注入D1交易或R2清理並重試。
  - 斷言：R2只刪無剩餘引用、故障可補償且不假成功。

- [ ] **RB4-T-304** `CleanReplay_Case1_VerifiesPrimaryRule`（高；RB4-BDD-055／RB4-AC-014）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。
  - 斷言：舊版不可選、無舊SHA或歷史恢復。

- [ ] **RB4-T-305** `CleanReplay_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-055／RB4-AC-014）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。
  - 斷言：V4完整可玩、配對/聊天/退出維持。

- [ ] **RB4-T-306** `CleanReplay_Case3_VerifiesSideEffectFence`（高；RB4-BDD-055／RB4-AC-014）
  - 位置：`frontend/client/tests/unit/scene-event-v4.test.tsx 或 backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs（按責任）`
  - 前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。
  - 斷言：所有Gate證據齊全才可結案與進下一SPEC。

- [ ] **RB4-T-310** `AuthorIntegrity_Case1_VerifiesPrimaryRule`（高；RB4-BDD-056／RB4-AC-015）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：完整原始JSON與編譯的正式v3內容；動作：逐JSON path/ID比較並注入缺字、標點改動、缺ID與placeholder。
  - 斷言：28節點9個人binding、全部書與模組原文逐項保留。

- [ ] **RB4-T-311** `AuthorIntegrity_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-056／RB4-AC-015）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：完整原始JSON與編譯的正式v3內容；動作：逐JSON path/ID比較並注入缺字、標點改動、缺ID與placeholder。
  - 斷言：合法技術轉換可逆、未知條件/內容差異拒發。

- [ ] **RB4-T-312** `AuthorIntegrity_Case3_VerifiesSideEffectFence`（高；RB4-BDD-056／RB4-AC-015）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：完整原始JSON與編譯的正式v3內容；動作：逐JSON path/ID比較並注入缺字、標點改動、缺ID與placeholder。
  - 斷言：原稿SHA不被覆寫，經確認例外才調整基準。

- [ ] **RB4-T-314** `PublisherVersion_Case1_VerifiesPrimaryRule`（高；RB4-BDD-057／RB4-AC-015）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：既有V3釘選與新V4正式內容；動作：測v2/v3 parser、SHA不符、缺asset、非法DSL及版本發布。
  - 斷言：舊場次維持原SHA、v4新版本不可變。

- [ ] **RB4-T-315** `PublisherVersion_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-057／RB4-AC-015）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：既有V3釘選與新V4正式內容；動作：測v2/v3 parser、SHA不符、缺asset、非法DSL及版本發布。
  - 斷言：v3拒任意腳本或未知型別，D1/R2失敗不發布。

- [ ] **RB4-T-316** `PublisherVersion_Case3_VerifiesSideEffectFence`（高；RB4-BDD-057／RB4-AC-015）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：既有V3釘選與新V4正式內容；動作：測v2/v3 parser、SHA不符、缺asset、非法DSL及版本發布。
  - 斷言：正式索引僅合法內容且Gate B前保留舊版讀取。

- [ ] **RB4-T-318** `Reachability_Case1_VerifiesPrimaryRule`（高；RB4-BDD-058／RB4-AC-015）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：編譯完整草稿及有限狀態模型；動作：遍歷全部節點、角色、題組、問答、拒絕及結局。
  - 斷言：28節點與4結局可達、兩方不死鎖。

- [ ] **RB4-T-319** `Reachability_Case2_VerifiesBoundaryOrProjection`（高；RB4-BDD-058／RB4-AC-015）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：編譯完整草稿及有限狀態模型；動作：遍歷全部節點、角色、題組、問答、拒絕及結局。
  - 斷言：同一合法狀態唯一結局、B優先安全結束。

- [ ] **RB4-T-320** `Reachability_Case3_VerifiesSideEffectFence`（高；RB4-BDD-058／RB4-AC-015）
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs 或 cloudflare/tests/scene-event-track-content.test.ts（按責任）`
  - 前置：編譯完整草稿及有限狀態模型；動作：遍歷全部節點、角色、題組、問答、拒絕及結局。
  - 斷言：不得拆除既有graph/JSON/資產guard來冒充通過。

### Unit 風險稽核補強

- [ ] **RB4-T-322** `Resume_IdleRoleReturns_AutomaticallyRestartsClock`（高；RB4-BDD-031／RB4-AC-008；G01）
  - 來源：RA-01／BDD031–032；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G01。
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`。
  - 前置／動作：暫緩中單方／雙方閒置或斷線；執行首次合法操作或返回可操作畫面。
  - 斷言：暫緩狀態仍可核證重新參與；不以ping解除；不要求另按恢復；仍活動方不用再操作，雙方皆閒置須各自重新參與；首次恢復操作不計救書成果。

- [ ] **RB4-T-327** `Compile_DurationThresholdMismatch_RejectsPublication`（高；RB4-BDD-024／RB4-AC-008；G06）
  - 來源：RA-03／BDD024/030/042；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G06。
  - 位置：`cloudflare/tests/scene-event-track-content.test.ts`。
  - 前置／動作：編譯90／120及缺值、0、負數、非整數、溢位、水位或稱號門檻越界、數字文案不一致的內容。
  - 斷言：正整數、溢位、0／負數、75門檻越界、數字文案一致；90及120合法；有效版本可發布；無效設定拒發，門檻及時間全部取同一釘選配置。

- [ ] **RB4-T-329** `Compile_SetARepeatedArea_PreservesFourTargets`（高；RB4-BDD-025／RB4-AC-008；G08）
  - 來源：RA-04／BDD025/056；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G08。
  - 位置：`cloudflare/tests/scene-event-track-content.test.ts`。
  - 前置／動作：編譯原始兩題組並驗證每本實際取書位置與原稿。
  - 斷言：set A 的 shelves 兩本各自正確位置，set B 四Area，不任意移書或改原文；A第1、3本在shelves不同位置，B原四Area；四本均可達，不移書、不改字。

- [ ] **RB4-T-330** `Lock_WrongOrder_RetryWithoutLosingStoredBooks`（高；RB4-BDD-028／RB4-AC-008；G09）
  - 來源：RA-05／BDD027/028；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G09。
  - 位置：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`。
  - 前置／動作：已放書且部分扣件完成；依各錯序及合法順序重試。
  - 斷言：錯扣重置鎖扣而非已救數或已放置書，正確序列才完成；只重置鎖扣index至0；已放書、已救數不變，沒有額外時間扣除，成功只計一次。

## Integration 測試

- [ ] **RB4-T-029** `BlindBook_RealDependencies_PreservesContract`（高；RB4-BDD-006／RB4-AC-002）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。
  - 斷言：揭封前只有合法包裝三標籤；有效揭封後才投影該書內容；取消／重送不誤選、不揭另一方私密書；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-035** `InterestBadge_RealDependencies_PreservesContract`（高；RB4-BDD-007／RB4-AC-002）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：雙方有不同未公開興趣；動作：以本人身份讀書架或竄改owner。
  - 斷言：推薦貼紙只依本人已儲存興趣；raw DTO不含對方興趣或未揭封內容；越權讀取拒絕且不快取私人資料；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-047** `VinylSync_RealDependencies_PreservesContract`（高；RB4-BDD-009／RB4-AC-003）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。
  - 斷言：共享曲目以權威版本同步；淡換及原文提示正確、不強制他方開聲音；背景停止播放器、回前景不自動播放；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-063** `FogWitness_RealDependencies_PreservesContract`（高；RB4-BDD-012／RB4-AC-003）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：窗區符號存在且對方尚未見證；動作：背景讀取、同作者見證、舊符號見證及對方實際呈現。
  - 斷言：前3種不計印章；只接受對方在窗區對目前版本的合法見證；成立事實保留到小票；替換／轉場／完成清可見符號；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-069** `SameDifferentBook_RealDependencies_PreservesContract`（高；RB4-BDD-013／RB4-AC-004）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。
  - 斷言：以已提交ID比對；I走iv4-04-same或diff及原文；他人未提交時不揭露、不代選；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-075** `TissueDistance_RealDependencies_PreservesContract`（高；RB4-BDD-014／RB4-AC-004）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。
  - 斷言：距離與原文cue依實際手勢；A收不收面紙不等於是否聊天；錯區或重送不提交額外行為；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-081** `GiveSpaceReverse_RealDependencies_PreservesContract`（高；RB4-BDD-015／RB4-AC-004）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。
  - 斷言：I退開且A有獨立主動權；聊書與音樂進各自原節點；A保持安靜走respect/quiet、無假聊天；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-087** `DeclineApproach_RealDependencies_PreservesContract`（高；RB4-BDD-016／RB4-AC-004）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。
  - 斷言：依草稿對應route與原文；拒絕不出現假聊天及不強制撮合；安靜軌道仍能合法達導演；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-093** `QuestionCard_RealDependencies_PreservesContract`（高；RB4-BDD-017／RB4-AC-005）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。
  - 斷言：同場重連不重抽；第一份答案只本人可見；雙方提交後同時揭曉同頻／反差、到warm節點；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-099** `QuestionCardGuard_RealDependencies_PreservesContract`（高；RB4-BDD-018／RB4-AC-005）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：安靜軌道或他方未回答；動作：竄改題ID、他方答案、重送或提前查揭曉。
  - 斷言：拒非法操作且不變更revision；同ID同payload回原receipt、改payload409；quiet路不被問答阻塞；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-104** `ChatSuggestions_RealDependencies_PreservesContract`（高；RB4-BDD-019／RB4-AC-005）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：劇情依8個適用情境進展；動作：逐情境打開聊天、點一則或自由聊天。
  - 斷言：各情境3句原文及合法篩選；未點不發送、點擊由真人送出；聊天仍可用且不冒充NPC或對方；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-110** `ClerkPersona_RealDependencies_PreservesContract`（高；RB4-BDD-020／RB4-AC-006）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。
  - 斷言：角色分眾原文與表情正確；阿澄赴入口防洪切電，不站原地觀望；S/A×warm/quiet原文匹配且不代發真人訊息；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-116** `DirectorTrigger_RealDependencies_PreservesContract`（高；RB4-BDD-021／RB4-AC-007）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：I/A尚未全部達原稿warm/respect與warm/quiet；動作：兩方並行提交最後節奏點。
  - 斷言：滿足雙條件才觸發且warm必先完成提問卡；同場只建立一次director事件及ready；未完成彩蛋不阻塞、非按鈕觸發；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-121** `StormPresentation_RealDependencies_PreservesContract`（高；RB4-BDD-022／RB4-AC-007）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：伺服器已提交導演事件；動作：兩端接cue或斷線重連。
  - 斷言：原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；原合法鏡位與權威世界一致；重連還原當前狀態不重播舊cue或假提交；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-127** `ReadyGate_RealDependencies_PreservesContract`（高；RB4-BDD-023／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。
  - 斷言：單方等待不扣秒；雙ready原子建立唯一deadline與題組；雙端同一權威倒數並顯示原文等待提示；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-134** `DurationConfig_RealDependencies_PreservesContract`（高；RB4-BDD-024／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：90秒正式內容與另一合法120秒測試版本；動作：發布新配置並讓新舊場次各自ready。
  - 斷言：總時長來自釘選durationSeconds不硬編碼；舊場次90秒、新場次120秒且不熱改deadline；無效整數、門檻越界、溢位或缺設定拒發；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-139** `RescueSetPin_RealDependencies_PreservesContract`（高；RB4-BDD-025／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：場次尚未抽題組；動作：種子抽選兩組各4步並重連。
  - 斷言：只釘選原兩組之一；每步書ID與區域、線索文字符合草稿；重連／重送不重抽且不向未授權方回完整解答；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-144** `RescueSteps_RealDependencies_PreservesContract`（高；RB4-BDD-026／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。
  - 斷言：權威狀態依角色與步驟轉移；只有合法完整上架計1本；原文成功回饋、無危險入口操作；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-150** `ReverseClues_RealDependencies_PreservesContract`（高；RB4-BDD-027／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。
  - 斷言：反轉線索只合法分享才揭露；第3本下層、第4本完整鎖扣才增加計數；兩組原文toast及合法結果完整；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-156** `WrongRescue_RealDependencies_PreservesContract`（高；RB4-BDD-028／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。
  - 斷言：錯書／槽／扣原文回饋；不增加rescuedCount、不接受不合法持物或轉移；UI復位，合法後續仍可完成；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-162** `QuickCallouts_RealDependencies_PreservesContract`（高；RB4-BDD-029／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。
  - 斷言：只顯示本人合法原文；明確點擊才發舞台泡泡；不寫假真人聊天、不洩未分享答案；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-168** `WaterStages_RealDependencies_PreservesContract`（高；RB4-BDD-030／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。
  - 斷言：各水位階段及原文播報正確；過期cue不重播、畫面ceil秒數一致；client改時鐘不影響D1 deadline；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-174** `PauseIdle_RealDependencies_PreservesContract`（高；RB4-BDD-031／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。
  - 斷言：未達15秒不暫緩、達門檻暫緩；ping不更新有效活動；保存剩餘時間且原稿暫緩提示正確；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-180** `PauseReconnect_RealDependencies_PreservesContract`（高；RB4-BDD-032／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。
  - 斷言：自動恢復且不要求確認按鈕；保存剩餘時間、無次數上限、不補扣暫緩秒；重連／冷啟動不重設90秒；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-187** `DeadlineRace_RealDependencies_PreservesContract`（高；RB4-BDD-033／RB4-AC-008）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：最後一本只差合法封箱；動作：在deadline-1、deadline、deadline+1ms與timeout競態提交。
  - 斷言：嚴格早於deadline完成才S；等於或晚於deadline拒操作，先按現有已救數結算；真D1原子交易只有一結果、同receipt不重複；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-192** `GradeS_RealDependencies_PreservesContract`（高；RB4-BDD-034／RB4-AC-009）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：4本在期限內完成；動作：伺服器提交最後合法封箱。
  - 斷言：立即S不等歸零；播放原文及布丁演出；走書籤／最終意願而非屋簷；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-198** `GradeA_RealDependencies_PreservesContract`（高；RB4-BDD-035／RB4-AC-009）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。
  - 斷言：A結算且停止救書；原文退至高處、拿鐵及毛巾；走書籤／最終意願；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-204** `GradeB_RealDependencies_PreservesContract`（高；RB4-BDD-036／RB4-AC-009）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：到期已救0或1本；動作：系統結算。
  - 斷言：B直接ev4-04-eaves-shelter；停止救書且不可再進危險區或提交；屋簷原文與專用鏡位，不走書籤或wish；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-210** `AlarmRecovery_RealDependencies_PreservesContract`（高；RB4-BDD-037／RB4-AC-009）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：nonce清理、deadline、idle alarm競爭或DO重啟；動作：模擬重複alarm、通知遺失、D1/R2故障及GET補償。
  - 斷言：最早到期不被新nonce覆蓋；舊session/generation無副作用，合法結果一次提交；故障保留權威狀態、503後重試恢復；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-215** `Bookmark_RealDependencies_PreservesContract`（高；RB4-BDD-038／RB4-AC-010）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。
  - 斷言：沿用草稿原句與本人短語；未合法公開前對方看不到；留書結局可原位翻對方已授權書籤；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-222** `BookmarkValidation_RealDependencies_PreservesContract`（高；RB4-BDD-039／RB4-AC-010）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：書籤操作可用；動作：送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note。
  - 斷言：非法輸入400且無寫入；0與20合法及emoji scalar一致；其他params仍為嚴格ID，禁止任意文字；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-227** `WishMatrix_RealDependencies_PreservesContract`（高；RB4-BDD-040／RB4-AC-010）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。
  - 斷言：兩人keep-talking才ev4-01；無quiet且至少一share-books才ev4-02；任一quiet即ev4-03；第一份未揭露；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-233** `EndingArt_RealDependencies_PreservesContract`（高；RB4-BDD-041／RB4-AC-010）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：四種結局各已合法提交；動作：看場景光色、距離、原文、互動並重連。
  - 斷言：四結局各自正式鏡位與素材；S/A對應致謝與書籤，B專屬屋簷；重連不退回結局前，不出現規格文字；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-239** `ReceiptTitle_RealDependencies_PreservesContract`（高；RB4-BDD-042／RB4-AC-011）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。
  - 斷言：S_fast >=30000、其餘S_normal；A/B稱號原文符合草稿；書、黑膠、救援統計及阿澄附註只來自已提交事實；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-245** `ReceiptCollection_RealDependencies_PreservesContract`（高；RB4-BDD-043／RB4-AC-011）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：同Round含重複V4結局、其他pair、其他Round、V3與未完成；動作：完成本場並生成X/4。
  - 斷言：當前V4同版已完成不同結局含本場；其他Round/pair/版本或未完成不計；重播不重複累計且0..4有界；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-250** `ReceiptBadges_RealDependencies_PreservesContract`（高；RB4-BDD-044／RB4-AC-011）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。
  - 斷言：各印章只對應原稿條件；不成立不顯示、重送不重複；小票無真實姓名、Email、照片、私密Profile或未授權內容；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-256** `NaturalCompletion_RealDependencies_PreservesContract`（高；RB4-BDD-045／RB4-AC-011）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。
  - 斷言：不額外要求完成按鈕或支線；聊天仍可用；雙方同意才建新場；新場釘選合法版本、舊投影與cue清除；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-263** `SafeExit_RealDependencies_PreservesContract`（高；RB4-BDD-046／RB4-AC-011）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：ready/running/paused/settled/completed任一階段；動作：一方確認退出並與救書或alarm競態。
  - 斷言：退出不受倒數或素材故障阻塞；解除占用、終止權限且pair排除；無後續訊息／操作／私有圖或舊cue；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-270** `StrictTransport_RealDependencies_PreservesContract`（高；RB4-BDD-047／RB4-AC-012）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：有效及失效帳號、HTTP/WS相同操作；動作：送正確payload、偽造role/time、錯revision、重複ID與失權。
  - 斷言：兩transport同規則與receipt；400/401/403/409/503依既有契約，無狀態異動；拒公開system reconcile、raw manifest與私人key；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-275** `AssetReadiness_RealDependencies_PreservesContract`（高；RB4-BDD-048／RB4-AC-012）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready；動作：載入、恢復與點擊。
  - 斷言：fail closed，不以placeholder冒充；保留可用聊天/退出及重讀、現有錯誤碼；恢復原版且不重抽、不呼叫Gemini；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-282** `AvatarReuse_RealDependencies_PreservesContract`（高；RB4-BDD-049／RB4-AC-012）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：16免費角色及既有ready AI套組；動作：切換4姿態5表情、重連與失權。
  - 斷言：保持已核准身份／外觀、資產共用；切換或重連不重產；失權清圖；真provider證據與回放分開；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-288** `PlatformPerformance_RealDependencies_PreservesContract`（高；RB4-BDD-050／RB4-AC-012）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：正式V4完整資產、Web與Android現有驗收裝置；動作：連續探索、翻書、倒數、背景與重連。
  - 斷言：記錄載入／操作延遲／記憶體／動畫對V3基線；離開與失權清資源且有界快取；無實測不得標Gate A通過；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-294** `GateA_RealDependencies_PreservesContract`（高；RB4-BDD-051／RB4-AC-012）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：V4正式候選與真環境測試；動作：核對全部AC、兩題組、四結局及必要平台。
  - 斷言：真D1/R2/DO與HTTP/WS有精確證據；Web/Android及素材/內容/權限/效能逐項核對；未驗或失敗不得以局部測試通過代簽；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-299** `CleanupScope_RealDependencies_PreservesContract`（高；RB4-BDD-053／RB4-AC-013）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：Gate B已核准且已知local停寫；動作：預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境。
  - 斷言：不明環境／未授權／無備份拒清理；精確Round/Session/Invitation/claim/event/catalog及R2引用清單；保護帳號、個資、化身與其他故事或資產；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-303** `CleanupAtomicity_RealDependencies_PreservesContract`（高；RB4-BDD-054／RB4-AC-013）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：已確認清理範圍與備份；動作：故障注入D1交易或R2清理並重試。
  - 斷言：FK依賴及保護指紋正確、無孤兒；測試pair排除與占用不殘留；R2只刪無剩餘引用、故障可補償且不假成功；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-307** `CleanReplay_RealDependencies_PreservesContract`（高；RB4-BDD-055／RB4-AC-014）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。
  - 斷言：舊版不可選、無舊SHA或歷史恢復；V4完整可玩、配對/聊天/退出維持；所有Gate證據齊全才可結案與進下一SPEC；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-313** `AuthorIntegrity_RealDependencies_PreservesContract`（高；RB4-BDD-056／RB4-AC-015）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：完整原始JSON與編譯的正式v3內容；動作：逐JSON path/ID比較並注入缺字、標點改動、缺ID與placeholder。
  - 斷言：28節點9個人binding、全部書與模組原文逐項保留；合法技術轉換可逆、未知條件/內容差異拒發；原稿SHA不被覆寫，經確認例外才調整基準；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-317** `PublisherVersion_RealDependencies_PreservesContract`（高；RB4-BDD-057／RB4-AC-015）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：既有V3釘選與新V4正式內容；動作：測v2/v3 parser、SHA不符、缺asset、非法DSL及版本發布。
  - 斷言：舊場次維持原SHA、v4新版本不可變；v3拒任意腳本或未知型別，D1/R2失敗不發布；正式索引僅合法內容且Gate B前保留舊版讀取；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

- [ ] **RB4-T-321** `Reachability_RealDependencies_PreservesContract`（高；RB4-BDD-058／RB4-AC-015）
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts；內容發布沿 scene-event-publication.integration.test.ts，DO沿 story-dialogue-websocket.test.ts；必要擴充同模組`
  - 前置：編譯完整草稿及有限狀態模型；動作：遍歷全部節點、角色、題組、問答、拒絕及結局。
  - 斷言：28節點與4結局可達、兩方不死鎖；同一合法狀態唯一結局、B優先安全結束；不得拆除既有graph/JSON/資產guard來冒充通過；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

### Integration 風險稽核補強

- [ ] **RB4-T-323** `Reconcile_DelayedAlarm_UsesEarliestBoundary`（高；RB4-BDD-031／RB4-AC-008；G02）
  - 來源：RA-01／BDD031–033；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G02。
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts`。
  - 前置／動作：真D1測不同時刻的閒置門檻及deadline；故意延遲alarm。
  - 斷言：14999/15000ms與deadline先後；晚喚醒按應暫緩時刻計剩餘時間，無晚暫緩逆轉結算；當deadline先到按已救數結算，暫緩先到按應暫緩時刻扣算；只提交一次。

- [ ] **RB4-T-325** `SystemCommit_NullActorReplay_ExactlyOneEvent`（高；RB4-BDD-037／RB4-AC-009；G04）
  - 來源：RA-02／BDD033/037；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G04。
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts`。
  - 前置／動作：真D1相同系統operation identity於跨Worker與重複alarm執行。
  - 斷言：真D1跨Worker重送，NULL actor 不靠 UNIQUE 去重，revision/eventSeq/結算唯一；同batch CAS驗狀態與revision，僅一次系統事件；NULL UNIQUE不被當去重保證。

- [ ] **RB4-T-326** `Commit_DeadlineExitRace_RollsBackLosingMutation`（高；RB4-BDD-033／RB4-AC-008；G05）
  - 來源：RA-02／BDD033/046；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G05。
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts`。
  - 前置／動作：deadline前1ms／同時／後1ms與結算、退出跨Worker競態。
  - 斷言：最後毫秒、系統結算、退出跨Worker競態；敗方無副作用；只有合法勝方成功，敗方無寫入與副作用；不得遲到成功。

- [ ] **RB4-T-328** `Publish_NewDuration_OldDeadlineStaysPinned`（高；RB4-BDD-024／RB4-AC-008；G07）
  - 來源：RA-03／BDD024；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G07。
  - 位置：`cloudflare/tests/scene-event-publication.integration.test.ts`。
  - 前置／動作：發布合法120秒新版本，同時保有90秒舊場次（含paused）。
  - 斷言：新版120、舊版90及正在暫緩的舊版恢復，讀取舊SHA不改時間；新場次取新版；舊場次回原SHA、原時長與剩餘時長，不熱改。

- [ ] **RB4-T-331** `Restore_PausedMidHandoff_PreservesHolderAndLatch`（高；RB4-BDD-032／RB4-AC-008；G10）
  - 來源：RA-05／BDD032；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G10。
  - 位置：`cloudflare/tests/scene-event-track-d1.integration.test.ts`。
  - 前置／動作：持書／裝袋／扣件進行中暫緩、斷線、重連並重送舊ID。
  - 斷言：暫緩/重連跨持書、拖袋、扣件中間狀態；同ID不重複計數；holder、slot、latchIndex、已救數以權威狀態還原，重送不加計。

- [ ] **RB4-T-334** `Cleanup_MixedRoundAndSharedReference_BlocksUnsafeDeletion`（高；RB4-BDD-053／RB4-AC-013；G13）
  - 來源：RA-08／BDD053/054；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G13。
  - 位置：`cloudflare/tests/scene-event-local-upgrade.integration.test.ts`。
  - 前置／動作：受控local混合非驗收Round、共用素材與未知引用；預覽清理並模擬中斷。
  - 斷言：非測試輪混合版本或未知引用拒清，具名測試清理保護FK及R2共享SHA；拒清衝突；已授權具名測試輪清理後FK／保護指紋相符、剩餘R2引用不刪。

- [ ] **RB4-T-335** `Alarm_NonceRefreshAndMultipleTabs_UsesEarliestDue`（中；RB4-BDD-037／RB4-AC-009；G14）
  - 來源：RA-09／BDD037；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G14。
  - 位置：`cloudflare/tests/story-dialogue-websocket.test.ts`。
  - 前置／動作：多分頁前景／失焦、票券refresh／撤銷、nonce清理、DO冷啟與deadline／idle競態。
  - 斷言：多分頁、權杖撤銷、DO重啟、新nonce、deadline/idle不覆蓋更早排程；有效role連線聚合，舊generation無副作用；最早到期alarm不被覆蓋。

- [ ] **RB4-T-336** `Publish_WorstReachableState_WithinExistingBounds`（中；RB4-BDD-058／RB4-AC-015；G15）
  - 來源：RA-10／BDD056/058；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G15。
  - 位置：`cloudflare/tests/scene-event-publication.integration.test.ts`。
  - 前置／動作：編譯完整原稿並以兩題組、四結局及最壞合法重複操作量測。
  - 斷言：最壞合法序列含探索重複、兩題組、四結局；實測JSON及graph，超限fail closed；16,384 JSON、512KiB單件／4MiB四層、8MiB素材與50,000 graph guard均實測；超限停止提出方案。

## API 測試

- [ ] **RB4-T-036** `InterestBadge_HttpAndWs_EnforcesContract`（高；RB4-BDD-007／RB4-AC-002）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：雙方有不同未公開興趣；動作：以本人身份讀書架或竄改owner。
  - 斷言：推薦貼紙只依本人已儲存興趣；raw DTO不含對方興趣或未揭封內容；越權讀取拒絕且不快取私人資料；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-100** `QuestionCardGuard_HttpAndWs_EnforcesContract`（高；RB4-BDD-018／RB4-AC-005）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：安靜軌道或他方未回答；動作：竄改題ID、他方答案、重送或提前查揭曉。
  - 斷言：拒非法操作且不變更revision；同ID同payload回原receipt、改payload409；quiet路不被問答阻塞；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-117** `DirectorTrigger_HttpAndWs_EnforcesContract`（高；RB4-BDD-021／RB4-AC-007）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：I/A尚未全部達原稿warm/respect與warm/quiet；動作：兩方並行提交最後節奏點。
  - 斷言：滿足雙條件才觸發且warm必先完成提問卡；同場只建立一次director事件及ready；未完成彩蛋不阻塞、非按鈕觸發；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-128** `ReadyGate_HttpAndWs_EnforcesContract`（高；RB4-BDD-023／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。
  - 斷言：單方等待不扣秒；雙ready原子建立唯一deadline與題組；雙端同一權威倒數並顯示原文等待提示；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-135** `DurationConfig_HttpAndWs_EnforcesContract`（高；RB4-BDD-024／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：90秒正式內容與另一合法120秒測試版本；動作：發布新配置並讓新舊場次各自ready。
  - 斷言：總時長來自釘選durationSeconds不硬編碼；舊場次90秒、新場次120秒且不熱改deadline；無效整數、門檻越界、溢位或缺設定拒發；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-140** `RescueSetPin_HttpAndWs_EnforcesContract`（高；RB4-BDD-025／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：場次尚未抽題組；動作：種子抽選兩組各4步並重連。
  - 斷言：只釘選原兩組之一；每步書ID與區域、線索文字符合草稿；重連／重送不重抽且不向未授權方回完整解答；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-181** `PauseReconnect_HttpAndWs_EnforcesContract`（高；RB4-BDD-032／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。
  - 斷言：自動恢復且不要求確認按鈕；保存剩餘時間、無次數上限、不補扣暫緩秒；重連／冷啟動不重設90秒；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-188** `DeadlineRace_HttpAndWs_EnforcesContract`（高；RB4-BDD-033／RB4-AC-008）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：最後一本只差合法封箱；動作：在deadline-1、deadline、deadline+1ms與timeout競態提交。
  - 斷言：嚴格早於deadline完成才S；等於或晚於deadline拒操作，先按現有已救數結算；真D1原子交易只有一結果、同receipt不重複；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-211** `AlarmRecovery_HttpAndWs_EnforcesContract`（高；RB4-BDD-037／RB4-AC-009）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：nonce清理、deadline、idle alarm競爭或DO重啟；動作：模擬重複alarm、通知遺失、D1/R2故障及GET補償。
  - 斷言：最早到期不被新nonce覆蓋；舊session/generation無副作用，合法結果一次提交；故障保留權威狀態、503後重試恢復；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-216** `Bookmark_HttpAndWs_EnforcesContract`（高；RB4-BDD-038／RB4-AC-010）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。
  - 斷言：沿用草稿原句與本人短語；未合法公開前對方看不到；留書結局可原位翻對方已授權書籤；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-223** `BookmarkValidation_HttpAndWs_EnforcesContract`（高；RB4-BDD-039／RB4-AC-010）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：書籤操作可用；動作：送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note。
  - 斷言：非法輸入400且無寫入；0與20合法及emoji scalar一致；其他params仍為嚴格ID，禁止任意文字；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-246** `ReceiptCollection_HttpAndWs_EnforcesContract`（高；RB4-BDD-043／RB4-AC-011）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：同Round含重複V4結局、其他pair、其他Round、V3與未完成；動作：完成本場並生成X/4。
  - 斷言：當前V4同版已完成不同結局含本場；其他Round/pair/版本或未完成不計；重播不重複累計且0..4有界；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-257** `NaturalCompletion_HttpAndWs_EnforcesContract`（高；RB4-BDD-045／RB4-AC-011）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。
  - 斷言：不額外要求完成按鈕或支線；聊天仍可用；雙方同意才建新場；新場釘選合法版本、舊投影與cue清除；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-264** `SafeExit_HttpAndWs_EnforcesContract`（高；RB4-BDD-046／RB4-AC-011）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：ready/running/paused/settled/completed任一階段；動作：一方確認退出並與救書或alarm競態。
  - 斷言：退出不受倒數或素材故障阻塞；解除占用、終止權限且pair排除；無後續訊息／操作／私有圖或舊cue；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-271** `StrictTransport_HttpAndWs_EnforcesContract`（高；RB4-BDD-047／RB4-AC-012）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：有效及失效帳號、HTTP/WS相同操作；動作：送正確payload、偽造role/time、錯revision、重複ID與失權。
  - 斷言：兩transport同規則與receipt；400/401/403/409/503依既有契約，無狀態異動；拒公開system reconcile、raw manifest與私人key；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

- [ ] **RB4-T-276** `AssetReadiness_HttpAndWs_EnforcesContract`（高；RB4-BDD-048／RB4-AC-012）
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`
  - 前置：任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready；動作：載入、恢復與點擊。
  - 斷言：fail closed，不以placeholder冒充；保留可用聊天/退出及重讀、現有錯誤碼；恢復原版且不重抽、不呼叫Gemini；經既有HTTP／WS公開契約驗狀態碼、DTO、授權及receipt。。

### API 風險稽核補強

- [ ] **RB4-T-332** `Witness_StaleHiddenOrSelfSymbol_DeniesBadge`（高；RB4-BDD-012／RB4-AC-003；G11）
  - 來源：RA-06／BDD012/044；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G11。
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`。
  - 前置／動作：背景GET、自身／舊符號／錯區／失權見證及合法前景窗區實際渲染後見證。
  - 斷言：同作者/舊版/錯區/後台 GET/失權拒發；合法目前呈現重送只一事實；非法見證不發印章；合法目前版本對方見證重送只保存一次事實。

- [ ] **RB4-T-333** `Projection_ReplayAndRawAssets_NoPrivateDisclosure`（高；RB4-BDD-047／RB4-AC-012；G12）
  - 來源：RA-07／BDD006/017/038/047；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G12。
  - 位置：`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs；cloudflare/tests/story-dialogue-websocket.test.ts`。
  - 前置／動作：未揭封盲書、未揭曉答案、未授權note、跨帳戶R2及歷史回放。
  - 斷言：盲書未撕、答案未揭曉、note未授權、跨帳戶R2/WS/event feed 均無私密資料；所有transport與資產均無私密資料；小票無玩家自由輸入。

## E2E 測試

- [ ] **RB4-T-004** `EnterStore_Web_MatchesPlayerExperience`（高；RB4-BDD-001／RB4-AC-001）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：兩位玩家各自釘選V4且尚未入店；動作：I點門把且A點傘桶。
  - 斷言：I與A分別到合法下一節點；另一方未操作前其Track不變；原場景融圖、門鈴與原文依角色呈現；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-005** `EnterStore_Android_MatchesPlayerExperience`（高；RB4-BDD-001／RB4-AC-001）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：兩位玩家各自釘選V4且尚未入店；動作：I點門把且A點傘桶。
  - 斷言：I與A分別到合法下一節點；另一方未操作前其Track不變；原場景融圖、門鈴與原文依角色呈現；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-009** `NavigateAreas_Web_MatchesPlayerExperience`（高；RB4-BDD-002／RB4-AC-001）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：本人可探索目前區域；動作：左右導航及小地圖選合法相鄰區。
  - 斷言：鏡位與Area依合法鄰接更新；暖金點只示本人合法未探索或新事件；不顯示平鋪移動按鈕海或漂浮星號；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-010** `NavigateAreas_Android_MatchesPlayerExperience`（高；RB4-BDD-002／RB4-AC-001）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：本人可探索目前區域；動作：左右導航及小地圖選合法相鄰區。
  - 斷言：鏡位與Area依合法鄰接更新；暖金點只示本人合法未探索或新事件；不顯示平鋪移動按鈕海或漂浮星號；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-014** `DiscoverObjects_Web_MatchesPlayerExperience`（高；RB4-BDD-003／RB4-AC-001）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：本場首次進區、其後再次進同區；動作：先觀看呼吸光再長按空白與放開。
  - 斷言：首次只提示一次；長按只短暫顯示合法物件輪廓；掃視、取消或重連不提交主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-015** `DiscoverObjects_Android_MatchesPlayerExperience`（高；RB4-BDD-003／RB4-AC-001）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：本場首次進區、其後再次進同區；動作：先觀看呼吸光再長按空白與放開。
  - 斷言：首次只提示一次；長按只短暫顯示合法物件輪廓；掃視、取消或重連不提交主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-019** `GestureFence_Web_MatchesPlayerExperience`（高；RB4-BDD-004／RB4-AC-001）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：鏡頭縮放、手勢衝突或請求pending；動作：快速連點、滑動、拖出、取消或送舊revision。
  - 斷言：一次合法意圖最多一次提交；無效命中或取消不提交且物件復位；409重新同步、未知結果只同ID查receipt；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-020** `GestureFence_Android_MatchesPlayerExperience`（高；RB4-BDD-004／RB4-AC-001）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：鏡頭縮放、手勢衝突或請求pending；動作：快速連點、滑動、拖出、取消或送舊revision。
  - 斷言：一次合法意圖最多一次提交；無效命中或取消不提交且物件復位；409重新同步、未知結果只同ID查receipt；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-024** `BookCatalog_Web_MatchesPlayerExperience`（高；RB4-BDD-005／RB4-AC-002）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：20本書正式目錄可用；動作：逐一在5區開書並翻至末頁。
  - 斷言：16經典和4盲書ID、區域、素材符合原稿；全文、卡片、字條、書籤與共鳴原文逐書相等；合法預覽合回原位且不推進；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-025** `BookCatalog_Android_MatchesPlayerExperience`（高；RB4-BDD-005／RB4-AC-002）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：20本書正式目錄可用；動作：逐一在5區開書並翻至末頁。
  - 斷言：16經典和4盲書ID、區域、素材符合原稿；全文、卡片、字條、書籤與共鳴原文逐書相等；合法預覽合回原位且不推進；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-030** `BlindBook_Web_MatchesPlayerExperience`（高；RB4-BDD-006／RB4-AC-002）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。
  - 斷言：揭封前只有合法包裝三標籤；有效揭封後才投影該書內容；取消／重送不誤選、不揭另一方私密書；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-031** `BlindBook_Android_MatchesPlayerExperience`（高；RB4-BDD-006／RB4-AC-002）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。
  - 斷言：揭封前只有合法包裝三標籤；有效揭封後才投影該書內容；取消／重送不誤選、不揭另一方私密書；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-037** `InterestBadge_Web_MatchesPlayerExperience`（高；RB4-BDD-007／RB4-AC-002）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：雙方有不同未公開興趣；動作：以本人身份讀書架或竄改owner。
  - 斷言：推薦貼紙只依本人已儲存興趣；raw DTO不含對方興趣或未揭封內容；越權讀取拒絕且不快取私人資料；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-038** `InterestBadge_Android_MatchesPlayerExperience`（高；RB4-BDD-007／RB4-AC-002）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：雙方有不同未公開興趣；動作：以本人身份讀書架或竄改owner。
  - 斷言：推薦貼紙只依本人已儲存興趣；raw DTO不含對方興趣或未揭封內容；越權讀取拒絕且不快取私人資料；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-042** `Resonance_Web_MatchesPlayerExperience`（高；RB4-BDD-008／RB4-AC-002）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：A選定草稿任一本書；動作：逐一選該書三項共鳴之一。
  - 斷言：只提交該書合法選項；原文內心獨白對本人呈現；他人看不到未分享共鳴且預覽不等於選擇；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-043** `Resonance_Android_MatchesPlayerExperience`（高；RB4-BDD-008／RB4-AC-002）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：A選定草稿任一本書；動作：逐一選該書三項共鳴之一。
  - 斷言：只提交該書合法選項；原文內心獨白對本人呈現；他人看不到未分享共鳴且預覽不等於選擇；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-048** `VinylSync_Web_MatchesPlayerExperience`（高；RB4-BDD-009／RB4-AC-003）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。
  - 斷言：共享曲目以權威版本同步；淡換及原文提示正確、不強制他方開聲音；背景停止播放器、回前景不自動播放；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-049** `VinylSync_Android_MatchesPlayerExperience`（高；RB4-BDD-009／RB4-AC-003）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。
  - 斷言：共享曲目以權威版本同步；淡換及原文提示正確、不強制他方開聲音；背景停止播放器、回前景不自動播放；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-053** `AmbientExplore_Web_MatchesPlayerExperience`（高；RB4-BDD-010／RB4-AC-003）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：玩家等待對方主線操作；動作：查看小黑板、5則留言及阿澄3話題。
  - 斷言：所有原文及合法區域可用；小黑板布丁伏筆保留；探索不阻塞對方、非必經主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-054** `AmbientExplore_Android_MatchesPlayerExperience`（高；RB4-BDD-010／RB4-AC-003）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：玩家等待對方主線操作；動作：查看小黑板、5則留言及阿澄3話題。
  - 斷言：所有原文及合法區域可用；小黑板布丁伏筆保留；探索不阻塞對方、非必經主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-058** `FogWindow_Web_MatchesPlayerExperience`（高；RB4-BDD-011／RB4-AC-003）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：窗區可見雨勢；動作：擦霧查看3階段雨勢並留下4種合法符號。
  - 斷言：擦霧純呈現不誤提交；符號由明確操作建立共享版本；離窗後／替換／轉場只依已確認生命週期投影；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-059** `FogWindow_Android_MatchesPlayerExperience`（高；RB4-BDD-011／RB4-AC-003）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：窗區可見雨勢；動作：擦霧查看3階段雨勢並留下4種合法符號。
  - 斷言：擦霧純呈現不誤提交；符號由明確操作建立共享版本；離窗後／替換／轉場只依已確認生命週期投影；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-064** `FogWitness_Web_MatchesPlayerExperience`（高；RB4-BDD-012／RB4-AC-003）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：窗區符號存在且對方尚未見證；動作：背景讀取、同作者見證、舊符號見證及對方實際呈現。
  - 斷言：前3種不計印章；只接受對方在窗區對目前版本的合法見證；成立事實保留到小票；替換／轉場／完成清可見符號；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-065** `FogWitness_Android_MatchesPlayerExperience`（高；RB4-BDD-012／RB4-AC-003）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：窗區符號存在且對方尚未見證；動作：背景讀取、同作者見證、舊符號見證及對方實際呈現。
  - 斷言：前3種不計印章；只接受對方在窗區對目前版本的合法見證；成立事實保留到小票；替換／轉場／完成清可見符號；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-070** `SameDifferentBook_Web_MatchesPlayerExperience`（高；RB4-BDD-013／RB4-AC-004）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。
  - 斷言：以已提交ID比對；I走iv4-04-same或diff及原文；他人未提交時不揭露、不代選；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-071** `SameDifferentBook_Android_MatchesPlayerExperience`（高；RB4-BDD-013／RB4-AC-004）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。
  - 斷言：以已提交ID比對；I走iv4-04-same或diff及原文；他人未提交時不揭露、不代選；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-076** `TissueDistance_Web_MatchesPlayerExperience`（高；RB4-BDD-014／RB4-AC-004）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。
  - 斷言：距離與原文cue依實際手勢；A收不收面紙不等於是否聊天；錯區或重送不提交額外行為；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-077** `TissueDistance_Android_MatchesPlayerExperience`（高；RB4-BDD-014／RB4-AC-004）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。
  - 斷言：距離與原文cue依實際手勢；A收不收面紙不等於是否聊天；錯區或重送不提交額外行為；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-082** `GiveSpaceReverse_Web_MatchesPlayerExperience`（高；RB4-BDD-015／RB4-AC-004）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。
  - 斷言：I退開且A有獨立主動權；聊書與音樂進各自原節點；A保持安靜走respect/quiet、無假聊天；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-083** `GiveSpaceReverse_Android_MatchesPlayerExperience`（高；RB4-BDD-015／RB4-AC-004）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。
  - 斷言：I退開且A有獨立主動權；聊書與音樂進各自原節點；A保持安靜走respect/quiet、無假聊天；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-088** `DeclineApproach_Web_MatchesPlayerExperience`（高；RB4-BDD-016／RB4-AC-004）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。
  - 斷言：依草稿對應route與原文；拒絕不出現假聊天及不強制撮合；安靜軌道仍能合法達導演；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-089** `DeclineApproach_Android_MatchesPlayerExperience`（高；RB4-BDD-016／RB4-AC-004）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。
  - 斷言：依草稿對應route與原文；拒絕不出現假聊天及不強制撮合；安靜軌道仍能合法達導演；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-094** `QuestionCard_Web_MatchesPlayerExperience`（高；RB4-BDD-017／RB4-AC-005）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。
  - 斷言：同場重連不重抽；第一份答案只本人可見；雙方提交後同時揭曉同頻／反差、到warm節點；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-095** `QuestionCard_Android_MatchesPlayerExperience`（高；RB4-BDD-017／RB4-AC-005）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。
  - 斷言：同場重連不重抽；第一份答案只本人可見；雙方提交後同時揭曉同頻／反差、到warm節點；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-105** `ChatSuggestions_Web_MatchesPlayerExperience`（高；RB4-BDD-019／RB4-AC-005）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：劇情依8個適用情境進展；動作：逐情境打開聊天、點一則或自由聊天。
  - 斷言：各情境3句原文及合法篩選；未點不發送、點擊由真人送出；聊天仍可用且不冒充NPC或對方；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-106** `ChatSuggestions_Android_MatchesPlayerExperience`（高；RB4-BDD-019／RB4-AC-005）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：劇情依8個適用情境進展；動作：逐情境打開聊天、點一則或自由聊天。
  - 斷言：各情境3句原文及合法篩選；未點不發送、點擊由真人送出；聊天仍可用且不冒充NPC或對方；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-111** `ClerkPersona_Web_MatchesPlayerExperience`（高；RB4-BDD-020／RB4-AC-006）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。
  - 斷言：角色分眾原文與表情正確；阿澄赴入口防洪切電，不站原地觀望；S/A×warm/quiet原文匹配且不代發真人訊息；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-112** `ClerkPersona_Android_MatchesPlayerExperience`（高；RB4-BDD-020／RB4-AC-006）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。
  - 斷言：角色分眾原文與表情正確；阿澄赴入口防洪切電，不站原地觀望；S/A×warm/quiet原文匹配且不代發真人訊息；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-122** `StormPresentation_Web_MatchesPlayerExperience`（高；RB4-BDD-022／RB4-AC-007）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：伺服器已提交導演事件；動作：兩端接cue或斷線重連。
  - 斷言：原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；原合法鏡位與權威世界一致；重連還原當前狀態不重播舊cue或假提交；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-123** `StormPresentation_Android_MatchesPlayerExperience`（高；RB4-BDD-022／RB4-AC-007）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：伺服器已提交導演事件；動作：兩端接cue或斷線重連。
  - 斷言：原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；原合法鏡位與權威世界一致；重連還原當前狀態不重播舊cue或假提交；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-129** `ReadyGate_Web_MatchesPlayerExperience`（高；RB4-BDD-023／RB4-AC-008）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。
  - 斷言：單方等待不扣秒；雙ready原子建立唯一deadline與題組；雙端同一權威倒數並顯示原文等待提示；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-130** `ReadyGate_Android_MatchesPlayerExperience`（高；RB4-BDD-023／RB4-AC-008）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。
  - 斷言：單方等待不扣秒；雙ready原子建立唯一deadline與題組；雙端同一權威倒數並顯示原文等待提示；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-145** `RescueSteps_Web_MatchesPlayerExperience`（高；RB4-BDD-026／RB4-AC-008）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。
  - 斷言：權威狀態依角色與步驟轉移；只有合法完整上架計1本；原文成功回饋、無危險入口操作；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-146** `RescueSteps_Android_MatchesPlayerExperience`（高；RB4-BDD-026／RB4-AC-008）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。
  - 斷言：權威狀態依角色與步驟轉移；只有合法完整上架計1本；原文成功回饋、無危險入口操作；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-151** `ReverseClues_Web_MatchesPlayerExperience`（高；RB4-BDD-027／RB4-AC-008）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。
  - 斷言：反轉線索只合法分享才揭露；第3本下層、第4本完整鎖扣才增加計數；兩組原文toast及合法結果完整；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-152** `ReverseClues_Android_MatchesPlayerExperience`（高；RB4-BDD-027／RB4-AC-008）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。
  - 斷言：反轉線索只合法分享才揭露；第3本下層、第4本完整鎖扣才增加計數；兩組原文toast及合法結果完整；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-157** `WrongRescue_Web_MatchesPlayerExperience`（高；RB4-BDD-028／RB4-AC-008）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。
  - 斷言：錯書／槽／扣原文回饋；不增加rescuedCount、不接受不合法持物或轉移；UI復位，合法後續仍可完成；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-158** `WrongRescue_Android_MatchesPlayerExperience`（高；RB4-BDD-028／RB4-AC-008）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。
  - 斷言：錯書／槽／扣原文回饋；不增加rescuedCount、不接受不合法持物或轉移；UI復位，合法後續仍可完成；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-163** `QuickCallouts_Web_MatchesPlayerExperience`（高；RB4-BDD-029／RB4-AC-008）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。
  - 斷言：只顯示本人合法原文；明確點擊才發舞台泡泡；不寫假真人聊天、不洩未分享答案；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-164** `QuickCallouts_Android_MatchesPlayerExperience`（高；RB4-BDD-029／RB4-AC-008）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。
  - 斷言：只顯示本人合法原文；明確點擊才發舞台泡泡；不寫假真人聊天、不洩未分享答案；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-169** `WaterStages_Web_MatchesPlayerExperience`（高；RB4-BDD-030／RB4-AC-008）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。
  - 斷言：各水位階段及原文播報正確；過期cue不重播、畫面ceil秒數一致；client改時鐘不影響D1 deadline；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-170** `WaterStages_Android_MatchesPlayerExperience`（高；RB4-BDD-030／RB4-AC-008）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。
  - 斷言：各水位階段及原文播報正確；過期cue不重播、畫面ceil秒數一致；client改時鐘不影響D1 deadline；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-175** `PauseIdle_Web_MatchesPlayerExperience`（高；RB4-BDD-031／RB4-AC-008）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。
  - 斷言：未達15秒不暫緩、達門檻暫緩；ping不更新有效活動；保存剩餘時間且原稿暫緩提示正確；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-176** `PauseIdle_Android_MatchesPlayerExperience`（高；RB4-BDD-031／RB4-AC-008）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。
  - 斷言：未達15秒不暫緩、達門檻暫緩；ping不更新有效活動；保存剩餘時間且原稿暫緩提示正確；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-182** `PauseReconnect_Web_MatchesPlayerExperience`（高；RB4-BDD-032／RB4-AC-008）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。
  - 斷言：自動恢復且不要求確認按鈕；保存剩餘時間、無次數上限、不補扣暫緩秒；重連／冷啟動不重設90秒；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-183** `PauseReconnect_Android_MatchesPlayerExperience`（高；RB4-BDD-032／RB4-AC-008）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。
  - 斷言：自動恢復且不要求確認按鈕；保存剩餘時間、無次數上限、不補扣暫緩秒；重連／冷啟動不重設90秒；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-193** `GradeS_Web_MatchesPlayerExperience`（高；RB4-BDD-034／RB4-AC-009）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：4本在期限內完成；動作：伺服器提交最後合法封箱。
  - 斷言：立即S不等歸零；播放原文及布丁演出；走書籤／最終意願而非屋簷；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-194** `GradeS_Android_MatchesPlayerExperience`（高；RB4-BDD-034／RB4-AC-009）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：4本在期限內完成；動作：伺服器提交最後合法封箱。
  - 斷言：立即S不等歸零；播放原文及布丁演出；走書籤／最終意願而非屋簷；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-199** `GradeA_Web_MatchesPlayerExperience`（高；RB4-BDD-035／RB4-AC-009）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。
  - 斷言：A結算且停止救書；原文退至高處、拿鐵及毛巾；走書籤／最終意願；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-200** `GradeA_Android_MatchesPlayerExperience`（高；RB4-BDD-035／RB4-AC-009）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。
  - 斷言：A結算且停止救書；原文退至高處、拿鐵及毛巾；走書籤／最終意願；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-205** `GradeB_Web_MatchesPlayerExperience`（高；RB4-BDD-036／RB4-AC-009）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：到期已救0或1本；動作：系統結算。
  - 斷言：B直接ev4-04-eaves-shelter；停止救書且不可再進危險區或提交；屋簷原文與專用鏡位，不走書籤或wish；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-206** `GradeB_Android_MatchesPlayerExperience`（高；RB4-BDD-036／RB4-AC-009）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：到期已救0或1本；動作：系統結算。
  - 斷言：B直接ev4-04-eaves-shelter；停止救書且不可再進危險區或提交；屋簷原文與專用鏡位，不走書籤或wish；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-217** `Bookmark_Web_MatchesPlayerExperience`（高；RB4-BDD-038／RB4-AC-010）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。
  - 斷言：沿用草稿原句與本人短語；未合法公開前對方看不到；留書結局可原位翻對方已授權書籤；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-218** `Bookmark_Android_MatchesPlayerExperience`（高；RB4-BDD-038／RB4-AC-010）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。
  - 斷言：沿用草稿原句與本人短語；未合法公開前對方看不到；留書結局可原位翻對方已授權書籤；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-228** `WishMatrix_Web_MatchesPlayerExperience`（高；RB4-BDD-040／RB4-AC-010）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。
  - 斷言：兩人keep-talking才ev4-01；無quiet且至少一share-books才ev4-02；任一quiet即ev4-03；第一份未揭露；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-229** `WishMatrix_Android_MatchesPlayerExperience`（高；RB4-BDD-040／RB4-AC-010）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。
  - 斷言：兩人keep-talking才ev4-01；無quiet且至少一share-books才ev4-02；任一quiet即ev4-03；第一份未揭露；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-234** `EndingArt_Web_MatchesPlayerExperience`（高；RB4-BDD-041／RB4-AC-010）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：四種結局各已合法提交；動作：看場景光色、距離、原文、互動並重連。
  - 斷言：四結局各自正式鏡位與素材；S/A對應致謝與書籤，B專屬屋簷；重連不退回結局前，不出現規格文字；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-235** `EndingArt_Android_MatchesPlayerExperience`（高；RB4-BDD-041／RB4-AC-010）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：四種結局各已合法提交；動作：看場景光色、距離、原文、互動並重連。
  - 斷言：四結局各自正式鏡位與素材；S/A對應致謝與書籤，B專屬屋簷；重連不退回結局前，不出現規格文字；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-240** `ReceiptTitle_Web_MatchesPlayerExperience`（高；RB4-BDD-042／RB4-AC-011）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。
  - 斷言：S_fast >=30000、其餘S_normal；A/B稱號原文符合草稿；書、黑膠、救援統計及阿澄附註只來自已提交事實；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-241** `ReceiptTitle_Android_MatchesPlayerExperience`（高；RB4-BDD-042／RB4-AC-011）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。
  - 斷言：S_fast >=30000、其餘S_normal；A/B稱號原文符合草稿；書、黑膠、救援統計及阿澄附註只來自已提交事實；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-251** `ReceiptBadges_Web_MatchesPlayerExperience`（高；RB4-BDD-044／RB4-AC-011）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。
  - 斷言：各印章只對應原稿條件；不成立不顯示、重送不重複；小票無真實姓名、Email、照片、私密Profile或未授權內容；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-252** `ReceiptBadges_Android_MatchesPlayerExperience`（高；RB4-BDD-044／RB4-AC-011）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。
  - 斷言：各印章只對應原稿條件；不成立不顯示、重送不重複；小票無真實姓名、Email、照片、私密Profile或未授權內容；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-258** `NaturalCompletion_Web_MatchesPlayerExperience`（高；RB4-BDD-045／RB4-AC-011）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。
  - 斷言：不額外要求完成按鈕或支線；聊天仍可用；雙方同意才建新場；新場釘選合法版本、舊投影與cue清除；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-259** `NaturalCompletion_Android_MatchesPlayerExperience`（高；RB4-BDD-045／RB4-AC-011）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。
  - 斷言：不額外要求完成按鈕或支線；聊天仍可用；雙方同意才建新場；新場釘選合法版本、舊投影與cue清除；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-265** `SafeExit_Web_MatchesPlayerExperience`（高；RB4-BDD-046／RB4-AC-011）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：ready/running/paused/settled/completed任一階段；動作：一方確認退出並與救書或alarm競態。
  - 斷言：退出不受倒數或素材故障阻塞；解除占用、終止權限且pair排除；無後續訊息／操作／私有圖或舊cue；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-266** `SafeExit_Android_MatchesPlayerExperience`（高；RB4-BDD-046／RB4-AC-011）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：ready/running/paused/settled/completed任一階段；動作：一方確認退出並與救書或alarm競態。
  - 斷言：退出不受倒數或素材故障阻塞；解除占用、終止權限且pair排除；無後續訊息／操作／私有圖或舊cue；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-277** `AssetReadiness_Web_MatchesPlayerExperience`（高；RB4-BDD-048／RB4-AC-012）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready；動作：載入、恢復與點擊。
  - 斷言：fail closed，不以placeholder冒充；保留可用聊天/退出及重讀、現有錯誤碼；恢復原版且不重抽、不呼叫Gemini；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-278** `AssetReadiness_Android_MatchesPlayerExperience`（高；RB4-BDD-048／RB4-AC-012）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready；動作：載入、恢復與點擊。
  - 斷言：fail closed，不以placeholder冒充；保留可用聊天/退出及重讀、現有錯誤碼；恢復原版且不重抽、不呼叫Gemini；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-283** `AvatarReuse_Web_MatchesPlayerExperience`（高；RB4-BDD-049／RB4-AC-012）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：16免費角色及既有ready AI套組；動作：切換4姿態5表情、重連與失權。
  - 斷言：保持已核准身份／外觀、資產共用；切換或重連不重產；失權清圖；真provider證據與回放分開；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-284** `AvatarReuse_Android_MatchesPlayerExperience`（高；RB4-BDD-049／RB4-AC-012）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：16免費角色及既有ready AI套組；動作：切換4姿態5表情、重連與失權。
  - 斷言：保持已核准身份／外觀、資產共用；切換或重連不重產；失權清圖；真provider證據與回放分開；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-289** `PlatformPerformance_Web_MatchesPlayerExperience`（高；RB4-BDD-050／RB4-AC-012）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：正式V4完整資產、Web與Android現有驗收裝置；動作：連續探索、翻書、倒數、背景與重連。
  - 斷言：記錄載入／操作延遲／記憶體／動畫對V3基線；離開與失權清資源且有界快取；無實測不得標Gate A通過；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-290** `PlatformPerformance_Android_MatchesPlayerExperience`（高；RB4-BDD-050／RB4-AC-012）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：正式V4完整資產、Web與Android現有驗收裝置；動作：連續探索、翻書、倒數、背景與重連。
  - 斷言：記錄載入／操作延遲／記憶體／動畫對V3基線；離開與失權清資源且有界快取；無實測不得標Gate A通過；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-295** `GateB_ExactVersion_UserApproves`（高；RB4-BDD-052／RB4-AC-013）
  - 位置：`docs/verification/SPEC-001-RainBookshopV4-Verification.md`
  - 前置：Gate A已完成且有精確版本SHA；動作：使用者實際遊玩並確認或拒絕。
  - 斷言：只有明確核准精確版本才可清理；拒絕或未確認保留V3及舊場次；自動測試不能代簽；只由使用者實玩核准。。

- [ ] **RB4-T-308** `CleanReplay_Web_MatchesPlayerExperience`（高；RB4-BDD-055／RB4-AC-014）
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts（擬新增同模組）`
  - 前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。
  - 斷言：舊版不可選、無舊SHA或歷史恢復；V4完整可玩、配對/聊天/退出維持；所有Gate證據齊全才可結案與進下一SPEC；兩真人正式畫面及權威狀態相符，無fixture代簽。。

- [ ] **RB4-T-309** `CleanReplay_Android_MatchesPlayerExperience`（高；RB4-BDD-055／RB4-AC-014）
  - 位置：`tests/e2e/android/scene-event-v4.mjs（擬新增同模組）`
  - 前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。
  - 斷言：舊版不可選、無舊SHA或歷史恢復；V4完整可玩、配對/聊天/退出維持；所有Gate證據齊全才可結案與進下一SPEC；兩真人正式畫面及權威狀態相符，無fixture代簽。。


### E2E 風險稽核補強

- [ ] **RB4-T-324** `Resume_RepeatedIdle_WebAndAndroidNoDeadlock`（高；RB4-BDD-032／RB4-AC-008；G03）
  - 來源：RA-01／BDD032；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G03。
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts；tests/e2e/android/scene-event-v4.mjs`。
  - 前置／動作：兩真人各平台實際進場；反覆閒置、斷線、前景重入。
  - 斷言：兩真人前景實際重入、多次閒置／斷線自動恢復、原操作不重複；兩平台獨立證據；首次恢復操作不計成果且兩平台分別留證，沒有重置時長或卡死。

- [ ] **RB4-T-337** `GateA_RealAssetsAndRightsAndNativeRunner_RequiresEvidence`（高；RB4-BDD-051／RB4-AC-012；G16）
  - 來源：RA-11/12／BDD048–051/056；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G16。
  - 位置：`tests/e2e/web/scene-event-v4.spec.ts；tests/e2e/android/scene-event-v4.mjs；docs/verification/SPEC-001-RainBookshopV4-Verification.md`。
  - 前置／動作：正式候選全素材，核對runner、APK／ADB與真provider必要證據，逐16經典與音樂／封面權利。
  - 斷言：真Web/Android正式素材、可重跑路徑、必要供應商品質/成本、逐書與音樂權利核對均有證據；缺項不代簽；Web與Android獨立證據、逐資產與權利核對、效能與品質俱全才可Gate A；缺項不代簽。

## 測試清單使用說明

依 Red-Green-Refactor；每個案例按前置、動作、斷言檢查，不因方法名稱或局部通過標記完成。原始證據僅寫 Verification。Unit 中有跨層可分拆的斷言按實際責任落在既有 Domain／Application／client／Worker 測試位置；不在單元測試假造D1通過。Integration 必須真 Miniflare D1/R2/DO及必要live；API測既有 experience、event、events、chat、next、end、ticket與WS契約；Web/Android以實際正式內容獨立驗收。Gate B 由使用者核准精確SHA。無障礙及iOS不在本期。優先沿用現有測試與工具，不把歷史V3數量當成本輪已驗。

## 相關文檔

- [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md)
- [Verification](../verification/SPEC-001-RainBookshopV4-Verification.md)

## 規劃交接紀錄

**交接狀態**：Ready for well-done
**最後確認日期**：2026-11-25
**實作順序**：MVP-001 第6份 SPEC；僅 RainBookshopV4，不提前開發 AffectionAndFeedback 或其他九場。

| 文件包 | 位置 | 狀態 |
|---|---|---|
| MVP | [MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md) | 已確認 |
| 原始作者內容 | [rain-bookshop-v4-draft.json](../requirements/rain-bookshop-v4-draft.json) | 唯一劇本／文案權威，原SHA不變 |
| SPEC | [SPEC-001-RainBookshopV4](../specs/SPEC-001-RainBookshopV4.md) | RQ-01～04、RA-Q1～4 全 A；倒數配置化 |
| BDD | [SPEC-001-RainBookshopV4-BDD](../bdd/SPEC-001-RainBookshopV4-BDD.md) | 58場景，42前端；風險行為補回原場景 |
| TDD | 本文件 | 337案例，0完成；16項補強 |
| RiskAudit | [SPEC-001-RainBookshopV4-RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) | 12風險全確認，16缺漏已補回 |
| Verification | [SPEC-001-RainBookshopV4-Verification](../verification/SPEC-001-RainBookshopV4-Verification.md) | 尚未開發／驗證 |

### 已確認風險與回寫

| 風險 ID | 摘要 | 使用者決策 | 回寫位置／開發注意事項 |
|---|---|---|---|
| RA-01 | SPEC §3.7/RQ-01；BDD031–033/037。閒置暫緩後如果只有有效操作才可恢復，但暫緩拒所有操作，會永遠卡住；晚到 alarm 也可能多扣時間。 | RA-Q1=A | SPEC §6.3；暫緩期間提供受控的前景可操作／本人重新操作信號，不另加恢復按鈕；原操作不偷跑、回權威快照，閒置者重新參與才恢復。以15秒門檻時刻及 deadline 的先後比較，雙方恢復時重建活動基準。 |
| RA-02 | SPEC §3.7；BDD033/037；現行 planTrackAction 以 actor submission 及單 instance 為核心，NULL actor/client_request_id 的 UNIQUE 不足以去重系統事件。 | RA-Q4=A | SPEC §6.3；固定私有 system reconcile、同 D1 batch 原子驗 active Round/claims、Session、phase/revision、deadline及 operation identity；重複 alarm／跨Worker／退出競態須只有一個結果。若真 D1 時鐘 guard 或單批容量證明不足，停止提出最小方案。 |
| RA-03 | SPEC §6.3；BDD024/030/042。縮短倒數可能讓75秒播報或30秒稱號不可達；原文有明確30/15秒。 | RA-Q4=A | SPEC §6.3；全部時間參數同一釘選版本，發版驗有效範圍及數字文案；90/120合法版本、縮短越界拒發，修改既有場次拒絕。 |
| RA-04 | SPEC §3.6；BDD025/027/056。草稿 set-a-starlight 第1與3本均在 shelves；set-b-rainlight 四個不同 Area，導演原文仍說「四個乾燥書台」。若實作強制四個不同 Area 會改動題組或原稿。 | RA-Q2=A | SPEC §6.3；保留 set A/B 原始 targetAreaId 與所有原文，四個書台理解為四個取書位置而非四個不同 Area；同一 shelves 允許兩個不同合法位置，不重排書單。 |
| RA-05 | SPEC §3.7；BDD027/028。草稿 wrongLockFeedback 要再試，但未明定錯序後已扣好的扣件是否保留、也未明定恢復中持物狀態。 | RA-Q3=A | SPEC §6.3；錯扣不加分、重置本次鎖扣進度至0，已放置書仍保留；合法持物及進度於暫緩／重連權威還原，不重做整場。 |
| RA-06 | SPEC §3.8/RQ-03；BDD012/044。背景 GET 或偽造已看見可能錯發印章；技術上不能證明真人眼睛實際注視。 | RA-Q4=A | SPEC §6.3；客戶端只有窗區前景且合法符號實際渲染時送見證；server 驗本人非作者、版本、Area、phase、授權，重放冪等；將「看見」定義為可核證的實際呈現，不用眼球追蹤。 |
| RA-07 | SPEC §3.6/3.8；BDD005/006/017/038/047/056。原稿欄位與 v2 的 speaker enum、trim、params 固定ID 不相容，盲書及私密答案可能藉 raw R2、event feed 或早期 DTO 外洩。 | RA-Q4=A | SPEC §6.3；以 versioned schema 明確接受作者原文／有限 speaker，逐 scalar 比對；欄位白名單、未揭封 metadata 隔離、私密事件不可透過回放／通知泄漏，bookmark 短語只有授權結局讀取；小票永不包含玩家自由輸入。 |
| RA-08 | SPEC §5/RQ-04；BDD052–055。Round 可有混合版本歷史、邀請永久排除及共享素材；若以 prefix 刪或留孤立 Round 會影響其他玩家。 | RA-Q4=A | SPEC §6.3；精確具名清理集合、FK 拓樸及保護指紋，先驗混合版本 Round；若牽涉非驗收資料或未知環境拒絕並列出衝突，R2 只清無剩餘引用的 key，保留失敗可重試清單。 |
| RA-09 | SPEC §3.7；BDD037/047。既有 DO alarm nonce GC、WS ticket refresh、Web 多分頁可能彼此覆蓋或把舊連線當有效活動。 | RA-Q4=A | SPEC §6.3；最早到期排程，role 層有效連線與前景狀態聚合；權杖過期/撤銷、失焦、另一合法分頁、舊 session generation 逐項驗。 |
| RA-10 | SPEC §3.6/6.1；BDD056–058。現行 graph 50,000 state、JSON 16,384/512KiB/4MiB、素材8MiB；20本書、探索重複事件與計時若直接展開笛卡兒積可能超限。 | RA-Q4=A | SPEC §6.3；用有界狀態抽象合併純呈現／非阻塞資料而保留關鍵條件，實測最壞合法序列、計時及兩題組；超限不放寬 guard、不捨棄原文。 |
| RA-11 | SPEC §3.5/3.9；BDD004/048–051。資產損壞、真 Gemini 與原生腳本搬移前路徑、背景音效、裝置效能可能使 Gate A 不可重跑。 | RA-Q4=A | SPEC §6.3；核對現行 wrapper、APK、ADB、素材 decode/遮罩、記憶體與失焦停止；真供應商只驗必要已授權靜態路徑，故障不重產、不以 mock 冒充。 |
| RA-12 | SPEC §3.5；BDD005/056/051。書目及原創自譯須核實使用地法域；音樂及封面同樣要確認權利，不把作者死亡逾70年當作所有法域一律可用。 | RA-Q4=A | SPEC §6.3；實作前逐16經典與每項音樂／封面核權利證據，權利不明不發布且提出使用者決策；不能自行替換原文或使用商業譯本。 |

### 已補回缺漏

| 缺漏 | 來源 | 補入位置 | 測試 ID／名稱 | 狀態 |
|---|---|---|---|---|
| G01 | RA-01／BDD031–032 | Unit | RB4-T-322 `Resume_IdleRoleReturns_AutomaticallyRestartsClock` | 已補回，未執行 |
| G02 | RA-01／BDD031–033 | Integration | RB4-T-323 `Reconcile_DelayedAlarm_UsesEarliestBoundary` | 已補回，未執行 |
| G03 | RA-01／BDD032 | E2E | RB4-T-324 `Resume_RepeatedIdle_WebAndAndroidNoDeadlock` | 已補回，未執行 |
| G04 | RA-02／BDD033/037 | Integration | RB4-T-325 `SystemCommit_NullActorReplay_ExactlyOneEvent` | 已補回，未執行 |
| G05 | RA-02／BDD033/046 | Integration | RB4-T-326 `Commit_DeadlineExitRace_RollsBackLosingMutation` | 已補回，未執行 |
| G06 | RA-03／BDD024/030/042 | Unit | RB4-T-327 `Compile_DurationThresholdMismatch_RejectsPublication` | 已補回，未執行 |
| G07 | RA-03／BDD024 | Integration | RB4-T-328 `Publish_NewDuration_OldDeadlineStaysPinned` | 已補回，未執行 |
| G08 | RA-04／BDD025/056 | Unit | RB4-T-329 `Compile_SetARepeatedArea_PreservesFourTargets` | 已補回，未執行 |
| G09 | RA-05／BDD027/028 | Unit | RB4-T-330 `Lock_WrongOrder_RetryWithoutLosingStoredBooks` | 已補回，未執行 |
| G10 | RA-05／BDD032 | Integration | RB4-T-331 `Restore_PausedMidHandoff_PreservesHolderAndLatch` | 已補回，未執行 |
| G11 | RA-06／BDD012/044 | API | RB4-T-332 `Witness_StaleHiddenOrSelfSymbol_DeniesBadge` | 已補回，未執行 |
| G12 | RA-07／BDD006/017/038/047 | API | RB4-T-333 `Projection_ReplayAndRawAssets_NoPrivateDisclosure` | 已補回，未執行 |
| G13 | RA-08／BDD053/054 | Integration | RB4-T-334 `Cleanup_MixedRoundAndSharedReference_BlocksUnsafeDeletion` | 已補回，未執行 |
| G14 | RA-09／BDD037 | Integration | RB4-T-335 `Alarm_NonceRefreshAndMultipleTabs_UsesEarliestDue` | 已補回，未執行 |
| G15 | RA-10／BDD056/058 | Integration | RB4-T-336 `Publish_WorstReachableState_WithinExistingBounds` | 已補回，未執行 |
| G16 | RA-11/12／BDD048–051/056 | E2E | RB4-T-337 `GateA_RealAssetsAndRightsAndNativeRunner_RequiresEvidence` | 已補回，未執行 |

### 實作注意事項

- 作者JSON及原文、28節點、20本書、兩題組、四結局不可自行改寫或省略；RQ及RA僅補足執行細則。
- 沿用21表、0新欄、0 Trigger、0新公開API、現有雙Track/D1/CAS/DO/renderer。90秒由版本化內容設定；舊場次固定原SHA。
- 先做真D1時間guard、有限狀態與內容容量／權利等必要可行性測試；若失敗或權利不明、清理範圍衝突，停止並提出最小方案，不擅自降標。不得用mock替代真環境證據。
- 依337案例逐項 Red-Green-Refactor；前端Web/Android獨立驗證，iOS暫緩、無障礙專項不納入。Gate A後須取得本人精確版本Gate B，才可清理具名local舊版與V4驗收輪，再乾淨回歸。禁止remote清理；帳號／個資／照片／化身／共享資產保持。
- 只在Verification保存驗證證據；進度就地更新，不新增流水帳；overview在實際契約／架構變更後同步，不以規劃冒充現行實作。

### 不得進入開發的阻斷項

無（規劃確認已完成；實作階段的可行性與Gate仍必須逐項驗證）。

