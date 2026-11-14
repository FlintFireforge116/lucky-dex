#!/usr/bin/env node
'use strict';
/**
 * LuckyDex Classic expansion preflight. Run from Termux:
 *   cd ~/lucky-dex/source && node scripts/audit-classic-set.cjs --set dp2
 *   node scripts/audit-classic-set.cjs --set dp2 --smoke
 *   node scripts/audit-classic-set.cjs --all --no-cpu
 * The default set comes from source/data/classic-card-audit-contract.json.
 *
 * Distinguishes definite catalog/schema errors from printed-rule/UI decisions
 * which cannot be proven by catalog inspection or permissive attack smokes.
 */
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const CONTRACT=require('../data/classic-card-audit-contract.json');
const DEFAULT_TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const ENERGY_CODES={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RE_PLAUSIBLE_PURE_DAMAGE=/^\s*(?:(?:this )?attack (?:does|is)|deal(?:s)? )?\d+\s*damage\.?\s*$/i;
const PLACEHOLDER=/special effect|not yet battle.enabled|battle use requires outcome verification|printed power or body remains gated|effect not implemented|under implementation review|battle entry gated|awaiting battle timing|todo\b|tbd\b/i;
const EFFECT_CHILDREN=['effect','heads','tails','then','else','onHeads','onTails','success','failure','before','after','trueEffect','falseEffect'];
const PATTERNS=Object.fromEntries(Object.entries(CONTRACT.riskPatterns).map(([k,v])=>[k,new RegExp(v,'i')]));
const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const unique=x=>[...new Set(x)];
function walkEffects(v,callback,seen=new Set()){
 if(!v||typeof v!=='object'||seen.has(v))return;
 seen.add(v);
 if(Array.isArray(v)){v.forEach(x=>walkEffects(x,callback,seen));return;}
 if(typeof v.type==='string')callback(v);
 for(const [key,child] of Object.entries(v)){
  if(key==='filter'||key==='condition'||key==='sourceFilter'||key==='opponentFilter'||key==='damageRule')continue;
  if(EFFECT_CHILDREN.includes(key)||['effects','options','steps','branches','children'].includes(key))walkEffects(child,callback,seen);
 }
}
function parseCli(argv){
 const args={set:CONTRACT.defaultSetId||'dp2',all:false,cpu:true,smoke:false,write:true,out:null,help:false};
 for(let i=0;i<argv.length;i++){
  const a=argv[i];
  if(a==='--set'){if(!argv[i+1])throw Error('--set needs a set id');args.set=argv[++i].toLowerCase();}
  else if(a==='--all')args.all=true;
  else if(a==='--cpu')args.cpu=true;
  else if(a==='--no-cpu')args.cpu=false;
  else if(a==='--smoke')args.smoke=true;
  else if(a==='--no-smoke')args.smoke=false;
  else if(a==='--out'){if(!argv[i+1])throw Error('--out needs a path');args.out=argv[++i];}
  else if(a==='--no-write')args.write=false;
  else if(a==='--help'||a==='-h')args.help=true;
  else throw Error('Unknown flag: '+a);
 }
 if(args.all&&args.smoke)throw Error('Use --smoke with one --set (avoids thousands of unchecked fake-board scenarios)');
 if(args.all&&args.out)throw Error('Use --all without --out so each set gets an independent report path');
 return args;
}
function evidenceIndex(dir){
 const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(x=>/\.test\.cjs$/.test(x)):[];
 const result=[];
 for(const filename of files){
  const content=fs.readFileSync(path.join(dir,filename),'utf8');
  result.push({file:filename,content});
 }
 return result;
}
function gatherRisks(card){
 const text=[card.text,...(card.attacks||[]).map(a=>a.text),...(card.abilities||[]).map(a=>a.text)].filter(Boolean).join(' ');
 return Object.entries(PATTERNS).filter(([,rx])=>rx.test(text)).map(([name])=>name);
}
function findUnimplementedEffect(effect){
 const reasons=[];
 walkEffects(effect,node=>{if(node.type==='unsupported'||node.type==='partial')reasons.push(node.type);});
 return reasons;
}
function auditSet(setId, context){
 const {data,fx,opponents,core,testIndex=[],smoke=false,cpu=true,engineText=''}=context;
 const cards=data.CARDS.filter(c=>String(c.setId||'').toLowerCase()===setId.toLowerCase());
 if(!cards.length)throw Error(`Unknown or empty Classic set "${setId}"`);
 const findings=[];
 const emit=(severity,rule,id,message)=>findings.push({severity,rule,cardId:id,message});
 const knownCards=data.CARDS;
 const knownNames=new Set(knownCards.map(c=>String(c.name||'').toLowerCase()));
 const setDef=context.setDefs?.[setId];
 const seen=new Set(),perCard=[];
 const counts={pokemon:0,trainer:0,energy:0,attacks:0,abilities:0,enabled:0,gated:0};
 const isFullSet=cards.every(c=>c.battleEnabled);
 if(setDef&&Number(setDef.cardCount)&&cards.length!==Number(setDef.cardCount))
  emit('error','C-AUDIT-001',null,`Registry has ${cards.length} prints; declared ${setDef.cardCount}.`);
 for(const c of cards){
  if(seen.has(c.id))emit('error','C-AUDIT-001',c.id,'Duplicate collector print ID.');
  seen.add(c.id);
  counts[c.kind]=(counts[c.kind]||0)+1;
  if(c.battleEnabled)counts.enabled++;else counts.gated++;
  const thisCard=[];
  const issue=(severity,rule,message)=>{emit(severity,rule,c.id,message);thisCard.push({severity,rule,message});};
  if(!c.id||!c.name)issue('error','C-AUDIT-001','Missing card identity.');
  if(!c.setId||String(c.setId).toLowerCase()!==setId.toLowerCase())issue('error','C-AUDIT-001','Set ID does not match requested set.');
  if(data.cardById(c.id)!==c)issue('error','C-AUDIT-001','Main battle registry cannot resolve this exact card object.');
  if(c.battleEnabled&&c.support?.status==='PARTIAL')issue('error','C-AUDIT-001','Enabled card is still marked PARTIAL.');
  if(!c.battleEnabled&&c.support?.status==='FULL')issue('error','C-AUDIT-001','Gated card is marked FULL.');
  if(c.battleEnabled&&c.support&&Array.isArray(c.support.reasons)&&c.support.reasons.length)issue('warning','C-AUDIT-001','Enabled card retains unaddressed support reasons.');
  if(c.battleEnabled&&c.deckEligible===false&&c.kind==='pokemon'&&!c.labDummy)issue('warning','C-AUDIT-001','Enabled Pokémon is excluded from deck building; verify intentional.');
  const abilityList=[...(c.abilities||[]),...(c.ability?[c.ability]:[])];
  const effects=[];
  if(c.kind==='pokemon'){
   counts.attacks+=(c.attacks||[]).length;counts.abilities+=abilityList.length;
   if(!['Basic','Stage 1','Stage 2','Level-Up','Baby','BREAK','VSTAR','VMAX'].includes(c.stage))issue('warning','C-AUDIT-003',`Unexpected Pokémon stage: ${c.stage}`);
   if(!Number.isFinite(Number(c.hp))||Number(c.hp)<=0)issue('error','C-AUDIT-003','Pokémon HP is missing or invalid.');
   if(!Array.isArray(c.types)||!c.types.length)issue('warning','C-AUDIT-003','Pokémon has no attack/identity type.');
   if(c.stage!=='Basic'&&c.stage!=='Baby'&&!c.evolvesFrom&&!c.levelUpFrom)issue('warning','C-AUDIT-003','Evolution is missing evolvesFrom/levelUpFrom.');
   if(c.evolvesFrom&&!knownNames.has(String(c.evolvesFrom).toLowerCase())&&!(c.id==='dp3-33'&&['Burmy Plant Cloak','Burmy Sandy Cloak','Burmy Trash Cloak'].every(n=>knownNames.has(n.toLowerCase()))))issue('warning','C-AUDIT-003',`Evolution parent "${c.evolvesFrom}" is absent by exact name from the full catalog; verify alternate spelling or Fossil support.`);
   if(c.stage==='Level-Up'&&!c.levelUpFrom&&!c.evolvesFrom)issue('warning','C-AUDIT-003','Level-Up Pokémon has no prerequisite identity.');
   if(c.battleEnabled&&!Array.isArray(c.attacks))issue('error','C-AUDIT-002','Enabled Pokémon has no attacks array.');
   for(const [i,a] of (c.attacks||[]).entries()){
    if(!a.name)issue('error','C-AUDIT-002',`Attack ${i+1} has no name.`);
    if(a.cost===undefined||a.cost===null)issue('warning','C-AUDIT-003',`Attack ${a.name||i} has no Energy cost field.`);
    if(typeof a.cost==='string')for(const code of a.cost)if(!ENERGY_CODES[code])issue('warning','C-AUDIT-003',`Attack ${a.name} has unknown Energy cost code ${code}.`);
    if(c.battleEnabled&&PLACEHOLDER.test(String(a.text||'')))issue('error','C-AUDIT-002',`Attack ${a.name} still has placeholder printed text.`);
    if(c.battleEnabled&&!a.effect)issue('error','C-AUDIT-002',`Attack ${a.name} has no effect object.`);
    effects.push({label:`attack ${a.name||i}`,value:a.effect,printed:a.text,attack:a});
   }
   for(const [i,a] of abilityList.entries()){
    if(!a.name)issue('warning','C-AUDIT-002',`Ability ${i+1} is unnamed.`);
    if(c.battleEnabled&&PLACEHOLDER.test(String(a.text||'')))issue('error','C-AUDIT-002',`Ability ${a.name||i} still has a gated placeholder.`);
    if(c.battleEnabled&&!a.effect)issue('error','C-AUDIT-002',`Ability ${a.name||i} is missing an effect object.`);
    effects.push({label:`ability ${a.name||i}`,value:a.effect,printed:a.text,ability:true});
   }
   if(c.battleEnabled&&!isObj(c.deckMeta))issue('warning','C-AUDIT-003','No deckMeta object: autobuilder synergy/energy cues cannot be inspected.');
   if(c.battleEnabled&&isObj(c.deckMeta)){
    for(const field of ['roles','synergy','energyTypes','preferredPartners'])if(c.deckMeta[field]!==undefined&&!Array.isArray(c.deckMeta[field]))issue('warning','C-AUDIT-003',`deckMeta.${field} should be an array.`);
    for(const type of c.deckMeta.energyTypes||[])if(!DEFAULT_TYPES.includes(type)&&type!=='Colorless')issue('warning','C-AUDIT-003',`Unknown deckMeta Energy type: ${type}.`);
    const required=unique((c.attacks||[]).filter(a=>typeof a.cost==='string').flatMap(a=>[...a.cost].map(code=>ENERGY_CODES[code]).filter(t=>t&&t!=='Colorless')));
    if(required.length&&Array.isArray(c.deckMeta.energyTypes)&&!required.some(type=>c.deckMeta.energyTypes.includes(type)))issue('warning','C-AUDIT-003',`Printed attack costs ${required.join('/')} have no overlap with deckMeta.energyTypes; check autobuilder resource plan.`);
   }
  }else if(c.kind==='trainer'||c.kind==='energy'){
   effects.push({label:'card effect',value:c.effect,printed:c.text});
   if(c.battleEnabled&&c.kind==='trainer'&&PLACEHOLDER.test(String(c.text||'')))issue('error','C-AUDIT-002','Trainer still has placeholder printed text.');
  }else issue('warning','C-AUDIT-001',`Unexpected card kind: ${c.kind}.`);
  const nodes=[],rules=[];
  for(const e of effects){
   if(c.battleEnabled&&e.value!==undefined){
    const schema=fx.validateEffect(e.value);
    for(const msg of schema)issue('error','C-AUDIT-002',`${e.label}: ${msg}`);
    for(const reason of findUnimplementedEffect(e.value))issue('error','C-AUDIT-002',`${e.label}: explicit incomplete effect ${reason}.`);
   }
   walkEffects(e.value,node=>{
    nodes.push(node.type);
    if(['neoRule','lentalRule','gymRule'].includes(node.type)&&node.rule){rules.push(node.rule);
      // The shared engine frequently dispatches on the suffix after set/card prefix.
      // This is a *review* if no literal appears, not a proof of missing support.
      const tail=node.rule.split(':').at(-1);
      const number=node.rule.split(':')[1];
      const variants=[node.rule,`'${number}:${tail}'`,`"${number}:${tail}"`,`rule==='${tail}'`,`rule==="${tail}"`];
      if(engineText&&!variants.some(v=>engineText.includes(v))&&!engineText.includes(`'${setId}-${number}'`))issue('review','C-AUDIT-002',`${e.label}: custom rule ${node.rule} has no obvious source literal; inspect dispatcher.`);
    }
   });
   if(c.battleEnabled&&e.value?.type==='noop'){
    const printed=String(e.printed||'').trim();
    if(e.ability&&printed)issue('review','C-AUDIT-002',`${e.label}: no-op effect; verify separately implemented passive/continuous rule.`);
    else if(e.attack&&printed&&!RE_PLAUSIBLE_PURE_DAMAGE.test(printed)&&/(?:\b(?:may|flip|damage|draw|discard|attach|shuffle|search|poison|sleep|switch|heal|return|choose|look)\b)/i.test(printed))issue('review','C-AUDIT-002',`${e.label}: no-op effect despite conditional printed text; verify custom attack resolver.`);
    else if(c.kind==='trainer')issue('review','C-AUDIT-002',`${e.label}: no-op Trainer/Stadium effect; verify shared continuous rule.`);
   }
  }
  const risks=gatherRisks(c);
  const idPattern=new RegExp(`\\b${String(c.id).replace(/[^a-zA-Z0-9-]/g,'')}(?![0-9])`);
  const evidence=testIndex.filter(file=>idPattern.test(file.content)).map(file=>file.file);
  perCard.push({id:c.id,name:c.name,kind:c.kind,battleEnabled:!!c.battleEnabled,attackCount:(c.attacks||[]).length,abilityCount:abilityList.length,riskTags:risks,effectTypes:unique(nodes),customRules:unique(rules),testFilesMentioningId:evidence,findings:thisCard});
 }
 const duplicateIds=knownCards.reduce((acc,c)=>{acc.set(c.id,(acc.get(c.id)||0)+1);return acc;},new Map());
 for(const id of seen)if(duplicateIds.get(id)!==1)emit('error','C-AUDIT-001',id,'Globally ambiguous card ID (more than one registry entry).');
 let cpuResult=null;
 if(cpu){
  cpuResult={attempted:0,valid:0,failures:[]};
  for(const type of DEFAULT_TYPES)for(const seed of [3,17]){
   cpuResult.attempted++;
   try{
    const build=opponents.generate({sets:[setId],type,seed});
    const problems=!build?.ok?[String(build?.reason||'builder did not return a deck')]:[];
    if(build?.ok){if(build.cards?.length!==30)problems.push(`Expected 30 cards, got ${build.cards?.length}`);const validation=data.validateDeck(build.cards);if(validation?.errors?.length)problems.push(...validation.errors.map(String));}
    if(problems.length)cpuResult.failures.push({type,seed,problems});else cpuResult.valid++;
   }catch(error){cpuResult.failures.push({type,seed,problems:[String(error.message||error)]});}
  }
  for(const f of cpuResult.failures)emit(isFullSet?'error':'review','C-AUDIT-005',null,`CPU ${f.type} seed ${f.seed}: ${f.problems.join('; ')}`);
 }
 let smokeResult=null;
 if(smoke&&core)smokeResult=runSmokes(cards,{data,core,opponents});
 if(smokeResult)for(const f of smokeResult.failures)emit('review','C-AUDIT-007',f.cardId,`${f.action}: ${f.reason}`);
 const summary={setId,setName:setDef?.name||null,total:cards.length,declared:setDef?.cardCount??null,counts,risks:Object.fromEntries(Object.keys(PATTERNS).map(k=>[k,perCard.filter(c=>c.riskTags.includes(k)).length])),withStaticTestMentions:perCard.filter(c=>c.testFilesMentioningId.length).length,errors:findings.filter(f=>f.severity==='error').length,warnings:findings.filter(f=>f.severity==='warning').length,reviewFlags:findings.filter(f=>f.severity==='review').length};
 return {schemaVersion:1,contract:CONTRACT.sourceOfTruth,scope:'Static preflight + optional synthetic execution, not printed correctness or Android certification',summary,findings,cardLedger:perCard,cpu:cpuResult,smoke:smokeResult};
}
function runSmokes(cards,{data,core,opponents}){
 // In a staged expansion, there may be too few enabled Basics to form a
 // self-contained 30-card loaner. Use an audited complete set to construct
 // the disposable board instead of silently skipping every new attack.
 let sample=opponents.generate({sets:[cards[0].setId],type:'Grass',seed:23});
 if(!sample?.ok)sample=opponents.generate({sets:['dp2'],type:'Grass',seed:23});
 if(!sample?.ok)return {attempted:0,executed:0,skipped:0,skippedDetails:[],failures:[{cardId:null,action:'setup',reason:'Could not build a legal loaner deck'}]};
 const baseTypes=DEFAULT_TYPES;
 const result={attempted:0,executed:0,skipped:0,skippedDetails:[],failures:[]};
 function scene(id,side){
  const s=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,seed:42,firstSide:side,playerEnergyTypes:baseTypes,opponentEnergyTypes:baseTypes});
  s.phase='battle';s.activeSide=side;s.turnNumber=10;
  for(const key of ['player','opponent']){
   const sb=s.sides[key];sb.turnCount=8;sb.bench=[];sb.hand=[];
   const p=core.makePokemonSlot(key===side?id:'dp1-17',3,key+'-active');
   p.energy={Grass:12,Fire:12,Water:12,Lightning:12,Psychic:12,Fighting:12,Darkness:12,Metal:12,Colorless:12};sb.active=p;
   const b=core.makePokemonSlot('dp1-94',3,key+'-bench');b.benchSlot=0;b.energy={Water:2};sb.bench=[b];
  }
  return s;
 }
 for(const card of cards.filter(c=>c.battleEnabled&&(c.kind==='pokemon'||c.kind==='trainer'))){
  for(const side of ['player','opponent'])for(let ix=0;ix<(card.kind==='pokemon'?(card.attacks||[]).length:1);ix++){
   result.attempted++;
   const actionName=card.kind==='trainer'?'trainer':`attack ${card.attacks[ix]?.name||ix}`;
   try{
    const s=scene(card.kind==='pokemon'?card.id:'dp1-17',side);
    if(card.kind==='trainer'){
      s.sides[side].hand=[{cardId:card.id,uid:'auditor-trainer'}];
      // Healing Items are legal only when there is a damaged recipient.
      if(card.effect?.type==='heal')s.sides[side].active.damage=20;
    }
    const actions=core.legalActions(s,side);
    const action=actions.find(a=>card.kind==='trainer'?a.type==='trainer'&&a.cardId===card.id:a.type==='attack'&&a.attackIndex===ix&&(!a.attackCardId||a.attackCardId===card.id));
    if(!action){result.skipped++;result.skippedDetails.push({cardId:card.id,side,action:actionName});continue;}
    core.applyAction(s,side,action);
    let n=0;
    while(s.phase==='effectChoice'&&n++<35){
      const choices=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');
      if(!choices.length)break;
      const rule=String(s.pendingChoice?.effect?.rule||'');
      const stage=s.pendingChoice?.effect?.stage;
      const choice=stage==='foeRock'?(choices.find(a=>Number(a.choiceOption)===1)||choices.at(-1)):
        ((rule==='dp2:7:leafTornado'&&n>1)||(rule==='dp3:27:batonPass'&&stage==='move'&&n>2))?(choices.find(a=>a.choiceSkip)||choices[0]):
        (choices.find(a=>!a.choiceSkip)||choices[0]);
      core.applyAction(s,s.choiceSide,choice);
    }
    if(s.phase==='effectChoice')result.failures.push({cardId:card.id,action:actionName,reason:'Unresolved effectChoice after synthetic scenario (may lack required setup)'});
    else result.executed++;
   }catch(e){result.failures.push({cardId:card.id,action:actionName,reason:String(e.stack||e).split('\n')[0]});}
  }
 }
 return result;
}
function toMarkdown(report){
 const s=report.summary;
 const rows=[`# LuckyDex Classic audit — ${s.setId}${s.setName?' / '+s.setName:''}`,'',
 `**Status:** ${s.errors?'BLOCKED by '+s.errors+' definite checks':'No definite catalog/schema failures'}; ${s.warnings} warnings; ${s.reviewFlags} follow-up flags.`,
 '',`**Coverage:** ${s.counts.enabled}/${s.total} enabled, ${s.counts.gated} gated. ${s.counts.attacks} attacks, ${s.counts.abilities} named abilities; ${s.withStaticTestMentions}/${s.total} IDs mentioned in test files (mentions are not proof).`,
 '',`**Source contract:** \`${report.contract}\`.`,
 '', '## Mechanical risk inventory', '', '| Category | Cards needing scenarios |','|---|---:|',
 ...Object.entries(s.risks).map(([k,v])=>`| ${k} | ${v} |`),
 '', '## Generated CPU decks','',report.cpu?`${report.cpu.valid}/${report.cpu.attempted} legal 30-card decks across eight Energy types (two seeds each).`:'Not requested.',
 '', '## Synthetic battle action checks','',report.smoke?`${report.smoke.executed}/${report.smoke.attempted} actions executed; ${report.smoke.skipped} skipped (not necessarily defects); ${report.smoke.failures.length} scenario exceptions/unresolved choices.`:'Not requested (run with --smoke).',
 '', '## Definite failures and warnings',''];
 const high=report.findings.filter(f=>f.severity!=='review');
 if(!high.length)rows.push('None identified by these checks.');
 for(const f of high)rows.push(`- **${f.severity.toUpperCase()}** ${f.cardId||'SET'} [${f.rule}] ${f.message}`);
 rows.push('','## Needs manual rule / UI review','');
 const flagged=report.cardLedger.filter(c=>c.riskTags.length||c.findings.some(f=>f.severity==='review'));
 rows.push(`Risk tags are prompts for scenario tests, not automatic implementation failures. ${flagged.length} cards flagged.`,'');
 for(const c of flagged){
  const extra=c.findings.filter(f=>f.severity==='review').map(f=>f.message);
  rows.push(`- **${c.id} ${c.name}** — ${c.riskTags.join(', ')||'source review'}${extra.length?'; '+extra.join('; '):''}`);
 }
 rows.push('','## Card ledger','', '| Print | Status | Attacks | Powers | Risks | Test-file mentions |','|---|---|---:|---:|---|---:|');
 for(const c of report.cardLedger)rows.push(`| ${c.id} ${c.name.replace(/\|/g,'/')} | ${c.battleEnabled?'enabled':'gated'} | ${c.attackCount} | ${c.abilityCount} | ${c.riskTags.join(', ')} | ${c.testFilesMentioningId.length} |`);
 rows.push('','## Boundaries','',
 '- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.',
 '- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.',
 '- The auditor does not execute Android UI, animation, coin-display or real-device tests.',
 '- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.','');
 return rows.join('\n')+'\n';
}
function runCli(argv){
 const args=parseCli(argv);
 if(args.help){process.stdout.write('Usage: node scripts/audit-classic-set.cjs [--set dp2 | --all] [--smoke] [--no-cpu] [--out path] [--no-write]\n');return 0;}
 const data=require('../app/src/main/assets/tcg-classic-battle-data');
 const fx=require('../app/src/main/assets/tcgp-battle-effects');
 const opp=require('../app/src/main/assets/tcg-classic-opponents');
 const core=args.smoke?require('../app/src/main/assets/tcgp-battle-core'):null;
 const engineText=['tcgp-battle-effects.js','tcgp-battle-core.js'].map(p=>fs.readFileSync(path.join(ROOT,'app/src/main/assets',p),'utf8')).join('\n');
 const testIndex=evidenceIndex(path.join(ROOT,'tests'));
 const ids=args.all?unique(data.CARDS.map(c=>c.setId)).filter(Boolean):[args.set];
 const setDefs={};
 for(const id of ids){
  const c=data.CARDS.find(x=>x.setId===id);if(!c)continue;
  const files=fs.readdirSync(path.join(ROOT,'app/src/main/assets')).filter(f=>f.startsWith('tcg-classic-')&&f.endsWith('.js'));
  // Set declarations are optional for legacy catalogues; do not invent expected totals.
  for(const f of files){if(setDefs[id])break;try{const mod=require(path.join(ROOT,'app/src/main/assets',f));if(mod.SET?.id===id){setDefs[id]=mod.SET;break;}}catch{ /* Optional legacy assets may not load in Node. */ }}
 }
 const reports=[];
 for(const id of ids){
  const report=auditSet(id,{data,fx,opponents:opp,core,testIndex,engineText,setDefs,cpu:args.cpu,smoke:args.smoke});
  reports.push(report);
  if(args.write){
   const prefix=args.out?path.resolve(args.out):path.join(ROOT,'generated',`classic-audit-${id}`);
   fs.mkdirSync(path.dirname(prefix),{recursive:true});
   fs.writeFileSync(prefix+'.json',JSON.stringify(report,null,2)+'\n');
   fs.writeFileSync(prefix+'.md',toMarkdown(report));
  }
  const s=report.summary;
  process.stdout.write(`${id}: ${s.counts.enabled}/${s.total} enabled | ${s.errors} errors | ${s.warnings} warnings | ${s.reviewFlags} review | ${s.withStaticTestMentions} IDs in tests${report.cpu?` | CPU ${report.cpu.valid}/${report.cpu.attempted}`:''}${report.smoke?` | smokes ${report.smoke.executed}/${report.smoke.attempted} (${report.smoke.skipped} skipped)` : ''}\n`);
 }
 return reports.some(r=>r.summary.errors>0)?1:0;
}
if(require.main===module){try{process.exitCode=runCli(process.argv.slice(2));}catch(e){console.error('Classic auditor: '+(e.stack||e));process.exitCode=2;}}
module.exports={auditSet,toMarkdown,walkEffects,gatherRisks,parseCli,runCli,runSmokes};
