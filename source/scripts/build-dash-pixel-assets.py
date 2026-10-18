"""Reproducible original 16/24/32px route art; no runtime network dependency."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageColor
import json, random, subprocess
root=Path(__file__).resolve().parents[1]; out=root/'app/src/main/assets/arcade/dash'
config=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./app/src/main/assets/arcade-dash-config.js').LEAGUE_THEMES))"],cwd=root))
def shade(c,k):
 return tuple(max(0,min(255,round(x*k))) for x in ImageColor.getrgb(c))
def save(im,kind,name):
 p=out/kind/(name+'.png');p.parent.mkdir(parents=True,exist_ok=True);im.save(p,optimize=True)
def sprite(rows,palette):
 im=Image.new('RGBA',(max(map(len,rows)),len(rows)));px=im.load()
 for y,row in enumerate(rows):
  for x,ch in enumerate(row):
   if ch in palette:px[x,y]=palette[ch]
 return im
rock=['.......oooooo.......','.....oohhhhhhoo.....','...oohhhllllhhhho...','..ohhlllllllhhhho..','..ohlllllllhhhddho.','.ohhllllllhhhdddho.','.ohhhlllhhhhddddho.','.ohhhhhhhhddddddho.','..ohhhhhddddddddo..','...oodddddddddoo...','.....oooooooo......']
tree=['........oooo........','......ooggggoo......','....oogllgggggoo....','...ogllllgggggggo...','..oglllggggggdddgo..','.ogllgggggggddddggo.','oggggggggggdddddgggo','oggggggggdddddddgggo','.oggdddddddddddggo..','..oooogddddgoooo....','......otttto........','......ottddo........','.....oottttoo.......']
crystal=['.........o..........','........olo.........','.......ollho........','......olllhho.......','.....olllhhhho......','..o..olllhhhho..o...','.olo.olllhhhho.olo..','.olhooollhhoooolho..','.ollhhoolhooollhho..','..olllhhhhhllhhho...','...ohhhhhhhhhhoo....','.....oooooooo.......']
for n,(type,t) in enumerate(config.items()):
 p=t['palette'];g=ImageColor.getrgb(p['ground']);edge=ImageColor.getrgb(p['edge']);light=shade(p['ground'],1.12);dark=shade(p['ground'],.88);ink=shade(p['shadow'],.75);accent=ImageColor.getrgb(p['accent']);rng=random.Random(310+n)
 # Three non-periodic variations avoid an obvious tile lattice.
 for v in range(3):
  im=Image.new('RGB',(16,16),g);d=ImageDraw.Draw(im)
  for i in range(28):
   x,y=rng.randrange(16),rng.randrange(16);d.line((x,y,x+rng.randrange(1,4),y),fill=light if i%3 else dark)
  if type in ['steel','electric']:
   for y in [3,11]:d.line((0,y,15,y),fill=dark);d.line((0,y+1,15,y+1),fill=light)
   for x in [2,13]:d.point((x,3),fill=ink);d.point((x,11),fill=ink)
  if type=='water':
   for y in [2,7,12]:d.line((0,y,15,y),fill=dark);d.line((0,y+1,15,y+1),fill=light)
  if type in ['fire','psychic','dragon']:
   x=rng.randrange(3,12);d.line([(x,0),(x+2,4),(x-1,8),(x+3,13),(x+1,16)],fill=dark)
   if type=='fire':d.line([(x+1,1),(x+3,4),(x,8),(x+4,13)],fill=accent)
  save(im,'tiles',f'{type}-road-{v}')
 verge=Image.new('RGB',(16,16),edge);d=ImageDraw.Draw(verge)
 for y in range(1,16,4):
  for x in range(0,16,5):
   x=(x+y*3)%16;d.line((x,y,x+1,y+2),fill=shade(p['edge'],1.18));d.point((x+2,y+2),fill=shade(p['edge'],.8))
 if type in ['water','flying','ice']:
  for y in [3,9,14]:d.line((1,y,6,y),fill=shade(p['edge'],1.4));d.line((10,y+1,14,y+1),fill=shade(p['edge'],1.3))
 if type in ['rock','ground','dragon']:d.line([(0,4),(5,6),(12,3),(16,4)],fill=shade(p['edge'],.7));d.line([(0,12),(6,10),(16,12)],fill=shade(p['edge'],1.25))
 save(verge,'tiles',f'{type}-verge')
 # An irregular pixel transition is composed offline, not a runtime flat border.
 rim=Image.new('RGB',(8,16),g);d=ImageDraw.Draw(rim)
 for y in range(16):
  width=[3,3,2,4,3,2,3,4][y%8];d.line((0,y,width,y),fill=edge);d.point((width+1,y),fill=shade(p['ground'],.8));d.point((width+2,y),fill=light)
 save(rim,'tiles',f'{type}-rim')
 palette={'o':ink,'h':shade(p['ground'],1.25),'l':shade(p['ground'],1.5),'d':shade(p['ground'],.72),'g':edge,'t':(134,95,54)}
 if type=='fire':palette.update(h=(87,75,76),l=(132,109,102),d=(51,43,49))
 if type in ['ice','psychic','fairy']:palette.update(h=accent,l=shade(p['accent'],1.2),d=shade(p['accent'],.7))
 obj=sprite(crystal if type in ['ice','psychic','fairy'] else rock,palette)
 if type in ['steel','electric','poison']:
  obj=Image.new('RGBA',(20,20));d=ImageDraw.Draw(obj);d.rectangle((2,2,17,18),fill=ink);d.rectangle((3,3,16,16),fill=shade(p['ground'],1.3));d.rectangle((4,3,15,5),fill=accent);d.rectangle((5,7,14,14),fill=shade(p['shadow'],1.3));d.line((6,9,13,9),fill=accent);d.line((6,12,13,12),fill=accent);d.rectangle((4,17,6,19),fill=ink);d.rectangle((13,17,15,19),fill=ink)
 if type in ['ghost','dragon','fighting']:
  obj=Image.new('RGBA',(20,24));d=ImageDraw.Draw(obj);d.rectangle((5,3,14,21),fill=ink);d.rectangle((6,2,13,20),fill=shade(p['ground'],1.5));d.rectangle((3,20,16,23),fill=shade(p['ground'],.75));d.rectangle((9,7,10,15),fill=accent);d.line((7,10,12,10),fill=accent)
 if type in ['grass','bug','dark']:
  obj=Image.new('RGBA',(22,14));d=ImageDraw.Draw(obj);d.rectangle((2,3,19,12),fill=ink);d.rectangle((3,2,18,10),fill=(118,81,49));d.line((4,4,17,4),fill=(182,135,77));d.line((5,8,16,8),fill=(80,57,39));d.rectangle((17,3,20,10),fill=(205,160,95));d.rectangle((18,5,19,8),fill=(102,74,46))
 save(obj,'objects',f'{type}-rock')
 patch=Image.new('RGBA',(24,14));d=ImageDraw.Draw(patch)
 for y in range(2,12):
  inset=abs(7-y)//2+1;d.line((inset,y,23-inset,y),fill=shade(p['shadow'],1.2))
 for i in range(40):
  x,y=rng.randrange(3,21),rng.randrange(3,11);d.line((x,y,x+1,y),fill=shade(p['ground'],.85) if i%2 else accent)
 if type in ['grass','bug']:
  for x in range(3,22,3):d.line([(x,11),(x-1,6),(x+1,8),(x+2,4)],fill=shade(p['edge'],1.3))
 if type=='bug':
  for y in [4,7,10]:d.line((4,y,20,y),fill=(208,221,162))
 if type in ['ice','water']: 
  for y in [4,8,11]:d.line((4,y,19,y),fill=shade(p['accent'],1.05))
 save(patch,'objects',f'{type}-mud')
 pad=Image.new('RGBA',(24,16));d=ImageDraw.Draw(pad);d.rectangle((1,2,22,14),fill=ink);d.rectangle((2,3,21,13),fill=accent);d.line((3,14,20,14),fill=shade(p['accent'],.7))
 for cy in [5,10]:
  for x in range(6,18):
   y=cy+abs(x-12)//2;d.rectangle((x,y,x,y+1),fill=(247,255,215));d.point((x,y+2),fill=ink)
 save(pad,'objects',f'{type}-speed-pad')
 berry=Image.new('RGBA',(14,17));d=ImageDraw.Draw(berry);d.rectangle((3,7,11,13),fill=ink);d.rectangle((2,8,12,12),fill=ink);d.rectangle((4,6,10,14),fill=(41,84,154));d.rectangle((3,8,11,12),fill=(64,139,219));d.rectangle((4,8,6,9),fill=(162,226,255));d.rectangle((8,12,10,13),fill=(34,69,128));d.line((7,6,8,2),fill=(83,107,48));d.rectangle((4,2,7,3),fill=(141,190,65));d.rectangle((9,3,11,4),fill=(80,156,69))
 save(berry,'objects',f'{type}-stamina-pickup')
 prop=sprite(tree,palette).resize((32,40),Image.Resampling.NEAREST)
 if type in ['psychic','fairy','ice']:prop=sprite(crystal,palette).resize((24,32),Image.Resampling.NEAREST)
 if type in ['fire','ghost','dark']:
  prop=Image.new('RGBA',(24,36));d=ImageDraw.Draw(prop);d.rectangle((10,4,13,34),fill=ink);d.line([(11,14),(4,8),(4,3)],fill=ink,width=3);d.line([(12,22),(20,14),(20,7)],fill=ink,width=3);d.line((11,8,11,30),fill=shade(p['ground'],1.1))
 if type in ['electric','steel','poison']:prop=obj.resize((28,30),Image.Resampling.NEAREST)
 if type in ['fighting','flying','dragon']:
  prop=Image.new('RGBA',(24,36));d=ImageDraw.Draw(prop);d.rectangle((4,1,6,35),fill=ink);d.rectangle((7,2,20,19),fill=accent);d.rectangle((9,4,18,15),fill=shade(p['accent'],.8));d.line((14,5,14,15),fill=ink)
 if type=='ground':
  prop=Image.new('RGBA',(24,32));d=ImageDraw.Draw(prop);d.rectangle((9,4,14,30),fill=ink);d.rectangle((10,5,13,29),fill=(92,139,58));d.rectangle((3,10,8,20),fill=ink);d.rectangle((4,11,9,18),fill=(103,155,62));d.rectangle((14,15,20,23),fill=ink);d.rectangle((13,16,19,21),fill=(103,155,62))
 save(prop,'objects',f'{type}-prop')
 flower=Image.new('RGBA',(16,16));d=ImageDraw.Draw(flower)
 for x,y in [(4,5),(10,10)]:d.line((x,y+2,x,y+5),fill=shade(p['edge'],.75));d.rectangle((x-1,y-1,x+1,y+1),fill=accent);d.point((x,y),fill=(255,242,172))
 save(flower,'objects',f'{type}-detail')
 # Small local scene previews enrich both mode tiles and league cards.
 scene=Image.new('RGB',(96,32));scene.paste(verge.resize((96,32),Image.Resampling.NEAREST));road=Image.open(out/'tiles'/f'{type}-road-0.png');scene.paste(road.resize((48,32),Image.Resampling.NEAREST),(24,0));scene.paste(prop,(2,-8),prop);scene.paste(obj,(65,12),obj);scene.paste(pad,(35,10),pad);save(scene,'ui',f'{type}-scene')
shadow=sprite(['...oooooo...','.oooooooooo.','oooooooooooo','.oooooooooo.','...oooooo...'],{'o':(25,34,38,100)});save(shadow,'ui','shadow')
ring=sprite(['....yyyyyyyy....','..yy........yy..','.y............y.','y..............y','.y............y.','..yy........yy..','....yyyyyyyy....'],{'y':(255,235,133,255)});save(ring,'ui','player-ring')
marker=sprite(['yyyyyyyyy','.yyyyyyy.','..yyyyy..','...yyy...','....y....'],{'y':(255,235,133,255)});save(marker,'ui','player-marker')
finish=Image.new('RGB',(16,8));d=ImageDraw.Draw(finish)
for y in range(2):
 for x in range(4):d.rectangle((x*4,y*4,x*4+3,y*4+3),fill=(248,248,222) if (x+y)%2 else (38,49,54))
save(finish,'ui','finish')
print('Built',len(list(out.rglob('*.png'))),'original pixel assets')
