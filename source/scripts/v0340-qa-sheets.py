from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parents[1];out=R/'artifacts/v0340'
paths=sorted((out/'after').glob('race-*.png'));sheet=Image.new('RGB',(sum(Image.open(p).width for p in paths),940),(237,232,211));draw=ImageDraw.Draw(sheet);x=0
for p in paths:
    im=Image.open(p).convert('RGB');sheet.paste(im,(x,24));draw.text((x+5,5),p.stem,fill=(0,0,0));x+=im.width
sheet.save(out/'all-four-phone-layouts.png')
base=R.parent/'LuckyDex_v0.33.1_baseline/app/src/main/assets/arcade/dash'
paths=sorted(base.rglob('*.png'));sheet=Image.new('RGB',(15*100,((len(paths)+14)//15)*90),(224,221,208));draw=ImageDraw.Draw(sheet)
for i,p in enumerate(paths):
    im=Image.open(p).convert('RGBA');im.thumbnail((90,64),Image.Resampling.NEAREST);x=i%15*100;y=i//15*90;sheet.paste(im,(x,y),im);draw.text((x,y+65),p.stem[:15],fill=(0,0,0))
sheet.save(out/'baseline-asset-audit.png');print('Baseline Dash PNGs:',len(paths))
