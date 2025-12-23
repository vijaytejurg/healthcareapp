import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const HospitalBookingScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHospitalProfile, setShowHospitalProfile] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  useEffect(() => {
    getLocation();
    loadHospitals();
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
    }
  };

  const loadHospitals = () => {
    // Simulated real-time hospital data
    const mockHospitals = [
      {
        id: '1',
        name: 'Apollo Hospitals',
        address: '123 Medical Street, City',
        distance: '2.5 km',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
        images: [
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
          'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        ],
        doctors: [
          {
            id: 'd1',
            name: 'Dr. Rajesh Kumar',
            specialty: 'Cardiologist',
            experience: '15 years',
            tokensReleased: 50,
            tokensBooked: 35,
            queuePosition: 15,
            estimatedWait: '45 min',
            consultationCost: 500,
            available: true,
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
          },
          {
            id: 'd2',
            name: 'Dr. Priya Sharma',
            specialty: 'Pediatrician',
            experience: '12 years',
            tokensReleased: 40,
            tokensBooked: 28,
            queuePosition: 12,
            estimatedWait: '30 min',
            consultationCost: 400,
            available: true,
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
          },
          {
            id: 'd3',
            name: 'Dr. Amit Patel',
            specialty: 'Orthopedic',
            experience: '18 years',
            tokensReleased: 30,
            tokensBooked: 25,
            queuePosition: 5,
            estimatedWait: '15 min',
            consultationCost: 600,
            available: true,
            image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200',
          },
        ],
        specialties: ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology'],
        facilities: ['24/7 Emergency', 'ICU', 'Pharmacy', 'Lab'],
      },
      {
        id: '2',
        name: 'Fortis Healthcare',
        address: '456 Health Avenue, City',
        distance: '3.8 km',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
        images: [
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
        ],
        doctors: [
          {
            id: 'd4',
            name: 'Dr. Sunita Reddy',
            specialty: 'Gynecologist',
            experience: '20 years',
            tokensReleased: 35,
            tokensBooked: 20,
            queuePosition: 15,
            estimatedWait: '20 min',
            consultationCost: 550,
            available: true,
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
          },
          {
            id: 'd5',
            name: 'Dr. Vikram Singh',
            specialty: 'Dermatologist',
            experience: '10 years',
            tokensReleased: 45,
            tokensBooked: 30,
            queuePosition: 15,
            estimatedWait: '25 min',
            consultationCost: 450,
            available: true,
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
          },
        ],
        specialties: ['Gynecology', 'Dermatology', 'ENT'],
        facilities: ['Emergency', 'Pharmacy', 'Lab'],
      },
      {
        id: '3',
        name: 'Max Super Specialty',
        address: '789 Care Road, City',
        distance: '5.2 km',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        images: [
          'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
        ],
        doctors: [
          {
            id: 'd6',
            name: 'Dr. Anjali Mehta',
            specialty: 'Neurologist',
            experience: '22 years',
            tokensReleased: 25,
            tokensBooked: 18,
            queuePosition: 7,
            estimatedWait: '35 min',
            consultationCost: 800,
            available: true,
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
          },
        ],
        specialties: ['Neurology', 'Cardiology', 'Oncology'],
        facilities: ['24/7 Emergency', 'ICU', 'NICU', 'Pharmacy', 'Lab', 'Radiology'],
      },
    ];
    setHospitals(mockHospitals);
  };

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  ];

  const handleBookToken = (hospital, doctor) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }
    Alert.alert(
      'Booking Confirmed!',
      `Token booked with ${selectedDoctor.name} at ${selectedTimeSlot}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowBookingModal(false);
            navigation.navigate('Payment', {
              type: 'consultation',
              amount: selectedDoctor.consultationCost,
              doctor: selectedDoctor,
              hospital: selectedHospital,
              timeSlot: selectedTimeSlot,
            });
          },
        },
      ]
    );
  };

  const renderHospital = ({ item }) => (
    <TouchableOpacity
      style={styles.hospitalCard}
      onPress={() => {
        setSelectedHospital(item);
        setShowHospitalProfile(true);
      }}
    >
      <Image source={{ uri: item.image }} style={styles.hospitalImage} />
      <View style={styles.hospitalInfo}>
        <View style={styles.hospitalHeader}>
          <Text style={styles.hospitalName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#ffc107" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.hospitalDetails}>
          <Ionicons name="location" size={12} color="#666" />
          <Text style={styles.address}>{item.address}</Text>
        </View>
        <View style={styles.hospitalDetails}>
          <Ionicons name="walk" size={12} color="#666" />
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
        <View style={styles.specialtiesContainer}>
          {item.specialties.slice(0, 3).map((spec, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Hospital</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospitals..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredHospitals}
        renderItem={renderHospital}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.hospitalsList}
      />

      {/* Hospital Profile Modal (Instagram-style) */}
      <Modal
        visible={showHospitalProfile}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowHospitalProfile(false)}
      >
        {selectedHospital && (
          <View style={styles.profileContainer}>
            <View style={styles.profileHeader}>
              <TouchableOpacity onPress={() => setShowHospitalProfile(false)}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.profileTitle}>{selectedHospital.name}</Text>
              <TouchableOpacity>
                <Ionicons name="share-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image Gallery */}
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                {selectedHospital.images.map((img, index) => (
                  <Image key={index} source={{ uri: img }} style={styles.profileImage} />
                ))}
              </ScrollView>

              {/* Hospital Info */}
              <View style={styles.profileInfo}>
                <View style={styles.profileHeaderInfo}>
                  <View>
                    <Text style={styles.profileName}>{selectedHospital.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={18} color="#ffc107" />
                      <Text style={styles.rating}>{selectedHospital.rating}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Ionicons name="location" size={18} color="#007AFF" />
                  <Text style={styles.infoText}>{selectedHospital.address}</Text>
                </View>
                <View style={styles.infoSection}>
                  <Ionicons name="walk" size={18} color="#007AFF" />
                  <Text style={styles.infoText}>{selectedHospital.distance} away</Text>
                </View>

                {/* Facilities */}
                <View style={styles.facilitiesSection}>
                  <Text style={styles.sectionTitle}>Facilities</Text>
                  <View style={styles.facilitiesGrid}>
                    {selectedHospital.facilities.map((facility, index) => (
                      <View key={index} style={styles.facilityTag}>
                        <Ionicons name="checkmark-circle" size={16} color="#34c759" />
                        <Text style={styles.facilityText}>{facility}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Available Doctors */}
                <View style={styles.doctorsSection}>
                  <Text style={styles.sectionTitle}>Available Doctors</Text>
                  {selectedHospital.doctors.map((doctor) => (
                    <View key={doctor.id} style={styles.doctorCard}>
                      <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
                      <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                        <Text style={styles.doctorExperience}>{doctor.experience} experience</Text>
                        <View style={styles.tokenInfo}>
                          <View style={styles.tokenItem}>
                            <Ionicons name="ticket" size={14} color="#007AFF" />
                            <Text style={styles.tokenText}>
                              {doctor.tokensBooked}/{doctor.tokensReleased} tokens
                            </Text>
                          </View>
                          <View style={styles.tokenItem}>
                            <Ionicons name="time" size={14} color="#ff9500" />
                            <Text style={styles.tokenText}>Wait: {doctor.estimatedWait}</Text>
                          </View>
                          <View style={styles.tokenItem}>
                            <Ionicons name="people" size={14} color="#34c759" />
                            <Text style={styles.tokenText}>Queue: {doctor.queuePosition}</Text>
                          </View>
                        </View>
                        <View style={styles.priceContainer}>
                          <Text style={styles.price}>₹{doctor.consultationCost}</Text>
                          <TouchableOpacity
                            style={styles.bookButton}
                            onPress={() => handleBookToken(selectedHospital, doctor)}
                          >
                            <Text style={styles.bookButtonText}>Book Token</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {selectedDoctor && (
              <ScrollView>
                <View style={styles.bookingDoctorInfo}>
                  <Image source={{ uri: selectedDoctor.image }} style={styles.bookingDoctorImage} />
                  <View>
                    <Text style={styles.bookingDoctorName}>{selectedDoctor.name}</Text>
                    <Text style={styles.bookingDoctorSpecialty}>{selectedDoctor.specialty}</Text>
                    <Text style={styles.bookingPrice}>₹{selectedDoctor.consultationCost}</Text>
                  </View>
                </View>

                <View style={styles.timeSlotsSection}>
                  <Text style={styles.timeSlotsTitle}>Select Time Slot</Text>
                  <View style={styles.timeSlotsGrid}>
                    {timeSlots.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[
                          styles.timeSlot,
                          selectedTimeSlot === slot && styles.timeSlotSelected,
                        ]}
                        onPress={() => setSelectedTimeSlot(slot)}
                      >
                        <Text
                          style={[
                            styles.timeSlotText,
                            selectedTimeSlot === slot && styles.timeSlotTextSelected,
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    height: 40,
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
  hospitalsList: {
    padding: 10,
  },
  hospitalCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  hospitalImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  hospitalInfo: {
    padding: 10,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
  },
  hospitalDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  address: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  specialtyTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
  profileContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileImage: {
    width: width,
    height: width * 0.5,
    resizeMode: 'cover',
  },
  profileInfo: {
    padding: 15,
  },
  profileHeaderInfo: {
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  facilitiesSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  facilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  facilityText: {
    fontSize: 14,
    color: '#34c759',
    fontWeight: '600',
  },
  doctorsSection: {
    marginTop: 20,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorExperience: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  tokenInfo: {
    marginBottom: 10,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '700',
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
    maxHeight: '90%',
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
  bookingDoctorInfo: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bookingDoctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  bookingDoctorName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bookingDoctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  timeSlotsSection: {
    padding: 20,
  },
  timeSlotsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  timeSlotSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default HospitalBookingScreen;

