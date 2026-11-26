"""Independently verified stage-one pinned upstream transfer."""
import json
from pathlib import Path
def rows():
 p=Path(__file__).resolve().parents[1]/'data/classic/swsh10-stage1.jsonl'
 data=p.read_bytes();h=2166136261
 for b in data:h=((h^b)*16777619)&0xffffffff
 assert h==2006158932, 'Astral Radiance source transfer checksum mismatch'
 return [json.loads(line) for line in data.splitlines()]
