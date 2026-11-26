"""Lost Origin stage-one compact transfers from the pinned upstream blob.
FNV-1a checksums were computed independently from the upstream response.
"""
import json
from pathlib import Path

def rows():
 root=Path(__file__).resolve().parents[1]/'data/classic'; result=[]
 for name,expected in [('swsh11-stage1-pokemon.jsonl',2107628560),('swsh11-stage1-support.jsonl',1340233365),('swsh11-stage2-pokemon.jsonl',3181807879)]:
  data=(root/name).read_bytes();h=2166136261
  for b in data:h=((h^b)*16777619)&0xffffffff
  assert h==expected,'Lost Origin source transfer checksum mismatch: '+name
  result.extend(json.loads(line) for line in data.splitlines())
 return sorted(result,key=lambda r:int(r[0]))
