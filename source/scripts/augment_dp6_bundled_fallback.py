#!/usr/bin/env python3
"""Refresh the fully offline dp6 fallback with reviewed second-pass prints."""
import sys,json,pathlib,re
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from dp6_verified_outcomes import EXTRA,verified_effect
from dp6_extra_print_snapshots import PRINTS
ROOT=pathlib.Path(__file__).resolve().parents[1]
path=ROOT/'app/src/main/assets/tcg-classic-legends-awakened.js'
text=path.read_text(encoding='utf-8')
start=text.index('const CARDS=Object.freeze(')+len('const CARDS=Object.freeze(')
end=text.index('.map(c=>Object.freeze(c)))',start)
cards=json.loads(text[start:end])
TYPE={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal'}
for n,spec in PRINTS.items():
    name,stage,hp,typing,evolved,weak,weakval,res,resval,retreat,rarity,moves=spec
    c=cards[n-1]
    assert c['id']==f'dp6-{n}' and c['name']==name
    attacks=[]
    for attack_name,cost,damage,printed_text in moves:
        effect,ready=verified_effect(n,{'name':attack_name,'cost':cost,'damage':damage,'text':printed_text})
        assert ready,(n,attack_name)
        attacks.append({'name':attack_name,'cost':cost,'damage':int(re.match(r'\d+',damage).group()) if re.match(r'\d+',damage) else 0,
                        'damageText':damage or None,'text':printed_text,'effect':effect})
    preferred=list(dict.fromkeys(TYPE[t] for _,cost,_,_ in moves for t in cost if t in TYPE))
    c.update({'stage':stage,'hp':hp,'types':[typing],'subtype':typing,'rarity':rarity,'evolvesFrom':evolved or None,
              'retreat':retreat,'weakness':weak or None,'weaknessValue':weakval or None,
              'weaknesses':[{'type':weak,'value':weakval}] if weak else [],
              'resistance':res or None,'resistanceValue':resval or None,
              'resistances':[{'type':res,'value':resval}] if res else [],'attacks':attacks,'abilities':[],
              'battleEnabled':True,'deckEligible':True,'support':{'status':'FULL','reasons':[]},
              'deckMeta':{'roles':[],'synergy':[],'energyTypes':preferred,'preferredEnergyTypes':preferred,
                          'preferredPartners':[],'inflicts':[],'payoffs':[]}})
text=text[:start]+json.dumps(cards,ensure_ascii=False,separators=(',',':'))+text[end:]
text=text.replace('v0.69.251 staged','v0.69.252 expanded')
path.write_text(text,encoding='utf-8')
print('Prepared local offline fallback:',len([c for c in cards if c['battleEnabled']]),'of',len(cards))
