import Footer from '@/app/Footer';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const AboutUsScreen = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#eee' }}>
      {/* Hide Expo Router default header */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>About TUTGuide</ThemedText>
        </View>

        {/* Content Section */}
        <View style={styles.section}>
          <ThemedText style={styles.content}>
            TUTGuide is a mobile application designed to simplify student services at Tshwane University of Technology. It provides easy access to registration status, personal information management, and app guidance for students.
          </ThemedText>
          <ThemedText style={styles.content}>
            Our goal is to make the TUT student experience smoother, faster, and more intuitive.
          </ThemedText>
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#FFF',
  },
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginRight: 35, // to center with back button
  },
  container: {
    padding: 10,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    margin: 10,
    borderRadius: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
    marginBottom: 10,
  },
});

export default AboutUsScreen;
