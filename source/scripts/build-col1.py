#!/usr/bin/env python3
"""Call of Legends source-pinned generator: 95 main + 11 SL prints.

The 106-print verified transcription is bundled as 14-field compact rows;
APK builds are offline and validate the embedded source hash.
"""
import hashlib,json,re,sys
from pathlib import Path
import col1_verified as V
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'data/classic/col1-print-compact.json'
OUT=ROOT/'app/src/main/assets/tcg-classic-call-of-legends.js'
PIN='ca9e2d472331f0e92ac82d8f91197e5e0c2a654601a4a4dc9b69df4522fe3640'  # sha256 of source-pinned 106 compact prints
LETTERS={'Grass':'G','Fire':'R','Water':'W','Lightning':'L','Psychic':'P','Fighting':'F','Darkness':'D','Metal':'M','Colorless':'C'}

# Exact source-identity match only. Reuse previous verified mechanics when the
# same Pokémon has the same move text, Energy cost, and damage, and the older
# engine handler acts on the current game board rather than printed card IDs.
def load_legacy():
 legacy=[]
 for stem in ['heartgold-soulsilver','unleashed','undaunted','triumphant']:
  filename=ROOT/'app/src/main/assets'/('tcg-classic-'+stem+'.js')
  if not filename.exists():continue
  js=filename.read_text()
  m=re.search(r'const CARDS=Object\.freeze\((\[.*?\])\.map\(c=>Object\.freeze\(c\)\)\)',js,re.S)
  if m:
   legacy+=json.loads(m[1])
 return legacy

def generate():
 if not SRC.exists():raise SystemExit('Missing bundled Call of Legends print source')
 blob=SRC.read_bytes()
 actual=hashlib.sha256(blob).hexdigest()
 if actual!=PIN:raise SystemExit(f'Call of Legends source changed: expected {PIN}, found {actual}; refusing unverified print')
 rows=json.loads(blob)
 expected={str(n) for n in range(1,96)}|{'SL'+str(n) for n in range(1,12)}
 if len(rows)!=106 or {str(r[0]) for r in rows}!=expected or any(len(r)!=14 for r in rows):raise SystemExit('Call of Legends must contain 95 numbered plus 11 SL cards exactly')
 legacy=load_legacy(); cards=[]; mapped=0
 for raw in rows:
  srcrow=raw
  n,name,sup,subtypes=raw[:4];n=str(n);kind={'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[sup]
  number,_,_,_,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules=srcrow
  reasons=[];converted=[];powers=[]
  for title,cost,damage,text in attacks:
   mapped_effect=V.attack(srcrow,[title,cost,damage,text])
   if mapped_effect is None:
    for old in legacy:
     if old.get('name')!=name or old.get('kind')!='pokemon':continue
     found=next((a for a in old.get('attacks',[]) if a['name']==title and a.get('text','')==text and a.get('cost')==''.join(LETTERS[x] for x in cost) and (a.get('damageText') or '')==damage),None)
     if found and old.get('battleEnabled') and found.get('effect') and found['effect']['type'] not in ('unsupported','partial'):
      mapped_effect=found['effect'];break
   if mapped_effect is None:reasons.append('Unverified printed attack: '+title)
   else:mapped+=1
   dm=re.search(r'\d+',damage or '');amount=int(dm[0]) if dm else 0
   if re.fullmatch(r'\s*\d+\s*[×x]\s*',damage or ''):amount=0
   if mapped_effect and mapped_effect.get('type') in ('selectedDamage','multiTargetDamage','coinDamage','topDeckCountDamage') and not (damage or '').strip().isdigit():amount=0
   converted.append({'name':title,'cost':''.join(LETTERS[t] for t in cost),'damage':amount,'damageText':damage or None,'text':text,'effect':mapped_effect or {'type':'unsupported','reason':'Printed attack awaits mechanic'}})
  for pname,ptype,ptext in abilities:
   mapping=V.ability(srcrow,[pname,ptype,ptext])
   if mapping is None:
    for old in legacy:
     if old.get('name')!=name or old.get('kind')!='pokemon':continue
     matching=next((p for p in old.get('abilities',[]) if p['name']==pname and p.get('text')==ptext),None)
     if matching and old.get('battleEnabled') and matching.get('effect'):
      mapping={k:matching[k] for k in ('type','event','oncePerTurn','activeOnly','benchOnly','fromHandOnly','effect') if k in matching};break
   if mapping is None:reasons.append('Unverified '+ptype+': '+pname);mapping={'effect':{'type':'unsupported','reason':'Printed Power awaits mechanic'}}
   powers.append({'name':pname,'text':ptext,'type':'activated' if ptype=='Poké-Power' else 'passive',
                  'printedPowerType':'power' if ptype=='Poké-Power' else 'body','disabledByStatus':ptype=='Poké-Power',**mapping})
  trainer=V.TRAINERS.get(n) if kind=='trainer' else None
  if kind=='trainer' and not trainer:reasons.append('Unverified printed Trainer effect')
  if kind=='energy' and n in ('86','87'):
   # HGSS classic battle rules provide the existing special Darkness/Metal effects.
   energy_type='Darkness' if n=='86' else 'Metal'
  elif kind=='energy':energy_type=name.removesuffix(' Energy')
  enabled=not reasons
  card={'id':'col1-'+n,'setId':'col1','number':n,'name':name,'source':'tcg','battleFormat':'classic','kind':kind,
    'rarity':rarity,'image':f'https://images.pokemontcg.io/col1/{n}.png','imageLarge':f'https://images.pokemontcg.io/col1/{n}_hires.png',
    'battleEnabled':enabled,'deckEligible':enabled and not (kind=='energy' and n in {str(i) for i in range(88,96)}),'support':{'status':'FULL' if enabled else 'PARTIAL','reasons':reasons}}
  if kind=='pokemon':
   stage=subtypes[0] if subtypes else 'Basic';need=list(dict.fromkeys(t for a in attacks for t in a[1] if t!='Colorless'))
   roles=[];terms=' '.join([a[3] for a in attacks]+[p[2] for p in abilities]).lower()
   for role,keywords in [('draw',['draw ','hand into']),('search',['search your deck']),('ramp',['attach',' energy']),('heal',['remove ','damage counters']),('status',['poisoned','burned','asleep','paralyzed','confused']),('control',['can\'t retreat','lost zone','discard'])]:
    if any(word in terms for word in keywords):roles.append(role)
   card.update(stage=stage,hp=int(hp),types=types or ['Colorless'],subtype=(types or ['Colorless'])[0],evolvesFrom=evolves or None,
    retreat=retreat,weakness=weak[0].get('type') if weak else None,weaknessValue=weak[0].get('value') if weak else None,
    weaknesses=weak,resistance=res[0].get('type') if res else None,resistanceValue=res[0].get('value') if res else None,resistances=res,
    attacks=converted,abilities=powers,tags=['shiny-legendary'] if n.startswith('SL') else [],isPokemonSP=False,isLevelX=False,
    deckMeta={'roles':roles,'synergy':roles,'energyTypes':need,'preferredEnergyTypes':need,'preferredPartners':[evolves] if evolves else [],'inflicts':[],'payoffs':[]})
  elif kind=='trainer':card.update(trainerType=trainer[0] if trainer else subtypes[0] if subtypes else 'Item',text='\n'.join(rules),effect=trainer[1] if trainer else {'type':'unsupported','reason':'Unimplemented printed effect'})
  else:
   basic=n in {str(i) for i in range(88,96)}
   card.update(specialEnergy=not basic,basicEnergy=basic,energyType=energy_type,subtype=energy_type,text='\n'.join(rules))
   if not basic:card['effect']={'type':'specialEnergy','provides':{energy_type:1}}
  cards.append(card)
 cards.sort(key=lambda c:int(c['number']) if c['number'].isdigit() else 95+int(c['number'][2:]))
 return cards,mapped

def main():
 cards,mapped=generate()
 template='''/* Pokémon TCG Call of Legends: 95 numbered prints + 11 SL secret rares. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGCOL1=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'col1',name:'Call of Legends',series:'Call of Legends',releaseDate:'2011-02-09',cardCount:95,printedTotal:106});
const CARDS=Object.freeze(__CARDS__.map(c=>Object.freeze(c)));
const INDEX=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>INDEX.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
'''
 OUT.write_text(template.replace('__CARDS__',json.dumps(cards,ensure_ascii=False,separators=(',',':'))),encoding='utf-8')
 summary={'printed':len(cards),'enabled':sum(c['battleEnabled'] for c in cards),'gated':sum(not c['battleEnabled'] for c in cards),'mappedAttacks':mapped,'gatedPrints':[{'id':c['id'],'name':c['name'],'reasons':c['support']['reasons']} for c in cards if not c['battleEnabled']]}
 (ROOT/'docs/COL1_BUILD_COVERAGE.json').write_text(json.dumps(summary,indent=2)+'\n')
 print('COL1 Call of Legends:',summary['enabled'],'of',len(cards),'battle ready;',summary['gated'],'gated;',mapped,'attack effects mapped')
if __name__=='__main__':main()
