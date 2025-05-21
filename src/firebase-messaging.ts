import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyB2_G_imZ33uVllipJI73MpNTq-lMGTqjw",
  authDomain: "manic-52c32.firebaseapp.com",
  projectId: "manic-52c32",
  storageBucket: "manic-52c32.firebasestorage.app",
  messagingSenderId: "404105056183",
  appId: "1:404105056183:web:ed1e34b433c69432f0a232"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = (setTokenFound: (found: boolean) => void) => {
  return getToken(messaging, { vapidKey: 'BFIeWtZlNGOb0Y3b9BSX1dyHe9RsV-2TVqgR_C7alhIeXsKYLeIK6j-spjOVwih0xbxlqpIFv6lCcahyc_sYG-0' })
    .then((currentToken) => {
      if (currentToken) {
        setTokenFound(true);
        // Збережіть токен у Firestore або в state
        console.log('FCM Token:', currentToken);
      } else {
        setTokenFound(false);
      }
    })
    .catch((err) => {
      setTokenFound(false);
      console.log('An error occurred while retrieving token. ', err);
    });
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  }); 