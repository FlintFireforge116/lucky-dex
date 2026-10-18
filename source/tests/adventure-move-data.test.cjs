'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const D = require('../app/src/main/assets/adventure/adventure-move-data.js');
const S = require('../app/src/main/assets/adventure/adventure-species.js');
const source = path.resolve(__dirname, '../data/adventure-moves');
function csv(name) {
  const lines = fs.readFileSync(path.join(source, name), 'utf8').replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const parse = line => {
    const result=[]; let cell='',quoted=false;
    for (let i=0;i<line.length;i++) {
      const c=line[i];
      if(c==='"') {if(quoted&&line[i+1]==='"') {cell+='"';i++;} else quoted=!quoted;}
      else if(c===','&&!quoted) {result.push(cell);cell='';} else cell+=c;
    }
    result.push(cell);return result;
  };
  const header=parse(lines.shift());
  return lines.map(line=>Object.fromEntries(parse(line).map((value,i)=>[header[i],value])));
}
const canonical=Object.fromEntries(csv('moves.csv').map(row=>[row.id,row]));
const defaults=Object.fromEntries(csv('pokemon.csv').filter(row=>row.is_default==='1'&&+row.species_id<=1025).map(row=>[row.species_id,row]));
const neededForms=new Set(Object.values(D.species).map(row=>row.pokemonId));
const associations=new Set();
const levelUps=new Map();
const tmAssociations=new Map();
for(const row of csv('pokemon_moves.csv')) {
  if(!neededForms.has(+row.pokemon_id)) continue;
  if(row.pokemon_move_method_id!=='1'&&row.pokemon_move_method_id!=='4') continue;
  const prefix=`${row.pokemon_id}:${row.version_group_id}`;
  associations.add(`${prefix}:${row.pokemon_move_method_id}:${row.move_id}:${Math.max(1,+row.level)}`);
  if(row.pokemon_move_method_id==='1') {
    if(!levelUps.has(prefix)) levelUps.set(prefix,new Map());
    const moves=levelUps.get(prefix),id=+row.move_id,level=Math.max(1,+row.level);
    moves.set(id,Math.min(moves.get(id)||101,level));
  } else {
    if(!tmAssociations.has(prefix)) tmAssociations.set(prefix,new Set());
    tmAssociations.get(prefix).add(+row.move_id);
  }
}

test('offline bundle covers every bundled species using the real default form',()=>{
  const typeNames=Object.fromEntries(csv('types.csv').map(row=>[row.id,row.identifier]));
  const formTypes=new Map();
  for(const row of csv('pokemon_types.csv')) {
    if(!formTypes.has(+row.pokemon_id)) formTypes.set(+row.pokemon_id,[]);
    formTypes.get(+row.pokemon_id).push(typeNames[row.type_id]);
  }
  assert.equal(Object.keys(D.species).length,1025);
  assert.equal(Object.keys(S.byId).length,1025);
  for(const [id,species] of Object.entries(D.species)) {
    assert.ok(S.byId[id]);
    assert.equal(species.pokemonId,+defaults[id].id,`default form ${id}`);
    assert.equal(species.form,defaults[id].identifier);
    assert.deepEqual(S.byId[id].types,formTypes.get(species.pokemonId),`default form types ${id}`);
    assert.ok(D.moves[species.basicMoveId],`basic move ${id}`);
    assert.ok(associations.has(`${species.pokemonId}:${species.basicVersionGroup}:1:${species.basicMoveId}:${species.basicLevel}`),`actual basic learnset association ${id}`);
  }
});

test('all move types, power, accuracy and PP retain canonical source values',()=>{
  const types=Object.fromEntries(csv('types.csv').map(row=>[row.id,row.identifier]));
  const names=Object.fromEntries(csv('move_names.csv').filter(row=>row.local_language_id==='9').map(row=>[row.move_id,row.name]));
  for(const [id,move] of Object.entries(D.moves)) {
    const src=canonical[id];assert.ok(src);
    assert.equal(move.id,+id);assert.equal(move.name,names[id]);
    assert.equal(move.type,types[src.type_id]);
    for(const key of ['power','accuracy','pp']) assert.equal(move[key],src[key]===''?null:+src[key],`${move.name} ${key}`);
    assert.equal(move.damageClass,{1:'status',2:'physical',3:'special'}[src.damage_class_id]);
    assert.ok(['damage','heal','buff','debuff','status','no-op'].includes(move.role));
  }
});

test('level-up schedules exactly match one current default-form source learnset',()=>{
  for(const [id,species] of Object.entries(D.species)) {
    const expected=[...levelUps.get(`${species.pokemonId}:${species.versionGroup}`)].map(([moveId,level])=>({level,moveId})).sort((a,b)=>a.level-b.level||a.moveId-b.moveId);
    assert.deepEqual(species.levelUp,expected,`level-up data ${id}`);
    for(const {level,moveId} of species.levelUp) {assert.ok(D.moves[moveId]);assert.ok(level>=1&&level<=100);}
    assert.ok(![19,24,30,31,32].includes(species.versionGroup),'traditional battle semantics');
  }
});

test('TM catalog is limited and compatibility comes only from same-version machine records',()=>{
  assert.equal(D.tmIds.length,30);assert.equal(new Set(D.tmIds).size,30);
  for(const [id,species] of Object.entries(D.species)) {
    const actual=tmAssociations.get(`${species.pokemonId}:${species.versionGroup}`)||new Set();
    assert.deepEqual(species.tm,D.tmIds.filter(moveId=>actual.has(moveId)).sort((a,b)=>a-b),`TM compatibility ${id}`);
  }
  assert.ok(D.tmIds.includes(85));assert.ok(D.species[25].tm.includes(85));assert.ok(!D.species[4].tm.includes(85));
  assert.equal(D.moves[85].name,'Thunderbolt');assert.equal(D.moves[182].role,'buff');
});

test('sensible early basics preserve actual signature exceptions and explain larger powers',()=>{
  for(const [id,moveId] of [[4,52],[7,55],[25,84],[11,106],[63,100],[129,150],[132,144],[201,237],[202,68],[225,217],[235,166],[349,150],[789,150],[790,322]]) assert.equal(D.species[id].basicMoveId,moveId);
  assert.equal(D.fallbackMoveId,165);assert.equal(D.moves[165].name,'Struggle');
  assert.equal(D.moves[150].role,'no-op');assert.equal(D.moves[217].power,null);
  for(const [id,species] of Object.entries(D.species)) {
    if((D.moves[species.basicMoveId].power||0)>40) assert.ok(D.basicExceptions[id],`document exception ${id}`);
  }
  assert.equal(D.moves[D.species[36].basicMoveId].name,'Disarming Voice');
  assert.notEqual(D.species[36].basicVersionGroup,D.species[36].versionGroup);
});

test('pinned cached inputs match recorded SHA-256 provenance',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(source,'manifest.json'),'utf8'));
  assert.equal(D.sourceSnapshot,manifest.snapshot);
  for(const [name,hash] of Object.entries(manifest.sha256)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(source,name))).digest('hex'),hash,name);
});

test('browser script exposes the same offline global without a runtime request',()=>{
  const code=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/adventure/adventure-move-data.js'),'utf8');
  const context={window:{}};vm.runInNewContext(code,context);
  assert.equal(context.window.LuckyDexMoveData.species[1025].basicMoveId,D.species[1025].basicMoveId);
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest|https?:\/\//.test(code));
});
