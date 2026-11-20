#!/usr/bin/env python3
"""Wire BW5 verified rules into Classic battle effect/core hooks (idempotent)."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FX=ROOT/'app/src/main/assets/tcgp-battle-effects.js'
CORE=ROOT/'app/src/main/assets/tcgp-battle-core.js'
fx=FX.read_text(); core=CORE.read_text()
def once(text,needle,patch):
 if needle not in text: raise RuntimeError('Anchor missing '+needle[:90])
 return text.replace(needle,patch,1)
if 'function bw5Rule(e,ctx)' not in fx:
 rule=(ROOT/'scripts/bw5_runtime_rule.txt').read_text()
 # Hand redraw is an actual hand-to-deck shuffle, no generated cards.
 rule=once(rule,"    if(key==='softboiled')",'''    if(key==='tagDraw'){
      us.deck.push(...us.hand.splice(0));ctx.shuffle?.(ctx.state,us.deck);
      const amount=us.bench.some(p=>card(p)?.name==='Minun')?8:4;
      for(let i=0;i<amount&&canHand(us)&&us.deck.length;i++)ctx.drawCard(us);
      return;
    }
    if(key==='lurePoison'){
      const p=foe.bench.find(x=>x.uid===String(ctx.action?.effectSelection||''));
      if(!p)return;switchPokemon(foe,p.benchSlot,ctx.state);
      applyEffect({type:'status',target:'opponentActive',status:'poison'},ctx);return;
    }
    if(key==='electrishower'){
      for(const p of theirs()){p.damage=Number(p.damage||0)+10;log({target:p.uid,damage:10});}return;
    }
    if(key==='negativeIon'||key==='ferociousBellow'){
      if(d)ctx.state.modifiers.push({type:'modifier',ownerSide:ctx.foeSide,sourceSide:ctx.side,sourceUid:a?.uid,
        targetUid:d.uid,filter:{},stat:'attackDamage',amount:-30,expiresTurn:turn+1});return;
    }
    if(key==='softboiled')''')
 # All Energy action choices validate the recorded option; 'decline' never discards.
 rule=once(rule,"    if(key==='fireSlash'||key==='electrigun'||key==='burningWind'){",'''    if(key==='fireSlash'||key==='electrigun'||key==='chuck'){
      if(!ctx.action?.effectSelection)return;
      if(key==='chuck'){
        for(const uid of String(ctx.action.effectSelection).split(',').filter(Boolean)){
          const i=us.hand.findIndex(r=>r.uid===uid&&card(r)?.trainerType==='Tool');
          if(i>=0)us.discard.push(...us.hand.splice(i,1));
        }return;
      }
      const source=sourceEnergy(a,key==='electrigun'?'Lightning':'Fire').find(x=>x.uid===ctx.action.effectSelection||x.type==='basic:'+ctx.action.effectSelection||x.type===ctx.action.effectSelection);
      if(!source)return;
      if(source.type){a.energy[source.type]--;recordDiscardedEnergy(us,source.type,1);}
      else{const i=(a.specialEnergy||[]).findIndex(r=>r.uid===source.uid);if(i>=0)us.discard.push(...a.specialEnergy.splice(i,1));}
      return;
    }
    if(key==='fireSlash'||key==='electrigun'||key==='burningWind'){''')
 rule=once(rule,"    if(key==='stunningUppercut'){",'''    if(['hotLick','shotInDark','attackCommand','electrisilk','handPress','giantClaw','bombast','brutalBash','darkRush','specialFang','blowThrough','reinforcedDrill','furyCutter','stunningUppercut'].includes(key))return;
    if(key==='stunningUppercut'){''')
 # No duplicate fury-cutter / uppercut rolls on applyEffect; pre-damage owns these.
 rule=rule.replace("    if(key==='stunningUppercut'){const first=flip(),second=flip();if(first&&second)applyEffect(ST('paralysis'),ctx);return;}\n",'')
 rule=rule.replace("    if(key==='furyCutter'){const n=[flip(),flip(),flip()].filter(Boolean).length;if(d)d.damage=Number(d.damage||0)+[0,10,30,60][n];return;}\n",'')
 # Old Amber's optional decline option has no corresponding deck index and must never bench.
 rule=rule.replace("if(x&&room){const i=us.deck.findIndex", "if(x&&room&&Number(act.choiceOption)<available.length){const i=us.deck.findIndex")
 # Old Amber id displayed correctly as 'Restored' stage; choose an existing ref.
 fx=once(fx,"  function neoRule(e,ctx){",rule+"\n  function neoRule(e,ctx){\n    if(String(e.rule||'').startsWith('bw5:'))return bw5Rule(e,ctx);")

if "// Dark Explorers: printed conditional damage" not in fx:
 block='''      // Dark Explorers: printed conditional damage and coin gates resolve before
      // type matchup. Cards that move actual Energy/Items are applied afterwards.
      if(e.type==='neoRule'&&String(e.rule||'').startsWith('bw5:')){
        const k=e.rule.slice(4),us=own(ctx),foe=other(ctx),a=ctx.attacker,d=ctx.defender,c=p=>ctx.cardById(p?.cardId);
        const roll=n=>{const results=Array.from({length:n},()=>coin(ctx));ctx.state.log.push({type:'coin',side:ctx.side,reason:ctx.attack?.name,results,heads:results.filter(Boolean).length});return results.filter(Boolean).length;};
        const energyType=(p,t)=>Number(p?.energy?.[t]||0)>0||(p?.specialEnergy||[]).some(r=>{const prov=r.provides||c(r)?.effect?.provides||{};return Number(prov[t]||0)>0||Number(prov.Rainbow||0)>0||Number(prov.Miracle||0)>0||c(r)?.name==='Rainbow Energy';});
        if(k==='hotLick'){if(c(d)?.name==='Durant')damage+=50;return;}
        if(k==='shotInDark'){if(roll(2)<2)damage=0;return;}
        if(k==='attackCommand'){damage=10*(pokemonOn(us).length+pokemonOn(foe).length);return;}
        if(k==='electrisilk'){if((ctx.retreatCost?.(ctx.foeSide)??c(d)?.retreat??0)===0)damage+=40;return;}
        if(k==='handPress'){if(us.hand.length>foe.hand.length)damage+=30;return;}
        if(k==='giantClaw'){if(Number(d?.damage||0)>=20)damage+=40;return;}
        if(k==='reinforcedDrill'){if(a?.tool||(a?.extraTools||[]).length)damage+=30;return;}
        if(k==='bombast'){damage=40*Number(us.prizesTaken||0);return;}
        if(k==='brutalBash'){damage=20*pokemonOn(us).filter(p=>c(p)?.types?.includes('Darkness')).length;return;}
        if(k==='darkRush'){damage=20*Math.floor(Number(a?.damage||0)/10);return;}
        if(k==='specialFang'){if((a?.specialEnergy||[]).length)damage+=40;return;}
        if(k==='blowThrough'){if(ctx.state.stadium)damage+=30;return;}
        if(k==='furyCutter'){damage+=[0,10,30,60][roll(3)];return;}
        if(k==='stunningUppercut'){const heads=roll(2);if(heads===0)damage=0;if(heads===2)pending.push({type:'status',target:'opponentActive',status:'paralysis'});return;}
        if(k==='fireSlash'||k==='electrigun'){
          if(ctx.action?.effectSelection){damage+=k==='fireSlash'?30:40;pending.push(e);}return;
        }
        if(k==='chuck'){
          const uids=String(ctx.action?.effectSelection||'').split(',').filter(Boolean),cnt=uids.filter(uid=>us.hand.some(r=>r.uid===uid&&c(r)?.trainerType==='Tool')).length;
          damage=40*cnt;if(cnt)pending.push(e);return;
        }
        if(k==='lurePoison'){pending.push(e);return;}
        if(k==='electrishower'){damage=0;pending.push(e);return;}
        if(k==='voltBolt'){damage=0;pending.push(e);return;}
        if(['negativeIon','ferociousBellow','stunningUppercut','furyCutter'].includes(k)){pending.push(e);return;}
        pending.push(e);return;
      }
'''
 fx=once(fx,'      // Next Destinies: custom dynamic damage applies before matchup.',block+'      // Next Destinies: custom dynamic damage applies before matchup.')

if "// BW5 attack decisions" not in fx:
 block='''    // BW5 attack decisions: select the physical source *before* matching damage.
    if(effect?.type==='neoRule'&&String(effect.rule||'').startsWith('bw5:')){
      const k=effect.rule.slice(4),a=ctx.attacker,us=own(ctx),foe=other(ctx),c=r=>ctx.cardById(r?.cardId);
      const sources=type=>[...Object.entries(a?.energy||{}).filter(([t,n])=>Number(n)>0&&t===type).map(([t])=>({id:t,label:t+' Basic Energy'})),
        ...(a?.specialEnergy||[]).filter(ref=>{const p=ref.provides||c(ref)?.effect?.provides||{};return Number(p[type]||0)>0||Number(p.Rainbow||0)>0||c(ref)?.name==='Rainbow Energy';}).map(ref=>({id:ref.uid,label:c(ref)?.name+' Special Energy'}))];
      if(['fireSlash','electrigun'].includes(k))return [{effectSelection:'',choiceLabel:'Keep Energy — printed base damage'},...sources(k==='fireSlash'?'Fire':'Lightning').map(s=>({effectSelection:s.id,choiceLabel:'Discard '+s.label+' for +'+(k==='fireSlash'?'30':'40')+' damage'}))];
      if(k==='chuck'){
        const tools=us.hand.filter(ref=>c(ref)?.trainerType==='Tool'),options=[{effectSelection:'',choiceLabel:'Discard no Tools — 0 damage'}];
        const combos=(index,selected)=>{if(selected.length)options.push({effectSelection:selected.map(r=>r.uid).join(','),choiceLabel:'Discard '+selected.length+' Tool'+(selected.length===1?'':'s')+' — '+40*selected.length+' damage'});
          for(let i=index;i<tools.length;i++)combos(i+1,[...selected,tools[i]]);};combos(0,[]);return options;
      }
      if(k==='lurePoison')return foe.bench.map(p=>({effectSelection:p.uid,choiceLabel:'Switch '+c(p)?.name+' into Active and Poison it'}));
      if(k==='tagDraw'&&us.deck.length===0)return [];
      if(k==='floralFragrance'&&(us.hand.length>=Number(us.handLimit||8)||!us.deck.some(r=>c(r)?.kind==='pokemon')))return [];
      if(k==='divingDraw'&&(!us.hand.length||!us.deck.length))return [];
      if(k==='darkPatch'&&!(us.energyDiscard?.Darkness>0||us.discard.some(r=>c(r)?.basicEnergy&&c(r)?.subtype==='Darkness')))return [];
      return [{}];
    }
'''
 fx=once(fx,'  function choicesForEffect(effect,ctx){','  function choicesForEffect(effect,ctx){\n'+block)

if "// Dark Explorers continuous damage Auras" not in fx:
 tgt="    if(state?.format==='classic'&&stat==='attackDamage'&&Number(state.sides[side]?.hgss4BlackBeltUntil||-1)===Number(state.turnNumber)&&state.sides[side].active===slot)"
 add='''    // Dark Explorers continuous damage Auras. Suppression is evaluated on
    // the source Pokémon and Tools apply only to their own eligible holder.
    if(state?.format==='classic'&&stat==='attackDamage'&&state.sides[side].active===slot){
      for(const p of pokemonOn(state.sides[side]))if(p.cardId==='bw5-53'&&!abilitiesSuppressed(state,side,p,cardById))values.push(10);
      if(cardById(slot.cardId)?.types?.includes('Darkness')&&toolsOf(slot).some(ref=>ref.cardId==='bw5-92'))values.push(20);
    }
'''
 fx=once(fx,tgt,add+tgt)

if "// Solar Revelation (BW5" not in fx:
 tgt='  function protectedFromEffects(slot,ctx){'
 rep='''  function protectedFromEffects(slot,ctx){
    // Solar Revelation (BW5 Espeon): attached Energy prevents effects of
    // opposing attacks, never damage; own effects still resolve normally.
    if(ctx?.isAttack&&ctx?.state?.format==='classic'&&slot&&
       (Object.values(slot.energy||{}).some(n=>Number(n)>0)||(slot.specialEnergy||[]).length)){
      const holder=energyOwner(ctx,slot),side=holder===ctx.state.sides?.player?'player':holder===ctx.state.sides?.opponent?'opponent':null;
      if(side&&side!==ctx.side&&pokemonOn(holder).some(p=>p.cardId==='bw5-48'&&!abilitiesSuppressed(ctx.state,side,p,ctx.cardById)))return true;
    }
'''
 fx=once(fx,tgt,rep)

if "// Dark Explorers Dark Cloak" not in core:
 tgt='  function retreatCost(state,side){const slot=state.sides[side].active;'
 rep='''  function retreatCost(state,side){const slot=state.sides[side].active;
    // Dark Explorers Dark Cloak covers every allied Pokémon with any Darkness
    // Energy, including a compatible Rainbow-providing Special Energy.
    if(state.format==='classic'&&slot&&pokemonOn(state.sides[side]).some(p=>['bw5-63','bw5-107'].includes(p.cardId)&&!effects.abilitiesSuppressed(state,side,p,data.cardById))&&
       Number(effectiveEnergy(state,side,slot).Darkness||0)>0)return 0;
'''
 core=once(core,tgt,rep)

if "// BW5 Slowbro Airhead" not in core:
 tgt="    if (s.active&&!conditions.paralysis&&Number(s.active.ex11AttackLockUntil||0)!==Number(state.turnNumber)){"
 rep="""    // BW5 Slowbro Airhead: even Prize counts (2/4/6) prohibit its attacks.
    const bw5Airhead=state.format==='classic'&&s.active?.cardId==='bw5-24'&&
      !effects.abilitiesSuppressed(state,side,s.active,data.cardById)&&[2,4,6].includes(Number(s.prizes?.length||0));
    if (s.active&&!bw5Airhead&&!conditions.paralysis&&Number(s.active.ex11AttackLockUntil||0)!==Number(state.turnNumber)){"""
 core=once(core,tgt,rep)

if "// BW5 Scorching Scales" not in core:
 tgt="const burnDamage=Math.max(aura||fullFlame?40:20,Number(slot.dp2TorridDamage||0));"
 rep='''// BW5 Scorching Scales: four instead of two counters on the opposing
      // Burned Active between turns; independent of ordinary burn coin flips.
      const scorch=state.format==='classic'&&pokemonOn(state.sides[side==='player'?'opponent':'player']).some(p=>p.cardId==='bw5-22'&&!effects.abilitiesSuppressed(state,side==='player'?'opponent':'player',p,data.cardById));
      const burnDamage=Math.max(aura||fullFlame||scorch?40:20,Number(slot.dp2TorridDamage||0));'''
 core=once(core,tgt,rep)

FX.write_text(fx);CORE.write_text(core)
print('BW5 runtime integration wired')
