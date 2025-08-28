import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Navigate to success screen with user data
    router.push({
      pathname: '/signup-success',
      params: { 
        fullName: fullName.trim(),
        email: email.trim()
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Image 
            source={require('@/assets/images/tutguide.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.logoTextContainer}>
          <ThemedText style={styles.logoTextMain}>TUTGuide</ThemedText>
          <ThemedText style={styles.logoTextSub}>MAPS</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.title}>Create your TUTGuide account to start navigating</ThemedText>

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

      <ThemedText style={styles.inputLabel}>PASSWORD:</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Enter your password (min 6 characters)"
        placeholderTextColor="#c0d9d9"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <ThemedText style={styles.inputLabel}>CONFIRM PASSWORD:</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        placeholderTextColor="#c0d9d9"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          SIGN UP
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <ThemedText style={styles.backText}>Already have an account? <ThemedText style={styles.signInLink}>SIGN IN</ThemedText></ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#5a7f99' 
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2e4b6d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#ffa500',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  logoTextContainer: {
    alignItems: 'flex-start',
  },
  logoTextMain: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffa500',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoTextSub: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  title: { 
    fontSize: 18, 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 30, 
    fontWeight: '500' 
  },
  inputLabel: { 
    fontSize: 16, 
    marginBottom: 8, 
    color: '#fff',
    fontWeight: 'bold' 
  },
  input: { 
    backgroundColor: '#9fc3c3', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#ffa500', 
    color: '#2e4b6d',
    fontSize: 16 
  },
  button: { 
    backgroundColor: '#ffa500', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 10,
    marginBottom: 20 
  },
  buttonText: { 
    color: '#2e4b6d', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  backText: { 
    color: '#fff', 
    textAlign: 'center' 
  },
  signInLink: {
    color: '#ffa500',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});