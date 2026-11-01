import {expect,type Page} from '@playwright/test';
import {execFileSync} from 'node:child_process';
export const password='A meaningful password 42!';
export function localCode(challengeId:string){
 const container=execFileSync('docker',['ps','--filter','name=workerd-datinghigh-local-ApiContainer','--format','{{.ID}} {{.Names}}'],{encoding:'utf8',windowsHide:true}).split('\n').find(line=>line.trim()&&!line.includes('-proxy'))?.split(' ')[0];
 if(!container)throw new Error('Local .NET container is not running');
 const log=execFileSync('docker',['logs',container],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
 const matches=[...log.matchAll(new RegExp(`Challenge=${challengeId} .*?Code=([0-9]{6})`,'g'))];if(!matches.length)throw new Error('Dedicated LocalEmailVerification code was not found');return matches.at(-1)![1];
}
export async function register(page:Page,email:string){
 await page.goto('/register');await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill(email);
 const response=page.waitForResponse(r=>r.url().endsWith('/api/v1/email-registrations')&&r.request().method()==='POST',{timeout:50000});
 await page.getByRole('button',{name:'寄送驗證碼',exact:true}).click();let initial;
 try{initial=await response;}catch{const ui=await page.evaluate(()=>({path:location.pathname,notices:['請輸入有效的 Email','連線中，請稍候…','操作結果尚未確認，請重新登入後查看','服務暫時無法使用，請稍後再試'].filter(text=>document.body.innerText.includes(text))}));throw new Error('Registration response was not observed: '+JSON.stringify(ui));}
 const metadata=await initial.json();expect(initial.status(),`Registration request returned ${metadata.code??'metadata'}`).toBe(202);
 await expect(page.getByLabel('六位數驗證碼',{exact:true}).filter({visible:true})).toBeVisible();
 await page.getByLabel('六位數驗證碼',{exact:true}).filter({visible:true}).fill(localCode(metadata.challengeId));
 await page.getByLabel('密碼',{exact:true}).filter({visible:true}).fill(password);await page.getByLabel('確認密碼',{exact:true}).filter({visible:true}).fill(password);
 const confirmed=page.waitForResponse(r=>r.url().endsWith('/api/v1/accounts')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'驗證並建立帳號'}).click();const result=await confirmed;
 expect(result.status()).toBe(201);await expect(page.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();return {metadata,result};
}
