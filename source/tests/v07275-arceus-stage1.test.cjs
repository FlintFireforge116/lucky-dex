'use strict';
/* Platinum—Arceus requires the immutable print archive and generator.
 * The no-op bootstrap must never be considered shippable.
 */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const src=JSON.parse(fs.readFileSync(path.join(root,'data/classic/pl4-print-source.json'),'utf8'));
const pl4=require(path.join(assets,'tcg-classic-arceus.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const numbers=new Set(Array.from({length:99},(_,i)=>String(i+1)).concat(Array.from({length:9},(_,i)=>'AR'+(i+1)),['SH10','SH11','SH12']));
const letters={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'};

test('all 111 authenticated English collector prints exist with full printed stats/attacks and legal gating',()=>{
 assert.equal(src.length,111);assert.equal(pl4.CARDS.length,111,'prepare-arceus.sh must generate catalogue before build');
 assert.deepEqual(new Set(src.map(c=>String(c.number))),numbers);
 assert.equal(new Set(pl4.CARDS.map(c=>c.id)).size,111);
 let active=0,gated=0;
 for(const item of src){
  const card=pl4.cardById('pl4-'+item.number);assert.ok(card,'missing pl4-'+item.number);
  assert.equal(card.name,item.name);assert.equal(card.kind,item.supertype==='Pokémon'?'pokemon':'trainer');
  assert.equal(card.setId,'pl4');
  assert.deepEqual((card.attacks||[]).map(a=>[a.name,a.text,a.cost,a.damageText]),(item.attacks||[]).map(a=>[a.name,a.text||'',(a.cost||[]).map(t=>letters[t]).join(''),a.damage||null]));
  assert.deepEqual((card.abilities||[]).map(p=>[p.name,p.text,p.printedPowerType]),(item.abilities||[]).map(p=>[p.name,p.text||'',p.type==='Poké-Power'?'power':'body']));
  if(card.kind==='pokemon'){
   assert.equal(card.hp,Number(item.hp));assert.equal(card.stage,item.subtypes[0]);assert.deepEqual(card.types,item.types);
   assert.equal(card.evolvesFrom,item.evolvesFrom||(item.subtypes[0]==='Level-Up'?item.name.replace(/ LV\.X$/,''):null));
   assert.equal(card.retreat,Number(item.convertedRetreatCost||0));
  }
  if(card.battleEnabled){active++;assert.equal(card.deckEligible,true,card.id);assert.equal(card.support.status,'FULL',card.id);for(const a of [...(card.attacks||[]),...(card.abilities||[]),...(card.kind==='trainer'?[card]:[])])assert.deepEqual(fx.validateEffect(a.effect),[],card.id+':'+a.name);}
  else{gated++;assert.equal(card.deckEligible,false,card.id);assert.ok(card.support.reasons?.length,card.id+' must explain its gate');}
 }
 assert.ok(active>=10,'more than 10 fully verified prints must enter matches');
 assert.equal(pl4.coverage().total,111);
 assert.equal(pl4.coverage().battleEnabled,active);
 assert.equal(pl4.coverage().gated.length,gated);
});

test('Arceus set appears everywhere and raw collector IDs including AR/SH resolve through ownership',()=>{
 assert.ok(db.SETS.some(s=>s.id==='pl4'));
 assert.ok(cpu.SETS.includes('pl4'));assert.ok(builder.SET_IDS.includes('pl4'));
 assert.ok(fs.readFileSync(path.join(assets,'tcg-classic-set-picker.js'),'utf8').includes("['pl4','Arceus','Platinum']"));
 for(const id of ['pl4-1','pl4-99','pl4-AR1','pl4-AR9','pl4-SH10','pl4-SH12'])assert.ok(db.cardById(id));
 const owned=db.projectOwnedCards([{source:'tcg',setId:'pl4',number:'AR7',quantity:3},{source:'tcg',setId:'pl4',number:'SH10',quantity:1},{source:'tcg',setId:'pl4',number:'1',quantity:2}]);
 for(const [id,n] of [['pl4-AR7',3],['pl4-SH10',1],['pl4-1',2]])assert.ok(owned.some(c=>c.gameplayId===id&&c.quantity===n),'ownership '+id+': '+JSON.stringify(owned));
});

test('Arceus unlimited copy rule is card-specific and normal 4-of remains enforced',()=>{
 const arceus='pl4-AR7';assert.ok(db.cardById(arceus).battleEnabled);
 const legal=db.validateDeck(Array(30).fill(arceus));assert.ok(legal.ok,JSON.stringify(legal.errors));
 const regular=db.validateDeck(Array(30).fill('pl4-79'));assert.ok(regular.errors.some(e=>e.includes('four-copy limit')));
});

test('gated Fossils and unsupported 6-Arceus Bench effects never enter a CPU deck',()=>{
 for(const id of ['pl4-89','pl4-92','pl4-93','pl4-AR5']){
  assert.equal(db.cardById(id).battleEnabled,false,id);
  assert.equal(db.cardById(id).deckEligible,false,id);
 }
 const dead=pl4.CARDS.filter(c=>c.deckEligible===false).map(c=>c.id);
 assert.ok(dead.length>0);
 for(const type of ['Grass','Water','Lightning','Psychic','Fighting','Colorless']){
  const gen=cpu.generate({sets:['pl4'],type,seed:123});if(!gen.ok)continue;
  assert.equal(gen.cards.length,30);
  assert.ok(db.validateDeck(gen.cards).ok,`${type}: ${JSON.stringify(db.validateDeck(gen.cards).errors)}`);
  for(const id of gen.cards)assert.ok(!dead.includes(id),'CPU chose gated '+id);
 }
});
