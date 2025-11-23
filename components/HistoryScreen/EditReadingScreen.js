import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { firebaseService } from "../../services/firebaseService";
import { formatCurrency } from "../../utils/numberFormatter";
import { SafeAreaView } from "react-native-safe-area-context";

const EditReadingScreen = ({ route, navigation }) => {
  const { reading } = route.params;

  const [units, setUnits] = useState(reading.units.toString());
  const [timestamp, setTimestamp] = useState(new Date(reading.timestamp));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recalculatedCost, setRecalculatedCost] = useState(null);

  // Calculate cost on initial load
  React.useEffect(() => {
    const initialCost = calculateCost(units);
    setRecalculatedCost(initialCost);
  }, []);

  // Function to calculate cost based on units and tariff blocks
  const calculateCost = (units) => {
    const unitsNum = parseFloat(units);
    if (isNaN(unitsNum) || unitsNum <= 0) return null;

    // Define tariff blocks
    const tariffBlocks = [
      { limit: 500, rate: 1.5 }, // Block 1: 0-500 kWh
      { limit: 1000, rate: 2.0 }, // Block 2: 501-1000 kWh
      { limit: 2000, rate: 2.5 }, // Block 3: 1001-2000 kWh
      { limit: Infinity, rate: 3.0 }, // Block 4: 2001+ kWh
    ];

    let remainingUnits = unitsNum;
    let costBeforeVat = 0;
    const breakdown = [];

    for (let i = 0; i < tariffBlocks.length && remainingUnits > 0; i++) {
      const block = tariffBlocks[i];
      const previousLimit = i === 0 ? 0 : tariffBlocks[i - 1].limit;
      const blockSize = block.limit - previousLimit;

      const unitsInThisBlock = Math.min(remainingUnits, blockSize);
      const blockCost = unitsInThisBlock * block.rate;

      costBeforeVat += blockCost;
      remainingUnits -= unitsInThisBlock;

      breakdown.push({
        units: unitsInThisBlock,
        rate: block.rate,
        cost: blockCost,
        block: i + 1,
      });
    }

    const vat = costBeforeVat * 0.15; // 15% VAT
    const totalCost = costBeforeVat + vat;

    return {
      totalCost,
      costBeforeVat,
      vat,
      breakdown,
    };
  };

  // Recalculate cost when units change
  const handleUnitsChange = (newUnits) => {
    setUnits(newUnits);
    const newCost = calculateCost(newUnits);
    setRecalculatedCost(newCost);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTimestamp(selectedDate);
    }
  };

  // In the handleSave function, replace the navigation part:
  const handleSave = async () => {
    if (!units || isNaN(parseFloat(units)) || parseFloat(units) <= 0) {
      Alert.alert("Error", "Please enter a valid number of units");
      return;
    }

    try {
      setLoading(true);

      // Calculate new cost
      const newCost = calculateCost(units);

      const updatedReading = {
        ...reading,
        units: parseFloat(units),
        timestamp: timestamp.toISOString(),
        cost: newCost,
      };

      // Update in Firebase
      await firebaseService.updateReading(reading.id, updatedReading);

      Alert.alert("Success", "Reading updated successfully", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to the tab navigator which will show the History tab
            navigation.navigate("MainTabs", {
              screen: "History",
              params: { refreshed: true },
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating reading:", error);
      Alert.alert("Error", "Failed to update reading");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTariffBlock = (units) => {
    const unitsNum = parseFloat(units);
    if (unitsNum <= 500) return "Block 1";
    if (unitsNum <= 1000) return "Block 2";
    if (unitsNum <= 2000) return "Block 3";
    return "Block 4";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Reading</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Units Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Units (kWh)</Text>
              <TextInput
                style={styles.input}
                value={units}
                onChangeText={handleUnitsChange}
                placeholder="Enter Current Meter Reading"
                placeholderTextColor="#666"
                keyboardType="numeric"
                autoFocus={true}
              />
            </View>

            {/* Date/Time Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date & Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#4CD964" />
                <Text style={styles.dateText}>{formatDateTime(timestamp)}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Cost Preview */}
            {recalculatedCost && (
              <View style={styles.costPreview}>
                <Text style={styles.costPreviewTitle}>
                  New Cost Calculation
                </Text>

                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Tariff Block:</Text>
                  <Text style={styles.costValue}>{getTariffBlock(units)}</Text>
                </View>

                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Cost before VAT:</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(recalculatedCost.costBeforeVat)}
                  </Text>
                </View>

                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>VAT (15%):</Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(recalculatedCost.vat)}
                  </Text>
                </View>

                <View style={[styles.costRow, styles.totalCostRow]}>
                  <Text style={styles.totalCostLabel}>Total Cost:</Text>
                  <Text style={styles.totalCostValue}>
                    {formatCurrency(recalculatedCost.totalCost)}
                  </Text>
                </View>

                {/* Cost Breakdown */}
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownTitle}>Cost Breakdown</Text>
                  {recalculatedCost.breakdown.map((block, index) => (
                    <View key={index} style={styles.breakdownRow}>
                      <Text style={styles.breakdownText}>
                        Block {block.block}: {block.units} kWh ×{" "}
                        {formatCurrency(block.rate)}
                      </Text>
                      <Text style={styles.breakdownCost}>
                        {formatCurrency(block.cost)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Original Values for Reference */}
            <View style={styles.originalValues}>
              <Text style={styles.originalTitle}>Original Values</Text>
              <View style={styles.originalRow}>
                <Text style={styles.originalLabel}>Units:</Text>
                <Text style={styles.originalValue}>{reading.units} kWh</Text>
              </View>
              <View style={styles.originalRow}>
                <Text style={styles.originalLabel}>Cost:</Text>
                <Text style={styles.originalValue}>
                  {formatCurrency(reading.cost?.totalCost || 0)}
                </Text>
              </View>
              <View style={styles.originalRow}>
                <Text style={styles.originalLabel}>Date:</Text>
                <Text style={styles.originalValue}>
                  {formatDateTime(new Date(reading.timestamp))}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#FFF" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={timestamp}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            themeVariant="dark"
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
  },
  placeholder: {
    width: 32,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#888",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  dateButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    color: "#FFF",
  },
  costPreview: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 20,
  },
  costPreviewTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#4CD964",
    marginBottom: 16,
    textAlign: "center",
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: "#888",
  },
  costValue: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#FFF",
  },
  totalCostRow: {
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
    paddingTop: 12,
    marginTop: 8,
  },
  totalCostLabel: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#4CD964",
  },
  totalCostValue: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#4CD964",
  },
  breakdownSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  breakdownTitle: {
    fontSize: 14,
    fontFamily: "Roboto_600SemiBold",
    color: "#FFF",
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  breakdownText: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: "#888",
    flex: 1,
  },
  breakdownCost: {
    fontSize: 12,
    fontFamily: "Roboto_500Medium",
    color: "#FFF",
  },
  originalValues: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  originalTitle: {
    fontSize: 14,
    fontFamily: "Roboto_600SemiBold",
    color: "#FFF",
    marginBottom: 12,
  },
  originalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  originalLabel: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: "#888",
  },
  originalValue: {
    fontSize: 12,
    fontFamily: "Roboto_500Medium",
    color: "#FFF",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: "auto",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333",
  },
  saveButton: {
    backgroundColor: "#4CD964",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Roboto_600SemiBold",
    color: "#888",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Roboto_600SemiBold",
    color: "#FFF",
  },
});

export default EditReadingScreen;
