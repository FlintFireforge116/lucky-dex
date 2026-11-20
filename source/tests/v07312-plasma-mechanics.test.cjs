'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const fx=require(path.join(__dirname,'../app/src/main/assets/tcgp-battle-effects.js'));
const printed=new Map([
 ['bw8-14',{id:'bw8-14',name:'Moltres-EX',types:['Fire'],pokemonEX:true,teamPlasma:true}],
 ['bw8-55',{id:'bw8-55',name:'Crobat',types:['Psychic'],teamPlasma:true}],
 ['bw8-101',{id:'bw8-101',name:'Snorlax',types:['Colorless'],teamPlasma:true}],
 ['bw8-108',{id:'bw8-108',name:'Lugia-EX',types:['Colorless'],pokemonEX:true,teamPlasma:true}],
 ['bw8-127',{id:'bw8-127',name:'Plasma Energy',kind:'energy',specialEnergy:true,teamPlasma:true,effect:{type:'specialEnergy',provides:{Colorless:1}}}],
 ['bw8-78',{id:'bw8-78',name:'Lucario',types:['Fighting'],abilities:[{type:'passive',effect:{type:'neoRule',rule:'bw8:dualArmor'}}]}],
 ['bw8-123',{id:'bw8-123',name:'Hypnotoxic Laser',kind:'trainer',trainerType:'Item'}],
 ['bw8-125',{id:'bw8-125',name:'Team Plasma Grunt',kind:'trainer',trainerType:'Supporter',teamPlasma:true}],
 ['bw8-118',{id:'bw8-118',name:'Colress',kind:'trainer',trainerType:'Supporter',teamPlasma:true}],
 ['bw6-118',{id:'bw6-118',name:'Blend Energy WLFM',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Water:1,Lightning:1,Fighting:1,Metal:1}}}],
 ['bw1-105',{id:'bw1-105',name:'Grass Energy',kind:'energy',basicEnergy:true,energyType:'Grass'}]
]);
const byId=id=>printed.get(id)||{id,name:'Test Pokémon',types:['Grass'],kind:'pokemon',hp:100};
const ref=(cardId,uid)=>({cardId,uid});
const p=(id,uid)=>({uid:uid||id,cardId:id,stack:[id],energy:{},specialEnergy:[],damage:0,conditions:{},tool:null,extraTools:[]});
const side=()=>({active:null,bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energySupply:[],prizes:[],handLimit:8,benchLimit:3});
function scene(){return {format:'classic',sides:{player:side(),opponent:side()},turnNumber:3,activeSide:'player',log:[],rules:{benchSize:3}};}
const E=k=>({type:'neoRule',rule:'bw8:'+k});
function apply(s,e,opt={}){let choice=null;fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:byId,action:opt.action||{},resolvingChoice:!!opt.resume,random:()=>0.1,requestChoice:v=>choice=v,drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r;},shuffle:(_s,deck)=>deck.reverse(),onEnergyAttached:()=>{},...opt.ctx});return choice;}
function attack(s,k,base=0,action={}){return fx.resolveAttack({name:k,damage:base,effect:E(k)},{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:byId,isAttack:true,action,random:()=>0.1,retreatCost:()=>1});}
test('Lugia plasma gale needs attached PHYSICAL Plasma Energy and discards original UID',()=>{
 const s=scene();s.sides.player.active=p('bw8-108');s.sides.opponent.active=p('bw8-101');
 assert.equal(attack(s,'plasmaGale',120).damage,0);
 s.sides.player.active.specialEnergy=[ref('bw8-127','actual-plasma')];const r=attack(s,'plasmaGale',120);assert.equal(r.damage,120);
 assert.equal(r.pendingEffects.length,1);apply(s,r.pendingEffects[0]);assert.equal(s.sides.player.discard[0].uid,'actual-plasma');
});
test('Smogbank deals 20 to Active once and separately deals 20 to each Bench',()=>{
 const s=scene();s.sides.player.active=p('bw8-55');s.sides.opponent.active=p('bw8-101');s.sides.opponent.bench=[p('bw8-14','a'),p('bw8-55','b')];
 const r=attack(s,'smogbank');assert.equal(r.damage,20);assert.equal(r.pendingEffects.length,1);apply(s,r.pendingEffects[0]);
 assert.equal(s.sides.opponent.active.damage,0);assert.deepEqual(s.sides.opponent.bench.map(x=>x.damage),[20,20]);
});
test('Team Plasma count uses distinct Pokémon, never Trainers or Energy cards',()=>{
 const s=scene();s.sides.player.active=p('bw8-101');s.sides.player.bench=[p('bw8-14'),p('bw8-55')];s.sides.opponent.active=p('bw8-108');
 s.sides.player.active.specialEnergy=[ref('bw8-127','plasma')];s.sides.player.hand=[ref('bw8-125','grunt')];
 assert.equal(attack(s,'teampact').damage,90);
});
test('Hypnotoxic Laser applies poison and coin-gated sleep, both after same action',()=>{
 const s=scene();s.sides.player.active=p('bw8-101');s.sides.opponent.active=p('bw8-55');apply(s,E('hypnotoxicLaser'));
 assert.equal(s.sides.opponent.active.conditions.poison,true);assert.equal(s.sides.opponent.active.conditions.sleep,true);
 assert.equal(s.log.filter(v=>v.type==='coin').length,1);
});
test('Discharge scales by attached Lightning providers and moves only eligible original physical cards to discard',()=>{
 const s=scene();s.sides.player.active=p('bw8-55');s.sides.opponent.active=p('bw8-14');s.sides.player.active.energy.Lightning=2;
 s.sides.player.active.specialEnergy=[ref('bw6-118','lightning-special'),ref('bw8-127','plasma-special')];
 const r=attack(s,'discharge');assert.equal(r.damage,90);assert.equal(r.pendingEffects.length,1);apply(s,r.pendingEffects[0]);
 assert.equal(s.sides.player.active.energy.Lightning,0);assert.equal(s.sides.player.energyDiscard.Lightning,2);
 assert.deepEqual(s.sides.player.active.specialEnergy.map(x=>x.uid),['plasma-special']);assert.deepEqual(s.sides.player.discard.map(x=>x.uid),['lightning-special']);
});
test('Lucario Dual Armor grants Metal with physical Metal-providing Special Energy',()=>{
 const s=scene();const luc=p('bw8-78');s.sides.player.active=luc;s.sides.opponent.active=p('bw8-101');
 assert.deepEqual(fx.effectiveTypes(s,'player',luc,byId),['Fighting']);
 luc.specialEnergy=[ref('bw6-118','metal-blend')];assert.deepEqual(fx.effectiveTypes(s,'player',luc,byId),['Fighting','Metal']);
});
test('Colress shuffles hand into physical deck before drawing exactly total bench count',()=>{
 const s=scene();s.sides.player.active=p('bw8-101');s.sides.opponent.active=p('bw8-55');s.sides.player.bench=[p('bw8-14')];s.sides.opponent.bench=[p('bw8-14'),p('bw8-101')];
 s.sides.player.hand=[ref('bw8-125','old-a'),ref('bw8-125','old-b')];s.sides.player.deck=[ref('bw8-127','old-c')];apply(s,E('colress'));
 assert.equal(s.sides.player.hand.length,3);assert.equal(s.sides.player.deck.length,0);assert.equal(s.sides.player.hand.length+s.sides.player.deck.length,3);
});
test('Hail flips once, hits Active for normal damage and Bench for exactly 10 each',()=>{
 const s=scene();s.sides.player.active=p('bw8-55');s.sides.opponent.active=p('bw8-101');s.sides.opponent.bench=[p('bw8-14')];
 const r=attack(s,'hail');assert.equal(r.damage,10);assert.equal(r.pendingEffects.length,1);
 apply(s,r.pendingEffects[0]);assert.equal(s.sides.opponent.active.damage,0);assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('Destructive Flame discards one chosen actual Special Energy on heads, never a phantom counter',()=>{
 const s=scene();s.sides.player.active=p('bw8-14');s.sides.opponent.active=p('bw8-101');s.sides.opponent.active.specialEnergy=[ref('bw8-127','plasma-real')];
 const wrapper={type:'coinFlip',heads:E('destructiveFlame')};apply(s,wrapper);
 assert.equal(s.sides.opponent.active.specialEnergy.length,0);assert.deepEqual(s.sides.opponent.discard.map(r=>r.uid),['plasma-real']);
});
