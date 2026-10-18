from pathlib import Path
import zipfile,json
R=Path(__file__).resolve().parents[1]
Z=Path('C:/Users/sjwal/Documents/GitHub/lucky-dex/lucky-dex/LuckyDex_source.zip')
with zipfile.ZipFile(Z) as z:
    base=R.parent/'LuckyDex_v0.33.1_baseline'
    base.mkdir(exist_ok=True)
    z.extractall(base)
    for name in ['app/src/main/assets/booster-art-index-v0260.json','app/src/main/assets/booster-art-coverage-v0264.json']:
        old=z.read(name);new=(R/name).read_bytes()
        assert json.loads(old)==json.loads(new),'unrelated booster audit changed semantics'
        (R/name).write_bytes(old)
print('Baseline extracted; unrelated booster audit outputs restored byte for byte')
