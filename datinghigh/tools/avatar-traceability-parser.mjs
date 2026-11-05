// 保留完整多行案例與原始行號；Windows換行不能讓索引退化成只有測試名稱。
export function parseAvatarChecklist(input){
 const source=input.replace(/\r\n?/g,'\n');
 const entries=[...source.matchAll(/^- \[[ x]\] `(AP-(UT|IT|API|E2E)-\d{3})`[^\n]*\n(?:(?!^- \[[ x]\] `AP-|^#{2,6}\s).*\n)*/gm)];
 return {source,entries};
}
