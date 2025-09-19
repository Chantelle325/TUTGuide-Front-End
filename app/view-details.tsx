import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import API from "./api";

export default function FeedbackDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          router.replace("/");
          return;
        }

        if (!id) {
          Alert.alert("Error", "No feedback ID provided");
          setLoading(false);
          return;
        }

        const response = await API.get(`/feedback/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFeedback(response.data);
      } catch (err: any) {
        console.error(err.response?.data || err.message);
        if (err.response?.status === 403) {
          Alert.alert("Unauthorized", "You are not allowed to view this feedback.");
        } else {
          Alert.alert("Error", "Failed to load feedback details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id, router]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#ff8c00" />
      </View>
    );
  }

  if (!feedback) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Feedback not found</Text>
      </View>
    );
  }

  return (
    <>
      {/* Remove Expo Router Header */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Custom Back Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feedback Details</Text>
        </View>

        {/* Card Content */}
        <View style={styles.formCard}>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.value}>{feedback.email}</Text>

          <Text style={styles.label}>Message:</Text>
          <Text style={styles.messageText}>{feedback.feedback_message}</Text>

          {feedback.attachment && (
            <>
              <Text style={styles.label}>Attachment:</Text>
              <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                <Image
                  source={{ uri: feedback.attachment }}
                  style={styles.attachment}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={async () => {
                  try {
                    const downloadUrl = `${API.defaults.baseURL}/feedback/download/${feedback.feedback_id}`;

                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status !== "granted") {
                      Alert.alert("Permission denied", "Cannot save file without permission");
                      return;
                    }

                    const fileUri = FileSystem.documentDirectory + feedback.attachment_name;
                    const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);

                    const asset = await MediaLibrary.createAssetAsync(uri);
                    const album = await MediaLibrary.getAlbumAsync("Download");
                    if (album == null) {
                      await MediaLibrary.createAlbumAsync("Download", asset, false);
                    } else {
                      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                    }

                    Alert.alert("Downloaded", `Saved to Downloads folder: ${feedback.attachment_name}`);
                    console.log("File saved at:", uri);
                  } catch (error) {
                    console.error("Download failed:", error);
                    Alert.alert("Error", "Could not download attachment");
                  }
                }}
              >
                <Ionicons name="download-outline" size={18} color="#333" />
                <Text style={styles.downloadText}>Download Attachment</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Fullscreen Image Modal */}
        <Modal visible={imageModalVisible} transparent={true}>
          <View style={styles.modalBackground}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: feedback.attachment }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7fb" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f7fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f7fb",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
    marginTop:30,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginTop:30,
  },
  formCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: { fontSize: 16, fontWeight: "bold", color: "#333", marginTop: 10 },
  value: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F3F6F9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  messageText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },
  attachment: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#bbb",
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  downloadText: { color: "#333", fontWeight: "bold", marginLeft: 6 },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
});
