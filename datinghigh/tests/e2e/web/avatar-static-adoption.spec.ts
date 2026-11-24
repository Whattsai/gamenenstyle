import {test,expect,type APIRequestContext} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {startBackend,stopBackend,control,routeBackend,type Backend,avatarFixturePassword} from './backend';
let backend:Backend,management:APIRequestContext;
test.setTimeout(240000);
test.beforeAll(async({playwright})=>{management=await playwright.request.newContext();backend=await startBackend({DATINGHIGH_E2E_AVATAR_PROFILE:'1'});});
test.afterAll(async()=>{if(backend)await stopBackend(backend,management);await management?.dispose();});
test('AI static adoption: real private workflow builds once, previews twenty states and commits only after explicit review',async({page,request})=>{
 await control(backend,request,{op:'reset',seed:true});await routeBackend(page,backend);
 await page.goto('/login');await page.getByLabel('Email',{exact:true}).fill('owner@example.com');await page.getByLabel('密碼',{exact:true}).fill(avatarFixturePassword);
 await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page).not.toHaveURL(/\/login$/);
 await page.goto('/profile');await page.getByLabel('暱稱',{exact:true}).waitFor();await control(backend,request,{op:'avatar-seed-photos',count:2});await page.reload();
 const profile=()=>page.evaluate(async()=>{return(await fetch('/api/v1/me/dating-profile',{headers:{'X-DatingHigh-Client':'web'}})).json();});
 const before=await profile(),steps:string[]=[],started=Date.now();let selects=0,reviews=0,failedPreview=false;
 await page.route('**/api/v1/me/avatar/expressions/*/poses/hold',async route=>{if(!failedPreview){failedPreview=true;await route.abort('failed');}else await route.fallback();});
 page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/avatar/expressions/next'))steps.push(r.postDataJSON().expression);if(r.method()==='PUT'&&r.url().endsWith('/avatar/selection'))selects++;if(r.method()==='POST'&&r.url().endsWith('/avatar/expressions/review'))reviews++;});
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await page.getByRole('button',{name:'AI 客製化',exact:true}).click();
 await page.getByRole('button',{name:'開始產生第1張',exact:true}).click();await page.getByRole('button',{name:'採用這張',exact:true}).click();await page.getByRole('button',{name:'確認採用',exact:true}).click();
 const preview=page.getByTestId('avatar-static-review');await expect(preview).toBeVisible({timeout:120000});
 const confirm=page.getByRole('button',{name:'確認採用完整靜態化身',exact:true});
 await expect(preview.getByText('成品圖片載入失敗，尚未採用。',{exact:true})).toBeVisible({timeout:60000});await expect(confirm).toBeDisabled();expect(selects).toBe(0);
 await preview.getByRole('button',{name:'重新載入成品檢視',exact:true}).click();await expect(confirm).toBeEnabled({timeout:60000});
 expect(steps).toEqual(['neutral','smile','surprised','thoughtful','concerned','pose-stand','pose-sit','pose-read','pose-hold']);expect(selects).toBe(0);expect(reviews).toBe(0);
 expect((await profile()).selectedAvatarRef).toBe(before.selectedAvatarRef);
 for(const pose of ['站立','坐姿','閱讀','持書'])for(const expression of ['自然','微笑','驚訝','思考','擔心']){
  await preview.getByRole('button',{name:`檢視${pose}`,exact:true}).click();await preview.getByRole('button',{name:`檢視${expression}`,exact:true}).click();
  await expect.poll(()=>preview.getByTestId('actor-layer-body').locator('img').evaluate(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0)).toBe(true);
 }
 mkdirSync('.local/evidence',{recursive:true});await preview.screenshot({path:'.local/evidence/ai-static-adoption-review.png'});
 await confirm.click();await expect(page.getByText('已採用完整靜態化身',{exact:true})).toBeVisible({timeout:60000});
 expect(selects).toBe(1);expect(reviews).toBe(1);const adopted=await profile();expect(adopted.selectedAvatarType).toBe('generated');
 const readPack=()=>page.evaluate(async asset=>(await fetch(`/api/v1/me/avatar/assets/${asset}/expressions`,{headers:{'X-DatingHigh-Client':'web'}})).json(),adopted.selectedAvatarRef);
 const pack=await readPack();expect(pack.staticPosePackage.poses).toHaveLength(4);
 await page.reload();const restored=await readPack();expect(restored.staticPosePackage.packageVersion).toBe(pack.staticPosePackage.packageVersion);expect(steps).toHaveLength(9);
 const text=JSON.stringify(restored);expect(text).not.toContain('private/');expect(text).not.toContain('sourceImageSha256');
 writeFileSync('.local/evidence/ai-static-adoption-web.json',JSON.stringify({executedAt:new Date().toISOString(),status:'passed',scope:'Chrome production profile, real .NET/Miniflare D1/R2; controlled virtual-image provider, not live Gemini identity quality or Android acceptance',steps,reviewRequests:reviews,selectionRequests:selects,previewedStates:20,packageVersion:pack.staticPosePackage.packageVersion,reloadGenerationRequests:0,previewFailureRetryWithoutGeneration:failedPreview,controlledElapsedMs:Date.now()-started,legacyFiveImageBytes:Object.values(pack.expressions).reduce((n:number,a:any)=>n+a.byteSize,0),staticPngBytes:pack.staticPosePackage.assets.reduce((n:number,a:any)=>n+a.byteSize,0)},null,2));
});
