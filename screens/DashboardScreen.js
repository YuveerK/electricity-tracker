import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  Roboto_400Regular,
  Roboto_300Light,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from "@expo-google-fonts/roboto";

// Components
import Header from "../components/DashboardScreen/Header";
import UsageInput from "../components/DashboardScreen/UsageInput";
import EnergyCard from "../components/DashboardScreen/EnergyCard";
import TimeFrameSelector from "../components/DashboardScreen/TimeFrameSelector";
import UsageChart from "../components/DashboardScreen/UsageChart";
import CostBreakdown from "../components/DashboardScreen/CostBreakdown";
import TariffInfo from "../components/DashboardScreen/TariffInfo";
import SavingsTip from "../components/DashboardScreen/SavingsTip";

// Services & Helpers
import { firebaseService } from "../services/firebaseService";
import { calculateElectricityCost } from "../helper/electricity-calculation.helper";

const DashboardScreen = () => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_300Light,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
  });

  const [activeTimeFrame, setActiveTimeFrame] = useState("week");
  const [unitsInput, setUnitsInput] = useState("");
  const [todayUsage, setTodayUsage] = useState(null);
  const [weeklyUsage, setWeeklyUsage] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState({
    totalUnits: 0,
    totalCost: 0,
  });
  const [yesterdayUsage, setYesterdayUsage] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [todayData, weeklyData, monthlyData, yesterdayData] =
        await Promise.all([
          firebaseService.getTodayUsage(),
          firebaseService.getUsageForPeriod(7),
          firebaseService.getMonthlyTotal(),
          getYesterdayUsage(),
        ]);

      setTodayUsage(todayData);
      setWeeklyUsage(weeklyData);
      setMonthlyTotal(monthlyData);
      setYesterdayUsage(yesterdayData);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load usage data");
    }
  };

  const getYesterdayUsage = async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toDateString();

      const usageData = await firebaseService.getUsageForPeriod(2);
      return usageData.find((usage) => usage.date === yesterdayDate) || null;
    } catch (error) {
      console.error("Error getting yesterday usage:", error);
      return null;
    }
  };

  const handleAddReading = async () => {
    if (!unitsInput || isNaN(unitsInput)) {
      Alert.alert("Error", "Please enter a valid meter reading");
      return;
    }

    const currentReading = parseFloat(unitsInput);

    if (currentReading <= 0) {
      Alert.alert("Error", "Please enter a valid number");
      return;
    }

    try {
      // 1. Get previous reading
      const lastReading = await firebaseService.getLastMeterReading();

      if (lastReading === null) {
        Alert.alert(
          "First Reading",
          "This is your first meter reading. No units will be calculated."
        );

        await firebaseService.saveDailyUsage({
          reading: currentReading,
          unitsUsed: 0,
          cost: { totalCost: 0 },
          date: new Date().toDateString(),
        });

        setUnitsInput("");
        await loadData();
        return;
      }

      // 2. Calculate difference
      const unitsUsed = currentReading - lastReading;

      if (unitsUsed < 0) {
        Alert.alert("Error", "Meter reading cannot be lower than last reading");
        return;
      }

      // 3. Calculate cost
      const cost = calculateElectricityCost(unitsUsed);

      // 4. Save to Firebase
      await firebaseService.saveDailyUsage({
        reading: currentReading,
        unitsUsed,
        cost,
        date: new Date().toDateString(),
      });

      setUnitsInput("");
      await loadData();

      Alert.alert(
        "Success",
        `${unitsUsed.toFixed(
          2
        )} units used (${currentReading} - ${lastReading})`
      );
    } catch (error) {
      console.error("Error saving usage:", error);
      Alert.alert("Error", "Failed to save usage data");
    }
  };

  const getPreviewCost = () => {
    if (!unitsInput || isNaN(unitsInput)) return null;
    return calculateElectricityCost(parseFloat(unitsInput));
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header
          title="Energy Monitor"
          subtitle={`Today • ${new Date().toLocaleDateString()}`}
          onProfilePress={() => console.log("Profile pressed")}
        />
        <UsageInput
          unitsInput={unitsInput}
          setUnitsInput={setUnitsInput}
          onAddUnits={handleAddReading}
          previewCost={getPreviewCost()}
        />

        <EnergyCard
          todayUsage={todayUsage}
          monthlyTotal={monthlyTotal}
          yesterdayUsage={yesterdayUsage}
          weeklyUsage={weeklyUsage}
        />
        <TimeFrameSelector
          activeTimeFrame={activeTimeFrame}
          setActiveTimeFrame={setActiveTimeFrame}
        />
        <CostBreakdown currentCost={todayUsage?.cost} />
        <TariffInfo />
        <SavingsTip />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0A0A0A",
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});

export default DashboardScreen;
