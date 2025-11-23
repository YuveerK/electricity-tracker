import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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

// Services
import { firebaseService } from "../services/firebaseService";

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
  const [stats, setStats] = useState({
    totalUsage: 0,
    totalCost: 0,
    averageDaily: 0,
  });
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Reload data when screen comes into focus (after editing)
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.refreshed) {
        loadHistoryData();
        // Clear the params to prevent infinite reloads
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

      console.log("🚀 Querying date range:", startDate, "->", endDate);

      const usageData = await firebaseService.getUsageByDateRange(
        startDate,
        endDate
      );

      const sortedData = usageData.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setHistoryData(sortedData);
      setFilteredData(sortedData);
      calculateStats(sortedData);
    } catch (error) {
      console.error("Error loading history data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
    if (!data || data.length === 0) {
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

    // Block breakdown
    const blocks = {};
    data.forEach((entry) => {
      entry.cost?.breakdown?.forEach((block) => {
        const blockCostInclVat = block.cost * 1.15;

        if (!blocks[block.block]) {
          blocks[block.block] = { units: 0, cost: 0 };
        }

        blocks[block.block].units += block.units;
        blocks[block.block].cost += blockCostInclVat;
      });
    });

    const totalUsage = data.reduce((sum, d) => sum + (d.unitsUsed || 0), 0);
    const totalCostBeforeVat = data.reduce(
      (sum, d) => sum + (d.cost?.costBeforeVat || 0),
      0
    );
    const totalVat = totalCostBeforeVat * 0.15;
    const totalCost = totalCostBeforeVat + totalVat;

    // Count unique calendar days
    const uniqueDays = new Set(
      data.map((d) => new Date(d.timestamp).toDateString())
    ).size;

    const days = uniqueDays || 1;

    setStats({
      totalUsage,
      totalCost,
      totalCostBeforeVat,
      totalVat,
      averageDaily: totalUsage / days,
      averageCostDaily: totalCost / days,
      days,
      blocks,
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

  const handleEditReading = (reading) => {
    navigation.navigate("EditReading", { reading });
  };

  const handleDeleteReading = async (readingId) => {
    Alert.alert(
      "Delete Reading",
      "Are you sure you want to delete this reading?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await firebaseService.deleteReading(readingId);

              // Update local state
              const updatedData = historyData.filter(
                (item) => item.id !== readingId
              );
              setHistoryData(updatedData);
              setFilteredData(updatedData);
              calculateStats(updatedData);

              Alert.alert("Success", "Reading deleted successfully");
            } catch (error) {
              console.error("Error deleting reading:", error);
              Alert.alert("Error", "Failed to delete reading");
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Header
        title="Usage History"
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

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      {renderHeader()}
      <EmptyState
        onRetry={loadHistoryData}
        message="No usage data found for the selected period"
      />
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top }]}
      edges={["top"]}
    >
      <FlatList
        data={filteredData.length > 0 ? filteredData : []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4CD964"
            colors={["#4CD964"]}
          />
        }
        ListHeaderComponent={filteredData.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
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
    backgroundColor: "#0A0A0A",
    flex: 1,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  listContent: {
    flexGrow: 1,
  },
  listHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    marginBottom: 8,
  },
  listHeaderText: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#888",
  },
  emptyStateContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default HistoryScreen;
