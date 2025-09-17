import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import API from '../api';



export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email');
    if (!password) return Alert.alert('Error', 'Please enter your password');

    try {
      const response = await API.post(`/auth/login`, { email: email.trim(), password });
      console.log(response);
      const { user, token, message } = response.data;

      if (!user || !user.role || !token) {
        Alert.alert('Error', 'Invalid credentials or token missing');
        return;
      }

      // ✅ Save token and role
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userRole', user.role);
      await AsyncStorage.setItem('userName', user.fullName || user.email.split('@')[0]);

      Alert.alert('Success', message || 'Logged in successfully');

      // ✅ Navigate based on role
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/signin');
      }

    } catch (err: any) {
      console.log('Login error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/tutmap.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image source={require('@/assets/images/tutguide1.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View style={styles.logoTextContainer}>
              <ThemedText style={styles.logoTextMain}>TUTGuide</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.title}>Navigate Life's Path with TUTGuide</ThemedText>

          <View style={styles.formContainer}>
            <ThemedText style={styles.inputLabel}>EMAIL :</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#c0d9d9"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <ThemedText style={styles.inputLabel}>PASSWORD:</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#c0d9d9"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ThemedText onPress={() => router.push('/forgot-password')} style={styles.linkText}>
              Forgot Password?
            </ThemedText>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                <ThemedText style={styles.buttonText}>LOGIN</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.signUpButton} onPress={() => router.push('/signup')}>
                <ThemedText style={styles.buttonText}>SIGN UP</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(90, 127, 153, 0.85)', padding: 20 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2e4b6d', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 3, borderColor: '#ffa500' },
  logoImage: { width: 50, height: 50 },
  logoTextContainer: { alignItems: 'flex-start' },
  logoTextMain: { fontSize: 28, fontWeight: 'bold', color: '#ffa500', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  title: { fontSize: 20, color: '#fff', textAlign: 'center', marginBottom: 40, fontStyle: 'italic', textDecorationLine: 'underline', textDecorationColor: '#ffa500' },
  formContainer: { backgroundColor: 'rgba(159, 195, 195, 0.8)', padding: 20, borderRadius: 15, borderWidth: 2, borderColor: '#ffa500' },
  inputLabel: { fontSize: 16, color: '#2e4b6d', marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#5a7f99', padding: 12, borderRadius: 8, marginBottom: 20, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#ffa500' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#5a7f99', borderRadius: 8, borderWidth: 1, borderColor: '#ffa500', marginBottom: 20 },
  passwordInput: { flex: 1, padding: 12, fontSize: 16, color: '#fff' },
  eyeButton: { padding: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  signInButton: { backgroundColor: '#ffa500', padding: 15, borderRadius: 8, alignItems: 'center', flex: 0.48 },
  signUpButton: { backgroundColor: '#2e4b6d', padding: 15, borderRadius: 8, alignItems: 'center', flex: 0.48 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: 'white', marginBottom: 10, textAlign: 'left' },
});
