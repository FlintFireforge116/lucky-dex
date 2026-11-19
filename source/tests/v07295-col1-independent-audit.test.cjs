'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const asset=path.resolve(__dirname,'../app/src/main/assets');
const col=require(path.join(asset,'tcg-classic-call-of-legends.js')),
 data=require(path.join(asset,'tcg-classic-battle-data.js')),
 fx=require(path.join(asset,'tcgp-battle-effects.js')),
 core=require(path.join(asset,'tcgp-battle-core.js')),
 cpu=require(path.join(asset,'tcg-classic-opponents.js')),
 builder=require(path.join(asset,'tcg-classic-deck-builder.js'));
const id=n=>'col1-'+n,ref=(n,uid)=>({uid:uid||n,cardId:id(n)}),slot=(n,uid)=>core.makePokemonSlot(id(n),3,uid||n);
const sample=cpu.generate({sets:['col1'],type:'Grass',seed:7});assert.ok(sample.ok);
function scene(){const s=core.createBattle({format:'classic',seed:7,playerDeck:sample.cards,opponentDeck:sample.cards,
 playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];
 for(const [which,board] of Object.entries(s.sides)){board.active=slot(which==='player'?'72':'59',which+'-active');board.active.energy={};board.bench=[];board.hand=[];board.deck=[];board.discard=[];board.lostZone=[];board.turnCount=3;board.energyDiscard={};}
 return s;}
function run(s,e,{action={},resolvingChoice=false,src=s.sides.player.active}={}){let choice=null,attached=[];const ctx={state:s,side:'player',foeSide:'opponent',attacker:src,defender:s.sides.opponent.active,
 cardById:data.cardById,action,resolvingChoice,random:()=>.25,isAttack:true,
 requestChoice:spec=>{choice=spec;},shuffle:(_state,deck)=>deck.reverse(),drawCard:board=>{const r=board.deck.shift();if(r)board.hand.push(r);return r;},onEnergyAttached:(...args)=>attached.push(args),
 maxHp:(_side,p)=>data.cardById(p.cardId)?.hp||50};fx.applyEffect(e,ctx);return {choice,attached};}
const nutrition={type:'neoRule',rule:'col1:72:nutrition'};
function continueWith(s,choice,action){assert.ok(choice,'expected live choice');return run(s,choice.effect,{action,resolvingChoice:true}).choice;}

test('Tangela physical source: no card disappears when targeting; only selected Grass card is attached',()=>{
 const s=scene(),p=s.sides.player;p.energySupply=['Fire','Water'];p.nextEnergyType='Fire';p.deck=[ref('88','grassPhysical'),ref('59','other')];
 const c1=run(s,nutrition).choice;assert.equal(c1?.kind,'deckCard');assert.equal(p.deck.length,2);
 const c2=continueWith(s,c1,{choiceDeckIndex:0});assert.equal(c2?.kind,'pokemon');assert.equal(p.deck.length,2);
 continueWith(s,c2,{choiceTarget:'active'});assert.equal(p.active.energy.Grass,1);assert.equal(p.deck.length,1);assert.equal(p.deck[0].uid,'other');
 assert.deepEqual(p.energySupply,['Fire','Water']);
});

test('Tangela Energy Zone search consumes the first actual matching Grass queue entry; ordinary per-turn quota unaffected',()=>{
 const s=scene(),p=s.sides.player;p.energySupply=['Fire','Grass','Water','Grass'];p.nextEnergyType='Fire';p.energyUsed=false;p.energyAvailable=true;
 const c=run(s,nutrition).choice;assert.equal(c?.kind,'pokemon');
 continueWith(s,c,{choiceTarget:'active'});
 assert.equal(p.active.energy.Grass,1);assert.deepEqual(p.energySupply,['Fire','Water','Grass']);assert.equal(p.nextEnergyType,'Fire');
 assert.equal(p.energyUsed,false);assert.equal(p.energyAvailable,true);
});

test('Tangela cannot create Grass Energy when ordered supply and physical deck have none',()=>{
 const s=scene(),p=s.sides.player;p.deck=[ref('59')];p.energySupply=['Fire','Fire'];p.energyTypes=['Fire'];
 assert.equal(run(s,nutrition).choice,null);assert.equal(p.active.energy.Grass,undefined);assert.deepEqual(p.energySupply,['Fire','Fire']);
});

test('Tangela offers a genuine source choice when physical Grass and ordered Grass supply both exist',()=>{
 const s=scene(),p=s.sides.player;p.deck=[ref('88','grassPhysical')];p.energySupply=['Water','Grass'];
 let c=run(s,nutrition).choice;assert.equal(c.kind,'option');assert.equal(c.options.length,2);
 c=continueWith(s,c,{choiceOption:1});assert.equal(c.kind,'pokemon');
 continueWith(s,c,{choiceTarget:'active'});assert.equal(p.active.energy.Grass,1);assert.equal(p.deck.length,1);
 assert.deepEqual(p.energySupply,['Water']);
});

test('Lost Remover only offers valid opposing targets carrying Special Energy',()=>{
 const s=scene(),o=s.sides.opponent;o.bench=[slot('71','specialBench')];o.bench[0].benchSlot=0;o.bench[0].specialEnergy=[ref('87','metal')];
 const c=run(s,col.cardById(id('80')).effect).choice;assert.equal(c.kind,'pokemon');
 assert.equal(fx.matchesFilter(data.cardById(o.active.cardId),c.filter,o.active),false);
 assert.equal(fx.matchesFilter(data.cardById(o.bench[0].cardId),c.filter,o.bench[0]),true);
 let n=continueWith(s,c,{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(n.kind,'option');
 continueWith(s,n,{choiceOption:0});assert.deepEqual(o.lostZone.map(x=>x.uid),['metal']);
});

test('Pachirisu Self-Generation choice only offers Energy that can provide Lightning',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('18','pachirisu');p.hand=[ref('89','fireHand'),ref('91','lightningHand'),ref('86','darkHand')];
 const e=col.cardById(id('18')).abilities[0].effect;let c=run(s,e).choice;assert.equal(c.kind,'handCard');
 assert.equal(fx.matchesFilter(data.cardById(id('89')),c.filter,p.hand[0]),false);
 assert.equal(fx.matchesFilter(data.cardById(id('91')),c.filter,p.hand[1]),true);
 assert.equal(fx.matchesFilter(data.cardById(id('86')),c.filter,p.hand[2]),false);
 continueWith(s,c,{choiceHandIndex:1});assert.equal(p.active.energy.Lightning,1);assert.deepEqual(p.hand.map(r=>r.uid),['fireHand','darkHand']);
});

test('Lost Zone synthetic Basic Energy keeps real COL1 energy identities, not unrelated special sets',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('18');p.active.energy={Lightning:1,Metal:1,Darkness:1};
 run(s,col.cardById(id('18')).attacks[0].effect);assert.deepEqual(p.lostZone.map(r=>r.cardId).sort(),['col1-91','col1-94','col1-95']);
});

test('COL1-specific physical Special Darkness/Metal reserves are in coherent focused builds',()=>{
 const owned=col.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 for(const [focus,type,expected] of [['31','Metal','col1-87'],['10','Darkness','col1-86']]){
   const d=builder.buildDeck(owned,{sets:['col1'],types:[type],focusCardId:id(focus)});
   assert.equal(d.ok,true,focus);assert.ok(d.cards.includes(expected),focus+' must have a physical Special Energy payoff');
   assert.equal(data.validateDeck(d.cards).ok,true);assert.equal(d.cards.length,30);
 }
});

test('COL1 CPU deck sweep: attack costs payable; evolution families intact; special payoff included for Dark/Metal',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(let seed=1;seed<=12;seed++){
   const d=cpu.generate({sets:['col1'],type,seed});assert.ok(d.ok,`${type}/${seed}`);
   assert.equal(d.cards.length,30);assert.equal(data.validateDeck(d.cards).ok,true);
   const cs=d.cards.map(data.cardById),names=new Set(cs.map(c=>c.name));
   for(const c of cs.filter(c=>c.kind==='pokemon'&&['Stage 1','Stage 2'].includes(c.stage)))assert.ok(names.has(c.evolvesFrom),`orphan ${c.name} ${type}/${seed}`);
   if(cs.some(c=>c.kind==='pokemon'&&c.types?.includes('Metal')))assert.ok(d.cards.includes('col1-87'),`missing Metal payoff ${type}/${seed}`);
   if(cs.some(c=>c.kind==='pokemon'&&c.types?.includes('Darkness')))assert.ok(d.cards.includes('col1-86'),`missing Darkness payoff ${type}/${seed}`);
 }
});
