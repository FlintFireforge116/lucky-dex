"""Independently rebuild delivered pixels from catalog evidence, not scene definitions."""
import hashlib
import json
from pathlib import Path
import struct
import sys
import unittest
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT/'app/src/main/assets'
sys.path.insert(0,str(ROOT/'scripts'))
from build_dash_gen3_assets import Decoder

MANIFEST = json.loads((ASSETS/'adventure/location-scenes/manifest.json').read_text())
SOURCE = ROOT/MANIFEST['source']['cache']
LAYOUTS = {l['name']:l for l in json.loads((SOURCE/'data/layouts/layouts.json').read_text())['layouts']}


def digest(im):
    return hashlib.sha256(im.tobytes()).hexdigest()


class NativePixelTests(unittest.TestCase):
    def test_avatar_metadata_matches_the_unchanged_packaged_trainer_pixels(self):
        for scene in MANIFEST['scenes'].values():
            with self.subTest(scene=scene['id']):
                if scene['kind'] in ('gym','league'):
                    self.assertNotIn('avatar',scene)
                    continue
                avatar = scene['avatar']
                path = ASSETS/avatar['path']
                native = Image.open(path).convert('RGBA')
                self.assertEqual(list(native.size),avatar['sourceNativeSize'])
                self.assertEqual(digest(native),avatar['pixelSha256'])
                self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),avatar['fileSha256'])
                self.assertEqual(native.getchannel('A').getextrema(),(0,255))
                x,y = avatar['position']
                self.assertGreaterEqual(x,0)
                self.assertGreaterEqual(y,0)
                self.assertLessEqual(x+avatar['width'],scene['width'])
                self.assertLessEqual(y+avatar['height'],scene['height'])

    def test_every_catalog_component_matches_its_actual_native_source(self):
        for scene in MANIFEST['scenes'].values():
            result = Image.new('RGBA',(scene['width'],scene['height']))
            for c in scene['components']:
                with self.subTest(scene=scene['id'],component=c['semantic']):
                    if 'packagedPath' in c:
                        native = Image.open(ASSETS/c['packagedPath']).convert('RGBA')
                    else:
                        l = LAYOUTS[c['layout']+'_Layout']
                        raw = (SOURCE/l['blockdata_filepath']).read_bytes()
                        values = [n&1023 for n in struct.unpack('<'+'H'*(len(raw)//2),raw)]
                        x,y,w,h = c['mapRect']
                        rows = [values[(y+j)*l['width']+x:(y+j)*l['width']+x+w] for j in range(h)]
                        self.assertEqual(rows,c['metatiles'])
                        decoder = Decoder(c['primaryTileset'],c['secondaryTileset'])
                        try:
                            native = decoder.assemble(rows)
                        finally:
                            for tiles in decoder.tiles:
                                tiles.close()
                    self.assertEqual(list(native.size),c['nativeSize'])
                    self.assertEqual(digest(native),c['pixelSha256'])
                    px,py = c['position']
                    cols,rows = c['repeat']
                    self.assertEqual(c['destinationSize'],[native.width*cols,native.height*rows])
                    self.assertLessEqual(px+native.width*cols,scene['width'])
                    self.assertLessEqual(py+native.height*rows,scene['height'])
                    for row in range(rows):
                        for col in range(cols):
                            result.alpha_composite(native,(px+col*native.width,py+row*native.height))
            with self.subTest(scene=scene['id']):
                delivered = Image.open(ASSETS/scene['path']).convert('RGBA')
                self.assertEqual(result.tobytes(),delivered.tobytes())
                self.assertEqual(digest(result),scene['pixelSha256'])
                self.assertEqual(result.getchannel('A').getextrema(),(255,255))


if __name__ == '__main__':
    unittest.main()
