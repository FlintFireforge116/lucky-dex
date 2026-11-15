#!/usr/bin/env python3
"""LuckyDex dp6 catalog builder. Input: PokemonTCG/pokemon-tcg-data cards/en/dp6.json.

Do not download from the network inside the app. The generated JS is self-contained.
Only a conservative, verifiable printed-effect subset is battle-enabled; a
catalogue entry does not certify a card as implemented.
"""
import argparse
import json
import pathlib
import re
import urllib.request
from dp6_verified_outcomes import verified_effect

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'app/src/main/assets/tcg-classic-legends-awakened.js'
URL = 'https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/dp6.json'
TYPE = {'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P',
        'Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}
NOOP = {'type':'noop'}
STATUS = {'Asleep':'sleep','Paralyzed':'paralysis','Confused':'confusion',
          'Poisoned':'poison','Burned':'burn'}


def simple_effect(text, self_name=None):
    """Return (effect, verified) only for exact printed actions modelled here.

    No special-case card may use a substring match that drops a second clause.
    """
    text = (text or '').strip()
    if not text:
        return NOOP, True
    pattern = r'The Defending Pok[eé]mon is now (Asleep|Paralyzed|Confused|Poisoned|Burned)\.'
    if (m := re.fullmatch(pattern, text)):
        return {'type':'status','target':'opponentActive','status':STATUS[m.group(1)]}, True
    if (m := re.fullmatch(r'Flip a coin\. If heads, the [Dd]efending Pok[eé]mon is now (Asleep|Paralyzed|Confused|Poisoned|Burned)\.', text)):
        return {'type':'coinFlip','heads':{'type':'status','target':'opponentActive','status':STATUS[m.group(1)]}}, True
    if re.fullmatch(r'Flip a coin\. If heads, prevent all effects of an attack, including damage, done to [^\.]+ during your opponent\'s next turn\.',text):
        return {'type':'coinFlip','heads':{'type':'preventDamage','target':'self','duration':'opponentTurn','effects':True}},True
    if (m := re.fullmatch(r'Flip a coin\. If heads, this attack does (\d+) damage plus (\d+) more damage\.', text)):
        return {'type':'coinFlip','heads':{'type':'bonusDamage','amount':int(m.group(2))}}, True
    if (m := re.fullmatch(r'Flip (\d+) coins\. This attack does (\d+) damage times the number of heads\.', text)):
        return {'type':'coinDamage','coins':int(m.group(1)),'amount':int(m.group(2)),'mode':'replace'}, True
    if text=='Draw a card.':
        return {'type':'draw','amount':1},True
    # Never infer a self-only heal from printed text that may target the full team.
    # Any healing effect not explicitly naming the attacker must be audited.
    if (m := re.fullmatch(r'Remove (\d+) damage counters? from ([^.]+)\.', text)):
        if self_name and m.group(2) == self_name:
            return {'type':'heal','target':'self','amount':int(m.group(1))*10}, True
        return NOOP, False
    if (m := re.fullmatch(r'([A-Za-z\- ]+) does (\d+) damage to itself\.',text)):
        return {'type':'selfDamage','amount':int(m.group(2))}, True
    if (m := re.fullmatch(r'The Defending Pok[eé]mon can\'t retreat during your opponent\'s next turn\.',text)):
        return {'type':'lock','action':'retreat','target':'opponentActive','duration':'opponentTurn'},True
    return NOOP, False


def build_cards(upstream):
    if not isinstance(upstream,list) or len(upstream)!=146:
        raise ValueError('Legends Awakened source must contain exactly 146 numbered prints')
    numbers = sorted(int(c['number']) for c in upstream)
    if numbers != list(range(1,147)) or any(c.get('id')!=f"dp6-{c['number']}" for c in upstream):
        raise ValueError('dp6 printed IDs / collector numbers are incomplete')
    ready_count=0
    cards=[]
    for original in sorted(upstream,key=lambda c:int(c['number'])):
        n=int(original['number']);kind=original.get('supertype')
        subtypes=original.get('subtypes') or []
        stage = next((s for s in ('Level-Up','Stage 2','Stage 1','Basic') if s in subtypes),subtypes[0] if subtypes else '')
        name=original['name']; id_=f'dp6-{n}'
        pokemon=kind=='Pokémon'; trainer=kind=='Trainer'
        types=original.get('types') or []
        attacks=[]; safe=True
        for a in original.get('attacks') or []:
            cost=''.join(TYPE[t] for t in a.get('cost') or [])
            damage_text=str(a.get('damage') or '')
            # 10× / 20+ cannot be treated as ordinary 10/20 without its verified modifier.
            # Exact archived-print overrides MUST take precedence. The generic
            # parser can otherwise silently collapse broader actions (Bellossom
            # Parallel Gain heals *each* ally, not just the attacker).
            effect,verified=verified_effect(n,a)
            if not verified:
                effect,verified=simple_effect(a.get('text') or '', name)
            damage_shape=re.fullmatch(r'\d*',damage_text) is not None
            if damage_text.endswith('+') and re.fullmatch(r'\d+\+',damage_text):
                damage_shape=(effect.get('type')=='coinFlip' and effect.get('heads',{}).get('type')=='bonusDamage') or effect.get('type') in ('bonusDamage','energyDamage','fieldCountDamage','sequence') or (effect.get('type')=='coinDamage' and effect.get('mode')=='add')
            if damage_text.endswith('×') and re.fullmatch(r'\d+×',damage_text):
                damage_shape=effect.get('type') in ('coinDamage','coinDamageByPokemon') and effect.get('mode')=='replace'
            safe &= bool(verified and damage_shape)
            attacks.append({'name':a['name'],'cost':cost,'damage':int(damage_text or 0) if damage_text.isdecimal() else int(re.match(r'\d+',damage_text).group()) if re.match(r'\d+',damage_text) else 0,
                            'damageText':damage_text or None,'text':a.get('text') or '', 'effect':effect})
        abilities=[]
        for ab in original.get('abilities') or []:
            abilities.append({'name':ab['name'],'type':'activated' if ab['type']=='Poké-Power' else 'passive',
                'printedPowerType':'power' if ab['type']=='Poké-Power' else 'body',
                'disabledByStatus':ab['type']=='Poké-Power','text':ab.get('text') or '', 'effect':NOOP})
        if abilities or not attacks: safe=False
        if stage=='Level-Up' or not pokemon: safe=False
        weakness=(original.get('weaknesses') or [{}])[0]
        resist=(original.get('resistances') or [{}])[0]
        if not weakness.get('type'): weakness={}
        if not resist.get('type'): resist={}
        card={'id':id_,'setId':'dp6','number':str(n),'name':name,'source':'tcg','battleFormat':'classic',
              'rarity':original.get('rarity') or '',
              'image':f'https://images.pokemontcg.io/dp6/{n}.png',
              'imageLarge':f'https://images.pokemontcg.io/dp6/{n}_hires.png',
              'kind':'pokemon' if pokemon else 'trainer' if trainer else 'energy',
              'battleEnabled':bool(safe),'deckEligible':bool(safe),
              'support':{'status':'FULL' if safe else 'PARTIAL',
                         'reasons':[] if safe else ['Printed choices, continuous abilities, damage modifiers, or timing require outcome verification']}}
        if pokemon:
            card.update({'stage':stage,'hp':int(original.get('hp') or 0),'types':types,
                         'subtype':types[0] if types else 'Colorless','retreat':original.get('convertedRetreatCost') or 0,
                         'evolvesFrom':original.get('evolvesFrom') or None,
                         'weakness':weakness.get('type'),'weaknessValue':weakness.get('value'),
                         'weaknesses':[weakness] if weakness else [],
                         'resistance':resist.get('type'),'resistanceValue':resist.get('value'),
                         'resistances':[resist] if resist else [],
                         'attacks':attacks,'abilities':abilities,
                         'isLevelX':stage=='Level-Up','levelUpFrom':original.get('evolvesFrom') if stage=='Level-Up' else None})
            named=[t for a in attacks for t in a['cost'] if t!='C']
            preferred=list(dict.fromkeys({'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal'}[c] for c in named))
            printed_text=' '.join([x['text'] for x in attacks]+[x['text'] for x in abilities]).lower()
            roles=[r for r,word in [('draw','draw'),('search','search'),('status','asleep'),('heal','heal'),('control','retreat'),('ramp','attach')] if word in printed_text]
            card['deckMeta']={'roles':roles,'synergy':roles,'energyTypes':preferred,'preferredEnergyTypes':preferred,
                              'preferredPartners':[],'inflicts':[],'payoffs':[]}
        elif trainer:
            card['trainerType']=stage
            card['text']='\n'.join(original.get('rules') or [])
            card['effect']=NOOP
            if attacks: card['attacks']=attacks
            if name in ('Claw Fossil','Root Fossil'):
                card.update({'fossil':True,'hp':40,'stage':'Basic','types':['Colorless'],'subtype':'Colorless',
                             'retreat':0,'countsAsKnockout':True,'statusImmune':['sleep','paralysis','confusion','poison','burn'],
                             'abilities':abilities})
        else:
            card['specialEnergy']=True;card['text']='\n'.join(original.get('rules') or [])
        ready_count+=int(bool(safe))
        cards.append(card)
    return cards


def write_js(cards,output):
    payload=json.dumps(cards,ensure_ascii=False,separators=(',',':'))
    js='''/* LuckyDex Classic TCG — Legends Awakened (dp6), v0.69.253 audited build fix.
 * Card identities, attacks, text and abilities: PokemonTCG/pokemon-tcg-data cards/en/dp6.json.
 * Gated cards are collection-visible but NOT battle-eligible. DO NOT promote
 * complex prints by changing battleEnabled without outcome-level tests.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGLegendsAwakened=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'dp6',name:'Legends Awakened',series:'Diamond & Pearl',releaseDate:'2008-08-01',cardCount:146,printedTotal:146});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''
    output.write_text(js.replace('__CARDS__',payload),encoding='utf-8')


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--input',type=pathlib.Path,help='Official dp6 JSON file; if absent downloads from the archived PokemonTCG GitHub data repo')
    parser.add_argument('--output',type=pathlib.Path,default=OUT)
    args=parser.parse_args()
    if args.input:
        upstream=json.loads(args.input.read_text(encoding='utf-8'))
    else:
        with urllib.request.urlopen(URL,timeout=45) as response:
            upstream=json.load(response)
    cards=build_cards(upstream)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    write_js(cards,args.output)
    print(f'Legends Awakened: {len(cards)} collector prints, {sum(x["battleEnabled"] for x in cards)} conservative battle-ready, {sum(not x["battleEnabled"] for x in cards)} gated. Saved {args.output}')

if __name__=='__main__':main()
