import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
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

interface Facility {
  facility_ID?: string;
  facility_Name: string;
  category: string;
  buildingNo?: string;
  latitude?: string;
  longitude?: string;
}

interface Building {
  building_id: string;
  buildingNo: string;
  building_Name: string;
  latitude: string;
  longitude: string;
}

const ManageFacilities = () => {
  const { darkMode } = useTheme();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState({
    facility_Name: "",
    category: "",
    buildingNo: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);

  // ✅ Fetch facilities
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await API.get("/buildings/get-facilities");

      if (response.data && Array.isArray(response.data)) {
        setFacilities(response.data);
        setFilteredFacilities(response.data);
      } else if (response.data?.facilities) {
        setFacilities(response.data.facilities);
        setFilteredFacilities(response.data.facilities);
      } else {
        Alert.alert("Error", "Invalid response format from server.");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch facilities.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch buildings for dropdown
  const fetchBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const response = await API.get("/buildings/get-All");
      if (response.data?.buildings) {
        setBuildings(response.data.buildings);
      } else if (Array.isArray(response.data)) {
        setBuildings(response.data);
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      Alert.alert("Error", "Failed to load building numbers.");
    } finally {
      setLoadingBuildings(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    fetchBuildings();
  }, []);

  // 🔍 Filter facilities
  useEffect(() => {
    const filtered = facilities.filter(
      (f) =>
        f.facility_Name?.toLowerCase().includes(searchText.toLowerCase()) ||
        f.category?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredFacilities(filtered);
  }, [searchText, facilities]);

  const openAddModal = () => {
    setEditingFacility(null);
    setFormData({
      facility_Name: "",
      category: "",
      buildingNo: "",
      latitude: "",
      longitude: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      facility_Name: facility.facility_Name,
      category: facility.category,
      buildingNo: facility.buildingNo || "",
      latitude: facility.latitude || "",
      longitude: facility.longitude || "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.facility_Name || !formData.category || !formData.buildingNo) {
      Alert.alert("Validation", "All fields are required.");
      return;
    }

    try {
      setLoading(true);

      if (editingFacility) {
        await API.put(
          `buildings/updateFacility/${editingFacility.facility_ID}`,formData);
        Alert.alert("Success", "Facility updated successfully.");
      } else {
        await API.post("buildings/add-facilities", formData);
        Alert.alert("Success", "Facility added successfully.");
      }

      setModalVisible(false);
      fetchFacilities();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Failed to save facility.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id?: string) => {
    if (!id) {
      Alert.alert("Error", "Facility ID not found.");
      return;
    }

    Alert.alert("Confirm Delete", "Delete this facility?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await API.delete(`buildings/deleteFacility/${id}`);
            Alert.alert("Deleted", "Facility removed.");
            fetchFacilities();
          } catch (error: any) {
            console.error(error);
            Alert.alert("Error", "Failed to delete facility.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // ✅ Handle building selection
  const handleBuildingSelect = (buildingNo: string) => {
    const selected = buildings.find((b) => b.buildingNo === buildingNo);
    setFormData({
      ...formData,
      buildingNo,
     
    });
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Header */}
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

      {/* Search Bar */}
      <View style={[styles.searchBar, darkMode && styles.searchBarDark]}>
        <Ionicons name="search-outline" size={20} color={darkMode ? "#aaa" : "#555"} />
        <TextInput
          placeholder="Search by facility name or category..."
          placeholderTextColor={darkMode ? "#888" : "#777"}
          style={[styles.searchInput, darkMode && styles.searchInputDark]}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Table */}
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={[styles.tableContainer, darkMode && styles.tableContainerDark]}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cellHeader, { width: 60 }]}>#</Text>
              <Text style={[styles.cellHeader, { width: 200 }]}>Facility Name</Text>
              <Text style={[styles.cellHeader, { width: 150 }]}>Category</Text>
              <Text style={[styles.cellHeader, { width: 100 }]}>Building No</Text>
              <Text style={[styles.cellHeader, { width: 120 }]}>Latitude</Text>
              <Text style={[styles.cellHeader, { width: 120 }]}>Longitude</Text>
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
              filteredFacilities.map((f, index) => {
                const key = f.facility_ID || f.facility_Name || `facility-${index}`;
                return (
                  <View
                    key={key}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                      darkMode && styles.tableRowDark,
                    ]}
                  >
                    <Text style={[styles.cell, { width: 60 }, darkMode && styles.textLight]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.cell, { width: 200 }, darkMode && styles.textLight]}>
                      {f.facility_Name}
                    </Text>
                    <Text style={[styles.cell, { width: 150 }, darkMode && styles.textLight]}>
                      {f.category}
                    </Text>
                    <Text style={[styles.cell, { width: 100 }, darkMode && styles.textLight]}>
                      {f.buildingNo}
                    </Text>
                    <Text style={[styles.cell, { width: 120 }, darkMode && styles.textLight]}>
                      {f.latitude}
                    </Text>
                    <Text style={[styles.cell, { width: 120 }, darkMode && styles.textLight]}>
                      {f.longitude}
                    </Text>
                    <View
                      style={[
                        styles.cell,
                        { width: 150, flexDirection: "row", justifyContent: "center" },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => openEditModal(f)}
                        style={styles.actionBtn}
                      >
                        <Ionicons name="create-outline" size={20} color="#2196F3" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(f.facility_ID)}
                        style={styles.actionBtn}
                      >
                        <Ionicons name="trash-outline" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.modalBoxDark]}>
            <Text style={[styles.modalTitle, darkMode && styles.textLight]}>
              {editingFacility ? "Edit Facility" : "Add Facility"}
            </Text>

            {/* Facility Name */}
            <TextInput
              placeholder="Facility Name"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.facility_Name}
              onChangeText={(text) =>
                setFormData({ ...formData, facility_Name: text })
              }
            />

            {/* Category */}
            <TextInput
              placeholder="Category"
              placeholderTextColor={darkMode ? "#aaa" : "#666"}
              style={[styles.input, darkMode && styles.inputDark]}
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />

           {/* Building Dropdown */}
<View
  style={[
    styles.dropdownContainer,
    darkMode && styles.inputDark,
    { maxHeight: 150 }, // limit height for scroll
  ]}
>
  {loadingBuildings ? (
    <ActivityIndicator size="small" color={darkMode ? "#fff" : "#000"} />
  ) : (
    <ScrollView nestedScrollEnabled>
      <Picker
        selectedValue={formData.buildingNo}
        onValueChange={handleBuildingSelect}
        style={[styles.dropdown, darkMode && styles.dropdownDark]}
        dropdownIconColor={darkMode ? "#fff" : "#000"}
      >
        <Picker.Item label="Select Building No" value="" />
        {buildings.map((b) => (
          <Picker.Item
            key={b.building_id}
            label={b.buildingNo}
            value={b.buildingNo}
          />
        ))}
      </Picker>
    </ScrollView>
  )}
</View>


            {/* Latitude & Longitude */}
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

            {/* Buttons */}
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
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10, paddingTop: 70 },
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
    minWidth: 850,
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
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  dropdown: { height: 50, color: "#000" },
  dropdownDark: { backgroundColor: "#333", color: "#fff" },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});

export default ManageFacilities;
