import { ThemedText } from '@/components/ThemedText';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.75;

type LocationType = { name: string };

export default function DashboardScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);

  const [userName, setUserName] = useState('User');
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [savedPlaces, setSavedPlaces] = useState<LocationType[]>([]);
  // const [webViewUrl, setWebViewUrl] = useState<string>('https://map-tut.vercel.app/');
  const [webViewUrl, setWebViewUrl] = useState<string>('https://tutguide.netlify.app/'); // default web app

  const toggleDrawer = () => {
    if (drawerOpen) {
      Animated.timing(drawerAnim, { toValue: -DRAWER_WIDTH, duration: 300, useNativeDriver: true }).start(() => setDrawerOpen(false));
    } else {
      setDrawerOpen(true);
      Animated.timing(drawerAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  };

  // Load user data
  useEffect(() => {
    (async () => {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
      const uri = await AsyncStorage.getItem('profileImage');
      if (uri) setUserProfileImage(uri);
      const saved = await AsyncStorage.getItem('savedPlaces');
      if (saved) setSavedPlaces(JSON.parse(saved));
    })();
  }, []);

// In your Expo app

const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

useEffect(() => {
  let subscription: Location.LocationSubscription;

  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, distanceInterval: 5, timeInterval: 5000 },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        // Update WebView URL with coordinates
        const url = `https://tutguide.netlify.app/?lat=${latitude}&lng=${longitude}`;
        setWebViewUrl(url);
      }
    );
  })();

  return () => subscription?.remove();
}, []);


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1 }}>
        {/* WebView Map */}
        <WebView
          ref={webViewRef}
          source={{ uri: webViewUrl }}
          style={{ flex: 1 }}
          originWhitelist={['*']}
        />

        {/* Drawer Overlay */}
        {drawerOpen && (
          <TouchableWithoutFeedback onPress={toggleDrawer}>
            <View style={styles.drawerOverlay} />
          </TouchableWithoutFeedback>
        )}

        {/* Drawer */}
        <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
          <View style={styles.drawerHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={toggleDrawer}>
              <Feather name="x" size={28} color="#2e4b6d" />
            </TouchableOpacity>
            {userProfileImage ? (
              <Image source={{ uri: userProfileImage }} style={styles.drawerProfileImage} />
            ) : (
              <View style={[styles.drawerProfileImage, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
                <Feather name="user" size={40} color="#888" />
              </View>
            )}
            <ThemedText style={styles.drawerName}>{userName}</ThemedText>
          </View>

          <TouchableOpacity style={styles.drawerItem} onPress={() => { router.push('/profile'); toggleDrawer(); }}>
            <Feather name="user" size={20} color="#000" style={{ marginRight: 10 }} />
            <ThemedText>Profile</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerItem} onPress={() => { router.push('/about-us'); toggleDrawer(); }}>
            <Feather name="info" size={20} color="#000" style={{ marginRight: 10 }} />
            <ThemedText>About Us</ThemedText>
          </TouchableOpacity>

          {savedPlaces.length > 0 && <ThemedText style={styles.savedPlacesTitle}>Saved Places</ThemedText>}
          <FlatList
            data={savedPlaces}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.drawerItem}>
                <Feather name="map-pin" size={20} color="#000" style={{ marginRight: 10 }} />
                <ThemedText>{item.name}</ThemedText>
              </TouchableOpacity>
            )}
          />
        </Animated.View>

        {/* Footer Tabs */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]} onPress={() => setWebViewUrl('https://tutguide.netlify.app/')}>
            <View style={styles.tabContent}>
              <Feather name="map-pin" size={24} color="#9fc3c3" />
              <ThemedText style={[styles.tabText, styles.activeTabText]}>Map</ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => router.push('/Report')}>
            <View style={styles.tabContent}>
              <Feather name="message-square" size={24} color="#9fc3c3" />
              <ThemedText style={styles.tabText}>Report</ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => router.push('/profile')}>
            <View style={styles.tabContent}>
              <Feather name="user" size={24} color="#9fc3c3" />
              <ThemedText style={styles.tabText}>Account</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
    borderTopWidth: 2,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  searchContainer: { position: 'absolute', top: 65, left: 55, right: 15, zIndex: 10 },
  searchInput: {width: '100%',padding: 14,borderWidth: 1,borderColor: '#ccc',borderRadius: 25,backgroundColor: '#fff',fontSize: 15,color: '#222',shadowColor: '#000',shadowOpacity: 0.1,shadowRadius: 3,elevation: 4,},

  tab: { alignItems: 'center', padding: 10, flex: 1 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: 'black' },
  tabContent: { alignItems: 'center' },
  tabText: { fontWeight: 'bold', fontSize: 14, color: '#9fc3c3', textTransform: 'uppercase' },
  activeTabText: { color: 'black' },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  drawerOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 15,
  },
  drawerHeader: { alignItems: 'center', marginBottom: 30 },
  drawerProfileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  drawerName: { fontSize: 18, fontWeight: '700', color: '#2e4b6d' },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
 
  closeButton: { position: 'absolute', right: 0, top: 0, padding: 10 },
  savedPlacesTitle: { fontSize: 16, fontWeight: '700', color: '#2e4b6d', marginTop: 20, marginBottom: 10 },
 
});
