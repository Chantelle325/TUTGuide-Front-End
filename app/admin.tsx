import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const router = useRouter();

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
        <TouchableOpacity style={styles.logoutButton}>
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
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="people" size={28} color="#2E4B6D" />
                <Text style={styles.statNumber}>150</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="walk" size={28} color="#2E4B6D" />
                <Text style={styles.statNumber}>45</Text>
                <Text style={styles.statLabel}>Active Today</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="location" size={28} color="#2E4B6D" />
                <Text style={styles.statNumber}>Library</Text>
                <Text style={styles.statLabel}>Top Search</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === "Feedback" && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>User Feedback</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationName}>Student 1</Text>
                <Text style={styles.visits}>Pending</Text>
              </View>
              <Text style={styles.locationCategory}>"Map not loading in Engineering block"</Text>
            </View>
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationName}>Student 2</Text>
                <Text style={styles.visits}>Fixed</Text>
              </View>
              <Text style={styles.locationCategory}>"Route to Admin Office incorrect"</Text>
            </View>
          </View>
        )}

        {activeTab === "Settings" && (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Settings</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locationName}>Update API Key</Text>
              <Text style={styles.locationCategory}>Mapbox integration</Text>
            </View>
            <View style={styles.locationCard}>
              <Text style={styles.locationName}>Manage Admins</Text>
              <Text style={styles.locationCategory}>Add/remove accounts</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating navicon */}
      <TouchableOpacity style={styles.floatingButton} onPress={() => router.push("/signin")}>
        <Image source={require("@/assets/images/navicon.png")} style={styles.floatingIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#5A7F99",},
  header: {flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, backgroundColor: "#2E4B6D", borderBottomWidth: 2, borderBottomColor: "#FFA500",},
  headerLeft: {flexDirection: "row", alignItems: "center",},
  logoContainer: {width: 48, height: 48, borderRadius: 12, backgroundColor: "#3A5C80", justifyContent: "center", alignItems: "center", marginRight: 12,},
  headerTitle: {fontSize: 20, fontWeight: "bold", color: "#FFA500",},
  headerSubtitle: {fontSize: 13, color: "#E5E5E5", marginTop: 2,},
  logoutButton: {padding: 10, borderRadius: 50, backgroundColor: "#2E4B6D", borderWidth: 2, borderColor: "#FFA500",},
  tabContainer: {flexDirection: "row", backgroundColor: "#2E4B6D",},
  tab: {flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 6,},
  activeTab: {borderBottomWidth: 3, borderBottomColor: "#FFA500", backgroundColor: "#2E4B6D",},
  tabText: {color: "#B0C7C7", fontSize: 14,},
  activeTabText: {color: "#FFA500", fontWeight: "bold",},
  content: {flex: 1, padding: 16,},
  tabContent: {gap: 16,},
  tabTitle: {fontSize: 22, fontWeight: "bold", color: "#2E4B6D", marginBottom: 12,},
  statsContainer: {flexDirection: "row", flexWrap: "wrap", gap: 16,},
  statCard: {flex: 1, minWidth: "45%", backgroundColor: "rgba(176,199,199,0.9)", borderRadius: 14, padding: 16, alignItems: "center", borderWidth: 2, borderColor: "#FFA500", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,},
  statNumber: {fontSize: 22, fontWeight: "bold", color: "#2E4B6D", marginVertical: 6,},
  statLabel: {fontSize: 13, color: "#2E4B6D", textAlign: "center",},
  locationCard: {backgroundColor: "rgba(176,199,199,0.9)", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: "#FFA500", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,},
  locationHeader: {flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6,},
  locationName: {fontSize: 16, fontWeight: "600", color: "#2E4B6D",},
  locationCategory: {fontSize: 14, color: "#2E4B6D",},
  visits: {fontSize: 13, fontWeight: "600", color: "#2E4B6D",},

  floatingButton: {position: "absolute", bottom: 20, right: 20, backgroundColor: "#fff", borderRadius: 30, padding: 10, elevation: 5, shadowColor: "#000", shadowOpacity: 0.3, shadowOffset: {width: 0, height: 2}, shadowRadius: 4,},
  floatingIcon: {width: 40, height: 40, resizeMode: "contain",},
});
