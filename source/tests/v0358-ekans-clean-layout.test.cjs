'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-ekans-hoop.css'),'utf8');

// The playfield should be one uninterrupted rectangle: no decorative top/bottom bands.
assert.doesNotMatch(css,/\.ekans-hoop-field:before\s*,\s*\.ekans-hoop-field:after\s*\{/i,'field must not draw decorative inset bands');
assert.match(css,/\.ekans-hoop-grid-lines\{[^}]*inset:\s*0\s+8%/i,'grid should use the full vertical field after band removal');

// The launch area should visually merge with the cabinet rather than forming another inset strip.
assert.match(css,/\.ekans-hoop-launch-zone\{[^}]*border:\s*0/i,'launch area should not have its own framed strip');
assert.match(css,/\.ekans-hoop-launch-zone\{[^}]*background:\s*transparent/i,'launch area should visually merge with the stage');

// Leave a genuine pull-back runway below Ekans on phone layouts.
assert.match(css,/\.ekans-hoop-launch-zone\{[^}]*min-height:\s*200px/i,'launch zone needs substantial pull-back room');
assert.match(css,/\.ekans-hoop-launcher\{[^}]*align-self:\s*start/i,'Ekans should sit toward the top of the launch runway');
assert.match(css,/\.ekans-hoop-launch-zone\{min-height:\s*180px;[^}]*padding:\s*10px 6px 8px/i,'mobile launch runway should remain deep enough for a slingshot pull');

console.log('PASS v0.35.8 Ekans clean board and pull-back runway');
