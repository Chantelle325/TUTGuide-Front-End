import { ThemedText } from '@/components/ThemedText';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
  Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.75;

const SOUTH_CAMPUS_CENTER = {
  latitude: -25.54053,
  longitude: 28.09529,
  latitudeDelta: 0.004,
  longitudeDelta: 0.004,
};

export default function DashboardScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [savedPlaces, setSavedPlaces] = useState<Array<{ name: string; latitude: number; longitude: number }>>([]);

  const mapRef = useRef<MapView>(null);

  const locations = [
    { name: 'Main Gate', latitude: -25.54085, longitude: 28.0946 },
    { name: 'Administration Building', latitude: -25.54043, longitude: 28.0959 },
    { name: 'Library', latitude: -25.54072, longitude: 28.0963 },
    { name: 'Engineering Faculty', latitude: -25.54112, longitude: 28.0965 },
    { name: 'ICT Building', latitude: -25.54055, longitude: 28.0967 },
    { name: 'Student Centre', latitude: -25.54034, longitude: 28.0954 },
    { name: 'Ruth First Hall', latitude: -25.54063, longitude: 28.0957 },
    { name: 'Lecture Halls Block A', latitude: -25.54025, longitude: 28.0962 },
    { name: 'Lecture Halls Block B', latitude: -25.5401, longitude: 28.0966 },
    { name: 'Parking Area', latitude: -25.54125, longitude: 28.0949 },
    { name: 'Cafeteria', latitude: -25.54078, longitude: 28.0952 },
    { name: 'Security Office', latitude: -25.54093, longitude: 28.0947 },
  ];

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

  const requestLocation = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to show your position.');
        return;
      }
      setHasLocationPermission(true);
      const location = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateCamera({
        center: { latitude: location.coords.latitude, longitude: location.coords.longitude },
        pitch: 45,
        heading: 0,
        altitude: 300,
        zoom: 18,
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredLocations([]);
    } else {
      const filtered = locations.filter((loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  };

  const selectLocation = (loc: typeof locations[0]) => {
    setSearchQuery(loc.name);
    setFilteredLocations([]);
    mapRef.current?.animateCamera({
      center: { latitude: loc.latitude, longitude: loc.longitude },
      pitch: 45,
      heading: 0,
      altitude: 300,
      zoom: 18,
    });
  };

  const openGoogleMapsNavigation = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
    Linking.openURL(url);
  };

  const zoomIn = () => {
    mapRef.current?.getCamera().then(camera => {
      camera.zoom += 1;
      mapRef.current?.animateCamera(camera, { duration: 400 });
    });
  };

  const zoomOut = () => {
    mapRef.current?.getCamera().then(camera => {
      camera.zoom -= 1;
      mapRef.current?.animateCamera(camera, { duration: 400 });
    });
  };

  const fitAllMarkers = () => {
    if (mapRef.current) {
      const coordinates = locations.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
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
        {/* Map */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={SOUTH_CAMPUS_CENTER}
          mapType="hybrid"
          pitchEnabled
          rotateEnabled
          zoomEnabled
          scrollEnabled
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton
          onMapReady={() => {
            fitAllMarkers();
            mapRef.current?.animateCamera({
              center: SOUTH_CAMPUS_CENTER,
              pitch: 45,
              heading: 0,
              altitude: 300,
              zoom: 18,
            });
          }}
        >
          {locations.map((loc) => (
            <Marker
              key={loc.name}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              title={loc.name}
              pinColor="#007AFF"
            >
              <Callout onPress={() => openGoogleMapsNavigation(loc.latitude, loc.longitude)}>
                <View>
                  <ThemedText style={{ fontWeight: 'bold', fontSize: 14 }}>{loc.name}</ThemedText>
                  <ThemedText style={{ color: '#007AFF' }}>Tap to Navigate 🚶‍♂️</ThemedText>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Drawer Overlay */}
        {drawerOpen && <TouchableWithoutFeedback onPress={toggleDrawer}>
          <View style={styles.drawerOverlay} />
        </TouchableWithoutFeedback>}

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
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  mapRef.current?.animateCamera({
                    center: { latitude: item.latitude, longitude: item.longitude },
                    pitch: 45,
                    heading: 0,
                    altitude: 300,
                    zoom: 18,
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

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a building..."
            placeholderTextColor="#555"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {filteredLocations.length > 0 && (
            <View style={styles.dropdown}>
              <FlatList
                data={filteredLocations}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => selectLocation(item)}>
                    <ThemedText>{item.name}</ThemedText>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* Zoom & Location Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
            <Feather name="plus" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
            <Feather name="minus" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={requestLocation}>
            <Feather name="crosshair" size={22} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]} onPress={() => router.push('/dashboard')}>
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

        {/* Hamburger Menu */}
        <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
          <Feather name="menu" size={28} color="black" />
        </TouchableOpacity>
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
  searchContainer: { position: 'absolute', top: 65, left: 55, right: 15, zIndex: 10 },
  searchInput: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  dropdown: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  zoomControls: { position: 'absolute', right: 15, bottom: 120, flexDirection: 'column' },
  zoomButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    marginVertical: 5,
    elevation: 4,
    alignItems: 'center',
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
  closeButton: { position: 'absolute', right: 0, top: 0, padding: 10 },
  savedPlacesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e4b6d',
    marginTop: 20,
    marginBottom: 10,
  },
});
