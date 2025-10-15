import { Ionicons } from "@expo/vector-icons";
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

interface Building {
  id: string;
  name: string;
  number: string;
}

const ManageBuildings = () => {
  const { darkMode } = useTheme();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({ name: "", number: "" });

  useEffect(() => {
    const dummy = [
      { id: "1", name: "Administration Block", number: "B01" },
      { id: "2", name: "Engineering Hall", number: "B12" },
      { id: "3", name: "Library Complex", number: "B08" },
      { id: "4", name: "Science Wing", number: "B15" },
    ];
    setBuildings(dummy);
    setFilteredBuildings(dummy);
  }, []);

  // 🔍 Search Filter
  useEffect(() => {
    const filtered = buildings.filter(
      (b) =>
        b.name.toLowerCase().includes(searchText.toLowerCase()) ||
        b.number.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredBuildings(filtered);
  }, [searchText, buildings]);

  const openAddModal = () => {
    setEditingBuilding(null);
    setFormData({ name: "", number: "" });
    setModalVisible(true);
  };

  const openEditModal = (building: Building) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      number: building.number,
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.number) {
      Alert.alert("Validation", "Building name and number are required.");
      return;
    }

    if (editingBuilding) {
      setBuildings((prev) =>
        prev.map((b) =>
          b.id === editingBuilding.id ? { ...b, ...formData } : b
        )
      );
    } else {
      const newBuilding = {
        id: Date.now().toString(),
        ...formData,
      };
      setBuildings((prev) => [...prev, newBuilding]);
    }

    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Confirm Delete", "Delete this building?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setBuildings((prev) => prev.filter((b) => b.id !== id));
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, darkMode && styles.textLight]}>Manage Buildings</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add-circle-outline" size={30} color={darkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
      </View>

      {/* 🔍 Search Bar */}
      <View style={[styles.searchBar, darkMode && styles.searchBarDark]}>
        <Ionicons name="search-outline" size={20} color={darkMode ? "#aaa" : "#555"} />
        <TextInput
          placeholder="Search by building name or number..."
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
            <Text style={[styles.cellHeader, { width: 250 }]}>Building Name</Text>
            <Text style={[styles.cellHeader, { width: 150 }]}>Number</Text>
            <Text style={[styles.cellHeader, { width: 150 }]}>Actions</Text>
          </View>

          {/* Data Rows */}
          {filteredBuildings.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={[styles.text, darkMode && styles.textLight]}>No buildings found.</Text>
            </View>
          ) : (
            filteredBuildings.map((b, index) => (
              <View
                key={b.id}
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
                  {b.name}
                </Text>
                <Text style={[styles.cell, { width: 150 }, darkMode && styles.textLight]}>
                  {b.number}
                </Text>
                <View
                  style={[
                    styles.cell,
                    { width: 150, flexDirection: "row", justifyContent: "center" },
                  ]}
                >
                  <TouchableOpacity onPress={() => openEditModal(b)} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={20} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(b.id)} style={styles.actionBtn}>
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
              {editingBuilding ? "Edit Building" : "Add Building"}
            </Text>

            <TextInput
              placeholder="Building Name"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              placeholder="Building Number"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.number}
              onChangeText={(text) => setFormData({ ...formData, number: text })}
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
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
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

export default ManageBuildings;
