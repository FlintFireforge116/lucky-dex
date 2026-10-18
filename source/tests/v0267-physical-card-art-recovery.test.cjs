'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const os=require('node:os');
const ROOT=path.resolve(__dirname,'..');

const packFlow=fs.readFileSync(path.join(ROOT,'app/src/main/assets/pack-flow-v0165.js'),'utf8');
const workflow=fs.readFileSync(path.join(ROOT,'.github/workflows/build-card-art-index.yml'),'utf8');
const overlay=path.join(ROOT,'scripts/card_art_overlay_v0267.py');

const start=packFlow.indexOf('async function packArtworkCandidatesV163');
const end=packFlow.indexOf('\nasync function cacheRemotePackArtworkV163',start);
assert.ok(start>=0&&end>start,'pack artwork candidate resolver must exist');
const body=packFlow.slice(start,end);
assert.doesNotMatch(
  body,
  /LuckyDexCardArt\.resolveLocal[\s\S]{0,500}if\(urls\.length\)return urls;/,
  'a legacy exact-index URL must not suppress identity-safe PokémonTCG/Scrydex fallbacks'
);
assert.match(body,/pokemonTcgArtworkBaseV5/,'physical pack fallback must still consult exact PokémonTCG identity data');
assert.match(body,/scrydexArtworkBaseV164/,'physical pack fallback must still consult exact Scrydex identity data');

assert.ok(fs.existsSync(overlay),'physical card index build needs a reusable stable-art overlay module');
assert.match(workflow,/repository:\s*PokemonTCG\/pokemon-tcg-data/,'physical index workflow must checkout the stable PokémonTCG identity/art dataset');
assert.match(workflow,/card_art_overlay_v0267/,'physical index workflow must apply the shared stable-art overlay');

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'luckydex-v0267-'));
const cardsDir=path.join(tmp,'cards','en');
fs.mkdirSync(cardsDir,{recursive:true});
fs.writeFileSync(path.join(tmp,'sets.json'),JSON.stringify([
  {id:'sm35',name:'Shining Legends',releaseDate:'2017/10/06'}
]));
fs.writeFileSync(path.join(cardsDir,'sm35.json'),JSON.stringify([
  {id:'sm35-11',name:'Torkoal',number:'11',images:{small:'https://images.pokemontcg.io/sm35/11.png',large:'https://images.pokemontcg.io/sm35/11_hires.png'}},
  {id:'sm35-12',name:'Litten',number:'12',images:{small:'https://images.pokemontcg.io/sm35/12.png',large:'https://images.pokemontcg.io/sm35/12_hires.png'}}
]));

const py=`
import importlib.util
from pathlib import Path
p=Path(r'''${overlay.replaceAll('\\','\\\\')}''')
spec=importlib.util.spec_from_file_location('overlay',p)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
resolver=m.PokemonTcgArtworkResolver.from_paths(
  Path(r'''${cardsDir.replaceAll('\\','\\\\')}'''),
  Path(r'''${path.join(tmp,'sets.json').replaceAll('\\','\\\\')}''')
)
expected='https://images.pokemontcg.io/sm35/11_hires.png'
assert resolver.resolve('SM35','Shining Legends','11','Torkoal')==expected
# Set-name identity must rescue catalogues whose local set code differs.
assert resolver.resolve('SLG','Shining Legends','11','Torkoal')==expected
# Collector number alone is never enough to attach artwork to the wrong card.
assert resolver.resolve('SM35','Shining Legends','11','Wrong Name')==''
# Unknown cards keep their legacy source instead of receiving guessed artwork.
assert resolver.resolve('SM35','Shining Legends','99','Missing')==''
print('fixture ok')
`;
const run=cp.spawnSync('python3',['-c',py],{cwd:ROOT,encoding:'utf8'});
assert.equal(run.status,0,run.stderr||run.stdout);

console.log('PASS v0.26.7 global physical-card stable-art recovery');
