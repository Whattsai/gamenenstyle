import {test,expect} from '@playwright/test';
import {register,password,prepareBuiltinGender,returnFromProfile} from './support';
import path from 'node:path';
import {readFileSync} from 'node:fs';

test.setTimeout(180000);
// 真本地 Web／Cookie／D1/R2；圖片上傳 UI 以虛構插畫作無個資的格式 fixture。
test('AP Web profile, sixteen real assets, free selection, photo picker, delete confirmation and card whitelist',async({page})=>{
 const email=`ap-web-${Date.now()}@example.com`;await register(page,email);
 await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();
 await expect(page.getByLabel('暱稱',{exact:true})).toBeVisible();
 await page.getByLabel('暱稱',{exact:true}).fill('星河旅人');
 await page.getByLabel('一句自我介紹',{exact:true}).fill('喜歡手作與散步');
 await page.getByLabel('工作／職業',{exact:true}).fill('工程師');
 await page.getByLabel('生日',{exact:true}).fill('1995-01-01');
 await page.getByRole('checkbox',{name:'生理性別：多元',exact:true}).click();
 await page.getByRole('button',{name:'儲存',exact:true}).click();
 await expect(page.getByText('個人資料已儲存',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();
 await expect(page.getByRole('button',{name:/選用 (male|female)-0[1-8]/})).toHaveCount(16);
 for(const group of ['male','female'])for(let n=1;n<=8;n++){
  const image=page.getByRole('img',{name:`${group}-0${n}`,exact:true});
  await expect(image).toHaveCount(1);
  await expect.poll(()=>image.evaluate(element=>(element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const frame=await image.boundingBox();expect(frame).not.toBeNull();
  expect(frame!.width).toBeGreaterThan(0);expect(Math.abs(frame!.height/frame!.width-4/3)).toBeLessThan(0.03);
 }
 await page.getByRole('button',{name:'選用 female-05',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByText('遊戲化身已更新',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'選用 female-05',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByText('目前選用 · female-05',{exact:true}).filter({visible:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'關閉',exact:true}).click();
 await expect(page.getByLabel('暱稱',{exact:true})).toHaveValue('星河旅人');
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 await expect(page.getByText('請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱')).toBeVisible();
 const oversize=page.waitForEvent('filechooser');await page.getByRole('button',{name:'新增個人照片'}).click();
 await(await oversize).setFiles({name:'oversize.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(8*1024*1024+1)});
 await expect(page.getByText('照片超過 8 MiB，請選擇較小的圖片',{exact:true})).toBeVisible();
 await expect(page.getByRole('img',{name:'個人照片 1',exact:true})).toHaveCount(0);
 const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'新增個人照片'}).click();
 await expect(page.getByRole('button',{name:'新增個人照片',exact:true})).toBeDisabled();
 await (await chooser).setFiles(path.resolve('frontend/client/assets/avatars/female-08.jpg'));
 await expect(page.getByText('照片已壓縮並安全儲存',{exact:true})).toBeVisible({timeout:60000});
 await expect(page.getByRole('img',{name:'個人照片 1',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'關閉',exact:true}).click();
 await page.getByRole('button',{name:'預覽同意後的名片',exact:true}).click();
 await expect(page.getByText('這是你自己的預覽，尚未授權其他玩家查看；未來須在有效互動中由雙方同意。',{exact:true})).toBeVisible();
 await expect(page.getByRole('img',{name:'名片照片 1',exact:true})).toBeVisible();
 await expect.poll(()=>page.getByRole('img',{name:'名片照片 1',exact:true}).evaluate(element=>(element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'返回',exact:true}).click();
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 await page.getByRole('button',{name:'刪除照片 1',exact:true}).click();
 await expect(page.getByText('確定刪除這張照片？',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'取消',exact:true}).click();
 await expect(page.getByRole('img',{name:'個人照片 1',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'刪除照片 1',exact:true}).click();await page.getByRole('button',{name:'確認刪除',exact:true}).click();
 await expect(page.getByText('照片已刪除',{exact:true})).toBeVisible();
 await expect(page.getByRole('img',{name:'個人照片 1',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'關閉',exact:true}).click();
 await expect(page.getByRole('img',{name:'名片照片 1',exact:true})).toHaveCount(0);
 const preview=page.waitForResponse(r=>r.url().endsWith('/api/v1/me/card-preview'));
 await page.getByRole('button',{name:'預覽同意後的名片'}).click();
 const shared=await (await preview).json();expect(shared.occupation).toBe('工程師');
 expect(shared.birthDate).toBeUndefined();expect(shared.preferredAgeMin).toBeUndefined();expect(shared.email).toBeUndefined();await page.getByRole('button',{name:'返回',exact:true}).click();
 await page.reload();await expect(page.getByLabel('暱稱',{exact:true})).toHaveValue('星河旅人',{timeout:30000});
 await page.setViewportSize({width:360,height:800});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 const again=page.waitForEvent('filechooser');await page.getByRole('button',{name:'新增個人照片'}).click();await(await again).setFiles(path.resolve('frontend/client/assets/avatars/female-08.jpg'));await expect(page.getByText('照片已壓縮並安全儲存',{exact:true})).toBeVisible();
 const before=await(await page.request.get('http://localhost:8787/api/v1/me/dating-profile',{headers:{'X-DatingHigh-Client':'web'}})).json();
 await page.getByRole('button',{name:'關閉',exact:true}).click();
 await returnFromProfile(page);await page.getByRole('button',{name:'登出',exact:true}).click();
 await page.getByRole('button',{name:'使用 Email 登入',exact:true}).click();await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('密碼',{exact:true}).fill(password);await page.getByRole('button',{name:'登入',exact:true}).click();await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();
 await expect(page.getByLabel('暱稱',{exact:true})).toHaveValue('星河旅人');await expect(page.getByLabel('工作／職業',{exact:true})).toHaveValue('工程師');
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await expect(page.getByText('目前選用 · female-05',{exact:true}).filter({visible:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'AI 客製化',exact:true}).click();await expect(page.getByRole('img',{name:'個人照片 1',exact:true})).toBeVisible();
 const reread=await(await page.request.get('http://localhost:8787/api/v1/me/dating-profile',{headers:{'X-DatingHigh-Client':'web'}})).json();expect(reread.personalPhotos).toEqual(before.personalPhotos);expect(reread.revision).toBe(before.revision);expect(reread.selectedAvatarRef).toBe('female-05');
 await page.getByRole('button',{name:'刪除照片 1',exact:true}).click();await page.getByRole('button',{name:'確認刪除',exact:true}).click();await expect(page.getByText('照片已刪除',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'關閉',exact:true}).click();
 await returnFromProfile(page);await page.getByRole('button',{name:'登出',exact:true}).click();
});

test('AP Web empty photo picker cancellation keeps notice and never uploads',async({page})=>{
 await register(page,`ap-cancel-web-${Date.now()}@example.com`);await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 const empty='尚未上傳照片；仍可直接選擇免費化身。';await expect(page.getByText(empty,{exact:true})).toBeVisible();
 await expect(page.getByText('請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱')).toBeVisible();
 let uploads=0;page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/me/photos'))uploads++;});
 const picker=page.waitForEvent('filechooser');await page.getByRole('button',{name:'新增個人照片',exact:true}).focus();await page.keyboard.press('Enter');await(await picker).setFiles([]);
 await expect(page.getByRole('button',{name:'新增個人照片',exact:true})).toBeEnabled();await expect(page.getByText(empty,{exact:true})).toBeVisible();
 await expect(page.getByText('照片已壓縮並安全儲存',{exact:true})).toHaveCount(0);expect(uploads).toBe(0);
 await page.getByRole('button',{name:'關閉',exact:true}).click();
 await returnFromProfile(page);await page.getByRole('button',{name:'登出',exact:true}).click();
});

test('AP Web three photos reorder, stale revision and delete confirmation preserve current list',async({page})=>{
 await register(page,`ap-order-web-${Date.now()}@example.com`);await prepareBuiltinGender(page);await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 for(const n of ['01','02','03']){const picker=page.waitForEvent('filechooser');await page.getByRole('button',{name:'新增個人照片',exact:true}).click();await(await picker).setFiles(path.resolve(`frontend/client/assets/avatars/female-${n}.jpg`));await expect(page.getByText('照片已壓縮並安全儲存',{exact:true})).toBeVisible({timeout:60000});}
 const base='http://localhost:8787/api/v1',headers={'X-DatingHigh-Client':'web',Origin:'http://localhost:8081'};
 const profile=async()=>await(await page.request.get(`${base}/me/dating-profile`,{headers})).json();
 const first=await profile(),ids=first.personalPhotos.map((p:{assetId:string})=>p.assetId);expect(ids).toHaveLength(3);
 await page.getByRole('button',{name:'照片 3 往前移',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByText('照片順序已更新',{exact:true})).toBeVisible();
 const reordered=await profile();expect(reordered.personalPhotos.map((p:{assetId:string})=>p.assetId)).toEqual([ids[0],ids[2],ids[1]]);
 await expect(page.getByRole('img',{name:'個人照片 2',exact:true})).toHaveAttribute('src',new RegExp(ids[2]));
 const changed=await page.request.put(`${base}/me/avatar/selection`,{headers,data:{type:'builtin',builtinAvatarId:'male-02',expectedRevision:reordered.revision}});expect(changed.status()).toBe(200);
 await page.getByRole('button',{name:'照片 1 往後移',exact:true}).click();await expect(page.getByText('資料已在其他地方更新，請重新整理後再修改',{exact:true})).toBeVisible();
 expect((await profile()).personalPhotos.map((p:{assetId:string})=>p.assetId)).toEqual([ids[0],ids[2],ids[1]]);
 await expect(page.getByRole('img',{name:'個人照片 2',exact:true})).toHaveAttribute('src',new RegExp(ids[2]));
 await page.getByRole('button',{name:'關閉',exact:true}).click();
 await page.reload();await expect(page.getByLabel('暱稱',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await expect(page.getByText('目前選用 · male-02',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 await page.getByRole('button',{name:'刪除照片 2',exact:true}).click();await page.getByRole('button',{name:'取消',exact:true}).click();expect((await profile()).personalPhotos).toHaveLength(3);
 await page.getByRole('button',{name:'刪除照片 2',exact:true}).click();await page.getByRole('button',{name:'確認刪除',exact:true}).click();await expect(page.getByText('照片已刪除',{exact:true})).toBeVisible();
 expect((await profile()).personalPhotos.map((p:{assetId:string})=>p.assetId)).toEqual([ids[0],ids[1]]);
 for(let n=0;n<2;n++){await page.getByRole('button',{name:'刪除照片 1',exact:true}).click();await page.getByRole('button',{name:'確認刪除',exact:true}).click();await expect(page.getByText('照片已刪除',{exact:true})).toBeVisible();}
 await page.getByRole('button',{name:'關閉',exact:true}).click();
 await returnFromProfile(page);await page.getByRole('button',{name:'登出',exact:true}).click();
});

test('AP Web AI entry is read-only until explicit generation and rejects anonymous card guessing',async({page})=>{
 await register(page,`ap-disclosure-${Date.now()}@example.com`);
 await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();
 let sent=0;page.on('request',request=>{if(request.url().endsWith('/me/avatar/generations'))sent++;});
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();
 await page.getByRole('button',{name:'AI 客製化'}).click();
 await expect(page.getByText('產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理；不會自動公開給其他玩家')).toBeVisible();
 await expect(page.getByText(/至少需要 2 張已保存的個人照片/)).toBeVisible();await expect(page.getByText('重新嘗試可能增加第三方供應商成本；本 MVP 目前免費，不扣款。',{exact:true})).toBeVisible();expect(sent).toBe(0);
 const response=await page.request.get('http://localhost:8787/api/v1/users/guessed/card',{headers:{'X-DatingHigh-Client':'web'}});
 expect(response.status()).toBe(404);
 await page.getByRole('button',{name:'關閉',exact:true}).click();
 await returnFromProfile(page);await page.getByRole('button',{name:'登出',exact:true}).click();
});

test('AP Web profile gives specific birthday and paired-age feedback, then saves a blank occupation',async({page})=>{
 await register(page,`ap-validation-${Date.now()}@example.com`);await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();
 await page.getByLabel('暱稱',{exact:true}).fill('星河旅人');let writes=0;page.on('request',r=>{if(r.method()==='PUT'&&r.url().endsWith('/me/dating-profile'))writes++;});
 await page.getByLabel('生日',{exact:true}).fill('2015-01-01');await page.getByRole('button',{name:'儲存',exact:true}).click();
 await expect(page.getByText('需年滿 18 歲才能完成個人資料，請確認生日',{exact:true})).toBeVisible();expect(writes).toBe(0);
 await page.getByLabel('生日',{exact:true}).fill('2026-02-30');await page.getByRole('button',{name:'儲存',exact:true}).click();
 await expect(page.getByText('生日請填寫有效日期（YYYY-MM-DD），且不可晚於今天',{exact:true})).toBeVisible();expect(writes).toBe(0);
 await page.getByLabel('生日',{exact:true}).fill('1995-01-01');
 await page.getByRole('checkbox',{name:'生理性別：多元',exact:true}).click();await page.getByLabel('偏好最小年齡',{exact:true}).fill('25');
 await page.getByRole('button',{name:'儲存',exact:true}).click();await expect(page.getByText('年齡偏好的最小與最大值請一起填寫，或一起留空',{exact:true})).toBeVisible();expect(writes).toBe(0);
 await page.getByLabel('偏好最大年齡',{exact:true}).fill('24');await page.getByRole('button',{name:'儲存',exact:true}).click();
 await expect(page.getByText('年齡偏好須為 18 至 120 歲，且最小不大於最大',{exact:true})).toBeVisible();expect(writes).toBe(0);
 await page.getByLabel('偏好最大年齡',{exact:true}).fill('35');await page.getByLabel('工作／職業',{exact:true}).fill('   ');
 await page.getByRole('button',{name:'儲存',exact:true}).click();await expect(page.getByText('個人資料已儲存',{exact:true})).toBeVisible();expect(writes).toBe(1);
 const saved=await(await page.request.get('http://localhost:8787/api/v1/me/dating-profile',{headers:{'X-DatingHigh-Client':'web'}})).json();expect(saved.occupation).toBeNull();expect(saved.preferredAgeMin).toBe(25);expect(saved.preferredAgeMax).toBe(35);expect(saved.revision).toBe(2);
 await page.route('**/api/v1/me/dating-profile',async route=>{if(route.request().method()==='PUT')await route.fulfill({status:400,contentType:'application/json',json:{code:'INVALID_PROFILE'}});else await route.continue();});
 await page.getByRole('checkbox',{name:'解謎',exact:true}).click();await page.getByRole('button',{name:'儲存',exact:true}).click();await expect(page.getByText('請確認生日、文字長度、標籤與配對條件',{exact:true})).toBeVisible();await expect(page.getByLabel('偏好最小年齡',{exact:true})).toHaveValue('25');
 await page.unroute('**/api/v1/me/dating-profile');const unchanged=await(await page.request.get('http://localhost:8787/api/v1/me/dating-profile',{headers:{'X-DatingHigh-Client':'web'}})).json();expect(unchanged.revision).toBe(2);expect(unchanged.interestTagIds).toEqual(saved.interestTagIds);

 await returnFromProfile(page);await page.getByRole('button',{name:'登出',exact:true}).click();
});

test('AP Web no consent exposes no other-player photo entry and rejects guessed own-media routes',async({page,browser})=>{
 const a=await register(page,`ap-private-a-${Date.now()}@example.com`);const created=await a.result.json();
 const headers={'X-DatingHigh-Client':'web',Origin:'http://localhost:8081'},base='http://localhost:8787/api/v1';
 const upload=await page.request.post(base+'/me/photos',{headers:{...headers,'Content-Type':'image/jpeg'},data:readFileSync(path.resolve('frontend/client/assets/avatars/male-04.jpg'))});expect(upload.status()).toBe(201);const asset=(await upload.json()).assetId;
 const other=await browser.newContext({baseURL:'http://localhost:8081'});const b=await other.newPage();
 try{
  await register(b,`ap-private-b-${Date.now()}@example.com`);await b.getByRole('button',{name:'個人資料與遊戲化身'}).click();
  await b.getByRole('button',{name:'選擇化身',exact:true}).click();await b.getByRole('button',{name:'AI 客製化',exact:true}).click();
  await expect(b.getByRole('img',{name:/個人照片/})).toHaveCount(0);await expect(b.getByRole('button',{name:/查看對方照片|查看對方名片|交換名片/})).toHaveCount(0);
  const known=await b.request.get(`${base}/me/media/${asset}`,{headers}),unknown=await b.request.get(`${base}/me/media/019a281e-0000-7000-8000-000000999999`,{headers});expect(known.status()).toBe(404);expect(unknown.status()).toBe(404);const {traceId:knownTrace,...knownProblem}=await known.json(),{traceId:unknownTrace,...unknownProblem}=await unknown.json();expect(knownTrace).toBeTruthy();expect(unknownTrace).toBeTruthy();expect(knownProblem).toEqual(unknownProblem);expect(JSON.stringify(await known.json())).not.toMatch(/private\/|objectKey|https?:/);
  expect((await b.request.get(`${base}/users/${created.account.accountId}/card`,{headers})).status()).toBe(404);
  expect((await page.request.get(`${base}/me/media/${asset}`,{headers})).status()).toBe(200);
  await b.getByRole('button',{name:'關閉',exact:true}).click();
  await returnFromProfile(b);await b.getByRole('button',{name:'登出',exact:true}).click();
 }finally{await other.close();await page.request.delete(`${base}/me/photos/${asset}`,{headers,data:{}});await page.getByRole('button',{name:'登出',exact:true}).click();}
});
