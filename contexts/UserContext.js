import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../src/firebase';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Listen to user document in Firestore for real-time updates
        const unsubscribeUser = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              setUserData({ id: docSnapshot.id, ...docSnapshot.data() });
            } else {
              setUserData(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching user data:', error);
            setUserData(null);
            setLoading(false);
          }
        );

        return () => unsubscribeUser();
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const value = {
    user,
    userData,
    loading,
    isDoctor: userData?.role === 'doctor',
    isPatient: userData?.role === 'patient',
    isBloodDonor: userData?.role === 'blood_donor',
    isMedicineDelivery: userData?.role === 'medicine_delivery',
    isAmbulanceDriver: userData?.role === 'ambulance_driver',
    isAdmin: userData?.role === 'admin',
    role: userData?.role,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

