import React from "react";
import { View, Text, StyleSheet } from "react-native";
import StatCard from "./StatCard";
import { theme } from "../../theme/app-theme";

const EnergyCard = ({ todayUsage, monthlyTotal, weeklyUsage = [] }) => {
  const todayDate = new Date().toDateString();
  const yesterdayDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toDateString();
  })();
  const todayEntries = weeklyUsage.filter((e) => e.date === todayDate);
  const yesterdayEntries = weeklyUsage.filter((e) => e.date === yesterdayDate);

  // --- UNITS ---
  const todayTotal = todayEntries.reduce(
    (sum, e) => sum + (e.unitsUsed || 0),
    0
  );

  const yesterdayUnits = yesterdayEntries.reduce(
    (sum, e) => sum + (e.unitsUsed || 0),
    0
  );

  // --- COST (MATCHES UsageInput logic) ---
  const todayCost = todayEntries.reduce((sum, e) => {
    const c = e.cost || {};
    const costValue = c.total || c.totalCost || 0;
    return sum + costValue;
  }, 0);

  // --- TREND ---
  const trend =
    yesterdayUnits > 0
      ? ((todayTotal - yesterdayUnits) / yesterdayUnits) * 100
      : 0;

  return (
    <View style={styles.energyCard}>
      <View style={styles.energyCardHeader}>
        <View>
          <Text style={styles.energyLabel}>Today's Total Usage</Text>
          <Text style={styles.energyValue}>{todayTotal.toFixed(1)} kWh</Text>

          {/* FIXED COST DISPLAY */}
          <Text style={styles.energyCost}>R {todayCost.toFixed(2)}</Text>
        </View>

        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>TODAY</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {/* Today */}
        <StatCard
          icon="flash"
          value={`${todayTotal.toFixed(1)} kWh`}
          label="Today's Usage"
          color="#FF9500"
        />

        {/* Trend */}
        <StatCard
          icon="stats-chart-outline"
          value={`${trend > 0 ? "+" : ""}${trend.toFixed(1)}%`}
          label="vs Yesterday"
          trend={trend}
          color={trend > 0 ? "#FF3B30" : theme.PRIMARY_GREEN}
        />

        {/* Month Units */}
        <StatCard
          icon="calendar"
          value={`${monthlyTotal.totalUnits} kWh`}
          label="This Month"
          color="#5AC8FA"
        />

        {/* Month Cost */}
        <StatCard
          icon="cash"
          value={`R ${monthlyTotal.totalCost}`}
          label="Month Cost"
          color={theme.PRIMARY_GREEN}
        />
      </View>
    </View>
  );
};

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  energyCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
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
    color: theme.PRIMARY_GREY,
    marginBottom: 8,
  },
  energyValue: {
    fontSize: 26,
    fontFamily: "Roboto_900Black",
    color: theme.PRIMARY_GREEN,
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
    backgroundColor: theme.BORDER_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.PRIMARY_GREEN,
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

export default React.memo(EnergyCard);
