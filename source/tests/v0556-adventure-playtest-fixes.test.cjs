const fs=require('fs'),assert=require('assert');
const B=require('../app/src/main/assets/adventure/adventure-battle.js');
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js');
const F=require('../app/src/main/assets/adventure/adventure-location-flow.js');
const T=require('../app/src/main/assets/adventure/adventure-tools.js');
const M=require('../app/src/main/assets/adventure/adventure-move-view.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');

function baseSave(id=25,level=30,moves){
  const key=`${id}:n`,row={...S.byId[id],id,level,count:1};if(moves)row.moves=moves;
  return {pokemon:{[key]:row},team:[key],profile:{coins:5000,xp:3000},inventory:{pokeball:10,potion:5,linkcable:0},stats:{},settings:{}};
}

// Physical / Special is now a real six-stat split and the move copy names the real stats.
const alakazam=B.stats({...S.byId[65],id:65,level:30});
assert.ok(alakazam.spAttack>alakazam.attack,'Alakazam should have a meaningfully higher Sp. Atk than Attack');
assert.ok(Number.isFinite(alakazam.spDefense),'battle stats should expose Sp. Def');
const ancient=M.describe(246);
assert.match(ancient.description,/Sp\. Atk/);
assert.match(ancient.description,/Sp\. Def/);
assert.doesNotMatch(ancient.description,/offense/i);

// Fake Out cannot repeatedly lock a target and immunity means no flinch.
const fakeUser={...S.byId[52],id:52,name:'meowth',level:30,moves:[252],baseStats:{...S.byId[52].baseStats,hp:255,defense:255,speed:255}};
const ghost={...S.byId[92],id:92,name:'gastly',level:20,moves:[45],types:['ghost'],baseStats:{...S.byId[92].baseStats,hp:255,attack:20,speed:1}};
const fight=B.create([fakeUser],ghost,{context:'regional',kind:'trainer',challengeTier:'trainer',seed:123});
const first=B.act(fight,'move',{moveId:252},{});
assert.equal(first.applied,true);
assert.equal(first.action.events.find(e=>e.kind==='hit'&&e.target==='enemy')?.damage,0,'Normal Fake Out should deal zero damage to Ghost');
assert.equal(first.action.events.some(e=>/flinched/i.test(e.text||'')),false,'an immune Ghost must not flinch');
const second=B.act(fight,'move',{moveId:252},{});
assert.equal(second.applied,true);
assert.ok(second.action.events.some(e=>/only works.*first turn/i.test(e.text||'')),'Fake Out should fail after the first turn in');

// Collection moves fill missing Journey slots instead of silently disappearing.
const aero=baseSave(142,27,[157,44,48,17]);
const aj=E.start(aero,'kanto',77);aj.badges=3;aj.chapterIndex=3;aj.party[0].level=20;aj.party[0].moves=[157,44,48];aj.party[0].pp={157:9,44:25,48:20};
E.syncParty(aero);
assert.deepEqual(aj.party[0].moves,[157,44,48,17],'Wing Attack should be restored into an empty Journey move slot');

// Kanto encounter pools are location-specific: Route 19 never borrows Mansion Grimer.
const route19=E.encounterPool(aj,{name:'Route 19',stage:6,type:'wild'},false);
const mansion=E.encounterPool(aj,{name:'Pokémon Mansion',stage:6,type:'wild'},false);
assert.ok(!route19.includes(88),'Grimer must not appear on Route 19');
assert.ok(mansion.includes(88),'Grimer remains available in Pokémon Mansion');

// Completed locations can be revisited for local encounters, then returned to the live story.
aj.phase='map';aj.current=null;aj.depth=10;aj.chapterIndex=2;aj.sectionIndex=0;aj.location='Route 5';
aj.completedLocations=['Viridian Forest','Route 1'];
assert.equal(F.visit(aero,'Viridian Forest'),true,'completed stops should be revisit-able');
assert.equal(F.describe(aj).name,'Viridian Forest');
const revisitActions=F.actionsFor(aero,aj).map(a=>a.key);
assert.ok(revisitActions.includes('hunt-local'),'revisited encounter locations should offer LOOK FOR POKÉMON');
assert.ok(revisitActions.includes('return-story'),'revisited locations should always offer a way back to story progress');
assert.equal(F.perform(aero,'hunt-local').applied,true,'local hunt should launch a battle');
assert.equal(aj.phase,'battle');
assert.ok([10,11,12,13,14,15,25].includes(Number(aj.battle.enemy.id)),'Viridian Forest hunt should use its local pool');

// Champion result text has an actual completion action, not a loop back to the League.
const champSave=baseSave(25,50,[84,98]);
const cj=E.start(champSave,'kanto',88),champ=cj.nodes.find(n=>!n.optional&&n.type==='champion');
cj.depth=champ.depth;cj.current=champ.id;cj.phase='result';cj.location=champ.name;cj.resolutions[champ.id]={claimed:true};
assert.equal(F.describe(cj).continueLabel,'FINISH REGIONAL JOURNEY');
assert.equal(F.describe(cj).nextLabel,'Journey complete');

// Link Cable handles standard trade evolutions without another player.
const machoke=baseSave(67,31,[2,43]);machoke.inventory.linkcable=1;
const evolved=T.evolveWithLinkCable(machoke,'67:n');
assert.equal(evolved.applied,true);
assert.equal(evolved.key,'68:n');
assert.equal(machoke.inventory.linkcable,0);
assert.equal(machoke.pokemon['68:n'].id,68);
assert.ok(!machoke.pokemon['67:n'],'last Machoke copy should be replaced by Machamp');
assert.deepEqual(machoke.team,['68:n']);

// Mart access is location-aware in Journey Bag markup.
const martSave=baseSave();const mj=E.start(martSave,'kanto',99);mj.location='Pallet Town';
let bag=T.markup(martSave,'bag',{context:'journey'});
assert.doesNotMatch(bag,/data-tool-action="mart"/,'Pallet Town/no-Mart journey location should not expose a global Poké Mart');
mj.depth=mj.nodes.find(n=>!n.optional&&n.name==='Viridian City').depth;mj.location='Viridian City';mj.current=null;mj.phase='map';mj.locationFlow=null;
bag=T.markup(martSave,'bag',{context:'journey'});
assert.match(bag,/data-tool-action="mart"/,'towns with a Mart should expose it');

// Challenge Course surfaces full instructions before entering games.
const goldenrod=fs.readFileSync('app/src/main/assets/arcade-goldenrod.js','utf8');
assert.match(goldenrod,/HOW TO PLAY/);
assert.match(goldenrod,/event\.guide/);

// New revisit/evolution controls receive mobile-friendly styling.
const mapCss=fs.readFileSync('app/src/main/assets/adventure/adventure3.css','utf8');
const toolCss=fs.readFileSync('app/src/main/assets/adventure/adventure-tools.css','utf8');
assert.match(mapCss,/journey-map-stops li button/,'map revisit buttons need explicit list-row styling');
assert.match(toolCss,/\.a3-evolution-list/,'Link Cable evolution choices need dedicated layout');

console.log('PASS v0.55.6 full Kanto playtest fixes');
