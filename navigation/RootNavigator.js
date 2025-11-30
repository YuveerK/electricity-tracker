// RootNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import EditReadingScreen from "../components/HistoryScreen/EditReadingScreen";
import SummaryScreen from "../screens/SummaryScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      <Stack.Screen
        name="EditReading"
        component={EditReadingScreen}
        options={{
          presentation: "card", // instead of fullScreenModal
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen
        name="Summary"
        component={SummaryScreen}
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
}
