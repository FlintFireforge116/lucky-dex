#!/usr/bin/env python3
"""Compact the audited offline booster packshot bundle for mobile display.

Maintenance helper only: APK builds remain fully offline and do not invoke
Pillow. Images are never upscaled and transparency is preserved.
"""
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'app/src/main/assets/booster-art-v0260'
MAX_HEIGHT = 1100
QUALITY = 80
ALLOWED = {'.webp', '.png', '.jpg', '.jpeg'}


def optimize_one(raw: str) -> tuple[str, int, int]:
    path = Path(raw)
    before = path.stat().st_size
    with Image.open(path) as src:
        src.load()
        has_alpha = src.mode in ('RGBA', 'LA') or ('transparency' in src.info)
        image = src.convert('RGBA' if has_alpha else 'RGB')
        if image.height > MAX_HEIGHT:
            width = max(1, round(image.width * MAX_HEIGHT / image.height))
            image = image.resize((width, MAX_HEIGHT), Image.Resampling.LANCZOS)
        out = path.with_suffix('.webp')
        tmp = out.with_name(out.stem + '.optimizing.webp')
        image.save(tmp, 'WEBP', quality=QUALITY, method=4, exact=True)
    after = tmp.stat().st_size
    tmp.replace(out)
    if path != out and path.exists():
        path.unlink()
    return out.name, before, after


def main() -> None:
    files = [p for p in sorted(ART.iterdir()) if p.is_file() and p.suffix.lower() in ALLOWED]
    if len(files) != 144:
        raise SystemExit(f'Expected 144 audited booster images, found {len(files)}')
    with ProcessPoolExecutor(max_workers=8) as pool:
        rows = list(pool.map(optimize_one, map(str, files)))
    before = sum(row[1] for row in rows)
    after = sum(row[2] for row in rows)
    print(f'PASS optimized {len(rows)} booster packshots: {before/1048576:.2f} MiB -> {after/1048576:.2f} MiB')

if __name__ == '__main__':
    main()
