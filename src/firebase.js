import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8fmZuI65u_aY2Cj5OE2OIiCvnBiYIcOM",
  authDomain: "healthcare-287c1.firebaseapp.com",
  projectId: "healthcare-287c1",
  storageBucket: "healthcare-287c1.firebasestorage.app",
  messagingSenderId: "211709373162",
  appId: "1:211709373162:web:5c3cc433376f16c7000593",
  measurementId: "G-MRZ4B0W2QV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

