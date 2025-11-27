import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "../../theme/app-theme";

const LoadingIndicator = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.PRIMARY_GREEN} />
      <Text style={styles.text}>Loading your history...</Text>
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
  text: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
  },
});

export default LoadingIndicator;
