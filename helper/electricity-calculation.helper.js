/**
 * Calculates electricity cost based on Three-Phase 80A tariff
 * @param {number} units - kWh consumed
 * @returns {Object} Object containing cost breakdown
 */
export function calculateElectricityCost(units) {
  // Three-Phase 80A tariff rates (in Rands, not cents)
  const tariffRates = [
    { min: 0, max: 500, rate: 2.5755 }, // 257.55 c/kWh = R 2.5755/kWh
    { min: 501, max: 1000, rate: 2.9558 }, // 295.58 c/kWh = R 2.9558/kWh
    { min: 1001, max: 2000, rate: 3.1738 }, // 317.38 c/kWh = R 3.1738/kWh
    { min: 2001, max: 3000, rate: 3.3486 }, // 334.86 c/kWh = R 3.3486/kWh
    { min: 3001, max: Infinity, rate: 3.5129 }, // 351.29 c/kWh = R 3.5129/kWh
  ];

  const vatRate = 0.15; // 15% VAT

  let costBeforeVat = 0;
  let remainingUnits = units;

  // Calculate cost using sliding scale
  for (const block of tariffRates) {
    if (remainingUnits <= 0) break;

    const blockSize =
      block.max === Infinity ? remainingUnits : block.max - block.min + 1;
    const unitsInThisBlock = Math.min(remainingUnits, blockSize);

    if (units >= block.min) {
      costBeforeVat += unitsInThisBlock * block.rate;
      remainingUnits -= unitsInThisBlock;
    }
  }

  const vat = costBeforeVat * vatRate;
  const totalCost = costBeforeVat + vat;

  return {
    units: units,
    costBeforeVat: parseFloat(costBeforeVat.toFixed(2)),
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

  for (const block of tariffRates) {
    if (remainingUnits <= 0) break;

    const blockSize =
      block.max === Infinity ? remainingUnits : block.max - block.min + 1;
    const unitsInThisBlock = Math.min(remainingUnits, blockSize);

    if (units >= block.min && unitsInThisBlock > 0) {
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
