// src/helper/stats.helper.js
import { calculateElectricityCost } from "./electricity-calculation.helper";

// --------------------------------------------------------
// Calculate start/end dates for a given range
// --------------------------------------------------------
export function calculateDateRange(range, customRange) {
  let startDate, endDate;

  if (range === "custom") {
    startDate = new Date(customRange.startDate);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(customRange.endDate);
    endDate.setHours(23, 59, 59, 999);
  } else {
    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    startDate = new Date();
    startDate.setDate(startDate.getDate() - getDaysForRange(range));
    startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
}

// --------------------------------------------------------
// Number of days per range
// --------------------------------------------------------
export function getDaysForRange(range) {
  switch (range) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "quarter":
      return 90;
    case "year":
      return 365;
    default:
      return 30;
  }
}

// --------------------------------------------------------
// Stats for full-period usage (correct cumulative method)
// --------------------------------------------------------
export function calculateStatsFromReadings(data) {
  if (!data || data.length === 0) {
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

  const sorted = [...data].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const firstReading = sorted[0].reading;
  const lastReading = sorted[sorted.length - 1].reading;

  let totalUsage = lastReading - firstReading;

  // If reset occurred
  if (totalUsage < 0) {
    totalUsage = sorted.reduce((acc, curr, i) => {
      if (i === 0) return 0;
      const prev = sorted[i - 1].reading;
      return acc + (curr.reading >= prev ? curr.reading - prev : curr.reading);
    }, 0);
  }

  // Centralized cost logic (Option 1)
  const costObj = calculateElectricityCost(totalUsage);

  const days = new Set(data.map((d) => new Date(d.timestamp).toDateString()))
    .size;

  return {
    totalUsage,
    totalCost: costObj.totalCost,
    totalCostBeforeVat: costObj.costBeforeVat,
    totalVat: costObj.vat,
    averageDaily: totalUsage / days,
    averageCostDaily: costObj.totalCost / days,
    days,
    blocks: costObj.breakdown.reduce((acc, block) => {
      acc[block.block] = {
        units: block.units,
        cost: block.costWithVat,
      };
      return acc;
    }, {}),
  };
}

// --------------------------------------------------------
// Aggregate daily usage for analytics charts (REFINED)
// --------------------------------------------------------
export function aggregateDailyUsage(data) {
  if (!data || data.length === 0) return [];

  // Step 1 — sort readings ASC (oldest → newest)
  const sorted = [...data].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Step 2 — build dictionary of readings per day
  const dayGroups = {};

  sorted.forEach((entry) => {
    const dayKey = new Date(entry.timestamp).toDateString();

    if (!dayGroups[dayKey]) {
      dayGroups[dayKey] = [];
    }

    dayGroups[dayKey].push(entry);
  });

  // Step 3 — convert grouped days into daily usage items
  const allDays = Object.keys(dayGroups)
    .map((dayKey) => {
      const entries = dayGroups[dayKey].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      return {
        dayKey,
        entries,
        timestamp: new Date(dayKey),
        firstReading: entries[0].reading,
        lastReading: entries[entries.length - 1].reading,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  // Step 4 — compute usage per day
  const results = [];

  for (let i = 0; i < allDays.length; i++) {
    const day = allDays[i];

    let unitsUsed = 0;

    if (day.entries.length >= 2) {
      // Case A: multiple readings → simple difference
      unitsUsed = day.lastReading - day.firstReading;
    } else {
      // Case B: only one reading for the day
      const todayReading = day.lastReading;

      if (i === 0) {
        // First day in dataset → cannot compute difference
        unitsUsed = 0;
      } else {
        const yesterday = allDays[i - 1];
        const yesterdayReading = yesterday.lastReading;

        unitsUsed = todayReading - yesterdayReading;
      }
    }

    // Case C: meter reset → reading dropped (negative difference)
    if (unitsUsed < 0) {
      // Recompute using incremental logic (start from reset point)
      unitsUsed = day.entries[0].reading;
    }

    // Compute cost
    const cost = calculateElectricityCost(unitsUsed);

    results.push({
      timestamp: day.timestamp,
      unitsUsed,
      cost,
      firstReading: day.firstReading,
      lastReading: day.lastReading,
      isSingleReading: day.entries.length === 1,
    });
  }

  return results;
}
