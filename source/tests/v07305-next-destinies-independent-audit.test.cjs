'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const asset=path.join(__dirname,'../app/src/main/assets');
const data=require(path.join(asset,'tcg-classic-battle-data.js'));
const cpu=require(path.join(asset,'tcg-classic-opponents.js'));
const core=require(path.join(asset,'tcgp-battle-core.js'));
const fx=require(path.join(asset,'tcgp-battle-effects.js'));
const ref=(cardId,uid=cardId)=>({cardId,uid});
function slot(n,uid=n){return core.makePokemonSlot('bw4-'+n,4,uid);}
function scene(){
 const deck=cpu.generate({sets:['bw3'],type:'Fire',seed:7});assert.ok(deck.ok);
 const s=core.createBattle({format:'classic',seed:7,firstSide:'player',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];s.stadium=null;
 for(const [name,b] of Object.entries(s.sides)){b.turnCount=4;b.active=slot(name==='player'?'33':'54',name+'-active');b.active.energy={Colorless:4,Water:2};b.bench=[];b.hand=[];b.deck=[];b.discard=[];b.energyDiscard={};b.energySupply=[];b.lostZone=[];}
 return s;
}
function direct(s,n,name,{action={},retreatCost,random=()=>0.1}={}){
 const attack=data.cardById('bw4-'+n).attacks.find(a=>a.name===name);assert.ok(attack);
 return fx.resolveAttack(attack,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action,random,retreatCost,maxHp:(_side,p)=>data.cardById(p.cardId).hp,effectiveEnergy:p=>p.energy});
}
function apply(s,e,{random=()=>0.1}={}){let next=null;fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action:{},random,requestChoice:x=>next=x});return next;}
test('Crushing Ice uses current modified Retreat Cost, not base printed cost',()=>{
 const s=scene();s.sides.player.active=slot('33');s.sides.opponent.active=slot('54');
 assert.equal(data.cardById(s.sides.opponent.active.cardId).retreat,2);
 assert.equal(direct(s,'33','Crushing Ice',{retreatCost:()=>1}).damage,70);
 assert.equal(direct(s,'33','Crushing Ice',{retreatCost:()=>0}).damage,60);
 assert.equal(direct(s,'33','Crushing Ice',{retreatCost:()=>3}).damage,90);
});
test('Forewarn at full eight-card hand has no legal activation for player or CPU',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('59','forewarn');p.deck=[ref('bw4-1','one'),ref('bw4-2','two')];
 p.hand=Array.from({length:8},(_,i)=>ref('bw4-3','h'+i));
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='bw4-59'),false);
 p.hand.pop();assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='bw4-59'),true);
});
test('Stoke coin flip appears in the same visible coin-event log as other attacks',()=>{
 const s=scene();s.sides.player.active=slot('10');s.sides.player.energySupply=['Fire'];
 apply(s,{type:'neoRule',rule:'bw4:stoke'});
 assert.equal(s.log.some(e=>e.type==='coin'&&e.reason==='Stoke'&&Array.isArray(e.results)),true);
});
test('Power Pinch records two flip results for the attacking player',()=>{
 const s=scene();s.sides.player.active=slot('1');s.sides.opponent.active.energy={Water:2};
 const ch=apply(s,{type:'neoRule',rule:'bw4:powerPinch'});
 assert.equal(ch.kind,'option');
 const f=s.log.find(x=>x.type==='coin'&&x.reason==='Power Pinch');assert.deepEqual(f?.results,[true,true]);
});
test('Next Destinies full-arts and Pokémon-EX still receive exactly two Prizes',()=>{
 for(const num of [5,22,38,51,54,82,94,95,96,97,98,99]){
  const c=data.cardById('bw4-'+num);assert.equal(c.stage,'Basic');assert.equal(c.prizeCards,2);
 }
});

test('Crushing Ice uses actual Skyarrow Bridge retreat reduction in a live battle',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 s.stadium=ref('bw4-91','skyarrow');p.active=slot('33','vanilluxe');p.active.energy={Water:1,Colorless:2};
 o.active=slot('54','mewtwo-ex');o.active.energy={Psychic:1};
 const move=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(move);
 core.applyAction(s,'player',move);
 assert.equal(o.active.damage,70,'two printed Retreat Cost - one Skyarrow = 70 pre-matchup damage');
});
test('Giant Fan on the opposing Active triggers a legal opponent promotion without awarding a Prize',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot('71','nuzleaf');p.active.playedOnSideTurn=1;p.hand=[ref('bw4-72','shiftry')];
 o.active=slot('54','opponent-active');o.active.energy={Psychic:2};const next=slot('1','opponent-bench');next.benchSlot=0;o.bench=[next];
 const evo=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='bw4-72');assert.ok(evo);
 core.applyAction(s,'player',evo);assert.equal(s.phase,'effectChoice');
 const use=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===0);assert.ok(use);core.applyAction(s,'player',use);
 const target=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceTarget==='active');assert.ok(target);core.applyAction(s,'player',target);
 assert.equal(s.phase,'promote');assert.equal(s.promotionSide,'opponent');
 const promotion=core.legalActions(s,'opponent').find(a=>a.type==='promote');assert.ok(promotion);core.applyAction(s,'opponent',promotion);
 assert.equal(o.active.uid,'opponent-bench');assert.equal(p.prizesTaken,0);
 assert.ok(o.deck.some(ref=>ref.cardId==='bw4-54'));
});
test('Shadow Claw records coin flip and does not discard on tails',()=>{
 const s=scene();s.sides.player.active=slot('81');s.sides.opponent.hand=[ref('bw4-3','target')];
 apply(s,{type:'neoRule',rule:'bw4:shadowClaw'},{random:()=>0.9});
 assert.equal(s.sides.opponent.hand.length,1);
 assert.deepEqual(s.log.find(x=>x.type==='coin'&&x.reason==='Shadow Claw')?.results,[false]);
});
