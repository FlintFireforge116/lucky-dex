'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
function setup(id,energy=['Grass','Lightning','Fairy','Fairy'],randomResults=[0.9,0.1,0.1]){
  const attacker={uid:'a0',cardId:id,energy:{},specialEnergy:[],conditions:{}};
  const p={id:'player',energySupply:energy.slice(),nextEnergyType:energy[0],deck:[],hand:[],discard:[],energyDiscard:{},active:attacker,bench:[0,1].map(i=>({uid:'b'+i,benchSlot:i,cardId:'base1-1',energy:{},specialEnergy:[],conditions:{}}))};
  const o={id:'opponent',energySupply:[],deck:[],hand:[],discard:[],energyDiscard:{},active:{uid:'foe',cardId:'base1-1',energy:{},conditions:{}},bench:[]};
  const s={format:'classic',turnNumber:9,activeSide:'player',sides:{player:p,opponent:o},log:[]};
  let counter=0,prompt=null;
  const ctx={state:s,side:'player',foeSide:'opponent',attacker,defender:o.active,cardById:data.cardById,random:()=>randomResults[Math.min(counter++,randomResults.length-1)],requestChoice:q=>{prompt=q;},onEnergyAttached:()=>{},shuffle:()=>{},action:{}};
  return {p,s,ctx,get prompt(){return prompt;},get randomCalls(){return counter;},apply(e){prompt=null;fx.applyEffect(e,ctx);},choose(a){assert.ok(prompt,'expected pending choice');const q=prompt;prompt=null;fx.applyEffect(q.effect,{...ctx,resolvingChoice:true,action:a});},coins(){return s.log.filter(x=>x.reason==='Hybrid Basic Energy deck search');}};
}
test('catalogue scan: every live printed Basic Energy deck-search has an implemented effect',()=>{
 const regex=/\bsearch (?:your|the|their|his|her) deck\b[^.!?\n]{0,180}\b(?:basic\s+(?:[a-z]+\s+)?energy|(?:grass|fire|water|lightning|psychic|fighting|darkness|metal|fairy)\s+energy)\s+cards?\b/i;
 const candidates=data.CARDS.flatMap(c=>[...(c.attacks||[]),...(c.abilities||[]),c].filter(e=>regex.test(e.text||'')).map(e=>({id:c.id,enabled:c.battleEnabled,effect:e.effect,name:e.name||c.name})));
 assert.ok(candidates.length>=89,'card scan unexpectedly lost a known printed deck-search effect');
 const enabled=candidates.filter(c=>c.enabled);
 assert.ok(enabled.length>=82,'card scan unexpectedly lost a known playable search effect');
 assert.deepEqual(enabled.filter(c=>!c.effect||['noop','unsupported'].includes(c.effect.type)).map(c=>c.id),[], 'playable Basic Energy deck searches must not be noop or unsupported');
 for(const id of ['xy11-81','sm1-14','sm1-52','hgss1-14','ex10-Q','pl1-81','bw4-10'])assert.ok(enabled.some(c=>c.id===id),id+' disappeared from the audit');
});
test('XY11 Xerneas Geomancy: first tails does not block second Fairy search',()=>{
 const f=setup('xy11-81',['Fairy','Fairy','Fairy'],[0.9,0.1]);
 f.apply(data.cardById('xy11-81').attacks[0].effect);
 f.choose({choiceTarget:'bench',choiceBenchIndex:0});
 assert.equal(f.coins().length,1);assert.equal(f.p.bench[0].energy.Fairy||0,0);
 assert.ok(f.prompt,'must continue to second Benched Pokémon after tails');
 f.choose({choiceTarget:'bench',choiceBenchIndex:1});
 assert.equal(f.coins().length,2);assert.equal(f.p.bench[1].energy.Fairy,1);
 assert.equal(f.p.energySupply.length,2);
});
test('EX Emerald Unown Q: three independent searches including after first tails',()=>{
 const f=setup('ex10-Q',['Grass','Lightning','Fire','Water'],[0.9,0.1,0.1]);
 f.apply(data.cardById('ex10-Q').attacks[0].effect);
 for(let i=0;i<3;i++)f.choose({choiceOption:0});
 assert.equal(f.coins().length,3);assert.equal(f.p.hand.length,2);assert.equal(f.p.energySupply.length,2);
 assert.equal(f.prompt,null);
});
test('HGSS Ampharos Acceleration Bolt never attaches Energy on tails',()=>{
 const f=setup('hgss1-14',['Grass','Grass'],[0.9,0.1]);
 f.apply(data.cardById('hgss1-14').attacks[0].effect);
 f.choose({choiceTarget:'bench',choiceBenchIndex:0});
 f.choose({choiceOption:0});assert.equal(f.coins().length,1);
 assert.equal(f.p.bench[0].energy.Grass||0,0,'must not grant free Energy after tails');
 f.choose({choiceOption:0});assert.equal(f.coins().length,2);
 assert.equal(f.p.bench[0].energy.Grass,1);assert.equal(f.p.energySupply.length,1);
});
test('SM1 Fomantis Synthesis searches the Zone with exactly one coin',()=>{
 for(const [roll,expected] of [[0.9,0],[0.1,1]]){
  const f=setup('sm1-14',['Grass','Grass'],[roll]);
  f.apply(data.cardById('sm1-14').attacks[0].effect);
  assert.ok(f.prompt,'select Energy source');f.choose({choiceOption:0});
  assert.ok(f.prompt,'select Pokemon');f.choose({choiceTarget:'active'});
  assert.equal(f.coins().length,1);assert.equal(f.p.active.energy.Grass||0,expected);
  assert.equal(f.p.energySupply.length,2-expected);
 }
});
test('SM1 Vikavolt Strong Charge: first tails still allows second Lightning search',()=>{
 const f=setup('sm1-52',['Grass','Lightning'],[0.9,0.1]);
 const ability=data.cardById('sm1-52').abilities.find(a=>a.name==='Strong Charge');
 assert.ok(ability);
 const choices=fx.choicesForEffect(ability.effect,f.ctx);
 assert.ok(choices.length,'ability must be legal with Energy only in Zone');
 f.apply(ability.effect);
 f.choose({choiceOption:0});f.choose({choiceTarget:'active'});
 assert.equal(f.coins().length,1);assert.equal(f.p.active.energy.Grass||0,0);
 assert.ok(f.prompt,'second typed search should be offered');
 f.choose({choiceOption:0});f.choose({choiceTarget:'active'});
 assert.equal(f.coins().length,2);assert.equal(f.p.active.energy.Lightning||0,1);
 assert.equal(f.p.energySupply.length,1);
});
test('Platinum Lotad Synthesis: original printed coin + additional Zone coin after target choice',()=>{
 const f=setup('pl1-81',['Grass'],[0.1,0.9]);
 f.apply(data.cardById('pl1-81').attacks[1].effect);
 assert.ok(f.prompt,'printed heads should allow target choice');
 f.choose({choiceTarget:'active'});
 assert.equal(f.coins().length,1,'nested printed coinFlip must retain search identity on resumed choice');
 assert.equal(f.p.active.energy.Grass||0,0);assert.equal(f.p.energySupply.length,1);
});

test('EX Dragon Vibrava Quick Charge: three Zone searches with distinct successful types',()=>{
 const f=setup('ex3-22',['Grass','Fire','Water','Lightning'],[0.9,0.1,0.1]);
 f.apply(data.cardById('ex3-22').attacks.find(a=>a.name==='Quick Charge').effect);
 for(let i=0;i<3;i++)f.choose({choiceOption:0});
 assert.equal(f.coins().length,3);
 assert.equal(f.p.hand.length,2);
 assert.equal(new Set(f.p.hand.map(r=>data.cardById(r.cardId).subtype)).size,2);
 assert.equal(f.p.energySupply.length,2);
});
test('EX FireRed LeafGreen Raichu: two independent Lightning searches cannot attach after tails',()=>{
 const f=setup('ex6-12',['Lightning','Lightning','Fire'],[0.9,0.1]);
 f.apply(data.cardById('ex6-12').attacks.find(a=>a.name==='Recharge').effect);
 assert.equal(f.coins().length,2);
 assert.equal(f.p.active.energy.Lightning||0,1);
 assert.deepEqual(f.p.energySupply,['Lightning','Fire']);
});
test('EX Team Rocket Returns Heracross search respects opponent Pokémon-ex requirement',()=>{
 const e=data.cardById('ex5-7').attacks.find(a=>a.name==='Extra Draw').effect;
 const eligible=setup('ex5-7',['Grass','Grass'],[0.1,0.9]);
 eligible.ctx.defender.cardId='bw8-18';eligible.apply(e);
 assert.equal(eligible.coins().length,2);assert.equal(eligible.p.active.energy.Grass||0,1);
 const blocked=setup('ex5-7',['Grass','Grass'],[0.1,0.1]);
 blocked.ctx.defender.cardId='sm1-1';blocked.apply(e);
 assert.equal(blocked.coins().length,0);assert.equal(blocked.p.active.energy.Grass||0,0);
});
test('EX Emerald Parasect Energy Powder only offers non-EX target',()=>{
 const f=setup('ex6-43',['Grass','Water'],[0.1,0.9]);
 f.p.bench[0].cardId='bw8-18';
 f.apply(data.cardById('ex6-43').attacks.find(a=>a.name==='Energy Powder').effect);
 f.choose({choiceOption:0});
 assert.ok(f.prompt.allowedUids.includes('a0'));
 assert.ok(!f.prompt.allowedUids.includes('b0'));
 f.choose({choiceTarget:'active'});
 f.choose({choiceOption:0});f.choose({choiceTarget:'active'});
 assert.equal(f.coins().length,2);assert.equal(f.p.active.energy.Grass||0,1);
});
test('HGSS Undaunted Skarmory Steel Coat: typed Metal search attaches only on heads',()=>{
 for(const [roll,n] of [[0.9,0],[0.1,1]]){
  const f=setup('hgss3-21',['Metal'],[roll]);
  f.apply(data.cardById('hgss3-21').attacks.find(a=>a.name==='Steel Coat').effect);
  f.choose({choiceOption:0});f.choose({choiceTarget:'active'});
  assert.equal(f.coins().length,1);assert.equal(f.p.active.energy.Metal||0,n);
 }
});
test('BW Plasma Freeze Chandelure Flare Navigate: recoil only after successful Zone search',()=>{
 const ability=data.cardById('bw9-16').abilities.find(a=>a.name==='Flare Navigate');assert.ok(ability);
 for(const [roll,n] of [[0.9,0],[0.1,1]]){
  const f=setup('bw9-16',['Fire'],[roll]);
  f.apply(ability.effect);f.choose({choiceOption:0});f.choose({choiceTarget:'active'});
  assert.equal(f.coins().length,1);assert.equal(f.p.active.energy.Fire||0,n);
  assert.equal(f.p.active.damage||0,n*10);
 }
});
test('Legacy EX search retains original physical Basic Energy deck choice without Zone coin',()=>{
 const f=setup('ex3-22',['Grass','Fire'],[0.9]);
 f.p.deck=[{uid:'real1',cardId:'neo1-108'}];
 f.apply(data.cardById('ex3-22').attacks.find(a=>a.name==='Quick Charge').effect);
 assert.ok(f.prompt);assert.equal(f.prompt.kind,'deckCard');assert.equal(f.coins().length,0);
});
