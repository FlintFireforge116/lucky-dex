"""Adapt downloaded Emerald metatiles; originals retained for reproducibility/provenance."""
from pathlib import Path
from PIL import Image,ImageColor,ImageDraw
import struct,json,subprocess,shutil
root=Path(__file__).resolve().parents[1];source=root/'scripts/dash-source';source.mkdir(exist_ok=True)
research=root/'artifacts/asset-research'
if (research/'tiles.png').exists():
 for name in ['tiles.png','metatiles.bin']+[f'{i:02d}.pal' for i in range(16)]:shutil.copyfile(research/name,source/name)
out=root/'app/src/main/assets/arcade/dash';tiles=Image.open(source/'tiles.png');raw=(source/'metatiles.bin').read_bytes();pals=[]
for i in range(16):pals.append([tuple(map(int,l.split())) for l in (source/f'{i:02d}.pal').read_text().splitlines()[3:19]])
def meta(n):
 im=Image.new('RGBA',(16,16))
 for layer in range(2):
  for k in range(4):
   word=struct.unpack_from('<H',raw,n*16+layer*8+k*2)[0];idx=word&1023
   if idx>=512:continue
   crop=tiles.crop(((idx%16)*8,(idx//16)*8,(idx%16)*8+8,(idx//16)*8+8));rgb=Image.new('RGBA',(8,8));pix=rgb.load()
   for y in range(8):
    for x in range(8):
     v=crop.getpixel((x,y));pix[x,y]=pals[word>>12][v]+((0 if layer and v==0 else 255),)
   if word&1024:rgb=rgb.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
   if word&2048:rgb=rgb.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
   im.alpha_composite(rgb,((k%2)*8,(k//2)*8))
 return im
turf=meta(1);grass_colors=set(turf.getdata());tree=Image.new('RGBA',(32,32))
for x,y,n in [(0,0,30),(16,0,31),(0,16,46),(16,16,47)]:tree.paste(meta(n),(x,y))
def remove_turf(im):
 im=im.copy();im.putdata([(0,0,0,0) if p in grass_colors else p for p in im.getdata()]);return im
tree=remove_turf(tree);rock=remove_turf(meta(224))
bike_gate=remove_turf(meta(305));rail_barrier=remove_turf(meta(308));rail_side=remove_turf(meta(328))
config=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./app/src/main/assets/arcade-dash-config.js').LEAGUE_THEMES))"],cwd=root))
def tint(im,color):
 base=ImageColor.getrgb(color);im=im.copy();pixels=[]
 for r,g,b,a in im.getdata():
  lum=(r+g+b)/3;factor=.65+lum/500;pixels.append(tuple(min(255,round(v*factor)) for v in base)+(a,))
 im.putdata(pixels);return im
for type,t in config.items():
 if type not in ['steel','electric','water','fire']:
  road=tint(meta(281),t['palette']['ground']);road.save(out/'tiles'/f'{type}-road-0.png');road.transpose(Image.Transpose.FLIP_LEFT_RIGHT).save(out/'tiles'/f'{type}-road-1.png');road.transpose(Image.Transpose.FLIP_TOP_BOTTOM).save(out/'tiles'/f'{type}-road-2.png')
 if type in ['normal','grass','bug','dark','fairy']:
  turf_asset=tint(turf,t['palette']['edge']);turf_asset.save(out/'tiles'/f'{type}-verge.png');(tree if type=='normal' else tint(tree,t['palette']['edge'])).save(out/'objects'/f'{type}-prop.png')
 if type in ['normal','water','rock','ground','ice','fire']:
  if type=='normal': adapted=rock
  elif type=='ice': adapted=tint(rock,t['palette']['accent'])
  else: adapted=tint(rock,t['palette']['ground'])
  adapted.save(out/'objects'/f'{type}-rock.png')
 if type=='electric':
  bike_gate.save(out/'objects'/'electric-rock.png');rail_barrier.save(out/'objects'/'electric-prop.png')
 if type=='steel':
  rail_barrier.save(out/'objects'/'steel-rock.png');rail_side.save(out/'objects'/'steel-prop.png')
 # Refresh scene previews after adaptation.
 scene=Image.new('RGBA',(96,32));verge=Image.open(out/'tiles'/f'{type}-verge.png');road=Image.open(out/'tiles'/f'{type}-road-0.png')
 for y in [0,16]:
  for x in range(0,96,16):scene.paste(verge,(x,y))
  for x in [24,40,56]:scene.paste(road,(x,y))
 for name,x,y in [('prop',0,-5),('rock',73,14),('speed-pad',35,10)]:
  obj=Image.open(out/'objects'/f'{type}-{name}.png');scene.paste(obj,(x,y),obj)
 scene.save(out/'ui'/f'{type}-scene.png')
print('Adapted Emerald route textures, evergreen and boulder; refreshed all theme previews')
