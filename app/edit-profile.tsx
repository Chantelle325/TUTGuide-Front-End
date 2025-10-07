import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import API from './api'; // 👈 centralized Axios

const EditProfileScreen = () => {
  const router = useRouter();
  const { name: paramName, email: paramEmail } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === 'dark';

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

      <View style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#fff' }]}>
        <View style={styles.titleRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={darkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <ThemedText style={[styles.title, { color: darkMode ? '#fff' : '#000' }]}>
            Edit Profile
          </ThemedText>
        </View>

        <View
          style={[
            styles.inputContainer,
            { borderColor: darkMode ? '#555' : '#ccc', backgroundColor: darkMode ? '#1e1e1e' : '#fff' },
          ]}
        >
          <Ionicons
            name="person"
            size={20}
            color={darkMode ? '#fff' : '#000'}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={[styles.input, { color: darkMode ? '#fff' : '#000' }]}
            placeholder="Update Name"
            placeholderTextColor={darkMode ? '#aaa' : '#888'}
            value={name}
            onChangeText={setName}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: darkMode ? '#333' : '#000' }]}
          onPress={handleUpdate}
        >
          <ThemedText style={[styles.buttonText, { color: '#fff' }]}>Save Changes</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 60, marginBottom: 25 },
  title: { fontSize: 22, fontWeight: '700', marginLeft: 15 },
  backButton: { padding: 8, borderRadius: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  input: { flex: 1, fontSize: 16 },
  button: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 16, fontWeight: '600' },
});
