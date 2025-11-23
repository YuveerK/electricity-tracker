import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// In components/Header.js - add showProfile prop
const Header = ({ title, subtitle, onProfilePress, showProfile = true }) => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{title}</Text>
        <Text style={styles.date}>{subtitle}</Text>
      </View>
      {showProfile && (
        <TouchableOpacity style={styles.avatar} onPress={onProfilePress}>
          <Ionicons name="person" size={20} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Roboto_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
    color: "#888",
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
});

export default Header;
