import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ImageBackground, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = "https://ismabasa123.loca.lt/api/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'client' | 'admin'>('client');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: email.trim(),
        password,
      });

      console.log('Login response:', response.data);
      const user = response.data.user || response.data;

      if (!user || !user.role) {
        Alert.alert('Error', 'Invalid credentials');
        return;
      }

      Alert.alert('Success', response.data.message || 'Logged in successfully');

      router.replace({
        pathname: user.role === 'admin' ? '/admin' : '/signin',
        params: {
          username: user.fullName || user.email.split('@')[0],
          email: user.email,
          userType: user.role,
        },
      });
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
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
        {/* ✅ Make scrollable */}
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          {/* Logo Section */}
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

          {/* Title */}
          <ThemedText style={styles.title}>Navigate Life's Path with TUTGuide</ThemedText>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* User Type Selection */}
            <View style={styles.radioContainer}>
              <TouchableOpacity style={styles.radioButton} onPress={() => setUserType('client')}>
                <View style={styles.radioCircle}>
                  {userType === 'client' && <View style={styles.radioSelected} />}
                </View>
                <ThemedText style={styles.radioLabel}>Client</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.radioButton} onPress={() => setUserType('admin')}>
                <View style={styles.radioCircle}>
                  {userType === 'admin' && <View style={styles.radioSelected} />}
                </View>
                <ThemedText style={styles.radioLabel}>Admin</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Email */}
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

            {/* Password with eye icon */}
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

            {/* Forgot Password */}
            <ThemedText 
              onPress={() => router.push('/forgot-password')} 
              style={styles.linkText}
            >
              Forgot Password?
            </ThemedText>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                <ThemedText style={styles.buttonText}>LOGIN</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.signUpButton} 
                onPress={() => router.push('/signup')}
              >
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
  scrollContainer: { flexGrow: 1, justifyContent: 'center' }, // ✅ allow scrolling
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

  radioContainer: { flexDirection: 'row', marginBottom: 20, justifyContent: 'space-between' },
  radioButton: { flexDirection: 'row', alignItems: 'center', flex: 0.48 },
  radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#2e4b6d', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  radioSelected: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#2e4b6d' },
  radioLabel: { fontSize: 16, color: '#2e4b6d' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  signInButton: { backgroundColor: '#ffa500', padding: 15, borderRadius: 8, alignItems: 'center', flex: 0.48 },
  signUpButton: { backgroundColor: '#2e4b6d', padding: 15, borderRadius: 8, alignItems: 'center', flex: 0.48 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: 'white', marginBottom: 10, textAlign: 'left' },
});
