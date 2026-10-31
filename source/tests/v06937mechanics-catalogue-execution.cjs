'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../app/src/main/assets/tcgp-battle-data.js'),C=require('../app/src/main/assets/tcgp-battle-core.js'),E=require('../app/src/main/assets/tcgp-battle-effects.js');
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const fullCards=()=>D.CARDS.filter(c=>c.battleEnabled&&!c.loaner);
const abilitiesFor=c=>c.abilities?.length?c.abilities:[c.ability].filter(Boolean);
function matches(c,filter={}){return c&&Object.entries(filter).every(([key,value])=>{
 const one=v=>key==='subtype'?D.hasType(c,v):key==='evolved'?['Stage 1','Stage 2'].includes(c.stage)===v:key==='hasAbility'?!!abilitiesFor(c).length===v:key==='isEx'?(c.points>=2)===v:key==='damaged'?true:c[key]===v;
 return Array.isArray(value)?value.some(one):one(value);
});}
function pick(filter={},flat=false){const candidates=fullCards().filter(c=>c.kind==='pokemon'&&matches(c,filter));const preferred=c=>!abilitiesFor(c).some(a=>a.type==='passive')&&(!flat||c.attacks[0]?.damage>0&&!c.attacks[0].effect);const found=candidates.find(c=>c.stage==='Basic'&&preferred(c))||candidates.find(preferred);assert.ok(found,'No actual FULL fixture Pokémon for '+JSON.stringify(filter));return found;}
function slot(id,uid,benchSlot=null){const c=D.cardById(id);return {...C.makePokemonSlot(id,0,uid),benchSlot,damage:Math.min(20,c.hp-1),energy:Object.fromEntries(TYPES.map(type=>[type,10]))};}
function setSlot(ss,zone,card,uid){const value=slot(card.id,uid,zone==='active'?null:zone);if(zone==='active')ss.active=value;else ss.bench[zone]=value;return value;}
function fixture(card,effect,ability){
 const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:927,firstSide:'player'});b.phase='battle';b.turnNumber=5;b.activeSide='player';
 for(const [side,ss]of Object.entries(b.sides)){ss.turnCount=3;ss.hand=[];ss.abilityUsed={};ss.active=slot('A1-001',side+'-active');ss.bench=[0,1,2].map(i=>slot('A1-014',side+'-bench-'+i,i));ss.energyAvailable=true;ss.energyUsed=false;ss.supporterUsed=false;ss.stadiumUsed=false;}
 const p=b.sides.player,o=b.sides.opponent,unavailablePositivePreconditions=[];let source=card.kind==='pokemon'||card.effect?.type==='playFossil'?slot(card.id,'subject'):p.active;
 if(card.kind==='pokemon'||card.effect?.type==='playFossil')p.active=source;
 if(ability?.benchOnly){p.active=slot('A1-001','other-active');source.benchSlot=0;p.bench[0]=source;}
 const tool=fullCards().find(c=>c.kind==='trainer'&&c.trainerType==='Tool');
 function prerequisite(filter,role){
  if(fullCards().some(c=>c.kind==='pokemon'&&matches(c,filter)))return pick(filter);
  // A fully compiled conditional card can currently name a prerequisite whose
  // own rules remain PARTIAL. Never insert that disabled card into a legal
  // fixture: execute the available negative branch and disclose the missing
  // positive branch in the report, including every blocking identity.
  const blockers=D.CARDS.filter(c=>c.kind==='pokemon'&&!c.loaner&&matches(c,filter));assert.ok(filter?.name&&blockers.length,'Unresolvable fixture filter '+JSON.stringify(filter));
  unavailablePositivePreconditions.push({role,filter,reason:'All matching printed identities are battle-disabled; only the legal negative/no-beneficiary branch can execute.',blockingIdentities:blockers.map(c=>({cardId:c.id,name:c.name,status:c.support.status,reasons:c.support.reasons}))});return null;
 }
 function condition(c){if(!c)return;switch(c.type){
  case 'selfDamaged':source.damage=Math.min(20,D.cardById(source.cardId).hp-1);break;
  case 'selfUndamaged':source.damage=0;break;
  case 'opponentDamaged':o.active.damage=20;break;
  case 'selfStatus':source.conditions={[c.status||'poison']:{amount:10}};break;
  case 'opponentStatus':o.active.conditions={[c.status||'poison']:{amount:10}};break;
  case 'selfHasTool':assert.ok(tool);source.tool={uid:'source-tool',cardId:tool.id};break;
  case 'opponentHasTool':assert.ok(tool);o.active.tool={uid:'foe-tool',cardId:tool.id};break;
  case 'opponentEx':setSlot(o,'active',pick({isEx:true},true),'ex-target');break;
  case 'opponentMatches':setSlot(o,'active',pick(c.filter,true),'matching-foe');break;
  case 'pokemonPresent':{const dependency=prerequisite(c.filter,'condition');if(dependency)setSlot(p,1,dependency,'condition-pokemon');break;}
  case 'supporterPlayed':p.supporterUsed=true;break;
  case 'stadiumInPlay':{const stadium=fullCards().find(c=>c.kind==='trainer'&&c.trainerType==='Stadium');assert.ok(stadium);b.stadium={cardId:stadium.id,ownerSide:'player'};break;}
  case 'selfExtraEnergyAtLeast':case 'selfEnergyAtLeast':case 'opponentEnergyAtLeast':case 'benchAtLeast':break; // Actual attached units / three Bench Pokémon already satisfy these.
  default:assert.fail('Unprepared condition '+c.type);
 }}
 function visit(e){if(!e)return;condition(e.condition);
  if(e.opponentFilter)setSlot(o,'active',pick(e.opponentFilter,true),'filtered-foe');
  if(e.type==='modifier'&&e.filter&&Object.keys(e.filter).length){const beneficiary=e.scope==='team'||e.scope==='active'?p.active:source;if(!matches(D.cardById(beneficiary.cardId),e.filter)){if(ability&&beneficiary===source&&(!e.scope||e.scope==='self'))assert.fail('Passive source does not match its printed beneficiary filter');const dependency=prerequisite(e.filter,'modifier beneficiary');if(dependency)setSlot(p,'active',dependency,'modifier-beneficiary');}}
  if(e.filter&&['selfBench','selfPokemon','selfAll','selfBenchAll','opponentBench','opponentPokemon'].includes(e.target)){setSlot(e.target.startsWith('opponent')?o:p,2,pick(e.filter),'selected-target');}
  if(e.target==='selfActive'&&e.filter&&!matches(D.cardById(p.active.cardId),e.filter)){assert.ok(!ability?.activeOnly,'Active-only source must satisfy its own typed target');setSlot(p,'active',pick(e.filter),'typed-active');if(ability&&source===p.active)assert.fail('Ability source unexpectedly replaced');if(ability&&source.benchSlot==null){source.benchSlot=0;p.bench[0]=source;}}
  if(e.type==='switch'&&e.filter)setSlot(e.side==='opponent'?o:p,2,pick(e.filter),'switch-target');
  if(e.type==='moveEnergy'&&e.source==='selfBench')setSlot(p,2,pick(e.sourceFilter),'energy-source');
  if(e.type==='benchCountDamage'&&e.filter)setSlot(e.side==='opponent'?o:p,2,pick(e.filter),'counted-bench');
  if(e.type==='search'||e.type==='searchRandomBasic'){const filter=e.type==='searchRandomBasic'?{kind:'pokemon',stage:'Basic'}:e.filter,found=fullCards().find(c=>matches(c,filter));assert.ok(found,'Actual FULL card for zone search '+JSON.stringify(filter));const refs=Array.from({length:Math.max(1,e.amount)},(_,i)=>({uid:'search-ref-'+i,cardId:found.id}));p[e.source||'deck'].unshift(...refs);}
  if(e.type==='removeStatus')p.active.conditions={poison:{amount:10}};
  if(e.type==='playFossil')p.bench=[];
  if(Array.isArray(e.effects))e.effects.forEach(visit);visit(e.heads);visit(e.tails);visit(e.effect);
 }
 visit(effect);if(card.kind==='trainer'&&!ability)p.hand=[{uid:'trainer',cardId:card.id}];return {b,source,unavailablePositivePreconditions};
}
function sane(b){assert.ok(Number.isFinite(b.turnNumber));for(const ss of Object.values(b.sides)){assert.ok(ss.points>=0);assert.ok(ss.bench.length<=3);assert.ok(ss.hand.length<=10);const physical=new Set();for(const s of ss.bench){assert.ok(Number.isInteger(s.benchSlot)&&s.benchSlot>=0&&s.benchSlot<3);assert.ok(!physical.has(s.benchSlot));physical.add(s.benchSlot);}for(const s of [ss.active,...ss.bench].filter(Boolean)){assert.ok(Number.isFinite(s.damage)&&s.damage>=0);for(const n of Object.values(s.energy||{}))assert.ok(Number.isInteger(n)&&n>=0);}}}
function perform(b,side,predicate,label){const action=C.legalActions(b,side).find(predicate);assert.ok(action,label+' has an actual legal action');C.applyAction(b,side,action);sane(b);return action;}
function exerciseAbility(card,ability,index){
 const {b,source,unavailablePositivePreconditions}=fixture(card,ability.effect,ability),p=b.sides.player,o=b.sides.opponent;
 if(ability.type==='activated'){perform(b,'player',a=>a.type==='ability'&&a.cardId===card.id&&Number(a.abilityIndex||0)===index&&(source===p.active?a.target==='active':a.target==='bench'&&a.benchIndex===source.benchSlot),card.id+' activated ability');assert.ok(b.log.some(x=>x.type==='ability'&&x.cardId===card.id));}
 else if(ability.type==='triggered'){
  if(ability.event==='endTurn'){const hand=p.hand.length,damage=source.damage;perform(b,'player',a=>a.type==='endTurn',card.id+' end-turn trigger');if(ability.effect.type==='draw')assert.equal(p.hand.length,hand+ability.effect.amount);else if(ability.effect.type==='healSelf')assert.equal(source.damage,Math.max(0,damage-ability.effect.amount));else assert.fail('Unverified end-turn effect '+ability.effect.type);}
  else if(ability.event==='damagedByAttack'){assert.equal(ability.effect.type,'damage');b.activeSide='opponent';o.active.damage=0;perform(b,'opponent',a=>a.type==='attack'&&a.attackIndex===0,card.id+' retaliation trigger');assert.equal(o.active?.damage,ability.effect.amount);}
  else assert.fail('Unverified trigger event '+ability.event);
 }else if(ability.type==='passive'){
  if(ability.effect.type==='preventStatus'){E.applyEffect({type:'status',target:'opponentActive',status:'poison'},C.effectContext(b,'opponent',{}));assert.equal(!!source.conditions.poison,false);b.activeSide='opponent';perform(b,'opponent',a=>a.type==='attack',card.id+' protected target attack');}
  else if(ability.effect.type==='modifier'){const e=ability.effect,target=e.scope==='active'||e.scope==='team'?p.active:source;assert.equal(E.modifierAmount(b,'player',target,e.stat,D.cardById),e.amount,card.id+' satisfied passive modifier');
   if(e.stat==='damageReduction'){b.activeSide='opponent';const foeCard=D.cardById(o.active.cardId),attack=foeCard.attacks[0],before=source.damage,base=E.attackDamage(foeCard,attack,card);perform(b,'opponent',a=>a.type==='attack'&&a.attackIndex===0,card.id+' reduced attack');assert.equal(source.damage,before+Math.max(0,base-e.amount));}
   else if(e.stat==='maxHp'){assert.equal(C.maxHp(b,'player',target),D.cardById(target.cardId).hp+e.amount);perform(b,'player',a=>a.type==='attack',card.id+' max HP integration');}
   else if(e.stat==='attackDamage'||e.stat==='attackCost'){perform(b,'player',a=>a.type==='attack',card.id+' attack modifier integration');}
   else if(e.stat==='retreatCost'){const before=E.totalEnergy(p.active.energy),cost=Math.max(0,D.cardById(p.active.cardId).retreat+e.amount);perform(b,'player',a=>a.type==='retreat',card.id+' retreat modifier integration');assert.equal(E.totalEnergy(target.energy),before-cost);}
   else assert.fail('Unverified modifier stat '+e.stat);
  }else assert.fail('Unverified passive effect '+ability.effect.type);
 }else assert.fail('Unverified ability type '+ability.type);
 return {state:b,unavailablePositivePreconditions};
}
test('every FULL identity executes all attack, Trainer and ability definitions with honest preconditions',context=>{
 const failures=[],identities=[],unavailablePositivePreconditions=[],counts={attacks:0,trainers:0,activatedAbilities:0,passiveAbilities:0,triggeredAbilities:0};
 function attempt(card,kind,index,run){const key={cardId:card.id,name:card.name,kind,index};try{const result=run();assert.deepEqual(result,run(),card.id+' seeded '+kind+' '+index);counts[kind]++;for(const dependency of result.unavailablePositivePreconditions||[])unavailablePositivePreconditions.push({...key,...dependency});return {...key,passed:true,executionBranch:result.unavailablePositivePreconditions?.length?'legal negative/no-beneficiary branch':'prepared positive/unconditional branch'};}catch(error){const failure={...key,message:error.message,stack:error.stack};failures.push(failure);return {...key,passed:false};}}
 for(const card of fullCards()){
  const cases=[];for(const [index,attack]of (card.attacks||[]).entries())cases.push(attempt(card,'attacks',index,()=>{const {b,unavailablePositivePreconditions}=fixture(card,attack.effect);perform(b,'player',a=>a.type==='attack'&&a.attackIndex===index,card.id+' attack '+index);assert.ok(b.log.some(x=>x.type==='attack'&&x.cardId===card.id));return {state:b,unavailablePositivePreconditions};}));
  if(card.kind==='trainer')cases.push(attempt(card,'trainers',0,()=>{const {b,unavailablePositivePreconditions}=fixture(card,card.effect);perform(b,'player',a=>a.type==='trainer',card.id+' Trainer');assert.ok(b.log.some(x=>x.type==='trainer'&&x.cardId===card.id));return {state:b,unavailablePositivePreconditions};}));
  for(const [index,ability]of abilitiesFor(card).entries()){const kind=ability.type==='activated'?'activatedAbilities':ability.type==='passive'?'passiveAbilities':ability.type==='triggered'?'triggeredAbilities':'unknownAbility';cases.push(attempt(card,kind,index,()=>exerciseAbility(card,ability,index)));}
  identities.push({cardId:card.id,name:card.name,cases});
 }
 const report={schema:1,cutoff:require('../app/src/main/assets/tcgp/generated/catalogue.js').cutoff,canonicalIdentities:fullCards().length,expectedFull:D.COVERAGE.FULL,counts,failures,unavailablePositivePreconditions,identities,deterministic:failures.length===0};const out=path.resolve(__dirname,'../artifacts/v06937');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'catalogue-execution.json'),JSON.stringify(report,null,2)+'\n');
 assert.equal(report.canonicalIdentities,D.COVERAGE.FULL);assert.equal(failures.length,0,failures.map(f=>f.cardId+' '+f.kind+': '+f.message).join('\n'));assert.ok(counts.attacks>1000);assert.ok(counts.trainers>0);context.diagnostic(JSON.stringify({...counts,canonicalIdentities:report.canonicalIdentities,failures:failures.length,unavailablePositiveBranches:unavailablePositivePreconditions.length}));
});
