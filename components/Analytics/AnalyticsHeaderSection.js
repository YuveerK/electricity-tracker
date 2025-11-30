// components/Analytics/AnalyticsHeaderSection.js
import React from "react";
import { View } from "react-native";
import Header from "../DashboardScreen/Header";
import DateRangePicker from "../HistoryScreen/DateRangePicker";
import HistoryStats from "../HistoryScreen/HistoryStats";

const AnalyticsHeaderSection = ({
  stats,
  dateRangeLabel,
  dateRange,
  customRange,
  onRangeChange,
  onCustomRangeChange,
}) => {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <Header
        title="Usage Analytics"
        subtitle={dateRangeLabel}
        showProfile={false}
      />

      <DateRangePicker
        activeRange={dateRange}
        onRangeChange={onRangeChange}
        customRange={customRange}
        onCustomRangeChange={onCustomRangeChange}
      />

      <HistoryStats stats={stats} period={dateRangeLabel} />
    </View>
  );
};

export default AnalyticsHeaderSection;
