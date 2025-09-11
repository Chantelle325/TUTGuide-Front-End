import { ThemedText } from '@/components/ThemedText';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyCodeScreen() {
  const { fullName, email, role } = useLocalSearchParams<{
    fullName: string;
    email: string;
    role: 'user' | 'admin';
  }>();
  const router = useRouter();
  const [code, setCode] = useState('');

  const API_URL = "https://ismabasa123.loca.lt/api/auth";

  const handleVerify = async () => {
    if (!code.trim()) return Alert.alert("Error", "Please enter the verification code");

    try {
      const response = await axios.post(`${API_URL}/register/verify`, {
        email: decodeURIComponent(email),
        code,
      });

      Alert.alert("Success", response.data.message || "Account verified!");

      // Pass all params to SignUpSuccessScreen
      router.replace({
        pathname: '/signup-success',
        params: {
          fullName: fullName,
          email: email,
          role: role,
        },
      });
    } catch (err: any) {
    console.log("Verification error:", err.response?.data || err.message);
    Alert.alert("Error", err.response?.data?.message || "Verification failed");
}

  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>
        Enter the code sent to {decodeURIComponent(email)}
      </ThemedText>
      
      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        placeholderTextColor="#c0d9d9"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>VERIFY</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#5a7f99' },
  title: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#9fc3c3', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#ffa500', color: '#2e4b6d', fontSize: 16 },
  button: { backgroundColor: '#ffa500', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#2e4b6d', fontWeight: 'bold', fontSize: 18 },
});
