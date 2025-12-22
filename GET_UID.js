/**
 * Quick script to get your UID
 * Run this in browser console after signing up
 */

// Method 1: Get from Firebase Auth
import { auth } from './src/firebase';
if (auth.currentUser) {
  console.log('✅ You are logged in!');
  console.log('UID:', auth.currentUser.uid);
  console.log('Email:', auth.currentUser.email);
} else {
  console.log('❌ No user logged in. Please sign up first!');
}

// Method 2: Get from Firestore (if you know your email)
import { db } from './src/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function findUIDByEmail(email) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        console.log('Found user:');
        console.log('UID:', doc.id);
        console.log('Data:', doc.data());
      });
    } else {
      console.log('No user found with email:', email);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage: findUIDByEmail('your-email@example.com');

