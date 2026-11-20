'use strict';
// v0.69.329: a whole-catalogue contract, not a hand-picked Reshiram fix.
// All source costs, battle requirements, icons, AI and builder share strings.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const assetsRoot=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assetsRoot,'tcg-classic-battle-data.js'));
const effects=require(path.join(assetsRoot,'tcgp-battle-effects.js'));
const core=require(path.join(assetsRoot,'tcgp-battle-core.js'));
const ui=require(path.join(assetsRoot,'tcgp-battle-ui.js'));
const art=require(path.join(assetsRoot,'tcgp-ui-assets.js'));
const code=effects.ENERGY_CODE,valid=/^[GRWLPFDMYC]*$/;
const slots=id=>({uid:'audit-'+id,cardId:id,stack:[id],energy:{},specialEnergy:[],conditions:{},damage:0,locks:[]});
function scene(){return {format:'classic',phase:'battle',activeSide:'player',turnNumber:9,rngState:17,log:[],sides:{
 player:{active:slots('bw1-26'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},turnCount:3,energyTypes:Object.values(code),prizes:[]},
 opponent:{active:slots('bw1-26'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},turnCount:3,energyTypes:['Fire'],prizes:[]}
}};}
const attackCards=data.CARDS.filter(c=>c.kind==='pokemon'&&Array.isArray(c.attacks)&&c.attacks.length);
const printed=attackCards.flatMap(card=>card.attacks.map((attack,index)=>({card,attack,index})));

test('the entire registered catalogue has canonical, legal, comma-free printed costs',()=>{
 assert.ok(data.CARDS.length>=6800,'do not silently drop earlier eras');
 assert.ok(printed.length>=9600,'do not silently skip new or old card attacks');
 const eraIds=new Set(attackCards.map(({setId})=>setId));
 assert.ok(eraIds.size>=59,`unexpectedly lost a set (${eraIds.size})`);
 for(const {card,attack} of printed){
  assert.equal(typeof attack.cost,'string',`${card.id} ${attack.name}: every consumer must see normalized cost`);
  assert.match(attack.cost,valid,`${card.id} ${attack.name}: illegal/phantom cost symbols`);
  assert.equal(attack.cost.includes(','),false,`${card.id} ${attack.name}: source arrays must not become CSV`);
 }
});

test('every imported attack is payable with the printed types and never with one fewer Energy unit',()=>{
 for(const {card,attack} of printed){
  const pool={};const chosenColorless='Colorless';
  for(const symbol of attack.cost){const type=symbol==='C'?chosenColorless:code[symbol];pool[type]=Number(pool[type]||0)+1;}
  assert.equal(effects.canPayCost(pool,attack.cost),true,`${card.id} ${attack.name}: enough basic Energy`);
  if(!attack.cost.length)continue;
  const minus={...pool},type=Object.keys(minus)[0];minus[type]--;
  assert.equal(effects.canPayCost(minus,attack.cost),false,`${card.id} ${attack.name}: not enough attached units`);
  const typed=attack.cost.split('').find(x=>x!=='C');
  if(typed){
   const typedPool={...pool},named=code[typed];typedPool[named]--;
   typedPool.Colorless=Number(typedPool.Colorless||0)+1;
   assert.equal(effects.canPayCost(typedPool,attack.cost),false,`${card.id} ${attack.name}: Colourless cannot replace typed`);
  }
 }
});

test('the attack inspection uses precisely the same number and type of icons as the paid cost',()=>{
 for(const {card,attack} of printed){
  const html=ui._test.energyCostHtml(attack.cost);
  if(!attack.cost.length){assert.match(html,/No Energy/,card.id);continue;}
  const icons=[...html.matchAll(/class="tcgp-energy-icon cost" data-energy="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(icons.length,attack.cost.length,`${card.id} ${attack.name}: phantom/missing icon`);
  assert.deepEqual(icons,[...attack.cost].map(s=>code[s]||'Colorless'),`${card.id} ${attack.name}: wrong icon type`);
  assert.doesNotMatch(core.energyCostLabel(attack.cost),/\bundefined\b|,/,`${card.id} ${attack.name}: invalid attached cost description`);
 }
});

test('every Classic attack supports battle cost inspection, including dynamic costs',()=>{
 const state=scene();let count=0;
 for(const {card,attack,index} of printed){
  state.sides.player.active=slots(card.id);
  const availability=core.attackAvailability(state,'player',index);
  assert.match(availability.cost,valid,`${card.id} ${attack.name}: wrong runtime cost`);
  assert.ok(Array.isArray(availability.cost)===false,card.id);
  count++;
 }
 assert.equal(count,printed.length);
});

test('official pinned print-source costs still equal every registered attack (where source is bundled)',()=>{
 const directory=path.resolve(__dirname,'../data/classic'),map={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Fairy:'Y',Colorless:'C'};
 let verifiedAttacks=0,verifiedSets=0;
 for(const filename of fs.readdirSync(directory).filter(f=>/^(?:bw\d+|hgss\d+|col1|xy[12])-print-compact\.json$/.test(f))){
  const setId=filename.split('-print')[0],rows=JSON.parse(fs.readFileSync(path.join(directory,filename),'utf8'));
  verifiedSets++;
  for(const row of rows){
   const id=setId+'-'+row[0],card=data.cardById(id);
   if(!card||!Array.isArray(card.attacks))continue;
   const sourceAttacks=row[7]||[];
   assert.equal(card.attacks.length,sourceAttacks.length,`${id} source move count`);
   for(const [index,source] of sourceAttacks.entries()){
    const [name,raw]=source;
    const expected=Array.isArray(raw)?raw.map(x=>map[x]||x).join(''):raw;
    assert.equal(card.attacks[index].name,name,`${id} printed attack name`);
    assert.equal(card.attacks[index].cost,expected,`${id} ${name} canonical print energy`);
    verifiedAttacks++;
   }
  }
 }
 assert.ok(verifiedSets>=15,`missing historical print fixtures: ${verifiedSets}`);
 assert.ok(verifiedAttacks>=2400,`insufficient officially source-matched moves: ${verifiedAttacks}`);
});

test('mixed Colourless, Double Colorless, Fairy, Prism and Blend energy remain distinct',()=>{
 for(const type of Object.values(code)){
  if(type==='Colorless')continue;
  assert.equal(effects.canPayCost({[type]:2},'CC'),true,`${type} must pay Colourless`);
  assert.equal(effects.canPayCost({Colorless:2},Object.keys(code).find(k=>code[k]===type)),false,`${type} cannot be paid by Colourless`);
 }
 assert.equal(effects.canPayCost({Fire:2,Water:1},'RRC'),true);
 assert.equal(effects.canPayCost({Fire:1,Colorless:2},'RRC'),false);
 const state=scene();state.sides.player.active.specialEnergy=[{uid:'dce-1',cardId:'base1-96'}];
 let effective=core.effectiveEnergy(state,'player',state.sides.player.active);
 assert.equal(effective.Colorless,2,'Double Colorless provides exactly two Colourless units');
 assert.equal(effects.canPayCost(effective,'CC'),true);
 assert.equal(effects.canPayCost(effective,'RR'),false);
 state.sides.player.active.energy.Fire=2;
 effective=core.effectiveEnergy(state,'player',state.sides.player.active);
 assert.equal(effects.canPayCost(effective,'RRC'),true);
 assert.equal(art.normalise('Y'),'Fairy');
 assert.match(art.energyIconHtml('Fairy'),/data-energy="Fairy"/);
 assert.match(ui._test.energyCostHtml('YYC'),/data-energy="Fairy"/);
 assert.equal(art.energyCardId('Fairy'),'xy1-140');
});
