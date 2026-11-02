'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../app/src/main/assets/tcgp-battle-data.js'),C=require('../app/src/main/assets/tcgp-battle-core.js'),E=require('../app/src/main/assets/tcgp-battle-effects.js');
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const fullCards=()=>D.CARDS.filter(c=>c.battleEnabled&&!c.loaner);
const abilitiesFor=c=>c.abilities?.length?c.abilities:[c.ability].filter(Boolean);
function matches(c,filter={},slot=null){return c&&Object.entries(filter).every(([key,value])=>{
 const one=v=>key==='subtype'?D.hasType(c,v):key==='tag'?(c.tags||[]).includes(v):key==='evolved'?['Stage 1','Stage 2'].includes(c.stage)===v:key==='hasAbility'?!!abilitiesFor(c).length===v:key==='isEx'?(c.points>=2||/ ex$/.test(c.name))===v:key==='damaged'?slot?Number(slot.damage||0)>0:true:key==='hasEnergyType'?slot?Number(slot.energy?.[v]||0)>0:true:key==='hasAnyEnergy'?slot?Object.values(slot.energy||{}).some(n=>Number(n)>0):true:key==='nameContains'?String(c.name||'').includes(v):key==='attackName'?(c.attacks||[]).some(a=>a.name===v):key==='hpAtMost'?Number(c.hp||0)<=Number(v):key==='retreatAtLeast'?Number(c.retreat||0)>=Number(v):key==='energyTypeAtLeast'?slot?Number(slot.energy?.[v?.type]||0)>=Number(v?.amount||0):true:c[key]===v;
 return Array.isArray(value)?value.some(one):one(value);
});}
function pick(filter={},flat=false){const candidates=fullCards().filter(c=>c.kind==='pokemon'&&matches(c,filter));const preferred=c=>!abilitiesFor(c).some(a=>a.type==='passive')&&(!flat||c.attacks[0]?.damage>0&&!c.attacks[0].effect);const found=candidates.find(c=>c.stage==='Basic'&&preferred(c))||candidates.find(preferred)||candidates[0];assert.ok(found,'No actual FULL fixture Pokémon for '+JSON.stringify(filter));return found;}
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
  case 'opponentMatches':{const dependency=prerequisite(c.filter,'opponent condition');if(dependency)setSlot(o,'active',dependency,'matching-foe');break;}
  case 'selfMatches':{const dependency=prerequisite(c.filter,'self condition');if(dependency)source=setSlot(p,'active',dependency,'matching-self');break;}
  case 'pokemonPresent':{const dependency=prerequisite(c.filter,'condition');if(dependency){const ss=c.side==='opponent'?o:p;setSlot(ss,1,dependency,'condition-pokemon');}break;}
  case 'supporterPlayed':p.supporterUsed=true;break;
  case 'stadiumInPlay':{const stadium=fullCards().find(c=>c.kind==='trainer'&&c.trainerType==='Stadium');assert.ok(stadium);b.stadium={cardId:stadium.id,ownerSide:'player'};break;}
  case 'koLastOpponentTurn':p.lastKnockoutTurn=b.turnNumber-1;break;
  case 'sweetsRelayLastTurn':p.lastAttackName='Sweets Relay';p.lastAttackTurn=b.turnNumber-2;break;
  case 'movedFromBenchThisTurn':source.movedToActiveTurn=b.turnNumber;break;
  case 'evolvedThisTurn':source.evolvedOnTurn=b.turnNumber;break;
  case 'selfHasEnergyType':source.energy[c.energyType]=Math.max(1,Number(source.energy[c.energyType]||0));break;
  case 'selfMoreEnergy':o.active.energy={};break;
  case 'opponentHpGreater':source.damage=Math.max(0,D.cardById(source.cardId).hp-1);o.active.damage=0;break;
  case 'selfRemainingHpAtMost':source.damage=Math.max(0,D.cardById(source.cardId).hp-Number(c.amount||0));break;
  case 'handSizeOneOf':{const n=(c.values||[])[0]||0;p.hand=Array.from({length:n},(_,i)=>({uid:'condition-hand-'+i,cardId:'A1-001'}));break;}
  case 'sameEnergyTypeAtLeast':source.energy.Grass=Math.max(Number(c.amount||0),1);o.active.energy.Grass=Math.max(Number(c.amount||0),1);break;
  case 'opponentPointsExact':o.points=Number(c.amount||0);break;
  case 'combinedActiveEnergyAtLeast':break;
  case 'teamEnergyAtLeast':source.energy[c.energyType||'Grass']=Math.max(Number(c.amount||0),Number(source.energy[c.energyType||'Grass']||0));break;
  case 'teamDistinctEnergyTypesAtLeast':break;
  case 'discardContains':{const dependency=fullCards().find(card=>matches(card,c.filter));if(dependency)p.discard.push({uid:'condition-discard',cardId:dependency.id});else{const blockers=D.CARDS.filter(card=>!card.loaner&&matches(card,c.filter));assert.ok(blockers.length,'Unresolvable discard fixture filter '+JSON.stringify(c.filter));unavailablePositivePreconditions.push({role:'discard condition',filter:c.filter,reason:'All matching printed identities are battle-disabled; only the legal negative branch can execute.',blockingIdentities:blockers.map(card=>({cardId:card.id,name:card.name,status:card.support.status,reasons:card.support.reasons}))});}break;}
  case 'equalEnergyCount':o.active.energy={...source.energy};break;
  case 'handSizesEqual':o.hand=p.hand.map((r,i)=>({uid:'equal-hand-'+i,cardId:r.cardId}));break;
  case 'ownPointsExact':p.points=Number(c.amount||0);break;
  case 'opponentHpLess':source.damage=0;o.active.damage=Math.max(0,D.cardById(o.active.cardId).hp-1);break;
  case 'fewerPokemonInPlay':p.bench=[];break;
  case 'opponentHandSizeOneOf':{const n=(c.values||[])[0]||0;o.hand=Array.from({length:n},(_,i)=>({uid:'opponent-hand-'+i,cardId:'A1-001'}));break;}
  case 'selfDistinctEnergyTypesAtLeast':break;
  case 'ownTurnCountAtMost':p.turnCount=Math.min(p.turnCount,Number(c.amount||0));break;
  case 'opponentStadiumInPlay':{const stadium=fullCards().find(card=>card.kind==='trainer'&&card.trainerType==='Stadium');assert.ok(stadium);b.stadium={uid:'condition-stadium',cardId:stadium.id,ownerSide:'opponent'};break;}
  case 'pokemonPresentAll':{const ss=c.side==='opponent'?o:p;const names=c.names||[];assert.ok(names.length<=3||c.zone!=='bench','Fixture cannot place more than three named Bench Pokémon');if(c.zone==='bench')ss.bench=[];for(const [i,name] of names.entries()){const found=fullCards().find(card=>card.kind==='pokemon'&&card.name===name);assert.ok(found,'No FULL named fixture Pokémon '+name);if(c.zone==='bench')setSlot(ss,i,found,'named-condition-'+i);else if(i===0)setSlot(ss,'active',found,'named-condition-active');else setSlot(ss,i-1,found,'named-condition-'+i);}break;}
  case 'damagedByAttackLastOpponentTurn':source.lastDamageSource={side:'opponent',uid:'condition-attacker',cardId:o.active.cardId,attack:true,turn:b.turnNumber-1};break;
  case 'activeMatches':{if(!matches(D.cardById(p.active.cardId),c.filter,p.active)){const dependency=prerequisite(c.filter,'active condition');if(dependency){if(card.kind==='pokemon'&&source===p.active){assert.ok(!ability?.activeOnly,'Active-only source must itself satisfy activeMatches');const free=[0,1,2].find(i=>!p.bench.some(x=>x&&Number(x.benchSlot)===i));assert.notEqual(free,undefined);source.benchSlot=free;p.bench.push(source);}p.active=slot(dependency.id,'active-condition');}}break;}
  case 'ownPointsAtLeast':p.points=Math.max(Number(p.points||0),Number(c.amount||0));break;
  case 'teamDistinctTypesAtLeast':{const need=Number(c.amount||0),used=new Set([D.cardById(p.active.cardId)?.subtype].filter(Boolean));p.bench=[];let benchSlot=0;for(const type of TYPES){if(used.size>=need)break;if(used.has(type))continue;const found=fullCards().find(card=>card.kind==='pokemon'&&card.subtype===type&&card.stage==='Basic');if(!found)continue;while(p.bench.some(x=>x&&Number(x.benchSlot)===benchSlot))benchSlot++;if(benchSlot>2)break;setSlot(p,benchSlot,found,'type-condition-'+benchSlot);used.add(type);benchSlot++;}assert.ok(used.size>=need,'Could not prepare distinct team types');break;}
  case 'firstAttackAfterPlay':source.attackUseCount=0;break;
  case 'opponentPointsGainedLastTurn':o.pointsGainedLastTurn=Math.max(1,Number(c.amount||1));break;
  case 'handAtLeast':{const n=Number(c.amount||0);while(p.hand.length<n)p.hand.push({uid:'condition-hand-'+p.hand.length,cardId:'A1-001'});break;}
  case 'selfRemainingHpAbove':source.damage=0;break;
  case 'selfRemainingHpFractionAtMost':{const max=Number(D.cardById(source.cardId)?.hp||1),fraction=Number(c.fraction||0);source.damage=Math.max(0,Math.ceil(max*(1-fraction)));break;}
  case 'selfRetreatCostAtLeast':{const base=Number(D.cardById(source.cardId)?.retreat||0),need=Number(c.amount||0);if(base<need){b.modifiers=b.modifiers||[];b.modifiers.push({stat:'retreatCost',ownerSide:'player',targetUid:source.uid,amount:need-base});}break;}
  case 'koLastOpponentTurnFilter':{const dependency=prerequisite(c.filter,'last KO condition');if(dependency){p.lastKnockoutTurn=b.turnNumber-1;p.lastKnockedOutCardIds=[dependency.id];}break;}
  case 'selfOnBench':{if(card.kind==='pokemon'&&source===p.active){p.active=slot('A1-001','bench-condition-active');source.benchSlot=0;p.bench=[source,...p.bench.filter(x=>x!==source&&Number(x.benchSlot)!==0)];}else if(!p.bench.length)setSlot(p,0,pick({stage:'Basic'}),'bench-condition');break;}
  case 'deckEmpty':p.deck=[];break;
  case 'opponentPointsAtLeast':o.points=Math.max(Number(o.points||0),Number(c.amount||0));break;
  case 'ownTurnCountAtLeast':p.turnCount=Math.max(Number(p.turnCount||0),Number(c.amount||0));break;
  case 'selfExtraEnergyAtLeast':case 'selfEnergyAtLeast':case 'opponentEnergyAtLeast':case 'benchAtLeast':break; // Fixture Energy / Bench already satisfy these.
  default:assert.fail('Unprepared condition '+c.type);
 }}
 function visit(e){if(!e)return;condition(e.condition);
  if(e.opponentFilter)setSlot(o,'active',pick(e.opponentFilter,true),'filtered-foe');
  if(e.type==='modifier'&&e.filter&&Object.keys(e.filter).length){const targetSide=e.scope==='opponentActive'?o:p;let beneficiary=e.scope==='opponentActive'?o.active:(e.scope==='team'||e.scope==='active'?p.active:source);if(!matches(D.cardById(beneficiary.cardId),e.filter)){if(ability&&beneficiary===source&&(!e.scope||e.scope==='self'))assert.fail('Passive source does not match its printed beneficiary filter');const dependency=prerequisite(e.filter,'modifier beneficiary');if(dependency){if(targetSide===p&&beneficiary===p.active&&source===p.active){assert.ok(!ability?.activeOnly,'Active-only source cannot be displaced by a different modifier beneficiary');source.benchSlot=0;p.bench[0]=source;}beneficiary=setSlot(targetSide,'active',dependency,'modifier-beneficiary');}}}
  if(e.filter&&['selfBench','selfPokemon','selfAll','selfBenchAll','opponentBench','opponentPokemon'].includes(e.target)){setSlot(e.target.startsWith('opponent')?o:p,2,pick(e.filter),'selected-target');}
  if(e.target==='selfActive'&&e.filter&&!matches(D.cardById(p.active.cardId),e.filter)){assert.ok(!ability?.activeOnly,'Active-only source must satisfy its own typed target');setSlot(p,'active',pick(e.filter),'typed-active');if(ability&&source===p.active)assert.fail('Ability source unexpectedly replaced');if(ability&&source.benchSlot==null){source.benchSlot=0;p.bench[0]=source;}}
  if(e.type==='switch'&&e.filter)setSlot(e.side==='opponent'?o:p,2,pick(e.filter),'switch-target');
  if(e.type==='moveEnergy'&&e.source==='selfBench')setSlot(p,2,pick(e.sourceFilter),'energy-source');
  if(e.type==='benchCountDamage'&&e.filter)setSlot(e.side==='opponent'?o:p,2,pick(e.filter),'counted-bench');
  if(e.type==='search'||e.type==='searchRandomBasic'){const filter=e.type==='searchRandomBasic'?{kind:'pokemon',stage:'Basic'}:e.filter,found=fullCards().find(c=>matches(c,filter));assert.ok(found,'Actual FULL card for zone search '+JSON.stringify(filter));const refs=Array.from({length:Math.max(1,e.amount)},(_,i)=>({uid:'search-ref-'+i,cardId:found.id}));p[e.source||'deck'].unshift(...refs);}
  if(e.type==='attachEnergyFromDiscard'){p.energyDiscard=p.energyDiscard||{};p.energyDiscard[e.energyType]=Math.max(Number(p.energyDiscard[e.energyType]||0),Number(e.amount||1));}
  if(e.type==='topDeckFilter'){const found=fullCards().find(c=>matches(c,e.filter));assert.ok(found,'Actual FULL card for top-deck filter '+JSON.stringify(e.filter));p.deck.unshift({uid:'top-filter',cardId:found.id});}
  if(e.type==='fieldCountDraw'){const found=fullCards().find(c=>c.kind==='pokemon'&&matches(c,e.filter));assert.ok(found,'Actual FULL card for field-count filter '+JSON.stringify(e.filter));if(!matches(D.cardById(p.active.cardId),e.filter))setSlot(p,1,found,'field-count');}

  if(e.type==='removeStatus'||e.type==='removeRandomStatus')p.active.conditions={poison:{amount:10}};
  if(e.type==='playFossil')p.bench=[];
  if(Array.isArray(e.effects))e.effects.forEach(visit);visit(e.heads);visit(e.tails);visit(e.effect);
 }
 visit(effect);if(card.kind==='pokemon'&&!ability){const visitRequirement=e=>{if(!e)return;if(e.type==='sequence'){for(const child of e.effects||[])visitRequirement(child);return;}if(e.type==='attackRequirement')visit(e);};for(const passive of abilitiesFor(card).filter(a=>a.type==='passive'))visitRequirement(passive.effect);}if(card.kind==='trainer'&&!ability){if(card.effect?.type==='rareCandy'){p.active=slot('A1-001','rare-candy-basic');p.active.playedOnSideTurn=0;p.hand=[{uid:'trainer',cardId:card.id},{uid:'rare-candy-stage2',cardId:'A1-003'}];}else p.hand=[{uid:'trainer',cardId:card.id},...(p.hand||[])];}return {b,source,unavailablePositivePreconditions};
}
function sane(b){assert.ok(Number.isFinite(b.turnNumber));for(const ss of Object.values(b.sides)){assert.ok(ss.points>=0);assert.ok(ss.bench.length<=3);assert.ok(ss.hand.length<=10);const physical=new Set();for(const s of ss.bench){assert.ok(Number.isInteger(s.benchSlot)&&s.benchSlot>=0&&s.benchSlot<3);assert.ok(!physical.has(s.benchSlot));physical.add(s.benchSlot);}for(const s of [ss.active,...ss.bench].filter(Boolean)){assert.ok(Number.isFinite(s.damage)&&s.damage>=0);for(const n of Object.values(s.energy||{}))assert.ok(Number.isInteger(n)&&n>=0);}}}
function perform(b,side,predicate,label){const action=C.legalActions(b,side).find(predicate);assert.ok(action,label+' has an actual legal action');C.applyAction(b,side,action);sane(b);return action;}
function exerciseAbility(card,ability,index){
 const {b,source:initialSource,unavailablePositivePreconditions}=fixture(card,ability.effect,ability),p=b.sides.player,o=b.sides.opponent;let source=initialSource;
 if(ability.type==='activated'){perform(b,'player',a=>a.type==='ability'&&a.cardId===card.id&&Number(a.abilityIndex||0)===index&&(source===p.active?a.target==='active':a.target==='bench'&&a.benchIndex===source.benchSlot),card.id+' activated ability');assert.ok(b.log.some(x=>x.type==='ability'&&x.cardId===card.id));}
 else if(ability.type==='triggered'){
  if(ability.event==='endTurn'){if(ability.firstTurnOnly)p.turnCount=1;const endingSide=ability.turn==='opponent'?'opponent':'player';b.activeSide=endingSide;perform(b,endingSide,a=>a.type==='endTurn',card.id+' end-turn trigger');}
  else if(ability.event==='beginTurn'){b.activeSide='opponent';perform(b,'opponent',a=>a.type==='endTurn',card.id+' begin-turn trigger');}
  else if(ability.event==='energyAttached'){p.energyType=ability.energyType||'Grass';p.energyAvailable=true;p.energyUsed=false;b.activeSide='player';perform(b,'player',a=>a.type==='attach'&&(source===p.active?a.target==='active':a.target==='bench'&&a.benchIndex===source.benchSlot),card.id+' Energy attachment trigger');}
  else if(ability.event==='opponentEnergyAttached'){b.activeSide='opponent';o.energyType='Grass';o.energyAvailable=true;o.energyUsed=false;perform(b,'opponent',a=>a.type==='attach'&&a.target==='active',card.id+' opponent Energy attachment trigger');}
  else if(ability.event==='evolved'){const pre=fullCards().find(c=>c.kind==='pokemon'&&c.name===card.evolvesFrom);assert.ok(pre,card.id+' needs a FULL pre-evolution fixture '+card.evolvesFrom);source.cardId=pre.id;source.stack=[pre.id];source.playedOnSideTurn=0;source.evolvedOnTurn=null;p.hand=[{uid:'evolution-card',cardId:card.id}];perform(b,'player',a=>a.type==='evolve'&&a.cardId===card.id&&(source===p.active?a.target==='active':a.target==='bench'&&a.benchIndex===source.benchSlot),card.id+' evolved trigger');}
  else if(ability.event==='benched'){assert.equal(card.stage,'Basic',card.id+' benched trigger fixture expects a Basic Pokémon');p.active=slot('A1-001','bench-trigger-active');p.active.damage=20;p.bench=[];p.hand=[{uid:'bench-trigger-card',cardId:card.id}];b.activeSide='player';perform(b,'player',a=>a.type==='bench'&&a.cardId===card.id,card.id+' benched trigger');}
  else if(ability.event==='checkup'){C.checkup(b);sane(b);}
  else if(ability.event==='damagedByAttack'){b.activeSide='opponent';perform(b,'opponent',a=>a.type==='attack'&&a.attackIndex===0,card.id+' damaged-by-attack trigger');}
  else if(ability.event==='knockedOut'){p.active=source;source.benchSlot=null;const hp=Number(D.cardById(source.cardId)?.hp||10)+E.modifierAmount(b,'player',source,'maxHp',D.cardById);source.damage=Math.max(0,hp-10);b.activeSide='opponent';o.energyAvailable=false;perform(b,'opponent',a=>a.type==='attack'&&a.attackIndex===0,card.id+' knocked-out trigger');}
  else if(ability.event==='opponentKnockedOut'){p.active=source;source.benchSlot=null;const hp=Number(D.cardById(o.active.cardId)?.hp||10)+E.modifierAmount(b,'opponent',o.active,'maxHp',D.cardById);o.active.damage=Math.max(0,hp-10);b.activeSide='player';perform(b,'player',a=>a.type==='attack'&&a.attackIndex===0,card.id+' opponent-knocked-out trigger');}
  else assert.fail('Unverified trigger event '+ability.event);
  assert.ok(b.log.some(x=>x.type==='ability'&&x.cardId===card.id&&x.event===ability.event),card.id+' should log '+ability.event+' trigger');
 }else if(ability.type==='passive'){
  function verifyPassive(e){if(!e)return;if(e.type==='sequence'){e.effects.forEach(verifyPassive);return;}
   if(e.type==='preventStatus'){assert.equal(E.statusIsPrevented(b,source,D.cardById,e.status||'poison'),true,card.id+' should prevent status');return;}
   if(e.type==='preventDamage'){let attacker=o.active;if(e.attackerFilter&&!matches(D.cardById(attacker.cardId),e.attackerFilter,attacker)){attacker=setSlot(o,'active',pick(e.attackerFilter,true),'guard-attacker');}assert.ok(E.attackIsPrevented(b,'player',source,attacker,D.cardById),card.id+' should prevent matching attack damage');return;}
   if(e.type==='preventEffects'){assert.equal(E.attackEffectsPrevented(b,'player',source,o.active,D.cardById),true,card.id+' should prevent attack effects');return;}
   if(e.type==='actionLock'){const targetSide=e.side==='opponent'?'opponent':'player';assert.equal(E.isActionLocked(b,targetSide,e.cardType,D.cardById),true,card.id+' should lock '+e.cardType);return;}
   if(e.type==='modifier'){const targetSide=e.scope==='opponentActive'?'opponent':'player',target=e.scope==='opponentActive'?o.active:(e.scope==='active'||e.scope==='team'?p.active:source);let expected=e.amount;if(e.perEnergy)expected*=e.energyType?Number(target.energy?.[e.energyType]||0):E.totalEnergy(target.energy);assert.equal(E.modifierAmount(b,targetSide,target,e.stat,D.cardById),expected,card.id+' satisfied passive modifier '+e.stat);return;}
   if(e.type==='statusRecoveryAura'){source.conditions={poison:{amount:10}};E.applyContinuousRules(b,D.cardById);assert.equal(Object.keys(source.conditions||{}).length,0,card.id+' should clear matching status conditions');return;}
   if(e.type==='healingBlock'){assert.equal(E.healingIsBlocked(b,source,D.cardById),true,card.id+' should block healing');return;}
   if(e.type==='coinDamageGuard'||e.type==='koGuard'){const rule=E.findPassiveRule(b,'player',source,e.type,D.cardById);assert.ok(rule,card.id+' should expose '+e.type+' to battle resolution');assert.equal(rule.type,e.type);return;}
   if(e.type==='evolutionAsName'||e.type==='evolutionTimingOverride'){const rule=E.evolutionRule(b,'player',source,e.type,D.cardById);assert.ok(rule,card.id+' should expose '+e.type);if(e.type==='evolutionAsName')assert.equal(rule.name,e.name);return;}
   if(e.type==='firstDamageGuard'){const guard=E.attackIsPrevented(b,'player',source,o.active,D.cardById);assert.equal(guard?.type,'firstDamageGuard',card.id+' should expose first-hit protection');return;}
   if(e.type==='abilitySuppression'){const targetCard=fullCards().find(c=>c.kind==='pokemon'&&c.stage==='Basic'&&abilitiesFor(c).length&&c.id!==card.id);assert.ok(targetCard);const target=setSlot(p,2,targetCard,'suppressed-basic');assert.equal(E.abilitiesSuppressed(b,'player',target,D.cardById),true,card.id+' should suppress matching Abilities');return;}
   if(e.type==='additionalType'){const types=E.effectiveTypes(b,'player',source,D.cardById);for(const type of e.types||[])assert.ok(types.includes(type),card.id+' should add '+type+' type');return;}
   if(e.type==='previousEvolutionAttacks'){const targetCard=fullCards().find(c=>c.kind==='pokemon'&&['Stage 1','Stage 2'].includes(c.stage)&&c.evolvesFrom&&fullCards().some(p=>p.kind==='pokemon'&&p.name===c.evolvesFrom));assert.ok(targetCard);const pre=fullCards().find(c=>c.kind==='pokemon'&&c.name===targetCard.evolvesFrom),target=slot(targetCard.id,'memory-target',1);target.stack=[pre.id,targetCard.id];p.bench=[...p.bench.filter(x=>Number(x.benchSlot)!==1),target];assert.equal(E.canUsePreviousEvolutionAttacks(b,'player',target,D.cardById),true,card.id+' should grant previous Evolution attacks');return;}
   if(e.type==='coinReroll'){const found=E.coinRerollSource(b,'player',e.scope,e.scope==='attack'?source:null,D.cardById);assert.ok(found&&found.sourceUid===source.uid,card.id+' should expose '+e.scope+' coin reroll');return;}
   if(e.type==='toolCapacity'){assert.equal(E.toolCapacity(b,'player',source,D.cardById),Number(e.amount||1),card.id+' should raise Tool capacity');return;}
   if(e.type==='coinBonus'){assert.equal(E.coinBonusAmount(b,'player',source,e.attackName,D.cardById),Number(e.amount||0),card.id+' should add attack coin flips');return;}
   if(e.type==='attackRequirement'){assert.equal(E.passiveAttackAllowed(b,'player',source,D.cardById),true,card.id+' should allow attacks when the passive requirement fixture is satisfied');return;}
   assert.fail('Unverified passive effect '+e.type);
  }
  verifyPassive(ability.effect);
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
