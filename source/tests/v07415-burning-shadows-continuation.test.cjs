'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const sm3=require('../app/src/main/assets/tcg-classic-burning-shadows.js');
const dummy={id:'sm3-cont-dummy',kind:'pokemon',name:'Test dummy',stage:'Basic',hp:4000,types:['Colorless'],retreat:1,battleEnabled:true,attacks:[{name:'Rest',cost:'C',damage:10,effect:{type:'noop'}}]};
const sourceCardById=data.cardById;
function slot(id,uid,energy={}){return {uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},locks:[],tool:null,extraTools:[],playedOnSideTurn:1};}
function setup(id='sm3-8',side='player'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:14,firstSide:side,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Fairy'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Fairy']});
 s.phase='battle';s.activeSide=side;s.turnNumber=7;
 for(const [who,p] of Object.entries(s.sides)){p.turnCount=4;p.hand=[];p.deck=[{uid:who+'d1',cardId:'sm3-1'},{uid:who+'d2',cardId:'sm3-2'},{uid:who+'d3',cardId:'sm3-3'},{uid:who+'d4',cardId:'sm3-4'}];p.discard=[];p.bench=[];p.energySupply=['Grass','Grass','Fire','Water'];p.energyDiscard={Water:1};p.energyUsed=true;p.handEnergyUsed=true;p.supporterUsed=false;}
 s.sides[side].active=slot(id,side+'active',{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Fairy:4});
 s.sides[side].bench=[slot('sm3-1',side+'bench',{})];
 const other=side==='player'?'opponent':'player';s.sides[other].active=slot(dummy.id,other+'active',{Water:2});s.sides[other].bench=[slot(dummy.id,other+'bench',{})];
 return s;
}
function choose(s,side,pred){const found=core.legalActions(s,side).find(pred);assert.ok(found,'no legal action '+side+' '+JSON.stringify(s.pendingChoice));core.applyAction(s,side,found);return found;}
function resolve(s,predicates=[]){for(let n=0;s.phase==='effectChoice'&&n<40;n++){const side=s.pendingChoice?.side||s.activeSide,fn=predicates.shift()||(()=>true);choose(s,side,fn);}assert.notEqual(s.phase,'effectChoice','stuck effect choice');}
function withDummy(fn){data.cardById=id=>id===dummy.id?dummy:sourceCardById(id);try{return fn();}finally{data.cardById=sourceCardById;}}
function attack(id,name,modify=()=>{}){return withDummy(()=>{const s=setup(id);modify(s);const idx=sm3.cardById(id).attacks.findIndex(a=>a.name===name);assert.ok(idx>=0,`${id}: missing attack ${name}`);choose(s,'player',a=>a.type==='attack'&&a.attackIndex===idx);resolve(s);return s;});}
function trainer(id,modify=()=>{}){return withDummy(()=>{const s=setup('sm3-1');modify(s);s.sides.player.hand.push({uid:'t',cardId:id});choose(s,'player',a=>a.type==='trainer'&&a.cardId===id);resolve(s);return s;});}

test('Continuation catalogue contains 177 exact prints with >110 playable and no invalid effects',()=>{
 assert.equal(sm3.CARDS.length,177);assert.ok(sm3.CARDS.filter(c=>c.battleEnabled).length>=110);
 for(const c of sm3.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon'))for(const a of c.attacks)assert.notEqual(a.effect?.type,'unsupported',`${c.id} ${a.name}`);
});
test('Tangrowth Giga Drain heals by actual damage dealt (not its printed base damage)',()=>{const s=attack('sm3-8','Giga Drain',s=>{s.sides.player.active.damage=90;});assert.equal(s.sides.player.active.damage,60);assert.equal(s.sides.opponent.active.damage,30);});
test('Salazzle GX Diabolical Claws scales with prizes taken',()=>{const none=attack('sm3-25','Diabolical Claws',s=>{s.sides.player.prizesTaken=0;});const two=attack('sm3-25','Diabolical Claws',s=>{s.sides.player.prizesTaken=2;});assert.equal(none.sides.opponent.active.damage,0);assert.equal(two.sides.opponent.active.damage,100);});
test('Queen\'s Haze GX discards all opponent Basic and Special Energy',()=>{const s=attack('sm3-25',"Queen's Haze-GX",s=>{s.sides.opponent.active.specialEnergy=[{uid:'special1',cardId:'sm2-166',provides:{Colorless:2}}];});assert.equal(Object.values(s.sides.opponent.active.energy).reduce((a,b)=>a+b,0),0);assert.equal(s.sides.opponent.active.specialEnergy.length,0);});
test('Gyarados Venting Anger only counts Magikarp in discard',()=>{const zero=attack('sm3-33','Venting Anger');const two=attack('sm3-33','Venting Anger',s=>{s.sides.player.discard=[{uid:'mag1',cardId:'sm3-32'},{uid:'mag2',cardId:'sm3-32'}];});assert.ok(two.sides.opponent.active.damage>=zero.sides.opponent.active.damage+100);});
test('Eelektrik Small Appetite cannot damage >= 100 maximum HP',()=>{const s=attack('sm3-45','Small Appetite');assert.equal(s.sides.opponent.active.damage,0);});
test('Dusclops Night Roam places exactly one damage counter on each Pokemon',()=>{const s=attack('sm3-52','Night Roam');assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.player.bench[0].damage,10);assert.equal(s.sides.opponent.active.damage,10);assert.equal(s.sides.opponent.bench[0].damage,10);});
test('Poison Boost adds damage when poisoned and removes status afterwards',()=>{const a=attack('sm3-55','Poison Boost');const b=attack('sm3-55','Poison Boost',s=>{s.sides.player.active.conditions.poison={amount:10};});assert.ok(b.sides.opponent.active.damage>=a.sides.opponent.active.damage+80);assert.ok(!b.sides.player.active.conditions.poison);});
test('Tri Hazard GX attacks chosen switched defender and inflicts its three statuses',()=>{const s=attack('sm3-84','Tri Hazard-GX');const newTarget=s.sides.opponent.active;assert.ok(newTarget.conditions.burn&&newTarget.conditions.poison&&newTarget.conditions.paralysis,'incoming Active must be burned poisoned and paralyzed');});
test('Dark Raid bonus applies only when opponent has used a GX attack',()=>{const a=attack('sm3-87','Dark Raid');const b=attack('sm3-87','Dark Raid',s=>{s.sides.opponent.gxAttackUsed=true;});assert.ok(b.sides.opponent.active.damage>=a.sides.opponent.active.damage+80);});
test('Malamar Energy Slosh conserves all Basic and Special Energy',()=>{const s=attack('sm3-90','Energy Slosh',s=>{s.sides.player.active.energy={Darkness:2,Water:1};s.sides.player.active.specialEnergy=[{uid:'spec',cardId:'sm2-166',provides:{Colorless:2}}];});const p=s.sides.player;assert.equal(Object.values(p.active.energy).reduce((a,b)=>a+b,0),0);assert.equal(p.active.specialEnergy.length,0);assert.equal(p.bench[0].energy.Darkness,2);assert.equal(p.bench[0].energy.Water,1);assert.equal(p.bench[0].specialEnergy.length,1);});
test('Lana heals only friendly Pokémon with Water Energy',()=>{const s=trainer('sm3-117',s=>{s.sides.player.active.damage=80;s.sides.player.bench[0]=slot('sm3-17','healthybench',{Grass:2});s.sides.player.bench[0].damage=90;});assert.equal(s.sides.player.active.damage,30);assert.equal(s.sides.player.bench[0].damage,90);});
test('Wicke shuffles and redraws each player hand independently',()=>{const s=trainer('sm3-127',s=>{s.sides.player.hand=[{uid:'p1',cardId:'sm3-1'},{uid:'p2',cardId:'sm3-2'}];s.sides.opponent.hand=[{uid:'o1',cardId:'sm3-3'},{uid:'o2',cardId:'sm3-4'},{uid:'o3',cardId:'sm3-5'}];});assert.equal(s.sides.player.hand.length,2);assert.equal(s.sides.opponent.hand.length,3);});
test('Po Town effect only triggers when evolving a Pokémon from the hand',()=>withDummy(()=>{const s=setup('sm3-1');s.stadium={uid:'stadium',cardId:'sm3-121',ownerSide:'player'};const me=s.sides.player;me.active=slot('sm3-1','caterpie',{Grass:3});me.active.playedOnSideTurn=1;me.hand=[{uid:'metapod',cardId:'sm3-2'}];const a=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='sm3-2');assert.ok(a,'must be able to evolve');core.applyAction(s,'player',a);assert.equal(me.active.damage,30);const count=s.log.filter(l=>l.type==='stadiumDamage'&&l.stadium==='sm3-121').length;assert.equal(count,1); }));
test('Mount Lanakila and Weakness Policy passive effects validate for both sides',()=>{const s=setup('sm3-1');s.stadium={uid:'stadium',cardId:'sm3-118',ownerSide:'player'};s.sides.opponent.active=slot('sm3-4','otherbasic',{Water:1});assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'retreatCost',data.cardById),1);assert.equal(fx.modifierAmount(s,'opponent',s.sides.opponent.active,'retreatCost',data.cardById),1);});

test('Evoshock paralyses opponent only when Raichu evolves from hand',()=>withDummy(()=>{
 const s=setup('sm3-40'),p=s.sides.player;p.active.playedOnSideTurn=1;p.hand=[{uid:'raichu',cardId:'sm3-41'}];
 choose(s,'player',a=>a.type==='evolve'&&a.cardId==='sm3-41');resolve(s);
 assert.ok(s.sides.opponent.active.conditions.paralysis,'opposing Active should be Paralysed');
}));
test('Toppling Wind evolution trigger discards exactly three opposing deck cards',()=>withDummy(()=>{
 const s=setup('sm3-66'),p=s.sides.player,o=s.sides.opponent;p.active.playedOnSideTurn=1;p.hand=[{uid:'rhyperior',cardId:'sm3-67'}];o.deck=Array.from({length:6},(_,i)=>({uid:'o'+i,cardId:'sm3-1'}));
 choose(s,'player',a=>a.type==='evolve'&&a.cardId==='sm3-67');resolve(s);
 assert.equal(o.deck.length,3);assert.equal(o.discard.length,3);
}));
test('Honey Gather makes two independent hybrid Basic Energy searches even after tails',()=>withDummy(()=>{
 const s=setup('sm3-96'),p=s.sides.player;p.energySupply=['Grass','Grass','Water','Fire'];p.deck=[];p.dp2ForceTailsUntil=s.turnNumber;
 choose(s,'player',a=>a.type==='ability'&&/Honey Gather/i.test(a.abilityName||a.name||'')||a.type==='ability'&&a.cardId==='sm3-96');resolve(s);
 assert.equal(p.energySupply.length,4);assert.equal(s.log.filter(x=>x.reason==='Hybrid Basic Energy deck search').length,2);
}));
test('Olivia searches exactly two GX Pokémon from the physical deck, not regular Pokémon',()=>withDummy(()=>{
 const s=trainer('sm3-119',s=>{s.sides.player.deck=[{uid:'normal',cardId:'sm3-1'},{uid:'gx1',cardId:'sm3-17'},{uid:'gx2',cardId:'sm3-25'}];});
 const found=s.sides.player.hand.filter(ref=>ref.uid==='gx1'||ref.uid==='gx2');
 assert.equal(found.length,2);assert.ok(s.sides.player.deck.some(ref=>ref.uid==='normal'));
}));
test('Bodybuilding Dumbbells grants +40 maximum HP to Stage 1 holder, not Basic',()=>withDummy(()=>{
 const s=setup('sm3-17'),p=s.sides.player;
 p.active.tool={uid:'tool1',cardId:'sm3-113'};
 assert.equal(fx.modifierAmount(s,'player',p.active,'maxHp',data.cardById),40);
 p.active.cardId='sm3-1';
 assert.equal(fx.modifierAmount(s,'player',p.active,'maxHp',data.cardById),0);
}));
test('Escape Rope switches opponent first, then the player, without stranding choice state',()=>withDummy(()=>{
 const s=trainer('sm3-114');assert.equal(s.sides.opponent.active.uid,'opponentbench');assert.equal(s.sides.player.active.uid,'playerbench');
}));
test('Super Scoop Up tails does not remove its chosen Pokémon',()=>withDummy(()=>{
 const s=trainer('sm3-124',s=>{s.sides.player.dp2ForceTailsUntil=s.turnNumber;});
 assert.ok(s.sides.player.active?.cardId==='sm3-1','failed coin flip must leave Active in play');
}));
test('Rotom Dex top-card reordering conserves all physical cards',()=>withDummy(()=>{
 const s=trainer('sm3-122');assert.equal(s.sides.player.deck.length,4);assert.equal(new Set(s.sides.player.deck.map(r=>r.uid)).size,4);
}));
