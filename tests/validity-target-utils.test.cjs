const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const modulePath = path.resolve(__dirname, '..', 'validity-target-utils.js');

const html = readFileSync(htmlPath, 'utf8');
assert.match(html, /validity-target-utils\.js/, 'index.html 应引入开单量测算脚本');
assert.match(html, /id="stdSlider" min="0\.5" max="4\.0"/, '合格日均回款基准线滑块上限应调整到 4.0');
assert.match(html, /¥4\.0/, '合格日均回款基准线上限文案应显示为 4.0');
assert.match(html, /id="stdSlider" min="0\.5" max="4\.0" step="0\.1" value="1\.8"/, '合格日均回款基准线默认值应调整为 1.8');
assert.match(html, /id="stdDisplay">¥1\.8</, '合格日均回款基准线显示值应调整为 1.8');
assert.match(html, /id="offThreshold">¥1\.8</, '淡季判定基准默认值应调整为 1.8');
assert.match(html, /id="peakThreshold">¥2\.7</, '旺季判定基准默认值应调整为 2.7');
assert.match(html, /id="targetStdDisplay">¥1\.8</, '目标测算区域默认基准线应调整为 1.8');
assert.match(html, /建议默认按淡季 ¥1\.8\/天、旺季 ¥2\.7\/天执行/, '页面应同步展示新的默认判定建议');
assert.match(html, /id="companyCostInput" min="1000" step="1000" value="70000"/, '公司总成本默认值应为 70000');
assert.match(html, /公司总成本/, '页面应展示公司总成本输入');
assert.match(html, /毛利率/, '页面应展示毛利率输入');
assert.match(html, /目标总回款金额/, '页面应展示目标总回款金额');
assert.match(html, /淡季所需开单数/, '页面应展示淡季所需开单数');
assert.match(html, /旺季所需开单数/, '页面应展示旺季所需开单数');

const {
  DEFAULT_PEAK_MULTIPLIER,
  DEFAULT_OFF_SEASON_PER_STORE_TOTAL,
  DEFAULT_PEAK_SEASON_PER_STORE_TOTAL,
  calculateTargetPlanByStandard,
} = require(modulePath);

assert.equal(DEFAULT_PEAK_MULTIPLIER, 1.5, '默认旺季倍率应为 1.5');
assert.equal(DEFAULT_OFF_SEASON_PER_STORE_TOTAL, 300, '淡季单店合格总回款基准应为 300 元');
assert.equal(DEFAULT_PEAK_SEASON_PER_STORE_TOTAL, 400, '旺季单店合格总回款基准应为 400 元');
assert.match(html, /单店合格总回款基准按样本均值折算/, '页面应说明总回款基准来自样本均值折算');
assert.match(html, /淡季单店合格总回款基准/, '页面应展示淡季单店合格总回款基准');
assert.match(html, /旺季单店合格总回款基准/, '页面应展示旺季单店合格总回款基准');
assert.doesNotMatch(html, /当前平均回款周期按 75 天口径/, '页面不应继续展示固定 75 天口径');

const result = calculateTargetPlanByStandard({
  companyCost: 100000,
  grossMarginRate: 0.4,
  baseDailyThreshold: 1.8,
});

assert.equal(result.targetRevenue.toFixed(2), '166666.67', '目标总回款金额计算不正确');
assert.equal(result.targetGrossProfit.toFixed(2), '66666.67', '目标毛利额计算不正确');
assert.equal(result.offSeasonPerStoreTotal.toFixed(2), '300.00', '淡季单店总回款基准不正确');
assert.equal(result.peakPerStoreTotal.toFixed(2), '400.00', '旺季单店总回款基准不正确');
assert.equal(result.offSeasonRequiredStores, 556, '淡季所需开单数不正确');
assert.equal(result.peakRequiredStores, 417, '旺季所需开单数不正确');
assert.equal(result.offSeasonImpliedDays.toFixed(1), '166.7', '淡季动态回款周期不正确');
assert.equal(result.peakSeasonImpliedDays.toFixed(1), '148.1', '旺季动态回款周期不正确');

const higherBase = calculateTargetPlanByStandard({
  companyCost: 100000,
  grossMarginRate: 0.4,
  baseDailyThreshold: 2.4,
});

assert.equal(higherBase.offSeasonRequiredStores, 556, '总回款基准固定后，淡季所需开单数应由单店总回款基准决定');
assert.equal(higherBase.peakRequiredStores, 417, '总回款基准固定后，旺季所需开单数应由单店总回款基准决定');
assert.equal(higherBase.offSeasonImpliedDays.toFixed(1), '125.0', '提高基准线后，淡季动态回款周期应缩短');
assert.equal(higherBase.peakSeasonImpliedDays.toFixed(1), '111.1', '提高基准线后，旺季动态回款周期应缩短');
