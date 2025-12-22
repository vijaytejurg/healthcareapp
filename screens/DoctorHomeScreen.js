/**
 * Doctor Home Screen
 * Dashboard for doctors with consultations, appointments, and patient management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToDoctorConsultations,
  getDoctorTodayStats,
  getUpcomingConsultations,
} from '../services/consultationService';

const { width } = Dimensions.get('window');

const DoctorHomeScreen = ({ navigation }) => {
  const { user, userData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingConsultations, setUpcomingConsultations] = useState([]);
  const [todayStats, setTodayStats] = useState({
    consultations: 0,
    patients: 0,
    earnings: 0,
  });

  // Real-time data fetching
  useEffect(() => {
    if (!user?.uid) return;

    // Fetch today's stats
    const loadStats = async () => {
      try {
        const stats = await getDoctorTodayStats(user.uid);
        setTodayStats(stats);
      } catch (error) {
        console.error('Error loading doctor stats:', error);
      }
    };

    // Fetch upcoming consultations
    const loadUpcoming = async () => {
      try {
        const consultations = await getUpcomingConsultations(user.uid, 5);
        setUpcomingConsultations(consultations);
      } catch (error) {
        console.error('Error loading upcoming consultations:', error);
      }
    };

    loadStats();
    loadUpcoming();

    // Real-time listener for consultations
    const unsubscribe = subscribeToDoctorConsultations(user.uid, (consultations) => {
      // Update stats when consultations change
      loadStats();
      // Update upcoming consultations
      const upcoming = consultations
        .filter((c) => {
          const scheduledAt = c.scheduledAt?.toDate?.() || c.scheduledAt;
          return scheduledAt && scheduledAt >= new Date() && 
                 ['pending', 'accepted', 'in_progress'].includes(c.status);
        })
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          patientName: 'Patient', // Will be fetched separately
          time: c.scheduledAt?.toDate?.() || c.scheduledAt,
          reason: c.symptoms || 'General consultation',
        }));
      setUpcomingConsultations(upcoming);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (user?.uid) {
        const [stats, upcoming] = await Promise.all([
          getDoctorTodayStats(user.uid),
          getUpcomingConsultations(user.uid, 5),
        ]);
        setTodayStats(stats);
        setUpcomingConsultations(upcoming);
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
      title: 'View Consultations',
      icon: 'calendar-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('Consult'),
    },
    {
      id: '2',
      title: 'My Patients',
      icon: 'people-outline',
      color: '#34C759',
      onPress: () => navigation.navigate('Messages'),
    },
    {
      id: '3',
      title: 'Prescriptions',
      icon: 'document-text-outline',
      color: '#FF9500',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: '4',
      title: 'Schedule',
      icon: 'time-outline',
      color: '#5856D6',
      onPress: () => navigation.navigate('Consult'),
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
            <Text style={styles.name}>{userData?.name || 'Doctor'}</Text>
            <Text style={styles.specialization}>
              {userData?.specialization || 'General Practitioner'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={40} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>{todayStats.consultations}</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#34C759" />
              <Text style={styles.statNumber}>{todayStats.patients}</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cash" size={24} color="#FF9500" />
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
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Consultations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Consultations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Consult')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingConsultations.length > 0 ? (
            <FlatList
              data={upcomingConsultations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.consultationCard}>
                  <View style={styles.consultationHeader}>
                    <Text style={styles.patientName}>{item.patientName}</Text>
                    <Text style={styles.consultationTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.consultationReason}>{item.reason}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No upcoming consultations</Text>
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
  specialization: {
    fontSize: 14,
    color: '#007AFF',
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
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  consultationCard: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 10,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  consultationTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  consultationReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
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

export default DoctorHomeScreen;

