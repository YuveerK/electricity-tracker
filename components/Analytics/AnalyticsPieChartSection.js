// components/Analytics/AnalyticsPieChartSection.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { theme } from "../../theme/app-theme";

const AnalyticsPieChartSection = ({ stats }) => {
  const preparePieChartData = () => {
    if (!stats.blocks) return [];

    const colors = [
      theme.PRIMARY_GREEN,
      "#5AC8FA",
      "#FF9500",
      "#FF3B30",
      "#BF5AF2",
    ];

    let colorIndex = 0;

    return Object.entries(stats.blocks).map(([block, data]) => ({
      value: data.units,
      label: block,
      color: colors[colorIndex++ % colors.length],
    }));
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Usage by Tariff Block</Text>

      <View style={styles.row}>
        <PieChart
          data={preparePieChartData()}
          radius={90}
          centerLabelComponent={() => (
            <View style={styles.center}>
              <Text style={styles.centerText}>Total</Text>
              <Text style={styles.centerValue}>
                {stats.totalUsage?.toFixed(0)} kWh
              </Text>
            </View>
          )}
          strokeWidth={2}
          strokeColor={theme.BACKGROUND_COLOR}
        />

        <View style={styles.legend}>
          {preparePieChartData().map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendText}>
                {item.label}: {item.value.toFixed(0)} kWh
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginBottom: 16,
    textAlign: "center",
  },
  center: {
    alignItems: "center",
  },
  centerText: {
    color: theme.PRIMARY_GREY,
    fontSize: 12,
  },
  centerValue: {
    color: theme.PRIMARY_GREEN,
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
  },
  legend: {
    marginLeft: 16,
    flex: 1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: "#FFF",
    fontSize: 12,
  },
});

export default AnalyticsPieChartSection;
