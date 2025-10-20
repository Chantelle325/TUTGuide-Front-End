import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "./ThemeContext";
import API from "./api";

interface Building {
  buildingNo: string;
  building_Name: string;
}

const TotalBuildingsScreen = () => {
  const { darkMode } = useTheme();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await API.get("/dashboard/all-buildings");
        setBuildings(response.data.buidlings || []); // backend still returns `buidlings`
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.response?.data?.error || "Failed to fetch buildings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          darkMode && styles.containerDark,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={darkMode ? "#fff" : "#000"} />
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={darkMode ? "#fff" : "#333"}
          />
        </TouchableOpacity>
        <Text style={[styles.title, darkMode && styles.textLight]}>
          Total Buildings
        </Text>
      </View>

      {/* Vertical Scroll */}
      <ScrollView style={{ flex: 1, marginTop: 10 }}>
        {/* Horizontal Scroll */}
        <ScrollView horizontal>
          <View style={{ minWidth: 450, marginTop: 10 }}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cellHeader, { width: 150 }]}>
                Building No
              </Text>
              <Text style={[styles.cellHeader, { width: 250 }]}>
                Building Name
              </Text>
            </View>

            {/* Table Rows */}
            <FlatList
              data={buildings}
              keyExtractor={(item, index) => `${item.buildingNo}-${index}`}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  ]}
                >
                  <Text
                    style={[styles.cell, { width: 150 }, darkMode && styles.textLight]}
                  >
                    {item.buildingNo ?? "-"}
                  </Text>
                  <Text
                    style={[styles.cell, { width: 250 }, darkMode && styles.textLight]}
                  >
                    {item.building_Name ?? "-"}
                  </Text>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 70, backgroundColor: "#f5f5f5" },
  containerDark: { backgroundColor: "#121212" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backButton: { marginRight: 10 },
  title: { fontSize: 22, fontWeight: "700", color: "#333" },
  textLight: { color: "#fff" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  tableHeader: { backgroundColor: "#000" },
  cellHeader: {
    color: "#fff",
    fontWeight: "700",
    padding: 10,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#333",
  },
  cell: {
    fontSize: 14,
    color: "#000",
    padding: 10,
    textAlign: "center",
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  rowEven: { backgroundColor: "#f9f9f9" },
  rowOdd: { backgroundColor: "#fff" },
});

export default TotalBuildingsScreen;
