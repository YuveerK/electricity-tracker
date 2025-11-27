import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { theme } from "../../theme/app-theme";

const TimeFrameButton = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.timeFrameButton, isActive && styles.timeFrameButtonActive]}
    onPress={onPress}
  >
    <Text
      style={[styles.timeFrameText, isActive && styles.timeFrameTextActive]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const TimeFrameSelector = ({ activeTimeFrame, setActiveTimeFrame }) => {
  return (
    <View style={styles.timeFrameContainer}>
      <TimeFrameButton
        label="24H"
        isActive={activeTimeFrame === "day"}
        onPress={() => setActiveTimeFrame("day")}
      />
      <TimeFrameButton
        label="Week"
        isActive={activeTimeFrame === "week"}
        onPress={() => setActiveTimeFrame("week")}
      />
      <TimeFrameButton
        label="Month"
        isActive={activeTimeFrame === "month"}
        onPress={() => setActiveTimeFrame("month")}
      />
      <TimeFrameButton
        label="Year"
        isActive={activeTimeFrame === "year"}
        onPress={() => setActiveTimeFrame("year")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  timeFrameContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  timeFrameButtonActive: {
    backgroundColor: theme.BORDER_COLOR,
  },
  timeFrameText: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: theme.PRIMARY_GREY,
  },
  timeFrameTextActive: {
    color: theme.PRIMARY_GREEN,
  },
});

export default TimeFrameSelector;
