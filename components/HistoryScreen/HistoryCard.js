import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber, formatCurrency } from "../../utils/numberFormatter";

const HistoryCard = ({ data, isFirst, isLast, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  const ts = new Date(data.timestamp);

  const getTariffBlock = (units) => {
    if (units <= 500) return "0 – 500 kWh (Block 1)";
    if (units <= 1000) return "501 – 1000 kWh (Block 2)";
    if (units <= 2000) return "1001 – 2000 kWh (Block 3)";
    if (units <= 3000) return "2001 – 3000 kWh (Block 4)";
    return "3001+ kWh (Block 5)";
  };

  const toggle = () => setShowDetails(!showDetails);

  return (
    <View
      style={[
        styles.card,
        isFirst && styles.firstCard,
        isLast && styles.lastCard,
      ]}
    >
      <TouchableOpacity onPress={toggle}>
        <View style={styles.cardContent}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.date}>
                {ts.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.time}>
                {ts.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            <View style={styles.tariffChip}>
              <Text style={styles.tariffText}>
                {getTariffBlock(data.unitsUsed)}
              </Text>
            </View>

            <Ionicons
              name={showDetails ? "chevron-up" : "chevron-forward"}
              size={20}
              color="#666"
            />
          </View>

          {/* Primary Info */}
          <View style={styles.dataColumn}>
            <Row label="Meter Reading" value={`${data.reading} units`} />

            <Row
              label="Units Used"
              value={`${formatNumber(data.unitsUsed, 2)} kWh`}
              color="#4CD964"
              bold
            />

            <Row
              label="Total Cost"
              value={formatCurrency(data.cost?.totalCost || 0)}
              bold
            />

            <Row
              label="Cost Before VAT"
              value={formatCurrency(data.cost?.costBeforeVat || 0)}
            />

            <Row
              label="VAT (15%)"
              value={formatCurrency(data.cost?.vat || 0)}
            />
          </View>

          {/* Detailed Breakdown */}
          {showDetails && (
            <View style={styles.breakdownDetails}>
              {data.cost?.breakdown?.map((block, index) => (
                <View key={index} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    {block.block} @ {block.rate.toFixed(4)}
                  </Text>
                  <Text style={styles.breakdownValue}>
                    {block.units} kWh → {formatCurrency(block.cost)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      {showDetails && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(data)}
          >
            <Ionicons name="pencil-outline" size={16} color="#FFF" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              Alert.alert("Delete", "Delete this reading?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => onDelete(data.id),
                },
              ]);
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#FFF" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/* Reusable Row Component */
const Row = ({ label, value, bold, color }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text
      style={[
        styles.dataValue,
        bold && styles.boldText,
        color && { color: color },
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1A1A1A",
    marginHorizontal: 4,
    borderColor: "#2A2A2A",
    borderBottomWidth: 1,
  },
  firstCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
  },
  lastCard: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 20,
  },
  cardContent: { padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  date: { fontSize: 16, color: "#FFF", fontFamily: "Roboto_700Bold" },
  time: { fontSize: 12, color: "#888", fontFamily: "Roboto_400Regular" },
  tariffChip: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tariffText: { fontSize: 12, color: "#AAA" },
  dataColumn: { marginTop: 4 },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dataLabel: { color: "#888", fontSize: 14 },
  dataValue: { color: "#FFF", fontSize: 14 },
  boldText: { fontFamily: "Roboto_900Black", fontSize: 16 },
  breakdownBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 10,
    backgroundColor: "#333",
  },
  breakdownSegment: { height: "100%" },
  breakdownDetails: { marginTop: 14 },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  breakdownLabel: { color: "#AAA", fontSize: 12 },
  breakdownValue: { color: "#FFF", fontSize: 12 },
  actionsRow: {
    flexDirection: "row",
    padding: 14,
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  editButton: { backgroundColor: "#5AC8FA" },
  deleteButton: { backgroundColor: "#FF3B30" },
  actionText: { color: "#FFF", fontSize: 14 },
});

export default HistoryCard;
