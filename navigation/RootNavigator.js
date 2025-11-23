// RootNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import EditReadingScreen from "../components/HistoryScreen/EditReadingScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      <Stack.Screen
        name="EditReading"
        component={EditReadingScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
    </Stack.Navigator>
  );
}
