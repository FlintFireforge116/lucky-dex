'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const set=require(path.join(assets,'tcg-classic-plasma-freeze.js'));
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const C=n=>set.cardById('bw9-'+n),ref=(id,uid)=>({cardId:id,uid:uid||id});
const mon=(id,uid)=>({...core.makePokemonSlot(id,1,uid||id),benchSlot:0,damage:0,tool:null,extraTools:[],energy:{},specialEnergy:[],conditions:{}});
function scene(){const make=()=>({active:mon('bw9-1'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energySupply:[],prizes:[ref('bw9-1')],prizesTaken:0,turnCount:3,handLimit:8,benchLimit:3,trainerUsed:false,supporterUsed:false});return {format:'classic',phase:'battle',activeSide:'player',turnNumber:7,stadium:null,sides:{player:make(),opponent:make()},rules:{benchSize:3,winMode:'prizes'},log:[],rngState:1};}
function resolve(s,n,attackName,action={}){const attack=C(n)?.attacks.find(a=>a.name===attackName);assert.ok(attack,`${n} missing ${attackName}`);return fx.resolveAttack(attack,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action,isAttack:true,random:()=>.1,effectiveEnergy:p=>p.energy,retreatCost:()=>2});}
function fire(s,e,opts={}){let choice=null;fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action:opts.action||{},isAttack:!!opts.isAttack,resolvingChoice:!!opts.resume,requestChoice:x=>choice=x,random:()=>.1,shuffle:(_s,deck)=>deck.reverse(),drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r;},onEnergyAttached:()=>{},...opts.ctx});return choice;}
const E=k=>({type:'neoRule',rule:'bw9:'+k});
test('BW9 exact pinned catalogue, attack and ability print conservation, explicit gates',()=>{
 const source=JSON.parse(fs.readFileSync(path.join(root,'data/classic/bw9-print-compact.json'),'utf8'));
 assert.equal(source.length,122);assert.equal(set.CARDS.length,122);
 assert.deepEqual(set.CARDS.map(c=>c.number),Array.from({length:122},(_,i)=>String(i+1)));
 assert.equal(set.coverage().battleEnabled,119);assert.deepEqual(set.coverage().gated,['bw9-4','bw9-56','bw9-94']);
 for(let i=0;i<122;i++){const card=set.CARDS[i];assert.equal(card.name,source[i][1]);assert.strictEqual(data.cardById(card.id),card);assert.equal((card.attacks||[]).length,source[i][7].length);assert.equal((card.abilities||[]).length,source[i][8].length);assert.equal(card.deckEligible,card.battleEnabled);if(card.battleEnabled)for(const a of card.attacks||[])assert.notEqual(a.effect.type,'unsupported');}
 assert.equal(source.reduce((n,x)=>n+x[7].length,0),175);
 assert.equal(source.reduce((n,x)=>n+x[8].length,0),17);
});
test('secret rares, ACE SPEC and physical Plasma Energy preserve identifiers',()=>{
 assert.equal(C(109).name,'Heatran-EX');assert.equal(C(122).name,'Ultra Ball');
 assert.equal(C(106).kind,'energy');assert.equal(C(106).specialEnergy,true);assert.equal(C(106).effect.provides.Colorless,1);
 assert.equal(C(107).aceSpec,true);assert.equal(C(108).aceSpec,true);assert.equal(C(107).maxDeckCopies,1);
 assert.equal(C(118).tags.includes('secret-rare'),true);
 for(const n of [13,38,53,85,98,109,110,111,112,114])assert.equal(C(n).prizeCards,2);
});
test('Hail hits Active for 10 and queues Bench damage; not just Bench',()=>{
 const s=scene();s.sides.player.active=mon('bw9-66');s.sides.opponent.active=mon('bw9-1');s.sides.opponent.bench=[mon('bw9-2')];
 const r=resolve(s,66,'Hail');assert.equal(r.damage,10);assert.equal(r.pendingEffects.length,1);
 fire(s,r.pendingEffects[0],{isAttack:true});assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('Deoxys-EX Helix Force counts physical Plasma and defending Energy',()=>{
 const s=scene();s.sides.player.active=mon('bw9-53');s.sides.opponent.active=mon('bw9-1');s.sides.opponent.active.energy.Grass=2;
 assert.equal(resolve(s,53,'Helix Force').damage,30);
 s.sides.player.active.specialEnergy=[ref('bw9-106','energy-physical')];
 assert.equal(resolve(s,53,'Helix Force').damage,90);
});
test('Weavile Vilify choices distinguish 0, 1 and 2 physical hand Pokemon and discard exact UIDs',()=>{
 const s=scene();s.sides.player.active=mon('bw9-66');s.sides.opponent.active=mon('bw9-1');s.sides.player.hand=[ref('bw9-1','p-one'),ref('bw9-2','p-two'),ref('bw9-99','tool')];
 const a=C(66).attacks.find(x=>x.name==='Vilify'),choices=fx.choicesForEffect(a.effect,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById});
 assert.ok(choices.length>=4);const both=choices.find(c=>c.choiceLabel?.includes('60 damage'));assert.ok(both);
 const r=resolve(s,66,'Vilify',{effectSelection:both.effectSelection});assert.equal(r.damage,60);
 fire(s,r.pendingEffects[0],{isAttack:true});assert.deepEqual(s.sides.player.discard.map(r=>r.uid),['p-one','p-two']);assert.deepEqual(s.sides.player.hand.map(r=>r.uid),['tool']);
});
test('Ghetsis targets opponent Item and Tool only, respecting owner and hand limit',()=>{
 const s=scene();s.sides.player.active=mon('bw9-1');s.sides.opponent.active=mon('bw9-2');s.sides.opponent.hand=[ref('bw9-105','item'),ref('bw9-99','tool'),ref('bw9-102','supporter')];s.sides.player.deck=[ref('bw9-1','a'),ref('bw9-2','b'),ref('bw9-3','c')];
 fire(s,C(101).effect);assert.deepEqual(s.sides.opponent.hand.map(r=>r.uid),['supporter']);assert.equal(s.sides.opponent.deck.length,2);assert.equal(s.sides.player.hand.length,2);
});
test('Shadow Triad recovers exact physical Team Plasma cards, including Plasma Energy',()=>{
 const s=scene();s.sides.player.discard=[ref('bw9-106','plasma-energy'),ref('bw9-1','nonplasma')];
 const q=fire(s,C(102).effect);assert.equal(q.kind,'option');assert.equal(q.options.length,1);
 fire(s,{...E('shadowTriad'),stage:'pick'},{resume:true,action:{choiceOption:0}});
 assert.deepEqual(s.sides.player.hand.map(r=>r.uid),['plasma-energy']);assert.deepEqual(s.sides.player.discard.map(r=>r.uid),['nonplasma']);
});
test('Float Stone and Freeze Zone use Team Plasma identity including the Badge',()=>{
 const s=scene(),x=mon('bw9-1'),glaceon=mon('bw9-23');s.sides.player.active=x;s.sides.player.bench=[glaceon];
 assert.equal(core.retreatCost(s,'player'),data.cardById('bw9-1').retreat);
 x.tool=ref('bw9-104','badge');assert.equal(core.retreatCost(s,'player'),Math.max(0,data.cardById('bw9-1').retreat-2));
 x.tool=ref('bw9-99','float-stone');assert.equal(core.retreatCost(s,'player'),0);
});
test('Umbreon Dark Shade respects Plasma Badge, stacks with another Umbreon, suppression',()=>{
 const s=scene();s.sides.player.active=mon('bw9-38');s.sides.player.bench=[mon('bw9-64'),mon('bw9-64')];
 assert.equal(core.maxHp(s,'player',s.sides.player.active),Number(C(38).hp)+40);
 s.sides.player.active=mon('bw9-1');assert.equal(core.maxHp(s,'player',s.sides.player.active),Number(C(1).hp));
 s.sides.player.active.tool=ref('bw9-104');assert.equal(core.maxHp(s,'player',s.sides.player.active),Number(C(1).hp)+40);
});
test('BW8 attacks recognize alternate BW9 Plasma Energy print',()=>{
 const bw8=require(path.join(assets,'tcg-classic-plasma-storm.js'));const s=scene();s.sides.player.active=mon('bw8-14');s.sides.opponent.active=mon('bw9-1');
 s.sides.player.active.specialEnergy=[ref('bw9-106','crossset-energy')];const a=bw8.cardById('bw8-14').attacks.find(x=>x.name==='Power Flame');
 const r=fx.resolveAttack(a,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,isAttack:true,action:{}});
 assert.equal(r.damage,120);
});
test('CPU produces legal BW9-only 30-card decks without orphan evolution or ACE SPEC violations',()=>{
 let ok=0;for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness','Colorless'])for(let seed=1;seed<=20;seed++){
  const r=cpu.generate({sets:['bw9'],type,seed});if(!r.ok)continue;ok++;
  assert.equal(r.cards.length,30);assert.equal(data.validateDeck(r.cards).ok,true,`invalid BW9 ${type}:${seed}`);
  assert.ok(r.cards.every(id=>data.cardById(id)?.deckEligible!==false));assert.ok(r.cards.filter(id=>data.cardById(id)?.aceSpec).length<=1);
 }assert.ok(ok>=100,`Too few legal BW9 decks: ${ok}/180`);
});

test('BW9 Plasma-dependent CPU cores carry physical Plasma Energy, not just Zone Colorless',()=>{
 for(const [type,seeds] of [['Lightning',[2,3,4]],['Psychic',[2,3,4]],['Fire',[8,9,15]],['Colorless',[6,7,8]]]){
  for(const seed of seeds){
   const r=cpu.generate({sets:['bw9'],type,seed});assert.equal(r.ok,true,`BW9 ${type}:${seed}`);
   const dependent=r.cards.some(id=>{const c=data.cardById(id);return (c?.attacks||[]).some(a=>/Plasma Energy attached|Plasma Gale/i.test(String(a.text||'')+' '+a.name));});
   if(dependent){assert.ok(r.cards.includes('bw9-106'),`missing physical Plasma Energy for ${type}:${seed}`);
     assert.equal(data.validateDeck(r.cards).ok,true);}
  }
 }
 assert.ok(C(22).deckMeta.conditionalAttackEnergyTypes.includes('Fighting'),
  'Quagsire requires Fighting Energy to trigger the printed Mud Gun bonus');
});
