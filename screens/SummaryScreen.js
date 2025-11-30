import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

import {
  Roboto_400Regular,
  Roboto_300Light,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from "@expo-google-fonts/roboto";

import { theme } from "../theme/app-theme";

const { width: screenWidth } = Dimensions.get("window");

const SummaryScreen = () => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_300Light,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
  });

  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { historyData, stats, periodLabel } = route.params || {};

  const [summaryData, setSummaryData] = useState({
    historyData: [],
    stats: {},
    periodLabel: "Last 30 Days",
  });

  useEffect(() => {
    if (route.params) {
      setSummaryData({
        historyData: route.params.historyData || [],
        stats: route.params.stats || {},
        periodLabel: route.params.periodLabel || "Last 30 Days",
      });
    }
  }, [route.params]);

  const formatCurrency = (amount) => {
    return `R${(amount || 0).toFixed(2)}`;
  };

  const formatNumber = (number) => {
    return (number || 0).toFixed(2);
  };

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Total Units</Text>
        <Text style={styles.statValue}>
          {formatNumber(summaryData.stats.totalUsage)} kWh
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Total Cost Incl VAT</Text>
        <Text style={styles.statValue}>
          {formatCurrency(summaryData.stats.totalCost)}
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Cost Before VAT</Text>
        <Text style={styles.statValue}>
          {formatCurrency(summaryData.stats.totalCostBeforeVat)}
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>VAT Amount</Text>
        <Text style={styles.statValue}>
          {formatCurrency(summaryData.stats.totalVat)}
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Avg Daily Usage</Text>
        <Text style={styles.statValue}>
          {formatNumber(summaryData.stats.averageDaily)} kWh
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Avg Daily Cost</Text>
        <Text style={styles.statValue}>
          {formatCurrency(summaryData.stats.averageCostDaily)}
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Days Counted</Text>
        <Text style={styles.statValue}>{summaryData.stats.days || 0}</Text>
      </View>
    </View>
  );

  const renderBlockBreakdown = () => {
    if (!summaryData.stats.blocks) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>Block Breakdown</Text>
        </View>

        <View style={styles.blockCard}>
          {Object.entries(summaryData.stats.blocks).map(
            ([block, info], index, array) => (
              <View
                key={block}
                style={[
                  styles.blockRow,
                  index === array.length - 1 && styles.blockRowLast,
                ]}
              >
                <Text style={styles.blockName}>{block}</Text>
                <View style={styles.blockDetails}>
                  <Text style={styles.blockUnits}>
                    {formatNumber(info.units)} kWh
                  </Text>
                  <Text style={styles.blockSeparator}> • </Text>
                  <Text style={styles.blockCost}>
                    {formatCurrency(info.cost)}
                  </Text>
                </View>
              </View>
            )
          )}
        </View>
      </View>
    );
  };

  const renderHistoryTable = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionLine} />
        <Text style={styles.sectionTitle}>Daily Usage History</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.tableCellDate]}>
            Date
          </Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellRight]}>
            Reading
          </Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellRight]}>
            Units
          </Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellRight]}>
            Cost
          </Text>
        </View>

        {summaryData.historyData.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
            ]}
          >
            <Text style={[styles.tableCell, styles.tableCellDate]}>
              {new Date(item.timestamp).toLocaleDateString()}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellRight]}>
              {item.reading}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellRight]}>
              {formatNumber(item.unitsUsed)}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellRight]}>
              {formatCurrency(item.cost?.totalCost)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        backgroundColor={theme.BACKGROUND_COLOR}
        barStyle="light-content"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.PRIMARY_GREEN} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Usage Report</Text>
          <Text style={styles.headerSubtitle}>{summaryData.periodLabel}</Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.icon}>⚡</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Grid */}
        {renderStatsGrid()}

        {/* Block Breakdown */}
        {renderBlockBreakdown()}

        {/* History Table */}
        {renderHistoryTable()}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by Electricity Tracker App
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.BACKGROUND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: theme.PRIMARY_GREY,
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.BORDER_COLOR,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    color: theme.PRIMARY_WHITE,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    alignItems: "flex-end",
  },
  icon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.BACKGROUND_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: (screenWidth - 52) / 2, // 20px padding * 2 + 12px gap
    backgroundColor: theme.CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Roboto_500Medium",
    color: theme.PRIMARY_GREY,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Roboto_900Black",
    color: theme.PRIMARY_GREEN,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionLine: {
    width: 6,
    height: 24,
    backgroundColor: theme.PRIMARY_GREEN,
    marginRight: 10,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: theme.PRIMARY_WHITE,
  },
  blockCard: {
    backgroundColor: theme.CARD_BACKGROUND,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
    borderRadius: 14,
    padding: 20,
  },
  blockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.BORDER_COLOR,
  },
  blockRowLast: {
    borderBottomWidth: 0,
  },
  blockName: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: theme.PRIMARY_WHITE,
    flex: 1,
  },
  blockDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  blockUnits: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_WHITE,
  },
  blockSeparator: {
    fontSize: 14,
    color: theme.PRIMARY_GREY,
    marginHorizontal: 8,
  },
  blockCost: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: theme.PRIMARY_WHITE,
  },
  table: {
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
    borderRadius: 14,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: theme.CARD_BACKGROUND,
    borderBottomWidth: 2,
    borderBottomColor: theme.PRIMARY_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  tableHeaderCell: {
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: theme.PRIMARY_WHITE,
    flex: 1,
  },
  tableCell: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_WHITE,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableCellDate: {
    flex: 1.2,
  },
  tableCellRight: {
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: theme.CARD_BACKGROUND,
  },
  tableRowOdd: {
    backgroundColor: "#111111",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.BORDER_COLOR,
    paddingTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
  },
});

export default SummaryScreen;
