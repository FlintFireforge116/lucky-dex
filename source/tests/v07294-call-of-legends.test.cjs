'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const col=require(path.join(asset,'tcg-classic-call-of-legends.js'));
const data=require(path.join(asset,'tcg-classic-battle-data.js'));
const fx=require(path.join(asset,'tcgp-battle-effects.js'));
const core=require(path.join(asset,'tcgp-battle-core.js'));
const cpu=require(path.join(asset,'tcg-classic-opponents.js'));
const id=n=>'col1-'+n, ref=(n,uid)=>({cardId:n.includes('-')?n:id(n),uid:uid||n}),slot=(n,uid)=>core.makePokemonSlot(id(n),3,uid||n);
const attack=(n,name)=>col.cardById(id(n)).attacks.find(x=>x.name===name);
const standard=cpu.generate({sets:['col1'],type:'Water',seed:47});
assert.equal(standard.ok,true,'Call of Legends CPU seed must build a deck');
function scene(){
 const s=core.createBattle({format:'classic',seed:47,firstSide:'player',playerDeck:standard.cards,opponentDeck:standard.cards,
  playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];
 for(const [side,b] of Object.entries(s.sides)){b.turnCount=3;b.active=slot(side==='player'?'59':'58',side+'-active');b.active.energy={Colorless:4};b.bench=[];b.hand=[];b.discard=[];b.lostZone=[];b.energyDiscard={};b.deck=[];}
 return s;
}
function run(s,e,{src=s.sides.player.active,action={},resolvingChoice=false,random=()=>0.2,isAttack=true}={}){
 const choices=[],p=s.sides.player,o=s.sides.opponent;const ctx={state:s,side:'player',foeSide:'opponent',attacker:src,defender:o.active,cardById:data.cardById,
  action,resolvingChoice,random,isAttack,requestChoice:spec=>choices.push(spec),shuffle:(_,deck)=>deck.reverse(),
  drawCard:board=>{const r=board.deck.shift();if(r)board.hand.push(r);return r;},onEnergyAttached:()=>{},maxHp:(side,slot)=>data.cardById(slot.cardId).hp};
 fx.applyEffect(e,ctx);return choices[0]||null;
}
function choose(s,choice,action,extra={}){assert.ok(choice,'must present a choice');return run(s,choice.effect,{...extra,resolvingChoice:true,action});}
function resolve(s,n,name,random=()=>0.2){return fx.resolveAttack(attack(n,name),{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,
 defender:s.sides.opponent.active,cardById:data.cardById,random,isAttack:true,maxHp:(side,p)=>data.cardById(p.cardId).hp});}

test('COL1 source pinned, 95 numbered + 11 SL, print fields match generated set',()=>{
 const buf=fs.readFileSync(path.join(root,'data/classic/col1-print-compact.json'));
 assert.equal(crypto.createHash('sha256').update(buf).digest('hex'),'ca9e2d472331f0e92ac82d8f91197e5e0c2a654601a4a4dc9b69df4522fe3640');
 const prints=JSON.parse(buf);assert.equal(prints.length,106);assert.equal(col.CARDS.length,106);
 assert.deepEqual(col.coverage(),{total:106,battleEnabled:106,gated:[]});
 const ids=new Set(prints.map(r=>r[0]));assert.equal(ids.size,106);
 for(let n=1;n<=95;n++)assert.ok(ids.has(String(n)));
 for(let n=1;n<=11;n++)assert.ok(ids.has('SL'+n));
 for(const r of prints){const c=col.cardById(id(r[0]));assert.ok(c);assert.equal(c.name,r[1]);assert.equal(c.rarity,r[12]);assert.equal(c.battleEnabled,true);
  if(c.kind==='pokemon'){assert.equal(c.hp,Number(r[4]));assert.equal(c.retreat,r[11]);assert.deepEqual(c.attacks.map(a=>a.name),r[7].map(a=>a[0]));
   assert.deepEqual(c.attacks.map(a=>a.text),r[7].map(a=>a[3]));assert.deepEqual(c.abilities.map(a=>a.name),r[8].map(a=>a[0]));}
  assert.ok(data.cardById(c.id),c.id+' should be in combat registry');
 }
});

test('all printed card effects are schema-valid and accessible to both collection and combat',()=>{
 for(const c of col.CARDS){for(const a of c.attacks||[])assert.doesNotThrow(()=>fx.validateEffect(a.effect),c.id+' '+a.name);
  for(const a of c.abilities||[])assert.doesNotThrow(()=>fx.validateEffect(a.effect),c.id+' '+a.name);
  if(c.effect)assert.doesNotThrow(()=>fx.validateEffect(c.effect),c.id+' top-level effect');}
 for(const n of ['SL1','SL3','SL7','SL9','SL11'])assert.equal(data.cardById(id(n)).deckEligible,true);
});

test('selected-set CPU produces valid thirty-card decks with complete evolution lines',()=>{
 for(let seed=1;seed<=16;seed++)for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless']){
  const result=cpu.generate({sets:['col1'],type,seed});if(!result.ok)continue;
  assert.equal(result.cards.length,30);assert.equal(data.validateDeck(result.cards).ok,true);
  const names=new Set(result.cards.map(k=>data.cardById(k)?.name));
  for(const k of result.cards){const c=data.cardById(k);if(['Stage 1','Stage 2'].includes(c.stage))assert.ok(names.has(c.evolvesFrom),c.name+' missing '+c.evolvesFrom);}
 }
});

test('Dimension Sphere counts only own Lost Zone Pokémon; reprinted Shiny uses same printed rule',()=>{
 const s=scene(),p=s.sides.player;s.sides.player.active=slot('14','lucario');
 p.lostZone=[ref('59','pokeA'),ref('SL9','pokeB'),ref('86','energy')];
 assert.equal(resolve(s,'14','Dimension Sphere').damage,70);
 p.lostZone=[ref('86','energy')];assert.equal(resolve(s,'14','Dimension Sphere').damage,30);
 assert.deepEqual(col.cardById(id('2')).attacks[0].effect,col.cardById(id('SL1')).attacks[0].effect);
});

test('Shocking Bolt physically sends basic + Special Energy to Lost Zone rather than discard',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('18','pach');p.active.energy={Lightning:2,Water:1};p.active.specialEnergy=[ref('86','darkness')];
 run(s,attack('18','Shocking Bolt').effect);
 assert.equal(p.active.energy.Lightning,0);assert.equal(p.active.energy.Water,0);assert.equal(p.active.specialEnergy.length,0);
 assert.equal(p.lostZone.length,4);assert.equal(p.lostZone.filter(r=>r.cardId===id('86')).length,1);assert.equal(p.discard.length,0);
});

test('Lost Claw moves a randomly selected actual opponent hand card to Lost Zone',()=>{
 const s=scene(),o=s.sides.opponent;o.hand=[ref('61','one'),ref('71','two'),ref('76','three')];
 run(s,attack('39','Lost Claw').effect,{random:()=>0.5});
 assert.deepEqual(o.hand.map(r=>r.uid),['one','three']);assert.deepEqual(o.lostZone.map(r=>r.uid),['two']);
});

test('Sleepy Lost sends top opponent deck card to Lost Zone and sleeps Mime Jr.',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('47','mime');o.deck=[ref('59','top'),ref('60','second')];
 run(s,attack('47','Sleepy Lost').effect);
 assert.equal(o.lostZone[0].uid,'top');assert.equal(o.deck[0].uid,'second');assert.equal(p.active.conditions.sleep,true);
});

test('Clomp sends chosen attached Energy, including Special Energy, to Lost Zone',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('33','snorlax');p.active.energy={Colorless:1};p.active.specialEnergy=[ref('86','special')];
 const choice=run(s,attack('33','Clomp Clomp Clobber').effect);assert.equal(choice.kind,'option');
 assert.equal(choice.options.length,2);choose(s,choice,{choiceOption:1});
 assert.equal(p.active.specialEnergy.length,0);assert.equal(p.lostZone.length,1);assert.equal(p.lostZone[0].uid,'special');
});

test('Lost Remover gives target/energy choices and transfers opposing Special Energy into opposing Lost Zone',()=>{
 const s=scene(),o=s.sides.opponent;o.active.specialEnergy=[ref('87','metal')];
 const choice=run(s,col.cardById(id('80')).effect,{isAttack:false});assert.equal(choice.kind,'pokemon');
 const next=choose(s,choice,{choiceTarget:'active'},{isAttack:false});assert.equal(next.kind,'option');
 choose(s,next,{choiceOption:0},{isAttack:false});assert.equal(o.active.specialEnergy.length,0);assert.deepEqual(o.lostZone.map(x=>x.uid),['metal']);
});

test('Selfish Draw offers player a real keep-or-discard choice and moves physical top card correctly',()=>{
 for(const draw of [false,true]){
  const s=scene(),p=s.sides.player;p.deck=[ref('59','top'),ref('60','following')];
  const choice=run(s,attack('64','Selfish Draw').effect);assert.equal(choice.kind,'option');
  choose(s,choice,{choiceOption:draw?1:0});
  assert.deepEqual(p.hand.map(x=>x.uid),[draw?'following':'top']);
  assert.deepEqual(p.discard.map(x=>x.uid),draw?['top']:[]);
 }
});

test('Research Record orders four physical cards on top and bottom without losing cards',()=>{
 const s=scene(),p=s.sides.player;p.deck=['59','60','61','62','63'].map((x,i)=>ref(x,'r'+i));
 const base=p.deck.map(x=>x.uid);
 const c0=run(s,col.cardById(id('84')).effect,{isAttack:false});assert.equal(c0.options.length,5);
 const c1=choose(s,c0,{choiceOption:1},{isAttack:false});assert.equal(c1.kind,'option');
 let next=choose(s,c1,{choiceOption:3},{isAttack:false});assert.equal(next.kind,'option');
 while(next)next=choose(s,next,{choiceOption:0},{isAttack:false});
 assert.equal(p.deck.length,5);assert.deepEqual(new Set(p.deck.map(x=>x.uid)),new Set(base));
 assert.equal(p.deck[0].uid,'r1');assert.equal(p.deck[4].uid,'r3');
});

test('Sage’s Training takes two selected cards, discards the other three',()=>{
 const s=scene(),p=s.sides.player;p.deck=['59','60','61','62','63','64'].map((x,i)=>ref(x,'s'+i));
 const c0=run(s,col.cardById(id('85')).effect,{isAttack:false});assert.equal(c0.kind,'option');assert.equal(c0.options.length,5);
 const c1=choose(s,c0,{choiceOption:1},{isAttack:false});assert.equal(c1.options.length,4);
 choose(s,c1,{choiceOption:2},{isAttack:false});
 assert.deepEqual(p.hand.map(x=>x.uid).sort(),['s1','s3']);assert.deepEqual(p.discard.map(x=>x.uid).sort(),['s0','s2','s4']);
 assert.deepEqual(p.deck.map(x=>x.uid),['s5']);
});

test('Cheerleader’s Cheer: opposing player chooses whether to draw bonus card',()=>{
 for(const accept of [false,true]){
  const s=scene(),o=s.sides.opponent;o.deck=[ref('59','gift')];
  const ch=run(s,{type:'neoRule',rule:'col1:76:cheer'},{isAttack:false});assert.equal(ch.kind,'option');assert.equal(ch.side,'opponent');
  choose(s,ch,{choiceOption:accept?1:0},{isAttack:false});assert.equal(o.hand.length,accept?1:0);
 }
});

test('Lost World alternate win requires six actual opposing Lost Zone Pokémon',()=>{
 const s=scene(),o=s.sides.opponent;s.stadium={cardId:id('81'),ownerSide:'player'};
 o.lostZone=[ref('59','a'),ref('60','b'),ref('61','c'),ref('64','d'),ref('66','e'),ref('86','notPokemon')];
 run(s,col.cardById(id('81')).effect.effect,{isAttack:false});assert.equal(s.phase,'battle');
 o.lostZone.push(ref('71','sixth'));run(s,col.cardById(id('81')).effect.effect,{isAttack:false});
 assert.equal(s.phase,'finished');assert.equal(s.winner,'player');
});

test('shiny legend Extreme Speed discounts retreat per matching basic and Special Energy',()=>{
 const s=scene(),p=s.sides.player;
 for(const [number,type] of [['SL3','Fire'],['SL9','Lightning'],['SL11','Water']]){
  p.active=slot(number,number);p.active.energy={[type]:2};
  p.active.specialEnergy=[{uid:'synthetic',cardId:'synthetic',provides:{[type]:1}}];
  assert.equal(fx.modifierAmount(s,'player',p.active,'retreatCost',data.cardById),-3);
 }
});

test('reprinted Special Metal Energy supplies continuous reduction for Metal Pokémon',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('31','metal');
 p.active.specialEnergy=[ref('87','newMetal')];
 assert.equal(fx.modifierAmount(s,'player',p.active,'damageReduction',data.cardById),10);
 p.active.specialEnergy=[ref('87','newMetal'),ref('hgss3-80','oldMetal')];
 assert.equal(fx.modifierAmount(s,'player',p.active,'damageReduction',data.cardById),20);
});
