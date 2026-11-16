#!/usr/bin/env python3
"""Generate the complete Stormfront offline catalogue with strict battle gates.

Metadata is all 106 original collector prints. FULL only when every printed
attack and ability has a verified executable outcome and trainer/energy behavior
is wired. Incomplete cards remain available to inspect/collect but not battle.
"""
import json,re,argparse,pathlib
import dp7_verified as V
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCE=ROOT/'data/classic/dp7-print-source.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-stormfront.js'
T={'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P','Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}
def runnable(e):
 if not isinstance(e,dict):return False
 if e.get('type')=='neoRule':return e.get('rule','')[4:] in V.RUNTIME_RULES
 if e.get('type')=='sequence':return all(runnable(x) for x in e.get('effects',[]))
 if e.get('type')=='coinFlip':return all(runnable(e[k]) for k in ('heads','tails') if k in e)
 if e.get('type')=='chooseOption':return all(runnable(x.get('effect')) for x in e.get('options',[]))
 if e.get('type')=='stadiumAction':return runnable(e.get('effect'))
 if e.get('type')=='noop':return True
 return True

def read_cards():
 a=json.loads(SOURCE.read_text(encoding='utf-8'))
 nums=[str(x['number']) for x in a]
 expected=[str(n) for n in range(1,104)]+['SH1','SH2','SH3']
 if sorted(nums)!=sorted(expected) or len(a)!=106 or len(set(nums))!=106:
  raise ValueError('Stormfront missing numbered, secret, or Shiny prints')
 cards=[]
 for c in a:
  n=str(c['number']);num=int(n) if n.isdecimal() else n
  stage=(c.get('subtypes')or[''])[0]
  kind='pokemon' if c['supertype']=='Pokémon' else 'trainer' if c['supertype']=='Trainer' else 'energy'
  atk=[];ok=True;issues=[]
  for x in c.get('attacks') or []:
   eff=V.ATTACKS.get(num,{}).get(x['name'])
   valid=(eff is not None and runnable(eff))
   if eff is None:eff={'type':'noop'}
   damage=str(x.get('damage') or '')
   if not valid:issues.append('Unverified attack: '+x['name'])
   ok &= valid
   atk.append({'name':x['name'],'cost':''.join(T[z] for z in x.get('cost') or []),'damage':int(re.search(r'\d+',damage)[0]) if re.search(r'\d+',damage) else 0,
               'damageText':damage or None,'text':x.get('text') or '','effect':eff})
  abilities=[];p=c.get('abilities')or[]
  mapped=V.ABILITIES.get(num,[]);mapped=mapped if isinstance(mapped,list) else [mapped]
  for x in p:
   found=next((v for v in mapped if v['name']==x['name']),None)
   if not found or (found['type']=='passive' and num not in V.PASSIVE_READY) or (found and not runnable(found['effect'])):
    ok=False;issues.append('Unverified ability: '+x['name'])
   rec={'name':x['name'],'type':'activated' if x['type']=='Poké-Power' else 'passive',
        'printedPowerType':'power' if x['type']=='Poké-Power' else 'body','disabledByStatus':x['type']=='Poké-Power',
        'text':x.get('text') or '','effect':{'type':'noop'}}
   if found:rec.update(found)
   abilities.append(rec)
  if kind=='trainer':
   tr=V.TRAINERS.get(num)
   if not tr:ok=False;issues.append('Trainer effect not verified')
   elif not runnable(tr[1]):ok=False;issues.append('Trainer runtime pending')
  if kind=='trainer' and n=='83':
   # Energy Link must offer unlimited, target-constrained physical Energy transfers
   # between holders of Energy Link. An attach-only/no-op Tool is not FULL.
   ok=False;issues.append('Energy Link attached-card movement not yet implemented')
  if kind=='energy':
   if n not in V.ENERGY or not runnable(V.ENERGY[n]['onAttach']):ok=False;issues.append('Special Energy attachment trigger pending')
  if kind=='pokemon' and stage=='Level-Up' and not c.get('evolvesFrom'):
   ok=False;issues.append('Missing LV.X prerequisite')
  weak=(c.get('weaknesses')or[{}])[0];res=(c.get('resistances')or[{}])[0]
  card={'id':'dp7-'+n,'setId':'dp7','number':n,'name':c['name'],'source':'tcg','battleFormat':'classic',
        'rarity':c.get('rarity') or '', 'image':f'https://images.pokemontcg.io/dp7/{n}.png',
        'imageLarge':f'https://images.pokemontcg.io/dp7/{n}_hires.png','kind':kind,
        'battleEnabled':bool(ok),'deckEligible':bool(ok),'support':{'status':'FULL' if ok else 'PARTIAL','reasons':issues}}
  if kind=='pokemon':
   subtype=(c.get('types')or['Colorless'])[0]
   cost=list(dict.fromkeys(T[z] for x in c.get('attacks')or[] for z in x.get('cost') or [] if z!='Colorless'))
   colored=[k for k,v in T.items() if v in cost]
   txt=' '.join([x.get('text')or'' for x in c.get('attacks')or[]]+[x.get('text')or'' for x in p]).lower()
   roles=[r for r,word in [('draw','draw'),('search','search'),('status','asleep'),('heal','heal'),('control','retreat'),('ramp','attach')] if word in txt]
   card.update({'stage':stage,'hp':int(c.get('hp') or 0),'types':c.get('types')or['Colorless'], 'subtype':subtype,
                'retreat':c.get('convertedRetreatCost') or 0,'evolvesFrom':c.get('evolvesFrom'),
                'weakness':weak.get('type'),'weaknessValue':weak.get('value'), 'weaknesses':[weak] if weak else [],
                'resistance':res.get('type'),'resistanceValue':res.get('value'),'resistances':[res] if res else [],
                'attacks':atk,'abilities':abilities, 'isLevelX':stage=='Level-Up','levelUpFrom':c.get('evolvesFrom') if stage=='Level-Up' else None,
                'deckMeta':{'roles':roles,'synergy':roles,'energyTypes':colored,'preferredEnergyTypes':colored,'preferredPartners':[],'inflicts':[],'payoffs':[]}})
  elif kind=='trainer':
   card.update({'trainerType':V.TRAINERS.get(num,(stage,None))[0], 'text':'\n'.join(c.get('rules')or[]),
                'effect':V.TRAINERS.get(num,(None,{'type':'noop'}))[1]})
  else:
   card.update({'specialEnergy':True,'text':'\n'.join(c.get('rules')or[]),'effect':V.ENERGY.get(n,{'type':'noop'})})
  cards.append(card)
 return cards

def save(cards):
 script='''/* LuckyDex Diamond & Pearl — Stormfront (dp7): 106 official collector prints.
 * Archive: PokemonTCG/pokemon-tcg-data/cards/en/dp7.json.
 * Incomplete printed outcomes are gated from battles and autobuild.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGStormfront=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'dp7',name:'Stormfront',series:'Diamond & Pearl',releaseDate:'2008-11-05',cardCount:100,printedTotal:106});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''
 OUT.write_text(script.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--audit',action='store_true');ns=parser.parse_args()
 cards=read_cards();save(cards)
 print('Stormfront:',len(cards),'catalogued,',sum(c['battleEnabled'] for c in cards),'verified battle-ready,',sum(not c['battleEnabled'] for c in cards),'gated')
 if ns.audit:
  for c in cards:
   if not c['battleEnabled']:print('GATED',c['id'],c['name'],'; '.join(c['support']['reasons']))
