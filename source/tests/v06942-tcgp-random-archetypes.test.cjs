const test=require('node:test');
const assert=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const K=require('../app/src/main/assets/tcgp-battle-decks.js');

const row=id=>({gameplayId:id,quantity:2,battleEnabled:true,variants:[{id,quantity:2,rarity:'One Diamond'}]});
const trainerRows=()=>D.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&c.kind==='trainer').map(c=>row(c.id));
const names=r=>r.cards.map(id=>D.cardById(id)?.name||id);

test('random Water rotates the primary archetype instead of repeatedly choosing the strongest core',()=>{
  const wantedNames=new Set(['Tapu Fini','Wailmer','Wailord','Popplio','Brionne','Primarina','Squirtle','Wartortle','Blastoise','Carvanha','Mega Sharpedo ex','Lapras','Wingull','Pelipper']);
  const pokemonRows=D.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&c.kind==='pokemon'&&wantedNames.has(c.name)).map(c=>row(c.id));
  const rows=[...trainerRows(),...pokemonRows];
  const builds=Array.from({length:7},(_,variant)=>K.buildQuickDeck(rows,{types:['Water'],style:'random',variant}));
  for(const r of builds){assert.equal(r.ok,true,r.errors?.join(' '));assert.equal(K.validateDeck(r.cards,rows,r.energyTypes).ok,true);}
  const archetypes=builds.map(r=>r.archetypeKey);
  assert.equal(new Set(archetypes).size,7,`first seven random builds should use seven different primary families, got ${archetypes.join(', ')}`);
  const focusNames=new Set(builds.map(r=>D.cardById(r.focusCardId)?.name));
  for(const expected of ['Tapu Fini','Wailord','Primarina','Blastoise','Mega Sharpedo ex'])assert.equal(focusNames.has(expected),true,`expected ${expected} to be available as a random primary core`);
});

test('random Stage 2 primary uses Stage 2 support and rejects Basic-only support even with a Basic secondary',()=>{
  const ids=['A1-053','A1-054','A1-055','A3-056','A3-144','B2-154','P-A-007','P-A-002','P-A-001','A1-223','A2-154','A2b-071','B3b-064','A3-143','A2a-073'];
  const rows=ids.filter(id=>D.cardById(id)?.battleEnabled).map(row);
  const r=K.buildQuickDeck(rows,{types:['Water'],style:'random',cardId:'A1-055',variant:0});
  assert.equal(r.ok,true,r.errors?.join(' '));
  const deck=names(r);
  assert.equal(deck.filter(n=>n==='Rare Candy').length,2,'Stage 2 primary should reserve two Rare Candy when owned');
  assert.equal(deck.includes('Starting Plains'),false,'Basic-only Stadium should not be selected for a Stage 2 primary plan');
});

test('random Basic primary does not drag in a Stage 2 package and Rare Candy as filler',()=>{
  const ids=['A3-056','A1-053','A1-054','A1-055','A3-144','B2-154','P-A-007','P-A-002','P-A-001','A1-223','A2-154','A2b-071','B3b-064','A3-143','A2a-073'];
  const rows=ids.filter(id=>D.cardById(id)?.battleEnabled).map(row);
  const r=K.buildQuickDeck(rows,{types:['Water'],style:'random',cardId:'A3-056',variant:0});
  assert.equal(r.ok,true,r.errors?.join(' '));
  const deck=names(r);
  assert.equal(deck.includes('Rare Candy'),false,'Basic-primary random deck should not spend slots on Rare Candy');
  assert.equal(deck.includes('Blastoise'),false,'Stage 2 family should not overtake a Basic primary as the secondary package');
});
