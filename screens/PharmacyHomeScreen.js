/**
 * Pharmacy Home Screen
 * Dashboard for pharmacy shops with orders, inventory, and customer management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToPharmacyOrders,
  getPharmacyTodayStats,
  getTodayOrders,
} from '../services/orderService';

const { width } = Dimensions.get('window');

const PharmacyHomeScreen = ({ navigation }) => {
  const { user, userData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [todayStats, setTodayStats] = useState({
    orders: 0,
    pending: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  // Real-time data fetching
  useEffect(() => {
    if (!user?.uid) return;

    // Fetch today's stats
    const loadStats = async () => {
      try {
        const stats = await getPharmacyTodayStats(user.uid);
        setTodayStats(stats);
      } catch (error) {
        console.error('Error loading pharmacy stats:', error);
      }
    };

    // Fetch recent orders
    const loadOrders = async () => {
      try {
        const orders = await getTodayOrders(user.uid);
        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    };

    loadStats();
    loadOrders();

    // Real-time listener for orders
    const unsubscribe = subscribeToPharmacyOrders(user.uid, (orders) => {
      loadStats();
      setRecentOrders(orders.slice(0, 5));
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (user?.uid) {
        const [stats, orders] = await Promise.all([
          getPharmacyTodayStats(user.uid),
          getTodayOrders(user.uid),
        ]);
        setTodayStats(stats);
        setRecentOrders(orders.slice(0, 5));
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.uid]);

  const quickActions = [
    {
      id: '1',
      title: 'New Orders',
      icon: 'receipt-outline',
      color: '#FF3B30',
      count: todayStats.pending,
      onPress: () => navigation.navigate('Medicine'),
    },
    {
      id: '2',
      title: 'Inventory',
      icon: 'cube-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('Medicine'),
    },
    {
      id: '3',
      title: 'Customers',
      icon: 'people-outline',
      color: '#34C759',
      onPress: () => navigation.navigate('Messages'),
    },
    {
      id: '4',
      title: 'Reports',
      icon: 'bar-chart-outline',
      color: '#FF9500',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{userData?.shopName || userData?.name || 'Pharmacy'}</Text>
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={14} color="#666" /> {userData?.serviceArea || 'Location'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="storefront-outline" size={40} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="receipt" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>{todayStats.orders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#FF9500" />
              <Text style={styles.statNumber}>{todayStats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cash" size={24} color="#34C759" />
              <Text style={styles.statNumber}>₹{todayStats.revenue}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.onPress}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon} size={28} color={action.color} />
                  {action.count > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{action.count}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Medicine')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.length > 0 ? (
            <View>
              {recentOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
                >
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            order.status === 'pending'
                              ? '#FF9500'
                              : order.status === 'delivered'
                              ? '#34C759'
                              : '#007AFF',
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.orderAmount}>₹{order.totalAmount || 0}</Text>
                  <Text style={styles.orderTime}>
                    {order.createdAt?.toLocaleTimeString?.() || 'Just now'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No recent orders</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  orderCard: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    color: '#666',
  },
});

export default PharmacyHomeScreen;

