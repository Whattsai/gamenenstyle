// 離線執行官方 Khronos 驗證器；保存原始報告，不忽略警告。
const fs = require('node:fs');
const path = require('node:path');
const validator = require('gltf-validator');

async function main() {
  const [source, destination] = process.argv.slice(2);
  if (!source || !destination) {
    process.stderr.write('用法：node validate_glb.cjs model.glb report.json\n');
    process.exitCode = 2;
    return;
  }
  const bytes = fs.readFileSync(source);
  const report = await validator.validateBytes(new Uint8Array(bytes), {
    uri: path.basename(source), format: 'glb', maxIssues: 0,
    externalResourceFunction: () => Promise.reject(new Error('包內模型不得讀取外部資源。')),
  });
  fs.writeFileSync(destination, JSON.stringify(report, null, 2), { encoding: 'utf8', flag: 'wx' });
  process.stdout.write(JSON.stringify({ validatorVersion: validator.version(), issues: report.issues }) + '\n');
  // 警告尚未逐類處理時不得把此結果當完整品質通過。
  process.exitCode = report.issues.numErrors || report.issues.numWarnings ? 3 : 0;
}

main().catch(() => {
  process.stderr.write('模型驗證失敗；請確認完整 GLB 及新的報告輸出路徑。\n');
  process.exitCode = 4;
});
