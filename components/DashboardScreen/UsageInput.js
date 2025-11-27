import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme/app-theme";

const UsageInput = ({
  unitsInput,
  setUnitsInput,
  onAddUnits,
  previewCost,
  lastReading,
}) => {
  const getPreviewCostText = () => {
    if (!previewCost) return null;
    const totalCost = previewCost.total || previewCost.totalCost || 0;
    const costValue = typeof totalCost === "number" ? totalCost : 0;
    return `Cost: R ${costValue.toFixed(2)}`;
  };

  const previewText = getPreviewCostText();

  return (
    <View style={styles.inputCard}>
      <Text style={styles.inputTitle}>Add Meter Reading 🔌</Text>

      {lastReading !== null && (
        <Text style={styles.lastReadingText}>
          Last reading:{" "}
          <Text style={{ color: theme.PRIMARY_GREEN, fontWeight: "700" }}>
            {lastReading} kWh
          </Text>
        </Text>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter current meter reading..."
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
    borderColor: theme.BORDER_COLOR,
  },
  inputTitle: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginBottom: 8,
  },
  lastReadingText: {
    color: "#AAA",
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.BORDER_COLOR,
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
    backgroundColor: theme.PRIMARY_GREEN,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#333",
  },
  previewCost: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.BORDER_COLOR,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.PRIMARY_GREEN,
  },
  previewText: {
    color: theme.PRIMARY_GREEN,
    fontFamily: "Roboto_500Medium",
    fontSize: 14,
  },
});

export default UsageInput;
