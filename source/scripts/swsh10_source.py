"""Pinned source transfer packets, independently checksummed against GitHub blob."""
import json
from pathlib import Path
def rows():
 root=Path(__file__).resolve().parents[1]/'data/classic'
 result=[]
 for filename,expected in [('swsh10-stage1.jsonl',2006158932),('swsh10-stage2.jsonl',1483015771),('swsh10-stage3.jsonl',1065101171)]:
  data=(root/filename).read_bytes();h=2166136261
  for b in data:h=((h^b)*16777619)&0xffffffff
  assert h==expected, 'Astral Radiance source transfer checksum mismatch: '+filename
  result.extend(json.loads(line) for line in data.splitlines())
 return sorted(result,key=lambda r:int(r[0]))
