'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cssPath='app/src/main/assets/arcade-rock-harden.css';
assert.ok(fs.existsSync(cssPath),'Rock Harden CSS must exist');
const css=fs.readFileSync(cssPath,'utf8');
const owner=fs.readFileSync('app/src/main/assets/arcade-rock-harden.js','utf8');
for(const asset of ['cave-floor.png','cave-wall.png'])assert.ok(css.includes(asset),`missing Gen III quarry asset ${asset}`);
assert.ok(css.includes('cave-rock.png')||css.includes('route-rock.png'),'rock visuals must use a local Gen III rock asset');
const spriteBlock=css.match(/\.rock-harden-sprite\s*\{([^}]*)\}/)?.[1]||'';
for(const rule of [/width\s*:\s*auto/i,/height\s*:\s*auto/i,/object-fit\s*:\s*contain/i,/image-rendering\s*:\s*pixelated/i])assert.match(spriteBlock,rule,'sprite must preserve native aspect/pixel rendering');
const hardened=css.match(/\.rock-harden-lane\.is-hardened[^\{]*\.rock-harden-sprite\s*\{([^}]*)\}/)?.[1]||'';
assert.match(hardened,/filter\s*:/i);assert.match(hardened,/grayscale|saturate/i,'Harden must desaturate slightly');assert.match(hardened,/brightness/i,'Harden must lift brightness');assert.match(hardened,/hue-rotate|sepia/i,'Harden must add a cool silver tint');assert.doesNotMatch(hardened,/blur\s*\(/i,'silver treatment must stay crisp');
for(const hook of ['is-grade-perfect','is-grade-good','is-grade-safe','is-hit','is-ko','is-gold','is-shatter','rock-harden-countdown','is-finished']){assert.ok(css.includes(hook),`missing presentation hook ${hook}`);assert.ok(owner.includes(hook)||hook==='rock-harden-countdown'||hook==='is-gold'||hook==='is-ko'||hook==='is-finished',`owner must drive ${hook}`)}
const button=css.match(/(?:\.rock-harden-button|#rockHardenButton)[^{]*\{([^}]*)\}/)?.[1]||'';const minH=Number(button.match(/min-height\s*:\s*(\d+)px/i)?.[1]||0);assert.ok(minH>=64,`HARDEN touch target ${minH}px is too small`);assert.match(button,/touch-action\s*:\s*none/i);
assert.match(css,/grid-template-columns\s*:\s*repeat\(4\s*,\s*minmax\(0\s*,\s*1fr\)\)/i,'four lanes need a responsive minmax grid');assert.match(css,/\.rock-harden-lane\.is-player/i,'player lane needs subtle emphasis');
assert.match(css,/@media\s*\(prefers-reduced-motion\s*:\s*reduce\)/i);const reduced=css.match(/@media\s*\(prefers-reduced-motion\s*:\s*reduce\)[\s\S]*$/i)?.[0]||'';assert.match(reduced,/animation\s*:\s*none|transition\s*:\s*none/i);assert.ok(reduced.includes('rock-harden-shadow')||css.includes('.rock-harden-shadow'),'reduced motion must preserve the shadow timing cue');
assert.doesNotMatch(css,/linear-gradient\s*\([^)]*white|linear-gradient\s*\([^)]*#fff/i,'avoid glossy white gameplay gradients');assert.doesNotMatch(css,/border-radius\s*:\s*(?:1[2-9]|[2-9]\d)px/i,'avoid modern pill/card rounding');
console.log('PASS v0.38.0 Rock Harden static Gen III presentation contract');
