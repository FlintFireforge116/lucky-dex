"""Decode pinned Emerald metatiles. No painted art, tinting, or resized source pixels."""
from pathlib import Path
from PIL import Image, ImageDraw
import struct, json, re, hashlib, math

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'data/dash-gen3'
PIN = (CACHE / 'PIN.txt').read_text(encoding='utf-8-sig').strip()
SRC = CACHE / 'upstream' / ('pokeemerald-' + PIN)
OUT = ROOT / 'app/src/main/assets/arcade/dash/gen3'
QA = ROOT / 'artifacts/dash-gen3'
OUT.mkdir(parents=True, exist_ok=True)
QA.mkdir(parents=True, exist_ok=True)
layouts = json.loads((SRC/'data/layouts/layouts.json').read_text())['layouts']
symbols = dict(re.findall(r'gTilesetTiles_(\w+)\[\] = INCGFX_U32\("([^"]+)/tiles.png"', (SRC/'src/data/tilesets/graphics.h').read_text()))
symbols.update(General='data/tilesets/primary/general', Building='data/tilesets/primary/building')

class Decoder:
    def __init__(self, primary, secondary):
        self.paths = [SRC/symbols[primary], SRC/symbols[secondary]]
        self.tiles = [Image.open(p/'tiles.png') for p in self.paths]
        assert all(t.mode == 'P' for t in self.tiles)
        self.raw = [(p/'metatiles.bin').read_bytes() for p in self.paths]
        self.pals = []
        for i in range(16):
            p = self.paths[0 if i < 6 else 1]/'palettes'/f'{i:02d}.pal'
            self.pals.append([tuple(map(int, l.split())) for l in p.read_text().splitlines()[3:19]])
        self.primary, self.secondary = primary, secondary
        self.overrides = {}

    def frame(self, bank, folder, frame, offset):
        path = SRC/symbols['Cave']/'anim'/folder/f'{frame}.png' if folder == 'lava' else self.paths[bank]/'anim'/folder/f'{frame}.png'
        im = Image.open(path)
        self.animation_path = path
        for i in range(im.width//8 * (im.height//8)):
            x, y = i % (im.width//8)*8, i//(im.width//8)*8
            self.overrides[offset+i] = im.crop((x,y,x+8,y+8))
        return self

    def meta(self, n, overlay=False):
        bank = int(n >= 512)
        i = n - 512*bank
        assert 0 <= i < len(self.raw[bank])//16, (self.secondary, n)
        im = Image.new('RGBA', (16,16))
        for layer in range(2):
            if overlay and layer == 0: continue
            for k in range(4):
                word = struct.unpack_from('<H', self.raw[bank], i*16+layer*8+k*2)[0]
                tile = word & 1023
                tilebank = int(tile >= 512)
                idx = tile - tilebank*512
                ts = self.tiles[tilebank]
                crop = self.overrides.get(tile)
                if crop is None:
                    x, y = idx % (ts.width//8)*8, idx//(ts.width//8)*8
                    assert y+8 <= ts.height, (self.secondary, n, tile)
                    crop = ts.crop((x,y,x+8,y+8))
                rgba = Image.new('RGBA',(8,8))
                rgba.putdata([self.pals[word>>12][v]+((0 if v==0 else 255),) for v in crop.getdata()])
                if word & 1024: rgba = rgba.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
                if word & 2048: rgba = rgba.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
                im.alpha_composite(rgba, ((k%2)*8, (k//2)*8))
        return im

    def assemble(self, rows, overlay=False):
        im = Image.new('RGBA',(len(rows[0])*16,len(rows)*16))
        for y,row in enumerate(rows):
            for x,n in enumerate(row): im.alpha_composite(self.meta(n,overlay),(x*16,y*16))
        return im

def decoder(primary,secondary): return Decoder(primary,secondary)

def atlas(d):
    count = len(d.raw[1])//16
    im = Image.new('RGBA',(16*48,math.ceil(count/16)*48),(223,222,210,255))
    draw = ImageDraw.Draw(im)
    for i in range(count):
        x,y = i%16*48,i//16*48
        try: im.alpha_composite(d.meta(i+512).resize((32,32),Image.Resampling.NEAREST),(x,y))
        except AssertionError: draw.text((x,y),'ANIM',fill='red')
        draw.text((x,y+33),f'{i+512:03X}',fill='black')
    im.save(QA/f'{d.secondary}-metatiles.png')

SPRITES = {}
USED = set()

def record_source(path):
    path = Path(path)
    USED.add(path)

def verify_map_pattern(location, rows):
    l=next(l for l in layouts if l['name']==location+'_Layout')
    raw=(SRC/l['blockdata_filepath']).read_bytes()
    w,h=l['width'],l['height']
    ids=[n&1023 for n in struct.unpack('<'+'H'*(w*h),raw)]
    for y in range(h-len(rows)+1):
        for x in range(w-len(rows[0])+1):
            if all(ids[(y+dy)*w+x+dx]==n for dy,row in enumerate(rows) for dx,n in enumerate(row)):
                record_source(SRC/l['blockdata_filepath'])
                return {'layout':location,'position':[x,y],'size':[len(rows[0]),len(rows)]}
    raise AssertionError(('Assembly absent from authoritative map',location,rows))

def locate_metatile(primary, secondary, n, preferred):
    candidates=sorted(layouts,key=lambda l: l['name']!=preferred+'_Layout')
    for l in candidates:
        if l['primary_tileset']!='gTileset_'+primary:continue
        if n>=512 and l['secondary_tileset']!='gTileset_'+secondary:continue
        raw=(SRC/l['blockdata_filepath']).read_bytes() if (SRC/l['blockdata_filepath']).exists() else b''
        if len(raw)!=l['width']*l['height']*2:continue
        ids=[v&1023 for v in struct.unpack('<'+'H'*(len(raw)//2),raw)]
        if n in ids:
            i=ids.index(n);record_source(SRC/l['blockdata_filepath'])
            return l['name'].removesuffix('_Layout'), {'layout':l['name'].removesuffix('_Layout'),'position':[i%l['width'],i//l['width']],'size':[1,1]}
    return f'{secondary if n>=512 else primary} tileset (metatile not used in the pinned layouts)',None

def emit(key,primary,secondary,rows,location,kind='tile',overlay=False,vegetation_alpha=False,footprint=None,verify=False,animation=None):
    d=decoder(primary,secondary)
    if animation:
        bank,folder,frame,offset=animation
        d.frame(bank,folder,frame,offset)
        record_source(d.animation_path)
    image=d.assemble(rows,overlay)
    classification='reassembled' if len(rows)>1 or len(rows[0])>1 else 'extracted'
    transform=[]
    if vegetation_alpha:
        # General palette 2's grass entries 12..15 are distinct from canopy 1..4.
        # Remove only the source grass background colours; never erase canopy greens.
        background=set(d.pals[2][12:16])
        image.putdata([(0,0,0,0) if p[:3] in background else p for p in image.getdata()])
        transform.append('Alpha-mask source General palette 2 entries 12..15 (grass only); canopy palette entries 1..4 retained')
        classification='adapted'
    if overlay: transform.append('Extract upper metatile layer, retaining native palette-index-zero transparency')
    width,height=image.size
    file=OUT/(key+'.png');image.save(file,optimize=True)
    bank=int(rows[0][0]>=512)
    src=d.paths[bank]/'metatiles.bin'
    for path in d.paths:
        record_source(path/'tiles.png');record_source(path/'metatiles.bin');record_source(path/'metatile_attributes.bin')
    for i in range(16):record_source(d.paths[0 if i<6 else 1]/'palettes'/f'{i:02d}.pal')
    descriptor={'path':'arcade/dash/gen3/'+file.name,'anchor':[width/2,height],'footprint':footprint or [0,0,width,height],
                'classification':classification,'kind':kind,'sourceGame':'Pokemon Emerald','sourceLocation':location,
                'sourceURL':'https://github.com/pret/pokeemerald/blob/'+PIN+'/'+src.relative_to(SRC).as_posix(),
                'metatiles':rows,'primaryTileset':primary,'secondaryTileset':secondary,'nativeSize':[width,height],
                'pixelSha256':hashlib.sha256(image.tobytes()).hexdigest()}
    if transform: descriptor['transform']=transform
    if verify: descriptor['verifiedMapAssembly']=verify_map_pattern(location,rows)
    elif len(rows)==1 and len(rows[0])==1:
        actual,evidence=locate_metatile(primary,secondary,rows[0][0],location)
        descriptor['sourceLocation']=actual
        if evidence:descriptor['verifiedMapAssembly']=evidence
    if animation:descriptor['animationSource']={'bank':animation[0],'folder':folder,'frame':frame,'vramTileOffset':offset,'path':d.animation_path.relative_to(SRC).as_posix()}
    SPRITES[key]=descriptor

def emit_grass_patch(key, source_name, frames, metatile, location):
    """Real Emerald sprite foreground; source index zero is the only alpha rule."""
    source_path=SRC/'graphics/field_effects/pics'/f'{source_name}.png'
    palette_path=SRC/'graphics/field_effects/palettes/general_1.pal'
    source=Image.open(source_path)
    palette=[tuple(map(int,line.split())) for line in palette_path.read_text().splitlines()[3:19]]
    image=Image.new('RGBA',(16*len(frames),16))
    for column,frame in enumerate(frames):
        crop=source.crop((frame*16,0,frame*16+16,16))
        rgba=Image.new('RGBA',(16,16))
        rgba.putdata([palette[index]+(0 if index==0 else 255,) for index in crop.getdata()])
        image.alpha_composite(rgba,(column*16,0))
    w,h=image.size
    image.save(OUT/(key+'.png'),optimize=True)
    SPRITES[key]={'path':'arcade/dash/gen3/'+key+'.png','anchor':[w/2,h],'footprint':[1,8,w-2,8],
      'classification':'reassembled','kind':'patch','sourceGame':'Pokemon Emerald',
      'sourceLocation':location+' grass foreground field effect',
      'sourceURL':'https://github.com/pret/pokeemerald/blob/'+PIN+'/'+source_path.relative_to(SRC).as_posix(),
      'metatiles':[],'nativeSize':[w,h],'pixelSha256':hashlib.sha256(image.tobytes()).hexdigest(),
      'sourceFrame':[16,16],'sourceSprite':source_name,'sourceFrames':frames,
      'sourcePalette':palette_path.relative_to(SRC).as_posix(),
      'semanticName':'Tall grass foreground' if source_name=='tall_grass' else 'Long grass foreground',
      'transparency':'Source palette index 0 only; no colour removal, terrain subtraction or painted mask',
      'associatedGroundMetatile':metatile,
      'associatedMapGround':verify_map_pattern(location,[[metatile]])}
    for path in [source_path,palette_path,SRC/'src/data/object_events/object_event_graphics.h',
                 SRC/'src/data/field_effects/field_effect_objects.h',SRC/'src/field_effect_helpers.c']:record_source(path)

def build():
    # Terrain IDs are actual Emerald metatiles, assembled from both 512-tile banks.
    floors=[
      ('route-grass','General','Rustboro',0x001,'PetalburgWoods'),
      ('route-path','General','Mauville',0x109,'Route110'),
      ('forest-grass','General','Rustboro',0x001,'PetalburgWoods'),
      ('forest-path','General','Rustboro',0x109,'PetalburgWoods'),
      ('tall-grass','General','Rustboro',0x00D,'PetalburgWoods'),
      ('long-grass','General','Fortree',0x015,'Route119'),
      ('flowers','General','Mauville',0x004,'Route110'),
      ('shore-water','General','Mauville',0x170,'Route110'),
      ('shore-sand','General','Mauville',0x119,'Route111'),
      ('shore-edge','General','Mauville',0x122,'Route111'),
      ('shallow-water','General','Mauville',0x0A1,'Route120'),
      ('mud','General','Mauville',0x0E8,'Route112'),
      ('bridge-floor','General','Fortree',0x23D,'FortreeCity'),
      ('bridge-rail','General','Fortree',0x23C,'FortreeCity'),
      ('cave-floor','General','Cave',0x207,'GraniteCave_1F'),
      ('cave-wall','General','Cave',0x209,'GraniteCave_1F'),
      ('cave-floor-dark','General','Cave',0x2E5,'MagmaHideout_1F'),
      ('lava-floor','General','Lavaridge',0x333,'MtChimney'),
      ('lava-edge','General','Lavaridge',0x332,'MtChimney'),
      ('ash-floor','General','Lavaridge',0x204,'JaggedPass'),
      ('ice-floor','General','Cave',0x38D,'ShoalCave_LowTideIceRoom'),
      ('ice-wall','General','Cave',0x380,'ShoalCave_LowTideIceRoom'),
      ('ice-cracked','Building','SootopolisGym',0x20E,'SootopolisCity_Gym_1F'),
      ('desert-sand','General','Mauville',0x251,'Route111'),
      ('gym-floor','Building','MauvilleGym',0x21A,'MauvilleCity_Gym'),
      ('metal-floor','General','Facility',0x229,'AquaHideout_B1F'),
      ('mossdeep-floor','Building','MossdeepGym',0x201,'MossdeepCity_Gym'),
      ('mtpyre-floor','General','Facility',0x2E6,'MtPyre_1F'),
      ('ancient-floor','General','Cave',0x321,'SealedChamber_InnerRoom'),
      ('stone-floor','General','Facility',0x3C6,'MtPyre_Summit'),
      ('lab-floor','Building','Lab',0x202,'LittlerootTown_ProfessorBirchsLab'),
    ]
    for key,p,s,n,l in floors:emit(key,p,s,[[n]],l)
    SPRITES['mud']['semanticName']='Muddy slope / inclined ledge (not a flat mud puddle)'
    SPRITES['mud']['sourceLabel']='METATILE_General_MuddySlope_Frame0'
    SPRITES['mud']['sourceBehavior']={'value':0xD0,'name':'MB_MUDDY_SLOPE'}
    for key in ['route-path','forest-path']:
        SPRITES[key]['semanticName']='Light gravel route floor'
        SPRITES[key]['sourceBehavior']={'value':0,'name':'MB_NORMAL'}
    emit('tree','General','Petalburg',[[0x1D4,0x1D5],[0x1E4,0x1E5]],'PetalburgCity','object',vegetation_alpha=True,footprint=[10,25,12,7],verify=True)
    emit('pine','General','Mauville',[[0x01E,0x01F],[0x026,0x027]],'Route110','object',vegetation_alpha=True,footprint=[10,24,12,8],verify=True)
    emit('route-rock','General','Rustboro',[[0x0E0]],'Route104','object',overlay=True,footprint=[1,4,14,12])
    emit('cave-rock','General','Cave',[[0x202]],'GraniteCave_1F','object',overlay=True,footprint=[1,4,14,12])
    emit('lava-rock','General','Cave',[[0x202]],'GraniteCave_1F','object',overlay=True,footprint=[1,4,14,12])
    emit('ice-rock','General','Cave',[[0x37D]],'ShoalCave_LowTideIceRoom','object',footprint=[1,4,14,12])
    emit('grave','General','Facility',[[0x2EE]],'MtPyre_1F','object',footprint=[2,6,12,10],verify=True)
    emit('column','Building','MauvilleGym',[[0x210],[0x218]],'MauvilleCity_Gym','object',overlay=True,footprint=[3,21,10,11],verify=True)
    emit('machine','General','Facility',[[0x23D,0x23E],[0x245,0x246],[0x24D,0x24E]],'AquaHideout_B1F','object',footprint=[3,33,26,15],verify=True)
    emit('fence','General','Rustboro',[[0x132]],'Route104','object',overlay=True,footprint=[2,0,12,16])
    emit('sign','General','Rustboro',[[0x003]],'Route104','object',footprint=[3,10,10,6])
    emit('mossdeep-pad','Building','MossdeepGym',[[0x253]],'MossdeepCity_Gym','pad')
    emit('mossdeep-pad-active','Building','MossdeepGym',[[0x273]],'MossdeepCity_Gym','pad')
    emit('mossdeep-pad-left','Building','MossdeepGym',[[0x252]],'MossdeepCity_Gym','pad')
    emit('mossdeep-pad-right','Building','MossdeepGym',[[0x250]],'MossdeepCity_Gym','pad')
    emit('mossdeep-warp','Building','MossdeepGym',[[0x210]],'MossdeepCity_Gym','pad')
    emit('electric-switch','Building','MauvilleGym',[[0x205]],'MauvilleCity_Gym','pad')
    emit_grass_patch('grass-patch','tall_grass',[1,4],0x00D,'PetalburgWoods')
    emit_grass_patch('long-grass-patch','long_grass',[0,3],0x015,'Route119')
    for f in range(1,4):emit('shore-water-'+str(f),'General','Mauville',[[0x170]],'Route110',animation=(0,'water',f,432))
    for f in range(1,3):emit('flowers-'+str(f),'General','Mauville',[[0x004]],'Route110',animation=(0,'flower',f,508))
    # Emerald lava anim tiles are shared by Lavaridge and Cave (source QueueAnimTiles_*).
    for f in range(1,4):emit('lava-floor-'+str(f),'General','Lavaridge',[[0x333]],'MtChimney',animation=(1,'lava',f,512+160))
    berry_path=SRC/'graphics/items/icons/oran_berry.png'
    pal_path=SRC/'graphics/items/icon_palettes/oran_berry.pal'
    berry=Image.open(berry_path)
    pal=[tuple(map(int,l.split())) for l in pal_path.read_text().splitlines()[3:19]]
    rgba=Image.new('RGBA',berry.size);rgba.putdata([pal[v]+(0 if v==0 else 255,) for v in berry.getdata()])
    native_rect=rgba.getbbox();rgba=rgba.crop(native_rect);rgba.save(OUT/'oran-berry.png',optimize=True)
    w,h=rgba.size
    SPRITES['oran-berry']={'path':'arcade/dash/gen3/oran-berry.png','anchor':[w/2,h],'footprint':[0,0,w,h],'classification':'extracted',
      'kind':'pickup','sourceGame':'Pokemon Emerald','sourceLocation':'Item icon table / ITEM_ORAN_BERRY',
      'sourceURL':'https://github.com/pret/pokeemerald/blob/'+PIN+'/graphics/items/icons/oran_berry.png',
      'metatiles':[],'nativeSize':[w,h],'sourceFrame':list(berry.size),'sourceCrop':list(native_rect),
      'pixelSha256':hashlib.sha256(rgba.tobytes()).hexdigest()}
    record_source(berry_path);record_source(pal_path);record_source(SRC/'src/data/item_icon_table.h')
    for f in ['data/layouts/layouts.json','include/fieldmap.h','include/global.fieldmap.h','include/constants/metatile_labels.h','include/constants/metatile_behaviors.h','src/fieldmap.c','src/tileset_anims.c','src/data/tilesets/graphics.h','src/data/tilesets/headers.h']:record_source(SRC/f)
    hashes={p.relative_to(SRC).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(USED)}
    sources={'pret-pokeemerald':{'repository':'https://github.com/pret/pokeemerald','commit':PIN,'game':'Pokemon Emerald','cache':'data/dash-gen3/upstream/pokeemerald-'+PIN,'sha256':hashes}}
    manifest={'schema':1,'sprites':SPRITES,'sources':sources}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
    js='(function(root){"use strict";const manifest='+json.dumps(manifest,separators=(',',':'))+';root.LuckyDexDashGen3Manifest=manifest;if(typeof module!=="undefined"&&module.exports)module.exports=manifest;})(typeof window!=="undefined"?window:globalThis);\n'
    (ROOT/'app/src/main/assets/arcade-dash-gen3-manifest.js').write_text(js,encoding='utf8')
    (CACHE/'sources-sha256.json').write_text(json.dumps(hashes,indent=2)+'\n',encoding='utf8')
    atlas=Image.new('RGBA',(800,math.ceil(len(SPRITES)/8)*112),(229,225,204,255));draw=ImageDraw.Draw(atlas)
    for i,(key,info) in enumerate(SPRITES.items()):
        image=Image.open(ROOT/'app/src/main/assets'/info['path']);x,y=(i%8)*100,(i//8)*112
        atlas.alpha_composite(image.resize((image.width*2,image.height*2),Image.Resampling.NEAREST),(x+(100-image.width*2)//2,y))
        draw.text((x+2,y+98),key,fill='black')
    atlas.save(QA/'asset-contact-sheet.png')
    notes='''# Dash Gen 3 assets — v0.34.0

## Baseline audit

The v0.33.1 Dash course assets combine painted procedural textures, hand-coded themed sprites, palette tints and some adapted Emerald primary metatiles. `scripts/adapt-emerald-dash-assets.py` discards every secondary tile index, guesses a tree assembly (30/31/46/47), and removes every matching turf colour. That loses authentic tileset context and does not establish complete trees. Its course thumbnails separately assemble scenery over unrelated terrain. These older assets remain baseline material; the new renderer uses this catalog's genuine native tiles and actual course composition.

`scripts/dash-source/` contains only the General primary tileset, metatiles and palettes. It cannot decode cave, gym, bridge or industrial secondary metatiles by itself. Existing `arcade/authentic-v0200` includes authentic Berry Blender assets, screenshots and non-Gen-3 minigame material; it does not contain a reusable Emerald route/gym/cave metatile system. Existing Pokémon actor and item assets remain available. The existing `arcade/sprites/items/oran-berry.png` remains unchanged; the new catalog also provides the exact Emerald item icon with its source palette and only its transparent perimeter cropped, making the berry readable at integer scale.

## Pinned primary source

All new catalog pixels come from [pret/pokeemerald](https://github.com/pret/pokeemerald), commit `PIN_VALUE`, Pokémon Emerald. The exact used source files and SHA-256 checksums are in `data/dash-gen3/sources-sha256.json` and the runtime JSON/JS manifests. Download reference: `https://codeload.github.com/pret/pokeemerald/zip/PIN_VALUE`. Source artwork belongs to its Pokémon copyright holders; the decomp repository does not independently license Pokémon artwork. Bundled locally for this private fan project as requested.

This is an asset extraction/reassembly, with no recolouring, painted replacement scenery, generated artwork, blurred scaling or course screenshots. `extracted` means native metatile/icon pixels; `reassembled` means complete multiple-metatile objects; `adapted` means native pixels with the explicitly documented source-grass alpha mask. Metatile floors retaining their embedded source ground (for example ice rocks, gravestones and machinery) are intentional, allowing source-consistent compositing.

## Correct decoder and complete objects

The decoder follows `include/fieldmap.h`, `src/fieldmap.c` and `src/data/tilesets/headers.h`: 512 primary tiles plus 512 secondary tiles, 512 primary metatiles, primary palettes 0–5 and secondary palettes 6–12. Each 16×16 metatile comprises two layers of four 8×8 tiles, respecting horizontal/vertical flip flags, palette selection and native palette-index-zero transparency. All runtime terrain/pad pixels are fully opaque; object alpha is binary, and outputs preserve native pixel dimensions.

The complete 32×32 round tree uses General `1D4/1D5 + 1E4/1E5`, verified in Petalburg City's actual map. The complete 32×32 pine uses `01E/01F + 026/027`, verified in Route 110. Their source-grass palette entries 12–15 become transparent; canopy entries 1–4 remain unchanged. This fixes the old guessed crop. The 16×32 electric column and 32×48 Aqua Hideout machinery match complete map rectangles. The Mt. Pyre gravestone is a complete 16×16 native metatile. Map coordinates and all object footprints are recorded in the manifest.

Yellow upward Mossdeep Gym arrow `253` is the idle boost pad; red upward arrow `273` is its responsive state. Both are genuine Emerald gym floor art. Their use as boost states is a LuckyDex gameplay interpretation; the red frame is not invented art or a claim about the original gym's activation animation. Left/right arrow, warp and electric switch tiles are also available.

Water and flowers use original Emerald animation frames at VRAM tile offsets 432 and 508. Lava uses Cave's shared animation source at Lavaridge offset 512+160, exactly as `QueueAnimTiles_Lavaridge_Lava` specifies. No animation is a tint or fake palette variant.

## Rebuild and validation

Run `python scripts/build_dash_gen3_assets.py` with Pillow to reproduce all 59 PNGs, both manifests, the checksums, this inventory and `artifacts/dash-gen3/asset-contact-sheet.png`. The cached used bytes provide an offline rebuild. `--research` produces full metatile sheets when the complete pinned upstream tilesets are present. The catalog lives at `app/src/main/assets/arcade/dash/gen3/manifest.json`; its UMD counterpart is `app/src/main/assets/arcade-dash-gen3-manifest.js`, exporting `LuckyDexDashGen3Manifest` and CommonJS.

Run `node --test tests/arcade-dash-gen3-assets.test.cjs`. Tests verify all source hashes, native PNG dimensions, actual decoded RGBA hashes, binary alpha, visible/opaque terrain, unique local paths, bounded anchors/footprints, exact complete-object map assemblies, source pins, real directional pads, animation offsets and the complete 19×18 berry crop from its 24×24 source frame. The contact sheet was visually inspected for complete trees, genuine palette families, object framing, direction pads and readable berry pixels.

For rendering, use nearest-neighbour drawing and integer scale 2 or 3. Anchors/footprints are native coordinates; do not scale width and height independently. Course previews should draw the same course profile/section renderer as races. Terrain/world scenery share one world coordinate plane. Existing racer sprites retain their own normalization; these environmental tiles must retain a consistent native-pixel scale.

## Runtime asset inventory

Each row identifies the actual source map when confirmed by its native map bytes. Some genuine tiles are selected from the native tileset even though absent from the stored layouts; dynamic script-controlled tiles can still be used in-game. This distinction is explicit. `forest-grass` reuses route grass, `forest-path` reuses the authentic light path, and `lava-rock` reuses a genuine cave boulder. Reuse does not create a fake palette variant.

`grass-patch` and `long-grass-patch` are 32×16 assemblies of Emerald's real 16×16 foreground grass field-effect frames, using `general_1.pal` and only source palette-index-zero transparency. The standing grass metatiles `00D` and `015` have empty upper layers, so extracting those upper layers would be invisible. The field-effect sprite templates confirm these are the foreground layers used around characters standing in native tall/long grass. No grass colour is heuristically removed and no mask is painted. The associated grass metatiles are verified in Petalburg Woods / Route 119. These vegetation overlays replace opaque rectangular terrain hazard blocks while keeping the course surface visible.

Semantic correction: compatibility key `mud` is General decimal 232 (`0E8`), officially `METATILE_General_MuddySlope_Frame0` with behavior `MB_MUDDY_SLOPE` (`D0`): an inclined muddy slope/ledge, not a flat puddle. It should not represent a freestanding rectangular mud hazard. `route-path` / `forest-path` are General decimal 265 (`109`), a light gravel floor with `MB_NORMAL` (`00`), verified in Route 111; neither is ice. No shoreline puddle patch was added without complete source-map evidence.

| Key / local PNG under `arcade/dash/gen3/` | Native size | Classification | Source location / tilesets | Metatile IDs (hex) | Course/system use |
|---|---|---|---|---|---|
'''.replace('PIN_VALUE',PIN)
    for key,info in SPRITES.items():
        ids=' / '.join(','.join(f'{n:03X}' for n in row) for row in info['metatiles']) or 'item icon'
        use={'tile':'course terrain / verge / section','object':'course scenery or solid base obstacle','pad':'embedded course boost / gym decoration','pickup':'stamina berry pickup','patch':'transparent course grass slow-ground overlay'}[info['kind']]
        family=(info.get('primaryTileset','field effect' if info['kind']=='patch' else 'item')+' + '+info.get('secondaryTileset','foreground' if info['kind']=='patch' else 'icon'))
        notes+=f"| `{key}.png` | {'×'.join(map(str,info['nativeSize']))} | {info['classification']} | {info['sourceLocation']} ({family}) | `{ids}` | {use} |\n"
    (ROOT/'docs/DASH_GEN3_ASSETS.md').write_text(notes,encoding='utf8')
    print(json.dumps({'sprites':len(SPRITES),'keys':list(SPRITES),'sourceFiles':len(USED)}))

if __name__ == '__main__':
    import sys
    if '--research' in sys.argv:
        for a,b in [('General','Rustboro'),('General','Cave'),('General','Lavaridge'),('General','Mauville'),('General','Facility'),('Building','MossdeepGym'),('Building','MauvilleGym'),('Building','SootopolisGym'),('General','Fortree'),('Building','Lab')]: atlas(decoder(a,b))
        d=decoder('General','Rustboro')
        im=Image.new('RGBA',(768,32*48),(223,222,210,255));dr=ImageDraw.Draw(im)
        for n in range(512):
            x,y=n%16*48,n//16*48;im.alpha_composite(d.meta(n).resize((32,32),Image.Resampling.NEAREST),(x,y));dr.text((x,y+33),f'{n:03X}',fill='black')
        im.save(QA/'General-metatiles.png')
    else:
        build()
