(function(root, factory){
  let data = root && root.LuckyDexTCGPBattleData;
  if (typeof module === 'object' && module.exports){
    data = require('./tcgp-battle-data.js');
    module.exports = factory(data);
  } else if (root){
    root.LuckyDexTCGPBattleDecks = factory(data);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(data){
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
    const opts=options||{},owned=ownershipMap(ownedRows),pool=[...owned].map(([id,n])=>({card:data.cardById(id),n:Math.min(2,n)})).filter(r=>r.n>0&&r.card?.battleEnabled&&!r.card.loaner);
    const fail=message=>({ok:false,cards:[],energyTypes:[],errors:[message]});
    const hasMechanic=(c,type)=>{let found=false;for(const e of [c.effect,...(c.attacks||[]).map(a=>a.effect),...(c.abilities||[]).map(a=>a.effect)])walkEffects(e,e=>{if(e.type===type)found=true;});return found;};
    const focus=opts.cardId?data.cardById(opts.cardId):null;
    if(opts.cardId&&(!focus?.battleEnabled||!owned.get(focus.id)))return fail('The focus card must be owned and FULL. Non-FULL rules remain available for review, not silently enabled.');
    let seeds=pool.filter(r=>r.card.kind==='pokemon');
    const match=c=>(!opts.type||data.hasType(c,opts.type))&&(!opts.setId||c.setId===opts.setId)&&(!opts.mechanic||hasMechanic(c,opts.mechanic))&&(!opts.status||c.support?.status===opts.status);
    if(!focus&&(opts.type||opts.setId||opts.mechanic||opts.status))seeds=pool.filter(r=>match(r.card));
    if(focus)seeds=[{card:focus}];
    const types=c=>Array.isArray(c?.types)?c.types:[c?.subtype].filter(Boolean);
    const values=new Map(),profilesByCard=new Map(),byName=new Map(),generatedByCard=new Map();
    for(const r of pool){const c=r.card;values.set(c.id,c.kind==='pokemon'?Math.max(0,...c.attacks.map(a=>Number(a.damage)/(Math.max(1,a.cost.length))))+Number(c.hp)/10:0);profilesByCard.set(c.id,analyzeDeck([c.id]).recommendedEnergyTypes);generatedByCard.set(c.id,selfGeneratedTypes(c));if(!byName.has(c.name))byName.set(c.name,[]);byName.get(c.name).push(r);}
    const value=c=>values.get(c.id)||0;
    seeds.sort((a,b)=>value(b.card)-value(a.card)||a.card.id.localeCompare(b.card.id));
    let best=null;
    const profiles=[...new Map(pool.filter(r=>r.card.kind==='pokemon').map(r=>profilesByCard.get(r.card.id)).filter(p=>p.length&&p.length<=3).map(p=>[p.join('/'),p])).values()].sort((a,b)=>a.length-b.length||a.join('/').localeCompare(b.join('/')));
    // Compare distinct Energy/evolution archetypes instead of spending most of
    // the phone's budget on dozens of near-identical Basic seeds.
    if(!focus){const groups=new Map();for(const r of seeds){const profile=profilesByCard.get(r.card.id);if(!profile||profile.length>3)continue;const key=profile.join('/')+':'+(r.card.stage||r.card.kind);if(!groups.has(key))groups.set(key,r);}seeds=[...groups.values()].sort((a,b)=>profilesByCard.get(a.card.id).length-profilesByCard.get(b.card.id).length||value(b.card)-value(a.card)).slice(0,32);}
    const attempts=seeds.flatMap(seed=>seed.card.kind==='pokemon'?[{...seed,budget:8},{...seed,budget:12}]:(opts.type?[[opts.type]]:profiles).flatMap(profile=>[{...seed,profile,budget:8},{...seed,profile,budget:12}]));
    let candidatesEvaluated=0;
    for(const seed of attempts){
      yield candidatesEvaluated;
      const preserved=opts.mode==='existing'?(opts.cards||[]).map(id=>data.cardById(id)?.id||id):[];
      const primary=analyzeDeck([...preserved,seed.card.id]).recommendedEnergyTypes.length?analyzeDeck([...preserved,seed.card.id]).recommendedEnergyTypes:seed.profile;
      if(seed.profile)primary.splice(0,primary.length,...seed.profile);
      if(primary.length>3)continue;
      const cards=[],counts=new Map(),idCounts=new Map();
      const room=c=>Math.min((c.loaner?2:owned.get(c.id)||0)-(idCounts.get(c.id)||0),2-(counts.get(copyLimitKey(c))||0));
      const compatible=c=>c.kind!=='pokemon'||c.attacks.every(a=>[...a.cost].every(s=>s==='C'||primary.includes(ENERGY_CODE[s])||generatedByCard.get(c.id)?.has(ENERGY_CODE[s])));
      function add(c){if(cards.length>=20||room(c)<1)return false;cards.push(c.id);idCounts.set(c.id,(idCounts.get(c.id)||0)+1);counts.set(copyLimitKey(c),(counts.get(copyLimitKey(c))||0)+1);return true;}
      function line(c,seen=new Set()){
        if(seen.has(c.id)||!compatible(c))return null;seen.add(c.id);
        if(c.stage==='Basic'||c.kind!=='pokemon')return [c];
        const bases=(byName.get(c.evolvesFrom)||[]).filter(r=>r.card.kind==='pokemon'&&compatible(r.card)).sort((a,b)=>value(b.card)-value(a.card)||a.card.id.localeCompare(b.card.id));
        for(const base of bases){const prior=line(base.card,new Set(seen));if(prior)return [...prior,c];}return null;
      }
      function addLine(c){const bundle=line(c);if(!bundle)return false;const needed=bundle.filter(x=>!cards.includes(x.id));if(needed.some(x=>room(x)<1)||cards.length+needed.length>20)return false;for(const x of needed)add(x);return cards.includes(c.id);}
      let preservedOk=true;for(const id of preserved){const c=data.cardById(id);if(!c?.battleEnabled||!add(c)){preservedOk=false;break;}}if(!preservedOk)continue;
      for(const id of preserved){const c=data.cardById(id);if(c.kind==='pokemon'&&!addLine(c))preservedOk=false;}if(!preservedOk)continue;
      while(add(data.cardById('BASIC-POKE-BALL'))){}
      if(!addLine(seed.card))continue;
      // A family is a setup unit, not three independent high-stat picks.
      const core=line(seed.card)||[];for(const c of core)while((idCounts.get(c.id)||0)<2&&add(c)){}
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
      const affinity=c=>coreNames.has(data.normalizeName(c.name))?100:coreNames.has(data.normalizeName(c.evolvesFrom))?50:types(c).some(t=>types(seed.card).includes(t))?20:types(c).includes('Colorless')?2:0;
      const pokemon=pool.filter(r=>r.card.kind==='pokemon'&&compatible(r.card)).sort((a,b)=>affinity(b.card)-affinity(a.card)||value(b.card)-value(a.card)||a.card.id.localeCompare(b.card.id));
      // Complete useful families before extra copies, with a bounded Pokémon budget.
      for(const r of pokemon){if(cards.filter(id=>data.cardById(id).kind==='pokemon').length>=seed.budget)break;if(affinity(r.card)>0&&addLine(r.card))while(cards.filter(id=>data.cardById(id).kind==='pokemon').length<seed.budget&&add(r.card)){} }
      const pokemonCards=cards.map(data.cardById).filter(c=>c.kind==='pokemon'),evolutions=pokemonCards.filter(c=>c.stage!=='Basic').length,expensive=pokemonCards.some(c=>c.attacks.some(a=>a.cost.length>=3)),retreatHeavy=pokemonCards.some(c=>c.retreat>=2);
      const featureSet=new Set();for(const c of pokemonCards)for(const e of [...c.attacks.map(a=>a.effect),...([].concat(c.abilities||c.ability||[])).map(a=>a.effect)])walkEffects(e,e=>featureSet.add(e.type));
      const matches=(c,f)=>!f||Object.entries(f).every(([k,v])=>k==='subtype'?types(c).includes(v):k==='isEx'?(c.points>=2)===v:c[k]===v);
      function trainerValue(c){let score=0,dead=false;walkEffects(c.effect,e=>{
        if(e.filter&&!pokemonCards.some(p=>matches(p,e.filter)))dead=true;
        if(e.type==='draw')score+=12+e.amount*3+evolutions;
        else if(e.type==='searchRandomBasic'||e.type==='search')score+=10+(evolutions?8:0)+(e.source==='discard'&&featureSet.has('discardEnergy')?4:0);
        else if(e.type==='attachEnergy'||e.type==='moveEnergy')score+=expensive?18:6;
        else if(e.type==='heal'||e.type==='healSelf')score+=featureSet.has('damageFromDamage')?1:6+Math.max(...pokemonCards.map(c=>c.hp||0))/40;
        else if(e.type==='switch'||e.stat==='retreatCost')score+=retreatHeavy?14:4;
        else if(e.stat==='attackDamage')score+=10+(e.filter?4:0);
        else if(e.stat==='maxHp')score+=10;
        else if(['lock','status','discardEnergy','handShuffle','preventDamage'].includes(e.type))score+=7+(featureSet.has('statusDamage')&&e.type==='status'?8:0);
        else score+=3;
      });return dead?-100:score;}
      const trainers=pool.filter(r=>r.card.kind==='trainer'&&r.card.effect?.type!=='playFossil').map(r=>({...r,utility:trainerValue(r.card)})).filter(r=>r.utility>0).sort((a,b)=>b.utility-a.utility||a.card.id.localeCompare(b.card.id));
      for(const r of trainers)while(add(r.card)){}
      for(const r of pokemon){if(cards.length>=20)break;if(addLine(r.card))while(add(r.card)){} }
      const analysis=analyzeDeck(cards,primary),valid=validateDeck(cards,ownedRows,primary);
      if(!valid.ok||analysis.unpowerable.length||analysis.missingEnergyTypes.length||analysis.warnings.some(w=>w.code==='orphan'))continue;
      candidatesEvaluated++;
      const selected=cards.map(data.cardById),trainerSupport=selected.filter(c=>c.kind==='trainer').reduce((s,c)=>s+trainerValue(c),0),basics=selected.filter(c=>c.kind==='pokemon'&&c.stage==='Basic').length;
      const evaluation={legality:1,energyViability:1,evolutionCompleteness:1,setupConsistency:Math.min(6,basics)*5+evolutions*2,synergy:selected.filter(c=>c.kind==='pokemon').reduce((s,c)=>s+affinity(c),0)/10,attackerAvailability:selected.filter(c=>c.kind==='pokemon').reduce((s,c)=>s+value(c),0),trainerSupport,deadCardRisk:Math.max(0,basics-6)*12};
      const score=evaluation.setupConsistency+evaluation.synergy+evaluation.attackerAvailability+trainerSupport-evaluation.deadCardRisk-primary.length*30;
      const finalScore=score-strategyWarnings.length*80;
      if(!best||finalScore>best.score)best={ok:true,cards,energyTypes:primary,errors:[],warnings:[...analysis.warnings,...strategyWarnings],strategy:`${primary.join(' / ')} · ${seed.card.name} core · ${selected.filter(c=>c.kind==='pokemon').length} Pokémon / ${selected.filter(c=>c.kind==='trainer').length} Trainers`,focusCardId:seed.card.id,score:finalScore,evaluation};
    }
    if(best){best.candidatesEvaluated=candidatesEvaluated;return best;}return fail('Not enough compatible owned copies to build a coherent 20-card deck with complete evolution lines. Add suitable Pokémon/Trainers or use a manual experimental deck.');
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
