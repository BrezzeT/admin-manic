importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB2_G_imZ33uVllipJI73MpNTq-lMGTqjw",
  authDomain: "manic-52c32.firebaseapp.com",
  projectId: "manic-52c32",
  storageBucket: "manic-52c32.firebasestorage.app",
  messagingSenderId: "404105056183",
  appId: "1:404105056183:web:ed1e34b433c69432f0a232"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: '/icon-192x192.png'
    }
  );
}); 