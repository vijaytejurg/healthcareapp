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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const DonorScreen = ({ navigation }) => {
  const [donors, setDonors] = useState([
    {
      id: '1',
      name: 'John Smith',
      bloodType: 'O+',
      location: { latitude: 37.78825, longitude: -122.4324 },
      distance: '2.5 km',
      lastDonation: '30 days ago',
      available: true,
      avatar: '👨',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      bloodType: 'A+',
      location: { latitude: 37.78425, longitude: -122.4284 },
      distance: '5.1 km',
      lastDonation: '45 days ago',
      available: true,
      avatar: '👩',
    },
    {
      id: '3',
      name: 'Mike Davis',
      bloodType: 'B+',
      location: { latitude: 37.79225, longitude: -122.4364 },
      distance: '3.8 km',
      lastDonation: '60 days ago',
      available: false,
      avatar: '👨',
    },
  ]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
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

  const filteredDonors =
    bloodTypeFilter === 'all'
      ? donors
      : donors.filter((donor) => donor.bloodType === bloodTypeFilter);

  const handleContactDonor = (donor) => {
    setSelectedDonor(donor);
    navigation.navigate('Chat', {
      user: donor,
      type: 'donor',
    });
  };

  const renderDonor = ({ item }) => (
    <TouchableOpacity
      style={styles.donorCard}
      onPress={() => setSelectedDonor(item)}
    >
      <View style={styles.donorHeader}>
        <Text style={styles.donorAvatar}>{item.avatar}</Text>
        <View style={styles.donorInfo}>
          <View style={styles.donorNameRow}>
            <Text style={styles.donorName}>{item.name}</Text>
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
              <Text style={styles.detailText}>{item.distance}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={14} color="#666" />
              <Text style={styles.detailText}>{item.lastDonation}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.donorActions}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => setSelectedDonor(item)}
        >
          <Ionicons name="map" size={18} color="#007AFF" />
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.contactButton,
            !item.available && styles.contactButtonDisabled,
          ]}
          onPress={() => handleContactDonor(item)}
          disabled={!item.available}
        >
          <Ionicons name="chatbubble" size={18} color="#fff" />
          <Text style={styles.contactButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {bloodTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                bloodTypeFilter === type && styles.activeFilterChip,
              ]}
              onPress={() => setBloodTypeFilter(type)}
            >
              <Text
                style={[
                  styles.filterText,
                  bloodTypeFilter === type && styles.activeFilterText,
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
            <Text style={styles.mapTitle}>
              {selectedDonor.name} - {selectedDonor.bloodType}
            </Text>
            <View style={{ width: 24 }} />
          </View>
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
              title={selectedDonor.name}
              description={`Blood Type: ${selectedDonor.bloodType}`}
              pinColor="red"
            />
          </MapView>
          <View style={styles.mapFooter}>
            <View style={styles.mapInfo}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.mapInfoText}>
                {selectedDonor.distance} away
              </Text>
            </View>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => {
                Alert.alert('Navigation', 'Opening navigation app...');
              }}
            >
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text style={styles.navigateButtonText}>Navigate</Text>
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeFilterChip: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
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
  donorName: {
    fontSize: 18,
    fontWeight: '700',
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
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  contactButtonDisabled: {
    backgroundColor: '#ccc',
  },
  contactButtonText: {
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
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  },
  mapInfoText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
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
});

export default DonorScreen;

