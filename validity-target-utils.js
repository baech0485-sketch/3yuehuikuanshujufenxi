(function (globalScope) {
  const DEFAULT_OFF_SEASON_PER_STORE_TOTAL = 200;
  const DEFAULT_PEAK_SEASON_PER_STORE_TOTAL = 300;
  const DEFAULT_PEAK_MULTIPLIER = 1.5;

  function assertPositiveNumber(value, label) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      throw new Error(`${label} 必须大于 0`);
    }
    return numericValue;
  }

  function assertMarginRate(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0 || numericValue >= 1) {
      throw new Error('毛利率必须在 0 到 1 之间');
    }
    return numericValue;
  }

  function buildTargetPlan({
    targetRevenue,
    grossMarginRate,
    baseDailyThreshold,
    offSeasonPerStoreTotal,
    peakSeasonPerStoreTotal,
    peakMultiplier,
  }) {
    const revenue = assertPositiveNumber(targetRevenue, '目标总回款金额');
    const marginRate = assertMarginRate(grossMarginRate);
    const base = assertPositiveNumber(baseDailyThreshold, '合格日均回款基准线');
    const offSeasonTotal = assertPositiveNumber(offSeasonPerStoreTotal, '淡季单店合格总回款基准');
    const peakSeasonTotal = assertPositiveNumber(peakSeasonPerStoreTotal, '旺季单店合格总回款基准');
    const seasonalMultiplier = assertPositiveNumber(peakMultiplier, '旺季倍率');
    const peakDailyThreshold = base * seasonalMultiplier;

    const companyCost = revenue * (1 - marginRate);
    const targetGrossProfit = revenue - companyCost;
    const offSeasonRequiredStoresExact = revenue / offSeasonTotal;
    const peakRequiredStoresExact = revenue / peakSeasonTotal;
    const offSeasonImpliedDays = offSeasonTotal / base;
    const peakSeasonImpliedDays = peakSeasonTotal / peakDailyThreshold;

    return {
      companyCost,
      grossMarginRate: marginRate,
      baseDailyThreshold: base,
      peakDailyThreshold,
      peakMultiplier: seasonalMultiplier,
      targetRevenue: revenue,
      targetGrossProfit,
      offSeasonPerStoreTotal: offSeasonTotal,
      peakPerStoreTotal: peakSeasonTotal,
      offSeasonRequiredStoresExact,
      peakRequiredStoresExact,
      offSeasonImpliedDays,
      peakSeasonImpliedDays,
      offSeasonRequiredStores: Math.ceil(offSeasonRequiredStoresExact),
      peakRequiredStores: Math.ceil(peakRequiredStoresExact),
    };
  }

  function calculateTargetPlanByStandard({
    companyCost,
    grossMarginRate,
    baseDailyThreshold,
    offSeasonPerStoreTotal = DEFAULT_OFF_SEASON_PER_STORE_TOTAL,
    peakSeasonPerStoreTotal = DEFAULT_PEAK_SEASON_PER_STORE_TOTAL,
    peakMultiplier = DEFAULT_PEAK_MULTIPLIER,
  }) {
    const cost = assertPositiveNumber(companyCost, '公司总成本');
    const marginRate = assertMarginRate(grossMarginRate);
    const targetRevenue = cost / (1 - marginRate);
    const plan = buildTargetPlan({
      targetRevenue,
      grossMarginRate: marginRate,
      baseDailyThreshold,
      offSeasonPerStoreTotal,
      peakSeasonPerStoreTotal,
      peakMultiplier,
    });

    return {
      ...plan,
      companyCost: cost,
    };
  }

  function calculateTargetPlanByOrders({
    offSeasonRequiredStores,
    grossMarginRate,
    baseDailyThreshold,
    offSeasonPerStoreTotal = DEFAULT_OFF_SEASON_PER_STORE_TOTAL,
    peakSeasonPerStoreTotal = DEFAULT_PEAK_SEASON_PER_STORE_TOTAL,
    peakMultiplier = DEFAULT_PEAK_MULTIPLIER,
  }) {
    const requiredStores = assertPositiveNumber(offSeasonRequiredStores, '淡季所需开单数');
    const offSeasonTotal = assertPositiveNumber(offSeasonPerStoreTotal, '淡季单店合格总回款基准');
    const targetRevenue = requiredStores * offSeasonTotal;
    const plan = buildTargetPlan({
      targetRevenue,
      grossMarginRate,
      baseDailyThreshold,
      offSeasonPerStoreTotal: offSeasonTotal,
      peakSeasonPerStoreTotal,
      peakMultiplier,
    });

    return {
      ...plan,
      offSeasonRequiredStoresExact: requiredStores,
      offSeasonRequiredStores: Math.ceil(requiredStores),
    };
  }

  const api = {
    DEFAULT_OFF_SEASON_PER_STORE_TOTAL,
    DEFAULT_PEAK_SEASON_PER_STORE_TOTAL,
    DEFAULT_PEAK_MULTIPLIER,
    calculateTargetPlanByStandard,
    calculateTargetPlanByOrders,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  globalScope.ValidityTargetUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
