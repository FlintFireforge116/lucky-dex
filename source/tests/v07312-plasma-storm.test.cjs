'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const set=require(path.join(assets,'tcg-classic-plasma-storm.js'));
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const C=n=>set.cardById('bw8-'+n);
const ref=(id,uid)=>({cardId:id,uid:uid||id});
const slot=(id,uid)=>({uid:uid||id,cardId:id,stack:[id],damage:0,energy:{},specialEnergy:[],conditions:{},tool:null,extraTools:[],benchSlot:0});
function scene(){const ss=()=>({active:null,bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energySupply:[],prizes:[ref('bw8-1')],prizesTaken:0,turnCount:3,handLimit:8,benchLimit:3});return {format:'classic',turnNumber:7,phase:'battle',activeSide:'player',stadium:null,sides:{player:ss(),opponent:ss()},log:[],rules:{winMode:'prizes',benchSize:3}};}
function fire(s,e,extras={}){let choice=null;fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action:extras.action||{},resolvingChoice:!!extras.resume,random:()=>.1,shuffle:(_state,deck)=>deck.reverse(),drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r;},requestChoice:x=>choice=x,onEnergyAttached:()=>{},...extras});return choice;}
function damage(s,n,name){const a=C(n).attacks.find(a=>a.name===name);assert.ok(a,`missing attack ${name}`);return fx.resolveAttack(a,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action:{},random:()=>.1,isAttack:true,effectiveEnergy:p=>p.energy,retreatCost:()=>1});}
test('138 pinned collector prints, exact numeric IDs, every printed attack/ability has either a real handler or a gated card',()=>{
 assert.equal(set.CARDS.length,138);assert.deepEqual(set.CARDS.map(c=>c.number),Array.from({length:138},(_,i)=>String(i+1)));
 assert.ok(set.CARDS.every(c=>c.id==='bw8-'+c.number&&data.cardById(c.id)===c));
 for(const c of set.CARDS){assert.equal(typeof c.battleEnabled,'boolean');if(!c.battleEnabled){assert.equal(c.deckEligible,false);assert.ok(c.support.reasons.length);}else{assert.equal(c.deckEligible,true);assert.ok((c.attacks||[]).every(a=>a.effect?.type!=='unsupported'));assert.ok((c.abilities||[]).every(a=>a.effect?.type!=='unsupported'));}}
 const source=JSON.parse(fs.readFileSync(path.join(root,'data/classic/bw8-print-compact.json'),'utf8'));assert.equal(source.length,138);
 for(let i=0;i<138;i++){assert.equal(set.CARDS[i].name,source[i][1]);assert.equal((set.CARDS[i].attacks||[]).length,source[i][7].length);assert.equal((set.CARDS[i].abilities||[]).length,source[i][8].length);}
});
test('Team Plasma, EX, ACE SPEC, art and special Plasma Energy preserve print identity',()=>{
 for(const n of [3,13,14,17,25,46,48,55,58,70,90,101,108,119,123,124,125,127])assert.equal(C(n).teamPlasma,true,`BW8 #${n}`);
 assert.equal(C(127).kind,'energy');assert.equal(C(127).specialEnergy,true);assert.deepEqual(C(127).effect.provides,{Colorless:1});
 for(const n of [128,129,130]){assert.equal(C(n).aceSpec,true);assert.equal(C(n).maxDeckCopies,1);}
 for(const n of [18,25,48,93,95,96,108,131,132,133,134])assert.equal(C(n).prizeCards,2);
 assert.equal(C(136).name,'Charizard');assert.equal(C(137).name,'Blastoise');assert.equal(C(138).name,'Random Receiver');
 assert.ok(C(137).image.includes('/bw8/137.png'));
});
test('Plasma Gale requires exact attached Plasma Energy and preserves physical discard UID',()=>{
 const s=scene();s.sides.player.active=slot('bw8-108');s.sides.opponent.active=slot('bw8-1');
 assert.equal(damage(s,108,'Plasma Gale').damage,0);
 s.sides.player.active.specialEnergy=[ref('bw8-127','plasma-original')];const r=damage(s,108,'Plasma Gale');assert.equal(r.damage,120);assert.equal(r.pendingEffects.length,1);
 fire(s,r.pendingEffects[0]);assert.equal(s.sides.player.active.specialEnergy.length,0);assert.deepEqual(s.sides.player.discard.map(r=>r.uid),['plasma-original']);
});
test('Power Flame +40 and Teampact depend on physical Plasma Energy and Team Plasma Pokémon',()=>{
 const s=scene();s.sides.player.active=slot('bw8-14');s.sides.opponent.active=slot('bw8-1');
 assert.equal(damage(s,14,'Power Flame').damage,80);
 s.sides.player.active.specialEnergy=[ref('bw8-127','plasma')];assert.equal(damage(s,14,'Power Flame').damage,120);
 s.sides.player.active=slot('bw8-101');s.sides.player.bench=[slot('bw8-55')];assert.equal(damage(s,101,'Teampact').damage,60);
});
test('Hypnotoxic Laser poisons and flips for Sleep, keeping full outcome in conditions',()=>{
 const s=scene();s.sides.player.active=slot('bw8-1');s.sides.opponent.active=slot('bw8-2');fire(s,C(123).effect);
 assert.equal(s.sides.opponent.active.conditions.poison,true);assert.equal(s.sides.opponent.active.conditions.sleep,true);
 assert.ok(s.log.some(l=>l.type==='coin'));
});
test('Colress draws for both benches after shuffling the player hand into the deck',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('bw8-118');o.active=slot('bw8-2');p.bench=[slot('bw8-1'),slot('bw8-5')];o.bench=[slot('bw8-4')];
 p.hand=[ref('bw8-6','old-a'),ref('bw8-8','old-b')];p.deck=[ref('bw8-10','third'),ref('bw8-11','fourth')];fire(s,C(118).effect);
 assert.equal(p.hand.length,3);assert.equal(p.hand.length+p.deck.length,4);
});
test('CPU can build legal physical 30-card Plasma Storm-only decks without ineligible effects',()=>{
 let ok=0;for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness','Colorless'])for(let seed=1;seed<=4;seed++){
  const d=cpu.generate({sets:['bw8'],type,seed});if(!d.ok)continue;ok++;
  assert.equal(d.cards.length,30);for(const id of d.cards){const c=data.cardById(id);assert.ok(c);assert.notEqual(c.deckEligible,false);}
  assert.equal(d.cards.filter(id=>data.cardById(id)?.aceSpec).length<=1,true);
  assert.equal(data.validateDeck(d.cards).ok,true,`illegal BW8 CPU build for ${type} seed ${seed}`);
 }
 assert.ok(ok>=8,`Too few playable BW8 CPU decks: ${ok}/36`);
});
