const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const modulePath = path.resolve(__dirname, '..', 'validity-target-utils.js');

const html = readFileSync(htmlPath, 'utf8');
assert.match(html, /validity-target-utils\.js/, 'index.html 应引入开单量测算脚本');
assert.match(html, /id="stdSlider" min="0\.5" max="4\.0"/, '合格日均回款基准线滑块上限应调整到 4.0');
assert.match(html, /¥4\.0/, '合格日均回款基准线上限文案应显示为 4.0');
assert.match(html, /id="companyCostInput" min="1000" step="1000" value="70000"/, '公司总成本默认值应为 70000');
assert.match(html, /公司总成本/, '页面应展示公司总成本输入');
assert.match(html, /毛利率/, '页面应展示毛利率输入');
assert.match(html, /目标总回款金额/, '页面应展示目标总回款金额');
assert.match(html, /淡季所需开单数/, '页面应展示淡季所需开单数');
assert.match(html, /旺季所需开单数/, '页面应展示旺季所需开单数');

const {
  DEFAULT_AVG_RETURN_DAYS,
  DEFAULT_PEAK_MULTIPLIER,
  calculateTargetPlanByStandard,
} = require(modulePath);

assert.equal(DEFAULT_AVG_RETURN_DAYS, 75, '默认平均回款周期应为 75 天');
assert.equal(DEFAULT_PEAK_MULTIPLIER, 1.5, '默认旺季倍率应为 1.5');

const result = calculateTargetPlanByStandard({
  companyCost: 100000,
  grossMarginRate: 0.4,
  baseDailyThreshold: 1.0,
});

assert.equal(result.targetRevenue.toFixed(2), '166666.67', '目标总回款金额计算不正确');
assert.equal(result.targetGrossProfit.toFixed(2), '66666.67', '目标毛利额计算不正确');
assert.equal(result.offSeasonPerStoreTotal.toFixed(2), '75.00', '淡季单店总回款测算不正确');
assert.equal(result.peakPerStoreTotal.toFixed(2), '112.50', '旺季单店总回款测算不正确');
assert.equal(result.offSeasonRequiredStores, 2223, '淡季所需开单数不正确');
assert.equal(result.peakRequiredStores, 1482, '旺季所需开单数不正确');

const higherBase = calculateTargetPlanByStandard({
  companyCost: 100000,
  grossMarginRate: 0.4,
  baseDailyThreshold: 1.5,
});

assert.equal(higherBase.offSeasonRequiredStores, 1482, '提高基准线后，淡季所需开单数应下降');
assert.equal(higherBase.peakRequiredStores, 988, '提高基准线后，旺季所需开单数应下降');
