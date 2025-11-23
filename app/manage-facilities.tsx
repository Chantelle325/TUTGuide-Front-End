import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  floor?: string;
  description?: string;
  contact?: string;
  hours?: string;
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
    floor: "",
    description: "",
    contact: "",
    hours: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);

  useEffect(() => {
    fetchFacilities();
    fetchBuildings();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await API.get("/buildings/get-facilities");

      if (response.data?.facilities) {
        setFacilities(response.data.facilities);
        setFilteredFacilities(response.data.facilities);
      } else if (Array.isArray(response.data)) {
        setFacilities(response.data);
        setFilteredFacilities(response.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch facilities.");
    } finally {
      setLoading(false);
    }
  };

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
      console.error(error);
      Alert.alert("Error", "Failed to load building numbers.");
    } finally {
      setLoadingBuildings(false);
    }
  };

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
      floor: "",
      description: "",
      contact: "",
      hours: "",
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
      floor: facility.floor || "",
      description: facility.description || "",
      contact: facility.contact || "",
      hours: facility.hours || "",
      latitude: facility.latitude || "",
      longitude: facility.longitude || "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.facility_Name || !formData.category || !formData.buildingNo) {
      Alert.alert(
        "Validation",
        "Facility Name, Category, and Building No are required."
      );
      return;
    }

    try {
      setLoading(true);
      if (editingFacility) {
        await API.put(
          `buildings/updateFacility/${editingFacility.facility_ID}`,
          formData
        );

        Alert.alert("Success", "Facility updated successfully.");
      } else {
        const admin_email = await AsyncStorage.getItem("admin_email"); // match backend

        const payload = {
          ...formData,
          performedByAdmin: admin_email || "",
        };

        await API.post("buildings/add-facilities", payload);

        Alert.alert("Success", "Facility added successfully.");
      }
      setModalVisible(false);
      fetchFacilities();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save facility.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id?: string) => {
    if (!id) return Alert.alert("Error", "Facility ID not found.");

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
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to delete facility.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleBuildingSelect = (buildingNo: string) => {
    setFormData({ ...formData, buildingNo });
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={28}
            color={darkMode ? "#fff" : "#000"}
          />
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

      {/* Search */}
      <View style={[styles.searchBar, darkMode && styles.searchBarDark]}>
        <Ionicons
          name="search-outline"
          size={20}
          color={darkMode ? "#aaa" : "#555"}
        />
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
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ marginTop: 20 }}
        />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View
            style={[
              styles.tableContainer,
              darkMode && styles.tableContainerDark,
            ]}
          >
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cellHeader, { width: 60 }]}>#</Text>
              <Text style={[styles.cellHeader, { width: 200 }]}>
                Facility Name
              </Text>
              <Text style={[styles.cellHeader, { width: 150 }]}>Category</Text>
              <Text style={[styles.cellHeader, { width: 100 }]}>
                Building No
              </Text>
              <Text style={[styles.cellHeader, { width: 80 }]}>Floor</Text>
              <Text style={[styles.cellHeader, { width: 200 }]}>
                Description
              </Text>
              <Text style={[styles.cellHeader, { width: 120 }]}>Contact</Text>
              <Text style={[styles.cellHeader, { width: 120 }]}>Hours</Text>
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
              filteredFacilities.map((f, index) => (
                <View
                  key={f.facility_ID || `facility-${index}`}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                    darkMode && styles.tableRowDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.cell,
                      { width: 60 },
                      darkMode && styles.textLight,
                    ]}
                  >
                    {index + 1}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: 200 },
                      darkMode && styles.textLight,
                    ]}
                  >
                    {f.facility_Name}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: 150 },
                      darkMode && styles.textLight,
                    ]}
                  >
                    {f.category}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: 100 },
                      darkMode && styles.textLight,
                    ]}
                  >
                    {f.buildingNo}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: 80 },
                      darkMode && styles.textLight,
                    ]}
                  >
                    {f.floor}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: 200 },
                      darkMode && styles.textLight,
                    ]}
                  >
                    {f.description}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: 120 },
                      darkMode && styles.textLight,
                    ]}
                  >
                    {f.contact}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: 120 },
                      darkMode && styles.textLight,
                    ]}
                  >
                    {f.hours}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: 120 },
                      darkMode && styles.textLight,
                    ]}
                  >
                    {f.latitude}
                  </Text>
                  <Text
                    style={[
                      styles.cell,
                      { width: 120 },
                      darkMode && styles.textLight,
                    ]}
                  >
                    {f.longitude}
                  </Text>
                  <View
                    style={[
                      styles.cell,
                      {
                        width: 150,
                        flexDirection: "row",
                        justifyContent: "center",
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => openEditModal(f)}
                      style={styles.actionBtn}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#2196F3"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(f.facility_ID)}
                      style={styles.actionBtn}
                    >
                      <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={[styles.modalBox, darkMode && styles.modalBoxDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textLight]}>
                {editingFacility ? "Edit Facility" : "Add Facility"}
              </Text>

              <TextInput
                placeholder="Facility Name"
                placeholderTextColor={darkMode ? "#aaa" : "#666"}
                style={[styles.input, darkMode && styles.inputDark]}
                value={formData.facility_Name}
                onChangeText={(t) =>
                  setFormData({ ...formData, facility_Name: t })
                }
              />
              <TextInput
                placeholder="Category"
                placeholderTextColor={darkMode ? "#aaa" : "#666"}
                style={[styles.input, darkMode && styles.inputDark]}
                value={formData.category}
                onChangeText={(t) => setFormData({ ...formData, category: t })}
              />

              {/* Building Dropdown */}
              <View
                style={[styles.dropdownContainer, darkMode && styles.inputDark]}
              >
                {loadingBuildings ? (
                  <ActivityIndicator
                    size="small"
                    color={darkMode ? "#fff" : "#000"}
                  />
                ) : (
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
                )}
              </View>

              <TextInput
                placeholder="Floor"
                placeholderTextColor={darkMode ? "#aaa" : "#666"}
                style={[styles.input, darkMode && styles.inputDark]}
                value={formData.floor}
                onChangeText={(t) => setFormData({ ...formData, floor: t })}
              />
              <TextInput
                placeholder="Description"
                placeholderTextColor={darkMode ? "#aaa" : "#666"}
                style={[styles.input, darkMode && styles.inputDark]}
                multiline
                numberOfLines={3}
                value={formData.description}
                onChangeText={(t) =>
                  setFormData({ ...formData, description: t })
                }
              />
              <TextInput
                placeholder="Contact"
                placeholderTextColor={darkMode ? "#aaa" : "#666"}
                style={[styles.input, darkMode && styles.inputDark]}
                value={formData.contact}
                onChangeText={(t) => setFormData({ ...formData, contact: t })}
              />
              <TextInput
                placeholder="Hours"
                placeholderTextColor={darkMode ? "#aaa" : "#666"}
                style={[styles.input, darkMode && styles.inputDark]}
                value={formData.hours}
                onChangeText={(t) => setFormData({ ...formData, hours: t })}
              />
              <TextInput
                placeholder="Latitude"
                placeholderTextColor={darkMode ? "#aaa" : "#666"}
                style={[styles.input, darkMode && styles.inputDark]}
                value={formData.latitude}
                onChangeText={(t) => setFormData({ ...formData, latitude: t })}
              />
              <TextInput
                placeholder="Longitude"
                placeholderTextColor={darkMode ? "#aaa" : "#666"}
                style={[styles.input, darkMode && styles.inputDark]}
                value={formData.longitude}
                onChangeText={(t) => setFormData({ ...formData, longitude: t })}
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
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
    paddingTop: 70,
  },
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
    minWidth: 1250,
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
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "85%",
  },
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});

export default ManageFacilities;
