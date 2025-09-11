import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Conditional import for Picker
let PickerComponent: any;
try {
  PickerComponent = require('@react-native-picker/picker').Picker;
} catch (error) {
  try {
    PickerComponent = require('react-native').Picker;
  } catch (e) {
    console.error('No Picker component available');
  }
}

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = "https://ismabasa123.loca.lt/api/auth";

  const handleSignUp = async () => {
    if (!fullName.trim()) return Alert.alert('Error', 'Please enter your full name');
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email');
    if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');

    try {
      const response = await axios.post(`${API_URL}/register`, {
        fullName,
        email,
        password,
        role,
      });

      Alert.alert("Success", response.data.message || "Account created!");
      router.push({
        pathname: '/verify-code',
        params: { 
          fullName: encodeURIComponent(fullName), 
          email: encodeURIComponent(email), 
          role 
        },
      });
 } catch (err: any) { 
   console.log("Registration error:", err.response?.data || err.message);
   Alert.alert("Error", err.response?.data?.message || "Registration failed"); }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#5a7f99' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, minHeight: '100%' }}
        showsVerticalScrollIndicator={true}
      >
        <View style={{ flexGrow: 1 }}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image 
                source={require('@/assets/images/tutguide1.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.logoTextContainer}>
              <ThemedText style={styles.logoTextMain}>TUTGuide</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.title}>
            Create your TUTGuide account to start navigating
          </ThemedText>

          {/* Inputs */}
          <ThemedText style={styles.inputLabel}>FULL NAME:</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#c0d9d9"
            value={fullName}
            onChangeText={setFullName}
          />

          <ThemedText style={styles.inputLabel}>EMAIL ADDRESS:</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#c0d9d9"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <ThemedText style={styles.inputLabel}>SIGN UP AS:</ThemedText>
          <View style={styles.pickerContainer}>
            {PickerComponent ? (
              <PickerComponent
                selectedValue={role}
                onValueChange={(value: any) => setRole(value)}
                style={styles.picker}
                dropdownIconColor="#2e4b6d"
              >
                <PickerComponent.Item label="User" value="user" />
                <PickerComponent.Item label="Admin" value="admin" />
              </PickerComponent>
            ) : (
              <TextInput
                style={styles.input}
                value={role}
                editable={false}
                placeholder="User (Picker not available)"
              />
            )}
          </View>

          <ThemedText style={styles.inputLabel}>PASSWORD:</ThemedText>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#c0d9d9"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={24}
                color="#2e4b6d"
              />
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.inputLabel}>CONFIRM PASSWORD:</ThemedText>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#c0d9d9"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye' : 'eye-off'}
                size={24}
                color="#2e4b6d"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              SIGN UP
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backText}>
              Already have an account?{' '}
              <ThemedText style={styles.signInLink}>SIGN IN</ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2e4b6d', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 3, borderColor: '#ffa500' },
  logoImage: { width: 50, height: 50 },
  logoTextContainer: { alignItems: 'flex-start' },
  logoTextMain: { fontSize: 28, fontWeight: 'bold', color: '#ffa500' },
  title: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 30, fontWeight: '500' },
  inputLabel: { fontSize: 16, marginBottom: 8, color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#9fc3c3', padding: 12, borderRadius: 8, marginBottom: 0, borderWidth: 1, borderColor: '#ffa500', color: '#2e4b6d', fontSize: 16 },
  pickerContainer: { backgroundColor: '#9fc3c3', borderRadius: 8, borderWidth: 1, borderColor: '#ffa500', marginBottom: 20, overflow: 'hidden' },
  picker: { color: '#2e4b6d', height: Platform.OS === 'ios' ? 150 : 50 },
  passwordContainer: { position: 'relative', marginBottom: 20 },
  eyeIcon: { position: 'absolute', right: 10, top: '35%' },
  button: { backgroundColor: '#ffa500', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  buttonText: { color: '#2e4b6d', fontWeight: 'bold', fontSize: 18 },
  backText: { color: '#fff', textAlign: 'center' },
  signInLink: { color: '#ffa500', fontWeight: 'bold', textDecorationLine: 'underline' },
});
