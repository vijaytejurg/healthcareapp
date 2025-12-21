import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'consultation',
      title: 'Consultation Reminder',
      message: 'Your consultation with Dr. Sarah Johnson is in 2 hours',
      time: '2h ago',
      read: false,
      icon: 'medical',
      color: '#007AFF',
    },
    {
      id: '2',
      type: 'medicine',
      title: 'Order Status Update',
      message: 'Your medicine order #12345 is out for delivery',
      time: '5h ago',
      read: false,
      icon: 'medkit',
      color: '#34c759',
    },
    {
      id: '3',
      type: 'donor',
      title: 'Blood Donor Available',
      message: 'John Smith (O+) is now available near you',
      time: '1d ago',
      read: true,
      icon: 'water',
      color: '#ff3b30',
    },
    {
      id: '4',
      type: 'follow',
      title: 'New Follower',
      message: 'Dr. Michael Chen started following you',
      time: '2d ago',
      read: true,
      icon: 'person-add',
      color: '#ff9500',
    },
    {
      id: '5',
      type: 'medicine',
      title: 'Prescription Approved',
      message: 'Your prescription has been approved by Pharmacy Plus',
      time: '2d ago',
      read: true,
      icon: 'checkmark-circle',
      color: '#34c759',
    },
    {
      id: '6',
      type: 'consultation',
      title: 'Consultation Completed',
      message: 'Your consultation with Dr. Emily Davis has been completed',
      time: '3d ago',
      read: true,
      icon: 'checkmark-done',
      color: '#007AFF',
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleNotificationPress = (notification) => {
    markAsRead(notification.id);
    if (notification.type === 'consultation') {
      navigation.navigate('ConsultationChat', { notification });
    } else if (notification.type === 'medicine') {
      navigation.navigate('MedicineOrder');
    } else if (notification.type === 'donor') {
      navigation.navigate('Donor');
    } else if (notification.type === 'pharmacy_acceptance') {
      // Navigate to Medicine screen and trigger payment
      navigation.navigate('MainTabs', {
        screen: 'Medicine',
        params: {
          pharmacyAcceptance: notification.pharmacy,
          cart: notification.cart,
          goToPayment: true,
        },
      });
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}
      >
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 10,
    marginTop: 5,
  },
});

export default NotificationsScreen;

