import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SignUpSuccessScreen() {
  const router = useRouter();
  const { fullName, email } = useLocalSearchParams();

  const handleContinue = () => {
    // Navigate to login or dashboard
    router.replace('/(tabs)');
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

      <View style={styles.successContainer}>
        <ThemedText style={styles.successTitle}>Account Created Successfully!</ThemedText>
        
        <View style={styles.userInfo}>
          <ThemedText style={styles.userInfoText}>Name: {fullName}</ThemedText>
          <ThemedText style={styles.userInfoText}>Email: {email}</ThemedText>
        </View>

        <ThemedText style={styles.successMessage}>
          Your TUTGuide Maps account has been successfully created. You can now sign in to access all features.
        </ThemedText>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <ThemedText style={styles.continueButtonText} >CONTINUE TO SIGN IN</ThemedText>
        </TouchableOpacity>
      </View>
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
  successContainer: {
    backgroundColor: 'rgba(159, 195, 195, 0.8)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ffa500',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e4b6d',
    textAlign: 'center',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
  },
  userInfoText: {
    fontSize: 16,
    color: '#2e4b6d',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#2e4b6d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: '#ffa500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#2e4b6d',
    fontWeight: 'bold',
    fontSize: 18,
  },
});