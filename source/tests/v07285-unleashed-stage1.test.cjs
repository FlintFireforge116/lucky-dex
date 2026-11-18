'use strict';
/* Authenticated HGSS Unleashed identity, safety, ownership and gameplay audit. */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const file=fs.readFileSync(path.join(root,'data/classic/hgss2-print-compact.json'));
const raw=JSON.parse(file.toString('utf8'));
const set=require(path.join(assets,'tcg-classic-unleashed.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const legendPairs=[['90','91'],['92','93'],['94','95']];
const symbols={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'};
const id=n=>'hgss2-'+n;
const cref=(cardId,uid)=>({cardId,uid:uid||cardId});
const pokemon=(cardId,uid)=>core.makePokemonSlot(cardId,3,uid||cardId);
function scene(){
 const d=cpu.generate({sets:['hgss2'],type:'Fire',seed:2});assert.ok(d.ok,JSON.stringify(d));
 const s=core.createBattle({format:'classic',firstSide:'player',seed:12345,playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Fire','Water','Lightning','Grass','Psychic','Fighting'],opponentEnergyTypes:['Fire','Water','Lightning']});
 s.phase='battle';s.turnNumber=5;s.activeSide='player';s.sides.player.turnCount=3;s.sides.opponent.turnCount=2;
 s.sides.player.active=pokemon(id('52'),'magmar');s.sides.opponent.active=pokemon(id('65'),'teddiursa');
 s.sides.player.bench=[];s.sides.opponent.bench=[];s.sides.player.hand=[];s.sides.opponent.hand=[];
 return s;
}
test('locked 96 authentic collector prints include secret Alph Lithograph TWO',()=>{
 assert.equal(crypto.createHash('sha256').update(file).digest('hex'),'203cd8045793f74e38db5ce8c4561e239bdbe5cdb0db5147794c1e48e7b526db');
 assert.equal(raw.length,96);assert.equal(set.CARDS.length,96);
 const expected=new Set([...Array.from({length:95},(_,i)=>String(i+1)),'TWO']);
 assert.deepEqual(new Set(raw.map(row=>String(row[0]))),expected);
 assert.equal(new Set(set.CARDS.map(c=>c.id)).size,96);
 assert.equal(set.cardById(id('TWO')).name,'Alph Lithograph');
});
test('every HGSS2 printed attack, printed ability, stage and rarity is preserved',()=>{
 let enabled=0;
 for(const row of raw){
  const [num,name,supertype,subtypes,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity]=row;
  const c=set.cardById(id(num));assert.ok(c,id(num));
  assert.equal(c.name,name);assert.equal(c.kind,supertype==='Pokémon'?'pokemon':'trainer');assert.equal(c.rarity,rarity);
  assert.equal(c.setId,'hgss2');assert.equal(c.number,num);
  assert.deepEqual((c.attacks||[]).map(a=>[a.name,a.text,a.cost,a.damageText]),attacks.map(a=>[a[0],a[3]||'',a[1].map(t=>symbols[t]).join(''),a[2]||null]));
  assert.deepEqual((c.abilities||[]).map(p=>[p.name,p.text,p.printedPowerType]),abilities.map(p=>[p[0],p[2],p[1]==='Poké-Power'?'power':'body']));
  if(c.kind==='pokemon'){
   assert.equal(c.hp,Number(hp));assert.deepEqual(c.types,types);assert.equal(c.stage,subtypes[0]);assert.equal(c.evolvesFrom,evolves||null);
   assert.deepEqual(c.weaknesses,weak);assert.deepEqual(c.resistances,res);assert.equal(c.retreat,retreat);
  }
  if(c.battleEnabled){enabled++;assert.equal(c.deckEligible,true);assert.equal(c.support.status,'FULL');
   for(const a of [...(c.attacks||[]),...(c.abilities||[]),...(c.kind==='trainer'?[c]:[])]){
    assert.deepEqual(fx.validateEffect(a.effect),[],`${c.id}/${a.name}`);
    if(c.kind==='pokemon'&&a.text?.trim()&&a.effect.type==='noop')assert.fail(`${c.id} ${a.name} must not be an unmapped no-op`);
   }
  }else{assert.equal(c.deckEligible,false);assert.ok(c.support.reasons.length,`${c.id} should list its gating reason`);}
 }
 assert.ok(enabled>=66,'Stage 1 must retain its verified 66 battle-enabled prints');
 assert.equal(set.coverage().gated.length,96-enabled);
 assert.equal(set.coverage().battleEnabled,enabled);
});
test('HGSS2 is selectable, cards resolve by owned collector ID, and version is consistent',()=>{
 assert.ok(db.SETS.some(x=>x.id==='hgss2'));assert.ok(cpu.SETS.includes('hgss2'));assert.ok(builder.SET_IDS.includes('hgss2'));
 assert.ok(fs.readFileSync(path.join(assets,'tcg-classic-set-picker.js'),'utf8').includes("['hgss2','Unleashed'"));
 assert.ok(fs.readFileSync(path.join(assets,'index.html'),'utf8').includes('tcg-classic-unleashed.js'));
 const owned=db.projectOwnedCards([{source:'tcg',setId:'hgss2',number:'1',quantity:2},{source:'tcg',setId:'hgss2',number:'TWO',quantity:1},{source:'tcg',setId:'hgss2',number:'92',quantity:3}]);
 for(const [n,q] of [['1',2],['TWO',1],['92',3]])assert.ok(owned.some(x=>x.gameplayId===id(n)&&x.quantity===q),JSON.stringify(owned));
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 const match=gradle.match(/versionName '([^']+)'/);assert.ok(match,'Gradle must declare versionName');const version=match[1];
 assert.ok(fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8').includes("__LUCKYDEX_BUILD='"+version+"'"));assert.ok(fs.readFileSync(path.join(assets,'index.html'),'utf8').includes('v'+version));
});
test('the three unique LEGEND pairs are one two-Prize Pokémon, never solitary Basic Pokémon',()=>{
 for(const [first,second] of legendPairs){
  const a=set.cardById(id(first)),b=set.cardById(id(second));assert.ok(a.legendHalf&&b.legendHalf);
  assert.equal(a.legendPair,b.legendPair);assert.equal(a.stage,'LEGEND');assert.equal(b.stage,'LEGEND');
  assert.equal(a.prizeCards,2);assert.equal(b.prizeCards,2);
  assert.equal(a.battleEnabled,b.battleEnabled);
 }
 const s=scene(),p=s.sides.player;p.bench=[];p.hand=[cref(id('92'),'first')];
 assert.equal(core.legalActions(s,'player').filter(x=>x.type==='legendBench').length,0);
 p.hand.push(cref(id('93'),'second'));
 const act=core.legalActions(s,'player').find(x=>x.type==='legendBench'&&x.cardId===id('92'));assert.ok(act,'matched Raikou/Suicune pair must be playable');
 core.applyAction(s,'player',act);
 assert.equal(p.bench.length,1);assert.deepEqual(p.bench[0].stack,[id('92'),id('93')]);assert.equal(p.hand.length,0);
});
test('LEGEND knockout loses both printed physical halves and awards two Prizes',()=>{
 const s=scene(),p=s.sides.player,foe=s.sides.opponent;
 const pair=pokemon(id('92'),'raikou-suicune');pair.stack=[id('92'),id('93')];pair.damage=160;p.active=pair;p.bench=[pokemon(id('65'),'backup')];
 s.activeSide='opponent';const prizes=foe.prizes.length;
 core.endTurn(s);
 assert.equal(foe.prizes.length,prizes-2);assert.equal(foe.prizesTaken,2);
 assert.deepEqual(p.discard.filter(x=>[id('92'),id('93')].includes(x.cardId)).map(x=>x.cardId).sort(),[id('92'),id('93')]);
});
test('PlusPower is temporary; printed HGSS2 Rare Candy supports Stage 1 and Stage 2',()=>{
 assert.equal(set.cardById(id('80')).trainerType,'AttachedTrainer');assert.equal(set.cardById(id('80')).expires,'endOwnTurn');
 assert.equal(set.cardById(id('82')).battleEnabled,true);
 assert.equal(set.cardById(id('82')).effect.allowStage1,true);
});
test('multiplication and damage-counter attacks have correct base-damage metadata',()=>{
 for(const [number,name] of [['2','Hard Crush'],['7','Big Chorus'],['9','Push Over'],['11','Psywave'],['12','Twineedle'],['14','Hurricane Wing'],['15','Repeating Drill'],['23','Power Blow'],['24','Steel Swing'],['41','Crimson Bull']]){
  const a=set.cardById(id(number)).attacks.find(x=>x.name===name);assert.ok(a);assert.equal(a.damage,0,id(number)+' '+name);
 }
 const rage=set.cardById(id('38')).attacks.find(x=>x.name==='Rage');assert.equal(rage.damage,20,'Rage is 20 base plus ten per damage counter');
 const karate=set.cardById(id('53')).attacks.find(x=>x.name==='Karate Chop');assert.equal(karate.damage,40);
});
test('HGSS2-only CPU decks are 30 cards, legal, set-bound, have evolutionary chains and matched LEGEND halves',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(const seed of [1,2,7,11,19]){
  const r=cpu.generate({sets:['hgss2'],type,seed});assert.ok(r.ok,`${type}/${seed}: ${r.error}`);
  assert.equal(r.cards.length,30);assert.ok(db.validateDeck(r.cards).ok,`${type}/${seed}`);
  const cards=r.cards.map(x=>db.cardById(x)),names=new Set(cards.map(c=>c.name));
  for(const c of cards){assert.equal(c.setId,'hgss2');assert.ok(c.deckEligible,c.id);
   if(c.stage==='Stage 1')assert.ok(names.has(c.evolvesFrom),`${type}/${seed}: orphan ${c.name}`);
   if(c.stage==='Stage 2')assert.ok(names.has(c.evolvesFrom),`${type}/${seed}: orphan stage 2 ${c.name}`);
  }
  for(const [a,b] of legendPairs){const count=n=>r.cards.filter(idv=>idv===id(n)).length;assert.equal(count(a),count(b),`${type}/${seed}: unmatched ${a}/${b}`);}
 }
});
test('Pupitar Rage hits for printed 20 plus 10 for each damage counter in real battle',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=pokemon(id('38'),'rage');p.active.energy={Fighting:2};p.active.damage=30;
 o.active=pokemon(id('9'),'neutral-fighting');
 const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(a);
 core.applyAction(s,'player',a);
 assert.equal(o.active.damage,50,'Rage with three damage counters must hit for 50 before weakness');
});
