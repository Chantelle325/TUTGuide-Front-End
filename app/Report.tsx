// app/ReportScreen.tsx
import Footer from '@/app/Footer';
import { ThemedText } from '@/components/ThemedText';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import API from './api';

export default function ReportScreen() {
  const [report, setReport] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [attachment, setAttachment] = useState<string | null>(null);
  const router = useRouter();

  const MAX_LENGTH = 250;

  useEffect(() => {
    AsyncStorage.getItem('userToken').then((storedToken) => {
      if (!storedToken) {
        router.replace('/');
      } else {
        setToken(storedToken);
      }
      setLoading(false);
    });
  }, []);

  const pickFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        setAttachment(result.assets[0].uri);
      }
    } catch (error) {
      console.error('File pick error:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleSubmit = async () => {
    if (!report.trim() && !attachment) {
      Alert.alert('Error', 'Please write a report or attach a file.');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'No authorization token found.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('feedback_message', report);

      if (attachment) {
        formData.append('attachment', {
          uri: attachment,
          name: 'report_image.jpg', // you can extract filename from URI if needed
          type: 'image/jpeg',
        } as any);
      }

      const response = await API.post('/feedback/reports', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Your report has been sent to the admin.');
        setReport('');
        setAttachment(null);
        router.back();
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to send report');
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.wrapper}>
          {/* HEADER */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Report an Issue</ThemedText>
          </View>

          {/* SCROLLABLE CONTENT */}
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the issue or feedback..."
                placeholderTextColor="#555"
                value={report}
                onChangeText={(text) => setReport(text.slice(0, MAX_LENGTH))}
                multiline
              />
              <Text style={styles.charCount}>{MAX_LENGTH - report.length}</Text>

              <TouchableOpacity onPress={pickFile} style={styles.iconWrapper}>
                <Feather name="paperclip" size={22} color="#000" />
              </TouchableOpacity>
            </View>

            {attachment && <Image source={{ uri: attachment }} style={styles.preview} />}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={!token}>
              <ThemedText style={styles.submitText}>Submit Report</ThemedText>
            </TouchableOpacity>
          </ScrollView>

          {/* FIXED FOOTER */}
          <Footer />
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: 'white' },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  textArea: {
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top',
    paddingRight: 40,
  },
  charCount: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    fontSize: 12,
    color: '#555',
  },
  iconWrapper: {
    position: 'absolute',
    right: 10,
    bottom: 5,
  },
  preview: {
    marginTop: 10,
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  submitButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#000',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
