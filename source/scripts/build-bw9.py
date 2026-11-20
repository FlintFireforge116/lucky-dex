#!/usr/bin/env python3
"""Reproducible Black & White Plasma Freeze (BW9) print catalogue.

Pinned community PokemonTCG/pokemon-tcg-data *blob*, not a moving API/search.
This prepare step needs internet once when bw9-print-compact.json is absent.
Afterwards the set and APK generation are offline and deterministic.
"""
from __future__ import annotations
import base64, hashlib, json, re, urllib.request
from pathlib import Path
import bw9_verified as V

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/bw9-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-plasma-freeze.js'
COVER=ROOT/'docs/BW9_BUILD_COVERAGE.json'
BLOB='b659099a0445bab44b1a7df61a70d83bc13895a0'
URL=f'https://api.github.com/repos/PokemonTCG/pokemon-tcg-data/git/blobs/{BLOB}'
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal'}

def get_source():
    if SRC.exists():
        rows=json.loads(SRC.read_text(encoding='utf-8'))
    else:
        req=urllib.request.Request(URL,headers={'User-Agent':'LuckyDex-BW9-verified','Accept':'application/vnd.github+json'})
        with urllib.request.urlopen(req,timeout=45) as resp:data=json.load(resp)
        original=base64.b64decode(data['content'])
        sha=hashlib.sha1(f'blob {len(original)}\0'.encode()+original).hexdigest()
        if sha!=BLOB:raise RuntimeError('Source blob mismatch: got '+sha)
        official=json.loads(original)
        rows=[[c.get('number'),c.get('name'),c.get('supertype'),c.get('subtypes',[]),c.get('hp'),c.get('types',[]),c.get('evolvesFrom'),
               [[a['name'],[next((k for k,v in SYMBOL.items() if v==e),'C') for e in a.get('cost',[])],a.get('damage',''),a.get('text','')] for a in c.get('attacks',[])],
               [[a['name'],a.get('type','Ability'),a.get('text','')] for a in c.get('abilities',[])],
               c.get('weaknesses',[{}])[0].get('type') if c.get('weaknesses') else None,
               c.get('resistances',[{}])[0].get('type') if c.get('resistances') else None,
               c.get('convertedRetreatCost',0),c.get('rarity',''),c.get('rules',[]),c.get('trainerType')]
              for c in official]
        SRC.parent.mkdir(parents=True,exist_ok=True)
        SRC.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    if len(rows)!=122 or [x[0] for x in rows]!=[str(n) for n in range(1,123)]:
        raise RuntimeError('BW9 must contain exactly the 122 original collector prints')
    return rows

def generate(rows):
    cards=[]
    for row in rows:
        n,name,sup,subtypes,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules,trainer_class=row
        kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup]
        tp='Team Plasma' in subtypes
        ae=[];pw=[];issues=[V.GATE[n]] if n in V.GATE else []
        for title,cost,damage,printed in attacks:
            eff=V.attack(row,[title,cost,damage,printed])
            if eff is None:issues.append('Unimplemented printed attack: '+title)
            base=int(re.search(r'\d+',damage)[0]) if re.search(r'\d+',damage) and '×' not in damage else 0
            ae.append({'name':title,'cost':cost,'damage':base,'damageText':damage or None,'text':printed,
                       'effect':eff or {'type':'unsupported','reason':'Printed effect requires implementation'}})
        for title,ability_type,txt in abilities:
            obj=V.ABILITY.get(title)
            if obj is None:issues.append('Unimplemented printed Ability: '+title)
            else:pw.append({'name':title,'text':txt,'printedPowerType':'ability','disabledByStatus':False,**obj})
        if kind=='trainer':
            obj=V.TRAINERS.get(n)
            if not obj:issues.append('Unimplemented Trainer rules')
        ok=not issues
        tags=(['team-plasma'] if tp else [])+(['pokemon-ex'] if 'EX' in subtypes else [])+(['ace-spec'] if 'ACE SPEC' in subtypes else [])+(['full-art'] if 109<=int(n)<=116 else ['secret-rare'] if int(n)>=117 else [])
        card={'id':'bw9-'+n,'setId':'bw9','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
              'rarity':rarity,'image':f'https://images.pokemontcg.io/bw9/{n}.png','imageLarge':f'https://images.pokemontcg.io/bw9/{n}_hires.png',
              'battleEnabled':ok,'deckEligible':ok,'support':{'status':'FULL' if ok else 'PARTIAL','reasons':issues},'tags':tags,'teamPlasma':tp}
        if kind=='pokemon':
            needed=list(dict.fromkeys(SYMBOL[e] for _,cost,_,_ in attacks for e in cost if e in SYMBOL))
            text=' '.join([a[3] for a in attacks]+[p[2] for p in abilities]).lower()
            # Audited semantics: `attached` describes energy/card state, NOT ramp.
            # `discard` can be a self-cost, NOT disruption of the opponent.
            ramp_prints={16,38,110}
            # Printed conditional costs/payoffs may require an Energy type NOT
            # present in the printed attack cost. The CPU must supply both.
            conditional_energy={22:['Fighting']}.get(int(n),[])
            partner_hints={
                17:['Zekrom'],39:['Reshiram'],58:['Nidoqueen'],
                23:['Team Plasma Pokémon'],53:['Team Plasma Pokémon'],
                64:['Team Plasma Pokémon'],66:['Pokémon draw support'],
                90:['Vaporeon','Jolteon','Flareon','Espeon','Umbreon','Leafeon','Glaceon'],
            }.get(int(n),[])
            roles=[]
            if re.search(r'\bdraw(?:s)?\b',text):roles.append('draw')
            if 'search your deck' in text:roles.append('search')
            if re.search(r'\bheal\b',text):roles.append('heal')
            if any(x in text for x in ['is now poisoned','is now burned','is now confused','is now paralyzed','is now asleep','choose a special condition']):roles.append('status')
            if ('opponent' in text or 'defending pokémon' in text) and any(x in text for x in ['discard','switch','can\'t retreat','can’t retreat','shuffle it into']):roles.append('control')
            if int(n) in ramp_prints:roles.append('ramp')
            special=[]
            card.update(stage=subtypes[0] if subtypes else 'Basic',hp=int(hp),types=types or ['Colorless'],subtype=types[0] if types else 'Colorless',evolvesFrom=evolves,
                        retreat=retreat,weakness=weak,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
                        resistance=res,resistanceValue='-20' if res else None,resistances=[{'type':res,'value':'-20'}] if res else [],
                        attacks=ae,abilities=pw,prizeCards=2 if 'EX' in subtypes else 1,pokemonEX='EX' in subtypes,isPokemonSP=False,isLevelX=False,
                        deckMeta={'roles':roles,'synergy':roles+(['plasma'] if tp else []),'energyTypes':list(dict.fromkeys(needed+conditional_energy+special)),'preferredEnergyTypes':list(dict.fromkeys(needed+conditional_energy+special)),
                                  'conditionalAttackEnergyTypes':conditional_energy+special,'preferredPartners':([evolves] if evolves else [])+partner_hints+(['Plasma Energy'] if any('Plasma Energy' in a[3] for a in attacks) else []),
                                  'inflicts':[],'payoffs':['plasma'] if tp else []})
        elif kind=='trainer':
            card.update(trainerType=obj[0] if obj else (trainer_class or 'Item'),text='\n'.join(rules),effect=obj[1] if obj else {'type':'unsupported'},
                        aceSpec='ACE SPEC' in subtypes,maxDeckCopies=1 if 'ACE SPEC' in subtypes else 4)
        else:
            card.update(basicEnergy=False,specialEnergy=True,energyType='Colorless',subtype='Colorless',text='\n'.join(rules),
                        effect={'type':'specialEnergy','provides':{'Colorless':1}})
        cards.append(card)
    return cards

def title_needs_metal(name,abilities):
    return any(x[0]=='Dual Armor' for x in abilities)

def main():
    rows=get_source();cards=generate(rows)
    header='''/* Official Plasma Freeze BW9, 122 collector prints, pinned source blob %s. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGBW9=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'bw9',name:'Plasma Freeze',series:'Black & White',releaseDate:'2013-05-08',cardCount:122,printedTotal:122});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''%BLOB
    OUT.write_text(header.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
    cov={'printed':len(cards),'battleReady':sum(c['battleEnabled'] for c in cards),'gated':{c['id']:c['support']['reasons'] for c in cards if not c['battleEnabled']},
         'attacks':sum(len(c.get('attacks',[])) for c in cards),'abilities':sum(len(c.get('abilities',[])) for c in cards), 'sourceGitBlob':BLOB}
    COVER.write_text(json.dumps(cov,indent=2,ensure_ascii=False)+'\n')
    print('Plasma Freeze BW9:',cov['battleReady'],'battle-ready / 122 cards,',cov['attacks'],'attacks,',cov['abilities'],'abilities')
    if cov['gated']:print('GATED:',', '.join(cov['gated']))
if __name__=='__main__':main()
