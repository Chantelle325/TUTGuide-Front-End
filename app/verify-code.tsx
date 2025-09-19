import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import API from './api'; // <- use centralized Axios instance

export default function VerifyCodeScreen() {
  const { fullName, email, role } = useLocalSearchParams<{
    fullName: string;
    email: string;
    role: 'user' | 'admin';
  }>();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false); // ✅ new state

  const handleVerify = async () => {
    if (!code.trim()) return Alert.alert("Error", "Please enter the verification code");

    try {
      setLoading(true); // ✅ start loading
      const response = await API.post('/auth/register/verify', {
        email: decodeURIComponent(email),
        code: code.trim(),
      });

      Alert.alert("Success", response.data.message || "Account verified!");

      // Navigate to signup success screen
      router.replace({
        pathname: '/signup-success',
        params: {
          fullName,
          email,
          role,
        },
      });
    } catch (err: any) {
      console.log("Verification error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false); // ✅ stop loading always
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
        placeholderTextColor="#aaa"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
      />

      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={handleVerify}
        disabled={loading} // ✅ disable button while loading
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            VERIFY
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#ccc' },
  title: { fontSize: 18, color: '#333333', textAlign: 'center', marginBottom: 30 },
  input: { backgroundColor: '#ffff', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#fff', color: '#2e4b6d', fontSize: 16 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
