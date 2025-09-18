import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import API from './api'; // 👈 centralized Axios

const EditProfileScreen = () => {
  const router = useRouter();
  const { name: paramName, email: paramEmail } = useLocalSearchParams();

  const [name, setName] = useState(typeof paramName === 'string' ? paramName : '');
  const [email, setEmail] = useState(typeof paramEmail === 'string' ? paramEmail : '');

  const handleUpdate = async () => {
    if (!name || !email) {
      alert('Please fill in both fields');
      return;
    }

    try {
      const response = await API.put('/users/update/profile', { newEmail: email, fullName: name }); 
      if (response.data.success) {
        alert('Profile updated successfully');
        router.back();
      } else {
        alert(response.data.message || 'Failed to update');
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.titleRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Edit Profile</ThemedText>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#000" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="Update Name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#000" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="Update Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <ThemedText style={styles.buttonText}>Save Changes</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 60, marginBottom: 25 },
  title: { fontSize: 22, fontWeight: '700', marginLeft: 15 },
  backButton: { padding: 8, borderRadius: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  input: { flex: 1, fontSize: 16 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});