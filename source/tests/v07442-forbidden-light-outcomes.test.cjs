'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const effects=JSON.parse(execFileSync('python3',['-c',`import sys,json;sys.path.insert(0,'scripts');import sm6_verified as v;print(json.dumps({k:x for k,(txt,x) in v.ATTACKS.items()}))`],{encoding:'utf8'}));
const mkSlot=(id,uid)=>({cardId:id,uid,stack:[id],damage:0,energy:{Colorless:6,Fighting:6},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
function setup(attackName,baseDamage=0){
 const old=data.cardById,dict=new Map();
 const mk=(id,name,stage='Basic',more={})=>({id,name,kind:'pokemon',stage,types:['Fighting'],subtype:'Fighting',hp:600,retreat:0,battleEnabled:true,deckEligible:true,attacks:[],abilities:[],...more});
 const hero=mk('sm6-test-hero','Alolan Test Hero','Basic',{attacks:[{name:attackName,cost:['C'],damage:baseDamage,effect:effects[attackName],gxAttack:false}]});
 const foe=mk('sm6-test-foe','Opponent','Basic',{retreat:3});
 const bench=mk('sm6-test-bench','Alolan Test Bench','Basic');
 const ub=mk('sm6-test-ub','Test Ultra Beast','Basic',{tags:['ultra-beast']});
 for(const c of [hero,foe,bench,ub])dict.set(c.id,c);
 data.cardById=id=>dict.get(id)||old(id);
 let s;
 try{s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:91401,firstSide:'player',playerEnergyTypes:['Fighting'],opponentEnergyTypes:['Fighting']});}
 catch(e){data.cardById=old;throw e;}
 s.phase='battle';s.activeSide='player';s.turnNumber=7;
 for(const side of ['player','opponent']){const ss=s.sides[side];ss.turnCount=4;ss.hand=[];ss.deck=Array.from({length:20},(_,i)=>({uid:side+i,cardId:'sm4-1'}));ss.discard=[];ss.energyDiscard={};ss.energySupply=['Fighting','Fighting','Fighting'];ss.prizes=Array.from({length:5},(_,i)=>({uid:side+'prize'+i,cardId:'sm4-1'}));}
 s.sides.player.active=mkSlot(hero.id,'player-active');s.sides.player.bench=[mkSlot(bench.id,'player-bench')];
 s.sides.opponent.active=mkSlot(foe.id,'opponent-active');s.sides.opponent.bench=[mkSlot(foe.id,'opponent-bench')];
 for(const ss of Object.values(s.sides))ss.bench.forEach((p,i)=>p.benchSlot=i);
 return {s,hero,foe,bench,ub,finish:()=>data.cardById=old};
}
function attack(h){const a=core.legalActions(h.s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(a,'expected attack');core.applyAction(h.s,'player',a);}
test('SM6 six added rule descriptions use validated real engine descriptors',()=>{
 for(const n of ['Alolan Club','Burdensome Bone','Beast Raid','Jet Needle','Sky Drop','Cell Connector'])assert.deepEqual(fx.validateEffect(effects[n]),[],n);
});
test('Alolan Club counts matching Pokémon in play including attacker, not the opponent',()=>{const h=setup('Alolan Club');try{attack(h);assert.equal(h.s.sides.opponent.active.damage,40);}finally{h.finish();}});
test('Beast Raid counts actual Ultra Beast tagged Pokémon only',()=>{const h=setup('Beast Raid');try{h.hero.tags=['ultra-beast'];h.s.sides.player.bench[0].cardId=h.ub.id;attack(h);assert.equal(h.s.sides.opponent.active.damage,40);}finally{h.finish();}});
test('Jet Needle ignores both opposing Weakness and Resistance',()=>{const h=setup('Jet Needle',110);try{h.foe.weakness='Fighting';h.foe.resistance='Fighting';attack(h);assert.equal(h.s.sides.opponent.active.damage,110);}finally{h.finish();}});
test('Sky Drop deducts 20 for each of the defending Pokémon three Retreat units',()=>{const h=setup('Sky Drop',80);try{attack(h);assert.equal(h.s.sides.opponent.active.damage,20);}finally{h.finish();}});
test('Cell Connector takes only discarded Fighting Energy, not fresh Zone supply',()=>{const h=setup('Cell Connector',50);try{const p=h.s.sides.player;p.active.energy={Colorless:1};p.energyDiscard={Fighting:2};p.energySupply=['Fighting','Fighting'];attack(h);assert.equal(p.active.energy.Fighting,2);assert.equal(p.energyDiscard.Fighting,0);assert.equal(p.energySupply.length,2);}finally{h.finish();}});
test('Burdensome Bone retains a next-own-turn attack restriction',()=>{const h=setup('Burdensome Bone',40);try{attack(h);assert.equal(h.s.sides.opponent.active.damage,40);assert.ok(h.s.sides.player.active.locks?.some(l=>l.action==='attack'),JSON.stringify(h.s.sides.player.active));}finally{h.finish();}});
