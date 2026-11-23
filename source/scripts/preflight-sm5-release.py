#!/usr/bin/env python3
"""Offline SM5 source and generated-card gate. Requires one-time --prepare."""
from __future__ import annotations
import argparse,hashlib,json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TESTS=['tests/v07424-ultra-prism-integration.test.cjs','tests/v07425-ultra-prism-reuse.test.cjs','tests/v07427-ultra-prism-stage2-outcomes.test.cjs','tests/v07428-ultra-prism-stage3-outcomes.test.cjs']
def check():
 subprocess.run([sys.executable,'scripts/check-gradle-source.py','--self-test'],cwd=ROOT,check=True)
 c=json.loads((ROOT/'scripts/sm5_release_contract.json').read_text())
 assert (c['set'],c['stage'],c['release'])==('sm5','stage3','0.69.407')
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
 print(f'SM5 Stages 2+3 official-text audit PASS: {len(sm5stage2.ATTACKS)} + {len(sm5stage3.ATTACKS)} attacks, {len(sm5stage3.ABILITIES)} Abilities, {len(sm5stage2.TRAINERS)+len(sm5stage3.TRAINERS)} Trainers')
 gradle=(ROOT/'app/build.gradle').read_text()
 assert re.search(r"versionName\s+['\"]0\.69\.407['\"]",gradle) and 'versionCode 7407' in gradle
 for task in ['preflightSM5ContractForApk','generateSM5ForApk','auditSM5ForApk']:
  assert "tasks.register('"+task+"'" in gradle,task+' missing'
 assert "dependsOn tasks.named('auditSM4ForApk')" in gradle
 assert "dependsOn tasks.named('auditSM5ForApk')" in gradle
 for f in TESTS:assert (ROOT/f).is_file() and "'"+f+"'" in gradle,f+' missing mandatory gate'
 for f in ('tcg-classic-battle-data.js','tcg-classic-deck-builder.js','tcg-classic-opponents.js','tcg-classic-set-picker.js'):
  assert 'sm5' in (ROOT/'app/src/main/assets'/f).read_text(),f+' missing SM5 registration'
 html=(ROOT/'app/src/main/assets/index.html').read_text()
 assert 'tcg-classic-ultra-prism.js' in html and 'v0.69.407' in html
 assert "__LUCKYDEX_BUILD='0.69.407'" in (ROOT/'app/src/main/assets/app-v0167.js').read_text()
 for sid in ['xy9','xy10','xy11','xy12','sm1','sm2','sm3','sm4']:
  assert json.loads((ROOT/f'scripts/{sid}_release_contract.json').read_text())['release']=='0.69.407'
 print('SM5 source gate PASS: SHA-pinned official 178 prints, 237 attacks, 37 Abilities, 27 GX, 6 Prism Star')
def full():
 subprocess.run([sys.executable,'scripts/build-sm5.py'],cwd=ROOT,check=True)
 d=json.loads((ROOT/'docs/SM5_BUILD_COVERAGE.json').read_text())
 assert (d['printed'],d['attacks'],d['abilities'],d['pokemonGX'],d['gxAttackPrints'],d['prismStarPrints'],d['energyPrints'])==(178,237,37,27,27,6,5)
 assert d['battleReady']>=1 and d['battleReady']+len(d['gated'])==178
 assert all(d['gated'].values())
 subprocess.run(['node','--test',*TESTS],cwd=ROOT,check=True)
 print(f"SM5 release gate PASS: {d['battleReady']}/178 playable, {len(d['gated'])} explicitly gated")
if __name__=='__main__':
 try:
  p=argparse.ArgumentParser();p.add_argument('--full',action='store_true');a=p.parse_args()
  check()
  if a.full:full()
 except (AssertionError,RuntimeError,ValueError,subprocess.CalledProcessError,FileNotFoundError) as e:
  print('SM5 RELEASE PREFLIGHT FAILED:',str(e),file=sys.stderr);sys.exit(1)
