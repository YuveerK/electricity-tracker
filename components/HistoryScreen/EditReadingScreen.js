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
import { theme } from "../../theme/app-theme";
import { Timestamp } from "firebase/firestore";

const EditReadingScreen = ({ route, navigation }) => {
  const { reading } = route.params;

  // ---- SAFETY: Prevent crash if reading or reading.reading is undefined ----
  const initialUnits =
    reading?.reading != null ? reading.reading.toString() : "";
  const initialTimestamp = reading?.timestamp
    ? new Date(reading.timestamp)
    : new Date();

  const [units, setUnits] = useState(initialUnits);
  const [timestamp, setTimestamp] = useState(initialTimestamp);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recalculatedCost, setRecalculatedCost] = useState(null);

  // --- Note: reading.reading is the actual reading value (kWh) ---
  React.useEffect(() => {
    const initialCost = calculateCost(initialUnits);
    setRecalculatedCost(initialCost);
  }, []);

  // ---------------------------------------------------------
  // COST CALCULATION LOGIC
  // ---------------------------------------------------------
  const calculateCost = (units) => {
    const unitsNum = parseFloat(units);
    if (isNaN(unitsNum) || unitsNum <= 0) return null;

    const tariffBlocks = [
      { limit: 500, rate: 1.5 }, // Block 1
      { limit: 1000, rate: 2.0 }, // Block 2
      { limit: 2000, rate: 2.5 }, // Block 3
      { limit: Infinity, rate: 3.0 }, // Block 4
    ];

    let remainingUnits = unitsNum;
    let costBeforeVat = 0;
    const breakdown = [];

    for (let i = 0; i < tariffBlocks.length && remainingUnits > 0; i++) {
      const block = tariffBlocks[i];
      const prevLimit = i === 0 ? 0 : tariffBlocks[i - 1].limit;
      const blockSize = block.limit - prevLimit;

      const unitsInBlock = Math.min(remainingUnits, blockSize);
      const blockCost = unitsInBlock * block.rate;

      costBeforeVat += blockCost;
      remainingUnits -= unitsInBlock;

      breakdown.push({
        units: unitsInBlock,
        rate: block.rate,
        cost: blockCost,
        block: i + 1,
      });
    }

    const vat = costBeforeVat * 0.15;
    const totalCost = costBeforeVat + vat;

    return {
      totalCost,
      costBeforeVat,
      vat,
      breakdown,
    };
  };

  const handleUnitsChange = (newUnits) => {
    setUnits(newUnits);
    setRecalculatedCost(calculateCost(newUnits));
  };

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTimestamp(selectedDate);
    }
  };

  // ---------------------------------------------------------
  // SAVE UPDATED READING
  // ---------------------------------------------------------
  const handleSave = async () => {
    if (!units || isNaN(parseFloat(units)) || parseFloat(units) <= 0) {
      Alert.alert("Error", "Please enter a valid reading.");
      return;
    }

    try {
      setLoading(true);

      const newCost = calculateCost(units);

      const updatedReading = {
        ...reading,
        reading: parseFloat(units), // <-- FIX: correct field
        timestamp: Timestamp.fromDate(timestamp),
        cost: newCost,
      };

      await firebaseService.updateReading(reading.id, updatedReading);

      Alert.alert("Success", "Reading updated successfully", [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("MainTabs", {
              screen: "History",
              params: { refreshed: true },
            }),
        },
      ]);
    } catch (err) {
      console.log("Error updating:", err);
      Alert.alert("Error", "Failed to update reading.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) =>
    date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getTariffBlock = (units) => {
    const n = parseFloat(units);
    if (n <= 500) return "Block 1";
    if (n <= 1000) return "Block 2";
    if (n <= 2000) return "Block 3";
    return "Block 4";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* HEADER */}
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

          {/* FORM */}
          <View style={styles.form}>
            {/* UNITS */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Meter Reading (kWh)</Text>
              <TextInput
                style={styles.input}
                value={units}
                onChangeText={handleUnitsChange}
                placeholder="Enter new meter value"
                placeholderTextColor="#666"
                keyboardType="numeric"
                autoFocus={true}
              />
            </View>

            {/* DATE PICKER */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date & Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.PRIMARY_GREEN}
                />
                <Text style={styles.dateText}>{formatDateTime(timestamp)}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {/* COST PREVIEW */}
            {recalculatedCost && (
              <View style={styles.costPreview}>
                <Text style={styles.costPreviewTitle}>
                  Updated Cost Calculation
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

                {/* COST BREAKDOWN */}
                <View style={styles.breakdownSection}>
                  <Text style={styles.breakdownTitle}>Cost Breakdown</Text>

                  {recalculatedCost.breakdown.map((b, i) => (
                    <View key={i} style={styles.breakdownRow}>
                      <Text style={styles.breakdownText}>
                        Block {b.block}: {b.units} kWh ×{" "}
                        {formatCurrency(b.rate)}
                      </Text>
                      <Text style={styles.breakdownCost}>
                        {formatCurrency(b.cost)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ORIGINAL VALUES */}
            <View style={styles.originalValues}>
              <Text style={styles.originalTitle}>Original Values</Text>

              <View style={styles.originalRow}>
                <Text style={styles.originalLabel}>Reading:</Text>
                <Text style={styles.originalValue}>{reading.reading} kWh</Text>
              </View>

              <View style={styles.originalRow}>
                <Text style={styles.originalLabel}>Cost:</Text>
                <Text style={styles.originalValue}>
                  {formatCurrency(reading.cost?.totalCost ?? 0)}
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

          {/* ACTION BUTTONS */}
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

// ---------------------------------------------------------
// STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.BACKGROUND_COLOR,
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
    borderBottomColor: theme.BORDER_COLOR,
  },
  backButton: { padding: 4 },
  title: {
    fontSize: 18,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
  },
  placeholder: { width: 32 },
  form: { padding: 20 },
  inputContainer: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: theme.PRIMARY_GREY,
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
    borderColor: theme.BORDER_COLOR,
  },
  dateButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
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
    borderColor: theme.BORDER_COLOR,
    marginBottom: 20,
  },
  costPreviewTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: theme.PRIMARY_GREEN,
    marginBottom: 16,
    textAlign: "center",
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
  },
  costValue: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#FFF",
  },
  totalCostRow: {
    borderTopWidth: 1,
    borderTopColor: theme.BORDER_COLOR,
    paddingTop: 12,
    marginTop: 8,
  },
  totalCostLabel: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: theme.PRIMARY_GREEN,
  },
  totalCostValue: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: theme.PRIMARY_GREEN,
  },
  breakdownSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.BORDER_COLOR,
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
    marginBottom: 6,
  },
  breakdownText: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
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
    borderColor: theme.BORDER_COLOR,
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
    marginBottom: 8,
  },
  originalLabel: {
    fontSize: 12,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
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
    backgroundColor: theme.BORDER_COLOR,
    borderWidth: 1,
    borderColor: "#333",
  },
  saveButton: { backgroundColor: theme.PRIMARY_GREEN },
  disabledButton: { opacity: 0.6 },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Roboto_600SemiBold",
    color: theme.PRIMARY_GREY,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Roboto_600SemiBold",
    color: "#FFF",
  },
});

export default EditReadingScreen;
