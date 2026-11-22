import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {rigReviewCatalog} from './rig-review-catalog';
const completeFrameIds=new Set(rigReviewCatalog.filter(e=>'mode' in e&&e.mode==='complete-frames').map(e=>e.id));
test('batch: sixteen identities and AI pilot switch four poses and five faces locally',async({page})=>{
 test.setTimeout(180000);
 const unexpected:string[]=[],errors:string[]=[];page.on('request',r=>{if(/gemini|generations|expressions\/next/.test(r.url()))unexpected.push(r.url());});page.on('pageerror',e=>errors.push(e.name));
 await page.setViewportSize({width:1180,height:950});await page.goto('/?scene-rig=1&platform=web');
 await expect(page.getByText('角色 Rig 整批品質審查')).toBeVisible();
 const ids=[...['female','male'].flatMap(g=>Array.from({length:8},(_,i)=>`${g}-0${i+1}`)),'ai'];
 const results=[];mkdirSync('.local/rig-pilot/web-batch',{recursive:true});
 for(const id of ids){
  await page.getByRole('button',{name:`select-${id}`,exact:true}).click();
  const actor=page.getByTestId(`actor-identity-${id}-review`);await expect(actor).toBeVisible();
  await expect(page.getByLabel(`review-ready-${id}`,{exact:true})).toBeVisible();
  await expect.poll(()=>page.locator('img').evaluateAll(images=>images.length>0&&images.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
  const body=actor.getByTestId('actor-layer-body');await page.getByRole('button',{name:'pose-stand',exact:true}).click();
  const bodyStyle=await body.getAttribute('style'),faces=[];
  for(const emotion of ['neutral','smile','surprised','thoughtful','concerned']){
   await page.getByRole('button',{name:`expression-${emotion}`,exact:true}).click();if(!completeFrameIds.has(id as typeof rigReviewCatalog[number]['id']))await expect(body).toHaveAttribute('style',bodyStyle!);
   faces.push(completeFrameIds.has(id as typeof rigReviewCatalog[number]['id'])?await body.locator('img').evaluate(e=>JSON.stringify([e.getAttribute('src'),e.getAttribute('style'),e.parentElement!.getAttribute('style')])):await actor.getByTestId('actor-layer-face').count()?await actor.getByTestId('actor-layer-face').locator('img').evaluate(e=>e.parentElement!.getAttribute('style')):'painted-neutral');
  }expect(new Set(faces).size).toBe(5);
  await page.getByRole('button',{name:'expression-neutral',exact:true}).click();
  await page.getByTestId('rig-detail').screenshot({path:`.local/rig-pilot/web-batch/${id}-stand.png`});
  const poses=[];for(const pose of ['stand','sit','read','hold']){await page.getByRole('button',{name:`pose-${pose}`,exact:true}).click();poses.push(await body.locator('img').evaluate(e=>JSON.stringify([e.getAttribute('src'),e.parentElement!.getAttribute('style'),e.getAttribute('style')])));}expect(new Set(poses).size).toBe(4);
  await page.getByRole('button',{name:'pose-read',exact:true}).click();await page.getByTestId('rig-detail').screenshot({path:`.local/rig-pilot/web-batch/${id}-read.png`});
  results.push({id,decoded:true,poses:4,expressions:5,bodyStableAcrossExpressions:!completeFrameIds.has(id as typeof rigReviewCatalog[number]['id']),completeFrames:completeFrameIds.has(id as typeof rigReviewCatalog[number]['id'])});
 }
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForTimeout(100);expect(unexpected).toEqual([]);expect(errors).toEqual([]);
 writeFileSync('.local/rig-pilot/web-batch-result.json',JSON.stringify({scope:'Chrome component batch; human quality and production Rig readiness pending',executedAt:new Date().toISOString(),status:'passed',results},null,2));
});

test('batch overview compares original and Rig for all identities in each pose',async({page})=>{
 await page.setViewportSize({width:1480,height:1000});await page.goto('/?scene-rig=1&platform=web&all=1');
 await expect(page.getByTestId('rig-batch')).toBeVisible();
 await expect(page.locator('[data-testid^="actor-identity-"]')).toHaveCount(17);
 await expect.poll(()=>page.locator('img').evaluateAll(images=>images.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
 for(const pose of ['stand','sit','read','hold']){await page.getByRole('button',{name:`pose-${pose}`,exact:true}).click();await page.screenshot({path:`.local/rig-pilot/web-batch/overview-${pose}.png`,fullPage:true});}
 for(const emotion of ['smile','surprised','thoughtful','concerned']){await page.getByRole('button',{name:`expression-${emotion}`,exact:true}).click();await page.screenshot({path:`.local/rig-pilot/web-batch/overview-${emotion}.png`,fullPage:true});}
});

for(const reviewId of ['female-01','female-02','female-03','female-04','female-05','female-06','female-07','female-08','male-01','male-02','male-03','male-04','male-05','male-06','male-07','male-08','ai'])test(`single neck review ${reviewId} uses complete faces without detached features in twenty states`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.name));const frames=new Set<string>();
 test.setTimeout(120000);await page.setViewportSize({width:1180,height:1500});await page.goto(`/?scene-rig=1&platform=web&character=${reviewId}&single=1`);
 await expect(page.getByText(`${reviewId} 頭頸修正審查`)).toBeVisible();
 await expect(page.getByLabel(`review-ready-${reviewId}`,{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'batch-overview'})).toHaveCount(0);
 mkdirSync(`.local/rig-pilot/${reviewId}-neck-review`,{recursive:true});
 for(const pose of ['stand','sit','read','hold']){
  await page.getByRole('button',{name:`pose-${pose}`,exact:true}).click();
  for(const expression of ['neutral','smile','surprised','thoughtful','concerned']){
   await page.getByRole('button',{name:`expression-${expression}`,exact:true}).click();
   const actor=page.getByTestId('rig-detail').getByTestId(`actor-identity-${reviewId}-review`).first();
   await expect(actor.getByTestId('actor-layer-body')).toBeVisible();
   await expect(actor.getByTestId('actor-layer-face')).toHaveCount(0);
   await expect(actor.getByTestId('actor-layer-mouth')).toHaveCount(0);
   await expect(actor.locator('img')).toHaveCount(1);
   const expectedWidth=reviewId==='male-02'&&pose==='hold'&&expression==='smile'?1024:1774;
   await expect.poll(()=>actor.locator('img').evaluate((e,width)=>(e as HTMLImageElement).complete&&(e as HTMLImageElement).naturalWidth===width,expectedWidth)).toBe(true);
   frames.add(await actor.locator('img').evaluate(e=>JSON.stringify([e.getAttribute('src'),e.getAttribute('style'),e.parentElement!.getAttribute('style')])));
   await page.getByTestId('rig-detail').screenshot({path:`.local/rig-pilot/${reviewId}-neck-review/${pose}-${expression}.png`});
  }
 }
 expect(frames.size).toBe(20);expect(errors).toEqual([]);
});

test('male-02 smile correction replaces only hold smile and opens that state directly',async({page})=>{
 const originalHashes={stand:'8bfa831a0307e1d3d49df2d11811a44fa2434508cea3df4949926bcd301eb15b',sit:'fea4256f933ab58f923e1373cdd494ceea4ae871e538de510b7c4dec0ed8d67b',read:'a2d04a1711d7377a36f94424ff5cc32b81b2f3f817b1d5038e3fa0c97bfc64f4',hold:'1fd7f46d366034a3c2a3410796ae9c84bde07e6c45d02b81c13f7955418d1f74'};
 await page.setViewportSize({width:1180,height:1500});
 await page.goto('/?scene-rig=1&platform=web&character=male-02&single=1&pose=hold&expression=smile');
 await expect(page.getByText('male-02 · 持書 · 微笑',{exact:true})).toBeVisible();
 const actor=page.getByTestId('rig-detail').getByTestId('actor-identity-male-02-review').first(),img=actor.locator('img');
 await expect(img).toHaveAttribute('src',/ea70e9284cf364d339464f874594e450fa9bf2cdb7f5119a1f1652a2bded3736/);
 await expect.poll(()=>img.evaluate(e=>(e as HTMLImageElement).complete&&(e as HTMLImageElement).naturalWidth===1024)).toBe(true);
 await page.getByTestId('rig-detail').screenshot({path:'.local/rig-pilot/male-02-neck-review/hold-smile-fixed.png'});
 let unchanged=0;
 for(const pose of ['stand','sit','read','hold']as const){
  await page.getByRole('button',{name:`pose-${pose}`,exact:true}).click();
  for(const expression of ['neutral','smile','surprised','thoughtful','concerned']){
   if(pose==='hold'&&expression==='smile')continue;
   await page.getByRole('button',{name:`expression-${expression}`,exact:true}).click();
   await expect(img).toHaveAttribute('src',new RegExp(originalHashes[pose]));unchanged++;
  }
 }
 expect(unchanged).toBe(19);
});
