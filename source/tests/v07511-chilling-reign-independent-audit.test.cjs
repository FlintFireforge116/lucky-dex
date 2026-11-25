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
const sets=[require('../app/src/main/assets/tcg-classic-chilling-reign.js')];
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
const ai=require('../app/src/main/assets/tcgp-battle-ai.js');
const rows=require('../data/classic/swsh6-print-compact.json');
const cards=sets[0].CARDS;
test('every full-print equivalent has identical mechanics, and metadata matches all 233 canonical rows',()=>{
 const groups=new Map();let repeats=0;
 for(let i=0;i<rows.length;i++){
  const r=rows[i],c=cards[i];assert.equal(c.number,r[0]);assert.equal(c.name,r[1]);assert.equal(c.rarity,r[12]);assert.ok(c.battleEnabled&&c.deckEligible);assert.equal(c.singleStrike,r[3].includes('Single Strike'));assert.equal(c.rapidStrike,r[3].includes('Rapid Strike'));
  if(c.kind==='pokemon'){assert.equal(c.hp,Number(r[4]));assert.deepEqual(c.types,r[5]);assert.equal(c.evolvesFrom,r[6]);assert.equal(c.weakness,r[9]);assert.equal(c.resistance,r[10]);assert.equal(c.retreat,r[11]);}
  else assert.equal(c.text,r[13].join('\n'));
  const sig=JSON.stringify(r.slice(1,12).concat(r.slice(13)));const other=groups.get(sig);
  if(other){for(const k of ['attacks','abilities','effect','trainerType','prizeCards','tags','stage','energyType','basicEnergy','specialEnergy'])assert.deepEqual(c[k],other[k],c.id+' '+k);repeats++;}else groups.set(sig,c);
 }
 assert.equal(repeats,65);assert.equal(groups.size,168);
});
for(const side of ['player','opponent']){
 test(side+' Shaymin Return can decline or draw to six after damaging',()=>{for(const yes of [false,true]){const h=setup(side,'swsh6-123');try{h.us.active.energy={Grass:1};h.us.hand=[ref('swsh6-4','keep')];attack(h,'Return');choice(h,x=>x.choiceOption===(yes?0:1));resolve(h);assert.equal(h.us.hand.length,yes?6:1);assert.equal(h.them.active.damage,10);}finally{h.done();}}});
 test(side+' Brazen Tail blocks the opponent outcome of Super Energy Removal 2, not the self-discard outcome',()=>{for(const heads of [false,true]){const h=setup(side,'swsh6-1');try{h.them.bench[0].cardId='swsh6-128';h.them.active.energy={Water:2};h.us.active.energy={Grass:2};h.us.active.specialEnergy=[ref('swsh6-158','own')];h.them.active.specialEnergy=[ref('swsh6-158','foe')];if(heads)h.s.rngState=1;else h.us.dp2ForceTailsUntil=h.s.turnNumber;trainer(h,'ecard2-134');resolve(h);assert.equal(h.them.active.energy.Water,2);assert.equal(h.them.active.specialEnergy[0].uid,'foe');assert.equal(h.us.active.energy.Grass||0,heads?2:0);assert.equal(h.us.active.specialEnergy.length,heads?1:0);assert.equal(h.s.log.filter(x=>x.type==='coin').length,2);}finally{h.done();}}});
 test(side+' secret Bronzong reprint moves Metal Energy only once per chosen move',()=>{const h=setup(side,'swsh6-1');try{h.us.bench[0].cardId='swsh6-223';h.us.bench[0].energy={Metal:2};h.us.active.energy={Grass:1};use(h,'ability',a=>a.cardId==='swsh6-223');resolve(h);assert.equal(h.us.active.energy.Metal,1);assert.equal(h.us.bench[0].energy.Metal,1);assert.ok(core.legalActions(h.s,side).some(a=>a.type==='ability'&&a.cardId==='swsh6-223'));}finally{h.done();}});
 test(side+' secret Snorlax Gormandize draws to seven and ends turn',()=>{const h=setup(side,'swsh6-224');try{h.us.hand=[ref('swsh6-1','keep')];use(h,'ability');resolve(h);assert.equal(h.us.hand.length,7);assert.equal(h.s.activeSide,h.foe);}finally{h.done();}});
}
test('both Electrode prints share CPU suicide prevention when opponent needs only one prize',()=>{for(const id of ['swsh4-46','swsh6-222']){const h=setup('opponent','swsh6-47');try{h.us.bench[0].cardId=id;h.us.bench[0].stack=[id];h.us.active.energy={};h.us.deck.unshift(ref('neo1-109','energy'));h.us.energySupply=[];h.them.prizes.length=1;assert.ok(core.legalActions(h.s,h.side).some(a=>a.type==='ability'&&a.cardId===id));const pick=ai.chooseAction(h.s,h.side,'Beginner',0);assert.notEqual(pick?.type,'ability');}finally{h.done();}}});
