import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import API from "./api";

export default function PreviousUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
        console.log("Previous users API response:", response.data); // check API fields
        setUsers(response.data);
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
      <Text style={[styles.title, darkMode && styles.darkText]}>Previous Users</Text>

      {users.length === 0 ? (
        <Text style={[styles.noUsersText, darkMode && styles.darkText]}>
          No previous users found.
        </Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) => (item.user_id ?? index).toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.userCard, darkMode && styles.darkUserCard]}>
              <Text style={[styles.userName, darkMode && styles.darkText]}>
                {index + 1}. {item.name ?? item.full_name ?? "Unnamed User"}
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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  darkContainer: { backgroundColor: "#121212" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#333" },
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
