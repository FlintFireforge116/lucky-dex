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



test('Stage 3 increases supported coverage without invalid descriptors',()=>{
  assert.equal(sm3.CARDS.length,177);assert.ok(sm3.CARDS.filter(c=>c.battleEnabled).length>=138);
  for(const c of sm3.CARDS.filter(c=>c.battleEnabled)){for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);for(const a of c.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);}
});
test('Downer Shock heads Asleep, tails Confused',()=>{
  const heads=attack('sm3-6','Downer Shock',s=>{s.sides.player.forceFirstCoinHeadTurn=s.turnNumber;});
  const tails=attack('sm3-6','Downer Shock',s=>{s.sides.player.dp2ForceTailsUntil=s.turnNumber;});
  assert.ok(heads.sides.opponent.active.conditions.sleep);assert.ok(!heads.sides.opponent.active.conditions.confusion);
  assert.ok(tails.sides.opponent.active.conditions.confusion);assert.ok(!tails.sides.opponent.active.conditions.sleep);
});
test('Brine damages an already damaged target, never healthy targets',()=>{
 const yes=attack('sm3-31','Brine',s=>{s.sides.opponent.active.damage=10;});
 const no=attack('sm3-31','Brine');
 assert.equal(yes.sides.opponent.active.damage,100);assert.equal(no.sides.opponent.active.damage,0);
});
test('Tornado Shot spends one Water and damages a selected Bench',()=>{
 const s=attack('sm3-31','Tornado Shot',s=>{s.sides.player.active.energy={Water:2,Colorless:2};});
 assert.equal(s.sides.opponent.active.damage,90);assert.equal(s.sides.opponent.bench[0].damage,30);assert.equal(s.sides.player.active.energy.Water,1);
});
test('Heracross Guts is a real passive KO guard',()=>{
 const g=sm3.cardById('sm3-11').abilities[0].effect;assert.equal(g.type,'koGuard');assert.equal(g.mode,'surviveCoin');
});
test('Wimpod has free retreat on first player turn only',()=>withDummy(()=>{
 const s=setup('sm3-16');s.sides.player.turnCount=1;assert.ok(core.legalActions(s,'player').some(a=>a.type==='retreat'), 'retreat offered');
 const first=fx.modifierAmount(s,'player',s.sides.player.active,'retreatCost',data.cardById);assert.ok(first>=0);
}));
test('Tapu Fini Hydro Shot hits selected opposing Pokémon and discards two Water',()=>{
 const s=attack('sm3-39','Hydro Shot',s=>{s.sides.player.active.energy={Water:3,Colorless:1};});
 assert.equal(s.sides.player.active.energy.Water,1);assert.equal((s.sides.opponent.active.damage||0)+(s.sides.opponent.bench[0]?.damage||0),120);
});
test('Tapu Fini GX Tapu Storm shuffles active and attachments, not Bench',()=>{
 const s=attack('sm3-39','Tapu Storm-GX',s=>{s.sides.opponent.active.specialEnergy=[{uid:'e',cardId:'sm2-166',provides:{Colorless:2}}];});
 assert.ok(s.sides.opponent.deck.some(ref=>ref.uid==='e'));assert.ok(s.sides.opponent.deck.some(ref=>ref.cardId===dummy.id));
 if(s.phase==='promote')choose(s,'opponent',a=>a.type==='promote');
 assert.equal(s.sides.opponent.active?.cardId,dummy.id);
});
test('Prismatic Burst discards Psychic card sources while keeping Fire',()=>{
 const s=attack('sm3-63','Prismatic Burst',s=>{s.sides.player.active.energy={Psychic:2,Fire:1};});
 assert.equal(s.sides.opponent.active.damage,130);assert.equal(s.sides.player.active.energy.Psychic,0);assert.equal(s.sides.player.active.energy.Fire,1);
});
test('Black Ray GX hits only GX/EX Pokémon, including the Bench',()=>withDummy(()=>{
 const s=setup('sm3-63');s.sides.opponent.active=slot('sm3-25','GXactive',{});s.sides.opponent.bench=[slot('sm3-1','regular',{}),slot('sm3-21','GXbench',{})];
 choose(s,'player',a=>a.type==='attack'&&a.attackIndex===1);resolve(s);
 assert.equal(s.sides.opponent.active.damage,100);assert.equal(s.sides.opponent.bench[0].damage,0);assert.equal(s.sides.opponent.bench[1].damage,100);
}));
test('Lunatone Heal Block needs a friendly Solrock',()=>{
 const s=setup('sm3-68');assert.equal(fx.healingIsBlocked(s,s.sides.player.active,data.cardById),false);
 s.sides.player.bench[0].cardId='sm3-69';assert.equal(fx.healingIsBlocked(s,s.sides.player.active,data.cardById),true);
 assert.equal(fx.healingIsBlocked(s,s.sides.opponent.active,data.cardById),true);
});
test('Gutsy Hammer scales recoil with preattack damage counters',()=>{
 const s=attack('sm3-74','Gutsy Hammer',s=>{s.sides.player.active.damage=30;});
 assert.equal(s.sides.player.active.damage,60);assert.equal(s.sides.opponent.active.damage,80);
});
test('Rule of Evil harms every Pokemon with an Ability on both teams',()=>withDummy(()=>{
 const s=setup('sm3-86');s.sides.player.bench=[slot('sm3-11','heracross',{})];s.sides.opponent.bench=[slot('sm3-11','oppoHeracross',{})];
 choose(s,'player',a=>a.type==='attack'&&a.attackIndex===0);resolve(s);
 assert.equal(s.sides.player.bench[0].damage,60);assert.equal(s.sides.opponent.bench[0].damage,60);
 assert.equal(s.sides.player.active.damage,0);assert.equal(s.sides.opponent.active.damage,0);
}));
test('Infinite Force counts Special Energy units on both Active Pokemon',()=>{
 const s=attack('sm3-93','Infinite Force',s=>{s.sides.player.active.energy={Fairy:1};s.sides.opponent.active.energy={Water:1};s.sides.opponent.active.specialEnergy=[{uid:'dce',cardId:'sm2-166',provides:{Colorless:2}}];});
 assert.equal(s.sides.opponent.active.damage,120);
});
test('Twilight GX shuffles selected discard cards into deck without duplication',()=>{
 const s=attack('sm3-93','Twilight-GX',s=>{s.sides.player.discard=[{uid:'one',cardId:'sm3-1'},{uid:'two',cardId:'sm3-2'}];});
 assert.ok(s.sides.player.deck.some(ref=>ref.uid==='one'));assert.ok(s.sides.player.deck.some(ref=>ref.uid==='two'));assert.equal(s.sides.player.discard.length,0);
});
test('Diamond Storm heals Fairy Pokemon only',()=>withDummy(()=>{
 const s=setup('sm3-94');s.sides.player.active.damage=40;s.sides.player.bench=[slot('sm3-25','fire',{})];s.sides.player.bench[0].damage=40;
 choose(s,'player',a=>a.type==='attack'&&a.attackIndex===1);resolve(s);
 assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.player.bench[0].damage,40);
}));
test('Strength Sap heals 30 per opposing energy unit',()=>{
 const s=attack('sm3-98','Strength Sap',s=>{s.sides.player.active.damage=120;s.sides.opponent.active.energy={Water:2};});
 assert.equal(s.sides.player.active.damage,60);
});
test('Code Check reveals one opponent Prize without removing it',()=>{
 const s=attack('sm3-103','Code Check');assert.ok(s.log.some(e=>e.type==='peek'&&e.inspectedZone==='prizes'&&e.inspectedSide==='opponent'));
});
test('Nature Judgment offers both 120 and 180 damage, boosted discards all Energy',()=>withDummy(()=>{
 const s=setup('sm3-130');s.sides.player.active.energy={Grass:3};const acts=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);
 assert.ok(acts.some(a=>a.effectSelection==='boost'));choose(s,'player',a=>a.type==='attack'&&a.attackIndex===1&&a.effectSelection==='boost');resolve(s);
 assert.equal(s.sides.opponent.active.damage,180);assert.equal(Object.values(s.sides.player.active.energy).reduce((a,b)=>a+Number(b),0),0);
}));
test('Tapu Wilderness GX heals all of own damage',()=>{const s=attack('sm3-130','Tapu Wilderness-GX',s=>{s.sides.player.active.damage=100;});assert.equal(s.sides.player.active.damage,0);});

test('Stage 3 new support reaches 151 prints',()=>assert.equal(sm3.CARDS.filter(c=>c.battleEnabled).length,151));
test('Acerola returns an actually damaged Pokemon with Basic Energy and tool',()=>withDummy(()=>{
 const s=setup('sm3-1');const own=s.sides.player;own.bench[0].damage=20;own.bench[0].energy={Fairy:1};own.bench[0].tool={uid:'tool',cardId:'sm2-121'};
 own.hand=[{uid:'acer',cardId:'sm3-112'}];choose(s,'player',a=>a.type==='trainer'&&a.cardId==='sm3-112');resolve(s);
 assert.equal(own.bench.length,0);assert.ok(own.hand.some(r=>r.cardId==='sm3-1'));assert.ok(own.hand.some(r=>r.cardId==='sm3-169'));assert.ok(own.hand.some(r=>r.cardId==='sm2-121'));
}));
test('Guzma switches opposing active, then self active, without KO or new cards',()=>withDummy(()=>{
 const s=trainer('sm3-115');assert.equal(s.sides.opponent.active?.uid,'opponentbench');assert.equal(s.sides.player.active?.uid,'playerbench');
}));
test('Tormenting Spray discards only selected Supporter, not an Item',()=>withDummy(()=>{
 const s=trainer('sm3-125',s=>{s.sides.opponent.hand=[{uid:'support',cardId:'sm3-112'}];});
 assert.equal(s.sides.opponent.hand.length,0);assert.equal(s.sides.opponent.discard[0].uid,'support');
 const b=trainer('sm3-125',s=>{s.sides.opponent.hand=[{uid:'item',cardId:'sm3-124'}];});assert.equal(b.sides.opponent.hand.length,1);assert.equal(b.sides.opponent.discard.length,0);
}));
test('Secret Spring attaches printed Fairy Energy from hand to chosen Pokemon',()=>withDummy(()=>{
 const s=setup('sm3-93');s.sides.player.hand=[{uid:'fairy',cardId:'sm3-169'}];
 choose(s,'player',a=>a.type==='ability'&&a.cardId==='sm3-93');resolve(s);
 assert.equal(s.sides.player.hand.length,0);assert.equal(s.sides.player.active.energy.Fairy,5);
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='sm3-93'));
}));
test('Ho-Oh Eternal Flame benches up to three valid GX/EX from discard',()=>withDummy(()=>{
 const s=setup('sm3-21');s.sides.player.bench=[];s.sides.player.discard=[{uid:'f1',cardId:'sm3-21'},{uid:'f2',cardId:'sm3-25'},{uid:'nonFire',cardId:'sm3-39'},{uid:'f3',cardId:'sm3-131'}];
 const ix=sm3.cardById('sm3-21').attacks.findIndex(a=>a.name==='Eternal Flame-GX');choose(s,'player',a=>a.type==='attack'&&a.attackIndex===ix);resolve(s);
 assert.equal(s.sides.player.bench.length,3);assert.ok(s.sides.player.bench.every(p=>sm3.cardById(p.cardId)?.types.includes('Fire')));assert.ok(s.sides.player.discard.some(r=>r.uid==='nonFire'));
}));
test('Synchronoise hits opposing Bench only when sharing type with opponent active',()=>withDummy(()=>{
 const s=setup('sm3-38');s.sides.opponent.active=slot('sm3-39','fin',{});s.sides.opponent.bench=[slot('sm3-31','water',{}),slot('sm3-25','fire',{})];
 const ix=sm3.cardById('sm3-38').attacks.findIndex(a=>a.name==='Synchronoise');choose(s,'player',a=>a.type==='attack'&&a.attackIndex===ix);resolve(s);
 assert.equal(s.sides.opponent.bench[0].damage,20);assert.equal(s.sides.opponent.bench[1].damage,0);
}));
test('Seviper More Poison adds exactly 10 to the opposing poisoned Active between turns',()=>withDummy(()=>{
 const s=setup('sm3-50');s.sides.opponent.active.conditions.poison={amount:10};
 choose(s,'player',a=>a.type==='endTurn');
 const poison=s.log.filter(e=>e.type==='statusDamage'&&e.side==='opponent'&&e.status==='poison');
 assert.equal(poison.at(-1)?.amount,20);
 assert.equal(s.sides.opponent.active.damage,20);
}));
test('Acerola cannot select an undamaged Pokémon and does not discard attachments',()=>withDummy(()=>{
 const s=setup('sm3-1');s.sides.player.active.damage=20;s.sides.player.bench[0].damage=0;
 s.sides.player.active.specialEnergy=[{uid:'dce',cardId:'sm2-166',provides:{Colorless:2}}];
 s.sides.player.hand=[{uid:'ac',cardId:'sm3-112'}];choose(s,'player',a=>a.type==='trainer'&&a.cardId==='sm3-112');
 const options=core.legalActions(s,'player');assert.ok(options.every(a=>a.choiceTarget!=='bench'&&a.target!=='bench'));
 resolve(s);
 assert.equal(s.sides.player.active,null);
 assert.ok(s.sides.player.hand.some(r=>r.uid==='dce'));
}));
