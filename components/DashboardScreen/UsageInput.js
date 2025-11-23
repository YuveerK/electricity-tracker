import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const UsageInput = ({ unitsInput, setUnitsInput, onAddUnits, previewCost }) => {
  // Safe cost calculation
  const getPreviewCostText = () => {
    if (!previewCost) return null;

    // Handle different possible structures of previewCost
    const totalCost = previewCost.total || previewCost.totalCost || 0;

    // Ensure it's a number before using toFixed
    const costValue = typeof totalCost === "number" ? totalCost : 0;

    return `Cost: R ${costValue.toFixed(2)}`;
  };

  const previewText = getPreviewCostText();

  return (
    <View style={styles.inputCard}>
      <Text style={styles.inputTitle}>Add Daily Usage</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter kWh used today..."
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={unitsInput}
          onChangeText={setUnitsInput}
        />
        <TouchableOpacity
          style={[styles.addButton, !unitsInput && styles.addButtonDisabled]}
          onPress={onAddUnits}
          disabled={!unitsInput}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      {previewText && (
        <View style={styles.previewCost}>
          <Text style={styles.previewText}>{previewText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  inputTitle: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#4CD964",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#333",
  },
  previewCost: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4CD964",
  },
  previewText: {
    color: "#4CD964",
    fontFamily: "Roboto_500Medium",
    fontSize: 14,
  },
});

export default UsageInput;
