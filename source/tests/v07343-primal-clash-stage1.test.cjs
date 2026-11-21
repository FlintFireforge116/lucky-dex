'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const classic=require(path.join(assets,'tcg-classic-battle-data.js'));
const primal=require(path.join(assets,'tcg-classic-primal-clash.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const opponent=require(path.join(assets,'tcg-classic-opponents.js'));
const picker=require(path.join(assets,'tcg-classic-set-picker.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const source=path.join(root,'data/classic/xy5-print-compact.json');
const GENERATED=fs.existsSync(source);
const symbols=c=>Array.isArray(c)?c.join(''):String(c??'');

test('XY Primal Clash is visible in player, CPU, set picker and HTML registry',()=>{
 assert.equal(primal.SET.id,'xy5');assert.equal(primal.SET.name,'Primal Clash');
 assert.equal(primal.SET.printedTotal,164);assert.equal(primal.SET.cardCount,160);
 assert.equal(picker.names.xy5,'Primal Clash');
 assert.ok(classic.SETS.some(x=>x.id==='xy5'));
 assert.ok(builder.SET_IDS.includes('xy5'));assert.ok(opponent.SETS.includes('xy5'));
 assert.equal(classic.coverage().primalClash.printed,primal.coverage().printed);
 const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
 assert.match(html,/<script src="tcg-classic-primal-clash\.js"><\/script>/);
 assert.ok(html.indexOf('tcg-classic-primal-clash.js')<html.indexOf('tcg-classic-battle-data.js'));
});

test('XY5 pinned generated source and audit are required BEFORE Android asset merge',()=>{
 const build=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 const m=build.match(/versionName '0\.69\.(\d+)'/),c=build.match(/versionCode\s+(\d+)/);
 assert.ok(m&&c);const n=Number(m[1]);assert.ok(n>=343);assert.equal(Number(c[1]),7000+n);
 const v=`0.69.${n}`;
 const html=fs.readFileSync(path.join(assets,'index.html'),'utf8'),boot=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
 assert.ok(html.includes(`titleBuildVersion">v${v}`));
 assert.ok(html.includes(`appBuildVersion">LUCKY DEX · v${v}`));
 assert.ok(boot.includes(`window.__LUCKYDEX_BUILD='${v}'`));
 for(const x of ["generateXY5ForApk","auditXY5ForApk"])assert.ok(build.includes(`tasks.register('${x}'`));
 assert.match(build,/auditV07329AllClassicAttackEnergyForApk'\)\.configure\s*\{\s*dependsOn tasks\.named\('auditXY5ForApk'/);
 const script=fs.readFileSync(path.join(root,'scripts/build-xy5.py'),'utf8');
 assert.ok(script.includes('38a427242a56d0e9bcd4450718d1f5ae28377f82'));
});

test('XY5 generator exposes audited Ancient Traits and gates all unsupported effects',()=>{
 const code=String.raw`
import sys,json,importlib.util
s=sys.argv[1];sys.path.insert(0,s)
spec=importlib.util.spec_from_file_location('buildxy5',s+'/build-xy5.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def row(n,name,sup='Pokémon',sub=None,types=None,att=None,ab=None,trait=None,ev=None):
 return [str(n),name,sup,sub or (['Basic'] if sup=='Pokémon' else ['Item']),80,types or (['Grass'] if sup=='Pokémon' else []),ev,att or [],ab or [],None,None,1,'Common',[],None,trait]
rows=[
 row(3,'Beedrill',sub=['Stage 2'],att=[['Twineedle',['G','C'],'50×','Flip 2 coins. This attack does 50 damage times the number of heads.']]),
 row(4,'Tangela',att=[['Absorb',['G'],'20','Heal 20 damage from this Pokémon.']]),
 row(9,'Sceptile',trait={'name':'Ω Barrier','text':'Prevent Trainer effects on this Pokémon'},att=[['Leaf Blade',['G'],'30+','Flip a coin. If heads, this attack does 30 more damage.']]),
 row(21,'Ninetales',ab=[['Barrier Shrine','Ability','No Stadium cards may be played.']],att=[['Flickering Flames',['R'],'70',"Your opponent's Active Pokémon is now Asleep."]]),
 row(55,'Primal Kyogre-EX',sub=['MEGA','EX'],types=['Water'],ev='Kyogre-EX',trait={'name':'α Growth','text':'Attach additional Energy'},att=[['Tidal Storm',['W','C'],'150','Move 2 Energy from this Pokémon to 1 of your Benched Pokémon.']]),
 row(125,'Dive Ball','Trainer',['Item']),row(129,'Fresh Water Set','Trainer',['Item']),
 row(135,'Rare Candy','Trainer',['Item']),row(143,'Shield Energy','Energy',['Special']),
 row(161,'Dive Ball','Trainer',['Item']),row(164,'Weakness Policy','Trainer',['Pokémon Tool']),
]
print(json.dumps(m.generate(rows)))`;
 const r=spawnSync('python3',['-c',code,path.join(root,'scripts')],{encoding:'utf8',maxBuffer:1024*1024});
 assert.equal(r.status,0,r.stderr||r.stdout);
 const by=Object.fromEntries(JSON.parse(r.stdout).map(c=>[c.number,c]));
 for(const n of ['3','4','125','129','135','161'])assert.equal(by[n].battleEnabled,true,`${n}: ${by[n].support.reasons}`);
 for(const n of ['9']){
  assert.equal(by[n].battleEnabled,false,n);assert.equal(by[n].deckEligible,false,n);
  assert.ok(by[n].support.reasons.length>0,n);
 }
 for(const n of ['55','164'])assert.equal(by[n].battleEnabled,true,n+' new printed mechanics implemented');
 assert.equal(by['21'].battleEnabled,true,'Barrier Shrine is implemented');
 assert.equal(by['21'].abilities[0].name,'Barrier Shrine');
 assert.equal(by['143'].battleEnabled,true,'Shield Energy typed passive is implemented');
 assert.deepEqual(by['143'].effect,{type:'specialEnergy',provides:{Metal:1}});
 assert.equal(by['55'].megaEvolution,true);assert.equal(by['55'].pokemonEX,true);assert.equal(by['55'].prizeCards,2);
 assert.deepEqual(by['3'].attacks[0].cost,['G','C']);
 assert.equal(by['3'].attacks[0].damage,0,'50× is dynamic, never a flat 50');
 assert.equal(by['3'].attacks[0].effect.type,'coinDamage');
 assert.equal(by['125'].effect.filter.subtype,'Water');
 for(const c of Object.values(by).filter(c=>c.battleEnabled)){
  for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+' '+a.name);
  if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
 }
});

test('Official pinned Primal Clash print source has 164 unique cards and exactly correct costs and traits',{skip:!GENERATED},()=>{
 const rows=JSON.parse(fs.readFileSync(source,'utf8'));
 assert.equal(rows.length,164);assert.deepEqual(rows.map(x=>String(x[0])),Array.from({length:164},(_,i)=>String(i+1)));
 assert.equal(rows.reduce((n,r)=>n+r[7].length,0),217);
 assert.equal(rows.reduce((n,r)=>n+r[8].length,0),13);
 assert.equal(rows.filter(r=>r[15]).length,22);
 assert.equal(primal.CARDS.length,164,'shipping the stub is forbidden');
 for(let i=0;i<rows.length;i++){
  const row=rows[i],card=primal.CARDS[i];
  assert.equal(card.id,'xy5-'+row[0]);assert.equal(card.name,row[1]);
  assert.equal(classic.cardById(card.id),card);
  assert.deepEqual((card.attacks||[]).map(a=>symbols(a.cost)),row[7].map(a=>symbols(a[1])),`${card.id} Energy costs`);
  assert.equal(!!card.ancientTrait,!!row[15],`${card.id} Ancient Trait`);
  if(!card.battleEnabled){assert.equal(card.deckEligible,false,card.id);continue;}
  assert.equal(card.support.status,'FULL');
  for(const a of card.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],`${card.id} ${a.name}`);
  if(card.kind==='trainer')assert.deepEqual(effects.validateEffect(card.effect),[],card.id);
 }
 assert.ok(primal.CARDS.filter(c=>c.battleEnabled).length>=40,'At least 40 cards with verified mechanics');
 for(const n of ['55','86','94','106','149','151','154','156']){
  const c=primal.cardById('xy5-'+n);assert.ok(c.megaEvolution);assert.ok(c.pokemonEX);
 }
 for(const n of ['143','144'])assert.equal(primal.cardById('xy5-'+n).deckEligible,true,'Both typed XY5 Special Energies are implemented');
});

test('XY5 prints are owner-projected by exact collector number, not substituted by older expansions',{skip:!GENERATED},()=>{
 const owned=[{id:'library:xy5/005',setId:'xy5',number:'5',quantity:2},
              {id:'library:xy5/155',setName:'Primal Clash',number:'155',quantity:1}];
 const projected=classic.projectOwnedCards(owned);
 assert.ok(projected.some(x=>x.gameplayId==='xy5-5'&&x.quantity===2));
 assert.ok(projected.some(x=>x.gameplayId==='xy5-155'&&x.quantity===1));
});

test('Primal Clash competitive and random 30-card decks use only supported effects',{skip:!GENERATED},()=>{
 const pool=primal.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false);
 assert.ok(pool.length>=40);
 const owned=pool.map(c=>({gameplayId:c.id,quantity:4}));
 for(const [style,seed] of [['competitive',3],['random',24]]){
  const result=builder.buildDeck(owned,{sets:['xy5'],style,randomSeed:seed});
  assert.equal(result.ok,true,`${style}: ${(result.errors||[]).join('; ')}`);
  assert.equal(result.cards.length,30,style);
  assert.ok(classic.validateDeck(result.cards).ok,style);
  for(const id of result.cards){
   const card=classic.cardById(id);
   assert.ok(card?.battleEnabled&&card?.deckEligible!==false,`${style}: ${id} not playable`);
  }
 }
});
