const t=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');

t('autobuild sheet exposes competitive/random, dual type and rarity controls',()=>{
 const js=read('app/src/main/assets/tcgp-deck-editor.js');
 for(const text of ['Competitive','Random','Max rarity','Choose up to two Energy types'])a.ok(js.includes(text),`missing ${text}`);
});

t('player result copy does not expose currency-farming implementation language',()=>{
 const js=read('app/src/main/assets/tcgp-battle-ui.js');a.equal(js.includes('NO CURRENCY FARMING'),false);
});

t('mobile editor and battlefield contain v06939 compact-layout rules',()=>{
 const editor=read('app/src/main/assets/tcgp-deck-editor.css'),battle=read('app/src/main/assets/tcgp-battle.css');
 a.ok(editor.includes('v0.69.39 collection-first mobile layout'));
 a.ok(battle.includes('v0.69.39 compact live header and collision-safe player zone'));
});
