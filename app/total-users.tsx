import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "./api";

export default function TotalUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const savedToken = await AsyncStorage.getItem("userToken");
      const darkPref = await AsyncStorage.getItem("darkMode");
      setDarkMode(darkPref === "true");

      if (!savedToken) return;

      try {
        const response = await API.get("/dashboard/all-users", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setUsers(response.data.users);
      } catch (err: any) {
        console.error(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#FFA500"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Back arrow and title row */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={darkMode ? "#fff" : "#333"}
          />
        </TouchableOpacity>
        <Text style={[styles.title, darkMode && styles.darkText]}>All Users</Text>
      </View>

      {users.length === 0 ? (
        <Text style={[styles.noUsersText, darkMode && styles.darkText]}>
          No users found.
        </Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) => (item.email ?? index).toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.userCard, darkMode && styles.darkUserCard]}>
              <Text style={[styles.userName, darkMode && styles.darkText]}>
                {index + 1}. {item.fullName}
              </Text>
              <Text style={[styles.userRole, darkMode && styles.darkText]}>
                Role: {item.role ?? "User"}
              </Text>
              <Text style={[styles.userEmail, darkMode && styles.darkText]}>
                {item.email}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 70, backgroundColor: "#f5f5f5" },
  darkContainer: { backgroundColor: "#121212" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: { marginRight: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  darkText: { color: "#fff" },
  noUsersText: { fontSize: 16, color: "#555" },
  userCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  darkUserCard: { backgroundColor: "#1e1e1e" },
  userName: { fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 4 },
  userRole: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 4 },
  userEmail: { fontSize: 14, color: "#555" },
});
