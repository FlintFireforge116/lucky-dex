'use strict';
// Independent post-completion audit. Deliberately checks observable results,
// including opposite hand sizes, mirrored CPU sides, conditional heals, and
// real alternate-collector print parity; not merely effect validation.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const pack=require('../app/src/main/assets/tcg-classic-crimson-invasion.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ref=(id,uid)=>({uid,cardId:id});
const rich={Grass:7,Fire:7,Water:7,Lightning:7,Psychic:7,Fighting:7,Darkness:7,Metal:7,Fairy:7,Colorless:7};
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
function setup(playerId='sm4-40',opponentId='sm4-34'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:73412,firstSide:'player',playerEnergyTypes:['Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=5;s.rules.winMode='prizes';
 for(const side of ['player','opponent']){
  const ss=s.sides[side];ss.turnCount=3;ss.energyUsed=true;ss.handEnergyUsed=true;
  ss.hand=[];ss.deck=Array.from({length:12},(_,i)=>ref('sm4-30',side+'d'+i));
  ss.discard=[];ss.energyDiscard={};ss.prizes=Array.from({length:5},(_,i)=>ref('sm4-1',side+'pr'+i));ss.prizesTaken=0;
 }
 s.sides.player.active=slot(playerId,'pa',rich);s.sides.player.bench=[slot('sm4-30','pb')];
 s.sides.opponent.active=slot(opponentId,'oa',rich);s.sides.opponent.bench=[slot('sm4-30','ob')];
 return s;
}
function attack(s,side,name){const ss=s.sides[side],c=data.cardById(ss.active.cardId);const a=core.legalActions(s,side).find(x=>x.type==='attack'&&c.attacks[x.attackIndex]?.name===name);assert.ok(a,`Missing ${side} attack ${name}`);core.applyAction(s,side,a);return a;}
function action(s,side,predicate){const a=core.legalActions(s,side).find(predicate);assert.ok(a,'Missing action '+side);core.applyAction(s,side,a);return a;}
function drain(s){let n=0;while(['effectChoice','promote'].includes(s.phase)&&n++<50){const side=s.phase==='effectChoice'?s.pendingChoice.side:['player','opponent'].find(w=>core.legalActions(s,w).some(a=>a.type==='promote'));action(s,side,a=>a.type===(s.phase==='effectChoice'?'effectChoice':'promote'));}assert.ok(n<50,'Infinite pending choice');}

test('Full SM4 catalogue carries exactly 126 eligible prints and 193 payable attacks',()=>{
 assert.equal(pack.CARDS.length,126);assert.equal(pack.CARDS.filter(c=>c.battleEnabled&&c.deckEligible).length,126);
 assert.equal(pack.CARDS.reduce((n,c)=>n+(c.attacks||[]).length,0),193);
 for(const c of pack.CARDS){for(const a of c.attacks||[]){assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);assert.ok((Array.isArray(a.cost)||typeof a.cost==='string')&&a.cost.length<=9,c.id+' '+a.name+' cost invalid');}}
});

test('SM4 alternate-art and rainbow/secret reprints retain exactly the same gameplay',()=>{
 for(const [standard,variants] of Object.entries({'18':['101','112'],'34':['102','113'],'49':['103','114'],'57':['104','115'],'63':['63a','105','116'],'70':['106','117'],'74':['107','118'],'84':['84a'],'90':['108','119'],'91':['120'],'95':['109'],'96':['110'],'100':['122']})){
  const base=pack.cardById('sm4-'+standard);assert.ok(base,standard);
  for(const other of variants){const alt=pack.cardById('sm4-'+other);assert.ok(alt,other);for(const k of ['name','hp','types','stage','evolvesFrom','prizeCards','attacks','abilities','kind','trainerType','effect','energyType','basicEnergy','retreat','weakness','resistance'])assert.deepEqual(alt[k],base[k],other+' differs in '+k);}
 }
});

test('Dark Arts counts five OPPOSING hand cards, not the lone card in the attacker hand',()=>{
 const s=setup();s.sides.player.hand=[ref('sm4-7','mine')];s.sides.opponent.hand=Array.from({length:5},(_,i)=>ref('sm4-7','theirs'+i));
 attack(s,'player','Dark Arts');assert.equal(s.sides.opponent.active.damage,100);
});

test('Dark Arts counts two opposing hand cards even if attacker holds six',()=>{
 const s=setup();s.sides.player.hand=Array.from({length:6},(_,i)=>ref('sm4-7','mine'+i));s.sides.opponent.hand=[ref('sm4-7','theirs1'),ref('sm4-7','theirs2')];
 attack(s,'player','Dark Arts');assert.equal(s.sides.opponent.active.damage,40);
});

test('CPU Dark Arts uses the player hand as defender, not the CPU hand',()=>{
 const s=setup('sm4-34','sm4-40');s.activeSide='opponent';s.turnNumber=6;
 s.sides.opponent.hand=[ref('sm4-7','cpumine')];s.sides.player.hand=Array.from({length:4},(_,i)=>ref('sm4-7','human'+i));
 attack(s,'opponent','Dark Arts');assert.equal(s.sides.player.active.damage,80);
});

test('SM1 Krookodile False Accusation uses opponent hand with printed base damage',()=>{
 const s=setup('sm1-85');s.sides.player.hand=[ref('sm4-7','mine')];s.sides.opponent.hand=Array.from({length:4},(_,i)=>ref('sm4-7','their'+i));
 attack(s,'player','False Accusation');assert.equal(s.sides.opponent.active.damage,100);
});

test('Registeel Iron Hand heals only if Regice is actually on your Bench',()=>{
 for(const withRegice of [false,true]){const s=setup('sm4-68');s.sides.player.active.damage=80;
  s.sides.player.bench=[slot(withRegice?'sm4-28':'sm4-30','pb')];
  attack(s,'player','Iron Hand');assert.equal(s.sides.player.active.damage,withRegice?50:80);
 }
});

test('Lucha Fight grants +30 to the defending Pokémon attack on its next turn',()=>{
 const s=setup('sm4-51','sm4-77');s.sides.player.active.energy={Fighting:2};s.sides.opponent.active.energy={Colorless:2};
 attack(s,'player','Lucha Fight');assert.equal(s.activeSide,'opponent');
 attack(s,'opponent','War Cry');assert.equal(s.sides.player.active.damage,60);
});

test('Punishing Slap detects Darkness Energy on opposing Bench, not just Active',()=>{
 for(const darkness of [false,true]){const s=setup('sm4-72');s.sides.opponent.active.energy={Water:3};s.sides.opponent.bench[0].energy=darkness?{Darkness:1}:{Water:1};
  attack(s,'player','Punishing Slap');assert.equal(s.sides.opponent.active.damage,darkness?120:60);
 }
});

test('Chaos Wheel locks only the printed hand categories on the following opponent turn',()=>{
 const s=setup('sm4-40');s.sides.opponent.hand=[ref('sm4-94','tool'),ref('sm4-123','warp'),ref('sm4-93','stadium'),ref('sm4-97','item')];
 attack(s,'player','Chaos Wheel');assert.equal(s.activeSide,'opponent');const actions=core.legalActions(s,'opponent');
 for(const id of ['sm4-94','sm4-123','sm4-93'])assert.equal(actions.some(a=>a.cardId===id),false,'Must block '+id);
 assert.ok(actions.some(a=>a.cardId==='sm4-97'),'Unrelated Item should be playable');
});

test('Sudden Sting applies both conditions only on a same-turn evolution',()=>{
 for(const sameTurn of [false,true]){const s=setup('sm4-3');s.sides.player.active.evolvedOnTurn=sameTurn?s.turnNumber:s.turnNumber-2;
  attack(s,'player','Sudden Sting');assert.equal(!!s.sides.opponent.active.conditions.poison,sameTurn);
  assert.equal(!!s.sides.opponent.active.conditions.paralysis,sameTurn);
 }
});

test('Single deck/hand interaction smoke: Draco Melody always resolves without invented cards',()=>{
 const s=setup('sm4-80');s.sides.player.deck=[ref('sm4-75','dragon'),ref('sm4-1','weedle')];s.sides.player.bench=[];
 attack(s,'player','Draco Melody');drain(s);
 assert.ok(s.sides.player.bench.length<=1);if(s.sides.player.bench.length){assert.equal(s.sides.player.bench[0].cardId,'sm4-75');assert.ok(!s.sides.player.deck.some(r=>r.uid==='dragon'));}
});
