import base64, json
from pathlib import Path
SRC=Path(__file__).resolve().parent/'bw7-source.b64'
out=Path(__file__).resolve().parents[1]/'data/classic/bw7-print-compact.json'
b=base64.b64decode(''.join(SRC.read_text().split()))
codes=[];acc=bits=0
for v in b:
 acc|=v<<bits;bits+=8
 while bits>=14:
  codes.append(acc&16383);acc>>=14;bits-=14
D={i:bytes([i]) for i in range(256)};k=256;prev=None;res=[]
for code in codes:
 if code in D:word=D[code]
 elif code==k and prev is not None:word=prev+prev[:1]
 else:raise ValueError((code,k,len(res)))
 res.append(word)
 if prev is not None:D[k]=prev+word[:1];k+=1
 prev=word
raw=b''.join(res).decode('utf-8');r=json.loads(raw)
assert len(r)==153,(len(r),raw[-60:]);assert [x[0] for x in r]==[str(i) for i in range(1,154)]
out.write_text(json.dumps(r,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('decoded',len(r),'cards,',len(codes),'codes,',len(raw),'UTF8 chars,',out)
