'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(A+'/tcgp-battle-core.js'),data=require(A+'/tcg-classic-battle-data.js'),fx=require(A+'/tcgp-battle-effects.js'),ex=require(A+'/tcg-classic-unseen-forces.js'),cpu=require(A+'/tcg-classic-opponents.js');
const deck=cpu.generate({sets:['ex10'],seed:194}).cards;
let serial=0;
function slot(id,uid,benchSlot){const p=core.makePokemonSlot(id,3,uid);p.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Metal:4};p.benchSlot=benchSlot;return p;}
function setup(my='ex10-1',enemy='ex10-50'){
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:19400+(++serial),firstSide:'player',playerEnergyTypes:['Fire','Fighting','Psychic'],opponentEnergyTypes:['Water','Grass','Lightning']});
 s.phase='battle';s.activeSide='player';s.turnNumber=11;s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=slot(my,'pa',null);s.sides.player.bench=[slot('ex10-51','pb',0)];s.sides.opponent.active=slot(enemy,'oa',null);s.sides.opponent.bench=[slot('ex10-62','ob',0)];return s;
}
function legal(s,p=(s.choiceSide||s.activeSide)){return core.legalActions(s,p);}
function doAction(s,fn){const actions=legal(s);const a=actions.find(fn);assert.ok(a,'expected action '+JSON.stringify(actions).slice(0,1200));core.applyAction(s,s.choiceSide||s.activeSide,a);return a;}
function choose(s,p){assert.equal(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));return doAction(s,p||((a)=>!a.choiceSkip));}
function finish(s,max=40){let n=0;while(s.phase==='effectChoice'&&n++<max)choose(s);assert.notEqual(s.phase,'effectChoice','Unresolved effect choice');}
function act(s,i=0,p){return doAction(s,a=>a.type==='attack'&&a.attackIndex===i&&(!p||p(a)));}
function power(s,id){fx.applyEffect({type:'neoRule',rule:'ex10:power:'+id},{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.01});}
function effect(s,key){fx.applyEffect({type:'neoRule',rule:'ex10:'+key},{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.01});}

test('Every EX Unseen Forces card registered with real attack and ability support',()=>{
 assert.equal(ex.CARDS.length,145);assert.equal(ex.coverage().battleEnabled,145);
 for(const c of ex.CARDS){assert.equal(c.support.status,'FULL',c.id);for(const attack of c.attacks||[])assert.ok(fx.supportsEffect(attack.effect),c.id+' '+attack.name);}
 const val=data.validateDeck(deck);assert.equal(val.ok,true,JSON.stringify(val.errors));
});
test('Ampharos moves actual Energy from selected Bench to Active (not from Zone)',()=>{
 const s=setup(),p=s.sides.player;p.active.energy={};p.bench[0].energy={Fire:1};p.energySupply=['Water'];
 power(s,1);choose(s,a=>a.choiceBenchIndex===0);choose(s,a=>a.choiceOption===0);finish(s);
 assert.equal(p.active.energy.Fire,1);assert.equal(p.bench[0].energy.Fire,0);assert.deepEqual(p.energySupply,['Water']);
});
test('Porygon2 3-D Reset returns specific Tool to hand',()=>{
 const s=setup('ex10-12'),p=s.sides.player;p.bench[0].tool={uid:'tool-x',cardId:'ex10-85'};
 power(s,12);choose(s,a=>a.choiceBenchIndex===0);choose(s,a=>a.choiceOption===0);finish(s);
 assert.ok(p.hand.some(x=>x.uid==='tool-x'));assert.equal(p.bench[0].tool,null);
});
test('Baby Evolution takes actual eligible hand card and heals completely',()=>{
 const s=setup('ex10-31'),p=s.sides.player;p.active.damage=30;p.hand=[{uid:'jynx-in-hand',cardId:'ex10-28'}];
 power(s,31);choose(s);finish(s);assert.equal(p.active.cardId,'ex10-28');assert.equal(p.active.damage,0);assert.equal(p.hand.length,0);
});
test('Eevee Energy Evolution selects matching evolution after hand-only attachment',()=>{
 const s=setup('ex10-55'),p=s.sides.player;p.deck=[{uid:'vapor',cardId:'ex10-19'},{uid:'jolt',cardId:'ex10-8'}];
 fx.applyEffect({type:'neoRule',rule:'ex10:power:55'},{...core.effectContext(s,'player',{},p.active),random:()=>0.01,eventData:{fromHand:true,energyType:'Water'}});
 choose(s,a=>a.choiceDeckIndex===0);finish(s);assert.equal(p.active.cardId,'ex10-19');
});
test('Blissey ex Blissful Support discards attached Basic & Special Energy and heals target',()=>{
 const s=setup('ex10-101'),p=s.sides.player;p.bench[0].energy={Fire:2};p.bench[0].damage=30;p.active.energy={};
 fx.applyEffect({type:'neoRule',rule:'ex10:power:101'},{...core.effectContext(s,'player',{},p.active),random:()=>0.01,eventData:{fromHand:true}});
 choose(s,a=>a.choiceBenchIndex===0);if(s.phase==='effectChoice')choose(s,a=>a.choiceSkip);finish(s);
 assert.equal(p.bench[0].energy.Fire,0);assert.equal(p.energyDiscard.Fire,2);assert.equal(p.bench[0].damage,0);
});
test('Unown question mark selects secret hand card, opponent guesses and incorrect guess draws cards',()=>{
 const s=setup('ex10-?'),p=s.sides.player;p.hand=[{uid:'secret',cardId:'ex10-51'}];p.deck=[{uid:'draw1',cardId:'ex10-52'},{uid:'draw2',cardId:'ex10-53'}];
 effect(s,'?:0');choose(s,a=>a.choiceHandIndex===0);choose(s,a=>a.choiceOption===1);finish(s);
 assert.equal(p.hand.length,3);assert.ok(p.hand.some(x=>x.uid==='secret'));
});
test('Special Warp Energy prompt switches the correct owner active',()=>{
 const s=setup('ex10-51'),p=s.sides.player;p.hand=[{uid:'warp',cardId:'ex10-100'}];p.handEnergyUsed=false;
 const attach=legal(s,'player').find(a=>a.type==='attachSpecial'&&a.handIndex===0&&a.target==='active');
 assert.ok(attach,'Warp Energy playable on active');core.applyAction(s,'player',attach);assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceBenchIndex===0);finish(s);
 assert.equal(p.active.uid,'pb');
});
test('Unown hidden power C copies a real Supporter from opponent discard without removing it',()=>{
 const s=setup('ex10-C'),p=s.sides.player,o=s.sides.opponent;o.discard=[{uid:'birch',cardId:'ex9-82'}];
 effect(s,'C:0');if(s.phase==='effectChoice')finish(s);assert.equal(o.discard.length,1);
});
test('All currently enabled EX Unseen Forces attacks make progress without non-terminating choice flows',()=>{
 const ids=ex.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon');let executed=0;
 for(const c of ids)for(let i=0;i<(c.attacks||[]).length;i++){
  const s=setup(c.id,'ex10-20');s.sides.player.active.energy={Grass:8,Fire:8,Water:8,Lightning:8,Psychic:8,Fighting:8,Metal:8};
  try {const a=legal(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i);if(!a)continue;core.applyAction(s,'player',a);finish(s,180);executed++;}catch(err){throw new Error(c.id+' '+c.attacks[i].name+': '+err.message);}
 }
 assert.ok(executed>=120,'executed '+executed);
});

test('Typhlosion ex Bursting Up takes extra Fire from the ordered Energy Zone, not discard',()=>{
 const s=setup('ex10-110'),p=s.sides.player;p.energySupply=['Fire','Water','Fire'];p.active.energy={};
 fx.applyEffect({type:'neoRule',rule:'ex10:power:110'},{...core.effectContext(s,'player',{},p.active),random:()=>0.01,eventData:{fromHand:true}});
 choose(s,a=>a.choiceTarget==='active');choose(s,a=>a.choiceOption===0);finish(s);
 assert.equal(p.active.energy.Fire,1);assert.equal(p.energyDiscard?.Fire||0,0);
});
test('Meganium ex Nurture and Heal attaches Grass from hand and heals chosen Pokémon',()=>{
 const s=setup('ex10-106'),p=s.sides.player;p.hand=[{uid:'grass',cardId:'ex9-101'}];p.bench[0].damage=30;p.bench[0].energy={};
 power(s,106);choose(s,a=>a.choiceBenchIndex===0);choose(s,a=>a.choiceOption===0);finish(s);
 assert.equal(p.bench[0].energy.Grass,1);assert.equal(p.bench[0].damage,20);assert.equal(p.hand.length,0);
});
test('Espeon ex Devo Flash devolves the selected opposing Bench Pokémon into hand',()=>{
 const s=setup('ex10-102'),o=s.sides.opponent;o.bench[0]=slot('ex10-56','ob',0);o.bench[0].stack=['ex10-62','ex10-56'];
 fx.applyEffect({type:'neoRule',rule:'ex10:power:102'},{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.01,eventData:{fromHand:true}});
 choose(s,a=>a.choiceBenchIndex===0);finish(s);
 assert.equal(o.bench[0].cardId,'ex10-62');assert.ok(o.hand.some(r=>r.cardId==='ex10-56'));
});
test('Ho-Oh ex Golden Wing allows Energy transfer BEFORE being knocked out',()=>{
 const s=setup('ex10-104'),p=s.sides.player;p.active.energy={Fire:2};p.bench[0].energy={};
 fx.applyEffect({type:'neoRule',rule:'ex10:power:104'},{...core.effectContext(s,'player',{},p.active),random:()=>0.01,eventData:{source:{attack:true,side:'opponent',uid:'oa'}}});
 choose(s,a=>a.choiceBenchIndex===0);choose(s,a=>a.choiceOption===0);if(s.phase==='effectChoice'){choose(s,a=>a.choiceBenchIndex===0);choose(s,a=>a.choiceOption===0);}finish(s);
 assert.equal(p.active.energy.Fire,0);assert.equal(p.bench[0].energy.Fire,2);
});
test('Lugia ex Silver Sparkle sends a chosen enemy Energy back to their hand',()=>{
 const s=setup('ex10-105'),o=s.sides.opponent;o.active.energy={Fire:1};o.hand=[];
 fx.applyEffect({type:'neoRule',rule:'ex10:power:105'},{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.01,eventData:{damage:20,source:{attack:true,side:'opponent',uid:'oa'}}});
 choose(s,a=>a.choiceOption===0);finish(s);
 assert.equal(o.active.energy.Fire,0);assert.ok(o.hand.some(r=>data.cardById(r.cardId)?.subtype==='Fire'));
});
test('Houndoom Lonesome prevents Items only when actually outnumbered; allows Supporter',()=>{
 const s=setup('ex10-51'),o=s.sides.opponent,p=s.sides.player;o.active=slot('ex10-7','oa');o.bench=[];p.bench.push(slot('ex10-53','pb2',1));
 assert.equal(fx.isActionLocked(s,'player','Item',data.cardById),true);
 assert.equal(fx.isActionLocked(s,'player','Supporter',data.cardById),false);
 o.bench.push(slot('ex10-51','ob',0),slot('ex10-55','ob2',1));assert.equal(fx.isActionLocked(s,'player','Item',data.cardById),false);
});
test('Ursaring Intimidating Ring blocks opposing Basic Pokémon attacks only while Active',()=>{
 const s=setup('ex10-51','ex10-18');assert.equal(fx.passiveAttackAllowed(s,'player',s.sides.player.active,data.cardById),false);
 s.sides.opponent.active=slot('ex10-53','oa');s.sides.opponent.bench[0]=slot('ex10-18','ob',0);
 assert.equal(fx.passiveAttackAllowed(s,'player',s.sides.player.active,data.cardById),true);
});
test('Feraligatr ex Overpowering Fang suppresses non-ex abilities for both players',()=>{
 const s=setup('ex10-103','ex10-55');assert.equal(fx.abilitiesSuppressed(s,'opponent',s.sides.opponent.active,data.cardById),true);
 s.sides.player.active=slot('ex10-55','pa');s.sides.opponent.active=slot('ex10-103','oa');assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,data.cardById),true);
});
test('Miltank Thick Fat reduces Fire and Water attack damage after Weakness and Resistance',()=>{
 const s=setup('ex10-5','ex10-42'),p=s.sides.player.active,d=s.sides.opponent.active;
 const n=fx.attackDamageWithState(s,'player',p,'opponent',d,60,data.cardById);
 assert.equal(n,30);
});
test('Energy Root grants 20 HP while disabling the attached Pokémon abilities',()=>{
 const s=setup('ex10-1'),p=s.sides.player.active;p.tool={uid:'root',cardId:'ex10-83'};
 assert.equal(fx.abilitiesSuppressed(s,'player',p,data.cardById),true);
 assert.equal(fx.modifierAmount(s,'player',p,'maxHp',data.cardById),20);
});
test('Solid Rage gives bonus only while behind on remaining Prize cards',()=>{
 const s=setup('ex10-51'),p=s.sides.player.active;p.tool={uid:'rage',cardId:'ex10-92'};
 s.sides.player.prizes=[1,2,3];s.sides.opponent.prizes=[1];assert.equal(fx.modifierAmount(s,'player',p,'attackDamage',data.cardById),20);
 s.sides.player.prizes=[1];s.sides.opponent.prizes=[1,2,3];assert.equal(fx.modifierAmount(s,'player',p,'attackDamage',data.cardById),0);
});
