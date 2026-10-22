"""安裝版驗收的階段事件、即時日誌及子程序期限；不更動產品資料。"""
import json
import os
from pathlib import Path
import subprocess
import time


class StageTimeout(TimeoutError):
    pass


_active = {'stage': 'prepare'}


def emit(stage, **details):
    _active.clear()
    _active.update(stage=stage, **({'scenario': details['scenario']} if 'scenario' in details else {}))
    print('@@JOB ' + json.dumps(dict(stage=stage, **details), ensure_ascii=True), flush=True)


def failure_event(error):
    return dict(**_active, failureType='timeout' if isinstance(error, (TimeoutError, subprocess.TimeoutExpired)) else 'runtime_error',
                reason=f'{type(error).__name__}: {error}')


def terminate_tree(process):
    if process.poll() is not None:
        return
    if os.name == 'nt':
        subprocess.run(['taskkill.exe', '/PID', str(process.pid), '/T', '/F'],
                       capture_output=True, timeout=15, creationflags=subprocess.CREATE_NO_WINDOW)
    else:
        import signal
        os.killpg(process.pid, signal.SIGKILL)
    process.wait(timeout=10)


def wait_player(process, output, scenario, timeout, idle_timeout=35):
    """只以新 evidence 判定活動；polling 心跳不會延長期限。"""
    started = activity = phase_started = time.monotonic()
    phase = 'launch'; seen = {}; last = None
    limits = {'launch': 40, 'load_model': 45, 'operate': 60, 'screenshot': 60, 'verify_result': 30}
    emit(phase, scenario=scenario, timeoutSeconds=limits[phase], pid=process.pid)
    diagnostics = Path(os.environ.get('BRICKHIGH_ACCEPTANCE_LOCALLOW', output.parent / 'LocalLow'))
    # Launcher 的 log 位於此 run 的隔離 LocalLow；不讀正常使用者資料。
    diagnostics = diagnostics / 'GameNenStyle' / 'BrickHighPreview' / 'Diagnostics'
    offsets = {}
    while True:
        for path in [output / 'bootstrap.json', output / 'progress.json', output / 'result.json']:
            try:
                raw = path.read_bytes()
                if seen.get(path) == raw:
                    continue
                payload = json.loads(raw)
            except (OSError, ValueError):
                continue
            seen[path] = raw; activity = time.monotonic(); last = payload
            detail = str(payload.get('stage', ''))
            new_phase = ('verify_result' if path.name == 'result.json' or detail == 'Completed'
                         else 'screenshot' if detail.startswith('Capture:')
                         else 'load_model' if 'Load' in detail or detail in ('CatalogOpened', 'AcceptanceStarted')
                         else 'operate')
            if new_phase != phase:
                phase = new_phase; phase_started = activity
                emit(phase, scenario=scenario, timeoutSeconds=limits[phase])
            # result.json 含數百張 capture；查詢只投影小摘要，完整報告保留在原始 evidence。
            visible = {key: payload[key] for key in ('stage', 'frameCount', 'captureCount', 'operationCount',
                       'realtimeSeconds', 'lastActivityAt', 'isFocused', 'runInBackground', 'success', 'error', 'message')
                       if key in payload}
            if path.name == 'result.json':
                visible['captureCount'] = len(payload.get('captures', []))
                visible['operationCount'] = len(payload.get('operations', []))
            emit(phase, scenario=scenario, detail=detail, captureCount=visible.get('captureCount'),
                 operationCount=visible.get('operationCount'), player=visible)
        for path in diagnostics.glob('*-player.log'):
            offset = offsets.get(path, 0)
            try:
                with path.open('rb') as stream:
                    stream.seek(offset); raw = stream.read(); offsets[path] = stream.tell()
                if raw:
                    print('[player-log] ' + raw.decode('utf-8', errors='replace'), flush=True)
            except OSError:
                pass
        code = process.poll()
        if code is not None:
            return code
        current = time.monotonic()
        if current-started > timeout or current-activity > idle_timeout or current-phase_started > limits[phase]:
            reason = f'{scenario}/{phase}: timeout; pid={process.pid}; lastProgress={last}'
            emit(phase, scenario=scenario, failureType='timeout', reason=reason)
            terminate_tree(process)
            raise StageTimeout(reason)
        time.sleep(.2)
