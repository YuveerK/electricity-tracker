// components/Analytics/AnalyticsTooltipModal.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "../../theme/app-theme";
import { formatCurrency } from "../../utils/numberFormatter";

const AnalyticsTooltipModal = ({ visible, data, onClose }) => {
  if (!visible || !data) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Usage Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.PRIMARY_GREY} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <Text style={styles.label}>
              {new Date(data.timestamp).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usage Info</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Units Used</Text>
              <Text style={styles.value}>{data.unitsUsed.toFixed(1)} kWh</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Cost</Text>
              <Text style={styles.value}>
                {formatCurrency(data.cost.totalCost)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cost Breakdown</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Cost Before VAT</Text>
              <Text style={styles.value}>
                {formatCurrency(data.cost.costBeforeVat)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>VAT (15%)</Text>
              <Text style={styles.value}>{formatCurrency(data.cost.vat)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Cost</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.cost.totalCost)}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// styles
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
    overflow: "hidden",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.BORDER_COLOR,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    color: "#FFF",
    fontFamily: "Roboto_700Bold",
  },
  content: {
    maxHeight: 400,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.BORDER_COLOR,
  },
  sectionTitle: {
    fontSize: 16,
    color: theme.PRIMARY_GREEN,
    fontFamily: "Roboto_700Bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    color: theme.PRIMARY_GREY,
    fontSize: 14,
  },
  value: {
    color: "#FFF",
    fontSize: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.BORDER_COLOR,
  },
  totalLabel: {
    fontSize: 16,
    color: theme.PRIMARY_GREEN,
  },
  totalValue: {
    fontSize: 18,
    color: theme.PRIMARY_GREEN,
    fontFamily: "Roboto_900Black",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.BORDER_COLOR,
  },
  button: {
    backgroundColor: theme.PRIMARY_GREEN,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Roboto_700Bold",
  },
});

export default AnalyticsTooltipModal;
