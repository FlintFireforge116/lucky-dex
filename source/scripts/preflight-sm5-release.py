#!/usr/bin/env python3
"""Offline SM5 source and generated-card gate. Requires one-time --prepare."""
from __future__ import annotations
import argparse,hashlib,json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07424-ultra-prism-integration.test.cjs','tests/v07425-ultra-prism-reuse.test.cjs','tests/v07427-ultra-prism-stage2-outcomes.test.cjs','tests/v07428-ultra-prism-stage3-outcomes.test.cjs','tests/v07429-ultra-prism-stage4-outcomes.test.cjs','tests/v07430-ultra-prism-stage5-outcomes.test.cjs','tests/v07431-ultra-prism-stage6-outcomes.test.cjs','tests/v07432-ultra-prism-stage7-outcomes.test.cjs','tests/v07433-ultra-prism-stage8-outcomes.test.cjs','tests/v07434-ultra-prism-stage9-outcomes.test.cjs','tests/v07435-ultra-prism-stage10-outcomes.test.cjs','tests/v07436-ultra-prism-stage11-outcomes.test.cjs','tests/v07437-ultra-prism-stage12-outcomes.test.cjs','tests/v07438-ultra-prism-stage13-outcomes.test.cjs','tests/v07439-ultra-prism-final-coverage.test.cjs']
def check():
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 c=json.loads((ROOT/'scripts/sm5_release_contract.json').read_text())
 assert (c['set'],c['stage'],c['release'])==('sm5','stage13','0.69.450')
 assert (c['printedTotal'],c['attackPrints'],c['abilities'],c['pokemonGX'],c['gxAttackPrints'],c['prismStarPrints'],c['trainerPrints'],c['energyPrints'])==(178,237,37,27,27,6,36,5)
 assert c['pin']=='66cbd13b706b789de3b8cce2f5c9fc95135a33b0'
 assert c['variants']==['119a','122a','125a','135a','153a']
 path=ROOT/'data/classic/sm5-print-compact.json'
 assert path.is_file(),'SM5 source missing. Run: python3 scripts/build-sm5.py --prepare before pushing'
 pin=json.loads((ROOT/'docs/SM5_CANONICAL_SOURCE.json').read_text())
 assert pin['sourceGitBlob']==c['pin'] and pin['compactSha256']==hashlib.sha256(path.read_bytes()).hexdigest(),'SM5 print data checksum mismatch'
 rows=json.loads(path.read_text())
 assert len(rows)==178 and len({r[0] for r in rows})==178
 assert [r[0] for r in rows]==[x for n in range(1,174) for x in ([str(n),str(n)+'a'] if str(n)+'a' in c['variants'] else [str(n)])]
 assert (sum(len(r[7]) for r in rows),sum(len(r[8]) for r in rows),sum('GX' in r[3] for r in rows))==(237,37,27)
 assert (sum('Prism Star' in r[3] for r in rows),sum(r[2]=='Trainer' for r in rows),sum(r[2]=='Energy' for r in rows))==(6,36,5)
 # All Stage 2 mappings must match an actual immutable official print.
 # A card with merely the same attack title is not sufficient.
 import sm5_stage2_verified as sm5stage2
 assert len(sm5stage2.ATTACKS)==c['stage2TextLockedAttacks'] and len(sm5stage2.TRAINERS)==c['stage2TextLockedTrainers'],'SM5 Stage 2 mapping registry unexpectedly changed'
 all_attacks=[(row,a) for row in rows for a in row[7]]
 for name,(printed,descriptor) in sm5stage2.ATTACKS.items():
  matches=[(row,a) for row,a in all_attacks if a[0]==name and sm5stage2.norm(a[3])==sm5stage2.norm(printed)]
  assert matches,'SM5 Stage 2 attack does not match official printed text: '+name
  assert all(sm5stage2.attack(row,a)==descriptor for row,a in matches),'SM5 Stage 2 attack descriptor drift: '+name
 for name,(kind,descriptor) in sm5stage2.TRAINERS.items():
  matches=[row for row in rows if row[2]=='Trainer' and row[1]==name and sm5stage2.norm(sm5stage2.TRAINER_RULES[name]) in sm5stage2.norm(' '.join(row[13] or []))]
  assert matches,'SM5 Stage 2 Trainer does not match official printed text: '+name
  assert all(sm5stage2.trainer(row)==(kind,descriptor) for row in matches),'SM5 Stage 2 Trainer drift: '+name
 # Verify EVERY new Stage 3 attack/Ability/Trainer against the same official
 # print source. The printed GX parenthetical is not stripped for these maps.
 import sm5_stage3_verified as sm5stage3
 assert (len(sm5stage3.ATTACKS),len(sm5stage3.ABILITIES),len(sm5stage3.TRAINERS))==(c['stage3TextLockedAttacks'],c['stage3TextLockedAbilities'],c['stage3TextLockedTrainers'])
 for name,(printed,descriptor) in sm5stage3.ATTACKS.items():
  matching=[(row,attack) for row in rows for attack in row[7] if attack[0]==name and sm5stage3.norm(attack[3])==sm5stage3.norm(printed)]
  assert matching,'SM5 Stage 3 official attack print mismatch: '+name
  assert all(sm5stage3.attack(row,attack)==descriptor for row,attack in matching),'SM5 Stage 3 attack rule mismatch: '+name
 for name,(printed,descriptor) in sm5stage3.ABILITIES.items():
  matching=[(row,a) for row in rows for a in row[8] if a[0]==name and sm5stage3.norm(a[2])==sm5stage3.norm(printed)]
  assert matching,'SM5 Stage 3 official Ability print mismatch: '+name
  assert all(sm5stage3.ability(row,a)==descriptor for row,a in matching),'SM5 Stage 3 Ability rule mismatch: '+name
 for name,(klass,descriptor) in sm5stage3.TRAINERS.items():
  matching=[row for row in rows if row[2]=='Trainer' and row[1]==name and all(sm5stage3.norm(x) in sm5stage3.norm(' '.join(row[13] or [])) for x in sm5stage3.TRAINER_RULES[name])]
  assert matching,'SM5 Stage 3 official Trainer print mismatch: '+name
  assert all(sm5stage3.trainer(row)==(klass,descriptor) for row in matching),'SM5 Stage 3 Trainer rule mismatch: '+name
 # Stage 4: verify the exact text of every re-used Ability and
 # Special Energy print. The number of supported ENERGY *names* is three,
 # but the two Unit Energy names each have an alternate-art print.
 import sm5_stage4_verified as sm5stage4
 assert (len(sm5stage4.ABILITIES),len(sm5stage4.ENERGY))==(c['stage4TextLockedAbilities'],c['stage4TextLockedEnergyNames'])
 for name,(printed,descriptor) in sm5stage4.ABILITIES.items():
  matches=[(row,a) for row in rows for a in row[8] if a[0]==name and sm5stage4.norm(a[2])==sm5stage4.norm(printed)]
  assert matches,'SM5 Stage 4 official Ability mismatch: '+name
  assert all(sm5stage4.ability(row,a)==descriptor for row,a in matches),name+' descriptor changed'
 energy_rows=[row for row in rows if row[2]=='Energy' and row[1] in sm5stage4.ENERGY]
 assert len(energy_rows)==c['stage4TextLockedEnergyPrints'],'SM5 Stage 4 Energy print count mismatch'
 for row in energy_rows:
  assert sm5stage4.energy(row)==sm5stage4.ENERGY[row[1]][1],f'SM5 Stage 4 Energy source mismatch: {row[1]}'
 print(f'SM5 Stage 4 official-print check: {len(sm5stage4.ABILITIES)} Abilities and {len(energy_rows)} Energy prints')
 # Stage 5: exact printed effects for ALL FIVE non-Energy Prism Stars.
 # This does not authorize other SM5 effects or relax the source hash pin.
 import sm5_stage5_verified as sm5stage5
 assert (len(sm5stage5.ATTACKS),len(sm5stage5.ABILITIES),len(sm5stage5.TRAINERS))==(c['stage5TextLockedAttacks'],c['stage5TextLockedAbilities'],c['stage5TextLockedTrainers'])
 assert len(sm5stage5.PRISM_PRINTS)==c['stage5EnabledPrismStars']
 all_prism=[row for row in rows if 'Prism Star' in row[3] and row[2]!='Energy']
 assert len(all_prism)==5 and all(sm5stage5.prism_ready(row) for row in all_prism),'SM5 Prism Star full printed mechanics not supported'
 for name,(printed,descriptor) in sm5stage5.ATTACKS.items():
  matches=[(row,a) for row in all_prism for a in row[7] if a[0]==name and sm5stage5.norm(a[3])==sm5stage5.norm(printed)]
  assert matches and all(sm5stage5.attack(row,a)==descriptor for row,a in matches),'SM5 Prism attack print mismatch: '+name
 for name,(printed,descriptor) in sm5stage5.ABILITIES.items():
  matches=[(row,a) for row in all_prism for a in row[8] if a[0]==name and sm5stage5.norm(a[2])==sm5stage5.norm(printed)]
  assert matches and all(sm5stage5.ability(row,a)==descriptor for row,a in matches),'SM5 Prism Ability print mismatch: '+name
 for name,(kind,descriptor) in sm5stage5.TRAINERS.items():
  matches=[row for row in all_prism if row[1]==name]
  assert len(matches)==1 and sm5stage5.trainer(matches[0])==(kind,descriptor),'SM5 Prism Trainer mismatch: '+name
 # Stage 6: all new mappings must match the exact official pinned text.
 import sm5_stage6_verified as sm5stage6
 assert (len(sm5stage6.ATTACKS),len(sm5stage6.ABILITIES),len(sm5stage6.TRAINERS))==(c['stage6TextLockedAttacks'],c['stage6TextLockedAbilities'],c['stage6TextLockedTrainers']),'SM5 Stage 6 map counts drifted'
 for name,(printed,descriptor) in sm5stage6.ATTACKS.items():
  matches=[(row,a) for row,a in all_attacks if a[0]==name and sm5stage6.norm(a[3])==sm5stage6.norm(printed)]
  assert matches,'Stage 6 official attack print mismatch: '+name
  assert all(sm5stage6.attack(row,a)==descriptor for row,a in matches),'Stage 6 attack implementation drift: '+name
 for name,(printed,descriptor) in sm5stage6.ABILITIES.items():
  matches=[(row,a) for row in rows for a in row[8] if a[0]==name and sm5stage6.norm(a[2])==sm5stage6.norm(printed)]
  assert matches,'Stage 6 official Ability print mismatch: '+name
  assert all(sm5stage6.ability(row,a)==descriptor for row,a in matches),'Stage 6 Ability implementation drift: '+name
 for name,(klass,descriptor) in sm5stage6.TRAINERS.items():
  matches=[row for row in rows if row[2]=='Trainer' and row[1]==name and all(sm5stage6.norm(x) in sm5stage6.norm(' '.join(row[13] or [])) for x in sm5stage6.TRAINER_RULES[name])]
  assert matches,'Stage 6 official Trainer print mismatch: '+name
  assert all(sm5stage6.trainer(row)==(klass,descriptor) for row in matches),'Stage 6 Trainer implementation drift: '+name
 # Stage 7: all new card effects must be exact-match to canonical printed text.
 # No name-only shortcuts. Assert the implementation against ALL official
 # prints, including duplicates, before the APK generator can mark one playable.
 import sm5_stage7_verified as stage7
 assert (len(stage7.ATTACKS),len(stage7.ABILITIES),len(stage7.TRAINERS))==(c['stage7TextLockedAttacks'],c['stage7TextLockedAbilities'],c['stage7TextLockedTrainers']),'SM5 Stage 7 mapping count drift'
 for name,(printed,descriptor) in stage7.ATTACKS.items():
  matches=[(row,a) for row,a in all_attacks if a[0]==name and stage7.N(a[3])==stage7.N(printed)]
  assert matches,'SM5 Stage 7 official attack text mismatch: '+name
  assert all(stage7.attack(row,a)==descriptor for row,a in matches),'Stage 7 attack effect drift: '+name
 for name,(printed,descriptor) in stage7.ABILITIES.items():
  matches=[(row,a) for row in rows for a in row[8] if a[0]==name and stage7.N(a[2])==stage7.N(printed)]
  assert matches,'SM5 Stage 7 official Ability mismatch: '+name
  assert all(stage7.ability(row,a)==descriptor for row,a in matches),'Stage 7 Ability drift: '+name
 for name,(kind,descriptor) in stage7.TRAINERS.items():
  matches=[row for row in rows if row[2]=='Trainer' and row[1]==name and all(stage7.N(x) in stage7.N(' '.join(row[13] or [])) for x in stage7.TRAINER_RULES[name])]
  assert matches,'SM5 Stage 7 official Trainer mismatch: '+name
  assert all(stage7.trainer(row)==(kind,descriptor) for row in matches),'Stage 7 Trainer drift: '+name
 # Stage 8: exact-print and descriptor checks guard the full catalogue.
 # Alternate-art copies must have identical effects to their standard prints.
 import sm5_stage8_verified as stage8
 assert (len(stage8.ATTACKS),len(stage8.ABILITIES),len(stage8.TRAINERS))==(c['stage8TextLockedAttacks'],c['stage8TextLockedAbilities'],c['stage8TextLockedTrainers']),'SM5 Stage 8 mapping count drift'
 for name,(printed,descriptor) in stage8.ATTACKS.items():
  matches=[(row,a) for row,a in all_attacks if a[0]==name and stage8.N(a[3])==stage8.N(printed)]
  assert matches,'SM5 Stage 8 official attack text mismatch: '+name
  assert all(stage8.attack(row,a)==descriptor for row,a in matches),'Stage 8 attack effect drift: '+name
 for name,(printed,descriptor) in stage8.ABILITIES.items():
  matches=[(row,a) for row in rows for a in row[8] if a[0]==name and stage8.N(a[2])==stage8.N(printed)]
  assert matches,'SM5 Stage 8 official Ability mismatch: '+name
  assert all(stage8.ability(row,a)==descriptor for row,a in matches),'Stage 8 Ability drift: '+name
 for name,(kind,descriptor) in stage8.TRAINERS.items():
  matches=[row for row in rows if row[2]=='Trainer' and row[1]==name and all(stage8.N(x) in stage8.N(' '.join(row[13] or [])) for x in stage8.TRAINER_RULES[name])]
  assert matches,'SM5 Stage 8 official Trainer mismatch: '+name
  assert all(stage8.trainer(row)==(kind,descriptor) for row in matches),'Stage 8 Trainer drift: '+name
 # Stage 9: allow only exact pinned official printed attacks, not just names.
 # Every enabled Stage 9 effect is covered by a dedicated player or CPU
 # outcome test in v07434; no dummy status or virtual discard substitutions.
 import sm5_stage9_verified as stage9
 assert len(stage9.A)==c['stage9TextLockedAttacks'],'SM5 Stage 9 mapping count drift'
 for name,(printed,descriptor) in stage9.A.items():
  matches=[(row,a) for row,a in all_attacks if a[0]==name and stage9.n(a[3])==stage9.n(printed)]
  assert matches,'SM5 Stage 9 official attack text mismatch: '+name
  assert all(stage9.attack(row,a)==descriptor for row,a in matches),'Stage 9 attack effect drift: '+name
 # Stage 10: each selected printed rule is individually locked to SHA-pinned
 # SM5 data, with a live-game outcome suite for both players and the CPU.
 import sm5_stage10_verified as stage10
 assert (len(stage10.ATTACKS),len(stage10.ABILITIES),len(stage10.TRAINERS))==(c['stage10TextLockedAttacks'],c['stage10TextLockedAbilities'],c['stage10TextLockedTrainers']),'SM5 Stage 10 map counts drift'
 for name,(printed,descriptor) in stage10.ATTACKS.items():
  matches=[(row,a) for row,a in all_attacks if a[0]==name and stage10.n(a[3])==stage10.n(printed)]
  assert matches,'SM5 Stage 10 canonical attack missing: '+name
  assert all(stage10.attack(row,a)==descriptor for row,a in matches),'Stage 10 attack descriptor drift: '+name
 for name,(printed,descriptor) in stage10.ABILITIES.items():
  matches=[(row,a) for row in rows for a in row[8] if a[0]==name and stage10.n(a[2])==stage10.n(printed)]
  assert matches,'SM5 Stage 10 canonical Ability missing: '+name
  assert all(stage10.ability(row,a)==descriptor for row,a in matches),'Stage 10 Ability descriptor drift: '+name
 for name,(kind,descriptor) in stage10.TRAINERS.items():
  matches=[row for row in rows if row[2]=='Trainer' and row[1]==name and all(stage10.n(x) in stage10.n(' '.join(row[13] or [])) for x in stage10.TRAINER_RULES[name])]
  assert matches,'SM5 Stage 10 canonical Trainer missing: '+name
  assert all(stage10.trainer(row)==(kind,descriptor) for row in matches),'Stage 10 Trainer descriptor drift: '+name
 # Stage 11: the new mechanics are enabled ONLY on exact official text.
 import sm5_stage11_verified as stage11
 assert len(stage11.ATTACKS)==c['stage11TextLockedAttacks'],'SM5 Stage 11 map count drift'
 for name,(printed,descriptor) in stage11.ATTACKS.items():
  matches=[(row,a) for row,a in all_attacks if a[0]==name and stage11.N(a[3])==stage11.N(printed)]
  assert matches,'Stage 11 canonical print missing: '+name
  assert all(stage11.attack(row,a)==descriptor for row,a in matches),'Stage 11 effect drift: '+name
 # Stage 12: printed effect and card identity audit. All alternate-art
 # Missing Clover prints must resolve the same single/four-card mechanics.
 import sm5_stage12_verified as stage12
 assert (len(stage12.ATTACKS),len(stage12.ABILITIES),len(stage12.TRAINERS)) == (c['stage12TextLockedAttacks'],c['stage12TextLockedAbilities'],c['stage12TextLockedTrainers']), 'SM5 Stage 12 map counts drifted'
 for name,(printed,descriptor) in stage12.ATTACKS.items():
  matches=[(row,a) for row,a in all_attacks if a[0]==name and stage12.N(a[3])==stage12.N(printed)]
  assert matches,'Stage 12 canonical attack missing: '+name
  assert all(stage12.attack(row,a)==descriptor for row,a in matches),'Stage 12 attack descriptor drift: '+name
 for name,(printed,descriptor) in stage12.ABILITIES.items():
  matches=[(row,a) for row in rows for a in row[8] if a[0]==name and stage12.N(a[2])==stage12.N(printed)]
  assert matches,'Stage 12 canonical Ability missing: '+name
  assert all(stage12.ability(row,a)==descriptor for row,a in matches),'Stage 12 Ability descriptor drift: '+name
 for name,(kind,descriptor) in stage12.TRAINERS.items():
  matches=[row for row in rows if row[2]=='Trainer' and row[1]==name and all(stage12.N(x) in stage12.N(' '.join(row[13] or [])) for x in stage12.TRAINER_RULES[name])]
  assert matches,'Stage 12 canonical Trainer missing: '+name
  assert all(stage12.trainer(row)==(kind,descriptor) for row in matches),'Stage 12 Trainer descriptor drift: '+name
 assert sorted(row[0] for row in rows if row[1]=='Missing Clover')==['129','168'],'SM5 Missing Clover alternates changed'
 # Stage 13: each remaining explicit attack is matched against immutable
 # official text; no generic parser may silently discard first-turn or
 # discard-to-Bench requirements. Check both Fury Swipes physical prints.
 import sm5_stage13_verified as stage13
 assert len(stage13.ATTACKS)==c['stage13TextLockedAttacks'],'SM5 Stage 13 mapping count drift'
 for name,(printed,descriptor) in stage13.ATTACKS.items():
  matches=[(row,a) for row,a in all_attacks if a[0]==name and stage13.N(a[3])==stage13.N(printed)]
  assert matches,'SM5 Stage 13 canonical attack missing: '+name
  assert all(stage13.attack(row,a)==descriptor for row,a in matches),'Stage 13 attack descriptor drift: '+name
 assert sorted(str(row[0]) for row,a in all_attacks if a[0]=='Fury Swipes' and stage13.N(a[3])==stage13.N(stage13.ATTACKS['Fury Swipes'][0]))==['21','28'], 'Both Fury Swipes prints require identical effect'
 print('SM5 Stage 13 printed-effects audit PASS: 6 named attacks including 2 Fury Swipes prints')
 print('SM5 Stage 12 official-text audit PASS: 2 attacks, Flaming Fighter, 2 Missing Clover prints')
 print('SM5 Stage 11 official-text audit PASS: 14 attacks')
 print('SM5 Stage 10 pinned-text audit PASS: 6 attacks, 2 Abilities, Ancient Crystal')
 print('SM5 Stage 9 official-text audit PASS: 27 attacks')
 print('SM5 Stage 8 official-text audit PASS: 9 attacks, 4 Abilities, 3 Pokemon Tools')
 print('SM5 Stage 7 official-text audit PASS: 13 attacks, Rock Hiding, Peeking Red Card')
 print('SM5 Stage 6 pinned official-text audit PASS: 10 attacks, 6 Abilities, Pal Pad')
 print('SM5 Stage 5 printed Prism Star mechanics PASS: 5 cards / 6 attacks / 2 Abilities / Cyrus')
 print(f'SM5 Stages 2+3 official-text audit PASS: {len(sm5stage2.ATTACKS)} + {len(sm5stage3.ATTACKS)} attacks, {len(sm5stage3.ABILITIES)} Abilities, {len(sm5stage2.TRAINERS)+len(sm5stage3.TRAINERS)} Trainers')
 gradle=(ROOT/'app/build.gradle').read_text()
 assert re.search(r"versionName\s+['\"]0\.69\.450['\"]",gradle) and 'versionCode 7450' in gradle
 for task in ['preflightSM5ContractForApk','generateSM5ForApk','auditSM5ForApk']:
  assert "tasks.register('"+task+"'" in gradle,task+' missing'
 assert "dependsOn tasks.named('auditSM4ForApk')" in gradle
 assert "dependsOn tasks.named('auditSM5ForApk')" in gradle
 for f in TESTS:assert (ROOT/f).is_file() and "'"+f+"'" in gradle,f+' missing mandatory gate'
 for f in ('tcg-classic-battle-data.js','tcg-classic-deck-builder.js','tcg-classic-opponents.js','tcg-classic-set-picker.js'):
  assert 'sm5' in (ROOT/'app/src/main/assets'/f).read_text(),f+' missing SM5 registration'
 html=(ROOT/'app/src/main/assets/index.html').read_text()
 assert 'tcg-classic-ultra-prism.js' in html and 'v0.69.450' in html
 assert "__LUCKYDEX_BUILD='0.69.450'" in (ROOT/'app/src/main/assets/app-v0167.js').read_text()
 for sid in ['xy9','xy10','xy11','xy12','sm1','sm2','sm3','sm4']:
  assert json.loads((ROOT/f'scripts/{sid}_release_contract.json').read_text())['release']=='0.69.450'
 print('SM5 source gate PASS: SHA-pinned official 178 prints, 237 attacks, 37 Abilities, 27 GX, 6 Prism Star')
def full():
 subprocess.run([sys.executable,'scripts/build-sm5.py'],cwd=ROOT,check=True)
 d=json.loads((ROOT/'docs/SM5_BUILD_COVERAGE.json').read_text())
 assert (d['printed'],d['attacks'],d['abilities'],d['pokemonGX'],d['gxAttackPrints'],d['prismStarPrints'],d['energyPrints'])==(178,237,37,27,27,6,5)
 assert d['battleReady']>=6 and d['battleReady']+len(d['gated'])==178
 assert all(d['gated'].values())
 assert all('sm5-'+n not in d['gated'] for n in ['58','62','77','89','120','136']),'An implemented Prism Star was incorrectly gated'
 subprocess.run([sys.executable,'scripts/audit-expansion-readiness.py','--set','sm5','--check-release','--require-complete','--report','docs/SM5_CURRENT_GAP_LEDGER.md'],cwd=ROOT,check=True)
 subprocess.run(['node','--test',*TESTS],cwd=ROOT,check=True)
 print(f"SM5 release gate PASS: {d['battleReady']}/178 playable, {len(d['gated'])} explicitly gated")
if __name__=='__main__':
 try:
  p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
  check()
  if a.full:full()
 except (AssertionError,RuntimeError,ValueError,subprocess.CalledProcessError,FileNotFoundError) as e:
  print('SM5 RELEASE PREFLIGHT FAILED:',str(e),file=sys.stderr);sys.exit(1)
