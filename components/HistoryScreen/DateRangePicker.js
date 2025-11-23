import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const DateRangePicker = ({
  activeRange,
  onRangeChange,
  customRange,
  onCustomRangeChange,
}) => {
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(customRange.startDate);
  const [tempEndDate, setTempEndDate] = useState(customRange.endDate);

  const ranges = [
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Quarter", value: "quarter" },
    { label: "Year", value: "year" },
  ];

  const handleRangePress = (range) => {
    setShowCustomInputs(false);
    setShowStartPicker(false);
    setShowEndPicker(false);
    onRangeChange(range);
  };

  const handleCustomToggle = () => {
    const newShowState = !showCustomInputs;
    setShowCustomInputs(newShowState);
    setShowStartPicker(false);
    setShowEndPicker(false);

    if (newShowState) {
      onRangeChange("custom");
    } else {
      onRangeChange("month");
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);

    if (selectedDate) {
      setTempStartDate(selectedDate);
      handleDateSelection(selectedDate, tempEndDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);

    if (selectedDate) {
      setTempEndDate(selectedDate);
      handleDateSelection(tempStartDate, selectedDate);
    }
  };

  const handleDateSelection = (startDate, endDate) => {
    if (startDate > endDate) {
      alert("Start date cannot be after end date");
      return;
    }

    onCustomRangeChange(startDate, endDate);
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Main Range Selector */}
      <View style={styles.rangeContainer}>
        {ranges.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[
              styles.rangeButton,
              activeRange === range.value && styles.rangeButtonActive,
            ]}
            onPress={() => handleRangePress(range.value)}
          >
            <Text
              style={[
                styles.rangeText,
                activeRange === range.value && styles.rangeTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Custom Toggle Button */}
        <TouchableOpacity
          style={[
            styles.rangeButton,
            (activeRange === "custom" || showCustomInputs) &&
              styles.rangeButtonActive,
          ]}
          onPress={handleCustomToggle}
        >
          <Text
            style={[
              styles.rangeText,
              (activeRange === "custom" || showCustomInputs) &&
                styles.rangeTextActive,
            ]}
          >
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Date Inputs */}
      {showCustomInputs && (
        <View style={styles.customInputsContainer}>
          <Text style={styles.sectionTitle}>Select Date Range</Text>

          <View style={styles.inputsRow}>
            {/* Start Date Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#4CD964" />
                <Text style={styles.datePickerText}>
                  {formatDateDisplay(tempStartDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* End Date Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>End Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#4CD964" />
                <Text style={styles.datePickerText}>
                  {formatDateDisplay(tempEndDate)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCustomInputs(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setShowCustomInputs(false)}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
              <Text style={styles.searchButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date Pickers - Simple inline display */}
      {showStartPicker && (
        <DateTimePicker
          value={tempStartDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleStartDateChange}
          themeVariant="dark"
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={tempEndDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEndDateChange}
          themeVariant="dark"
        />
      )}

      {/* Current Range Display */}
      {activeRange === "custom" && !showCustomInputs && (
        <View style={styles.currentRangeDisplay}>
          <Text style={styles.currentRangeText}>
            {formatDateDisplay(customRange.startDate)} -{" "}
            {formatDateDisplay(customRange.endDate)}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowCustomInputs(true)}
          >
            <Ionicons name="create-outline" size={14} color="#4CD964" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  rangeContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 12,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  rangeButtonActive: {
    backgroundColor: "#2A2A2A",
  },
  rangeText: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#888",
  },
  rangeTextActive: {
    color: "#4CD964",
  },
  customInputsContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginBottom: 16,
    textAlign: "center",
  },
  inputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: "Roboto_500Medium",
    color: "#888",
    marginBottom: 8,
  },
  datePickerButton: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  datePickerText: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#FFF",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#333",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#888",
  },
  searchButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "#4CD964",
  },
  searchButtonText: {
    fontSize: 14,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginLeft: 8,
  },
  currentRangeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2A2A",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  currentRangeText: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: "#4CD964",
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
});

export default DateRangePicker;
