import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber, formatCurrency } from "../../utils/numberFormatter";
import { theme } from "../../theme/app-theme";

const HistoryCard = ({ data, isFirst, isLast, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const ts = new Date(data.timestamp);
  const endReading = Number(data.reading) || 0;
  const unitsUsed = Number(data.unitsUsed) || 0;
  const startReading = endReading - unitsUsed;

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
              color={theme.PRIMARY_GREEN}
              bold
            />
            <View style={styles.calcContainer}>
              <Text style={styles.calcTitle}>How Units Were Calculated</Text>

              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Start Reading:</Text>
                <Text style={styles.calcValue}>
                  {startReading?.toFixed?.(2) || "0.00"} units
                </Text>
              </View>

              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>End Reading:</Text>
                <Text style={styles.calcValue}>
                  {endReading?.toFixed?.(2) || "0.00"} units
                </Text>
              </View>

              <View style={styles.calcFormulaWrapper}>
                <Text style={styles.calcFormula}>
                  {endReading?.toFixed?.(2) || "0.00"} −{" "}
                  {startReading?.toFixed?.(2) || "0.00"} ={" "}
                  {unitsUsed?.toFixed?.(2) || "0.00"} kWh
                </Text>
              </View>
            </View>

            <Row
              label="Total Cost"
              value={`R${data.cost?.totalCost?.toFixed?.(2) || "0.00"}`}
              bold
            />

            <Row
              label="Cost Before VAT"
              value={`R${data.cost?.costBeforeVat?.toFixed?.(2) || "0.00"}`}
            />

            <Row
              label="VAT (15%)"
              value={`R${data.cost?.vat?.toFixed?.(2) || "0.00"}`}
            />
          </View>

          {/* Detailed Breakdown */}
          {showDetails && (
            <View style={styles.breakdownDetails}>
              {data.cost?.breakdown?.map((block, index) => (
                <View key={index} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    {block.block || "Block"} @{" "}
                    {block.rate?.toFixed?.(4) || "0.0000"}
                  </Text>

                  <Text style={styles.breakdownValue}>
                    {block.units ?? 0} kWh → {formatCurrency(block.cost || 0)}
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
  calcContainer: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: "#111",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
  },

  calcTitle: {
    color: theme.PRIMARY_GREEN,
    fontFamily: "Roboto_700Bold",
    fontSize: 14,
    marginBottom: 8,
  },

  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  calcLabel: {
    color: theme.PRIMARY_GREY,
    fontSize: 13,
  },

  calcValue: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Roboto_500Medium",
  },

  calcFormulaWrapper: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#1A1A1A",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#333",
  },

  calcFormula: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Roboto_700Bold",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#1A1A1A",
    marginHorizontal: 4,
    marginVertical: 20,
    borderColor: theme.BORDER_COLOR,
    borderBottomWidth: 1,
    borderRadius: 16,
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
  time: {
    fontSize: 12,
    color: theme.PRIMARY_GREY,
    fontFamily: "Roboto_400Regular",
  },
  tariffChip: {
    backgroundColor: theme.BORDER_COLOR,
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
  dataLabel: { color: theme.PRIMARY_GREY, fontSize: 14 },
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
