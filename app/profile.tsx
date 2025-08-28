import { ThemedText } from '@/components/ThemedText';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';

const ProfileScreen = () => {
  const router = useRouter();
  const { name: paramName, email: paramEmail } = useLocalSearchParams();

  // Main user data
  const [userData, setUserData] = useState({ name: '', email: '' });

  // Update email states
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Update password states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile picture
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // About section
  const [showAbout, setShowAbout] = useState(false);

  // App settings
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sound object
  const [clickSound, setClickSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const initialEmail = (paramEmail as string) || 'guest@example.com';
    const initialName = (paramName as string) || extractNameFromEmail(initialEmail);
    setUserData({ name: initialName, email: initialEmail });
    loadSound();
    return () => {
      unloadSound();
    };
  }, [paramName, paramEmail]);

  const extractNameFromEmail = (email: string) => {
    const username = email.split('@')[0];
    return username.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  };

  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(require('../assets/click.wav'));
    setClickSound(sound);
  };

  const unloadSound = async () => {
    if (clickSound) await clickSound.unloadAsync();
  };

  // Universal click handler
  const handleClick = async (callback?: () => void) => {
    if (soundEnabled && clickSound) await clickSound.replayAsync();
    if (callback) callback();
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setProfileImage(result.assets[0].uri);
      handleClick();
    }
  };

  // --- Update Email ---
  const handleEmailUpdate = () => {
    handleClick(() => {
      if (!newEmail || !confirmEmail) return Alert.alert('Error', 'Please fill in all fields');
      if (newEmail !== confirmEmail) return Alert.alert('Error', 'Emails do not match');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) return Alert.alert('Error', 'Please enter a valid email address');

      setUserData({ name: extractNameFromEmail(newEmail), email: newEmail });
      setNewEmail('');
      setConfirmEmail('');
      setIsEditing(false);
      Alert.alert('Success', 'Email updated successfully!');
    });
  };

  // --- Change Password ---
  const handlePasswordChange = () => {
    handleClick(() => {
      if (!currentPassword || !newPassword || !confirmPassword) return Alert.alert('Error', 'Please fill in all fields');
      if (newPassword !== confirmPassword) return Alert.alert('Error', 'New passwords do not match');
      if (newPassword.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters long');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      Alert.alert('Success', 'Password changed successfully!');
    });
  };

  // --- Logout ---
  const handleLogout = () => {
    handleClick(() => {
      Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', onPress: () => router.replace('/') },
      ]);
    });
  };

  // --- Delete Profile ---
  const handleDeleteProfile = () => {
    handleClick(() => {
      Speech.speak("Your profile will be deleted");
      Alert.alert(
        'Delete Profile',
        'Are you sure you want to delete your profile? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => router.replace('/') },
        ]
      );
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Profile Settings</ThemedText>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.placeholderContainer]}>
              <Ionicons name="person" size={50} color="#c0d9d9" />
            </View>
          )}
          <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.userName}>{userData.name}</ThemedText>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Email</ThemedText>
          <ThemedText style={styles.infoValue}>{userData.email}</ThemedText>
        </View>
      </View>

      {/* Update Email */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Update Email Address</ThemedText>
          <TouchableOpacity onPress={() => handleClick(() => setIsEditing(!isEditing))}>
            <Ionicons name={isEditing ? 'chevron-up' : 'chevron-down'} size={24} color="#ffa500" />
          </TouchableOpacity>
        </View>
        {isEditing && (
          <View style={styles.form}>
            <ThemedText style={styles.inputLabel}>NEW EMAIL:</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter new email"
              placeholderTextColor="#c0d9d9"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ThemedText style={styles.inputLabel}>CONFIRM EMAIL:</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Confirm new email"
              placeholderTextColor="#c0d9d9"
              value={confirmEmail}
              onChangeText={setConfirmEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.updateButton} onPress={handleEmailUpdate}>
              <ThemedText style={styles.updateButtonText}>UPDATE EMAIL</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Change Password */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Change Password</ThemedText>
          <TouchableOpacity onPress={() => handleClick(() => setIsChangingPassword(!isChangingPassword))}>
            <Ionicons name={isChangingPassword ? 'chevron-up' : 'chevron-down'} size={24} color="#ffa500" />
          </TouchableOpacity>
        </View>
        {isChangingPassword && (
          <View style={styles.form}>
            <ThemedText style={styles.inputLabel}>CURRENT PASSWORD:</ThemedText>
            <TextInput style={styles.input} placeholder="Enter current password" placeholderTextColor="#c0d9d9" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
            <ThemedText style={styles.inputLabel}>NEW PASSWORD:</ThemedText>
            <TextInput style={styles.input} placeholder="Enter new password" placeholderTextColor="#c0d9d9" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
            <ThemedText style={styles.inputLabel}>CONFIRM PASSWORD:</ThemedText>
            <TextInput style={styles.input} placeholder="Confirm new password" placeholderTextColor="#c0d9d9" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

            <TouchableOpacity style={styles.updateButton} onPress={handlePasswordChange}>
              <ThemedText style={styles.updateButtonText}>CHANGE PASSWORD</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>App Settings</ThemedText>
        <View style={styles.switchRow}>
          <ThemedText style={styles.switchLabel}>Voice Guidance</ThemedText>
          <Switch value={voiceEnabled} onValueChange={val => handleClick(() => setVoiceEnabled(val))} thumbColor="#ffa500" />
        </View>
        <View style={styles.switchRow}>
          <ThemedText style={styles.switchLabel}>App Sounds</ThemedText>
          <Switch value={soundEnabled} onValueChange={val => handleClick(() => setSoundEnabled(val))} thumbColor="#ffa500" />
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>About the App</ThemedText>
          <TouchableOpacity onPress={() => handleClick(() => setShowAbout(!showAbout))}>
            <MaterialIcons name={showAbout ? 'expand-less' : 'expand-more'} size={24} color="#ffa500" />
          </TouchableOpacity>
        </View>
        {showAbout && (
          <View style={{ marginTop: 10 }}>
            <ThemedText style={styles.aboutText}>
              TUTGuide Maps is a user-friendly mobile application designed to simplify navigation across the Tshwane University of Technology (TUT) campuses. It helps students, staff, and visitors find the fastest routes to lecture halls, laboratories, offices, and other campus facilities.
            </ThemedText>
            <ThemedText style={styles.aboutText}>• Interactive Campus Map</ThemedText>
            <ThemedText style={styles.aboutText}>• User Profiles for Students and Admins</ThemedText>
            <ThemedText style={styles.aboutText}>• Route Guidance and Step-by-Step Directions</ThemedText>
            <ThemedText style={styles.aboutText}>• Offline Map Access</ThemedText>
            <ThemedText style={styles.aboutText}>• Search Functionality</ThemedText>
            <ThemedText style={styles.aboutText}>• Voice Assistance</ThemedText>
            <ThemedText style={styles.aboutText}>Benefits include improved navigation, reduced stress, better punctuality, and accessibility for all users.</ThemedText>
            <ThemedText style={[styles.aboutText, { fontStyle: 'italic', marginTop: 5 }]}>
              Slogan: "Navigate Life’s Path with TUTGuide"
            </ThemedText>
          </View>
        )}
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <ThemedText style={[styles.actionButtonText, styles.logoutButtonText]}>Log Out</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteProfile}>
          <ThemedText style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Account</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#5a7f99' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#2e4b6d', borderBottomWidth: 2, borderBottomColor: '#ffa500' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffa500', textAlign: 'center' },
  profileSection: { alignItems: 'center', padding: 20, backgroundColor: 'rgba(159,195,195,0.8)', margin: 10, borderRadius: 15, borderWidth: 2, borderColor: '#ffa500' },
  imageContainer: { position: 'relative', marginBottom: 15 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#ffa500', justifyContent: 'center', alignItems: 'center' },
  placeholderContainer: { backgroundColor: '#5a7f99' },
  cameraButton: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#ffa500', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#2e4b6d' },
  section: { backgroundColor: 'rgba(159,195,195,0.8)', padding: 20, margin: 10, borderRadius: 15, borderWidth: 2, borderColor: '#ffa500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2e4b6d' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#5a7f99' },
  infoLabel: { fontSize: 16, color: '#2e4b6d', fontWeight: 'bold' },
  infoValue: { fontSize: 16, color: '#2e4b6d', fontWeight: '500' },
  form: { marginTop: 10 },
  inputLabel: { fontSize: 16, color: '#2e4b6d', marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#5a7f99', padding: 12, borderRadius: 8, marginBottom: 20, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#ffa500' },
  updateButton: { backgroundColor: '#ffa500', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  updateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  actionButton: { padding: 15, marginTop: 10, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { fontSize: 16, fontWeight: '500' },
  logoutButton: { backgroundColor: '#2e4b6d', borderWidth: 2, borderColor: '#ffa500' },
  logoutButtonText: { color: '#ffa500', fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#2e4b6d', borderWidth: 2, borderColor: '#ffa500' },
  deleteButtonText: { color: '#ffa500', fontWeight: 'bold' },
  aboutText: { fontSize: 14, color: '#2e4b6d', marginBottom: 5, lineHeight: 20 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  switchLabel: { fontSize: 16, color: '#2e4b6d', fontWeight: '500' },
});

export default ProfileScreen;
