#!/usr/bin/env python3
"""Acquire every sleeve in Serebii's current TCG Pocket reference.

Requires Pillow only. Default reuses the audited HTML/source image cache; use
--refresh to request a fresh reference and revalidate every image. No app code
is generated here. Run from any directory with Python 3.11+.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import html
from io import BytesIO
import json
from pathlib import Path
import re
import statistics
import time
import unicodedata
from urllib.parse import quote, urljoin
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageFont, features

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / 'qa/v0440/pocket'
ART = ROOT / 'app/src/main/assets/cosmetics/sleeves/pocket-v0440'
DATA = ROOT / 'scripts/data/sleeves-pocket-v0440.json'
REFERENCE = 'https://www.serebii.net/tcgpocket/sleeves.shtml'

# National Dex IDs for named subjects. Clearly visible subjects in three
# generically titled designs are added below after original-art visual review.
# Trainer-associated species are not inferred from their usual team.
SPECIES = {
    'charizard': 6, 'hoopa': 720, 'fennekin': 653, 'zapdos': 145,
    'articuno': 144, 'moltres': 146, 'oshawott': 501, 'rayquaza': 384,
    'metagross': 376, 'yamper': 835, 'growlithe': 58, 'lillipup': 506,
    'rockruff': 744, 'fidough': 926, 'piplup': 393, 'sableye': 302,
    'miraidon': 1008, 'koraidon': 1007, 'sceptile': 254, 'lucario': 448,
    'zoroark': 571, 'kangaskhan': 115, 'gengar': 94, 'morpeko': 877,
    'sprigatito': 906, 'toxtricity': 849, 'gardevoir': 282, 'mimikyu': 778,
    'goomy': 704, 'pikachu': 25, 'gyarados': 130, 'psyduck': 54,
    'blaziken': 257, 'altaria': 334, 'greninja': 658, 'quagsire': 195,
    'clodsire': 980, 'suicune': 245, 'pichu': 172, 'tyranitar': 248,
    'ho-oh': 250, 'lugia': 249, 'espeon': 196, 'umbreon': 197,
    'eevee': 133, 'sylveon': 700, 'necrozma': 800, 'vulpix': 37,
    'solgaleo': 791, 'rowlet': 722, 'mewtwo': 150, 'manaphy': 490,
    'arceus': 493, 'chimchar': 390, 'darkrai': 491, 'blastoise': 9,
    'mew': 151, 'venusaur': 3, 'meowth': 52, 'vileplume': 45,
}
TRAINERS = ('boss', 'elesa', 'arven', 'iono', 'serena', 'may', 'professor oak',
            'lillie', 'gladion', 'acerola', 'red and', 'cynthia', 'erika')
VISUALLY_VERIFIED_SUBJECTS = {
    'Pokemon of the Forest': [816],  # Sobble, not a general forest emblem.
    'Street Party': [4, 906],  # Charmander and Sprigatito.
    'Pokemon 30th Celebration Design': [25],  # Pikachu silhouette.
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def fetch(url: str) -> bytes:
    for attempt in range(3):
        try:
            request = Request(url, headers={'User-Agent': 'LuckyDex asset reference archiver/0.44.0'})
            with urlopen(request, timeout=45) as response:
                return response.read()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)
    raise AssertionError('unreachable')


def text(fragment: str) -> str:
    return ' '.join(html.unescape(re.sub(r'<[^>]*>', ' ', fragment)).split())


def parse_reference(raw: bytes) -> list[dict]:
    source = raw.decode('utf-8', errors='replace')
    # The source has intentionally unclosed <a> tags. Row/cell boundaries are
    # well formed, so explicit table row extraction avoids tree repair losses.
    tables = re.findall(r'<table\b[^>]*>(.*?)</table>', source, re.I | re.S)
    candidates = [table for table in tables if 'Gallery Display' in table and 'sprite-select' in table]
    if len(candidates) != 1:
        raise ValueError(f'Expected one sleeve gallery, found {len(candidates)}')
    rows = re.findall(r'<tr\b[^>]*>(.*?)</tr>', candidates[0], re.I | re.S)
    output = []
    for index, row in enumerate(rows):
        if 'sprite-select' not in row:
            continue
        name_cells = re.findall(r'<td\b[^>]*>(.*?)</td>', rows[index - 1], re.I | re.S)
        art_cells = re.findall(r'<td\b[^>]*>(.*?)</td>', row, re.I | re.S)
        req_cells = re.findall(r'<td\b[^>]*>(.*?)</td>', rows[index + 1], re.I | re.S)
        if not len(name_cells) == len(art_cells) == len(req_cells):
            raise ValueError('Table name/image/requirement row lengths disagree')
        for name_cell, art_cell, req_cell in zip(name_cells, art_cells, req_cells):
            name = text(name_cell)
            key = html.unescape(re.search(r'data-key="([^"]+)"', art_cell).group(1))
            thumbnail = html.unescape(re.search(r'<img\b[^>]*src="([^"]+)"', art_cell).group(1))
            if not thumbnail.startswith('sleeves/th/'):
                raise ValueError(f'Unexpected source thumbnail: {thumbnail}')
            full_url = urljoin(REFERENCE, quote(thumbnail.replace('sleeves/th/', 'sleeves/', 1), safe='/'))
            slug = re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()).strip('-')
            lower = name.lower()
            ids = [number for species, number in SPECIES.items() if re.search(r'(?<![a-z])' + re.escape(species) + r'(?![a-z])', lower)]
            ids = list(dict.fromkeys(ids + VISUALLY_VERIFIED_SUBJECTS.get(name, [])))
            themes = ['tcg-pocket']
            if ids:
                themes.append('pokemon')
            if any(token in lower for token in TRAINERS):
                themes.append('trainers')
            if 'mega ' in lower:
                themes.append('mega')
            if 'shiny' in lower:
                themes.append('shiny')
            if 'team rocket' in lower:
                themes.append('team-rocket')
            if any(word in lower for word in ('celebration', 'new year', 'party', 'forest')):
                themes.append('special-art')
            if lower.startswith('special set'):
                themes.append('special-set')
            output.append({'id': 'pocket-' + slug, 'name': name, 'sourceFamily': 'TCG Pocket',
                           'referenceUrl': REFERENCE, 'sourceImageUrl': full_url,
                           'themes': themes, 'pokemonIds': ids,
                           'sourceRequirement': re.sub(r'^Obtained by\s*', '', text(req_cell)),
                           'referenceKey': key, 'thumbnailUrl': urljoin(REFERENCE, quote(thumbnail, safe='/'))})
    if len(output) != candidates[0].count('class="sprite-select"'):
        raise ValueError('Not every source gallery design was parsed')
    if len({row['id'] for row in output}) != len(output):
        raise ValueError('Duplicate generated ID')
    return output


def contact_sheets(rows: list[dict]) -> list[str]:
    paths = []
    font = ImageFont.load_default(size=13)
    for page, start in enumerate(range(0, len(rows), 36), 1):
        chunk = rows[start:start + 36]
        sheet = Image.new('RGB', (1200, ((len(chunk) + 5) // 6) * 285), '#eff3f7')
        draw = ImageDraw.Draw(sheet)
        for offset, row in enumerate(chunk):
            image = Image.open(ROOT / 'app/src/main/assets' / row['artPath']).convert('RGB')
            image.thumbnail((160, 225), Image.Resampling.LANCZOS)
            x, y = (offset % 6) * 200, (offset // 6) * 285
            sheet.paste(image, (x + (200 - image.width) // 2, y + 5))
            words, lines, line = row['name'].split(), [], ''
            for word in words:
                if len(line + ' ' + word) > 25:
                    lines.append(line)
                    line = word
                else:
                    line = (line + ' ' + word).strip()
            lines.append(line)
            draw.multiline_text((x + 8, y + 234), '\n'.join(lines), font=font, fill='#15233b')
        target = QA / f'contact-sheet-{page}.jpg'
        sheet.save(target, quality=91)
        paths.append(target.relative_to(ROOT).as_posix())
    return paths


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true', help='Re-download reference and every source image')
    args = parser.parse_args()
    QA.mkdir(parents=True, exist_ok=True)
    ART.mkdir(parents=True, exist_ok=True)
    originals = QA / 'source-images'
    originals.mkdir(exist_ok=True)
    snapshot = QA / 'serebii-sleeves-source.html'
    if args.refresh or not snapshot.exists():
        snapshot.write_bytes(fetch(REFERENCE))
    raw = snapshot.read_bytes()
    rows = parse_reference(raw)
    failures = []

    def acquire(row):
        cache = originals / (row['id'] + '.jpg')
        try:
            if args.refresh or not cache.exists():
                cache.write_bytes(fetch(row['sourceImageUrl']))
            source_bytes = cache.read_bytes()
            with Image.open(BytesIO(source_bytes)) as image:
                image.load()
                if image.width < 352 or image.height <= image.width:
                    raise ValueError(f'Full art too small or not portrait: {image.size}')
                image = image.convert('RGB')
                source_size = list(image.size)
                target_width = min(400, image.width)
                image = image.resize((target_width, round(image.height * target_width / image.width)), Image.Resampling.LANCZOS)
                target = ART / (row['id'].removeprefix('pocket-') + '.webp')
                image.save(target, 'WEBP', quality=86, method=6)
                encoded = target.read_bytes()
                row.update({'artPath': target.relative_to(ROOT / 'app/src/main/assets').as_posix(),
                            'sha256': sha(encoded), 'width': image.width, 'height': image.height,
                            'bytes': len(encoded), 'sourceSha256': sha(source_bytes),
                            'sourceWidth': source_size[0], 'sourceHeight': source_size[1],
                            'sourceBytes': len(source_bytes)})
        except Exception as error:
            failures.append({'id': row['id'], 'url': row['sourceImageUrl'], 'error': str(error)})
        return row

    with ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(acquire, rows))
    # Sharing exact encoded art is intentional; source checksums are also kept
    # so original duplicates and resized duplicates are independently auditable.
    encoded_seen, source_seen, duplicate_groups = {}, {}, []
    for row in rows:
        if 'sha256' not in row:
            continue
        if row['sha256'] in encoded_seen:
            original = encoded_seen[row['sha256']]
            duplicate_groups.append({'ids': [original['id'], row['id']], 'sha256': row['sha256'],
                                     'sameSourceBytes': original['sourceSha256'] == row['sourceSha256']})
            redundant = ROOT / 'app/src/main/assets' / row['artPath']
            row['artPath'] = original['artPath']
            if redundant != ROOT / 'app/src/main/assets' / row['artPath']:
                redundant.unlink(missing_ok=True)
        else:
            encoded_seen[row['sha256']] = row
        source_seen.setdefault(row['sourceSha256'], []).append(row['id'])
    complete = [row for row in rows if 'artPath' in row]
    coverage = {'referenceDesigns': len(rows), 'packagedDesigns': len(complete),
                'uniquePackagedArtFiles': len(encoded_seen), 'missingAssets': failures,
                'duplicateArtGroups': duplicate_groups,
                'duplicateOriginalGroups': [ids for ids in source_seen.values() if len(ids) > 1],
                'allReferenceDesignsAccountedFor': len(rows) == len(complete) + len(failures),
                'allReferenceDesignsPackaged': not failures}
    metadata = {'referenceUrl': REFERENCE, 'referenceSnapshot': snapshot.relative_to(ROOT).as_posix(),
                'referenceSha256': sha(raw), 'snapshotDateUtc': datetime.fromtimestamp(snapshot.stat().st_mtime, timezone.utc).isoformat(),
                'encoding': {'format': 'WebP', 'maximumWidth': 400, 'quality': 86, 'method': 6,
                             'pillowVersion': Image.__version__, 'webpVersion': features.version('webp'),
                             'crop': False, 'upscale': False, 'aspectRatioPreserved': True},
                'coverage': coverage, 'sleeves': rows}
    write_json(DATA, metadata)
    sheets = contact_sheets(complete)
    manifest = {'referenceSha256': sha(raw), 'coverage': coverage,
                'totalPackagedBytes': sum(row['bytes'] for row in encoded_seen.values()),
                'medianFileBytes': statistics.median(row['bytes'] for row in encoded_seen.values()) if encoded_seen else 0,
                'contactSheets': sheets,
                'files': [{'path': row['artPath'], 'sha256': row['sha256'], 'bytes': row['bytes']} for row in encoded_seen.values()]}
    write_json(QA / 'hash-manifest.json', manifest)
    table = '\n'.join(f"| {i} | {row['name']} | {row.get('artPath', 'MISSING')} | {row.get('bytes', 0):,} |" for i, row in enumerate(rows, 1))
    doc = f'''# TCG Pocket sleeves — v0.44.0 source audit

Source: [Serebii TCG Pocket sleeve reference]({REFERENCE}).
The locally saved full HTML is `qa/v0440/pocket/serebii-sleeves-source.html`.
Its SHA-256 is `{sha(raw)}`. Snapshot time: {metadata['snapshotDateUtc']}.
Scope is every gallery design present in that snapshot, in table order; this is
not a claim that the external site's coverage is exhaustive beyond its table.

## Coverage

- Reference gallery designs: **{len(rows)}**.
- Packaged designs: **{len(complete)}**; unique WebP files: **{len(encoded_seen)}**.
- Missing assets: **{len(failures)}**.
- Exact encoded duplicate groups: **{len(duplicate_groups)}**. Exact original duplicate groups: **{len(coverage['duplicateOriginalGroups'])}**.
- Total packaged art bytes: **{manifest['totalPackagedBytes']:,}**; median file size: **{manifest['medianFileBytes']:,}** bytes.

`scripts/data/sleeves-pocket-v0440.json` contains the complete ordered rows,
coverage counters, acquisition requirements as reference-only metadata, direct
source URLs, original and packaged hashes/dimensions/sizes, themes and known
National Dex IDs. `artPath` is relative to `app/src/main/assets`.
The upstream acquisition text is provenance and does not define LuckyDex unlocks.
IDs are based on source display names. National Dex IDs cover named subjects
and visually verified Sobble (Pokemon of the Forest), Charmander/Sprigatito
(Street Party), and Pikachu (30th Celebration). Trainer-associated species are
not inferred from their usual team. This is conservative subject tagging,
not a complete inventory of every background cameo.

## Reproduction and visual QA

Run `python scripts/fetch-pocket-sleeves-v0440.py` with Pillow installed to
reproduce from the saved source snapshot and original JPEG cache. Run with
`--refresh` to refresh the entire external reference and art. Network access is
required only for uncached files or refresh. The fetcher asserts that every
gallery anchor is parsed and verifies full-size portrait image decoding.
Original source JPEGs are in `qa/v0440/pocket/source-images/`; no source
thumbnails, webpage chrome, crops, or screenshots are used as app art.
Full art is resized proportionally to at most 400 pixels wide (367px sources
retain their native resolution), encoded WebP quality 86,
method 6 (Pillow {Image.__version__}, libwebp {features.version('webp')}).
Exact encoded duplicates share one local path. Hashes and manifests support
byte-level verification; reruns with different codec versions may differ.
Contact sheets: {', '.join('`' + path + '`' for path in sheets)}.

## Complete reference-to-art accounting

| # | Reference design | Packaged art | Bytes |
|---|---|---|---:|
{table}
'''
    (ROOT / 'docs/POCKET_SLEEVES_v0440.md').write_text(doc, encoding='utf-8')
    print(json.dumps({'coverage': coverage, 'totalPackagedBytes': manifest['totalPackagedBytes'], 'medianFileBytes': manifest['medianFileBytes']}, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
