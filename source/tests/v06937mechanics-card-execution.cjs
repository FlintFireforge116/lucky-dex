'use strict';
// This fixed cohort records actual identities enabled by the composition pass.
// It deliberately compiles authoritative imports again, so generated data cannot
// make an implementation appear to pass by retaining an old descriptor.
const t=require('node:test'),a=require('node:assert/strict'),N=require('../scripts/lib/tcgp-normalize.cjs'),D=require('../app/src/main/assets/tcgp-battle-data.js'),C=require('../app/src/main/assets/tcgp-battle-core.js'),E=require('../app/src/main/assets/tcgp-battle-effects.js');
const COHORT=('A1-007 A1-030 A1-089 A1-098 A1-125 A1-132 A1-168 A1-177 A1-219 P-A-044 P-A-047 P-A-058 P-A-081 P-A-095 P-A-097 A4a-036 A4a-043 A2-022 A1a-067 A2-032 A2-033 A2-044 A2-062 A2-092 A2-150 A2-152 A2a-009 A2a-021 A2a-041 A2a-050 A2a-055 A2a-056 A2a-069 A2a-073 A2a-075 A2b-051 A2b-071 A3-034 A3-048 A3-051 A3-053 A3-123 A3-124 A3-132 A3-147 A3-155 A3a-027 A3a-034 A3b-028 A3b-033 A3b-057 A3b-059 A4-022 A4-029 A4-050 A4-063 A4-073 A4-083 A4-091 A4-112 A4-130 A4-152 A4-160 A4a-020 A4a-063 A4a-067 B1-018 B1-027 B1-032 B1-043 B1-080 B1-094 B1-147 B1-168 B1-172 B1-195 B1-203 P-B-045 P-B-057 P-B-071 B1a-030 B2-053 B2-055 B2-065 B2-108 B2a-020 B2a-036 B2a-086 B2a-090 B2a-091 B2b-013 B2b-021 B2b-025 B2b-044 B2b-045 B3-003 B3-009 B3-018 B3-019 B3-040 B3-041 B3-062 B3-066 B3-067 B3-115 B3-149 B3-150 B3a-071 B3b-015 B3b-064 B3b-065 B4-003 B4-035 B4-039 B4-045 B4-058 B4-071 B4-090 B4-145 B4a-021 B4a-025 C1-031 C1-050 C1-084 C1-104 C1-122').split(' ');
const raws=JSON.parse(JSON.stringify([...require('../data/tcgp/import/tcgdex-pocket-cards.json'),...require('../data/tcgp/import/tcgdex-A4b-cards.json'),...require('../data/tcgp/import/vociferix-missing-mechanics.json'),...require('../data/tcgp/import/current-pocket-mechanics.json')]));
const byRaw=new Map(raws.map(r=>[N.printId(r.id),r]));for(const f of require('../data/tcgp/import/data-quality-overrides.json').corrections){let target=byRaw.get(f.printId);for(const key of f.path.slice(0,-1))target=target[key];target[f.path.at(-1)]=f.value;}
const cards=raws.map(N.normalizeMechanics),byId=new Map(cards.map(c=>[c.id,c]));
const matches=(c,f={})=>c.kind==='pokemon'&&Object.entries(f).every(([k,v])=>k==='damaged'?true:k==='subtype'?(Array.isArray(v)?v:[v]).some(x=>c.types.includes(x)):k==='evolved'?['Stage 1','Stage 2'].includes(c.stage)===v:k==='hasAbility'?!!c.abilities?.length===v:(Array.isArray(v)?v:[v]).includes(c[k]));
function fixture(card,effect,ability){
 const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:69137,firstSide:'player'});b.phase='battle';b.turnNumber=5;b.activeSide='player';
 const energy=Object.fromEntries(Object.keys(N.ENERGY).filter(t=>t!=='Colorless').map(t=>[t,10]));
 for(const [side,ss]of Object.entries(b.sides)){ss.turnCount=3;ss.hand=[];ss.abilityUsed={};ss.supporterUsed=false;ss.active={...C.makePokemonSlot('A1-001',0,side),damage:20,energy:{...energy}};ss.bench=[0,1,2].map(i=>({...C.makePokemonSlot('A1-001',0,side+'-'+i),damage:20,energy:{...energy},benchSlot:i}));}
 const p=b.sides.player,o=b.sides.opponent;
 if(card.kind==='pokemon')p.active={...C.makePokemonSlot(card.id,0,'subject'),damage:Math.min(20,card.hp-1),energy:{...energy}};
 function visit(e){if(!e)return;const condition=e.condition;if(condition?.type==='pokemonPresent'){const found=cards.find(c=>matches(c,condition.filter));a.ok(found,'present-condition fixture');p.bench[1]={...C.makePokemonSlot(found.id,0,'condition'),damage:Math.min(20,found.hp-1),energy:{...energy},benchSlot:1};}
  if(e.filter&&['selfBench','selfPokemon','selfAll','selfBenchAll','opponentBench','opponentPokemon'].includes(e.target)||e.type==='switch'&&e.filter){const found=cards.find(c=>matches(c,e.filter));a.ok(found,'filtered-target fixture');const ss=e.type==='switch'&&e.side==='opponent'||e.target?.startsWith('opponent')?o:p;ss.bench[2]={...C.makePokemonSlot(found.id,0,'filtered'),damage:Math.min(20,found.hp-1),energy:{...energy},benchSlot:2};}
  if(e.target==='selfActive'&&e.filter&&!matches(byId.get(p.active.cardId),e.filter)){const found=cards.find(c=>matches(c,e.filter));p.active={...C.makePokemonSlot(found.id,0,'typed-active'),damage:Math.min(20,found.hp-1),energy:{...energy}};}
  for(const child of e.effects||[])visit(child);visit(e.heads);visit(e.tails);
 }
 visit(effect);
 if(ability?.benchOnly){p.bench[0]={...C.makePokemonSlot(card.id,0,'subject-bench'),damage:Math.min(20,card.hp-1),energy:{...energy},benchSlot:0};if(p.active.cardId===card.id)p.active={...C.makePokemonSlot('A1-001',0,'other-active'),damage:20,energy:{...energy}};}
 if(card.kind==='trainer')p.hand=[{uid:'trainer',cardId:card.id}];return b;
}
function sane(b){a.ok(['battle','promote','finished'].includes(b.phase));for(const ss of Object.values(b.sides)){a.ok(ss.bench.length<=3);a.ok(ss.hand.length<=10);for(const s of [ss.active,...ss.bench].filter(Boolean)){a.ok(Number.isFinite(s.damage)&&s.damage>=0);for(const n of Object.values(s.energy||{}))a.ok(Number.isInteger(n)&&n>=0);}}}
t('126 actual newly supported identities execute every attack, Trainer and activated ability through the shared legal engine',context=>{
 const previous=D.cardById;D.cardById=id=>byId.get(id)||previous(id);let attacks=0,trainers=0,abilities=0,passives=0;
 try{for(const id of COHORT){const card=byId.get(id);a.ok(card,id);a.equal(card.support.status,'FULL',id+': '+card.support.reasons.join('; '));
  const effects=[card.effect,...card.attacks.map(x=>x.effect),...(card.abilities||[]).map(x=>x.effect)];for(const e of effects)a.deepEqual(E.validateEffect(e),[],id+' descriptor');
  for(const [index,attack]of card.attacks.entries()){const b=fixture(card,attack.effect),action=C.legalActions(b,'player').find(x=>x.type==='attack'&&x.attackIndex===index);a.ok(action,id+' attack '+index);C.applyAction(b,'player',action);sane(b);attacks++;}
  if(card.kind==='trainer'){const b=fixture(card,card.effect),action=C.legalActions(b,'player').find(x=>x.type==='trainer');a.ok(action,id+' trainer');C.applyAction(b,'player',action);sane(b);trainers++;}
  for(const [index,ability]of (card.abilities||[]).entries()){const b=fixture(card,ability.effect,ability);if(ability.type==='activated'){const action=C.legalActions(b,'player').find(x=>x.type==='ability'&&x.cardId===id&&x.abilityIndex===index);a.ok(action,id+' activated ability');C.applyAction(b,'player',action);sane(b);abilities++;}
   else if(ability.type==='triggered'){C.applyAction(b,'player',{type:'endTurn'});sane(b);passives++;}
   else {for(const stat of ['maxHp','attackDamage','damageReduction','retreatCost','attackCost'])a.ok(Number.isFinite(E.modifierAmount(b,'player',b.sides.player.active,stat,D.cardById)));passives++;}
  }
 }}finally{D.cardById=previous;}
 a.equal(COHORT.length,126);a.ok(attacks>90);a.ok(trainers>15);a.ok(abilities>15);a.ok(passives>10);
 context.diagnostic(JSON.stringify({identities:COHORT.length,attacks,trainers,activatedAbilities:abilities,passiveOrTriggeredAbilities:passives}));
});
