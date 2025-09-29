import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "./api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewedFeedbackIds, setViewedFeedbackIds] = useState<number[]>([]);

  const router = useRouter();

  // Placeholder counts for dashboard cards
  const [totalUsers, setTotalUsers] = useState(0);
  const [previousUsers, setPreviousUsers] = useState(0);
  const [totalBuildings, setTotalBuildings] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);

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

  // Load token
  useEffect(() => {
    AsyncStorage.getItem("userToken").then((token) => {
      if (!token) {
        router.replace("/");
      } else {
        setAdminToken(token);
        fetchDashboardCounts(token);
      }
      setLoading(false);
    });
  }, []);

  // Fetch feedbacks
  useEffect(() => {
    if (activeTab === "Feedback" && adminToken) fetchFeedbacks();
  }, [activeTab, adminToken]);

  const fetchFeedbacks = async () => {
    try {
      const response = await API.get(`/feedback/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const allFeedbacks = response.data;

      // Unread on top, sorted by newest first
      const sorted = allFeedbacks.sort((a: any, b: any) => {
        if (a.is_viewed !== b.is_viewed) {
          return a.is_viewed - b.is_viewed; // unread (0) before viewed (1)
        }
        return b.feedback_id - a.feedback_id; // newest first
      });

      setFeedbacks(sorted);

      const unread = allFeedbacks.filter((fb: any) => fb.is_viewed === 0).length;
      setUnreadCount(unread);

      const viewedIds = allFeedbacks
        .filter((fb: any) => fb.is_viewed === 1)
        .map((fb: any) => fb.feedback_id);
      setViewedFeedbackIds(viewedIds);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch feedbacks");
    }
  };

  // Fetch dashboard counts
  const fetchDashboardCounts = async (token: string) => {
    try {
      const response = await API.get("/dashboard-counts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const counts = response.data;
      setTotalUsers(counts.totalUsers);
      setPreviousUsers(counts.previousUsers);
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="map" size={28} color="#000" />
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
          <Ionicons name="log-out-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Dashboard Tab */}
        {activeTab === "Dashboard" && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Dashboard</Text>
            <View style={styles.dashboardGrid}>
              <TouchableOpacity style={styles.dashboardCard}>
                <Text style={styles.cardTitle}>Total Users</Text>
                <Text style={styles.cardValue}>{totalUsers}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dashboardCard}>
                <Text style={styles.cardTitle}>Previous Users</Text>
                <Text style={styles.cardValue}>{previousUsers}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dashboardCard}>
                <Text style={styles.cardTitle}>Total Buildings</Text>
                <Text style={styles.cardValue}>{totalBuildings}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dashboardCard}>
                <Text style={styles.cardTitle}>Total Rooms</Text>
                <Text style={styles.cardValue}>{totalRooms}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Feedback Tab */}
        {activeTab === "Feedback" && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>User Feedback</Text>
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
            <Text style={styles.tabTitle}>Settings</Text>
            <Text style={{ color: "#000" }}>Settings panel</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Tabs */}
      <View style={styles.footer}>
        <View style={styles.tabContainer}>
          {["Dashboard", "Feedback", "Settings"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={
                  tab === "Dashboard"
                    ? "home"
                    : tab === "Feedback"
                    ? "chatbubble-ellipses"
                    : "settings"
                }
                size={20}
                color={activeTab === tab ? "#000" : "#333"}
              />
              <Text
                style={[styles.tabText, activeTab === tab && styles.activeTabText]}
              >
                {tab}
              </Text>

              {tab === "Feedback" && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Modal */}
      <Modal
        visible={!!selectedFeedback}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFeedback(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Feedback Report</Text>
            <Text style={styles.modalEmail}>{selectedFeedback?.email}</Text>
            <Text style={styles.modalMessage}>
              {selectedFeedback?.feedback_message}
            </Text>

            {selectedFeedback?.attachment && (
              <Image
                source={{ uri: selectedFeedback.attachment }}
                style={styles.attachment}
                resizeMode="contain"
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedFeedback(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eee" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#bbb",
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
  },
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
  tabTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#fff",
    marginBottom: 10,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  locationName: { fontSize: 16, fontWeight: "600", color: "#333" },
  viewedFeedbackText: { color: "#999", fontStyle: "italic" }, // italic for viewed
  viewButton: {
    backgroundColor: "#aaa",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewedButton: { backgroundColor: "#ddd" },
  viewButtonText: { color: "#fff", fontWeight: "800" },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#ddd",
  },
  tabContainer: { flexDirection: "row" },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    position: "relative",
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: "#000",
    backgroundColor: "#aaa",
  },
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalEmail: { fontSize: 14, color: "#555", marginBottom: 10 },
  modalMessage: { fontSize: 16, marginBottom: 15 },
  attachment: { width: "100%", height: 200, marginBottom: 15 },
  closeButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontWeight: "600" },

  // Dashboard cards
  dashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  dashboardCard: {
    backgroundColor: "#fff",
    width: "43%", // two cards per row
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
   marginLeft:10,
   marginRight:8,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  cardValue: { fontSize: 22, fontWeight: "bold", color: "#FFA500" },
});
