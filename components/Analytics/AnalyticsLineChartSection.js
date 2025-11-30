// components/Analytics/AnalyticsLineChartSection.js
import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { theme } from "../../theme/app-theme";

const { width: screenWidth } = Dimensions.get("window");

const AnalyticsLineChartSection = ({ dailyData }) => {
  const prepareLineChartData = () => {
    if (dailyData.length === 0) return [];

    const showEveryNth = Math.ceil(dailyData.length / 8);

    return dailyData.map((item, index) => ({
      value: item.unitsUsed,
      label:
        index % showEveryNth === 0
          ? new Date(item.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "",
      labelTextStyle: { color: theme.PRIMARY_GREY, fontSize: 10 },
    }));
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Daily Usage Trend (kWh)</Text>

      <LineChart
        data={prepareLineChartData()}
        width={screenWidth - 64}
        height={180}
        areaChart
        curved
        color={theme.PRIMARY_GREEN}
        dataPointsColor={theme.PRIMARY_GREEN}
        dataPointsRadius={3}
        startFillColor="rgba(76, 217, 100, 0.3)"
        endFillColor="rgba(76, 217, 100, 0.05)"
        hideDataPoints={dailyData.length > 15}
        startOpacity={0.8}
        endOpacity={0.2}
        initialSpacing={10}
        xAxisColor={theme.BORDER_COLOR}
        yAxisColor={theme.BORDER_COLOR}
        rulesColor={theme.BORDER_COLOR}
        noOfSections={4}
        yAxisTextStyle={{ color: theme.PRIMARY_GREY, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: theme.PRIMARY_GREY, fontSize: 10 }}
        isAnimated
      />
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
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginBottom: 16,
    textAlign: "center",
  },
});

export default AnalyticsLineChartSection;
