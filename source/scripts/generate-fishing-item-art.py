from pathlib import Path
import html
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'app/src/main/assets/arcade/fishing-items-v0685'
OUT.mkdir(parents=True,exist_ok=True)

C={
 'navy':'#17324a','blue':'#3d88bd','light':'#d9edf5','red':'#df5b56','yellow':'#efc94c','green':'#67ae69','brown':'#8a6348','tan':'#cfaa75','purple':'#8562a6','grey':'#7e8f9c','dark':'#1a2832','white':'#f7fbfd','pink':'#d78aa5','orange':'#d98545','aqua':'#67c6cb','gold':'#d8a92e'
}

def wrap(body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
<g stroke="{C['dark']}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">{body}</g>
</svg>'''

def rect(x,y,w,h,fill,rx=8,extra=''): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" {extra}/>'
def circle(cx,cy,r,fill): return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>'
def path(d,fill='none',extra=''): return f'<path d="{d}" fill="{fill}" {extra}/>'
def line(x1,y1,x2,y2,extra=''): return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" {extra}/>'
def poly(points,fill): return f'<polygon points="{points}" fill="{fill}"/>'
def text(x,y,t,size=20,fill=None): return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="sans-serif" font-size="{size}" font-weight="700" fill="{fill or C["dark"]}" stroke="none">{html.escape(t)}</text>'

def potion(): return wrap(rect(32,26,32,52,C['aqua'],8)+rect(38,16,20,14,C['white'],4)+line(38,44,58,44)+path('M36 56 Q48 48 60 56',C['light']))
def pokeball(crack=False,dive=False):
    top=C['blue'] if dive else C['red']; body=circle(48,48,30,C['white'])+path('M18 48 A30 30 0 0 1 78 48 L18 48 Z',top)+line(18,48,78,48)+circle(48,48,9,C['white'])+circle(48,48,4,C['grey'])
    if crack: body+=path('M64 28 L57 38 L66 43 L58 53', 'none')
    return wrap(body)
def wrapper(label=''): return wrap(poly('18,30 28,22 68,22 78,30 72,38 78,46 70,54 76,64 66,72 28,72 18,64 24,54 18,46 24,38',C['yellow'])+rect(29,31,38,32,C['white'],4)+ (text(48,53,label,14) if label else ''))
def driftwood(glitch=False):
    body=path('M18 62 C28 54 32 44 42 40 C48 38 55 41 62 34 C68 29 77 28 82 34 C72 40 69 48 61 52 C54 56 46 54 40 61 C35 67 28 71 18 70 Z',C['brown'])+path('M38 45 L27 34 L32 29 L48 42',C['brown'])
    if glitch: body+=rect(67,18,9,9,C['purple'],1)+rect(74,58,8,8,C['aqua'],1)+rect(15,48,7,7,C['red'],1)
    return wrap(body)
def lure(): return wrap(path('M24 34 Q48 18 68 38 Q58 58 36 56 Z',C['red'])+circle(42,39,5,C['white'])+path('M62 48 Q80 58 65 76 Q58 82 53 72', 'none')+line(24,34,16,25))
def leftovers(): return wrap(rect(18,48,60,25,C['tan'],7)+path('M27 48 Q32 26 48 38 Q58 20 67 48 Z',C['green'])+circle(41,38,7,C['red'])+circle(58,36,6,C['yellow']))
def bike(): return wrap(circle(28,66,16,'none')+circle(69,66,16,'none')+path('M28 66 L42 42 L55 66 Z','none')+line(42,42,61,42)+line(55,66,61,42)+line(42,42,34,32)+line(58,32,68,66)+line(53,32,63,32))
def rope(): return wrap(path('M21 55 C21 28 75 28 75 55 C75 76 45 79 34 66 C28 59 31 49 41 48 C55 47 62 59 55 68','none')+circle(75,55,4,C['tan']))
def glasses(): return wrap(circle(31,50,18,C['dark'])+circle(65,50,18,C['dark'])+line(49,50,47,50)+line(13,44,7,38)+line(83,44,89,38)+path('M63 32 L71 68','none'))
def apricorn(): return wrap(circle(48,52,25,C['green'])+path('M42 27 Q47 16 57 19 Q56 29 48 32',C['brown'])+path('M50 27 Q68 22 72 32 Q59 35 50 32',C['green']))
def tail(): return wrap(path('M20 61 C35 70 55 69 67 57 C77 47 76 33 66 27 C69 42 59 49 48 48 C37 47 31 39 27 31 C18 38 14 50 20 61 Z',C['pink']))
def ticket(label=''): return wrap(rect(15,28,66,40,C['tan'],6)+line(27,28,27,68,'stroke-dasharray="5 5"')+line(69,28,69,68,'stroke-dasharray="5 5"')+text(48,54,label or 'T',16,C['navy']))
def scope(): return wrap(circle(33,49,18,C['blue'])+circle(63,49,18,C['blue'])+rect(37,40,22,18,C['grey'],5)+circle(33,49,8,C['light'])+circle(63,49,8,C['light'])+line(30,30,28,20)+line(66,30,68,20))
def shirt(): return wrap(path('M26 25 L40 17 L56 17 L70 25 L82 39 L70 49 L66 42 L66 77 L30 77 L30 42 L26 49 L14 39 Z',C['grey'])+text(48,56,'R',22,C['red']))
def nugget(): return wrap(poly('18,49 25,31 42,24 59,28 77,41 73,60 58,72 35,70 21,61',C['gold']))
def envelope(): return wrap(rect(16,28,64,42,C['light'],5)+path('M18 32 L48 55 L78 32','none')+path('M18 67 L38 48','none')+path('M78 67 L58 48','none'))
def device(label=''): return wrap(rect(20,20,56,58,C['blue'],9)+rect(29,28,38,25,C['light'],3)+circle(34,66,4,C['yellow'])+circle(47,66,4,C['red'])+line(68,18,76,10)+ (text(48,46,label,12,C['navy']) if label else ''))
def watch(): return wrap(rect(38,8,20,80,C['grey'],8)+rect(22,27,52,42,C['blue'],9)+rect(31,35,34,24,C['light'],3)+circle(66,48,4,C['yellow']))
def doll(): return wrap(circle(33,32,12,C['pink'])+circle(63,32,12,C['pink'])+circle(48,45,22,C['pink'])+rect(31,58,34,23,C['pink'],10)+circle(41,43,3,C['dark'])+circle(56,43,3,C['dark']))
def map_icon(): return wrap(path('M15 25 L34 19 L52 27 L76 19 L81 70 L59 77 L41 69 L17 77 Z',C['tan'])+line(34,19,41,69)+line(52,27,59,77)+path('M24 58 Q39 43 52 50 Q66 57 73 36','none',f'stroke="{C["red"]}"')+circle(73,36,4,C['red']))
def finder(): return wrap(path('M23 72 L43 28','none')+path('M73 72 L53 28','none')+line(43,28,53,28)+circle(48,18,8,C['yellow'])+line(30,58,66,58))
def pedal(): return wrap(circle(48,48,11,C['grey'])+line(48,48,69,32)+rect(66,24,20,12,C['dark'],4)+line(48,48,28,65)+rect(10,60,20,12,C['dark'],4))
def gear():
    pts=[]
    import math
    for i in range(16):
        a=math.pi*2*i/16-math.pi/2;r=31 if i%2==0 else 23;pts.append(f'{48+math.cos(a)*r:.1f},{48+math.sin(a)*r:.1f}')
    return wrap(poly(' '.join(pts),C['grey'])+circle(48,48,10,C['white']))
def bottle(milk=False): return wrap(rect(31,28,34,50,C['white'],9)+rect(37,14,22,18,C['white'],4)+rect(34,45,28,18,C['blue'] if milk else C['aqua'],3)+ (text(48,59,'M',12,C['white']) if milk else ''))
def cake(): return wrap(path('M18 62 L28 31 L71 40 L79 69 Z',C['tan'])+path('M28 31 L54 21 L78 41 L71 48 Z',C['pink'])+circle(54,24,4,C['red']))
def pendant(): return wrap(path('M48 18 C39 31 29 41 29 55 C29 69 37 78 48 78 C59 78 67 69 67 55 C67 41 57 31 48 18 Z',C['aqua'])+circle(48,55,10,C['light'])+line(40,19,29,11)+line(56,19,67,11))
def rock(): return wrap(poly('20,58 27,36 45,25 65,31 78,49 71,69 47,77 27,70',C['grey'])+path('M32 48 L44 38 L55 43','none'))
def reed(): return wrap(path('M28 72 L61 19 L70 24 L37 77 Z',C['tan'])+circle(51,38,3,C['dark'])+circle(45,49,3,C['dark'])+circle(39,60,3,C['dark']))
def case(label=''): return wrap(rect(19,27,58,46,C['purple'],8)+rect(27,35,42,29,C['light'],4)+line(39,27,39,18)+line(57,27,57,18)+line(39,18,57,18)+ (text(48,56,label,11,C['navy']) if label else ''))
def tag(label=''): return wrap(path('M22 28 L63 20 L80 44 L55 75 L18 67 Z',C['tan'])+circle(62,32,5,C['white'])+(text(48,55,label,12,C['navy']) if label else ''))
def can(): return wrap(rect(31,18,34,62,C['red'],8)+ellipse(48,18,17,5,C['grey'])+ellipse(48,80,17,5,C['grey'])+line(38,37,58,37)+line(38,57,58,57))
def ellipse(cx,cy,rx,ry,fill): return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}"/>'
def rodhandle(): return wrap(path('M22 76 L63 25','none')+rect(16,68,18,12,C['brown'],5)+line(63,25,78,16)+path('M78 16 Q82 41 68 60','none'))
def candy(): return wrap(poly('14,40 26,31 32,35 64,35 70,31 82,40 74,49 82,58 70,66 64,61 32,61 26,66 14,58 22,49',C['red'])+rect(32,38,32,20,C['yellow'],5))
def pouch(): return wrap(path('M29 29 Q48 20 67 29 L61 39 Q73 50 68 69 Q60 80 48 80 Q36 80 28 69 Q23 50 35 39 Z',C['tan'])+line(35,39,61,39)+circle(48,58,10,C['gold']))
def stars(big=False):
    body=''
    pts=[(48,24,11),(29,48,8),(66,53,9),(45,70,7)] if not big else [(48,18,15),(25,50,10),(72,45,12),(53,72,11),(27,73,7)]
    for cx,cy,r in pts:
        p=[]
        import math
        for i in range(10):
            a=-math.pi/2+math.pi*i/5;rr=r if i%2==0 else r*.42;p.append(f'{cx+math.cos(a)*rr:.1f},{cy+math.sin(a)*rr:.1f}')
        body+=poly(' '.join(p),C['yellow'] if not big else C['aqua'])
    return wrap(body)
def booster(): return wrap(path('M25 14 L71 20 L68 82 L22 76 Z',C['purple'])+rect(31,28,31,35,C['blue'],4)+circle(47,46,10,C['red'])+text(47,72,'TCG',10,C['white']))
def tin(): return wrap(rect(19,25,58,52,C['blue'],10)+ellipse(48,25,29,8,C['grey'])+ellipse(48,77,29,8,C['grey'])+stars(False).split('<g')[1].split('</g>')[0])

def make(name,svg): (OUT/f'{name}.svg').write_text(svg,encoding='utf-8')

icons={
'empty-potion':potion(),'bent-pokeball':pokeball(True),'repel-wrapper':wrapper('R'),'driftwood':driftwood(),'broken-lure':lure(),'rotten-leftovers':leftovers(),'rusty-bike':bike(),'frayed-rope':rope(),'shattered-blackglasses':glasses(),'decomposed-apricorn':apricorn(),'slowpoke-tail':tail(),'torn-eon-ticket':ticket('EON'),'broken-silph-scope':scope(),'soggy-rocket-uniform':shirt(),'fake-nugget':nugget(),'waterlogged-mail':envelope(),'cracked-pokenav':device('NAV'),'waterlogged-poketch':watch(),'deflated-pokedoll':doll(),'faded-old-sea-map':map_icon(),'rusted-itemfinder':finder(),'torn-vs-seeker':device('VS'),'muddy-acro-pedal':pedal(),'bent-mach-gear':gear(),'empty-moomoo-bottle':bottle(True),'soggy-old-gateau':cake(),'chipped-mystic-water':pendant(),'cracked-damp-rock':rock(),'broken-pokeflute-reed':reed(),'waterlogged-pokeblock-case':case('PB'),'torn-devon-label':tag('DEV'),'crushed-soda-can':can(),'snapped-super-rod':rodhandle(),'moldy-ragecandy-wrapper':candy(),'cracked-dive-ball':pokeball(True,True),'glitched-driftwood':driftwood(True),
'coin-pouch':pouch(),'stardust':stars(False),'pack-ticket':ticket('PACK'),'sealed-pack':booster(),'big-dust':stars(True),'ticket-pair':wrap(ticket('1').split('<g')[1].split('</g>')[0]+path('M22 20 L75 26 L70 64 L18 58 Z',C['tan'])+text(46,47,'2',18,C['navy']))
}
for k,v in icons.items(): make(k,v)
print(f'generated {len(icons)} fishing item icons in {OUT}')
