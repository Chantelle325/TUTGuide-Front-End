import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "./ThemeContext";
import API from "./api";

interface Facility {
  facility_Name: string;
  category: string;
  latitude: string;
  longitude: string;
  buidlingNo: string;
}

const TotalFacilitiesScreen = () => {
  const { darkMode } = useTheme();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await API.get("/dashboard/all-facilities");
        setFacilities(response.data.facilities || []);
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.response?.data?.error || "Failed to fetch facilities"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
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
          Total Facilities
        </Text>
      </View>

     

      <FlatList
        data={facilities}
        keyExtractor={(item, index) => `${item.facility_Name}-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={[styles.text, darkMode && styles.textLight]}>
              {index + 1}. {item.facility_Name} ({item.category})
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 70, backgroundColor: "#f5f5f5" },
  containerDark: { backgroundColor: "#121212" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backButton: { marginRight: 10 },
  title: { fontSize: 22, fontWeight: "700", color: "#333" },
  subTitle: { fontSize: 16, marginBottom: 20, color: "#333" },
  text: { fontSize: 16, color: "#000" },
  textLight: { color: "#fff" },
  row: { marginBottom: 10 },
});

export default TotalFacilitiesScreen;
