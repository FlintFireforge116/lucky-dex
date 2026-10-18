"""Contact sheets use unaltered local runtime screenshots for visual review."""
from pathlib import Path
from PIL import Image, ImageDraw
R=Path(__file__).resolve().parents[1]
A=R/'artifacts/v0402'
for viewport in ['360x640','360x780','412x915','320x568','768x1024']:
 files=sorted((A/'acceptance').glob(viewport+'-*.png'))
 files=[p for p in files if 'failure' not in p.name]
 w,h=map(int,viewport.split('x'));tw=240;th=round(h*tw/w);cols=4
 sheet=Image.new('RGB',(tw*cols,((len(files)+cols-1)//cols)*(th+32)),(35,56,49))
 draw=ImageDraw.Draw(sheet)
 for i,p in enumerate(files):
  shot=Image.open(p).convert('RGB');shot.thumbnail((tw,th));x=(i%cols)*tw;y=(i//cols)*(th+32)
  draw.text((x+5,y+7),p.name[len(viewport)+1:-4],fill='white');sheet.paste(shot,(x,y+32))
 sheet.save(A/f'contact-{viewport}.png')
print('Built five review contact sheets from fresh runtime captures.')
