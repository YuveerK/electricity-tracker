import { calculateElectricityCost } from "./electricity-calculation.helper";

/**
 * Calculate total usage and cost from cumulative meter readings
 * @param {Array} data - Array of usage records with reading and timestamp
 * @returns {Object} Stats object with total usage, cost, breakdown, etc.
 */
export function calculateUsageStats(data) {
  if (data.length === 0) {
    return {
      totalUsage: 0,
      totalCost: 0,
      totalCostBeforeVat: 0,
      totalVat: 0,
      averageDaily: 0,
      averageCostDaily: 0,
      days: 0,
      blocks: {},
    };
  }

  // Sort ASC (oldest → newest)
  const sortedAsc = [...data].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const firstReading = sortedAsc[0].reading;
  const lastReading = sortedAsc[sortedAsc.length - 1].reading;
  const totalUsage = lastReading - firstReading;

  const costObj = calculateElectricityCost(totalUsage);
  const totalCostBeforeVat = costObj.costBeforeVat;
  const totalVat = totalCostBeforeVat * 0.15;
  const totalCost = totalCostBeforeVat + totalVat;

  const days = new Set(data.map((d) => new Date(d.timestamp).toDateString()))
    .size;

  return {
    totalUsage,
    totalCost,
    totalCostBeforeVat,
    totalVat,
    averageDaily: totalUsage / days,
    averageCostDaily: totalCost / days,
    days,
    blocks: costObj.breakdown.reduce((acc, b) => {
      acc[b.block] = {
        units: b.units,
        cost: b.cost * 1.15, // Include VAT
      };
      return acc;
    }, {}),
  };
}

/**
 * Aggregate daily usage from raw meter readings
 * @param {Array} data - Raw usage data
 * @returns {Array} Daily aggregated data
 */
export function aggregateDailyUsage(data) {
  const grouped = {};

  data.forEach((entry) => {
    const day = new Date(entry.timestamp).toDateString();

    if (!grouped[day]) {
      grouped[day] = {
        date: day,
        firstReading: entry.reading,
        lastReading: entry.reading,
        readings: [],
      };
    }

    grouped[day].firstReading = Math.min(
      grouped[day].firstReading,
      entry.reading
    );
    grouped[day].lastReading = Math.max(
      grouped[day].lastReading,
      entry.reading
    );
    grouped[day].readings.push(entry);
  });

  return Object.values(grouped).map((dayEntry) => {
    const unitsUsed = dayEntry.lastReading - dayEntry.firstReading;
    const cost = calculateElectricityCost(unitsUsed);

    return {
      timestamp: new Date(dayEntry.date),
      unitsUsed,
      cost,
      reading: dayEntry.lastReading,
    };
  });
}

/**
 * Prepare pie chart data from usage stats
 * @param {Object} stats - Stats object from calculateUsageStats
 * @returns {Array} Formatted data for PieChart
 */
export function preparePieChartData(stats) {
  const colors = [
    theme.PRIMARY_GREEN,
    "#5AC8FA",
    "#FF9500",
    "#FF3B30",
    "#BF5AF2",
  ];
  let colorIndex = 0;

  return Object.entries(stats.blocks).map(([block, data]) => ({
    value: data.units,
    label: block,
    color: colors[colorIndex++ % colors.length],
  }));
}
