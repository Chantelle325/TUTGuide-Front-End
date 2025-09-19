import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import API from './api'; // <- centralized Axios instance

export default function VerifyOtp() {
  const params = useLocalSearchParams<{ email: string }>();
  const email = params.email ? decodeURIComponent(params.email) : '';
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verified, setVerified] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ loading states
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleVerifyCode = async () => {
    if (!otp.trim()) return Alert.alert('Error', 'Please enter the OTP');

    try {
      setVerifying(true); // start loading
      const response = await API.post('/users/verify-otp', { email, otp });
      if (response.data.success) {
        Alert.alert('Success', 'OTP verified! You can now reset your password.');
        setVerified(true);
      }
    } catch (err: any) {
      console.log('OTP verification error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifying(false); // stop loading
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim())
      return Alert.alert('Error', 'Please fill in both password fields');

    try {
      setResetting(true); // start loading
      const response = await API.post('/users/reset-password', {
        email,
        newPassword,
        confirmPassword,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Password reset successfully!');
        router.replace('/'); // navigate back to login
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false); // stop loading
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#ddd' }}>
      <ThemedText style={{ fontSize: 22, fontWeight: 'bold', color: '#333333', marginBottom: 20, textAlign: 'center' }}>
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
            style={{ backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center', opacity: verifying ? 0.7 : 1 }}
            onPress={handleVerifyCode}
            disabled={verifying}
          >
            {verifying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Verify OTP</ThemedText>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* New Password */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginBottom: 15 }}>
            <TextInput
              style={{ flex: 1, padding: 12, fontSize: 16 }}
              placeholder="Enter new password"
              placeholderTextColor="#aaa"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={{ padding: 10 }}>
              <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginBottom: 20 }}>
            <TextInput
              style={{ flex: 1, padding: 12, fontSize: 16 }}
              placeholder="Confirm new password"
              placeholderTextColor="#aaa"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 10 }}>
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#555" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center', opacity: resetting ? 0.7 : 1 }}
            onPress={handleResetPassword}
            disabled={resetting}
          >
            {resetting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Reset Password</ThemedText>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
