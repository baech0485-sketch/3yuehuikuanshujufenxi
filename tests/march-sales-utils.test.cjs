const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const modulePath = path.resolve(__dirname, '..', 'march-sales-utils.js');
const htmlPath = path.resolve(__dirname, '..', 'index.html');
const {
  MARCH_STAGE_BONUS_RATES,
  MARCH_STAGE_DAYS,
  MARCH_SALES_PEOPLE,
  MARCH_SALES_TOTAL_STORES,
  calculateStageDaily,
  calculateSalesPerformanceMetrics,
} = require(modulePath);

const html = readFileSync(htmlPath, 'utf8');
assert.match(html, /march-sales-utils\.js/, 'index.html 应引入 3 月销售绩效脚本');
assert.match(html, /销售开单绩效计算方法/, '页面应展示销售开单绩效计算方法');
assert.match(html, /2025年3月销售开单三阶段绩效折算/, '页面应展示新的三阶段销售折算板块');
assert.match(html, /第二月折算单量按 <strong>10%<\/strong> 记作下个月额外单量/, '页面应说明第二月折算单量按 10% 计入');
assert.match(html, /第三月折算单量按 <strong>5%<\/strong> 记作下下个月额外单量/, '页面应说明第三月折算单量按 5% 计入');
assert.match(html, /10%/, '页面应说明第二月额外单量按 10% 计入');
assert.match(html, /5%/, '页面应说明第三月额外单量按 5% 计入');
assert.match(html, /三阶段绩效规则汇总/, '最终规则汇总应改为三阶段绩效规则汇总');
assert.match(html, /绩效归属节奏与月底开单处理/, '财务节奏板块应改为绩效归属节奏与月底开单处理');
assert.match(html, /三阶段绩效把销售开单从“一次性结算”改成了“持续三个月结算”/, '核心结论应切换到三阶段绩效口径');
assert.match(html, /第二月和第三月的持续回款能力，能够直接转化成后续月份额外单量/, '核心结论应强调后续月份额外单量');
assert.doesNotMatch(html, /顺延考核制/, '旧的顺延考核制文案应移除');
assert.doesNotMatch(html, /分期释放制/, '旧的分期释放制文案应移除');
assert.doesNotMatch(html, /两次均通过/, '旧的两次通过判定口径应移除');
assert.doesNotMatch(html, /10天考核窗口的本质问题不是窗口长短/, '旧的顺延考核结论应移除');
assert.match(html, /id="salesPerformanceBody"/, '页面应展示三阶段销售绩效表格');
assert.match(html, /id="salesStdSlider1"/, '页面应展示首月基准线滑块');
assert.match(html, /id="salesStdSlider2"/, '页面应展示第二月基准线滑块');
assert.match(html, /id="salesStdSlider3"/, '页面应展示第三月基准线滑块');
assert.doesNotMatch(html, /id="marchStdSlider"/, '旧的单月折算滑块应移除');
assert.doesNotMatch(html, /id="marchSalesBody"/, '旧的单月折算表格应移除');

assert.equal(MARCH_STAGE_DAYS.firstMonth, 23, '首月统计天数应为 23');
assert.equal(MARCH_STAGE_DAYS.secondMonth, 30, '第二月统计天数应为 30');
assert.equal(MARCH_STAGE_DAYS.thirdMonth, 31, '第三月统计天数应为 31');
assert.equal(MARCH_STAGE_BONUS_RATES.secondMonth, 0.1, '第二月额外单量系数应为 10%');
assert.equal(MARCH_STAGE_BONUS_RATES.thirdMonth, 0.05, '第三月额外单量系数应为 5%');
assert.equal(MARCH_SALES_PEOPLE.length, 9, '3 月销售数据应包含 9 名销售');
assert.equal(MARCH_SALES_TOTAL_STORES, 202, '3 月总开单数应为 202');

assert.equal(calculateStageDaily(2000.5, 45, 23).toFixed(2), '1.93', '首月自然日均回款计算不正确');

const baseMetrics = calculateSalesPerformanceMetrics(MARCH_SALES_PEOPLE, {
  firstMonth: 1.0,
  secondMonth: 1.0,
  thirdMonth: 1.0,
});

assert.equal(baseMetrics.rows.length, 9, '应为每名销售生成一行三阶段结果');
assert.equal(baseMetrics.stageSummaries.firstMonth.performanceOrders.toFixed(2), '306.58', '首月绩效单量不正确');
assert.equal(baseMetrics.stageSummaries.secondMonth.performanceOrders.toFixed(2), '0.00', '第二月默认绩效单量应为 0');
assert.equal(baseMetrics.stageSummaries.thirdMonth.performanceOrders.toFixed(2), '0.00', '第三月默认绩效单量应为 0');

const stagedPeople = JSON.parse(JSON.stringify(MARCH_SALES_PEOPLE));
stagedPeople[0].secondMonthTotal = 2700;
stagedPeople[0].thirdMonthTotal = 2092.5;

const stagedMetrics = calculateSalesPerformanceMetrics(stagedPeople, {
  firstMonth: 1.0,
  secondMonth: 1.0,
  thirdMonth: 1.5,
});

assert.equal(stagedMetrics.rows[0].stages.secondMonth.dailyAvg.toFixed(2), '2.00', '第二月自然日均回款计算不正确');
assert.equal(stagedMetrics.rows[0].stages.secondMonth.rawPerformanceOrders.toFixed(2), '90.00', '第二月原始折算单量不正确');
assert.equal(stagedMetrics.rows[0].stages.secondMonth.performanceOrders.toFixed(2), '9.00', '第二月额外单量折算不正确');
assert.equal(stagedMetrics.rows[0].stages.thirdMonth.dailyAvg.toFixed(2), '1.50', '第三月自然日均回款计算不正确');
assert.equal(stagedMetrics.rows[0].stages.thirdMonth.rawPerformanceOrders.toFixed(2), '45.00', '第三月原始折算单量不正确');
assert.equal(stagedMetrics.rows[0].stages.thirdMonth.performanceOrders.toFixed(2), '2.25', '第三月额外单量折算不正确');
assert.equal(stagedMetrics.stageSummaries.secondMonth.totalReturn.toFixed(2), '2700.00', '第二月总回款汇总不正确');
assert.equal(stagedMetrics.stageSummaries.thirdMonth.totalReturn.toFixed(2), '2092.50', '第三月总回款汇总不正确');
assert.equal(stagedMetrics.totalPerformanceOrders.toFixed(2), '317.83', '三阶段累计绩效单量不正确');
