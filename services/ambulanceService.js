/**
 * Ambulance Service
 * Real-time Firestore operations for ambulance requests
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../src/firebase';

/**
 * Get active emergency requests in real-time
 */
export const subscribeToEmergencyRequests = (callback) => {
  try {
    const requestsRef = collection(db, 'emergencyRequests');
    const q = query(
      requestsRef,
      where('status', 'in', ['pending', 'accepted']),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        }));
        callback(requests);
      },
      (error) => {
        console.error('Error in subscribeToEmergencyRequests:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up emergency requests listener:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Get ambulance driver's today stats
 */
export const getAmbulanceTodayStats = async (driverId) => {
  if (!driverId) {
    return { trips: 0, active: 0, earnings: 0 };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tripsRef = collection(db, 'ambulanceTrips');
    const q = query(
      tripsRef,
      where('driverId', '==', driverId),
      where('createdAt', '>=', today),
      where('createdAt', '<', tomorrow)
    );

    const snapshot = await getDocs(q);
    const trips = snapshot.docs.map((doc) => doc.data());

    const stats = {
      trips: trips.length,
      active: trips.filter((t) => t.status === 'in_progress').length,
      earnings: trips
        .filter((t) => t.status === 'completed' && t.paymentStatus === 'paid')
        .reduce((sum, t) => sum + (t.fee || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error fetching ambulance stats:', error);
    return { trips: 0, active: 0, earnings: 0 };
  }
};

/**
 * Accept emergency request
 */
export const acceptEmergencyRequest = async (requestId, driverId) => {
  const requestRef = doc(db, 'emergencyRequests', requestId);
  await updateDoc(requestRef, {
    status: 'accepted',
    driverId,
    acceptedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

