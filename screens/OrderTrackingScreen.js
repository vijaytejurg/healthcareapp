import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrderTrackingScreen = ({ route, navigation }) => {
  const { order } = route.params || {
    order: {
      id: '12345',
      date: '2024-01-20',
      items: [{ name: 'Paracetamol 500mg', quantity: 2 }],
      status: 'confirmed',
      total: 45.00,
      deliveryFee: 25.00,
      finalTotal: 70.00,
      pharmacy: {
        name: 'Apollo Pharmacy',
        distance: '1.2 km',
        deliveryTime: '30-45 min',
      },
    },
  };

  const [currentStatus, setCurrentStatus] = useState(order.status || 'confirmed');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Simulate real-time status updates
    const statusSequence = ['confirmed', 'preparing', 'out-for-delivery', 'delivered'];
    let currentIndex = statusSequence.indexOf(currentStatus);
    
    if (currentIndex < statusSequence.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStatus(statusSequence[currentIndex + 1]);
      }, 5000); // Update every 5 seconds for demo
      
      return () => clearTimeout(timer);
    }

    // Pulse animation for current step
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [currentStatus]);

  const getTrackingSteps = () => {
    const steps = [
      { id: '1', title: 'Order Placed', status: 'completed', time: '10:00 AM', icon: 'checkmark-circle' },
      { id: '2', title: 'Pharmacy Confirmed', status: currentStatus === 'confirmed' || currentStatus === 'preparing' || currentStatus === 'out-for-delivery' || currentStatus === 'delivered' ? 'completed' : 'pending', time: '10:05 AM', icon: 'storefront' },
      { id: '3', title: 'Preparing Order', status: currentStatus === 'preparing' || currentStatus === 'out-for-delivery' || currentStatus === 'delivered' ? (currentStatus === 'preparing' ? 'current' : 'completed') : 'pending', time: currentStatus === 'preparing' ? 'Preparing now...' : currentStatus === 'out-for-delivery' || currentStatus === 'delivered' ? '10:30 AM' : 'Pending', icon: 'cube' },
      { id: '4', title: 'Out for Delivery', status: currentStatus === 'out-for-delivery' ? 'current' : currentStatus === 'delivered' ? 'completed' : 'pending', time: currentStatus === 'out-for-delivery' ? 'On the way...' : currentStatus === 'delivered' ? '11:00 AM' : 'Pending', icon: 'bicycle' },
      { id: '5', title: 'Delivered', status: currentStatus === 'delivered' ? 'completed' : 'pending', time: currentStatus === 'delivered' ? '11:30 AM' : 'Pending', icon: 'checkmark-done-circle' },
    ];
    return steps;
  };

  const trackingSteps = getTrackingSteps();

  const getStatusColor = (status) => {
    if (status === 'completed') return '#34c759';
    if (status === 'current') return '#007AFF';
    return '#e0e0e0';
  };

  const getStatusBadgeColor = () => {
    switch (currentStatus) {
      case 'confirmed':
        return '#007AFF';
      case 'preparing':
        return '#ff9500';
      case 'out-for-delivery':
        return '#ffc107';
      case 'delivered':
        return '#34c759';
      default:
        return '#ff9500';
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case 'confirmed':
        return 'CONFIRMED';
      case 'preparing':
        return 'PREPARING';
      case 'out-for-delivery':
        return 'OUT FOR DELIVERY';
      case 'delivered':
        return 'DELIVERED';
      default:
        return 'PENDING';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Order Info Card */}
        <View style={styles.orderCard}>
          <View>
            <Text style={styles.orderId}>Order #{order.id?.slice(0, 8) || '12345678'}</Text>
            <Text style={styles.orderDate}>{order.date || new Date().toLocaleDateString()}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBadgeColor() },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Pharmacy Info */}
        {order.pharmacy && (
          <View style={styles.pharmacyCard}>
            <View style={styles.pharmacyHeader}>
              <View style={styles.pharmacyIcon}>
                <Ionicons name="storefront" size={24} color="#007AFF" />
              </View>
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{order.pharmacy.name}</Text>
                <View style={styles.pharmacyDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text style={styles.detailText}>{order.pharmacy.distance}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={14} color="#666" />
                    <Text style={styles.detailText}>{order.pharmacy.deliveryTime}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Tracking Steps */}
        <View style={styles.trackingContainer}>
          <Text style={styles.trackingTitle}>Order Status</Text>
          {trackingSteps.map((step, index) => {
            const isCurrent = step.status === 'current';
            return (
              <View key={step.id} style={styles.trackingStep}>
                <View style={styles.stepIndicator}>
                  <Animated.View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: getStatusColor(step.status),
                        transform: isCurrent ? [{ scale: pulseAnim }] : [],
                      },
                    ]}
                  >
                    {step.status === 'completed' && (
                      <Ionicons name={step.icon} size={16} color="#fff" />
                    )}
                    {step.status === 'current' && (
                      <View style={styles.currentDot} />
                    )}
                    {step.status === 'pending' && (
                      <View style={styles.pendingDot} />
                    )}
                  </Animated.View>
                  {index < trackingSteps.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor:
                            step.status === 'completed'
                              ? '#34c759'
                              : '#e0e0e0',
                        },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepHeader}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isCurrent && styles.currentStepTitle,
                        step.status === 'completed' && styles.completedStepTitle,
                      ]}
                    >
                      {step.title}
                    </Text>
                    {isCurrent && (
                      <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepTime,
                      isCurrent && styles.currentStepTime,
                    ]}
                  >
                    {step.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items && order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Ionicons name="checkmark-circle" size={20} color="#34c759" />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {typeof item === 'string' ? item : item.name}
                </Text>
                {typeof item === 'object' && item.quantity && (
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Price Summary */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{order.total?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>₹{order.deliveryFee?.toFixed(2) || '25.00'}</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total</Text>
            <Text style={styles.finalTotalValue}>
              ₹{order.finalTotal?.toFixed(2) || (order.total + order.deliveryFee || 70).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Delivery Info */}
        {currentStatus === 'out-for-delivery' && (
          <View style={styles.deliveryInfoCard}>
            <Ionicons name="bicycle" size={32} color="#007AFF" />
            <Text style={styles.deliveryInfoTitle}>Your order is on the way!</Text>
            <Text style={styles.deliveryInfoText}>
              Estimated delivery time: {order.pharmacy?.deliveryTime || '30-45 min'}
            </Text>
          </View>
        )}

        {currentStatus === 'delivered' && (
          <View style={styles.deliveredCard}>
            <Ionicons name="checkmark-done-circle" size={48} color="#34c759" />
            <Text style={styles.deliveredTitle}>Order Delivered!</Text>
            <Text style={styles.deliveredText}>
              Thank you for your order. We hope you're satisfied with your purchase.
            </Text>
            <TouchableOpacity style={styles.rateButton}>
              <Text style={styles.rateButtonText}>Rate Your Experience</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 15,
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  pharmacyCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pharmacyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  pharmacyDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  trackingContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 15,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  stepLine: {
    width: 2,
    height: 45,
    marginTop: 5,
  },
  stepContent: {
    flex: 1,
    paddingTop: 5,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  currentStepTitle: {
    color: '#007AFF',
    fontWeight: '700',
  },
  completedStepTitle: {
    color: '#34c759',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  stepTime: {
    fontSize: 13,
    color: '#999',
  },
  currentStepTime: {
    color: '#007AFF',
    fontWeight: '600',
  },
  itemsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  totalSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    marginTop: 5,
  },
  finalTotalLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  deliveryInfoCard: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  deliveryInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    color: '#007AFF',
  },
  deliveryInfoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  deliveredCard: {
    backgroundColor: '#f0fdf4',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  deliveredTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#34c759',
  },
  deliveredText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  rateButton: {
    backgroundColor: '#34c759',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OrderTrackingScreen;
