import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme/app-theme";
const StatCard = ({ icon, value, label, trend, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend !== undefined && (
      <View style={styles.trendContainer}>
        <Ionicons
          name={trend > 0 ? "trending-up" : "trending-down"}
          size={12}
          color={trend > 0 ? "#FF3B30" : theme.PRIMARY_GREEN}
        />
        <Text
          style={[
            styles.trendText,
            { color: trend > 0 ? "#FF3B30" : theme.PRIMARY_GREEN },
          ]}
        >
          {Math.abs(trend).toFixed(1)}%
        </Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    width: Dimensions.get("screen").width / 2 - 50,
    backgroundColor: theme.BORDER_COLOR,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 4, // Add small horizontal margin
    borderWidth: 1,
    borderColor: "#333",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  trendText: {
    fontSize: 11,
    fontFamily: "Roboto_700Bold",
    marginLeft: 4,
  },
});

export default StatCard;
