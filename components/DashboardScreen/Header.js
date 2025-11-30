import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../theme/app-theme";

const Header = ({ title, subtitle, onProfilePress, showProfile = true }) => {
  return (
    <View style={styles.wrapper}>
      {/* Accent Bar */}
      <View style={styles.accentBar} />

      {/* Main Row */}
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {showProfile && (
          <TouchableOpacity style={styles.avatar} onPress={onProfilePress}>
            <Ionicons name="person-circle-outline" size={32} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 25,
    marginTop: 10,
    paddingBottom: 10,
  },

  accentBar: {
    height: 4,
    width: 60,
    borderRadius: 6,
    backgroundColor: theme.PRIMARY_GREEN,
    marginBottom: 14,
    shadowColor: theme.PRIMARY_GREEN,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textContainer: {
    flexShrink: 1,
  },

  title: {
    fontSize: 26,
    fontFamily: "Roboto_900Black",
    color: "#FFFFFF",
    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: "Roboto_400Regular",
    color: theme.PRIMARY_GREY,
    marginTop: 2,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.BORDER_COLOR,
  },
});

export default Header;
