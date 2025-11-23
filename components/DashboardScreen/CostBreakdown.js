import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CostBreakdown = ({ currentCost }) => {
  if (!currentCost) {
    return (
      <View style={styles.costCard}>
        <Text style={styles.cardTitle}>Cost Breakdown</Text>
        <Text style={styles.noDataText}>No usage data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.costCard}>
      <Text style={styles.cardTitle}>Cost Breakdown</Text>

      <View style={styles.costGrid}>
        <View style={styles.costItem}>
          <View style={styles.costHeader}>
            <View style={[styles.costDot, { backgroundColor: "#4CD964" }]} />
            <Text style={styles.costLabel}>Energy Charge</Text>
          </View>
          <Text style={styles.costValue}>
            R {(currentCost.costBeforeVat ?? 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.costItem}>
          <View style={styles.costHeader}>
            <View style={[styles.costDot, { backgroundColor: "#5AC8FA" }]} />
            <Text style={styles.costLabel}>VAT (15%)</Text>
          </View>
          <Text style={styles.costValue}>
            R {(currentCost.vat ?? 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.costItem}>
          <View style={styles.costHeader}>
            <View style={[styles.costDot, { backgroundColor: "#FF9500" }]} />
            <Text style={styles.costLabel}>Total Cost</Text>
          </View>
          <Text style={[styles.costValue, styles.totalCost]}>
            R {(currentCost.totalCost ?? 0).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  costCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginBottom: 20,
  },
  costGrid: {
    gap: 16,
  },
  costItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  costHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  costDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  costLabel: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: "#888",
  },
  costValue: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
  },
  totalCost: {
    color: "#4CD964",
    fontSize: 18,
  },
  noDataText: {
    color: "#888",
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default CostBreakdown;
