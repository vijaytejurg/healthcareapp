/**
 * Script to create a user account in Firebase
 * Run with: node scripts/createUser.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC8fmZuI65u_aY2Cj5OE2OIiCvnBiYIcOM",
  authDomain: "healthcare-287c1.firebaseapp.com",
  projectId: "healthcare-287c1",
  storageBucket: "healthcare-287c1.firebasestorage.app",
  messagingSenderId: "211709373162",
  appId: "1:211709373162:web:5c3cc433376f16c7000593",
  measurementId: "G-MRZ4B0W2QV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createUser() {
  const email = 'vijaytejurg@gmail.com';
  const password = 'vijaytejurg@one8';
  const userData = {
    name: 'Vijay Tejurg',
    role: 'patient', // You can change this to 'doctor', 'blood_donor', etc.
    age: 25,
    gender: 'Male',
    bloodGroup: 'O+',
  };

  try {
    console.log('Creating Firebase Auth user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✓ Firebase Auth user created:', user.uid);

    // Create comprehensive user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: email.toLowerCase(),
      name: userData.name,
      role: userData.role,
      profilePhoto: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      verificationStatus: 'verified',
      lastLoginAt: serverTimestamp(),
      
      // Role-specific fields
      ...(userData.role === 'patient' && {
        age: userData.age,
        gender: userData.gender,
        bloodGroup: userData.bloodGroup,
        medicalHistory: [],
        allergies: [],
        emergencyContact: null,
      }),
      
      // Additional metadata
      metadata: {
        createdBy: 'system',
        source: 'manual_creation',
        version: '1.0.0',
      },
      
      // Preferences
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        language: 'en',
        theme: 'light',
      },
      
      // Statistics
      stats: {
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        consultationsCount: 0,
        ordersCount: 0,
      },
    };

    console.log('Creating Firestore user profile...');
    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log('✓ Firestore user profile created');

    console.log('\n✅ User account created successfully!');
    console.log('Email:', email);
    console.log('User ID:', user.uid);
    console.log('Role:', userData.role);
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠ User already exists. Updating profile...');
      // Try to get existing user and update profile
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          ...userProfile,
          updatedAt: serverTimestamp(),
        });
        console.log('✓ User profile updated');
      }
    } else {
      console.error('❌ Error creating user:', error.message);
      process.exit(1);
    }
  }
}

createUser();

