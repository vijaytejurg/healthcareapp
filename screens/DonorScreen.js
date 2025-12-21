import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { db } from '../src/firebase';
import { collection, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';

// Conditionally import MapView only on native platforms
let MapView, Marker;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

// Indian cities with coordinates
const INDIAN_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { name: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
  { name: 'Surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311 },
  { name: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462 },
  { name: 'Kanpur', state: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319 },
  { name: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
  { name: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  { name: 'Thane', state: 'Maharashtra', latitude: 19.2183, longitude: 72.9781 },
  { name: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185 },
  { name: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376 },
  { name: 'Vadodara', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', latitude: 28.6692, longitude: 77.4538 },
];

const DonorScreen = ({ navigation }) => {
  const [donors, setDonors] = useState([
    {
      id: '1',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      bloodType: 'O+',
      city: 'Mumbai',
      location: { latitude: 19.0760, longitude: 72.8777 },
      distance: '2.5 km',
      lastDonation: '30 days ago',
      available: true,
      avatar: '👨',
      hospitalVisitConfirmed: false,
    },
    {
      id: '2',
      name: 'Priya Patel',
      phone: '+91 98765 43211',
      bloodType: 'A+',
      city: 'Delhi',
      location: { latitude: 28.6139, longitude: 77.2090 },
      distance: '5.1 km',
      lastDonation: '45 days ago',
      available: true,
      avatar: '👩',
      hospitalVisitConfirmed: false,
    },
    {
      id: '3',
      name: 'Amit Kumar',
      phone: '+91 98765 43212',
      bloodType: 'B+',
      city: 'Bangalore',
      location: { latitude: 12.9716, longitude: 77.5946 },
      distance: '3.8 km',
      lastDonation: '60 days ago',
      available: false,
      avatar: '👨',
      hospitalVisitConfirmed: true,
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      phone: '+91 98765 43213',
      bloodType: 'O-',
      city: 'Hyderabad',
      location: { latitude: 17.3850, longitude: 78.4867 },
      distance: '4.2 km',
      lastDonation: '25 days ago',
      available: true,
      avatar: '👩',
      hospitalVisitConfirmed: false,
    },
    {
      id: '5',
      name: 'Vikram Singh',
      phone: '+91 98765 43214',
      bloodType: 'AB+',
      city: 'Chennai',
      location: { latitude: 13.0827, longitude: 80.2707 },
      distance: '6.5 km',
      lastDonation: '90 days ago',
      available: true,
      avatar: '👨',
      hospitalVisitConfirmed: true,
    },
  ]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [showCityModal, setShowCityModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    if (Platform.OS === 'web') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.log('Location error:', error);
          }
        );
      }
      return;
    }
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const bloodTypes = ['all', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const filteredDonors = donors.filter((donor) => {
    const matchesBloodType = bloodTypeFilter === 'all' || donor.bloodType === bloodTypeFilter;
    const matchesCity = cityFilter === 'all' || donor.city === cityFilter;
    const matchesSearch = searchQuery === '' || 
      donor.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBloodType && matchesCity && matchesSearch && donor.available;
  });

  const handleCall = (phone) => {
    const phoneNumber = phone.replace(/\s/g, '');
    const url = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Unable to make phone call');
      });
  };

  const handleChat = (donor) => {
    navigation.navigate('Chat', {
      user: {
        ...donor,
        name: donor.hospitalVisitConfirmed ? donor.name : 'Anonymous Donor',
      },
      type: 'donor',
    });
  };

  const sendEmergencyNotification = async (donor) => {
    try {
      // Add notification to Firestore
      await addDoc(collection(db, 'notifications'), {
        donorId: donor.id,
        donorName: donor.name,
        donorPhone: donor.phone,
        bloodType: donor.bloodType,
        city: donor.city,
        type: 'emergency',
        message: `URGENT: Blood donation needed! Blood type ${donor.bloodType} required immediately.`,
        timestamp: new Date(),
        status: 'pending',
      });

      Alert.alert(
        'Emergency Notification Sent!',
        `An urgent notification has been sent to ${donor.hospitalVisitConfirmed ? donor.name : 'the donor'}. They will be notified immediately.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // You can also trigger a push notification here if configured
              console.log('Emergency notification sent to:', donor.id);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert(
        'Notification Sent',
        'Emergency notification has been sent to the donor. They will be contacted immediately.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEmergencyNotify = (donor) => {
    Alert.alert(
      'Emergency Blood Request',
      `Send an urgent notification to ${donor.hospitalVisitConfirmed ? donor.name : 'this donor'}? They will be notified immediately about the blood requirement.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Notification',
          style: 'destructive',
          onPress: () => sendEmergencyNotification(donor),
        },
      ]
    );
  };

  const handleNavigate = (donor) => {
    const { latitude, longitude } = donor.location;
    const url = Platform.OS === 'ios'
      ? `maps://maps.apple.com/?daddr=${latitude},${longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Navigation is not supported on this device');
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Unable to open navigation');
      });
  };

  const renderDonor = ({ item }) => {
    const displayName = item.hospitalVisitConfirmed ? item.name : 'Anonymous Donor';
    const displayLocation = `${item.city}, ${item.distance} away`;

    return (
      <TouchableOpacity
        style={styles.donorCard}
        onPress={() => setSelectedDonor(item)}
      >
        <View style={styles.donorHeader}>
          <Text style={styles.donorAvatar}>{item.avatar}</Text>
          <View style={styles.donorInfo}>
            <View style={styles.donorNameRow}>
              <View style={styles.donorNameContainer}>
                <Text style={styles.donorName}>{displayName}</Text>
                {!item.hospitalVisitConfirmed && (
                  <View style={styles.anonymousBadge}>
                    <Ionicons name="lock-closed" size={10} color="#666" />
                    <Text style={styles.anonymousText}>Name hidden</Text>
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.availabilityBadge,
                  item.available ? styles.available : styles.unavailable,
                ]}
              >
                <Text style={styles.availabilityText}>
                  {item.available ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>
            <View style={styles.bloodTypeContainer}>
              <Ionicons name="water" size={16} color="#ff3b30" />
              <Text style={styles.bloodType}>{item.bloodType}</Text>
            </View>
            <View style={styles.donorDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={14} color="#666" />
                <Text style={styles.detailText}>{displayLocation}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={14} color="#666" />
                <Text style={styles.detailText}>{item.lastDonation}</Text>
              </View>
            </View>
            {item.hospitalVisitConfirmed && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#34c759" />
                <Text style={styles.verifiedText}>Hospital visit confirmed</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.donorActions}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setSelectedDonor(item)}
          >
            <Ionicons name="map" size={18} color="#007AFF" />
            <Text style={styles.mapButtonText}>View Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => handleChat(item)}
            disabled={!item.available}
          >
            <Ionicons name="chatbubble" size={18} color="#fff" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emergencyActions}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(item.phone)}
            disabled={!item.hospitalVisitConfirmed}
          >
            <Ionicons name="call" size={18} color={item.hospitalVisitConfirmed ? "#34c759" : "#ccc"} />
            <Text style={[styles.callButtonText, !item.hospitalVisitConfirmed && styles.disabledText]}>
              Call
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.emergencyButton, !item.available && styles.emergencyButtonDisabled]}
            onPress={() => handleEmergencyNotify(item)}
            disabled={!item.available}
          >
            <Ionicons name="alert-circle" size={18} color="#fff" />
            <Text style={styles.emergencyButtonText}>Emergency Notify</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city or blood type..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              cityFilter === 'all' && styles.activeFilterChip,
            ]}
            onPress={() => setCityFilter('all')}
          >
            <Ionicons name="location" size={14} color={cityFilter === 'all' ? '#fff' : '#666'} />
            <Text
              style={[
                styles.filterText,
                cityFilter === 'all' && styles.activeFilterText,
              ]}
            >
              All Cities
            </Text>
          </TouchableOpacity>
          {INDIAN_CITIES.slice(0, 8).map((city) => (
            <TouchableOpacity
              key={city.name}
              style={[
                styles.filterChip,
                cityFilter === city.name && styles.activeFilterChip,
              ]}
              onPress={() => setCityFilter(city.name)}
            >
              <Text
                style={[
                  styles.filterText,
                  cityFilter === city.name && styles.activeFilterText,
                ]}
              >
                {city.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.moreCitiesButton}
            onPress={() => setShowCityModal(true)}
          >
            <Text style={styles.moreCitiesText}>+ More</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.bloodFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {bloodTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.bloodFilterChip,
                bloodTypeFilter === type && styles.activeBloodFilterChip,
              ]}
              onPress={() => setBloodTypeFilter(type)}
            >
              <Text
                style={[
                  styles.bloodFilterText,
                  bloodTypeFilter === type && styles.activeBloodFilterText,
                ]}
              >
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedDonor ? (
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedDonor(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.mapTitleContainer}>
              <Text style={styles.mapTitle}>
                {selectedDonor.hospitalVisitConfirmed ? selectedDonor.name : 'Anonymous Donor'} - {selectedDonor.bloodType}
              </Text>
              <Text style={styles.mapSubtitle}>{selectedDonor.city}</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>
          {Platform.OS !== 'web' && MapView ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: selectedDonor.location.latitude,
                longitude: selectedDonor.location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {userLocation && (
                <Marker
                  coordinate={userLocation}
                  title="Your Location"
                  pinColor="blue"
                />
              )}
              <Marker
                coordinate={selectedDonor.location}
                title={selectedDonor.hospitalVisitConfirmed ? selectedDonor.name : 'Donor Location'}
                description={`Blood Type: ${selectedDonor.bloodType} | ${selectedDonor.city}`}
                pinColor="red"
              />
            </MapView>
          ) : (
            <View style={[styles.map, styles.webMapPlaceholder]}>
              <Ionicons name="map" size={64} color="#ccc" />
              <Text style={styles.webMapText}>Map view not available on web</Text>
              <Text style={styles.webMapSubtext}>
                {selectedDonor.city} - {selectedDonor.location.latitude.toFixed(4)}, {selectedDonor.location.longitude.toFixed(4)}
              </Text>
            </View>
          )}
          <View style={styles.mapFooter}>
            <View style={styles.mapInfo}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <View>
                <Text style={styles.mapInfoText}>{selectedDonor.city}</Text>
                <Text style={styles.mapInfoSubtext}>{selectedDonor.distance} away</Text>
              </View>
            </View>
            <View style={styles.mapActions}>
              {selectedDonor.hospitalVisitConfirmed && (
                <TouchableOpacity
                  style={styles.footerCallButton}
                  onPress={() => handleCall(selectedDonor.phone)}
                >
                  <Ionicons name="call" size={18} color="#34c759" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={() => handleNavigate(selectedDonor)}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.navigateButtonText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.mapActionButtons}>
            <TouchableOpacity
              style={styles.mapChatButton}
              onPress={() => handleChat(selectedDonor)}
            >
              <Ionicons name="chatbubble" size={20} color="#007AFF" />
              <Text style={styles.mapChatButtonText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapEmergencyButton, !selectedDonor.available && styles.mapEmergencyButtonDisabled]}
              onPress={() => handleEmergencyNotify(selectedDonor)}
              disabled={!selectedDonor.available}
            >
              <Ionicons name="alert-circle" size={20} color="#fff" />
              <Text style={styles.mapEmergencyButtonText}>Emergency Notify</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredDonors}
          renderItem={renderDonor}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="water-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No donors found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={INDIAN_CITIES}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => {
                    setCityFilter(item.name);
                    setShowCityModal(false);
                  }}
                >
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.cityState}>{item.state}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  filterContent: {
    paddingHorizontal: 15,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 5,
  },
  activeFilterText: {
    color: '#fff',
  },
  moreCitiesButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  moreCitiesText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  bloodFilterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  bloodFilterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeBloodFilterChip: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  bloodFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeBloodFilterText: {
    color: '#fff',
  },
  listContent: {
    padding: 15,
  },
  donorCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  donorHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  donorAvatar: {
    fontSize: 50,
    marginRight: 15,
  },
  donorInfo: {
    flex: 1,
  },
  donorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  donorNameContainer: {
    flex: 1,
  },
  donorName: {
    fontSize: 18,
    fontWeight: '700',
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  anonymousText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  available: {
    backgroundColor: '#34c759',
  },
  unavailable: {
    backgroundColor: '#ff9500',
  },
  availabilityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  verifiedText: {
    fontSize: 12,
    color: '#34c759',
    marginLeft: 4,
    fontWeight: '600',
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bloodType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff3b30',
    marginLeft: 5,
  },
  donorDetails: {
    flexDirection: 'row',
    marginTop: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  donorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    marginBottom: 10,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  mapButtonText: {
    color: '#007AFF',
    marginLeft: 5,
    fontWeight: '600',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  chatButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
  },
  emergencyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#34c759',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#34c759',
    marginLeft: 5,
    fontWeight: '600',
  },
  disabledText: {
    color: '#ccc',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  emergencyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  emergencyButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
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
  backButton: {
    padding: 5,
  },
  mapTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  map: {
    flex: 1,
  },
  mapFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  mapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mapInfoText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  mapInfoSubtext: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginTop: 2,
  },
  mapActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerCallButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34c759',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navigateButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
  },
  mapActionButtons: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  mapChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  mapChatButtonText: {
    color: '#007AFF',
    marginLeft: 5,
    fontWeight: '600',
  },
  mapEmergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  mapEmergencyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  mapEmergencyButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
  },
  webMapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  webMapText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  webMapSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  cityState: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default DonorScreen;
