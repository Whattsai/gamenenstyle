"""在隔離專案驗證安裝生命週期與檔案邊界。"""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

TOOL = Path(__file__).resolve().parents[1]


def snapshot(root):
    return {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in root.rglob('*') if p.is_file() and '.git' not in p.parts}


class InstallTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='Nora 中文 ')
        self.base = Path(self.tmp.name)
        self.project = self.base / '目標 專案'
        self.project.mkdir()
        self.source = self.base / '工具 複本'
        shutil.copytree(TOOL, self.source, ignore=shutil.ignore_patterns('__pycache__', '.git'))
        self.script = self.source / 'scripts/install.py'

    def tearDown(self):
        self.tmp.cleanup()

    def run_cli(self, *args, ok=True):
        result = subprocess.run([sys.executable, str(self.script), '--project-root',
                                 str(self.project), *args], capture_output=True, encoding='utf-8',
                                env={**os.environ, 'PYTHONUTF8': '1'})
        self.assertEqual(result.returncode == 0, ok, result.stdout + result.stderr)
        return result

    def test_preview_install_repeat_update_remove_with_and_without_git(self):
        for with_git in (False, True):
            with self.subTest(git=with_git):
                if with_git:
                    subprocess.run(['git', 'init', '-q', str(self.project)], check=True)
                before = snapshot(self.base)
                self.run_cli()
                self.assertEqual(before, snapshot(self.base))
                source_before = snapshot(self.source)
                self.run_cli('--install')
                self.assertEqual(source_before, snapshot(self.source))
                skills = self.project / '.agents/skills'
                self.assertEqual(len(list(skills.glob('*/SKILL.md'))), 15)
                self.assertTrue((skills / 'leon-design/assets/NotoSansTC-Bold.ttf').is_file())
                self.assertTrue((self.project / '.agents/hello-nora/docs/ADVANCED-google-ads.md').is_file())
                installed = snapshot(self.project)
                self.run_cli('--install')
                self.assertEqual(installed, snapshot(self.project))
                role = self.source / 'skills/hello-nora/marketing-frameworks.md'
                role.write_text(role.read_text(encoding='utf-8') + '\n新增方法原文\n', encoding='utf-8')
                self.run_cli('--install')
                self.assertIn('新增方法原文', (skills / 'hello-nora/marketing-frameworks.md').read_text(encoding='utf-8'))
                self.run_cli('--remove')
                self.assertTrue((skills / 'hello-nora/SKILL.md').exists())
                self.run_cli('--remove', '--install')
                self.assertFalse((skills / 'hello-nora/SKILL.md').exists())
                self.assertTrue((skills / '_brand/brand-guide.md').exists())

    def test_preserve_brands_credentials_profiles_other_skills_and_ignore_rules(self):
        skills = self.project / '.agents/skills'
        for name in ('_brand', '_brand-客戶A'):
            brand = skills / name
            brand.mkdir(parents=True, exist_ok=True)
            for file in ('brand-guide.md', 'meta-config.md', 'user-profile.md'):
                (brand / file).write_text('私人內容-' + file, encoding='utf-8')
        other = skills / 'other/SKILL.md'
        other.parent.mkdir()
        other.write_text('其他技能', encoding='utf-8')
        ignore = self.project / '.gitignore'
        ignore.write_text('# 原有規則\n/custom\n/.agents/skills/_brand*/\n/.agents/hello-nora/backups/\n',
                          encoding='utf-8')
        before = {p: p.read_bytes() for p in skills.rglob('*') if p.is_file()}
        self.run_cli('--install')
        for p, data in before.items():
            self.assertEqual(p.read_bytes(), data)
        self.assertTrue((skills / '_brand-客戶A/icp.md').exists())
        subprocess.run(['git', 'init', '-q', str(self.project)], check=True)
        for rel in ('.agents/skills/_brand/meta-config.md', '.agents/skills/_brand-客戶A/user-profile.md',
                    '.agents/hello-nora/backups/example'):
            self.assertEqual(subprocess.run(['git', '-C', str(self.project), 'check-ignore', '-q', rel]).returncode, 0)
        self.run_cli('--remove', '--install')
        for p, data in before.items():
            self.assertEqual(p.read_bytes(), data)
        self.assertIn('/custom', ignore.read_text(encoding='utf-8'))

    def test_conflict_never_partially_installs(self):
        role = self.project / '.agents/skills/maya-social/SKILL.md'
        role.parent.mkdir(parents=True)
        role.write_text('同名非管理技能', encoding='utf-8')
        before = snapshot(self.project)
        self.run_cli('--install', ok=False)
        self.assertEqual(before, snapshot(self.project))

    def test_local_edit_blocks_update_and_removal(self):
        self.run_cli('--install')
        role = self.project / '.agents/skills/maya-social/SKILL.md'
        role.write_text('使用者修改', encoding='utf-8')
        before = snapshot(self.project)
        self.run_cli('--install', ok=False)
        self.run_cli('--remove', '--install', ok=False)
        self.assertEqual(before, snapshot(self.project))

    def test_deleted_managed_file_and_unmanaged_file_survive_correctly(self):
        self.run_cli('--install')
        source = self.source / 'skills/hello-nora/marketing-frameworks.md'
        source.unlink()
        # 其他文件仍有引用時，更新必須拒絕。
        before = snapshot(self.project)
        self.run_cli('--install', ok=False)
        self.assertEqual(before, snapshot(self.project))
        shutil.copyfile(TOOL / 'skills/hello-nora/marketing-frameworks.md', source)
        extra = self.project / '.agents/skills/hello-nora/my-note.md'
        extra.write_text('保留', encoding='utf-8')
        self.run_cli('--remove', '--install')
        self.assertEqual(extra.read_text(encoding='utf-8'), '保留')

    def test_manifest_traversal_rejected(self):
        self.run_cli('--install')
        manifest = self.project / '.agents/hello-nora/manifest.json'
        data = json.loads(manifest.read_text(encoding='utf-8'))
        data['managed_files']['../../outside'] = 'a' * 64
        manifest.write_text(json.dumps(data), encoding='utf-8')
        before = snapshot(self.project)
        self.run_cli('--remove', '--install', ok=False)
        self.assertEqual(before, snapshot(self.project))

    def test_update_removes_only_obsolete_managed_files(self):
        helper = self.source / 'skills/hello-nora/temporary-helper.md'
        helper.write_text('暫時輔助原文', encoding='utf-8')
        self.run_cli('--install')
        installed = self.project / '.agents/skills/hello-nora/temporary-helper.md'
        self.assertTrue(installed.exists())
        helper.unlink()
        self.run_cli('--install')
        self.assertFalse(installed.exists())
        self.assertTrue((self.project / '.agents/skills/hello-nora/SKILL.md').exists())

    def test_symlink_target_rejected(self):
        external = self.base / '外部'
        external.mkdir()
        try:
            (self.project / '.agents').symlink_to(external, target_is_directory=True)
        except OSError:
            # Windows 無符號連結權限時以 junction 驗證相同邊界。
            result = subprocess.run(['cmd', '/c', 'mklink', '/J', str(self.project / '.agents'), str(external)],
                                    capture_output=True)
            self.assertEqual(result.returncode, 0, result.stderr)
        self.run_cli('--install', ok=False)
        self.assertEqual(list(external.iterdir()), [])

    def git(self, *args):
        result = subprocess.run(['git', '-C', str(self.project), *args], capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout

    def test_secret_check_is_read_only_and_distinguishes_no_git(self):
        before = snapshot(self.project)
        self.run_cli('--check-secrets', ok=False)
        self.assertEqual(before, snapshot(self.project))
        self.run_cli('--install')
        before = snapshot(self.project)
        result = self.run_cli('--check-secrets')
        self.assertIn('尚無版控可檢查', result.stdout)
        self.assertEqual(before, snapshot(self.project))
        self.git('init', '-q')
        self.assertIn('Git 索引與忽略規則通過', self.run_cli('--check-secrets').stdout)

    def test_private_files_unignored_staged_and_tracked_stop_without_mutation(self):
        secret = self.project / '.agents/skills/_brand-客戶A/credentials/google-calendar/tokens.json'
        secret.parent.mkdir(parents=True)
        secret.write_text('{"refresh_token":"FAKE-NEVER-PRINT-THIS"}', encoding='utf-8')
        self.git('init', '-q')
        for state in ('未追蹤', '已暫存', '已追蹤'):
            with self.subTest(state=state):
                if state == '已暫存':
                    self.git('add', '-f', '.')
                elif state == '已追蹤':
                    self.git('-c', 'user.name=測試', '-c', 'user.email=test@example.invalid',
                             'commit', '-qm', '假憑證測試')
                before, index = snapshot(self.project), self.git('ls-files', '--stage', '-z')
                for args in (('--check-secrets',), ('--install',)):
                    result = self.run_cli(*args, ok=False)
                    self.assertNotIn('FAKE-NEVER-PRINT-THIS', result.stdout + result.stderr)
                    self.assertIn('tokens.json', result.stderr)
                    self.assertEqual(before, snapshot(self.project))
                    self.assertEqual(index, self.git('ls-files', '--stage', '-z'))

    def test_forced_staged_ignored_secret_and_missing_rules_block_update(self):
        self.git('init', '-q')
        self.run_cli('--install')
        secret = self.project / '.agents/skills/_brand/line-config.md'
        secret.write_text('假憑證', encoding='utf-8')
        self.git('add', '-f', '.agents/skills/_brand/line-config.md')
        before = snapshot(self.project)
        self.run_cli('--check-secrets', ok=False)
        self.run_cli('--install', ok=False)
        self.assertEqual(before, snapshot(self.project))
        self.git('rm', '--cached', '--', '.agents/skills/_brand/line-config.md')
        ignore = self.project / '.gitignore'
        ignore.write_text('# 規則被移除\n', encoding='utf-8')
        before = snapshot(self.project)
        self.run_cli('--check-secrets', ok=False)
        self.run_cli('--install', ok=False)
        self.assertEqual(before, snapshot(self.project))

    def test_overridden_ignore_and_backup_exposure_are_detected(self):
        self.git('init', '-q')
        self.run_cli('--install')
        ignore = self.project / '.gitignore'
        ignore.write_bytes(ignore.read_bytes() + b'!.agents/skills/_brand*/\n!.agents/skills/_brand*/**\n')
        before = snapshot(self.project)
        self.run_cli('--check-secrets', ok=False)
        self.run_cli('--install', ok=False)
        self.assertEqual(before, snapshot(self.project))

    def test_platform_templates_only_and_native_credentials_survive_lifecycle(self):
        self.run_cli('--install')
        for platform in ('meta', 'google', 'line', 'cloudinary', 'wordpress'):
            self.assertFalse((self.project / '.agents/skills/_brand' / (platform + '-config.md')).exists())
        self.assertFalse((self.project / '.agents/skills/_brand/credentials').exists())
        saved = {}
        for name in ('_brand', '_brand-客戶A'):
            brand = self.project / '.agents/skills' / name
            brand.mkdir(exist_ok=True)
            for file in ('meta-config.md', 'google-config.md', 'line-config.md',
                         'cloudinary-config.md', 'wordpress-config.md',
                         'credentials/google-calendar/oauth.keys.json',
                         'credentials/google-calendar/tokens.json',
                         'credentials/google-ads/credentials.json'):
                target = brand / file
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text('FAKE-PRIVATE-' + name, encoding='utf-8')
                saved[target] = target.read_bytes()
        self.run_cli('--install')
        for name in ('_brand', '_brand-客戶A'):
            brand = self.project / '.agents/skills' / name
            for platform in ('meta', 'google', 'line', 'cloudinary', 'wordpress'):
                self.assertTrue((brand / (platform + '-config.example.md')).is_file())
        self.run_cli('--remove', '--install')
        for path, data in saved.items():
            self.assertEqual(path.read_bytes(), data)
        backups = self.project / '.agents/hello-nora/backups'
        for path in backups.rglob('*'):
            if path.is_file():
                self.assertNotIn(b'FAKE-PRIVATE-', path.read_bytes())

    def test_source_private_file_cannot_enter_payload_or_logs(self):
        for relative in ('skills/_brand/google-config.md',
                         'skills/_brand/credentials/google-calendar/tokens.json',
                         'skills/_brand-客戶A/brand-guide.md', 'skills/_brand/unlisted.example.md'):
            with self.subTest(path=relative):
                path = self.source / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('FAKE-SOURCE-SECRET', encoding='utf-8')
                before = snapshot(self.project)
                result = self.run_cli('--install', ok=False)
                self.assertNotIn('FAKE-SOURCE-SECRET', result.stdout + result.stderr)
                self.assertEqual(before, snapshot(self.project))
                path.unlink()

    def test_git_failure_does_not_report_no_git_or_change_data(self):
        self.run_cli('--install')
        (self.project / '.git').write_text('gitdir: missing-repository\n', encoding='utf-8')
        before = snapshot(self.project)
        result = self.run_cli('--check-secrets', ok=False)
        self.assertNotIn('尚無版控可檢查', result.stdout + result.stderr)
        self.run_cli('--install', ok=False)
        self.assertEqual(before, snapshot(self.project))

    def test_ignored_untracked_native_json_passes_but_corrupt_index_stops(self):
        self.git('init', '-q')
        self.run_cli('--install')
        secret = self.project / '.agents/skills/_brand-客戶A/credentials/google-ads/application_default_credentials.json'
        secret.parent.mkdir(parents=True)
        secret.write_text('{"refresh_token":"FAKE-NATIVE-TOKEN"}', encoding='utf-8')
        before = snapshot(self.project)
        result = self.run_cli('--check-secrets')
        self.assertNotIn('FAKE-NATIVE-TOKEN', result.stdout + result.stderr)
        self.assertEqual(before, snapshot(self.project))
        index = self.project / '.git/index'
        index.write_bytes(b'FAKE-INDEX-CONTENT')
        result = self.run_cli('--check-secrets', ok=False)
        self.assertIn('索引無法檢查', result.stderr)
        self.assertNotIn('FAKE-INDEX-CONTENT', result.stdout + result.stderr)
        self.assertEqual(index.read_bytes(), b'FAKE-INDEX-CONTENT')

    def test_parent_repository_tracks_nested_project_secrets(self):
        subprocess.run(['git', 'init', '-q', str(self.base)], check=True)
        self.run_cli('--install')
        secret = self.project / '.agents/skills/_brand/google-config.md'
        secret.write_text('FAKE-NESTED-SECRET', encoding='utf-8')
        self.git('add', '-f', '.agents/skills/_brand/google-config.md')
        index = self.git('ls-files', '--stage', '-z')
        before = snapshot(self.project)
        self.run_cli('--check-secrets', ok=False)
        self.run_cli('--install', ok=False)
        self.assertEqual(index, self.git('ls-files', '--stage', '-z'))
        self.assertEqual(before, snapshot(self.project))

    def test_first_install_checks_effective_ignores_before_templates(self):
        self.git('init', '-q')
        nested = self.project / '.agents/.gitignore'
        nested.parent.mkdir()
        nested.write_text('!skills/\n!skills/_brand*/\n!skills/_brand*/**\n', encoding='utf-8')
        before = snapshot(self.project)
        self.run_cli('--install', ok=False)
        self.assertEqual(before, snapshot(self.project))
        self.assertFalse((self.project / '.gitignore').exists())
        self.assertFalse((self.project / '.agents/skills').exists())

    def test_backup_path_forced_into_index_is_private(self):
        self.git('init', '-q')
        self.run_cli('--install')
        backup = self.project / '.agents/hello-nora/backups/fake/archive.json'
        backup.parent.mkdir(parents=True)
        backup.write_text('FAKE-BACKUP-SECRET', encoding='utf-8')
        self.git('add', '-f', '.agents/hello-nora/backups/fake/archive.json')
        before = snapshot(self.project)
        result = self.run_cli('--check-secrets', ok=False)
        self.assertIn('archive.json', result.stderr)
        self.assertNotIn('FAKE-BACKUP-SECRET', result.stdout + result.stderr)
        self.run_cli('--install', ok=False)
        self.assertEqual(before, snapshot(self.project))

    def test_filled_example_is_rejected_without_leaking_value(self):
        template = self.source / 'skills/_brand/meta-config.example.md'
        template.write_text(template.read_text(encoding='utf-8').replace('[貼入永久 Page Token]',
                            'FAKE-FILLED-EXAMPLE'), encoding='utf-8')
        before = snapshot(self.project)
        result = self.run_cli('--install', ok=False)
        self.assertNotIn('FAKE-FILLED-EXAMPLE', result.stdout + result.stderr)
        self.assertEqual(before, snapshot(self.project))

    def test_filled_allowlisted_brand_template_cannot_be_distributed(self):
        template = self.source / 'skills/_brand/brand-guide.md'
        template.write_text('FAKE-PRIVATE-BRAND-CONTENT', encoding='utf-8')
        before = snapshot(self.project)
        result = self.run_cli('--install', ok=False)
        self.assertNotIn('FAKE-PRIVATE-BRAND-CONTENT', result.stdout + result.stderr)
        self.assertEqual(before, snapshot(self.project))

    def test_video_example_uses_selected_brand_and_new_config_before_legacy(self):
        doc = (self.source / 'skills/leon-design/workflows/video-processing.md').read_text(encoding='utf-8')
        block = doc.split('## 上傳 Cloudinary', 1)[1].split('```python\n', 1)[1].split('\n```', 1)[0]
        setup = compile(block.split('\nts=', 1)[0], 'video-config-example', 'exec')

        def load(name):
            values = {}
            with patch.dict(os.environ, NORA_PROJECT_ROOT=str(self.project), NORA_BRAND=name):
                exec(setup, values)
            return values['CLOUD'], values['KEY'], values['SECRET']

        for name in ('_brand-A', '_brand-乙'):
            brand = self.project / '.agents/skills' / name
            brand.mkdir(parents=True)
            content = '\n'.join('- **' + key + '**：' + name
                                for key in ('Cloud Name', 'API Key', 'API Secret'))
            (brand / 'meta-config.md').write_text('## Facebook\nAPI Key: OTHER\n## Cloudinary\n'
                                                + content + '\n## LINE OA\nAPI Secret: OTHER\n',
                                                encoding='utf-8')
            self.assertEqual(load(name), (name,) * 3)
        new = self.project / '.agents/skills/_brand-A/cloudinary-config.md'
        new.write_text('\n'.join('- **' + key + '**：NEW' for key in ('Cloud Name', 'API Key', 'API Secret')),
                       encoding='utf-8')
        self.assertEqual(load('_brand-A'), ('NEW',) * 3)
        self.assertEqual(load('_brand-乙'), ('_brand-乙',) * 3)
        new.write_text('', encoding='utf-8')
        with self.assertRaises(SystemExit):
            load('_brand-A')
        with self.assertRaises(SystemExit):
            load('_brand-A/../_brand-乙')

    def test_calendar_configuration_sets_native_json_paths_for_same_brand(self):
        doc = (self.source / 'ADVANCED-google-calendar.md').read_text(encoding='utf-8')
        config = json.loads(re.search(r'```json\n(.*?)\n```', doc, re.S)[1])
        for name in ('_brand-A', '_brand-乙'):
            env = {key: Path(value.replace('<專案絕對路徑>', str(self.project)).replace('/_brand/', '/' + name + '/'))
                   for key, value in config['env'].items()}
            expected = self.project / '.agents/skills' / name / 'credentials/google-calendar'
            self.assertEqual(env['GOOGLE_OAUTH_CREDENTIALS'].parent, expected)
            self.assertEqual(env['GOOGLE_CALENDAR_MCP_TOKEN_PATH'].parent, expected)
            self.assertEqual({path.suffix for path in env.values()}, {'.json'})
            self.assertTrue(all(path.is_absolute() for path in env.values()))
            self.assertFalse(expected.exists())


if __name__ == '__main__':
    unittest.main()
