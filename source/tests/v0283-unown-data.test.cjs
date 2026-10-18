const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const species=require(path.join(root,'app/src/main/assets/adventure/adventure-species.js')).byId;
let data;
try{data=require(path.join(root,'app/src/main/assets/arcade-unown-data.js'));}catch(err){
  console.error('Expected RED: arcade-unown-data.js is not implemented yet');
  throw err;
}

const pokemon=data.buildPokemonEntries(species);
assert.equal(pokemon.length,1025);
assert.equal(pokemon[0].key,'pokemon:1');
assert.equal(pokemon[0].answer,'Bulbasaur');
assert.equal(pokemon.at(-1).key,'pokemon:1025');
assert.equal(pokemon.at(-1).answer,'Pecharunt');
assert.match(pokemon.find(x=>x.key==='pokemon:6').clue,/FIRE\s*\/\s*FLYING Pokémon/i);

assert.ok(data.CURATED_ENTRIES.length>=120,`expected >=120 curated entries, got ${data.CURATED_ENTRIES.length}`);
for(const category of ['REGION','TYPE','ITEM','MOVE','LOCATION','BATTLE','TRAINING']){
  assert.ok(data.CURATED_ENTRIES.some(x=>x.category===category),`missing ${category}`);
}
assert.equal(new Set(data.CURATED_ENTRIES.map(x=>x.key)).size,data.CURATED_ENTRIES.length,'curated keys must be stable/unique');

assert.deepEqual(data.glyphWords('HO-OH'),['HOOH']);
assert.deepEqual(data.glyphWords('MR. MIME'),['MR','MIME']);
assert.deepEqual(data.glyphWords("FARFETCH'D"),['FARFETCHD']);
assert.deepEqual(data.glyphWords('Farfetch’d'),['FARFETCHD']);
assert.deepEqual(data.glyphWords('Flabébé'),['FLABEBE']);
assert.deepEqual(data.glyphWords('Type: Null'),['TYPE','NULL']);
assert.deepEqual(data.glyphWords('Nidoran♀'),['NIDORAN']);
assert.deepEqual(data.glyphWords('Nidoran♂'),['NIDORAN']);

assert.equal(data.normaliseAnswer('Mr. Mime'),data.normaliseAnswer('mr-mime'));
assert.equal(data.normaliseAnswer('Flabébé'),data.normaliseAnswer('flabebe'));
assert.equal(data.normaliseAnswer("Farfetch'd"),data.normaliseAnswer('farfetch’d'));
assert.equal(data.normaliseAnswer('Type: Null'),data.normaliseAnswer('TYPE NULL'));

const short={answer:'Mew',category:'POKÉMON',key:'short',common:true};
const long={answer:'Iron Valiant',category:'POKÉMON',key:'long'};
assert.ok(data.weightFor(short,'easy',0)>data.weightFor(long,'easy',0));
assert.ok(data.weightFor(short,'normal',0)>data.weightFor(long,'normal',0));
const earlyGap=data.weightFor(short,'easy',0)/data.weightFor(long,'easy',0);
const lateGap=data.weightFor(short,'easy',10)/data.weightFor(long,'easy',10);
assert.ok(lateGap<earlyGap,'Easy length weighting should flatten as streak rises');
assert.equal(data.weightFor(short,'hard',0),data.weightFor(long,'hard',12));

const collisionPool=[
  {key:'pokemon:29',answer:'Nidoran♀',category:'POKÉMON'},
  {key:'pokemon:32',answer:'Nidoran♂',category:'POKÉMON'},
  {key:'pokemon:25',answer:'Pikachu',category:'POKÉMON'},
  {key:'pokemon:26',answer:'Raichu',category:'POKÉMON'},
  {key:'pokemon:35',answer:'Clefairy',category:'POKÉMON'},
];
const choices=data.buildChoices(collisionPool[0],collisionPool,4,()=>0.2);
assert.equal(choices.length,4);
assert.ok(choices.includes(collisionPool[0]));
assert.equal(new Set(choices.map(x=>data.normaliseAnswer(x.answer))).size,choices.length,'choices must not contain normalised collisions');

const usedKeys=new Set(['pokemon:29']);
const usedNormalised=new Set([data.normaliseAnswer('Nidoran♀')]);
const picked=data.pickEntry(collisionPool,{mode:'hard',streak:0,usedKeys,usedNormalised,rng:()=>0});
assert.ok(picked);
assert.notEqual(picked.key,'pokemon:32','avoid indistinguishable collision where alternatives exist');

const scoreEasy=data.scoreFor({answer:'Pikachu'},{mode:'easy',streak:0,remainingFraction:.5});
const scoreHard=data.scoreFor({answer:'Pikachu'},{mode:'hard',streak:0,remainingFraction:.5});
assert.ok(scoreHard.points>scoreEasy.points);
assert.ok(scoreHard.coins>scoreEasy.coins);
assert.ok(scoreEasy.coins>=30);

assert.deepEqual(data.MODE_CONFIG.easy,{durationMs:15000,multiplier:1});
assert.deepEqual(data.MODE_CONFIG.normal,{durationMs:18000,multiplier:1.3});
assert.deepEqual(data.MODE_CONFIG.hard,{durationMs:10000,multiplier:1.65});

console.log(`PASS v0.28.3 Unown data helpers (${pokemon.length} Pokémon + ${data.CURATED_ENTRIES.length} curated)`);
