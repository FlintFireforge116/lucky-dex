from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1];a=root/'app/src/main/assets';dash=a/'arcade/dash'
im=Image.new('RGBA',(384,160));tile=32
for y in range(0,160,tile):
 for x in range(0,384,tile):
  name='verge' if x<64 or x>=320 else 'road-0'
  t=Image.open(dash/'tiles'/f'normal-{name}.png').resize((tile,tile),Image.Resampling.NEAREST);im.paste(t,(x,y))
for x,y in [(9,2),(12,90),(337,38)]:
 t=Image.open(dash/'objects/normal-prop.png').resize((48,48),Image.Resampling.NEAREST);im.paste(t,(x,y),t)
for name,x,y in [('rock',278,18),('speed-pad',182,23),('mud',103,117),('stamina-pickup',258,122)]:
 t=Image.open(dash/'objects'/f'normal-{name}.png');t=t.resize((t.width*2,t.height*2),Image.Resampling.NEAREST);im.paste(t,(x,y),t)
for id,x,y in [(25,79,56),(127,164,78),(113,249,58)]:
 t=Image.open(a/'arcade/sprites/actors/pokemon'/f'{id}.png').convert('RGBA');scale=min(76/t.height,1.7);t=t.resize((round(t.width*scale),round(t.height*scale)),Image.Resampling.NEAREST);im.paste(t,(x-t.width//2,y),t)
im.save(dash/'ui/menu-panorama.png',optimize=True)
print('Built composed menu panorama from documented local tiles and native Pokémon sprites')
