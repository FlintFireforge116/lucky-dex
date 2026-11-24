#!/usr/bin/env python3
"""Pinned Sword & Shield—Sword & Shield generator; conservatively gate unknown mechanics.

Prepare on a networked Termux/PC once: python3 scripts/build-swsh1.py --prepare
After this, the canonical compact file is bundled and all CI/Gradle builds are
fully offline. A source file with the wrong verified counts is rejected.
"""
from __future__ import annotations
import argparse,hashlib,json,re,sys,subprocess
from pathlib import Path
from pinned_tcg_source import load_pinned_set
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/swsh1-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-sword-shield.js'
COVER=ROOT/'docs/SWSH1_BUILD_COVERAGE.json'
ATTEST=ROOT/'docs/SWSH1_CANONICAL_SOURCE.json'
PIN='c43bc9ff9daa80e41bcd8952080b79825e8caa8f'
COMPACT_SHA='b2f399a2272e27e0910b2d424bc00cea3b02360ffdd0a874455ff64150c5cce5'
SYMBOL={'G':'Grass','R':'Fire','W':'Water','L':'Lightning','P':'Psychic','F':'Fighting','D':'Darkness','M':'Metal','Y':'Fairy'}
REVERSE={v:k for k,v in SYMBOL.items()}
VARIANTS=[]
def validate(rows):
 assert [str(r[0]) for r in rows]==[str(n) for n in range(1,217)]
 assert sum(len(r[7]) for r in rows)==277
 assert sum(len(r[8]) for r in rows)==25
 assert sum(r[2]=='Trainer' for r in rows)==42
 assert sum(r[2]=='Energy' for r in rows)==1
 assert sum('V' in r[3] for r in rows)==31
 assert sum('VMAX' in r[3] for r in rows)==8
 return rows

def prepare():
 try:
  raw=load_pinned_set('swsh1',PIN,timeout=75)
 except OSError as exc:
  raise RuntimeError(f'Cannot fetch canonical SWSH1 cards. Check Termux Internet access before git push: {exc}') from exc
 rows=[[c.get('number'),c.get('name'),c.get('supertype'),c.get('subtypes',[]),c.get('hp'),c.get('types',[]),c.get('evolvesFrom'),
   [[a['name'],[REVERSE.get(en,'C') for en in a.get('cost',[])],a.get('damage',''),a.get('text','')] for a in c.get('attacks',[])],
   [[a['name'],a.get('type','Ability'),a.get('text','')] for a in c.get('abilities',[])],
   c.get('weaknesses',[{}])[0].get('type') if c.get('weaknesses') else None,
   c.get('resistances',[{}])[0].get('type') if c.get('resistances') else None,
   c.get('convertedRetreatCost',0),c.get('rarity',''),c.get('rules',[]),c.get('trainerType'),c.get('ancientTrait')]
   for c in raw]
 validate(rows);SRC.parent.mkdir(parents=True,exist_ok=True)
 SRC.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 digest=hashlib.sha256(SRC.read_bytes()).hexdigest()
 ATTEST.write_text(json.dumps({'set':'swsh1','sourceGitBlob':PIN,'compactSha256':digest,'printedTotal':216},indent=2)+'\n')
 return rows

def get_source():
 if not SRC.is_file():raise RuntimeError('SWSH1 print source missing. Run: python3 scripts/build-swsh1.py --prepare (requires Internet).')
 rows=validate(json.loads(SRC.read_text()))
 if not ATTEST.is_file():raise RuntimeError('SWSH1 source attestation missing; run --prepare to pin it')
 manifest=json.loads(ATTEST.read_text())
 actual=hashlib.sha256(SRC.read_bytes()).hexdigest()
 if actual!=COMPACT_SHA or manifest.get('compactSha256')!=actual or manifest.get('sourceGitBlob')!=PIN:raise RuntimeError('SWSH1 canonical catalogue checksum mismatch')
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
   attack_objs.append({'name':title,'cost':cost,'damage':base,'damageText':damage or None,'text':printed,'gxAttack':title.endswith('-GX'),
    'effect':eff if eff is not None else {'type':'unsupported','reason':'SWSH1 attack mechanic awaiting implementation'}})
  for a in abilities:
   power=V.ability(row,a)
   if power is None:problems.append('Unimplemented Ability: '+a[0])
   powers.append({'name':a[0],'text':a[2],'printedPowerType':'ability','disabledByStatus':False,
    **(power if power is not None else {'type':'passive','effect':{'type':'unsupported','reason':'SWSH1 Ability awaiting implementation'}})})
  trainer=V.trainer(row) if kind=='trainer' else None
  if kind=='trainer' and trainer is None:problems.append('Unimplemented Trainer effect')
  energy=V.energy(row) if kind=='energy' else None
  if kind=='energy' and energy is None:problems.append('Unimplemented Special Energy rules')
  ok=not problems;gx='GX' in subs;tag='TAG TEAM' in subs;v='V' in subs or 'VMAX' in subs;vmax='VMAX' in subs
  c={'id':'swsh1-'+n,'setId':'swsh1','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,'rarity':rarity,
   'image':f'https://images.pokemontcg.io/swsh1/{n}.png','imageLarge':f'https://images.pokemontcg.io/swsh1/{n}_hires.png',
   'battleEnabled':ok,'deckEligible':ok,'support':{'status':'FULL' if ok else 'PARTIAL','reasons':problems},
   'tags':(['pokemon-gx'] if gx else [])+(['tag-team'] if tag else [])+(['pokemon-v'] if v else [])+(['pokemon-vmax'] if vmax else [])+(['ultra-beast'] if 'Ultra Beast' in subs else []),'ultraBeast':'Ultra Beast' in subs,'teamPlasma':False,'prismStar':prism,'maxDeckCopies':1 if prism else 4}
  if kind=='pokemon':
   needed=list(dict.fromkeys(SYMBOL[s] for _,cost,_,_ in attacks for s in cost if s in SYMBOL))
   printed=' '.join([a[3] for a in attacks]+[a[2] for a in abilities]).lower();roles=[]
   for phrase,role in [('draw','draw'),('search your deck','search'),('heal','heal'),('is now poisoned','status'),('is now paralyzed','status'),('is now confused','status'),('discard an energy from your opponent','control')]:
    if phrase in printed and role not in roles:roles.append(role)
   c.update(stage=next((s for s in subs if s in ('Basic','Stage 1','Stage 2','VMAX','BREAK','Restored')),'Basic'),hp=int(hp or 0),types=types or ['Colorless'],subtype=types[0] if types else 'Colorless',evolvesFrom=evolves,
    retreat=retreat,weakness=weak,weaknessValue='×2' if weak else None,weaknesses=[{'type':weak,'value':'×2'}] if weak else [],
    resistance=res,resistanceValue='-30' if res else None,resistances=[{'type':res,'value':'-30'}] if res else [],
    attacks=attack_objs,abilities=powers,ancientTrait=trait,prizeCards=3 if vmax else 2 if v else 1,tagTeam=False,pokemonGX=False,isPokemonGX=False,pokemonV=v,pokemonVMAX=vmax,ruleBox=v,
    pokemonEX=False,pokemonEx=False,megaEvolution=False,breakEvolution=False,isLevelX=False,
    deckMeta={'roles':roles,'synergy':roles,'energyTypes':needed,'preferredEnergyTypes':needed,'conditionalAttackEnergyTypes':[],
     'preferredPartners':[evolves] if evolves else [],'inflicts':[],'payoffs':[]})
  elif kind=='trainer':
   c.update(trainerType=trainer[0] if trainer else next((s for s in subs if s in ('Item','Supporter','Stadium','Pokémon Tool')),'Item'),
    attacks=attack_objs,text='\n'.join(rules),effect=trainer[1] if trainer else {'type':'unsupported'},aceSpec=False)
   
  else:
   c.update(basicEnergy=False,specialEnergy=True,energyType='Colorless',subtype='Colorless',effect=energy or {'type':'unsupported'},text='\n'.join(rules))
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
 if result.returncode:raise RuntimeError('SWSH1 effect validation failed: '+result.stderr[-1200:])
 errors=json.loads(result.stdout)
 for c in cards:
  if c['id'] in errors:
   c['support']['reasons'].extend('Invalid effect: '+x for x in errors[c['id']]);c['support']['status']='PARTIAL'
   c['battleEnabled']=c['deckEligible']=False
 return cards

def main():
 global V
 p=argparse.ArgumentParser();p.add_argument('--prepare',action='store_true',help='Download and SHA-pin verified source once on Termux/PC');args=p.parse_args()
 if args.prepare:prepare()
 rows=get_source();import swsh1_verified as V
 cards=gate_invalid_descriptors(generate(rows))
 # VMAX can only enter play with its actual V parent; do not advertise an
 # otherwise supported VMAX as playable while all of its V prints are gated.
 ready_v={c['name'] for c in cards if c.get('pokemonV') and not c.get('pokemonVMAX') and c['battleEnabled']}
 for c in cards:
  if c.get('pokemonVMAX') and c['battleEnabled'] and c['evolvesFrom'] not in ready_v:
   c['battleEnabled']=c['deckEligible']=False
   c['support']={'status':'PARTIAL','reasons':['Required Pokémon V evolution parent is not yet enabled']}
 hdr='''/* SWSH1 Sword & Shield 216 pinned official prints; unsupported mechanics gated. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGSWSH1=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'swsh1',name:'Sword & Shield',series:'Sword & Shield',releaseDate:'2020-02-07',cardCount:202,printedTotal:216});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,printed:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''
 OUT.write_text(hdr.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
 report={'printed':len(cards),'battleReady':sum(c['battleEnabled'] for c in cards),'gated':{c['id']:c['support']['reasons'] for c in cards if not c['battleEnabled']},
  'attacks':sum(len(r[7]) for r in rows),'abilities':sum(len(r[8]) for r in rows),
  'pokemonV':sum('V' in r[3] for r in rows),'pokemonVMAX':sum('VMAX' in r[3] for r in rows),'pokemonGX':sum('GX' in r[3] for r in rows),'gxAttackPrints':sum(a[0].endswith('-GX') for r in rows for a in r[7]),
  'energyPrints':sum(r[2]=='Energy' for r in rows),'prismStarPrints':sum('Prism Star' in r[3] for r in rows),'sourceGitBlob':PIN}
 COVER.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print(f'Sword & Shield SWSH1: {report["battleReady"]}/216 playable; {len(report["gated"])} explicitly gated; 277 attacks, 25 Abilities')
if __name__=='__main__':
 try:main()
 except (AssertionError,RuntimeError) as e:print('SWSH1 BUILD FAILED:',str(e),file=sys.stderr);sys.exit(1)
