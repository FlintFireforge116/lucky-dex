(function(root, factory){
  let data = root && root.LuckyDexTCGPBattleData, library = root && root.LuckyDexTCGPDeckLibrary;
  if (typeof module === 'object' && module.exports){
    data = require('./tcgp-battle-data.js');
    library = require('./tcgp-deck-library.js');
    module.exports = factory(data,library);
  } else if (root){
    root.LuckyDexTCGPBattleDecks = factory(data,library);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(data,library){
  'use strict';

  const BATTLE_DEFAULTS = Object.freeze({
    schema:1,
    helpSeen:false,
    decks:[],
    activeDeckId:null,
    firstClears:{},
    stats:{matches:0,wins:0,losses:0,draws:0,bestWinTurns:null,totalTurns:0}
  });

  const LOANER_PLAYER_DECK = data.BEGINNER_IVYSAUR_DECK.slice();
  const ENERGY_TYPES = Object.freeze(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']);
  const ENERGY_CODE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'};
  const POCKET_RARITY_RANK=Object.freeze({'one diamond':1,'two diamond':2,'three diamond':3,'four diamond':4,'one star':5,'two star':6,'three star':7,'one shiny':8,'two shiny':9,'crown':10,'crown rare':10});
  function pocketRarityRank(value){const key=String(value||'').trim().toLowerCase().replace(/[◇◆]/g,'diamond').replace(/[☆★]/g,'star').replace(/\s+/g,' ');if(POCKET_RARITY_RANK[key])return POCKET_RARITY_RANK[key];const diamonds=(String(value||'').match(/[◇◆]/g)||[]).length;if(diamonds)return diamonds;const stars=(String(value||'').match(/[☆★]/g)||[]).length;if(stars)return 4+stars;if(/shiny/i.test(String(value||'')))return /two|2/i.test(String(value||''))?9:8;if(/crown/i.test(String(value||'')))return 10;return 0;}
  function eligibleOwnedQuantity(row,maxRank){const quantity=Math.max(0,Number(row?.quantity||0)||0);if(!maxRank||!Array.isArray(row?.variants)||!row.variants.length)return quantity;return row.variants.reduce((sum,v)=>sum+(pocketRarityRank(v?.rarity)<=maxRank?Math.max(0,Number(v?.quantity||0)||0):0),0);}
  function deckEnergyTypes(deck){return deck?.energyMode==='auto'?analyzeDeck(deck.cards||[]).recommendedEnergyTypes:Array.isArray(deck?.energyTypes)?deck.energyTypes.slice():deck?.energyType?[String(deck.energyType)]:analyzeDeck(deck?.cards||[]).recommendedEnergyTypes;}
  function walkEffects(effect,fn){if(!effect||typeof effect!=='object')return;fn(effect);for(const e of Array.isArray(effect.effects)?effect.effects:[])walkEffects(e,fn);for(const key of ['heads','tails','effect'])if(effect[key]&&typeof effect[key]==='object')walkEffects(effect[key],fn);}
  function cardEffects(card){return [card?.effect,...(card?.attacks||[]).map(a=>a.effect),...[].concat(card?.abilities||card?.ability||[]).map(a=>a.effect)];}
  function cardConditions(card){const out=new Map();for(const e of cardEffects(card))walkEffects(e,e=>{const c=e.condition;if(c)out.set(JSON.stringify(c),c);});return [...out.values()];}
  function statusNeeds(card){return cardConditions(card).filter(c=>['opponentStatus','selfStatus'].includes(c.type));}
  function inflicts(card,status,target='opponentActive'){let found=false;for(const e of cardEffects(card))walkEffects(e,e=>{if(e.type==='status'&&(!status||e.status===status)&&(e.target||'opponentActive')===target)found=true;});return found;}
  function selfGeneratedTypes(card){const found=new Set();for(const a of card?.abilities||[card?.ability].filter(Boolean))if(a.type==='activated'&&!a.benchOnly)walkEffects(a.effect,e=>{if(e.type==='attachEnergy'&&['self','selfActive'].includes(e.target)&&!e.condition)found.add(e.energyType);});return found;}
  function analyzeDeck(cards,configured){
    const pokemon=(cards||[]).map(data.cardById).filter(c=>c?.kind==='pokemon'),required=new Set(),warnings=[],unpowerable=[];
    for(const c of pokemon)for(const a of c.attacks||[])for(const symbol of a.cost||'')if(ENERGY_CODE[symbol])required.add(ENERGY_CODE[symbol]);
    const recommendedEnergyTypes=ENERGY_TYPES.filter(t=>required.has(t));
    if(pokemon.length&&!recommendedEnergyTypes.length)recommendedEnergyTypes.push('Water'); // Any real Energy pays Colourless; no inherited Grass preference.
    const types=configured==null?recommendedEnergyTypes:configured,energyValid=Array.isArray(types)&&types.length>=1&&types.length<=3&&new Set(types).size===types.length&&types.every(t=>ENERGY_TYPES.includes(t));
    const available=new Set(Array.isArray(types)?types:[]),names=new Set(pokemon.map(c=>data.normalizeName(c.name)));
    const missingEnergyTypes=ENERGY_TYPES.filter(t=>required.has(t)&&!available.has(t));
    for(const c of new Map(pokemon.map(c=>[c.id,c])).values()){
      const generated=selfGeneratedTypes(c),payable=(c.attacks||[]).some(a=>[...(a.cost||'')].every(s=>s==='C'||available.has(ENERGY_CODE[s])||generated.has(ENERGY_CODE[s])));
      if(!payable){unpowerable.push(c.id);warnings.push({code:'unpowerable',cardId:c.id,message:`${c.name} cannot power any attack with ${[...available].join(' / ')||'no configured Energy'}.`});}
      if(c.stage!=='Basic'&&c.evolvesFrom&&!names.has(data.normalizeName(c.evolvesFrom)))warnings.push({code:'orphan',cardId:c.id,message:`${c.name} is missing ${c.evolvesFrom} in this deck.`});
    }
    if(missingEnergyTypes.length)warnings.push({code:'missing-energy',message:`Attack costs require ${missingEnergyTypes.join(' / ')} Energy not configured in the Zone.`});
    for(const type of available)if(required.size&&!required.has(type))warnings.push({code:'unused-energy',energyType:type,message:`No attack specifically requires ${type} Energy (it can still pay Colourless).`});
    return {recommendedEnergyTypes,configuredEnergyTypes:[...available],energyValid,missingEnergyTypes,unpowerable,warnings};
  }

  function ensureBattleState(state){
    if (!state || typeof state !== 'object') throw new TypeError('LuckyDex state is required');
    const current = state.tcgpBattle && typeof state.tcgpBattle === 'object' ? state.tcgpBattle : {};
    const stats = current.stats && typeof current.stats === 'object' ? current.stats : {};
    const battle = {
      ...current,
      schema:Number(current.schema || BATTLE_DEFAULTS.schema),
      helpSeen:current.helpSeen === true,
      decks:Array.isArray(current.decks) ? current.decks : [],
      activeDeckId:current.activeDeckId == null ? null : current.activeDeckId,
      firstClears:{...(current.firstClears || {})},
      stats:{...BATTLE_DEFAULTS.stats,...stats}
    };
    state.tcgpBattle = battle;
    return battle;
  }

  function ownershipMap(rows){
    const map = new Map();
    for (const row of rows || []){
      const id = data.cardById(row?.gameplayId)?.id;
      if (id) map.set(id, (map.get(id) || 0) + Math.max(0, Number(row.quantity || 0) || 0));
    }
    return map;
  }

  function copyLimitKey(card){
    if (!card) return '';
    const name = typeof card.name === 'string' ? data.normalizeName(card.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'') : '';
    return name || String(card.id || '').toLowerCase();
  }

  function validateCore(cards, ownedRows, checkOwnership){
    const errors = [];
    const list = Array.isArray(cards) ? cards.slice() : [];
    if (list.length !== 20) errors.push(`Deck must contain exactly 20 cards (currently ${list.length}).`);
    const owned = ownershipMap(ownedRows);
    const counts = new Map();
    const nameCounts = new Map();
    let basics = 0;
    for (const id of list){
      const card = data.cardById(id);
      if (!card){ errors.push(`Unknown battle card: ${id}.`); continue; }
      if (!card.battleEnabled){ errors.push(`${card.name} is not battle-enabled yet.${card.support?.reasons?.length ? ' ' + card.support.reasons.join(' ') : ''}`); continue; }
      const count = (counts.get(card.id) || 0) + 1;
      counts.set(card.id, count);
      const limitKey = copyLimitKey(card);
      const nameCount = (nameCounts.get(limitKey) || 0) + 1;
      nameCounts.set(limitKey, nameCount);
      if (nameCount > 2) errors.push(`Decks may contain at most 2 copies of ${card.name}.`);
      if (card.kind === 'pokemon' && card.stage === 'Basic') basics += 1;
    }
    if (!basics) errors.push('Deck must contain at least one Basic Pokémon.');
    if (checkOwnership){
      for (const [id,count] of counts){
        const card = data.cardById(id);
        if (!card || card.loaner) continue;
        const have = owned.get(id) || 0;
        if (count > have) errors.push(`You do not own enough copies of ${card.name} (${have}/${count}).`);
      }
    }
    return {ok:errors.length === 0,errors};
  }

  function validateDeck(cards, ownedRows, energyTypes){ const legal=validateCore(cards,ownedRows,true);return energyTypes==null?legal:{...legal,...analyzeDeck(cards,energyTypes)}; }
  function validateLoanerDeck(cards,energyTypes){ const legal=validateCore(cards,[],false);return energyTypes==null?legal:{...legal,...analyzeDeck(cards,energyTypes)}; }

  function* deckCandidates(ownedRows,options){
    const opts=options||{},requestedTypes=[...new Set((Array.isArray(opts.types)?opts.types:opts.type?[opts.type]:[]).filter(t=>ENERGY_TYPES.includes(t)))].slice(0,2),style=opts.style==='random'?'random':'competitive',maxRarityRank=Math.max(0,Number(opts.maxRarityRank)||0);
    const eligibleRows=(ownedRows||[]).map(row=>({...row,quantity:eligibleOwnedQuantity(row,maxRarityRank)})).filter(row=>row.quantity>0);
    const owned=ownershipMap(eligibleRows),pool=[...owned].map(([id,n])=>({card:data.cardById(id),n:Math.min(2,n)})).filter(r=>r.n>0&&r.card?.battleEnabled&&!r.card.loaner);
    const globalFamilyRoot=c=>{let current=c,guard=0;while(current?.kind==='pokemon'&&current.stage!=='Basic'&&current.evolvesFrom&&guard++<4){const prior=data.CARDS.find(x=>x?.kind==='pokemon'&&x.name===current.evolvesFrom);if(!prior)break;current=prior;}return data.normalizeName(current?.name||c?.name||'');};
    const knownEvolutionParents=new Set(data.CARDS.filter(next=>next?.battleEnabled&&next.kind==='pokemon'&&next.evolvesFrom).map(next=>data.normalizeName(next.evolvesFrom)));
    const hasKnownBattleEvolution=c=>c?.kind==='pokemon'&&knownEvolutionParents.has(data.normalizeName(c.name));
    // Any Pokémon with a known later battle-enabled evolution is an evolution
    // bridge, not an automatic family endpoint. Automatic builds may still use
    // it inside a complete line; explicit Build Around / named-attack synergy
    // can intentionally choose one when the user actually wants that card.
    const truncatedAutoEndpoint=c=>c?.kind==='pokemon'&&hasKnownBattleEvolution(c);
    const ownedEvolvedRoots=new Set(pool.filter(r=>r.card.kind==='pokemon'&&r.card.stage!=='Basic').map(r=>globalFamilyRoot(r.card)));
    const knownEvolvedRoots=new Set(data.CARDS.filter(c=>c?.battleEnabled&&c.kind==='pokemon'&&c.stage!=='Basic').map(globalFamilyRoot));
    const isStrandedBasic=c=>c?.kind==='pokemon'&&c.stage==='Basic'&&(c.points||1)<=1&&knownEvolvedRoots.has(globalFamilyRoot(c))&&!ownedEvolvedRoots.has(globalFamilyRoot(c));
    const coherentCapacity=2+pool.filter(r=>!isStrandedBasic(r.card)).reduce((sum,r)=>sum+Math.min(2,r.n),0),avoidStrandedBasics=coherentCapacity>=20;
    const strandedBasic=c=>avoidStrandedBasics&&isStrandedBasic(c);
    const fail=message=>({ok:false,cards:[],energyTypes:[],errors:[message]});
    const hasMechanic=(c,type)=>{let found=false;for(const e of [c.effect,...(c.attacks||[]).map(a=>a.effect),...(c.abilities||[]).map(a=>a.effect)])walkEffects(e,e=>{if(e.type===type)found=true;});return found;};
    const focus=opts.cardId?data.cardById(opts.cardId):null;
    if(opts.cardId&&(!focus?.battleEnabled||!owned.get(focus.id)))return fail('The focus card must be owned and FULL. Non-FULL rules remain available for review, not silently enabled.');
    let seeds=pool.filter(r=>r.card.kind==='pokemon'&&!strandedBasic(r.card)&&!hasKnownBattleEvolution(r.card));
    const preMatch=c=>(!requestedTypes.length||requestedTypes.some(t=>data.hasType(c,t)))&&(!opts.setId||c.setId===opts.setId)&&(!opts.mechanic||hasMechanic(c,opts.mechanic))&&(!opts.status||c.support?.status===opts.status);
    if(!focus&&(requestedTypes.length||opts.setId||opts.mechanic||opts.status))seeds=seeds.filter(r=>preMatch(r.card));
    if(focus)seeds=[{card:focus}];
    const types=c=>Array.isArray(c?.types)?c.types:[c?.subtype].filter(Boolean);
    const values=new Map(),profilesByCard=new Map(),byName=new Map(),generatedByCard=new Map();
    const actualEnergyProfile=c=>ENERGY_TYPES.filter(t=>(c.attacks||[]).some(a=>[...(a.cost||'')].some(s=>ENERGY_CODE[s]===t)));
    function focusEnergyProfile(card,seen=new Set()){
      if(!card||seen.has(card.id))return [];seen.add(card.id);
      const found=new Set(actualEnergyProfile(card));
      for(const effect of cardEffects(card))walkEffects(effect,e=>{if(ENERGY_TYPES.includes(e.energyType))found.add(e.energyType);});
      for(const type of types(card))if(ENERGY_TYPES.includes(type))found.add(type);
      if(found.size)return ENERGY_TYPES.filter(type=>found.has(type));
      if(card.stage!=='Basic'&&card.evolvesFrom){
        for(const prior of byName.get(card.evolvesFrom)||[])for(const type of focusEnergyProfile(prior.card,new Set(seen)))found.add(type);
      }
      return ENERGY_TYPES.filter(type=>found.has(type));
    }
    function expectedAttackValue(a){
      const cost=Math.max(1,(a.cost||'').length);let damage=Math.max(0,Number(a.damage)||0),bonus=0,penalty=0;
      function scoreEffect(e){if(!e||typeof e!=='object')return;
        if(e.type==='coinDamage')damage=e.mode==='replace'?(Number(e.amount)||0)*.5:damage+(Number(e.amount)||0)*.5;
        else if(e.type==='benchCountDamage'){const count=e.side==='both'?4:2;const swing=(Number(e.amount)||0)*count;if(e.mode==='replace')damage=Math.max(damage,swing);else bonus+=swing;}
        else if(e.type==='bonusDamage')bonus+=(Number(e.amount)||0)*.55;
        else if(e.type==='benchDamage')bonus+=(Number(e.amount)||0)*.45;
        else if(e.type==='status')bonus+=12;
        else if(e.type==='selfDamage')penalty+=(Number(e.amount)||0)*.28;
        else if(e.type==='discardEnergy')penalty+=e.target==='self'||!e.target?8:0;
        if(e.type==='coinFlip'){scoreEffect(e.heads);scoreEffect(e.tails);bonus*=.75;}
        for(const child of Array.isArray(e.effects)?e.effects:[])scoreEffect(child);if(e.effect&&typeof e.effect==='object')scoreEffect(e.effect);
      }
      scoreEffect(a.effect);return Math.max(0,damage+bonus-penalty)/cost;
    }
    for(const r of pool){const c=r.card;const stageBonus=c.stage==='Basic'?5:c.stage==='Stage 2'?-3:0,pointRisk=(c.points||1)>1?5:0;values.set(c.id,c.kind==='pokemon'?Math.max(0,...c.attacks.map(expectedAttackValue))+Number(c.hp)/10+stageBonus-pointRisk:0);profilesByCard.set(c.id,actualEnergyProfile(c));generatedByCard.set(c.id,selfGeneratedTypes(c));if(!byName.has(c.name))byName.set(c.name,[]);byName.get(c.name).push(r);}
    const value=c=>values.get(c.id)||0;
    seeds.sort((a,b)=>value(b.card)-value(a.card)||a.card.id.localeCompare(b.card.id));
    const candidates=[];
    const profiles=[...new Map(pool.filter(r=>r.card.kind==='pokemon').map(r=>profilesByCard.get(r.card.id)).filter(p=>p.length&&p.length<=3).map(p=>[p.join('/'),p])).values()].sort((a,b)=>a.length-b.length||a.join('/').localeCompare(b.join('/')));
    // Competitive mode compares the best representative of each Energy/stage
    // shape. Random mode instead exposes one viable endpoint per evolution
    // family so the primary archetype itself can vary (Tapu Fini, Wailord,
    // Blastoise, etc.) rather than repeatedly starting from the strongest seed.
    if(!focus){
      if(style==='random'){
        const groups=new Map(),stageRank={'Basic':0,'Stage 1':1,'Stage 2':2};
        for(const r of seeds){const profile=profilesByCard.get(r.card.id)||[];if(profile.length>3)continue;if(requestedTypes.length&&!profile.some(t=>requestedTypes.includes(t))&&!requestedTypes.some(t=>data.hasType(r.card,t)))continue;if(!requestedTypes.length&&!profile.length)continue;const key=globalFamilyRoot(r.card);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
        seeds=[...groups.values()].map(group=>{const terminal=group.filter(r=>!group.some(other=>other!==r&&data.normalizeName(other.card.evolvesFrom||'')===data.normalizeName(r.card.name)));const choices=terminal.length?terminal:group;return choices.sort((a,b)=>(stageRank[b.card.stage]||0)-(stageRank[a.card.stage]||0)||value(b.card)-value(a.card)||a.card.id.localeCompare(b.card.id))[0];}).filter(Boolean).sort((a,b)=>globalFamilyRoot(a.card).localeCompare(globalFamilyRoot(b.card))).slice(0,80);
      }else{
        // Competitive mode used to keep only one card for each Energy/stage
        // shape. That made whole archetypes invisible before synergy and Trainer
        // support were even scored. Keep several distinct families per shape so
        // the final evaluator, rather than raw attack value, decides the winner.
        const groups=new Map();
        for(const r of seeds){
          const profile=profilesByCard.get(r.card.id);if(!profile||profile.length>3)continue;
          if(requestedTypes.length&&!profile.some(t=>requestedTypes.includes(t))&&!requestedTypes.some(t=>data.hasType(r.card,t)))continue;
          const key=profile.join('/')+':'+(r.card.stage||r.card.kind),family=globalFamilyRoot(r.card),group=groups.get(key)||[];
          if(!group.some(x=>globalFamilyRoot(x.card)===family)&&group.length<4)group.push(r);
          groups.set(key,group);
        }
        seeds=[...groups.values()].flat().sort((a,b)=>profilesByCard.get(a.card.id).length-profilesByCard.get(b.card.id).length||value(b.card)-value(a.card)).slice(0,96);
      }
    }
    const variant=Math.max(0,Math.floor(Number(opts.variant)||0));
    const hash=text=>{let h=2166136261;for(const ch of String(text||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
    let randomFloat=null;
    if(style==='random'&&seeds.length){
      const excluded=new Set((opts.excludeArchetypes||[]).map(data.normalizeName));
      if(Number.isFinite(Number(opts.randomSeed))){
        let state=(Math.floor(Number(opts.randomSeed))>>>0)||0x9e3779b9;
        randomFloat=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
        seeds=seeds.slice();for(let i=seeds.length-1;i>0;i--){const j=Math.floor(randomFloat()*(i+1));[seeds[i],seeds[j]]=[seeds[j],seeds[i]];}
      }else{
        let state=(hash(requestedTypes.join('/')||'any')^variant^0x9e3779b9)>>>0;
        randomFloat=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
        seeds=seeds.slice().sort((a,b)=>hash(globalFamilyRoot(a.card))-hash(globalFamilyRoot(b.card))||globalFamilyRoot(a.card).localeCompare(globalFamilyRoot(b.card)));const start=variant%seeds.length;seeds=[...seeds.slice(start),...seeds.slice(0,start)];
      }
      // Random history is based on successful archetypes, not raw candidates.
      // Put already-served families at the back so failed candidates cannot make
      // two consecutive button presses collapse onto the same viable deck.
      seeds=[...seeds.filter(r=>!excluded.has(globalFamilyRoot(r.card))),...seeds.filter(r=>excluded.has(globalFamilyRoot(r.card)))];
    }
    const budgets=style==='random'?[8]:[7,8,9];
    const attempts=seeds.flatMap(seed=>seed.card.kind==='pokemon'?budgets.map(budget=>({...seed,budget})):(requestedTypes.length?[requestedTypes]:profiles).flatMap(profile=>budgets.map(budget=>({...seed,profile,budget}))));
    let candidatesEvaluated=0;
    for(const seed of attempts){
      yield candidatesEvaluated;
      const preserved=opts.mode==='existing'?(opts.cards||[]).map(id=>data.cardById(id)?.id||id):[];
      const focusProfile=focus?focusEnergyProfile(seed.card):[];
      const analyzedProfile=analyzeDeck([...preserved,seed.card.id]).recommendedEnergyTypes;
      const primary=requestedTypes.length?requestedTypes.slice():(focusProfile.length?focusProfile.slice():(analyzedProfile.length?analyzedProfile:seed.profile));
      if(seed.profile&&!requestedTypes.length)primary.splice(0,primary.length,...seed.profile);
      if(primary.length>3)continue;
      const cards=[],counts=new Map(),idCounts=new Map();
      const room=c=>Math.min((c.loaner?2:owned.get(c.id)||0)-(idCounts.get(c.id)||0),2-(counts.get(copyLimitKey(c))||0));
      const compatible=c=>c.kind!=='pokemon'||c.attacks.every(a=>[...a.cost].every(s=>s==='C'||primary.includes(ENERGY_CODE[s])||generatedByCard.get(c.id)?.has(ENERGY_CODE[s])));
      function add(c){if(cards.length>=20||room(c)<1)return false;cards.push(c.id);idCounts.set(c.id,(idCounts.get(c.id)||0)+1);counts.set(copyLimitKey(c),(counts.get(copyLimitKey(c))||0)+1);return true;}
      const lineCache=new Map();
      function line(c,seen=new Set()){
        const top=seen.size===0;if(top&&lineCache.has(c.id))return lineCache.get(c.id);
        if(seen.has(c.id)||!compatible(c)){if(top)lineCache.set(c.id,null);return null;}seen.add(c.id);
        if(c.stage==='Basic'||c.kind!=='pokemon'){const result=[c];if(top)lineCache.set(c.id,result);return result;}
        const bases=(byName.get(c.evolvesFrom)||[]).filter(r=>r.card.kind==='pokemon'&&compatible(r.card)).sort((a,b)=>b.n-a.n||value(b.card)-value(a.card)||a.card.id.localeCompare(b.card.id));
        for(const base of bases){const prior=line(base.card,new Set(seen));if(prior){const result=[...prior,c];if(top)lineCache.set(c.id,result);return result;}}
        if(top)lineCache.set(c.id,null);return null;
      }
      function addLine(c){const bundle=line(c);if(!bundle)return false;const needed=bundle.filter(x=>!cards.includes(x.id));if(needed.some(x=>room(x)<1)||cards.length+needed.length>20)return false;for(const x of needed)add(x);return cards.includes(c.id);}
      const lineMissingCount=c=>{const bundle=line(c);return bundle?bundle.filter(x=>!cards.includes(x.id)).length:Infinity;};
      const familyRoot=c=>{const bundle=line(c);return data.normalizeName((bundle?.[0]||c)?.name||'');};
      const representedEnergy=()=>new Set(cards.map(data.cardById).filter(c=>c?.kind==='pokemon').flatMap(c=>profilesByCard.get(c.id)||[]));
      let preservedOk=true;for(const id of preserved){const c=data.cardById(id);if(!c?.battleEnabled||!add(c)){preservedOk=false;break;}}if(!preservedOk)continue;
      for(const id of preserved){const c=data.cardById(id);if(c.kind==='pokemon'&&!addLine(c))preservedOk=false;}if(!preservedOk)continue;
      while(add(data.cardById('BASIC-POKE-BALL'))){}
      if(!addLine(seed.card))continue;
      // A family is a setup unit, not independent card slots. Duplicate the
      // primary line only when every prerequisite can be duplicated too; this
      // prevents nonsense such as 1 Tynamo / 2 Eelektrik.
      const core=line(seed.card)||[];
      for(let target=2;target<=2;target++){
        const missing=core.filter(x=>(idCounts.get(x.id)||0)<target);
        if(!missing.length)continue;
        if(cards.length+missing.length>20||missing.some(x=>room(x)<1))break;
        for(const x of missing)add(x);
      }
      const mainEndpoint=core[core.length-1]||seed.card,primaryFamily=familyRoot(seed.card),randomPartnerMaxLine=style==='random'?(core.length>=3?2:1):Infinity;
      const coreNamedAttackSynergies=new Set();for(const c of core)for(const a of c.attacks||[])walkEffects(a.effect,e=>{if(e.type==='namedAttackCountDamage'&&e.attackName)coreNamedAttackSynergies.add(data.normalizeName(e.attackName));});
      const directNamedAttackPartner=c=>coreNamedAttackSynergies.size&&(c.attacks||[]).some(a=>coreNamedAttackSynergies.has(data.normalizeName(a.name)));
      const randomPartnerAllowed=c=>style!=='random'||familyRoot(c)===primaryFamily||((!truncatedAutoEndpoint(c)||directNamedAttackPartner(c))&&(line(c)?.length||Infinity)<=randomPartnerMaxLine);
      // Build Around Card is stricter than a general competitive build: the
      // chosen family is the deck identity. A secondary family may be a Basic
      // or one-step support package, but never another full Stage 2/Mega engine.
      const focusPartnerAllowed=c=>!focus||focus.kind!=='pokemon'||familyRoot(c)===primaryFamily||((!truncatedAutoEndpoint(c)||directNamedAttackPartner(c))&&(line(c)?.length||Infinity)<=2);
      const partnerAllowed=c=>randomPartnerAllowed(c)&&focusPartnerAllowed(c);
      // Professor's Research is Pocket's baseline draw engine. Keep two when owned
      // rather than letting niche higher-scored Trainers crowd both copies out.
      const research=data.cardById('P-A-007');if(research&&owned.get(research.id))while(add(research)){}
      const strategyWarnings=[];
      for(const condition of cardConditions(seed.card)){
        const type=({selfHasTool:'Tool',stadiumInPlay:'Stadium',supporterPlayed:'Supporter'})[condition.type];if(!type||cards.some(id=>data.cardById(id).trainerType===type))continue;
        const support=pool.filter(r=>r.card.kind==='trainer'&&r.card.trainerType===type).sort((a,b)=>Number(b.card.effect?.type==='draw')-Number(a.card.effect?.type==='draw')||a.card.id.localeCompare(b.card.id)).find(r=>add(r.card));
        if(!support)strategyWarnings.push({code:'conditional-support',message:`No owned ${type} enabler for ${seed.card.name}.`});
      }
      for(const condition of statusNeeds(seed.card).filter(c=>c.type==='opponentStatus')){
        if(cards.some(id=>inflicts(data.cardById(id),condition.status)))continue;
        const enablers=pool.filter(r=>inflicts(r.card,condition.status)&&compatible(r.card)).sort((a,b)=>(a.card.stage==='Basic'?0:1)-(b.card.stage==='Basic'?0:1)||value(b.card)-value(a.card)||a.card.id.localeCompare(b.card.id));
        const enabler=enablers.find(r=>addLine(r.card));if(enabler){while((idCounts.get(enabler.card.id)||0)<2&&add(enabler.card)){} }else strategyWarnings.push({code:'conditional-support',message:`No owned compatible ${condition.status||'Special Condition'} enabler for ${seed.card.name}.`});
      }
      const coreNames=new Set(core.map(c=>data.normalizeName(c.name)));
      const namedAttackSynergies=coreNamedAttackSynergies,suppliedEnergyTypes=new Set();
      for(const c of core){
        for(const a of c.attacks||[])walkEffects(a.effect,e=>{
          if(['attachEnergy','attachEnergyFromDiscard','distributeEnergy','moveEnergy'].includes(e.type)&&ENERGY_TYPES.includes(e.energyType)&&(e.target==='selfBench'||e.target==='bench'||e.target==='selfPokemon'||e.type!=='attachEnergy'))suppliedEnergyTypes.add(e.energyType);
        });
        for(const a of [].concat(c.abilities||c.ability||[]))walkEffects(a?.effect,e=>{if(['attachEnergy','attachEnergyFromDiscard','distributeEnergy','moveEnergy'].includes(e.type)&&ENERGY_TYPES.includes(e.energyType))suppliedEnergyTypes.add(e.energyType);});
      }
      const namedAttackAffinity=c=>namedAttackSynergies.size&&(c.attacks||[]).some(a=>namedAttackSynergies.has(data.normalizeName(a.name)))?90:0;
      const energyPayoffAffinity=c=>{
        let bonus=0;
        for(const a of c.attacks||[]){
          const typed=(profilesByCard.get(c.id)||[]).filter(t=>suppliedEnergyTypes.has(t));
          if(typed.length&&String(a.cost||'').length>=3)bonus=Math.max(bonus,28);
          walkEffects(a.effect,e=>{
            const t=e.energyType||e.perEnergyType||e.condition?.energyType;
            if(t&&suppliedEnergyTypes.has(t)&&['energyDamage','coinDamageByEnergy','selectedEnergyDamage','randomPokemonDamage','bonusDamage'].includes(e.type))bonus=Math.max(bonus,80);
            if(e.condition?.type==='selfExtraEnergyAtLeast'&&suppliedEnergyTypes.has(e.condition.energyType))bonus=Math.max(bonus,70);
          });
        }
        return bonus;
      };
      const affinityCache=new Map();
      const affinity=c=>{if(affinityCache.has(c.id))return affinityCache.get(c.id);const structural=coreNames.has(data.normalizeName(c.name))?100:coreNames.has(data.normalizeName(c.evolvesFrom))?55:(profilesByCard.get(c.id)||[]).some(t=>primary.includes(t))?24:types(c).some(t=>types(seed.card).includes(t))?16:types(c).includes('Colorless')?2:0,result=structural+namedAttackAffinity(c)+energyPayoffAffinity(c);affinityCache.set(c.id,result);return result;};
      // Competitive filler must earn the setup cost of a second evolution line.
      // Generic same-Energy partners may be standalone Basics, but Stage 1/2
      // packages are reserved for explicit mechanic/energy synergy. This keeps
      // strong-but-unrelated three-stage lines from being bolted onto every deck.
      const competitivePartnerUseful=c=>{
        if(style!=='competitive'||familyRoot(c)===primaryFamily)return true;
        if(namedAttackAffinity(c)>0||energyPayoffAffinity(c)>0)return true;
        const bundle=line(c);return !!bundle&&bundle.length===1;
      };
      const pokemon=pool.filter(r=>r.card.kind==='pokemon'&&compatible(r.card)&&!strandedBasic(r.card)&&(familyRoot(r.card)===primaryFamily||!truncatedAutoEndpoint(r.card)||directNamedAttackPartner(r.card))).sort((a,b)=>affinity(b.card)-affinity(a.card)||value(b.card)-value(a.card)||a.card.id.localeCompare(b.card.id));
      const pokemonTotal=()=>cards.map(data.cardById).filter(c=>c?.kind==='pokemon').length;
      const familyKeys=()=>new Set(cards.map(data.cardById).filter(c=>c?.kind==='pokemon').map(familyRoot));
      // Pick one gameplay endpoint per family and copy the whole evolution line
      // coherently. The old filler could create e.g. 1 Gimmighoul + 2 Gholdengo ex
      // + 2 Gholdengo because every endpoint in the same species family looked
      // independently attractive.
      const familyEndpointChoice=new Map([[primaryFamily,mainEndpoint.id]]);
      function addCoherentLine(c,maxPokemon=seed.budget){
        const family=familyRoot(c),chosen=familyEndpointChoice.get(family);if(chosen&&chosen!==c.id)return false;
        const bundle=line(c);if(!bundle)return false;let added=false;
        for(let target=1;target<=2;target++){
          const missing=bundle.filter(x=>(idCounts.get(x.id)||0)<target);
          if(!missing.length){added=cards.includes(c.id);continue;}
          if(cards.length+missing.length>20||pokemonTotal()+missing.filter(x=>x.kind==='pokemon').length>maxPokemon||missing.some(x=>room(x)<1))break;
          for(const x of missing)add(x);added=cards.includes(c.id);
        }
        if(added&&!chosen)familyEndpointChoice.set(family,c.id);return added;
      }
      // For a requested dual-Energy deck, deliberately add one compact partner package
      // that makes the second Energy type meaningful instead of merely configuring it.
      if(requestedTypes.length>1)for(const wanted of requestedTypes){if(representedEnergy().has(wanted)||pokemonTotal()>=seed.budget)continue;const families=familyKeys();const partner=pokemon.find(r=>(profilesByCard.get(r.card.id)||[]).includes(wanted)&&partnerAllowed(r.card)&&(families.has(familyRoot(r.card))||families.size<2)&&line(r.card)?.length<=Math.max(1,seed.budget-pokemonTotal()));if(partner)addCoherentLine(partner.card,seed.budget);}
      // Random mode randomises the secondary engine too. Previously only the
      // lead family was shuffled, while the partner was always the highest raw
      // value card (notably Pikachu ex in Lightning). Choose among genuinely
      // viable families in a quality band, then let normal filling stay inside
      // the selected two-family shell.
      if(style==='random'&&randomFloat&&familyKeys().size<2&&pokemonTotal()<seed.budget){
        const reps=new Map();
        for(const r of pokemon.slice(0,64)){const family=familyRoot(r.card);if(family===primaryFamily||!partnerAllowed(r.card)||affinity(r.card)<=0||pokemonTotal()+lineMissingCount(r.card)>seed.budget)continue;const score=affinity(r.card)*2+value(r.card),prev=reps.get(family);if(!prev||score>prev.score)reps.set(family,{r,score});}
        const ranked=[...reps.values()].sort((a,b)=>b.score-a.score),best=ranked[0]?.score||0,viable=ranked.filter(x=>x.score>=best*.58);
        if(viable.length){const picked=viable[Math.floor(randomFloat()*viable.length)].r;addCoherentLine(picked.card,seed.budget);}
      }
      // Competitive Pocket lists are compact: one main engine and, at most, one
      // complementary Pokémon family. Fill the rest with consistency Trainers.
      for(const r of pokemon){if(pokemonTotal()>=seed.budget)break;const families=familyKeys(),family=familyRoot(r.card);if(!families.has(family)&&families.size>=2)continue;if(pokemonTotal()+lineMissingCount(r.card)>seed.budget)continue;if(affinity(r.card)>0&&partnerAllowed(r.card)&&competitivePartnerUseful(r.card))addCoherentLine(r.card,seed.budget);}
      const pokemonCards=cards.map(data.cardById).filter(c=>c.kind==='pokemon'),evolutions=pokemonCards.filter(c=>c.stage!=='Basic').length,expensive=pokemonCards.some(c=>c.attacks.some(a=>a.cost.length>=3)),retreatHeavy=pokemonCards.some(c=>c.retreat>=2);
      const rareCandy=data.cardById('A3-144'),stage2Plan=style==='random'?mainEndpoint.stage==='Stage 2':pokemonCards.some(c=>c.stage==='Stage 2');if(stage2Plan&&rareCandy?.battleEnabled&&owned.get(rareCandy.id))while(add(rareCandy)){}
      const featureSet=new Set();for(const c of pokemonCards)for(const e of [...c.attacks.map(a=>a.effect),...([].concat(c.abilities||c.ability||[])).map(a=>a.effect)])walkEffects(e,e=>featureSet.add(e.type));
      const matches=(c,f)=>!f||Object.entries(f).every(([k,v])=>{
        if(k==='subtype')return types(c).includes(v);
        if(k==='isEx')return ((c.tags||[]).includes('ex')||Number(c.points||1)>=2)===v;
        if(k==='name'){const wanted=[].concat(v).map(data.normalizeName);return wanted.includes(data.normalizeName(c.name));}
        if(k==='tag')return [].concat(v).some(tag=>(c.tags||[]).map(data.normalizeName).includes(data.normalizeName(tag)));
        if(k==='attackName'){const wanted=[].concat(v).map(data.normalizeName);return (c.attacks||[]).some(a=>wanted.includes(data.normalizeName(a.name)));}
        if(k==='nameContains')return data.normalizeName(c.name).includes(data.normalizeName(v));
        if(k==='hasAbility')return (!!([].concat(c.abilities||c.ability||[]).filter(Boolean).length))===!!v;
        if(k==='hpAtMost')return Number(c.hp||0)<=Number(v);
        // These are board-state filters, not card-identity filters. A Pokémon in
        // the deck can satisfy them during play, so they must not make otherwise
        // relevant support look dead at build time.
        if(k==='damaged'||k==='hasAnyEnergy')return c.kind==='pokemon';
        if(k==='hasEnergyType'){const t=String(v||'');return c.kind==='pokemon'&&primary.includes(t)&&(types(c).includes(t)||(profilesByCard.get(c.id)||[]).includes(t));}
        if(k==='energyTypeAtLeast'){const t=String(v?.type||'');return c.kind==='pokemon'&&primary.includes(t)&&(types(c).includes(t)||(profilesByCard.get(c.id)||[]).includes(t));}
        if(Array.isArray(v))return v.some(x=>data.normalizeName(c[k])===data.normalizeName(x));
        return c[k]===v;
      });
      // Stage-specific support should serve a real board role, not merely a
      // pre-evolution that the deck intends to evolve past. A Machoke in a
      // Machamp/Rare Candy list is an evolution bridge; it does not justify
      // spending competitive slots on Training Area or Elegant Cape.
      const isTerminalPokemon=c=>!pokemonCards.some(next=>next!==c&&next.stage!=='Basic'&&data.normalizeName(next.evolvesFrom)===data.normalizeName(c.name));
      const supportMatches=(c,f)=>{if(!matches(c,f))return false;if(!f?.stage)return true;if(style==='random')return mainEndpoint.stage===f.stage&&matches(mainEndpoint,f);return isTerminalPokemon(c);};
      function trainerValue(c){let dead=false;
        const conditionFilterMatches=(card,filter)=>{if(!filter)return true;if(filter.attackName){const wanted=[].concat(filter.attackName).map(data.normalizeName);if(!(card.attacks||[]).some(a=>wanted.includes(data.normalizeName(a.name))))return false;}const rest={...filter};delete rest.attackName;return matches(card,rest);};
        const conditionSupported=condition=>{
          if(!condition||typeof condition!=='object')return true;
          if(['selfMatches','activeMatches','pokemonPresent'].includes(condition.type))return pokemonCards.some(card=>conditionFilterMatches(card,condition.filter));
          if(condition.type==='selfRetreatCostAtLeast')return pokemonCards.some(card=>Number(card.retreat||0)>=Number(condition.amount||0));
          if(condition.type==='teamDistinctTypesAtLeast')return new Set(pokemonCards.flatMap(types)).size>=Number(condition.amount||0);
          if(condition.type==='teamDistinctEnergyTypesAtLeast')return representedEnergy().size>=Number(condition.amount||0);
          return true;
        };
        function scoreEffect(e,weight=1){
          if(!e||typeof e!=='object')return 0;
          if(e.condition&&!conditionSupported(e.condition)){dead=true;return 0;}
          // Coin branches are alternatives, not cumulative effects. Score their
          // expected value so coin-flip search cards do not swamp every build.
          if(e.type==='coinFlip')return scoreEffect(e.heads,weight*.5)+scoreEffect(e.tails,weight*.5);
          if(e.type==='coinUntilTails')return scoreEffect(e.effect,weight);
          // Delayed triggers are materially less consistent than effects you can
          // choose to use now. KO-triggered Tools such as Lucky Egg remain viable,
          // but do not masquerade as immediate draw engines in every shell.
          if(e.type==='triggeredEffect')return scoreEffect(e.effect,weight*(e.event==='knockedOut'?.3:.55));
          // A sequence is the net of its clauses, not a bonus simply for being a
          // sequence. This lets costs in later clauses offset the benefit.
          if(e.type==='sequence')return (e.effects||[]).reduce((sum,child)=>sum+scoreEffect(child,weight),0);
          const specific=!!(e.filter&&Object.keys(e.filter).length),amount=Math.abs(Number(e.amount)||0),opponentScoped=e.side==='opponent'||String(e.target||'').startsWith('opponent'),selfScoped=e.side==='self'||String(e.target||'').startsWith('self');
          if(specific&&!opponentScoped&&!pokemonCards.some(p=>supportMatches(p,e.filter))&&e.filter.kind!=='trainer')dead=true;
          let score=0;
          if(e.type==='rareCandy'){if(!stage2Plan){dead=true;return 0;}score=24;}
          else if(e.type==='draw')score=12+amount*3+evolutions;
          else if(e.type==='drawToHandSize'||e.type==='fieldCountDraw')score=12+evolutions;
          else if(e.type==='takeTopMatching')score=10+(specific?5:0)+(e.filter?.attackName?12:0);
          else if(e.type==='searchRandomBasic')score=12+(evolutions?8:0);
          else if(e.type==='search'){
            const searchesPokemon=!e.filter||e.filter.kind==='pokemon',setupBonus=searchesPokemon&&evolutions?8:0;
            // Deck search improves setup. Discard recovery is useful later, but it
            // should not crowd archetype-specific support out of every auto-build.
            if(e.source==='deck')score=10+setupBonus+(specific?3:0);
            else if(e.source==='discard')score=4+(featureSet.has('discardEnergy')?5:0)+(specific?1:0);
            else score=7;
          }
          else if(['attachEnergy','moveEnergy','attachEnergyFromDiscard','attachRandomEnergyFromDiscard','distributeDiscardEnergyDistinct'].includes(e.type))score=(expensive?18:10)+(specific?4:0)+(featureSet.has('discardEnergy')&&String(e.type).includes('Discard')?5:0);
          else if(e.type==='heal'||e.type==='healSelf')score=featureSet.has('damageFromDamage')?1:4+amount/8+(specific?4:0);
          // Discarding the opponent's Energy is disruption; discarding your own
          // is a real tempo cost (for example Super Potion) and must subtract.
          else if(e.type==='discardEnergy')score=opponentScoped?7+amount*2:selfScoped?-(8+amount*4):2;
          else if(e.type==='switch')score=(e.side==='opponent'||String(e.target||'').startsWith('opponent')?12:(retreatHeavy?14:5))+(specific?2:0);
          else if(e.stat==='retreatCost')score=(retreatHeavy?14:5)+(specific?4:0);
          else if(e.stat==='attackDamage')score=8+amount/2+(specific?6:0)+(e.opponentFilter?2:0);
          else if(e.stat==='damageReduction')score=5+amount/3+(specific?4:0);
          else if(e.stat==='maxHp')score=5+amount/3+(specific?4:0);
          else if(e.type==='removeStatus'||e.type==='removeStatuses'||e.type==='removeRandomStatus')score=4;
          else if(['searchThenShuffleChosen','topDeckFilter','selectTopToHand','evolveTargetFromDeck','benchFromDeck','benchFromDiscard'].includes(e.type))score=9+(specific?4:0)+(e.type==='evolveTargetFromDeck'&&evolutions?8:0);
          else if(e.type==='returnToHand')score=7+(specific?5:0);
          else if(['lock','status','discardEnergy','handShuffle','preventDamage','preventEffects','koGuard'].includes(e.type))score=7+(featureSet.has('statusDamage')&&e.type==='status'?8:0);
          else score=3;
          let total=score*weight;for(const child of Array.isArray(e.effects)?e.effects:[])total+=scoreEffect(child,weight);
          if(e.effect&&typeof e.effect==='object')total+=scoreEffect(e.effect,weight);return total;
        }
        let score=scoreEffect(c.effect);if(c.trainerType==='Stadium')score-=4;return dead?-1000:score;
      }
      let scoredTrainers=pool.filter(r=>r.card.kind==='trainer'&&r.card.effect?.type!=='playFossil').map(r=>({...r,utility:trainerValue(r.card)})).sort((a,b)=>b.utility-a.utility||a.card.id.localeCompare(b.card.id));
      if(style==='random'&&randomFloat){
        // Random viable decks should still prefer good support, but cards with
        // similar utility should not always appear in exactly the same order.
        const bands=new Map();for(const r of scoredTrainers){const band=Math.floor(r.utility/6);if(!bands.has(band))bands.set(band,[]);bands.get(band).push(r);}
        scoredTrainers=[...bands.entries()].sort((a,b)=>b[0]-a[0]).flatMap(([,group])=>{group=group.slice();for(let i=group.length-1;i>0;i--){const j=Math.floor(randomFloat()*(i+1));[group[i],group[j]]=[group[j],group[i]];}return group;});
      }
      const trainers=scoredTrainers.filter(r=>r.utility>0),scarcityTrainers=scoredTrainers.filter(r=>r.utility<=0&&r.utility>-1000);
      const trainerCount=type=>cards.map(data.cardById).filter(c=>c?.kind==='trainer'&&(!type||c.trainerType===type)).length;
      const optionalTrainers=trainers.filter(r=>r.card.id!=='P-A-007'),needsStadium=cardConditions(seed.card).some(c=>c.type==='stadiumInPlay'),stadiumLimit=needsStadium?2:1;
      function trainerCopyCap(c){if(c.id==='P-A-007')return 2;if(c.trainerType==='Stadium')return stadiumLimit;const e=c.effect||{},specific=!!(e.filter&&Object.keys(e.filter).length)&&!(e.side==='opponent'||String(e.target||'').startsWith('opponent'));if(c.trainerType==='Supporter')return specific||['draw','search','attachEnergy','moveEnergy'].includes(e.type)?2:1;if(c.trainerType==='Tool')return specific?2:1;if(['draw','search','searchRandomBasic','attachEnergy'].includes(e.type))return 2;return 1;}
      // Give the best few distinct support roles one slot before duplicating them.
      // This keeps staples consistent without every archetype collapsing into the
      // same pair of generic Supporters.
      let distinctSupport=0;for(const r of optionalTrainers){
        if(cards.length>=20||distinctSupport>=6)break;
        if(r.card.trainerType==='Stadium'&&trainerCount('Stadium')>=stadiumLimit)continue;
        if((idCounts.get(r.card.id)||0)>=trainerCopyCap(r.card))continue;
        if(add(r.card))distinctSupport++;
      }
      for(const r of optionalTrainers){
        if(r.card.trainerType==='Stadium'&&trainerCount('Stadium')>=stadiumLimit)continue;
        const cap=trainerCopyCap(r.card);while((idCounts.get(r.card.id)||0)<cap&&add(r.card)){if(r.card.trainerType==='Stadium'&&trainerCount('Stadium')>=stadiumLimit)break;}
      }
      // Small collections may need a second copy of generic utility to reach 20;
      // only use this after the diversified competitive shell has been exhausted.
      for(const r of optionalTrainers){if(cards.length>=20)break;if(r.card.trainerType==='Stadium'&&trainerCount('Stadium')>=Math.max(stadiumLimit,2))continue;while(cards.length<20&&add(r.card)){if(r.card.trainerType==='Stadium'&&trainerCount('Stadium')>=Math.max(stadiumLimit,2))break;} }
      for(const r of pokemon){if(cards.length>=20)break;const families=familyKeys(),family=familyRoot(r.card);if(!families.has(family)&&families.size>=2)continue;if(!partnerAllowed(r.card)||!competitivePartnerUseful(r.card))continue;if(pokemonTotal()+lineMissingCount(r.card)>10)continue;addCoherentLine(r.card,10);}
      // Collection-scarcity fallback: competitive composition is the goal, not a
      // reason to refuse a legal deck when the player simply does not own enough
      // FULL Trainers. Only after the compact shell is exhausted may extra
      // compatible Pokémon/families fill the remaining slots.
      if(cards.length<20){for(const r of pokemon){if(cards.length>=20||style==='random'&&pokemonTotal()>=10)break;if((style==='random'||focus?.kind==='pokemon')&&(!partnerAllowed(r.card)||pokemonTotal()+lineMissingCount(r.card)>10))continue;if(style==='competitive'&&!competitivePartnerUseful(r.card))continue;addCoherentLine(r.card,style==='random'?10:20);}}
      // Last-resort collection fallback: relevance is a quality rule, not a
      // reason to refuse a legal deck when the player owns too few useful
      // Trainers/Pokémon. Only after coherent options are exhausted may a
      // low-synergy Trainer fill the final slots, with Stadium clutter capped.
      if(cards.length<20){for(const r of scarcityTrainers){if(cards.length>=20)break;if(r.card.trainerType==='Stadium'&&trainerCount('Stadium')>=Math.max(stadiumLimit,2))continue;const cap=trainerCopyCap(r.card);while(cards.length<20&&(idCounts.get(r.card.id)||0)<cap&&add(r.card)){if(r.card.trainerType==='Stadium'&&trainerCount('Stadium')>=Math.max(stadiumLimit,2))break;}}}
      const selectedPokemon=cards.map(data.cardById).filter(c=>c?.kind==='pokemon'),selectedRoots=new Map();for(const c of selectedPokemon){const root=globalFamilyRoot(c);if(!selectedRoots.has(root))selectedRoots.set(root,[]);selectedRoots.get(root).push(c);}
      const selectedNameCounts=new Map();for(const c of selectedPokemon)selectedNameCounts.set(data.normalizeName(c.name),(selectedNameCounts.get(data.normalizeName(c.name))||0)+1);
      const unbalancedEvolution=selectedPokemon.some(c=>c.stage!=='Basic'&&c.evolvesFrom&&(selectedNameCounts.get(data.normalizeName(c.name))||0)>(selectedNameCounts.get(data.normalizeName(c.evolvesFrom))||0));
      if(unbalancedEvolution)continue;
      const strandedPreEvolution=[...selectedRoots.entries()].some(([root,members])=>members.every(c=>c.stage==='Basic'&&(c.points||1)<=1)&&knownEvolvedRoots.has(root));
      if(!focus&&avoidStrandedBasics&&strandedPreEvolution)continue;
      const analysis=analyzeDeck(cards,primary),valid=validateDeck(cards,eligibleRows,primary),represented=representedEnergy();
      if(!valid.ok||analysis.unpowerable.length||analysis.missingEnergyTypes.length||analysis.warnings.some(w=>w.code==='orphan')||requestedTypes.some(t=>!represented.has(t)))continue;
      const selected=cards.map(data.cardById),trainerSupport=selected.filter(c=>c.kind==='trainer').reduce((s,c)=>s+trainerValue(c),0),basics=selected.filter(c=>c.kind==='pokemon'&&c.stage==='Basic').length;
      // A competitive auto-build needs at least two opening Pokémon copies. One
      // Basic plus nineteen Trainers may be legal, but it is not a serious list.
      if(style==='competitive'&&!focus&&basics<2)continue;
      candidatesEvaluated++;
      const pokemonN=selected.filter(c=>c.kind==='pokemon').length,trainerN=20-pokemonN,families=familyKeys().size;
      const basicsShape=basics>=2&&basics<=4?30:basics===1?-80:Math.max(0,30-(basics-4)*10);
      const trainerShape=trainerN>=12&&trainerN<=16?20:trainerN>=10?10:Math.max(-30,10-(10-trainerN)*8);
      const familyShape=families===1?20:families===2?15:-(families-2)*80;
      const compositionBonus=basicsShape+trainerShape+familyShape;
      const evaluation={legality:1,energyViability:1,evolutionCompleteness:1,setupConsistency:Math.min(5,basics)*5+evolutions*2,synergy:value(seed.card),attackerAvailability:selected.filter(c=>c.kind==='pokemon').reduce((s,c)=>s+value(c),0),trainerSupport,compositionBonus,deadCardRisk:Math.max(0,basics-5)*14};
      const score=evaluation.setupConsistency+evaluation.synergy+evaluation.attackerAvailability+trainerSupport+compositionBonus-evaluation.deadCardRisk-primary.length*18;
      const baseScore=score-strategyWarnings.length*80,officialArchetypePrior=style==='competitive'?Math.max(0,Math.min(60,Number(library?.archetypePrior?.(cards,primary))||0)):0;
      const finalScore=baseScore+officialArchetypePrior;
      const candidate={ok:true,cards,energyTypes:primary,errors:[],warnings:[...analysis.warnings,...strategyWarnings],strategy:`${style==='random'?'Random viable':'Competitive'} · ${primary.join(' / ')} · ${seed.card.name} core · ${selected.filter(c=>c.kind==='pokemon').length} Pokémon / ${selected.filter(c=>c.kind==='trainer').length} Trainers`,focusCardId:seed.card.id,archetypeKey:data.normalizeName(core[0]?.name||seed.card.name),score:finalScore,baseScore,officialArchetypePrior,evaluation};
      if(style==='random'){candidate.candidatesEvaluated=candidatesEvaluated;candidate.alternativesAvailable=seeds.length;candidate.buildStyle=style;return candidate;}
      candidates.push(candidate);
    }
    if(candidates.length){
      const sorted=candidates.sort((a,b)=>b.score-a.score||a.focusCardId.localeCompare(b.focusCardId)),unique=[],seen=new Set();
      for(const candidate of sorted){const key=focus?'focus':requestedTypes.length?candidate.archetypeKey:candidate.energyTypes.join('/')+':'+candidate.archetypeKey;if(seen.has(key))continue;seen.add(key);unique.push(candidate);}
      const picked=unique[variant%unique.length]||sorted[0];picked.candidatesEvaluated=candidatesEvaluated;picked.alternativesAvailable=unique.length;picked.buildStyle=style;return picked;
    }return fail('Not enough compatible owned copies to build a coherent 20-card deck with complete evolution lines. Add suitable Pokémon/Trainers or use a manual experimental deck.');
  }
  function buildQuickDeck(rows,options){const work=deckCandidates(rows,options);let step;do{step=work.next();}while(!step.done);return step.value;}
  function buildDeckAsync(rows,options,control={}){return new Promise((resolve,reject)=>{const work=deckCandidates(rows,options);function next(){if(control.isCancelled?.())return resolve(null);try{const step=work.next();if(step.done)return resolve(step.value);setTimeout(next,0);}catch(error){reject(error);}}next();});}

  function buildTestSetup(rows,options={}){
    const card=data.cardById(options.cardId),prerequisites=[],blockers=[],attemptedCards=[];
    if(!card)return {ready:false,cards:[],attemptedCards,energyTypes:[],prerequisites,blockers:['Unknown focus card.']};
    attemptedCards.push(card.id);const seen=new Set();let c=card;
    const have=ownershipMap(rows),primary=analyzeDeck([card.id]).recommendedEnergyTypes;
    while(c?.evolvesFrom&&!seen.has(c.id)){seen.add(c.id);const priorName=c.evolvesFrom;prerequisites.push(`Evolve ${priorName} into ${c.name} on separate turns.`);c=data.CARDS.filter(x=>x.name===priorName&&x.battleEnabled&&have.get(x.id)>0).sort((a,b)=>analyzeDeck([a.id],primary).unpowerable.length-analyzeDeck([b.id],primary).unpowerable.length||a.id.localeCompare(b.id))[0];if(c)attemptedCards.unshift(c.id);else blockers.push(`Missing owned enabled ${priorName} pre-evolution.`);}
    const text=[card.text,...card.attacks?.map(a=>a.text)||[],...([].concat(card.abilities||card.ability||[])).map(a=>a.text)].join(' ');
    for(const [pattern,type] of [[/Pokémon Tool|Tool attached/i,'Tool'],[/Stadium/i,'Stadium']])if(pattern.test(text)){
      const support=data.CARDS.find(c=>c.battleEnabled&&c.trainerType===type&&rows.some(r=>data.cardById(r.gameplayId)?.id===c.id&&r.quantity>0));
      prerequisites.push(`Play a compatible ${type} before testing.`);if(support)attemptedCards.push(support.id);else blockers.push(`No owned enabled ${type} for this prerequisite.`);
    }
    if(/opponent/i.test(text))prerequisites.push('Set up the opponent target described in the printed rules; a generic deck does not guarantee the required board state.');
    if(!card.battleEnabled)blockers.push(...card.support?.reasons||['Unimplemented card rules.']);
    const result=card.battleEnabled?buildQuickDeck(rows,{mode:'existing',cards:attemptedCards,cardId:card.id}):null;
    if(result&&!result.ok)blockers.push(...result.errors);
    for(const condition of cardConditions(card)){
      if(condition.type==='supporterPlayed'){const supporter=result?.cards?.map(data.cardById).find(c=>c.trainerType==='Supporter');if(supporter)prerequisites.push(`Play ${supporter.name} during the same turn before attacking with ${card.name}.`);else blockers.push('No owned Supporter in the test deck for the played-Supporter condition.');}
      if(condition.type==='selfExtraEnergyAtLeast')prerequisites.push(`Attach at least ${condition.amount} extra ${condition.energyType||''} Energy beyond the complete attack cost before testing the bonus.`);
    }
    for(const condition of statusNeeds(card).filter(c=>c.type==='opponentStatus')){
      const source=result?.cards?.map(data.cardById).find(c=>inflicts(c,condition.status));
      if(source)prerequisites.push(`Use ${source.name} to apply ${condition.status||'a Special Condition'} to the opposing Active Pokémon, then bring ${card.name} Active before it recovers.`);
      else blockers.push(`No compatible owned ${condition.status||'Special Condition'} source in the test deck; this conditional mechanic cannot yet be exercised.`);
    }
    let needsEx=false;for(const a of card.attacks||[])walkEffects(a.effect,e=>{if(e.condition?.type==='opponentEx')needsEx=true;});
    let opponentCards=LOANER_PLAYER_DECK.slice(),opponentNotice='Generic sparring opponent; verify the printed target prerequisite before claiming mechanic coverage.';
    if(needsEx){
      const target=data.CARDS.find(c=>c.battleEnabled&&c.kind==='pokemon'&&c.stage==='Basic'&&c.points>=2&&analyzeDeck([c.id]).recommendedEnergyTypes.length===1);
      const cpuRows=data.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,quantity:2,battleEnabled:true}));
      const cpu=target&&buildQuickDeck(cpuRows,{cardId:target.id});if(cpu?.ok){opponentCards=cpu.cards;opponentNotice=`CPU loaner includes ${target.name}; bring it Active to test the Pokémon ex condition.`;}else blockers.push('No valid opposing Pokémon ex test deck.');
    }
    for(const condition of statusNeeds(card).filter(c=>c.type==='selfStatus')){
      if(inflicts(card,condition.status,'self'))continue;
      const source=data.CARDS.find(c=>c.battleEnabled&&c.kind==='pokemon'&&inflicts(c,condition.status));
      const cpu=source&&buildQuickDeck(data.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,quantity:2,battleEnabled:true})),{cardId:source.id});
      if(cpu?.ok&&!needsEx){opponentCards=cpu.cards;opponentNotice=`CPU loaner includes ${source.name} to inflict ${condition.status||'a Special Condition'}.`;prerequisites.push(`Let ${source.name} apply ${condition.status||'a Special Condition'} to ${card.name} before testing.`);}else blockers.push(`No combined opponent setup for ${condition.status||'Special Condition'} on the focus Pokémon.`);
    }
    return {ready:!!result?.ok&&!blockers.length,legalDeckReady:!!result?.ok,mechanicReady:!!result?.ok&&!blockers.length,cards:result?.cards||[],attemptedCards,energyTypes:result?.energyTypes||analyzeDeck(attemptedCards).recommendedEnergyTypes,prerequisites,blockers,opponentCards,opponentEnergyTypes:analyzeDeck(opponentCards).recommendedEnergyTypes,opponentNotice};
  }

  function saveDeck(state, deck, ownedRows){
    const battle = ensureBattleState(state);
    const cards = Array.isArray(deck && deck.cards) ? deck.cards.slice() : [];
    const validation = validateDeck(cards, ownedRows);
    if (!validation.ok) return validation;
    const energyTypes=deckEnergyTypes(deck);
    if(!energyTypes.length||energyTypes.length>3||new Set(energyTypes).size!==energyTypes.length||energyTypes.some(type=>!ENERGY_TYPES.includes(type)))return {ok:false,errors:['Choose 1 to 3 different Energy types for the Energy Zone.']};
    const id = String(deck.id || `deck-${Date.now()}`);
    const saved = {id,name:String(deck.name || 'Pocket Deck').slice(0,40),cards,energyType:energyTypes[0],energyTypes,energyMode:deck.energyMode==='auto'?'auto':'manual'};
    const idx = battle.decks.findIndex(item => item && item.id === id);
    if (idx >= 0) battle.decks[idx] = saved; else battle.decks.push(saved);
    battle.activeDeckId = id;
    return {ok:true,errors:[],warnings:analyzeDeck(cards,energyTypes).warnings,deck:saved};
  }

  return {BATTLE_DEFAULTS,LOANER_PLAYER_DECK,ENERGY_TYPES,deckEnergyTypes,analyzeDeck,ensureBattleState,copyLimitKey,validateDeck,validateLoanerDeck,buildQuickDeck,buildDeckAsync,buildTestSetup,saveDeck};
});
