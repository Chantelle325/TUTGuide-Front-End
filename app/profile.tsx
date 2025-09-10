import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'https://ismabasa123.loca.lt/api';

const ProfileScreen = () => {
  const router = useRouter();
  const { name: paramName, email: paramEmail } = useLocalSearchParams();

  const [userData, setUserData] = useState({
    _id: '',
    name: '',
    email: '',
    profileImage: null as string | null,
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [showAbout, setShowAbout] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clickSound, setClickSound] = useState<Audio.Sound | null>(null);

 useEffect(() => {
  const initialEmail = (paramEmail as string) || 'guest@example.com';
  const initialName = (paramName as string) || extractNameFromEmail(initialEmail);

  setUserData({
    _id: '12345',
    name: initialName,
    email: initialEmail,
    profileImage: null,
  });
  setNewName(initialName);

  // async function inside useEffect
  const setup = async () => {
    await loadSound();
  };
  setup();

  return () => {
    unloadSound();
  };
}, [paramName, paramEmail]);


  const extractNameFromEmail = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(require('../assets/click.wav'));
    setClickSound(sound);
  };

  const unloadSound = async () => {
    if (clickSound) await clickSound.unloadAsync();
  };

  const handleClick = async (callback?: () => void) => {
    if (soundEnabled && clickSound) await clickSound.replayAsync();
    if (callback) callback();
  };

  // --- UPDATE PROFILE IMAGE ---
  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera roll permission needed!');
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
      const selectedImage = result.assets[0].uri;
      setProfileImage(selectedImage);
      uploadProfileImage(selectedImage);
      handleClick();
    }
  };

  //Profile picture
  const uploadProfileImage = async (uri: string) => {
  const formData = new FormData();
  const fileName = uri.split('/').pop() || 'profile.jpg';
  const fileType = `image/${fileName.split('.').pop() || 'jpeg'}`;

  formData.append('profilePic', {
    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
    name: fileName,
    type: fileType,
  } as any);

  try {
    const response = await axios.put(
      `${API_URL}/update/${userData._id}/profile-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      setUserData({ ...userData, profileImage: response.data.user.profileImage });
      Alert.alert('Success', 'Profile picture updated!');
    } else {
      Alert.alert('Error', response.data.message || 'Failed to upload image');
    }
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
  }
};

//--update name
 const handleNameUpdate = async () => {
  if (!newName.trim()) return Alert.alert('Error', 'Please enter your name');

  try {
    const response = await axios.put(`${API_URL}/update/${userData._id}`, {
      name: newName,
      email: userData.email, // include existing email if backend requires full object
    });

    if (response.data.success && response.data.user) {
      setUserData({ ...userData, name: response.data.user.name });
      setIsEditingName(false);
      Alert.alert('Success', 'Name updated successfully!');
    } else {
      Alert.alert('Error', response.data.message || 'Failed to update name');
    }
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
  }
};

  // --- UPDATE EMAIL ---
  const handleEmailUpdate = async () => {
    handleClick(async () => {
      if (!newEmail || !confirmEmail) return Alert.alert('Error', 'Fill all fields');
      if (newEmail !== confirmEmail) return Alert.alert('Error', 'Emails do not match');

      try {
        const response = await axios.put(`${API_URL}/update`, {
          oldEmail: userData.email,
          newEmail,
        });

        if (response.data.message) {
          setUserData({ ...userData, email: newEmail });
          setNewEmail('');
          setConfirmEmail('');
          setIsEditingEmail(false);
          Alert.alert('Success', 'Email updated!');
        } else Alert.alert('Error', response.data.error || 'Failed to update email');
      } catch (err: any) {
        console.error(err.response?.data || err.message);
        Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
      }
    });
  };

  // --- UPDATE PASSWORD ---
  const handlePasswordChange = async () => {
    handleClick(async () => {
      if (!currentPassword || !newPassword || !confirmPassword)
        return Alert.alert('Error', 'Fill all fields');
      if (newPassword !== confirmPassword)
        return Alert.alert('Error', 'Passwords do not match');

      try {
        const response = await axios.put(`${API_URL}/update`, {
          oldEmail: userData.email,
          currentPassword,
          password: newPassword,
        });

        if (response.data.message) {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setIsChangingPassword(false);
          Alert.alert('Success', 'Password changed!');
        } else Alert.alert('Error', response.data.error || 'Failed to change password');
      } catch (err: any) {
        console.error(err.response?.data || err.message);
        Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
      }
    });
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    handleClick(() => {
      Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', onPress: () => router.replace('/') },
      ]);
    });
  };

  // --- DELETE PROFILE ---
  const handleDeleteProfile = async () => {
    handleClick(async () => {
      Speech.speak('Your profile will be deleted');
      Alert.alert(
        'Delete Profile',
        'Are you sure? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const response = await axios.delete(`${API_URL}/delete`, {
                  data: { email: userData.email },
                });
                if (response.data.message) {
                  Alert.alert('Deleted', 'Account deleted successfully');
                  router.replace('/');
                } else Alert.alert('Error', response.data.error || 'Failed to delete account');
              } catch (err: any) {
                console.error(err.response?.data || err.message);
                Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
              }
            },
          },
        ]
      );
    });
  };

  // --- RENDER ---
  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Profile Settings</ThemedText>
      </View>

      {/* PROFILE IMAGE */}
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

      {/* ACCOUNT INFO */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account Info</ThemedText>
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Email</ThemedText>
          <ThemedText style={styles.infoValue}>{userData.email}</ThemedText>
        </View>
      </View>

      {/* UPDATE NAME */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Update Name</ThemedText>
          <TouchableOpacity onPress={() => setIsEditingName(!isEditingName)}>
            <Ionicons
              name={isEditingName ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#ffa500"
            />
          </TouchableOpacity>
        </View>
        {isEditingName && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Enter new name"
              placeholderTextColor="#c0d9d9"
              value={newName}
              onChangeText={setNewName}
            />
            <TouchableOpacity style={styles.updateButton} onPress={handleNameUpdate}>
              <ThemedText style={styles.updateButtonText}>Update Name</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* UPDATE EMAIL */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Update Email</ThemedText>
          <TouchableOpacity onPress={() => setIsEditingEmail(!isEditingEmail)}>
            <Ionicons
              name={isEditingEmail ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#ffa500"
            />
          </TouchableOpacity>
        </View>
        {isEditingEmail && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Enter new email"
              placeholderTextColor="#c0d9d9"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
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
              <ThemedText style={styles.updateButtonText}>Update Email</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CHANGE PASSWORD */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Change Password</ThemedText>
          <TouchableOpacity onPress={() => setIsChangingPassword(!isChangingPassword)}>
            <Ionicons
              name={isChangingPassword ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#ffa500"
            />
          </TouchableOpacity>
        </View>
        {isChangingPassword && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Current password"
              placeholderTextColor="#c0d9d9"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor="#c0d9d9"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#c0d9d9"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.updateButton} onPress={handlePasswordChange}>
              <ThemedText style={styles.updateButtonText}>Change Password</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* SETTINGS, ABOUT, LOGOUT/DELETE */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>App Settings</ThemedText>
        <View style={styles.switchRow}>
          <ThemedText style={styles.switchLabel}>Voice Guidance</ThemedText>
          <Switch
            value={voiceEnabled}
            onValueChange={(val) => setVoiceEnabled(val)}
            thumbColor="#ffa500"
          />
        </View>
        <View style={styles.switchRow}>
          <ThemedText style={styles.switchLabel}>App Sounds</ThemedText>
          <Switch
            value={soundEnabled}
            onValueChange={(val) => setSoundEnabled(val)}
            thumbColor="#ffa500"
          />
        </View>
      </View>

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
  input: { backgroundColor: '#5a7f99', padding: 12, borderRadius: 8, marginBottom: 20, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#ffa500' },
  updateButton: { backgroundColor: '#ffa500', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  updateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  actionButton: { padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 5 },
  logoutButton: { backgroundColor: '#2e4b6d' },
  logoutButtonText: { color: '#ffa500' },
  deleteButton: { backgroundColor: '#2e4b6d' },
  deleteButtonText: { color: '#ffa500' },
  actionButtonText: { fontSize: 16, fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  switchLabel: { fontSize: 16, color: '#2e4b6d', fontWeight: '500' },
});

export default ProfileScreen;
