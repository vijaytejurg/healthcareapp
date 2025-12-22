/**
 * Complete Profile Screen
 * Collects additional profile information after login
 * Shows different fields based on user role
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/firebase';
import { getRoleHomeRoute } from '../utils/roleRouting';

export default function CompleteProfileScreen() {
  const { user, userData, role } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  // Common fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  // Doctor-specific fields
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [experience, setExperience] = useState('');
  const [qualifications, setQualifications] = useState('');
  
  // Patient-specific fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  
  // Pharmacy-specific fields
  const [shopName, setShopName] = useState('');
  const [pharmacyLicense, setPharmacyLicense] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  
  // Delivery-specific fields
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [deliveryServiceArea, setDeliveryServiceArea] = useState('');
  
  // Hospital-specific fields
  const [hospitalLicense, setHospitalLicense] = useState('');
  const [hospitalType, setHospitalType] = useState('');
  const [beds, setBeds] = useState('');

  const validateForm = () => {
    // Common validations
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number (10 digits)');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    if (!state.trim()) {
      Alert.alert('Error', 'Please enter your state');
      return false;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return false;
    }

    // Role-specific validations
    if (role === 'doctor') {
      if (!specialization.trim()) {
        Alert.alert('Error', 'Please enter your medical specialization');
        return false;
      }
      if (!licenseNumber.trim()) {
        Alert.alert('Error', 'Please enter your medical license number');
        return false;
      }
      if (!hospitalName.trim()) {
        Alert.alert('Error', 'Please enter your hospital/clinic name');
        return false;
      }
    }

    if (role === 'patient') {
      if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
        Alert.alert('Error', 'Please enter a valid age');
        return false;
      }
      if (!gender.trim()) {
        Alert.alert('Error', 'Please select your gender');
        return false;
      }
      if (!bloodGroup.trim()) {
        Alert.alert('Error', 'Please enter your blood group');
        return false;
      }
    }

    if (role === 'pharmacy') {
      if (!shopName.trim()) {
        Alert.alert('Error', 'Please enter your pharmacy shop name');
        return false;
      }
      if (!pharmacyLicense.trim()) {
        Alert.alert('Error', 'Please enter your pharmacy license number');
        return false;
      }
    }

    if (role === 'delivery') {
      if (!vehicleNumber.trim()) {
        Alert.alert('Error', 'Please enter your vehicle number');
        return false;
      }
    }

    if (role === 'hospital') {
      if (!hospitalLicense.trim()) {
        Alert.alert('Error', 'Please enter your hospital license number');
        return false;
      }
    }

    return true;
  };

  const handleCompleteProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Build profile data based on role
      const profileData = {
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      };

      // Add role-specific fields
      if (role === 'doctor') {
        profileData.specialization = specialization.trim();
        profileData.licenseNumber = licenseNumber.trim();
        profileData.hospitalName = hospitalName.trim();
        profileData.experience = parseInt(experience) || 0;
        profileData.qualifications = qualifications.split(',').map(q => q.trim()).filter(q => q);
        profileData.verificationStatus = 'pending'; // Doctors need verification
      }

      if (role === 'patient') {
        profileData.age = parseInt(age);
        profileData.gender = gender.trim();
        profileData.bloodGroup = bloodGroup.trim();
      }

      if (role === 'pharmacy') {
        profileData.shopName = shopName.trim();
        profileData.licenseNumber = pharmacyLicense.trim();
        profileData.serviceArea = serviceArea.trim();
      }

      if (role === 'delivery') {
        profileData.vehicleNumber = vehicleNumber.trim();
        profileData.serviceArea = deliveryServiceArea.trim();
      }

      if (role === 'hospital') {
        profileData.licenseNumber = hospitalLicense.trim();
        profileData.hospitalType = hospitalType.trim();
        profileData.beds = parseInt(beds) || 0;
      }

      await updateDoc(userDocRef, profileData);
      
      console.log('✅ Profile completed! profileCompleted set to true');
      console.log('🔄 Waiting for Firestore to sync and AuthContext to update...');
      
      // Wait for Firestore to sync and AuthContext to update via real-time listener
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the updated user data to verify
      const updatedDoc = await getDoc(userDocRef);
      if (updatedDoc.exists()) {
        const updatedData = updatedDoc.data();
        console.log('✅ Updated profile data:', { 
          profileCompleted: updatedData.profileCompleted, 
          role: updatedData.role 
        });
        
        if (updatedData.profileCompleted === true) {
          const homeRoute = getRoleHomeRoute(updatedData.role);
          console.log('🏠 Home route determined:', homeRoute);
          
          // For web: reload page to trigger App.js navigation logic
          // For native: use navigation directly
          if (typeof window !== 'undefined') {
            // Web: Reload to trigger App.js navigation
            console.log('🌐 Web detected - reloading page to trigger navigation...');
            Alert.alert(
              'Success!',
              'Your profile has been completed successfully!\n\nRedirecting...',
              [{ text: 'OK' }]
            );
            // Small delay before reload to show alert
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            // Native: Navigate directly
            console.log('📱 Native detected - navigating directly...');
            Alert.alert(
              'Success!',
              'Your profile has been completed successfully!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: homeRoute }],
                    });
                  },
                },
              ]
            );
          }
        } else {
          console.error('❌ Profile completed flag not set correctly!');
          Alert.alert('Error', 'Profile update failed. Please try again.');
        }
      } else {
        console.error('❌ User document not found after update!');
        Alert.alert('Error', 'Profile update failed. Please try again.');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      Alert.alert('Error', 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (role === 'doctor') {
      return (
        <>
          <Text style={styles.sectionTitle}>Medical Information (India)</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="medical-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Medical Specialization (e.g., Cardiology, General Medicine)"
              placeholderTextColor="#999"
              value={specialization}
              onChangeText={setSpecialization}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Medical License Number (MCI/State Medical Council)"
              placeholderTextColor="#999"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Hospital/Clinic Name"
              placeholderTextColor="#999"
              value={hospitalName}
              onChangeText={setHospitalName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Years of Experience"
              placeholderTextColor="#999"
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="school-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Qualifications (comma-separated, e.g., MBBS, MD)"
              placeholderTextColor="#999"
              value={qualifications}
              onChangeText={setQualifications}
              multiline
              numberOfLines={2}
              editable={!loading}
            />
          </View>
        </>
      );
    }

    if (role === 'patient') {
      return (
        <>
          <Text style={styles.sectionTitle}>Health Information</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#999"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Gender (Male/Female/Other)"
              placeholderTextColor="#999"
              value={gender}
              onChangeText={setGender}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="water-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Blood Group (e.g., O+, A+, B+)"
              placeholderTextColor="#999"
              value={bloodGroup}
              onChangeText={setBloodGroup}
              editable={!loading}
            />
          </View>
        </>
      );
    }

    if (role === 'pharmacy') {
      return (
        <>
          <Text style={styles.sectionTitle}>Pharmacy Information</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="storefront-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Pharmacy Shop Name"
              placeholderTextColor="#999"
              value={shopName}
              onChangeText={setShopName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Pharmacy License Number"
              placeholderTextColor="#999"
              value={pharmacyLicense}
              onChangeText={setPharmacyLicense}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Service Area"
              placeholderTextColor="#999"
              value={serviceArea}
              onChangeText={setServiceArea}
              editable={!loading}
            />
          </View>
        </>
      );
    }

    if (role === 'delivery') {
      return (
        <>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="car-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Vehicle Number"
              placeholderTextColor="#999"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Service Area"
              placeholderTextColor="#999"
              value={deliveryServiceArea}
              onChangeText={setDeliveryServiceArea}
              editable={!loading}
            />
          </View>
        </>
      );
    }

    if (role === 'hospital') {
      return (
        <>
          <Text style={styles.sectionTitle}>Hospital Information</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Hospital License Number"
              placeholderTextColor="#999"
              value={hospitalLicense}
              onChangeText={setHospitalLicense}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Hospital Type (Private/Government)"
              placeholderTextColor="#999"
              value={hospitalType}
              onChangeText={setHospitalType}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="bed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Number of Beds"
              placeholderTextColor="#999"
              value={beds}
              onChangeText={setBeds}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>
        </>
      );
    }

    return null;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="person-circle" size={60} color="#007AFF" />
          </View>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Please provide the following information</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number (10 digits)"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Address"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
              editable={!loading}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
                editable={!loading}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#999"
                value={state}
                onChangeText={setState}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Pincode (6 digits)"
              placeholderTextColor="#999"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
              maxLength={6}
              editable={!loading}
            />
          </View>

          {renderRoleSpecificFields()}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCompleteProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 20,
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfWidth: {
    width: '48%',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

