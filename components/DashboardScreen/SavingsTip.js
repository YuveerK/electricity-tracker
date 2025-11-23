import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SavingsTip = () => {
  return (
    <View style={styles.tipCard}>
      <Ionicons name="bulb" size={24} color="#FFD700" />
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>Smart Saving</Text>
        <Text style={styles.tipText}>
          Track your daily usage to identify patterns and save on your
          electricity bill
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tipCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
    alignItems: "flex-start",
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#FFD700",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: "#FFD700",
    opacity: 0.8,
    lineHeight: 16,
  },
});

export default SavingsTip;
