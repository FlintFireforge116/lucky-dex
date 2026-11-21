'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const scripts=path.join(root,'scripts');
const names=['bw8','bw9','bw10','bw11','xy1','xy2','xy3','xy4','xy5'];
test('All pinned card catalogue generators avoid the shared GitHub REST API rate limit',()=>{
 const helper=fs.readFileSync(path.join(scripts,'pinned_tcg_source.py'),'utf8');
 assert.ok(helper.includes('raw.githubusercontent.com'));
 assert.ok(helper.includes('90f27d0e14cefe48ccb2b8922a7a356b2fcf0072'));
 assert.ok(helper.includes('hashlib.sha1'));
 assert.ok(helper.includes('actual_sha != expected_blob_sha'));
 for(const name of names){
  const text=fs.readFileSync(path.join(scripts,`build-${name}.py`),'utf8');
  assert.match(text,/from pinned_tcg_source import load_pinned_set/,name);
  assert.ok(text.includes(`load_pinned_set('${name}', BLOB, timeout=`),name);
  assert.doesNotMatch(text,/api\.github\.com/,name);
 }
});
test('Raw upstream content is verified by the exact Git blob SHA before JSON parsing',()=>{
 const code=String.raw`
import sys,hashlib,json,io,unittest.mock
sys.path.insert(0,sys.argv[1]);import pinned_tcg_source as p
raw=b'[{"number":"7"}]'
sha=hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()
class Response(io.BytesIO):
 def __enter__(self):return self
 def __exit__(self,*args):self.close()
def fake(req, timeout):
 assert str(req.full_url).endswith('/cards/en/xy5.json')
 assert '90f27d0e14cefe48ccb2b8922a7a356b2fcf0072' in req.full_url
 return Response(raw)
with unittest.mock.patch.object(p.urllib.request,'urlopen',side_effect=fake):
 assert p.load_pinned_set('xy5',sha)==[{'number':'7'}]
 try:p.load_pinned_set('xy5','0'*40)
 except RuntimeError as e:assert 'mismatch' in str(e)
 else:raise AssertionError('Missing source hash rejection')
print('verified')`;
 const r=spawnSync('python3',['-c',code,scripts],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr||r.stdout);
 assert.match(r.stdout,/verified/);
});
