// components/Analytics/AnalyticsSummaryCards.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme/app-theme";
import { formatCurrency } from "../../utils/numberFormatter";

const AnalyticsSummaryCards = ({ stats, dailyData }) => {
  const peakUsage = Math.max(...dailyData.map((i) => i.unitsUsed || 0));

  return (
    <View style={styles.grid}>
      <View style={styles.card}>
        <Text style={styles.label}>Peak Usage</Text>
        <Text style={styles.value}>{peakUsage.toFixed(1)} kWh</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Avg Daily</Text>
        <Text style={styles.value}>{stats.averageDaily?.toFixed(1)} kWh</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total Cost</Text>
        <Text style={styles.value}>{formatCurrency(stats.totalCost)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Days Tracked</Text>
        <Text style={styles.value}>{stats.days}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
    width: "47%",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: theme.PRIMARY_GREY,
  },
  value: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: theme.PRIMARY_GREEN,
  },
});

export default AnalyticsSummaryCards;
