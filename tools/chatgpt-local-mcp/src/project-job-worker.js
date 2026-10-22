import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { StringDecoder } from 'node:string_decoder';
import { basename, dirname } from 'node:path';
import { ProjectService, redact } from './core.js';

// 獨立 supervisor 不依附 MCP 連線；只有它能更新執行中工作，取消透過檔案傳遞。
const [recordPath, launchPath] = process.argv.slice(2);
const launch = JSON.parse(readFileSync(launchPath, 'utf8'));
const job = JSON.parse(readFileSync(recordPath, 'utf8'));
const now = () => new Date().toISOString();
const save = () => {
  const temporary = `${recordPath}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(job, null, 2));
  // Windows 查詢端短暫持有檔案時 rename 可能 EPERM；重試以保留原子讀取。
  for (let attempt=0;;attempt++) {
    try { renameSync(temporary, recordPath); break; }
    catch(error) {
      if (!['EPERM','EACCES','EBUSY'].includes(error.code) || attempt>=100) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10);
    }
  }
};
Object.assign(job, { workerPid: process.pid, lastHeartbeatAt: now(), lastActivityAt: now(), stage: 'starting', stageStartedAt: now(), stageHistory: [], stageSummary: [] });
save();
let child, stopping = false, finished = false, stageDeadline = Infinity;
const log = (stream, value) => {
  appendFileSync(job.logPath, `[${now()}] [${stream}] ${redact(value)}`);
  job.lastActivityAt = now();
};
const progress = value => {
  if (typeof value.stage !== 'string' || JSON.stringify(value).length>8192) return;
  value=JSON.parse(redact(JSON.stringify(value)));
  if (value.stage !== job.stage || value.scenario !== job.progress?.scenario) {
    job.stageHistory.push({ stage: value.stage, scenario: value.scenario, startedAt: now() });
    job.stageHistory = job.stageHistory.slice(-12);
    job.stageStartedAt = now();
  }
  job.stage = value.stage;
  job.progress = value;
  let summary=job.stageSummary.find(item=>item.stage===value.stage&&item.scenario===value.scenario);
  if(!summary&&job.stageSummary.length<60){summary={stage:value.stage,scenario:value.scenario,firstSeenAt:now()};job.stageSummary.push(summary);}
  if(summary)summary.lastSeenAt=now();
  // 只有明確階段開始才重設 deadline，heartbeat／重複 progress 不會掩蓋卡住。
  if (value.timeoutSeconds) {
    stageDeadline = Date.now() + value.timeoutSeconds * 1000;
    job.stageTimeoutSeconds=value.timeoutSeconds;job.stageDeadlineAt=new Date(stageDeadline).toISOString();
  }
  if (value.failureType && !job.failureType) { job.failureType = value.failureType; job.error = value.reason; job.failedStage = value.stage; }
};
const capture = stream => {
  const decoder = new StringDecoder('utf8');
  let pending = '';
  return { write(chunk) {
    const value = decoder.write(chunk);
    log(stream, value);
    pending += value;
    const lines = pending.split('\n'); pending = lines.pop();
    for (const line of lines) if (line.startsWith('@@JOB ')) {
      try { progress(JSON.parse(line.slice(6))); } catch { /* 非完整事件只保留日誌。 */ }
    }
    pending = pending.slice(-65536);
    save();
  }, flush() { const rest = decoder.end(); if (rest) log(stream, rest); } };
};
const stdout = capture('stdout'), stderr = capture('stderr');
async function stop(status, type, reason) {
  if (finished || stopping) return;
  stopping = true;
  Object.assign(job, { status: 'running', terminationRequestedAt: now(), terminationStatus: status, failureType: type, error: reason, failedStage: job.stage });
  save(); log('supervisor', `${reason}\n`);
  if (child?.pid) {
    if (process.platform === 'win32') {
      const killed = await new Promise(resolve => {
        const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
        const timer=setTimeout(()=>{killer.kill();resolve(false);},15000);
        killer.once('error',()=>{clearTimeout(timer);resolve(false);});
        killer.once('close',code=>{clearTimeout(timer);resolve(code===0);});
      });
      if(!killed){
        let alive=false;try{process.kill(child.pid,0);alive=true;}catch{}
        if(alive){job.terminationStatus='failed';job.failureType='infrastructure_error';job.error=`Process tree termination failed at ${job.stage}; pid=${child.pid}`;}
      }
    } else { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }
  }
  finish(null);
}
function finish(code, error) {
  if (finished) return;
  // taskkill 完成前不可宣告 cancelled。
  if (stopping && code !== null) return;
  finished = true; clearInterval(tick);
  stdout.flush(); stderr.flush();
  job.status = job.terminationStatus ?? (job.failureType==='timeout'?'timed_out':error || code !== 0 ? 'failed' : 'succeeded');
  job.exitCode = code;
  job.completedAt = job.completed = now();
  job.durationMs = Date.now() - Date.parse(job.startedAt);
  if (job.status === 'failed') {
    job.failureType ??= error?.code === 'ENOENT' ? 'environment_missing' : 'runtime_error';
    job.error ??= error?.message ?? `Process exited with code ${code}; stage=${job.stage}`;
    job.failedStage ??= job.stage;
  }
  job.lastActivityAt = now(); job.lastHeartbeatAt = now(); save();
  const state = dirname(dirname(recordPath));
  void new ProjectService({runtimeRoot:state,projectId:basename(state)}).recordValidation(job.sessionId,{jobId:job.id,taskId:job.taskId,alias:job.alias,status:job.status,exitCode:job.exitCode,failureType:job.failureType??null}).catch(()=>{});
  // 子孫若仍持有 pipe 不阻擋 supervisor 結束；正常工作也要求腳本自行收斂子程序。
  child?.stdout?.destroy(); child?.stderr?.destroy();
}
const deadline = Date.now() + job.timeoutSeconds * 1000;
const tick = setInterval(() => {
  job.lastHeartbeatAt = now();
  if (existsSync(job.cancelPath)) void stop('cancelled', 'cancelled', `Cancelled by request at ${job.stage}`);
  else if (Date.now() > deadline || Date.now() > stageDeadline) void stop('timed_out', 'timeout', `Timeout at ${job.stage}; last activity ${job.lastActivityAt}`);
  else save();
}, 250);
try {
  child = spawn(launch.executable, launch.args, { cwd: launch.cwd, env: launch.env, shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
  job.pid = child.pid; save();
  child.stdout.on('data', chunk => stdout.write(chunk));
  child.stderr.on('data', chunk => stderr.write(chunk));
  child.once('error', error => finish(null, error));
  child.once('close', (code, signal) => { if (!stopping) finish(code, signal ? new Error(`Terminated by ${signal}`) : undefined); });
} catch (error) { finish(null, error); }
