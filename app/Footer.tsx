// components/Footer.tsx
import { ThemedText } from '@/components/ThemedText';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type TabRoute = '/signin' | '/Report' | '/profile';

const tabs: { name: string; route: TabRoute; icon: keyof typeof Feather.glyphMap }[] = [
  { name: 'Map', route: '/signin', icon: 'map-pin' },
  { name: 'Report', route: '/Report', icon: 'message-square' },
  { name: 'Account', route: '/profile', icon: 'user' },
];

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname(); // gets the current route

  return (
    <View style={styles.footer}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;

        return (
          <TouchableOpacity
            key={tab.route}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => router.push(tab.route)}
          >
            <View style={styles.tabContent}>
              <Feather name={tab.icon} size={24} color={isActive ? 'black' : '#9fc3c3'} />
              <ThemedText style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.name}
              </ThemedText>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
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
    borderTopColor: 'white',
    backgroundColor: 'white',
  },
  tab: { alignItems: 'center', padding: 10, flex: 1 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: 'black' },
  tabContent: { alignItems: 'center' },
  tabText: { fontWeight: 'bold', fontSize: 14, color: '#9fc3c3', textTransform: 'uppercase' },
  activeTabText: { color: 'black' },
});
