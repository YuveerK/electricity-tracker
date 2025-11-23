import React from "react";
import { View, Text, StyleSheet } from "react-native";
import StatCard from "./StatCard";

const EnergyCard = ({
  todayUsage,
  monthlyTotal,
  yesterdayUsage,
  weeklyUsage = [],
}) => {
  // Calculate TOTAL usage for today from all today's entries
  const calculateTodayTotal = () => {
    if (!weeklyUsage || !Array.isArray(weeklyUsage))
      return { units: 0, cost: 0 };

    const today = new Date().toDateString();
    const todayEntries = weeklyUsage.filter((entry) => entry.date === today);

    const totalUnits = todayEntries.reduce(
      (sum, entry) => sum + (entry.unitsUsed || 0),
      0
    );
    const totalCost = todayEntries.reduce(
      (sum, entry) => sum + (entry.cost?.totalCost || 0),
      0
    );

    return { units: totalUnits, cost: totalCost };
  };

  // Safe trend calculation
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0 || !current) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get today's total (sum of all today's entries)
  const todayTotal = calculateTodayTotal();
  const todayUnits = todayTotal.units;
  const todayCost = todayTotal.cost;

  // For trend calculation, use today's total vs yesterday
  const yesterdayUnits = yesterdayUsage?.unitsUsed || 0;
  const trend = calculateTrend(todayUnits, yesterdayUnits);

  console.log("Today's total:", todayTotal);
  console.log(
    "Today entries count:",
    weeklyUsage.filter((entry) => entry.date === new Date().toDateString())
      .length
  );

  // Safe number formatting
  const formatNumber = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "0";
    return num.toFixed(0);
  };

  const formatCurrency = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  return (
    <View style={styles.energyCard}>
      <View style={styles.energyCardHeader}>
        <View>
          <Text style={styles.energyLabel}>Today's Total Usage</Text>
          <Text style={styles.energyValue}>{todayUnits.toFixed(1)} kWh</Text>
          <Text style={styles.energyCost}>R {formatCurrency(todayCost)}</Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>TODAY</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="flash"
          value={`${todayUnits.toFixed(1)} kWh`}
          label="Today's Total"
          color="#FF9500"
        />
        <StatCard
          icon="trending-up"
          value={`${trend > 0 ? "+" : ""}${Math.abs(trend).toFixed(1)}%`}
          label="vs Yesterday"
          trend={trend}
          color={trend > 0 ? "#FF3B30" : "#4CD964"}
        />
        <StatCard
          icon="calendar"
          value={`${formatNumber(monthlyTotal.totalUnits)} kWh`}
          label="This Month"
          color="#5AC8FA"
        />
        <StatCard
          icon="cash"
          value={`R ${formatNumber(monthlyTotal.totalCost)}`}
          label="Month Cost"
          color="#4CD964"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  energyCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  energyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  energyLabel: {
    fontSize: 16,
    fontFamily: "Roboto_500Medium",
    color: "#888",
    marginBottom: 8,
  },
  energyValue: {
    fontSize: 36,
    fontFamily: "Roboto_900Black",
    color: "#4CD964",
    marginBottom: 4,
  },
  energyCost: {
    fontSize: 18,
    fontFamily: "Roboto_500Medium",
    color: "#FFF",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CD964",
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -4,
  },
});

export default EnergyCard;
