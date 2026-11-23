#!/usr/bin/env python3
"""LuckyDex expansion gate parity and generated whole-set gap ledger.

No dependencies outside Python's standard library. This intentionally never
marks a card enabled; it audits the generated source of truth after prepare.

Examples:
  python3 scripts/audit-expansion-readiness.py --set sm5 --release-only
  sh scripts/prepare-sm5.sh
  python3 scripts/audit-expansion-readiness.py --set sm5 \
      --report docs/SM5_CURRENT_GAP_LEDGER.md --check-release
  python3 scripts/audit-expansion-readiness.py --set sm5 --require-complete
"""
from __future__ import annotations

import argparse
import ast
from collections import Counter
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def require(condition: bool, message: str):
    if not condition:
        raise ValueError(message)


def read_json(path: Path):
    require(path.is_file(), f'Missing {path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}; run the set prepare/generator before claiming coverage')
    return json.loads(path.read_text(encoding='utf-8'))


def normalized(text):
    return ' '.join(str(text or '').split())


def canonical_rows(path: Path, set_id: str):
    rows = read_json(path)
    require(isinstance(rows, list) and rows, f'{set_id}: missing canonical print rows')
    require(all(isinstance(r, list) and len(r) > 13 and isinstance(r[7], list) and isinstance(r[8], list) for r in rows),
            f'{set_id}: unexpected pinned print-row schema; do not estimate coverage')
    ids = [f'{set_id}-{r[0]}' for r in rows]
    require(len(ids) == len(set(ids)), f'{set_id}: duplicate collector numbers')
    return rows, ids


def release_check(set_id: str, root: Path, contract: dict) -> list[str]:
    """Check static build contracts without requiring generated catalogue data."""
    errors: list[str] = []
    release = contract.get('release')
    if not re.fullmatch(r'\d+\.\d+\.\d+', str(release or '')):
        errors.append('release contract has no valid release version')
        return errors
    assets = root / 'app/src/main/assets'
    gradle_path = root / 'app/build.gradle'
    gradle = gradle_path.read_text(encoding='utf-8') if gradle_path.is_file() else ''
    html_path = assets / 'index.html'
    html = html_path.read_text(encoding='utf-8') if html_path.is_file() else ''
    if not re.search(r'\bversionName\s*[\'\"]' + re.escape(release) + r'[\'\"]', gradle):
        errors.append('Gradle versionName does not match release '+release)
    if 'v'+release not in html:
        errors.append('HTML title/version does not match release '+release)
    appfiles = sorted(assets.glob('app-v*.js'))
    if not any("__LUCKYDEX_BUILD='" + release + "'" in p.read_text(encoding='utf-8') for p in appfiles):
        errors.append('app boot __LUCKYDEX_BUILD version differs from '+release)

    # Older expansion contracts embed the global app version, not their own
    # historical set-release version. Catch skew before slow CI starts.
    for p in sorted((root / 'scripts').glob('*_release_contract.json')):
        try:
            previous = json.loads(p.read_text(encoding='utf-8')).get('release')
        except (ValueError, OSError):
            errors.append(f'invalid prior release contract {p.name}')
            continue
        if previous != release:
            errors.append(f'stale version in {p.name}: {previous} != {release}')

    preflight = root / 'scripts' / f'preflight-{set_id}-release.py'
    if not preflight.is_file():
        errors.append(f'missing {preflight.relative_to(root)}')
        return errors
    try:
        tree = ast.parse(preflight.read_text(encoding='utf-8'), filename=str(preflight))
        test_list = next((ast.literal_eval(t.value) for t in tree.body
                          if isinstance(t, ast.Assign) and any(isinstance(n, ast.Name) and n.id == 'TESTS' for n in t.targets)), None)
        if not isinstance(test_list, list) or not all(isinstance(x, str) for x in test_list):
            raise ValueError('TESTS must be a literal list of test paths')
    except (ValueError, SyntaxError, StopIteration) as exc:
        errors.append(f'cannot read literal TESTS from {preflight.name}: {exc}')
        return errors
    for path in test_list:
        if not (root / path).is_file():
            errors.append(f'missing mandatory test {path}')

    task = f'audit{set_id.upper()}ForApk'
    task_match = re.search(r"tasks\.register\(['\"]" + re.escape(task) + r"['\"],\s*Exec\)\s*\{(.*?)\n\}",
                           gradle, flags=re.S)
    if not task_match:
        errors.append(f'Gradle missing APK gate task {task}')
        return errors
    gradle_tests = set(re.findall(r'tests/[^\'\"\s,]+\.test\.cjs', task_match.group(1)))
    preflight_tests = set(test_list)
    if len(preflight_tests) != len(test_list):
        errors.append('duplicate test paths in set preflight TESTS list')
    for path in sorted(preflight_tests - gradle_tests):
        errors.append(f'Termux-only test missing from Gradle APK gate: {path}')
    for path in sorted(gradle_tests - preflight_tests):
        errors.append(f'Gradle-only test missing from Termux preflight: {path}')
    for taskname, expected in [(f'generate{set_id.upper()}ForApk',f'preflight{set_id.upper()}ContractForApk'),
                               (f'audit{set_id.upper()}ForApk',f'generate{set_id.upper()}ForApk')]:
        task_block = re.search(r"tasks\.register\(['\"]" + re.escape(taskname) + r"['\"],\s*Exec\)\s*\{(.*?)\n\}", gradle, flags=re.S)
        if not task_block or f"dependsOn tasks.named('{expected}')" not in task_block.group(1):
            errors.append(f'Gradle task {taskname} must depend on {expected} in generation order')
    return errors


def audit(set_id: str, root: Path, contract: dict, rows: list, ids: list, coverage: dict, compact_path: Path) -> str:
    expected = contract.get('printedTotal')
    if expected is not None:
        require(expected == len(rows), f'{set_id}: {len(rows)} source prints != contract {expected}')
    require(coverage.get('printed') == len(rows), f'{set_id}: generated coverage print count differs from pinned source')
    counted_attacks = sum(len(r[7]) for r in rows)
    counted_abilities = sum(len(r[8]) for r in rows)
    for key, actual in [('attacks', counted_attacks), ('abilities', counted_abilities)]:
        require(coverage.get(key) == actual, f'{set_id}: coverage {key} count mismatch ({coverage.get(key)} != {actual})')
    for key, actual in [('attackPrints', counted_attacks), ('abilities', counted_abilities),
                        ('trainerPrints', sum(r[2] == 'Trainer' for r in rows)),
                        ('energyPrints', sum(r[2] == 'Energy' for r in rows)),
                        ('prismStarPrints', sum('Prism Star' in r[3] for r in rows))]:
        if key in contract:
            require(contract[key] == actual, f'{set_id}: pinned contract {key} disagrees with source')

    attestation_path = root / 'docs' / (set_id.upper() + '_CANONICAL_SOURCE.json')
    attestation = read_json(attestation_path)
    require(attestation.get('compactSha256') == hashlib.sha256(compact_path.read_bytes()).hexdigest(),
            f'{set_id}: pinned source SHA256 does not match attestation')
    if contract.get('pin') is not None:
        require(attestation.get('sourceGitBlob') == contract['pin'], f'{set_id}: pinned source Git blob differs from release contract')

    gated = coverage.get('gated')
    require(isinstance(gated, dict), f'{set_id}: expected generated coverage.gated map')
    require(set(gated).issubset(ids), f'{set_id}: coverage includes IDs absent from canonical print source')
    require(all(isinstance(reasons, list) and all(str(v).strip() for v in reasons) and reasons for reasons in gated.values()),
            f'{set_id}: every gated print needs a nonempty reason')
    ready = coverage.get('battleReady')
    require(isinstance(ready, int) and ready >= 0 and ready + len(gated) == len(rows),
            f'{set_id}: generated playable + gated != printed; cannot claim completion')
    if 'sourceGitBlob' in coverage and contract.get('pin'):
        require(coverage['sourceGitBlob'] == contract['pin'], f'{set_id}: coverage built from wrong pinned blob')

    attacks = {(str(a[0]), tuple(a[1]), str(a[2]), normalized(a[3])) for r in rows for a in r[7]}
    abilities = {(str(a[0]), normalized(a[2])) for r in rows for a in r[8]}
    trainers = {(str(r[1]), tuple(normalized(v) for v in r[13] or [])) for r in rows if r[2] == 'Trainer'}
    energy = {(str(r[1]), tuple(normalized(v) for v in r[13] or [])) for r in rows if r[2] == 'Energy'}
    grouped: dict[str, list[str]] = {}
    for cid, reasons in gated.items():
        for reason in set(reasons):
            grouped.setdefault(str(reason), []).append(cid)
    by_id = {f'{set_id}-{r[0]}': r for r in rows}
    lines = [f'# {set_id.upper()} — whole-set gap ledger', '',
             f'Canonical prints: **{len(rows)}** | Playable: **{ready}** | Gated: **{len(gated)}**',
             f'Printed attacks: **{counted_attacks}** ({len(attacks)} distinct full signatures) | '
             f'Abilities: **{counted_abilities}** ({len(abilities)} distinct signatures)',
             f'Trainer rule signatures: **{len(trainers)}** | Special Energy rule signatures: **{len(energy)}**',
             f'Canonical Git blob: `{attestation.get("sourceGitBlob", "not declared")}`', '',
             'The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.',
             'Gated is determined by the validated generator output; do not infer it from test counts.', '']
    lines.append('## Blocker groups (implement shared handlers first)')
    if not gated:
        lines.append('No gated prints in the generated coverage. Independent outcome audit and APK build are still required.')
    else:
        for reason, cards in sorted(grouped.items(), key=lambda item: (-len(item[1]), item[0])):
            lines.append(f'- **{len(cards)} prints** — {reason} — {", ".join(sorted(cards, key=lambda x: int(re.search(r"\d+", x.split("-")[-1]).group()))[:16])}' + (' …' if len(cards) > 16 else ''))
        lines.extend(['', '## Every remaining gated print', '', '| Print | Card | Blocking reason(s) |', '|---|---|---|'])
        for cid in ids:
            if cid in gated:
                card = by_id[cid]
                reasons = '; '.join(str(x) for x in gated[cid]).replace('|', '\\|')
                lines.append(f'| `{cid}` | {str(card[1]).replace("|", "/")} | {reasons} |')
    lines.extend(['', '## Release definition', '',
                  'Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, '
                  'Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. '
                  'CI APK and physical-device checks are separate evidence.', ''])
    return '\n'.join(lines)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--set', required=True, dest='set_id', help='expansion ID, e.g. sm5')
    p.add_argument('--root', type=Path, default=ROOT)
    p.add_argument('--release-only', action='store_true', help='check static test/build contracts without generated files')
    p.add_argument('--check-release', action='store_true', help='also check static test/build contracts')
    p.add_argument('--require-complete', action='store_true', help='fail if any print is gated')
    p.add_argument('--report', type=Path, help='write readable current gap ledger, relative to repository root')
    args = p.parse_args()
    root = args.root.resolve()
    set_id = args.set_id.lower()
    require(bool(re.fullmatch(r'[a-z0-9]+', set_id)), 'set ID must be alphanumeric')
    contract = read_json(root / 'scripts' / f'{set_id}_release_contract.json')
    require(contract.get('set') == set_id, f'wrong {set_id} release contract')
    if args.release_only or args.check_release:
        issues = release_check(set_id, root, contract)
        if issues:
            raise ValueError('release gate mismatch:\n  - ' + '\n  - '.join(issues))
        print(f'{set_id.upper()} static release parity PASS: version, Gradle, Termux tests and build order')
    if args.release_only:
        return 0
    compact = root / 'data/classic' / f'{set_id}-print-compact.json'
    rows, ids = canonical_rows(compact, set_id)
    coverage = read_json(root / 'docs' / f'{set_id.upper()}_BUILD_COVERAGE.json')
    report = audit(set_id, root, contract, rows, ids, coverage, compact)
    if args.report:
        output = args.report if args.report.is_absolute() else root / args.report
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(report, encoding='utf-8')
        print(f'Gap ledger written: {output}')
    print('\n'.join(report.splitlines()[:5]))
    if args.require_complete and coverage['gated']:
        raise ValueError(f'{set_id}: {len(coverage["gated"])} prints remain gated; see generated gap ledger')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print('EXPANSION READINESS FAILED:', exc, file=sys.stderr)
        sys.exit(1)
