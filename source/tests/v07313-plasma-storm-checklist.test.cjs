'use strict';
// Checklist regressions are intentionally independent of generated smoke summaries.
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(root,'tcgp-battle-core.js'));
const fx=require(path.join(root,'tcgp-battle-effects.js'));
const data=require(path.join(root,'tcg-classic-battle-data.js'));
const set=require(path.join(root,'tcg-classic-plasma-storm.js'));
const ref=(id,uid)=>({cardId:id,uid:uid||id});
const mon=(id,uid)=>({...core.makePokemonSlot(id,1,uid||id),benchSlot:0,damage:0});
function scene(){const side=()=>({active:mon('bw8-1'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energySupply:[],prizes:[ref('bw8-1')],prizesTaken:0,turnCount:3,handLimit:8,benchLimit:3,trainerUsed:false,supporterUsed:false});return {format:'classic',phase:'battle',activeSide:'player',turnNumber:7,stadium:null,sides:{player:side(),opponent:side()},rules:{benchSize:3,winMode:'prizes'},log:[],rngState:1};}
const rule=k=>({type:'neoRule',rule:'bw8:'+k});
function fire(s,e,opts={}){let choice=null;fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action:opts.action||{},isAttack:!!opts.isAttack,resolvingChoice:!!opts.resolvingChoice,requestChoice:x=>choice=x,random:()=>0.1,shuffle:()=>{},drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r;},onEvolved:()=>{},onEnergyAttached:()=>{},...opts.ctx});return choice;}
const trainerActions=s=>core.legalActions(s,'player').filter(x=>x.type==='trainer');
test('Team Plasma Grunt can pay its discard cost with a second identical physical Grunt',()=>{
 const s=scene();s.sides.player.hand=[ref('bw8-125','grunt-1'),ref('bw8-125','grunt-2')];
 assert.deepEqual(trainerActions(s).map(x=>x.handIndex),[0,1]);
 s.sides.player.deck=[ref('bw8-1','draw-1'),ref('bw8-1','draw-2')];
 const q=fire(s,rule('teamPlasmaGrunt'));assert.equal(q.kind,'option');assert.equal(q.options.length,2);
 fire(s,{...rule('teamPlasmaGrunt'),stage:'discard'},{resolvingChoice:true,action:{choiceOption:1}});
 assert.deepEqual(s.sides.player.discard.map(x=>x.uid),['grunt-2']);
});
test('Dowsing Machine playable when the Trainer it can retrieve will be discarded as cost',()=>{
 const s=scene();s.sides.player.hand=[ref('bw8-128','ace'),ref('bw8-120','rope'),ref('bw8-1','extra')];
 assert.ok(trainerActions(s).some(a=>a.cardId==='bw8-128'));
 // Can't pay two other cards if only its own copy and one spare.
 s.sides.player.hand=[ref('bw8-128','ace'),ref('bw8-120','rope')];
 assert.ok(!trainerActions(s).some(a=>a.cardId==='bw8-128'));
});
test('Wreck discards an opponent-owned Stadium into opponent discard, preserving UID',()=>{
 const s=scene();s.stadium={...ref('bw8-126','opp-stadium'),ownerSide:'opponent'};
 fire(s,rule('wreck'),{isAttack:true});
 assert.equal(s.stadium,null);assert.deepEqual(s.sides.player.discard,[]);
 assert.deepEqual(s.sides.opponent.discard.map(r=>r.uid),['opp-stadium']);
});
test('Smogbank and Hail respect Eviolite on Basic Bench, but not Stage 1 and 2',()=>{
 const s=scene();s.sides.player.active=mon('bw8-58','weezing');
 const basic=mon('bw8-1','basic'),stage1=mon('bw8-2','stage1');
 basic.tool=ref('bw8-122','physical-eviolite');
 s.sides.opponent.bench=[basic,stage1];
 fire(s,rule('smogbank'),{isAttack:true});
 assert.equal(basic.damage,0);assert.equal(stage1.damage,20);
 fire(s,rule('hail'),{isAttack:true});
 assert.equal(basic.damage,0);assert.equal(stage1.damage,30);
});
test('Bench-wide attack damage obeys existing attack-protection guards',()=>{
 const s=scene();const target=mon('bw8-1','protected');s.sides.opponent.bench=[target];
 // The generic handler checks the existing attack protection flags.
 target.attackGuard={kind:'preventDamage',expiresTurn:100};
 const before=target.damage;fire(s,rule('smogbank'),{isAttack:true});
 assert.equal(target.damage,before,'protected Bench must not take raw direct damage');
});
test('Clefable Moon Guidance does not evolve a Pokémon placed on this turn or already evolved',()=>{
 const s=scene();s.sides.player.deck=[ref('bw8-2','grotle')];s.sides.player.active=mon('bw8-1','turtwig');
 s.sides.player.active.playedOnSideTurn=3;
 assert.equal(fire(s,rule('moonGuidance')),null);
 s.sides.player.active.playedOnSideTurn=2;
 assert.equal(fire(s,rule('moonGuidance')).kind,'pokemon');
 s.sides.player.active.evolvedOnTurn=7;
 assert.equal(fire(s,rule('moonGuidance')),null);
});
test('BW8 card synergy tags describe real energy acceleration, not any Energy attachment or cost',()=>{
 const accel=new Set([18,34,37,47,131,137]);
 for(const c of set.CARDS.filter(c=>c.kind==='pokemon')){
  const has=c.deckMeta.roles.includes('ramp');
  assert.equal(has,accel.has(Number(c.number)),`${c.id} ${c.name}: incorrect ramp metadata`);
 }
 assert.ok(!set.cardById('bw8-14').deckMeta.roles.includes('ramp'));
 assert.ok(!set.cardById('bw8-25').deckMeta.roles.includes('ramp'));
 assert.ok(set.cardById('bw8-137').deckMeta.roles.includes('ramp'));
});

test('Dowsing pays two selected physical hand cards and may recover a Trainer discarded as cost',()=>{
 const s=scene();s.sides.player.hand=[ref('bw8-120','physical-rope'),ref('bw8-1','physical-spare')];s.sides.player.discard=[ref('bw8-128','played-dowsing')];
 const action={trainerRef:ref('bw8-128','played-dowsing')};
 const q1=fire(s,rule('dowsingMachine'),{action});assert.equal(q1.kind,'option');assert.equal(q1.options.length,2);
 const q2=fire(s,{...rule('dowsingMachine'),stage:'discard',remaining:2},{action:{...action,choiceOption:0},resolvingChoice:true});
 assert.equal(q2.options.length,1);assert.equal(s.sides.player.discard.at(-1).uid,'physical-rope');
 const q3=fire(s,{...rule('dowsingMachine'),stage:'discard',remaining:1},{action:{...action,choiceOption:0},resolvingChoice:true});
 assert.deepEqual(q3.options,['Recover Escape Rope']);
 fire(s,{...rule('dowsingMachine'),stage:'take'},{action:{...action,choiceOption:0},resolvingChoice:true});
 assert.deepEqual(s.sides.player.hand.map(x=>x.uid),['physical-rope']);
 assert.ok(s.sides.player.discard.some(x=>x.uid==='played-dowsing'));
});
test('Scramble Switch Done ends the optional Energy-transfer menu without moving another card',()=>{
 const s=scene(),old=mon('bw8-1','old-active'),newActive=mon('bw8-2','new-active');
 old.energy.Water=2;s.sides.player.active=newActive;s.sides.player.bench=[old];
 const choice=fire(s,{...rule('scrambleSwitch'),stage:'energy',oldUid:'old-active'},{resolvingChoice:true,action:{choiceOption:1}});
 assert.equal(choice,null,'selecting Done must not prompt again');
 assert.equal(old.energy.Water,2);assert.equal(newActive.energy.Water||0,0);
});

test('Moon Guidance successful deck evolution keeps the physical stack and locks same-turn re-evolution',()=>{
 const s=scene();s.sides.player.active=mon('bw8-1','turtwig');s.sides.player.active.playedOnSideTurn=2;s.sides.player.deck=[ref('bw8-2','grotle-physical')];
 const q=fire(s,rule('moonGuidance'));assert.equal(q.kind,'pokemon');
 const choice=fire(s,{...rule('moonGuidance'),stage:'target'},{resolvingChoice:true,action:{choiceTarget:'active'}});
 assert.equal(choice.kind,'option');assert.deepEqual(choice.options,['Evolve with Grotle']);
 fire(s,{...rule('moonGuidance'),stage:'card',targetUid:'turtwig'},{resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(s.sides.player.active.cardId,'bw8-2');assert.deepEqual(s.sides.player.active.stack,['bw8-1','bw8-2']);
 assert.equal(s.sides.player.active.playedOnSideTurn,3);assert.equal(s.sides.player.active.evolvedOnTurn,7);
 assert.equal(s.sides.player.deck.length,0);
});
