import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
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
import CostBreakdown from "../components/DashboardScreen/CostBreakdown";
import TariffInfo from "../components/DashboardScreen/TariffInfo";
import SavingsTip from "../components/DashboardScreen/SavingsTip";

// Services & Helpers
import { firebaseService } from "../services/firebaseService";
import { calculateElectricityCost } from "../helper/electricity-calculation.helper";
import { theme } from "../theme/app-theme";

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

  const [lastReading, setLastReading] = useState(null);

  // 🔥 New pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [todayData, weeklyData, monthlyData, lastMeterReading] =
        await Promise.all([
          firebaseService.getTodayUsage(),
          firebaseService.getUsageForPeriod(7),
          firebaseService.getMonthlyTotal(),
          firebaseService.getLastMeterReading(),
        ]);

      setTodayUsage(todayData);
      setWeeklyUsage(weeklyData);
      setMonthlyTotal(monthlyData);
      setLastReading(lastMeterReading);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load usage data");
    }
  };

  // 🔥 Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
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

      const unitsUsed = currentReading - lastReading;

      if (unitsUsed < 0) {
        Alert.alert("Error", "Meter reading cannot be lower than last reading");
        return;
      }

      const cost = calculateElectricityCost(unitsUsed);

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

  const handleDumpAllReadings = async () => {
    try {
      const data = await firebaseService.getAllUsageReadings();
      Alert.alert("Success", `Fetched ${data.length} readings. Check console.`);
    } catch (e) {
      Alert.alert("Error", "Failed to fetch all readings");
    }
  };

  const handleMigrateData = async () => {
    try {
      Alert.alert(
        "Migrate Data",
        "This will update all existing cost calculations. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Migrate",
            onPress: async () => {
              const result = await firebaseService.migrateAllCosts();
              Alert.alert(
                "Migration Complete",
                `Updated: ${result.updatedCount} records\nErrors: ${result.errorCount}`
              );
              await loadData(); // Refresh your data
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Migration Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container]} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#4EFFA1"]} // Android color
          />
        }
      >
        <TouchableOpacity
          style={{
            marginBottom: 20,
            padding: 14,
            backgroundColor: "#FF6B35",
            borderRadius: 10,
            alignItems: "center",
          }}
          onPress={handleMigrateData}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            🔄 Migrate All Cost Data
          </Text>
        </TouchableOpacity>
        {/* DEBUG BUTTON */}
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 14,
            backgroundColor: "#333",
            borderRadius: 10,
            alignItems: "center",
          }}
          onPress={handleDumpAllReadings}
        >
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            Dump All Firestore Readings (Debug)
          </Text>
        </TouchableOpacity>

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
          lastReading={lastReading}
        />

        <EnergyCard
          todayUsage={todayUsage}
          monthlyTotal={monthlyTotal}
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
    backgroundColor: theme.BACKGROUND_COLOR,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});

export default DashboardScreen;
