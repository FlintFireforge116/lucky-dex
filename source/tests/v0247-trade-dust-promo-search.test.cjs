const fs=require('fs');const assert=require('assert');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const app=fs.readFileSync('app/src/main/assets/app-v0167.js','utf8');
const trade=fs.readFileSync('app/src/main/assets/trade-v0163.js','utf8');
const flow=fs.readFileSync('app/src/main/assets/pack-flow-v0165.js','utf8');

assert.match(html,/id="promoVaultSearch"[^>]*type="search"/,'Promo Vault needs a card search input');
assert.match(flow,/promoVaultSearch/i,'Promo Vault renderer must consume the search field');
assert.match(flow,/card\.name[\s\S]{0,220}card\.rarity|card\.rarity[\s\S]{0,220}card\.name/,'Promo Vault search must include card name and rarity');

assert.match(html,/data-trade-section="market"[^>]*>TRADES</,'Trade page needs a Trades section tab');
assert.match(html,/data-trade-section="dust"[^>]*>DUST EXCHANGE</,'Trade page needs a Dust Exchange section tab');
assert.match(html,/id="dustExchangePanel"/,'Trade page needs a manual dust exchange panel');
assert.match(app,/function convertCardSpareToDust\(/,'Manual dust conversion function must exist');
assert.match(app,/function convertAllCardSparesToDust\(/,'Convert-all-spares action must exist');
assert.doesNotMatch(app,/if\(existing\)state\.profile\.dust\+=dustForTier/,'Pack duplicates must no longer auto-convert to Dust');
assert.match(app,/Math\.max\(0,Number\(card\?\.count\|\|0\)-1\)/,'Dust conversion must preserve the final copy');
assert.match(html,/id="dustTicketExchangeBtn"[^>]*>100 Dust → 1 Ticket/,'Dust-to-ticket exchange must live in Dust Exchange');
assert.doesNotMatch(html,/id="dustExchangeBtn"/,'Old Packs-screen dust exchange control must be removed');

assert.match(trade,/function tradeRarityClass\(/,'Trade needs a dedicated rarity class function');
assert.match(trade,/return ['"]promo['"]/,'Promo must be its own trade rarity class');
assert.match(trade,/MARKET_VERSION = ['"]v\d{4}-[^'"]+['"]/,'Trade market must keep a versioned invalidation key for stale listings');
assert.match(trade,/if\(\(reqClass==='promo'\|\|offerClass==='promo'\)&&reqClass!==offerClass\)continue;/,'Generated trades must reject Promo/non-Promo pairings');

console.log('v0.24.7 trade/dust/promo-search contract passed');
