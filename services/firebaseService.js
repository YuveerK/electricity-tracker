import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import db from "../config/firebase.config";

const USAGE_COLLECTION = "electricity_usage";

export const firebaseService = {
  // Save daily usage to Firebase
  async saveDailyUsage(usageData) {
    try {
      console.log("Saving to Firebase...");

      const docRef = await addDoc(collection(db, USAGE_COLLECTION), {
        ...usageData,
        timestamp: Timestamp.now(),
      });

      console.log("Document written with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      throw error;
    }
  },

  // Get usage by date range
  async getUsageByDateRange(startDate, endDate) {
    try {
      const q = query(
        collection(db, USAGE_COLLECTION),
        where("timestamp", ">=", Timestamp.fromDate(startDate)),
        where("timestamp", "<=", Timestamp.fromDate(endDate)),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const usageData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usageData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        });
      });

      return usageData;
    } catch (error) {
      console.error("Error fetching usage by date range:", error);
      return [];
    }
  },

  // Update reading
  async updateReading(readingId, updatedData) {
    try {
      const docRef = doc(db, USAGE_COLLECTION, readingId);
      await updateDoc(docRef, updatedData);
      console.log("Reading updated successfully:", readingId);
      return true;
    } catch (error) {
      console.error("Error updating reading:", error);
      throw error;
    }
  },

  // Delete reading
  async deleteReading(readingId) {
    try {
      const docRef = doc(db, USAGE_COLLECTION, readingId);
      await deleteDoc(docRef);
      console.log("Reading deleted successfully:", readingId);
      return true;
    } catch (error) {
      console.error("Error deleting reading:", error);
      throw error;
    }
  },

  // Get ALL usage data (for testing - remove date filtering)
  async getAllUsage() {
    try {
      console.log("Fetching ALL usage data...");
      const q = query(
        collection(db, USAGE_COLLECTION),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const usageData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usageData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        });
      });

      console.log(`Found ${usageData.length} records total`);
      return usageData;
    } catch (error) {
      console.error("Error fetching all usage:", error);
      return [];
    }
  },

  // Get usage for last N days (with better date handling)
  async getUsageForPeriod(days = 30) {
    try {
      console.log("Fetching usage for period...");

      // Set correct start & end times for filtering
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      console.log("Filtering from:", startDate, "to:", endDate);

      const q = query(
        collection(db, USAGE_COLLECTION),
        where("timestamp", ">=", Timestamp.fromDate(startDate)),
        where("timestamp", "<=", Timestamp.fromDate(endDate)),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);

      const usageData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usageData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        });
      });

      console.log(`Found ${usageData.length} filtered records`);
      return usageData;
    } catch (error) {
      console.error("Error fetching filtered usage:", error);
      return [];
    }
  },

  // Alternative: Get usage with flexible date range
  async getUsageFlexible(days = 3650) {
    // 10 years to catch 2025 data
    try {
      console.log("Fetching usage with flexible date range...");
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 10); // Go back 10 years

      const q = query(
        collection(db, USAGE_COLLECTION),
        where("timestamp", ">=", Timestamp.fromDate(startDate)),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const usageData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usageData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        });
      });

      console.log(`Found ${usageData.length} records`);
      return usageData;
    } catch (error) {
      console.error("Error fetching usage:", error);
      return [];
    }
  },

  // Get monthly total
  async getMonthlyTotal() {
    try {
      console.log("Fetching monthly total...");
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
      const q = query(
        collection(db, USAGE_COLLECTION),
        where("timestamp", ">=", Timestamp.fromDate(startOfMonth)),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      let totalUnits = 0;
      let totalCost = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalUnits += data.units || 0;
        totalCost += data.cost?.totalCost || 0;
      });

      console.log(`Monthly total: ${totalUnits} units, R${totalCost}`);
      return { totalUnits, totalCost: parseFloat(totalCost.toFixed(2)) };
    } catch (error) {
      console.error("Error fetching monthly total:", error);
      return { totalUnits: 0, totalCost: 0 };
    }
  },

  // Get today's usage
  async getTodayUsage() {
    try {
      console.log("Fetching today's usage...");
      const today = new Date().toDateString();
      const q = query(
        collection(db, USAGE_COLLECTION),
        where("date", "==", today),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        console.log("Found today's usage:", data.units, "kWh");
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        };
      }
      console.log("No usage found for today");
      return null;
    } catch (error) {
      console.error("Error fetching today usage:", error);
      return null;
    }
  },

  // Get yesterday's usage
  async getYesterdayUsage() {
    try {
      console.log("Fetching yesterday's usage...");
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toDateString();

      const q = query(
        collection(db, USAGE_COLLECTION),
        where("date", "==", yesterdayDate),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        console.log("Found yesterday's usage:", data.units, "kWh");
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        };
      }
      console.log("No usage found for yesterday");
      return null;
    } catch (error) {
      console.error("Error fetching yesterday usage:", error);
      return null;
    }
  },

  async getLastMeterReading() {
    try {
      const q = query(
        collection(db, USAGE_COLLECTION),
        orderBy("timestamp", "desc"),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        return docData.reading || null;
      }

      return null;
    } catch (error) {
      console.error("Error getting last meter reading:", error);
      return null;
    }
  },
};
