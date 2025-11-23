import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

const AnalyticsDashboard = ({
  historyData = [],
  loading,
  refreshing,
  onRefresh,
}) => {
  const [timeFrame, setTimeFrame] = useState("month"); // 'day', 'week', 'month', 'year', 'custom'

  // Filter data based on time frame
  const filteredData = useMemo(() => {
    if (!historyData.length) return [];

    const now = new Date();
    let filterDate = new Date();

    switch (timeFrame) {
      case "day":
        filterDate.setDate(now.getDate() - 1);
        break;
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return historyData; // 'all' or 'custom'
    }

    return historyData.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= filterDate;
    });
  }, [historyData, timeFrame]);

  // Group data by time period based on selected time frame
  const groupDataByPeriod = (data, type = "units") => {
    const grouped = {};
    const now = new Date();

    data.forEach((item) => {
      let periodKey;
      const itemDate = new Date(item.timestamp);

      switch (timeFrame) {
        case "day":
          // Group by hour for day view with 12-hour format
          const hour = itemDate.getHours();
          const ampm = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          periodKey = `${hour12} ${ampm}`;
          break;
        case "week":
          // Group by day for week view
          periodKey = itemDate.toLocaleDateString("en-US", {
            weekday: "short",
          });
          break;
        case "month":
          // Group by day for month view (more granular)
          periodKey = itemDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          break;
        case "year":
          // Group by month for year view
          periodKey = itemDate.toLocaleDateString("en-US", {
            month: "short",
          });
          break;
        default:
          // Group by day for all/custom
          periodKey = itemDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
      }

      if (!grouped[periodKey]) {
        grouped[periodKey] = {
          units: 0,
          cost: 0,
          count: 0,
          timestamp: item.timestamp,
        };
      }

      grouped[periodKey].units += item.unitsUsed || 0;
      grouped[periodKey].cost += item.cost?.totalCost || 0;
      grouped[periodKey].count += 1;
    });

    return Object.entries(grouped).map(([period, info]) => ({
      period,
      totalUnits: info.units,
      totalCost: info.cost,
      avgUnits: info.units / info.count,
      avgCost: info.cost / info.count,
      timestamp: info.timestamp,
    }));
  };

  // Daily Usage Bar Chart Data
  const dailyUsageData = useMemo(() => {
    const grouped = groupDataByPeriod(filteredData, "units");

    return grouped
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((item) => ({
        value: Number(item.totalUnits.toFixed(2)),
        label: item.period,
        frontColor: "#4CD964",
        topLabelComponent: () => (
          <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>
            {item.totalUnits.toFixed(1)}
          </Text>
        ),
      }));
  }, [filteredData, timeFrame]);

  // Daily Cost Bar Chart Data
  const dailyCostData = useMemo(() => {
    const grouped = groupDataByPeriod(filteredData, "cost");

    return grouped
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((item) => ({
        value: Number(item.totalCost.toFixed(2)),
        label: item.period,
        frontColor: "#007AFF",
        topLabelComponent: () => (
          <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>
            R{item.totalCost.toFixed(1)}
          </Text>
        ),
      }));
  }, [filteredData, timeFrame]);

  // Key Metrics
  const keyMetrics = useMemo(() => {
    const totalUnits = filteredData.reduce(
      (sum, item) => sum + (item.unitsUsed || 0),
      0
    );
    const totalCost = filteredData.reduce(
      (sum, item) => sum + (item.cost?.totalCost || 0),
      0
    );
    const averageDaily =
      filteredData.length > 0 ? totalUnits / filteredData.length : 0;
    const peakUsage = Math.max(
      ...filteredData.map((item) => item.unitsUsed || 0)
    );

    return {
      totalUnits: Number(totalUnits.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      averageDaily: Number(averageDaily.toFixed(2)),
      peakUsage: Number(peakUsage.toFixed(2)),
      readingsCount: filteredData.length,
    };
  }, [filteredData]);

  // Get appropriate X-axis label based on time frame
  const getXAxisLabel = () => {
    switch (timeFrame) {
      case "day":
        return "Time of Day";
      case "week":
        return "Day of Week";
      case "month":
        return "Date";
      case "year":
        return "Month";
      default:
        return "Date";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CD964" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4CD964"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Energy Analytics</Text>
        <Text style={styles.subtitle}>Track your electricity usage</Text>
      </View>

      {/* Time Frame Selector */}
      <View style={styles.timeFrameContainer}>
        {["day", "week", "month", "year", "all"].map((frame) => (
          <TouchableOpacity
            key={frame}
            style={[
              styles.timeFrameButton,
              timeFrame === frame && styles.timeFrameButtonActive,
            ]}
            onPress={() => setTimeFrame(frame)}
          >
            <Text
              style={[
                styles.timeFrameButtonText,
                timeFrame === frame && styles.timeFrameButtonTextActive,
              ]}
            >
              {frame.charAt(0).toUpperCase() + frame.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{keyMetrics.totalUnits}</Text>
          <Text style={styles.metricLabel}>Total kWh</Text>
          <Text style={styles.metricSubtext}>
            {keyMetrics.readingsCount} readings
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>R{keyMetrics.totalCost}</Text>
          <Text style={styles.metricLabel}>Total Cost</Text>
          <Text style={styles.metricSubtext}>Incl. VAT</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{keyMetrics.averageDaily}</Text>
          <Text style={styles.metricLabel}>Avg Daily</Text>
          <Text style={styles.metricSubtext}>kWh/day</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{keyMetrics.peakUsage}</Text>
          <Text style={styles.metricLabel}>Peak Usage</Text>
          <Text style={styles.metricSubtext}>Highest reading</Text>
        </View>
      </View>

      {/* Usage Bar Chart */}
      {dailyUsageData.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.chartTitle}>
            {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}ly Usage
            (kWh)
          </Text>

          <View style={styles.chartContainer}>
            {/* Y Axis Label */}
            <View style={styles.yAxisLabelContainer}>
              <Text style={styles.yAxisLabel}>kWh</Text>
            </View>

            <View style={styles.chartWrapper}>
              <BarChart
                data={dailyUsageData}
                barWidth={22}
                spacing={18}
                roundedTop
                hideRules
                yAxisTextStyle={{ color: "#666", fontSize: 10 }}
                xAxisLabelTextStyle={{
                  color: "#AAA",
                  fontSize: 10,
                  textAlign: "center",
                }}
                barBorderRadius={4}
                height={200}
                noOfSections={5}
                showVerticalLines={false}
                isAnimated
                yAxisOffset={0}
                xAxisColor="#333"
                yAxisColor="#333"
                showFractionalValues
                formatYLabel={(value) => Math.round(value).toString()}
              />
            </View>
          </View>

          {/* X Axis Label */}
          <View style={styles.xAxisLabelContainer}>
            <Text style={styles.xAxisLabel}>{getXAxisLabel()}</Text>
          </View>
        </View>
      )}

      {/* Cost Bar Chart */}
      {dailyCostData.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.chartTitle}>
            {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}ly Cost (R)
          </Text>

          <View style={styles.chartContainer}>
            {/* Y Axis Label */}
            <View style={styles.yAxisLabelContainer}>
              <Text style={styles.yAxisLabel}>R</Text>
            </View>

            <View style={styles.chartWrapper}>
              <BarChart
                data={dailyCostData}
                barWidth={22}
                spacing={18}
                roundedTop
                hideRules
                yAxisTextStyle={{ color: "#666", fontSize: 10 }}
                xAxisLabelTextStyle={{
                  color: "#AAA",
                  fontSize: 10,
                  textAlign: "center",
                }}
                barBorderRadius={4}
                height={200}
                noOfSections={5}
                showVerticalLines={false}
                isAnimated
                yAxisOffset={0}
                xAxisColor="#333"
                yAxisColor="#333"
                showFractionalValues
                formatYLabel={(value) => `R${Math.round(value)}`}
              />
            </View>
          </View>

          {/* X Axis Label */}
          <View style={styles.xAxisLabelContainer}>
            <Text style={styles.xAxisLabel}>{getXAxisLabel()}</Text>
          </View>
        </View>
      )}

      {filteredData.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No data available</Text>
          <Text style={styles.emptyStateSubtext}>
            Add some electricity readings to see analytics
          </Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default AnalyticsDashboard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0A0A0A",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },
  loadingText: {
    color: "#AAA",
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#1A1A1A",
  },
  title: {
    fontSize: 28,
    color: "#FFF",
    fontFamily: "Roboto_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#AAA",
    textAlign: "center",
    marginTop: 4,
  },
  timeFrameContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#1A1A1A",
    gap: 8,
  },
  timeFrameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#2A2A2A",
  },
  timeFrameButtonActive: {
    backgroundColor: "#4CD964",
  },
  timeFrameButtonText: {
    color: "#AAA",
    fontSize: 12,
    fontWeight: "500",
  },
  timeFrameButtonTextActive: {
    color: "#000",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  metricValue: {
    fontSize: 20,
    color: "#FFF",
    fontFamily: "Roboto_700Bold",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: "#AAA",
    marginBottom: 2,
  },
  metricSubtext: {
    fontSize: 12,
    color: "#666",
  },
  card: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 16,
    margin: 12,
    marginTop: 0,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  chartTitle: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Roboto_500Medium",
    marginBottom: 16,
    textAlign: "center",
  },
  // Chart Layout
  chartContainer: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  yAxisLabelContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    marginRight: 8,
  },
  yAxisLabel: {
    color: "#AAA",
    fontSize: 12,
    fontWeight: "500",
    transform: [{ rotate: "-90deg" }],
  },
  chartWrapper: {
    flex: 1,
  },
  xAxisLabelContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  xAxisLabel: {
    color: "#AAA",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    color: "#FFF",
    fontSize: 18,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: "#AAA",
    fontSize: 14,
    textAlign: "center",
  },
});
