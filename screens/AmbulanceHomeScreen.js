/**
 * Ambulance Driver Home Screen
 * Dashboard for ambulance drivers with emergency requests and navigation
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import {
  subscribeToEmergencyRequests,
  getAmbulanceTodayStats,
  acceptEmergencyRequest,
} from '../services/ambulanceService';

const { width } = Dimensions.get('window');

const AmbulanceHomeScreen = ({ navigation }) => {
  const { user, userData } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [todayStats, setTodayStats] = useState({
    trips: 0,
    active: 0,
    earnings: 0,
  });
  const [activeRequests, setActiveRequests] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);

  // Real-time data fetching
  useEffect(() => {
    if (!user?.uid) return;

    // Fetch today's stats
    const loadStats = async () => {
      try {
        const stats = await getAmbulanceTodayStats(user.uid);
        setTodayStats(stats);
      } catch (error) {
        console.error('Error loading ambulance stats:', error);
      }
    };

    loadStats();

    // Real-time listener for emergency requests
    const unsubscribe = subscribeToEmergencyRequests((requests) => {
      setActiveRequests(requests.slice(0, 5));
      // Update stats when requests change
      loadStats();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (user?.uid) {
        const stats = await getAmbulanceTodayStats(user.uid);
        setTodayStats(stats);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.uid]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptEmergencyRequest(requestId, user.uid);
      // Navigate to ambulance screen with request details
      navigation.navigate('Ambulance', { requestId });
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept emergency request');
    }
  };

  const quickActions = [
    {
      id: '1',
      title: 'Emergency Requests',
      icon: 'alert-circle-outline',
      color: '#FF3B30',
      count: activeRequests.length,
      onPress: () => navigation.navigate('Ambulance'),
    },
    {
      id: '2',
      title: 'My Trips',
      icon: 'car-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: '3',
      title: 'Navigation',
      icon: 'navigate-outline',
      color: '#34C759',
      onPress: () => navigation.navigate('Ambulance'),
    },
    {
      id: '4',
      title: 'Earnings',
      icon: 'cash-outline',
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
            <Text style={styles.name}>{userData?.name || 'Driver'}</Text>
            <Text style={styles.vehicle}>
              <Ionicons name="car" size={14} color="#666" /> {userData?.vehicleNumber || 'Vehicle Number'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={40} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Status Toggle */}
        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[styles.statusButton, isAvailable && styles.statusActive]}
            onPress={() => setIsAvailable(!isAvailable)}
          >
            <View style={[styles.statusIndicator, !isAvailable && styles.statusIndicatorInactive]} />
            <Text style={styles.statusText}>{isAvailable ? 'Available' : 'Unavailable'}</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="car" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>{todayStats.trips}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="radio" size={24} color="#FF3B30" />
              <Text style={styles.statNumber}>{todayStats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cash" size={24} color="#34C759" />
              <Text style={styles.statNumber}>₹{todayStats.earnings}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
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

        {/* Active Emergency Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Requests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Ambulance')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {activeRequests.length > 0 ? (
            <View>
              {activeRequests.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  style={styles.requestCard}
                  onPress={() => handleAcceptRequest(request.id)}
                >
                  <View style={styles.requestHeader}>
                    <Ionicons name="location" size={20} color="#FF3B30" />
                    <Text style={styles.requestLocation}>
                      {request.location || request.address || 'Location not specified'}
                    </Text>
                    <Text style={styles.requestTime}>
                      {request.createdAt?.toLocaleTimeString?.() || 'Just now'}
                    </Text>
                  </View>
                  <Text style={styles.requestType}>
                    {request.emergencyType || request.type || 'Emergency Request'}
                  </Text>
                  {isAvailable && (
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRequest(request.id)}
                    >
                      <Text style={styles.acceptButtonText}>Accept Request</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#34C759" />
              <Text style={styles.emptyText}>No active emergency requests</Text>
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
  vehicle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  statusContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    marginRight: 10,
  },
  statusIndicatorInactive: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
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
  requestCard: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestLocation: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  requestTime: {
    fontSize: 14,
    color: '#666',
  },
  requestType: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
    marginBottom: 10,
  },
  acceptButton: {
    backgroundColor: '#34C759',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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

export default AmbulanceHomeScreen;

