'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const auditor=require('../scripts/audit-classic-set.cjs');
const data=require('../app/src/main/assets/tcg-classic-battle-data');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const opp=require('../app/src/main/assets/tcg-classic-opponents');
const core=require('../app/src/main/assets/tcgp-battle-core');
const mt=require('../app/src/main/assets/tcg-classic-mysterious-treasures');
const contract=require('../data/classic-card-audit-contract.json');
const engineText=require('node:fs').readFileSync(require('node:path').join(__dirname,'../app/src/main/assets/tcgp-battle-effects.js'),'utf8');
const opts={data,fx,opponents:opp,core,setDefs:{dp2:mt.SET},engineText};

test('audit contract is machine-readable and cross-references real release-gate rules',()=>{
 const rules=require('node:fs').readFileSync(require('node:path').join(__dirname,'../docs/LUCKYDEX_MASTER_RULES.txt'),'utf8');
 assert.equal(contract.schemaVersion,1);
 for(const check of contract.checks){assert.match(check.id,/^C-AUDIT-00[1-7]$/);assert.ok(rules.includes(check.rule),check.rule);}
 assert.equal(new Set(contract.checks.map(c=>c.id)).size,7);
});

test('real dp2 full set has no definite schema failures, accurate summary and real static test references',()=>{
 const r=auditor.auditSet('dp2',{...opts,cpu:false,testIndex:[{file:'fake.test.cjs',content:'dp2-100'}]});
 assert.equal(r.summary.total,124);assert.equal(r.summary.counts.enabled,124);assert.equal(r.summary.errors,0);
 assert.equal(r.summary.counts.attacks,168);assert.equal(r.summary.counts.abilities,37);
 assert.equal(r.cardLedger.length,124);
 assert.ok(r.cardLedger.find(x=>x.id==='dp2-100').testFilesMentioningId.includes('fake.test.cjs'));
 assert.ok(!r.cardLedger.find(x=>x.id==='dp2-1').testFilesMentioningId.includes('fake.test.cjs'),'substring match is not test evidence');
 assert.deepEqual(r.cardLedger.find(x=>x.id==='dp2-115').riskTags.includes('choice'),true);
 assert.match(auditor.toMarkdown(r),/not.*printed correctness|does \*\*not\*\* prove/i);
});

test('supported effects and optional choices are found recursively; invalid effects are blocking',()=>{
 const seen=[];auditor.walkEffects({type:'sequence',effects:[{type:'coinFlip',heads:{type:'draw',amount:1},tails:{type:'noop'}}]},e=>seen.push(e.type));
 assert.deepEqual(seen,['sequence','coinFlip','draw','noop']);
 const original=mt.cardById('dp2-73');
 const corrupted={...original,attacks:[{...original.attacks[0],effect:{type:'unrecognized-v999'},text:'Special effect'}],support:{status:'FULL',reasons:[]}};
 const fake={...data,CARDS:data.CARDS.map(c=>c.id==='dp2-73'?corrupted:c),cardById:id=>id==='dp2-73'?corrupted:data.cardById(id)};
 const r=auditor.auditSet('dp2',{...opts,data:fake,cpu:false});
 assert.ok(r.summary.errors>=2,r.findings.filter(x=>x.severity==='error'));
 assert.ok(r.findings.some(x=>x.cardId==='dp2-73'&&/Unsupported battle effect/.test(x.message)));
 assert.ok(r.findings.some(x=>x.cardId==='dp2-73'&&/placeholder/.test(x.message)));
});

test('new staged expansions remain gated and do not incorrectly claim FULL or CPU certification',()=>{
 const old=mt.cardById('dp2-9');const staged={...old,battleEnabled:false,deckEligible:false,support:{status:'PARTIAL',reasons:['New mechanic not implemented']}};
 const fake={...data,CARDS:data.CARDS.map(c=>c.id==='dp2-9'?staged:c),cardById:id=>id==='dp2-9'?staged:data.cardById(id)};
 const r=auditor.auditSet('dp2',{...opts,data:fake,cpu:false});
 assert.equal(r.summary.counts.gated,1);assert.equal(r.summary.errors,0);
 const broken={...staged,battleEnabled:true};
 const fake2={...fake,CARDS:fake.CARDS.map(c=>c.id==='dp2-9'?broken:c),cardById:id=>id==='dp2-9'?broken:data.cardById(id)};
 assert.ok(auditor.auditSet('dp2',{...opts,data:fake2,cpu:false}).findings.some(x=>x.message.includes('marked PARTIAL')));
});

test('duplicate IDs, declared totals and inconsistent evolution metadata are reported',()=>{
 const bad={...mt.cardById('dp2-8'),evolvesFrom:'There Is No Croconaw'};
 const fake={...data,CARDS:[...data.CARDS.map(c=>c.id===bad.id?bad:c),bad],cardById:id=>id===bad.id?bad:data.cardById(id)};
 const r=auditor.auditSet('dp2',{...opts,data:fake,cpu:false});
 assert.ok(r.findings.some(x=>x.message==='Duplicate collector print ID.'));
 assert.ok(r.findings.some(x=>x.message.includes('Globally ambiguous')));
 assert.ok(r.findings.some(x=>x.message.includes('declared 124')));
 assert.ok(r.findings.some(x=>x.message.includes('Evolution parent')));
});

test('CPU deck smoke covers each energy type, and invalid completed-set deck fails the gate',()=>{
 const report=auditor.auditSet('dp2',{...opts,cpu:true});
 assert.equal(report.cpu.valid,16);
 assert.equal(report.summary.errors,0);
 const badOpp={generate:()=>({ok:false,reason:'No legal deck'})};
 const blocked=auditor.auditSet('dp2',{...opts,opponents:badOpp,cpu:true});
 assert.equal(blocked.cpu.valid,0);
 assert.equal(blocked.summary.errors,16);
});

test('synthetic both-sided full-set attack and Trainer paths terminate, including Wager and optional Leaf Tornado',()=>{
 const report=auditor.auditSet('dp2',{...opts,smoke:true,cpu:false});
 assert.equal(report.smoke.attempted,356);
 assert.equal(report.smoke.executed,356);
 assert.equal(report.smoke.skipped,0);
 assert.deepEqual(report.smoke.failures,[]);
 assert.equal(report.summary.errors,0);
});

test('CLI flags and unknown set handling fail visibly instead of silently reporting success',()=>{
 assert.equal(auditor.parseCli(['--set','dp2','--smoke','--no-write']).smoke,true);
 assert.equal(auditor.parseCli(['--no-cpu']).cpu,false);
 assert.throws(()=>auditor.parseCli(['--all','--smoke']),/one --set/);
 assert.throws(()=>auditor.parseCli(['--unknown']),/Unknown flag/);
 assert.throws(()=>auditor.auditSet('not-a-set',{...opts,cpu:false}),/Unknown or empty/);
});
