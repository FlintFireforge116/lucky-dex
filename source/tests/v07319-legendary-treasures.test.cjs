'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js')),
      effects=require(path.join(assets,'tcgp-battle-effects.js')),
      core=require(path.join(assets,'tcgp-battle-core.js')),
      decks=require(path.join(assets,'tcg-classic-decks.js')),
      builder=require(path.join(assets,'tcg-classic-deck-builder.js')),
      set=require(path.join(assets,'tcg-classic-legendary-treasures.js'));
const ref=(cardId,uid=cardId)=>({cardId,uid}),R=(rule,extra={})=>({type:'neoRule',rule:'bw11:'+rule,...extra});
const mon=(id,uid=id)=>({...core.makePokemonSlot(id,1,uid),energy:{},specialEnergy:[],damage:0,tool:null,extraTools:[],conditions:{}});
const side=()=>({active:mon('bw9-1'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},handLimit:8,benchLimit:3,turnCount:3,prizes:[ref('bw9-1')],prizesTaken:0});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rules:{benchSize:3},sides:{player:side(),opponent:side()},log:[],rngState:1});
function context(s,extra={}){let choice=null;const ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,
 cardById:(id)=>id==='bw11-113'?{id,name:'Double Colorless Energy',effect:{provides:{Colorless:2}},specialEnergy:true}:data.cardById(id),
 isAttack:true,random:()=>.1,action:extra.action||{},resolvingChoice:!!extra.resolvingChoice,
 shuffle:()=>{},requestChoice:q=>{choice=q;},drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r;},
 onEnergyAttached:()=>{},...extra};return {ctx,getChoice:()=>choice};}
function fire(s,e,extra={}){const {ctx,getChoice}=context(s,extra);effects.applyEffect(e,ctx);return getChoice();}
function attack(s,name,damage=0,attackData={}){const {ctx}=context(s);return effects.resolveAttack({name,damage,cost:['C'],effect:R(name),...attackData},ctx);}
const source=path.join(root,'data/classic/bw11-print-compact.json');
test('BW11 source conserves 115 numbered plus 25 RC prints, 220 attacks and 19 abilities', {skip:!fs.existsSync(source)},()=>{
 const src=JSON.parse(fs.readFileSync(source));
 assert.equal(src.length,140);assert.equal(set.CARDS.length,140);
 assert.deepEqual(set.CARDS.map(c=>c.number),[
   ...Array.from({length:115},(_,i)=>''+(i+1)),...Array.from({length:25},(_,i)=>'RC'+(i+1))]);
 assert.equal(src.reduce((n,r)=>n+r[7].length,0),220);
 assert.equal(src.reduce((n,r)=>n+r[8].length,0),19);
 assert.equal(data.coverage().legendaryTreasures.printed,140);
 assert.equal(set.cardById('bw11-RC25').name,'Meloetta-EX');
 for(let i=0;i<140;i++){const p=set.CARDS[i],r=src[i];assert.equal(p.name,r[1],p.id);
  assert.strictEqual(data.cardById(p.id),p);assert.equal(p.attacks?.length||0,r[7].length,p.id);
  if(p.battleEnabled){assert.equal(p.deckEligible,true);for(const a of p.attacks||[])assert.notEqual(a.effect?.type,'unsupported',p.id+':'+a.name);}
 }
 for(const n of ['23','56','110','RC16','87','80','106'])assert.equal(set.cardById('bw11-'+n).battleEnabled,false,'must gate '+n);
 assert.deepEqual(set.cardById('bw11-113').effect.provides,{Colorless:2});
 assert.equal(set.cardById('bw11-113').specialEnergy,true);
 assert.equal(set.cardById('bw11-RC24').abilities[0].name,'Versatile');
});
test('BW11 damage scaling is before matchup; attached DCE counts as two energy units',()=>{
 const s=scene(),a=s.sides.player.active,d=s.sides.opponent.active;
 a.damage=40;assert.equal(attack(s,'outrage',20).damage,60);
 a.damage=0;a.specialEnergy=[ref('bw11-113','dce')];d.energy.Grass=2;
 assert.equal(attack(s,'xBall',0).damage,80);
 assert.equal(attack(s,'energyPress',10).damage,50);
 a.energy.Water=3;assert.equal(attack(s,'hydroPump',60).damage,90);
 s.sides.player.prizesTaken=2;s.sides.opponent.prizesTaken=3;
 assert.equal(attack(s,'howlingRampage',0).damage,100);
});
test('BW11 Round counts own Pokemon with the printed Round attack',()=>{
 const s=scene();s.sides.player.bench=[mon('bw9-1','a'),mon('bw9-1','b')];
 const src=x=>x==='bw11-round'?{attacks:[{name:'Round'}]}:data.cardById(x);
 s.sides.player.active.cardId='bw11-round';s.sides.player.bench[0].cardId='bw11-round';
 const {ctx}=context(s,{cardById:src});const r=effects.resolveAttack({name:'Round',damage:0,damageText:'30×',cost:['P'],effect:R('round')},ctx);
 assert.equal(r.damage,60);
});
test('BW11 Crushing Hammer offers precise physical discard selection on heads',()=>{
 const s=scene(),d=s.sides.opponent.active;d.energy.Water=2;d.specialEnergy=[ref('bw8-127','plasma')];
 const q=fire(s,R('crushingHammer'));assert.equal(q.kind,'option');assert.equal(q.options.length,2);
 fire(s,q.effect,{action:{choiceOption:1},resolvingChoice:true});
 assert.equal(d.specialEnergy.length,0);assert.equal(s.sides.opponent.discard[0].uid,'plasma');
 assert.equal(d.energy.Water,2);
});
test('BW11 Dig Out consumes exactly one deck card across target-choice continuation',()=>{
 const s=scene();s.sides.player.deck=[ref('bw1-105','first'),ref('bw1-106','second')];
 const q=fire(s,R('digOut'));assert.equal(q.kind,'pokemon');assert.deepEqual(s.sides.player.deck.map(r=>r.uid),['second']);
 fire(s,q.effect,{action:{choiceTarget:'active'},resolvingChoice:true});
 assert.equal(s.sides.player.active.energy.Grass,1);assert.deepEqual(s.sides.player.deck.map(r=>r.uid),['second']);
});
test('BW11 Energy Switch moves one basic counter, never a physical Special Energy',()=>{
 const s=scene(),p=s.sides.player.active,b=mon('bw9-2','b');b.benchSlot=0;s.sides.player.bench=[b];
 p.energy.Water=2;p.specialEnergy=[ref('bw8-127','plasma')];
 const q=fire(s,R('energySwitch'));assert.equal(q.options.length,1);
 const x=fire(s,q.effect,{action:{choiceOption:0},resolvingChoice:true});assert.equal(x.kind,'pokemon');
 fire(s,x.effect,{action:{choiceTarget:'bench',choiceBenchIndex:0},resolvingChoice:true});
 assert.equal(p.energy.Water,1);assert.equal(b.energy.Water,1);assert.deepEqual(p.specialEnergy.map(x=>x.uid),['plasma']);
});
test('BW11 physical Plasma Gale consumes physical Energy reference and refuses empty special pool',()=>{
 const s=scene();assert.equal(attack(s,'plasmaGale',120).damage,0);
 s.sides.player.active.specialEnergy=[ref('bw9-106','plasma')];
 const r=attack(s,'plasmaGale',120);assert.equal(r.damage,120);
 assert.equal(r.pendingEffects.length,1);
 fire(s,r.pendingEffects[0]);assert.equal(s.sides.player.active.specialEnergy.length,0);
 assert.equal(s.sides.player.discard[0].uid,'plasma');
});
test('BW11 CPU recovery builds legal 30-card decks for every advertised type', {skip:!fs.existsSync(source)},()=>{
 const rows=set.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Dragon','Colorless']){
  const r=builder.rescueBW11Deck(rows,{sets:['bw11'],types:[type]});
  assert.ok(r?.ok,type+' no legal rescue');assert.equal(r.cards.length,30,type);
  assert.ok(r.cards.every(id=>data.cardById(id)?.setId==='bw11'),type);
  assert.equal(data.validateDeck(r.cards).ok,true,type);
  assert.equal(decks.validateDraft(r.cards,rows,{requireFull:true}).ok,true,type);
 }
 assert.equal(builder.rescueBW11Deck(rows,{sets:['bw9'],types:['Water']}),null);
});
