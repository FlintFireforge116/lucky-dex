const assert=require('node:assert/strict'),{test}=require('node:test');
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js'),S=require('../app/src/main/assets/adventure/adventure-species.js');
const fresh=()=>({pokemon:{'1:n':{...S.byId[1],level:5,count:1}},team:['1:n'],profile:{coins:1000},inventory:{potion:5,pokeball:20},stats:{}});
test('skipping an optional travel event advances only its authored main ID with no heal, claim or grant',()=>{
 const s=fresh(),j=E.start(s,'johto',17);assert.equal(typeof E.skipTravel,'function','safe travel operation must exist');j.party[0].hp=12;const inventory=JSON.stringify(s.inventory);
 assert(E.skipTravel(s,'johto-c0-s0'));assert.equal(j.depth,1);assert.equal(j.party[0].hp,12);assert.equal(s.profile.coins,1000);assert.equal(JSON.stringify(s.inventory),inventory);assert.equal(j.claims['johto-c0-s0'],undefined);assert(j.completed.includes('johto-c0-s0'));
 const before=JSON.stringify(s);assert.equal(E.skipTravel(s,'johto-c0-s1'),false);assert.equal(E.skipTravel(s,'johto-c0-rare'),false);assert.equal(JSON.stringify(s),before);
});
test('Center recovery rejects routes and battles and heals supported settlement HP, PP and status',()=>{
 const s=fresh(),j=E.start(s,'johto',17);assert.equal(typeof E.restoreAtCenter,'function','validated Center recovery operation must exist');j.party[0].hp=1;
 assert.equal(E.restoreAtCenter(s),false,'New Bark has no Center');E.skipTravel(s,'johto-c0-s0');assert.equal(E.restoreAtCenter(s),false,'Route 29 has no Center');
 E.enter(s,'johto-c0-s1');assert.equal(E.restoreAtCenter(s),false,'cannot heal during battle');j.battle.result={kind:'victory'};j.battle.phase='terminal';E.settleBattle(s);E.advance(s);
 const p=j.party[0];p.hp=1;p.status='poison';for(const id of p.moves)p.pp[id]=0;const depth=j.depth,coins=s.profile.coins;assert(E.restoreAtCenter(s));assert.equal(p.hp,p.maxHp);assert.equal(p.status,null);assert(Object.values(p.pp).every(n=>n>0));assert.equal(j.depth,depth);assert.equal(s.profile.coins,coins);
});
test('leaving an open event choice does not force healing or exploration rewards',()=>{
 const s=fresh(),j=E.start(s,'johto',17);j.party[0].hp=12;assert(E.enter(s,'johto-c0-s0'));const hp=j.party[0].hp;
 assert(E.skipTravel(s,'johto-c0-s0'));assert.equal(j.depth,1);assert.equal(j.party[0].hp,hp);assert.equal(s.profile.coins,1000);assert.equal(j.claims['johto-c0-s0'],undefined);
});
