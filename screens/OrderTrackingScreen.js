import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrderTrackingScreen = ({ route, navigation }) => {
  const { order } = route.params || {
    order: {
      id: '12345',
      date: '2024-01-20',
      items: ['Paracetamol 500mg', 'Aspirin 100mg'],
      status: 'in-transit',
      total: 45.00,
    },
  };

  const [trackingSteps, setTrackingSteps] = useState([
    { id: '1', title: 'Order Placed', status: 'completed', time: '10:00 AM' },
    { id: '2', title: 'Confirmed', status: 'completed', time: '10:05 AM' },
    { id: '3', title: 'Preparing', status: 'completed', time: '10:30 AM' },
    { id: '4', title: 'Out for Delivery', status: order.status === 'in-transit' ? 'current' : 'pending', time: '11:00 AM' },
    { id: '5', title: 'Delivered', status: order.status === 'delivered' ? 'completed' : 'pending', time: 'Pending' },
  ]);

  const getStatusColor = (status) => {
    if (status === 'completed') return '#34c759';
    if (status === 'current') return '#007AFF';
    return '#ccc';
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
        <View style={styles.orderCard}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <View
            style={[
              styles.statusBadge,
              order.status === 'delivered' && styles.statusDelivered,
              order.status === 'in-transit' && styles.statusInTransit,
            ]}
          >
            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.trackingContainer}>
          {trackingSteps.map((step, index) => (
            <View key={step.id} style={styles.trackingStep}>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepCircle,
                    { backgroundColor: getStatusColor(step.status) },
                  ]}
                >
                  {step.status === 'completed' && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                  {step.status === 'current' && (
                    <View style={styles.currentDot} />
                  )}
                </View>
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
                <Text
                  style={[
                    styles.stepTitle,
                    step.status === 'current' && styles.currentStepTitle,
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={styles.stepTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Ionicons name="checkmark-circle" size={20} color="#34c759" />
              <Text style={styles.itemName}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>$5.00</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Total</Text>
            <Text style={styles.finalTotalValue}>
              ${(order.total + 5).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ff9500',
  },
  statusDelivered: {
    backgroundColor: '#34c759',
  },
  statusInTransit: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  trackingContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  stepLine: {
    width: 2,
    height: 40,
    marginTop: 5,
  },
  stepContent: {
    flex: 1,
    paddingTop: 5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  currentStepTitle: {
    color: '#007AFF',
    fontWeight: '700',
  },
  stepTime: {
    fontSize: 13,
    color: '#999',
  },
  itemsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  totalSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    marginTop: 10,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
});

export default OrderTrackingScreen;

