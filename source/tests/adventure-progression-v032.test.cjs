const assert=require('assert'),fs=require('fs'),path=require('path');
const a=path.resolve(__dirname,'../app/src/main/assets/adventure'),file=path.join(a,'adventure-progression.js');assert(fs.existsSync(file),'shared persistent EXP and move learning module');
const P=require(file),data=require(path.join(a,'adventure-move-data.js'));
const save={pokemon:{'4:n':{id:4,name:'Charmander',count:7,level:8,xp:17,firstSeen:123},'25:s':{id:25,shiny:true,count:2}},profile:{coins:9876,tickets:4,dust:33},cards:{old:{count:9}},adventureV2:{activeExpedition:{marker:'keep'}}};
P.ensureSave(save);assert.equal(save.pokemon['4:n'].count,7);assert.equal(save.pokemon['4:n'].xp,17);assert.equal(save.pokemon['4:n'].firstSeen,123);assert.equal(save.pokemon['25:s'].level,5);assert.equal(save.profile.coins,9876);assert.equal(save.cards.old.count,9);assert.equal(save.adventureV2.activeExpedition.marker,'keep');
for(const p of Object.values(save.pokemon)){assert(p.moves.length>=1&&p.moves.length<=4);assert(p.moves.every(id=>data.moves[id]));}
const before=JSON.stringify(save);P.ensureSave(save);assert.equal(JSON.stringify(save),before,'idempotent migration');
let p={id:4,level:5,xp:0};P.ensureOwned(p);let r=P.grantXp(p,P.xpNeeded(5)*4);assert(r.levels>0&&p.level>5);assert(p.xp>=0);assert(p.pendingMoves.every(id=>data.species[4].levelUp.some(x=>x.moveId===id)));assert(p.moves.length<=4);
save.tmInventory={85:1};assert(P.canTeach(save.pokemon['25:s'],85));assert(!P.canTeach(save.pokemon['4:n'],85));assert.equal(P.teachTM(save,'4:n',85).applied,false);assert.equal(save.tmInventory[85],1);const pik=save.pokemon['25:s'];pik.moves=[data.species[25].basicMoveId];assert(P.teachTM(save,'25:s',85).applied);assert(pik.moves.includes(85));assert.equal(save.tmInventory[85],0);assert.equal(P.teachTM(save,'25:s',85).applied,false);
const capped={id:25,level:50,xp:88};P.ensureOwned(capped);P.grantXp(capped,10000);assert.equal(capped.level,50);assert.equal(capped.xp,88,'cap does not accumulate runaway EXP');
console.log('PASS owned save compatibility, levels, real moves, learning and consumable TM compatibility');
