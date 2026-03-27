const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const modulePath = path.resolve(__dirname, '..', 'validity-target-utils.js');

const html = readFileSync(htmlPath, 'utf8');
assert.match(html, /validity-target-utils\.js/, 'index.html 应引入开单量测算脚本');
assert.match(html, /id="stdSlider" min="0\.5" max="4\.0" step="0\.1" value="1\.8" disabled/, '合格日均回款基准线应固定展示，不能继续滑动');
assert.match(html, /id="stdDisplay">¥1\.8</, '合格日均回款基准线显示值应调整为 1.8');
assert.match(html, /id="offThreshold">¥1\.8</, '淡季判定基准默认值应调整为 1.8');
assert.match(html, /id="peakThreshold">¥2\.7</, '旺季判定基准默认值应调整为 2.7');
assert.match(html, /id="targetStdDisplay">¥1\.8</, '目标测算区域默认基准线应调整为 1.8');
assert.match(html, /固定展示 · 淡季 ¥1\.8\/天、旺季 ¥2\.7\/天/, '页面应说明日均回款基准线已固定');
assert.match(html, /id="requiredOrdersOffSlider"/, '页面应新增淡季所需开单数滑块');
assert.match(html, /id="requiredOrdersOffControlDisplay"/, '页面应新增淡季所需开单数滑块显示值');
assert.match(html, /id="companyCostInput" min="1000" step="10" value="70000"/, '公司总成本输入应保留并支持与滑块联动');
assert.match(html, /公司总成本/, '页面应展示公司总成本输入');
assert.match(html, /毛利率/, '页面应展示毛利率输入');
assert.match(html, /目标总回款金额/, '页面应展示目标总回款金额');
assert.match(html, /淡季所需开单数/, '页面应展示淡季所需开单数');
assert.match(html, /旺季所需开单数/, '页面应展示旺季所需开单数');
assert.match(html, /淡季所需开单数主控/, '页面应说明淡季所需开单数是主控项');
assert.match(html, /拖动滑块将联动反推目标总回款、公司总成本和旺季开单数/, '页面应说明新的联动方向');

const {
  DEFAULT_PEAK_MULTIPLIER,
  DEFAULT_OFF_SEASON_PER_STORE_TOTAL,
  DEFAULT_PEAK_SEASON_PER_STORE_TOTAL,
  calculateTargetPlanByStandard,
  calculateTargetPlanByOrders,
} = require(modulePath);

assert.equal(DEFAULT_PEAK_MULTIPLIER, 1.5, '默认旺季倍率应为 1.5');
assert.equal(DEFAULT_OFF_SEASON_PER_STORE_TOTAL, 200, '淡季单店合格总回款基准应为 200 元');
assert.equal(DEFAULT_PEAK_SEASON_PER_STORE_TOTAL, 300, '旺季单店合格总回款基准应为 300 元');
assert.match(html, /单店合格总回款基准按样本均值折算/, '页面应说明总回款基准来自样本均值折算');
assert.match(html, /淡季单店合格总回款基准 200 元 \/ 店/, '页面应展示更新后的淡季单店总回款基准说明');
assert.match(html, /旺季单店合格总回款基准 300 元 \/ 店/, '页面应展示更新后的旺季单店总回款基准说明');
assert.match(html, /淡季单店合格总回款基准/, '页面应展示淡季单店合格总回款基准');
assert.match(html, /旺季单店合格总回款基准/, '页面应展示旺季单店合格总回款基准');
assert.doesNotMatch(html, /当前平均回款周期按 75 天口径/, '页面不应继续展示固定 75 天口径');

const result = calculateTargetPlanByStandard({
  companyCost: 70000,
  grossMarginRate: 0.4,
  baseDailyThreshold: 1.8,
});

assert.equal(result.targetRevenue.toFixed(2), '116666.67', '按公司总成本反推的目标总回款金额不正确');
assert.equal(result.targetGrossProfit.toFixed(2), '46666.67', '按公司总成本反推的目标毛利额不正确');
assert.equal(result.offSeasonPerStoreTotal.toFixed(2), '200.00', '淡季单店总回款基准不正确');
assert.equal(result.peakPerStoreTotal.toFixed(2), '300.00', '旺季单店总回款基准不正确');
assert.equal(result.offSeasonRequiredStoresExact.toFixed(1), '583.3', '按公司总成本反推的淡季所需开单精确值不正确');
assert.equal(result.offSeasonRequiredStores, 584, '按公司总成本反推的淡季所需开单数不正确');
assert.equal(result.peakRequiredStores, 389, '按公司总成本反推的旺季所需开单数不正确');
assert.equal(result.offSeasonImpliedDays.toFixed(1), '111.1', '淡季动态回款周期不正确');
assert.equal(result.peakSeasonImpliedDays.toFixed(1), '111.1', '旺季动态回款周期不正确');

const orderDrivenResult = calculateTargetPlanByOrders({
  offSeasonRequiredStores: 600,
  grossMarginRate: 0.4,
  baseDailyThreshold: 1.8,
});

assert.equal(orderDrivenResult.targetRevenue.toFixed(2), '120000.00', '按淡季所需开单数反推的目标总回款金额不正确');
assert.equal(orderDrivenResult.companyCost.toFixed(2), '72000.00', '按淡季所需开单数反推的公司总成本不正确');
assert.equal(orderDrivenResult.targetGrossProfit.toFixed(2), '48000.00', '按淡季所需开单数反推的目标毛利额不正确');
assert.equal(orderDrivenResult.offSeasonRequiredStoresExact.toFixed(1), '600.0', '按淡季所需开单数反推后，淡季开单精确值不正确');
assert.equal(orderDrivenResult.offSeasonRequiredStores, 600, '按淡季所需开单数反推后，淡季开单取整值不正确');
assert.equal(orderDrivenResult.peakRequiredStoresExact.toFixed(1), '400.0', '按淡季所需开单数反推后，旺季开单精确值不正确');
assert.equal(orderDrivenResult.peakRequiredStores, 400, '按淡季所需开单数反推后，旺季所需开单数不正确');
assert.equal(orderDrivenResult.offSeasonImpliedDays.toFixed(1), '111.1', '按淡季所需开单数反推后，淡季动态回款周期不正确');
assert.equal(orderDrivenResult.peakSeasonImpliedDays.toFixed(1), '111.1', '按淡季所需开单数反推后，旺季动态回款周期不正确');
