import { ThemedText } from '@/components/ThemedText';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ReportScreen() {
  const [report, setReport] = useState('');
  const router = useRouter();

  // Replace with your backend base URL
  const API_URL = "https://ismabasa123.loca.lt/api/auth";

  const handleSubmit = async () => {
    if (!report.trim()) {
      Alert.alert("Error", "Please write your report before submitting.");
      return;
    }

    try {
      // Send to backend
      const response = await axios.post(`${API_URL}/reports`, {
        userId: "12345", // replace with logged-in user's ID (from auth)
        title: "User Report",
        description: report,
      });

      if (response.data.success) {
        Alert.alert("Success", "Your report has been sent to the admin.");
        setReport('');
        router.back(); // go back to Dashboard after submit
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to send report");
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Write a Report</ThemedText>
      
      <TextInput
        style={styles.textArea}
        placeholder="Describe the issue or feedback..."
        placeholderTextColor="#9fc3c3"
        value={report}
        onChangeText={setReport}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: 'rgba(90, 127, 153, 0.9)',padding: 20,justifyContent: 'flex-start',paddingTop: 80,},
  title: {fontSize: 22,fontWeight: 'bold',color: '#ffa500',marginBottom: 20,textAlign: 'center',},
  textArea: {height: 200,backgroundColor: 'rgba(159, 195, 195, 0.7)',borderRadius: 15,borderWidth: 2,borderColor: '#ffa500',padding: 15,fontSize: 16,color: '#2e4b6d',textAlignVertical: 'top',},
  submitButton: {marginTop: 20,padding: 15,backgroundColor: '#ffa500',borderRadius: 25,alignItems: 'center',},
  submitText: {fontSize: 16,fontWeight: 'bold',color: '#2e4b6d',},
});
