'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'app/src/main/assets');
const data=require(path.join(dir,'tcg-classic-battle-data.js')),cards=require(path.join(dir,'tcg-classic-dragons-exalted.js')),fx=require(path.join(dir,'tcgp-battle-effects.js')),core=require(path.join(dir,'tcgp-battle-core.js')),cpu=require(path.join(dir,'tcg-classic-opponents.js'));
const slot=(n,uid='pokemon-'+n)=>core.makePokemonSlot('bw6-'+n,4,uid);const ref=(id,uid)=>({cardId:id,uid});
function scene(){const d=cpu.generate({sets:['bw6'],type:'Dragon',seed:37});assert.ok(d.ok);
 const s=core.createBattle({format:'classic',seed:37,firstSide:'player',playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Fire','Water','Lightning','Darkness','Grass','Psychic','Fighting','Metal'],opponentEnergyTypes:['Fire','Water','Lightning','Darkness','Grass','Psychic','Fighting','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];s.modifiers=[];s.stadium=null;
 for(const [which,p] of Object.entries(s.sides)){p.turnCount=4;p.active=slot(which==='player'?85:110,which+'-active');p.active.energy={};p.bench=[];p.hand=[];p.deck=[];p.discard=[];p.energyDiscard={};p.energySupply=[];p.prizes=[ref('bw6-1',which+'p1'),ref('bw6-2',which+'p2'),ref('bw6-3',which+'p3')];p.prizesTaken=0;}
 return s;}
function bench(s,n,uid='bench'+s.bench.length){const p=slot(n,uid);p.benchSlot=s.bench.length;s.bench.push(p);return p;}
function resolve(s,n,name){const a=cards.cardById('bw6-'+n).attacks.find(x=>x.name===name);return fx.resolveAttack(a,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,isAttack:true,random:()=>.1,effectiveEnergy:p=>core.effectiveEnergy(s,p===s.sides.player.active?'player':'opponent',p)});}
function apply(s,e,action={},resolvingChoice=false){let choice=null;
 fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action,resolvingChoice,isAttack:true,random:()=>.1,
 requestChoice:ch=>choice=ch,maxHp:(_side,p)=>data.cardById(p.cardId)?.hp});return choice;}

test('Ninetales Hexed Flame counts ALL five printable conditions, +50 per condition',()=>{
 const s=scene();s.sides.player.active=slot(19);s.sides.opponent.active=slot(110);
 assert.equal(resolve(s,19,'Hexed Flame').damage,20);
 s.sides.opponent.active.conditions={burn:true};assert.equal(resolve(s,19,'Hexed Flame').damage,70);
 s.sides.opponent.active.conditions={burn:true,poison:true,confusion:true};assert.equal(resolve(s,19,'Hexed Flame').damage,170);
 s.sides.opponent.active.conditions={sleep:true,paralysis:true};assert.equal(resolve(s,19,'Hexed Flame').damage,120);
});
test('Marowak Vortex Chop tests Resistance rather than Retreat Cost',()=>{
 const s=scene();s.sides.player.active=slot(61);s.sides.opponent.active=slot(110);assert.equal(data.cardById(s.sides.opponent.active.cardId).resistance,null);
 assert.equal(resolve(s,61,'Vortex Chop').damage,60,'no Resistance despite retreat cost');
 s.sides.opponent.active=slot(83);assert.equal(data.cardById(s.sides.opponent.active.cardId).resistance,'Psychic');
 assert.equal(resolve(s,61,'Vortex Chop').damage,90,'Resistance adds 30 even if not matching attacker Fighting');
});
test('Probopass Magnetic Lines permits decline, Basic Energy and physical Special Energy with original UID',()=>{
 const s=scene(),o=s.sides.opponent,p=s.sides.player;p.active=slot(82);o.active=slot(85);o.active.energy={Fire:1};o.active.specialEnergy=[ref('bw6-117','blend-original')];const b=bench(o,110,'destination');
 const e=cards.cardById('bw6-82').attacks[0].effect;
 let ch=apply(s,e);assert.equal(ch.kind,'option');assert.equal(ch.options.length,3);assert.match(ch.options[0],/Do not move/);
 apply(s,ch.effect,{choiceOption:0},true);assert.equal(o.active.specialEnergy.length,1);
 ch=apply(s,e);const specialIx=ch.options.findIndex(x=>x.includes('Blend Energy'));assert.ok(specialIx>=1);
 ch=apply(s,ch.effect,{choiceOption:specialIx},true);assert.equal(ch.kind,'pokemon');
 apply(s,ch.effect,{choiceTarget:'bench',choiceBenchIndex:0},true);
 assert.equal(o.active.specialEnergy.length,0);assert.equal(b.specialEnergy.length,1);assert.equal(b.specialEnergy[0].uid,'blend-original');assert.equal(o.active.energy.Fire,1);
 ch=apply(s,e);ch=apply(s,ch.effect,{choiceOption:1},true);apply(s,ch.effect,{choiceTarget:'bench',choiceBenchIndex:0},true);
 assert.equal(o.active.energy.Fire,0);assert.equal(b.energy.Fire,1);
});
test('Registeel Triple Laser applies Active weakness but not Bench weakness, one hit per target',()=>{
 const s=scene();s.sides.player.active=slot(81);const o=s.sides.opponent;o.active=slot(85,'victim');o.active.weaknessOverride='Metal';const one=bench(o,85,'bench1'),two=bench(o,85,'bench2');one.weaknessOverride='Metal';two.weaknessOverride='Metal';
 const e=cards.cardById('bw6-81').attacks[0].effect;
 let ch=apply(s,e);assert.equal(ch.kind,'pokemon');ch=apply(s,ch.effect,{choiceTarget:'opponentActive'},true);
 assert.equal(o.active.damage,60,'weak Metal Active must take 60, not flat 30');assert.equal(ch.kind,'pokemon');
 ch=apply(s,ch.effect,{choiceTarget:'bench',choiceBenchIndex:0},true);assert.equal(one.damage,30,'Bench ignores Weakness');
 ch=apply(s,ch.effect,{choiceTarget:'bench',choiceBenchIndex:1},true);assert.equal(two.damage,30);assert.equal(o.active.damage,60);
});
test('Registeel Triple Laser applies Bouffer after Weakness, including on the Bench',()=>{
 const s=scene();s.sides.player.active=slot(81);const o=s.sides.opponent;o.active=slot(110,'bouffer-active');o.active.weaknessOverride='Metal';const one=bench(o,110,'bouffer-bench'),two=bench(o,85,'unprotected');one.weaknessOverride='Metal';two.weaknessOverride='Metal';
 const e=cards.cardById('bw6-81').attacks[0].effect;
 let ch=apply(s,e);ch=apply(s,ch.effect,{choiceTarget:'opponentActive'},true);assert.equal(o.active.damage,40,'30 × 2 minus Bouffer 20');
 ch=apply(s,ch.effect,{choiceTarget:'bench',choiceBenchIndex:0},true);assert.equal(one.damage,10,'30 minus Bouffer 20 without Bench Weakness');
 apply(s,ch.effect,{choiceTarget:'bench',choiceBenchIndex:1},true);assert.equal(two.damage,30);assert.equal(o.active.damage,40);
});
test('Shedinja no-prize Ability yields one Prize if Garbotoxin is active',()=>{
 for(const suppress of [false,true]){
  const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(85);p.active.energy={Fire:3,Lightning:1};o.active=slot(48,'shed');bench(o,110,'reserve');if(suppress)bench(o,54,'garb').tool=ref('bw6-114','tool');
  const action=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackCardId==='bw6-85'&&x.effectSelection==='Fire');assert.ok(action);
  core.applyAction(s,'player',action);
  const claims=(s.pendingPrizeClaims||[]).filter(x=>x.side==='player');assert.equal(claims.reduce((n,x)=>n+x.remaining,0),suppress?1:0,`Garbotoxin ${suppress}`);
 }
});
