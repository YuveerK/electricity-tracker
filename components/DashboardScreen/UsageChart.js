import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme/app-theme";

const { width: screenWidth } = Dimensions.get("window");

const UsageChart = ({ usageData, activeTimeFrame }) => {
  // Transform and validate Firebase data for chart
  const getChartData = () => {
    if (!usageData || !Array.isArray(usageData) || usageData.length === 0) {
      return [];
    }

    // Sort by timestamp and take last 7 days
    const sortedData = [...usageData]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-7); // Last 7 days

    return sortedData.map((usage, index) => {
      // Ensure we have valid data
      const units = usage.units || 0;
      const date = usage.timestamp ? new Date(usage.timestamp) : new Date();

      return {
        value: Math.max(0, units), // Ensure positive value
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        labelTextStyle: styles.chartXAxis,
        // Optional: Add data point text
        dataPointText: units.toString(),
      };
    });
  };

  const chartData = getChartData();

  // Calculate max value for chart (add some padding)
  const getMaxValue = () => {
    if (chartData.length === 0) return 30; // Default max
    const max = Math.max(...chartData.map((item) => item.value));
    return Math.ceil(max * 1.2); // 20% padding
  };

  if (chartData.length === 0) {
    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Energy Consumption</Text>
          <TouchableOpacity style={styles.chartMenu}>
            <Ionicons
              name="ellipsis-horizontal"
              size={16}
              color={theme.PRIMARY_GREY}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyChart}>
          <Ionicons name="analytics" size={48} color="#444" />
          <Text style={styles.emptyChartText}>No data available</Text>
          <Text style={styles.emptyChartSubtext}>
            Add your daily usage to see charts
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Energy Consumption</Text>
        <TouchableOpacity style={styles.chartMenu}>
          <Ionicons
            name="ellipsis-horizontal"
            size={16}
            color={theme.PRIMARY_GREY}
          />
        </TouchableOpacity>
      </View>

      <LineChart
        data={chartData}
        curved
        isAnimated
        animateOnDataChange
        animationDuration={1200}
        areaChart
        startFillColor="rgba(90,200,250,0.3)"
        endFillColor="rgba(90,200,250,0.01)"
        startOpacity={0.8}
        endOpacity={0.1}
        color="#5AC8FA"
        thickness={3}
        spacing={screenWidth / (chartData.length + 1)}
        initialSpacing={10}
        yAxisColor="transparent"
        xAxisColor="transparent"
        hideRules
        hideYAxisText
        noOfSections={4}
        maxValue={getMaxValue()}
        height={160}
        xAxisLabelTextStyle={styles.chartXAxis}
        dataPointsColor="#5AC8FA"
        dataPointsRadius={4}
        showDataPointOnPress={false} // Disable if causing issues
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
  },
  chartMenu: {
    padding: 4,
  },
  chartXAxis: {
    color: theme.PRIMARY_GREY,
    fontSize: 10,
    fontFamily: "Roboto_400Regular",
  },
  emptyChart: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyChartText: {
    color: theme.PRIMARY_GREY,
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
    marginTop: 12,
  },
  emptyChartSubtext: {
    color: "#666",
    fontFamily: "Roboto_400Regular",
    fontSize: 12,
    marginTop: 4,
  },
});

export default UsageChart;
