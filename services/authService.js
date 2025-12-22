/**
 * Auth Service - Firebase Authentication & Firestore Operations
 * Handles all authentication-related operations
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateAuthProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../src/firebase';

/**
 * Create a new user account
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User full name
 * @param {string} role - User role (doctor, patient, pharmacy, delivery_partner, hospital_clinic)
 * @returns {Promise<Object>} User credential and user data
 */
export const signUp = async (email, password, name, role, roleSpecificData = {}) => {
  try {
    console.log('🔐 Step 1.1: Creating Firebase Auth user...');
    // Step 1: Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth user created! UID:', user.uid);

    console.log('🔐 Step 1.2: Updating user profile...');
    // Step 2: Update Firebase Auth profile
    await updateAuthProfile(user, {
      displayName: name,
    });
    console.log('✅ Profile updated!');

    console.log('💾 Step 1.3: Creating Firestore document...');
    // Step 3: Create user document in Firestore at users/{uid}
    // Document ID MUST equal Firebase Auth UID (security requirement)
    const userDocRef = doc(db, 'users', user.uid);
    
    // Build base user document
    const userDocument = {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: role, // doctor | patient | pharmacy | delivery | hospital
      active: true,
      profileCompleted: false, // Will be set to true after profile completion
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add role-specific data if provided during signup
    if (role === 'doctor' && roleSpecificData) {
      userDocument.specialization = roleSpecificData.specialization || '';
      userDocument.licenseNumber = roleSpecificData.licenseNumber || '';
      userDocument.hospitalName = roleSpecificData.hospitalName || '';
      userDocument.experience = roleSpecificData.experience ? parseInt(roleSpecificData.experience) : 0;
      userDocument.qualifications = roleSpecificData.qualifications || [];
      userDocument.verificationStatus = 'pending';
    }

    if (role === 'patient' && roleSpecificData) {
      userDocument.age = roleSpecificData.age ? parseInt(roleSpecificData.age) : null;
      userDocument.gender = roleSpecificData.gender || '';
      userDocument.bloodGroup = roleSpecificData.bloodGroup || '';
    }

    if (role === 'pharmacy' && roleSpecificData) {
      userDocument.shopName = roleSpecificData.shopName || '';
      userDocument.licenseNumber = roleSpecificData.licenseNumber || '';
      userDocument.serviceArea = roleSpecificData.serviceArea || '';
    }

    if (role === 'delivery' && roleSpecificData) {
      userDocument.vehicleNumber = roleSpecificData.vehicleNumber || '';
      userDocument.serviceArea = roleSpecificData.serviceArea || '';
    }

    if (role === 'hospital' && roleSpecificData) {
      userDocument.licenseNumber = roleSpecificData.licenseNumber || '';
      userDocument.hospitalType = roleSpecificData.hospitalType || '';
      userDocument.beds = roleSpecificData.beds ? parseInt(roleSpecificData.beds) : 0;
    }

    await setDoc(userDocRef, userDocument);
    console.log('✅ Firestore document created at users/', user.uid);
    
    console.log('🔍 Step 1.4: Verifying document was created...');
    // Verify the document was created
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      console.log('✅ Firestore document verified - exists!');
      console.log('📄 Document data:', docSnap.data());
    } else {
      console.log('⚠️ Firestore document not found immediately (may take a moment)');
    }
    
    // Small delay to ensure everything is synced
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('✅✅✅ ALL STEPS COMPLETED SUCCESSFULLY!');
    return { user, userData: { uid: user.uid, email, name, role } };
  } catch (error) {
    console.error('❌❌❌ ERROR IN signUp FUNCTION!');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Full Error Object:', error);
    throw error;
  }
};

/**
 * Sign in existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User credential
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    console.log('✅ User signed in successfully:', userCredential.user.uid);
    return userCredential;
  } catch (error) {
    console.error('❌ Error signing in:', error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 * @param {string} uid - User UID
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error('User profile not found');
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt, // Convert Firestore timestamp to Date
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Get user-friendly error message
 * @param {Error} error - Firebase error
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please login instead.';
    case 'auth/invalid-email':
      return 'Invalid email address. Please check and try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};
