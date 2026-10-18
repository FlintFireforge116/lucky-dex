"""Pin the sole supplied v0.40.1 archive; compare all original file bytes.

Generate before implementation. Later checks allow only a reviewed exact path
list plus narrowly normalized release markers. They never infer permission from
directory names or silently regenerate the baseline.
"""
import argparse, hashlib, json, pathlib, re, zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASELINE = ROOT / 'tests/adventure-location-preservation-v0402.json'
DEFAULT_ARCHIVE = pathlib.Path('C:/Users/sjwal/Documents/GitHub/lucky-dex/lucky-dex/LuckyDex_source.zip')

def digest(data):
    return hashlib.sha256(data).hexdigest()

def generate(archive):
    with zipfile.ZipFile(archive) as supplied:
        files = {entry.filename: {'bytes': entry.file_size, 'sha256': digest(supplied.read(entry))}
                 for entry in supplied.infolist() if not entry.is_dir()}
    missing, changed = [], []
    for name, expected in files.items():
        path = ROOT / name
        if not path.is_file(): missing.append(name)
        elif digest(path.read_bytes()) != expected['sha256']: changed.append(name)
    report = {'source': str(archive), 'archiveSha256': digest(archive.read_bytes()),
              'method': 'Exact SHA-256 of every file in sole supplied v0.40.1 archive.',
              'files': files, 'initialVerification': {'missing': missing, 'changed': changed}}
    if BASELINE.exists():
        raise RuntimeError('Baseline already exists; it must never be regenerated after production edits.')
    BASELINE.write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'archiveFiles':len(files), 'missing':missing, 'changed':changed}))
    if missing or any(not name.startswith('artifacts/') for name in changed): raise SystemExit(1)

def normalize(name, data):
    text = data.decode('utf-8')
    if name in ('package.json', 'package-lock.json'):
        obj=json.loads(text)
        obj['version']='RELEASE_VERSION'
        if name=='package-lock.json': obj['packages']['']['version']='RELEASE_VERSION'
        return json.dumps(obj, sort_keys=True).encode()
    if name == 'app/build.gradle':
        text=re.sub(r"versionName '[^']+'", "versionName 'RELEASE_VERSION'", text)
        text=re.sub(r'versionCode\s+\d+', 'versionCode RELEASE_CODE', text)
        text=re.sub(r'LuckyDex-asset-builder/\d+\.\d+\.\d+', 'LuckyDex-asset-builder/RELEASE_VERSION', text)
    if name == 'app/src/main/assets/app-v0167.js':
        text=re.sub(r"__LUCKYDEX_BUILD='[^']+'", "__LUCKYDEX_BUILD='RELEASE_VERSION'", text)
    if name == 'app/src/main/assets/index.html':
        text=re.sub(r'v0\.40\.[12]', 'vRELEASE_VERSION', text)
        # Loading the two reviewed new modules is the only approved additive
        # markup change outside the release text. Keep every original tag exact.
        text=re.sub(r'^[ \t]*<script src="(?:adventure/adventure-location-flow|adventure-location-scenes)\.js"></script>\r?\n', '', text, flags=re.M)
    return text.encode('utf-8')

def original_engine_bytes(data):
    text=data.decode('utf-8').replace('\r\n','\n')
    # The reviewed extension adds two standalone methods; all original reducer,
    # recovery, economy, claim, migration and traversal function text stays exact.
    text='\n'.join(line for line in text.split('\n')
                   if not line.startswith('function skipTravel(')
                   and not line.startswith('function restoreAtCenter('))
    text=text.replace(',skipTravel,restoreAtCenter,',',')
    return text.strip().encode('utf-8')

def check(archive, allowed, output):
    baseline=json.loads(BASELINE.read_text(encoding='utf-8'))
    if digest(archive.read_bytes()) != baseline['archiveSha256']:
        raise RuntimeError('Sole supplied archive bytes changed.')
    release={'package.json','package-lock.json','app/build.gradle','app/src/main/assets/app-v0167.js','app/src/main/assets/index.html'}
    exact=[]; edited=[]; normalized=[]; failures=[]; evidence=[]; engine_protected=False
    with zipfile.ZipFile(archive) as supplied:
        for name, expected in baseline['files'].items():
            if name.startswith('artifacts/'):
                evidence.append(name);continue
            path=ROOT/name
            if not path.is_file(): failures.append({'path':name,'reason':'missing'});continue
            current=path.read_bytes()
            if digest(current)==expected['sha256']: exact.append(name)
            elif name=='app/src/main/assets/adventure/adventure-regional-engine.js':
                if original_engine_bytes(current)==original_engine_bytes(supplied.read(name)):
                    edited.append(name);engine_protected=True
                else: failures.append({'path':name,'reason':'original engine implementation changed beyond two reviewed standalone methods'})
            elif name in allowed: edited.append(name)
            elif name in release and normalize(name,current)==normalize(name,supplied.read(name)): normalized.append(name)
            else: failures.append({'path':name,'reason':'unexpected byte change'})
    report={'sourceSha256':baseline['archiveSha256'],'originalFiles':len(baseline['files']),
            'exactCount':len(exact),'approvedEdits':edited,'normalizedReleaseOrApprovedModuleLoads':normalized,'failures':failures,
            'approvedPaths':sorted(allowed),'generatedEvidenceOutsideSourcePreservation':len(evidence),
            'originalEngineProtectedAfterTwoReviewedAdditions':engine_protected}
    if output:
        output.parent.mkdir(parents=True,exist_ok=True)
        output.write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report,indent=2))
    if failures: raise SystemExit(1)

parser=argparse.ArgumentParser()
parser.add_argument('--generate',action='store_true')
parser.add_argument('--archive',type=pathlib.Path,default=DEFAULT_ARCHIVE)
parser.add_argument('--allow',action='append',default=[])
parser.add_argument('--allow-file',type=pathlib.Path)
parser.add_argument('--output',type=pathlib.Path)
args=parser.parse_args()
allowed=set(args.allow)
if args.allow_file: allowed.update(json.loads(args.allow_file.read_text(encoding='utf-8-sig')))
generate(args.archive) if args.generate else check(args.archive,allowed,args.output)
