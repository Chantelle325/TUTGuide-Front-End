import { ThemedText } from '@/components/ThemedText';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.75;

export default function DashboardScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [region, setRegion] = useState({
    latitude: -25.54053,
    longitude: 28.09529,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const [userName, setUserName] = useState('User');
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<
    Array<{ name: string; latitude: number; longitude: number }>
  >([]);

  const locations = [
    { name: 'Library', latitude: -25.7579, longitude: 28.2311 },
    { name: 'Engineering Labs', latitude: -25.7582, longitude: 28.2320 },
    { name: 'Cafeteria', latitude: -25.7585, longitude: 28.2315 },
    { name: 'Admin Building', latitude: -25.7575, longitude: 28.2305 },
    { name: 'Student Centre', latitude: -25.7578, longitude: 28.2308 },
    { name: 'Parking Area', latitude: -25.7583, longitude: 28.2309 },
  ];

  // Load user info and saved places
  useEffect(() => {
    AsyncStorage.getItem('userName').then((name) => {
      if (name) setUserName(name);
    });
    AsyncStorage.getItem('profileImage').then((uri) => {
      if (uri) setUserProfileImage(uri);
    });
    AsyncStorage.getItem('savedPlaces').then((data) => {
      if (data) setSavedPlaces(JSON.parse(data));
    });
  }, []);

  // Location permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission denied',
            'Location permission is needed to show your position on the map'
          );
          return;
        }
        setHasLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    })();
  }, []);

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = locations.filter((loc) =>
      loc.name.toLowerCase().includes(query.toLowerCase())
    );
    if (query && results.length > 0) {
      setRegion({
        latitude: results[0].latitude,
        longitude: results[0].longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const toggleDrawer = () => {
    if (drawerOpen) {
      Animated.timing(drawerAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDrawerOpen(false));
    } else {
      setDrawerOpen(true);
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1 }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton
        >
          {filteredLocations.map((loc) => (
            <Marker
              key={loc.name}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              title={loc.name}
              pinColor="red"
            />
          ))}
        </MapView>

        {/* Hamburger Menu */}
        <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
          <Feather name="menu" size={28} color="black" />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a facility..."
            placeholderTextColor="#555"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.tab, styles.activeTab]}
            onPress={() => router.push('/signin')}
          >
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

        {/* Drawer Overlay */}
        {drawerOpen && <TouchableWithoutFeedback onPress={toggleDrawer}>
          <View style={styles.drawerOverlay} />
        </TouchableWithoutFeedback>}

        {/* Drawer */}
        <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
          {/* Drawer Header */}
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

          {/* Drawer Items */}
          <TouchableOpacity style={styles.drawerItem} onPress={() => { router.push('/profile'); toggleDrawer(); }}>
            <Feather name="user" size={20} color="#000" style={{ marginRight: 10 }} />
            <ThemedText>Profile</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerItem} onPress={() => { router.push('/about-us'); toggleDrawer(); }}>
            <Feather name="info" size={20} color="#000" style={{ marginRight: 10 }} />
            <ThemedText>About Us</ThemedText>
          </TouchableOpacity>

          {/* Saved Places */}
          {savedPlaces.length > 0 && (
            <ThemedText style={styles.savedPlacesTitle}>Saved Places</ThemedText>
          )}
          <FlatList
            data={savedPlaces}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setRegion({
                    latitude: item.latitude,
                    longitude: item.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  });
                  toggleDrawer();
                }}
              >
                <Feather name="map-pin" size={20} color="#000" style={{ marginRight: 10 }} />
                <ThemedText>{item.name}</ThemedText>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: 70,
    left: 10,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    elevation: 5,
  },

  searchContainer: {
    position: 'absolute',
    left: 55,
    right: 5,
    top: 65,
    zIndex: 10,
  },

  searchInput: {
    width: '100%',
    padding: 15,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 25,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2e4b6d',
    fontWeight: '500',
    paddingLeft: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },

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
  drawerHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  drawerProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  drawerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e4b6d',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10,
  },
  savedPlacesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e4b6d',
    marginTop: 20,
    marginBottom: 10,
  },
});
