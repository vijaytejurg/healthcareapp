/**
 * SignupScreen - User Registration
 * Collects: Email, Password, Full Name, Role
 */

import React, { useState, useEffect } from 'react';
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
import { signUp, getAuthErrorMessage } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Available roles - matching requirements
const USER_ROLES = [
  { id: 'doctor', name: 'Doctor', icon: 'medical', color: '#007AFF' },
  { id: 'patient', name: 'Patient', icon: 'person', color: '#34C759' },
  { id: 'pharmacy', name: 'Pharmacy', icon: 'storefront', color: '#FF9500' },
  { id: 'delivery', name: 'Delivery', icon: 'bicycle', color: '#AF52DE' },
  { id: 'hospital', name: 'Hospital', icon: 'business', color: '#5856D6' },
];

export default function SignupScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Role-specific fields for signup
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [experience, setExperience] = useState('');
  const [qualifications, setQualifications] = useState('');

  // Navigate away when authenticated (App.js should handle this, but this is a backup)
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('✅ User authenticated in SignupScreen - App.js should navigate automatically');
    }
  }, [isAuthenticated, loading]);

  const validateForm = () => {
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
    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role');
      return false;
    }
    
    // Role-specific validations for doctors
    if (selectedRole === 'doctor') {
      if (!specialization.trim()) {
        Alert.alert('Error', 'Please enter your medical specialization');
        return false;
      }
      if (!licenseNumber.trim()) {
        Alert.alert('Error', 'Please enter your medical license number (MCI/State Medical Council)');
        return false;
      }
      if (!hospitalName.trim()) {
        Alert.alert('Error', 'Please enter your hospital/clinic name');
        return false;
      }
    }
    
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Show immediate feedback
    console.log('🚀🚀🚀 SIGNUP STARTED - Watch this console!');
    Alert.alert('Signing Up...', 'Creating your account. Please wait...');
    
    try {
      console.log('📝 Form Data:', {
        email: email,
        name: fullName,
        role: selectedRole,
        passwordLength: password.length
      });
      
      console.log('⏳ Step 1: Creating Firebase Auth account...');
      
      // Prepare role-specific data
      const roleSpecificData = {};
      if (selectedRole === 'doctor') {
        roleSpecificData.specialization = specialization.trim();
        roleSpecificData.licenseNumber = licenseNumber.trim();
        roleSpecificData.hospitalName = hospitalName.trim();
        roleSpecificData.experience = experience.trim();
        roleSpecificData.qualifications = qualifications.split(',').map(q => q.trim()).filter(q => q);
      }
      
      // Step 1: Create Firebase Auth account and Firestore document
      const result = await signUp(email, password, fullName, selectedRole, roleSpecificData);
      
      // SUCCESS - Show clear feedback
      console.log('✅✅✅ ACCOUNT CREATED SUCCESSFULLY!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   👤 User ID:', result.user.uid);
      console.log('   📧 Email:', result.userData.email);
      console.log('   👨‍⚕️ Role:', result.userData.role);
      console.log('   ✅ Data saved to Firebase Firestore');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Show success alert with UID
      Alert.alert(
        '✅ Account Created!', 
        `Your account has been created successfully!\n\nUser ID: ${result.user.uid}\nEmail: ${result.userData.email}\nRole: ${result.userData.role}\n\nRedirecting to home...`,
        [{ text: 'OK' }]
      );
      
      // Wait for Firestore to sync and AuthContext to update
      console.log('⏳ Step 2: Waiting for authentication state to update...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user is now authenticated
      console.log('⏳ Step 3: Checking authentication status...');
      const { auth } = require('../src/firebase');
      
      if (auth.currentUser) {
        console.log('✅ User is authenticated!');
        console.log('🔄 Reloading page to navigate to home...');
        
        // Force page reload to trigger auth check and navigation
        if (typeof window !== 'undefined') {
          // For web - reload the page
          window.location.reload();
        } else {
          // For native - show success
          Alert.alert(
            'Success!', 
            'Account created successfully!',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.error('❌ User not authenticated after signup');
        Alert.alert(
          'Warning', 
          `Account created but authentication check failed.\n\nYour User ID: ${result.user.uid}\n\nPlease try logging in with your email and password.`,
          [{ text: 'OK' }]
        );
        setLoading(false);
      }
      
    } catch (error) {
      // ERROR - Show detailed error
      console.error('❌❌❌ SIGNUP ERROR OCCURRED!');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error Code:', error.code);
      console.error('Error Message:', error.message);
      console.error('Full Error:', error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const errorMessage = getAuthErrorMessage(error);
      
      Alert.alert(
        '❌ Sign Up Failed', 
        `${errorMessage}\n\nError Code: ${error.code || 'Unknown'}\n\nPlease check the browser console (F12) for more details.`,
        [{ text: 'OK' }]
      );
      
      setLoading(false);
    }
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join MediDoc today</Text>
        </View>

        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
              editable={!loading}
            />
          </View>

          {/* Email */}
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
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Role Selection */}
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Select Your Role</Text>
            <View style={styles.roleGrid}>
              {USER_ROLES.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleCard,
                    selectedRole === role.id && styles.roleCardSelected,
                  ]}
                  onPress={() => setSelectedRole(role.id)}
                  disabled={loading}
                >
                  <View style={[styles.roleIconContainer, { backgroundColor: role.color + '20' }]}>
                    <Ionicons name={role.icon} size={24} color={role.color} />
                  </View>
                  <Text style={styles.roleName}>{role.name}</Text>
                  {selectedRole === role.id && (
                    <Ionicons name="checkmark-circle" size={20} color={role.color} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Role-Specific Fields - Doctor */}
          {selectedRole === 'doctor' && (
            <View style={styles.roleSpecificSection}>
              <Text style={styles.roleSpecificTitle}>Medical Information (India)</Text>
              
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
                  style={[styles.input, { minHeight: 60, textAlignVertical: 'top', paddingTop: 12 }]}
                  placeholder="Qualifications (comma-separated, e.g., MBBS, MD)"
                  placeholderTextColor="#999"
                  value={qualifications}
                  onChangeText={setQualifications}
                  multiline
                  numberOfLines={2}
                  editable={!loading}
                />
              </View>
            </View>
          )}

          {/* Sign Up Button - Always clickable for debugging */}
          <TouchableOpacity
            style={[
              styles.button, 
              styles.signupButton, 
              (!fullName || !email || !password || !selectedRole || loading) && styles.buttonDisabled
            ]}
            onPress={() => {
              console.log('🔘🔘🔘 CREATE ACCOUNT BUTTON CLICKED!');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              
              // Validate before proceeding
              if (!fullName || !email || !password || !selectedRole) {
                console.log('❌ Validation failed - missing fields');
                Alert.alert('Error', 'Please fill in all fields and select a role');
                return;
              }
              
              if (loading) {
                console.log('⏳ Signup already in progress...');
                return;
              }
              
              console.log('✅ All validations passed!');
              console.log('🚀 Calling handleSignup() function...');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              handleSignup();
            }}
            disabled={loading || !fullName || !email || !password || !selectedRole}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Create Account
                {(!fullName || !email || !password || !selectedRole) && ' (Fill All Fields)'}
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Debug panel - shows button state */}
          <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
            <Text style={{ fontSize: 11, color: '#666', marginBottom: 5 }}>
              Debug Info:
            </Text>
            <Text style={{ fontSize: 10, color: '#666' }}>
              Name: {fullName ? '✓' : '✗'} | Email: {email ? '✓' : '✗'} | Pass: {password ? '✓' : '✗'} | Role: {selectedRole || '✗'}
            </Text>
            <Text style={{ fontSize: 10, color: '#666', marginTop: 3 }}>
              Button Enabled: {(!loading && fullName && email && password && selectedRole) ? 'YES ✅' : 'NO ❌'}
            </Text>
            <Text style={{ fontSize: 10, color: '#666', marginTop: 3 }}>
              Loading: {loading ? 'YES' : 'NO'}
            </Text>
          </View>
          
          {/* Test button to verify clicks work */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#34C759', marginTop: 10 }]}
            onPress={() => {
              console.log('🧪 TEST BUTTON CLICKED - If you see this, clicks work!');
              Alert.alert('Test', 'Button clicks are working! Check console for logs.');
            }}
          >
            <Text style={styles.buttonText}>🧪 Test Button (Click Me)</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 40,
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
  eyeIcon: {
    padding: 5,
  },
  roleSection: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  roleCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  roleSpecificSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  roleSpecificTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 15,
  },
  button: {
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signupButton: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
