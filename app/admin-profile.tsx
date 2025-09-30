import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import API from './api'; // centralized Axios instance with JWT

const ProfileScreen = () => {
  const router = useRouter();
  const { name: paramName, email: paramEmail } = useLocalSearchParams();

  const [userData, setUserData] = useState({
    _id: '',
    name: '',
    email: '',
    profileImage: null as string | null,
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clickSound, setClickSound] = useState<Audio.Sound | null>(null);

  // --- MODAL STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    confirmAction: () => {},
    type: 'info' as 'info' | 'danger',
  });

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchUserDetails();
    const setup = async () => {
      await loadSound();
    };
    setup();

    return () => {
      unloadSound();
    };
  }, []);

  // --- FETCH USER DETAILS ---
  const fetchUserDetails = async () => {
    try {
      const response = await API.get('/users/details');
      if (response.data.success) {
        const user = response.data.user;
        setUserData({
          _id: user.email,
          name: user.fullName,
          email: user.email,
          profileImage: user.profileImage || null,
        });
        setProfileImage(user.profileImage || null);
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  // --- AUDIO ---
  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/click.wav')
    );
    setClickSound(sound);
  };

  const unloadSound = async () => {
    if (clickSound) await clickSound.unloadAsync();
  };

  const handleClick = async (callback?: () => void) => {
    if (soundEnabled && clickSound) await clickSound.replayAsync();
    if (callback) callback();
  };

  // --- IMAGE PICKER ---
  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showModal({
          title: 'Permission Required',
          message: 'Camera roll permission needed!',
          confirmText: 'OK',
          cancelText: '',
          confirmAction: () => {},
          type: 'info',
        });
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
      const response = await API.put(
        '/users/update/profilePic',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        setUserData({
          ...userData,
          profileImage: response.data.user.profileImage,
        });
        showModal({
          title: 'Success',
          message: 'Profile picture updated!',
          confirmText: 'OK',
          cancelText: '',
          confirmAction: () => {},
          type: 'info',
        });
      } else {
        showModal({
          title: 'Error',
          message: response.data.message || 'Failed to upload image',
          confirmText: 'OK',
          cancelText: '',
          confirmAction: () => {},
          type: 'danger',
        });
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      showModal({
        title: 'Error',
        message: err.response?.data?.message || 'Something went wrong',
        confirmText: 'OK',
        cancelText: '',
        confirmAction: () => {},
        type: 'danger',
      });
    }
  };

  // --- SHOW CUSTOM MODAL ---
  const showModal = (config: typeof modalConfig) => {
    setModalConfig(config);
    setModalVisible(true);
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    showModal({
      title: 'Logging Out',
      message:
        'Are you sure you want to log out? You will need to log in again to access your profile.',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      type: 'danger',
      confirmAction: () => router.replace('/'),
    });
  };

  // --- DELETE PROFILE ---
  const handleDeleteProfile = () => {
    Speech.speak('Warning! Your profile will be permanently deleted.');
    showModal({
      title: 'Delete Account',
      message:
        'This action will permanently remove your account and all data. Are you sure you want to continue?',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger',
      confirmAction: async () => {
        try {
          const response = await API.delete('/users/delete');
          if (response.data.message) router.replace('/');
        } catch (err: any) {
          console.error(err);
        }
      },
    });
  };

  // --- RENDER ---
  return (
    <>
      {/* Hide Expo Router default header */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Profile</ThemedText>
          </View>

          {/* PROFILE IMAGE */}
          <View style={styles.profileSection}>
            <View style={styles.imageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.placeholderContainer]}>
                  <Ionicons name="person" size={50} color="#888" />
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.userName}>{userData.name}</ThemedText>
          </View>

          {/* PERSONAL INFO */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Personal Info</ThemedText>

            {/* Name */}
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() =>
                router.push({
                  pathname: '/edit-profile',
                  params: { name: userData.name, email: userData.email },
                })
              }
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person-outline" size={20} color="#000" style={{ marginRight: 10 }} />
                <ThemedText style={styles.infoLabel}>Name</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={styles.infoValue}>{userData.name}</ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 5 }} />
              </View>
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity
              style={styles.infoRow}
             
              
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail-outline" size={20} color="#000" style={{ marginRight: 10 }} />
                <ThemedText style={styles.infoLabel}>Email</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={styles.infoValue}>{userData.email}</ThemedText>
                
              </View>
            </TouchableOpacity>

            {/* Change Password */}
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => router.push('./change-password')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#000"
                  style={{ marginRight: 10 }}
                />
                <ThemedText style={styles.infoLabel}>Change Password</ThemedText>
              </View>
              <View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </View>
            </TouchableOpacity>
          </View>

          {/* SETTINGS */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>App Settings</ThemedText>
            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Voice Guidance</ThemedText>
              <Switch
                value={voiceEnabled}
                onValueChange={(val) => setVoiceEnabled(val)}
                thumbColor="#000"
                trackColor={{ true: '#ccc', false: '#ccc' }}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>App Sounds</ThemedText>
              <Switch
                value={soundEnabled}
                onValueChange={(val) => setSoundEnabled(val)}
                thumbColor="black"
                trackColor={{ true: '#ccc', false: '#ccc' }}
              />
            </View>
          </View>

          {/* ABOUT & ACTIONS */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.smallButton, { marginBottom: 10 }]}
              onPress={() => router.push('/about-us')}
            >
              <Ionicons name="information-circle-outline" size={20} color="#000" style={{ marginRight: 10 }} />
              <ThemedText style={[styles.smallButtonText, { color: '#000' }]}>About Us</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#000" style={{ marginRight: 10 }} />
              <ThemedText style={styles.smallButtonText}>Log Out</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: '#ffe5e5' }]}
              onPress={handleDeleteProfile}
            >
              <Ionicons name="trash-outline" size={20} color="red" style={{ marginRight: 10 }} />
              <ThemedText style={[styles.smallButtonText, { color: 'red' }]}>Delete Account</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* --- CUSTOM MODAL --- */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContainer,
                modalConfig.type === 'danger' && { borderColor: '#ccc' },
              ]}
            >
              <ThemedText style={styles.modalTitle}>{modalConfig.title}</ThemedText>
              <ThemedText style={styles.modalMessage}>{modalConfig.message}</ThemedText>
              <View style={styles.modalButtons}>
                {modalConfig.cancelText ? (
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <ThemedText>{modalConfig.cancelText}</ThemedText>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    modalConfig.type === 'danger' && { backgroundColor: 'red' },
                  ]}
                  onPress={() => {
                    modalConfig.confirmAction();
                    setModalVisible(false);
                  }}
                >
                  <ThemedText style={{ color: 'white' }}>{modalConfig.confirmText}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 30,
  },
  backButton: { marginRight: 15 },
  smallButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#f5f5f5', marginVertical: 5, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  smallButtonText: { fontSize: 14, fontWeight: '500', color: '#000' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#000' },
  profileSection: { alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5', margin: 10, borderRadius: 12 },
  imageContainer: { position: 'relative', marginBottom: 15 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  placeholderContainer: { backgroundColor: '#ddd' },
  cameraButton: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#000', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 20, fontWeight: '600', color: '#000' },
  section: { backgroundColor: '#f5f5f5', padding: 20, margin: 10, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  infoLabel: { fontSize: 14, fontWeight: '500', color: '#333' },
  infoValue: { fontSize: 14, color: '#555' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  switchLabel: { fontSize: 14, color: '#000', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 2, borderColor: '#000' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#000' },
  modalMessage: { fontSize: 14, marginBottom: 20, color: '#333' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
});

export default ProfileScreen;
