"""品牌範本白名單與唯讀 Git 保護檢查；不讀取或輸出私人檔案內容。"""
import os
from pathlib import PurePosixPath
import re
import subprocess

from common import guarded

BRAND_TEMPLATES = frozenset({
    'account-safety.md', 'asset-inventory.md', 'brand-guide.md', 'competitor-watchlist.md',
    'faq.md', 'funnel-content-matrix.md', 'icp.md', 'industry-knowledge.md',
    'marketing-log.md', 'product-info.md', 'task-board.md', 'voice-profile.md',
    'meta-config.example.md', 'google-config.example.md', 'line-config.example.md',
    'cloudinary-config.example.md', 'wordpress-config.example.md',
})
PRIVATE_ROOTS = ('.agents/skills/_brand', '.agents/hello-nora/backups')
IGNORE_RULES = ('/.agents/skills/_brand*/', '/.agents/hello-nora/backups/')
PLATFORM_CONTRACT = 'skills/hello-nora/platform-settings.md'
REQUIRED_CLAUSES = (
    'meta-config.md', 'google-config.md', 'line-config.md', 'cloudinary-config.md', 'wordpress-config.md',
    '新檔存在時以新檔為準；新檔空白或缺欄位時停止並引導補齊，不回退舊檔',
    '新檔不存在時，才相容讀取同品牌舊', '建立憑證前必須執行 `--check-secrets`',
    '保留本機資料與 Git 索引', '尚無版控可檢查', '宿主管理的 OAuth 維持原機制，不強行匯出',
    'credentials/google-calendar/oauth.keys.json', 'credentials/google-calendar/tokens.json',
    'GOOGLE_OAUTH_CREDENTIALS', 'GOOGLE_CALENDAR_MCP_TOKEN_PATH', 'credentials/google-ads/',
    '品牌專屬授權目錄', '避免落回共用預設位置', '新增品牌僅從工具來源',
    '安裝、更新與移除保留所有品牌設定、原生憑證',
)


def validate_platform_contract(files):
    validate_source_paths(files)
    text = files.get(PLATFORM_CONTRACT, b'').decode('utf-8')
    if any(clause not in text for clause in REQUIRED_CLAUSES):
        raise ValueError(f'平台設定保護規約缺漏或被修改：{PLATFORM_CONTRACT}')
    for platform in ('meta', 'google', 'line', 'cloudinary', 'wordpress'):
        path = 'skills/_brand/' + platform + '-config.example.md'
        if path not in files:
            raise ValueError(f'平台設定保護缺少空白範本：{path}')
    validate_blank_examples(files)
    # 現有角色與直接入口必須保留對共用規約的讀取；來源刪除另由能力／引用稽核處理。
    for name in ('hello-nora', 'maya-social', 'leon-design', 'iris-seo', 'jack-ads',
                 'setup', 'health-check', 'brand-setup'):
        path = 'skills/' + name + '/SKILL.md'
        if path in files and b'hello-nora/platform-settings.md' not in files[path]:
            raise ValueError(f'平台設定保護入口缺漏：{path}')


def validate_blank_examples(files):
    labels = ('Page Access Token', 'Channel access token', 'Channel secret', 'API Key',
              'API Secret', '應用程式密碼', 'Developer Token')
    for path, data in files.items():
        if not (path.startswith('skills/_brand/') and path.endswith('-config.example.md')):
            continue
        example = data.decode('utf-8')
        for label in labels:
            values = re.findall(r'(?mi)^- (?:\*\*)?' + re.escape(label)
                                + r'(?:\*\*)?\s*[：:]\s*(.*)$', example)
            for value in values:
                if not re.fullmatch(r'\[[^\]\n]+\]', value.strip()):
                    raise ValueError(f'品牌空白範本含非佔位設定，拒絕打包：{path}')


def validate_source_paths(paths):
    """先檢查路徑再讀來源，避免私人設定被寫進安裝包、diff 或備份。"""
    configs = {name.replace('.example', '') for name in BRAND_TEMPLATES if '.example.' in name}
    for path in paths:
        parts = PurePosixPath(path).parts
        brand = next((i for i, name in enumerate(parts) if name.startswith('_brand')), None)
        if brand is not None:
            if parts[:brand + 1] != ('skills', '_brand') or '/'.join(parts[brand + 1:]) not in BRAND_TEMPLATES:
                raise ValueError(f'來源含非白名單品牌檔案，拒絕打包：{path}')
        elif (parts[-1] in configs or 'credentials' in parts or parts[-1] in
              ('tokens.json', 'oauth.keys.json', 'gcp-oauth.keys.json', 'credentials.json')
              or parts[-1].startswith('.env') or PurePosixPath(path).suffix in ('.pem', '.key', '.p12', '.pfx')):
            raise ValueError(f'來源含私人設定或憑證，拒絕打包：{path}')


def private_path(path):
    return (path.startswith(PRIVATE_ROOTS[0]) or path == PRIVATE_ROOTS[1]
            or path.startswith(PRIVATE_ROOTS[1] + '/'))


def private_files(project):
    roots = list(guarded(project, '.agents/skills').glob('_brand*'))
    backup = guarded(project, PRIVATE_ROOTS[1])
    if backup.exists():
        roots.append(backup)
    result = []
    for root in roots:
        guarded(project, root.relative_to(project).as_posix())
        for file in ([root] if root.is_file() else root.rglob('*')):
            rel = file.relative_to(project).as_posix()
            guarded(project, rel)
            if file.is_file():
                result.append(rel)
    return sorted(result)


def git_read(project, *args, input=None):
    # 鎖定指定專案，不受呼叫端的其他 Git 工作目錄／索引覆寫影響。
    env = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
    env.update(LC_ALL='C', GIT_OPTIONAL_LOCKS='0')
    try:
        result = subprocess.run(['git', '-C', str(project), *args], input=input,
                                capture_output=True, env=env)
    except OSError:
        raise ValueError('Git 無法執行；無法驗證版控保護，請修復 Git 後重試') from None
    return result


def check_secrets(project, bootstrap=False):
    """bootstrap 僅容許首次且沒有私人檔案時，稍後先建立忽略規則。"""
    files = private_files(project)
    path = guarded(project, '.gitignore')
    rules = path.read_text(encoding='utf-8').splitlines() if path.exists() else []
    missing = [rule for rule in IGNORE_RULES if rule not in rules]
    initial = bootstrap and not files and not guarded(project, '.agents/hello-nora/manifest.json').exists()
    has_git = any((parent / '.git').exists() for parent in (project, *project.parents))
    if has_git:
        repo = git_read(project, 'rev-parse', '--show-toplevel')
        if repo.returncode:
            raise ValueError('Git repository 無法檢查；請修復 repository／權限後重試')
        index = git_read(project, 'ls-files', '--cached', '-z')
        if index.returncode:
            raise ValueError('Git 索引無法檢查；保護未通過')
        tracked = sorted({p.decode('utf-8') for p in index.stdout.split(b'\0')
                          if p and private_path(p.decode('utf-8'))})
        if tracked:
            raise ValueError('私人路徑已追蹤或已暫存；保留本機與索引，請自行從版控移除後重查：\n'
                             + '\n'.join(tracked))
    if missing and not initial:
        raise ValueError('忽略規則缺漏；請在專案 .gitignore 恢復品牌與備份忽略規則後重查：\n'
                         + '\n'.join(files or ['.agents/skills/_brand*/', '.agents/hello-nora/backups/']))
    if has_git and not (missing and initial):
        # 驗證現有資料及未來品牌／憑證位置，包含子目錄中的反向忽略規則。
        probes = sorted(set(files) | {
            '.agents/skills/_brand/.nora-secret-check',
            '.agents/skills/_brand/credentials/google-calendar/tokens.json',
            '.agents/skills/_brand/credentials/google-ads/credentials.json',
            '.agents/skills/_brand-新品牌/.nora-secret-check',
            '.agents/hello-nora/backups/.nora-secret-check',
        })
        result = git_read(project, 'check-ignore', '--no-index', '--verbose', '--non-matching',
                          '-z', '--stdin', input=('\0'.join(probes) + '\0').encode('utf-8'))
        if result.returncode not in (0, 1):
            raise ValueError('Git 忽略規則無法檢查；保護未通過')
        tokens = result.stdout.split(b'\0')
        rows = [tokens[i:i + 4] for i in range(0, len(tokens) - 1, 4)]
        if len(rows) != len(probes) or any(len(row) != 4 for row in rows):
            raise ValueError('Git 忽略規則回應不完整；保護未通過')
        exposed = [row[3].decode('utf-8') for row in rows if not row[2] or row[2].startswith(b'!')]
        if exposed:
            raise ValueError('私人路徑未受忽略或規則被覆寫；請修正 .gitignore 後重查：\n' + '\n'.join(exposed))
    return {'status': ('待先建立忽略規則' if missing else
                       'Git 索引與忽略規則通過' if has_git else '尚無版控可檢查；已確認忽略規則'),
            'git': has_git, 'private_files': len(files)}
