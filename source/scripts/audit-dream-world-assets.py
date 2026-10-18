"""Catalogue before downloading: selected references only, never a repository mirror."""
from pathlib import Path
import json, hashlib, urllib.request, collections, sys
R=Path(__file__).resolve().parents[1]
tree=json.loads((R/'reference/dream-world-source-tree.json').read_text(encoding='utf-8-sig'))
def category(p):
    if '/Island of Dreams/' in p or p.startswith('Asset Recreation/Backgrounds/'): return 'backgrounds-environment'
    if '/Catalogue, Decor and Plushies/' in p: return 'furniture-searchable-props'
    if p.startswith('Completed Assets/Items/'): return 'items-rewards'
    if p.startswith('Completed Assets/Minigames/'): return 'minigame-specific'
    if '/Menu UI/' in p: return 'recovered-ui'
    if '/Pokemon Graphics etc/' in p: return 'pokemon-sprites-audio'
    if p.startswith('Completed Assets/Pokemon Cafe/'): return 'backgrounds-environment'
    return 'irrelevant-or-not-selected'
files=[dict(path=e['path'],bytes=e.get('size',0),gitBlob=e['sha'],category=category(e['path'])) for e in tree['tree'] if e['type']=='blob']
(R/'reference/dream-world-classified-catalog.json').write_text(json.dumps({'commit':tree['sha'],'files':files},ensure_ascii=False,indent=2),encoding='utf8')
print(dict(collections.Counter(e['category'] for e in files)))
if not any(a in sys.argv for a in ('--download-candidates','--download-layers')): sys.exit(0)
selected={
 'forest-base':'Completed Assets/Island of Dreams/Pleasant Forest/Pleasant Forest Template/Image/image 5.jpg',
 'sky-base':'Completed Assets/Island of Dreams/Windswept Sky/Windswept Sky Template/Image/image 5.jpg',
 'sea-base':'Completed Assets/Island of Dreams/Sparkling Sea/Sparkling Sea Template/Image/image 685.jpg',
 'manor-a':'Completed Assets/Island of Dreams/Spooky Manor/Spooky-Manor-Template/image 11.jpg',
 'manor-b':'Completed Assets/Island of Dreams/Spooky Manor/Spooky-Manor-Template/image 340.jpg',
 'manor-c':'Completed Assets/Island of Dreams/Spooky Manor/Spooky-Manor-Template/image 450.jpg',
 'manor-d':'Completed Assets/Island of Dreams/Spooky Manor/Spooky-Manor-Template/image 574.jpg',
 'manor-e':'Completed Assets/Island of Dreams/Spooky Manor/Spooky-Manor-Template/image 863.jpg',
 'mountain-a':'Completed Assets/Island of Dreams/Rugged Mountain/Rugged Mountain Template/Image/image 1.jpg',
 'mountain-b':'Completed Assets/Island of Dreams/Rugged Mountain/Rugged Mountain Template/Image/image 537.jpg',
 'ice-a':'Completed Assets/Island of Dreams/Icy Cave/Icy Cave Template/Image/image 1.jpg',
 'ice-b':'Completed Assets/Island of Dreams/Icy Cave/Icy Cave Template/Image/image 83.jpg',
 'ice-c':'Completed Assets/Island of Dreams/Icy Cave/Icy Cave Template/Image/image 684.jpg',
 'park-a':'Completed Assets/Island of Dreams/Dream Park/Dream-Park-Template/image 1.jpg',
 'park-b':'Completed Assets/Island of Dreams/Dream Park/Dream-Park-Template/image 814.jpg',
 'cafe-a':'Asset Recreation/Backgrounds/Pokemon Cafe Forest/Cafe_Forest_Sub_Area(A)1.png',
 'cafe-b':'Asset Recreation/Backgrounds/Pokemon Cafe Forest/Cafe_Forest_Sub_Area(B)1.jpg',
 'cafe-c':'Asset Recreation/Backgrounds/Pokemon Cafe Forest/Cafe_Forest_Sub_Area(C)2.webp',
 'cafe-e':'Asset Recreation/Backgrounds/Pokemon Cafe Forest/Cafe_Forest_Sub_Area(E).png',
 'cafe-f':'Asset Recreation/Backgrounds/Pokemon Cafe Forest/Cafe_Forest_Sub_Area(F).jpg',
 'seek-background':'Completed Assets/Minigames/Pokemon Seek/Image/image 452.png'
}
if '--download-layers' in sys.argv:
    groups=[('forest','Pleasant Forest','Pleasant Forest Template/Image',[8,393,72,120]),('sky','Windswept Sky','Windswept Sky Template/Image',[188,129,273,8]),('sea','Sparkling Sea','Sparkling Sea Template/Image',[1,4,105,429]),('manor','Spooky Manor','Spooky-Manor-Template',[345,365,380,65]),('mountain','Rugged Mountain','Rugged Mountain Template/Image',[189,514,393,90]),('ice','Icy Cave','Icy Cave Template/Image',[687,690,173,123]),('park','Dream Park','Dream-Park-Template',[134,889,874,684])]
    for key,area,folder,numbers in groups:
        for n in numbers: selected[f'{key}-layer-{n}']=f'Completed Assets/Island of Dreams/{area}/{folder}/image {n}.png'
    selected['cafe-interior']='Completed Assets/Pokemon Cafe/Pokemon_Cafe_Interior(A).png'
    for key,name in [('bookcase','Low_Bookcase'),('sofa','Elegant_Sofa'),('bed','Elegant_Bed'),('lamp','Elegant_Lamp')]:
        selected['manor-'+key]=f'Completed Assets/Catalogue, Decor and Plushies/Displayed in Home/Manor Furniture/DW_{name}(RIP).png'
out=R/'reference/dw-candidates';out.mkdir(exist_ok=True)
lookup={e['path']:e for e in files};manifest=[]
for key,p in selected.items():
    entry=lookup[p];local=out/(key+Path(p).suffix)
    url='https://raw.githubusercontent.com/Shade-of-Gr3y/Dream-World-Revival/'+tree['sha']+'/'+urllib.parse.quote(p,safe='/')
    if not local.exists():
        with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'LuckyDex-Asset-Audit'}),timeout=45) as res: local.write_bytes(res.read())
    b=local.read_bytes();blob=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
    assert blob==entry['gitBlob'],key+' source mismatch'
    manifest.append(dict(id=key,path=p,source=url,local=str(local.relative_to(R)),bytes=len(b),sha256=hashlib.sha256(b).hexdigest(),gitBlob=blob,category=entry['category']))
    print(key,len(b))
(out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
