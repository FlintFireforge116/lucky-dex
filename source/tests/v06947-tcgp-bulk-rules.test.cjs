const test=require('node:test');
const assert=require('node:assert/strict');
const cat=require('../app/src/main/assets/tcgp/generated/catalogue.js');
const byId=id=>cat.cards.find(c=>c.id===id);
test('common deterministic remaining mechanics are battle-ready',()=>{
 const ids=['A1-210','A4a-022','A2-076','A2-142','A2-153','A3b-009','A4-023','A4-031','A4-142','A4-151','A4a-003','A4a-066','B2-017','B2-032','B2-150','B3a-069','B3a-070','B4-130','B4a-057','C1-038','C1-119','C1-125'];
 const partial=ids.filter(id=>byId(id)?.support?.status!=='FULL').map(id=>[id,byId(id)?.name,byId(id)?.support?.reasons]);
 assert.deepEqual(partial,[]);
});
test('automatic stateful tranche compiles as battle-ready',()=>{
 const ids=['A2-123','A2a-034','A3a-062','A3-145','B1-073','B1-194','B1-218','B1-219','B1-220','B1-222','B2-070','P-B-060','P-B-085','B1a-048','B2-016','B2-147','B2-148','B2a-015','B2a-062','B2b-017','B2b-050','B2b-069','B3-061','B3-089','B3-112','B3-130','B3-134','B3-148','B3-151','B3-154','B3a-013','B3a-026','B3a-027','B3a-033','B3a-047','B3a-073','B3b-001','B3b-030','B3b-035','B3b-066','B3b-068','B4-014','B4-017','B4-077','B4-152','B4-154','B4a-018','B4a-059','B4a-067','C1-008','C1-041','C1-126','C1-130'];
 const partial=ids.filter(id=>byId(id)?.support?.status!=='FULL').map(id=>[id,byId(id)?.name,byId(id)?.support?.reasons]);
 assert.deepEqual(partial,[]);
});
