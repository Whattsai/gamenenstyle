"""使用真子程序驗證階段、逾時收尾與即時證據，不啟動 Unity。"""
import json
import os
from pathlib import Path
import subprocess
import sys

import pytest

from tools.acceptance.acceptance_monitor import StageTimeout, wait_player, emit, failure_event


def launch(source):
    return subprocess.Popen([sys.executable, '-u', '-c', source],
                            start_new_session=os.name != 'nt',
                            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)


def test_idle_timeout_kills_waiting_player_and_reports_last_capture(tmp_path, capsys):
    (tmp_path / 'progress.json').write_text(json.dumps(dict(stage='Capture:11211:orbit-1', captureCount=312)))
    process = launch('import time; time.sleep(60)')
    with pytest.raises(StageTimeout, match='readonly/screenshot.*312'):
        wait_player(process, tmp_path, 'readonly', 10, idle_timeout=.4)
    assert process.poll() is not None
    events = capsys.readouterr().out
    assert '"stage": "screenshot"' in events
    assert '"failureType": "timeout"' in events


def test_live_evidence_exposes_model_operation_capture_and_result(tmp_path, capsys):
    script = '''import json, time
from pathlib import Path
p=Path(__import__('sys').argv[1])
for stage in ['ModelLoad:3001', 'KeyboardSubmitVariant', 'Capture:3001:front', 'Completed']:
    (p/'progress.json').write_text(json.dumps(dict(stage=stage, captureCount=1)))
    time.sleep(.3)
(p/'result.json').write_text(json.dumps(dict(success=True)))
time.sleep(.3)
'''
    process = subprocess.Popen([sys.executable, '-u', '-c', script, str(tmp_path)])
    assert wait_player(process, tmp_path, 'writable', 10) == 0
    events = capsys.readouterr().out
    for stage in ('launch', 'load_model', 'operate', 'screenshot', 'verify_result'):
        assert f'"stage": "{stage}"' in events


def test_overall_timeout_is_not_reset_by_new_evidence(tmp_path, capsys):
    script = '''import json, time, sys
from pathlib import Path
p=Path(sys.argv[1])
for i in range(100):
    (p/'progress.json').write_text(json.dumps(dict(stage='Capture:3001:orbit', captureCount=i)))
    time.sleep(.1)
'''
    process = subprocess.Popen([sys.executable, '-u', '-c', script, str(tmp_path)],
                               start_new_session=os.name != 'nt')
    with pytest.raises(StageTimeout):
        wait_player(process, tmp_path, 'readonly', .7, idle_timeout=10)
    assert process.poll() is not None


def test_acceptance_background_execution_is_scoped_after_opt_in():
    source = (Path(__file__).resolve().parents[4] / 'game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs').read_text(encoding='utf-8')
    assert source.index('if (string.IsNullOrWhiteSpace(directory)) return;') < source.index('UnityEngine.Application.runInBackground = true;')
    assert '["isFocused"]' in source and '["lastActivityAt"]' in source


def test_large_result_projects_bounded_summary_without_losing_evidence(tmp_path, capsys):
    payload = dict(success=True, captures=[dict(file='x'*2000)]*382, operations=['action']*22)
    (tmp_path / 'result.json').write_text(json.dumps(payload))
    process = launch('import time; time.sleep(.3)')
    assert wait_player(process, tmp_path, 'readonly', 10) == 0
    events = capsys.readouterr().out
    assert len(events) < 3000
    assert '"captureCount": 382' in events
    assert len(json.loads((tmp_path / 'result.json').read_text())['captures']) == 382


def test_acl_success_without_captured_stdout_does_not_crash(monkeypatch):
    """Windows 子程序可能沒有回傳 stdout；成功時不得因診斷字串中斷唯讀安裝驗收。"""
    import importlib
    from types import SimpleNamespace

    root = Path(__file__).resolve().parents[4] / "tools/acceptance"
    monkeypatch.syspath_prepend(str(root))
    module = importlib.import_module("run_interactive_fixture")
    monkeypatch.setattr(module.subprocess, "run", lambda *args, **kwargs:
                        SimpleNamespace(returncode=0, stdout=None, stderr=None))
    assert module._run_acl("fixture-only") == ""


def test_acl_failure_without_captured_output_fails_closed(monkeypatch):
    """ACL 真正執行失敗仍須攔截，且錯誤輸出缺失不應掩蓋 returncode。"""
    import importlib
    from types import SimpleNamespace

    root = Path(__file__).resolve().parents[4] / "tools/acceptance"
    monkeypatch.syspath_prepend(str(root))
    module = importlib.import_module("run_interactive_fixture")
    monkeypatch.setattr(module.subprocess, "run", lambda *args, **kwargs:
                        SimpleNamespace(returncode=5, stdout=None, stderr=None))
    with pytest.raises(RuntimeError, match="icacls failed"):
        module._run_acl("fixture-only")


def test_installer_timeout_retains_stage_and_scenario(capsys):
    emit('install', scenario='upgrade_b', timeoutSeconds=120)
    failure = failure_event(subprocess.TimeoutExpired(['installer.exe', 'install'], 120))
    assert failure['stage'] == 'install'
    assert failure['scenario'] == 'upgrade_b'
    assert failure['failureType'] == 'timeout'
    assert '120' in failure['reason']
