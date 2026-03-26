(function (globalScope) {
  const DEFAULT_AVG_RETURN_DAYS = 75;
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

  function calculateTargetPlanByStandard({
    companyCost,
    grossMarginRate,
    baseDailyThreshold,
    avgReturnDays = DEFAULT_AVG_RETURN_DAYS,
    peakMultiplier = DEFAULT_PEAK_MULTIPLIER,
  }) {
    const cost = assertPositiveNumber(companyCost, '公司总成本');
    const marginRate = assertMarginRate(grossMarginRate);
    const base = assertPositiveNumber(baseDailyThreshold, '合格日均回款基准线');
    const returnDays = assertPositiveNumber(avgReturnDays, '平均回款周期');
    const seasonalMultiplier = assertPositiveNumber(peakMultiplier, '旺季倍率');

    const targetRevenue = cost / (1 - marginRate);
    const targetGrossProfit = targetRevenue - cost;
    const offSeasonPerStoreTotal = base * returnDays;
    const peakPerStoreTotal = base * seasonalMultiplier * returnDays;
    const offSeasonRequiredStoresExact = targetRevenue / offSeasonPerStoreTotal;
    const peakRequiredStoresExact = targetRevenue / peakPerStoreTotal;

    return {
      companyCost: cost,
      grossMarginRate: marginRate,
      baseDailyThreshold: base,
      avgReturnDays: returnDays,
      peakMultiplier: seasonalMultiplier,
      targetRevenue,
      targetGrossProfit,
      offSeasonPerStoreTotal,
      peakPerStoreTotal,
      offSeasonRequiredStoresExact,
      peakRequiredStoresExact,
      offSeasonRequiredStores: Math.ceil(offSeasonRequiredStoresExact),
      peakRequiredStores: Math.ceil(peakRequiredStoresExact),
    };
  }

  const api = {
    DEFAULT_AVG_RETURN_DAYS,
    DEFAULT_PEAK_MULTIPLIER,
    calculateTargetPlanByStandard,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  globalScope.ValidityTargetUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
