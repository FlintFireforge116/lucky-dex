"""Render actual Chrome acceptance captures as review galleries, including avatars."""
import json, pathlib, re
from PIL import Image, ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/v0403/acceptance'
data=json.loads((OUT/'acceptance.json').read_text())
focus=['New Bark Town','Route 29','Cherrygrove City','Route 30','Route 31','Sprout Tower','Violet City','Violet Gym','Route 32']
for run in data['runs']:
    size=f"{run['viewport']['width']}x{run['viewport']['height']}"
    chosen=[]
    for title in focus:
        for i,row in enumerate(run['records']):
            if row['title']==title and row['view']=='journey':
                name=re.sub(r'[^a-zA-Z0-9-]+','-',row['name'])
                chosen.append((title,OUT/f'{size}-{i+1:02}-{name}.png',row));break
    chosen.extend((r['title'],OUT/r['file'],r) for r in run['spotChecks'])
    width=230;height=round(run['viewport']['height']*222/run['viewport']['width'])+30
    rows=(len(chosen)+4)//5
    canvas=Image.new('RGB',(width*5,height*rows),'#e8e8e8');draw=ImageDraw.Draw(canvas)
    scenes=Image.new('RGB',(270*5,228*rows),'#e8e8e8');sd=ImageDraw.Draw(scenes)
    for i,(title,file,row) in enumerate(chosen):
        image=Image.open(file).convert('RGB');thumb=image.copy();thumb.thumbnail((222,height-30));x=(i%5)*width;y=(i//5)*height
        canvas.paste(thumb,(x,y+25));draw.text((x+3,y+4),title,fill='black')
        box=row['imageBounds'];crop=image.crop((round(box['x']),round(box['y']),round(box['right']),round(box['bottom'])));crop.thumbnail((260,195));sx=(i%5)*270;sy=(i//5)*228
        scenes.paste(crop,(sx,sy+25));sd.text((sx+3,sy+4),title,fill='black')
    canvas.save(OUT/f'{size}-ui-gallery.jpg');scenes.save(OUT/f'{size}-scene-gallery.png')
    print(f'{size}: {len(chosen)} actual UI + avatar scene views')
