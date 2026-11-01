import{test,expect}from'@playwright/test';
for(const platform of ['ios','android'])for(const width of [360,800])for(const keyboard of [false,true])for(const insets of [false,true])for(const longError of [false,true]){
 test(`PF-UT-082 PF-UT-115 ${platform} width=${width} keyboard=${keyboard} insets=${insets} long-error=${longError}`,async({page})=>{
  const height=(width===360?640:1280)-(keyboard?300:0);await page.setViewportSize({width,height});await page.goto(`/?platform=${platform}&insets=${insets?'yes':'no'}&error=${longError?'long':'none'}`);
  const action=page.getByRole('button',{name:'主要操作',exact:true});await expect(action).toBeAttached();await expect(page.getByTestId('keyboard-avoiding')).toHaveAttribute('data-behavior',platform==='ios'?'padding':'height');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  if(keyboard)await page.getByLabel('確認密碼').focus();await action.scrollIntoViewIfNeeded();const bounds=await action.boundingBox();expect(bounds).not.toBeNull();const top=insets?(platform==='ios'?44:24):0,bottom=insets?34:0;
  expect(bounds!.y).toBeGreaterThanOrEqual(top);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(height-bottom+1);
  await action.click();await expect(page.locator('html')).toHaveAttribute('data-submitted','yes');
  expect(await action.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(255, 122, 162)');expect(await action.evaluate(el=>getComputedStyle(el).minHeight)).toBe('50px');
 });
}
