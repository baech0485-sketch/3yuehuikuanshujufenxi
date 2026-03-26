const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const htmlPath = path.resolve(__dirname, '..', 'index.html');
const modulePath = path.resolve(__dirname, '..', 'cohort-data.js');

const html = readFileSync(htmlPath, 'utf8');
assert.match(html, /cohort-data\.js/, 'index.html 应引入月份队列数据脚本');
assert.match(html, /max-width:\s*1240px/, '页面主体宽度应调整到 1240px');
assert.match(html, /<div class="section-title">当月开单店铺总回款金额趋势<\/div>/, '第二张趋势图标题应改为当月开单店铺总回款金额趋势');
assert.doesNotMatch(html, /class="season-panels"/, '两张趋势图不应继续放在同一行容器中');
assert.match(html, /id="totalReturnGrid"/, '页面应展示截至总回款金额趋势图容器');
assert.match(html, /当月开单店铺总回款金额（¥）/, '页面应展示当月开单店铺总回款金额趋势图图例');
assert.match(html, /首月回款总额/, '页面应展示首月回款总额');
assert.match(html, /次月回款总额/, '页面应展示次月回款总额');
assert.match(html, /第三月回款总额/, '页面应展示第三月回款总额');
assert.match(html, /前三月窗口总回款金额/, '页面应展示前三月窗口总回款金额');
assert.match(html, /截至2026-03-24总回款金额/, '页面应展示截至统计日总回款金额');
assert.match(html, /平均值/, '页面应在队列表格最后增加平均值行');
assert.match(html, /三个月日均回款整理/, '页面应在队列表格下方增加三个月日均回款整理区');
assert.match(html, /三个月平均日均回款/, '页面应展示三个月平均日均回款列');
assert.match(html, /店均总回款（总额÷店铺数）/, '页面应展示店均总回款衍生列');
assert.match(html, /数据结论建议/, '页面应在三个月日均回款整理下方增加数据结论建议');
assert.match(html, /淡季合格日均回款基准线建议：¥1\.8\/天/, '页面应展示淡季基准线建议结论');
assert.match(html, /旺季合格日均回款基准线建议：¥2\.7\/天/, '页面应展示旺季基准线建议结论');
assert.match(html, /当前 ¥1\.0\/天更适合作为保底参考线/, '页面应说明 1.0 更适合作为保底参考线');
assert.match(html, /id="dailyReturnTrendChart"/, '页面应在总回款趋势图下方增加日均回款折线图');
assert.match(html, /首月日均回款趋势/, '页面应展示首月日均回款趋势说明');
assert.match(html, /第二月日均回款/, '页面应展示第二月日均回款图例');
assert.match(html, /第三月日均回款/, '页面应展示第三月日均回款图例');
assert.match(html, /首月平均日均回款/, '页面应展示首月平均日均回款虚线图例');
assert.match(html, /第二月平均日均回款/, '页面应展示第二月平均日均回款虚线图例');
assert.match(html, /第三月平均日均回款/, '页面应展示第三月平均日均回款虚线图例');

const {
  COHORT_MONTHS,
  getCohortMonthsWithMetrics,
  getCohortAverages,
  getDailyTrendSeries,
  getSeasonTrendPoints,
} = require(modulePath);

assert.equal(COHORT_MONTHS.length, 8, '月份队列数据应包含 8 个月份样本');

const june = COHORT_MONTHS[0];
assert.equal(june.openMonth, '2025-06', '首行开单月份应为 2025-06');
assert.equal(june.firstMonth.total.toFixed(2), '4415.30', '2025-06 首月回款总额不正确');
assert.equal(june.secondMonth.total.toFixed(2), '14204.37', '2025-06 次月回款总额不正确');
assert.equal(june.thirdMonth.total.toFixed(2), '10967.05', '2025-06 第三月回款总额不正确');
assert.equal(june.totalToDate.toFixed(2), '51505.19', '2025-06 截至总回款金额不正确');

const january = COHORT_MONTHS[7];
assert.equal(january.openMonth, '2026-01', '末行开单月份应为 2026-01');
assert.equal(january.thirdMonth.dailyAvg.toFixed(2), '2.28', '2026-01 第三月日均回款不正确');
assert.equal(january.threeMonthWindowTotal.toFixed(2), '20106.39', '2026-01 前三月窗口总回款金额不正确');

const metrics = getCohortMonthsWithMetrics();
assert.equal(metrics[0].threeMonthPct, 57, '2025-06 前三月总占比应四舍五入为 57');
assert.equal(metrics[4].totalPerStore, 516, '2025-10 每店截至总回款应四舍五入为 516');
assert.equal(metrics[5].secondMonth.dailyAvg.toFixed(2), '4.02', '2025-11 次月日均回款应与截图一致');
assert.equal(metrics[0].threeMonthAverageDaily.toFixed(2), '1.94', '2025-06 三个月平均日均回款不正确');
assert.equal(metrics[4].threeMonthAverageDaily.toFixed(2), '4.19', '2025-10 三个月平均日均回款不正确');
assert.equal(metrics[0].perStoreTotalReturn.toFixed(2), '302.97', '2025-06 店均总回款衍生值不正确');
assert.equal(metrics[7].perStoreTotalReturn.toFixed(2), '233.80', '2026-01 店均总回款衍生值不正确');

const averages = getCohortAverages(metrics);
assert.equal(averages.stores.toFixed(1), '212.9', '平均开单店铺数不正确');
assert.equal(averages.firstMonth.total.toFixed(2), '14043.57', '平均首月回款总额不正确');
assert.equal(averages.secondMonth.dailyAvg.toFixed(2), '3.85', '平均第二月日均回款不正确');
assert.equal(averages.threeMonthPct.toFixed(1), '75.4', '平均前三月总占比不正确');
assert.equal(averages.totalPerStore.toFixed(1), '343.1', '平均每店截至总回款不正确');
assert.equal(averages.perStoreTotalReturn.toFixed(2), '343.05', '平均店均总回款衍生值不正确');

const dailySeries = getDailyTrendSeries(metrics);
assert.equal(dailySeries.length, 3, '日均回款折线图应包含 3 条线');
assert.equal(dailySeries[0].points.length, 8, '每条日均回款折线应包含 8 个点');
assert.equal(dailySeries[0].points[0].value.toFixed(2), '0.87', '首月日均起点不正确');
assert.equal(dailySeries[1].points[4].value.toFixed(2), '5.87', '第二月日均峰值不正确');
assert.equal(dailySeries[2].points[7].label, '26.01', '第三月日均横轴标签不正确');

const totalReturnTrend = getSeasonTrendPoints(metrics, 'totalToDate');
assert.equal(totalReturnTrend.length, 8, '截至总回款趋势图应包含 8 个柱');
assert.equal(totalReturnTrend[0].value.toFixed(2), '51505.19', '2025-06 截至总回款趋势值不正确');
assert.equal(totalReturnTrend[3].label, '25.09', '趋势图标签应格式化为简写月份');
assert.equal(totalReturnTrend[3].peak, true, '2025-09 应标记为旺季');
