const MS_PER_DAY = 24 * 60 * 60 * 1000;

function utcDate(value) {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function largestNoPayoutGapDays(payouts, windowStart, asOf) {
  const payoutDays = [...new Set(payouts.map((payout) => utcDate(payout.payout_date || payout.payoutDate || payout.date).getTime()))]
    .filter((day) => day >= windowStart.getTime() && day <= asOf.getTime())
    .sort((a, b) => a - b);

  let largestGap = 0;
  let previous = windowStart.getTime() - MS_PER_DAY;
  for (const payoutDay of payoutDays) {
    largestGap = Math.max(largestGap, Math.floor((payoutDay - previous) / MS_PER_DAY) - 1);
    previous = payoutDay;
  }
  largestGap = Math.max(largestGap, Math.floor((asOf.getTime() - previous) / MS_PER_DAY));
  return largestGap;
}

/** Calculate a user's trailing-year income profile from payout rows with platform names joined in. */
export function calculateIncomeProfile(payouts = [], asOfInput = new Date()) {
  const asOf = utcDate(asOfInput);
  const windowStart = new Date(asOf.getTime() - 364 * MS_PER_DAY);
  const startMonth = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() - 11, 1));
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() - (11 - index), 1));
    return {
      month: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      year: date.getUTCFullYear(),
      total: 0,
      sources: [0, 0, 0], // Rideshare, Freelance, Mobility
    };
  });

  const inWindow = payouts.filter((payout) => {
    const rawDate = payout.payout_date || payout.payoutDate || payout.date;
    if (!rawDate) return false;
    const date = utcDate(rawDate);
    return date >= windowStart && date <= asOf && date >= startMonth;
  });

  const sourceTotals = new Map();
  for (const payout of inWindow) {
    const rawDate = payout.payout_date || payout.payoutDate || payout.date;
    const date = utcDate(rawDate);
    // index 0 is startMonth, index 11 is current month
    const monthIndex = (date.getUTCFullYear() - startMonth.getUTCFullYear()) * 12
      + date.getUTCMonth() - startMonth.getUTCMonth();
    if (monthIndex < 0 || monthIndex > 11) continue;

    const amount = Number(payout.amount);
    if (!Number.isFinite(amount) || amount < 0) continue;
    months[monthIndex].total += amount;

    const platform = String(payout.platform || 'Unknown').trim() || 'Unknown';
    sourceTotals.set(platform, (sourceTotals.get(platform) || 0) + amount);

    // Group for chart visualization segments
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('zomato') || lowerPlatform.includes('swiggy') || lowerPlatform.includes('blinkit') || lowerPlatform.includes('zepto')) {
      months[monthIndex].sources[0] += amount;
    } else if (lowerPlatform.includes('upwork') || lowerPlatform.includes('freelance') || lowerPlatform.includes('fiverr')) {
      months[monthIndex].sources[1] += amount;
    } else {
      months[monthIndex].sources[2] += amount;
    }
  }

  const incomeValues = months.map((month) => month.total);
  const annualGross = incomeValues.reduce((sum, income) => sum + income, 0);
  const mean = annualGross / 12;
  const variance = incomeValues.reduce((sum, income) => sum + ((income - mean) ** 2), 0) / 12;
  const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 0;

  const weights = months.map((_, index) => (index >= 9 ? 1.2 : index >= 4 ? 1 : 0.8));
  const weightedAnnualGross = months.reduce((sum, month, index) => sum + month.total * weights[index], 0);

  const sourcesTotal = [...sourceTotals.values()].reduce((sum, total) => sum + total, 0);
  const largestSourceShare = sourcesTotal > 0 ? Math.max(...sourceTotals.values()) / sourcesTotal : 0;
  const sourceDiversityMultiplier = largestSourceShare > 0.9
    ? 0.95
    : sourceTotals.size >= 3 && largestSourceShare < 0.6
      ? 1.05
      : 1;

  const largestGapDays = largestNoPayoutGapDays(inWindow, windowStart, asOf);
  const gapPenalty = largestGapDays > 45 ? 0.9 : 1;
  const activeMonths = months.filter((m) => m.total > 0).length;

  const adjustedMonthlyIncome = annualGross === 0
    ? 0
    : Math.max(0,
      (weightedAnnualGross / 12)
        * (1 - coefficientOfVariation * 0.15)
        * sourceDiversityMultiplier
        * gapPenalty,
    );

  const hasUnverifiedIncome = inWindow.some((payout) => payout.is_verified === false || payout.isVerified === false || payout.source_type === 'manual');
  const allIncomeIsApiVerified = inWindow.length > 0 && inWindow.every((payout) => payout.is_verified === true || payout.isVerified === true);
  const verificationStatus = allIncomeIsApiVerified ? 'API Verified' : 'Self-Reported';

  const baseScore = annualGross === 0
    ? 0
    : Math.max(0, Math.min(100,
      100
        - coefficientOfVariation * 40
        - (gapPenalty < 1 ? 15 : 0)
        + (sourceDiversityMultiplier > 1 ? 5 : 0)
        - (12 - activeMonths) * 3,
    ));
  const reliabilityScore = baseScore * (hasUnverifiedIncome ? 0.8 : 1);

  return {
    adjustedMonthlyIncome: round(adjustedMonthlyIncome),
    reliabilityScore: round(reliabilityScore, 1),
    baseReliabilityScore: round(baseScore, 1),
    verificationPenaltyMultiplier: hasUnverifiedIncome ? 0.8 : 1,
    verificationStatus,
    hasUnverifiedIncome,
    window: { start: windowStart.toISOString().slice(0, 10), end: asOf.toISOString().slice(0, 10) },
    annualGross: round(annualGross),
    weightedAnnualGross: round(weightedAnnualGross),
    coefficientOfVariation: round(coefficientOfVariation, 4),
    sourceDiversityMultiplier,
    largestSourceShare: round(largestSourceShare, 4),
    largestGapDays,
    gapPenalty,
    activeMonths,
    months: months.map((month) => ({ ...month, total: round(month.total) })),
    sources: [...sourceTotals.entries()].map(([platform, total]) => ({ platform, total: round(total) })),
  };
}
