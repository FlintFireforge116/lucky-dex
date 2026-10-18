#!/usr/bin/env python3
"""Audit LuckyDex's bundled physical booster artwork and build runtime aliases.

v0.26.5 intentionally performs *no network access*. Every genuine English set for
which the audited product-art catalogue exposes a booster packshot is bundled in
the APK source itself. This script verifies every local image, generates ID/name
aliases, and (when the repository-level card-art index is present) assigns the
actual LuckyDex physical set key to its corresponding local pack image.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / 'app/src/main/assets/booster-art-v0260'
MANIFEST = ROOT / 'app/src/main/assets/booster-art-index-v0260.json'
COVERAGE = ROOT / 'app/src/main/assets/booster-art-coverage-v0264.json'
CATALOG = ROOT / 'scripts/booster-set-catalog-v0264.tsv'
CARD_INDEX_CANDIDATES = (
    ROOT.parent / 'card-art-index.json',  # normal GitHub APK workflow: source/ + sibling index
    ROOT / 'card-art-index.json',         # standalone/full-repository builds
)

# These English catalogue rows are intentionally not booster products. The
# audited packshot source has no booster artwork for them, so their absence is
# expected rather than silently treated as missing art.
NON_BOOSTER_NO_ART = {
    'basep', 'bp', 'smp', 'sve', 'swsh45sv', 'swshp',
    'tk1a', 'tk1b', 'tk2a', 'tk2b', 'xy0', 'xyp',
}

# Explicit semantic aliases where the two catalogues use a different display
# title for the same physical expansion.
NAME_ALIASES = {
    'base set': 'base',
    'pokemon base set': 'base',
    'expedition': 'expedition base set',
}


def normalize_name(value: str) -> str:
    text = unicodedata.normalize('NFKD', str(value or ''))
    text = ''.join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower().replace('pokémon', 'pokemon')
    text = re.sub(r'[^a-z0-9]+', ' ', text).strip()
    return re.sub(r'\s+', ' ', text)


def canonical_name(value: str) -> str:
    name = normalize_name(value)
    name = NAME_ALIASES.get(name, name)
    # Some English metadata names omit the historical marketing prefix.
    for prefix in ('hs ', 'ex '):
        if name.startswith(prefix) and len(name) > len(prefix):
            name = name[len(prefix):]
    return NAME_ALIASES.get(name, name)


def english_sets(_readme: str = ''):
    """Compatibility helper used by tests; prefer the checked-in audited TSV."""
    if _readme:
        rows = {}
        block = _readme.split('## English', 1)[-1]
        block = re.split(r'(?m)^##\s+', block, maxsplit=1)[0]
        for line in block.splitlines():
            m = re.match(r'^\|\s*([^|]+?)\s*\|\s*en\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|', line)
            if m and m.group(1).strip().lower() != 'id':
                sid = m.group(1).strip()
                rows[sid] = {'id': sid, 'name': m.group(2).strip(), 'series': m.group(3).strip()}
        return rows
    return load_catalog()


def load_catalog():
    if not CATALOG.is_file():
        raise SystemExit(f'Missing audited booster set catalogue: {CATALOG}')
    rows = {}
    for line in CATALOG.read_text(encoding='utf-8').splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        try:
            sid, name = line.split('\t', 1)
        except ValueError as exc:
            raise SystemExit(f'Invalid booster catalogue row: {line!r}') from exc
        sid, name = sid.strip(), name.strip()
        if not sid or not name or sid in rows:
            raise SystemExit(f'Invalid/duplicate booster catalogue row: {line!r}')
        rows[sid] = {'id': sid, 'name': name}
    return rows


def local_art_files():
    allowed = {'.webp', '.png', '.jpg', '.jpeg'}
    out = {}
    if not ASSET_DIR.is_dir():
        return out
    for path in sorted(ASSET_DIR.iterdir()):
        if path.is_file() and path.suffix.lower() in allowed:
            if path.stem in out:
                raise SystemExit(f'Duplicate booster artwork for {path.stem}')
            out[path.stem] = path
    return out


def app_card_index():
    for path in CARD_INDEX_CANDIDATES:
        if not path.is_file():
            continue
        try:
            payload = json.loads(path.read_text(encoding='utf-8'))
        except Exception as exc:
            raise SystemExit(f'Could not parse physical card index {path}: {exc}') from exc
        if isinstance(payload, dict) and isinstance(payload.get('sets'), list):
            return payload
    return None


def build_runtime_manifest(catalog, selected, app_index=None):
    """Build deterministic source-ID, name, and actual LuckyDex-key aliases."""
    by_id, by_name, by_app_key, coverage = {}, {}, {}, []
    source_by_canonical = {}

    for sid in sorted(selected):
        if sid not in catalog:
            raise SystemExit(f'Bundled booster art has no audited catalogue row: {sid}')
        ext = selected[sid]['ext'] if isinstance(selected[sid], dict) else Path(str(selected[sid])).suffix
        asset = f'booster-art-v0260/{sid}{ext}'
        by_id[sid] = asset
        source_name = catalog[sid]['name']
        norm = normalize_name(source_name)
        canon = canonical_name(source_name)
        for key in {norm, canon}:
            if key:
                previous = by_name.get(key)
                if previous and previous != asset:
                    raise SystemExit(f'Ambiguous booster set name alias {key!r}: {previous}, {asset}')
                by_name[key] = asset
        source_by_canonical.setdefault(canon, []).append((sid, asset, source_name))

    # Explicit display-name aliases that are safe and unique.
    for alias, target in NAME_ALIASES.items():
        hits = source_by_canonical.get(canonical_name(target), [])
        if len(hits) == 1:
            by_name[normalize_name(alias)] = hits[0][1]
            by_name[canonical_name(alias)] = hits[0][1]

    if app_index and isinstance(app_index.get('sets'), list):
        for row in app_index['sets']:
            app_key = str(row.get('k') or row.get('key') or row.get('code') or '').strip()
            app_name = str(row.get('n') or row.get('name') or app_key).strip()
            canon = canonical_name(app_name)
            hits = source_by_canonical.get(canon, [])
            status = 'not-a-known-booster-product'
            source_id = ''
            asset = ''
            expected = False
            if len(hits) == 1:
                source_id, asset, _ = hits[0]
                expected = True
                status = 'assigned'
                if app_key:
                    by_app_key[app_key] = asset
            elif len(hits) > 1:
                status = 'ambiguous'
                expected = True
            coverage.append({
                'app_key': app_key,
                'app_name': app_name,
                'source_id': source_id,
                'asset': asset,
                'expected_art': expected,
                'status': status,
            })

    manifest = {
        'schema': 2,
        'audit': 'v0.26.5-local-explicit-packshots',
        'art_count': len(by_id),
        'byId': by_id,
        'byName': dict(sorted(by_name.items())),
        'byAppKey': dict(sorted(by_app_key.items())),
    }
    return manifest, coverage


def verify_image_signatures(files):
    # Lightweight, dependency-free corruption check suitable for Gradle runners.
    for sid, path in files.items():
        size = path.stat().st_size
        if size < 4096:
            raise SystemExit(f'Booster artwork is suspiciously small: {sid} ({size} bytes)')
        head = path.read_bytes()[:16]
        ext = path.suffix.lower()
        valid = (
            ext == '.webp' and head[:4] == b'RIFF' and head[8:12] == b'WEBP'
        ) or (ext == '.png' and head[:8] == b'\x89PNG\r\n\x1a\n') \
          or (ext in {'.jpg', '.jpeg'} and head[:2] == b'\xff\xd8')
        if not valid:
            raise SystemExit(f'Booster artwork signature mismatch: {path.name}')


def main():
    catalog = load_catalog()
    files = local_art_files()
    verify_image_signatures(files)

    missing_catalog = sorted(set(files) - set(catalog))
    if missing_catalog:
        raise SystemExit(f'Artwork exists without explicit set assignment: {missing_catalog}')

    missing_art = sorted(set(catalog) - set(files))
    unexpected_missing = sorted(set(missing_art) - NON_BOOSTER_NO_ART)
    unexpected_artless_allowlist = sorted(NON_BOOSTER_NO_ART - set(missing_art))
    if unexpected_missing:
        raise SystemExit(
            'Booster-art audit failed. These English sets are missing an assigned image: '
            + ', '.join(unexpected_missing)
        )
    if unexpected_artless_allowlist:
        raise SystemExit(
            'Booster-art allowlist is stale; artwork now exists for: '
            + ', '.join(unexpected_artless_allowlist)
        )

    selected = {sid: {'ext': path.suffix.lower()} for sid, path in files.items()}
    manifest, coverage = build_runtime_manifest(catalog, selected, app_card_index())

    # Known smoke products: base1 Base Set; base2 Jungle; ecard3 Skyridge; ex1 Ruby & Sapphire; sm35 Shining Legends; me3 Perfect Order.
    required = {'base1', 'base2', 'ecard3', 'ex1', 'sm35', 'me3'}
    if not required.issubset(manifest['byId']):
        raise SystemExit(f'Known-pack smoke audit failed: {sorted(required - set(manifest["byId"]))}')

    broken_coverage = [row for row in coverage if row['expected_art'] and not row['asset']]
    if broken_coverage:
        raise SystemExit(f'Runtime-set booster mapping audit failed: {broken_coverage[:8]}')

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    COVERAGE.write_text(json.dumps({
        'schema': 1,
        'audit': 'v0.26.5',
        'catalog_sets': len(catalog),
        'assigned_packshots': len(files),
        'known_non_booster_rows_without_packshots': sorted(missing_art),
        'runtime_sets_checked': len(coverage),
        'runtime_mapped_booster_sets': sum(1 for row in coverage if row['status'] == 'assigned'),
        'sets': coverage,
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print(
        f'PASS v0.26.5 booster-art audit: {len(files)}/{len(catalog)} catalogue rows '
        f'have real bundled packshots; remaining {len(missing_art)} are explicitly non-booster products. '
        f'Runtime set aliases: {len(manifest["byAppKey"])}.'
    )


if __name__ == '__main__':
    main()
