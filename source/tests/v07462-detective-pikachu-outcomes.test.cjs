'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='det1-1'){
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
const set=require('../app/src/main/assets/tcg-classic-detective-pikachu.js');
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));
for(const side of ['player','opponent']){
 test(side+' every enabled attack executes and exits effect choice with real catalogue cards',()=>{
  let count=0;const failures=[];
  for(const c of set.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const [idx,a] of c.attacks.entries()){
   const h=setup(side,c.id);try{
    h.us.active.energy={...allEnergy};h.us.prizes.length=h.them.prizes.length=3;
    h.us.bench=['sm6-1','sm6-21','sm6-36'].map((id,i)=>({...slot(id,side+'b'+i,{Water:1}),benchSlot:i}));
    h.us.hand=[ref('sm6-108','judge'),ref('neo1-111','water'),ref('sm6-1','grass')];
    h.us.discard=[ref('sm6-112','tool'),ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];
    h.us.energyDiscard={Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.bench[0].damage=10;
    h.them.hand=[ref('sm6-108','foe-judge'),ref('sm6-112','foe-tool')];
    h.them.bench[0].specialEnergy=[ref('sm6-118','foe-unit')];
    if(a.name==='Destiny Stinger')h.us.active.damage=10;
    if(a.name==='Special Combo'){h.us.lastAttackName='Hit and Run';h.us.lastAttackTurn=h.s.turnNumber-2;h.us.lastAttackCardId='sm9-74';}
    if(['Psychic Abduction','Bawl','Secondary Chills'].includes(a.name)){h.s.firstSide=h.foe;h.us.turnCount=1;h.s.turnNumber=2;}
    const actions=core.legalActions(h.s,side).filter(x=>x.type==='attack'&&x.attackIndex===idx);
    assert.ok(actions.length,'no legal attack');core.applyAction(h.s,side,actions[0]);
    let steps=0;while(h.s.phase==='effectChoice'&&steps++<100){const who=h.s.choiceSide||side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length,'empty choice');core.applyAction(h.s,who,choices.find(x=>!x.choiceSkip)||choices[0]);}
    assert.notEqual(h.s.phase,'effectChoice','stuck effect choice');count++;
   }catch(e){failures.push(`${c.id} ${a.name}: ${e.message}`);}finally{h.done();}
  }
  assert.deepEqual(failures,[]);assert.equal(count,set.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });

}
function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<40){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}


for(const side of ['player','opponent']){
 test(side+' Pantomime exchanges face-down Prize only and preserves card identities',()=>{const h=setup(side);try{h.us.hand=[ref('det1-11','mime')];h.us.prizes=[{...ref('sm6-1','visible'),faceUp:true},ref('sm6-21','hidden')];h.us.deck=[ref('sm6-36','top'),ref('sm6-1','next')];use(h,'bench',a=>a.cardId==='det1-11');const choices=core.legalActions(h.s,side);assert.equal(choices.filter(x=>!x.choiceSkip).length,1);assert.equal(choices.find(x=>!x.choiceSkip).choicePrizeIndex,1);assert.equal(choices.find(x=>!x.choiceSkip).choiceCardId,undefined);choice(h,a=>a.choicePrizeIndex===1);assert.equal(h.us.prizes[0].uid,'visible');assert.equal(h.us.prizes[1].uid,'top');assert.equal(h.us.deck[0].uid,'hidden');}finally{h.done();}});
 test(side+' Security Guard reduces attack damage on Active and Bench, but not when benched',()=>{const h=setup(side,'det1-6');try{assert.equal(fx.modifierAmount(h.s,side,h.us.active,'damageReduction',data.cardById),30);assert.equal(fx.modifierAmount(h.s,side,h.us.bench[0],'damageReduction',data.cardById),30);const a=h.us.active;h.us.active=h.us.bench[0];h.us.bench[0]=a;assert.equal(fx.modifierAmount(h.s,side,h.us.active,'damageReduction',data.cardById),0);}finally{h.done();}});
 test(side+' Table Service heals only chosen Pokémon by 30',()=>{const h=setup(side,'det1-2');try{h.us.active.damage=50;h.us.bench[0].damage=50;use(h,'ability');choice(h,a=>a.choiceTarget==='bench');assert.equal(h.us.active.damage,50);assert.equal(h.us.bench[0].damage,20);}finally{h.done();}});
 test(side+' Break Burn discards two Psychic not unrelated Fire',()=>{const h=setup(side,'det1-12');try{h.us.active.energy={Psychic:2,Fire:1};attack(h,'Break Burn');resolve(h);assert.equal(h.us.active.energy.Psychic||0,0);assert.equal(h.us.active.energy.Fire,1);assert.equal(h.them.active.damage,130);}finally{h.done();}});
 test(side+' Healing Melody heals each own Pokémon and no opposing Pokémon',()=>{const h=setup(side,'det1-14');try{h.us.active.energy={Fairy:1};h.us.active.damage=30;h.us.bench[0].damage=30;h.them.active.damage=30;attack(h,'Healing Melody');resolve(h);assert.equal(h.us.active.damage,20);assert.equal(h.us.bench[0].damage,20);assert.equal(h.them.active.damage,30);}finally{h.done();}});
 test(side+' Punch and Run switches the attacker after damage',()=>{const h=setup(side,'det1-2');try{let old=h.us.active.uid,bench=h.us.bench[0].uid;attack(h,'Punch and Run');resolve(h);assert.equal(h.us.active.uid,bench);assert.equal(h.us.bench[0].uid,old);assert.equal(h.them.active.damage,70);}finally{h.done();}});
}
