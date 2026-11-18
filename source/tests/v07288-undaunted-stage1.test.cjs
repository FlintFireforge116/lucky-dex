'use strict';
/* Undaunted v0.69.288: authenticated print identities and stage-one actual gameplay. */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const rawBuffer=fs.readFileSync(path.join(root,'data/classic/hgss3-print-compact.json'));
const raw=JSON.parse(rawBuffer.toString('utf8'));
const hg=require(path.join(assets,'tcg-classic-undaunted.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const id=n=>'hgss3-'+n,ref=(id,uid)=>({cardId:id,uid:uid||id});
const symbols={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'};
const slot=(n,uid)=>core.makePokemonSlot(id(n),3,uid||n);
function scene(){
 const r=cpu.generate({sets:['hgss3'],type:'Grass',seed:7});assert.ok(r.ok,r.error);
 const s=core.createBattle({format:'classic',seed:2037,firstSide:'player',playerDeck:r.cards,opponentDeck:r.cards,
  playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water']});
 s.phase='battle';s.turnNumber=5;s.activeSide='player';s.sides.player.turnCount=3;s.sides.opponent.turnCount=2;
 const p=s.sides.player,o=s.sides.opponent;p.active=slot('47','eevee');o.active=slot('64','rattata');
 p.bench=[];o.bench=[];p.hand=[];o.hand=[];p.discard=[];o.discard=[];p.energyDiscard={};o.energyDiscard={};
 return s;
}
function resolve(s,e,{source=s.sides.player.active,action={},resolvingChoice=false,isAttack=false,random=()=>0.1}={}){
 const offers=[];const p=s.sides.player,o=s.sides.opponent;
 fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:source,defender:o.active,cardById:db.cardById,
  action,isAttack,resolvingChoice,random,requestChoice:spec=>offers.push(spec),shuffle:(_s,deck)=>deck.reverse(),
  drawCard:b=>{if(b.deck.length&&b.hand.length<8)b.hand.push(b.deck.shift());},
  effectiveEnergy:x=>x.energy,onEnergyAttached:()=>{},maxHp:(_side,x)=>db.cardById(x.cardId)?.hp||100});
 return offers[0]||null;
}
const attack=(n,name)=>hg.cardById(id(n)).attacks.find(a=>a.name===name).effect;
const ability=(n,name)=>hg.cardById(id(n)).abilities.find(a=>a.name===name).effect;
test('exact 91 original Undaunted prints including collector THREE are hash-pinned',()=>{
 assert.equal(crypto.createHash('sha256').update(rawBuffer).digest('hex'),'b49019c44bfd57ce69f39326005228ff39bb5acaa46f0b9fb863da7f525dfe7b');
 assert.equal(raw.length,91);assert.equal(hg.CARDS.length,91);
 assert.deepEqual(new Set(raw.map(r=>String(r[0]))),new Set([...Array.from({length:90},(_,i)=>String(i+1)),'THREE']));
 assert.equal(hg.cardById(id('THREE')).name,'Alph Lithograph');
});
test('91 prints retain exact identity, stat lines, attack text and ability classification',()=>{
 let enabled=0;
 for(const row of raw){
  const [num,name,supertype,subtypes,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity]=row,c=hg.cardById(id(num));
  assert.ok(c,id(num));assert.equal(c.number,num);assert.equal(c.name,name);assert.equal(c.rarity,rarity);
  assert.equal(c.kind,supertype==='Pokémon'?'pokemon':supertype==='Trainer'?'trainer':'energy');
  assert.deepEqual((c.attacks||[]).map(a=>[a.name,a.text,a.cost,a.damageText]),attacks.map(a=>[a[0],a[3]||'',a[1].map(t=>symbols[t]).join(''),a[2]||null]));
  assert.deepEqual((c.abilities||[]).map(a=>[a.name,a.text,a.printedPowerType]),abilities.map(a=>[a[0],a[2],a[1]==='Poké-Power'?'power':'body']));
  if(c.kind==='pokemon'){assert.equal(c.hp,Number(hp));assert.equal(c.stage,subtypes[0]);assert.deepEqual(c.types,types);
   assert.equal(c.evolvesFrom,evolves||null);assert.equal(c.retreat,retreat);assert.deepEqual(c.weaknesses,weak);assert.deepEqual(c.resistances,res);}
  if(c.battleEnabled){enabled++;assert.equal(c.support.status,'FULL');assert.equal(c.deckEligible,true);
   for(const action of [...(c.attacks||[]),...(c.abilities||[]),...(c.kind==='trainer'?[c]:[])]){
    assert.deepEqual(fx.validateEffect(action.effect),[],c.id+' '+action.name);
    if(action.text?.trim())assert.notEqual(action.effect.type,'noop',c.id+' '+action.name);
   }
  }else{assert.equal(c.deckEligible,false);assert.ok(c.support.reasons.length,c.id);}
 }
 assert.ok(enabled>=50,`Stage 1 should include at least 50 verified prints, got ${enabled}`);
 assert.equal(hg.coverage().battleEnabled,enabled);assert.equal(hg.coverage().gated.length,91-enabled);
});
test('Undaunted is reachable in player set picker, deck builder, CPU, collection and APK',()=>{
 assert.ok(db.SETS.some(s=>s.id==='hgss3'));assert.ok(cpu.SETS.includes('hgss3'));assert.ok(builder.SET_IDS.includes('hgss3'));
 assert.ok(fs.readFileSync(path.join(assets,'tcg-classic-set-picker.js'),'utf8').includes("['hgss3','Undaunted'"));
 assert.ok(fs.readFileSync(path.join(assets,'index.html'),'utf8').includes('tcg-classic-undaunted.js'));
 const owned=db.projectOwnedCards([{source:'tcg',setId:'hgss3',number:'14',quantity:3},{source:'tcg',setId:'hgss3',number:'THREE',quantity:2}]);
 assert.ok(owned.some(x=>x.gameplayId===id('14')&&x.quantity===3),JSON.stringify(owned));
 assert.ok(owned.some(x=>x.gameplayId===id('THREE')&&x.quantity===2),JSON.stringify(owned));
 const g=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8').match(/versionName '([^']+)'/);assert.ok(g);
 const v=g[1];assert.ok(fs.readFileSync(path.join(assets,'index.html'),'utf8').includes('v'+v));
 assert.ok(fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8').includes("__LUCKYDEX_BUILD='"+v+"'"));
 assert.ok(fs.readFileSync(path.join(root,'app/build.gradle'),'utf8').includes("v07288-undaunted-stage1.test.cjs"));
});
test('LEGEND pairs remain symmetric: both halves are enabled together after completion',()=>{
 for(const [a,b] of [['87','88'],['89','90']]){
  const x=hg.cardById(id(a)),y=hg.cardById(id(b));
  assert.equal(x.stage,'LEGEND');assert.equal(y.stage,'LEGEND');assert.equal(x.prizeCards,2);assert.equal(y.prizeCards,2);
  assert.equal(x.legendPair,y.legendPair);assert.equal(x.battleEnabled,y.battleEnabled);
  assert.equal(x.deckEligible,y.deckEligible);assert.ok(x.deckEligible,'Both halves should now be playable');assert.ok(y.deckEligible);
 }
});
test('multiplier damage starts at zero, not duplicated base damage',()=>{
 for(const [num,name] of [['3','Everyone Explode Now'],['17','Miasma Wind'],['19','Poltergeist'],['68','Beat Up']]){
  const a=hg.cardById(id(num)).attacks.find(a=>a.name===name);assert.ok(a);assert.equal(a.damage,0,id(num)+' '+name);
 }
});
test('Steel Coat searches actual Metal Energy from deck, attaches to chosen Pokémon, then shuffles',()=>{
 const s=scene(),p=s.sides.player;p.bench=[slot('7','scizor')];p.bench[0].benchSlot=0;p.deck=[ref('hgss1-122','metal-basic'),ref(id('47'),'eevee')];
 let c=resolve(s,attack('21','Steel Coat'));
 assert.equal(c.kind,'pokemon');assert.equal(c.selectionSide,'player');
 c=resolve(s,c.effect,{resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:p.bench[0].benchSlot}});
 assert.equal(c.kind,'option');assert.match(c.options[0],/Metal/);
 resolve(s,c.effect,{resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.bench[0].energy.Metal,1);assert.equal(p.deck.length,1);
});
test('Fresh-Picked Fruit heals 60 ONLY from the chosen Bench Pokémon',()=>{
 const s=scene(),p=s.sides.player;p.active.damage=40;p.bench=[slot('7','benched')];p.bench[0].benchSlot=0;p.bench[0].damage=75;
 const c=resolve(s,attack('22','Fresh-Picked Fruit'));assert.equal(c.kind,'pokemon');assert.equal(c.includeActive,false);
 resolve(s,c.effect,{resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:p.bench[0].benchSlot}});
 assert.equal(p.bench[0].damage,15);assert.equal(p.active.damage,40);
});
test('Raichu Prime Voltage Increase selects a real Lightning attachment without using hand',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('83','prime');p.bench=[slot('61','pikachu')];p.bench[0].benchSlot=0;p.bench[0].energy.Lightning=2;
 let c=resolve(s,ability('83','Voltage Increase'),{source:p.active});assert.equal(c.kind,'pokemon');
 c=resolve(s,c.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:p.bench[0].benchSlot}});assert.equal(c.kind,'option');
 resolve(s,c.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.active.energy.Lightning,1);assert.equal(p.bench[0].energy.Lightning,1);
});
test('Evoblast adds one bonus for each of our Eevee evolution Pokémon in play',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('86','umbreon');p.bench=[slot('26','flareon'),slot('17','leafeon')];
 o.active=slot('52','hitmonlee');const before=o.active.damage;resolve(s,attack('86','Evoblast'),{source:p.active,isAttack:true});
 assert.equal(o.active.damage-before,30);
});
test('Undaunted-only CPU creates legal 30-card decks, without gated effects or orphan evolutions',()=>{
 let valid=0;
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(const seed of [1,2,5,9,17]){
  const g=cpu.generate({sets:['hgss3'],type,seed});if(!g.ok)continue;
  valid++;assert.equal(g.cards.length,30);assert.ok(db.validateDeck(g.cards).ok,`${type}/${seed}`);
  const cards=g.cards.map(c=>db.cardById(c));const names=new Set(cards.map(c=>c.name));
  for(const c of cards){assert.ok(c.deckEligible,`${type}/${seed} ${c.id}`);assert.equal(c.setId,'hgss3');
   if(['Stage 1','Stage 2'].includes(c.stage))assert.ok(names.has(c.evolvesFrom),`${type}/${seed} orphan ${c.name}`);
  }
 }
 assert.ok(valid>=20,`Expected >=20 valid HGSS3-only CPU archetypes, saw ${valid}`);
});
test('an independent Undaunted auditor sees zero definite schema or runtime errors',()=>{
 const audit=require(path.join(root,'scripts/audit-classic-set.cjs'));
 const report=audit.auditSet('hgss3',{data:db,fx,opponents:cpu,core,testIndex:[],engineText:fs.readFileSync(path.join(assets,'tcgp-battle-effects.js'),'utf8')+'\n'+fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8'),setDefs:{hgss3:hg.SET},cpu:false,smoke:true});
 assert.equal(report.summary.errors,0);assert.equal(report.summary.warnings,0);
 assert.equal(report.smoke.failures.length,0);
});
test('Everyone Explode Now counts Pineco/Forretress once and self-spreads 30 to each',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('3','forretress');p.bench=[slot('62','pineco')];
 resolve(s,attack('3','Everyone Explode Now'),{source:p.active,isAttack:true});
 assert.equal(o.active.damage,60);assert.equal(p.active.damage,30);assert.equal(p.bench[0].damage,30);
});
test('Miasma Wind multiplies printed 50 by defender special-condition count',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('17','leafeon');o.active.conditions={poison:true,sleep:true};
 resolve(s,attack('17','Miasma Wind'),{source:p.active,isAttack:true});assert.equal(o.active.damage,100);
});
test('Poltergeist counts trainer/supporter/stadium physical cards in opponent hand',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('19','mismagius');
 o.hand=[ref(id('73'),'item'),ref(id('77'),'supporter'),ref(id('47'),'eevee')];
 resolve(s,attack('19','Poltergeist'),{source:p.active,isAttack:true});assert.equal(o.active.damage,60);
});
test('Sneasel Beat Up flips once for each friendly Pokémon in play',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('68','sneasel');p.bench=[slot('47','eevee')];
 resolve(s,attack('68','Beat Up'),{source:p.active,isAttack:true,random:()=>0.1});
 assert.equal(o.active.damage,40);assert.equal(s.log.filter(x=>x.reason==='Beat Up').length,2);
});
test('Hariyama optional Backward Belt Throw applies pre-weakness bonus and recoil',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('14','hariyama');
 let c=resolve(s,attack('14','Backward Belt Throw'),{source:p.active,isAttack:true});assert.equal(c.kind,'option');
 resolve(s,c.effect,{source:p.active,isAttack:true,resolvingChoice:true,action:{choiceOption:1}});
 assert.equal(o.active.damage,40,'20 bonus doubled by Fighting Weakness, as printed');assert.equal(p.active.damage,20);
});
