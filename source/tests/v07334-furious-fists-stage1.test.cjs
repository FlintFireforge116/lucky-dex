'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const classic=require(path.join(assets,'tcg-classic-battle-data.js'));
const furious=require(path.join(assets,'tcg-classic-furious-fists.js'));
const picker=require(path.join(assets,'tcg-classic-set-picker.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(assets,'tcg-classic-opponents.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const source=path.join(root,'data/classic/xy3-print-compact.json');
const GENERATED=fs.existsSync(source);

test('Furious Fists is registered for player decks, CPU opponents, inspector, and app boot',()=>{
 assert.equal(furious.SET.id,'xy3');assert.equal(furious.SET.printedTotal,114);
 assert.equal(furious.SET.cardCount,113);
 assert.ok(classic.SETS.some(s=>s.id==='xy3'));
 assert.ok(builder.SET_IDS.includes('xy3'));
 assert.ok(opponents.SETS.includes('xy3'));
 assert.equal(picker.names.xy3,'Furious Fists');
 assert.equal(classic.coverage().furiousFists.printed,furious.coverage().printed);
 const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
 assert.ok(html.includes('<script src="tcg-classic-furious-fists.js"></script>'));
 assert.ok(html.indexOf('tcg-classic-furious-fists.js')<html.indexOf('tcg-classic-battle-data.js'));
});
test('v0.69.336 is consistent in Android, title, and boot JS',()=>{
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 assert.match(gradle,/versionCode 7336/);
 assert.match(gradle,/versionName '0\.69\.336'/);
 assert.match(fs.readFileSync(path.join(assets,'index.html'),'utf8'),/titleBuildVersion">v0\.69\.336/);
 assert.match(fs.readFileSync(path.join(assets,'index.html'),'utf8'),/appBuildVersion">LUCKY DEX · v0\.69\.336/);
 assert.match(fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8'),/window\.__LUCKYDEX_BUILD='0\.69\.336'/);
});
test('build includes immutable XY3 generation BEFORE full catalogue audit and assets',()=>{
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 assert.match(gradle,/tasks\.register\('generateXY3ForApk'/);
 assert.match(gradle,/tasks\.register\('auditXY3ForApk'/);
 assert.match(gradle,/auditV07329AllClassicAttackEnergyForApk'\)\.configure \{\s*dependsOn tasks\.named\('auditXY3ForApk'/);
 const script=fs.readFileSync(path.join(root,'scripts/build-xy3.py'),'utf8');
 assert.match(script,/9996bfa724c3d7fc23c9fcc31341cd521311ecb1/);
 assert.match(script,/xy3-print-compact\.json/);
});

test('pinned official 114 prints are conserved, and unsupported rules do not masquerade as playable',{skip:!GENERATED},()=>{
 const rows=JSON.parse(fs.readFileSync(source,'utf8'));
 assert.equal(rows.length,114);assert.equal(furious.CARDS.length,114);
 assert.equal(rows.reduce((sum,row)=>sum+row[7].length,0),159);
 assert.equal(rows.reduce((sum,row)=>sum+row[8].length,0),14);
 assert.deepEqual(rows.map(row=>String(row[0])),[...Array.from({length:55},(_,i)=>String(i+1)),'55a',...Array.from({length:58},(_,i)=>String(i+56))]);
 for(let i=0;i<rows.length;i++){
  const row=rows[i],card=furious.CARDS[i];
  assert.equal(card.id,'xy3-'+row[0]);assert.equal(card.name,row[1]);
  assert.equal(classic.cardById(card.id),card);
  assert.equal(card.attacks?.length||0,row[7].length);
  if(!card.battleEnabled){assert.equal(card.deckEligible,false,card.id);continue;}
  assert.ok(card.deckEligible,card.id);
  assert.equal(card.support.status,'FULL',card.id);
  for(const attack of card.attacks||[]){assert.deepEqual(effects.validateEffect(attack.effect),[],card.id+':'+attack.name);assert.notEqual(attack.effect.type,'unsupported',card.id);}
  for(const ability of card.abilities||[])assert.deepEqual(effects.validateEffect(ability.effect),[],card.id+':'+ability.name);
  if(card.kind==='trainer')assert.deepEqual(effects.validateEffect(card.effect),[],card.id);
 }
 const mega=furious.cardById('xy3-55a');assert.equal(mega.name,'M Lucario-EX');
 assert.equal(mega.pokemonEX,true);assert.equal(mega.megaEvolution,true);assert.equal(mega.prizeCards,2);
 for(const [id,type] of [['xy3-103','Grass'],['xy3-104','Fighting']]){const card=furious.cardById(id);assert.equal(card.battleEnabled,true,id);assert.deepEqual(card.effect.provides,{[type]:1});}
 assert.ok(furious.CARDS.filter(c=>c.battleEnabled).length>=30,'at least 30 prints should be playable in stage1');
});

test('formerly restricted Fighter, Fossil, Tool, and Special Energy prints are now implemented',{skip:!GENERATED},()=>{
 for(const n of ['1','4','5','9','14','18','25','26','30','31','32','40','46','52','55','55a','58','59','61','62','63','64','68','72','73','74','76','77','79','80','84','85','90','91','92','94','95','96','97','98','99','101','102','103','104','105','106','108','110','111','112','113']){
  const c=furious.cardById('xy3-'+n);assert.ok(c);assert.equal(c.battleEnabled,true,c.id+': '+c.support.reasons?.join('; '));
 }
 assert.equal(furious.cardById('xy3-36')?.battleEnabled,true,'Hypno Hand Control must be genuinely resolved');
});

test('offline rule-mapping smoke: real attacker effect schemas and unsupported print gating',()=>{
 // This works even before the official 114-print source is generated. The
 // generated-catalogue audit above runs again with ALL real cards on GitHub.
 const python=String.raw`
import importlib.util,json,sys
sys.path.insert(0,sys.argv[1])
sp=importlib.util.spec_from_file_location('xy3builder',sys.argv[1]+'/build-xy3.py')
m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
def row(n,name,typ='Pokémon',sub=None,attacks=None,abilities=None):
 return [str(n),name,typ,sub if sub is not None else (['Basic'] if typ=='Pokémon' else ['Item']),90,['Fighting'] if typ=='Pokémon' else [],None,attacks or [],abilities or [],None,None,1,'Common',[],None]
rows=[
 row(54,'Lucario-EX',sub=['Basic','EX'],attacks=[['Missile Jab',['F'],'30',"This attack's damage isn't affected by Resistance."],['Corkscrew Smash',['F','C'],'60','You may draw cards until you have 6 cards in your hand.'],['Somersault Kick',['F','F','C'],'100','']]),
 row(56,'Mienfoo',attacks=[['Flop',['C'],'10',''],['Lunge',['F','C'],'30','Flip a coin. If tails, this attack does nothing.']]),
 row(60,'Pancham',attacks=[['Comet Punch',['F'],'10×','Flip 4 coins. This attack does 10 damage times the number of heads.']]),
 row(75,'Vibrava',attacks=[['Charge Energy',[],'','Search your deck for up to 2 basic Energy cards, reveal them, and put them into your hand. Shuffle your deck afterward.'],['Vibration',['F'],'30','']]),
 row(78,'Lickitung',attacks=[['Lunge',['C'],'50','Flip a coin. If tails, this attack does nothing.']]),
 row(87,'Noibat',attacks=[['Tackle',['C'],'10',''],['Gust',['C','C'],'20','']]),
 row(5,'M Heracross-EX',sub=['MEGA','EX'],attacks=[['Big Bang Horn',['G','G'],'180-','This attack does 180 damage minus 10 damage for each damage counter on this Pokémon.']]),
 row(112,'M Heracross-EX',sub=['MEGA','EX'],attacks=[['Big Bang Horn',['G','G'],'180-','This attack does 180 damage minus 10 damage for each damage counter on this Pokémon.']]),
 row(55,'M Lucario-EX',sub=['MEGA','EX'],attacks=[['Rising Fist',['F','F','F'],'140',"Discard an Energy attached to your opponent's Active Pokémon."]]),
 row(1,'Bellsprout',attacks=[['Knock Off',['G','C'],'','Discard a random card from your opponent\'s hand.']]),
 row(89,'Energy Switch','Trainer',sub=['Item']),
 row(103,'Herbal Energy','Energy',sub=['Special']),
 row(104,'Strong Energy','Energy',sub=['Special']),
]
print(json.dumps(m.generate(rows)))`;
 const output=spawnSync('python3',['-c',python,path.join(root,'scripts')],{encoding:'utf8',maxBuffer:1024*1024});
 assert.equal(output.status,0,output.stderr||output.stdout);
 const cards=JSON.parse(output.stdout),by=n=>cards.find(c=>c.id===`xy3-${n}`);
 for(const n of ['54','56','60','75','78','87','89']){
  const card=by(n);assert.equal(card.battleEnabled,true,`${n}: ${card.support.reasons}`);
  for(const move of card.attacks||[])assert.deepEqual(effects.validateEffect(move.effect),[],`${card.name}: ${move.name}`);
  if(card.kind==='trainer')assert.deepEqual(effects.validateEffect(card.effect),[],card.name);
 }
 for(const n of ['1','5','55','112','103','104'])assert.equal(by(n).battleEnabled,true,n+' now has a real effect');
 assert.equal(by('54').pokemonEX,true);
 assert.equal(by('5').attacks[0].damage,180);
 assert.equal(by('60').attacks[0].damage,0);
 assert.deepEqual(by('60').attacks[0].effect,{type:'coinDamage',coins:4,amount:10,mode:'replace'});
 assert.equal(by('75').attacks[0].effect.rule,'xy1:professorsLetter','Basic Energy searches must use the Energy Zone choice adapter');
 assert.equal(by('89').effect.rule,'aquapolis:energySwitch');
});


test('official Furious Fists source supports real 30-card legal single-set builds',{skip:!GENERATED},()=>{
 const playable=furious.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false);
 const owned=playable.map(c=>({gameplayId:c.id,quantity:4}));
 assert.ok(playable.length>=30,'new stage must contain enough real battle-ready prints for legal decks');
 for(const [style,randomSeed] of [['competitive',3],['random',24]]){
  const result=builder.buildDeck(owned,{sets:['xy3'],style,randomSeed});
  assert.equal(result.ok,true,`Furious Fists ${style}: ${result.errors||result.error}`);
  assert.equal(result.cards.length,30,`Furious Fists ${style}: exact 30-card format`);
  assert.deepEqual(result.cards.filter(id=>!furious.cardById(id)?.deckEligible),[],`no gated print in ${style}`);
  const d=require(path.join(assets,'tcg-classic-decks.js'));
  assert.equal(d.validateDraft(result.cards,owned,{requireFull:true}).ok,true,`Furious Fists ${style} legal card ownership`);
  assert.deepEqual(d.analyzeDeck(result.cards,result.energyTypes).missingEnergyTypes,[],`Furious Fists ${style} attack Energy`);
 }
});
