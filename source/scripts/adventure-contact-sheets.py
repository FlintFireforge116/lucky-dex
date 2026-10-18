"""Compose the reviewed phone matrix without modifying its screenshots."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/v0230/screens'
NAMES=['map','meadow','cave','haunted','coast','volcano','roam','reveal','rare','discovery','battle','trainer','route','event','camp','perk','boss-approach','boss','summary','bag','capture']
for width in [360,393,412,320]:
    canvas=Image.new('RGB',(6*240,4*565),'#101c23')
    draw=ImageDraw.Draw(canvas)
    for i,name in enumerate(NAMES):
        shot=Image.open(OUT/f'{width}-{name}.png')
        x,y=i%6*240,i//6*565
        canvas.paste(ImageOps.contain(shot,(240,533)),(x,y+25))
        draw.text((x+6,y+5),f'{width}: {name}',fill='white')
    canvas.save(OUT/f'{width}-contact-sheet.jpg',quality=90)
print('PASS four unaltered screenshot contact sheets')
