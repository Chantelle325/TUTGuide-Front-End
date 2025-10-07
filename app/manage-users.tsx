import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API from "./api";

interface User {
  fullName: string;
  email: string;
  role: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [token, setToken] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const savedToken = await AsyncStorage.getItem("userToken");
      const darkPref = await AsyncStorage.getItem("darkMode");
      setDarkMode(darkPref === "true");

      if (!savedToken) {
        router.replace("/");
        return;
      }
      setToken(savedToken);
      fetchUsers(savedToken);
    };
    init();
  }, []);

  const fetchUsers = async (token: string) => {
    try {
      const response = await API.get("/dashboard/all-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${user.fullName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/dashboard/delete-user`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { email: user.email.trim().toLowerCase() },
              });

              setUsers((prevUsers) =>
                prevUsers.filter(
                  (u) =>
                    u.email.trim().toLowerCase() !==
                    user.email.trim().toLowerCase()
                )
              );

              Alert.alert("Success", "User deleted successfully");
            } catch (err: any) {
              console.error(err.response?.data || err.message);
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const handleEditEmail = (user: User) => {
    setSelectedUser(user);
    setNewEmail(user.email);
    setModalVisible(true);
  };

  const saveEmail = async () => {
    if (!newEmail || !selectedUser) return;

    try {
      await API.put(
        "/dashboard/update-email",
        {
          currentEmail: selectedUser.email.trim().toLowerCase(),
          newEmail: newEmail.trim().toLowerCase(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.email.trim().toLowerCase() ===
          selectedUser.email.trim().toLowerCase()
            ? { ...u, email: newEmail.trim().toLowerCase() }
            : u
        )
      );

      Alert.alert("Success", "Email updated successfully");
      setModalVisible(false);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to update email");
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
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      <Text style={[styles.title, darkMode && styles.darkText]}>
        Manage Users
      </Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-user")}
      >
        <Ionicons
          name="person-add"
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.addButtonText}>Add New User</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View
            style={[
              styles.tableRow,
              styles.tableHeader,
              darkMode && styles.darkTableHeader,
            ]}
          >
            <Text style={[styles.tableCell, styles.nameColumn]}>Name</Text>
            <Text style={[styles.tableCell, styles.emailColumn]}>Email</Text>
            <Text style={[styles.tableCell, styles.roleColumn]}>Role</Text>
            <Text style={[styles.tableCell, styles.actionColumn]}>Actions</Text>
          </View>

          {/* Table Rows */}
          {users.map((user, index) => (
            <View
              key={user.email}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.evenRow : styles.oddRow,
                darkMode && styles.darkRow,
              ]}
            >
              <Text
                style={[
                  styles.tableCell,
                  styles.nameColumn,
                  darkMode && styles.darkTableText,
                ]}
              >
                {user.fullName}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.emailColumn,
                  darkMode && styles.darkTableText,
                ]}
              >
                {user.email}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.roleColumn,
                  darkMode && styles.darkTableText,
                ]}
              >
                {user.role}
              </Text>
              <View
                style={[
                  styles.tableCell,
                  styles.actionColumn,
                  styles.actionButtons,
                ]}
              >
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditEmail(user)}
                >
                  <MaterialIcons name="edit" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(user)}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Edit Email Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, darkMode && styles.darkUserCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>
                Edit Email
              </Text>
              <Ionicons
                name="close"
                size={24}
                color={darkMode ? "#fff" : "#000"}
                onPress={() => setModalVisible(false)}
              />
            </View>
            <Text style={[styles.modalLabel, darkMode && styles.darkText]}>
              For: {selectedUser?.fullName}
            </Text>
            <TextInput
              style={[styles.input, darkMode && styles.darkInput]}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={saveEmail}>
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  darkContainer: { backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#333" },
  darkText: { color: "#fff" },

  addButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  tableContainer: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    minWidth: 600,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableHeader: { backgroundColor: "#e0e0e0" },
  darkTableHeader: { backgroundColor: "#aaa" },
  tableCell: { paddingHorizontal: 8 },
  nameColumn: { minWidth: 150, fontWeight: "600" },
  emailColumn: { minWidth: 250 },
  roleColumn: { minWidth: 120 },
  actionColumn: { minWidth: 140 },

  evenRow: { backgroundColor: "#fafafa" },
  oddRow: { backgroundColor: "#fff" },
  darkRow: { backgroundColor: "#1b1b1b" },
  darkTableText: { color: "#fff" },

  actionButtons: { flexDirection: "row", gap: 8 },
  editButton: { backgroundColor: "#4CAF50", padding: 6, borderRadius: 6 },
  deleteButton: { backgroundColor: "#F44336", padding: 6, borderRadius: 6 },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  darkUserCard: { backgroundColor: "#1e1e1e" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalLabel: { marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: "#000",
  },
  darkInput: { borderColor: "#555", color: "#fff" },
  modalActions: { flexDirection: "row", justifyContent: "space-between" },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F44336",
  },
});
