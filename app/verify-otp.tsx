import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons'; // 👈 for eye icon
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyOtp() {
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verified, setVerified] = useState(false);

  // 👁 state for toggling password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = "https://ismabasa123.loca.lt/api";

  const handleVerifyCode = async () => {
    if (!otp.trim()) return Alert.alert('Error', 'Please enter the OTP');

    try {
      const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      if (response.data.success) {
        Alert.alert('Success', 'OTP verified! You can now reset your password.');
        setVerified(true);
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      return Alert.alert('Error', 'Please fill in both password fields');
    }

    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        email,
        newPassword,
        confirmPassword,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Password reset successfully!');
        router.replace('/'); // go back to login
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#5a7f99' }}>
      <ThemedText style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' }}>
        Verify OTP
      </ThemedText>

      {!verified ? (
        <>
          <TextInput
            style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 16 }}
            placeholder="Enter OTP"
            placeholderTextColor="#aaa"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={{ backgroundColor: '#ffa500', padding: 15, borderRadius: 8, alignItems: 'center' }}
            onPress={handleVerifyCode}
          >
            <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              Verify OTP
            </ThemedText>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* New Password Input with Eye Icon */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginBottom: 15 }}>
            <TextInput
              style={{ flex: 1, padding: 12, fontSize: 16 }}
              placeholder="Enter new password"
              placeholderTextColor="#aaa"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none" // 👈 prevents auto uppercase
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={{ padding: 10 }}>
              <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input with Eye Icon */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginBottom: 20 }}>
            <TextInput
              style={{ flex: 1, padding: 12, fontSize: 16 }}
              placeholder="Confirm new password"
              placeholderTextColor="#aaa"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none" // 👈 prevents auto uppercase
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 10 }}>
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#555" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ backgroundColor: '#ffa500', padding: 15, borderRadius: 8, alignItems: 'center' }}
            onPress={handleResetPassword}
          >
            <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              Reset Password
            </ThemedText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
