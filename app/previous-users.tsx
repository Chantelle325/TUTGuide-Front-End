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

export default function PreviousUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPreviousUsers = async () => {
      const savedToken = await AsyncStorage.getItem("userToken");
      const darkPref = await AsyncStorage.getItem("darkMode");
      setDarkMode(darkPref === "true");

      if (!savedToken) return;

      try {
        const response = await API.get("/dashboard/previous-users", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        console.log("Previous users API response:", response.data);
        setUsers(response.data.data || []);
      } catch (err: any) {
        console.error(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviousUsers();
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
      {/* Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={darkMode ? "#fff" : "#333"}
          />
        </TouchableOpacity>
        <Text style={[styles.title, darkMode && styles.darkText]}>
          Previous Users
        </Text>
      </View>

      {users.length === 0 ? (
        <Text style={[styles.noUsersText, darkMode && styles.darkText]}>
          No previous users found.
        </Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) =>
            (item.prev_user_id ?? index).toString()
          }
          renderItem={({ item, index }) => (
            <View style={[styles.userCard, darkMode && styles.darkUserCard]}>
              <Text style={[styles.userName, darkMode && styles.darkText]}>
                {index + 1}. {item.fullName}
              </Text>
              <Text style={[styles.userEmail, darkMode && styles.darkText]}>
                {item.email ?? "No email"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 70, backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#121212" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: { marginRight: 10 },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  darkText: { color: "#fff" },
  noUsersText: { fontSize: 16, color: "#555" },
  userCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
    marginBottom: 10,
  },
  darkUserCard: { backgroundColor: "#1e1e1e" },
  userName: { fontSize: 16, fontWeight: "600", color: "#333" },
  userEmail: { fontSize: 14, color: "#555" },
});
