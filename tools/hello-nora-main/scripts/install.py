#!/usr/bin/env python3
"""預覽、安裝、更新或移除指定專案的 Hello Nora；不需要 Git。"""
import argparse
import json
import os
from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True

from common import (LINK, digest, files_under, guarded, is_link, json_bytes, local_target,
                    safe_relative, transaction, validate_links, validate_skill_references)
from secret_guard import BRAND_TEMPLATES, check_secrets, validate_platform_contract, validate_source_paths

TOOL = Path(__file__).resolve().parents[1]
STATE = '.agents/hello-nora'
MANIFEST = STATE + '/manifest.json'
BEGIN = '# BEGIN Hello Nora managed ignores'
END = '# END Hello Nora managed ignores'
IGNORES = '''# BEGIN Hello Nora managed ignores
/.agents/skills/_brand*/
/.agents/hello-nora/backups/
/.agents/hello-nora/*.nora-tmp
# END Hello Nora managed ignores
'''


def build_payload(project):
    validate_source_paths(p.relative_to(TOOL).as_posix() for p in TOOL.rglob('*')
                          if p.is_file() and not p.relative_to(TOOL).as_posix().startswith(
                              ('.maintenance/', '.git/', '__pycache__/'))
                          and '__pycache__' not in p.parts)
    source = dict(files_under(TOOL / 'skills'))
    validate_platform_contract({'skills/' + key: data for key, data in source.items()})
    reviewed = json.loads(guarded(TOOL, '.maintenance/source-lock.json').read_bytes())['managed_files']
    for name in sorted(BRAND_TEMPLATES):
        key = '_brand/' + name
        if key not in source or digest(source[key]) != reviewed.get('skills/' + key):
            raise ValueError(f'品牌範本與已稽核版本不符，請先完成來源差異驗證：skills/{key}')
    mapping = {'skills/' + rel: '.agents/skills/' + rel for rel in source}
    for directory in ('course', 'resources', 'examples', 'images'):
        for rel, data in files_under(TOOL / directory):
            key = directory + '/' + rel
            source[key] = data
            mapping[key] = STATE + '/docs/' + key
    for path in TOOL.glob('*.md'):
        if path.name != 'AGENTS.md':
            source[path.name] = path.read_bytes()
            mapping[path.name] = STATE + '/docs/' + path.name
    payload = {}
    for key, destination in mapping.items():
        data = source[key[7:] if key.startswith('skills/') else key]
        if key.endswith('.md'):
            text = data.decode('utf-8').replace('~/.claude/skills/', '.agents/skills/')

            def rewrite(match):
                target = local_target(match[2])
                if target is None:
                    return match[0]
                path = Path(os.path.normpath(TOOL / key / '..' / target))
                relative = os.path.relpath(path, TOOL).replace('\\', '/')
                output = project / mapping[relative] if relative in mapping else path
                if not output.exists() and relative not in mapping:
                    raise ValueError(f'來源引用不存在：{key} -> {target}')
                link = os.path.relpath(output, (project / destination).parent).replace('\\', '/')
                anchor = '#' + match[2].split('#', 1)[1] if '#' in match[2] else ''
                return match[1] + '<' + link + anchor + '>' + match[3]

            data = LINK.sub(rewrite, text).encode('utf-8')
        payload[destination] = data
    validate_links(project, payload)
    validate_skill_references(payload)
    return payload


def read_manifest(project):
    path = guarded(project, MANIFEST)
    if not path.exists():
        return None
    value = json.loads(path.read_text(encoding='utf-8'))
    if value.get('version') != 1 or not isinstance(value.get('managed_files'), dict):
        raise ValueError('無法辨識 manifest，請保留現況並檢查')
    for rel, checksum in value['managed_files'].items():
        safe_relative(rel)
        if not (rel.startswith('.agents/skills/') or rel.startswith(STATE + '/docs/')):
            raise ValueError(f'manifest 超出管理範圍：{rel}')
        if rel.startswith('.agents/skills/_brand'):
            raise ValueError('品牌資料不得由 manifest 管理')
        if not re.fullmatch('[0-9a-f]{64}', checksum):
            raise ValueError('manifest 雜湊格式錯誤')
        target = guarded(project, rel)
        if target.exists() and (not target.is_file() or digest(target.read_bytes()) != checksum):
            raise ValueError(f'管理檔案已被修改，請先合併或備份：{rel}')
    return value


def ignores(project):
    path = guarded(project, '.gitignore')
    text = path.read_text(encoding='utf-8') if path.exists() else ''
    if BEGIN in text or END in text:
        if text.count(BEGIN) != 1 or text.count(END) != 1 or text.index(BEGIN) > text.index(END):
            raise ValueError('.gitignore 管理區塊不完整')
        start = text.index(BEGIN)
        end = text.index(END) + len(END)
        text = text[:start] + text[end:].lstrip('\r\n')
    return (text.rstrip('\r\n') + '\n\n' + IGNORES).lstrip('\n').encode('utf-8')


def plan(project, remove=False):
    check_secrets(project, bootstrap=True)
    previous = read_manifest(project)
    managed = previous['managed_files'] if previous else {}
    if remove:
        return {}, list(managed) + ([MANIFEST] if previous else []), previous
    payload = build_payload(project)
    # 同名的未管理技能目錄一律衝突，即使內容完全相同。
    names = {rel.split('/')[2] for rel in payload if rel.startswith('.agents/skills/')
             and not rel.split('/')[2].startswith('_brand')}
    owned_names = {rel.split('/')[2] for rel in managed if rel.startswith('.agents/skills/')}
    for name in names - owned_names:
        if guarded(project, '.agents/skills/' + name).exists():
            raise ValueError(f'同名非管理技能：{name}')
    writes, new_managed = {}, {}
    brand_templates = {rel[len('.agents/skills/_brand/'):]: data for rel, data in payload.items()
                       if rel.startswith('.agents/skills/_brand/')}
    skill_root = guarded(project, '.agents/skills')
    brands = [p for p in skill_root.glob('_brand*') if p.is_dir()] if skill_root.exists() else []
    for brand in brands:
        guarded(project, brand.relative_to(project).as_posix())
        for suffix, data in brand_templates.items():
            payload[brand.relative_to(project).as_posix() + '/' + suffix] = data
    for rel, data in payload.items():
        target = guarded(project, rel)
        if rel.startswith('.agents/skills/_brand'):
            if not target.exists():
                writes[rel] = data
            continue
        if target.exists() and rel not in managed:
            raise ValueError(f'非管理檔案衝突：{rel}')
        new_managed[rel] = digest(data)
        if not target.exists() or target.read_bytes() != data:
            writes[rel] = data
    deletes = sorted(set(managed) - set(new_managed))
    value = {'version': 1, 'tool_relative_path': os.path.relpath(TOOL, project).replace('\\', '/'),
             'managed_files': new_managed}
    manifest_data = json_bytes(value)
    manifest_path = guarded(project, MANIFEST)
    if not manifest_path.exists() or manifest_path.read_bytes() != manifest_data:
        writes[MANIFEST] = manifest_data
    ignore_data = ignores(project)
    ignore_path = guarded(project, '.gitignore')
    if not ignore_path.exists() or ignore_path.read_bytes() != ignore_data:
        writes['.gitignore'] = ignore_data
    return writes, deletes, previous


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root', required=True, type=Path)
    parser.add_argument('--install', action='store_true', help='執行預覽中的變更；未提供時只讀')
    parser.add_argument('--remove', action='store_true', help='預覽移除；加 --install 才執行')
    parser.add_argument('--check-secrets', action='store_true', help='唯讀檢查品牌／備份忽略規則與 Git 索引')
    args = parser.parse_args(argv)
    if args.check_secrets and (args.install or args.remove):
        parser.error('--check-secrets 不可與 --install 或 --remove 合用')
    try:
        raw = args.project_root.absolute()
        for path in (raw, *raw.parents):
            if is_link(path):
                raise ValueError(f'專案路徑不可含連結：{path}')
        project = raw.resolve(strict=True)
        if not project.is_dir():
            raise ValueError('目標專案必須是既有目錄')
        if args.check_secrets:
            print(json.dumps(check_secrets(project), ensure_ascii=False, indent=2))
            return 0
        writes, deletes, previous = plan(project, args.remove)
        print(json.dumps({'mode': '執行' if args.install else '預覽', 'project_root': str(project),
                          'write': sorted(writes), 'delete': sorted(deletes)}, ensure_ascii=False, indent=2))
        if args.install:
            # 先保護目的地，再檢查實際生效規則；通過後才寫模板與備份。
            ignore_path = guarded(project, '.gitignore')
            old_ignore = ignore_path.read_bytes() if ignore_path.exists() else None
            transaction(project, {'.gitignore': ignores(project)})
            try:
                protection = check_secrets(project)
                _execute(project, writes, deletes, args.remove, old_ignore)
            except BaseException:
                transaction(project, {'.gitignore': old_ignore} if old_ignore is not None else {},
                            () if old_ignore is not None else ('.gitignore',))
                raise
            print(protection['status'])
            print('完成；品牌資料、備份與其他技能已保留。')
        return 0
    except (OSError, ValueError, KeyError) as error:
        print(f'停止：{error}', file=sys.stderr)
        return 1


def _execute(project, writes, deletes, remove, old_ignore):
    # 備份僅位於目標專案內，且由 .gitignore 保護；不備份品牌內容。
    backups = {}
    for rel in set(writes) | set(deletes):
        path = guarded(project, rel)
        if path.is_file():
            data = old_ignore if rel == '.gitignore' else path.read_bytes()
            if data is None:
                continue
            backups[STATE + '/backups/' + digest(data) + '/' + rel] = data
    if remove:
        # 移除後仍保留忽略規則，避免品牌和備份變成可提交內容。
        writes['.gitignore'] = ignores(project)
    transaction(project, {**backups, **writes}, deletes)
    # 僅清理已刪管理檔案留下的空目錄，不遞迴刪除使用者內容。
    parents = {parent for rel in deletes for parent in (project / rel).parents
               if parent != project and parent.is_relative_to(project)}
    for parent in sorted(parents, key=lambda p: len(p.parts), reverse=True):
        if parent.is_dir() and not any(parent.iterdir()):
            parent.rmdir()


if __name__ == '__main__':
    sys.exit(main())
