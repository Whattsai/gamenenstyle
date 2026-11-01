const messages:Record<string,string>={
 LOGGED_OUT:'已登出',
 EMAIL_VERIFIED:'Email 驗證完成',PASSWORD_CHANGED:'密碼已更新，所有裝置都需要重新登入',PASSWORD_RESET:'密碼已重設，請使用新密碼重新登入',IDENTITY_UNLINKED:'登入方式已更新，請重新登入',
 INVALID_EMAIL:'請輸入有效的 Email',INVALID_PASSWORD:'密碼須為 12 至 128 個字元，且不可包含控制字元',INVALID_CREDENTIALS:'Email 或密碼不正確',CURRENT_PASSWORD_INVALID:'目前密碼不正確',
 EMAIL_ALREADY_REGISTERED:'此 Email 已註冊，請先使用原有方式登入，再連結 Google',INVALID_OR_EXPIRED_CODE:'驗證碼錯誤或已失效，請重新確認',CODE_EXPIRED:'驗證碼已過期，請重新申請',CODE_LOCKED:'驗證次數已達上限，請重新申請驗證碼',
 EMAIL_DELIVERY_FAILED:'驗證碼暫時無法寄送，請稍後重試',RATE_LIMITED:'操作過於頻繁，請稍後再試',CREDENTIAL_CHANGED:'帳號安全設定已變更，請重新操作',
 SESSION_REVOKED:'帳號已在其他裝置登入，請重新登入',SESSION_CHANGED:'登入狀態已變更，請重新登入',GOOGLE_SESSION_CHANGED:'登入狀態已變更，請重新操作',REFRESH_REVOKED:'登入狀態已失效，請重新登入',REFRESH_EXPIRED:'登入狀態已失效，請重新登入',REFRESH_INVALID:'登入狀態已失效，請重新登入',REFRESH_TOKEN_REUSE:'登入狀態已失效，請重新登入',
 EXTERNAL_EMAIL_MISMATCH:'Google Email 必須與目前帳號相同',EXTERNAL_IDENTITY_IN_USE:'此 Google 登入已被使用，無法連結',LAST_LOGIN_METHOD:'請先保留至少一種登入方式',PASSWORD_NOT_SET:'請先透過 Email 設定密碼',
 EXTERNAL_CREDENTIAL_INVALID:'Google 登入驗證失敗，請重新登入 Google',EXTERNAL_EMAIL_UNTRUSTED:'此 Google 帳號的 Email 未通過網域信任檢查，請改用 Email 驗證碼註冊或先以密碼登入',EXTERNAL_EMAIL_CHANGED:'Google Email 已變更，請先使用原有方式登入',EXTERNAL_PROVIDER_UNAVAILABLE:'Google 登入暫時無法使用，請稍後再試',
 GOOGLE_CANCELLED:'已取消 Google 登入',NETWORK_ERROR:'網路連線中斷，請檢查連線後重試',SECURE_STORAGE_FAILED:'無法保存安全登入，請重新登入',LOGOUT_PENDING:'尚未完成伺服器登出，請重試',
};
export const messageFor=(code:string)=>messages[code]??'服務暫時無法使用，請稍後再試';
export const maskEmail=(email:string)=>`${email[0]}***@${email.split('@')[1]??''}`;
export function validateForm(screen:string,fields:Record<string,string>):string|null{
 const email=(fields.email??'').trim();
 if(['register','login','forgot-password'].includes(screen)&&(email.length>254||email.indexOf('@')>64||/[^\x00-\x7f]/.test(email)||! /^[a-z0-9!#$%&'*+\/=?^_`{}~\-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?$/.test(email.toLowerCase())))return '請輸入有效的 Email';
 if(screen==='login'&&!fields.password)return '請輸入密碼';
 if(['verify-email','reset-password'].includes(screen)&&! /^[0-9]{6}$/.test(fields.code??''))return '請輸入六位數驗證碼';
 if(['verify-email','reset-password','account/password'].includes(screen)){
  if(fields.password!==fields.confirm)return '兩次密碼輸入不一致';
  const password=fields.password??'';
  const scalars=[...password];
  if(scalars.length<12||scalars.length>128||/[\u0000-\u001f\u007f-\u009f]/.test(password)||scalars.some(value=>value.length===1&&/[\ud800-\udfff]/.test(value)))return messages.INVALID_PASSWORD;
 }
 if(screen==='account/password'&&!fields.currentPassword)return '請輸入目前密碼';
 return null;
}
export class OperationGate{
 private sequence=0;private session?:string;http=false;pending=false;
 begin(session?:string){if(this.pending||this.http)throw new Error('OPERATION_PENDING');this.pending=true;this.session=session;return ++this.sequence;}
 current(sequence:number,session?:string){return this.sequence===sequence&&this.session===session&&this.pending;}
 cancel(){if(this.http)return false;this.sequence++;this.pending=false;return true;}
 finish(sequence?:number){if(sequence!==undefined&&sequence!==this.sequence)return false;this.http=false;this.pending=false;return true;}
}
