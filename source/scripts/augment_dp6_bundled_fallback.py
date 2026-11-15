#!/usr/bin/env python3
"""Refresh the fully offline dp6 fallback with reviewed second-pass prints."""
import sys,json,pathlib,re
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from dp6_verified_outcomes import EXTRA,verified_effect
from dp6_batch4_verified import ABILITIES as BATCH4_ABILITIES
from dp6_batch5_verified import ABILITIES as BATCH5_ABILITIES
from dp6_batch6_verified import ABILITIES as BATCH6_ABILITIES
from dp6_batch7_verified import ABILITIES as BATCH7_ABILITIES
from dp6_batch8_verified import ABILITIES as BATCH8_ABILITIES
from dp6_batch6_fossils import FOSSILS
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
    assert c['id']==f'dp6-{n}' and (c['name']==name or n in (76,78,79,80,81) and c['name']==name.replace('[','').replace(']',''))
    attacks=[]
    for attack_name,cost,damage,printed_text in moves:
        effect,ready=verified_effect(n,{'name':attack_name,'cost':cost,'damage':damage,'text':printed_text})
        assert ready,(n,attack_name)
        attacks.append({'name':attack_name,'cost':cost,'damage':int(re.match(r'\d+',damage).group()) if re.match(r'\d+',damage) else 0,
                        'damageText':damage or None,'text':printed_text,'effect':effect})
    preferred=list(dict.fromkeys(TYPE[t] for _,cost,_,_ in moves for t in cost if t in TYPE))
    c.update({'name':name,'stage':stage,'hp':hp,'types':[typing],'subtype':typing,'rarity':rarity,'evolvesFrom':evolved or None,
              'retreat':retreat,'weakness':weak or None,'weaknessValue':weakval or None,
              'weaknesses':[{'type':weak,'value':weakval}] if weak else [],
              'resistance':res or None,'resistanceValue':resval or None,
              'resistances':[{'type':res,'value':resval}] if res else [],'attacks':attacks,'abilities':([{'name': (BATCH8_ABILITIES.get(n) or BATCH7_ABILITIES.get(n) or BATCH6_ABILITIES.get(n) or BATCH5_ABILITIES.get(n) or BATCH4_ABILITIES[n])['name'], 'text': '', **{k:v for k,v in (BATCH8_ABILITIES.get(n) or BATCH7_ABILITIES.get(n) or BATCH6_ABILITIES.get(n) or BATCH5_ABILITIES.get(n) or BATCH4_ABILITIES[n]).items() if k!='name'}}] if n in BATCH4_ABILITIES or n in BATCH5_ABILITIES or n in BATCH6_ABILITIES or n in BATCH7_ABILITIES or n in BATCH8_ABILITIES else []),
              'battleEnabled':True,'deckEligible':True,'isLevelX':stage=='Level-Up','levelUpFrom':evolved if stage=='Level-Up' else None,'support':{'status':'FULL','reasons':[]},
              'deckMeta':{'roles':[],'synergy':[],'energyTypes':preferred,'preferredEnergyTypes':preferred,
                          'preferredPartners':[],'inflicts':[],'payoffs':[]}})
# DP6 reuses the established playFossil Trainer placement. Unlike the older
# EX Sandstorm Fossils, these two count as Knocked Out Pokémon for Prizes.
for n,spec in FOSSILS.items():
    c=cards[n-1]
    assert c['name']==spec['name'] and c['id']==f'dp6-{n}'
    c.update({'kind':'trainer','trainerType':'Item','text':'\n'.join(spec['rules']),
      'fossil':True,'hp':40,'stage':'Basic','types':['Colorless'],'subtype':'Colorless',
      'retreat':0,'countsAsKnockout':True,
      'effect':{'type':'playFossil','hp':40,'subtype':'Colorless','canRetreat':False,'countsAsKnockout':True},
      'statusImmune':['sleep','paralysis','confusion','poison','burn'],
      'abilities':[{'text':spec['abilityText'],**spec['ability']}],
      'battleEnabled':True,'deckEligible':True,'support':{'status':'FULL','reasons':[]}})
# Even gated cards must have their printed Trainer subtype: partner card
# effects (Sneasel Rob) and deck filters inspect the public catalogue.
trainer_stages={129:'Pokémon Tool',130:'Supporter',131:'Supporter',132:'Item',
                133:'Item',134:'Stadium',135:'Stadium',136:'Technical Machine',
                137:'Technical Machine',138:'Item',139:'Item'}
for number,subtype in trainer_stages.items():
    if cards[number-1]['kind']=='trainer':
        cards[number-1]['trainerType']=subtype
text=text[:start]+json.dumps(cards,ensure_ascii=False,separators=(',',':'))+text[end:]
text=re.sub(r'v0\.69\.\d+ verified battle batch','v0.69.258 verified battle batch',text,count=1)
path.write_text(text,encoding='utf-8')
print('Prepared local offline fallback:',len([c for c in cards if c['battleEnabled']]),'of',len(cards))
