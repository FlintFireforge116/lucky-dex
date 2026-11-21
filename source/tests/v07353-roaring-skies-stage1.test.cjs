'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const cards=require(path.join(assets,'tcg-classic-battle-data.js'));
const sky=require(path.join(assets,'tcg-classic-roaring-skies.js'));
const picker=require(path.join(assets,'tcg-classic-set-picker.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const source=path.join(root,'data/classic/xy6-print-compact.json');
const GENERATED=fs.existsSync(source);
const symbols=c=>Array.isArray(c)?c.join(''):String(c||'');
const expected=[...Array.from({length:77},(_,i)=>String(i+1)),'77a',
 ...Array.from({length:15},(_,i)=>String(i+78)),'92a',
 ...Array.from({length:18},(_,i)=>String(i+93))];

test('Roaring Skies set appears in player, opponent, pack selection and registry',()=>{
 assert.equal(sky.SET.id,'xy6');assert.equal(sky.SET.name,'Roaring Skies');
 assert.equal(sky.SET.cardCount,110);assert.equal(sky.SET.printedTotal,112);
 assert.equal(picker.names.xy6,'Roaring Skies');
 assert.ok(cards.SETS.some(s=>s.id==='xy6'));
 assert.ok(builder.SET_IDS.includes('xy6'));
 assert.ok(cpu.SETS.includes('xy6'));
 const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
 assert.match(html,/<script src="tcg-classic-roaring-skies\.js"><\/script>/);
 assert.ok(html.indexOf('tcg-classic-roaring-skies.js')<html.indexOf('tcg-classic-battle-data.js'));
});

test('APK generation is CI-gated: source pin, version, prebuild audit',()=>{
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 // Do not pin the Stage 1 regression to a Stage 1–3 release number.
 // Every later XY6 patch must keep Gradle and the boot assets in sync.
 const code=Number(gradle.match(/versionCode\s+(\d+)/)?.[1]);
 const version=gradle.match(/versionName '([^']+)'/)?.[1];
 assert.match(version||'',/^0\.69\.\d+$/);
 assert.equal(code,7000+Number(version.split('.')[2]));
 for(const target of ['generateXY6ForApk','auditXY6ForApk'])
  assert.ok(gradle.includes(`tasks.register('${target}'`));
 assert.match(gradle,/dependsOn tasks.named\('auditXY6ForApk'\)/);
 const script=fs.readFileSync(path.join(root,'scripts/build-xy6.py'),'utf8');
 assert.ok(script.includes('5eab0c0148a5cb52dd7005628aa61c793ec0d930'));
 assert.ok(script.includes('load_pinned_set'));
 assert.ok(script.includes('!=112')&&script.includes('!=147')&&script.includes('!=15')&&script.includes('!=12'));
 assert.ok(fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8').includes(`window.__LUCKYDEX_BUILD='${version}'`));
});

test('Stage 1 verifier can validate every FULL attack and Trainer without faking Delta rules',()=>{
 const code=String.raw`
import importlib.util,json,sys
p=sys.argv[1];sys.path.insert(0,p)
import xy6_verified as v
spec=importlib.util.spec_from_file_location('buildxy6',p+'/build-xy6.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def row(n,name,att=None,trait=None,sup='Pokémon',sub=None,ab=None):
 return [str(n),name,sup,sub if sub is not None else (['Basic'] if sup=='Pokémon' else ['Item']),80,['Grass'] if sup=='Pokémon' else [],None,att or [],ab or [],None,None,1,'Rare',[],None,trait]
rows=[
 row(1,'Exeggcute',[['Loathe',['G'],'','Flip a coin. If heads, switch this Pokémon with 1 of your Benched Pokémon.'],['Ram',['C'],'10','']]),
 row(2,'Exeggutor',[['Shake It Off',['C'],'20×','This attack does 20 damage times the number of Colorless Pokémon your opponent has in play.']]),
 row(8,'Dustox',[['Flap',['G'],'20','']],{'name':'Δ Plus','text':'Additional Prize'}),
 row(17,'Articuno',[['Chilling Sigh',['W'],'','']],{'name':'Δ Plus','text':'Additional Prize'}),
 row(32,'Banette',[['Evolution Jammer',['P'],'20','']],{'name':'Δ Evolution','text':'Early Evolution'}),
 row(61,'M Rayquaza-EX',[['Dragon Ascent',['R','R'],'300','Discard 2 Energy attached to this Pokémon.']],{'name':'Δ Wild','text':'Damage reduction'},sub=['MEGA','EX']),
 row(77,'Shaymin-EX',[['Sky Return',['C'],'30','Return this Pokémon and all cards attached to it to your hand.']],ab=[['Set Up','Ability','Draw to 6']]),
 row('77a','Shaymin-EX',[['Sky Return',['C'],'30','Return this Pokémon and all cards attached to it to your hand.']],ab=[['Set Up','Ability','Draw to 6']]),
 row(83,'Gallade Spirit Link',sup='Trainer',sub=['Pokémon Tool']),
 row(88,'Revive',sup='Trainer',sub=['Item']),
 row(91,'Switch',sup='Trainer',sub=['Item']),
 row(92,'Trainers\' Mail',sup='Trainer',sub=['Item']),
 row('92a','Trainers\' Mail',sup='Trainer',sub=['Item']),
 row(93,'Ultra Ball',sup='Trainer',sub=['Item']),
 row(97,'Double Dragon Energy',sup='Energy',sub=['Special']),
 row(110,'VS Seeker',sup='Trainer',sub=['Item']),
]
print(json.dumps({'cards':m.generate(rows),'effectMap':list(v.ATTACKS.values()),'trainerEffects':[x[1] for x in v.TRAINERS.values()]}))`;
 const r=spawnSync('python3',['-c',code,path.join(root,'scripts')],{encoding:'utf8',maxBuffer:2**22});
 assert.equal(r.status,0,r.stderr||r.stdout);
 const output=JSON.parse(r.stdout),by=Object.fromEntries(output.cards.map(c=>[c.id,c]));
 for(const n of ['1','2','83','88','91','93','110'])assert.equal(by['xy6-'+n].battleEnabled,true,n+': '+by['xy6-'+n].support.reasons.join(';'));
 for(const n of ['8','17','32','61'])assert.equal(by['xy6-'+n].battleEnabled,true,n+' should now be enabled');
 for(const n of ['77','77a','97'])assert.equal(by['xy6-'+n].battleEnabled,true,n+' is now implemented');
 for(const n of ['92','92a'])assert.equal(by['xy6-'+n].battleEnabled,true,n+' now has top-four selection');
 assert.deepEqual(by['xy6-77'].attacks.map(a=>a.name),by['xy6-77a'].attacks.map(a=>a.name));
 assert.equal(by['xy6-61'].megaEvolution,true);
 assert.equal(by['xy6-61'].prizeCards,2);
 assert.equal(by['xy6-2'].attacks[0].damage,0,'dynamic count must not flatten 20× to 20');
 for(const c of output.cards.filter(c=>c.battleEnabled)){
  for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],`${c.id} ${a.name}`);
  if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
 }
 for(const e of [...output.effectMap,...output.trainerEffects])assert.deepEqual(effects.validateEffect(e),[],JSON.stringify(e));
});

test('Roaring Skies official source has every unique print, costs and traits',{skip:!GENERATED},()=>{
 const rows=JSON.parse(fs.readFileSync(source,'utf8'));
 assert.deepEqual(rows.map(r=>String(r[0])),expected);
 assert.equal(rows.reduce((n,r)=>n+r[7].length,0),147);
 assert.equal(rows.reduce((n,r)=>n+r[8].length,0),15);
 assert.equal(rows.filter(r=>r[15]).length,12);
 assert.equal(sky.CARDS.length,112,'APK must not ship empty source placeholder');
 assert.equal(new Set(sky.CARDS.map(c=>c.id)).size,112);
 for(let i=0;i<112;i++){
  const raw=rows[i],c=sky.CARDS[i];assert.equal(c.id,'xy6-'+raw[0]);assert.equal(c.name,raw[1]);
  assert.deepEqual((c.attacks||[]).map(a=>symbols(a.cost)),raw[7].map(a=>symbols(a[1])),c.id);
  assert.equal(cards.cardById(c.id),c);
  if(!c.battleEnabled)assert.equal(c.deckEligible,false,c.id);
  else{
   for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],`${c.id} ${a.name}`);
   if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
  }
 }
 assert.ok(sky.coverage().battleEnabled>=40,'first batch should have at least 40 playable prints');
});

test('Roaring Skies owner print projection differentiates 77a and 92a',{skip:!GENERATED},()=>{
 const found=cards.projectOwnedCards([
  {setId:'xy6',number:'77',quantity:1},
  {setId:'xy6',number:'77a',quantity:2},
  {setId:'xy6',number:'92a',quantity:1},
 ]);
 for(const n of ['77','77a','92a'])assert.ok(found.some(c=>c.gameplayId==='xy6-'+n),n);
});

test('Roaring Skies deck builder only selects eligible supported cards',{skip:!GENERATED},()=>{
 const pool=sky.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false);
 assert.ok(pool.length>=40);
 const result=builder.buildDeck(pool.map(c=>({gameplayId:c.id,quantity:4})),{sets:['xy6'],style:'random',randomSeed:353});
 assert.equal(result.ok,true,(result.errors||[]).join('; '));
 assert.equal(result.cards.length,30);assert.ok(cards.validateDeck(result.cards).ok);
 for(const id of result.cards)assert.equal(cards.cardById(id)?.battleEnabled,true,id);
});
