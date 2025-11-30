// components/Analytics/AnalyticsCostBarChartSection.js
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { theme } from "../../theme/app-theme";

const { width: screenWidth } = Dimensions.get("window");

const AnalyticsCostBarChartSection = ({ dailyData, onSelect }) => {
  const prepareBarChartData = () => {
    if (dailyData.length === 0) return [];

    const showEveryNth = Math.ceil(dailyData.length / 8);

    return dailyData.map((item, index) => ({
      value: item.cost.totalCost,
      label:
        index % showEveryNth === 0
          ? new Date(item.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "",
      labelTextStyle: { color: theme.PRIMARY_GREY, fontSize: 10 },
      frontColor: theme.PRIMARY_GREEN,
    }));
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Daily Cost Trend</Text>

      <BarChart
        data={prepareBarChartData()}
        width={screenWidth - 64}
        height={180}
        barWidth={dailyData.length > 15 ? 20 : 30}
        spacing={dailyData.length > 15 ? 10 : 15}
        roundedTop
        roundedBottom
        frontColor={theme.PRIMARY_GREEN}
        noOfSections={4}
        xAxisColor={theme.BORDER_COLOR}
        yAxisColor={theme.BORDER_COLOR}
        yAxisTextStyle={{ color: theme.PRIMARY_GREY, fontSize: 10 }}
        rulesColor={theme.BORDER_COLOR}
        yAxisLabelPrefix="R"
        showValuesOnTopOfBars
        valuesOnTopOfBarsColor="#FFF"
        pressEnabled
        onPress={(bar, index) => onSelect(dailyData[index])}
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

export default AnalyticsCostBarChartSection;
