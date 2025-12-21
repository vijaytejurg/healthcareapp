/**
 * Order Service
 * Real-time Firestore operations for pharmacy orders
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
 * Get pharmacy's orders in real-time
 */
export const subscribeToPharmacyOrders = (pharmacyId, callback) => {
  if (!pharmacyId) {
    console.warn('subscribeToPharmacyOrders: pharmacyId is required');
    return () => {};
  }

  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('pharmacyId', '==', pharmacyId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        }));
        callback(orders);
      },
      (error) => {
        console.error('Error in subscribeToPharmacyOrders:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up order listener:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Get today's orders for pharmacy
 */
export const getTodayOrders = async (pharmacyId) => {
  if (!pharmacyId) return [];

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('pharmacyId', '==', pharmacyId),
      where('createdAt', '>=', today),
      where('createdAt', '<', tomorrow),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }));
  } catch (error) {
    console.error('Error fetching today orders:', error);
    return [];
  }
};

/**
 * Get pharmacy's today stats
 */
export const getPharmacyTodayStats = async (pharmacyId) => {
  if (!pharmacyId) {
    return { orders: 0, pending: 0, revenue: 0 };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('pharmacyId', '==', pharmacyId),
      where('createdAt', '>=', today),
      where('createdAt', '<', tomorrow)
    );

    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((doc) => doc.data());

    const stats = {
      orders: orders.length,
      pending: orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length,
      revenue: orders
        .filter((o) => o.status === 'delivered' && o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    };

    return stats;
  } catch (error) {
    console.error('Error fetching pharmacy stats:', error);
    return { orders: 0, pending: 0, revenue: 0 };
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

