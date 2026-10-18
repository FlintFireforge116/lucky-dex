const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=f=>fs.readFileSync(path.join(ASSETS,f),'utf8');

for(const [game,file,head,stage,playfield,hud] of [
  ['Ice Cream Scoop','arcade-ice-cream-scoop.css','icecream-head','icecream-stage','icecream-playfield','icecream-hud'],
  ['Wailord Water Spout','arcade-wailord-water-spout.css','wailord-head','wailord-stage','wailord-playfield','wailord-hud'],
]){
  test(`${game} keeps the Dream World header in normal flow above the HUD`,()=>{
    const css=read(file);
    assert.match(css,new RegExp(`\\.${head}\\{[^}]*position:\\s*relative[^}]*top:\\s*auto[^}]*left:\\s*auto[^}]*right:\\s*auto`,`s`));
    assert.match(css,new RegExp(`\\.${head}\\{[^}]*flex:\\s*0\\s+0\\s+56px`,`s`));
    assert.match(css,new RegExp(`\\.${stage}\\{[^}]*flex:\\s*1\\s+1\\s+auto[^}]*min-height:\\s*0`,`s`));
    assert.match(css,new RegExp(`\\.${playfield}\\{[^}]*min-height:\\s*0`,`s`));
    assert.match(css,new RegExp(`\\.${hud}\\{[^}]*margin:\\s*0\\s+2px`,`s`));
  });
}
