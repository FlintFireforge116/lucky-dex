'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm12-4'){
 const old=data.cardById,dummy={id:'sm6-dummy',name:'Test target',kind:'pokemon',stage:'Basic',hp:1000,types:['Colorless'],subtype:'Colorless',retreat:1,battleEnabled:true,deckEligible:true,attacks:[{name:'Tap',cost:[],damage:10,effect:{type:'noop'}}],abilities:[]};data.cardById=x=>x===dummy.id?dummy:old(x);
 const s=structuredClone(baseBattle||(baseBattle=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:32132,firstSide:'player',playerEnergyTypes:['Psychic','Fighting'],opponentEnergyTypes:['Psychic','Fighting']})));s.phase='battle';s.activeSide=side;s.turnNumber=7;
 const foe=side==='player'?'opponent':'player';
 for(const name of ['player','opponent']){let b=s.sides[name];b.turnCount=4;b.hand=[];b.deck=Array.from({length:15},(_,i)=>ref('sm6-1',name+'d'+i));b.prizes=Array.from({length:5},(_,i)=>ref('sm6-1',name+'p'+i));b.discard=[];b.energyDiscard={};b.energySupply=['Psychic','Fighting','Psychic'];b.active=slot(name===side?id:dummy.id,name+'a',{Grass:3,Psychic:3,Fighting:3,Metal:3,Colorless:3});b.bench=[slot(dummy.id,name+'b')];b.bench[0].benchSlot=0;}
 return {s,side,foe,us:s.sides[side],them:s.sides[foe],done:()=>data.cardById=old};
}
function use(h,type,find=()=>true){const a=core.legalActions(h.s,h.s.choiceSide||h.side).find(x=>x.type===type&&find(x));assert.ok(a,`${type}: ${JSON.stringify(core.legalActions(h.s,h.s.choiceSide||h.side))}`);core.applyAction(h.s,h.s.choiceSide||h.side,a);return a;}
function attack(h,name){const idx=data.cardById(h.us.active.cardId).attacks.findIndex(a=>a.name===name);return use(h,'attack',a=>a.attackIndex===idx);}
function choice(h,pred){return use(h,'effectChoice',pred);}
function trainer(h,id){h.us.hand.push(ref(id,'trainer'));return use(h,'trainer',a=>a.cardId===id);}
const sets=[require('../app/src/main/assets/tcg-classic-evolving-skies.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
const cards=sets[0].CARDS,rows=require('../data/classic/swsh7-print-compact.json'),ai=require('../app/src/main/assets/tcgp-battle-ai.js');
test('all 237 prints preserve canonical metadata and every 61 full-print reprint has identical mechanics',()=>{
 const groups=new Map();let repeats=0;
 for(let i=0;i<rows.length;i++){
  const r=rows[i],c=cards[i];assert.equal(c.number,r[0]);assert.equal(c.name,r[1]);assert.equal(c.rarity,r[12]);assert.ok(c.battleEnabled&&c.deckEligible);assert.equal(c.singleStrike,r[3].includes('Single Strike'));assert.equal(c.rapidStrike,r[3].includes('Rapid Strike'));
  if(c.kind==='pokemon'){assert.equal(c.hp,Number(r[4]));assert.deepEqual(c.types,r[5]);assert.equal(c.evolvesFrom,r[6]);assert.equal(c.weakness,r[9]);assert.equal(c.resistance,r[10]);assert.equal(c.retreat,r[11]);}else assert.equal(c.text,r[13].join('\n'));
  const sig=JSON.stringify(r.slice(1,12).concat(r.slice(13)));const other=groups.get(sig);
  if(other){for(const k of ['attacks','abilities','effect','trainerType','prizeCards','tags','stage','energyType','basicEnergy','specialEnergy'])assert.deepEqual(c[k],other[k],c.id+' '+k);repeats++;}else groups.set(sig,c);
 }assert.equal(repeats,61);assert.equal(groups.size,176);
});
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Dragon','Colorless'];
for(const type of types)test(type+' player/CPU decks: three seeds, legal 30-card decks and no gated prints',()=>{
 const b=require('../app/src/main/assets/tcg-classic-deck-builder.js'),o=require('../app/src/main/assets/tcg-classic-opponents.js'),owned=cards.map(c=>({gameplayId:c.id,quantity:4}));
 for(const seed of [3,17,59])for(const r of [b.buildDeck(owned,{sets:['swsh7'],types:[type],randomSeed:seed}),o.generate({seed,sets:['swsh7'],type})]){assert.ok(r.ok,JSON.stringify(r));assert.equal(r.cards.length,30);assert.ok(data.validateDeck(r.cards).ok);assert.ok(r.cards.every(id=>data.cardById(id)?.setId==='swsh7'&&data.cardById(id)?.battleEnabled));assert.ok(!r.energyTypes.includes('Dragon'));}
});
for(const side of ['player','opponent']){
 test(side+' Primeval Beak stops historical Erika Venusaur Growth hand acceleration but retains hand refs',()=>{const h=setup(side,'gym2-4');try{h.us.active.energy={Grass:1};h.us.active.swsh7PrimevalUntil=h.s.turnNumber;h.us.hand=[ref('neo1-108','grass1'),ref('neo1-108','grass2')];attack(h,'Growth');resolve(h);assert.equal(h.us.active.energy.Grass,1);assert.deepEqual(h.us.hand.map(r=>r.uid),['grass1','grass2']);}finally{h.done();}});
 test(side+' Peonia is an exchange: neither Dream Ball nor Treasure Energy activates or increments taken Prizes',()=>{const h=setup(side);try{h.us.prizes=[ref('swsh7-146','dream'),ref('swsh7-165','treasure'),ref('swsh7-24','third')];h.us.hand=[ref('swsh7-24','replacement1'),ref('swsh7-24','replacement2')];h.us.deck.unshift(ref('swsh7-14','evolved'));const n=h.us.prizesTaken;trainer(h,'swsh6-149');choice(h,a=>a.choicePrizeIndex===0);choice(h,a=>a.choicePrizeIndex===0);choice(h,a=>a.choiceSkip);resolve(h,a=>a.choiceCardId==='swsh7-24');assert.equal(h.us.prizesTaken,n);assert.ok(h.us.hand.some(r=>r.uid==='dream'));assert.ok(h.us.hand.some(r=>r.uid==='treasure'));assert.equal(h.us.prizes.length,3);assert.ok(!h.s.log.some(x=>x.type==='swsh7PrizeReaction'));}finally{h.done();}});
 test(side+' Lt Surge Treaty claims genuine Prizes and Treasure only activates on its owner turn',()=>{const h=setup(side);try{h.us.prizes=h.us.prizes.map((_,i)=>ref('swsh7-165','own'+i));h.them.prizes=h.them.prizes.map((_,i)=>ref('swsh7-165','foe'+i));const before=[h.us.prizesTaken,h.them.prizesTaken];trainer(h,'gym1-112');choice(h,a=>a.choiceOption===0);let reactions=0,steps=0;while(h.s.phase==='effectChoice'&&steps++<20){if(h.s.pendingChoice.special==='swsh7PrizeReaction'){reactions++;assert.equal(h.s.choiceSide,side);choice(h,a=>a.choiceTarget==='active');}else choice(h,a=>!a.choiceSkip);}assert.equal(reactions,1);assert.equal(h.us.prizesTaken,before[0]+1);assert.equal(h.them.prizesTaken,before[1]+1);assert.equal(h.us.active.specialEnergy[0].cardId,'swsh7-165');assert.ok(h.them.hand.some(r=>r.cardId==='swsh7-165'));assert.equal(h.them.active.specialEnergy.length,0);}finally{h.done();}});
}
test('CPU Treasure Energy charges an unpowered attacker rather than overcharging its Active',()=>{const h=setup('opponent','swsh7-28');try{h.us.active.energy={Water:6,Colorless:3};h.us.bench[0]=Object.assign(slot('swsh7-31','suicune',{Water:1}),{benchSlot:0});h.them.active=slot('swsh7-24','victim');h.us.prizes=h.us.prizes.map((_,i)=>ref('swsh7-165','treasure'+i));attack(h,'Heavy Storm');assert.equal(h.s.pendingChoice?.special,'swsh7PrizeReaction');const a=ai.chooseAction(h.s,'opponent','Expert',0);assert.equal(a.choiceTarget,'bench');core.applyAction(h.s,'opponent',a);assert.equal(h.us.bench[0].specialEnergy[0].cardId,'swsh7-165');}finally{h.done();}});
test('CPU Dream Ball prefers a viable evolved attacker to a low HP Basic at the top of its deck',()=>{const h=setup('opponent','swsh7-28');try{h.us.active.energy={Water:4,Colorless:1};h.us.energySupply=['Water'];h.them.active=slot('swsh7-24','victim');h.us.prizes=h.us.prizes.map((_,i)=>ref('swsh7-146','dream'+i));h.us.deck=[ref('swsh7-24','basic'),ref('swsh7-29','vmax')];attack(h,'Heavy Storm');assert.equal(h.s.pendingChoice?.special,'swsh7PrizeReaction');const a=ai.chooseAction(h.s,'opponent','Expert',0);assert.equal(a.choiceCardId,'swsh7-29');core.applyAction(h.s,'opponent',a);assert.ok(h.us.bench.some(p=>p.uid==='vmax'));}finally{h.done();}});
