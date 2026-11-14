'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const set=require('../app/src/main/assets/tcg-classic-great-encounters');
const data=require('../app/src/main/assets/tcg-classic-battle-data');
const core=require('../app/src/main/assets/tcgp-battle-core');
const ai=require('../app/src/main/assets/tcgp-battle-ai');
const synergy=require('../app/src/main/assets/tcg-deck-synergy');
const opponents=require('../app/src/main/assets/tcg-classic-opponents');
const loan=opponents.generate({sets:['dp2'],type:'Grass',seed:19});assert(loan.ok);
const ref=(cardId,uid)=>({cardId,uid:uid||cardId+'-ref'});
function slot(id,uid){const s=core.makePokemonSlot(id,2,uid||id+'-slot');s.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4};return s;}
function board(id='dp4-24',enemy='dp4-61',seed=23){const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});s.phase='battle';s.activeSide='player';s.turnNumber=10;for(const who of ['player','opponent']){s.sides[who].turnCount=7;s.sides[who].hand=[];s.sides[who].bench=[];s.sides[who].deck=[];}s.sides.player.active=slot(id,'our');s.sides.opponent.active=slot(enemy,'enemy');return s;}
function action(s,type,predicate){const acts=core.legalActions(s,s.activeSide),a=acts.find(x=>x.type===type&&(!predicate||predicate(x)));assert.ok(a,`${type} missing: ${JSON.stringify(acts.slice(0,10))}`);core.applyAction(s,s.activeSide,a);return a;}
function attack(s,index=0){return action(s,'attack',x=>x.attackIndex===index);}
function choice(s,predicate){assert.equal(s.phase,'effectChoice');const acts=core.legalActions(s,s.choiceSide);const a=predicate?acts.find(predicate):acts.find(x=>!x.choiceSkip)||acts[0];assert.ok(a,'choice missing '+JSON.stringify(acts));core.applyAction(s,s.choiceSide,a);return a;}
function drain(s){for(let i=0;i<30&&s.phase==='effectChoice';i++)choice(s);assert.notEqual(s.phase,'effectChoice');}
function playNextTurn(s){s.phase='battle';s.activeSide='player';s.turnNumber=12;s.sides.player.turnCount+=1;s.sides.player.lastAttackTurn=10;}

test('All 106 Great Encounters prints are enabled with no fabricated gated descriptions',()=>{
 assert.equal(set.coverage().battleEnabled,106);
 assert.deepEqual(set.CARDS.map(c=>+c.number).sort((a,b)=>a-b),Array.from({length:106},(_,i)=>i+1));
 for(const c of set.CARDS){assert.ok(c.image?.includes('/dp4/'),c.id);for(const a of c.attacks||[]){assert.ok(a.name,c.id);assert.ok(!/under implementation review|battle entry gated|awaiting battle timing/.test(a.text||''),c.id+': '+a.name);}for(const a of c.abilities||[])assert.ok(!/awaiting battle timing|under implementation review/.test(a.text||''),c.id+': '+a.name);}
});

test('Mawile Jaw Bite marks only original Defending Pokémon, and never adds damage before next own turn',()=>{
 const s=board('dp4-24','dp4-61');attack(s,1);
 const original=s.sides.opponent.active;
 assert.equal(original.damage,20);
 assert.deepEqual(original.dp4JawBite,{sourceSide:'player',triggerTurn:12});
 assert.equal(s.sides.player.active.dp4JawBite,undefined);
 playNextTurn(s);attack(s,1);assert.equal(original.damage,60,'next attack should deal 20+20, after Weakness/Resistance');
});

test('Mawile Jaw Bite never boosts damage against the replacement Active',()=>{
 const s=board('dp4-24','dp4-61');attack(s,1);
 const old=s.sides.opponent.active;const fresh=slot('dp4-61','newEnemy');fresh.benchSlot=0;
 s.sides.opponent.bench.push(old);old.benchSlot=0;s.sides.opponent.active=fresh;
 playNextTurn(s);attack(s,1);
 assert.equal(fresh.damage,20,'a different Defending Pokémon must not receive the previous bonus');
});

test('Zigzagoon Pull Out can recover discarded Basic Energy to actual deck top',()=>{
 const s=board('dp4-96');s.sides.player.energyDiscard={Fire:1,Water:2};
 attack(s,0);
 assert.equal(s.phase,'effectChoice');
 const choices=core.legalActions(s,s.choiceSide);
 assert.ok(choices.some(a=>a.choiceCardId),'Basic Energy selection must expose a real card ID for artwork');
 choice(s,a=>a.choiceOption===0);
 drain(s);
 assert.equal(s.sides.player.energyDiscard.Fire,0);
 assert.equal(s.sides.player.deck[0]?.cardId,'neo1-107');
});

test('Zigzagoon Pull Out still offers real discarded cards as well as Basic Energy',()=>{
 const s=board('dp4-96');s.sides.player.energyDiscard={Water:1};s.sides.player.discard.push(ref('dp4-97','tool-a'));
 attack(s,0);choice(s,a=>a.choiceOption===0);choice(s,a=>a.choiceCardId==='dp4-97');drain(s);
 assert.equal(s.sides.player.deck[0]?.uid,'tool-a');assert.equal(s.sides.player.energyDiscard.Water,1);
});

test('Great Encounters named partner metadata reflects the actual printed requirements',()=>{
 for(const [id,partner] of [['dp4-76','Solrock'],['dp4-85','Lunatone'],['dp4-92','Illumise'],['dp4-71','Volbeat'],['dp4-32','Igglybuff']])assert.ok(synergy.metadata(data.cardById(id)).optionalPartners.some(p=>p.name===partner),id+' missing '+partner);
 assert.ok(synergy.metadata(data.cardById('dp4-18')).conditionalAttackEnergyTypes.includes('Darkness'));
 assert.ok(synergy.metadata(data.cardById('dp4-42')).conditionalAttackEnergyTypes.includes('Darkness'));
 assert.ok(!synergy.metadata(data.cardById('dp4-85')).conditionalAttackEnergyTypes.includes('Fighting'),'Solrock does not require extra Fighting Energy beyond its attack cost');
});

test('Unown HEAL requires all four letters and works in the actual three-Bench Classic format',()=>{
 const s=board('dp2-65');s.sides.player.active.conditions={poison:{amount:10},sleep:true};
 const b=s.sides.player.bench;
 for(const id of ['dp4-29','dp1-65','dp4-91']){const p=slot(id,'unown-'+id);p.benchSlot=b.length;b.push(p);}
 const ability=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='dp4-29');
 assert.ok(ability,'all four required letters should be playable as Active + 3 Bench');
 core.applyAction(s,'player',ability);
 assert.deepEqual(s.sides.player.active.conditions,{});
 const broken=board('dp4-29');const wrong=broken.sides.player.bench;
 for(const id of ['dp2-65','dp1-65','dp4-93']){const p=slot(id,'other-'+id);p.benchSlot=wrong.length;wrong.push(p);}
 assert.ok(!core.legalActions(broken,'player').some(a=>a.type==='ability'&&a.cardId==='dp4-29'),'missing L must disable HEAL');
});

test('Houndoom Black Fire can discard real Special Darkness Energy and apply +30',()=>{
 const s=board('dp4-18','dp4-1');s.sides.player.active.specialEnergy=[ref('dp3-129','special-dark')];
 attack(s,1);assert.equal(s.phase,'effectChoice');
 const choices=core.legalActions(s,s.choiceSide);assert.ok(choices.some(x=>x.choiceCardId==='dp3-129'),'actual attached Darkness Energy must be selectable');
 choice(s,x=>x.choiceCardId==='dp3-129');drain(s);
 assert.equal(s.sides.opponent.active.damage,80);
 assert.equal(s.sides.player.active.specialEnergy.length,0);
 assert.ok(s.sides.player.discard.some(r=>r.uid==='special-dark'));
});

test('Houndoom Black Fire treats Rainbow as a Fire option and applies Burn',()=>{
 const s=board('dp4-18','dp4-1');s.sides.player.active.specialEnergy=[ref('ex1-95','rainbow')];
 attack(s,1);
 const choices=core.legalActions(s,s.choiceSide);assert.ok(choices.some(x=>x.choiceCardId==='ex1-95'),'physical Rainbow Energy option must be present');
 choice(s,x=>x.choiceCardId==='ex1-95'&&/Burn/i.test(x.choiceLabel||x.label||x.optionLabel||s.pendingChoice?.options?.[x.choiceOption]||''));drain(s);
 assert.ok(s.sides.opponent.active.conditions.burn);
 assert.ok(s.sides.player.discard.some(r=>r.uid==='rainbow'));
});

test('Blaziken Flame Kick pays with physical Basic Fire plus Rainbow Energy (no duplication)',()=>{
 const s=board('dp4-1','dp4-1');s.sides.player.active.energy={Fire:1,Water:1};
 s.sides.player.active.specialEnergy=[ref('ex1-95','rainbow-fire')];
 attack(s,1);
 assert.equal(s.phase,'effectChoice');
 choice(s,a=>a.choiceTarget==='active');
 assert.ok(core.legalActions(s,s.choiceSide).some(a=>a.choiceCardId==='ex1-95'),'Rainbow Energy must be a Fire discard candidate');
 choice(s,a=>a.choiceCardId==='ex1-95');
 choice(s,a=>a.choiceCardId==='neo1-107');
 drain(s);
 assert.equal(s.sides.opponent.active.damage,80);
 assert.equal(s.sides.player.active.energy.Fire,0);
 assert.equal(s.sides.player.active.specialEnergy.length,0);
 assert.ok(s.sides.player.discard.some(ref=>ref.uid==='rainbow-fire'));
});

test('Rotom Astonish moves a concealed opposing hand card into the real deck',()=>{
 const s=board('dp4-7','dp4-1');s.sides.opponent.hand=[ref('dp4-93','hiddenWeedle')];
 attack(s,0);drain(s);
 assert.ok(s.log.some(ev=>ev.type==='revealHand'&&ev.reason==='Rotom Astonish'&&ev.cards?.includes('dp4-93')),'Only selected concealed card should be revealed');
 assert.ok(s.log.some(ev=>ev.type==='neoEffect'&&ev.rule==='dp4:7:astonish'&&ev.zone==='opponentDeck'),'Physical card must be shuffled to the deck');
 // With an otherwise empty deck the opponent immediately redraws it on the
 // following turn. That legal draw must not be confused with a failed attack.
 assert.ok(s.log.some(ev=>ev.type==='draw'&&ev.side==='opponent'&&ev.cardId==='dp4-93'),'Opponent can redraw the shuffled card at the start of the next turn');
});

test('Rare Candy has a legal action with a real eligible Basic and evolution in hand',()=>{
 const s=board('dp4-89','dp4-1');
 s.sides.player.hand=[ref('dp4-102','rareCandy'),ref('dp4-35','combusken'),ref('dp4-1','blaziken')];
 const acts=core.legalActions(s,'player');
 assert.ok(acts.some(a=>a.type==='trainer'&&a.cardId==='dp4-102'),JSON.stringify(acts.filter(a=>/trainer/i.test(a.type)).slice(0,5)));
});
