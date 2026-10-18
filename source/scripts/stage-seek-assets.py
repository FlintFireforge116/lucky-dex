"""Stage explicitly selected, source-verified Dream World rasters without image edits.

Run from any directory. Only three named Cafe props may be downloaded; existing
candidate files and the pinned Git tree are required for all other inputs.
"""
import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / 'reference' / 'dw-candidates'
OUT = ROOT / 'app/src/main/assets/arcade/dream-world/seek'
COMMIT = '36e3c302d4ba3f79886efccb731c5e4e65143341'
REPO = 'https://raw.githubusercontent.com/Shade-of-Gr3y/Dream-World-Revival/'
DESCRIPTIONS = {
    'forest-base': 'Woodland backdrop with tree trunks, leafy crowns and low bushes.',
    'forest-layer-8': 'Earth clearing, low distant green tree line and blue sky.',
    'forest-layer-393': 'Rounded grassy foreground mound.',
    'forest-layer-72': 'Single rounded leafy green bush with transparent surround.',
    'forest-layer-120': 'Low grassy ground layer.',
    'sky-base': 'Repeating clusters of white clouds on blue sky.',
    'sky-layer-188': 'Broad tiered cloud platform with billowing lower edge.',
    'sky-layer-273': 'Tall cloud column with rounded lobes.',
    'sky-layer-8': 'Blue sky wash with a pale cloudy lower edge.',
    'sea-layer-1': 'Underwater blue light and water backdrop.',
    'sea-layer-4': 'Bright shallow water texture with rippled light.',
    'sea-layer-105': 'Curved blue submerged rock side wall.',
    'sea-layer-429': 'Broad blue submerged rock ledge and cliff face.',
    'manor-e': 'Manor exterior at twilight, front steps, windows and shrubs.',
    'manor-b': 'Purple tiled interior floor with a pale light pool.',
    'manor-layer-65': 'Interior pale wall panel with purple upper wall and dark wooden lower trim.',
    'manor-layer-365': 'Vertical purple stone brick wall.',
    'manor-bookcase': 'Low wooden bookcase with empty shelves; no books shown.',
    'manor-sofa': 'Carved wooden sofa with red tufted upholstery.',
    'manor-bed': 'Metal framed bed with a pale blue cover.',
    'manor-lamp': 'Small curved table lamp with amber glass shade.',
    'mountain-b': 'Rocky mountain path, distant ridges, shrubs, conifers and small flowers.',
    'mountain-layer-189': 'Broad tan rocky ground ledge.',
    'mountain-layer-514': 'Blue mountain pool with a rocky rim.',
    'ice-a': 'Blue icy cave chamber with a pale frozen floor.',
    'ice-b': 'Ochre stone cave chamber; this image is not icy.',
    'ice-c': 'Ochre rocky cave entrance with a dark opening and sparse grass.',
    'ice-layer-687': 'Large green conifer branch with snow resting on its needles.',
    'park-a': 'Pale paved plaza below an unobstructed blue background.',
    'park-b': 'Straight paved path through grass with distant bushes.',
    'park-layer-134': 'Grassy field and low distant hedge.',
    'park-layer-684': 'Grassy mound with several small low bushes.',
    'park-layer-874': 'Purple inflated balloon, tied at its bottom.',
    'park-layer-889': 'Red inflated balloon, tied at its bottom.',
    'cafe-interior': 'Empty warm orange curved interior, pale floor and overhead wooden beams.',
    'cafe-table': 'Low oval yellow Cafe table with brown printed Pokemon Cafe motif, checked rim and four tapered legs.',
    'cafe-pot': 'Tall cream Cafe coffee pot with lid, long spout, curved handle and brown printed motif.',
    'cafe-cup': 'Small cream mug with a blue rim and printed yellow Pikachu-like silhouette; original edge artifacts retained.',
}
SUPPLEMENTAL = {
    'cafe-table': 'DW_Café_Table(RIP).png',
    'cafe-pot': 'DW_Café_Pot(RIP).png',
    'cafe-cup': 'DW_Blue_Café_Cup(RIP).png',
}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--download', action='store_true')
    args = parser.parse_args()
    tree = json.loads((ROOT / 'reference/dream-world-source-tree.json').read_text(encoding='utf-8'))
    assert tree['sha'] == COMMIT
    blobs = {x['path']: x for x in tree['tree'] if x['type'] == 'blob'}
    records = json.loads((REF / 'manifest.json').read_text(encoding='utf-8'))
    extra = []
    for ident, filename in SUPPLEMENTAL.items():
        path = 'Completed Assets/Catalogue, Decor and Plushies/Displayed in Home/Pokemon Cafe/' + filename
        assert path in blobs
        source = REPO + COMMIT + '/' + quote(path, safe='/')
        local = REF / (ident + '.png')
        if not local.exists():
            if not args.download:
                raise RuntimeError('Run --download to retrieve the three selected Cafe props')
            with urlopen(source, timeout=45) as response:
                local.write_bytes(response.read())
        data = local.read_bytes()
        extra.append(dict(id=ident, path=path, source=source,
                          local=str(local.relative_to(ROOT)), bytes=len(data),
                          sha256=sha(data), gitBlob=blobs[path]['sha'],
                          category='furniture-searchable-props'))
    (REF / 'supplemental-manifest.json').write_text(json.dumps(extra, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    records += extra
    selected = {r['id']: r for r in records if r['id'] in DESCRIPTIONS}
    assert selected.keys() == DESCRIPTIONS.keys()
    OUT.mkdir(parents=True, exist_ok=True)
    entries = []
    for ident, description in DESCRIPTIONS.items():
        record = selected[ident]
        source_path = ROOT / Path(record['local'].replace('\\', '/'))
        data = source_path.read_bytes()
        blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        assert blob == record['gitBlob'] == blobs[record['path']]['sha'], ident
        assert sha(data) == record['sha256'], ident
        with Image.open(source_path) as opened:
            original_mode = opened.mode
            rgba = opened.convert('RGBA')
            alpha = rgba.getchannel('A')
            keep_jpeg = source_path.suffix.lower() in ('.jpg', '.jpeg')
            filename = ident + ('.jpg' if keep_jpeg else '.webp')
            output = OUT / filename
            if keep_jpeg:
                output.write_bytes(data)
            else:
                rgba.save(output, format='WEBP', lossless=True, exact=True, method=6)
            with Image.open(output) as check:
                assert check.convert('RGBA').tobytes() == rgba.tobytes(), ident
            encoded = output.read_bytes()
            provenance = 'Recovered/extracted repository asset' if '/Image/image ' in record['path'] or '/image ' in record['path'] or '(RIP)' in record['path'] else 'Repository Completed Assets image; original versus reconstruction not independently established'
            entries.append(dict(id=ident, stem=ident, file=filename,
                outputPath='assets/arcade/dream-world/seek/' + filename, description=description,
                sourceUrl=record['source'], sourcePath=record['path'], sourceCommit=COMMIT,
                sourceGitBlob=blob, sourceGitBlobVerified=True, sourceSha256=sha(data), sourceBytes=len(data),
                originalWidth=rgba.width, originalHeight=rgba.height, originalMode=original_mode,
                originalAlphaExtrema=list(alpha.getextrema()), originalHasTransparency=alpha.getextrema()[0] < 255,
                provenance=provenance, recreationByLuckyDex=False,
                transformation=('Original JPEG bytes retained; SHA-256 and exact RGBA pixel comparison passed' if keep_jpeg else 'Lossless WebP encoding only; unchanged dimensions and exact RGBA pixel comparison passed'),
                outputSha256=sha(encoded), outputBytes=len(encoded)))
    manifest = dict(repository='https://github.com/Shade-of-Gr3y/Dream-World-Revival', commit=COMMIT,
        rights='Source provenance is recorded, not an open-license or redistribution-rights assertion. Underlying Pokemon artwork remains subject to its owners rights.',
        composition='LuckyDex scenes are newly authored compositions of these source layers; no claim that their room layout reproduces historical Dream World rooms.',
        omittedAreas={'Dream Ruins': 'No supported Dream Ruins asset found in the inspected repository catalogue.'},
        rejectedCandidates=['cafe-a, cafe-b, cafe-c, cafe-e, cafe-f: baked web UI/screenshots', 'seek-background: pale mist, unsuitable as a main environment'],
        entries=entries)
    (OUT / 'assets-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    # Cleanup is confined to explicitly superseded outputs after every mapping and
    # pixel comparison has passed and the complete manifest has been written.
    for entry in entries:
        if entry['file'].endswith('.jpg'):
            superseded = OUT / (entry['id'] + '.webp')
            assert superseded.resolve().parent == OUT.resolve()
            if superseded.exists():
                superseded.unlink()
    print(json.dumps(dict(count=len(entries), sourceBytes=sum(x['sourceBytes'] for x in entries), outputBytes=sum(x['outputBytes'] for x in entries), exactRgbaVerified=True)))

if __name__ == '__main__':
    main()
