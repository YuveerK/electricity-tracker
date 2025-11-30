import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import {
  Roboto_400Regular,
  Roboto_300Light,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from "@expo-google-fonts/roboto";

// Components
import Header from "../components/DashboardScreen/Header";
import DateRangePicker from "../components/HistoryScreen/DateRangePicker";
import HistoryCard from "../components/HistoryScreen/HistoryCard";
import HistoryStats from "../components/HistoryScreen/HistoryStats";
import EmptyState from "../components/HistoryScreen/EmptyState";
import LoadingIndicator from "../components/HistoryScreen/LoadingIndicator";

// Helpers
import {
  calculateStatsFromReadings,
  calculateDateRange,
} from "../helper/stats.helper";

// Services
import { firebaseService } from "../services/firebaseService";
import { theme } from "../theme/app-theme";

const { width: screenWidth } = Dimensions.get("window");

const HistoryScreen = ({ route }) => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_300Light,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
  });

  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState("month");
  const [customRange, setCustomRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({});
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // In HistoryScreen.js, replace the handleGeneratePdf function and update the navigation
  const handleGeneratePdf = async () => {
    try {
      // Navigate to SummaryScreen with the current data
      navigation.navigate("Summary", {
        historyData: filteredData,
        stats: stats,
        periodLabel: formatPeriodLabel(),
      });
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Failed to generate summary");
    }
  };

  // Refresh on screen focus
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.refreshed) {
        loadHistoryData();
        navigation.setParams({ refreshed: false });
      }
    }, [route.params?.refreshed])
  );

  useEffect(() => {
    loadHistoryData();
  }, [dateRange, customRange]);

  const loadHistoryData = async () => {
    try {
      setLoading(true);

      const { startDate, endDate } = calculateDateRange(dateRange, customRange);

      const usageData = await firebaseService.getUsageByDateRange(
        startDate,
        endDate
      );

      const sorted = usageData.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setHistoryData(sorted);
      setFilteredData(sorted);

      const statsResult = calculateStatsFromReadings(usageData);
      setStats(statsResult);
    } catch (error) {
      console.error("Error loading history data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistoryData();
  };

  const handleDateRangeChange = (range) => setDateRange(range);

  const handleCustomRangeChange = (startDate, endDate) => {
    setCustomRange({ startDate, endDate });
    setDateRange("custom");
  };

  const handleEditReading = (reading) =>
    navigation.navigate("EditReading", { reading });

  const handleDeleteReading = (readingId) => {
    Alert.alert(
      "Delete Reading",
      "Are you sure you want to delete this reading?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await firebaseService.deleteReading(readingId);

              const updated = historyData.filter((i) => i.id !== readingId);
              setHistoryData(updated);
              setFilteredData(updated);

              const recalculated = calculateStatsFromReadings(updated);
              setStats(recalculated);
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete reading");
            }
          },
        },
      ]
    );
  };

  const formatPeriodLabel = () => {
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

  // 💚 Added "Generate PDF" button inside header
  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Header
        title="Usage History"
        subtitle={formatPeriodLabel()}
        showProfile={false}
      />

      {/* PDF Button */}
      <TouchableOpacity style={styles.pdfButton} onPress={handleGeneratePdf}>
        <Text style={styles.pdfButtonText}>Generate PDF</Text>
      </TouchableOpacity>

      <DateRangePicker
        activeRange={dateRange}
        onRangeChange={handleDateRangeChange}
        customRange={customRange}
        onCustomRangeChange={handleCustomRangeChange}
      />

      <HistoryStats stats={stats} period={formatPeriodLabel()} />

      {filteredData.length > 0 && (
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>
            {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}{" "}
            found
          </Text>
        </View>
      )}
    </View>
  );

  if (!fontsLoaded) return null;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        style={{ flex: 1 }}
        data={filteredData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.PRIMARY_GREEN}
            colors={[theme.PRIMARY_GREEN]}
          />
        }
        ListHeaderComponent={filteredData.length > 0 ? renderHeader : null}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            {renderHeader()}
            <EmptyState
              onRetry={loadHistoryData}
              message="No usage data found for the selected period"
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <HistoryCard
            data={item}
            isFirst={index === 0}
            isLast={index === filteredData.length - 1}
            onEdit={handleEditReading}
            onDelete={handleDeleteReading}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.BACKGROUND_COLOR,
    flex: 1,
    paddingHorizontal: 10,
  },
  headerContent: {
    paddingHorizontal: 0,
  },
  pdfButton: {
    backgroundColor: theme.PRIMARY_GREEN,
    padding: 14,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: "center",
  },
  pdfButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
  },
  listContent: {
    flex: 1,
    paddingBottom: 20,
  },
  listHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.BORDER_COLOR,
    marginBottom: 8,
  },
  listHeaderText: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: theme.PRIMARY_GREY,
  },
  emptyStateContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default HistoryScreen;
