#!/usr/bin/env python3
from __future__ import annotations
import argparse,hashlib,json,re,sys,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/swsh12-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-silver-tempest.js'
COVER=ROOT/'docs/SWSH12_BUILD_COVERAGE.json'
ATTEST=ROOT/'docs/SWSH12_CANONICAL_SOURCE.json'
PIN='a57779d463a4f8ddf2bc21ad4ae66e9f4c3eaac2'
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal','Y':'Fairy','N':'Dragon'}
REVERSE={v:k for k,v in SYMBOL.items()}
VARIANTS=[]
def validate(rows):
 from swsh12_source import rows as verified_rows
 assert rows==verified_rows(), 'Silver Tempest source differs from verified packets'
 return rows

def prepare():
 from swsh12_source import rows as verified_rows
 rows=validate(verified_rows())
 SRC.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 ATTEST.write_text(json.dumps({'set':'swsh12','sourceGitBlob':PIN,'compactSha256':hashlib.sha256(SRC.read_bytes()).hexdigest(),'printedTotal':215,'importedTotal':len(rows),'sourceScope':'verified pinned source packets through stage four'},indent=2)+'\n')
 return rows

def get_source():
 rows=validate(json.loads(SRC.read_text()))
 manifest=json.loads(ATTEST.read_text())
 assert manifest['compactSha256']==hashlib.sha256(SRC.read_bytes()).hexdigest() and manifest['sourceGitBlob']==PIN
 return rows

def generate(rows):
 cards=[]
 for row in rows:
  n,name,sup,subs,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules,trainer_class,trait=row
  n=str(n);kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup];problems=[]
  prism='Prism Star' in subs
  if prism and kind!='energy' and not V.prism_ready(row):problems.append('Prism Star attack/Ability or Trainer effect not yet implemented')
  if trait:problems.append('Ancient Trait not yet supported')
  attack_objs=[];powers=[]
  for a in attacks:
   title,cost,damage,printed=a;eff=V.attack(row,a)
   if eff is None:problems.append('Unimplemented attack: '+title)
   m=re.search(r'\d+',damage or '');base=int(m.group()) if m and not re.search(r'[×xX]',damage) else 0
   attack_objs.append({'name':title,'cost':cost,'damage':base,'damageText':damage or None,'text':printed,'gxAttack':title.endswith('-GX'),'vstarPower':"You can't use more than 1 VSTAR Power in a game" in printed,
    'effect':eff if eff is not None else {'type':'unsupported','reason':'SWSH12 attack mechanic awaiting implementation'}})
  for a in abilities:
   power=V.ability(row,a)
   if power is None:problems.append('Unimplemented Ability: '+a[0])
   powers.append({'name':a[0],'text':a[2],'printedPowerType':'ability','disabledByStatus':False,
    **(power if power is not None else {'type':'passive','effect':{'type':'unsupported','reason':'SWSH12 Ability awaiting implementation'}})})
  trainer=V.trainer(row) if kind=='trainer' else None
  if kind=='trainer' and trainer is None:problems.append('Unimplemented Trainer effect')
  energy=V.energy(row) if kind=='energy' else None
  if kind=='energy' and 'Basic' not in subs and energy is None:problems.append('Unimplemented Special Energy rules')
  ok=not problems;gx='GX' in subs;tag='TAG TEAM' in subs;v='V' in subs or 'VMAX' in subs or 'VSTAR' in subs;vmax='VMAX' in subs
  c={'id':'swsh12-'+n,'setId':'swsh12','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,'rarity':rarity,
   'image':f'https://images.pokemontcg.io/swsh12/{n}.png','imageLarge':f'https://images.pokemontcg.io/swsh12/{n}_hires.png',
   'battleEnabled':ok,'deckEligible':ok,'support':{'status':'FULL' if ok else 'PARTIAL','reasons':problems},
   'tags':(['pokemon-gx'] if gx else [])+(['tag-team'] if tag else [])+(['pokemon-v'] if v else [])+(['pokemon-vmax'] if vmax else [])+(['pokemon-vstar'] if 'VSTAR' in subs else [])+(['ultra-beast'] if 'Ultra Beast' in subs else []),'ultraBeast':'Ultra Beast' in subs,'teamPlasma':False,'prismStar':prism,'maxDeckCopies':1 if prism else 4}
  if 'Radiant' in subs:c.update(radiant=True,maxDeckCopies=1);c['tags'].append('radiant')
  c.update(singleStrike='Single Strike' in subs,rapidStrike='Rapid Strike' in subs,fusionStrike='Fusion Strike' in subs)
  c['tags']+=(['single-strike'] if c['singleStrike'] else [])+(['rapid-strike'] if c['rapidStrike'] else [])+(['fusion-strike'] if c['fusionStrike'] else [])
  if kind=='pokemon':
   needed=list(dict.fromkeys(SYMBOL[s] for _,cost,_,_ in attacks for s in cost if s in SYMBOL and s != 'N'))
   printed=' '.join([a[3] for a in attacks]+[a[2] for a in abilities]).lower();roles=[]
   for phrase,role in [('draw','draw'),('search your deck','search'),('heal','heal'),('is now poisoned','status'),('is now paralyzed','status'),('is now confused','status'),('discard an energy from your opponent','control')]:
    if phrase in printed and role not in roles:roles.append(role)
   c.update(stage=next((s for s in subs if s in ('Basic','Stage 1','Stage 2','VMAX','VSTAR','BREAK','Restored')),'Basic'),hp=int(hp or 0),types=types or ['Colorless'],subtype=types[0] if types else 'Colorless',evolvesFrom=evolves,
    retreat=retreat,weakness=weak,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
    resistance=res,resistanceValue='-30' if res else None,resistances=[{'type':res,'value':'-30'}] if res else [],
    attacks=attack_objs,abilities=powers,ancientTrait=trait,prizeCards=3 if vmax else 2 if v else 1,tagTeam=False,pokemonGX=False,isPokemonGX=False,pokemonV=v,pokemonVMAX=vmax,pokemonVSTAR='VSTAR' in subs,ruleBox=v or 'Radiant' in subs,
    pokemonEX=False,pokemonEx=False,megaEvolution=False,breakEvolution=False,isLevelX=False,
    deckMeta={'roles':roles,'synergy':roles,'energyTypes':needed,'preferredEnergyTypes':needed,'conditionalAttackEnergyTypes':[],
     'preferredPartners':[evolves] if evolves else [],'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   if trainer and trainer[1].get('type')=='playFossil':c.update(hp=trainer[1]['hp'],stage='Basic',types=['Colorless'],subtype='Colorless',retreat=0,prizeCards=1)
   c.update(trainerType=trainer[0] if trainer else next((s for s in subs if s in ('Item','Supporter','Stadium','Pokémon Tool')),'Item'),
    attacks=attack_objs,text='\n'.join(rules),effect=trainer[1] if trainer else {'type':'unsupported'},aceSpec=False)
   
  elif kind=='energy' and 'Basic' in subs:
   c.update(basicEnergy=True,specialEnergy=False,energyType=name.removesuffix(' Energy'),subtype=name.removesuffix(' Energy'),effect={'type':'noop'},text='\n'.join(rules))
  else:
   c.update(basicEnergy=False,specialEnergy=True,energyType=next(iter((energy or {}).get('provides',{'Colorless':1}))),subtype=next(iter((energy or {}).get('provides',{'Colorless':1}))),effect=energy or {'type':'unsupported'},text='\n'.join(rules))
  cards.append(c)
 return cards

def gate_invalid_descriptors(cards):
 """Fail closed on unknown shapes before they reach the Android APK.

 Node's actual battle effect validator is authoritative. An invalid descriptor
 disables the entire print on both player and CPU paths, never converts it
 to a no-op or a misleading generic effect.
 """
 js="""const fs=require('fs'),fx=require('./app/src/main/assets/tcgp-battle-effects.js');
const cards=JSON.parse(fs.readFileSync(0,'utf8')),out={};
for(const c of cards){let errs=[];
 for(const a of c.attacks||[])if(a.effect?.type!=='unsupported')errs.push(...fx.validateEffect(a.effect).map(e=>a.name+': '+e));
 for(const a of c.abilities||[])if(a.effect?.type!=='unsupported')errs.push(...fx.validateEffect(a.effect).map(e=>a.name+': '+e));
 if(c.kind==='trainer'&&c.effect?.type!=='unsupported')errs.push(...fx.validateEffect(c.effect));
 if(c.kind==='energy'&&!c.basicEnergy&&c.effect?.type!=='unsupported')errs.push(...fx.validateEffect(c.effect));
 if(errs.length)out[c.id]=errs;
}
process.stdout.write(JSON.stringify(out));"""
 result=subprocess.run(['node','-e',js],input=json.dumps(cards),text=True,capture_output=True,cwd=ROOT)
 if result.returncode:raise RuntimeError('SWSH12 effect validation failed: '+result.stderr[-1200:])
 errors=json.loads(result.stdout)
 for c in cards:
  if c['id'] in errors:
   c['support']['reasons'].extend('Invalid effect: '+x for x in errors[c['id']]);c['support']['status']='PARTIAL'
   c['battleEnabled']=c['deckEligible']=False
 return cards

def main():
 global V
 import swsh12_verified as V
 parser=argparse.ArgumentParser();parser.add_argument('--prepare',action='store_true');args=parser.parse_args()
 if args.prepare:prepare()
 rows=get_source();cards=gate_invalid_descriptors(generate(rows))
 hdr="""/* SWSH12 Silver Tempest verified main-set prints. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGSWSH12=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'swsh12',name:'Silver Tempest',series:'Sword & Shield',releaseDate:'2022-11-11',cardCount:195,printedTotal:215});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,printed:215,imported:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
"""
 OUT.write_text(hdr.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
 report={'printed':len(cards),'canonicalTotal':215,'notImported':[f'swsh12-{n}' for n in range(1,216) if str(n) not in {r[0] for r in rows}],'battleReady':sum(c['battleEnabled'] for c in cards),'gated':{c['id']:c['support']['reasons'] for c in cards if not c['battleEnabled']},'attacks':sum(len(r[7]) for r in rows),'abilities':sum(len(r[8]) for r in rows),'sourceGitBlob':PIN}
 COVER.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(f'Silver Tempest: {report["battleReady"]}/215 playable; {len(report["gated"])} gated; {len(report["notImported"])} not yet imported')
if __name__=='__main__':main()
