#!/usr/bin/env python3
"""Reproduce the Pokémon Center UK v0.44.0 offline sleeve snapshot.

The public rendered category was enumerated in an ordinary browser on 2026-10-16.
Its 130 product links and observed first-image identifiers are preserved in the
QA seed; --download uses only those observed public image URLs. No endpoint or
product-ID guessing is used. Re-running without --download rebuilds from cache.
"""
from __future__ import annotations
import argparse
import concurrent.futures
import hashlib
import io
import json
import re
import textwrap
import urllib.request
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / 'qa/v0440/physical'
OUT = ROOT / 'app/src/main/assets/cosmetics/sleeves/physical-v0440'
MANIFEST = ROOT / 'scripts/data/sleeves-physical-v0440.json'
CATEGORY = 'https://www.pokemoncenter.com/en-gb/category/card-sleeves'
IMAGE_ROOT = 'https://www.pokemoncenter.com/images/DAMRoot/Full-Size/'
PRODUCT_ROOT = 'https://www.pokemoncenter.com/en-gb/product/'
FAN_SKUS = {'705-97035','705-97038','705-97049','705-97045','705-97034','705-97048'}

def gallery_sources():
    """URLs read from the visible product galleries; never inferred endpoints."""
    rows = [dict(sku=sku+'-high', sourceImageUrl='https://www.pokemoncenter.com/images/DAMRoot/High/10000/P9149_'+sku+'_01.jpg') for sku in sorted(FAN_SKUS)]
    rows.append(dict(sku='705-09365-high',sourceImageUrl='https://www.pokemoncenter.com/images/DAMRoot/High/10000/P7455_705-09365_01.jpg'))
    rows.append(dict(sku='10-10166-101-high',sourceImageUrl='https://www.pokemoncenter.com/images/DAMRoot/High/10022/P11098_10-10166-101_01.jpg'))
    return rows

def catalogue():
    result = []
    for i, line in enumerate((QA / 'catalogue-seed.tsv').read_text().splitlines()):
        sku, slug, image, *number = line.split('|')
        playmat = slug.endswith('-playmat')
        if slug.startswith(('omocat-', 'van-gogh-museum-')):
            product_slug = 'pokemon-center-' + slug
        elif slug == 'esa':
            product_slug = 'pokemon-esa-pokemon-tcg'
        else:
            product_slug = 'pokemon-tcg-' + slug
        if not playmat:
            product_slug += '-card-sleeves-' + ('130' if sku == '10-10166-101' else '65') + '-sleeves'
        result.append(dict(index=i + 1, sku=sku, slug=slug, referenceUrl=PRODUCT_ROOT + sku + '/' + product_slug,
                           sourceImageUrl=IMAGE_ROOT + image + '_' + sku + '_' + (number[0] if number else '01') + '.jpg',
                           sourcePage=1 + i // 32, categorySoldOut=i >= 55 or i in (2, 4, 5),
                           excludedReason='Category contains a playmat, not card sleeves' if playmat else None))
    return result

def fetch(row):
    path = QA / 'originals' / (row['sku'] + '.jpg')
    if not path.exists():
        req = urllib.request.Request(row['sourceImageUrl'], headers={'User-Agent':'LuckyDex offline artwork provenance snapshot'})
        with urllib.request.urlopen(req, timeout=35) as response:
            data = response.read()
        Image.open(io.BytesIO(data)).verify()
        path.write_bytes(data)
    return row['sku'], path.stat().st_size

def trim(image):
    """Crop neutral studio margins; retain the printed sleeve border and ratio."""
    image = image.convert('RGB')
    background = Image.new('RGB', image.size, (255,255,255))
    diff = ImageChops.difference(image, background)
    mask = diff.convert('L').point(lambda p: 255 if p > 30 else 0)
    box = mask.getbbox()
    if box:
        x0,y0,x1,y1 = box
        image = image.crop((max(0,x0-1),max(0,y0-1),min(image.width,x1+1),min(image.height,y1+1)))
    return image

def name_for(slug):
    if slug=='celestial-espeon-and-umbreon-espeon': return 'Celestial Espeon'
    if slug=='celestial-espeon-and-umbreon-umbreon': return 'Celestial Umbreon'
    if slug=='esa': return 'Pokémon × ESA'
    name = slug.replace('-', ' ').title().replace(' And ', ' & ').replace('Pokemon', 'Pokémon').replace('Ho Oh', 'Ho-Oh')
    name = name.replace('Omocat ', 'OMOCAT: ').replace('Van Gogh Museum ', 'Van Gogh Museum: ')
    name = name.replace('Sirfetch D', "Sirfetch’d").replace('Digletts', "Diglett’s").replace('We Re', "We’re").replace('Esa', 'ESA').replace('Mew Dna', 'Mew DNA')
    name = name.replace('Comic Style', 'Comic-Style').replace('Self Portrait', 'Self-Portrait')
    return name

def prepared_images(row):
    sku=row['sku']
    if sku=='10-10166-101':
        source=next(r for r in gallery_sources() if r['sku']==sku+'-high')['sourceImageUrl']
        im=Image.open(QA/'originals'/(sku+'-high.jpg'))
        return [(row['slug']+'-'+species,trim(im.crop((a,0,b,im.height))),source,'Half of exposed flat two-design photograph') for species,a,b in [('espeon',0,600),('umbreon',600,1200)]]
    if sku in FAN_SKUS:
        source=next(r for r in gallery_sources() if r['sku']==sku+'-high')['sourceImageUrl']
        im=Image.open(QA/'originals'/(sku+'-high.jpg')).convert('RGB')
        # Visually inspected four corners of the unobscured front sleeve, clockwise
        # from top left. QUAD expects top-left, bottom-left, bottom-right, top-right.
        quad=(728,194,566,713,943,835,1108,314)
        im=im.transform((416,576),Image.Transform.QUAD,quad,Image.Resampling.BICUBIC)
        return [(row['slug'],im,source,'Rectified unobscured front sleeve from fan photograph; corners TL728,194 BL566,713 BR943,835 TR1108,314')]
    source=row['sourceImageUrl']
    if sku=='705-09365':
        im=Image.open(QA/'originals'/(sku+'-high.jpg'))
        source=next(r for r in gallery_sources() if r['sku']==sku+'-high')['sourceImageUrl']
    else:
        im=Image.open(QA/'originals'/(sku+'.jpg'))
    note='Tight neutral studio margin crop'
    if row['slug'].startswith('van-gogh-museum-'):
        im=im.crop((0,0,510,im.height))
        note='Crop excludes external co-brand footer at right; printed sleeve and copyright retained'
    return [(row['slug'],trim(im),source,note)]

POKEMON = {'squirtle':7,'spheal':363,'ditto':132,'dragonite':149,'rayquaza':384,'pikachu':25,'lugia':249,'ho-oh':250,'espeon':196,'umbreon':197,'gardevoir':282,'greninja':658,'ogerpon':1017,'bellibolt':939,'hawlucha':701,'gallade':475,'mewtwo':150,'mew':151,'eevee':133,'charizard':6,'wooloo':831,'goomy':704,'terapagos':1024,'slither-wing':988,'iron-moth':994,'miraidon':1008,'revavroom':966,'armarouge':936,'koraidon':1007,'dondozo':977,'tatsugiri':978,'porygon':137,'sirfetch-d':865,'diglett':50,'tandemaus':924,'maushold':925,'munchlax':446,'snorlax':143,'rapidash':78,'sylveon':700,'ceruledge':937,'corviknight':823,'sunflora':192,'shinx':403,'tyranitar':248,'tyrunt':696,'garchomp':445,'trubbish':568,'garbodor':569,'lucario':448,'smeargle':235,'vulpix':37,'gyarados':130,'caterpie':10,'luxray':405,'salamence':373,'lunatone':337,'solrock':338,'baxcalibur':998,'goodra':706,'koffing':109,'weezing':110,'volcarona':637,'frosmoth':873,'psyduck':54,'iron-valiant':1006}

def contact_sheets(rows):
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)
    for page in range((len(rows) + 29)//30):
        sheet = Image.new('RGB',(1200,6*265),(235,238,242))
        draw = ImageDraw.Draw(sheet)
        for n,row in enumerate(rows[page*30:(page+1)*30]):
            raw = QA / 'originals' / (row['sku']+'.jpg')
            if not raw.exists(): continue
            im=trim(Image.open(raw)); im.thumbnail((185,220))
            x=(n%6)*200+(200-im.width)//2; y=(n//6)*265
            sheet.paste(im,(x,y))
            label=str(row['index'])+' '+row['sku']+'\n'+name_for(row['slug'])
            lines=[str(row['index'])+' '+row['sku']]+textwrap.wrap(name_for(row['slug']),26)[:2]
            for k,line in enumerate(lines):
                draw.text(((n%6)*200+4,y+222+13*k),line,fill=(20,20,20),font=font)
        sheet.save(QA / f'contact-source-{page+1}.jpg',quality=90)

def build(rows):
    entries=[]; by_slug={}; failed=[]; hash_paths={}; represented={}
    OUT.mkdir(parents=True,exist_ok=True); MANIFEST.parent.mkdir(parents=True,exist_ok=True)
    for row in rows:
        if row['excludedReason']: continue
        slug=row['slug']
        if slug in represented:
            for entry in represented[slug]:
                entry.setdefault('alternateReferences',[]).append({'referenceUrl':row['referenceUrl'],'sourceImageUrl':row['sourceImageUrl']})
            continue
        path=QA/'originals'/(row['sku']+'.jpg')
        if not path.exists(): failed.append(row); continue
        represented[slug]=[]
        for design_slug,image,source,note in prepared_images(row):
            image.thumbnail((416,640),Image.Resampling.LANCZOS)
            buffer=io.BytesIO(); image.save(buffer,format='WEBP',quality=85,method=6)
            data=buffer.getvalue(); digest=hashlib.sha256(data).hexdigest()
            art_path=hash_paths.setdefault(digest,'cosmetics/sleeves/physical-v0440/'+design_slug+'.webp')
            target=ROOT/'app/src/main/assets'/art_path
            target.write_bytes(data)
            entry={'referenceUrl':row['referenceUrl'],'sourceImageUrl':source}
            ids=sorted(set(v for k,v in POKEMON.items() if re.search(r'(^|-)'+re.escape(k)+r'(-|s-|$)',slug)))
            if slug=='esa': ids=[25]
            if species := ('espeon' if design_slug.endswith('celestial-espeon-and-umbreon-espeon') else 'umbreon' if design_slug.endswith('celestial-espeon-and-umbreon-umbreon') else ''):
                ids=[POKEMON[species]]
            themes=['Physical TCG']
            for token,label in [('omocat','OMOCAT'),('van-gogh','Van Gogh Museum'),('celestial','Celestial'),('ghost','Ghost'),('explore','Explore Pokémon'),('pixel','Pixel'),('esa','Space')]:
                if token in slug: themes.append(label)
            entry.update(id='physical-'+design_slug,name=name_for(design_slug),sourceFamily='Physical TCG',artPath=art_path,
                         themes=themes,pokemonIds=ids,sha256=digest,width=image.width,height=image.height,bytes=len(data),imagePreparation=note)
            entries.append(entry); by_slug[design_slug]=entry; represented[slug].append(entry)
    used={Path(r['artPath']).name for r in entries}
    for stale in OUT.glob('*.webp'):
        if stale.name not in used: stale.unlink()
    MANIFEST.write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (QA/'catalogue-enumeration.json').write_text(json.dumps({'category':CATEGORY,'observedDate':'2026-10-16','displayedProductCount':130,'pageRanges':[[1,32],[33,64],[65,96],[97,128],[129,130]],'products':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    summary={'enumeratedProducts':len(rows),'excludedPlaymats':sum(bool(r['excludedReason']) for r in rows),'bundledDesignRows':len(entries),'uniqueArtworkFiles':len(set(r['artPath'] for r in entries)),'assetBytes':sum(p.stat().st_size for p in OUT.glob('*.webp')),'failed':failed}
    (QA/'acquisition-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(json.dumps(summary,indent=2))
    font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',13)
    for page in range((len(entries)+29)//30):
        sheet=Image.new('RGB',(1200,1500),(235,238,242)); draw=ImageDraw.Draw(sheet)
        for n,entry in enumerate(entries[page*30:(page+1)*30]):
            image=Image.open(ROOT/'app/src/main/assets'/entry['artPath']); image.thumbnail((180,245))
            x=n%6*200; y=n//6*300
            sheet.paste(image,(x+(200-image.width)//2,y))
            for k,line in enumerate(textwrap.wrap(entry['name'],26)[:3]):
                draw.text((x+4,y+248+14*k),line,fill=(20,20,20),font=font)
        sheet.save(QA/f'contact-final-{page+1}.jpg',quality=92)

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--download',action='store_true'); args=parser.parse_args()
    rows=catalogue(); (QA/'originals').mkdir(parents=True,exist_ok=True)
    if args.download:
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            futures={pool.submit(fetch,r):r for r in rows+gallery_sources()}
            for future in concurrent.futures.as_completed(futures):
                try: print('cached',*future.result())
                except Exception as exc: print('FAILED',futures[future]['sku'],str(exc))
    contact_sheets(rows); build(rows)

if __name__=='__main__': main()
