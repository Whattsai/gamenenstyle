"""以本機 Git 來源模擬能力增刪改、三方衝突與重跑，不連外部平台。"""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import source_update as updater
from common import digest, files_under, json_bytes, transaction
from unittest.mock import patch


class SourceUpdateTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='Nora 來源 ')
        self.base = Path(self.tmp.name)
        self.repo = self.base / '來源 專案'
        self.tool = self.base / '工具'
        self.tool.mkdir()
        self.repo.mkdir()
        self.git('init', '-q', '-b', 'main')
        self.git('config', 'user.name', '隔離測試')
        self.git('config', 'user.email', 'test@example.invalid')
        self.put(self.repo, 'README.md', '# 團隊\n\n業務段落原文 A\n\n前置：特定方案\n')
        self.put(self.repo, 'obsolete.md', '# 舊能力\n')
        (self.repo / 'image.png').write_bytes(b'\x89PNG\r\n\x1a\n\0binary\r\n')
        self.put(self.repo, 'skills/role/SKILL.md', '---\nname: role\ndescription: 行銷角色。\n---\n\n# 原文方法\n')
        source_root = Path(__file__).resolve().parents[1]
        for relative in ['skills/hello-nora/platform-settings.md',
                         *['skills/_brand/' + name + '-config.example.md'
                           for name in ('meta', 'google', 'line', 'cloudinary', 'wordpress')]]:
            self.put(self.repo, relative, (source_root / relative).read_text(encoding='utf-8'))
        self.commit()
        self.base_commit = self.git('rev-parse', 'HEAD').decode().strip()
        raw = updater.tree(self.repo, self.base_commit)
        for path, data in raw.items():
            target = self.tool / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        self.put(self.tool, 'README.md', '# 團隊\n\n業務段落原文 A\n\n前置：需要 MCP\n')
        current = dict(files_under(self.tool))
        differences = updater.delta(raw, current)
        for item in differences:
            item.update(reason='能力條件', detail='特定方案前置改為可用 MCP，業務段落原文保留。')
        state = {'version': 1, 'repository': str(self.repo), 'commit': self.base_commit,
                 'default_branch': 'refs/heads/main', 'upstream_files': updater.inventory(raw),
                 'managed_files': updater.inventory(current), 'updates': {}}
        transaction(self.tool, {updater.LOCK: json_bytes(state), updater.DELTA: json_bytes(differences)})
        self.project = self.base / '所在 專案/.agents/skills'
        self.project.mkdir(parents=True)
        (self.project / 'unchanged').write_text('未經確認不變', encoding='utf-8')

    def tearDown(self):
        self.tmp.cleanup()

    def git(self, *args):
        result = subprocess.run(['git', '-C', str(self.repo), *args], capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout

    def commit(self):
        self.git('add', '.')
        self.git('commit', '-qm', '測試來源')

    def put(self, root, path, text):
        target = root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding='utf-8')

    def review(self, stage):
        metadata = json.loads((stage / 'stage.json').read_text(encoding='utf-8'))
        if metadata.get('status') == 'unchanged':
            return
        upstream = dict(files_under(stage / 'upstream'))
        base = dict(files_under(stage / 'base'))
        candidate = dict(files_under(stage / 'candidate'))
        # 測試 fixture 全為本檔建立且已知的文字，逐檔解碼後記錄。
        reading = {p: digest(upstream[p]) for p in metadata['required_read_files']}
        base_reading = {p: digest(base[p]) for p in metadata['required_base_read_files']}
        differences = updater.delta(upstream, candidate)
        for item in differences:
            item.update(reason='能力條件', detail='僅保留 fixture 的 MCP 能力前置，其餘逐字依新來源。')
        value = {'read_files': reading, 'read_base_files': base_reading, 'analysis_scope': 'affected',
                 'upstream_patch_sha256': digest((stage / 'upstream.patch').read_bytes()),
                 'capability_changes': {p: kind + '：fixture 業務能力' for p, kind in metadata['changes'].items()},
                 'resolved_conflicts': metadata['conflicts'], 'exceptions': differences}
        (stage / 'review.json').write_bytes(json_bytes(value))

    def test_exact_business_add_modify_delete_and_repeat(self):
        self.put(self.repo, 'README.md', '# 團隊\n\n業務段落原文 B：不可改寫\n\n前置：特定方案\n')
        self.put(self.repo, 'skills/role/workflows/new.md', '# 新能力\n\n新的業務方法原文，標點也保留。\n')
        (self.repo / 'obsolete.md').unlink()
        self.put(self.repo, 'free-version/extra.md', '不合併的額外能力')
        self.commit()
        before = dict(files_under(self.project))
        stage = self.base / '暫存'
        metadata = updater.prepare(self.tool, stage)
        self.assertEqual(metadata['conflicts'], [])
        self.assertEqual(json.loads((self.tool / updater.LOCK).read_bytes())['commit'], self.base_commit)
        self.assertFalse((stage / 'candidate/free-version').exists())
        self.review(stage)
        result = updater.apply(self.tool, stage)
        self.assertFalse(result['project_skills_synced'])
        self.assertEqual((self.tool / 'README.md').read_text(encoding='utf-8'),
                         '# 團隊\n\n業務段落原文 B：不可改寫\n\n前置：需要 MCP\n')
        self.assertEqual((self.tool / 'skills/role/workflows/new.md').read_bytes(),
                         self.git('show', 'HEAD:skills/role/workflows/new.md'))
        self.assertEqual((self.tool / 'image.png').read_bytes(), (self.repo / 'image.png').read_bytes())
        self.assertFalse((self.tool / 'obsolete.md').exists())
        self.assertEqual(before, dict(files_under(self.project)))
        stable = updater.inventory(dict(files_under(self.tool)))
        repeat = self.base / '重跑'
        updater.prepare(self.tool, repeat)
        self.review(repeat)
        again = updater.apply(self.tool, repeat)
        self.assertEqual(again['write'], [])
        self.assertEqual(stable, updater.inventory(dict(files_under(self.tool))))

    def test_conflict_and_forbidden_content_cannot_advance_lock(self):
        self.put(self.repo, 'README.md', '# 團隊\n\n業務段落原文 A\n\n前置：Claude 付費版\n')
        self.commit()
        stage = self.base / '衝突'
        before = updater.inventory(dict(files_under(self.tool)))
        metadata = updater.prepare(self.tool, stage)
        self.assertIn('README.md', metadata['conflicts'])
        with self.assertRaises(ValueError):
            updater.apply(self.tool, stage)
        self.put(stage, 'candidate/README.md', '# 團隊\n\n業務段落原文 A\n\n前置：Claude 付費版\n')
        self.review(stage)
        with self.assertRaisesRegex(ValueError, '未通用化'):
            updater.apply(self.tool, stage)
        self.assertEqual(before, updater.inventory(dict(files_under(self.tool))))
        self.put(stage, 'candidate/README.md', '# 團隊\n\n業務段落原文 A\n\n前置：需要 MCP\n')
        self.review(stage)
        updater.apply(self.tool, stage)

    def test_failed_fetch_unread_files_and_race_leave_tool_unchanged(self):
        before = updater.inventory(dict(files_under(self.tool)))
        with self.assertRaises(ValueError):
            updater.prepare(self.tool, self.base / '失敗', str(self.base / '不存在'))
        self.assertEqual(before, updater.inventory(dict(files_under(self.tool))))
        stage = self.base / '未讀'
        self.put(self.repo, 'new.md', '# 新來源，需要閱讀\n')
        self.commit()
        updater.prepare(self.tool, stage)
        with self.assertRaisesRegex(ValueError, '完整閱讀'):
            updater.apply(self.tool, stage)
        self.review(stage)
        self.put(self.tool, 'README.md', '準備後本地又有修改')
        changed = updater.inventory(dict(files_under(self.tool)))
        with self.assertRaisesRegex(ValueError, '已變更'):
            updater.apply(self.tool, stage)
        self.assertEqual(changed, updater.inventory(dict(files_under(self.tool))))

    def test_deleted_modified_file_requires_resolution(self):
        self.put(self.tool, 'obsolete.md', '# 本地修改\n')
        (self.repo / 'obsolete.md').unlink()
        self.commit()
        stage = self.base / '刪除衝突'
        metadata = updater.prepare(self.tool, stage)
        self.assertIn('obsolete.md', metadata['conflicts'])
        (stage / 'candidate/obsolete.md').unlink()
        self.review(stage)
        updater.apply(self.tool, stage)
        self.assertFalse((self.tool / 'obsolete.md').exists())

    def test_patch_is_replayable_and_rename_preserves_generalization(self):
        self.git('mv', 'README.md', 'renamed.md')
        self.put(self.repo, 'added.md', '# 新能力，原文保留。\n')
        (self.repo / 'obsolete.md').unlink()
        self.commit()
        stage = self.base / '差異與改名'
        metadata = updater.prepare(self.tool, stage)
        self.assertEqual(metadata['renames'], {'README.md': 'renamed.md'})
        self.assertEqual(metadata['conflicts'], [])
        self.assertFalse((stage / 'candidate/README.md').exists())
        self.assertIn('需要 MCP', (stage / 'candidate/renamed.md').read_text(encoding='utf-8'))
        self.assertEqual((stage / 'base/README.md').read_bytes(), self.git('show', self.base_commit + ':README.md'))
        # patch 是舊來源到新來源，能重播並重建新來源，沒有混入本地通用化。
        patch_root = self.base / '重播'
        subprocess.run(['git', 'clone', '-q', str(self.repo), str(patch_root)], check=True)
        subprocess.run(['git', '-C', str(patch_root), 'checkout', '-q', '--detach', self.base_commit], check=True)
        subprocess.run(['git', '-C', str(patch_root), 'apply', '--index', str(stage / 'upstream.patch')], check=True)
        result = subprocess.run(['git', '-C', str(patch_root), 'diff', '--exit-code', 'origin/main'], capture_output=True)
        self.assertEqual(result.returncode, 0, result.stdout)
        self.review(stage)
        updater.apply(self.tool, stage)
        self.assertFalse((self.tool / 'README.md').exists())
        self.assertIn('需要 MCP', (self.tool / 'renamed.md').read_text(encoding='utf-8'))

    def test_reading_focuses_on_changes_and_can_expand_to_full(self):
        self.put(self.repo, 'README.md', '# 團隊\n\n業務段落原文 B\n\n前置：特定方案\n')
        self.commit()
        stage = self.base / '必讀範圍'
        metadata = updater.prepare(self.tool, stage)
        self.assertEqual(metadata['required_read_files'], ['README.md'])
        self.assertEqual(metadata['required_base_read_files'], ['README.md'])
        self.assertTrue((stage / 'upstream/skills/role/SKILL.md').exists())
        self.review(stage)
        path = stage / 'review.json'
        value = json.loads(path.read_bytes())
        value['analysis_scope'] = 'full'
        path.write_bytes(json_bytes(value))
        with self.assertRaisesRegex(ValueError, '完整閱讀'):
            updater.apply(self.tool, stage)
        value['analysis_scope'] = 'affected'
        path.write_bytes(json_bytes(value))
        updater.apply(self.tool, stage)

    def test_same_commit_requires_clean_local_audit_to_skip_review(self):
        stage = self.base / '無更新'
        before = updater.inventory(dict(files_under(self.tool)))
        metadata = updater.prepare(self.tool, stage)
        self.assertEqual(metadata['status'], 'unchanged')
        self.assertFalse((stage / 'upstream').exists())
        self.assertEqual(updater.apply(self.tool, stage)['write'], [])
        self.assertEqual(before, updater.inventory(dict(files_under(self.tool))))
        self.put(self.tool, 'README.md', '# 團隊\n\n本地新增文字，需要重新稽核。\n')
        dirty = self.base / '有本地修改'
        metadata = updater.prepare(self.tool, dirty)
        self.assertEqual(metadata['status'], 'review_required')
        with self.assertRaises(ValueError):
            updater.apply(self.tool, dirty)

    def test_modified_upstream_patch_is_rejected(self):
        self.put(self.repo, 'new.md', '# 新方法\n')
        self.commit()
        stage = self.base / '被改的patch'
        updater.prepare(self.tool, stage)
        self.review(stage)
        (stage / 'upstream.patch').write_bytes(b'changed')
        with self.assertRaisesRegex(ValueError, 'patch'):
            updater.apply(self.tool, stage)

    def test_transaction_rolls_back_on_write_error(self):
        self.put(self.tool, 'a', '原文 A')
        self.put(self.tool, 'b', '原文 B')
        original_replace = Path.replace
        count = 0

        def fail_second(path, target):
            nonlocal count
            count += 1
            if count == 2:
                raise OSError('模擬寫入失敗')
            return original_replace(path, target)

        before = dict(files_under(self.tool))
        with patch.object(Path, 'replace', fail_second):
            with self.assertRaises(OSError):
                transaction(self.tool, {'a': b'new', 'b': b'new', 'new-dir/c': b'new'})
        self.assertEqual(before, dict(files_under(self.tool)))

    def test_upstream_removing_platform_protection_cannot_advance_lock(self):
        self.put(self.repo, 'skills/hello-nora/platform-settings.md', '# 平台設定\n取消版控檢查。\n')
        self.commit()
        stage = self.base / '保護被刪'
        updater.prepare(self.tool, stage)
        self.review(stage)
        before = dict(files_under(self.tool))
        with self.assertRaisesRegex(ValueError, '平台設定保護'):
            updater.apply(self.tool, stage)
        self.assertEqual(before, dict(files_under(self.tool)))

    def test_same_commit_with_invalid_platform_rules_cannot_report_unchanged(self):
        path = self.tool / 'skills/hello-nora/platform-settings.md'
        path.write_text('# 保護被刪\n', encoding='utf-8')
        lock_path = self.tool / updater.LOCK
        lock = json.loads(lock_path.read_bytes())
        lock['managed_files'] = updater.inventory(updater.local_files(self.tool, lock))
        lock_path.write_bytes(json_bytes(lock))
        before = dict(files_under(self.tool))
        with self.assertRaisesRegex(ValueError, '平台設定保護'):
            updater.prepare(self.tool, self.base / '同版缺保護')
        self.assertEqual(before, dict(files_under(self.tool)))

    def test_source_credentials_are_rejected_before_stage_or_secret_diff(self):
        self.put(self.repo, 'skills/_brand/credentials/google-ads/tokens.json', 'FAKE-UPSTREAM-SECRET')
        self.commit()
        stage = self.base / '來源憑證'
        before = dict(files_under(self.tool))
        with self.assertRaises(ValueError) as raised:
            updater.prepare(self.tool, stage)
        self.assertNotIn('FAKE-UPSTREAM-SECRET', str(raised.exception))
        self.assertFalse(stage.exists())
        self.assertEqual(before, dict(files_under(self.tool)))


if __name__ == '__main__':
    unittest.main()
