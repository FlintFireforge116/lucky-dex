'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const ex5=require(path.join(A,'tcg-classic-hidden-legends.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const workspace=require(path.join(A,'tcg-classic-deck-workspace.js'));
const synergy=require(path.join(A,'tcg-deck-synergy.js'));
const allTypes=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const mono=(x)=>Object.fromEntries(allTypes.map(t=>[t,x]));
const slot=(n,uid)=>core.makePokemonSlot('ex5-'+n,3,uid);
const ref=(cardId,uid)=>({cardId,uid:uid||cardId+'-ref'});
let deck;
function battle(){if(!deck)deck=opponents.generate({sets:['ex5'],seed:21}).cards;const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:7,firstSide:'player',playerEnergyTypes:allTypes,opponentEnergyTypes:allTypes});s.phase='battle';s.activeSide='player';s.turnNumber=13;s.sides.player.turnCount=7;s.sides.opponent.turnCount=6;s.sides.player.active=slot(3,'attacker');s.sides.opponent.active=slot(63,'defender');s.sides.player.bench=[slot(72,'friendly')];s.sides.player.bench[0].benchSlot=0;s.sides.opponent.bench=[slot(53,'enemy')];s.sides.opponent.bench[0].benchSlot=0;s.sides.player.active.energy=mono(7);s.sides.opponent.active.energy={Water:3};return s;}
function attack(s,n,index=0){s.sides.player.active=slot(n,'attacker');s.sides.player.active.energy=mono(7);const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===index);assert.ok(a,`No attack ${n}:${index}`);core.applyAction(s,'player',a);return s;}
function finish(s,preferred=()=>true){let k=0;while(s.phase==='effectChoice'&&k++<16){const opts=core.legalActions(s,s.choiceSide);const a=opts.find(x=>!x.choiceSkip&&preferred(x,s))||opts.find(x=>!x.choiceSkip)||opts[0];assert.ok(a,'no choice for '+JSON.stringify(s.pendingChoice));core.applyAction(s,s.choiceSide,a)}assert.ok(k<16,'infinite effect-choice loop');return s;}
function pendingHeads(n,i,init=()=>{}){for(let seed=1;seed<100;seed++){const s=battle();init(s);s.rngState=seed;attack(s,n,i);if(s.phase==='effectChoice')return s;}assert.fail('Expected a heads-driven choice');}
function coinEvents(s){return s.log.filter(x=>x.type==='coin'&&String(x.reason||'').startsWith('EX Hidden Legends'))}
test('player and opponent set lists expose ex5; all 102 are filterable, and save ownership resolves',()=>{
 assert.ok(builder.SET_IDS.includes('ex5'));assert.ok(opponents.SETS.includes('ex5'));
 const rows=classic.CARDS.map(x=>({gameplayId:x.id,quantity:4}));const result=workspace.query(workspace.catalogue(rows),{filters:{set:'ex5',enabled:true},pageSize:200});assert.equal(result.total,102);
 assert.equal(classic.projectOwnedCards([{source:'tcg',setId:'ex5',number:'102/101',count:1}]).find(x=>x.gameplayId==='ex5-102')?.quantity,1);
 for(const seed of [5,23,41,59,77]){const p=builder.buildDeck(rows,{sets:['ex5'],style:'random',randomSeed:seed,theme:'any'});assert.ok(p.ok,p.error);assert.equal(p.cards.length,30);assert.ok(p.cards.every(x=>x.startsWith('ex5-')));assert.ok(classic.validateDeck(p.cards).ok);const cpu=opponents.generate({sets:['ex5'],seed});assert.ok(cpu.ok,cpu.error);assert.ok(cpu.cards.every(x=>x.startsWith('ex5-')));assert.ok(classic.validateDeck(cpu.cards).ok)}
 for(const c of ex5.CARDS){const m=synergy.metadata(c);for(const k of ['roles','energyTypes','inflicts','payoffs','stages'])assert.ok(Array.isArray(m[k]),`${c.id} ${k}`);}
});
test('Crobat Flutter Trick uses one flip and selects the opponent hand',()=>{
 const s=pendingHeads(3,0,s=>{s.sides.player.hand=[ref('ex5-62','own')];s.sides.opponent.hand=[ref('ex5-60','enemy-hand')]});
 assert.equal(s.pendingChoice.kind,'opponentHandCard');assert.ok(core.legalActions(s,'player').some(x=>x.choiceCardId==='ex5-60'));assert.ok(!core.legalActions(s,'player').some(x=>x.choiceCardId==='ex5-62'));finish(s);
 assert.ok(s.sides.opponent.discard.some(x=>x.cardId==='ex5-60'));assert.equal(coinEvents(s).length,1);
});
test('Shiftry Push Aside selects a Pokémon in opponent hand, not player hand',()=>{
 const s=battle();s.sides.player.hand=[ref('ex5-63','mine')];s.sides.opponent.hand=[ref('ex5-60','enemy-card'),ref('ex5-92','enemy-trainer')];attack(s,14,0);
 assert.equal(s.pendingChoice.kind,'opponentHandCard');const opts=core.legalActions(s,'player');assert.deepEqual(opts.filter(x=>!x.choiceSkip).map(x=>x.choiceCardId),['ex5-60']);finish(s);
 assert.ok(s.sides.opponent.deck.some(x=>x.uid==='enemy-card'));assert.ok(!s.sides.opponent.hand.some(x=>x.uid==='enemy-card'));assert.equal(s.sides.player.hand[0].uid,'mine');
});
test('Chimecho Chime selects a Supporter from opponent discard',()=>{
 const s=battle();s.sides.opponent.discard=[ref('ex5-92','opponent-supporter')];s.sides.player.discard=[ref('ex5-90','player-item')];attack(s,17,0);
 assert.equal(s.pendingChoice.kind,'discardCard');assert.equal(s.pendingChoice.discardZone,'opponent');assert.deepEqual(core.legalActions(s,'player').filter(x=>!x.choiceSkip).map(x=>x.choiceCardId),['ex5-92']);finish(s);
 assert.ok(s.sides.opponent.discard.some(x=>x.uid==='opponent-supporter'));
});
test('Bellossom Miracle Powder applies one coin result, no reflip for status choice',()=>{
 const s=pendingHeads(16,0);assert.equal(s.pendingChoice.kind,'option');assert.equal(coinEvents(s).length,1);finish(s,x=>x.choiceOption===2);
 assert.equal(coinEvents(s).length,1);assert.ok(s.log.some(x=>x.type==='status'&&x.status==='burn'&&x.affectedCount===1));
});
test('Minun Minus Energy uses one coin and returns the chosen opposing Energy',()=>{
 const s=pendingHeads(67,0,s=>{s.sides.opponent.active.energy={Water:1,Fighting:1}});assert.equal(s.pendingChoice.kind,'option');const before=coinEvents(s).length;finish(s,x=>x.choiceOption===0);assert.equal(coinEvents(s).length,before);
 assert.equal(s.sides.opponent.active.energy.Water,0);assert.ok(s.sides.opponent.hand.some(x=>x.cardId==='ex1-106'));
});
test('Plusle Plus Energy only flips once, offers a target on Bench',()=>{
 const s=pendingHeads(69,0,s=>{s.sides.player.hand=[ref('ex1-109','lightning-to-attach')];s.sides.player.bench=[slot(60,'friendly')];s.sides.player.bench[0].benchSlot=0});
 assert.equal(s.pendingChoice.kind,'handCard');const one=coinEvents(s).length;finish(s,(x,st)=>st.pendingChoice?.kind==='pokemon'?x.choiceTarget==='bench':true);
 assert.equal(coinEvents(s).length,one);assert.equal(s.sides.player.bench[0].energy.Lightning,1);assert.equal(s.sides.player.hand.filter(x=>x.uid==='lightning-to-attach').length,0);
});
test('Dark Celebi Dark Provide attaches selected basic Grass Energy to chosen Bench Pokémon',()=>{
 const s=battle();s.sides.player.hand=[ref('ex1-104','grass-card')];s.sides.player.bench[0].energy={};attack(s,4,0);assert.equal(s.pendingChoice.kind,'handCard');finish(s,(x,st)=>st.pendingChoice?.kind==='pokemon'?x.choiceTarget==='bench':true);
 assert.equal(s.sides.player.bench[0].energy.Grass,1);assert.equal(s.sides.player.active.energy.Grass,7);
});
test('Life Herb does not flip a second time when choosing a Pokémon to heal',()=>{
 let s;for(let seed=1;seed<100;seed++){const trial=battle();trial.rngState=seed;trial.sides.player.hand=[ref('ex5-90','herb')];trial.sides.player.active.damage=20;const action=core.legalActions(trial,'player').find(x=>x.type==='trainer'&&x.cardId==='ex5-90');assert.ok(action);core.applyAction(trial,'player',action);if(trial.phase==='effectChoice'){s=trial;break;}}
 assert.ok(s);assert.equal(s.pendingChoice.kind,'pokemon');const count=coinEvents(s).length;finish(s,x=>x.choiceTarget==='active');assert.equal(coinEvents(s).length,count);assert.equal(s.sides.player.active.damage,0);
});
test('Igglybuff Set Song separately retrieves a Basic Pokémon AND a basic Energy',()=>{
 const s=battle();s.sides.player.deck=[ref('ex5-60','wanted-basic'),ref('ex1-104','wanted-energy')];attack(s,37,0);assert.equal(s.pendingChoice.kind,'deckCard');finish(s);
 assert.ok(s.sides.player.hand.some(x=>x.uid==='wanted-basic'));assert.ok(s.sides.player.hand.some(x=>x.uid==='wanted-energy'));assert.ok(!s.sides.player.deck.length);
});
test('Tropius Fruition moves selected Special Energy to Bench and heals its recipient',()=>{
 const s=battle();s.sides.player.active=slot(27,'attacker');s.sides.player.active.energy=mono(7);s.sides.player.active.specialEnergy=[ref('ex1-95','special')];s.sides.player.bench[0].damage=60;const play=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(play);core.applyAction(s,'player',play);assert.equal(s.pendingChoice.kind,'pokemon');finish(s,(x,st)=>st.pendingChoice?.kind==='pokemon'?x.choiceTarget==='bench':String(x.choiceLabel||'').includes('Rainbow Energy'));
 assert.equal(s.sides.player.bench[0].specialEnergy?.[0]?.uid,'special');assert.equal(s.sides.player.bench[0].damage,20);
});
test('Temperamental Weather is shared once per turn across all Castform, including new forms',()=>{
 const s=battle();s.sides.player.active=slot(30,'castform');s.sides.player.bench=[slot(23,'rain')];s.sides.player.bench[0].benchSlot=0;s.sides.player.deck=[ref('ex5-25','snow-form'),ref('ex5-26','sunny-form')];
 const abilities=core.legalActions(s,'player').filter(x=>x.type==='ability');assert.equal(abilities.length,2);
 core.applyAction(s,'player',abilities.find(x=>x.target==='active'));assert.equal(s.pendingChoice.kind,'deckCard');finish(s);
 assert.ok(['ex5-25','ex5-26'].includes(s.sides.player.active.cardId));
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='ability'&&['ex5-23','ex5-25','ex5-26','ex5-30'].includes(x.cardId)));
 s.sides.player.turnCount++;assert.ok(core.legalActions(s,'player').some(x=>x.type==='ability'&&['ex5-23','ex5-25','ex5-26','ex5-30'].includes(x.cardId)));
});
test('Castform power is not erroneously disabled by Special Conditions missing from printed text',()=>{
 const s=battle();s.sides.player.active=slot(30,'castform');s.sides.player.active.conditions={sleep:true};
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='ability'&&x.cardId==='ex5-30'));
});
test('Ancient Machines require eligible non-ex evolved Pokémon; Desert Ruins avoids self-damaging EX decks',()=>{
 const tm=classic.cardById('ex5-84'),ruins=classic.cardById('ex5-88');const ex=classic.cardById('ex5-95'),stage=classic.cardById('ex5-36');
 assert.equal(synergy.trainerScore(tm,synergy.context([ex],['Metal'])), -Infinity);
 assert.equal(synergy.trainerScore(ruins,synergy.context([ex],['Metal'])), -Infinity);
 assert.ok(synergy.trainerScore(tm,synergy.context([stage],['Grass']))>0);
 assert.ok(synergy.trainerScore(ruins,synergy.context([stage],['Grass']))>-Infinity);
 assert.deepEqual(synergy.metadata(classic.cardById('ex5-89')).energyTypes.sort(),['Fighting','Metal','Water']);
 assert.deepEqual(synergy.metadata(classic.cardById('ex5-91')).energyTypes.sort(),['Fighting','Psychic']);
 assert.ok(synergy.metadata(classic.cardById('ex5-92')).roles.includes('draw'));
 assert.ok(!synergy.metadata(classic.cardById('ex5-92')).roles.includes('disruption'));
});
test('Whirlwind lets the defending side choose which Benched Pokémon comes forward',()=>{
 const s=battle();s.sides.opponent.bench.push(slot(54,'enemy2'));s.sides.opponent.bench[1].benchSlot=1;attack(s,20,0);
 assert.equal(s.pendingChoice.kind,'switchBench');assert.equal(s.choiceSide,'opponent');
 const choices=core.legalActions(s,'opponent');assert.equal(choices.length,2);
 core.applyAction(s,'opponent',choices.find(x=>x.choiceBenchIndex===1));
 assert.equal(s.sides.opponent.active.uid,'enemy2');
});
test("Steven's Advice offers zero through the opponent Pokémon count, and the CPU-friendly default is maximum",()=>{
 const s=battle();s.sides.player.hand=[ref('ex5-92','advice')];s.sides.opponent.bench.push(slot(54,'enemy2'));s.sides.opponent.bench[1].benchSlot=1;
 const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex5-92');assert.ok(a);core.applyAction(s,'player',a);
 assert.equal(s.pendingChoice.kind,'option');const choices=core.legalActions(s,'player');assert.deepEqual(choices.map(x=>x.choiceLabel),['Draw 3 cards','Draw 2 cards','Draw 1 card','Draw 0 cards']);
 const before=s.sides.player.hand.length;core.applyAction(s,'player',choices[0]);assert.equal(s.sides.player.hand.length,before+3);
});
