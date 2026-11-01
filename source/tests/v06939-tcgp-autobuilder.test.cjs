const t=require('node:test'),a=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const K=require('../app/src/main/assets/tcgp-battle-decks.js');

const allOwned=(rarity='One Diamond')=>D.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,quantity:2,battleEnabled:true,variants:[{id:c.id,quantity:2,rarity}]}));
const pokemonCount=r=>r.cards.map(D.cardById).filter(c=>c?.kind==='pokemon').length;
function rootName(card){let c=card,guard=0;while(c?.kind==='pokemon'&&c.stage!=='Basic'&&c.evolvesFrom&&guard++<4){const prior=D.CARDS.find(x=>x.battleEnabled&&x.kind==='pokemon'&&x.name===c.evolvesFrom);if(!prior)break;c=prior;}return D.normalizeName(c?.name||card?.name||'');}

t('competitive autobuilder uses a tournament-like pokemon/trainer split',()=>{
 for(const type of ['Fire','Water','Lightning','Psychic','Fighting','Grass']){
  const r=K.buildQuickDeck(allOwned(),{types:[type],style:'competitive'});a.equal(r.ok,true,`${type}: ${r.errors}`);
  const n=pokemonCount(r);a.ok(n>=6&&n<=9,`${type} should use 6-9 Pokémon, got ${n}`);
  a.ok(20-n>=11,`${type} should use at least 11 Trainers`);
 }
});

t('competitive autobuilder bounds unrelated pokemon families',()=>{
 const r=K.buildQuickDeck(allOwned(),{types:['Lightning'],style:'competitive'});a.equal(r.ok,true);
 const roots=new Set(r.cards.map(D.cardById).filter(c=>c?.kind==='pokemon').map(rootName));
 a.ok(roots.size<=2,`expected <=2 Pokémon families, got ${[...roots].join(', ')}`);
});

t('dual-type autobuild configures both selected Energy types and remains legal',()=>{
 const rows=allOwned(),r=K.buildQuickDeck(rows,{types:['Fire','Water'],style:'competitive'});a.equal(r.ok,true,JSON.stringify(r.errors));
 a.deepEqual(new Set(r.energyTypes),new Set(['Fire','Water']));
 a.equal(K.validateDeck(r.cards,rows,r.energyTypes).ok,true);
 const required=new Set();for(const c of r.cards.map(D.cardById).filter(c=>c?.kind==='pokemon'))for(const attack of c.attacks||[])for(const s of attack.cost||''){if(K.ENERGY_TYPES.includes(({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'})[s]))required.add(({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'})[s]);}
 a.ok(required.has('Fire')&&required.has('Water'),'build should contain Pokémon that make both selected types meaningful');
});

t('rarity cap counts only eligible owned print copies',()=>{
 const rows=allOwned('One Diamond');
 const crownId='B1-102',row=rows.find(r=>r.gameplayId===crownId);if(row){row.variants=[{id:crownId,quantity:2,rarity:'Crown Rare'}];row.quantity=2;}
 const r=K.buildQuickDeck(rows,{types:['Psychic'],style:'competitive',maxRarityRank:4});a.equal(r.ok,true,JSON.stringify(r.errors));
 a.ok(!r.cards.includes(crownId),'Crown-only card must be excluded by Four Diamond cap');
});

t('random viable autobuild varies candidates without abandoning legality',()=>{
 const rows=allOwned();
 const builds=[0,1,2,3].map(variant=>K.buildQuickDeck(rows,{style:'random',variant}));
 for(const r of builds){a.equal(r.ok,true,JSON.stringify(r.errors));a.equal(K.validateDeck(r.cards,rows,r.energyTypes).ok,true);a.ok(pokemonCount(r)<=10);}
 a.ok(new Set(builds.map(r=>r.cards.slice().sort().join('|'))).size>=2,'random mode should produce more than one legal deck');
});

t('competitive scoring discounts all-or-nothing coin attacks when a stronger reliable engine is owned',()=>{
 const ids=new Set(['A1-072','A1-073','A4a-020']);
 const rows=D.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&(c.kind==='trainer'||ids.has(c.id))).map(c=>({gameplayId:c.id,quantity:2,battleEnabled:true,variants:[{id:c.id,quantity:2,rarity:'One Diamond'}]}));
 const r=K.buildQuickDeck(rows,{types:['Water'],style:'competitive'});a.equal(r.ok,true,JSON.stringify(r.errors));
 a.match(r.strategy,/Suicune ex core/,'80-or-0 Seaking should not outrank Suicune ex as the primary competitive core');
});
