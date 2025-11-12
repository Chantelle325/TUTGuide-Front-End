import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { SoundProvider } from '../app/SoundContext'; // <-- import your context

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <SoundProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* 👇 This will hide the header for *all* screens */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="admin-dashboard" />
          <Stack.Screen name="manage-facilities" />
          <Stack.Screen name="manage-buildings" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SoundProvider>
  );
}



// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import axios from 'axios';
// import * as Device from 'expo-device';
// import { useFonts } from 'expo-font';
// import * as Notifications from 'expo-notifications';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useEffect } from 'react';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/useColorScheme';
// import { SoundProvider } from '../app/SoundContext';

// // 🔔 Configure how notifications behave when received
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowBanner: true,   // 👈 replaces shouldShowAlert
//     shouldShowList: true,     // 👈 shows in notification tray
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });


// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     registerForPushNotificationsAsync();
//   }, []);

//   if (!loaded) return null;

//   // 🔔 Function to register for push notifications
//   async function registerForPushNotificationsAsync() {
//     try {
//       if (!Device.isDevice) {
//         alert('Push notifications only work on physical devices.');
//         return;
//       }

//       // Request permission
//       const { status: existingStatus } = await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;

//       if (existingStatus !== 'granted') {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }

//       if (finalStatus !== 'granted') {
//         alert('Permission not granted for notifications');
//         return;
//       }

//       // ✅ Get FCM/Expo push token
//       const { data: fcmToken } = await Notifications.getExpoPushTokenAsync({
//         projectId: 'tutguide-236f6', // e.g., tutguide-12345
//       });

//       console.log('✅ Notification Token:', fcmToken);

//       // ✅ Send token to your backend
//       await axios.post('https://ismabasa123.loca.lt/api/notifications/token', {
//         admin_email: 'admin@example.com', // Replace with logged-in user email dynamically if needed
//         fcmToken,
//         allowNotifications: true,
//       });

//       console.log('✅ Token successfully saved to backend');
//     } catch (error:any) {
//       console.error('❌ Failed to register for notifications:', error.message);
//     }
//   }

//   return (
//     <SoundProvider>
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         <Stack screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="(tabs)" />
//           <Stack.Screen name="admin-dashboard" />
//           <Stack.Screen name="manage-facilities" />
//           <Stack.Screen name="manage-buildings" />
//           <Stack.Screen name="+not-found" />
//         </Stack>
//         <StatusBar style="auto" />
//       </ThemeProvider>
//     </SoundProvider>
//   );
// }
