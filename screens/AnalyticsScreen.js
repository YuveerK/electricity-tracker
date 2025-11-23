import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { firebaseService } from "../services/firebaseService";
import AnalyticsDashboard from "./AnalyticsDashboard";

const AnalyticsScreen = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await firebaseService.getUsageFlexible();
      console.log(`Loaded ${data?.length} records`);
      setHistoryData(data || []);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.container}>
      <AnalyticsDashboard
        historyData={historyData}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

export default AnalyticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
});
