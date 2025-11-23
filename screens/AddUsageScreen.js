import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AddUsageScreen = () => {
  const [meterReading, setMeterReading] = useState("");
  const [notes, setNotes] = useState("");
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Add Daily Usage ⚡</Text>

      {/* CARD WRAPPER */}
      <View style={styles.card}>
        {/* METER INPUT */}
        <Text style={styles.label}>Meter Reading (kWh)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter today's meter reading"
          placeholderTextColor="#555"
          keyboardType="numeric"
          value={meterReading}
          onChangeText={setMeterReading}
        />

        {/* NOTES INPUT */}
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. Geyser on for 2 hours, pool pump running"
          placeholderTextColor="#555"
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* BUTTON */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Save Reading</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // -----------------------------
  // CONTAINER
  // -----------------------------
  container: {
    flex: 1,
    backgroundColor: "#111111",
    padding: 20,
  },

  // -----------------------------
  // TITLE
  // -----------------------------
  title: {
    fontSize: 28,
    fontFamily: "Roboto_700Bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 25,
    letterSpacing: 0.4,
  },

  // -----------------------------
  // CARD
  // -----------------------------
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "#242424",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },

  // -----------------------------
  // LABELS
  // -----------------------------
  label: {
    fontSize: 15,
    fontFamily: "Roboto_500Medium",
    color: "#9f9f9f",
    marginTop: 15,
    marginBottom: 6,
  },

  // -----------------------------
  // INPUTS
  // -----------------------------
  input: {
    backgroundColor: "#131313",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2b2b2b",
    color: "#fff",
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
  },

  textArea: {
    backgroundColor: "#131313",
    padding: 14,
    borderRadius: 14,
    height: 120,
    borderWidth: 1,
    borderColor: "#2b2b2b",
    color: "#fff",
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
    textAlignVertical: "top",
  },

  // -----------------------------
  // BUTTON
  // -----------------------------
  button: {
    marginTop: 30,
    backgroundColor: "#65c878",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#65c878",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  buttonText: {
    color: "#0e0e0e",
    fontFamily: "Roboto_700Bold",
    fontSize: 17,
  },
});

export default AddUsageScreen;
