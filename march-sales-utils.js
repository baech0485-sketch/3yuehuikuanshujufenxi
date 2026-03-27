(function (globalScope) {
  const MARCH_STAGE_KEYS = ['firstMonth', 'secondMonth', 'thirdMonth'];
  const MARCH_STAGE_DAYS = {
    firstMonth: 26,
    secondMonth: 30,
    thirdMonth: 31,
  };
  const MARCH_STAGE_BONUS_RATES = {
    firstMonth: 1,
    secondMonth: 0.1,
    thirdMonth: 0.05,
  };

  const MARCH_SALES_PEOPLE = [
    { name: '梁智', stores: 61, firstMonthTotal: 2932.40, secondMonthTotal: 0, thirdMonthTotal: 0 },
    { name: '屈维涛', stores: 22, firstMonthTotal: 1042.04, secondMonthTotal: 0, thirdMonthTotal: 0 },
    { name: '向文强', stores: 55, firstMonthTotal: 2573.92, secondMonthTotal: 0, thirdMonthTotal: 0 },
    { name: '杨蓉', stores: 5, firstMonthTotal: 231.53, secondMonthTotal: 0, thirdMonthTotal: 0 },
    { name: '朱雯雯', stores: 5, firstMonthTotal: 227.85, secondMonthTotal: 0, thirdMonthTotal: 0 },
    { name: '秦金城', stores: 9, firstMonthTotal: 262.21, secondMonthTotal: 0, thirdMonthTotal: 0 },
    { name: '韩大武', stores: 65, firstMonthTotal: 1762.88, secondMonthTotal: 0, thirdMonthTotal: 0 },
    { name: '郭文', stores: 9, firstMonthTotal: 169.94, secondMonthTotal: 0, thirdMonthTotal: 0 },
    { name: '赵春燕', stores: 7, firstMonthTotal: 100.04, secondMonthTotal: 0, thirdMonthTotal: 0 },
    { name: '陈梅', stores: 3, firstMonthTotal: 0, secondMonthTotal: 0, thirdMonthTotal: 0 },
    { name: '李帅', stores: 2, firstMonthTotal: 0, secondMonthTotal: 0, thirdMonthTotal: 0 },
  ];

  const MARCH_SALES_TOTAL_STORES = MARCH_SALES_PEOPLE.reduce(
    (sum, person) => sum + person.stores,
    0
  );

  function normalizeStandard(value, label) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      throw new Error(`${label} 必须大于 0`);
    }
    return numericValue;
  }

  function normalizeAmount(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return 0;
    }
    return numericValue;
  }

  function calculateStageDaily(totalReturn, stores, days) {
    if (!stores || !days) {
      return 0;
    }
    return normalizeAmount(totalReturn) / Number(stores) / Number(days);
  }

  function calculateSalesPerformanceMetrics(people, standards) {
    const normalizedStandards = {
      firstMonth: normalizeStandard(standards.firstMonth, '首月基准线'),
      secondMonth: normalizeStandard(standards.secondMonth, '第二月基准线'),
      thirdMonth: normalizeStandard(standards.thirdMonth, '第三月基准线'),
    };

    const rows = people.map((person) => {
      const stages = {};
      let totalPerformanceOrders = 0;

      MARCH_STAGE_KEYS.forEach((stageKey) => {
        const totalReturn = normalizeAmount(person[`${stageKey}Total`]);
        const days = MARCH_STAGE_DAYS[stageKey];
        const dailyAvg = calculateStageDaily(totalReturn, person.stores, days);
        const standard = normalizedStandards[stageKey];
        const rawPerformanceOrders = person.stores * (dailyAvg / standard);
        const bonusRate = MARCH_STAGE_BONUS_RATES[stageKey];
        const performanceOrders = rawPerformanceOrders * bonusRate;

        stages[stageKey] = {
          totalReturn,
          days,
          dailyAvg,
          standard,
          rawPerformanceOrders,
          bonusRate,
          performanceOrders,
        };

        totalPerformanceOrders += performanceOrders;
      });

      return {
        ...person,
        stages,
        totalPerformanceOrders,
      };
    });

    const totalStores = people.reduce((sum, person) => sum + person.stores, 0);
    const stageSummaries = MARCH_STAGE_KEYS.reduce((summary, stageKey) => {
      const totalReturn = rows.reduce(
        (sum, row) => sum + row.stages[stageKey].totalReturn,
        0
      );
      const weightedDaily = rows.reduce(
        (sum, row) => sum + row.stages[stageKey].dailyAvg * row.stores,
        0
      ) / totalStores;
      const performanceOrders = rows.reduce(
        (sum, row) => sum + row.stages[stageKey].performanceOrders,
        0
      );

      summary[stageKey] = {
        totalReturn,
        weightedDaily,
        performanceOrders,
      };
      return summary;
    }, {});

    return {
      rows,
      totalStores,
      standards: normalizedStandards,
      stageSummaries,
      totalPerformanceOrders: rows.reduce(
        (sum, row) => sum + row.totalPerformanceOrders,
        0
      ),
    };
  }

  const api = {
    MARCH_STAGE_KEYS,
    MARCH_STAGE_DAYS,
    MARCH_STAGE_BONUS_RATES,
    MARCH_SALES_PEOPLE,
    MARCH_SALES_TOTAL_STORES,
    calculateStageDaily,
    calculateSalesPerformanceMetrics,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  globalScope.MarchSalesUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
