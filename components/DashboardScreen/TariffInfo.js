import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TariffInfo = () => {
  return (
    <View style={styles.tariffCard}>
      <View style={styles.tariffHeader}>
        <Ionicons name="document-text" size={20} color="#5AC8FA" />
        <Text style={styles.tariffTitle}>Current Tariff</Text>
      </View>
      <Text style={styles.tariffText}>Three-Phase 80A • COJ Rates</Text>
      <View style={styles.tariffRates}>
        <Text style={styles.rateItem}>0-500 kWh: R 2.5755/kWh</Text>
        <Text style={styles.rateItem}>501-1000 kWh: R 2.9558/kWh</Text>
        <Text style={styles.rateItem}>1001-2000 kWh: R 3.1738/kWh</Text>
        <Text style={styles.rateItem}>2001-3000 kWh: R 3.3486/kWh</Text>
        <Text style={styles.rateItem}>3000+ kWh: R 3.5129/kWh</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tariffCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  tariffHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tariffTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginLeft: 8,
  },
  tariffText: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: "#888",
    marginBottom: 12,
  },
  tariffRates: {
    gap: 6,
  },
  rateItem: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: "#666",
  },
});

export default TariffInfo;
