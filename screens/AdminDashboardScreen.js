/**
 * Admin Dashboard Screen
 * Comprehensive admin panel for managing users, content, and platform settings
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
import { useUser } from '../contexts/UserContext';
import { subscribeToPlatformStats, getPlatformStats } from '../services/adminService';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const { userData } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalConsultations: 0,
  });

  // Real-time platform stats
  useEffect(() => {
    // Initial load
    const loadStats = async () => {
      try {
        const stats = await getPlatformStats();
        setPlatformStats(stats);
      } catch (error) {
        console.error('Error loading platform stats:', error);
      }
    };

    loadStats();

    // Real-time listener
    const unsubscribe = subscribeToPlatformStats((stats) => {
      setPlatformStats(stats);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const stats = await getPlatformStats();
      setPlatformStats(stats);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const adminActions = [
    {
      id: '1',
      title: 'User Management',
      icon: 'people-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: '2',
      title: 'Content Moderation',
      icon: 'shield-checkmark-outline',
      color: '#34C759',
      onPress: () => navigation.navigate('Explore'),
    },
    {
      id: '3',
      title: 'Reports & Analytics',
      icon: 'bar-chart-outline',
      color: '#FF9500',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: '4',
      title: 'System Settings',
      icon: 'settings-outline',
      color: '#5856D6',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: '5',
      title: 'Verification Requests',
      icon: 'checkmark-circle-outline',
      color: '#FF3B30',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: '6',
      title: 'Notifications',
      icon: 'notifications-outline',
      color: '#AF52DE',
      onPress: () => navigation.navigate('Notifications'),
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
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.name}>{userData?.name || 'Administrator'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={40} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Platform Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>{platformStats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="radio-button-on" size={24} color="#34C759" />
              <Text style={styles.statNumber}>{platformStats.activeUsers}</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={24} color="#FF9500" />
              <Text style={styles.statNumber}>{platformStats.totalPosts}</Text>
              <Text style={styles.statLabel}>Total Posts</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="medical" size={24} color="#FF3B30" />
              <Text style={styles.statNumber}>{platformStats.totalConsultations}</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
          </View>
        </View>

        {/* Admin Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          <View style={styles.actionsGrid}>
            {adminActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
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
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
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
});

export default AdminDashboardScreen;

