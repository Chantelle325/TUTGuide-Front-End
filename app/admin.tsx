import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const API_URL = "https://ismabasa123.loca.lt/feedback";

  // Load token from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem("userToken").then((token) => {
      if (!token) {
        router.replace("/"); // redirect to login
      } else {
        setAdminToken(token);
      }
      setLoading(false);
    });
  }, []);

  // Fetch feedbacks when tab changes
  useEffect(() => {
    if (activeTab === "Feedback" && adminToken) fetchFeedbacks();
  }, [activeTab, adminToken]);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(`${API_URL}/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setFeedbacks(response.data);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch feedbacks");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FFA500" style={{ flex: 1, justifyContent: "center" }} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="map" size={28} color="#FFA500" />
          </View>
          <View>
            <Text style={styles.headerTitle}>TUT Guide Admin</Text>
            <Text style={styles.headerSubtitle}>Manage your app</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Log Out",
                onPress: async () => {
                  await AsyncStorage.clear();
                  router.replace("/");
                },
              },
            ]);
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFA500" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Dashboard", "Feedback", "Settings"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab === "Dashboard" ? "home" : tab === "Feedback" ? "chatbubble-ellipses" : "settings"}
              size={18}
              color={activeTab === tab ? "#FFA500" : "#B0C7C7"}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === "Dashboard" && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Dashboard</Text>
            <Text style={{ color: "#fff" }}>Welcome to the admin panel!</Text>
          </View>
        )}

        {activeTab === "Feedback" && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>User Feedback</Text>
            {feedbacks.length === 0 && <Text>No feedback yet.</Text>}
            {feedbacks.map((fb, idx) => (
              <View key={idx} style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <Text style={styles.locationName}>{fb.email}</Text>
                  <Text style={styles.visits}>{fb.status || "Pending"}</Text>
                </View>
                <Text style={styles.locationCategory}>{fb.feedback_message}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === "Settings" && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Settings</Text>
            <Text style={{ color: "#fff" }}>Settings panel</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5A7F99" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#2E4B6D",
    borderBottomWidth: 2,
    borderBottomColor: "#FFA500",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logoContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#3A5C80", justifyContent: "center", alignItems: "center", marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFA500" },
  headerSubtitle: { fontSize: 13, color: "#E5E5E5", marginTop: 2 },
  logoutButton: { padding: 10, borderRadius: 50, backgroundColor: "#2E4B6D", borderWidth: 2, borderColor: "#FFA500" },
  tabContainer: { flexDirection: "row", backgroundColor: "#2E4B6D" },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 6 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#FFA500", backgroundColor: "#2E4B6D" },
  tabText: { color: "#B0C7C7", fontSize: 14 },
  activeTabText: { color: "#FFA500", fontWeight: "bold" },
  content: { flex: 1, padding: 16 },
  tabContent: { gap: 16 },
  tabTitle: { fontSize: 22, fontWeight: "bold", color: "#2E4B6D", marginBottom: 12 },
  locationCard: { backgroundColor: "rgba(176,199,199,0.9)", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: "#FFA500", marginBottom: 10 },
  locationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  locationName: { fontSize: 16, fontWeight: "600", color: "#2E4B6D" },
  locationCategory: { fontSize: 14, color: "#2E4B6D" },
  visits: { fontSize: 13, fontWeight: "600", color: "#2E4B6D" },
});
