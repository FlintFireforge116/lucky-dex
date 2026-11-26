'use strict';
// Diagnostic, not a release gate: compare selected/spread legacy damage with
// equal-provision DCE and still-gated DTE fixtures on neutral dummy targets.
// A mismatch needs printed-rule review (e.g. poison adds non-attack damage).
// A zero/unavailable fixture is not proof of correctness. The default run is
// read-only and emits JSON; --both repeats the scan for the opponent side.
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
const energy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));
const dummy={id:'sm6-dummy',name:'Audit target',kind:'pokemon',stage:'Basic',hp:1000,types:['Colorless'],subtype:'Colorless',retreat:1,battleEnabled:true,deckEligible:true,attacks:[{name:'Tap',cost:[],damage:10,effect:{type:'noop'}}],abilities:[]};
const template=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:32132,firstSide:'player',playerEnergyTypes:['Psychic','Fighting'],opponentEnergyTypes:['Psychic','Fighting']});
const basicCards=data.CARDS.filter(c=>c.basicEnergy).slice(0,6);
function run(id,name,turbo,side){
 const lookup=data.cardById;data.cardById=x=>x===dummy.id?dummy:lookup(x);
 try{
  const state=structuredClone(template),foe=side==='player'?'opponent':'player',us=state.sides[side],them=state.sides[foe];state.phase='battle';state.activeSide=side;state.turnNumber=7;
  for(const who of ['player','opponent']){const board=state.sides[who];board.turnCount=4;board.hand=[];board.deck=Array.from({length:15},(_,i)=>ref('sm6-1',who+'d'+i));board.prizes=Array.from({length:5},(_,i)=>ref('sm6-1',who+'p'+i));board.discard=[];board.energyDiscard={};board.energySupply=['Psychic','Fighting','Psychic'];board.active=slot(who===side?id:dummy.id,who+'a');board.bench=[slot(dummy.id,who+'b')];board.bench[0].benchSlot=0;}
  us.active.energy={...energy};us.active.specialEnergy=[{...ref(turbo?'swsh9-151':'base1-96','energy'),provides:{Colorless:2}}];us.hand=basicCards.map((c,i)=>ref(c.id,'hand'+i));us.sm12WillTurn=state.turnNumber;us.sm12WillResult=true;them.active.energy={Water:2};them.bench[0].energy={Water:2};
  if(id==='dp7-99')us.hand=[ref('base1-100','light1'),ref('base1-100','light2')];
  const idx=data.cardById(id).attacks.findIndex(a=>a.name===name),actions=core.legalActions(state,side).filter(a=>a.type==='attack'&&a.attackIndex===idx);
  if(!actions.length)throw Error('no attack action');
  core.applyAction(state,side,actions.find(a=>a.target==='opponentBench'||a.effectTarget==='opponentBench'||a.choiceTarget==='bench')||actions[0]);
  let n=0;while(state.phase==='effectChoice'&&n++<100){const who=state.choiceSide||side,opts=core.legalActions(state,who).filter(a=>a.type==='effectChoice');if(!opts.length)throw Error('empty choice');core.applyAction(state,who,opts.find(a=>a.choiceTarget==='bench'&&!a.choiceSkip)||opts.find(a=>!a.choiceSkip)||opts[0]);}
  if(state.phase==='effectChoice')throw Error('choice loop');
  return [them.active?.damage||0,them.bench[0]?.damage||0];
 }finally{data.cardById=lookup;}
}
const legacy=new Set(['neoRule','sm7Rule','sm1Rule','sm3Rule','sm5Rule','sm6Rule','sm8Rule','sm9Rule']);
const known=new Set(['ex10-102:Snap Tail','ex11-82:Dig Under','dp7-99:Voltage Shoot']);
const printed=/\b(?:does|do|deal) (?:\d+|that much) (?:more )?damage to (?:\d+ of |each of |all of |any of |one of )?(?:your opponent|the opponent|each Pokémon)/i;
const selected=/choose \d+ of your opponent.s (?:Benched )?Pokémon[\s\S]*?(?:does|do|deal) \d+ damage to (?:that Pokémon|each)/i;
const report={scope:'synthetic neutral-target diagnostic; review printed effects and unexercised branches; not a completion gate',eligible:0,ran:0,zero:0,errors:[],mismatches:[]};
for(const side of process.argv.includes('--both')?['player','opponent']:['player'])for(const c of data.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const a of c.attacks||[]){
 const explicit=known.has(c.id+':'+a.name);
 if(!explicit&&(!legacy.has(a.effect?.type)||/damage counter/i.test(a.text||'')||!(printed.test(a.text||'')||selected.test(a.text||''))))continue;
 report.eligible++;
 try{const base=run(c.id,a.name,false,side),turbo=run(c.id,a.name,true,side);if(!base.some(x=>x>0)){report.zero++;continue;}report.ran++;const expected=base.map(v=>Math.max(0,v-20));if(turbo.some((v,i)=>v!==expected[i]))report.mismatches.push({side,id:c.id,name:a.name,base,turbo,expected,rule:a.effect?.rule,text:a.text});}
 catch(e){report.errors.push({side,id:c.id,name:a.name,reason:e.message.slice(0,150)});}
}
console.log(JSON.stringify(report,null,2));
