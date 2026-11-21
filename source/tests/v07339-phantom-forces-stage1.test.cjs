'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const classic=require(path.join(assets,'tcg-classic-battle-data.js'));
const phantom=require(path.join(assets,'tcg-classic-phantom-forces.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(assets,'tcg-classic-opponents.js'));
const picker=require(path.join(assets,'tcg-classic-set-picker.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const source=path.join(root,'data/classic/xy4-print-compact.json');
const GENERATED=fs.existsSync(source);
// The shared Classic registry normalizes printed Energy arrays to a compact
// string (['G','C'] -> 'GC'). Compare symbols, not the JS representation.
// Preserve order and multiplicity: 'GC' is never equivalent to 'GG'.
function printedCostSymbols(cost) {
 if (Array.isArray(cost)) return cost.join('');
 if (typeof cost === 'string') return cost;
 throw new TypeError('Unexpected Classic attack Energy cost: '+String(cost));
}


test('Phantom Forces is registered for player, opponent, card inspector, and HTML boot',()=>{
 assert.equal(phantom.SET.id,'xy4');assert.equal(phantom.SET.printedTotal,124);assert.equal(phantom.SET.cardCount,119);
 assert.ok(classic.SETS.some(s=>s.id==='xy4'));
 assert.ok(builder.SET_IDS.includes('xy4'));assert.ok(opponents.SETS.includes('xy4'));
 assert.equal(picker.names.xy4,'Phantom Forces');
 assert.equal(classic.coverage().phantomForces.printed,phantom.coverage().printed);
 const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
 assert.ok(html.includes('<script src="tcg-classic-phantom-forces.js"></script>'));
 assert.ok(html.indexOf('tcg-classic-phantom-forces.js')<html.indexOf('tcg-classic-battle-data.js'));
});

test('Android, title, boot version and XY4 audit dependencies remain synchronized',()=>{
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 const name=/versionName '0\.69\.(\d+)'/.exec(gradle);
 const code=/versionCode\s+(\d+)/.exec(gradle);
 assert.ok(name && code,'Android version fields must be present');
 const patchNumber=Number(name[1]);
 assert.ok(patchNumber>=339,'XY4 release must not regress');
 assert.equal(Number(code[1]),7000+patchNumber);
 const version=`0.69.${patchNumber}`;
 const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
 const boot=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
 assert.ok(html.includes(`titleBuildVersion">v${version}`),'title version mismatch');
 assert.ok(html.includes(`appBuildVersion">LUCKY DEX · v${version}`),'UI version mismatch');
 assert.ok(boot.includes(`window.__LUCKYDEX_BUILD='${version}'`),'boot version mismatch');
 assert.match(gradle,/tasks\.register\('generateXY4ForApk'/);
 assert.match(gradle,/tasks\.register\('auditXY4ForApk'/);
 assert.match(gradle,/auditV07329AllClassicAttackEnergyForApk'\)\.configure\s*\{\s*dependsOn tasks\.named\('auditXY4ForApk'/);
});

test('offline source generation maps supported rules and gates unknown ones instead of nop',()=>{
 const code=String.raw`
import sys,json
sys.path.insert(0,sys.argv[1]);import importlib.util
sp=importlib.util.spec_from_file_location('xy4builder',sys.argv[1]+'/build-xy4.py')
m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
def row(n,name,sup='Pokémon',sub=None,types=None,att=None,ability=None):
 return [str(n),name,sup,sub or (['Basic'] if sup=='Pokémon' else ['Item']),80,types or ['Psychic'],None,att or [],ability or [],None,None,1,'Common',[],None]
rows=[
 row(26,'Joltik',types=['Lightning'],att=[['Night March',['C','C'],'20×','This attack does 20 damage times the number of Pokémon in your discard pile that have the Night March attack.']]),
 row(44,'Pumpkaboo',att=[['Ram',['P'],'10',''],['Night March',['C','C','C'],'20×','This attack does 20 damage times the number of Pokémon in your discard pile that have the Night March attack.']]),
 row(2,'Venomoth',att=[['Dizzying Wind',['G'],'','Whenever your opponent plays a Trainer card from his or her hand during his or her next turn, your opponent flips a coin. If tails, that card has no effect. (Your opponent still discards that card.)'],['Noxious Scales',['G','C','C'],'50',"Your opponent's Active Pokémon is now Confused and Poisoned."]]),
 row(23,'Manectric-EX',sub=['Basic','EX'],types=['Lightning'],att=[['Overrun',['L'],'20',"This attack does 20 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)"],['Assault Laser',['L','C'],'60+',"If your opponent's Active Pokémon has a Pokémon Tool card attached to it, this attack does 60 more damage."]]),
 row(91,'AZ','Trainer',['Supporter'],types=[]),
 row(93,'Dimension Valley','Trainer',['Stadium'],types=[]),
 row(103,'Roller Skates','Trainer',['Item'],types=[]),
 row(107,'Tierno','Trainer',['Supporter'],types=[]),
 row(109,'VS Seeker','Trainer',['Item'],types=[]),
 row(111,'Double Colorless Energy','Energy',['Special'],types=[]),
 row(112,'Mystery Energy','Energy',['Special'],types=[]),
]
print(json.dumps(m.generate(rows)))`;
 const r=spawnSync('python3',['-c',code,path.join(root,'scripts')],{encoding:'utf8',maxBuffer:1024*1024});
 assert.equal(r.status,0,r.stderr||r.stdout);
 const by=Object.fromEntries(JSON.parse(r.stdout).map(c=>[c.number,c]));
 for(const id of ['26','44','23','91','93','103','107','109','111','112'])assert.equal(by[id].battleEnabled,true,id+': '+by[id].support.reasons);
 for(const id of ['2'])assert.equal(by[id].battleEnabled,false,id+' must stay gated');
 for(const card of Object.values(by).filter(c=>c.battleEnabled)){
  for(const attack of card.attacks||[])assert.deepEqual(effects.validateEffect(attack.effect),[],card.id+': '+attack.name);
  if(card.kind==='trainer')assert.deepEqual(effects.validateEffect(card.effect),[],card.id);
 }
 assert.deepEqual(by['111'].effect.provides,{Colorless:2});
 assert.equal(by['23'].prizeCards,2);
 assert.equal(by['26'].attacks[0].damage,0,'printed 20× must not become a flat 20');
});

test('Night March reads THIS player physical discard and counts Pokémon prints, not names alone',()=>{
 const cards={
  'xy4-26':{kind:'pokemon',attacks:[{name:'Gnaw'},{name:'Night March'}]},
  'xy4-42':{kind:'pokemon',attacks:[{name:'Cursed Drop'},{name:'Night March'}]},
  'xy4-44':{kind:'pokemon',attacks:[{name:'Night March'}]},
  'xy4-99':{kind:'trainer',attacks:[]},'xy4-11':{kind:'pokemon',attacks:[{name:'Roar'}]},
 };
 const state={format:'classic',turnNumber:3,log:[],sides:{player:{active:{cardId:'xy4-26',energy:{Lightning:1},damage:0},bench:[],discard:[{cardId:'xy4-26'},{cardId:'xy4-42'},{cardId:'xy4-44'},{cardId:'xy4-99'},{cardId:'xy4-11'}]},opponent:{active:{cardId:'xy4-11',damage:0},bench:[],discard:[{cardId:'xy4-44'}]}}};
 const atk={name:'Night March',damage:0,effect:{type:'neoRule',rule:'xy4:nightMarch'}};
 const ctx={state,side:'player',foeSide:'opponent',attacker:state.sides.player.active,defender:state.sides.opponent.active,cardById:id=>cards[id],random:()=>.2,isAttack:true};
 assert.equal(effects.resolveAttack(atk,ctx).damage,60);
 assert.equal(state.log.at(-1).discardedNightMarch,3);
 state.sides.player.discard.pop();state.sides.player.discard.shift();
 assert.equal(effects.resolveAttack(atk,ctx).damage,40);
});

test('CI uses immutable XY4 blob, includes alt prints, and does not ship placeholder cards',{skip:!GENERATED},()=>{
 const rows=JSON.parse(fs.readFileSync(source,'utf8'));
 assert.equal(rows.length,124);
 assert.deepEqual(rows.map(r=>String(r[0])),[...Array.from({length:24},(_,i)=>String(i+1)),'24a',...Array.from({length:41},(_,i)=>String(i+25)),'65a',...Array.from({length:57},(_,i)=>String(i+66))]);
 assert.equal(rows.reduce((n,r)=>n+r[7].length,0),162);
 assert.equal(rows.reduce((n,r)=>n+r[8].length,0),15);
 assert.equal(phantom.CARDS.length,124);
 for(let i=0;i<rows.length;i++){
  const row=rows[i],card=phantom.CARDS[i];
  assert.equal(card.id,'xy4-'+row[0]);assert.equal(card.name,row[1]);
  assert.equal(classic.cardById(card.id),card);
  assert.deepEqual((card.attacks||[]).map(at=>printedCostSymbols(at.cost)),row[7].map(at=>printedCostSymbols(at[1])),card.id+' printed Energy cost');
  if(!card.battleEnabled){assert.equal(card.deckEligible,false,card.id);continue;}
  assert.equal(card.support.status,'FULL',card.id);
  for(const at of card.attacks||[])assert.deepEqual(effects.validateEffect(at.effect),[],card.id+':'+at.name);
  for(const ab of card.abilities||[])assert.deepEqual(effects.validateEffect(ab.effect),[],card.id+':'+ab.name);
  if(card.kind==='trainer')assert.deepEqual(effects.validateEffect(card.effect),[],card.id);
 }
 assert.ok(phantom.CARDS.filter(c=>c.battleEnabled).length>=35,'at least 35 verified battle-ready prints');
 assert.equal(phantom.cardById('xy4-24a').megaEvolution,true);
 assert.equal(phantom.cardById('xy4-65a').pokemonEX,true);
 assert.equal(phantom.cardById('xy4-111').effect.provides.Colorless,2);
 assert.equal(phantom.cardById('xy4-112').deckEligible,true,'Mystery Energy typed, retreat-modifying');
});

test('printed Energy-cost comparison accepts string and array storage, but rejects wrong costs',()=>{
 assert.equal(printedCostSymbols(['G','C']), 'GC');
 assert.equal(printedCostSymbols('GC'), 'GC');
 assert.equal(printedCostSymbols(['C','G']), 'CG');
 assert.notEqual(printedCostSymbols(['G','C']), printedCostSymbols('GG'));
 assert.notEqual(printedCostSymbols(['C','G']), printedCostSymbols('GC'));
 assert.throws(()=>printedCostSymbols({G:1,C:1}),TypeError);
});

test('Phantom Forces random 30-card decks contain only playable registered prints',{skip:!GENERATED},()=>{
 const pool=phantom.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false);
 const owned=pool.map(c=>({gameplayId:c.id,quantity:4}));
 assert.ok(pool.length>=35);
 for(const [style,seed] of [['competitive',3],['random',27]]){
  const result=builder.buildDeck(owned,{sets:['xy4'],style,randomSeed:seed});
  assert.equal(result.ok,true,`${style}: ${result.error||result.errors}`);
  assert.equal(result.cards.length,30);
  assert.ok(result.cards.every(id=>phantom.cardById(id)?.battleEnabled),style+' contains gated card');
 }
});
