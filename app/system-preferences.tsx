import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function SystemPreferences() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoUpdates, setAutoUpdates] = useState(true);

  // Dynamic styles
  const themeStyles = darkMode ? darkTheme : lightTheme;

  return (
    <ScrollView style={[styles.container, themeStyles.container]}>
      <Text style={[styles.title, themeStyles.text]}>System Preferences</Text>

      {/* Dark Mode */}
      <View style={styles.preferenceRow}>
        <Ionicons name="moon" size={22} color={darkMode ? "#fff" : "#444"} />
        <View style={styles.textContainer}>
          <Text style={[styles.preferenceTitle, themeStyles.text]}>Dark Mode</Text>
          <Text style={[styles.preferenceDesc, themeStyles.subText]}>
            Enable dark theme UI
          </Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          thumbColor={darkMode ? "#4CAF50" : "#f4f3f4"}
        />
      </View>

      {/* Notifications */}
      <View style={styles.preferenceRow}>
        <Ionicons name="notifications" size={22} color={darkMode ? "#fff" : "#444"} />
        <View style={styles.textContainer}>
          <Text style={[styles.preferenceTitle, themeStyles.text]}>Notifications</Text>
          <Text style={[styles.preferenceDesc, themeStyles.subText]}>
            Allow system notifications
          </Text>
        </View>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          thumbColor={notifications ? "#4CAF50" : "#f4f3f4"}
        />
      </View>

      {/* Auto Updates */}
      <View style={styles.preferenceRow}>
        <Ionicons name="sync" size={22} color={darkMode ? "#fff" : "#444"} />
        <View style={styles.textContainer}>
          <Text style={[styles.preferenceTitle, themeStyles.text]}>Auto Updates</Text>
          <Text style={[styles.preferenceDesc, themeStyles.subText]}>
            Update system automatically
          </Text>
        </View>
        <Switch
          value={autoUpdates}
          onValueChange={setAutoUpdates}
          thumbColor={autoUpdates ? "#4CAF50" : "#f4f3f4"}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#555",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  preferenceDesc: {
    fontSize: 12,
  },
});

// Light theme
const lightTheme = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  text: { color: "#000" },
  subText: { color: "#666" },
});

// Dark theme
const darkTheme = StyleSheet.create({
  container: { backgroundColor: "#121212" },
  text: { color: "#fff" },
  subText: { color: "#bbb" },
});
