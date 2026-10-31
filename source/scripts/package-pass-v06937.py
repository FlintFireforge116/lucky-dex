"""Package only changes against the exact user-confirmed v0.69.36 archive."""
import argparse,hashlib,json,os,shutil,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE_SHA='40bbd6a980e3a8bd64cd4ce7af87abbfc9dcff8ec34635bc2a4a507ad7ef4e70'
def sha(data):return hashlib.sha256(data).hexdigest()
def allowed(name):
 p=Path(name)
 return not any(x in {'.git','.gradle','node_modules','__pycache__','artifacts'} for x in p.parts) and not name.startswith(('app/build/','build/','qa/')) and p.name not in {'local.properties','.DS_Store'}
def main(archive,output):
 assert sha(archive.read_bytes())==BASE_SHA,'Wrong baseline archive; do not package against older sources.'
 with zipfile.ZipFile(archive) as original:
  prefix='lucky-dex-main/source/'
  before={i.filename[len(prefix):]:sha(original.read(i)) for i in original.infolist() if not i.is_dir() and i.filename.startswith(prefix) and allowed(i.filename[len(prefix):])}
  after={}
  for folder,dirs,files in os.walk(ROOT):
   dirs[:]=[d for d in dirs if allowed((Path(folder)/d).relative_to(ROOT).as_posix()+'/')]
   for name in files:
    p=Path(folder)/name;rel=p.relative_to(ROOT).as_posix()
    if allowed(rel):after[rel]=sha(p.read_bytes())
  changed=sorted(n for n,h in after.items() if before.get(n)!=h)
  deleted=sorted(before.keys()-after.keys());assert not deleted,deleted
  runtime={'app-v0167.js','index.html','achievements-tcgp-battle-v06920.js','tcgp-battle-ai.js','tcgp-battle-decks.js','tcgp-battle-effects.js','tcgp-battle-progress.js','tcgp-battle-solo.js','tcgp-battle-ui.js','tcgp-battle.css','tcgp-deck-editor.css','tcgp-deck-editor.js','tcgp-deck-workspace.js','tcgp/generated/catalogue.js'}
  for n in changed:
   assert not n.endswith(('.keystore','.apk','.zip','.webp','.png','.jpg')),n
   if n.startswith('app/src/main/assets/'):assert n.removeprefix('app/src/main/assets/') in runtime,'Unrelated runtime '+n
  for n in ['app/luckydex-dev.keystore','app/src/main/assets/tcgp-battle-core.js','app/src/main/assets/booster-art-coverage-v0264.json','app/src/main/assets/booster-art-index-v0260.json']:
   assert before[n]==after[n],'Protected source changed: '+n
  # All supplied non-source files that remain present must also be unchanged.
  for i in original.infolist():
   if i.is_dir() or not i.filename.startswith('lucky-dex-main/') or i.filename.startswith(prefix):continue
   rel=i.filename[len('lucky-dex-main/'):];target=ROOT.parent/rel
   if target.is_file() and allowed(rel):assert target.read_bytes()==original.read(i),'Unrelated root change '+rel
 output.mkdir(parents=True,exist_ok=True)
 patch=output/'LuckyDex_patch_v0.69.37.zip'
 with zipfile.ZipFile(patch,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for n in changed:
   i=zipfile.ZipInfo(n,(2026,10,31,0,0,0));i.compress_type=zipfile.ZIP_DEFLATED;i.external_attr=0o100644<<16;z.writestr(i,(ROOT/n).read_bytes())
 reconstructed=dict(before)
 with zipfile.ZipFile(patch) as z:
  assert z.testzip() is None and sorted(z.namelist())==changed
  for n in z.namelist():
   assert not n.startswith(('source/','/')) and '..' not in Path(n).parts
   reconstructed[n]=sha(z.read(n));assert reconstructed[n]==after[n]
 assert reconstructed==after,'Patch virtual reapplication differs from canonical source'
 apk=ROOT/'app/build/outputs/apk/debug/app-debug.apk'
 with zipfile.ZipFile(apk) as z:
  assert z.testzip() is None
  # Verify every bundled source asset, not only the edited modules.
  count=0
  for n in after:
   if n.startswith('app/src/main/assets/'):
    rel=n.removeprefix('app/src/main/assets/');assert z.read('assets/'+rel)==(ROOT/n).read_bytes(),'Stale APK asset '+rel;count+=1
 shutil.copy2(apk,output/'LuckyDex_v0.69.37.apk')
 result={'version':'0.69.37','androidVersionCode':7018,'featureBaseline':'0.69.36 (user-confirmed; stale archive labels 0.69.35/7016)','baselineArchiveSha256':BASE_SHA,'sourceFileCount':len(after),'changed':changed,'deleted':deleted,'patchSha256':sha(patch.read_bytes()),'sourceReconstructionMatches':True,'signerKeystoreUnchanged':True,'coreUnchanged':True,'unrelatedRuntimeUnchanged':True,'apkAssetsMatched':count,'apkSha256':sha(apk.read_bytes()),'deviceInstallationTested':False}
 (output/'LuckyDex_patch_audit_v0.69.37.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({k:v for k,v in result.items() if k!='changed'},indent=2));print('Changed files:',len(changed))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('archive',type=Path);p.add_argument('output',type=Path);a=p.parse_args();main(a.archive.resolve(),a.output.resolve())
