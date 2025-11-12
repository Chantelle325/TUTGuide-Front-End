// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import * as Notifications from 'expo-notifications';
// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

// export default function SystemPreferences() {
//   const router = useRouter();
//   const adminEmail = "admin@example.com"; // replace with dynamic email if needed

//   const [darkMode, setDarkMode] = useState(false);
//   const [notifications, setNotifications] = useState(true);
//   const [autoUpdates, setAutoUpdates] = useState(true);
//   const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

//   // Load preferences
//   useEffect(() => {
//     const loadPreferences = async () => {
//       const darkPref = await AsyncStorage.getItem("darkMode");
//       const notifPref = await AsyncStorage.getItem("notifications");
//       const updatePref = await AsyncStorage.getItem("autoUpdates");

//       if (darkPref !== null) setDarkMode(darkPref === "true");
//       if (notifPref !== null) setNotifications(notifPref === "true");
//       if (updatePref !== null) setAutoUpdates(updatePref === "true");
//     };
//     loadPreferences();
//   }, []);

//   // Handle notifications toggle
//   useEffect(() => {
//     let receivedListener: Notifications.Subscription | null = null;
//     let responseListener: Notifications.Subscription | null = null;

//     const manageNotifications = async () => {
//       if (!notifications) {
//         setExpoPushToken(null);
//         return;
//       }

//       // Request permission
//       const { status: existingStatus } = await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;

//       if (existingStatus !== 'granted') {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }

//       if (finalStatus !== 'granted') {
//         Alert.alert('Notifications permission not granted');
//         setNotifications(false);
//         return;
//       }

//       // Get Expo push token
//       const tokenData = await Notifications.getExpoPushTokenAsync();
//       setExpoPushToken(tokenData.data);

//       // Send token to backend
//       try {
//         await axios.post('https://ismabasamirenda123.loca.lt/api/notifications/token', {
//           admin_email: adminEmail,
//           fcmToken: tokenData.data,
//           allowNotifications: true,
//         });
//         console.log("✅ Token saved on backend");
//       } catch (error) {
//         console.log("❌ Error saving token:", error);
//       }

//       // Listen for notifications
//       receivedListener = Notifications.addNotificationReceivedListener(notification => {
//         console.log('Notification received:', notification);
//       });
//       responseListener = Notifications.addNotificationResponseReceivedListener(response => {
//         console.log('Notification tapped:', response);
//       });
//     };

//     manageNotifications();

//     return () => {
//       receivedListener?.remove();
//       responseListener?.remove();
//     };
//   }, [notifications]);

//   const themeStyles = darkMode ? darkTheme : lightTheme;

//   const toggleNotifications = async (val: boolean) => {
//     setNotifications(val);
//     await AsyncStorage.setItem("notifications", val.toString());

//     // Update backend toggle
//     try {
//       await axios.put("https://ismabasamirenda123.loca.lt/api/notifications/toggle", {
//         admin_email: adminEmail,
//         allowNotifications: val,
//       });
//       console.log("✅ Backend toggle updated");
//     } catch (err) {
//       console.error("❌ Error updating backend toggle:", err);
//     }
//   };

//   return (
//     <ScrollView style={[styles.container, themeStyles.container]} contentContainerStyle={{ paddingTop: 70 }}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color={darkMode ? "#fff" : "#333"} />
//         </TouchableOpacity>
//         <Text style={[styles.title, themeStyles.text]}>System Preferences</Text>
//       </View>

//       {/* Dark Mode */}
//       <View style={styles.preferenceRow}>
//         <Ionicons name="moon" size={22} color={darkMode ? "#fff" : "#444"} />
//         <View style={styles.textContainer}>
//           <Text style={[styles.preferenceTitle, themeStyles.text]}>Dark Mode</Text>
//           <Text style={[styles.preferenceDesc, themeStyles.subText]}>Enable dark theme UI</Text>
//         </View>
//         <Switch
//           value={darkMode}
//           onValueChange={async (val) => {
//             setDarkMode(val);
//             await AsyncStorage.setItem("darkMode", val.toString());
//           }}
//           thumbColor={darkMode ? "#4CAF50" : "#f4f3f4"}
//         />
//       </View>

//       {/* Notifications */}
//       <View style={styles.preferenceRow}>
//         <Ionicons name="notifications" size={22} color={darkMode ? "#fff" : "#444"} />
//         <View style={styles.textContainer}>
//           <Text style={[styles.preferenceTitle, themeStyles.text]}>Notifications</Text>
//           <Text style={[styles.preferenceDesc, themeStyles.subText]}>Allow system notifications</Text>
//         </View>
//         <Switch
//           value={notifications}
//           onValueChange={toggleNotifications}
//           thumbColor={notifications ? "#4CAF50" : "#f4f3f4"}
//         />
//       </View>

//       {/* Auto Updates */}
//       <View style={styles.preferenceRow}>
//         <Ionicons name="sync" size={22} color={darkMode ? "#fff" : "#444"} />
//         <View style={styles.textContainer}>
//           <Text style={[styles.preferenceTitle, themeStyles.text]}>Auto Updates</Text>
//           <Text style={[styles.preferenceDesc, themeStyles.subText]}>Update system automatically</Text>
//         </View>
//         <Switch
//           value={autoUpdates}
//           onValueChange={async (val) => {
//             setAutoUpdates(val);
//             await AsyncStorage.setItem("autoUpdates", val.toString());
//           }}
//           thumbColor={autoUpdates ? "#4CAF50" : "#f4f3f4"}
//         />
//       </View>
//     </ScrollView>
//   );
// }

// // Styles
// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   backButton: { marginRight: 10 },
//   title: { fontSize: 22, fontWeight: "bold" },
//   preferenceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#555" },
//   textContainer: { flex: 1, marginLeft: 12 },
//   preferenceTitle: { fontSize: 16, fontWeight: "600" },
//   preferenceDesc: { fontSize: 12 },
// });

// const lightTheme = StyleSheet.create({ container: { backgroundColor: "#fff" }, text: { color: "#000" }, subText: { color: "#666" } });
// const darkTheme = StyleSheet.create({ container: { backgroundColor: "#121212" }, text: { color: "#fff" }, subText: { color: "#bbb" } });





import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SystemPreferences() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoUpdates, setAutoUpdates] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const darkPref = await AsyncStorage.getItem("darkMode");
      const notifPref = await AsyncStorage.getItem("notifications");
      const updatePref = await AsyncStorage.getItem("autoUpdates");

      if (darkPref !== null) setDarkMode(darkPref === "true");
      if (notifPref !== null) setNotifications(notifPref === "true");
      if (updatePref !== null) setAutoUpdates(updatePref === "true");
    };
    loadPreferences();
  }, []);

  // Dynamic styles
  const themeStyles = darkMode ? darkTheme : lightTheme;

  return (
    <ScrollView
      style={[styles.container, themeStyles.container]}
      contentContainerStyle={{ paddingTop: 70 }}
    >
      {/* Header with Back Button */}
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
        <Switch
          value={notifications}
          onValueChange={(val) => {
            setNotifications(val);
            AsyncStorage.setItem("notifications", val.toString());
          }}
          thumbColor={notifications ? "#4CAF50" : "#f4f3f4"}
        />
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
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#555",
  },
  textContainer: { flex: 1, marginLeft: 12 },
  preferenceTitle: { fontSize: 16, fontWeight: "600" },
  preferenceDesc: { fontSize: 12 },
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
