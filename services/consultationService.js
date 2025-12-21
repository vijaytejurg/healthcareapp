/**
 * Consultation Service
 * Real-time Firestore operations for consultations
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
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../src/firebase';

/**
 * Get doctor's consultations in real-time
 */
export const subscribeToDoctorConsultations = (doctorId, callback) => {
  if (!doctorId) {
    console.warn('subscribeToDoctorConsultations: doctorId is required');
    return () => {};
  }

  try {
    const consultationsRef = collection(db, 'consultations');
    const q = query(
      consultationsRef,
      where('doctorId', '==', doctorId),
      orderBy('scheduledAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const consultations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          scheduledAt: doc.data().scheduledAt?.toDate?.() || doc.data().scheduledAt,
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        }));
        callback(consultations);
      },
      (error) => {
        console.error('Error in subscribeToDoctorConsultations:', error);
        // Return empty array on error
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up consultation listener:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Get today's consultations for doctor
 */
export const getTodayConsultations = async (doctorId) => {
  if (!doctorId) return [];

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const consultationsRef = collection(db, 'consultations');
    const q = query(
      consultationsRef,
      where('doctorId', '==', doctorId),
      where('scheduledAt', '>=', today),
      where('scheduledAt', '<', tomorrow),
      where('status', 'in', ['pending', 'accepted', 'in_progress']),
      orderBy('scheduledAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      scheduledAt: doc.data().scheduledAt?.toDate?.() || doc.data().scheduledAt,
    }));
  } catch (error) {
    console.error('Error fetching today consultations:', error);
    return [];
  }
};

/**
 * Get doctor's today stats
 */
export const getDoctorTodayStats = async (doctorId) => {
  if (!doctorId) {
    return { consultations: 0, patients: 0, earnings: 0 };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const consultationsRef = collection(db, 'consultations');
    const q = query(
      consultationsRef,
      where('doctorId', '==', doctorId),
      where('scheduledAt', '>=', today),
      where('scheduledAt', '<', tomorrow)
    );

    const snapshot = await getDocs(q);
    const consultations = snapshot.docs.map((doc) => doc.data());

    const stats = {
      consultations: consultations.length,
      patients: new Set(consultations.map((c) => c.patientId || '').filter(Boolean)).size,
      earnings: consultations
        .filter((c) => c.status === 'completed' && c.paymentStatus === 'paid')
        .reduce((sum, c) => sum + (c.fee || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    return { consultations: 0, patients: 0, earnings: 0 };
  }
};

/**
 * Get upcoming consultations (next 5)
 */
export const getUpcomingConsultations = async (doctorId, limitCount = 5) => {
  if (!doctorId) return [];

  try {
    const now = new Date();
    const consultationsRef = collection(db, 'consultations');
    const q = query(
      consultationsRef,
      where('doctorId', '==', doctorId),
      where('scheduledAt', '>=', now),
      where('status', 'in', ['pending', 'accepted', 'in_progress']),
      orderBy('scheduledAt', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const consultations = [];

    for (const docSnap of snapshot.docs) {
      try {
        const data = docSnap.data();
        let patientName = 'Patient';
        
        // Get patient name if patientId exists
        if (data.patientId) {
          try {
            const patientDoc = await getDoc(doc(db, 'users', data.patientId));
            const patientData = patientDoc.exists() ? patientDoc.data() : null;
            patientName = patientData?.name || 'Patient';
          } catch (err) {
            console.warn('Error fetching patient name:', err);
          }
        }

        consultations.push({
          id: docSnap.id,
          patientName,
          patientId: data.patientId,
          time: data.scheduledAt?.toDate?.() || data.scheduledAt,
          reason: data.symptoms || data.reason || 'General consultation',
          status: data.status || 'pending',
        });
      } catch (err) {
        console.warn('Error processing consultation:', err);
      }
    }

    return consultations;
  } catch (error) {
    console.error('Error fetching upcoming consultations:', error);
    return [];
  }
};

