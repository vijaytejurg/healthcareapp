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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../src/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// User roles
const USER_ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  BLOOD_DONOR: 'blood_donor',
  MEDICINE_DELIVERY: 'medicine_delivery',
  AMBULANCE_DRIVER: 'ambulance_driver',
  ADMIN: 'admin',
};

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Basic info, 2: Role selection, 3: Role-specific fields
  const [loading, setLoading] = useState(false);

  // Basic info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Role selection
  const [selectedRole, setSelectedRole] = useState(null);

  // Role-specific fields
  const [roleFields, setRoleFields] = useState({
    // Doctor fields
    specialization: '',
    licenseNumber: '',
    hospitalName: '',
    
    // Patient fields
    age: '',
    gender: '',
    bloodGroup: '',
    
    // Blood Donor fields
    availabilityStatus: 'available',
    
    // Delivery Partner fields
    serviceArea: '',
    
    // Ambulance Driver fields
    vehicleNumber: '',
  });

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(3);
  };

  // Handle role-specific field changes
  const updateRoleField = (field, value) => {
    setRoleFields(prev => ({ ...prev, [field]: value }));
  };

  // Validate basic info
  const validateBasicInfo = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  // Validate role-specific fields
  const validateRoleFields = () => {
    if (selectedRole === USER_ROLES.DOCTOR) {
      if (!roleFields.specialization.trim()) {
        Alert.alert('Error', 'Please enter your specialization');
        return false;
      }
      if (!roleFields.licenseNumber.trim()) {
        Alert.alert('Error', 'Please enter your license number');
        return false;
      }
    } else if (selectedRole === USER_ROLES.PATIENT) {
      if (!roleFields.age || parseInt(roleFields.age) < 1) {
        Alert.alert('Error', 'Please enter a valid age');
        return false;
      }
      if (!roleFields.gender) {
        Alert.alert('Error', 'Please select your gender');
        return false;
      }
    } else if (selectedRole === USER_ROLES.BLOOD_DONOR) {
      if (!roleFields.bloodGroup) {
        Alert.alert('Error', 'Please select your blood group');
        return false;
      }
    } else if (selectedRole === USER_ROLES.MEDICINE_DELIVERY) {
      if (!roleFields.serviceArea.trim()) {
        Alert.alert('Error', 'Please enter your service area');
        return false;
      }
    } else if (selectedRole === USER_ROLES.AMBULANCE_DRIVER) {
      if (!roleFields.vehicleNumber.trim()) {
        Alert.alert('Error', 'Please enter your vehicle number');
        return false;
      }
    }
    return true;
  };

  // Create user profile in Firestore
  const createUserProfile = async (userCredential) => {
    const user = userCredential.user;
    const userData = {
      uid: user.uid,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role: selectedRole,
      profilePhoto: null,
      createdAt: serverTimestamp(),
      isActive: true,
      verificationStatus: selectedRole === USER_ROLES.DOCTOR ? 'pending' : 'verified',
      // Role-specific fields
      ...(selectedRole === USER_ROLES.DOCTOR && {
        specialization: roleFields.specialization.trim(),
        licenseNumber: roleFields.licenseNumber.trim(),
        hospitalName: roleFields.hospitalName.trim(),
        verified: false,
      }),
      ...(selectedRole === USER_ROLES.PATIENT && {
        age: parseInt(roleFields.age),
        gender: roleFields.gender,
        bloodGroup: roleFields.bloodGroup,
      }),
      ...(selectedRole === USER_ROLES.BLOOD_DONOR && {
        bloodGroup: roleFields.bloodGroup,
        availabilityStatus: roleFields.availabilityStatus,
      }),
      ...(selectedRole === USER_ROLES.MEDICINE_DELIVERY && {
        serviceArea: roleFields.serviceArea.trim(),
      }),
      ...(selectedRole === USER_ROLES.AMBULANCE_DRIVER && {
        vehicleNumber: roleFields.vehicleNumber.trim(),
      }),
    };

    try {
      await setDoc(doc(db, 'users', user.uid), userData);
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Handle signup
  const handleSignup = async () => {
    if (!validateRoleFields()) return;

    setLoading(true);
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await createUserProfile(userCredential);
      
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigation will be handled by auth state listener in App.js
          },
        },
      ]);
    } catch (error) {
      let errorMessage = 'Sign up failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      }
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render role selection screen
  const renderRoleSelection = () => {
    const roles = [
      { id: USER_ROLES.DOCTOR, name: 'Doctor', icon: 'medical', color: '#007AFF', description: 'Provide consultations' },
      { id: USER_ROLES.PATIENT, name: 'Patient', icon: 'person', color: '#34C759', description: 'Book appointments' },
      { id: USER_ROLES.BLOOD_DONOR, name: 'Blood Donor', icon: 'water', color: '#FF3B30', description: 'Help save lives' },
      { id: USER_ROLES.MEDICINE_DELIVERY, name: 'Delivery Partner', icon: 'bicycle', color: '#FF9500', description: 'Deliver medicines' },
      { id: USER_ROLES.AMBULANCE_DRIVER, name: 'Ambulance Driver', icon: 'car', color: '#5856D6', description: 'Emergency services' },
    ];

    return (
      <View style={styles.roleContainer}>
        <Text style={styles.sectionTitle}>Select Your Role</Text>
        <Text style={styles.sectionSubtitle}>Choose how you want to use MediDoc</Text>
        
        <ScrollView showsVerticalScrollIndicator={false} style={styles.rolesList}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.roleCardSelected,
              ]}
              onPress={() => handleRoleSelect(role.id)}
            >
              <View style={[styles.roleIconContainer, { backgroundColor: role.color + '20' }]}>
                <Ionicons name={role.icon} size={32} color={role.color} />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>{role.name}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
              {selectedRole === role.id && (
                <Ionicons name="checkmark-circle" size={24} color={role.color} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.button, !selectedRole && styles.buttonDisabled]}
          onPress={() => selectedRole && setStep(3)}
          disabled={!selectedRole}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render role-specific fields
  const renderRoleFields = () => {
    return (
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <Text style={styles.sectionSubtitle}>Please provide the following details</Text>

        {selectedRole === USER_ROLES.DOCTOR && (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="medical-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Specialization (e.g., Cardiology, Pediatrics)"
                placeholderTextColor="#999"
                value={roleFields.specialization}
                onChangeText={(value) => updateRoleField('specialization', value)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="document-text-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="License Number"
                placeholderTextColor="#999"
                value={roleFields.licenseNumber}
                onChangeText={(value) => updateRoleField('licenseNumber', value)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Hospital/Clinic Name"
                placeholderTextColor="#999"
                value={roleFields.hospitalName}
                onChangeText={(value) => updateRoleField('hospitalName', value)}
              />
            </View>
          </>
        )}

        {selectedRole === USER_ROLES.PATIENT && (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#999"
                value={roleFields.age}
                onChangeText={(value) => updateRoleField('age', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Gender (Male/Female/Other)"
                placeholderTextColor="#999"
                value={roleFields.gender}
                onChangeText={(value) => updateRoleField('gender', value)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="water-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Blood Group (e.g., A+, B-, O+)"
                placeholderTextColor="#999"
                value={roleFields.bloodGroup}
                onChangeText={(value) => updateRoleField('bloodGroup', value)}
              />
            </View>
          </>
        )}

        {selectedRole === USER_ROLES.BLOOD_DONOR && (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="water-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Blood Group (e.g., A+, B-, O+)"
                placeholderTextColor="#999"
                value={roleFields.bloodGroup}
                onChangeText={(value) => updateRoleField('bloodGroup', value)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#666" style={styles.inputIcon} />
              <Text style={styles.label}>Availability Status</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateRoleField('availabilityStatus', 'available')}
                >
                  <View style={[
                    styles.radio,
                    roleFields.availabilityStatus === 'available' && styles.radioSelected
                  ]} />
                  <Text style={styles.radioText}>Available</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateRoleField('availabilityStatus', 'unavailable')}
                >
                  <View style={[
                    styles.radio,
                    roleFields.availabilityStatus === 'unavailable' && styles.radioSelected
                  ]} />
                  <Text style={styles.radioText}>Unavailable</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {selectedRole === USER_ROLES.MEDICINE_DELIVERY && (
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Service Area (e.g., Downtown, North Zone)"
              placeholderTextColor="#999"
              value={roleFields.serviceArea}
              onChangeText={(value) => updateRoleField('serviceArea', value)}
            />
          </View>
        )}

        {selectedRole === USER_ROLES.AMBULANCE_DRIVER && (
          <View style={styles.inputContainer}>
            <Ionicons name="car-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Vehicle Number"
              placeholderTextColor="#999"
              value={roleFields.vehicleNumber}
              onChangeText={(value) => updateRoleField('vehicleNumber', value)}
            />
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setStep(2)}
            disabled={loading}
          >
            <Text style={styles.buttonSecondaryText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Render basic info screen
  const renderBasicInfo = () => {
    return (
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password (min. 6 characters)"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, (!fullName || !email || !password || !confirmPassword) && styles.buttonDisabled]}
          onPress={() => {
            if (validateBasicInfo()) {
              setStep(2);
            }
          }}
          disabled={!fullName || !email || !password || !confirmPassword}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.switchTextBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
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
            <Ionicons name="medical" size={60} color="#007AFF" />
          </View>
          <Text style={styles.title}>MediDoc</Text>
          <Text style={styles.subtitle}>
            {step === 1 && 'Create your account'}
            {step === 2 && 'Choose your role'}
            {step === 3 && 'Complete your profile'}
          </Text>
        </View>

        {step === 1 && renderBasicInfo()}
        {step === 2 && renderRoleSelection()}
        {step === 3 && renderRoleFields()}
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
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
  },
  button: {
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
    flex: 1,
    marginRight: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#666',
    fontSize: 14,
  },
  switchTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
  roleContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  rolesList: {
    maxHeight: 400,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 3,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 8,
  },
  radioSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  radioText: {
    fontSize: 16,
    color: '#000',
  },
});

