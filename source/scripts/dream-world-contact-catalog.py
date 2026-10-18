from pathlib import Path
from PIL import Image,ImageDraw
import json
R=Path(__file__).resolve().parents[1]
folder=R/'reference/dw-candidates'; files=sorted(p for p in folder.iterdir() if p.suffix.lower() in {'.png','.jpg','.webp'})
info=[]
for p in files:
    with Image.open(p) as im:
        info.append({'file':p.name,'width':im.width,'height':im.height,'mode':im.mode,'alpha':im.getextrema()[-1] if im.mode=='RGBA' else None})
for start in range(0,len(files),16):
    sheet=Image.new('RGB',(1200,960),'#d7d6e0');draw=ImageDraw.Draw(sheet)
    for i,p in enumerate(files[start:start+16]):
        x=(i%4)*300;y=(i//4)*240
        with Image.open(p) as src:
            src.thumbnail((292,210));rgba=src.convert('RGBA');sheet.paste(rgba,(x+(300-src.width)//2,y+24),rgba)
        draw.text((x+5,y+5),p.name,fill='#201538')
    dest=folder/f'contact-{start//16+1}.png';sheet.save(dest);print(dest)
(folder/'dimensions.json').write_text(json.dumps(info,indent=2),encoding='utf8')
print(json.dumps(info,indent=2))
