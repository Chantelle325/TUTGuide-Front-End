import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import API from './api';

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim()) return Alert.alert('Error', 'Please enter your full name');
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email');
    if (password.trim() !== confirmPassword.trim()) return Alert.alert('Error', 'Passwords do not match');
    if (password.trim().length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');

    try {
      const response = await API.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });

      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
      }

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
      Alert.alert("Error", err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#aaa' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* FULL-WIDTH HEADER */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image 
                source={require('@/assets/images/tutguide1.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <ThemedText style={styles.logoTextMain}>TUTGuide</ThemedText>
          </View>
        </View>

        {/* WHITE CONTENT AREA */}
        <View style={styles.contentContainer}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, minHeight: '100%' }}
            showsVerticalScrollIndicator={true}
          >
            <ThemedText style={styles.title}>Create your TUTGuide account</ThemedText>

            {/* FULL NAME */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Full Name:</Text>
              <TextInput
                style={[styles.inputField, styles.TopBorder]}
                placeholder="Enter your full name"
                placeholderTextColor="#555555"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* EMAIL */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Email Address:</Text>
              <TextInput
                style={[styles.inputField, styles.TopBorder]}
                placeholder="Enter your email"
                placeholderTextColor="#555555"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* SIGN UP AS */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Sign up as:</Text>
              {PickerComponent ? (
                <PickerComponent
                  selectedValue={role}
                  onValueChange={(value: any) => setRole(value)}
                  style={styles.picker}
                  dropdownIconColor="#000"
                >
                  <PickerComponent.Item label="User" value="user" />
                  <PickerComponent.Item label="Admin" value="admin" />
                </PickerComponent>
              ) : (
                <TextInput
                  style={[styles.inputField, styles.TopBorder]}
                  value={role}
                  editable={false}
                  placeholder="User (Picker not available)"
                />
              )}
            </View>

            {/* PASSWORD */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Password:</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.inputField, styles.TopBorder]}
                  placeholder="Enter your password"
                  placeholderTextColor="#555555"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Confirm Password:</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.inputField, styles.TopBorder]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#555555"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* SIGN UP BUTTON */}
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                SIGN UP
              </ThemedText>
            </TouchableOpacity>

            {/* Already have an account */}
            <View style={styles.bottomTextContainer}>
              <Text style={styles.bottomText}>
                Already have an account?{' '}
                <Text 
                  style={styles.signInText} 
                  onPress={() => router.push('/')}
                >
                  Sign In
                </Text>
              </Text>
            </View>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#aaa',
    width: '100%',
    alignSelf: 'stretch',
    paddingTop: Platform.OS === 'ios' ? 60 : 60,
    paddingBottom: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  TopBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 6,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoImage: { width: 40, height: 40 },
  logoTextMain: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 50,
    overflow: 'hidden',
  },
  title: { fontSize: 18, color: '#000', textAlign: 'center', marginBottom: 30, fontWeight: '500', marginTop: 30 ,fontFamily:'Montserrat'},
  inputBlock: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputLabel: { fontSize: 16, marginBottom: 8, color: '#000' },
  inputField: { 
    flex: 1, 
    fontSize: 16, 
    color: "#000", 
    paddingVertical: 8,
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  picker: { color: '#000', height: Platform.OS === 'ios' ? 150 : 50 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  bottomTextContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  bottomText: {
    fontSize: 14,
    color: '#555',
  },
  signInText: {
    color: '#000',
    fontWeight: 'bold',
  },
});