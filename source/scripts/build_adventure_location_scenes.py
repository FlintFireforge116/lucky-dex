"""Offline native Emerald pixel vignettes, not canonical map screenshots.

Reuses the pinned, paired-bank Dash decoder without running its asset builder.
Only the Adventure catalog and its QA contact sheet are written.
"""
from pathlib import Path
import hashlib
import json
import struct
import math
from PIL import Image, ImageDraw
from build_dash_gen3_assets import Decoder, SRC, PIN, layouts

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'app/src/main/assets'
OUT = ASSETS / 'adventure/location-scenes'
QA = ROOT / 'artifacts/adventure-location-scenes'
DASH = json.loads((ASSETS / 'arcade/dash/gen3/manifest.json').read_text(encoding='utf8'))
USED = set()
MAPS = {}
WIDTH, HEIGHT = 384, 288
AVATAR_PATH = 'adventure/art/trainers/red.png'


def digest(bytes_):
    return hashlib.sha256(bytes_).hexdigest()


def map_component(layout_name, rect, semantic):
    """Extract exactly the stated complete map rectangle, retaining both layers."""
    if layout_name not in MAPS:
        layout = next(l for l in layouts if l['name'] == layout_name + '_Layout')
        primary = layout['primary_tileset'].removeprefix('gTileset_')
        secondary = layout['secondary_tileset'].removeprefix('gTileset_')
        decoder = Decoder(primary, secondary)
        path = SRC / layout['blockdata_filepath']
        raw = path.read_bytes()
        ids = [v & 1023 for v in struct.unpack('<' + 'H' * (len(raw)//2), raw)]
        for p in decoder.paths:
            USED.update([p/'tiles.png', p/'metatiles.bin', p/'metatile_attributes.bin'])
        for i in range(16):
            USED.add(decoder.paths[0 if i < 6 else 1]/'palettes'/f'{i:02d}.pal')
        USED.add(path)
        MAPS[layout_name] = layout, decoder, ids
    layout, decoder, ids = MAPS[layout_name]
    x, y, w, h = rect
    assert x >= 0 and y >= 0 and x+w <= layout['width'] and y+h <= layout['height']
    rows = [ids[(y+j)*layout['width']+x:(y+j)*layout['width']+x+w] for j in range(h)]
    image = decoder.assemble(rows)
    return image, {'semantic': semantic, 'layout': layout_name, 'mapRect': list(rect),
                   'primaryTileset': decoder.primary, 'secondaryTileset': decoder.secondary,
                   'metatiles': rows, 'nativeSize': list(image.size), 'pixelSha256': digest(image.tobytes())}


def packaged(key, semantic=None):
    entry = DASH['sprites'][key]
    image = Image.open(ASSETS/entry['path']).convert('RGBA')
    assert digest(image.tobytes()) == entry['pixelSha256']
    # Carry the packaged sprite's original source evidence into this catalog.
    for relative in DASH['sources']['pret-pokeemerald']['sha256']:
        USED.add(SRC/relative)
    return image, {'semantic': semantic or key, 'packagedPath': entry['path'],
                   'nativeSize': list(image.size), 'pixelSha256': entry['pixelSha256']}


class Scene:
    def __init__(self, region, kind, name=None):
        self.id = name or region+'-'+kind
        self.region, self.kind = region, kind
        self.image = Image.new('RGBA', (WIDTH,HEIGHT))
        self.components = []
        self.avatar_position = None

    def place(self, component, x, y, columns=1, rows=1):
        image, evidence = component
        w, h = image.size
        assert x >= 0 and y >= 0 and x+w*columns <= WIDTH and y+h*rows <= HEIGHT, (self.id, evidence)
        for row in range(rows):
            for column in range(columns):
                self.image.alpha_composite(image, (x+column*w, y+row*h))
        self.components.append({**evidence, 'position': [x,y], 'repeat': [columns,rows],
                                'destinationSize': [w*columns,h*rows]})
        return self

    def tile(self, key, x=0, y=0, columns=24, rows=18):
        return self.place(packaged(key), x, y, columns, rows)

    def trees(self, key, coordinates):
        for x,y in coordinates:
            self.place(packaged(key, 'complete-tree'), x,y)
        return self

    def descriptor(self):
        result = {'id': self.id, 'region': self.region, 'kind': self.kind,
                'path': 'adventure/location-scenes/'+self.id+'.png', 'width':WIDTH, 'height':HEIGHT,
                'classification':'native-pixel-composition', 'canonicalMapScreenshot':False,
                'interpretation':'Gen III native-pixel place vignette; not an exact canonical map reconstruction',
                'pixelSha256':digest(self.image.tobytes()), 'components':self.components}
        if self.avatar_position is not None:
            avatar = Image.open(ASSETS/AVATAR_PATH).convert('RGBA')
            result['avatar'] = {'path':AVATAR_PATH, 'width':32, 'height':32,
                                'position':list(self.avatar_position), 'sourceNativeSize':list(avatar.size),
                                'pixelSha256':digest(avatar.tobytes()),
                                'fileSha256':digest((ASSETS/AVATAR_PATH).read_bytes()),
                                'interpretation':'Existing packaged trainer pose; static player marker'}
        return result

    def player(self, x=176, y=224):
        assert 0 <= x <= WIDTH-32 and 0 <= y <= HEIGHT-32
        self.avatar_position = (x,y)
        return self


def house(): return map_component('PetalburgCity',(5,2,5,4),'complete-house')
def center(): return map_component('PetalburgCity',(19,13,4,4),'complete-center')
def mart(): return map_component('FortreeCity',(3,11,4,4),'complete-mart')
def facade(): return map_component('PetalburgCity',(12,4,6,5),'complete-gym-facade')
def treehouse(): return map_component('FortreeCity',(8,1,5,6),'complete-treehouse')
def stairway(): return map_component('MtPyre_1F',(9,0,5,2),'stairway')
def wall(): return map_component('MtPyre_1F',(14,0,1,2),'tower-wall')
def podium(): return map_component('MauvilleCity_Gym',(2,0,6,6),'complete-challenge-podium')
def shoreline(): return map_component('Route104',(14,67,1,1),'native-sand-shoreline')
def beach(): return map_component('Route104',(15,67,1,1),'native-beach-sand')
def ridge(): return map_component('GraniteCave_1F',(8,0,1,2),'rock-ridge')


def settlement(region, kind, name=None):
    s = Scene(region,kind,name).tile('route-grass')
    pine = 'pine' if region == 'johto' else 'tree'
    # The complete native scene owns its whole floor and foreground.
    s.tile('route-path',0,160,24,2).tile('route-path',176,160,2,8)
    s.trees(pine,[(0,0),(32,0),(320,0),(352,0),(0,224),(352,224),(0,256),(352,256)])
    if kind == 'town':
        if region == 'hoenn':
            s.place(treehouse(),48,32).place(house(),256,80)
            s.tile('long-grass',240,224,5,3)
        elif region == 'johto':
            s.place(house(),48,32).place(house(),256,64)
            s.tile('flowers',64,224,5,2)
        else:
            s.place(house(),48,64).place(house(),256,32)
            s.tile('fence',48,224,6,1).tile('flowers',256,224,4,2)
        s.tile('route-path',80,128,2,2).tile('route-path',288,128,2,2)
        s.place(packaged('sign'),144,144)
    else:
        s.place(center(),32,64).place(facade(),144,32).place(mart(),288,80)
        s.tile('route-path',48,128,2,2).tile('route-path',176,112,2,3)
        s.place(packaged('sign'),256,160)
        if region == 'johto':
            s.tile('flowers',64,224,5,2).tile('fence',240,224,6,1)
        elif region == 'hoenn':
            s.tile('shore-water',64,224,5,4).tile('long-grass',240,224,5,3)
        else:
            s.tile('stone-floor',64,224,5,3).tile('flowers',240,224,5,2)
    if name == 'johto-new-bark-town':
        # Quiet eastern hamlet: staggered homes, flower courts and an east exit.
        s = Scene(region,kind,name).tile('route-grass')
        s.tile('route-path',80,0,2,18).tile('route-path',80,144,19,2)
        s.place(house(),48,48).place(house(),240,80)
        s.trees('pine',[(0,0),(0,32),(0,64),(160,0),(192,0),(352,0),(352,32),(0,224),(32,224),(352,224),(352,256)])
        s.tile('flowers',32,176,3,3).tile('flowers',240,208,5,2)
        s.tile('fence',144,240,5,1).place(packaged('sign'),128,128)
        return s.player(176,144)
    if name == 'kanto-pallet-town':
        # A north-south approach between homes, ending at the southern waterfront.
        s = Scene(region,kind,name).tile('route-grass')
        s.tile('route-path',176,0,2,15).tile('route-path',64,144,16,2)
        s.place(house(),48,48).place(house(),256,48)
        s.tile('shore-water',0,256,24,2).tile('shore-sand',0,240,24,1)
        s.tile('fence',32,192,7,1).tile('fence',224,192,8,1)
        s.tile('flowers',48,208,5,2).tile('flowers',256,208,5,2)
        s.trees('tree',[(0,0),(32,0),(320,0),(352,0),(0,128),(352,128),(0,208),(352,208)])
        s.place(packaged('sign'),144,144)
        return s.player(176,176)
    if name == 'johto-azalea-town':
        # Woodland service clearing around a large treehouse and low civic facade.
        s = Scene(region,kind,name).tile('route-grass')
        s.tile('route-path',0,176,24,2).tile('route-path',160,96,2,12)
        s.place(treehouse(),32,32).place(center(),144,16).place(facade(),256,64)
        s.trees('pine',[(0,0),(0,32),(352,0),(352,32),(32,224),(64,224),(96,240),(288,224),(320,224),(352,224),(352,256)])
        s.tile('long-grass',208,240,4,2).tile('flowers',32,160,5,1)
        s.place(packaged('sign'),224,176)
        return s.player(160,208)
    if name == 'johto-cherrygrove-city':
        # Bay to the west; complete services face a waterfront promenade.
        s = Scene(region,kind,name).tile('route-grass')
        s.tile('shore-water',0,0,4,18).place(shoreline(),64,0,1,18)
        s.tile('shore-sand',80,0,2,18).tile('route-path',112,144,17,2)
        s.tile('route-path',176,144,2,9)
        s.place(center(),112,48).place(mart(),208,64).place(house(),288,16)
        s.trees('tree',[(96,0),(176,0),(352,112),(320,240),(352,240)])
        s.tile('flowers',112,208,3,3).tile('flowers',240,208,4,2)
        s.place(packaged('sign'),208,176).place(packaged('route-rock'),80,240)
        return s.player(176,208)
    if name == 'johto-violet-city':
        # A tall civic facade stands above a stone forecourt and service wings.
        s = Scene(region,kind,name).tile('route-grass')
        s.tile('stone-floor',112,128,10,8).tile('route-path',0,176,24,2)
        s.place(facade(),144,16).place(center(),32,96).place(mart(),288,96)
        s.tile('route-path',176,96,2,12)
        s.trees('pine',[(0,0),(32,0),(64,0),(288,0),(320,0),(352,0),(0,224),(32,224),(320,224),(352,224)])
        s.tile('flowers',64,256,3,1).tile('flowers',288,256,3,1)
        s.place(packaged('sign'),112,128).tile('fence',64,208,3,1).tile('fence',272,208,3,1)
        return s.player(176,208)
    if name == 'kanto-viridian-city':
        s.place(house(),240,16).tile('fence',64,208,5,1)
        s.tile('tall-grass',240,224,5,3)
        s.place(packaged('sign'),112,192)
    if name == 'hoenn-littleroot-town':
        # Homes around a wooded central lane, with no invented services.
        s = Scene(region,kind,name).tile('route-grass')
        s.tile('route-path',176,0,2,18).tile('route-path',48,160,18,2)
        s.place(house(),32,64).place(house(),272,32).place(treehouse(),48,192)
        s.trees('tree',[(0,0),(32,0),(64,0),(288,0),(320,0),(352,0),(352,192),(352,224),(320,256)])
        s.tile('long-grass',240,224,5,3).place(packaged('sign'),224,160)
        return s.player(176,208)
    if name == 'hoenn-petalburg-city':
        s.tile('shore-water',48,208,6,5).place(packaged('route-rock'),128,224)
        s.tile('flowers',240,208,5,1).tile('fence',240,256,5,1)
    return s.player()


def landscape(region, kind, name=None):
    s = Scene(region,kind,name)
    pine = 'pine' if region == 'johto' else 'tree'
    if kind in ('route','forest'):
        s.tile('route-grass')
        if kind == 'route':
            y = {'kanto':128,'johto':144,'hoenn':160}[region]
            s.tile('route-path',0,y,24,2).tile('route-path',176,y+32,2,(HEIGHT-y-32)//16)
            s.tile('long-grass' if region == 'hoenn' else 'tall-grass',64,48,5,4)
            s.trees(pine,[(0,0),(32,16),(192,0),(224,16),(320,0),(352,16),(0,224),(32,224),(256,224),(352,224),(352,256)])
            s.place(packaged('sign'),160,y-16)
            s.tile('flowers',80,224,4,2).tile('tall-grass',256,256,4,2)
            if region == 'hoenn': s.tile('shore-water',160,48,5,4)
            return s.player(176,y)
        s.tile('route-path',160,0,4,18)
        s.trees(pine,[(x,y) for y in [0,32,64,96,128,160,192,224,256] for x in [0,32,96,256,320,352]])
        s.tile('tall-grass',64,112,2,5).place(packaged('sign'),224,176)
        return s.player(176,208)
    if kind == 'coast':
        s.tile('shore-water')
        # A complete native coast bend supplies water, sand, and the natural edge.
        edge = {'kanto':160,'johto':192,'hoenn':208}[region]
        coast_width = (WIDTH-edge)//16
        s.place(map_component('Route104',(13,60,coast_width,18),'native-shoreline-bend'),edge,0)
        if region == 'hoenn':
            positions = [(48,48),(80,176)] if name else [(64,64),(96,192)]
            s.place(map_component('Route104',(5,57,2,2),'complete-surf-rock-stack'),*positions[0])
            s.place(map_component('Route104',(3,68,5,3),'complete-surf-rock-stack'),*positions[1])
        else:
            s.place(packaged('route-rock'),64,96).place(packaged('route-rock'),112,224)
        s.place(packaged('sign'),320,128)
        # Sand occupies this foreground coordinate in every source rectangle.
        return s.player(304,176)
    if kind in ('cave','mountain'):
        s.tile('cave-floor' if kind == 'cave' else 'ash-floor')
        s.place(ridge(),0,0,24,1)
        if kind == 'cave':
            s.place(map_component('GraniteCave_1F',(35,2,1,2),'cave-ladder'),288,48)
            s.place(packaged('cave-rock'),48,96,2,1).place(packaged('cave-rock'),256,224,2,1)
            s.place(map_component('GraniteCave_1F',(10,5,5,4),'complete-rock-ledge'),144,80)
            s.place(packaged('cave-rock'),64,224).place(packaged('cave-rock'),320,160)
            return s.player()
        s.tile('route-path',0,160,24,2).tile('route-path',176,160,2,8)
        s.place(packaged('route-rock'),48,80,3,1).place(packaged('route-rock'),272,224,3,1)
        s.trees('pine',[(0,32),(352,32),(0,224),(352,224)])
        s.place(packaged('sign'),224,144)
        return s.player(176,160)
    if kind == 'tower':
        s.tile('mtpyre-floor').place(wall(),0,0,24,1).place(stairway(),152,0)
        s.tile('lab-floor' if name else 'stone-floor',160,32,4,16)
        s.place(packaged('column'),64,80).place(packaged('column'),304,80)
        s.place(packaged('column'),64,208).place(packaged('column'),304,208)
        return s.player(176,208)
    if kind == 'gym':
        s.tile('gym-floor')
        s.tile('mossdeep-floor',128,64,8,10)
        s.place(packaged('column'),48,48,1,6).place(packaged('column'),320,48,1,6)
        s.place(packaged('mossdeep-pad'),184,128).place(packaged('sign'),184,208)
        s.tile('stone-floor',160,240,4,3)
        return s
    if kind == 'league':
        s.tile('gym-floor').place(podium(),144,16)
        s.tile('stone-floor',160,112,4,11)
        s.place(packaged('column'),48,48,1,6).place(packaged('column'),320,48,1,6)
        s.tile('mossdeep-floor',80,224,4,4).tile('mossdeep-floor',240,224,4,4)
        return s
    raise ValueError(kind)


NAMED = {
    'johto':{'New Bark Town':'johto-new-bark-town','Cherrygrove City':'johto-cherrygrove-city',
             'Violet City':'johto-violet-city','Sprout Tower':'johto-sprout-tower','Azalea Town':'johto-azalea-town'},
    'kanto':{'Pallet Town':'kanto-pallet-town','Viridian City':'kanto-viridian-city'},
    'hoenn':{'Littleroot Town':'hoenn-littleroot-town','Petalburg City':'hoenn-petalburg-city','Route 124':'hoenn-route-124'}
}


def all_scenes():
    scenes = []
    for region in ['kanto','johto','hoenn']:
        for kind in ['town','city','route','forest','cave','tower','coast','mountain','gym','league']:
            scenes.append(settlement(region,kind) if kind in ('town','city') else landscape(region,kind))
    for region,names in NAMED.items():
        for name,id_ in names.items():
            kind = 'tower' if name == 'Sprout Tower' else 'coast' if name == 'Route 124' else 'town' if name.endswith('Town') else 'city'
            scenes.append(settlement(region,kind,id_) if kind in ('town','city') else landscape(region,kind,id_))
    return scenes


def build():
    OUT.mkdir(parents=True,exist_ok=True)
    QA.mkdir(parents=True,exist_ok=True)
    scenes = all_scenes()
    entries = {}
    for s in scenes:
        assert s.image.getchannel('A').getextrema() == (255,255), s.id
        path = OUT/(s.id+'.png')
        s.image.save(path,optimize=True)
        entries[s.id] = {**s.descriptor(),'fileSha256':digest(path.read_bytes())}
    USED.update(SRC/p for p in ['data/layouts/layouts.json','src/data/tilesets/graphics.h','include/fieldmap.h','src/fieldmap.c'])
    named = NAMED
    manifest = {'schema':1,'scenes':entries,
                'categories':{region:{kind:region+'-'+kind for kind in ['town','city','route','forest','cave','tower','coast','mountain','gym','league']} for region in ['kanto','johto','hoenn']},
                'named':named,'places':{key:key for names in named.values() for key in names.values()},
                'source':{'repository':'https://github.com/pret/pokeemerald','commit':PIN,
                          'cache':'data/dash-gen3/upstream/pokeemerald-'+PIN,
                          'sha256':{p.relative_to(SRC).as_posix():digest(p.read_bytes()) for p in sorted(USED)}}}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
    js = '(function(root){"use strict";const catalog='+json.dumps(manifest,separators=(',',':'))+';root.LuckyDexLocationScenes=catalog;root.LuckyDexAdventureLocationScenes=catalog;if(typeof module!=="undefined"&&module.exports)module.exports=catalog;})(typeof window!=="undefined"?window:globalThis);\n'
    (ASSETS/'adventure-location-scenes.js').write_text(js,encoding='utf8')
    sheet = Image.new('RGBA',(WIDTH*3,(HEIGHT+24)*math.ceil(len(scenes)/3)),(237,235,222,255))
    draw = ImageDraw.Draw(sheet)
    for i,s in enumerate(scenes):
        x,y = (i%3)*WIDTH,(i//3)*(HEIGHT+24)
        preview = s.image.copy()
        if s.avatar_position is not None:
            avatar = Image.open(ASSETS/AVATAR_PATH).convert('RGBA').resize((32,32),Image.Resampling.NEAREST)
            preview.alpha_composite(avatar,s.avatar_position)
        sheet.alpha_composite(preview,(x,y))
        draw.text((x+4,y+HEIGHT+4),s.id,fill='black')
    sheet.save(QA/'contact-sheet.png')
    print(f'Built {len(scenes)} native-pixel 384x288 Adventure vignettes; preserved Dash/source cache.')


if __name__ == '__main__':
    build()
