#!/usr/bin/env python3
from pathlib import Path
import json, sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'app/src/main/assets'
MANIFEST=BASE/'arcade/fossil-museum-v0250/manifest.json'
errors=[]
try: data=json.loads(MANIFEST.read_text(encoding='utf-8'))
except Exception as exc:
 print('FAIL manifest:',exc); raise SystemExit(2)
paths=[data.get('room',{}).get('path')]+[row.get('path') for row in data.get('items',{}).values()]
for rel in paths:
 if not rel: errors.append('missing path in manifest'); continue
 p=BASE/rel
 if not p.exists(): errors.append(f'{rel}: missing'); continue
 try:
  with Image.open(p) as im:
   im.verify()
  with Image.open(p) as im:
   if im.width<=0 or im.height<=0: errors.append(f'{rel}: invalid dimensions')
 except Exception as exc: errors.append(f'{rel}: invalid image ({exc})')
for e in errors: print('FAIL',e)
if errors: raise SystemExit(2)
print(f"PASS Fossil Museum {data.get('version','current')} assets: {len(paths)} images verified")
