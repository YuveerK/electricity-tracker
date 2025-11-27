import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme/app-theme";

const EmptyState = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="calendar-outline" size={64} color="#444" />
      </View>

      <Text style={styles.title}>No History Found</Text>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Ionicons name="refresh" size={16} color={theme.PRIMARY_GREEN} />
        <Text style={styles.retryText}>Refresh Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
  },
  title: {
    fontSize: 20,
    fontFamily: "Roboto_700Bold",
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.BORDER_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  retryText: {
    fontSize: 14,
    fontFamily: "Roboto_500Medium",
    color: theme.PRIMARY_GREEN,
    marginLeft: 8,
  },
});

export default EmptyState;
