#!/usr/bin/env python3
"""Audit the actual CommonJS sleeve registry and every bundled offline image.

No network access, image generation, registry mutation, or source rewriting.
Exit zero only when complete v0.44.0 coverage and image integrity are verified.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import subprocess
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_COUNTS = {'physical': 114, 'pocket': 78, 'original': 10}
MAX_FILE_BYTES = 250_000
MAX_TOTAL_BYTES = 12_000_000


def list_rows(value):
    if isinstance(value, list):
        return value
    if isinstance(value, dict) and isinstance(value.get('sleeves'), list):
        return value['sleeves']
    raise ValueError('Expected an array or an object with a sleeves array')


def audit(root, node_override=None):
    root = root.resolve()
    assets = root / 'app/src/main/assets'
    errors, warnings = [], []
    report = {'schemaVersion': 1, 'version': '0.44.0', 'passed': False,
              'expectedSourceCounts': EXPECTED_COUNTS, 'errors': errors, 'warnings': warnings,
              'limits': {'maximumImageBytes': MAX_FILE_BYTES, 'maximumTotalBytes': MAX_TOTAL_BYTES}}

    def error(message):
        errors.append(message)

    def read_json(relative):
        try:
            return json.loads((root / relative).read_text(encoding='utf-8-sig'))
        except Exception as exc:
            error(f'{relative}: {exc}')
            return None

    def load_rows(relative):
        value = read_json(relative)
        if value is None:
            return []
        try:
            rows = list_rows(value)
            if not all(isinstance(row, dict) for row in rows):
                raise ValueError('Every sleeve row must be an object')
            return rows
        except ValueError as exc:
            error(f'{relative}: {exc}')
            return []

    source_families, sources = {}, {}
    for family, expected in EXPECTED_COUNTS.items():
        relative = f'scripts/data/sleeves-{family}-v0440.json'
        rows = load_rows(relative)
        source_families[family] = rows
        if len(rows) != expected:
            error(f'{family} source count is {len(rows)}, expected {expected}')
        for row in rows:
            source_id = row.get('id')
            if not isinstance(source_id, str) or not source_id:
                error(f'{relative}: missing source id')
                continue
            if source_id in sources:
                error(f'Duplicate source id: {source_id}')
            sources[source_id] = row
    report['sourceCounts'] = {family: len(rows) for family, rows in source_families.items()}

    node = node_override or os.environ.get('LUCKYDEX_NODE') or shutil.which('node')
    bundled_node = Path.home() / '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
    if not node and bundled_node.exists():
        node = str(bundled_node)
    catalogue = assets / 'cosmetics-catalog-v0413.js'
    registry = []
    if not node:
        error('Node.js is required to inspect the authoritative CommonJS catalogue; set LUCKYDEX_NODE or --node')
    else:
        try:
            result = subprocess.run([node, '-e',
                "const c=require(process.argv[1]);if(!Array.isArray(c.CATALOGUE))throw new Error('CATALOGUE is not an array');process.stdout.write(JSON.stringify(c.CATALOGUE));",
                str(catalogue)], cwd=root, capture_output=True, text=True, encoding='utf-8', timeout=30, check=True)
            registry = list_rows(json.loads(result.stdout))
        except Exception as exc:
            error(f'Could not execute authoritative CommonJS catalogue: {exc}')
    report['registryPath'] = catalogue.relative_to(root).as_posix()
    report['registryCount'] = len(registry)
    if len(registry) != sum(EXPECTED_COUNTS.values()):
        error(f'Registry count is {len(registry)}, expected {sum(EXPECTED_COUNTS.values())}')

    by_id, represented_sources, used_paths = {}, {}, {}
    for row in registry:
        entry_id = row.get('id')
        if not isinstance(entry_id, str) or not entry_id:
            error('Registry row lacks a nonempty id')
            continue
        if entry_id in by_id:
            error(f'Duplicate registry id: {entry_id}')
        by_id[entry_id] = row
        source_id = row.get('sourceId')
        if not isinstance(source_id, str) or source_id not in sources:
            error(f'{entry_id}: unknown/missing sourceId {source_id!r}')
        else:
            represented_sources.setdefault(source_id, []).append(entry_id)
            source = sources[source_id]
            if row.get('sourceFamily') != source.get('sourceFamily'):
                error(f'{entry_id}: sourceFamily differs from source {source_id}')
            if row.get('artPath') != source.get('artPath'):
                error(f'{entry_id}: artPath differs from source {source_id}')
        if not isinstance(row.get('themes'), list) or not row['themes'] or not all(isinstance(t, str) and t for t in row['themes']):
            error(f'{entry_id}: themes must be a nonempty list of strings')
        if row.get('rewardGroup') is not None and not isinstance(row['rewardGroup'], str):
            error(f'{entry_id}: rewardGroup must be a string or null')
        path = row.get('artPath')
        if not isinstance(path, str) or not path or '\\' in path:
            error(f'{entry_id}: artPath must be a nonempty forward-slash local asset path')
            continue
        pure = PurePosixPath(path)
        if (pure.is_absolute() or ':' in path or '?' in path or '#' in path or '..' in pure.parts
                or not path.startswith('cosmetics/sleeves/') or pure.suffix.lower() != '.webp'):
            error(f'{entry_id}: unsafe or remote artPath: {path}')
            continue
        target = (assets / path).resolve()
        if not target.is_relative_to(assets.resolve()):
            error(f'{entry_id}: artPath escapes the Android assets directory')
            continue
        used_paths.setdefault(path, []).append(row)

    missing_sources = sorted(set(sources) - set(represented_sources))
    duplicate_source_rows = {sid: ids for sid, ids in represented_sources.items() if len(ids) != 1}
    if missing_sources:
        error('Source designs missing from registry: ' + ', '.join(missing_sources))
    if duplicate_source_rows:
        error('Source designs represented more than once: ' + json.dumps(duplicate_source_rows, sort_keys=True))
    report['sourceCoverage'] = {family: {
        'expected': EXPECTED_COUNTS[family], 'sourceRows': len(rows),
        'represented': sum(row.get('id') in represented_sources for row in rows),
        'missing': [row.get('id') for row in rows if row.get('id') not in represented_sources]
    } for family, rows in source_families.items()}

    legacy = load_rows('scripts/data/sleeves-legacy-v0431.json')
    legacy_ids = {row.get('id') for row in legacy}
    missing_legacy = sorted(legacy_ids - set(by_id))
    if len(legacy_ids) != 30:
        error(f'Legacy snapshot contains {len(legacy_ids)} unique IDs, expected 30')
    if missing_legacy:
        error('Previously available sleeve IDs removed: ' + ', '.join(missing_legacy))
    report['legacyIds'] = {'expected': 30, 'preserved': len(legacy_ids - set(missing_legacy)), 'missing': missing_legacy}

    metadata, byte_digests, pixel_digests = {}, {}, {}
    for path, rows in sorted(used_paths.items()):
        target = assets / path
        try:
            data = target.read_bytes()
            digest = hashlib.sha256(data).hexdigest()
            with Image.open(target) as image:
                image.load()
                width, height = image.size
                if image.format != 'WEBP':
                    error(f'{path}: extension is WebP but decoded format is {image.format}')
                if getattr(image, 'n_frames', 1) != 1:
                    error(f'{path}: animated sleeve assets are not allowed')
                pixel_digest = hashlib.sha256(f'{width}x{height}:'.encode() + image.convert('RGBA').tobytes()).hexdigest()
            info = {'artPath': path, 'sha256': digest, 'width': width, 'height': height, 'bytes': len(data),
                    'registryIds': [row['id'] for row in rows]}
            metadata[path] = info
            byte_digests.setdefault(digest, []).append(path)
            pixel_digests.setdefault(pixel_digest, []).append(path)
            if len(data) > MAX_FILE_BYTES:
                error(f'{path}: {len(data)} bytes exceeds the {MAX_FILE_BYTES}-byte per-image limit')
            if not (1 <= width <= 448 and 1 <= height <= 640):
                error(f'{path}: dimensions {width}x{height} exceed the sleeve preview budget')
            if not 0.64 <= width / height <= 0.80:
                error(f'{path}: aspect ratio {width / height:.6f} is outside the portrait sleeve range')
            for row in rows:
                source = sources.get(row.get('sourceId'))
                if not source:
                    continue
                for key in ('sha256', 'width', 'height', 'bytes'):
                    if source.get(key) != info[key]:
                        error(f'{row["id"]}: decoded {key}={info[key]!r} differs from source {source.get(key)!r}')
                    if key in row and row[key] != info[key]:
                        error(f'{row["id"]}: registry {key} differs from the actual asset')
                sw, sh = source.get('sourceWidth'), source.get('sourceHeight')
                if isinstance(sw, (int, float)) and isinstance(sh, (int, float)) and sw > 0 and sh > 0 and not source.get('imagePreparation'):
                    # Account only for one-pixel integer rounding during a resize.
                    if abs(width / height - sw / sh) > max(1 / height, 1 / sh):
                        error(f'{row["id"]}: source aspect ratio was distorted during encoding')
        except Exception as exc:
            error(f'{path}: missing or undecodable offline artwork: {exc}')

    duplicate_bytes = [paths for paths in byte_digests.values() if len(paths) > 1]
    duplicate_pixels = [paths for paths in pixel_digests.values() if len(paths) > 1]
    if duplicate_bytes:
        error('Identical encoded artwork is duplicated across paths; share one path: ' + json.dumps(duplicate_bytes))
    if duplicate_pixels:
        error('Identical decoded artwork is duplicated across paths; share one path: ' + json.dumps(duplicate_pixels))
    total_bytes = sum(info['bytes'] for info in metadata.values())
    if total_bytes >= MAX_TOTAL_BYTES:
        error(f'{total_bytes} total image bytes must be below {MAX_TOTAL_BYTES}')
    on_disk = {(path.relative_to(assets)).as_posix() for path in (assets / 'cosmetics/sleeves').rglob('*')
               if path.is_file() and path.suffix.lower() == '.webp'}
    unused = sorted(on_disk - set(used_paths))
    if unused:
        error('Unused WebP assets remain in the sleeve package: ' + ', '.join(unused))
    report['images'] = {'referencedPaths': len(used_paths), 'decodedPaths': len(metadata), 'totalBytes': total_bytes,
                        'largestFileBytes': max((info['bytes'] for info in metadata.values()), default=0),
                        'duplicateEncodedArtwork': duplicate_bytes, 'duplicateDecodedArtwork': duplicate_pixels,
                        'unusedPaths': unused, 'assets': list(metadata.values())}

    enumeration = read_json('qa/v0440/physical/catalogue-enumeration.json') or {}
    products = enumeration.get('products', [])
    physical_rows = source_families['physical']
    physical_references = {row.get('referenceUrl') for row in physical_rows}
    physical_references.update(alt.get('referenceUrl') for row in physical_rows for alt in row.get('alternateReferences', []))
    excluded = [row for row in products if row.get('excludedReason')]
    expected_refs = {row.get('referenceUrl') for row in products if not row.get('excludedReason')}
    missing_product_refs = sorted(expected_refs - physical_references)
    extra_product_refs = sorted(physical_references - expected_refs, key=str)
    if enumeration.get('displayedProductCount') != 130 or len(products) != 130 or len({p.get('referenceUrl') for p in products}) != 130:
        error('Physical storefront enumeration must account for exactly 130 unique product URLs')
    if enumeration.get('pageRanges') != [[1, 32], [33, 64], [65, 96], [97, 128], [129, 130]]:
        error('Physical storefront page coverage does not match all five observed pages')
    if len(excluded) != 3 or not all(row.get('slug', '').endswith('-playmat') for row in excluded):
        error('Physical category must document exactly the three excluded playmat products')
    if missing_product_refs or extra_product_refs:
        error(f'Physical product provenance does not reconcile: missing={missing_product_refs}, extra={extra_product_refs}')
    report['physicalEnumeration'] = {'displayedProducts': enumeration.get('displayedProductCount'),
        'enumeratedProducts': len(products), 'excludedPlaymats': len(excluded),
        'sleeveProductsAccountedFor': len(expected_refs & physical_references),
        'missingProductReferences': missing_product_refs, 'unexpectedProductReferences': extra_product_refs}

    manifest_path = 'app/src/main/assets/cosmetics/sleeves/manifest-v0440.json'
    manifest = load_rows(manifest_path)
    manifest_by_id = {row.get('id'): row for row in manifest}
    if len(manifest_by_id) != len(manifest):
        error('Runtime artwork manifest has duplicate IDs')
    if set(manifest_by_id) != set(by_id):
        error('Runtime artwork manifest IDs do not exactly match the authoritative registry')
    for entry_id, row in manifest_by_id.items():
        expected = by_id.get(entry_id)
        if not expected:
            continue
        path = expected.get('artPath')
        if row.get('artPath') != path:
            error(f'{entry_id}: runtime manifest artPath differs from registry')
        actual = metadata.get(path)
        if actual:
            for key in ('sha256', 'width', 'height', 'bytes'):
                if row.get(key) != actual[key]:
                    error(f'{entry_id}: runtime manifest {key} differs from actual artwork')
        if row.get('sourceId') != expected.get('sourceId'):
            error(f'{entry_id}: runtime manifest sourceId differs from registry')
    report['runtimeManifest'] = {'path': manifest_path, 'rows': len(manifest)}
    report['passed'] = not errors
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node', help='Node.js executable; defaults to LUCKYDEX_NODE or node on PATH')
    parser.add_argument('--root', type=Path, default=ROOT, help='Source checkout root (for independent fixture checks)')
    parser.add_argument('--output', type=Path, help='Audit report path; defaults to qa/v0440/assets-audit.json')
    args = parser.parse_args()
    report = audit(args.root, args.node)
    output = args.output or args.root / 'qa/v0440/assets-audit.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(('PASS' if report['passed'] else 'FAIL') + ' v0.44.0 sleeve offline artwork audit')
    print(f'Registry {report["registryCount"]}; decoded images {report["images"]["decodedPaths"]}; {report["images"]["totalBytes"]:,} bytes')
    for message in report['errors']:
        print('ERROR: ' + message)
    print('Audit: ' + str(output.resolve()))
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
