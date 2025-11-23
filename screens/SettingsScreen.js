import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Set Tariff (R/kWh)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Backup / Restore Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Export to CSV</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Reminder Notifications</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  row: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  rowText: {
    fontSize: 18,
    fontWeight: "500",
  },
});

export default SettingsScreen;
