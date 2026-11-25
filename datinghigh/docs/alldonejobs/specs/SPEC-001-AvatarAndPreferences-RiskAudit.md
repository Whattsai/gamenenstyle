# SPEC-001-AvatarAndPreferences — 結案風險稽核

**2026-11-25：使用者確認本 SPEC 已驗收。** 現行風險依已實作功能與既有證據收斂；取消或被取代的舊設計不再列為待辦。個別未核證技術斷言並未改為通過。

| 風險範圍 | 現行控制 | 實作／證據 |
|---|---|---|
| RA-01～14 | 本人授權、照片上限、個資欄位白名單、R2/D1 排他與補償、最多四候選、失敗不增成功次數 | 原核證及 D-053 八組 |
| RA-15～16 | 免費16款正式身份固定；全身候選及舞台安全取景；不要求保存未使用原畫或另做解析度成本實驗 | SceneEventFramework 已驗收；Gemini 新品質/成本未另測 |
| RA-17～20 | 前景五表情及需要時四姿態、完成項重用、lease/revision、私人 manifest 及採用確認 | avatar-static-adoption.integration.test.ts、avatar-adoption.ts |
| RA-21～26 | 角色素材 ACL、失權拒絕、WS 更新、非正式角色測資精確清理及個資保護 | 跨 SPEC 驗證紀錄；真正名片交換留後續 |

[結案對照及證據限制](../verification/SPEC-001-AvatarAndPreferences-Verification.md)；[SPEC](SPEC-001-AvatarAndPreferences.md)。
