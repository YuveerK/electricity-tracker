export const theme = {
  // Primary Colors
  PRIMARY_GREEN: "#4CD964", // Changed from #4CD964 to yellow
  PRIMARY_YELLOW: "#ffe85c",
  PRIMARY_GREY: "#888",

  // Background Colors
  BACKGROUND_COLOR: "#0A0A0A",
  CARD_BACKGROUND: "#111111",
  SECTION_BACKGROUND: "#1A1A1A",

  // Border & Divider Colors
  BORDER_COLOR: "#2A2A2A",
  DIVIDER_COLOR: "#333333",

  // Text Colors
  PRIMARY_WHITE: "#FFFFFF",
  SECONDARY_WHITE: "#F0F0F0",
  TERTIARY_WHITE: "#E0E0E0",

  // Status & Accent Colors
  SUCCESS_COLOR: "#4CD964", // Keeping green for success states if needed
  WARNING_COLOR: "#FF9500",
  ERROR_COLOR: "#FF3B30",
  INFO_COLOR: "#007AFF",

  // Interactive States
  PRIMARY_HOVER: "#ffed7a", // Lighter yellow for hover states
  PRIMARY_ACTIVE: "#ffdf33", // Darker yellow for active states
  DISABLED_COLOR: "#444444",

  // Gradients (if needed)
  GRADIENT_START: "#ffe85c",
  GRADIENT_END: "#ffdf33",
};

//   PRIMARY_GREEN: "#ffe85c", // Changed from #4CD964 to yellow

// Optional: If you want to maintain backward compatibility
export const legacyTheme = {
  ...theme,
  PRIMARY_GREEN: theme.PRIMARY_YELLOW, // Alias for backward compatibility
};
