'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const sk=require(path.join(A,'tcg-classic-skyridge.js')),classic=require(path.join(A,'tcg-classic-battle-data.js')),
 core=require(path.join(A,'tcgp-battle-core.js')),fx=require(path.join(A,'tcgp-battle-effects.js')),
 opponents=require(path.join(A,'tcg-classic-opponents.js'));
const card=n=>classic.cardById('ecard3-'+n),slot=(n,uid)=>core.makePokemonSlot('ecard3-'+n,5,uid||('sk'+n));
const init=()=>{const d=opponents.generate({sets:['ecard3'],seed:41});assert.ok(d.ok,d.error);const s=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Fire','Water','Fighting','Psychic','Grass','Lightning','Darkness','Metal'],opponentEnergyTypes:['Fire','Water','Fighting','Psychic','Grass','Lightning','Darkness','Metal'],seed:41,firstSide:'player'});s.phase='battle';s.activeSide='player';s.turnNumber=7;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;s.sides.player.active=slot(57,'gastly');s.sides.opponent.active=slot(82,'nidoran');return s;};
const context=(s,heads=true,action={})=>({...core.effectContext(s,'player',action,s.sides.player.active),random:()=>heads?0.1:0.9,isAttack:true});
function run(n,i,{heads=true,prep=()=>{},action={}}={}){const s=init();s.sides.player.active=slot(n);prep(s);const c=context(s,heads,action);const out=fx.resolveAttack(card(n).attacks[i],c);for(const effect of out.pendingEffects)fx.applyEffect(effect,c);return {s,out,c};}

test('Skyridge attack effects include Energy card counts, different Bench sizes and exact coin outcomes',()=>{
 let {out}=run(2,0,{prep:s=>{s.sides.opponent.active.specialEnergy=[{uid:'sp',cardId:'ecard2-144'}];s.sides.opponent.active.energy={Water:2};}});assert.equal(out.damage,60);
 for(const [us,them,expected] of [[0,2,70],[2,0,0],[1,1,30]]){
  out=run(12,1,{prep:s=>{s.sides.player.bench=Array.from({length:us},(_,i)=>slot(62,'u'+i));s.sides.opponent.bench=Array.from({length:them},(_,i)=>slot(62,'t'+i));}}).out;
  assert.equal(out.damage,expected);
  out=run(20,1,{prep:s=>{s.sides.player.bench=Array.from({length:us},(_,i)=>slot(62,'u'+i));s.sides.opponent.bench=Array.from({length:them},(_,i)=>slot(62,'t'+i));}}).out;
  assert.equal(out.damage,Math.max(0,30+10*(us-them)));
 }
 assert.equal(run(34,0,{heads:true,prep:s=>s.sides.player.bench=[slot(65)]}).out.damage,20);
 assert.equal(run(34,0,{heads:false,prep:s=>s.sides.player.bench=[slot(65)]}).out.damage,0);
 assert.equal(run(89,1,{heads:true}).out.damage,70);
 assert.equal(run(89,1,{heads:false}).out.damage,10);
});
test('Skyridge counter effects, recoil and typed damage are precise',()=>{
 let {s,out}=run(39,1,{prep:s=>{s.sides.player.active.damage=20;s.sides.player.bench=[slot(65)];s.sides.player.bench[0].damage=10;}});
 assert.equal(out.damage,0);assert.equal(s.sides.opponent.active.damage,20);
 ({s,out}=run(43,1,{heads:true}));assert.equal(out.damage,110);assert.equal(s.sides.player.active.damage,40);
 ({s,out}=run(43,1,{heads:false}));assert.equal(out.damage,30);assert.equal(s.sides.player.active.damage,0);
 ({out}=run(44,0,{prep:s=>{s.sides.player.active.energy={Water:5};}}));assert.equal(out.damage,50);
 ({out}=run(45,0,{heads:false,prep:s=>{s.sides.player.active.damage=40;}}));assert.equal(out.damage,0);
 ({out}=run(45,0,{heads:true,prep:s=>{s.sides.player.active.damage=40;}}));assert.equal(out.damage,40);
 ({out}=run(58,1,{prep:s=>{s.sides.player.active.energy={Water:1};s.sides.opponent.active.energy={Fire:2};}}));assert.equal(out.damage,10);
 ({out}=run(58,1,{prep:s=>{s.sides.player.active.energy={Water:1};s.sides.opponent.active.specialEnergy=[{uid:'a',cardId:'ecard2-144'}];}}));assert.equal(out.damage,40);
});
test('Skyridge effects apply targeted counters/status, including both Miracle Powder outcomes',()=>{
 let {s,out}=run(79,0,{action:{target:'opponentActive'}});assert.equal(out.damage,10); // Selected damage is normal attack damage.
 ({s,out}=run(93,1,{heads:true}));assert.equal(out.damage,60);assert.ok(s.sides.opponent.active.conditions.poison);
 ({s,out}=run(93,1,{heads:false}));assert.equal(out.damage,0);assert.ok(!s.sides.opponent.active.conditions.poison);
 ({s,out}=run(111,0,{heads:true,prep:s=>{s.sides.player.active.damage=50;s.sides.player.bench=[slot(65)];s.sides.player.bench[0].damage=20;}}));assert.equal(out.damage,0);assert.equal(s.sides.player.active.damage,30);assert.equal(s.sides.player.bench[0].damage,0);
 ({s,out}=run(111,1,{heads:false}));assert.equal(out.damage,30);assert.ok(s.sides.opponent.active.conditions===undefined||!Object.keys(s.sides.opponent.active.conditions).length);
 ({s,out}=run(111,1,{heads:true}));assert.equal(out.damage,30);assert.equal(s.phase,'effectChoice');const a=core.legalActions(s,'player').find(x=>x.choiceOption===4);assert.ok(a,'Poison option');core.applyAction(s,'player',a);assert.ok(s.sides.opponent.active.conditions.poison);
});
test('Skyridge Fast Ball selects first Evolution and Lure Ball recovers up to the number of heads',()=>{
 let s=init();s.sides.player.deck=[{uid:'a',cardId:'ecard3-65'},{uid:'b',cardId:'ecard3-54'},{uid:'c',cardId:'ecard3-40'},{uid:'d',cardId:'ecard3-41'}];s.sides.player.hand=[];
 fx.applyEffect(card(124).effect,context(s));assert.equal(s.sides.player.hand.length,1);assert.equal(s.sides.player.hand[0].cardId,'ecard3-40');assert.equal(s.sides.player.deck.length,3);
 s=init();s.sides.player.discard=[{uid:'d',cardId:'ecard3-40'},{uid:'e',cardId:'ecard3-41'},{uid:'f',cardId:'ecard3-54'}];s.sides.player.hand=[];
 fx.applyEffect(card(128).effect,context(s,true));assert.equal(s.phase,'effectChoice');
 let actions=core.legalActions(s,'player');assert.ok(actions.length>=2);core.applyAction(s,'player',actions.find(a=>a.choiceDiscardIndex===0));
 assert.equal(s.sides.player.hand.length,1);
});
test('Skyridge Empathic Healing heals both sides of the same effective type',()=>{
 const {s,out}=run(145,0,{prep:s=>{s.sides.player.active.damage=30;s.sides.player.bench=[slot(100)];s.sides.player.bench[0].damage=40;s.sides.opponent.active=slot(145);s.sides.opponent.active.damage=30;}});
 assert.equal(out.damage,0);assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.opponent.active.damage,10);assert.equal(s.sides.player.bench[0].damage,20);
});
test('Skyridge all fully enabled attacks and powers advertise supported effect schemas',()=>{
 assert.equal(sk.coverage().total,182);assert.ok(sk.coverage().battleEnabled>=104);
 for(const c of sk.CARDS.filter(c=>c.battleEnabled))for(const item of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(fx.supportsEffect(item.effect),c.id+' '+item.name);
});

test('Skyridge Drag Off chooses which opponent Bench becomes the damaged defender',()=>{
 const s=init();s.sides.player.active=slot(16);const a=slot(82,'target-a'),b=slot(88,'target-b');a.benchSlot=0;b.benchSlot=1;
 s.sides.opponent.bench=[a,b];
 const moves=fx.choicesForEffect(card(16).attacks[0].effect,context(s));
 assert.equal(moves.length,2);const action=moves.find(x=>x.effectSelection==='target-b');
 const out=fx.resolveAttack(card(16).attacks[0],context(s,true,action));
 assert.equal(s.sides.opponent.active.uid,'target-b');assert.equal(out.damageTarget.uid,'target-b');assert.equal(out.damage,20);
});

test('Skyridge Metal Tail retains 40 or gambles for 80/0 on exact coin outcome',()=>{
 const choices=fx.choicesForEffect(card(31).attacks[1].effect,context(init()));
 assert.equal(choices.length,2);assert.equal(run(31,1,{heads:true,action:{effectSelection:''}}).out.damage,40);
 assert.equal(run(31,1,{heads:true,action:{effectSelection:'flip'}}).out.damage,80);
 assert.equal(run(31,1,{heads:false,action:{effectSelection:'flip'}}).out.damage,0);
});

test('Skyridge Warp Hole selects a specific discarded card for the top of deck',()=>{
 const s=init();s.sides.player.active=slot(35);s.sides.player.discard=[{uid:'f',cardId:'ecard1-161'},{uid:'w',cardId:'ecard1-165'}];
 const {pendingEffects}=fx.resolveAttack(card(35).attacks[0],context(s,true));
 assert.equal(pendingEffects.length,1);fx.applyEffect(pendingEffects[0],context(s,true));
 assert.equal(s.phase,'effectChoice');const action=core.legalActions(s,'player').find(x=>x.choiceDiscardIndex===1);
 assert.ok(action);core.applyAction(s,'player',action);
 assert.equal(s.sides.player.deck[0].cardId,'ecard1-165');assert.equal(s.sides.player.discard.length,1);
});

test('Skyridge Strange Spiral discards specifically selected basic Energy and Confuses',()=>{
 const s=init();s.sides.player.active=slot(26);s.sides.player.active.energy={Fighting:1,Water:1};
 fx.applyEffect(card(26).abilities[0].effect,{...context(s,true),isAbility:true});
 assert.equal(s.phase,'effectChoice');const choice=core.legalActions(s,'player');
 assert.equal(choice.length,2);core.applyAction(s,'player',choice.find(x=>x.choiceLabel?.includes('Water')));
 assert.equal(s.sides.player.active.energy.Water,0);assert.equal(s.sides.player.active.energy.Fighting,1);
 assert.equal(s.sides.player.energyDiscard.Water,1);assert.ok(s.sides.opponent.active.conditions.confusion);
});

test('Skyridge Good Neighbor offers each player independent healing choice after heads',()=>{
 const s=init(),w=slot(34);w.benchSlot=0;s.sides.player.bench=[w];s.sides.player.active.damage=30;s.sides.opponent.active.damage=30;
 fx.applyEffect(card(34).abilities[0].effect,{...core.effectContext(s,'player',{},w),random:()=>0.1,isAbility:true});
 assert.equal(s.choiceSide,'player');const ours=core.legalActions(s,'player').find(x=>x.choiceOption===2);
 assert.ok(ours);core.applyAction(s,'player',ours);assert.equal(s.sides.player.active.damage,10);
 assert.equal(s.choiceSide,'opponent');const theirs=core.legalActions(s,'opponent').find(x=>x.choiceOption===1);
 assert.ok(theirs);core.applyAction(s,'opponent',theirs);assert.equal(s.sides.opponent.active.damage,20);
});

test('Skyridge Eruption checks both top deck cards and Trample flips for both Benches',()=>{
 let s=init();s.sides.player.active=slot(17);s.sides.player.deck=[{uid:'pf',cardId:'ecard1-161'}];s.sides.opponent.deck=[{uid:'of',cardId:'ecard1-161'}];
 let out=fx.resolveAttack(card(17).attacks[0],context(s));assert.equal(out.damage,60);assert.equal(s.sides.player.discard.at(-1).cardId,'ecard1-161');
 assert.equal(s.sides.opponent.discard.at(-1).cardId,'ecard1-161');
 s=init();s.sides.player.active=slot(24);const p=slot(62);p.benchSlot=0;const o=slot(65);o.benchSlot=0;
 s.sides.player.bench=[p];s.sides.opponent.bench=[o];out=fx.resolveAttack(card(24).attacks[1],context(s,true));
 assert.equal(out.damage,40);assert.equal(p.damage,20);assert.equal(o.damage,20);
});

test('Skyridge Zzzap counts abilities on both sides; Max Voltage discards Lightning resources',()=>{
 let s=init();s.sides.player.active=slot(27);s.sides.player.bench=[slot(34)];s.sides.opponent.bench=[slot(14)];
 const out=fx.resolveAttack(card(27).attacks[0],context(s));assert.equal(out.damage,0);assert.equal(s.sides.player.bench[0].damage,20);assert.equal(s.sides.opponent.bench[0].damage,20);
 s=init();s.sides.player.active=slot(84);s.sides.player.active.energy={Lightning:3,Water:1};
 const r=fx.resolveAttack(card(84).attacks[0],context(s));assert.equal(r.damage,50);
 assert.equal(s.sides.player.active.energy.Lightning,0);assert.equal(s.sides.player.active.energy.Water,1);assert.equal(s.sides.player.energyDiscard.Lightning,3);
});

test('Skyridge Nidoran and Call for Friends correctly Bench selected Basic Pokémon',()=>{
 for(const [n,ref] of [[81,'ecard3-82'],[90,'ecard3-65']]){
  const s=init();s.sides.player.active=slot(n);s.sides.player.deck=[{uid:'selected',cardId:ref},{uid:'other',cardId:'ecard3-40'}];s.sides.player.bench=[];
  const result=fx.resolveAttack(card(n).attacks[0],context(s));for(const e of result.pendingEffects)fx.applyEffect(e,context(s));
  assert.equal(s.phase,'effectChoice');const action=core.legalActions(s,'player').find(x=>x.choiceCardId===ref);assert.ok(action);
  core.applyAction(s,'player',action);assert.equal(s.sides.player.bench[0].cardId,ref);
 }
});

test('Skyridge card passives affect actual Energy payment, retreat and evolution action availability',()=>{
 let s=init();s.sides.player.active=slot(31);s.sides.player.active.energy={Water:2,Fire:1};
 let e=core.effectiveEnergy(s,'player',s.sides.player.active);assert.equal(e.Metal,3);assert.equal(e.Water||0,0);
 s.sides.player.active=slot(51);s.sides.player.active.energy={Water:2,Fire:1};e=core.effectiveEnergy(s,'player',s.sides.player.active);
 assert.equal(e.Miracle,3);
 s.sides.player.active=slot(4);s.sides.player.hand=[{uid:'water',cardId:'ecard1-165'}];
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='attachSpecial'&&x.cardId==='ecard1-165'),'Water Immunity denies hand Water Energy');
 s.sides.player.active=slot(14);const pine=slot(85);pine.benchSlot=0;pine.playedOnSideTurn=0;s.sides.player.bench=[pine];
 s.sides.player.hand=[{uid:'f',cardId:'ecard3-9'}];
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='evolve'&&x.benchIndex===0),'Primal Aura locks Bench evolution');
});

test('Skyridge Immunity prevents opponent attack damage and status effects until suppressed',()=>{
 const s=init(),champ=slot(16);s.sides.player.active=champ;
 assert.ok(fx.attackIsPrevented(s,'player',champ,s.sides.opponent.active,classic.cardById));
 assert.equal(fx.attackEffectsPrevented(s,'player',champ,s.sides.opponent.active,classic.cardById),true);
});

test('Skyridge Thick Shell reduces evolved attackers only',()=>{
 const s=init();s.sides.player.active=slot(37);
 s.sides.opponent.active=slot(85);
 assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'damageReduction',classic.cardById),0);
 s.sides.opponent.active=slot(9);
 assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'damageReduction',classic.cardById),10);
});
