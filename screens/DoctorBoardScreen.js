/**
 * Doctor Board Screen
 * Dashboard for doctors to manage consultations, patients, and medical content
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  Alert,
  Animated,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../src/firebase';

const { width } = Dimensions.get('window');

const DoctorBoardScreen = ({ navigation }) => {
  const { user, userData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [availability, setAvailability] = useState({ online: false, updating: false });
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all'); // 'all', 'appointments', 'payments', 'messages', 'reviews', 'prescriptions', 'schedule', 'emergency'
  const [notificationSearch, setNotificationSearch] = useState('');
  const notificationSlideAnim = useRef(new Animated.Value(-300)).current;
  const [stats, setStats] = useState({
    totalConsultations: 0,
    todayConsultations: 0,
    totalPatients: 0,
    pendingRequests: 0,
  });
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
  });

  // Dummy appointments data for demonstration
  const dummyAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        id: 'dummy1',
        patientId: 'patient1',
        patientName: 'Rajesh Kumar',
        doctorId: user?.uid || 'dummy-doctor',
        status: 'pending',
        scheduledAt: Timestamp.fromDate(new Date(today.getTime() + 2 * 60 * 60 * 1000)), // 2 hours from now
        reason: 'Fever and cough',
        fee: 500,
        paymentStatus: 'pending',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 30 * 60 * 1000)),
        updatedAt: Timestamp.fromDate(new Date(now.getTime() - 5 * 60 * 1000)),
      },
      {
        id: 'dummy2',
        patientId: 'patient2',
        patientName: 'Priya Sharma',
        doctorId: user?.uid || 'dummy-doctor',
        status: 'in-progress',
        scheduledAt: Timestamp.fromDate(new Date(now.getTime() + 30 * 60 * 1000)), // 30 min from now
        reason: 'Headache consultation',
        fee: 400,
        paymentStatus: 'paid',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
        updatedAt: Timestamp.fromDate(new Date(now.getTime() - 10 * 60 * 1000)),
      },
      {
        id: 'dummy3',
        patientId: 'patient3',
        patientName: 'Amit Patel',
        doctorId: user?.uid || 'dummy-doctor',
        status: 'completed',
        scheduledAt: Timestamp.fromDate(new Date(today.getTime() + 4 * 60 * 60 * 1000)),
        reason: 'General checkup',
        fee: 600,
        paymentStatus: 'paid',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 4 * 60 * 60 * 1000)),
        updatedAt: Timestamp.fromDate(new Date(now.getTime() - 1 * 60 * 60 * 1000)),
      },
      {
        id: 'dummy4',
        patientId: 'patient4',
        patientName: 'Sunita Reddy',
        doctorId: user?.uid || 'dummy-doctor',
        status: 'pending',
        scheduledAt: Timestamp.fromDate(new Date(today.getTime() + 6 * 60 * 60 * 1000)),
        reason: 'Skin allergy',
        fee: 450,
        paymentStatus: 'pending',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 1 * 60 * 60 * 1000)),
        updatedAt: Timestamp.fromDate(new Date(now.getTime() - 20 * 60 * 1000)),
      },
      {
        id: 'dummy5',
        patientId: 'patient5',
        patientName: 'Vikram Singh',
        doctorId: user?.uid || 'dummy-doctor',
        status: 'completed',
        scheduledAt: Timestamp.fromDate(new Date(today.getTime() - 2 * 60 * 60 * 1000)),
        reason: 'Follow-up consultation',
        fee: 500,
        paymentStatus: 'paid',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 6 * 60 * 60 * 1000)),
        updatedAt: Timestamp.fromDate(new Date(now.getTime() - 3 * 60 * 60 * 1000)),
      },
    ];
  }, [user?.uid]);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const subscribeAppointments = () => {
    if (!user?.uid) {
      // Use dummy data if no user
      setAppointments(dummyAppointments);
      return () => {};
    }
    
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      orderBy('scheduledAt', 'asc'),
      limit(50)
    );
    
    return onSnapshot(
      q,
      (snap) => {
        const items = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            ...data,
          });
        });
        
        // Use dummy data if no appointments found
        if (items.length === 0) {
          setAppointments(dummyAppointments);
        } else {
          setAppointments(items);
        }
      },
      (err) => {
        console.error('❌ DoctorBoard: appointments listener error', err);
        // Fallback to dummy data on error
        setAppointments(dummyAppointments);
      }
    );
  };

  // Track previous appointment statuses for notification detection
  const previousStatuses = useRef(new Map());
  
  // Real-time notification listener for appointment changes
  const subscribeNotifications = () => {
    if (!user?.uid) return () => {};
    
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );
    
    return onSnapshot(
      q,
      (snap) => {
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const appointmentId = docSnap.id;
          const currentStatus = data.status;
          const previousStatus = previousStatuses.current.get(appointmentId);
          
          // If status changed, create a notification
          if (previousStatus && previousStatus !== currentStatus) {
            const patientName = data.patientName || 'Patient';
            let notificationMessage = '';
            let notificationType = 'info';
            let category = 'appointments';
            let priority = 'normal';
            
            switch (currentStatus) {
              case 'pending':
                notificationMessage = `New consultation request from ${patientName}`;
                notificationType = 'new';
                priority = 'urgent';
                break;
              case 'accepted':
                notificationMessage = `Consultation with ${patientName} has been accepted`;
                notificationType = 'success';
                break;
              case 'in-progress':
                notificationMessage = `Consultation with ${patientName} is now in progress`;
                notificationType = 'info';
                priority = 'urgent';
                break;
              case 'completed':
                notificationMessage = `Consultation with ${patientName} has been completed`;
                notificationType = 'success';
                break;
              case 'cancelled':
                notificationMessage = `Consultation with ${patientName} has been cancelled`;
                notificationType = 'warning';
                break;
              default:
                notificationMessage = `Consultation with ${patientName} status updated`;
            }
            
            const newNotification = {
              id: `notif-${appointmentId}-${Date.now()}`,
              type: notificationType,
              category: category,
              priority: priority,
              message: notificationMessage,
              appointmentId: appointmentId,
              patientName: patientName,
              patientId: data.patientId,
              status: currentStatus,
              fee: data.fee || data.amount || 0,
              paymentStatus: data.paymentStatus,
              scheduledAt: data.scheduledAt,
              timestamp: new Date(),
              read: false,
              actions: currentStatus === 'pending' ? ['accept', 'reject', 'view'] : ['view'],
            };
            
            setNotifications((prev) => [newNotification, ...prev].slice(0, 100));
            
            // Show notification slide-in animation for urgent notifications
            if (priority === 'urgent') {
              Animated.sequence([
                Animated.timing(notificationSlideAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.delay(4000),
                Animated.timing(notificationSlideAnim, {
                  toValue: -300,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start();
            }
          }
          
          previousStatuses.current.set(appointmentId, currentStatus);
        });
      },
      (err) => {
        console.error('❌ DoctorBoard: notifications listener error', err);
      }
    );
  };

  // Track previous payments and messages
  const previousPayments = useRef(new Set());
  const previousMessages = useRef(new Map());

  // Real-time listener for payments
  const subscribePayments = () => {
    if (!user?.uid) return () => {};
    
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      where('paymentStatus', '==', 'paid'),
      orderBy('updatedAt', 'desc'),
      limit(10)
    );
    
    return onSnapshot(
      q,
      (snap) => {
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const appointmentId = docSnap.id;
          
          if (!previousPayments.current.has(appointmentId) && data.paymentStatus === 'paid') {
            const patientName = data.patientName || 'Patient';
            const fee = data.fee || data.amount || 0;
            
            const newNotification = {
              id: `payment-${appointmentId}-${Date.now()}`,
              type: 'success',
              category: 'payments',
              priority: 'normal',
              message: `Payment received: ₹${fee} from ${patientName}`,
              appointmentId: appointmentId,
              patientName: patientName,
              patientId: data.patientId,
              amount: fee,
              timestamp: new Date(),
              read: false,
              actions: ['view'],
            };
            
            setNotifications((prev) => [newNotification, ...prev].slice(0, 100));
            previousPayments.current.add(appointmentId);
          }
        });
      },
      (err) => {
        console.error('❌ DoctorBoard: payments listener error', err);
      }
    );
  };

  // Real-time listener for messages
  const subscribeMessages = () => {
    if (!user?.uid) return () => {};
    
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc'),
      limit(20)
    );
    
    return onSnapshot(
      q,
      (snap) => {
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const chatId = docSnap.id;
          const lastMessageTime = data.lastMessageTime?.toMillis?.() || data.lastMessageTime || 0;
          const previousTime = previousMessages.current.get(chatId) || 0;
          
          // Only notify if new message and not from doctor
          if (lastMessageTime > previousTime && data.lastMessageSenderId !== user.uid) {
            const otherParticipantId = data.participants.find(id => id !== user.uid);
            const lastMessage = data.lastMessage || 'New message';
            
            const newNotification = {
              id: `message-${chatId}-${Date.now()}`,
              type: 'info',
              category: 'messages',
              priority: 'normal',
              message: `New message: ${lastMessage.substring(0, 50)}${lastMessage.length > 50 ? '...' : ''}`,
              chatId: chatId,
              consultationId: data.consultationId,
              patientId: otherParticipantId,
              timestamp: new Date(),
              read: false,
              actions: ['view'],
            };
            
            setNotifications((prev) => [newNotification, ...prev].slice(0, 100));
            previousMessages.current.set(chatId, lastMessageTime);
          }
        });
      },
      (err) => {
        console.error('❌ DoctorBoard: messages listener error', err);
      }
    );
  };

  const subscribeAvailability = () => {
    if (!user?.uid) return () => {};
    const ref = doc(db, 'doctors', user.uid);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setAvailability((prev) => ({
            ...prev,
            online: data.online === true,
          }));
        }
      },
      (err) => {
        console.error('❌ DoctorBoard: availability listener error', err);
      }
    );
  };

  useEffect(() => {
    const unsubAppointments = subscribeAppointments();
    const unsubAvailability = subscribeAvailability();
    const unsubNotifications = subscribeNotifications();
    const unsubPayments = subscribePayments();
    const unsubMessages = subscribeMessages();
    
    // Initialize with dummy data if no user
    if (!user?.uid) {
      setAppointments(dummyAppointments);
      // Add comprehensive dummy notifications with all categories
      const now = Date.now();
      setNotifications([
        {
          id: 'notif-dummy-1',
          type: 'new',
          category: 'appointments',
          priority: 'urgent',
          message: 'New consultation request from Rajesh Kumar',
          appointmentId: 'dummy1',
          patientName: 'Rajesh Kumar',
          patientId: 'patient1',
          status: 'pending',
          fee: 500,
          paymentStatus: 'pending',
          timestamp: new Date(now - 5 * 60 * 1000),
          read: false,
          actions: ['accept', 'reject', 'view'],
        },
        {
          id: 'notif-dummy-2',
          type: 'info',
          category: 'appointments',
          priority: 'urgent',
          message: 'Consultation with Priya Sharma is now in progress',
          appointmentId: 'dummy2',
          patientName: 'Priya Sharma',
          patientId: 'patient2',
          status: 'in-progress',
          fee: 400,
          paymentStatus: 'paid',
          timestamp: new Date(now - 10 * 60 * 1000),
          read: false,
          actions: ['view'],
        },
        {
          id: 'notif-dummy-3',
          type: 'success',
          category: 'payments',
          priority: 'normal',
          message: 'Payment received: ₹600 from Amit Patel',
          appointmentId: 'dummy3',
          patientName: 'Amit Patel',
          patientId: 'patient3',
          amount: 600,
          timestamp: new Date(now - 15 * 60 * 1000),
          read: false,
          actions: ['view'],
        },
        {
          id: 'notif-dummy-4',
          type: 'info',
          category: 'messages',
          priority: 'normal',
          message: 'New message: Can I get a prescription for my follow-up?',
          chatId: 'chat1',
          patientId: 'patient4',
          timestamp: new Date(now - 20 * 60 * 1000),
          read: false,
          actions: ['view'],
        },
        {
          id: 'notif-dummy-5',
          type: 'success',
          category: 'appointments',
          priority: 'normal',
          message: 'Consultation with Sunita Reddy has been completed',
          appointmentId: 'dummy4',
          patientName: 'Sunita Reddy',
          patientId: 'patient4',
          status: 'completed',
          fee: 450,
          paymentStatus: 'paid',
          timestamp: new Date(now - 1 * 60 * 60 * 1000),
          read: true,
          actions: ['view'],
        },
        {
          id: 'notif-dummy-6',
          type: 'info',
          category: 'prescriptions',
          priority: 'normal',
          message: 'Prescription request from Vikram Singh',
          patientName: 'Vikram Singh',
          patientId: 'patient5',
          timestamp: new Date(now - 2 * 60 * 60 * 1000),
          read: false,
          actions: ['view'],
        },
        {
          id: 'notif-dummy-7',
          type: 'success',
          category: 'reviews',
          priority: 'low',
          message: 'New 5-star review from Amit Patel',
          patientName: 'Amit Patel',
          patientId: 'patient3',
          rating: 5,
          timestamp: new Date(now - 3 * 60 * 60 * 1000),
          read: true,
          actions: ['view'],
        },
      ]);
    }
    
    return () => {
      unsubAppointments && unsubAppointments();
      unsubAvailability && unsubAvailability();
      unsubNotifications && unsubNotifications();
      unsubPayments && unsubPayments();
      unsubMessages && unsubMessages();
    };
  }, [user?.uid]);

  useEffect(() => {
    const distinctPatients = new Set();
    let total = 0;
    let today = 0;
    let pending = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    appointments.forEach((appt) => {
      const sched = appt.scheduledAt?.toMillis ? appt.scheduledAt.toMillis() : appt.scheduledAt || 0;
      const paid = appt.paymentStatus === 'paid';
      const fee = Number(appt.fee || appt.amount || 0);

      if (appt.patientId) distinctPatients.add(appt.patientId);
      if (appt.status === 'completed') {
        total += 1;
        if (sched >= todayStart) today += 1;
      }
      if (appt.status === 'pending' || appt.status === 'in-progress') {
        pending += 1;
      }

      if (paid) {
        if (sched >= todayStart) todayEarnings += fee;
        if (sched >= weekAgo) weekEarnings += fee;
        if (sched >= monthAgo) monthEarnings += fee;
      }
    });

    setStats({
      totalConsultations: total,
      todayConsultations: today,
      totalPatients: distinctPatients.size,
      pendingRequests: pending,
    });
    setEarnings({
      today: todayEarnings,
      week: weekEarnings,
      month: monthEarnings,
    });
  }, [appointments, todayStart]);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Filter by category
    if (notificationFilter !== 'all') {
      filtered = filtered.filter(n => n.category === notificationFilter);
    }
    
    // Filter by search query
    if (notificationSearch.trim()) {
      const searchLower = notificationSearch.toLowerCase();
      filtered = filtered.filter(n => 
        n.message.toLowerCase().includes(searchLower) ||
        (n.patientName && n.patientName.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by priority and timestamp (urgent first, then unread, then by time)
    return filtered.sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [notifications, notificationFilter, notificationSearch]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach(notif => {
      const date = new Date(notif.timestamp);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey;
      if (date >= today) {
        dateKey = 'Today';
      } else if (date >= yesterday) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notif);
    });
    return groups;
  }, [filteredNotifications]);

  // Notification action handlers
  const handleNotificationAction = async (notification, action) => {
    if (action === 'mark-read') {
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      return;
    }
    
    if (action === 'delete') {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      return;
    }
    
    if (action === 'accept' && notification.appointmentId) {
      // Accept appointment
      try {
        const apptRef = doc(db, 'appointments', notification.appointmentId);
        await updateDoc(apptRef, {
          status: 'accepted',
          updatedAt: serverTimestamp(),
        });
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        Alert.alert('Success', 'Appointment accepted');
      } catch (error) {
        console.error('Error accepting appointment:', error);
        Alert.alert('Error', 'Could not accept appointment');
      }
      return;
    }
    
    if (action === 'reject' && notification.appointmentId) {
      // Reject appointment
      Alert.alert(
        'Reject Appointment',
        'Are you sure you want to reject this appointment?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: async () => {
              try {
                const apptRef = doc(db, 'appointments', notification.appointmentId);
                await updateDoc(apptRef, {
                  status: 'cancelled',
                  updatedAt: serverTimestamp(),
                });
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
                Alert.alert('Success', 'Appointment rejected');
              } catch (error) {
                console.error('Error rejecting appointment:', error);
                Alert.alert('Error', 'Could not reject appointment');
              }
            },
          },
        ]
      );
      return;
    }
    
    if (action === 'view') {
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      
      if (notification.appointmentId) {
        // Navigate to appointment/consultation
        navigation.navigate('Consult');
      } else if (notification.chatId) {
        // Navigate to chat
        navigation.navigate('Chat', { chatId: notification.chatId });
      } else if (notification.consultationId) {
        // Navigate to consultation
        navigation.navigate('ConsultationChat', { consultationId: notification.consultationId });
      }
      setShowNotifications(false);
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Delete all read notifications
  const deleteAllRead = () => {
    Alert.alert(
      'Delete Read Notifications',
      'Are you sure you want to delete all read notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(n => !n.read));
          },
        },
      ]
    );
  };

  // Get notification icon and color based on category and type
  const getNotificationIcon = (category, type) => {
    const iconMap = {
      appointments: type === 'new' ? 'calendar-outline' : type === 'success' ? 'checkmark-circle' : 'calendar',
      payments: 'cash-outline',
      messages: 'chatbubble-outline',
      reviews: 'star-outline',
      prescriptions: 'document-text-outline',
      schedule: 'time-outline',
      emergency: 'warning-outline',
    };
    return iconMap[category] || 'notifications-outline';
  };

  const getNotificationColor = (category, type) => {
    if (type === 'urgent' || type === 'new') return '#FF3B30';
    if (type === 'success') return '#34C759';
    if (type === 'warning') return '#FF9500';
    
    const colorMap = {
      appointments: '#007AFF',
      payments: '#34C759',
      messages: '#5856D6',
      reviews: '#FF9500',
      prescriptions: '#FF3B30',
      schedule: '#007AFF',
      emergency: '#FF3B30',
    };
    return colorMap[category] || '#666';
  };

  const toggleAvailability = async () => {
    if (!user?.uid) return;
    setAvailability((prev) => ({ ...prev, updating: true }));
    try {
      const newOnlineStatus = !availability.online;
      const now = serverTimestamp();
      
      // Update doctors collection
      const doctorRef = doc(db, 'doctors', user.uid);
      await setDoc(
        doctorRef,
        {
          online: newOnlineStatus,
          lastActiveAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
      
      // Also update users collection for easier querying by patients
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          online: newOnlineStatus,
          lastActiveAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
      
      console.log('✅ Availability updated:', newOnlineStatus ? 'Online' : 'Offline');
    } catch (err) {
      console.error('❌ Error updating availability', err);
      Alert.alert('Error', 'Could not update availability. Please try again.');
    } finally {
      setAvailability((prev) => ({ ...prev, updating: false }));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const quickActions = [
    {
      id: '1',
      title: availability.online ? 'Go Offline' : 'Go Online',
      icon: availability.online ? 'radio-button-on' : 'radio-button-off',
      color: availability.online ? '#34C759' : '#ff3b30',
      onPress: toggleAvailability,
      loading: availability.updating,
    },
    {
      id: '2',
      title: 'My Consultations',
      icon: 'calendar-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('Consult'),
    },
    {
      id: '3',
      title: 'My Patients',
      icon: 'people-outline',
      color: '#5856D6',
      onPress: () => navigation.navigate('Messages'),
    },
    {
      id: '4',
      title: 'Prescriptions',
      icon: 'document-text-outline',
      color: '#FF9500',
      onPress: () => Alert.alert('Prescriptions', 'Coming soon'),
    },
  ];

  const upcomingQueue = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'pending' || a.status === 'in-progress')
        .sort((a, b) => {
          const at = a.scheduledAt?.toMillis ? a.scheduledAt.toMillis() : a.scheduledAt || 0;
          const bt = b.scheduledAt?.toMillis ? b.scheduledAt.toMillis() : b.scheduledAt || 0;
          return at - bt;
        }),
    [appointments]
  );

  const currentAppointment = upcomingQueue.length ? upcomingQueue[0] : null;
  const nextAppointments = upcomingQueue.slice(1, 4);

  const recentActivity = useMemo(() => {
    const recent = appointments
      .slice()
      .sort((a, b) => {
        const at = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : a.scheduledAt?.toMillis?.() || a.scheduledAt || 0;
        const bt = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : b.scheduledAt?.toMillis?.() || b.scheduledAt || 0;
        return bt - at;
      })
      .slice(0, 6)
      .map((a) => ({
        id: a.id,
        type: a.type || 'consultation',
        title: a.title || a.patientName || 'Consultation update',
        time: a.status || 'pending',
        status: a.status || 'pending',
      }));
    if (recent.length === 0) {
      return [
        {
          id: 'empty',
          type: 'info',
          title: 'No recent activity',
          time: '',
          status: 'idle',
        },
      ];
    }
    return recent;
  }, [appointments]);

  return (
    <View style={styles.container}>
      {/* Fixed Header with Back Button - Always Visible */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Board</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Ionicons name="notifications-outline" size={28} color="#000" />
            {notifications.filter(n => !n.read).length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notifications.filter(n => !n.read).length}
                </Text>
              </View>
            )}
            <Text style={styles.notificationLabel}>Doctor Board Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileIconButton}
            onPress={() => navigation.navigate('Profile')}
          >
            {userData?.profilePhoto ? (
              <Image 
                source={{ uri: userData.profilePhoto }} 
                style={styles.profileIconImage}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={32} color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Real-time Notification Banner - Shows latest unread notification */}
      {(() => {
        const latestUnread = notifications.find(n => !n.read);
        return latestUnread ? (
          <Animated.View
            style={[
              styles.notificationBanner,
              {
                transform: [{ translateY: notificationSlideAnim }],
              },
            ]}
          >
            <View style={styles.notificationBannerContent}>
              <Ionicons
                name={
                  latestUnread.type === 'success'
                    ? 'checkmark-circle'
                    : latestUnread.type === 'warning'
                    ? 'warning'
                    : latestUnread.type === 'new'
                    ? 'add-circle'
                    : 'information-circle'
                }
                size={20}
                color={
                  latestUnread.type === 'success'
                    ? '#34C759'
                    : latestUnread.type === 'warning'
                    ? '#FF9500'
                    : latestUnread.type === 'new'
                    ? '#007AFF'
                    : '#666'
                }
              />
              <Text style={styles.notificationBannerText} numberOfLines={1}>
                {latestUnread.message}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === latestUnread.id ? { ...n, read: true } : n))
                  );
                }}
              >
                <Ionicons name="close" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : null;
      })()}

      {/* Backdrop overlay when notifications panel is open */}
      {showNotifications && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setShowNotifications(false)}
        />
      )}

      {/* Enhanced Notifications Panel */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.notificationsModalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowNotifications(false)}
          />
          <View style={styles.notificationsPanel}>
            {/* Header */}
            <View style={styles.notificationsPanelHeader}>
              <View style={styles.notificationsHeaderLeft}>
                <Text style={styles.notificationsPanelTitle}>Doctor Board Notifications</Text>
                <Text style={styles.notificationsCount}>
                  {notifications.filter(n => !n.read).length} unread
                </Text>
              </View>
              <View style={styles.notificationsHeaderActions}>
                {notifications.some(n => !n.read) && (
                  <TouchableOpacity
                    style={styles.headerActionButton}
                    onPress={markAllAsRead}
                  >
                    <Ionicons name="checkmark-done" size={20} color="#007AFF" />
                  </TouchableOpacity>
                )}
                {notifications.some(n => n.read) && (
                  <TouchableOpacity
                    style={styles.headerActionButton}
                    onPress={deleteAllRead}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.headerActionButton}
                  onPress={() => setShowNotifications(false)}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.notificationSearchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.notificationSearchInput}
                placeholder="Search notifications..."
                value={notificationSearch}
                onChangeText={setNotificationSearch}
                placeholderTextColor="#999"
              />
              {notificationSearch.length > 0 && (
                <TouchableOpacity onPress={() => setNotificationSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterTabsContainer}
              contentContainerStyle={styles.filterTabsContent}
            >
              {['all', 'appointments', 'payments', 'messages', 'reviews', 'prescriptions', 'schedule', 'emergency'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterTab,
                    notificationFilter === filter && styles.filterTabActive,
                  ]}
                  onPress={() => setNotificationFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      notificationFilter === filter && styles.filterTabTextActive,
                    ]}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                  {notificationFilter === filter && notifications.filter(n => n.category === filter && !n.read).length > 0 && (
                    <View style={styles.filterTabBadge}>
                      <Text style={styles.filterTabBadgeText}>
                        {notifications.filter(n => n.category === filter && !n.read).length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Notifications List */}
            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
              {Object.keys(groupedNotifications).length === 0 ? (
                <View style={styles.emptyNotificationsContainer}>
                  <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyNotificationsText}>No notifications</Text>
                  <Text style={styles.emptyNotificationsSubtext}>
                    {notificationFilter !== 'all' || notificationSearch.trim()
                      ? 'Try adjusting your filters'
                      : 'You\'re all caught up!'}
                  </Text>
                </View>
              ) : (
                Object.entries(groupedNotifications).map(([dateKey, dateNotifications]) => (
                  <View key={dateKey} style={styles.notificationDateGroup}>
                    <Text style={styles.notificationDateHeader}>{dateKey}</Text>
                    {dateNotifications.map((notif) => {
                      const iconName = getNotificationIcon(notif.category || 'appointments', notif.type);
                      const iconColor = getNotificationColor(notif.category || 'appointments', notif.type);
                      
                      return (
                        <TouchableOpacity
                          key={notif.id}
                          style={[
                            styles.notificationItem,
                            !notif.read && styles.notificationItemUnread,
                            notif.priority === 'urgent' && styles.notificationItemUrgent,
                          ]}
                          onPress={() => handleNotificationAction(notif, 'view')}
                        >
                          <View
                            style={[
                              styles.notificationIcon,
                              { backgroundColor: iconColor + '20' },
                            ]}
                          >
                            <Ionicons name={iconName} size={22} color={iconColor} />
                            {notif.priority === 'urgent' && (
                              <View style={styles.urgentIndicator} />
                            )}
                          </View>
                          <View style={styles.notificationContent}>
                            <View style={styles.notificationHeaderRow}>
                              <Text
                                style={[
                                  styles.notificationMessage,
                                  !notif.read && styles.notificationMessageUnread,
                                ]}
                                numberOfLines={2}
                              >
                                {notif.message}
                              </Text>
                              {!notif.read && <View style={styles.unreadDot} />}
                            </View>
                            {notif.patientName && (
                              <Text style={styles.notificationPatient}>
                                {notif.patientName}
                              </Text>
                            )}
                            <View style={styles.notificationFooter}>
                              <Text style={styles.notificationTime}>
                                {notif.timestamp.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Text>
                              {notif.amount && (
                                <Text style={styles.notificationAmount}>
                                  ₹{notif.amount}
                                </Text>
                              )}
                            </View>
                          </View>
                          {/* Quick Actions */}
                          {notif.actions && notif.actions.length > 0 && (
                            <View style={styles.notificationActions}>
                              {notif.actions.includes('accept') && (
                                <TouchableOpacity
                                  style={[styles.actionButton, styles.actionButtonAccept]}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notif, 'accept');
                                  }}
                                >
                                  <Ionicons name="checkmark" size={16} color="#fff" />
                                </TouchableOpacity>
                              )}
                              {notif.actions.includes('reject') && (
                                <TouchableOpacity
                                  style={[styles.actionButton, styles.actionButtonReject]}
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notif, 'reject');
                                  }}
                                >
                                  <Ionicons name="close" size={16} color="#fff" />
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity
                                style={[styles.actionButton, styles.actionButtonMore]}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  Alert.alert(
                                    'Notification Actions',
                                    notif.message,
                                    [
                                      { text: 'Cancel', style: 'cancel' },
                                      { text: 'Mark as Read', onPress: () => handleNotificationAction(notif, 'mark-read') },
                                      { text: 'Delete', style: 'destructive', onPress: () => handleNotificationAction(notif, 'delete') },
                                    ]
                                  );
                                }}
                              >
                                <Ionicons name="ellipsis-vertical" size={16} color="#666" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{userData?.name || 'Doctor'}</Text>
          <Text style={styles.specialization}>
            {userData?.specialization || 'General Practitioner'}
          </Text>
        </View>

        {/* Availability + Earnings */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <View style={styles.availabilityBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: availability.online ? '#34C759' : '#FF3B30' },
                ]}
              />
              <Text style={styles.availabilityText}>
                {availability.online ? 'Online' : 'Offline'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { backgroundColor: availability.online ? '#ff3b30' : '#34C759' },
              ]}
              onPress={toggleAvailability}
              disabled={availability.updating}
              activeOpacity={0.8}
            >
              <Text style={styles.toggleButtonText}>
                {availability.updating
                  ? 'Updating...'
                  : availability.online
                  ? 'Go Offline'
                  : 'Go Online'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.earningsRow}>
            <View style={styles.earningCard}>
              <Text style={styles.earningLabel}>Today</Text>
              <Text style={styles.earningValue}>₹{earnings.today.toFixed(0)}</Text>
            </View>
            <View style={styles.earningCard}>
              <Text style={styles.earningLabel}>7 days</Text>
              <Text style={styles.earningValue}>₹{earnings.week.toFixed(0)}</Text>
            </View>
            <View style={styles.earningCard}>
              <Text style={styles.earningLabel}>30 days</Text>
              <Text style={styles.earningValue}>₹{earnings.month.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#007AFF" />
            <Text style={styles.statNumber}>{stats.totalConsultations}</Text>
            <Text style={styles.statLabel}>Total Consultations</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="today" size={24} color="#34C759" />
            <Text style={styles.statNumber}>{stats.todayConsultations}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#FF9500" />
            <Text style={styles.statNumber}>{stats.totalPatients}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#FF3B30" />
            <Text style={styles.statNumber}>{stats.pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Live Queue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Queue</Text>
          {currentAppointment ? (
            <View style={styles.currentCard}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.currentTitle}>
                    {currentAppointment.patientName || 'Patient'}
                  </Text>
                  <Text style={styles.currentMeta}>
                    {currentAppointment.reason || 'Consultation'}
                  </Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {currentAppointment.status || 'pending'}
                  </Text>
                </View>
              </View>
              <Text style={styles.currentTime}>
                {currentAppointment.scheduledAt?.toDate
                  ? currentAppointment.scheduledAt.toDate().toLocaleString()
                  : 'Scheduled'}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No active consultations</Text>
          )}

          {nextAppointments.length > 0 && (
            <View style={{ marginTop: 12 }}>
              {nextAppointments.map((appt) => (
                <View key={appt.id} style={styles.queueItem}>
                  <View>
                    <Text style={styles.queueTitle}>{appt.patientName || 'Patient'}</Text>
                    <Text style={styles.queueMeta}>{appt.reason || 'Consultation'}</Text>
                  </View>
                  <Text style={styles.queueTime}>
                    {appt.scheduledAt?.toDate
                      ? appt.scheduledAt.toDate().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Scheduled'}
                  </Text>
                </View>
              ))}
            </View>
          )}
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
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                {action.loading && <Text style={styles.loadingText}>Updating...</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((activity) => (
            <TouchableOpacity key={activity.id} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name={
                    activity.type === 'consultation'
                      ? 'calendar'
                      : activity.type === 'prescription'
                      ? 'document-text'
                      : 'person'
                  }
                  size={20}
                  color="#007AFF"
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      activity.status === 'pending' ? '#FF9500' : '#34C759',
                  },
                ]}
              >
                <Text style={styles.statusText}>{activity.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  fixedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 1000,
    elevation: 5,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    position: 'relative',
    gap: 6,
  },
  notificationLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  profileIconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileIconImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
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
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    minWidth: 0,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingText: {
    marginTop: 6,
    fontSize: 11,
    color: '#666',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
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
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  toggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  earningsRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  earningCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ededed',
  },
  earningLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  earningValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  currentCard: {
    backgroundColor: '#f8f8f8',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ededed',
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  currentMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  currentTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#007AFF20',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
  emptyText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  queueMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  queueTime: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  notificationBanner: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 999,
    elevation: 5,
  },
  notificationBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  notificationsModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  notificationsPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  notificationsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  notificationsHeaderLeft: {
    flex: 1,
  },
  notificationsPanelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  notificationsCount: {
    fontSize: 12,
    color: '#666',
  },
  notificationsHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 8,
  },
  notificationSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  notificationSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  filterTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTabsContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  filterTabBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterTabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  notificationsList: {
    maxHeight: 500,
  },
  emptyNotificationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyNotificationsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyNotificationsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  notificationDateGroup: {
    marginTop: 20,
  },
  notificationDateHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  notificationItemUnread: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notificationItemUrgent: {
    backgroundColor: '#fff5f5',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  urgentIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
  notificationMessageUnread: {
    fontWeight: '700',
  },
  notificationPatient: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34C759',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonAccept: {
    backgroundColor: '#34C759',
  },
  actionButtonReject: {
    backgroundColor: '#FF3B30',
  },
  actionButtonMore: {
    backgroundColor: '#f5f5f5',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
});

export default DoctorBoardScreen;

