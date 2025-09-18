import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SignUpSuccessScreen() {
  const router = useRouter();
  const { fullName, email, role } = useLocalSearchParams();

  // Decode the URL-encoded params
  const decodedFullName = fullName ? decodeURIComponent(fullName as string) : '';
  const decodedEmail = email ? decodeURIComponent(email as string) : '';
  const userRole = role as 'user' | 'admin';

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
            source={require('@/assets/images/tutguide1.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.logoTextContainer}>
          <ThemedText style={styles.logoTextMain}>TUTGuide</ThemedText>
        </View>
      </View>

      <View style={styles.successContainer}>
        <ThemedText style={styles.successTitle}>Account Created Successfully!</ThemedText>
        
        <View style={styles.userInfo}>
          <ThemedText style={styles.userInfoText}>Name: {decodedFullName}</ThemedText>
          <ThemedText style={styles.userInfoText}>Email: {decodedEmail}</ThemedText>
          <ThemedText style={styles.userInfoText}>
            Role: {userRole === 'admin' ? 'Administrator' : 'User'}
          </ThemedText>
        </View>

        <ThemedText style={styles.successMessage}>
          Your TUTGuide Maps account has been successfully created as a {userRole === 'admin' ? 'Administrator' : 'User'}. 
          You can now sign in to access all features.
        </ThemedText>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <ThemedText style={styles.continueButtonText}>CONTINUE TO SIGN IN</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#ccc' },
  logoContainer: {flexDirection: 'row', alignItems: 'center',justifyContent: 'center',marginBottom: 30,},
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 3, borderColor: '#fff',},
  logoImage: {width: 50,height: 50,},
  logoTextContainer: {alignItems: 'flex-start',},
  logoTextMain: {fontSize: 28,color: '#000'},
  successContainer: {backgroundColor: 'white',padding: 20,borderRadius: 15,borderWidth: 2,borderColor: 'white',},
  successTitle: {fontSize: 22,fontWeight: 'bold',color: '#000',textAlign: 'center',marginBottom: 20,},
  userInfo: {marginBottom: 20,padding: 15,backgroundColor: '#eee',borderRadius: 10,},
  userInfoText: {fontSize: 16,color: '#000',marginBottom: 8,fontWeight: '500',},
  successMessage: {fontSize: 16,color: '#000',textAlign: 'center',marginBottom: 30,lineHeight: 24,},
  continueButton: {backgroundColor: '#000',padding: 15,borderRadius: 8,alignItems: 'center',},
  continueButtonText: {color: '#fff',fontWeight: 'bold', fontSize: 18,
  },
});
