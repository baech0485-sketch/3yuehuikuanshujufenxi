(function (globalScope) {
  const COHORT_MONTHS = [
    {
      openMonth: '2025-06',
      stores: 170,
      firstMonth: { month: '2025-06', total: 4415.3, dailyAvg: 0.87 },
      secondMonth: { month: '2025-07', total: 14204.37, dailyAvg: 2.79 },
      thirdMonth: { month: '2025-08', total: 10967.05, dailyAvg: 2.15 },
      threeMonthWindowTotal: 29586.72,
      totalToDate: 51505.19,
    },
    {
      openMonth: '2025-07',
      stores: 283,
      firstMonth: { month: '2025-07', total: 11845.77, dailyAvg: 1.4 },
      secondMonth: { month: '2025-08', total: 31970.12, dailyAvg: 3.77 },
      thirdMonth: { month: '2025-09', total: 14757.31, dailyAvg: 1.74 },
      threeMonthWindowTotal: 58573.2,
      totalToDate: 84620.56,
    },
    {
      openMonth: '2025-08',
      stores: 303,
      firstMonth: { month: '2025-08', total: 22565.76, dailyAvg: 2.48 },
      secondMonth: { month: '2025-09', total: 35953.9, dailyAvg: 3.96 },
      thirdMonth: { month: '2025-10', total: 18797.09, dailyAvg: 2.07 },
      threeMonthWindowTotal: 77316.75,
      totalToDate: 107930.26,
    },
    {
      openMonth: '2025-09',
      stores: 247,
      firstMonth: { month: '2025-09', total: 23808.03, dailyAvg: 3.21 },
      secondMonth: { month: '2025-10', total: 33637.55, dailyAvg: 4.54 },
      thirdMonth: { month: '2025-11', total: 21169.37, dailyAvg: 2.86 },
      threeMonthWindowTotal: 78614.95,
      totalToDate: 120699.12,
    },
    {
      openMonth: '2025-10',
      stores: 168,
      firstMonth: { month: '2025-10', total: 15806.29, dailyAvg: 3.14 },
      secondMonth: { month: '2025-11', total: 29585.84, dailyAvg: 5.87 },
      thirdMonth: { month: '2025-12', total: 17932.8, dailyAvg: 3.56 },
      threeMonthWindowTotal: 63324.93,
      totalToDate: 86734.79,
    },
    {
      openMonth: '2025-11',
      stores: 214,
      firstMonth: { month: '2025-11', total: 13650.46, dailyAvg: 2.13 },
      secondMonth: { month: '2025-12', total: 25790.42, dailyAvg: 4.02 },
      thirdMonth: { month: '2026-01', total: 16094.08, dailyAvg: 2.51 },
      threeMonthWindowTotal: 55534.96,
      totalToDate: 68163.32,
    },
    {
      openMonth: '2025-12',
      stores: 232,
      firstMonth: { month: '2025-12', total: 13246.48, dailyAvg: 1.9 },
      secondMonth: { month: '2026-01', total: 21152.89, dailyAvg: 3.04 },
      thirdMonth: { month: '2026-02', total: 11412.38, dailyAvg: 1.64 },
      threeMonthWindowTotal: 45811.75,
      totalToDate: 53109.13,
    },
    {
      openMonth: '2026-01',
      stores: 86,
      firstMonth: { month: '2026-01', total: 7010.45, dailyAvg: 2.72 },
      secondMonth: { month: '2026-02', total: 7208.49, dailyAvg: 2.79 },
      thirdMonth: { month: '2026-03', total: 5887.45, dailyAvg: 2.28 },
      threeMonthWindowTotal: 20106.39,
      totalToDate: 20106.39,
    },
  ];

  function getCohortMonthsWithMetrics(months = COHORT_MONTHS) {
    return months.map((item) => ({
      ...item,
      peak: ['2025-07', '2025-08', '2025-09', '2025-10'].includes(item.openMonth),
      secondMonthRetentionPct: (item.secondMonth.total / item.firstMonth.total) * 100,
      thirdMonthRetentionPct: (item.thirdMonth.total / item.firstMonth.total) * 100,
      threeMonthPct: Math.round(item.threeMonthWindowTotal / item.totalToDate * 100),
      perStoreTotalReturn: item.totalToDate / item.stores,
      totalPerStore: Math.round(item.totalToDate / item.stores),
      threeMonthAverageDaily:
        (item.firstMonth.dailyAvg + item.secondMonth.dailyAvg + item.thirdMonth.dailyAvg) / 3,
    }));
  }

  function average(numbers) {
    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  }

  function getCohortAverages(months = getCohortMonthsWithMetrics()) {
    return {
      stores: average(months.map((item) => item.stores)),
      firstMonth: {
        total: average(months.map((item) => item.firstMonth.total)),
        dailyAvg: average(months.map((item) => item.firstMonth.dailyAvg)),
      },
      secondMonth: {
        total: average(months.map((item) => item.secondMonth.total)),
        dailyAvg: average(months.map((item) => item.secondMonth.dailyAvg)),
      },
      thirdMonth: {
        total: average(months.map((item) => item.thirdMonth.total)),
        dailyAvg: average(months.map((item) => item.thirdMonth.dailyAvg)),
      },
      secondMonthRetentionPct: average(months.map((item) => item.secondMonthRetentionPct)),
      thirdMonthRetentionPct: average(months.map((item) => item.thirdMonthRetentionPct)),
      threeMonthWindowTotal: average(months.map((item) => item.threeMonthWindowTotal)),
      totalToDate: average(months.map((item) => item.totalToDate)),
      threeMonthPct: average(months.map((item) => item.threeMonthPct)),
      perStoreTotalReturn: average(months.map((item) => item.perStoreTotalReturn)),
      totalPerStore: average(months.map((item) => item.totalPerStore)),
      threeMonthAverageDaily: average(months.map((item) => item.threeMonthAverageDaily)),
    };
  }

  function getSeasonTrendPoints(months = getCohortMonthsWithMetrics(), field = 'totalPerStore') {
    return months.map((item) => ({
      label: item.openMonth.replace('20', '').replace('-', '.'),
      peak: item.peak,
      value: Number(item[field]),
    }));
  }

  function getDailyTrendSeries(months = getCohortMonthsWithMetrics()) {
    return [
      {
        key: 'firstMonth',
        label: '首月日均回款',
        points: months.map((item) => ({
          label: item.openMonth.replace('20', '').replace('-', '.'),
          value: item.firstMonth.dailyAvg,
        })),
      },
      {
        key: 'secondMonth',
        label: '第二月日均回款',
        points: months.map((item) => ({
          label: item.openMonth.replace('20', '').replace('-', '.'),
          value: item.secondMonth.dailyAvg,
        })),
      },
      {
        key: 'thirdMonth',
        label: '第三月日均回款',
        points: months.map((item) => ({
          label: item.openMonth.replace('20', '').replace('-', '.'),
          value: item.thirdMonth.dailyAvg,
        })),
      },
    ];
  }

  const api = {
    COHORT_MONTHS,
    getCohortMonthsWithMetrics,
    getCohortAverages,
    getDailyTrendSeries,
    getSeasonTrendPoints,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  globalScope.CohortDataUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
