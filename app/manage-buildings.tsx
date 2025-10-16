import { Ionicons } from "@expo/vector-icons";
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
import { useTheme } from "./ThemeContext";
import API from "./api";

interface Building {
  building_id: string;
  buildingNo: string;
  building_Name: string;
  latitude?: string;
  longitude?: string;
}

const ManageBuildings = () => {
  const { darkMode } = useTheme();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    buildingNo: "",
    building_Name: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all buildings
  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await API.get("/buildings/get-All");

      if (response.data && Array.isArray(response.data.buildings)) {
        setBuildings(response.data.buildings);
        setFilteredBuildings(response.data.buildings);
      } else {
        console.log("Unexpected response format:", response.data);
        Alert.alert("Error", "Invalid response from server.");
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      Alert.alert("Error", "Failed to load building data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  // 🔍 Search Filter
  useEffect(() => {
    const filtered = buildings.filter(
      (b) =>
        b.building_Name.toLowerCase().includes(searchText.toLowerCase()) ||
        b.buildingNo.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredBuildings(filtered);
  }, [searchText, buildings]);

  const openAddModal = () => {
    setEditingBuilding(null);
    setFormData({ buildingNo: "", building_Name: "", latitude: "", longitude: "" });
    setModalVisible(true);
  };

  const openEditModal = (building: Building) => {
    setEditingBuilding(building);
    setFormData({
      buildingNo: building.buildingNo,
      building_Name: building.building_Name,
      latitude: building.latitude || "",
      longitude: building.longitude || "",
    });
    setModalVisible(true);
  };

  // ✅ Add or Update Building
  const handleSave = async () => {
    if (!formData.buildingNo || !formData.building_Name) {
      Alert.alert("Validation", "Building number and name are required.");
      return;
    }

    try {
      if (editingBuilding) {
        // 🟡 Update existing building
        const response = await API.put(`/buildings/update/${editingBuilding.building_id}`, formData);
        const updated = response.data?.building || {
          ...editingBuilding,
          ...formData,
        };

        setBuildings((prev) =>
          prev.map((b) => (b.building_id === editingBuilding.building_id ? updated : b))
        );
        setFilteredBuildings((prev) =>
          prev.map((b) => (b.building_id === editingBuilding.building_id ? updated : b))
        );

        Alert.alert("Success", "Building updated successfully!");
      } else {
        // 🟢 Add new building
        const response = await API.post("/buildings/add", formData);
        const newBuilding = response.data?.building || {
          building_id: Date.now().toString(),
          ...formData,
        };

        setBuildings((prev) => [...prev, newBuilding]);
        setFilteredBuildings((prev) => [...prev, newBuilding]);

        Alert.alert("Success", "Building added successfully!");
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Error saving building:", error);
      Alert.alert("Error", "Failed to save building. Please try again.");
    }
  };

  // ✅ Delete Building (instantly updates table + DB)
  const handleDelete = (id: string) => {
    Alert.alert("Confirm Delete", "Delete this building?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/buildings/delete/${id}`);

            setBuildings((prev) => prev.filter((b) => b.building_id !== id));
            setFilteredBuildings((prev) => prev.filter((b) => b.building_id !== id));

            Alert.alert("Deleted", "Building removed successfully!");
          } catch (error) {
            console.error("Delete error:", error);
            Alert.alert("Error", "Failed to delete building.");
          }
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

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 30 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={[styles.tableContainer, darkMode && styles.tableContainerDark]}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cellHeader, { width: 60 }]}>#</Text>
              <Text style={[styles.cellHeader, { width: 250 }]}>Building Name</Text>
              <Text style={[styles.cellHeader, { width: 150 }]}>Number</Text>
              <Text style={[styles.cellHeader, { width: 150 }]}>Latitude</Text>
              <Text style={[styles.cellHeader, { width: 150 }]}>Longitude</Text>
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
                  key={b.building_id}
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
                    {b.building_Name}
                  </Text>
                  <Text style={[styles.cell, { width: 150 }, darkMode && styles.textLight]}>
                    {b.buildingNo}
                  </Text>
                  <Text style={[styles.cell, { width: 150 }, darkMode && styles.textLight]}>
                    {b.latitude || "-"}
                  </Text>
                  <Text style={[styles.cell, { width: 150 }, darkMode && styles.textLight]}>
                    {b.longitude || "-"}
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
                    <TouchableOpacity onPress={() => handleDelete(b.building_id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.modalBoxDark]}>
            <Text style={[styles.modalTitle, darkMode && styles.textLight]}>
              {editingBuilding ? "Edit Building" : "Add Building"}
            </Text>

            <TextInput
              placeholder="Building Number"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.buildingNo}
              onChangeText={(text) => setFormData({ ...formData, buildingNo: text })}
            />
            <TextInput
              placeholder="Building Name"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.building_Name}
              onChangeText={(text) => setFormData({ ...formData, building_Name: text })}
            />
            <TextInput
              placeholder="Latitude"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.latitude}
              onChangeText={(text) => setFormData({ ...formData, latitude: text })}
            />
            <TextInput
              placeholder="Longitude"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.longitude}
              onChangeText={(text) => setFormData({ ...formData, longitude: text })}
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
  tableContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    minWidth: 800,
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
