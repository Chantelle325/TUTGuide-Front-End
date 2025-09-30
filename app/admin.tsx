import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import API from "./api";

const screenWidth = Dimensions.get("window").width;


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewedFeedbackIds, setViewedFeedbackIds] = useState<number[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const router = useRouter();

  // Dashboard counts
  const [totalUsers, setTotalUsers] = useState(0);
  const [previousUsers, setPreviousUsers] = useState(0);
  const [totalBuildings, setTotalBuildings] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);

  // Load token & system preferences
  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("userToken");
      const darkPref = await AsyncStorage.getItem("darkMode");
      setDarkMode(darkPref === "true");

      if (!token) {
        router.replace("/");
      } else {
        setAdminToken(token);
        fetchDashboardCounts(token);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Fetch feedbacks
  useEffect(() => {
    if (activeTab === "Feedback" && adminToken) fetchFeedbacks();
  }, [activeTab, adminToken]);

  const handleViewFeedback = async (fb: any) => {
    try {
      if (!viewedFeedbackIds.includes(fb.feedback_id)) {
        await API.patch(
          `/feedback/${fb.feedback_id}/viewed`,
          {},
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        setViewedFeedbackIds((prev) => [...prev, fb.feedback_id]);
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      }

      router.push({
        pathname: "/view-details",
        params: { id: fb.feedback_id },
      });
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to mark feedback as viewed");
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await API.get(`/feedback/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const allFeedbacks = response.data;
      const sorted = allFeedbacks.sort((a: any, b: any) => {
        if (a.is_viewed !== b.is_viewed) {
          return a.is_viewed - b.is_viewed;
        }
        return b.feedback_id - a.feedback_id;
      });

      setFeedbacks(sorted);
      setUnreadCount(allFeedbacks.filter((fb: any) => fb.is_viewed === 0).length);
      setViewedFeedbackIds(
        allFeedbacks.filter((fb: any) => fb.is_viewed === 1).map((fb: any) => fb.feedback_id)
      );
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch feedbacks");
    }
  };

  const fetchDashboardCounts = async (token: string) => {
    try {
      const response = await API.get("/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const counts = response.data;
      setTotalUsers(counts.totalUsers);
      setPreviousUsers(counts.totalPreviousUsers);
      setTotalBuildings(counts.totalBuildings);
      setTotalRooms(counts.totalRooms);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#FFA500"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="map" size={28} color={darkMode ? "#fff" : "#000"} />
          </View>
          <View>
            <Text style={[styles.headerTitle, darkMode && styles.darkText]}>TUT Guide Admin</Text>
            <Text style={[styles.headerSubtitle, darkMode && styles.darkText]}>
              Manage your app
            </Text>
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
          <Ionicons name="log-out-outline" size={20} color={darkMode ? "#000" : "#000"} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
       {/* Dashboard Tab */}
{activeTab === "Dashboard" && (
  <View style={styles.tabContent}>
    <Text style={[styles.tabTitle, darkMode && styles.darkText]}>Dashboard</Text>
    <View style={styles.dashboardGrid}>
      
      {/* Total Users */}
      <TouchableOpacity style={styles.dashboardCard} onPress={() => router.push("/total-users")}>
        <Ionicons name="people" size={28} color="#4CAF50" style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Total Users</Text>
        <Text style={styles.cardValue}>{totalUsers}</Text>
      </TouchableOpacity>

      {/* Previous Users */}
      <TouchableOpacity style={styles.dashboardCard} onPress={() => router.push("/previous-users")}>
        <MaterialIcons name="history" size={28} color="#FF9800" style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Previous Users</Text>
        <Text style={styles.cardValue}>{previousUsers}</Text>
      </TouchableOpacity>

      {/* Total Buildings */}
      <TouchableOpacity style={styles.dashboardCard}>
        <FontAwesome5 name="building" size={28} color="#2196F3" style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Total Buildings</Text>
        <Text style={styles.cardValue}>{totalBuildings}</Text>
      </TouchableOpacity>

      {/* Total Rooms */}
      <TouchableOpacity style={styles.dashboardCard}>
        <Ionicons name="home" size={28} color="#9C27B0" style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Total Rooms</Text>
        <Text style={styles.cardValue}>{totalRooms}</Text>
      </TouchableOpacity>
    </View>
    {/* Stats Graph */}
  <View style={{ marginVertical: 20 }}>
  <Text style={[styles.tabTitle, darkMode && styles.darkText]}>Statistics Overview</Text>
  <LineChart
    data={{
      labels: ["Total Users", "Previous Users", "Buildings", "Rooms"],
      datasets: [
        {
          data: [totalUsers, previousUsers, totalBuildings, totalRooms],
          color: () => darkMode ? "#FFA500" : "#4CAF50", // optional
          strokeWidth: 2,
        },
      ],
    }}
    width={screenWidth - 32} // padding from parent
    height={220}
    yAxisLabel=""
    chartConfig={{
      backgroundColor: darkMode ? "#121212" : "#fff",
      backgroundGradientFrom: darkMode ? "#121212" : "#fff",
      backgroundGradientTo: darkMode ? "#333" : "#fff",
      decimalPlaces: 0,
      color: (opacity = 1) => darkMode ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`,
      labelColor: (opacity = 1) => darkMode ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`,
      style: { borderRadius: 16 },
      propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa500" },
    }}
    style={{ borderRadius: 16 }}
  />
  </View>
  </View>
)}

        {/* Feedback Tab */}
        {activeTab === "Feedback" && (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, darkMode && styles.darkText]}>User Feedback</Text>
            {feedbacks.length === 0 && <Text>No feedback yet.</Text>}
            {feedbacks.map((fb, idx) => {
              const isViewed = viewedFeedbackIds.includes(fb.feedback_id);
              return (
                <View key={idx} style={styles.locationCard}>
                  <View style={styles.locationHeader}>
                    <Text
                      style={[
                        styles.locationName,
                        isViewed && styles.viewedFeedbackText,
                        darkMode && styles.darkText,
                      ]}
                    >
                      {fb.email ? fb.email.split("@")[0] : "Unknown"}
                    </Text>
                    <TouchableOpacity
                      style={[styles.viewButton, isViewed && styles.viewedButton]}
                      onPress={() => handleViewFeedback(fb)}
                    >
                      <Text style={styles.viewButtonText}>View Report</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Settings Tab */}
        {activeTab === "Settings" && (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, darkMode && styles.darkText]}>Settings</Text>
            <View style={styles.settingsGrid}>
              <TouchableOpacity style={styles.settingsCard} onPress={() => router.push("/admin-profile")}>
                <Text style={styles.settingsCardTitle}>Profile Management</Text>
                <Text style={styles.settingsCardDesc}>
                  Update your profile details and credentials
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsCard}
                onPress={() => router.push("/manage-users")}
              >
                <Text style={styles.settingsCardTitle}>Manage Users</Text>
                <Text style={styles.settingsCardDesc}>Add, remove, or update user accounts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsCard}
                onPress={() => router.push("/system-preferences")}
              >
                <Text style={styles.settingsCardTitle}>System Preferences</Text>
                <Text style={styles.settingsCardDesc}>
                  Configure system settings and preferences
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Tabs */}
      <View style={[styles.footer, darkMode && styles.darkFooter]}>
        <View style={styles.tabContainer}>
          {["Dashboard", "Feedback", "Settings"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={tab === "Dashboard" ? "home" : tab === "Feedback" ? "chatbubble-ellipses" : "settings"}
                size={20}
                color={activeTab === tab ? "#000" : "#333"}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              {tab === "Feedback" && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eee" },
  darkContainer: { backgroundColor: "#121212" },
  darkText: { color: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#bbb",
  },
  darkHeader: { backgroundColor: "#222" },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#000" },
  headerSubtitle: { fontSize: 13, color: "#000", marginTop: 2 },
  logoutButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
  },
  content: { flex: 1, padding: 16 },
  tabContent: { gap: 16 },
  tabTitle: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 12 },
  locationCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  locationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  locationName: { fontSize: 16, fontWeight: "600", color: "#333" },
  viewedFeedbackText: { color: "#999", fontStyle: "italic" },
  viewButton: {
    backgroundColor: "#aaa",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewedButton: { backgroundColor: "#ddd" },
  viewButtonText: { color: "#fff", fontWeight: "800" },

  footer: { borderTopWidth: 1, borderTopColor: "#ccc", backgroundColor: "#ddd" },
  darkFooter: { backgroundColor: "#222", borderTopColor: "#444" },
  tabContainer: { flexDirection: "row" },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    position: "relative",
  },
  activeTab: { borderTopWidth: 3, borderTopColor: "#000", backgroundColor: "#aaa" },
  tabText: { color: "#333", fontSize: 14, marginTop: 4 },
  activeTabText: { color: "#000", fontWeight: "bold" },

  badge: {
    position: "absolute",
    top: 6,
    right: 28,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },

  dashboardGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 14 },
  dashboardCard: {
    backgroundColor: "#fff",
    width: "43%",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginLeft: 10,
    marginRight: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  cardValue: { fontSize: 22, fontWeight: "bold", color: "#333" },

  settingsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 20 },
  settingsCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    width: "48%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsCardTitle: { fontSize: 16, fontWeight: "bold", color: "#000", marginBottom: 6 },
  settingsCardDesc: { fontSize: 12, color: "#555" },
 
cardIcon: {
  marginBottom: 10,
},

});
