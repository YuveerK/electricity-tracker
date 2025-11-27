// Updated TabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "../screens/DashboardScreen";
import HistoryScreen from "../screens/HistoryScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen"; // Add this import
import SettingsScreen from "../screens/SettingsScreen";
import { theme } from "../theme/app-theme";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          backgroundColor: "#161616",
          borderTopWidth: 0,
          paddingTop: 6,
        },

        tabBarActiveTintColor: theme.PRIMARY_GREEN,
        tabBarInactiveTintColor: "#c9c9ca",

        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Dashboard: focused ? "home" : "home-outline",
            History: focused ? "time" : "time-outline",
            Analytics: focused ? "stats-chart" : "stats-chart-outline", // Add this
            Settings: focused ? "settings" : "settings-outline",
          };

          return (
            <Ionicons
              name={icons[route.name]}
              size={focused ? 28 : 24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}
