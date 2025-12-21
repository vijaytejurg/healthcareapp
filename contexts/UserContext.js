import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../src/firebase';
import { updateLastLogin, getRoleCollection } from '../utils/userService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

/**
 * UserProvider - Real-time user data management
 * Provides user authentication state and Firestore user data
 * Updates automatically when user data changes in Firestore
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser = null;
    let unsubscribeMain = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // First, get role from main users collection
        const mainUserRef = doc(db, 'users', firebaseUser.uid);
        const mainUserDoc = await getDoc(mainUserRef);
        
        if (mainUserDoc.exists()) {
          const mainData = mainUserDoc.data();
          const role = mainData.role || 'patient';
          
          // Update last login timestamp
          updateLastLogin(firebaseUser.uid, role).catch(console.error);
          
          // Listen to role-based subcollection for REAL-TIME updates
          const roleCollection = getRoleCollection(role);
          const roleUserRef = doc(db, `users/${roleCollection}`, firebaseUser.uid);
          
          unsubscribeUser = onSnapshot(
            roleUserRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setUserData({ 
                  id: docSnapshot.id, 
                  ...data,
                  // Convert Firestore timestamps to readable format
                  createdAt: data.createdAt?.toDate?.() || data.createdAt,
                  updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                  lastLoginAt: data.lastLoginAt?.toDate?.() || data.lastLoginAt,
                });
              } else {
                // Fallback to main collection
                setUserData({ 
                  id: mainUserDoc.id, 
                  ...mainData,
                });
              }
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching user data:', error);
              // Fallback to main collection
              setUserData({ 
                id: mainUserDoc.id, 
                ...mainData,
              });
              setLoading(false);
            }
          );
          
          // Also listen to main collection for role changes
          unsubscribeMain = onSnapshot(mainUserRef, (mainDoc) => {
            if (mainDoc.exists()) {
              const newMainData = mainDoc.data();
              // If role changed, update state to trigger re-fetch
              if (newMainData.role !== role) {
                // Role changed - will trigger useEffect to re-fetch
                setUserData(prev => prev ? { ...prev, role: newMainData.role } : null);
              }
            }
          });
        } else {
          setUserData(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        if (unsubscribeUser) {
          unsubscribeUser();
        }
        if (unsubscribeMain) {
          unsubscribeMain();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) {
        unsubscribeUser();
      }
      if (unsubscribeMain) {
        unsubscribeMain();
      }
    };
  }, []);

  const value = {
    // Firebase Auth user
    user,
    
    // Firestore user data (real-time)
    userData,
    
    // Loading state
    loading,
    
    // Role checks
    isDoctor: userData?.role === 'doctor',
    isPatient: userData?.role === 'patient',
    isBloodDonor: userData?.role === 'blood_donor',
    isMedicineDelivery: userData?.role === 'medicine_delivery',
    isAmbulanceDriver: userData?.role === 'ambulance_driver',
    isPharmacyShop: userData?.role === 'pharmacy_shop',
    isAdmin: userData?.role === 'admin',
    
    // Role
    role: userData?.role,
    
    // Quick access to common fields
    userName: userData?.name,
    userEmail: userData?.email,
    userPhoto: userData?.profilePhoto,
    
    // Statistics
    stats: userData?.stats || {},
    
    // Preferences
    preferences: userData?.preferences || {},
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

