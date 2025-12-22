/**
 * AuthContext - Global Authentication State Management
 * Provides real-time auth state and user data throughout the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../src/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * AuthProvider - Manages authentication state and user data
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase Auth user
  const [userData, setUserData] = useState(null); // Firestore user data
  const [loading, setLoading] = useState(true); // Initial loading state

  useEffect(() => {
    let unsubscribeUser = null;
    let isMounted = true;
    
    console.log('🔄 AuthContext: Setting up auth state listener...');
    
    // Listen to Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      console.log('🔄 AuthContext: onAuthStateChanged fired, firebaseUser:', firebaseUser ? firebaseUser.uid : 'null');
      
      // Clean up previous Firestore listener if it exists
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }
      
      if (firebaseUser) {
        // User is authenticated
        setUser(firebaseUser);
        console.log('✅ Firebase Auth user detected:', firebaseUser.uid);
        
        // Listen to user document in Firestore for real-time updates
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Try to get document immediately (helps with new signups)
        const fetchUserDoc = async () => {
          try {
            // Retry logic for new signups - wait for document to appear
            let retries = 0;
            const maxRetries = 10;
            
            while (retries < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 300));
              const docSnap = await getDoc(userDocRef);
              
              if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData({
                  id: docSnap.id,
                  ...data,
                  createdAt: data.createdAt?.toDate?.() || data.createdAt,
                  updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                });
                console.log('✅ User document found (attempt ' + (retries + 1) + '):', data.role);
                setLoading(false);
                return;
              }
              
              retries++;
              console.log('⏳ Waiting for user document... (attempt ' + retries + '/' + maxRetries + ')');
            }
            
            console.log('⚠️ User document not found after retries, waiting for snapshot...');
          } catch (error) {
            console.error('❌ Error getting user document:', error);
            console.error('Error details:', error.message);
          }
        };
        fetchUserDoc();
        
        // Then set up real-time listener
        unsubscribeUser = onSnapshot(
          userDocRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              setUserData({
                id: docSnapshot.id,
                ...data,
                // Convert Firestore timestamps to readable format
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
              });
              console.log('✅ User data updated from Firestore snapshot:', data.role);
              console.log('✅ isAuthenticated will be:', !!firebaseUser && !!data);
            } else {
              // User document doesn't exist - might need to complete profile
              console.log('⚠️ User document does not exist in Firestore');
              setUserData(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error('❌ Error in Firestore snapshot:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            setUserData(null);
            setLoading(false);
          }
        );
      } else {
        // User is signed out - clear all state immediately
        console.log('🔐 AuthContext: User signed out detected (firebaseUser is null)');
        if (isMounted) {
          setUser(null);
          setUserData(null);
          setLoading(false);
          console.log('✅ AuthContext: State cleared - user is logged out, loading set to false');
        }
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('🔄 AuthContext: Cleaning up auth listeners...');
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, []);

  /**
   * Sign out user - Real-time logout
   */
  const signOut = async () => {
    try {
      console.log('🔄 AuthContext.signOut() called');
      
      // Step 1: Sign out from Firebase Auth FIRST (this is the critical step)
      console.log('🔄 Step 1: Calling firebaseSignOut(auth)...');
      await firebaseSignOut(auth);
      console.log('✅ Step 1: firebaseSignOut() completed successfully');
      
      // Step 2: Clear local state immediately after Firebase signOut
      console.log('🔄 Step 2: Clearing local state (user, userData)...');
      setUser(null);
      setUserData(null);
      console.log('✅ Step 2: Local state cleared');
      
      // Step 3: onAuthStateChanged will fire automatically and confirm logout
      console.log('✅ AuthContext: signOut() complete - onAuthStateChanged will fire');
      
      return true;
    } catch (error) {
      console.error('❌ AuthContext: signOut() ERROR:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Even if Firebase signOut fails, clear local state
      console.log('🔄 Clearing local state despite error...');
      setUser(null);
      setUserData(null);
      
      // Re-throw error so caller can handle it
      throw error;
    }
  };

  const value = {
    // Auth state
    user,
    userData,
    loading,
    
    // Role checks
    isDoctor: userData?.role === 'doctor',
    isPatient: userData?.role === 'patient',
    isPharmacy: userData?.role === 'pharmacy',
    isDeliveryPartner: userData?.role === 'delivery_partner',
    isHospitalClinic: userData?.role === 'hospital_clinic',
    
    // Role
    role: userData?.role,
    
    // Quick access
    userName: userData?.name,
    userEmail: userData?.email,
    
    // Actions
    signOut,
    
    // Auth status
    isAuthenticated: !!user && !!userData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
