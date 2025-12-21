/**
 * User Service - Beautiful Architecture for User Info Storage
 * Handles all user-related operations with real-time updates
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
  updateDoc, 
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../src/firebase';

/**
 * User Data Structure Architecture - ORGANIZED BY ROLES
 * 
 * Main lookup collection:
 * users/{userId} - Quick reference with basic info and role
 * 
 * Role-based subcollections (ORGANIZED):
 * users/patients/{userId} - All patient-specific data
 * users/doctors/{userId} - All doctor-specific data
 * users/blood_donors/{userId} - All blood donor data
 * users/delivery_partners/{userId} - All delivery partner data
 * users/ambulance_drivers/{userId} - All ambulance driver data
 * users/admins/{userId} - All admin data
 * 
 * This structure allows:
 * - Easy querying by role
 * - Organized data storage
 * - Better security rules
 * - Scalable architecture
 */

/**
 * Get role collection path
 */
export const getRoleCollection = (role) => {
  const roleMap = {
    'patient': 'patients',
    'doctor': 'doctors',
    'blood_donor': 'blood_donors',
    'medicine_delivery': 'delivery_partners',
    'ambulance_driver': 'ambulance_drivers',
    'pharmacy_shop': 'pharmacy_shops',
    'admin': 'admins',
  };
  return roleMap[role] || 'patients';
};

/**
 * Create a new user account with comprehensive profile
 * Stores in organized role-based subcollections
 */
export const createUserAccount = async (email, password, userData = {}) => {
  try {
    // Step 1: Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Update auth profile
    if (userData.name) {
      await updateAuthProfile(user, {
        displayName: userData.name,
      });
    }

    // Step 3: Build comprehensive user profile
    const userProfile = buildUserProfile(user.uid, email, userData);
    const role = userData.role || 'patient';
    const roleCollection = getRoleCollection(role);

    // Step 4: Store in main users collection (for quick lookup) - MUST BE FIRST
    const mainUserRef = doc(db, 'users', user.uid);
    await setDoc(mainUserRef, {
      uid: user.uid,
      email: userProfile.email,
      name: userProfile.name,
      role: role,
      profilePhoto: userProfile.profilePhoto,
      isActive: true,
      verificationStatus: userProfile.verificationStatus,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    console.log('✅ Main user document created in users collection');

    // Step 5: Store full profile in role-based subcollection (ORGANIZED)
    const roleUserRef = doc(db, `users/${roleCollection}`, user.uid);
    await setDoc(roleUserRef, userProfile);
    console.log('✅ Role-specific profile stored in:', `users/${roleCollection}/${user.uid}`);

    // Step 6: Small delay to ensure Firestore has processed the writes
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('✅ User account created successfully:', user.uid);
    console.log('📁 Stored in:', `users/${roleCollection}/${user.uid}`);
    return { user, userProfile };
  } catch (error) {
    console.error('❌ Error creating user account:', error);
    throw error;
  }
};

/**
 * Build comprehensive user profile structure
 */
const buildUserProfile = (uid, email, userData) => {
  const baseProfile = {
    // Basic Information
    uid,
    email: email.toLowerCase().trim(),
    name: userData.name || 'User',
    profilePhoto: userData.profilePhoto || null,
    role: userData.role || 'patient',
    
    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    
    // Status
    isActive: true,
    verificationStatus: userData.role === 'doctor' ? 'pending' : 'verified',
    
    // Role-Specific Fields
    ...getRoleSpecificFields(userData.role, userData),
    
    // Preferences
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      language: 'en',
      theme: 'light',
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
      },
    },
    
    // Statistics
    stats: {
      postsCount: 0,
      reelsCount: 0,
      articlesCount: 0,
      followersCount: 0,
      followingCount: 0,
      consultationsCount: 0,
      ordersCount: 0,
      donationsCount: 0,
    },
    
    // Metadata
    metadata: {
      createdBy: 'system',
      source: 'manual_creation',
      version: '1.0.0',
      deviceInfo: null,
    },
  };

  return baseProfile;
};

/**
 * Get role-specific fields based on user role
 */
const getRoleSpecificFields = (role, userData) => {
  switch (role) {
    case 'doctor':
      return {
        specialization: userData.specialization || '',
        licenseNumber: userData.licenseNumber || '',
        hospitalName: userData.hospitalName || '',
        verified: false,
        experience: userData.experience || 0,
        qualifications: userData.qualifications || [],
        consultationFee: userData.consultationFee || 0,
        availability: {
          status: 'available',
          schedule: {},
        },
      };
    
    case 'patient':
      return {
        age: userData.age || null,
        gender: userData.gender || '',
        bloodGroup: userData.bloodGroup || '',
        medicalHistory: [],
        allergies: [],
        medications: [],
        emergencyContact: null,
        insuranceInfo: null,
      };
    
    case 'blood_donor':
      return {
        bloodGroup: userData.bloodGroup || '',
        availabilityStatus: userData.availabilityStatus || 'available',
        lastDonationDate: null,
        donationCount: 0,
        location: userData.location || null,
      };
    
    case 'medicine_delivery':
      return {
        serviceArea: userData.serviceArea || '',
        vehicleType: userData.vehicleType || 'bike',
        deliveryCount: 0,
        rating: 0,
        availability: {
          status: 'available',
          workingHours: {},
        },
      };
    
    case 'ambulance_driver':
      return {
        vehicleNumber: userData.vehicleNumber || '',
        vehicleType: userData.vehicleType || 'ambulance',
        licenseNumber: userData.licenseNumber || '',
        serviceArea: userData.serviceArea || '',
        availability: {
          status: 'available',
          currentLocation: null,
        },
        serviceCount: 0,
        rating: 0,
      };
    
    case 'pharmacy_shop':
      return {
        shopName: userData.shopName || userData.name || '',
        licenseNumber: userData.licenseNumber || '',
        serviceArea: userData.serviceArea || '',
        address: userData.address || '',
        phone: userData.phone || '',
        workingHours: userData.workingHours || {},
        inventoryCount: 0,
        orderCount: 0,
        rating: 0,
        verified: false,
      };
    
    case 'admin':
      return {
        permissions: ['all'],
        accessLevel: 'super',
      };
    
    default:
      return {};
  }
};

/**
 * Get user profile by ID (real-time)
 * Fetches from role-based subcollection
 */
export const getUserProfile = (userId, role, callback) => {
  const roleCollection = getRoleCollection(role);
  const userRef = doc(db, `users/${roleCollection}`, userId);
  
  return onSnapshot(
    userRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback({ id: docSnapshot.id, ...docSnapshot.data() });
      } else {
        // Fallback to main users collection
        const mainRef = doc(db, 'users', userId);
        onSnapshot(mainRef, (mainDoc) => {
          if (mainDoc.exists()) {
            callback({ id: mainDoc.id, ...mainDoc.data() });
          } else {
            callback(null);
          }
        });
      }
    },
    (error) => {
      console.error('Error fetching user profile:', error);
      callback(null);
    }
  );
};

/**
 * Update user profile
 * Updates both main collection and role-based subcollection
 */
export const updateUserProfile = async (userId, role, updates) => {
  try {
    const roleCollection = getRoleCollection(role);
    
    // Update main users collection
    const mainUserRef = doc(db, 'users', userId);
    await updateDoc(mainUserRef, {
      ...(updates.name && { name: updates.name }),
      ...(updates.profilePhoto && { profilePhoto: updates.profilePhoto }),
      ...(updates.isActive !== undefined && { isActive: updates.isActive }),
    });

    // Update role-based subcollection
    const roleUserRef = doc(db, `users/${roleCollection}`, userId);
    await updateDoc(roleUserRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user statistics
 * Updates in role-based subcollection
 */
export const updateUserStats = async (userId, role, statUpdates) => {
  try {
    const roleCollection = getRoleCollection(role);
    const userRef = doc(db, `users/${roleCollection}`, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentStats = userDoc.data().stats || {};
      await updateDoc(userRef, {
        stats: {
          ...currentStats,
          ...statUpdates,
        },
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

/**
 * Update last login timestamp
 * Updates in both main collection and role-based subcollection
 */
export const updateLastLogin = async (userId, role) => {
  try {
    // Update main collection
    await updateDoc(doc(db, 'users', userId), {
      lastLoginAt: serverTimestamp(),
    });
    
    // Update role-based subcollection
    const roleCollection = getRoleCollection(role);
    await updateDoc(doc(db, `users/${roleCollection}`, userId), {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

/**
 * Search users by role
 * Queries the organized role-based subcollection
 */
export const getUsersByRole = async (role) => {
  try {
    const roleCollection = getRoleCollection(role);
    const usersRef = collection(db, `users/${roleCollection}`);
    const q = query(usersRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};

/**
 * Check if user exists
 */
export const userExists = async (email) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

