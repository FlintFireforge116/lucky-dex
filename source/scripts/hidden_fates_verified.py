"""Hidden Fates exact signature overrides and verified Sun & Moon reuse."""
from copy import deepcopy
import json
from pathlib import Path
import sm11_verified as V
from sm7_verified import E,seq,coin,status,bonus,cond,passive,activated
ROOT=Path(__file__).resolve().parents[1]
ROWS=json.loads((ROOT/'data/classic/sm115-print-compact.json').read_text())
A={};B={};T={}
def at(no,title,effect):
 r=next(r for r in ROWS if r[0]==str(no));a=next(a for a in r[7] if a[0]==title);A[(title,tuple(a[1]),a[2],a[3])]=effect
def tr(no,kind,effect):
 r=next(r for r in ROWS if r[0]==str(no));T[(r[1],tuple(r[13]))]=(kind,effect)
def attack(row,a):return deepcopy(A.get((a[0],tuple(a[1]),a[2],a[3]))) or V.attack(row,a)
def ability(row,a):return deepcopy(B.get(tuple(a))) or V.ability(row,a)
def trainer(row):return deepcopy(T.get((row[1],tuple(row[13])))) or V.trainer(row)
def energy(row):return None
def prism_ready(row):return False
at(14,'Hydro Pump-GX',E('energyDamage',source='self',energyType='Water',countProvidedType=True,amount=40,mode='add'))
at(22,'Electroblast',E('coinDamage',coins=2,amount=30,mode='add'))
at(36,'Rocky Avalanche-GX',E('modifier',stat='damageReduction',scope='self',amount=100,duration='opponentTurn'))
at(42,'Rolling Rush',E('coinDamage',coins='untilTails',amount=30,mode='add'))
at(47,'Parental Fury',E('coinDamage',coins='untilTails',amount=40,mode='replace'))
# New print mechanics with previously exercised descriptors.
at(14,'Star Stream',E('chooseTarget',target='selfPokemon',effect=E('attachEnergyFromDiscard',target='selfPokemon',energyType='Water',amount=2)))
at(23,'Thunderbolt',E('discardEnergyCard',target='self',amount='all'))
at(31,'Psycrush-GX',E('discardEnergyCard',target='opponentActive',amount='all'))
at(34,'Mudslide',seq(E('discardEnergyCard',target='self',energyType='Fighting',strictEnergyType=True,amount=2),E('selectedDamage',target='opponentPokemon',amount=80)))
at(38,'Lead',coin(E('searchChosen',amount=1,filter={'kind':'trainer','trainerType':'Supporter'})))
at(43,'Happy Mime',seq(E('draw',amount=1),E('draw',side='opponent',amount=1)))
at(48,'Spin Tackle',E('coinFlip',tails=E('selfDamage',amount=10)))
# Exact full reprint comparison, including stats, costs, text, rules, and traits.
# Reuse the earlier generated complete effect (not a name-only match). Read only
# prior individual modules, avoiding a circular dependency on the central catalogue.
import subprocess,re
from functools import lru_cache
@lru_cache(maxsize=1)
def reprints():
 assets=ROOT/'app/src/main/assets'; data=assets/'tcg-classic-battle-data.js'
 modules=dict(re.findall(r"const (sm(?:[1-9]|75|10|11))=.*?require\('\./([^']+)'\)",data.read_text()))
 rows={}
 def key(r):return json.dumps(r[1:12]+r[13:],ensure_ascii=False,separators=(',',':'))
 for sid,mod in modules.items():
  for r in json.loads((ROOT/f'data/classic/{sid}-print-compact.json').read_text()):
   if len(r)==16:rows.setdefault(key(r),[]).append(sid+'-'+str(r[0]))
 js="const fs=require('fs');const m=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(JSON.stringify(Object.values(m).flatMap(p=>require(p).CARDS).filter(c=>c.battleEnabled&&c.deckEligible!==false)));"
 cp=subprocess.run(['node','-e',js],input=json.dumps({sid:str(assets/mod) for sid,mod in modules.items()}),text=True,capture_output=True,check=True,cwd=ROOT)
 cards={c['id']:c for c in json.loads(cp.stdout)}
 result={}
 for r in json.loads((ROOT/'data/classic/sma-print-compact.json').read_text()):
  for cid in rows.get(key(r),[]):
   c=cards.get(cid)
   if not c:continue
   if [[a['name'],a['cost'],a.get('damageText') or '',a.get('text','')] for a in c.get('attacks',[])]!=r[7]:continue
   if [[a['name'],a.get('text','')] for a in c.get('abilities',[])]!=[[a[0],a[2]] for a in r[8]]:continue
   if r[2]=='Trainer' and c.get('text')!='\n'.join(r[13]):continue
   result[r[0]]=c;break
 return result
_oldattack=attack;_oldability=ability;_oldtrainer=trainer
# Reprints use the source's complete earlier mechanics, including bespoke handlers.
def attack(row,a):
 c=reprints().get(row[0]) if str(row[0]).startswith('SV') else None
 if c:return deepcopy(next(x['effect'] for x in c['attacks'] if x['name']==a[0]))
 if row[0]=='SV59':
  if a[0]=='Full Burst':return E('energyDamage',source='self',amount=30,mode='replace')
  if a[0]=='Psystrike-GX':return E('damageRule',ignoreEffects=True)
 return _oldattack(row,a)
def ability(row,a):
 if row[0]=="SV20":return passive(E("sm7Rule",rule="sm115Roadblock"))
 c=reprints().get(row[0]) if str(row[0]).startswith('SV') else None
 if c:return {k:deepcopy(v) for k,v in next(x for x in c['abilities'] if x['name']==a[0]).items() if k not in ('name','text','printedPowerType','disabledByStatus')}
 return _oldability(row,a)
def trainer(row):
 c=reprints().get(row[0]) if str(row[0]).startswith('SV') else None
 if c:return c['trainerType'],deepcopy(c['effect'])
 return _oldtrainer(row)

# Shared existing descriptors plus explicit printed-rule handlers.
def rule(name,**kw):return E('sm7Rule',rule='sm115'+name,**kw)
def ab(no,name,descriptor):
 r=next(r for r in ROWS if r[0]==str(no));B[tuple(next(a for a in r[8] if a[0]==name))]=descriptor
ab(23,'Electromagnetic Wall',passive(rule('Wall')))
ab(27,'Last Pattern',dict(type='triggered',event='knockedOutByAttack',opponentAttackOnly=True,effect=rule('LastPattern')))
ab(29,'Surrender Now',passive(rule('Surrender')))
at(24,'Hurricane Call',rule('Hurricane'))
at(27,'Rocket Tail',bonus(80,cond('discardContains',filter={'name':'Jessie & James'})))
at(44,'Sky Legends-GX',seq(E('multiTargetDamage',target='opponentPokemon',amount=110,count=3,activeWeaknessResistance=True,condition=cond('sm9ExtraEnergy',cost='CRWL')),E('shuffleIntoDeck',target='self')))
tr(54,'Stadium',E('modifier',stat='damageReduction',scope='both',duration='whileInPlay',amount=40,filter={'name':'Onix-GX'}))
tr(58,'Supporter',rule('JessieJames'))
tr(61,'Stadium',E('modifier',stat='attackDamage',scope='both',duration='whileInPlay',amount=40,filter={'name':'Starmie-GX'}))
tr(62,'Supporter',rule('Determination'))
tr(63,'Supporter',rule('WaterCommand'))
tr(64,'Supporter',rule('CenterLady'))
tr(55,'Supporter',rule('BrockTraining'))
_prior_attack=attack
def attack(row,a):
 if row[0]=='SV50' and a[0]=='Eternal Light-GX':return rule('EternalLight')
 return _prior_attack(row,a)
