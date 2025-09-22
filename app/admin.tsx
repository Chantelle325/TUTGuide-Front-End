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

const handleViewFeedback = async (fb: any) => {
  try {
    // Only mark as viewed if not already viewed
    if (!viewedFeedbackIds.includes(fb.feedback_id)) {
      // Call backend to mark as viewed
      await API.patch(`/feedback/${fb.feedback_id}/viewed`, {}, {
  headers: { Authorization: `Bearer ${adminToken}` },
});

      // Update local state
      setViewedFeedbackIds((prev) => [...prev, fb.feedback_id]);
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    }

    // Navigate to details page
    router.push({
      pathname: "/view-details",
      params: { id: fb.feedback_id },
    });
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    Alert.alert("Error", "Failed to mark feedback as viewed");
  }
};







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
      const response = await API.get(`/feedback/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      setFeedbacks(response.data);

      // Compute unread count based on `is_viewed` property
      const unread = response.data.filter((fb: any) => fb.is_viewed === 0).length;
      setUnreadCount(unread);

      // Track feedbacks already viewed (for styling and preventing double decrement)
      const viewedIds = response.data
        .filter((fb: any) => fb.is_viewed === 1)
        .map((fb: any) => fb.feedback_id);
      setViewedFeedbackIds(viewedIds);

    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch feedbacks");
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
              name={
                tab === "Dashboard"
                  ? "home"
                  : tab === "Feedback"
                  ? "chatbubble-ellipses"
                  : "settings"
              }
              size={18}
              color={activeTab === tab ? "#FFA500" : "#B0C7C7"}
            />
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTabText]}
            >
              {tab}
            </Text>

                      {/* Show badge only for Feedback */}
            {tab === "Feedback" && unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
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
            {feedbacks.map((fb, idx) => {
  const isViewed = viewedFeedbackIds.includes(fb.feedback_id);

  return (
    <View key={idx} style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <Text
          style={[
            styles.locationName,
            isViewed && styles.viewedFeedbackText, // add style if viewed
          ]}
        >
          {fb.email}
        </Text>

        {/* View button */}
        <TouchableOpacity
          style={[styles.viewButton, isViewed && styles.viewedButton]} // optional button style for viewed
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

        {activeTab === "Settings" && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Settings</Text>
            <Text style={{ color: "#fff" }}>Settings panel</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal for Viewing Feedback */}
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

            {/* If there's an attachment */}
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
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#3A5C80",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFA500" },
  headerSubtitle: { fontSize: 13, color: "#E5E5E5", marginTop: 2 },
  logoutButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#2E4B6D",
    borderWidth: 2,
    borderColor: "#FFA500",
  },
  tabContainer: { flexDirection: "row", backgroundColor: "#2E4B6D" },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#FFA500",
    backgroundColor: "#2E4B6D",
  },
  tabText: { color: "#B0C7C7", fontSize: 14 },
  activeTabText: { color: "#FFA500", fontWeight: "bold" },
  content: { flex: 1, padding: 16 },
  tabContent: { gap: 16 },
  tabTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E4B6D",
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: "rgba(176,199,199,0.9)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#FFA500",
    marginBottom: 10,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  locationName: { fontSize: 16, fontWeight: "600", color: "#2E4B6D", flex: 1, marginRight: 10 },
  viewButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewButtonText: { color: "#fff", fontWeight: "600" },

  // Modal styles
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
    backgroundColor: "#2E4B6D",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontWeight: "600" },
  badge: {
  backgroundColor: "#FF0000",
  borderRadius: 10,
  paddingHorizontal: 6,
  paddingVertical: 2,
  marginLeft: 6,
  minWidth: 20,
  alignItems: "center",
  justifyContent: "center",
},
badgeText: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "bold",
},
viewedFeedbackText: {
  color: "#888",      // grey color to indicate viewed
  fontStyle: "italic",
},

viewedButton: {
  backgroundColor: "#B0C7C7", // lighter button for viewed reports
},

});