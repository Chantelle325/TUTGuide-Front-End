// AdminNotificationHandler.js
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

export default function AdminNotificationHandler() {
  const responseListener = useRef();
  const notificationListener = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    // Foreground notification listener
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received in foreground:', notification);
      });

    // When the user taps a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);

        if (data?.type === 'report') {
          navigation.navigate('ReportDetails', { id: data.id });
        } else if (data?.type === 'building') {
          navigation.navigate('BuildingDetails', { id: data.id });
        }
      });

    // ✅ Proper cleanup using `.remove()`
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return null;
}
