// utils/numberFormatter.js
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return "0";

  const number = typeof num === "string" ? parseFloat(num) : num;

  if (isNaN(number)) return "0";

  // For very large numbers, use compact notation
  if (number >= 1000000) {
    return number.toLocaleString("en-US", {
      maximumFractionDigits: decimals,
      notation: "compact",
    });
  }

  // For regular large numbers, use standard formatting with commas
  return number.toLocaleString("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

export const formatCurrency = (amount, currency = "ZAR") => {
  if (amount === null || amount === undefined) return "R0";

  const number = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(number)) return "R0";

  return number.toLocaleString("en-ZA", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  });
};

// Advanced number formatting
export const formatLargeNumber = (num, type = "general") => {
  if (num === null || num === undefined) return "0";

  const number = typeof num === "string" ? parseFloat(num) : num;

  if (isNaN(number)) return "0";

  const formats = {
    kWh: {
      thresholds: [
        { value: 1e9, suffix: "B", decimals: 2 }, // Billion
        { value: 1e6, suffix: "M", decimals: 1 }, // Million
        { value: 1e3, suffix: "K", decimals: 0 }, // Thousand
      ],
    },
    currency: {
      thresholds: [
        { value: 1e9, suffix: "B", decimals: 2 },
        { value: 1e6, suffix: "M", decimals: 1 },
        { value: 1e3, suffix: "K", decimals: 0 },
      ],
    },
    general: {
      thresholds: [
        { value: 1e9, suffix: "B", decimals: 2 },
        { value: 1e6, suffix: "M", decimals: 1 },
        { value: 1e3, suffix: "K", decimals: 0 },
      ],
    },
  };

  const formatConfig = formats[type] || formats.general;

  for (const threshold of formatConfig.thresholds) {
    if (Math.abs(number) >= threshold.value) {
      const formatted = (number / threshold.value).toFixed(threshold.decimals);
      return `${formatted}${threshold.suffix}`;
    }
  }

  return number.toLocaleString("en-US", { maximumFractionDigits: 0 });
};
