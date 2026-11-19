'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
const path=require('node:path');
const asset=path.resolve(__dirname,'../app/src/main/assets');
const bw=require(path.join(asset,'tcg-classic-emerging-powers.js'));
const data=require(path.join(asset,'tcg-classic-battle-data.js'));
const fx=require(path.join(asset,'tcgp-battle-effects.js'));
const core=require(path.join(asset,'tcgp-battle-core.js'));
const cpu=require(path.join(asset,'tcg-classic-opponents.js'));
const builder=require(path.join(asset,'tcg-classic-deck-builder.js'));
const attack=(num,name)=>{const a=bw.cardById('bw2-'+num).attacks.find(x=>x.name===name);assert.ok(a,`bw2-${num}: ${name}`);return a;};
const slot=(num,uid)=>core.makePokemonSlot('bw2-'+num,3,uid||'bw2-'+num);
const ref=(id,uid)=>({uid,cardId:id});
const starter=cpu.generate({sets:['bw1'],type:'Fire',seed:72}); assert.ok(starter.ok);
function scene(){const s=core.createBattle({format:'classic',seed:72,firstSide:'player',playerDeck:starter.cards,opponentDeck:starter.cards,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
  s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];for(const [which,b] of Object.entries(s.sides)){b.turnCount=3;b.active=slot(which==='player'?'23':'31',which+'-active');b.active.energy={Colorless:4};b.bench=[];b.hand=[];b.deck=[];b.discard=[];b.energyDiscard={};b.energySupply=[];b.lostZone=[];}return s;}
function run(s,e,{action={},resolvingChoice=false,src=s.sides.player.active,random=()=>.1,isAttack=true}={}){let ch=null;const p=s.sides.player,o=s.sides.opponent;
  const ctx={state:s,side:'player',foeSide:'opponent',attacker:src,defender:o.active,cardById:data.cardById,action,resolvingChoice,random,isAttack,
    requestChoice:spec=>ch=spec,shuffle:(_,arr)=>arr.reverse(),drawCard:b=>{const r=b.deck.shift();if(r)b.hand.push(r);return r;},benchCard:(b,r)=>{const m=core.makePokemonSlot(r.cardId,b.turnCount,r.uid);m.benchSlot=b.bench.length;b.bench.push(m);return m;},onEnergyAttached:()=>{},maxHp:(_side,x)=>x?data.cardById(x.cardId)?.hp:0};fx.applyEffect(e,ctx);return ch;}
function select(s,ch,action,opts){assert.ok(ch,'Expected a prompted choice');return run(s,ch.effect,{action,resolvingChoice:true,...opts});}
function bench(side,num,uid){const m=slot(num,uid||'bench'+side.bench.length);m.benchSlot=side.bench.length;side.bench.push(m);return m;}

test('BW2 catalogue has 98 individually addressed, enabled prints and zero unsupported effects',()=>{assert.equal(bw.coverage().total,98);assert.equal(bw.coverage().battleEnabled,98);for(const c of bw.CARDS){assert.equal(data.cardById(c.id),c);for(const a of c.attacks||[])assert.notEqual(a.effect?.type,'unsupported',c.id+':'+a.name);if(c.kind==='trainer')assert.notEqual(c.effect?.type,'unsupported',c.id);}});

test('Rushing Water selects opposing Active Energy and an opposing Bench destination, preserving counts',()=>{const s=scene(),o=s.sides.opponent;o.active.energy={Fire:1,Water:2};const b0=bench(o,'30'),b1=bench(o,'31');b0.energy={};b1.energy={};let ch=run(s,attack('23','Rushing Water').effect);assert.equal(ch.kind,'option');assert.equal(ch.options.length,2);ch=select(s,ch,{choiceOption:0});assert.equal(ch.kind,'pokemon');assert.equal(ch.selectionSide,'opponent');assert.equal(ch.includeActive,false);select(s,ch,{choiceTarget:'bench',choiceBenchIndex:1});assert.equal(o.active.energy.Fire,0);assert.equal(o.active.energy.Water,2);assert.equal(b1.energy.Fire,1);assert.equal(b0.energy.Fire,undefined);assert.equal(o.energyDiscard.Fire,undefined);});

test('Rushing Water can move an existing Special Energy card without discarding or copying it',()=>{const s=scene(),o=s.sides.opponent;o.active.energy={};o.active.specialEnergy=[{uid:'sp-special-1',cardId:'neo1-104'}];const dest=bench(o,'30');let ch=run(s,attack('23','Rushing Water').effect);assert.equal(ch.kind,'option');ch=select(s,ch,{choiceOption:0});assert.equal(ch.kind,'pokemon');select(s,ch,{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(o.active.specialEnergy.length,0);assert.equal(dest.specialEnergy[0].uid,'sp-special-1');assert.equal(o.discard.length,0);});

test('Rushing Water safely does nothing if there are no attached Energy or no opposing Bench',()=>{const s=scene(),o=s.sides.opponent;o.active.energy={Water:2};assert.equal(run(s,attack('23','Rushing Water').effect),null);const b=bench(o,'30');o.active.energy={};assert.equal(run(s,attack('23','Rushing Water').effect),null);assert.equal(b.energy.Water,undefined);});

test('elemental monkeys advertise conditional bonus Energy and focused autobuild actually supplies it',()=>{const owned=bw.CARDS.filter(c=>c.deckEligible).map(c=>({gameplayId:c.id,quantity:4}));for(const [id,types] of [['2',['Grass','Fire']],['19',['Fire','Water']],['23',['Water','Grass']]]){const c=bw.cardById('bw2-'+id);assert.deepEqual(c.deckMeta.conditionalAttackEnergyTypes,[types[1]]);assert.ok(c.deckMeta.preferredEnergyTypes.includes(types[1]));const d=builder.buildDeck(owned,{sets:['bw2'],focusCardId:c.id});assert.ok(d.ok,c.id+': '+d.errors);assert.deepEqual(d.energyTypes,types);assert.equal(d.cards.length,30);}});

test('Thundurus 97 and Tornadus 98 have full-art identity tags, not secret-rare flags',()=>{for(const n of [97,98]){const c=bw.cardById('bw2-'+n);assert.ok(c.tags.includes('full-art'));assert.equal(c.rarity,'Rare Ultra');assert.ok(c.battleEnabled);assert.equal(c.attacks.length,2);}});

test('Simipour Grass Power needs Grass Energy and heals exactly two damage counters',()=>{const s=scene(),p=s.sides.player;p.active=slot('23');p.active.energy={Water:3};p.active.damage=50;run(s,attack('23',"Grass' Power").effect);assert.equal(p.active.damage,50);p.active.energy.Grass=1;run(s,attack('23',"Grass' Power").effect);assert.equal(p.active.damage,30);});

test('Scolipede Toxic Claws sets 20-point poison, not normal 10-point poison',()=>{const s=scene();s.sides.player.active=slot('40');s.sides.opponent.active=slot('35');run(s,attack('40','Toxic Claws').effect);assert.equal(s.sides.opponent.active.conditions.poison.amount,20);});

test('Watchog Watcheck permits reordering the opponent top five cards in a chosen order',()=>{const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('79');o.deck=Array.from({length:7},(_,i)=>ref('bw2-80','d'+i));let ch=run(s,attack('79','Watcheck').effect);assert.equal(ch.kind,'topDeckCard');assert.equal(ch.deckSide,'opponent');assert.equal(ch.count,5);for(const [i,uid] of ['d4','d3','d2','d1','d0'].entries()){const j=o.deck.findIndex(r=>r.uid===uid);ch=select(s,ch,{choiceDeckIndex:j});if(i!==4)assert.equal(ch.kind,'topDeckCard');}assert.deepEqual(o.deck.map(r=>r.uid),['d4','d3','d2','d1','d0','d5','d6']);});

test('Great Ball allows declining all top-seven Pokémon and returns every card',()=>{const s=scene(),p=s.sides.player;p.deck=Array.from({length:8},(_,i)=>ref(i%2?'bw2-30':'bw2-80','gb'+i));let ch=run(s,bw.cardById('bw2-93').effect,{isAttack:false});assert.equal(ch.kind,'option');select(s,ch,{choiceOption:ch.options.length-1},{isAttack:false});assert.equal(p.hand.length,0);assert.equal(p.deck.length,8);assert.deepEqual(new Set(p.deck.map(x=>x.uid)),new Set(Array.from({length:8},(_,i)=>'gb'+i)));});

test('Broader deck legality: 108 BW2 CPU builds retain 30 cards and valid evolution dependencies',()=>{for(let seed=1;seed<=108;seed++){const res=cpu.generate({sets:['bw2'],seed,type:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'][seed%9]});assert.ok(res.ok,`seed ${seed}: ${res.errors}`);assert.equal(res.cards.length,30);}});

test('Gothorita Deleting Glare heads chooses an Energy-bearing opposing Pokémon and a specific Energy',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('46');o.active.energy={};const target=bench(o,'30');target.energy={Water:2,Fire:1};const empty=bench(o,'31');empty.energy={};
 let ch=run(s,attack('46','Deleting Glare').effect);assert.equal(ch.kind,'pokemon');assert.equal(ch.selectionSide,'opponent');assert.ok(ch.excludeUids?.includes(o.active.uid));assert.ok(ch.excludeUids?.includes(empty.uid));
 ch=select(s,ch,{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(ch.kind,'option');assert.equal(ch.options.length,2);
 select(s,ch,{choiceOption:1});assert.equal(target.energy.Fire,0);assert.equal(target.energy.Water,2);assert.equal(o.energyDiscard.Fire,1);
});

test('Crushing Hammer tails does not discard Energy and heads lets player choose valid target',()=>{
 const s=scene(),o=s.sides.opponent;o.active.energy={Water:1};let ch=run(s,bw.cardById('bw2-92').effect,{isAttack:false,random:()=>.9});assert.equal(ch,null);assert.equal(o.active.energy.Water,1);
 const b=bench(o,'30');b.energy={Metal:1};ch=run(s,bw.cardById('bw2-92').effect,{isAttack:false,random:()=>.1});assert.equal(ch.kind,'pokemon');assert.equal(ch.selectionSide,'opponent');ch=select(s,ch,{choiceTarget:'bench',choiceBenchIndex:0},{isAttack:false});assert.equal(ch.kind,'option');select(s,ch,{choiceOption:0},{isAttack:false});assert.equal(b.energy.Metal,0);assert.equal(o.energyDiscard.Metal,1);
});

test('Simisage Fire Power and Simisear Water Power trigger only with correct attached Energy',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('2');p.active.energy={Grass:1};o.active.conditions={};run(s,attack('2',"Fire's Power").effect);assert.equal(o.active.conditions.burn,undefined);p.active.energy.Fire=1;run(s,attack('2',"Fire's Power").effect);assert.ok(o.active.conditions.burn);
 o.active.conditions={};p.active=slot('19');p.active.energy={Fire:1};run(s,attack('19',"Water's Power").effect);assert.equal(o.active.conditions.sleep,undefined);p.active.energy.Water=1;run(s,attack('19',"Water's Power").effect);assert.ok(o.active.conditions.sleep);
});
