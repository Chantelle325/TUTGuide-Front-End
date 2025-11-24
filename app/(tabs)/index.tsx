import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import API from '../api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Request notification permission and get FCM token
  const requestFCMToken = async (): Promise<string | null> => {
    let hasPermission = false;

    try {
      if (Platform.OS === 'ios' || (Platform.OS === 'android' && Platform.Version < 33)) {
        const authStatus = await messaging().requestPermission();
        hasPermission =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      }

      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        hasPermission = result === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (!hasPermission) {
        console.log('Notifications permission denied');
        return null;
      }

      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (err) {
      console.error('Failed to get FCM token:', err);
      return null;
    }
  };

  const handleSignIn = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email');
    if (!password) return Alert.alert('Error', 'Please enter your password');

    try {
      setLoading(true);

      const response = await API.post(`/auth/login`, { email: email.trim(), password });
      const { user, token } = response.data;

      if (!user || !user.role || !token) {
        Alert.alert('Error', 'Invalid credentials or token missing');
        setLoading(false);
        return;
      }

      // Save basic user info
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userRole', user.role);
      await AsyncStorage.setItem('userName', user.fullName || user.email.split('@')[0]);
      await AsyncStorage.setItem('admin_email', user.email);

      // If admin, request notification permission and register FCM token
      if (user.role === 'admin') {
        const fcmToken = await requestFCMToken();
        if (fcmToken) {
          await API.post('/notifications/token', {
            admin_email: user.email,
            fcmToken,
            allowNotifications: true, // toggle ON automatically
          });
        }

        router.replace('/admin');
      } else {
        router.replace('/signin');
      }

    } catch (err: any) {
      console.log('Login error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#2b2a2aff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require('@/assets/images/tutguide3.png')}
                style={styles.logoImage}
                resizeMode="contain"
              /> 
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, minHeight: '100%' }}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={styles.title}>Navigate Life's path with TUTGuide</ThemedText>

            {/* FORM CONTAINER */}
            <View style={styles.formContainer}>
              {/* EMAIL */}
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter your email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* PASSWORD */}
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

               {/* FORGOT PASSWORD */}
              <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <ThemedText style={styles.linkText}>Forgot Password?</ThemedText>
              </TouchableOpacity>

              {/* LOGIN BUTTON */}
              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                    LOGIN
                  </ThemedText>
                )}
              </TouchableOpacity>

              {/* SIGN UP LINK */}
              <View style={styles.bottomTextContainer}>
                <Text style={styles.bottomText}>Don't have an account?</Text>

                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={styles.signUpText}>Sign Up</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2b2a2aff',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 90,
    paddingBottom: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  logoImage: { width: 80, height: 80, borderRadius: 40, resizeMode: 'cover' },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 60,
    overflow: 'hidden',
    marginTop: -20,
  },
  title: { fontSize: 18, color: '#000', textAlign: 'center', marginBottom: 30, fontWeight: '500', marginTop: 40 },
  formContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 15, padding: 20, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  inputBlock: { marginBottom: 20 },
  label: { fontSize: 14, color: '#333', fontWeight: '600', marginBottom: 6 },
  inputField: { fontSize: 16, color: '#000', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingHorizontal: 10 },
  passwordInput: { flex: 1, fontSize: 16, color: "#000", paddingVertical: 12, paddingHorizontal: 4 },
  linkText: {
    color: '#000',
    marginBottom: 20,
    textAlign: 'right',
    fontWeight: '500'
  },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 25 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
   bottomTextContainer: { alignItems: 'center', marginTop: 10 },
  bottomText: { fontSize: 14, color: '#555' },
  signUpText: { color: '#000', fontWeight: 'bold' },
});
