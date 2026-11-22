'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const xy=require('../app/src/main/assets/tcg-classic-evolutions.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const rows=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/classic/xy12-print-compact.json'),'utf8'));
const slot=(cardId,uid,benchSlot=0)=>({cardId,uid,benchSlot,stack:[cardId],energy:{},specialEnergy:[],conditions:{},locks:[],damage:0});
const board=active=>({active,bench:[],hand:[],deck:[],discard:[],energySupply:[],energyDiscard:{},prizes:[],turnCount:1,benchLimit:3});
const state=()=>({format:'classic',turnNumber:8,firstSide:'player',activeSide:'player',sides:{player:board(slot('xy12-1','p')),opponent:board(slot('xy12-3','o'))},modifiers:[],log:[]});
const ctx=(s,more={})=>({state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,isAttack:true,random:()=>.8,shuffle:()=>{},drawCard:p=>p.deck.length?p.hand.push(p.deck.shift()):null,...more});
const atk=(n,name)=>{const c=xy.cardById('xy12-'+n);assert.ok(c?.battleEnabled,n);return c.attacks.find(a=>a.name===name)};
const ability=(n,name)=>{const c=xy.cardById('xy12-'+n);assert.ok(c?.battleEnabled,n);return c.abilities.find(a=>a.name===name)?.effect};
const trainer=n=>xy.cardById('xy12-'+n).effect;
const use=(e,s,more={})=>effects.applyEffect(e,ctx(s,more));
const hit=(n,name,s,more={})=>effects.resolveAttack(atk(n,name),ctx(s,more));
const pick=(s,e,action,more={})=>use(e,s,{...more,resolvingChoice:true,action});
const collect=(s,e,more={})=>{let choice;use(e,s,{...more,requestChoice:c=>choice=c});assert.ok(choice,'Missing choice for '+e?.rule);return choice;};
const rawDeck=['xy12-1','xy12-3','xy12-9','xy12-35','xy12-30','xy12-57','xy12-91'].flatMap(x=>Array(4).fill(x)).concat(['xy12-74','xy12-88']);
test('113 official prints fully enabled, exact costs, complete Abilities and no placeholders',()=>{
 assert.equal(rows.length,113);assert.equal(xy.CARDS.length,113);assert.equal(xy.CARDS.filter(x=>x.battleEnabled).length,113);
 for(const row of rows){const c=xy.cardById('xy12-'+row[0]);assert.equal(c.battleEnabled,true,c.id+' gated');
  assert.equal(c.support.status,'FULL');for(const a of c.attacks||[]){assert.deepEqual(effects.validateEffect(a.effect),[],c.id+'/'+a.name);assert.notEqual(a.effect?.type,'unsupported');}
  for(const a of c.abilities||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+'/'+a.name);
  if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
  assert.deepEqual((c.attacks||[]).map(a=>Array.isArray(a.cost)?a.cost.join(''):String(a.cost)),row[7].map(a=>a[1].join('')));
 }
});
test('Swarming Sting selects opposing Active or Bench and scales by friendly Beedrill',()=>{
 const s=state(),p=s.sides.player,foe=s.sides.opponent;p.active=slot('xy12-7','bee');p.bench=[slot('xy12-7','bee2')];foe.bench=[slot('xy12-3','foe2',0)];
 const choices=effects.choicesForEffect(atk(7,'Swarming Sting').effect,ctx(s));assert.equal(choices.length,2);
 const r=hit(7,'Swarming Sting',s,{action:{target:'opponentBench',benchIndex:0}});assert.equal(r.damage,80);assert.equal(r.damageTarget,foe.bench[0]);
});
test('Lure changes opposing Active then locks new Active retreat',()=>{
 const s=state(),foe=s.sides.opponent;foe.bench=[slot('xy12-5','target',0)];let c=collect(s,atk(15,'Lure').effect);
 pick(s,c.effect,{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(foe.active.cardId,'xy12-5');assert.ok(foe.active.locks.some(x=>x.action==='retreat'));
});
test('Explosive Fireball adds 60 per physical Fire attachment and discards only Fire',()=>{
 const s=state(),p=s.sides.player;p.active=slot('xy12-16','break');p.active.energy.Fire=2;p.active.energy.Water=1;
 const r=hit(16,'Explosive Fireball',s);assert.equal(r.damage,10+120);
 for(const e of r.pendingEffects)use(e,s);assert.equal(p.active.energy.Fire,0);assert.equal(p.energyDiscard.Fire,2);assert.equal(p.active.energy.Water,1);
});
test('Dashing Punch bench entry and Karate Chop damage counters adjust damage correctly',()=>{
 const s=state();s.sides.player.active=slot('xy12-25','p');s.sides.player.active.movedToActiveTurn=8;
 const first=hit(25,'Dashing Punch',s);s.sides.player.active.movedToActiveTurn=6;const second=hit(25,'Dashing Punch',s);assert.equal(first.damage,second.damage+50);
 s.sides.player.active=slot('xy12-58','p2');s.sides.player.active.damage=20;assert.equal(hit(58,'Karate Chop',s).damage,40);
});
test('Break Star targets only opponents BREAK, both Active and Bench',()=>{
 const s=state();s.sides.player.active=slot('xy12-32','star');s.sides.opponent.active=slot('xy12-16','break');s.sides.opponent.bench=[slot('xy12-3','basic',0),slot('xy12-46','break2',1)];
 const r=hit(32,'Break Star',s);for(const e of r.pendingEffects)use(e,s);assert.ok(s.sides.opponent.active.damage>=100);assert.equal(s.sides.opponent.bench[0].damage,0);assert.equal(s.sides.opponent.bench[1].damage,100);
});
test('Toxic Drill poison is 20 between turns and Shadowy Bite counts discarded Special Energy',()=>{
 const s=state();use(atk(46,'Toxic Drill').effect,s);assert.equal(s.sides.opponent.active.conditions.poison.amount,20);
 s.sides.opponent.discard=[{uid:'sp',cardId:'xy12-90'},{uid:'basic',cardId:'xy12-91'}];assert.equal(hit(67,'Shadowy Bite',s).damage,60);
});
test('Barrier blocks damage/effects and cannot be reused by other Pokemon on following own turn',()=>{
 const s=state();s.sides.player.active=slot('xy12-51','mewtwo');const e=atk(51,'Barrier').effect;
 use(e,s);assert.equal(s.sides.player.active.attackGuard?.preventEffects,true);assert.equal(s.sides.player.lastBarrierTurn,8);
 s.turnNumber=10;s.sides.player.active=slot('xy12-51','otherMewtwo');assert.deepEqual(effects.choicesForEffect(e,ctx(s)),[]);
});
test('Boomerang Lariat applies next-turn wildcard boost without changing printed attack price',()=>{
 const s=state();s.sides.player.active=slot('xy12-60','machamp');use(atk(60,'Boomerang Lariat').effect,s);
 assert.deepEqual(s.sides.player.active.nextAttackBonuses,[{attackName:'*',turn:10,amount:100}]);
});
test('Conversion 3 has a selectable weakness and expiry at end of next own turn',()=>{
 const s=state();let c=collect(s,atk(71,'Conversion 3').effect);assert.equal(c.options.length,10);
 pick(s,c.effect,{choiceOption:1});assert.equal(s.sides.opponent.active.weaknessOverride,'Fire');assert.equal(s.sides.opponent.active.weaknessOverrideExpiresTurn,10);
});
test('Space Beacon excludes just-discarded Basic Energy and recovers two existing physical Basic cards',()=>{
 const s=state(),p=s.sides.player;p.hand=[{uid:'new-energy',cardId:'xy12-91'}];p.discard=[{uid:'old1',cardId:'xy12-92'},{uid:'old2',cardId:'xy12-93'}];
 let c=collect(s,ability(31,'Space Beacon'),{isAttack:false});assert.equal(c.kind,'handCard');
 let next;pick(s,c.effect,{choiceHandIndex:0},{isAttack:false,requestChoice:x=>next=x});assert.equal(next.kind,'discardCard');assert.deepEqual(next.excludeUids,['new-energy']);
 let third;pick(s,next.effect,{choiceDiscardIndex:0},{isAttack:false,requestChoice:x=>third=x});assert.equal(third.kind,'discardCard');
 pick(s,third.effect,{choiceDiscardIndex:0},{isAttack:false});assert.deepEqual(p.hand.map(r=>r.uid).sort(),['old1','old2']);assert.equal(p.discard.length,1);
});
test('Mischievous Fang optional from-hand bench trigger discards opponent Active Tool',()=>{
 const s=state(),foe=s.sides.opponent;foe.active.tool={uid:'tool',cardId:'xy12-73'};
 let c=collect(s,ability(66,'Mischievous Fang'),{isAttack:false,eventData:{fromHand:true}});
 pick(s,c.effect,{choiceOption:0},{isAttack:false,eventData:{fromHand:true}});assert.equal(foe.active.tool,null);assert.equal(foe.discard[0].uid,'tool');
});
test('Pull Up recovers up to two Basic Pokemon but excludes Dragonite-EX',()=>{
 const s=state(),p=s.sides.player;p.discard=[{uid:'dragon',cardId:'xy12-72'},{uid:'first',cardId:'xy12-3'},{uid:'second',cardId:'xy12-9'}];
 let c=collect(s,ability(72,'Pull Up'),{isAttack:false,eventData:{fromHand:true}});assert.ok(!c.allowedUids.includes('dragon'));
 let next;pick(s,c.effect,{choiceDiscardIndex:1},{isAttack:false,eventData:{fromHand:true},requestChoice:x=>next=x});assert.equal(next.kind,'discardCard');
 pick(s,next.effect,{choiceDiscardIndex:1},{isAttack:false,eventData:{fromHand:true}});assert.deepEqual(p.hand.map(r=>r.uid),['first','second']);
});
test('Brock Grit retrieves Pokemon and physical Basic Energy only, never Zone energy',()=>{
 const s=state(),p=s.sides.player;p.discard=[{uid:'sp',cardId:'xy12-90'},{uid:'basic',cardId:'xy12-92'},{uid:'pokemon',cardId:'xy12-3'}];
 p.energyDiscard.Fire=2;let c=collect(s,trainer(74),{isAttack:false});assert.equal(c.allowedUids.length,2);
 let next;pick(s,c.effect,{choiceDiscardIndex:1},{isAttack:false,requestChoice:x=>next=x});assert.ok(next);
 pick(s,next.effect,{choiceDiscardIndex:1},{isAttack:false});assert.equal(p.deck.length,2);assert.equal(p.energyDiscard.Fire,2);
});
test('Misty picks exactly one of top eight after hand discard',()=>{
 const s=state(),p=s.sides.player;p.hand=[{uid:'cost',cardId:'xy12-3'}];p.deck=Array.from({length:9},(_,i)=>({uid:'d'+i,cardId:'xy12-9'}));
 let c=collect(s,trainer(80),{isAttack:false});let next;
 pick(s,c.effect,{choiceHandIndex:0},{isAttack:false,requestChoice:x=>next=x});assert.equal(p.discard.length,1);assert.equal(next.kind,'deckCard');assert.equal(next.allowedIndices.length,8);
 pick(s,next.effect,{choiceDeckIndex:6},{isAttack:false});assert.equal(p.hand[0].uid,'d6');assert.equal(p.deck.length,8);
});
test('Super Potion chooses actual attached Energy to discard, heals target by up to 60',()=>{
 const s=state(),p=s.sides.player;p.active.damage=70;p.active.energy.Fire=1;p.active.energy.Water=1;
 let c=collect(s,trainer(87),{isAttack:false});let next;
 pick(s,c.effect,{choiceTarget:'active'},{isAttack:false,requestChoice:x=>next=x});assert.equal(next.kind,'option');
 pick(s,next.effect,{choiceOption:1},{isAttack:false});assert.equal(p.active.damage,10);assert.equal(p.active.energy.Water,0);assert.equal(p.active.energy.Fire,1);
});
test('Here Comes Team Rocket flips all physical prizes face up for rest of game',()=>{
 const s=state();s.sides.player.prizes=[{uid:'a',cardId:'xy12-3'}];s.sides.opponent.prizes=[{uid:'b',cardId:'xy12-9'}];use(trainer(113),s,{isAttack:false});
 assert.equal(s.sides.player.prizes[0].faceUp,true);assert.equal(s.sides.opponent.prizes[0].faceUp,true);
});
test('All alt prints reuse exact gameplay effects, and physical parody card uses a documented digital analogue',()=>{
 for(const [a,b] of [[2,100],[13,101],[22,102],[52,103],[64,104],[65,105],[72,106]])assert.deepEqual(xy.cardById('xy12-'+a).attacks.map(x=>x.effect),xy.cardById('xy12-'+b).attacks.map(x=>x.effect));
 assert.equal(xy.cardById('xy12-112').battleEnabled,true);assert.equal(atk(112,'Harmonize').effect.rule,'harmonize');
});

// These tests exercise real engine entry points, not just the effect handler.
const legalDeck=[39,40,35,9,14,17,23,3].flatMap(n=>Array(4).fill('xy12-'+n)).slice(0,30);
const live=()=>core.createBattle({format:'classic',playerDeck:legalDeck,opponentDeck:legalDeck,firstSide:'player',seed:9,playerEnergyTypes:['Lightning'],opponentEnergyTypes:['Grass']});
test('Buzzap Thunder is an actual legal Ability: self-KO, Lightning attachment and opponent Prize',()=>{
 const s=live(),p=s.sides.player;p.active=core.makePokemonSlot('xy12-40',p.turnCount,'electrode');
 p.bench=[core.makePokemonSlot('xy12-35',p.turnCount,'recipient')];p.bench[0].benchSlot=0;s.activeSide='player';s.phase='battle';
 const a=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='xy12-40');assert.ok(a);
 core.applyAction(s,'player',a);assert.equal(s.phase,'effectChoice');
 const choice=core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&x.choiceTarget==='bench');assert.ok(choice);
 core.applyAction(s,'player',choice);
 assert.equal(p.active,null);assert.equal(p.bench[0].specialEnergy[0].cardId,'xy12-40');
 assert.equal(p.bench[0].specialEnergy[0].provides.Lightning,2);
 assert.ok(s.sides.opponent.prizesTaken>=1,'self-KO must award Prize');
});
test('Energy Burn pays all-Fire attacks using other typed Basic Energy, unless suppressed',()=>{
 const s=state(),p=s.sides.player;p.active=slot('xy12-11','charizard');p.active.energy={Water:2,Grass:2};
 assert.deepEqual(core.effectiveEnergy(s,'player',p.active),{Fire:4});
 s.xy7HexManiacUntil=s.turnNumber;
 assert.equal(core.effectiveEnergy(s,'player',p.active).Water,2);
 assert.equal(core.effectiveEnergy(s,'player',p.active).Fire||0,0);
});
test('Neutral Shield and Submerge distinguish evolution, bench and Ability suppression',()=>{
 const s=state(),foe=s.sides.opponent;
 foe.active=slot('xy12-53','mew');s.sides.player.active=slot('xy12-7','beedrill');
 assert.equal(effects.attackIsPrevented(s,'opponent',foe.active,s.sides.player.active,data.cardById).reason,'Neutral Shield');
 s.sides.player.active=slot('xy12-3','caterpie');assert.equal(effects.attackIsPrevented(s,'opponent',foe.active,s.sides.player.active,data.cardById)||null,null);
 foe.bench=[slot('xy12-55','diglett',0)];assert.equal(effects.attackIsPrevented(s,'opponent',foe.bench[0],s.sides.player.active,data.cardById).reason,'Submerge');
 foe.bench[0].abilitySuppressed=true;
 assert.equal(effects.attackIsPrevented(s,'opponent',foe.bench[0],s.sides.player.active,data.cardById)||null,null);
});
test('Burning Road only triggers after Arcanine moves Bench to Active and selects individual Fire Energy',()=>{
 const s=state(),p=s.sides.player;p.active=slot('xy12-18','arcanine');p.active.movedToActiveTurn=s.turnNumber;
 p.bench=[slot('xy12-9','charmander',0)];p.bench[0].energy.Fire=2;
 const e=ability(18,'Burning Road'),choices=effects.choicesForEffect(e,ctx(s));assert.ok(choices.length);
 const c=collect(s,e,{isAttack:false});assert.equal(c.kind,'option');
 pick(s,c.effect,{choiceOption:0},{isAttack:false});assert.equal(p.active.energy.Fire,1);assert.equal(p.bench[0].energy.Fire,1);
 p.active.movedToActiveTurn=s.turnNumber-2;assert.deepEqual(effects.choicesForEffect(e,ctx(s)),[]);
});
test('Counterattack triggers on actual opposing attack damage but not non-attack counters',()=>{
 const s=state(),foe=s.sides.opponent;foe.active=slot('xy12-59','machamp');s.sides.player.active=slot('xy12-3','caterpie');
 const e=ability(59,'Counterattack'),meta={source:{side:'player',attack:true},attacker:s.sides.player.active,damage:20};
 use(e,s,{side:'opponent',foeSide:'player',attacker:foe.active,defender:s.sides.player.active,isAttack:false,eventData:meta});
 assert.equal(s.sides.player.active.damage,30);
 use(e,s,{side:'opponent',foeSide:'player',attacker:foe.active,defender:s.sides.player.active,isAttack:false,eventData:{...meta,source:{side:'player',attack:false}}});
 assert.equal(s.sides.player.active.damage,30);
});
