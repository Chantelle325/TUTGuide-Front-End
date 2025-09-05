import { ThemedText } from '@/components/ThemedText';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';


export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ username?: string | string[] }>();
  const [searchQuery, setSearchQuery] = useState('');

  const [region, setRegion] = useState({
    latitude: -25.54053,
    longitude: 28.09529,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const locations = [
    { name: 'Library', latitude: -25.7579, longitude: 28.2311 },
    { name: 'Engineering Labs', latitude: -25.7582, longitude: 28.2320 },
    { name: 'Cafeteria', latitude: -25.7585, longitude: 28.2315 },
    { name: 'Admin Building', latitude: -25.7575, longitude: 28.2305 },
    { name: 'Student Centre', latitude: -25.7578, longitude: 28.2308 },
    { name: 'Parking Area', latitude: -25.7583, longitude: 28.2309 },
  ];

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

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = locations.filter(loc =>
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

  const handleSubmitSearch = () => {
    if (searchQuery.trim() && filteredLocations.length === 0) {
      Alert.alert('No results', 'No facilities found matching your search');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Map fills entire screen */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={true}
      >
        {filteredLocations.map(loc => (
          <Marker
            key={loc.name}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            pinColor="red"
          />
        ))}
      </MapView>

      {/* Overlay elements */}
      <View style={styles.overlayContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
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

          <View style={styles.iconsSection}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/Report')}>
              <Image source={require('@/assets/images/messageicon.png')} style={styles.headerIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
              <Image source={require('@/assets/images/profile.png')} style={styles.headerIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome text */}
        <ThemedText style={styles.welcomeText}>WELCOME</ThemedText>

        {/* Search bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a facility..."
          placeholderTextColor="#9fc3c3"
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmitEditing={handleSubmitSearch}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]} onPress={() => router.push('/map')}>
            <View style={styles.tabContent}>
              <Image source={require('@/assets/images/location.png')} style={styles.tabIcon} />
              <ThemedText style={[styles.tabText, styles.activeTabText]}>Map</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={() => router.push('/saved')}>
            <View style={styles.tabContent}>
              <Image source={require('@/assets/images/home.png')} style={styles.tabIcon} />
              <ThemedText style={styles.tabText}>Saved places</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={() => router.push('/settings')}>
            <View style={styles.tabContent}>
              <Image source={require('@/assets/images/settings.png')} style={styles.tabIcon} />
              <ThemedText style={styles.tabText}>Settings</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContent: { flex: 1 }, // fully transparent overlay
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ffa500',
    backgroundColor: 'rgba(46, 75, 109, 0.8)',
    width: '100%',
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  logoSection: { flexDirection: 'row', alignItems: 'center' },
  iconsSection: { flexDirection: 'row', gap: 15 },
  iconButton: { padding: 5 },
  headerIcon: { width: 28, height: 28 },
  logoCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#2e4b6d', justifyContent: 'center', alignItems: 'center',
    marginRight: 12, borderWidth: 2, borderColor: '#ffa500',
  },
  logoImage: { width: 30, height: 30 },
  logoTextContainer: { alignItems: 'flex-start' },
  logoTextMain: { fontSize: 22, fontWeight: 'bold', color: '#ffa500', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#ffa500', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2, marginBottom: 20, textAlign:'center' },
  searchInput: { width: '100%', padding: 15, borderWidth: 2, borderColor: '#ffa500', borderRadius: 25, marginBottom: 30, fontSize: 16, backgroundColor: 'rgba(159, 195, 195, 0.7)', color: '#2e4b6d', fontWeight: '500', paddingLeft: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, borderTopWidth: 2, borderTopColor: '#ffa500', backgroundColor: 'rgba(46, 75, 109, 0.8)' },
  tab: { alignItems: 'center', padding: 10, flex: 1 },
  activeTab: { borderTopWidth: 3, borderTopColor: '#ffa500' },
  tabContent: { alignItems: 'center' },
  tabIcon: { width: 24, height: 24, marginBottom: 5, tintColor: '#9fc3c3' },
  tabText: { fontWeight: 'bold', fontSize: 14, color: '#9fc3c3', textTransform: 'uppercase' },
  activeTabText: { color: '#ffa500' },
});
