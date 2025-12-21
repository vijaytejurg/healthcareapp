import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

let MapView, Marker;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

const { width, height } = Dimensions.get('window');

const AmbulanceScreen = ({ navigation }) => {
  const [ambulances, setAmbulances] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [trackingAmbulance, setTrackingAmbulance] = useState(null);

  useEffect(() => {
    getLocation();
    loadAmbulances();
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateAmbulancePositions();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback location (Delhi)
      setUserLocation({
        latitude: 28.6139,
        longitude: 77.2090,
      });
    }
  };

  const loadAmbulances = () => {
    const mockAmbulances = [
      {
        id: '1',
        type: 'ICU',
        driverName: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        distance: '1.2 km',
        eta: '5 min',
        available: true,
        latitude: 28.6140,
        longitude: 77.2091,
        vehicleNumber: 'DL-01-AB-1234',
        rating: 4.8,
      },
      {
        id: '2',
        type: 'Basic',
        driverName: 'Priya Sharma',
        phone: '+91 98765 43211',
        distance: '2.5 km',
        eta: '8 min',
        available: true,
        latitude: 28.6150,
        longitude: 77.2100,
        vehicleNumber: 'DL-01-CD-5678',
        rating: 4.6,
      },
      {
        id: '3',
        type: 'ICU',
        driverName: 'Amit Patel',
        phone: '+91 98765 43212',
        distance: '3.8 km',
        eta: '12 min',
        available: true,
        latitude: 28.6160,
        longitude: 77.2110,
        vehicleNumber: 'DL-01-EF-9012',
        rating: 4.9,
      },
      {
        id: '4',
        type: 'Basic',
        driverName: 'Sunita Reddy',
        phone: '+91 98765 43213',
        distance: '4.2 km',
        eta: '15 min',
        available: false,
        latitude: 28.6170,
        longitude: 77.2120,
        vehicleNumber: 'DL-01-GH-3456',
        rating: 4.7,
      },
    ];
    setAmbulances(mockAmbulances);
  };

  const updateAmbulancePositions = () => {
    setAmbulances((prev) =>
      prev.map((amb) => ({
        ...amb,
        latitude: amb.latitude + (Math.random() - 0.5) * 0.001,
        longitude: amb.longitude + (Math.random() - 0.5) * 0.001,
        eta: amb.eta !== '5 min' ? `${Math.max(5, parseInt(amb.eta) - 1)} min` : amb.eta,
      }))
    );
  };

  const handleCallDriver = (phone) => {
    Alert.alert('Call Driver', `Call ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => Linking.openURL(`tel:${phone}`),
      },
    ]);
  };

  const handleTrackAmbulance = (ambulance) => {
    setTrackingAmbulance(ambulance);
    setShowMap(true);
  };

  const handleBookAmbulance = (ambulance) => {
    if (!ambulance.available) {
      Alert.alert('Not Available', 'This ambulance is currently not available');
      return;
    }
    Alert.alert(
      'Ambulance Booked!',
      `Ambulance ${ambulance.vehicleNumber} is on the way. ETA: ${ambulance.eta}`,
      [
        {
          text: 'Track',
          onPress: () => handleTrackAmbulance(ambulance),
        },
        {
          text: 'Call Driver',
          onPress: () => handleCallDriver(ambulance.phone),
        },
        { text: 'OK' },
      ]
    );
  };

  const renderAmbulance = ({ item }) => (
    <View style={[styles.ambulanceCard, !item.available && styles.ambulanceCardUnavailable]}>
      <View style={styles.ambulanceHeader}>
        <View style={styles.ambulanceTypeContainer}>
          <View
            style={[
              styles.ambulanceTypeBadge,
              item.type === 'ICU' ? styles.icuBadge : styles.basicBadge,
            ]}
          >
            <Ionicons
              name="medical"
              size={20}
              color={item.type === 'ICU' ? '#fff' : '#007AFF'}
            />
            <Text
              style={[
                styles.ambulanceTypeText,
                item.type === 'ICU' && styles.ambulanceTypeTextWhite,
              ]}
            >
              {item.type}
            </Text>
          </View>
          {!item.available && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#ffc107" />
          <Text style={styles.rating}>{item.rating}</Text>
        </View>
      </View>

      <View style={styles.ambulanceInfo}>
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}>
            <Ionicons name="person" size={24} color="#007AFF" />
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{item.driverName}</Text>
            <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
          </View>
        </View>

        <View style={styles.distanceInfo}>
          <View style={styles.distanceItem}>
            <Ionicons name="location" size={18} color="#ff3b30" />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
          <View style={styles.distanceItem}>
            <Ionicons name="time" size={18} color="#ff9500" />
            <Text style={styles.etaText}>ETA: {item.eta}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => handleCallDriver(item.phone)}
            disabled={!item.available}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.trackButton]}
            onPress={() => handleTrackAmbulance(item)}
            disabled={!item.available}
          >
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Track</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.bookButton]}
            onPress={() => handleBookAmbulance(item)}
            disabled={!item.available}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Emergency Header */}
      <View style={styles.emergencyHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.emergencyTitleContainer}>
          <Ionicons name="medical" size={28} color="#fff" />
          <Text style={styles.emergencyTitle}>Emergency Ambulance</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Quick Emergency Button */}
      <View style={styles.quickEmergencyContainer}>
        <TouchableOpacity
          style={styles.quickEmergencyButton}
          onPress={() => {
            const nearestAmbulance = ambulances
              .filter((a) => a.available)
              .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))[0];
            if (nearestAmbulance) {
              handleBookAmbulance(nearestAmbulance);
            } else {
              Alert.alert('No Ambulance Available', 'Please try again in a few moments');
            }
          }}
        >
          <Ionicons name="alert-circle" size={32} color="#fff" />
          <Text style={styles.quickEmergencyText}>Call Nearest Ambulance</Text>
        </TouchableOpacity>
      </View>

      {/* Ambulances List */}
      <FlatList
        data={ambulances}
        renderItem={renderAmbulance}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ambulancesList}
      />

      {/* Map Modal */}
      <Modal visible={showMap} animationType="slide" transparent={false}>
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity onPress={() => setShowMap(false)}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>Track Ambulance</Text>
            <View style={{ width: 24 }} />
          </View>
          {userLocation && trackingAmbulance && (
            <>
              {Platform.OS !== 'web' && MapView ? (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: userLocation.latitude,
                      longitude: userLocation.longitude,
                    }}
                    title="Your Location"
                    pinColor="#007AFF"
                  />
                  <Marker
                    coordinate={{
                      latitude: trackingAmbulance.latitude,
                      longitude: trackingAmbulance.longitude,
                    }}
                    title={`Ambulance ${trackingAmbulance.vehicleNumber}`}
                    pinColor="#ff3b30"
                  >
                    <View style={styles.ambulanceMarker}>
                      <Ionicons name="medical" size={30} color="#ff3b30" />
                    </View>
                  </Marker>
                </MapView>
              ) : (
                <View style={[styles.map, styles.mapPlaceholder]}>
                  <Ionicons name="map" size={64} color="#ccc" />
                  <Text style={styles.mapPlaceholderText}>Map View</Text>
                  <Text style={styles.mapPlaceholderSubtext}>
                    Ambulance Location: {trackingAmbulance.latitude.toFixed(4)},{' '}
                    {trackingAmbulance.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            </>
          )}
          {trackingAmbulance && (
            <View style={styles.trackingInfo}>
              <View style={styles.trackingItem}>
                <Ionicons name="medical" size={20} color="#ff3b30" />
                <View style={styles.trackingDetails}>
                  <Text style={styles.trackingLabel}>Ambulance</Text>
                  <Text style={styles.trackingValue}>{trackingAmbulance.vehicleNumber}</Text>
                </View>
              </View>
              <View style={styles.trackingItem}>
                <Ionicons name="person" size={20} color="#007AFF" />
                <View style={styles.trackingDetails}>
                  <Text style={styles.trackingLabel}>Driver</Text>
                  <Text style={styles.trackingValue}>{trackingAmbulance.driverName}</Text>
                </View>
              </View>
              <View style={styles.trackingItem}>
                <Ionicons name="time" size={20} color="#ff9500" />
                <View style={styles.trackingDetails}>
                  <Text style={styles.trackingLabel}>ETA</Text>
                  <Text style={styles.trackingValue}>{trackingAmbulance.eta}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.callDriverButton}
                onPress={() => handleCallDriver(trackingAmbulance.phone)}
              >
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.callDriverText}>Call Driver</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#ff3b30',
  },
  emergencyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  quickEmergencyContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  quickEmergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  quickEmergencyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  ambulancesList: {
    padding: 15,
  },
  ambulanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ambulanceCardUnavailable: {
    opacity: 0.6,
  },
  ambulanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ambulanceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ambulanceTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    backgroundColor: '#e3f2fd',
  },
  icuBadge: {
    backgroundColor: '#ff3b30',
  },
  basicBadge: {
    backgroundColor: '#e3f2fd',
  },
  ambulanceTypeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  ambulanceTypeTextWhite: {
    color: '#fff',
  },
  unavailableBadge: {
    backgroundColor: '#ff9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unavailableText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  ambulanceInfo: {
    gap: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: 12,
    color: '#666',
  },
  distanceInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  distanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff3b30',
  },
  etaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff9500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  callButton: {
    backgroundColor: '#34c759',
  },
  trackButton: {
    backgroundColor: '#007AFF',
  },
  bookButton: {
    backgroundColor: '#ff3b30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  ambulanceMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
  },
  trackingInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  trackingDetails: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  trackingValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  callDriverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34c759',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  callDriverText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AmbulanceScreen;

