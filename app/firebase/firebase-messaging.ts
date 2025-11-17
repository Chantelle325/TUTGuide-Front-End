import messaging from '@react-native-firebase/messaging';

//Background/quit state FCM handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background', remoteMessage);

    // Optional: show an alert (only works if app is in foreground)
  // Alert.alert(remoteMessage.notification?.title || '', remoteMessage.notification?.body || '');

});