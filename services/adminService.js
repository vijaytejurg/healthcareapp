/**
 * Admin Service
 * Real-time Firestore operations for admin dashboard
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../src/firebase';

/**
 * Get platform stats in real-time
 */
export const subscribeToPlatformStats = (callback) => {
  // Get total users count
  const usersRef = collection(db, 'users');
  
  // Use multiple listeners for real-time updates
  const unsubscribeUsers = onSnapshot(usersRef, async () => {
    const stats = await getPlatformStats();
    callback(stats);
  });

  return unsubscribeUsers;
};

/**
 * Get platform statistics
 */
export const getPlatformStats = async () => {
  try {
    // Get counts from collections
    const [usersCount, postsCount, consultationsCount] = await Promise.all([
      getCollectionCount('users'),
      getCollectionCount('posts'),
      getCollectionCount('consultations'),
    ]);

    // Get active users (logged in last 24 hours)
    const activeUsers = await getActiveUsersCount();

    return {
      totalUsers: usersCount,
      activeUsers,
      totalPosts: postsCount,
      totalConsultations: consultationsCount,
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalPosts: 0,
      totalConsultations: 0,
    };
  }
};

/**
 * Get collection count
 */
const getCollectionCount = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getCountFromServer(collectionRef);
    return snapshot.data().count;
  } catch (error) {
    console.error(`Error counting ${collectionName}:`, error);
    return 0;
  }
};

/**
 * Get active users count (logged in last 24 hours)
 */
const getActiveUsersCount = async () => {
  try {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('lastLoginAt', '>=', yesterday),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting active users:', error);
    return 0;
  }
};

