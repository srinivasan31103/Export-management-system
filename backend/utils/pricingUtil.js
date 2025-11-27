/**
 * Calculate landed cost for international shipments
 *
 * @param {Object} params - Calculation parameters
 * @returns {Object} - Breakdown of all costs
 */
export const calculateLandedCost = (params) => {
  const {
    productValue,
    freightCost,
    insurancePercent = 2,
    customsDutyPercent = 10,
    handlingFee = 0,
    originCountry,
    destinationCountry
  } = params;

  // Calculate insurance
  const insuranceCost = (productValue * insurancePercent) / 100;

  // Calculate customs value (CIF = Cost + Insurance + Freight)
  const customsValue = productValue + freightCost + insuranceCost;

  // Calculate customs duty
  const customsDuty = (customsValue * customsDutyPercent) / 100;

  // Total landed cost
  const totalLandedCost = productValue + freightCost + insuranceCost + customsDuty + handlingFee;

  return {
    breakdown: {
      productValue: parseFloat(productValue.toFixed(2)),
      freightCost: parseFloat(freightCost.toFixed(2)),
      insuranceCost: parseFloat(insuranceCost.toFixed(2)),
      customsValue: parseFloat(customsValue.toFixed(2)),
      customsDuty: parseFloat(customsDuty.toFixed(2)),
      handlingFee: parseFloat(handlingFee.toFixed(2))
    },
    totalLandedCost: parseFloat(totalLandedCost.toFixed(2)),
    percentageOfProductValue: parseFloat(((totalLandedCost / productValue) * 100).toFixed(2)),
    route: `${originCountry} → ${destinationCountry}`
  };
};

/**
 * Calculate freight cost based on weight and volume
 *
 * @param {Object} params
 * @returns {number}
 */
export const calculateFreightCost = (params) => {
  const {
    weightKg,
    volumeCbm,
    ratePerKg = 2.5,
    ratePerCbm = 150,
    modeOfTransport = 'sea'
  } = params;

  // Use chargeable weight (higher of actual weight or volumetric weight)
  const volumetricWeight = volumeCbm * 167; // Standard conversion for sea freight
  const chargeableWeight = Math.max(weightKg, volumetricWeight);

  let freightCost;

  if (modeOfTransport === 'sea') {
    // Sea freight typically charged per CBM
    freightCost = volumeCbm * ratePerCbm;
  } else if (modeOfTransport === 'air') {
    // Air freight charged per kg
    freightCost = chargeableWeight * ratePerKg;
  } else {
    // Road/rail - use weight-based
    freightCost = weightKg * ratePerKg;
  }

  return parseFloat(freightCost.toFixed(2));
};

/**
 * Apply markup to base cost
 *
 * @param {number} baseCost
 * @param {number} markupPercent
 * @returns {Object}
 */
export const applyMarkup = (baseCost, markupPercent) => {
  const markupAmount = (baseCost * markupPercent) / 100;
  const finalPrice = baseCost + markupAmount;

  return {
    baseCost: parseFloat(baseCost.toFixed(2)),
    markupPercent,
    markupAmount: parseFloat(markupAmount.toFixed(2)),
    finalPrice: parseFloat(finalPrice.toFixed(2))
  };
};

export default {
  calculateLandedCost,
  calculateFreightCost,
  applyMarkup
};
