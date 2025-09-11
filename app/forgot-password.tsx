import { ThemedText } from '@/components/ThemedText';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const API_URL = "https://ismabasa123.loca.lt/api";

  const handleRequestCode = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email');

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      if (response.data.success) {
        Alert.alert('Success', `OTP sent to ${email}`);
        // 👉 Go to verify screen and pass email as param
        router.push({
          pathname: '/verify-otp',
          params: { email },
        });
      }
   } catch (err: any) {
  console.log('OTP error:', err.response?.data || err.message);
  Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
}

  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#5a7f99' }}>
      <ThemedText style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' }}>
        Forgot Password
      </ThemedText>

      <TextInput
        style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 16 }}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={{ backgroundColor: '#ffa500', padding: 15, borderRadius: 8, alignItems: 'center' }}
        onPress={handleRequestCode}
      >
        <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          Send OTP
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}
