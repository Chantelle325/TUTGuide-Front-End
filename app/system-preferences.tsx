// system-preferences.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import API from "./api";

export default function SystemPreferences() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoUpdates, setAutoUpdates] = useState(true);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const darkPref = await AsyncStorage.getItem("darkMode");
        const notifPref = await AsyncStorage.getItem("notifications");
        const updatePref = await AsyncStorage.getItem("autoUpdates");
        const email = await AsyncStorage.getItem("admin_email");

        if (darkPref !== null) setDarkMode(darkPref === "true");
        if (notifPref !== null) setNotifications(notifPref === "true");
        if (updatePref !== null) setAutoUpdates(updatePref === "true");
        if (email) setAdminEmail(email);

        if (email) {
          await setupFCMToken(email, notifPref !== "false");
        }
      } catch (err) {
        console.error("Error loading preferences:", err);
      }
    };

    init();
  }, []);

  const setupFCMToken = async (email: string, allowNotifications: boolean) => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("Notification permission denied");
        return;
      }

      const token = await messaging().getToken();
      setFcmToken(token);
      await AsyncStorage.setItem("fcmToken", token);

      await API.post("/notifications/token", {
        admin_email: email,
        fcmToken: token,
        allowNotifications,
      });

      console.log("Token registered successfully on backend");
    } catch (error: any) {
      console.error("Failed to register FCM token:", error.message);
    }
  };

  const handleNotificationToggle = async (val: boolean) => {
    setNotifications(val);
    await AsyncStorage.setItem("notifications", val.toString());

    if (!adminEmail) {
      Alert.alert("Error", "Admin email not found. Please log in again.");
      return;
    }

    try {
      await API.put("/notifications/toggle", {
        admin_email: adminEmail,
        allowNotifications: val,
      });

      Alert.alert("Success", val ? "Notifications enabled" : "Notifications disabled");
    } catch (error: any) {
      console.error("Failed to update notification toggle:", error.message);
      Alert.alert("Error", "Could not update notification setting.");
    }
  };

  const themeStyles = darkMode ? darkTheme : lightTheme;

  return (
    <ScrollView style={[styles.container, themeStyles.container]} contentContainerStyle={{ paddingTop: 70 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#fff" : "#333"} />
        </TouchableOpacity>
        <Text style={[styles.title, themeStyles.text]}>System Preferences</Text>
      </View>

      {/* Dark Mode */}
      <View style={styles.preferenceRow}>
        <Ionicons name="moon" size={22} color={darkMode ? "#fff" : "#444"} />
        <View style={styles.textContainer}>
          <Text style={[styles.preferenceTitle, themeStyles.text]}>Dark Mode</Text>
          <Text style={[styles.preferenceDesc, themeStyles.subText]}>Enable dark theme UI</Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={(val) => {
            setDarkMode(val);
            AsyncStorage.setItem("darkMode", val.toString());
          }}
          thumbColor={darkMode ? "#4CAF50" : "#f4f3f4"}
        />
      </View>

      {/* Notifications */}
      <View style={styles.preferenceRow}>
        <Ionicons name="notifications" size={22} color={darkMode ? "#fff" : "#444"} />
        <View style={styles.textContainer}>
          <Text style={[styles.preferenceTitle, themeStyles.text]}>Notifications</Text>
          <Text style={[styles.preferenceDesc, themeStyles.subText]}>Allow system notifications</Text>
        </View>
        <Switch value={notifications} onValueChange={handleNotificationToggle} thumbColor={notifications ? "#4CAF50" : "#f4f3f4"} />
      </View>

      {/* Auto Updates */}
      <View style={styles.preferenceRow}>
        <Ionicons name="sync" size={22} color={darkMode ? "#fff" : "#444"} />
        <View style={styles.textContainer}>
          <Text style={[styles.preferenceTitle, themeStyles.text]}>Auto Updates</Text>
          <Text style={[styles.preferenceDesc, themeStyles.subText]}>Update system automatically</Text>
        </View>
        <Switch
          value={autoUpdates}
          onValueChange={(val) => {
            setAutoUpdates(val);
            AsyncStorage.setItem("autoUpdates", val.toString());
          }}
          thumbColor={autoUpdates ? "#4CAF50" : "#f4f3f4"}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: { marginRight: 10 },
  title: { fontSize: 22, fontWeight: "bold" },
  preferenceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#555" },
  textContainer: { flex: 1, marginLeft: 12 },
  preferenceTitle: { fontSize: 16, fontWeight: "600" },
  preferenceDesc: { fontSize: 12 },
});

const lightTheme = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  text: { color: "#000" },
  subText: { color: "#666" },
});

const darkTheme = StyleSheet.create({
  container: { backgroundColor: "#121212" },
  text: { color: "#fff" },
  subText: { color: "#bbb" },
});
