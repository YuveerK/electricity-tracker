/**
 * Calculates electricity cost based on Three-Phase 80A tariff (ENERGY CHARGE ONLY)
 * @param {number} units - kWh consumed
 * @returns {Object} Object containing cost breakdown
 */
export function calculateElectricityCost(units) {
  // Three-Phase 80A tariff rates (in Rands, not cents) - ENERGY CHARGES ONLY
  const tariffRates = [
    { min: 0, max: 500, rate: 2.5755 }, // 257.55 c/kWh = R 2.5755/kWh
    { min: 501, max: 1000, rate: 2.9558 }, // 295.58 c/kWh = R 2.9558/kWh
    { min: 1001, max: 2000, rate: 3.1738 }, // 317.38 c/kWh = R 3.1738/kWh
    { min: 2001, max: 3000, rate: 3.3486 }, // 334.86 c/kWh = R 3.3486/kWh
    { min: 3001, max: Infinity, rate: 3.5129 }, // 351.29 c/kWh = R 3.5129/kWh
  ];

  const vatRate = 0.15; // 15% VAT

  let energyCost = 0;
  let remainingUnits = units;

  // Calculate energy cost using sliding scale with better precision
  for (let i = 0; i < tariffRates.length; i++) {
    if (remainingUnits <= 0) break;

    const block = tariffRates[i];
    let unitsInThisBlock;

    if (i === 0) {
      // First block: 0-500 (500 units total)
      unitsInThisBlock = Math.min(remainingUnits, 500);
    } else {
      // Other blocks: calculate based on block range
      const blockSize = block.max - block.min + 1;
      unitsInThisBlock = Math.min(remainingUnits, blockSize);
    }

    if (unitsInThisBlock > 0) {
      // Use more precise calculation to avoid floating point errors
      energyCost += unitsInThisBlock * block.rate;
      remainingUnits -= unitsInThisBlock;
    }
  }

  // Use more precise rounding to avoid floating point errors
  const preciseEnergyCost = Math.round(energyCost * 100) / 100;
  const vat = Math.round(preciseEnergyCost * vatRate * 100) / 100;
  const totalCost = Math.round((preciseEnergyCost + vat) * 100) / 100;

  return {
    units: units,
    energyCost: parseFloat(preciseEnergyCost.toFixed(2)),
    costBeforeVat: parseFloat(preciseEnergyCost.toFixed(2)),
    vat: parseFloat(vat.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    breakdown: getBreakdown(units, tariffRates),
  };
}

/**
 * Helper function to get detailed breakdown by consumption blocks
 */
function getBreakdown(units, tariffRates) {
  const breakdown = [];
  let remainingUnits = units;

  for (let i = 0; i < tariffRates.length; i++) {
    if (remainingUnits <= 0) break;

    const block = tariffRates[i];
    let unitsInThisBlock;

    if (i === 0) {
      // First block: 0-500 (500 units total)
      unitsInThisBlock = Math.min(remainingUnits, 500);
    } else {
      // Other blocks: calculate based on block range
      const blockSize = block.max - block.min + 1;
      unitsInThisBlock = Math.min(remainingUnits, blockSize);
    }

    if (unitsInThisBlock > 0) {
      const costForBlock = unitsInThisBlock * block.rate;
      breakdown.push({
        block: `${block.min} - ${block.max === Infinity ? "Above" : block.max}`,
        units: unitsInThisBlock,
        rate: block.rate,
        cost: parseFloat(costForBlock.toFixed(2)),
      });
      remainingUnits -= unitsInThisBlock;
    }
  }

  return breakdown;
}
