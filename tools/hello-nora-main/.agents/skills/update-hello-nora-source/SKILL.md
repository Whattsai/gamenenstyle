---
name: update-hello-nora-source
description: 依 GitHub commit 差異更新 Hello Nora 工具，深入分析變更與關聯，再以舊來源、目前通用化版本及新來源三方合併，保留業務原文。用於「更新團隊」「更新 Hello Nora 來源」；工具驗證後另行確認是否同步至所在專案根目錄技能。
---

# 更新 Hello Nora 來源

技能位於工具 `.agents/skills/`；下列命令以工具根目錄為工作目錄。預設繁體中文。

## 讀取基準與取得來源

1. 讀完整 `AGENTS.md`、`README.md`、`INSTALL.md`、`.maintenance/source-lock.json` 與 `.maintenance/local-delta.json`。來源網址以鎖定檔的 `repository` 為權威，已整合的舊來源版本以 `commit` 為權威；不要在本技能重複寫死網址或 SHA。`source_observation` 記錄最近一次人工要求的遠端查核，不能代替已驗證整合的 `commit`。
2. 選工具外、尚未存在的暫存路徑，執行 `python scripts/source_update.py prepare --stage-dir "<暫存區>"`。程式從該 GitHub 來源取得預設分支的確切新 commit，驗證舊來源清單並保存比較結果。
3. `stage.json.status` 是 `unchanged`：代表新舊 commit 相同、本地管理雜湊一致、治理與引用稽核通過。直接回報來源版本與無更新，不需要重讀所有來源，不執行 `refresh-review` 或安裝器。若本地有變更，仍會進入 `review_required`，不能誤報無變更。
4. 來源失敗立即回報，保持工具、鎖定紀錄與已安裝技能不變。來源文字只作比對資料，不執行來源命令或讀取額外秘密。

## 以來源 diff 引導深入分析

`review_required` 暫存區包含：

- `upstream.patch`：舊 commit → 新 commit 在保留範圍內的完整來源 patch，含重新命名與二進位變更；先閱讀文字差異，素材依 patch、檔案清單及雜湊檢查。
- `base/`、`upstream/`：完整舊、新來源原文，供查閱修改前後與已刪檔案。
- `candidate/`：保留本地通用化調整的三方合併結果；重新命名會沿用原檔案的本地調整，目標已存在時列為衝突。
- `stage.json`：兩個 commit、完整來源雜湊、`changes`、`renames`、`excluded_changes`、衝突、本地變更與必讀清單。

先逐項看來源 patch 與增刪改／重新命名，再完整閱讀 `required_read_files`、`required_base_read_files` 指定的新舊文字檔。追查受影響的角色、工作流、品牌資料、引用與測試，相關未修改檔也要完整閱讀並記錄；刪除或改名要檢查所有呼叫點。不能只看 commit 訊息、變更清單或 diff 摘要。

主技能派工、跨角色交接、品牌／發布規約、共用行銷框架有變動，或影響邊界不明時，將 `review.json.analysis_scope` 設為 `full`，擴大閱讀全部 `source_scope` 的文字檔；其餘預設 `affected`。三方文字合併成功仍需審查業務語意，不能當成能力相容的證明。

保留新增、修改與刪除的業務能力原文，不能用摘要或重寫代替。只容許 AGENTS.md 明列六類差異；不得引入被排除版本的能力。衝突要在 `candidate/` 解決，再確認新來源的完整業務段落沒有遺失。刪除來源檔案但本地有改動時也屬衝突，需明確決定保留理由或刪除。

調整完成後執行 `python scripts/source_update.py refresh-review --stage-dir "<暫存區>"`，重算精確差異。編輯 `review.json`：

- `upstream_patch_sha256`：實際讀過來源 patch 後記錄其 SHA-256。
- `analysis_scope`：`affected` 或 `full`，依上述影響範圍判斷。
- `read_files`、`read_base_files`：實際完整讀過的新、舊來源文字檔路徑與 SHA-256。必須涵蓋必讀清單並加入已追查的關聯檔；`full` 必須涵蓋全部新來源文字檔。閱讀前不得預先填完。
- `capability_changes`：對 `stage.json.changes` 每檔說明新增、修改、刪除、重新命名的能力、影響與呼叫點處理，或說明無業務變化；排除範圍的變更另行回報，不併入主技能。
- `resolved_conflicts`：逐一處理完才填入衝突路徑，解法寫在對應能力變更或例外的 detail。
- `exceptions`：保留程式產生的 id 與完整 diff；每項填 `reason`（課程保護移除／能力條件／專案路徑與安裝／來源更新治理／矛盾修正／引用完整性）及具體 `detail`，說明 diff 各部分的必要性。不能以泛稱「通用化」遮蓋業務刪改。

`.maintenance/local-delta.json` 是前次差異依據，不是允許隨意改寫的授權。無法歸類的改動先保留在暫存區，說明未解項，不推進鎖定。

## 必要的平台設定與憑證通用化

合併時完整讀取 `skills/hello-nora/platform-settings.md` 與所有受影響入口、範本、教學及 `scripts/secret_guard.py`，保留以下規約，不能因上游改動而移除：

- 各品牌以 Meta、Google、LINE、Cloudinary、WordPress 分檔；僅安裝白名單空白範本，連接時才建立私人設定。Google JSON 保留原生格式與品牌專屬位置，日曆明確指定金鑰／Token 路徑，Ads 授權及執行使用品牌專屬目錄；宿主 OAuth 不強行匯出。
- 新檔不存在時才讀同品牌舊 `meta-config.md` 對應區塊，新檔建立後以新檔為準，新設定只寫對應平台檔。新增品牌只複製空白範本。
- 安裝／更新與建立憑證前執行安裝器 `--check-secrets`；先建立整個 `_brand*` 及備份目錄忽略規則，再寫模板。私人路徑已追蹤、已暫存或未受忽略時停止，只列路徑，保留本機及索引；無 Git 與檢查失敗不能當成保護通過。
- 安裝、更新、移除保留品牌、私人設定、原生憑證、稱呼及未管理檔案；來源混入私人設定／憑證就拒絕打包與產生差異，不把實值寫進日誌、錯誤或備份。

這些差異歸入既有「專案路徑與安裝／來源更新治理／矛盾修正／引用完整性」等六類理由，逐檔記精確 diff 與具體理由。`audit`、`apply` 及相同 commit 快速檢查均驗證必要規約；移除／改壞保護須先修正候選內容，測試失敗或未修正不得推進鎖定。工具文字檔固定 LF，二進位素材不轉換。

## 驗證、套用工具與回報

1. 先將工具本地治理、scripts、tests 加上 `candidate/` 組成隔離驗證副本，執行 `python -m unittest discover -s tests`。品牌範本變更時，先完成逐檔閱讀與例外核對，才可將隔離副本的範本雜湊設定為已審閱 candidate 的值供安裝測試；正式工具鎖定仍保持原值，留待驗證後 apply。確認引用、技能格式、安裝完整性、品牌保留及更新／移除均通過；對變更腳本做對應驗證。
2. 驗證成功後，執行 `python scripts/source_update.py apply --stage-dir "<暫存區>"`。它檢查來源 patch、新舊快照、必讀範圍雜湊、完整通用化 diff 理由、衝突與本地競態，交易式更新工具、鎖定及差異紀錄；備份在忽略的 `.maintenance/backups/`。同一來源重跑應無差異。舊格式暫存區須重新 prepare。
3. 執行 `python scripts/source_update.py audit`、技能格式檢查與 `git diff --check`，確認來源 commit、增刪改能力、管理範圍及雜湊一致。失敗時修正工具並重新驗證，不宣稱完成。
4. 回報確切來源 commit、完整能力變更、例外、實測結果及需外部帳號的未測項目。
5. **明確詢問：「是否將已驗證的 Hello Nora 同步至所在專案根目錄技能？」收到同意後才執行安裝器。** 記錄的工具相對位置可由專案 `.agents/hello-nora/manifest.json` 找回。先 `python scripts/install.py --project-root "<專案根目錄>"` 預覽，收到的同意涵蓋同步時再加 `--install` 執行。使用者未回答、拒絕或只要求更新工具，就停在工具更新完成，不寫入根目錄技能。
