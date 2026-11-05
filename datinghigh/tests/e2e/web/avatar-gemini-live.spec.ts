import {test,expect} from '@playwright/test';
import {register} from './support';
import {createHash} from 'node:crypto';
// 明確 opt-in，僅使用本次已授權照片；不記錄照片、Cookie、token、影片或 trace。
test.afterEach(async({page})=>{
 // 斷言失敗也清掉本測試帳號的來源照；憑證僅保留在Playwright記憶體context。
 const base='http://localhost:8787/api/v1',headers={'X-DatingHigh-Client':'web',Origin:'http://localhost:8081'};
 const own=await page.request.get(`${base}/me/dating-profile`,{headers});if(own.status()===401)return;
 expect(own.status()).toBe(200);for(const photo of (await own.json()).personalPhotos??[])expect((await page.request.delete(`${base}/me/photos/${photo.assetId}`,{headers,data:{}})).status()).toBe(204);
 expect((await page.request.delete(`${base}/session`,{headers,data:{}})).status()).toBe(204);
});
test('AP actual Web Gemini one candidate, cancel and explicit adoption',async({page})=>{
 test.skip(process.env.DATINGHIGH_GEMINI_LIVE!=='1','Requires explicitly authorized real provider run');test.setTimeout(240000);
 const paths=[process.env.DATINGHIGH_AVATAR_SOURCE_1,process.env.DATINGHIGH_AVATAR_SOURCE_2];expect(paths.every(Boolean)).toBe(true);
 await register(page,`ap-gemini-web-${Date.now()}@example.com`);await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();
 let generated=0;page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/me/avatar/generations'))generated++;});
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 for(const path of paths){const picker=page.waitForEvent('filechooser');await page.getByRole('button',{name:'新增個人照片',exact:true}).click();await(await picker).setFiles(path!);await expect(page.getByText('照片已壓縮並安全儲存',{exact:true})).toBeVisible({timeout:60000});}
 expect(generated).toBe(0);
 await expect(page.getByText('產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理；不會自動公開給其他玩家')).toBeVisible();expect(generated).toBe(0);
 await page.getByRole('button',{name:'開始產生第1張',exact:true}).click();
 await expect(page.getByRole('button',{name:'開始產生第1張',exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:'比較候選 1',exact:true})).toBeVisible({timeout:120000});expect(generated).toBe(1);
 await page.getByRole('button',{name:'採用這張',exact:true}).click();await expect(page.getByText(/未來正式付費上線後/)).toBeVisible();
 await page.getByRole('button',{name:'取消',exact:true}).click();await expect(page.getByRole('button',{name:'比較候選 1',exact:true})).toBeVisible();expect(generated).toBe(1);
 await page.getByRole('button',{name:'採用這張',exact:true}).click();await page.getByRole('button',{name:'確認採用',exact:true}).click();
 await expect(page.getByText('已採用選中的遊戲化身',{exact:true})).toBeVisible();expect(generated).toBe(1);
 await page.getByRole('button',{name:'免費化身',exact:true}).click();await expect(page.getByRole('img',{name:'目前遊戲化身',exact:true})).toBeVisible();
 const selected=await page.request.get('http://localhost:8787/api/v1/me/dating-profile',{headers:{'X-DatingHigh-Client':'web'}});const saved=await selected.json();expect(saved.generatedAvatars).toHaveLength(1);
 await page.getByRole('button',{name:'選用 male-01',exact:true}).click();await expect(page.getByText('遊戲化身已更新',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'選用已保存化身 1',exact:true}).click();await expect(page.getByText('已重新選用保存的化身',{exact:true})).toBeVisible();
 const restored=await(await page.request.get('http://localhost:8787/api/v1/me/dating-profile',{headers:{'X-DatingHigh-Client':'web'}})).json();
 expect(restored.selectedAvatarRef).toBe(saved.selectedAvatarRef);expect(restored.generatedAvatars).toHaveLength(1);expect(generated).toBe(1);
 // 清理本測試帳號來源照片；選中的正式化身依產品契約留存。
 await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 for(let n=0;n<2;n++){await page.getByRole('button',{name:'刪除照片 1',exact:true}).click();await page.getByRole('button',{name:'確認刪除',exact:true}).click();await expect(page.getByText('照片已刪除',{exact:true})).toBeVisible();}
 await page.getByRole('button',{name:'關閉',exact:true}).click();
 await page.getByRole('button',{name:'返回帳號',exact:true}).click();await page.getByRole('button',{name:'登出',exact:true}).click();
});

test('AP actual Web four Gemini candidates, two-tab race, replay and adopt candidate two',async({page,context})=>{
 test.skip(process.env.DATINGHIGH_GEMINI_LIVE!=='1','Requires explicitly authorized real provider run');test.setTimeout(360000);
 const paths=[process.env.DATINGHIGH_AVATAR_SOURCE_1,process.env.DATINGHIGH_AVATAR_SOURCE_2];expect(paths.every(Boolean)).toBe(true);
 const endpoint='http://localhost:8787/api/v1/me/avatar/generations';
 const webHeaders={'X-DatingHigh-Client':'web',Origin:'http://localhost:8081'};
 await register(page,`ap-four-web-${Date.now()}@example.com`);await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 for(const path of paths){const picker=page.waitForEvent('filechooser');await page.getByRole('button',{name:'新增個人照片',exact:true}).click();await(await picker).setFiles(path!);await expect(page.getByText('照片已壓縮並安全儲存',{exact:true})).toBeVisible({timeout:60000});}
 await page.getByRole('button',{name:'開始產生第1張',exact:true}).click();await expect(page.getByRole('button',{name:'比較候選 1',exact:true})).toBeVisible({timeout:120000});
 const other=await context.newPage();await other.goto('/profile');await other.getByRole('button',{name:'選擇化身',exact:true}).click();await other.getByRole('button',{name:'AI 客製化',exact:true}).click();
 await expect(other.getByRole('button',{name:'比較候選 1',exact:true})).toBeVisible();
 const accepts=(r:import('@playwright/test').Response)=>r.url()===endpoint&&r.request().method()==='POST';
 const responses=Promise.all([page.waitForResponse(accepts,{timeout:120000}),other.waitForResponse(accepts,{timeout:120000})]);
 await Promise.all([page.getByRole('button',{name:'產生下一張',exact:true}).click(),other.getByRole('button',{name:'產生下一張',exact:true}).click()]);
 const raced=await responses;expect(raced.map(r=>r.status()).sort()).toEqual([200,409]);
 let winner=raced[0].status()===200?page:other,loser=winner===page?other:page;const successful=raced.find(r=>r.status()===200)!;
 await expect(winner.getByRole('button',{name:'比較候選 2',exact:true})).toBeVisible({timeout:120000});
 await expect(loser.getByText('本輪仍有操作進行中，請保留目前候選並稍後查看',{exact:true})).toBeVisible();
 const second=await successful.json();expect(second.producedCount).toBe(2);
 const replay=await winner.request.post(endpoint,{headers:webHeaders,data:successful.request().postDataJSON()});expect(replay.status()).toBe(200);expect(await replay.json()).toEqual(second);
 await winner.getByRole('button',{name:'產生下一張',exact:true}).click();await expect(winner.getByRole('button',{name:'比較候選 3',exact:true})).toBeVisible({timeout:120000});
 // 第二張與第四張都以真瀏覽器分頁競爭；不得用第二張的結果直接放行第四張前置。
 await loser.reload();await loser.getByRole('button',{name:'選擇化身',exact:true}).click();await loser.getByRole('button',{name:'AI 客製化',exact:true}).click();await expect(loser.getByRole('button',{name:'比較候選 3',exact:true})).toBeVisible();
 const fourthResponses=Promise.all([winner.waitForResponse(accepts,{timeout:120000}),loser.waitForResponse(accepts,{timeout:120000})]);
 await Promise.all([winner.getByRole('button',{name:'產生下一張',exact:true}).click(),loser.getByRole('button',{name:'產生下一張',exact:true}).click()]);
 const fourthRace=await fourthResponses;expect(fourthRace.map(r=>r.status()).sort()).toEqual([200,409]);if(fourthRace[0].status()!==200)[winner,loser]=[loser,winner];
 const fourthSuccess=fourthRace.find(r=>r.status()===200)!,fourth=await fourthSuccess.json();expect(fourth.producedCount).toBe(4);expect(fourth.index).toBe(4);await expect(winner.getByRole('button',{name:'比較候選 4',exact:true})).toBeVisible({timeout:120000});
 const fourthReplay=await winner.request.post(endpoint,{headers:webHeaders,data:fourthSuccess.request().postDataJSON()});expect(fourthReplay.status()).toBe(200);expect(await fourthReplay.json()).toEqual(fourth);
 const fifth=await winner.request.post(endpoint,{headers:webHeaders,data:{...fourthSuccess.request().postDataJSON(),clientRequestId:'019a281e-0000-7000-8000-000000999998'}});expect(fifth.status()).toBe(409);

 await expect(winner.getByRole('button',{name:'產生下一張',exact:true})).toBeDisabled();
 const digests:string[]=[];for(const index of [1,2,3,4]){
  const image=winner.getByRole('img',{name:`AI 候選 ${index}`,exact:true});await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  // React Native Web以同層背景div顯示Image，語意img只負責載入／無障礙。
  expect(await image.evaluate(el=>getComputedStyle(el.parentElement!.querySelector('div[style*="background-image"]')!).backgroundSize)).toBe('contain');
  const actual=await winner.request.get(`http://localhost:8787/api/v1/me/avatar/candidates/${second.attemptId}/${index}`,{headers:webHeaders});expect(actual.status()).toBe(200);digests.push(createHash('sha256').update(await actual.body()).digest('hex'));
 }expect(new Set(digests).size).toBe(4);
 await winner.getByRole('button',{name:'比較候選 2',exact:true}).click();await expect(winner.getByRole('button',{name:'比較候選 2',exact:true})).toHaveAttribute('aria-pressed','true');
 await winner.getByRole('button',{name:'採用這張',exact:true}).click();await winner.getByRole('button',{name:'確認採用',exact:true}).click();await expect(winner.getByText('已採用選中的遊戲化身',{exact:true})).toBeVisible();
 const saved=await(await winner.request.get('http://localhost:8787/api/v1/me/dating-profile',{headers:webHeaders})).json();expect(saved.generatedAvatars).toHaveLength(1);
 const formal=await winner.request.get(`http://localhost:8787/api/v1/me/media/${saved.selectedAvatarRef}`,{headers:webHeaders});expect(formal.status()).toBe(200);expect(createHash('sha256').update(await formal.body()).digest('hex')).toBe(digests[1]);
 for(let n=0;n<2;n++){await winner.getByRole('button',{name:'刪除照片 1',exact:true}).click();await winner.getByRole('button',{name:'確認刪除',exact:true}).click();await expect(winner.getByText('照片已刪除',{exact:true})).toBeVisible();}
 await winner.getByRole('button',{name:'關閉',exact:true}).click();
 await loser.close();await winner.getByRole('button',{name:'返回帳號',exact:true}).click();await winner.getByRole('button',{name:'登出',exact:true}).click();
});
