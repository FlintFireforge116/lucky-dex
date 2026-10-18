"""Assemble unaltered runtime captures into review contact sheets (Pillow)."""
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
QA=ROOT/'artifacts/qa'
names=['world','home','trade','berryPicker','headIt','tilePuzzle','voltorb','ballDrop','berry','clefairy','fossil','unown','quiz']
for viewport in ['360x800','412x915','393x873']:
 for state in ['ready','running']:
  width,height=map(int,viewport.split('x'));thumb_w=width//2;thumb_h=height//2;columns=4;rows=(len(names)+columns-1)//columns
  sheet=Image.new('RGB',(columns*thumb_w,rows*(thumb_h+28)),(18,27,38));draw=ImageDraw.Draw(sheet)
  for i,name in enumerate(names):
   file=QA/f'{viewport}-{name}{"-"+state if name not in ["world","home","trade"] else ""}.png'
   shot=Image.open(file).convert('RGB');shot.thumbnail((thumb_w,thumb_h))
   x=(i%columns)*thumb_w;y=(i//columns)*(thumb_h+28);draw.text((x+6,y+8),name,fill=(240,239,219));sheet.paste(shot,(x,y+28))
  sheet.save(QA/f'contact-{viewport}-{state}.png')
print('Wrote six contact sheets covering world, home, Trade and every game in all three phone sizes.')
