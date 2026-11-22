'use strict';
// v0.69.393 XY11 release contract. Source-only is not the generated official audit.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=x=>fs.readFileSync(path.join(root,x),'utf8');
const xy=require('../app/src/main/assets/tcg-classic-steam-siege.js');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const contract=require('../scripts/xy11_release_contract.json');
const DATA='data/classic/xy11-print-compact.json',generated=fs.existsSync(path.join(root,DATA));
test('Steam Siege registry, set picker, player/CPU pool and launch load',()=>{
 const files=['app/src/main/assets/tcg-classic-battle-data.js','app/src/main/assets/tcg-classic-deck-builder.js','app/src/main/assets/tcg-classic-opponents.js','app/src/main/assets/tcg-classic-set-picker.js'];
 for(const name of files)assert.ok(read(name).includes('xy11'),name+' missing XY11');
 assert.match(read(files[0]),/\.\.\.xy11\.CARDS/);assert.match(read(files[0]),/xy11\.cardById\(id\)/);
 assert.match(read(files[0]),/steamSiege:xy11\.coverage\(\)/);
 assert.match(read('app/src/main/assets/index.html'),/tcg-classic-steam-siege\.js/);
 assert.deepEqual(xy.SET.id,'xy11');assert.equal(xy.SET.printedTotal,116);
 const g=read('app/build.gradle');
 assert.match(g,/dependsOn tasks\.named\('auditXY10ForApk'\)/);
 assert.match(g,/dependsOn tasks\.named\('auditXY11ForApk'\)/);
 assert.match(g,/tests\/v07390-steam-siege-integration\.test\.cjs/);
});
test('new-set release version, immutable upstream source and official-count contract',()=>{
 const g=read('app/build.gradle'),v=g.match(/versionName ['"]([^'"]+)['"]/)[1];
 assert.equal(v,'0.69.393');assert.equal(v,contract.release);
 assert.match(g,/versionCode 7393/);
 for(const id of ['xy9','xy10'])assert.equal(require('../scripts/'+id+'_release_contract.json').release,v);
 for(const file of ['app/src/main/assets/index.html','app/src/main/assets/app-v0167.js'])assert.ok(read(file).includes(v),file+' stale build version');
 const builder=read('scripts/build-xy11.py');
 assert.ok(builder.includes(contract.pin));assert.ok(builder.includes('len(rows)!=116'));
 assert.equal(contract.printedTotal,116);assert.equal(contract.attackPrints,161);
 assert.equal(contract.abilities,18);assert.equal(contract.pokemonBreak,7);assert.equal(contract.dualTypePrints,12);
});
test('strict source-only gating and safe reuse of older XY10 fossils/BREAK/Trainer mechanics',()=>{
 const py=String.raw`import sys,json,importlib.util;sys.path.insert(0,sys.argv[1]);sp=importlib.util.spec_from_file_location('build_xy11',sys.argv[2]);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
def row(n,name,sub,attacks,abilities=None,types=None,supertype='Pokémon',rules=None):return [n,name,supertype,sub,100 if supertype=='Pokémon' else None,types or ['Fire'],None,attacks,abilities or [],None,None,1,'Rare',rules or [],None,None]
rows=[row('24','Pyroar BREAK',['BREAK'],[['Kaiser Tackle',['R','R','C'],'180','This Pokémon does 50 damage to itself.']]),row('26','Volcanion-EX',['Basic','EX'],[['Volcanic Heat',['R','R','C'],'130',"This Pokémon can't attack during your next turn."]],[['Steam Up','Ability','Discard a Fire Energy from your hand.']],['Fire','Water']),row('69','Shieldon',['Restored'],[['Rock Head',['C','C'],'20','During your opponent’s next turn, any damage done to this Pokémon by attacks is reduced by 20 (after applying Weakness and Resistance).']]),row('98','Armor Fossil Shieldon',['Item'],[],supertype='Trainer'),row('114','Professor Sycamore',['Supporter'],[],supertype='Trainer'),row('99','Captivating Poké Puff',['Item'],[],supertype='Trainer'),row('67','Steelix-EX',['Basic','EX'],[['Wild Edge',['M','C','C','C'],'80+','You may do 50 more damage. If you do, this Pokémon does 20 damage to itself.'],['Iron Tail',['M','C','C','C','C'],'100×','Flip a coin until you get tails. This attack does 100 damage times the number of heads.']])]
cards=m.generate(rows);print(json.dumps([{'id':c['id'],'enabled':c['battleEnabled'],'reasons':c['support']['reasons'],'types':c.get('types'),'stage':c.get('stage'),'inherit':c.get('upgradeInheritance')} for c in cards]))`;
 const r=spawnSync('python3',['-c',py,path.join(root,'scripts'),path.join(root,'scripts/build-xy11.py')],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
 const cs=JSON.parse(r.stdout),by=new Map(cs.map(x=>[x.id,x]));
 assert.equal(by.get('xy11-24').enabled,true);assert.equal(by.get('xy11-24').inherit,'previous');
 assert.equal(by.get('xy11-26').enabled,true,'Steam Up has a verified activated Ability and next-turn attack lock');
 assert.deepEqual(by.get('xy11-26').types,['Fire','Water']);
 assert.equal(by.get('xy11-69').stage,'Restored');
 assert.equal(by.get('xy11-98').enabled,true,'Uses pre-existing bottom-seven Restored Fossil rule');
 assert.equal(by.get('xy11-114').enabled,true,'Existing exact Sycamore shuffle rule');
 assert.equal(by.get('xy11-99').enabled,true,'Captivating Poké Puff uses the real opponent-hand Basic selection');
 assert.equal(by.get('xy11-67').enabled,true,'Steelix optional recoil uses existing choice system');
 const core=read('app/src/main/assets/tcgp-battle-core.js');
 for(const id of ['xy11-68','xy11-79','xy11-101','xy11-106'])assert.ok(core.includes(id),'Spirit Link turn exemption missing '+id);
 const deck=read('app/src/main/assets/tcg-classic-deck-builder.js');
 for(const id of ['xy11-98','xy11-100','xy11-56','xy11-69'])assert.ok(deck.includes(id),'Restored family missing '+id);
});
const mandatory=generated||process.env.GITHUB_ACTIONS==='true';
test('Official XY11 116 printed costs, dual types, attack effect validation and verified cards', {skip:!mandatory},()=>{
 assert.equal(generated,true,'GitHub/strict build must generate pinned XY11 official source before tests');
 const rows=JSON.parse(read(DATA));assert.equal(rows.length,116);
 assert.deepEqual(rows.map(x=>String(x[0])),Array.from({length:116},(_,i)=>String(i+1)));
 assert.equal(rows.reduce((n,r)=>n+r[7].length,0),161);
 assert.equal(rows.reduce((n,r)=>n+r[8].length,0),18);
 assert.equal(rows.filter(r=>r[3].includes('BREAK')).length,7);
 assert.equal(rows.filter(r=>r[5].length>1).length,12);
 assert.equal(xy.CARDS.length,116,'XY11 runtime is still the pre-generation placeholder');
 for(let i=0;i<116;i++){
  const r=rows[i],c=xy.CARDS[i];assert.equal(c.id,'xy11-'+r[0]);assert.equal(c.name,r[1]);
  assert.equal(classic.cardById(c.id),c);
  // tcg-classic-battle-data converts attack.cost arrays into the compact
  // printed string before runtime consumption; both forms are correct.
  const printedCost=cost=>Array.isArray(cost)?cost.join(''):String(cost??'');
  assert.deepEqual(c.kind==='pokemon'?c.attacks.map(a=>printedCost(a.cost)):[],c.kind==='pokemon'?r[7].map(a=>a[1].join('')):[],'Source attack costs '+c.id);
  if(c.kind==='pokemon'){
   assert.deepEqual(c.types,r[5],'Dual type retained '+c.id);
   assert.equal(c.breakEvolution,r[3].includes('BREAK'));
   if(c.breakEvolution)assert.equal(c.upgradeInheritance,'previous');
  }
  assert.equal(c.deckEligible,c.battleEnabled);
  if(!c.battleEnabled){assert.ok(c.support.reasons.length,'Unsupported printed rule lacks gate: '+c.id);continue;}
  assert.equal(c.support.status,'FULL');
  if(c.kind==='pokemon')for(const a of c.attacks)assert.deepEqual(effects.validateEffect(a.effect),[],c.id+'/'+a.name);
  if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id+'/'+c.name);
 }
 const count=xy.CARDS.filter(c=>c.battleEnabled).length;
 assert.ok(count>=contract.expectedPlayableMinimum,`XY11 coverage regressed to ${count}`);
 for(const n of contract.requiredEnabledNumbers)assert.equal(xy.cardById('xy11-'+n)?.battleEnabled,true,'Expected ready XY11 print '+n+' gated');
 assert.equal(count+xy.CARDS.filter(c=>!c.battleEnabled).length,116);
});
test('Steam Siege first-pass ordinary energy-zone decks are legal when generated',{skip:!mandatory},()=>{
 const owned=xy.CARDS.filter(c=>c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
 const decks=require('../app/src/main/assets/tcg-classic-decks.js');
 for(const seed of [3,25,71]){
  const result=builder.buildDeck(owned,{sets:['xy11'],style:'random',randomSeed:seed});
  // Some mono-set archetypes are intentionally gated. The builder must not
  // create illegal decks to force an unavailable energy/evolution strategy.
  if(!result.ok){assert.ok(result.errors?.length||result.error,'Deck failure needs explanation');continue;}
  assert.equal(result.cards.length,30);
  assert.ok(decks.validateDraft(result.cards,owned,{requireFull:true}).ok);
  assert.ok(result.cards.every(id=>classic.cardById(id)?.setId==='xy11'));
  const has=id=>result.cards.includes(id);
  if(has('xy11-101'))assert.ok(['xy11-79','xy11-112'].some(has));
  if(has('xy11-106'))assert.ok(['xy11-68','xy11-109'].some(has));
  if(has('xy11-98'))assert.ok(has('xy11-69'));
  if(has('xy11-100'))assert.ok(has('xy11-56'));
 }
});

test('Restored Barrier prevents Weakness for Restored cards only, and ends when Anorith leaves play',()=>{
 const slot=(cardId,uid)=>({cardId,uid,energy:{},specialEnergy:[],conditions:{},damage:0,stack:[],locks:[]});
 const cards={
  'probe-fire':{id:'probe-fire',stage:'Basic',kind:'pokemon',types:['Fire'],hp:100,retreat:1,abilities:[]},
  'probe-restored':{id:'probe-restored',stage:'Restored',kind:'pokemon',types:['Metal'],hp:100,retreat:1,weakness:'Fire',weaknessValue:'×2',resistance:null,abilities:[]},
  'probe-basic':{id:'probe-basic',stage:'Basic',kind:'pokemon',types:['Metal'],hp:100,retreat:1,weakness:'Fire',weaknessValue:'×2',resistance:null,abilities:[]},
  'xy11-56':{id:'xy11-56',stage:'Restored',kind:'pokemon',types:['Fighting'],hp:100,retreat:1,abilities:[{name:'Restored Barrier',type:'passive',effect:{type:'noop'}}]},
 };
 const byId=id=>cards[id]||classic.cardById(id);
 const player={active:slot('probe-fire','a'),bench:[],hand:[],deck:[],discard:[],prizes:[]};
 const opponent={active:slot('probe-restored','d'),bench:[slot('xy11-56','barrier')],hand:[],deck:[],discard:[],prizes:[]};
 const s={format:'classic',turnNumber:8,modifiers:[],stadium:null,sides:{player,opponent}};
 const hit=()=>effects.attackDamageWithState(s,'player',player.active,'opponent',opponent.active,30,byId);
 assert.equal(hit(),30,'Anorith protects other Restored Pokemon');
 opponent.active.cardId='probe-basic';assert.equal(hit(),60,'Basic Pokemon still have Weakness');
 opponent.active.cardId='probe-restored';
 player.bench=[{...slot('bw6-54','garbotoxin'),tool:{cardId:'bw6-114',uid:'garbodor-tool'}}];
 assert.equal(hit(),60,'Garbodor with Tool suppresses Restored Barrier');
 player.bench=[];opponent.bench=[];assert.equal(hit(),60,'Aura ends when Anorith leaves');
});

test('Jumpluff Solar Step counts remaining Prize cards, not scored points',()=>{
 const a={cardId:'xy11-5',uid:'jump',energy:{Grass:1},specialEnergy:[],damage:0,conditions:{},locks:[]};
 const d={cardId:'xy10-1',uid:'enemy',energy:{},specialEnergy:[],damage:0,conditions:{},locks:[]};
 const self={active:a,bench:[],hand:[],deck:[],discard:[],prizes:[1,2,3].map(i=>({cardId:'xy10-1',uid:'prize'+i})),points:0,prizesTaken:2};
 const foe={active:d,bench:[],hand:[],deck:[],discard:[],prizes:[],points:99,prizesTaken:0};
 const state={format:'classic',sides:{player:self,opponent:foe},log:[],turnNumber:8};
 const hit=()=>effects.resolveAttack({name:'Solar Step',damage:0,cost:['G'],effect:{type:'pointDamage',side:'self',prizesRemaining:true,amount:20,mode:'replace'}},{state,side:'player',foeSide:'opponent',attacker:a,defender:d,cardById:classic.cardById,random:()=>0.5}).damage;
 assert.equal(hit(),60);self.prizes.shift();assert.equal(hit(),40);
});
