# Staging／production 驗收

對應 PF-E2E-004/019/020/023/024、PF-BDD-093/094。此清單是待執行流程，不是通過證據。

1. 核對 `cloudflare/deployment-targets.json` 與 `wrangler.staging.jsonc` 的 account、D1 ID、R2、HTTPS origin。現有 D1 `datinghigh-staging`、私人 bucket `datinghigh-staging-private` 已建立，migration／probe 已套用。不要將測試預設改成 production。
2. 確認帳號可使用 Containers。2026-10-29 部署實際回覆未啟用 Workers Paid；未進行付費升級。Worker／assets upload 不代表容器已運行。
3. 完成 Cloudflare Email Service sender domain onboarding，加入 `send_email: [{name: "EMAIL"}]` 及已驗證的 `EMAIL_FROM`，保持 `EmailDeliveryMode=Cloudflare`。目前缺此 binding／sender，`npm run preflight:staging` 應拒絕；不得改 Log 過關。[官方 binding／send API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)。
4. 設定三個環境獨立、至少 32-byte Base64 secrets，沿用既有秘密，不在重啟重造。Google 設 Web JS origin、Android package／簽章 SHA、iOS bundle/client/scheme；把相應 audience／azp 公開 IDs 放入 server allowlist 與 native build。不要提供 client secret。
5. 記錄 D1 checkpoint 與相容 migration，完成 preflight。以相同 origin 的 `EXPO_PUBLIC_API_ORIGIN=""` export 到 `.local/staging-web`，建置 Docker，僅套向前 migration；失敗停止後續發布。probe digest 應等於本地相同固定文字。
6. 部署 Worker／Container／assets，記版本與映像 digest。實測 live／ready、未知 API JSON404、公網 internal404、偽造信任 header 無效；.NET probe 必須真的穿過 outbound handler。
7. 用可控制的實際信箱收到註冊與 reset 碼，完成兩條流程；只保存去敏 message ID、時間及結果。202／message ID 不能代替收件。Google 首次201／既有200／同 proof 重用、同 Email 防重與 link/unlink 都需真 SDK／Google 證據。
8. 逐次跨平台登入同帳號，確認最後 commit 唯一有效；舊 Access／Refresh 即拒絕，舊 UI 下次 API／回前景清除。測 Refresh grace200、舊代409、逾30秒重放401並撤原 family，額度滿不阻擋重放撤銷；舊裝置 logout 不影響新登入。
9. 重建容器後仍有效的 Account／family／EmailChallenge／R2 probe 保留；已撤銷的 family 不能復活。以兩帳號驗私人 R2 put/get/delete 隔離，測 SQL fault rollback、sender 10秒故障與 cooldown resend。
10. 只有相容 schema 的舊 Worker／image／assets 可作程式 rollback，不自動清空或還原 D1。資料還原是另外的具體復原操作。production 尚未配置／授權，不在本輪發布。

每一步記執行時間、平台／環境、build ID、指令、結果與去敏證據參照，更新 `docs/verification/foundation-evidence.json` 及稽核表。單純填 `passed` 不是證據。
