import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber, formatCurrency } from "../../utils/numberFormatter";

const Stat = ({ label, value, icon }) => (
  <View style={styles.statBox}>
    <View style={styles.statLabelRow}>
      {icon && <Ionicons name={icon} size={16} color="#4CD964" />}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const BlockStat = ({ block, units, cost }) => {
  return (
    <View style={styles.blockRow}>
      <Text style={styles.blockLabel}>{block}</Text>
      <Text style={styles.blockValue}>
        {formatNumber(units, 2)} kWh • {cost.toFixed(2)}
      </Text>
    </View>
  );
};

const HistoryStats = ({ stats, period }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.period}>{period}</Text>
        <Ionicons name="stats-chart" size={20} color="#4CD964" />
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <Stat
          label="Total Units"
          value={`${formatNumber(stats.totalUsage, 2)} kWh`}
          icon="flash"
        />

        <Stat
          label="Total Cost"
          value={`R${stats.totalCost.toFixed(2)}`}
          icon="cash-outline"
        />

        <Stat
          label="Cost Before VAT"
          value={`R${stats.totalCostBeforeVat.toFixed(2)}`}
          icon="receipt-outline"
        />

        <Stat
          label="VAT Total"
          value={`R${stats.totalVat.toFixed(2)}`}
          icon="pricetag-outline"
        />

        <Stat
          label="Avg Daily Usage"
          value={`${formatNumber(stats.averageDaily, 2)} kWh`}
          icon="calendar-outline"
        />

        <Stat
          label="Avg Daily Cost"
          value={`R${stats.averageCostDaily.toFixed(2)}`}
          icon="calculator-outline"
        />

        <Stat label="Days Counted" value={stats.days} icon="time-outline" />
      </View>

      {/* BLOCK BREAKDOWN */}
      {stats.blocks && Object.keys(stats.blocks).length > 0 && (
        <View style={styles.blockContainer}>
          <Text style={styles.blockHeader}>Block Breakdown</Text>

          {Object.entries(stats.blocks).map(([block, info]) => (
            <BlockStat
              key={block}
              block={block}
              units={info.units}
              cost={info.cost}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  period: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#888",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statBox: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    width: "46%",
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#AAA",
  },
  statValue: {
    fontSize: 14,
    color: "#4CD964",
    fontFamily: "Roboto_900Black",
  },

  /* BLOCK BREAKDOWN */
  blockContainer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  blockHeader: {
    fontSize: 14,
    color: "#AAA",
    marginBottom: 12,
    fontFamily: "Roboto_700Bold",
  },
  blockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  blockLabel: {
    fontSize: 13,
    color: "#DDD",
  },
  blockValue: {
    fontSize: 13,
    color: "#4CD964",
    fontFamily: "Roboto_700Bold",
  },
});

export default HistoryStats;
