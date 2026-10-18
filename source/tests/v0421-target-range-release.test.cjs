'use strict';
// Historical release fixture: validate coherent current identity, not a retired label.
const test=require('node:test'),verify=require('./helpers/current-target-range-release.cjs');
test('Target Range release identity remains coherent after bounded updates',verify);
