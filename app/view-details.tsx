import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
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
        <ActivityIndicator size="large" color="#FFA500" />
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
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      {/* Custom Back Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inbox</Text>
      </View>

      {/* Inbox-style Message */}
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
               onPress={() => {
                const downloadUrl = `${API.defaults.baseURL}/feedback/download/${feedback.feedback_id}`;
                //const downloadUrl = `http://localhost:5000/attachments/download/${feedback.feedback_id}`;
                Linking.openURL(downloadUrl);
             }}
            >
               <Ionicons name="download-outline" size={18} color="#fff" />
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5A7F99" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5A7F99",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E4B6D",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFA500" },
  formCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    elevation: 2,
  },
  label: { fontSize: 16, fontWeight: "bold", color: "#2E4B6D", marginTop: 10 },
  value: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F3F6F9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  messageText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  attachment: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFA500",
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
    justifyContent: "center",
  },
  downloadText: { color: "#fff", fontWeight: "bold", marginLeft: 6 },
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