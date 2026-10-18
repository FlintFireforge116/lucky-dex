from pathlib import Path
import json
from PIL import Image, ImageDraw
R=Path(__file__).resolve().parents[1]
types=list(json.loads((R/'app/src/main/assets/arcade/dash/gen3/previews/manifest.json').read_text())['previews'])
for label,folder,size in [('courses',R/'artifacts/v0340/courses',(270,360)),('previews',R/'app/src/main/assets/arcade/dash/gen3/previews',(270,120))]:
    sheet=Image.new('RGB',(6*(size[0]+12),3*(size[1]+32)),(237,232,211));draw=ImageDraw.Draw(sheet)
    for i,t in enumerate(types):
        x=(i%6)*(size[0]+12)+6;y=(i//6)*(size[1]+32)+24
        im=Image.open(folder/(t+'.png')).convert('RGB').resize(size,Image.Resampling.NEAREST)
        sheet.paste(im,(x,y));draw.text((x,y-18),t.upper(),fill=(20,30,30))
    sheet.save(R/f'artifacts/v0340/courses/all-18-{label}.png')
