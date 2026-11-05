import {test,expect} from '@playwright/test';
import {startBackend,stopBackend,routeBackend,control,avatarFixturePassword,type Backend} from './backend';
test.setTimeout(180000);
let backend:Backend;
test.beforeEach(async({page,request})=>{backend=await startBackend({DATINGHIGH_E2E_AVATAR_PROFILE:'1'});await control(backend,request,{op:'reset',accountKind:'local'});await routeBackend(page,backend);});
test.afterEach(async({request})=>{if(backend)await stopBackend(backend,request);});
async function login(page:any){await page.goto('/login');await page.getByLabel('Email',{exact:true}).fill('owner@example.com');await page.getByLabel('密碼',{exact:true}).fill(avatarFixturePassword);await page.getByRole('button',{name:'登入',exact:true}).click();await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();await expect(page.getByLabel('暱稱',{exact:true})).toBeVisible();}

test('profile/card settings: saved gender gates 8/8/16, conditional save, atomic clear and private standalone preview',async({page,request})=>{
 await login(page);const save=page.getByRole('button',{name:'儲存',exact:true});await expect(save).toHaveCount(0);
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();await expect(page.getByText('請先儲存生理性別，再選擇免費化身')).toBeVisible();await expect(page.getByRole('button',{name:/^選用 (male|female)-/})).toHaveCount(0);await page.getByRole('button',{name:'關閉',exact:true}).click();
 await page.getByLabel('暱稱',{exact:true}).fill('星河旅人');await page.getByLabel('工作／職業',{exact:true}).fill('工程師');await page.getByLabel('生日',{exact:true}).fill('1995-01-01');await page.getByRole('checkbox',{name:'戀愛性向：女',exact:true}).click();
 for(const [label,prefix,count] of [['男','male',8],['女','female',8],['多元','female',16]] as const){
  await page.getByRole('checkbox',{name:'生理性別：'+label,exact:true}).click();await save.click();await expect(save).toHaveCount(0);
  await page.getByRole('button',{name:'選擇化身',exact:true}).click();await expect(page.getByRole('button',{name:/^選用 (male|female)-/})).toHaveCount(count);
  await page.getByRole('button',{name:`選用 ${prefix}-01`,exact:true}).click();await expect(page.getByText('遊戲化身已更新',{exact:true})).toBeVisible();await page.getByRole('button',{name:'關閉',exact:true}).click();
 }
 await page.getByRole('checkbox',{name:'生理性別：男',exact:true}).click();await page.getByRole('button',{name:'選擇化身',exact:true}).click();await expect(page.getByRole('button',{name:/^選用 (male|female)-/})).toHaveCount(0);await page.getByRole('button',{name:'關閉',exact:true}).click();await save.click();await expect(page.getByText('+ 創建',{exact:true})).toBeVisible();
 // Seed one real private photo through the controlled Application/D1/R2 host, then hide it in the editor.
 await control(backend,request,{op:'avatar-seed-photos'});await page.reload();await expect(page.getByLabel('暱稱',{exact:true})).toHaveValue('星河旅人');
 await expect(page.getByRole('switch',{name:'開放暱稱',exact:true})).toHaveCount(0);
 for(const label of ['開放工作／職業','開放個人照片'])await page.getByRole('switch',{name:label,exact:true}).click();
 let photos=0;page.on('request',r=>{if(r.url().includes('/me/media/'))photos++;});
 await page.getByRole('button',{name:'我的名片',exact:true}).click();await expect(page).toHaveURL(/card-preview$/);await expect(page.getByText('這是你自己的預覽，尚未授權其他玩家查看；未來須在有效互動中由雙方同意。',{exact:true})).toBeVisible();
 await expect(page.getByText('30–34 歲',{exact:true}).filter({visible:true})).toBeVisible();await expect(page.getByText('星河旅人',{exact:true}).filter({visible:true})).toBeVisible();await expect(page.getByText('工程師',{exact:true}).filter({visible:true})).toHaveCount(0);await expect(page.getByRole('img',{name:/名片照片/})).toHaveCount(0);expect(photos).toBe(0);await expect(page.getByRole('switch')).toHaveCount(0);
 await page.setViewportSize({width:360,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
 await page.getByRole('button',{name:'返回',exact:true}).click();await expect(save).toHaveCount(0);
 await page.getByLabel('一句自我介紹',{exact:true}).fill('已修改');await expect(save).toBeVisible();await page.getByLabel('一句自我介紹',{exact:true}).fill('');await expect(save).toHaveCount(0);
 await page.getByLabel('一句自我介紹',{exact:true}).fill('草稿');await page.getByRole('button',{name:'返回',exact:true}).click();await page.getByRole('button',{name:'取消',exact:true}).click();await expect(page.getByLabel('一句自我介紹',{exact:true})).toHaveValue('草稿');
 await page.getByRole('button',{name:'返回',exact:true}).click();await page.getByRole('button',{name:'捨棄修改',exact:true}).click();await page.getByRole('button',{name:'登出',exact:true}).click();await expect(page.getByText('已登出',{exact:true}).filter({visible:true})).toBeVisible();await login(page);
 await expect(page.getByRole('switch',{name:'開放暱稱',exact:true})).toHaveCount(0);await expect(page.getByRole('switch',{name:'開放個人照片',exact:true})).not.toBeChecked();
});

test('mobile Web pull refresh confirms discard and preview conflict never navigates or resends',async({page})=>{
 await page.setViewportSize({width:390,height:844});await login(page);
 await page.getByLabel('暱稱',{exact:true}).fill('星河旅人');await page.getByLabel('一句自我介紹',{exact:true}).fill('草稿');
 const pull=async()=>page.getByLabel('一句自我介紹',{exact:true}).evaluate(element=>{
  let scroll=element.parentElement;while(scroll&&getComputedStyle(scroll).overflowY!=='auto'&&getComputedStyle(scroll).overflowY!=='scroll')scroll=scroll.parentElement;
  if(!scroll)throw new Error('scroll container not found');scroll.scrollTop=0;scroll.dispatchEvent(new Event('scroll',{bubbles:true}));
  const touch=(y:number)=>new Touch({identifier:1,target:scroll!,pageX:30,pageY:y,clientX:30,clientY:y});
  scroll.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,touches:[touch(80)],changedTouches:[touch(80)]}));
  scroll.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],changedTouches:[touch(200)]}));
 });
 await pull();await page.getByRole('button',{name:'取消',exact:true}).click();await expect(page.getByLabel('一句自我介紹',{exact:true})).toHaveValue('草稿');
 await pull();await page.getByRole('button',{name:'捨棄修改',exact:true}).click();await expect(page.getByLabel('一句自我介紹',{exact:true})).toHaveValue('');
 await page.getByLabel('暱稱',{exact:true}).fill('星河旅人');let writes=0;
 await page.route('**/api/v1/me/dating-profile',async route=>{
  if(route.request().method()==='PUT'){writes++;await route.fulfill({status:409,contentType:'application/problem+json',body:JSON.stringify({status:409,code:'PROFILE_VERSION_CONFLICT',title:'版本衝突'})});}else await route.fallback();
 });
 await page.getByRole('button',{name:'我的名片',exact:true}).click();await expect(page.getByText('資料已在其他地方更新，請重新整理後再修改',{exact:true}).first()).toBeVisible();expect(writes).toBe(1);await expect(page).toHaveURL(/profile$/);
});
