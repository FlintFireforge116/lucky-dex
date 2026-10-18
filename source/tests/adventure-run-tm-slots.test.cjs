const assert=require('assert'),P=require('../app/src/main/assets/adventure/adventure-progression.js');
const p={id:25,level:8,moves:[84,39,98,45],pendingMoves:[85],tmLearned:[85]};P.ensureOwned(p);assert(p.pendingMoves.includes(85),'a verified taught TM can wait for a regional replacement slot');const before=[...p.moves];assert(P.learnPending(p,85).needsReplacement);assert.deepEqual(p.moves,before);assert(P.learnPending(p,85,2).applied);assert.equal(p.moves[2],85);assert.equal(p.pendingMoves.length,0);
console.log('PASS run TM learning keeps four explicit replacement slots');
