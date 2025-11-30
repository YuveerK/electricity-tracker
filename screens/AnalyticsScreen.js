import React, { useState, useEffect } from "react";
import { View, ScrollView, RefreshControl } from "react-native";

import { useFonts } from "expo-font";
import {
  Roboto_400Regular,
  Roboto_300Light,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from "@expo-google-fonts/roboto";

import AnalyticsHeaderSection from "../components/Analytics/AnalyticsHeaderSection";
import AnalyticsLineChartSection from "../components/Analytics/AnalyticsLineChartSection";
import AnalyticsCostBarChartSection from "../components/Analytics/AnalyticsCostBarChartSection";
import AnalyticsPieChartSection from "../components/Analytics/AnalyticsPieChartSection";
import AnalyticsSummaryCards from "../components/Analytics/AnalyticsSummaryCards";
import AnalyticsTooltipModal from "../components/Analytics/AnalyticsTooltipModal";

import EmptyState from "../components/HistoryScreen/EmptyState";
import LoadingIndicator from "../components/HistoryScreen/LoadingIndicator";

import {
  calculateDateRange,
  calculateStatsFromReadings,
  aggregateDailyUsage,
} from "../helper/stats.helper";

import { firebaseService } from "../services/firebaseService";
import { theme } from "../theme/app-theme";
import { SafeAreaView } from "react-native-safe-area-context";

const AnalyticsScreen = () => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_300Light,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
  });

  const [rawData, setRawData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedData, setSelectedData] = useState(null);
  const [showTooltipModal, setShowTooltipModal] = useState(false);

  const [dateRange, setDateRange] = useState("month");
  const [customRange, setCustomRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, customRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      const { startDate, endDate } = calculateDateRange(dateRange, customRange);

      const usageData = await firebaseService.getUsageByDateRange(
        startDate,
        endDate
      );

      setRawData(usageData);

      const grouped = aggregateDailyUsage(usageData).sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      setDailyData(grouped);

      const statsResult = calculateStatsFromReadings(usageData);
      setStats(statsResult);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const formatDateRangeLabel = () => {
    if (dateRange === "custom") {
      return `${customRange.startDate.toLocaleDateString()} - ${customRange.endDate.toLocaleDateString()}`;
    }

    const labels = {
      week: "Last 7 Days",
      month: "Last 30 Days",
      quarter: "Last 90 Days",
      year: "Last 365 Days",
    };

    return labels[dateRange] || "Last 30 Days";
  };

  if (!fontsLoaded) return null;

  if (loading && !refreshing) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.BACKGROUND_COLOR }}
      >
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.BACKGROUND_COLOR }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.PRIMARY_GREEN}
            colors={[theme.PRIMARY_GREEN]}
          />
        }
      >
        <AnalyticsHeaderSection
          stats={stats}
          dateRangeLabel={formatDateRangeLabel()}
          dateRange={dateRange}
          customRange={customRange}
          onRangeChange={setDateRange}
          onCustomRangeChange={setCustomRange}
        />

        {dailyData.length === 0 ? (
          <EmptyState
            onRetry={loadAnalyticsData}
            message="No usage data found for analytics"
          />
        ) : (
          <>
            <AnalyticsLineChartSection dailyData={dailyData} />

            <AnalyticsCostBarChartSection
              dailyData={dailyData}
              onSelect={(data) => {
                setSelectedData(data);
                setShowTooltipModal(true);
              }}
            />

            <AnalyticsPieChartSection stats={stats} />

            <AnalyticsSummaryCards stats={stats} dailyData={dailyData} />
          </>
        )}
      </ScrollView>

      <AnalyticsTooltipModal
        visible={showTooltipModal}
        data={selectedData}
        onClose={() => setShowTooltipModal(false)}
      />
    </SafeAreaView>
  );
};

export default AnalyticsScreen;
