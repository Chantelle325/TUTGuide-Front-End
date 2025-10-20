import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "./ThemeContext";

interface Facility {
  id: string;
  name: string;
  description: string;
}

const ManageFacilities = () => {
  const { darkMode } = useTheme();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Dummy Data
  useEffect(() => {
    const dummy = [
      { id: "1", name: "Computer Lab", description: "Technology" },
      { id: "2", name: "Auditorium", description: "Events" },
      { id: "3", name: "Sports Hall", description: "Fitness" },
      { id: "4", name: "Cafeteria", description: "Food" },
      { id: "5", name: "Library", description: "Study" },
      { id: "6", name: "Admin Block", description: "Offices" },
    ];
    setFacilities(dummy);
    setFilteredFacilities(dummy);
  }, []);

  // 🔍 Search Filter
  useEffect(() => {
    const filtered = facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(searchText.toLowerCase()) ||
        f.description.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredFacilities(filtered);
  }, [searchText, facilities]);

  const openAddModal = () => {
    setEditingFacility(null);
    setFormData({ name: "", description: "" });
    setModalVisible(true);
  };

  const openEditModal = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      description: facility.description,
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      Alert.alert("Validation", "Facility name and description are required.");
      return;
    }

    if (editingFacility) {
      setFacilities((prev) =>
        prev.map((f) =>
          f.id === editingFacility.id ? { ...f, ...formData } : f
        )
      );
    } else {
      const newFacility = {
        id: Date.now().toString(),
        ...formData,
      };
      setFacilities((prev) => [...prev, newFacility]);
    }

    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Confirm Delete", "Delete this facility?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setFacilities((prev) => prev.filter((f) => f.id !== id));
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={darkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.title, darkMode && styles.textLight]}>
          Manage Facilities
        </Text>
        <TouchableOpacity onPress={openAddModal}>
          <Ionicons
            name="add-circle-outline"
            size={30}
            color={darkMode ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>

      {/* 🔍 Search Bar */}
      <View style={[styles.searchBar, darkMode && styles.searchBarDark]}>
        <Ionicons name="search-outline" size={20} color={darkMode ? "#aaa" : "#555"} />
        <TextInput
          placeholder="Search by facility name or description..."
          placeholderTextColor={darkMode ? "#888" : "#777"}
          style={[styles.searchInput, darkMode && styles.searchInputDark]}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Scrollable Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={[styles.tableContainer, darkMode && styles.tableContainerDark]}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cellHeader, { width: 60 }]}>#</Text>
            <Text style={[styles.cellHeader, { width: 250 }]}>Facility Name</Text>
            <Text style={[styles.cellHeader, { width: 180 }]}>Description</Text>
            <Text style={[styles.cellHeader, { width: 150 }]}>Actions</Text>
          </View>

          {/* Data Rows */}
          {filteredFacilities.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={[styles.text, darkMode && styles.textLight]}>
                No facilities found.
              </Text>
            </View>
          ) : (
            filteredFacilities.map((f, index) => (
              <View
                key={f.id}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  darkMode && styles.tableRowDark,
                ]}
              >
                <Text style={[styles.cell, { width: 60 }, darkMode && styles.textLight]}>
                  {index + 1}
                </Text>
                <Text style={[styles.cell, { width: 250 }, darkMode && styles.textLight]}>
                  {f.name}
                </Text>
                <Text style={[styles.cell, { width: 180 }, darkMode && styles.textLight]}>
                  {f.description}
                </Text>
                <View
                  style={[
                    styles.cell,
                    { width: 150, flexDirection: "row", justifyContent: "center" },
                  ]}
                >
                  <TouchableOpacity onPress={() => openEditModal(f)} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={20} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(f.id)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.modalBoxDark]}>
            <Text style={[styles.modalTitle, darkMode && styles.textLight]}>
              {editingFacility ? "Edit Facility" : "Add Facility"}
            </Text>

            <TextInput
              placeholder="Facility Name"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              placeholder="Building No"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
             <TextInput
              placeholder="Latitude"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
             <TextInput
              placeholder="Longitude"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#000" }]}
                onPress={handleSave}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10,paddingTop:70, },
  containerDark: { backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 22, fontWeight: "700" },
  textLight: { color: "#fff" },
  text: { fontSize: 16, color: "#000" },

  // 🔍 Search Bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  searchBarDark: { backgroundColor: "#1e1e1e", borderColor: "#333" },
  searchInput: { flex: 1, marginLeft: 8, color: "#000", fontSize: 15 },
  searchInputDark: { color: "#fff" },

  // Table
  tableContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    minWidth: 650,
    backgroundColor: "#fff",
  },
  tableContainerDark: { borderColor: "#333", backgroundColor: "#1e1e1e" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  tableRowDark: { borderColor: "#333" },
  tableHeader: { backgroundColor: "#000" },
  cellHeader: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#333",
  },
  cell: {
    fontSize: 14,
    color: "#000",
    paddingVertical: 10,
    paddingHorizontal: 8,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  rowEven: { backgroundColor: "#f9f9f9" },
  rowOdd: { backgroundColor: "#fff" },
  emptyRow: { padding: 20, alignItems: "center" },
  actionBtn: { marginHorizontal: 6 },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: { backgroundColor: "#fff", borderRadius: 10, padding: 20, width: "85%" },
  modalBoxDark: { backgroundColor: "#1e1e1e" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: "#000",
  },
  inputDark: { borderColor: "#555", color: "#fff" },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});

export default ManageFacilities;
