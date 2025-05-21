import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB2_G_imZ33uVllipJI73MpNTq-lMGTqjw",
  authDomain: "manic-52c32.firebaseapp.com",
  projectId: "manic-52c32",
  storageBucket: "manic-52c32.appspot.com",
  messagingSenderId: "404105056183",
  appId: "1:404105056183:web:ed1e34b433c69432f0a232",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 