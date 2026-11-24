import {test,expect,type APIRequestContext} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {startBackend,stopBackend,control,routeBackend,type Backend,avatarFixturePassword} from './backend';

// 明選真供應商；來源路徑與金鑰只在RAM，隔離D1/R2不觸碰default local。
const enabled=process.env.DATINGHIGH_GEMINI_LIVE==='1';
const approvedMaster=process.env.DATINGHIGH_E2E_APPROVED_MASTER;
const replay=process.env.DATINGHIGH_E2E_GEMINI_REPLAY;
const generatedEvidence=path.resolve('.local/evidence/avatar-full-body-gemini',new Date().toISOString().replace(/[^0-9TZ]/g,''));
let backend:Backend|undefined,management:APIRequestContext;
test.setTimeout(1200000);test.use({trace:'off',video:'off'});
test.beforeAll(async({playwright})=>{
 if(!enabled)return;
 const key=replay?'test-only-recorded-response':fs.readFileSync('cloudflare/.dev.vars','utf8').split(/\r?\n/).find(l=>/^GEMINI_API_KEY\s*=/.test(l))?.split('=').slice(1).join('=').trim().replace(/^(['"])(.*)\1$/,'$2');
 if(!key)throw Error('Real provider key is not configured');
 management=await playwright.request.newContext();backend=await startBackend({DATINGHIGH_E2E_MATCHING_PROFILE:'1',DATINGHIGH_E2E_AVATAR_PROFILE:'1',DATINGHIGH_E2E_REAL_GEMINI:'1',DATINGHIGH_E2E_GEMINI_EVIDENCE:generatedEvidence,...(approvedMaster?{DATINGHIGH_E2E_APPROVED_MASTER:path.resolve(approvedMaster)}:{}),...(replay?{DATINGHIGH_E2E_GEMINI_REPLAY:path.resolve(replay)}:{}),GEMINI_API_KEY:key});
 await control(backend,management,{op:'reset'});await control(backend,management,{op:'matching-seed'});
});
test.afterAll(async()=>{if(backend)await stopBackend(backend,management);await management?.dispose();});

test(replay?'recorded real Gemini responses: static package adoption without provider requests':process.env.DATINGHIGH_AVATAR_CANDIDATE_ONLY==='1'?'real Gemini: one full-body candidate for identity review only':'real Gemini: selected master produces a complete static package for explicit adoption',async({page})=>{
 test.skip(!enabled,'Requires explicitly authorized source photos and real provider opt-in');
 const files=[process.env.DATINGHIGH_AVATAR_SOURCE_1,process.env.DATINGHIGH_AVATAR_SOURCE_2];expect(files.every(f=>f&&fs.existsSync(f))).toBe(true);
 await routeBackend(page,backend!,110000);await page.goto('/login');await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill('matching-0@example.test');await page.getByLabel('密碼',{exact:true}).filter({visible:true}).fill(avatarFixturePassword);await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page).toHaveURL(/\/matching$/);
 await page.goto('/profile');await page.getByRole('button',{name:'選擇化身',exact:true}).click();await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 for(const file of files){const picker=page.waitForEvent('filechooser');await page.getByRole('button',{name:'新增個人照片',exact:true}).click();await(await picker).setFiles(file!);await expect(page.getByText('照片已壓縮並安全儲存',{exact:true})).toBeVisible({timeout:60000});}
 await expect(page.getByText('產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理；不會自動公開給其他玩家')).toBeVisible();
 let candidates=0,expressions=0;page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/me/avatar/generations'))candidates++;if(r.method()==='POST'&&r.url().endsWith('/me/avatar/expressions/next'))expressions++;});
 await page.getByRole('button',{name:'開始產生第1張',exact:true}).click();await expect(page.getByRole('button',{name:'比較候選 1',exact:true})).toBeVisible({timeout:120000});
 const candidate=page.getByRole('img',{name:'AI 候選 1',exact:true});await expect.poll(()=>candidate.evaluate(e=>(e as HTMLImageElement).naturalHeight/(e as HTMLImageElement).naturalWidth)).toBeCloseTo(4/3,1);
 const output=generatedEvidence;fs.mkdirSync(output,{recursive:true});
 const bytes=await page.evaluate(async()=>{const p=await(await fetch('/api/v1/me/dating-profile',{headers:{'X-DatingHigh-Client':'web'}})).json();const r=await fetch(`/api/v1/me/avatar/candidates/${p.avatarAttempt.attemptId}/1`,{headers:{'X-DatingHigh-Client':'web'}});return Array.from(new Uint8Array(await r.arrayBuffer()));});
 fs.writeFileSync(path.join(output,'candidate.jpg'),new Uint8Array(bytes));
 if(approvedMaster)expect(Buffer.from(bytes)).toEqual(fs.readFileSync(approvedMaster));
 if(process.env.DATINGHIGH_AVATAR_CANDIDATE_ONLY==='1'){
  expect(candidates).toBe(1);expect(expressions).toBe(0);
  fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({executedAt:new Date().toISOString(),provider:'real Gemini default configured model',candidateOnly:true,candidateRequests:candidates,expressionRequests:expressions,visualApproval:'pending-user-review'},null,2)+'\n');return;
 }
 await page.getByRole('button',{name:'採用這張',exact:true}).click();
 let response=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/me/avatar/expressions/next'),{timeout:120000});await page.getByRole('button',{name:'確認採用',exact:true}).click();
 for(let n=0;n<9;n++){const value=await response;if(value.status()!==200){let code='PROVIDER_REQUEST_FAILED';try{code=(await value.json()).code??code;}catch{}fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({executedAt:new Date().toISOString(),phase:'expression',completed:n,status:value.status(),code,candidateRequests:candidates,expressionRequests:expressions},null,2)+'\n');}expect(value.status()).toBe(200);if(n<8)response=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().endsWith('/me/avatar/expressions/next'),{timeout:120000});}
 await expect(page.getByTestId('avatar-static-review')).toBeVisible({timeout:30000});
 const adopt=page.getByRole('button',{name:'確認採用完整靜態化身',exact:true});await expect(adopt).toBeEnabled({timeout:60000});await adopt.click();
 await expect(page.getByText('已採用完整靜態化身',{exact:true})).toBeVisible({timeout:30000});expect(candidates).toBe(1);expect(expressions).toBe(9);
 const pack=await page.evaluate(async()=>{const h={'X-DatingHigh-Client':'web'},p=await(await fetch('/api/v1/me/dating-profile',{headers:h})).json();return(await fetch(`/api/v1/me/avatar/assets/${p.selectedAvatarRef}/expressions`,{headers:h})).json();});
 expect(pack.avatarAssetSpecVersion).toBe('full-body.v1');expect(Object.keys(pack.expressions)).toHaveLength(5);
 const evidence=[];for(const [expression,image]of Object.entries(pack.expressions)as [string,any][]){const content=await page.evaluate(async url=>Array.from(new Uint8Array(await(await fetch(url,{headers:{'X-DatingHigh-Client':'web'}})).arrayBuffer())),image.url);const bytes=Buffer.from(content);expect(createHash('sha256').update(bytes).digest('hex')).toBe(image.sha256);fs.writeFileSync(path.join(output,expression+'.webp'),bytes);evidence.push({expression,sha256:image.sha256,width:image.width,height:image.height,bytes:bytes.length});}
 expect(pack.staticPosePackage.poses).toHaveLength(4);const poses=[];for(const image of pack.staticPosePackage.assets){const data=await page.evaluate(async url=>Array.from(new Uint8Array(await(await fetch(url,{headers:{'X-DatingHigh-Client':'web'}})).arrayBuffer())),image.url);const bytes=Buffer.from(data);expect(createHash('sha256').update(bytes).digest('hex')).toBe(image.sha256);fs.writeFileSync(path.join(output,`pose-${image.id}.png`),bytes);poses.push({pose:image.id,sha256:image.sha256,width:image.width,height:image.height,bytes:bytes.length});}
 // 驗收只截成功提示，避免額外保存畫面中本人來源照片的副本。
 await page.getByText('已採用完整靜態化身',{exact:true}).screenshot({path:path.join(output,'adopted-web.png')});fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({executedAt:new Date().toISOString(),provider:replay?'recorded real Gemini responses; zero provider calls':'real Gemini default configured model',candidateOrigin:approvedMaster?'replayed user-approved real Gemini master':'new live generation',candidateProviderRequests:approvedMaster?0:1,expressionProviderRequests:replay?0:9,candidateRequests:candidates,expressionRequests:expressions,expressions:evidence,poses,visualApproval:'pending-user-review'},null,2)+'\n');
});
