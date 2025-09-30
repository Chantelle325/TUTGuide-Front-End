import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import API from "./api";

export default function AddUser() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user"); // default role
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    AsyncStorage.getItem("darkMode").then((value) => setDarkMode(value === "true"));
  }, []);

  const handleAddUser = async () => {
    if (!fullName || !email) {
      Alert.alert("Validation Error", "Name and Email are required");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      await API.post(
        "/users/add",
        { fullName, email, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "User added successfully");
      router.back();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to add user");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, darkMode && styles.darkContainer]}
    >
      <Text style={[styles.title, darkMode && styles.darkText]}>Add New User</Text>

      <TextInput
        style={[styles.input, darkMode && styles.darkInput]}
        placeholder="Full Name"
        placeholderTextColor={darkMode ? "#aaa" : "#999"}
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={[styles.input, darkMode && styles.darkInput]}
        placeholder="Email"
        placeholderTextColor={darkMode ? "#aaa" : "#999"}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <View style={styles.roleContainer}>
        <Text style={[styles.roleLabel, darkMode && styles.darkText]}>Role:</Text>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "user" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("user")}
        >
          <Text style={styles.roleButtonText}>User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "admin" && styles.selectedRoleButton,
          ]}
          onPress={() => setRole("admin")}
        >
          <Text style={styles.roleButtonText}>Admin</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleAddUser}>
        <Text style={styles.saveButtonText}>Add User</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#f5f5f5" },
  darkContainer: { backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#333" },
  darkText: { color: "#fff" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#000",
  },
  darkInput: { borderColor: "#555", color: "#fff" },

  roleContainer: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  roleLabel: { fontSize: 16, fontWeight: "600", marginRight: 12 },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    marginRight: 8,
  },
  selectedRoleButton: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  roleButtonText: { color: "#000", fontWeight: "600" },

  saveButton: {
    backgroundColor: "#FFA500",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
