// AnalyticsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  Roboto_400Regular,
  Roboto_300Light,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from "@expo-google-fonts/roboto";
import { LineChart, BarChart, PieChart } from "react-native-gifted-charts";
import Ionicons from "@expo/vector-icons/Ionicons";
// Components
import Header from "../components/DashboardScreen/Header";
import DateRangePicker from "../components/HistoryScreen/DateRangePicker";
import EmptyState from "../components/HistoryScreen/EmptyState";
import LoadingIndicator from "../components/HistoryScreen/LoadingIndicator";
import HistoryStats from "../components/HistoryScreen/HistoryStats";

// Services
import { firebaseService } from "../services/firebaseService";
import { formatCurrency } from "../utils/numberFormatter";
import { calculateElectricityCost } from "../helper/electricity-calculation.helper";
import { theme } from "../theme/app-theme";
const { width: screenWidth } = Dimensions.get("window");

const AnalyticsScreen = () => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_300Light,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
  });

  const [historyData, setHistoryData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Store original data for total calculation
  const [selectedData, setSelectedData] = useState(null);
  const [showTooltipModal, setShowTooltipModal] = useState(false);
  const [dateRange, setDateRange] = useState("month");
  const [customRange, setCustomRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsage: 0,
    totalCost: 0,
    averageDaily: 0,
  });

  useEffect(() => {
    loadHistoryData();
  }, [dateRange, customRange]);

  const loadHistoryData = async () => {
    try {
      setLoading(true);

      let startDate, endDate;

      if (dateRange === "custom") {
        startDate = new Date(customRange.startDate);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(customRange.endDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        startDate = new Date();
        startDate.setDate(startDate.getDate() - getDaysForRange());
        startDate.setHours(0, 0, 0, 0);
      }

      const usageData = await firebaseService.getUsageByDateRange(
        startDate,
        endDate
      );

      // Store original data for total calculation
      setOriginalData(usageData);

      const dailyData = aggregateDailyUsage(usageData);

      const sortedData = dailyData.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      setHistoryData(sortedData);
      calculateStats(usageData); // Pass original data for total calculation
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const aggregateDailyUsage = (data) => {
    const grouped = {};

    data.forEach((entry) => {
      const day = new Date(entry.timestamp).toDateString();

      if (!grouped[day]) {
        grouped[day] = {
          date: day,
          firstReading: entry.reading,
          lastReading: entry.reading,
          readings: [],
        };
      }

      grouped[day].firstReading = Math.min(
        grouped[day].firstReading,
        entry.reading
      );
      grouped[day].lastReading = Math.max(
        grouped[day].lastReading,
        entry.reading
      );
      grouped[day].readings.push(entry);
    });

    return Object.values(grouped).map((dayEntry) => {
      const unitsUsed = dayEntry.lastReading - dayEntry.firstReading;

      const cost = calculateElectricityCost(unitsUsed);

      return {
        timestamp: new Date(dayEntry.date),
        unitsUsed,
        cost,
        reading: dayEntry.lastReading,
      };
    });
  };

  const getDaysForRange = () => {
    switch (dateRange) {
      case "week":
        return 7;
      case "month":
        return 30;
      case "quarter":
        return 90;
      case "year":
        return 365;
      case "custom":
        const diffTime = Math.abs(customRange.endDate - customRange.startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      default:
        return 30;
    }
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({
        totalUsage: 0,
        totalCost: 0,
        totalCostBeforeVat: 0,
        totalVat: 0,
        averageDaily: 0,
        averageCostDaily: 0,
        days: 0,
        blocks: {},
      });
      return;
    }

    // CORRECT: Use cumulative meter readings like HistoryScreen
    const sortedAsc = [...data].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const firstReading = sortedAsc[0].reading;
    const lastReading = sortedAsc[sortedAsc.length - 1].reading;
    const totalUsage = lastReading - firstReading;

    // Calculate cost based on total usage (like HistoryScreen)
    const costObj = calculateElectricityCost(totalUsage);
    const totalCost = costObj.totalCost;
    const totalCostBeforeVat = costObj.costBeforeVat;
    const totalVat = costObj.vat;

    const days = new Set(data.map((d) => new Date(d.timestamp).toDateString()))
      .size;

    setStats({
      totalUsage,
      totalCost,
      totalCostBeforeVat,
      totalVat,
      averageDaily: totalUsage / days,
      averageCostDaily: totalCost / days,
      days,
      blocks: costObj.breakdown.reduce((acc, b) => {
        acc[b.block] = {
          units: b.units,
          cost: b.cost * 1.15, // Include VAT
        };
        return acc;
      }, {}),
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistoryData();
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleCustomRangeChange = (startDate, endDate) => {
    setCustomRange({ startDate, endDate });
    setDateRange("custom");
  };

  const formatDateRangeLabel = () => {
    switch (dateRange) {
      case "week":
        return "Last 7 Days";
      case "month":
        return "Last 30 Days";
      case "quarter":
        return "Last 90 Days";
      case "year":
        return "Last 365 Days";
      case "custom":
        return `${customRange.startDate.toLocaleDateString()} - ${customRange.endDate.toLocaleDateString()}`;
      default:
        return "Last 30 Days";
    }
  };

  // Prepare data for charts with better label handling
  const prepareLineChartData = () => {
    if (historyData.length === 0) return [];

    // For better label spacing, show fewer labels when there are many data points
    const showEveryNthLabel = Math.ceil(historyData.length / 8);

    return historyData.map((item, index) => ({
      value: item.unitsUsed || 0,
      label:
        index % showEveryNthLabel === 0
          ? new Date(item.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "",
      labelTextStyle: { color: theme.PRIMARY_GREY, fontSize: 10 },
    }));
  };

  const prepareBarChartData = () => {
    if (historyData.length === 0) return [];

    // For better label spacing, show fewer labels when there are many data points
    const showEveryNthLabel = Math.ceil(historyData.length / 8);

    return historyData.map((item, index) => ({
      value: item.cost?.totalCost || 0,
      label:
        index % showEveryNthLabel === 0
          ? new Date(item.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "",
      labelTextStyle: { color: theme.PRIMARY_GREY, fontSize: 10 },
      frontColor: theme.PRIMARY_GREEN,
    }));
  };

  const preparePieChartData = () => {
    const blockData = {};

    // Use the same cumulative approach as calculateStats
    const sortedAsc = [...originalData].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    const firstReading = sortedAsc[0].reading;
    const lastReading = sortedAsc[sortedAsc.length - 1].reading;
    const totalUsage = lastReading - firstReading;

    // Calculate which tariff blocks this total usage falls into
    const costObj = calculateElectricityCost(totalUsage);

    // Use the breakdown from the total calculation instead of summing daily units
    costObj.breakdown.forEach((block) => {
      blockData[block.block] = {
        units: block.units,
        cost: block.cost * 1.15, // Include VAT
      };
    });

    const colors = [
      theme.PRIMARY_GREEN,
      "#5AC8FA",
      "#FF9500",
      "#FF3B30",
      "#BF5AF2",
    ];
    let colorIndex = 0;

    return Object.entries(blockData).map(([block, data]) => ({
      value: data.units,
      label: block,
      color: colors[colorIndex++ % colors.length],
    }));
  };

  const getTariffBlock = (units) => {
    if (units <= 500) return "Block 1";
    if (units <= 1000) return "Block 2";
    if (units <= 2000) return "Block 3";
    return "Block 4";
  };

  const ChartContainer = ({ title, children }) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      {children}
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.PRIMARY_GREEN}
            colors={[theme.PRIMARY_GREEN]}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerContent}>
          <Header
            title="Usage Analytics"
            subtitle={formatDateRangeLabel()}
            showProfile={false}
          />

          <DateRangePicker
            activeRange={dateRange}
            onRangeChange={handleDateRangeChange}
            customRange={customRange}
            onCustomRangeChange={handleCustomRangeChange}
          />

          <HistoryStats stats={stats} period={formatDateRangeLabel()} />
        </View>

        {historyData.length === 0 ? (
          <EmptyState
            onRetry={loadHistoryData}
            message="No usage data found for analytics"
          />
        ) : (
          <View style={styles.chartsContainer}>
            {/* Daily Usage Trend */}
            <ChartContainer title="Daily Usage Trend (kWh)">
              <LineChart
                data={prepareLineChartData()}
                width={screenWidth - 64}
                height={180}
                areaChart
                curved
                dataPointsColor={theme.PRIMARY_GREEN}
                dataPointsRadius={3}
                color={theme.PRIMARY_GREEN}
                startFillColor="rgba(76, 217, 100, 0.3)"
                endFillColor="rgba(76, 217, 100, 0.05)"
                startOpacity={0.8}
                endOpacity={0.2}
                initialSpacing={10}
                endSpacing={10}
                yAxisColor={theme.BORDER_COLOR}
                xAxisColor={theme.BORDER_COLOR}
                yAxisTextStyle={{ color: theme.PRIMARY_GREY, fontSize: 10 }}
                xAxisLabelTextStyle={{
                  color: theme.PRIMARY_GREY,
                  fontSize: 10,
                  width: 40,
                }}
                rulesColor={theme.BORDER_COLOR}
                rulesType="solid"
                noOfSections={4}
                yAxisLabelPrefix=""
                yAxisLabelSuffix=""
                showVerticalLines={false}
                hideDataPoints={historyData.length > 15}
                isAnimated
                animateOnDataChange
                animationDuration={1000}
              />
            </ChartContainer>

            {/* Daily Cost Trend */}
            <ChartContainer title="Daily Cost Trend">
              <BarChart
                data={prepareBarChartData()}
                width={screenWidth - 64}
                height={180}
                barWidth={historyData.length > 15 ? 20 : 30}
                spacing={historyData.length > 15 ? 10 : 15}
                roundedTop
                roundedBottom
                frontColor={theme.PRIMARY_GREEN}
                noOfSections={4}
                yAxisColor={theme.BORDER_COLOR}
                xAxisColor={theme.BORDER_COLOR}
                yAxisTextStyle={{ color: theme.PRIMARY_GREY, fontSize: 10 }}
                xAxisLabelTextStyle={{
                  color: theme.PRIMARY_GREY,
                  fontSize: 10,
                  width: 40,
                }}
                rulesColor={theme.BORDER_COLOR}
                rulesType="solid"
                yAxisLabelPrefix="R"
                showLine={false}
                isAnimated
                animationDuration={1000}
                showVerticalLines
                verticalLinesColor={theme.BORDER_COLOR}
                verticalLinesStrokeWidth={1}
                verticalLinesStrokeDashArray={[2, 3]}
                showValuesOnTopOfBars
                valuesOnTopOfBarsColor="#FFF"
                valuesOnTopOfBarsFontSize={10}
                showGradient
                gradientColor={theme.PRIMARY_GREEN}
                pressEnabled={true}
                onPress={(item, index) => {
                  const selectedData = historyData[index];
                  if (selectedData) {
                    setSelectedData(selectedData);
                    setShowTooltipModal(true);
                  }
                }}
              />
            </ChartContainer>

            {/* Usage Distribution by Tariff Block */}
            <ChartContainer title="Usage by Tariff Block">
              <View style={styles.pieChartContainer}>
                <PieChart
                  data={preparePieChartData()}
                  radius={90}
                  centerLabelComponent={() => (
                    <View style={styles.pieCenterLabel}>
                      <Text style={styles.pieCenterText}>Total</Text>
                      <Text style={styles.pieCenterValue}>
                        {stats.totalUsage.toFixed(0)} kWh
                      </Text>
                    </View>
                  )}
                  showText
                  textColor="#FFF"
                  fontSize={10}
                  fontWeight="bold"
                  strokeWidth={2}
                  strokeColor={theme.BACKGROUND_COLOR}
                  focusOnPress
                />
                <View style={styles.pieLegend}>
                  {preparePieChartData().map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text style={styles.legendText}>
                        {item.label}: {item.value.toFixed(0)} kWh
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ChartContainer>

            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Peak Usage</Text>
                <Text style={styles.summaryValue}>
                  {Math.max(
                    ...historyData.map((item) => item.unitsUsed || 0)
                  ).toFixed(1)}{" "}
                  kWh
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Avg Daily</Text>
                <Text style={styles.summaryValue}>
                  {stats.averageDaily.toFixed(1)} kWh
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Cost</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(stats.totalCost)}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Days Tracked</Text>
                <Text style={styles.summaryValue}>{stats.days}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {/* Custom Tooltip Modal */}
      {showTooltipModal && selectedData && (
        <View style={styles.modalOverlay}>
          <View style={styles.tooltipModal}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Usage Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowTooltipModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.PRIMARY_GREY} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Date & Time</Text>
                <Text style={styles.detailText}>
                  {new Date(selectedData.timestamp).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </Text>
                <Text style={styles.detailSubText}>
                  {new Date(selectedData.timestamp).toLocaleTimeString()}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Usage Information</Text>
                <DetailRow
                  label="Meter Reading"
                  value={`${selectedData.reading} units`}
                />
                <DetailRow
                  label="Units Used"
                  value={`${selectedData.unitsUsed || 0} kWh`}
                />
                <DetailRow
                  label="Tariff Block"
                  value={selectedData.cost?.breakdown?.[0]?.block || "N/A"}
                />
                <DetailRow
                  label="Rate"
                  value={`R${
                    selectedData.cost?.breakdown?.[0]?.rate?.toFixed(4) ||
                    "0.0000"
                  }/kWh`}
                />
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Cost Breakdown</Text>
                <DetailRow
                  label="Cost Before VAT"
                  value={formatCurrency(selectedData.cost?.costBeforeVat || 0)}
                />
                <DetailRow
                  label="VAT (15%)"
                  value={formatCurrency(selectedData.cost?.vat || 0)}
                />
                <View style={styles.totalCostRow}>
                  <Text style={styles.totalCostLabel}>Total Cost</Text>
                  <Text style={styles.totalCostValue}>
                    {formatCurrency(selectedData.cost?.totalCost || 0)}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowTooltipModal(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.BACKGROUND_COLOR,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  chartsContainer: {
    paddingHorizontal: 20,
    gap: 24,
  },
  chartContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16, // Reduced padding
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
    overflow: "hidden", // Add this to prevent overflow
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginBottom: 16,
    textAlign: "center",
  },
  pieChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 200,
  },
  pieCenterLabel: {
    alignItems: "center",
    justifyContent: "center",
  },
  pieCenterText: {
    color: theme.PRIMARY_GREY,
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
  },
  pieCenterValue: {
    color: theme.PRIMARY_GREEN,
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    marginTop: 4,
  },
  pieLegend: {
    flex: 1,
    marginLeft: 16,
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
    fontFamily: "Roboto_400Regular",
    flexShrink: 1,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
    width: "47%",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: theme.PRIMARY_GREEN,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: 20,
  },
  tooltipModal: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.BORDER_COLOR,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    maxHeight: 400,
  },
  detailSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.BORDER_COLOR,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: theme.PRIMARY_GREEN,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#FFF",
    textAlign: "right",
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#FFF",
    marginBottom: 4,
  },
  detailSubText: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
  },
  totalCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.BORDER_COLOR,
  },
  totalCostLabel: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: theme.PRIMARY_GREEN,
  },
  totalCostValue: {
    fontSize: 18,
    fontFamily: "Roboto_900Black",
    color: theme.PRIMARY_GREEN,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.BORDER_COLOR,
  },
  modalButton: {
    backgroundColor: theme.PRIMARY_GREEN,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
  },
});

export default AnalyticsScreen;
