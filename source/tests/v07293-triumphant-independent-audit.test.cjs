'use strict';
// Card-by-card print/text-to-execution counterexamples: these are not permissive smoke checks.
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const src=path.resolve(__dirname,'..'),asset=path.join(src,'app/src/main/assets');
const h=require(path.join(asset,'tcg-classic-triumphant.js')),
  db=require(path.join(asset,'tcg-classic-battle-data.js')),
  fx=require(path.join(asset,'tcgp-battle-effects.js')),
  core=require(path.join(asset,'tcgp-battle-core.js')),
  cpu=require(path.join(asset,'tcg-classic-opponents.js'));
const id=x=>'hgss4-'+x,ref=(x,uid)=>({cardId:x.startsWith('hgss')||x.startsWith('dp')?x:id(x),uid:uid||x}),
 slot=(x,uid)=>core.makePokemonSlot(id(x),3,uid||x),attack=(x,name)=>h.cardById(id(x)).attacks.find(a=>a.name===name);
const sample=cpu.generate({sets:['hgss4'],type:'Water',seed:3});assert.ok(sample.ok);
function scene(){const s=core.createBattle({format:'classic',seed:2029,firstSide:'player',playerDeck:sample.cards,opponentDeck:sample.cards,
 playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.turnNumber=5;s.activeSide='player';
 for(const board of [s.sides.player,s.sides.opponent]){board.turnCount=3;board.active=slot('58','active-'+board.id);board.bench=[];board.hand=[];board.discard=[];board.lostZone=[];board.energyDiscard={};board.active.energy={Metal:4,Colorless:4};}
 return s;}
function run(s,e,{src=s.sides.player.active,random=()=>0.25,action={},resolvingChoice=false,isAttack=true}={}){
 const choices=[],p=s.sides.player,o=s.sides.opponent,ctx={state:s,side:'player',foeSide:'opponent',attacker:src,defender:o.active,cardById:db.cardById,
  random,isAttack,resolvingChoice,action,requestChoice:spec=>choices.push(spec),shuffle:(_,deck)=>deck.reverse(),
  drawCard:board=>{const r=board.deck.shift();if(r)board.hand.push(r);return r;},
  onEnergyAttached:()=>{},maxHp:(side,slot)=>db.cardById(slot.cardId).hp};
 fx.applyEffect(e,ctx);return choices[0]||null;
}
function resolveAttack(s,x,name,random=()=>0.25){const src=s.sides.player.active;return fx.resolveAttack(attack(x,name),{
 state:s,side:'player',foeSide:'opponent',attacker:src,defender:s.sides.opponent.active,cardById:db.cardById,random,isAttack:true,
 maxHp:(side,p)=>db.cardById(p.cardId).hp});}
function finish(s,choice,action,src=s.sides.player.active){assert.ok(choice,'Expected an interactive choice');return run(s,choice.effect,{src,resolvingChoice:true,action});}

test('Triumphant self-recoil: Lunatone Selfdestruct hits own Active for 60 and both Benches for 10',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('25','moon');p.bench=[slot('58','ally')];o.bench=[slot('58','enemy')];
 const out=resolveAttack(s,'25','Selfdestruct');assert.equal(out.damage,60);
 for(const e of out.pendingEffects)run(s,e,{src:p.active});
 assert.equal(p.active.damage,60);assert.equal(p.bench[0].damage,10);assert.equal(o.bench[0].damage,10);
});
test('Triumphant Voltorb Magnetic Bomb deals tails recoil and heads bonus',()=>{
 for(const [random,damage,recoil] of [[()=>0.9,20,10],[()=>0.1,30,0]]){
  const s=scene(),p=s.sides.player;p.active=slot('83','ball');
  const out=resolveAttack(s,'83','Magnetic Bomb',random);assert.equal(out.damage,damage);
  for(const e of out.pendingEffects)run(s,e,{src:p.active,random});assert.equal(p.active.damage,recoil);
 }
});
test('Lickilicky Licking Shot counts attached basic and Special Energy cards, then targets correctly',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('38','lick');p.active.energy={Colorless:2};
 p.active.specialEnergy=[ref('hgss4-90','rescue')];o.active=slot('58','target');o.bench=[slot('58','bench')];
 let ch=run(s,attack('38','Licking Shot').effect,{src:p.active});assert.equal(ch.kind,'pokemon');
 finish(s,ch,{choiceTarget:'bench',choiceBenchIndex:0},p.active);assert.equal(o.bench[0].damage,30);assert.equal(o.active.damage,0);
});
test('Electivire Thunder Shot uses Active weakness but never Bench weakness',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('20','electivire');o.active=slot('52','water');o.active.energy={Water:1};
 o.bench=[slot('52','benched-water')];o.bench[0].energy={Water:1};
 run(s,attack('20','Thunder Shot').effect,{src:p.active});
 assert.equal(o.active.damage,100);assert.equal(o.bench[0].damage,50);
});
test('Psyduck Tripping Headbutt tails damages a chosen OWN Pokémon, heads chooses opponent',()=>{
 for(const [random,own] of [[()=>0.9,true],[()=>0.1,false]]){
  const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('74','duck');p.bench=[slot('58','ally')];o.active=slot('58','foe');o.bench=[slot('58','foebench')];
  const ch=run(s,attack('74','Tripping Headbutt').effect,{src:p.active,random});
  assert.equal(ch.selectionSide,own?'player':'opponent');
  finish(s,ch,{choiceTarget:'bench',choiceBenchIndex:0},p.active);
  assert.equal(p.bench[0].damage,own?30:0);assert.equal(o.bench[0].damage,own?0:30);
 }
});
test('Pidgey Messenger physically returns its own card, Basic Energy and Special Energy to deck after search',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('71','bird');p.active.energy={Grass:2};p.active.specialEnergy=[ref('hgss4-90','rescue')];
 p.deck=[ref('32','target'),ref('58','other')];const initial=p.deck.length;
 const ch=run(s,attack('71','Messenger').effect,{src:p.active});assert.equal(ch.kind,'deckCard');
 finish(s,ch,{choiceDeckIndex:0},p.active);
 assert.ok(p.hand.some(r=>r.cardId===id('32')));assert.equal(p.active,null);
 assert.equal(p.deck.length,initial-1+4);assert.equal(p.deck.filter(r=>r.cardId===id('71')).length,1);
 assert.equal(p.deck.filter(r=>r.cardId==='dp1-123').length,2);
 assert.equal(p.deck.filter(r=>r.cardId==='hgss4-90').length,1);
});
test('Carnivine Saliva Lure and Bellsprout Inviting Scent choose replacement on attacking side, unlike Swablu',()=>{
 for(const n of ['16','57'])assert.equal(h.cardById(id(n)).attacks[0].effect.chooseBy,'attacker');
 assert.equal(attack('78','Wing Flick').effect.chooseBy,'defender');
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('16','carnivine');o.bench=[slot('58','enemy')];
 const ch=run(s,attack('16','Saliva Lure').effect,{src:p.active});assert.equal(ch.kind,'switchBench');assert.equal(ch.side,'self');
});
test('Original printed identity, energy, full 103 cards and selected-set CPU evolution plans survive audit fixes',()=>{
 assert.equal(h.CARDS.length,103);assert.equal(h.coverage().battleEnabled,103);
 for(let seed=1;seed<=20;seed++)for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless']){
  const g=cpu.generate({sets:['hgss4'],type,seed});if(!g.ok)continue;
  assert.equal(g.cards.length,30);assert.equal(db.validateDeck(g.cards).ok,true);
  const names=new Set(g.cards.map(x=>db.cardById(x).name));
  for(const id of g.cards){const c=db.cardById(id);if(['Stage 1','Stage 2'].includes(c.stage))assert.ok(names.has(c.evolvesFrom),c.name+' orphaned');}
  for(const [a,b] of [['99','100'],['101','102']])assert.equal(g.cards.filter(x=>x===id(a)).length,g.cards.filter(x=>x===id(b)).length);
 }
});

test('Spiritomb Spooky Whirlpool is optional: declining leaves opponent hand intact; accepting shuffles and draws six',()=>{
 const rule=h.cardById(id('10')).abilities.find(x=>x.name==='Spooky Whirlpool').effect;
 for(const accept of [false,true]){
  const s=scene(),o=s.sides.opponent;
  o.hand=[ref('58','a'),ref('57','b')];o.deck=[ref('59','c'),ref('60','d'),ref('61','e'),ref('62','f'),ref('63','g'),ref('64','h'),ref('65','i')];
  const old=o.hand.map(r=>r.uid);const ch=run(s,rule,{src:slot('10','spirit'),isAttack:false});
  assert.equal(ch.kind,'option');assert.match(ch.options[0],/Do not use/);
  finish(s,ch,{choiceOption:accept?1:0},slot('10','spirit'));
  if(!accept){assert.deepEqual(o.hand.map(r=>r.uid),old);assert.equal(o.deck.length,7);}
  else{assert.equal(o.hand.length,6);assert.equal(o.deck.length,3);assert.ok([...o.deck,...o.hand].some(r=>old.includes(r.uid)));}
 }
});
test('Porygon2 Mapping is optional and finds only a Stadium through a real, filtered deck-card decision',()=>{
 const rule=h.cardById(id('49')).abilities.find(x=>x.name==='Mapping').effect;
 for(const accept of [false,true]){
  const s=scene(),p=s.sides.player;p.deck=[ref('hgss4-86','stadium'),ref('hgss4-83','pokemon')];
  const source=slot('49','porygon2'),ch=run(s,rule,{src:source,isAttack:false});
  assert.equal(ch.kind,'option');assert.match(ch.options[0],/Do not use/);
  const next=finish(s,ch,{choiceOption:accept?1:0},source);
  if(!accept){assert.equal(next,null);assert.equal(p.deck.length,2);assert.equal(p.hand.length,0);}
  else{assert.equal(next.kind,'deckCard');assert.equal(next.filter.trainerType,'Stadium');
    assert.deepEqual(p.deck.filter(r=>fx.matchesFilter(db.cardById(r.cardId),next.filter)).map(r=>r.uid),['stadium']);
    finish(s,next,{choiceDeckIndex:0},source);assert.equal(p.hand[0].cardId,id('86'));assert.equal(p.deck.length,1);}
 }
});
