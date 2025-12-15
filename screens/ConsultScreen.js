import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

const ConsultScreen = ({ navigation }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const specialties = ['all', 'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics'];

  const doctors = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      avatar: '👩‍⚕️',
      rating: 4.8,
      patients: 1234,
      experience: '10 years',
      verified: true,
      followers: 5678,
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Dermatology',
      avatar: '👨‍⚕️',
      rating: 4.9,
      patients: 2341,
      experience: '8 years',
      verified: true,
      followers: 8901,
    },
    {
      id: '3',
      name: 'Dr. Emily Davis',
      specialty: 'Neurology',
      avatar: '👩‍⚕️',
      rating: 4.7,
      patients: 987,
      experience: '12 years',
      verified: true,
      followers: 4567,
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      specialty: 'Pediatrics',
      avatar: '👨‍⚕️',
      rating: 4.9,
      patients: 3456,
      experience: '15 years',
      verified: true,
      followers: 12345,
    },
  ];

  const filteredDoctors =
    selectedSpecialty === 'all'
      ? doctors
      : doctors.filter((doc) => doc.specialty === selectedSpecialty);

  const handleBookConsultation = (doctor) => {
    setSelectedDoctor(doctor);
    setShowCalendar(true);
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
    setShowPayment(true);
  };

  const handlePayment = () => {
    setShowPayment(false);
    navigation.navigate('ConsultationChat', { doctor: selectedDoctor, date: selectedDate });
  };

  const renderDoctor = ({ item }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate('DoctorProfile', { doctor: item })}
    >
      <View style={styles.doctorHeader}>
        <Text style={styles.doctorAvatar}>{item.avatar}</Text>
        <View style={styles.doctorInfo}>
          <View style={styles.doctorNameRow}>
            <Text style={styles.doctorName}>{item.name}</Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={18} color="#007AFF" />
            )}
          </View>
          <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
          <View style={styles.doctorStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.statText}>{item.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={14} color="#666" />
              <Text style={styles.statText}>{item.followers} followers</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.doctorDetails}>
        <Text style={styles.detailText}>👥 {item.patients} patients</Text>
        <Text style={styles.detailText}>⏱️ {item.experience} experience</Text>
      </View>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => handleBookConsultation(item)}
      >
        <Text style={styles.bookButtonText}>Book Consultation</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors..."
          placeholderTextColor="#999"
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.specialtyContainer}
        contentContainerStyle={styles.specialtyContent}
      >
        {specialties.map((specialty) => (
          <TouchableOpacity
            key={specialty}
            style={[
              styles.specialtyChip,
              selectedSpecialty === specialty && styles.activeSpecialtyChip,
            ]}
            onPress={() => setSelectedSpecialty(specialty)}
          >
            <Text
              style={[
                styles.specialtyText,
                selectedSpecialty === specialty && styles.activeSpecialtyText,
              ]}
            >
              {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctor}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      <Modal visible={showCalendar} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date & Time</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#007AFF' },
              }}
              minDate={new Date().toISOString().split('T')[0]}
            />
            <View style={styles.timeSlots}>
              <Text style={styles.timeSlotTitle}>Available Time Slots</Text>
              <View style={styles.timeSlotGrid}>
                {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map(
                  (time) => (
                    <TouchableOpacity key={time} style={styles.timeSlot}>
                      <Text style={styles.timeSlotText}>{time}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={showPayment} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment</Text>
              <TouchableOpacity onPress={() => setShowPayment(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.paymentDetails}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Consultation Fee</Text>
                <Text style={styles.paymentValue}>$50.00</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Platform Fee</Text>
                <Text style={styles.paymentValue}>$5.00</Text>
              </View>
              <View style={[styles.paymentRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>$55.00</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
              <Text style={styles.payButtonText}>Pay $55.00</Text>
            </TouchableOpacity>
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
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  specialtyContainer: {
    maxHeight: 50,
  },
  specialtyContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  specialtyChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeSpecialtyChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  specialtyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeSpecialtyText: {
    color: '#fff',
  },
  listContent: {
    padding: 15,
  },
  doctorCard: {
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
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  doctorAvatar: {
    fontSize: 50,
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 5,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  doctorStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  doctorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  timeSlots: {
    marginTop: 20,
  },
  timeSlotTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentDetails: {
    marginVertical: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#666',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ConsultScreen;

