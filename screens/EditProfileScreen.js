/**
 * EditProfileScreen - Comprehensive Profile Editing
 * Supports all roles with role-specific fields
 * Real-time updates to Firestore
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../src/firebase';
import { getRoleCollection } from '../utils/userService';

const EditProfileScreen = ({ navigation }) => {
  const { user, userData, role } = useAuth();
  const userRole = role || userData?.role || 'patient'; // Get role from context or userData
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localImageUri, setLocalImageUri] = useState(null); // Local image before upload

  // Basic fields (all roles)
  const [name, setName] = useState(userData?.name || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [address, setAddress] = useState(userData?.address || '');
  const [city, setCity] = useState(userData?.city || '');
  const [state, setState] = useState(userData?.state || '');
  const [pincode, setPincode] = useState(userData?.pincode || '');
  const [profilePhoto, setProfilePhoto] = useState(userData?.profilePhoto || null);

  // Doctor-specific fields
  const [specialization, setSpecialization] = useState(userData?.specialization || '');
  const [licenseNumber, setLicenseNumber] = useState(userData?.licenseNumber || '');
  const [hospitalName, setHospitalName] = useState(userData?.hospitalName || '');
  const [experience, setExperience] = useState(userData?.experience?.toString() || '');
  const [qualifications, setQualifications] = useState(
    Array.isArray(userData?.qualifications) 
      ? userData.qualifications.join(', ') 
      : userData?.qualifications || ''
  );
  const [consultationFee, setConsultationFee] = useState(userData?.consultationFee?.toString() || '');

  // Patient-specific fields
  const [age, setAge] = useState(userData?.age?.toString() || '');
  const [gender, setGender] = useState(userData?.gender || '');
  const [bloodGroup, setBloodGroup] = useState(userData?.bloodGroup || '');

  // Load user data on mount
  useEffect(() => {
    if (user?.uid) {
      loadUserData();
    }
  }, [user?.uid, role, userData?.role]);

  const loadUserData = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    // If no role, try to get it from userData or default to patient
    const userRole = role || userData?.role || 'patient';
    
    setLoading(true);
    try {
      // FIRST: Load from main users collection (where profilePhoto is stored)
      const mainUserRef = doc(db, 'users', user.uid);
      const mainUserSnap = await getDoc(mainUserRef);
      
      // SECOND: Load from role-based subcollection for role-specific fields
      const roleCollection = getRoleCollection(userRole);
      if (!roleCollection) {
        console.error('Invalid role:', userRole);
        setLoading(false);
        return;
      }
      const roleUserRef = doc(db, `users/${roleCollection}`, user.uid);
      const roleUserSnap = await getDoc(roleUserRef);
      
      // Get data from main collection (has profilePhoto)
      const mainData = mainUserSnap.exists() ? mainUserSnap.data() : {};
      
      // Get data from role-based collection (has role-specific fields)
      const roleData = roleUserSnap.exists() ? roleUserSnap.data() : {};
      
      // Merge data: main collection takes priority for common fields, role collection for role-specific
      const mergedData = {
        ...roleData, // Start with role-specific data
        ...mainData, // Override with main collection data (includes profilePhoto)
      };
      
      // Set all fields from merged data
      setName(mergedData.name || userData?.name || '');
      setBio(mergedData.bio || userData?.bio || '');
      setPhone(mergedData.phone || userData?.phone || '');
      setAddress(mergedData.address || userData?.address || '');
      setCity(mergedData.city || userData?.city || '');
      setState(mergedData.state || userData?.state || '');
      setPincode(mergedData.pincode || userData?.pincode || '');
      
      // PROFILE PHOTO: Always use from main collection first (this is what AuthContext uses)
      const photoFromMain = mainData.profilePhoto;
      const photoFromRole = roleData.profilePhoto;
      const photoFromContext = userData?.profilePhoto;
      setProfilePhoto(photoFromMain || photoFromRole || photoFromContext || null);
      
      console.log('📸 Profile photo loaded:', {
        fromMain: photoFromMain,
        fromRole: photoFromRole,
        fromContext: photoFromContext,
        final: photoFromMain || photoFromRole || photoFromContext || null,
      });
      
      // Role-specific fields
      if (userRole === 'doctor') {
        setSpecialization(mergedData.specialization || '');
        setLicenseNumber(mergedData.licenseNumber || '');
        setHospitalName(mergedData.hospitalName || '');
        setExperience(mergedData.experience?.toString() || '');
        setQualifications(
          Array.isArray(mergedData.qualifications) 
            ? mergedData.qualifications.join(', ') 
            : mergedData.qualifications || ''
        );
        setConsultationFee(mergedData.consultationFee?.toString() || '');
      } else if (userRole === 'patient') {
        setAge(mergedData.age?.toString() || '');
        setGender(mergedData.gender || '');
        setBloodGroup(mergedData.bloodGroup || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Name is required
    if (!name || !name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }
    
    // Phone validation (optional but must be valid if provided)
    if (phone && phone.trim() && !/^[0-9]{10}$/.test(phone.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Doctor-specific validation
    if (userRole === 'doctor') {
      if (!specialization || !specialization.trim()) {
        Alert.alert('Validation Error', 'Please enter your specialization');
        return false;
      }
      if (!licenseNumber || !licenseNumber.trim()) {
        Alert.alert('Validation Error', 'Please enter your medical license number');
        return false;
      }
      if (!hospitalName || !hospitalName.trim()) {
        Alert.alert('Validation Error', 'Please enter your hospital/clinic name');
        return false;
      }
      if (experience && experience.trim() && isNaN(parseInt(experience))) {
        Alert.alert('Validation Error', 'Please enter a valid number of years of experience');
        return false;
      }
      if (consultationFee && consultationFee.trim() && isNaN(parseFloat(consultationFee))) {
        Alert.alert('Validation Error', 'Please enter a valid consultation fee');
        return false;
      }
    }
    
    // Patient-specific validation
    if (userRole === 'patient') {
      if (age && age.trim() && (isNaN(parseInt(age)) || parseInt(age) < 1 || parseInt(age) > 150)) {
        Alert.alert('Validation Error', 'Please enter a valid age');
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    console.log('💾 Save button clicked');
    
    // Prevent double-clicks
    if (saving) {
      console.log('⚠️ Already saving');
      return;
    }
    
    // Validate user first
    if (!user?.uid) {
      console.error('❌ No user UID');
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return;
    }
    
    // Validate form
    console.log('🔍 Validating form...');
    if (!validateForm()) {
      console.log('❌ Validation failed');
      return;
    }
    
    console.log('✅ Validation passed, starting save...');
    setSaving(true);
    
    // Safety timeout - reset saving state after 10 seconds no matter what
    const timeoutId = setTimeout(() => {
      console.log('⚠️ Save timeout - resetting state');
      setSaving(false);
      setUploadingImage(false);
    }, 10000);
    
    try {
      // Handle profile photo upload
      let finalProfilePhoto = profilePhoto;
      
      // If there's a local image that needs to be uploaded
      if (localImageUri) {
        console.log('📤 Uploading new profile photo...');
        try {
          finalProfilePhoto = await Promise.race([
            uploadImageToFirebase(localImageUri),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout')), 10000))
          ]);
          if (finalProfilePhoto) {
            console.log('✅ Profile photo uploaded successfully:', finalProfilePhoto);
            setProfilePhoto(finalProfilePhoto);
          } else {
            console.error('❌ Upload failed, keeping existing photo');
            // Keep existing photo if upload fails
            finalProfilePhoto = profilePhoto;
          }
        } catch (uploadError) {
          console.error('❌ Upload error:', uploadError);
          // Keep existing photo if upload fails
          finalProfilePhoto = profilePhoto;
        }
      }
      
      // Ensure we have a valid profile photo URL (from existing or newly uploaded)
      if (!finalProfilePhoto && userData?.profilePhoto) {
        // Use existing profile photo from userData if available
        finalProfilePhoto = userData.profilePhoto;
        console.log('📸 Using existing profile photo from userData:', finalProfilePhoto);
      }
      
      const roleCollection = getRoleCollection(userRole);
      
      if (!roleCollection) {
        throw new Error(`Invalid role: ${userRole}. Cannot determine collection.`);
      }
      
      const now = serverTimestamp();
      
      // Prepare update data
      const updateData = {
        name: name.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        pincode: pincode.trim() || null,
        updatedAt: now,
      };
      
      // ALWAYS save profile photo (even if it's the same - ensures persistence)
      // Use finalProfilePhoto if available, otherwise keep existing from userData
      const photoToSave = finalProfilePhoto || userData?.profilePhoto || null;
      if (photoToSave) {
        updateData.profilePhoto = photoToSave;
        console.log('💾 Saving profile photo to role collection:', photoToSave);
      } else {
        // If no photo at all, set to null explicitly
        updateData.profilePhoto = null;
        console.log('⚠️ No profile photo to save');
      }
      
      // Role-specific updates
      if (userRole === 'doctor') {
        updateData.specialization = specialization.trim();
        updateData.licenseNumber = licenseNumber.trim();
        updateData.hospitalName = hospitalName.trim();
        updateData.experience = experience ? parseInt(experience) : 0;
        updateData.qualifications = qualifications
          .split(',')
          .map(q => q.trim())
          .filter(q => q);
        updateData.consultationFee = consultationFee ? parseFloat(consultationFee) : 0;
      } else if (userRole === 'patient') {
        updateData.age = age ? parseInt(age) : null;
        updateData.gender = gender.trim() || null;
        updateData.bloodGroup = bloodGroup.trim() || null;
      }
      
      // Update main users collection FIRST (this is what AuthContext listens to)
      const mainUserRef = doc(db, 'users', user.uid);
      // Use the same photoToSave variable defined above
      const mainUpdateData = {
        name: name.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        pincode: pincode.trim() || null,
        profilePhoto: photoToSave, // ALWAYS save profile photo (permanent storage)
        updatedAt: now,
      };
      
      console.log('💾 Saving to main users collection:', {
        uid: user.uid,
        profilePhoto: photoToSave,
        hasPhoto: !!photoToSave,
      });
      
      // Add role-specific fields to main collection
      if (userRole === 'doctor') {
        mainUpdateData.specialization = specialization.trim();
        mainUpdateData.hospitalName = hospitalName.trim();
        mainUpdateData.experience = experience ? parseInt(experience) : 0;
        mainUpdateData.consultationFee = consultationFee ? parseFloat(consultationFee) : 0;
      } else if (userRole === 'patient') {
        mainUpdateData.age = age ? parseInt(age) : null;
        mainUpdateData.gender = gender.trim() || null;
        mainUpdateData.bloodGroup = bloodGroup.trim() || null;
      }
      
      // Update Firestore - with timeout
      await Promise.race([
        Promise.all([
          updateDoc(mainUserRef, mainUpdateData),
          updateDoc(doc(db, `users/${roleCollection}`, user.uid), updateData),
          userRole === 'doctor' ? updateDoc(doc(db, 'doctors', user.uid), {
            name: name.trim(),
            specialization: specialization.trim(),
            hospitalName: hospitalName.trim(),
            experience: experience ? parseInt(experience) : 0,
            consultationFee: consultationFee ? parseFloat(consultationFee) : 0,
            profilePhoto: photoToSave, // Use same photo as main collection
            updatedAt: now,
          }) : Promise.resolve()
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Save timeout')), 8000))
      ]);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Clear local image URI
      setLocalImageUri(null);
      
      // RESET SAVING STATE IMMEDIATELY - Multiple times to ensure it happens
      setSaving(false);
      setUploadingImage(false);
      
      // Force reset in next tick
      setTimeout(() => {
        setSaving(false);
        setUploadingImage(false);
      }, 0);
      
      // Show success and navigate back (non-blocking)
      setTimeout(() => {
        Alert.alert(
          'Success!',
          'Your profile has been updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      }, 50);
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      clearTimeout(timeoutId);
      // RESET SAVING STATE ON ERROR
      setSaving(false);
      setUploadingImage(false);
      Alert.alert(
        'Error',
        `Failed to update profile: ${error.message || 'Unknown error'}. Please try again.`
      );
    }
  };

  const requestImagePermissions = async () => {
    // On web, permissions are handled by the browser
    if (Platform.OS === 'web') {
      return true;
    }
    
    // On mobile, request permissions
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please grant camera and photo library permissions to upload profile photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const uploadImageToFirebase = async (imageUri) => {
    if (!user?.uid || !imageUri) {
      return null;
    }

    try {
      // Silent upload - no loading indicators
      // Convert image URI to blob
      let blob;
      try {
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        blob = await response.blob();
      } catch (fetchError) {
        // For web blob URLs, try direct fetch
        if (Platform.OS === 'web' && imageUri.startsWith('blob:')) {
          blob = await fetch(imageUri).then(r => r.blob());
        } else if (Platform.OS === 'web' && imageUri.startsWith('data:')) {
          const base64Response = await fetch(imageUri);
          blob = await base64Response.blob();
        } else {
          throw fetchError;
        }
      }

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `profile_photos/${user.uid}_${timestamp}.jpg`;
      const storageRef = ref(storage, filename);

      // Upload the image silently
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      // Wait for upload to complete (silently)
      const downloadURL = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          () => {
            // Silent progress - no UI updates
          },
          (error) => {
            console.error('❌ Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (error) {
              reject(error);
            }
          }
        );
      });

      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      // Silent fail - return null, keep local image
      return null;
    }
  };

  const handleImagePicker = async () => {
    console.log('📷 Image picker clicked - Platform:', Platform.OS);
    
    // For web, use file input directly
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
          console.log('📁 File selected:', file.name);
          
          // Create a local URL to display IMMEDIATELY (no loading state)
          const localUrl = URL.createObjectURL(file);
          setLocalImageUri(localUrl);
          setProfilePhoto(localUrl); // Show immediately
          
          // Upload to Firebase Storage in background (silently)
          uploadImageToFirebase(localUrl).then((downloadURL) => {
            if (downloadURL) {
              setProfilePhoto(downloadURL); // Update with Firebase URL
              console.log('✅ Photo uploaded silently:', downloadURL);
              // No alert - silent upload
            } else {
              console.log('❌ Upload failed silently');
            }
          }).catch((error) => {
            console.error('❌ Upload error:', error);
            // Keep local image even if upload fails
          });
        } catch (error) {
          console.error('❌ Error:', error);
          Alert.alert('Error', 'Failed to load image. Please try again.');
        }
      };
      
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
      return;
    }
    
    // For mobile, use native picker
    try {
      const hasPermission = await requestImagePermissions();
      if (!hasPermission) {
        console.log('❌ Permission denied');
        return;
      }

      Alert.alert(
        'Profile Photo',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              try {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets && result.assets[0]) {
                  const imageUri = result.assets[0].uri;
                  // Show immediately
                  setLocalImageUri(imageUri);
                  setProfilePhoto(imageUri);
                  
                  // Upload silently in background
                  uploadImageToFirebase(imageUri).then((downloadURL) => {
                    if (downloadURL) {
                      setProfilePhoto(downloadURL);
                    }
                  });
                }
              } catch (error) {
                console.error('❌ Camera error:', error);
                Alert.alert('Error', 'Failed to take photo. Please try again.');
              }
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets && result.assets[0]) {
                  const imageUri = result.assets[0].uri;
                  // Show immediately
                  setLocalImageUri(imageUri);
                  setProfilePhoto(imageUri);
                  
                  // Upload silently in background
                  uploadImageToFirebase(imageUri).then((downloadURL) => {
                    if (downloadURL) {
                      setProfilePhoto(downloadURL);
                    }
                  });
                }
              } catch (error) {
                console.error('❌ Gallery error:', error);
                Alert.alert('Error', 'Failed to pick image. Please try again.');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('❌ Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={handleImagePicker}
              disabled={uploadingImage}
            >
            {(localImageUri || profilePhoto) ? (
              <Image 
                source={{ uri: localImageUri || profilePhoto }} 
                style={styles.profilePhoto} 
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={60} color="#ccc" />
              </View>
            )}
            <View style={styles.photoEditBadge}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>
            Tap to change profile photo
          </Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter street address"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Pincode</Text>
            <TextInput
              style={styles.input}
              value={pincode}
              onChangeText={setPincode}
              placeholder="6-digit pincode"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* Doctor-Specific Fields */}
        {userRole === 'doctor' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Specialization *</Text>
              <TextInput
                style={styles.input}
                value={specialization}
                onChangeText={setSpecialization}
                placeholder="e.g., Cardiology, Dermatology"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Medical License Number *</Text>
              <TextInput
                style={styles.input}
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                placeholder="MCI/State Medical Council License"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Hospital/Clinic Name *</Text>
              <TextInput
                style={styles.input}
                value={hospitalName}
                onChangeText={setHospitalName}
                placeholder="Name of your hospital or clinic"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Years of Experience</Text>
                <TextInput
                  style={styles.input}
                  value={experience}
                  onChangeText={setExperience}
                  placeholder="Years"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Consultation Fee (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={consultationFee}
                  onChangeText={setConsultationFee}
                  placeholder="Fee per consultation"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Qualifications</Text>
              <TextInput
                style={styles.input}
                value={qualifications}
                onChangeText={setQualifications}
                placeholder="MBBS, MD, etc. (comma-separated)"
                placeholderTextColor="#999"
              />
              <Text style={styles.hint}>Separate multiple qualifications with commas</Text>
            </View>
          </View>
        )}

        {/* Patient-Specific Fields */}
        {userRole === 'patient' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Information</Text>
            
            <View style={styles.row}>
              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="Age"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Gender</Text>
                <TextInput
                  style={styles.input}
                  value={gender}
                  onChangeText={setGender}
                  placeholder="Male/Female/Other"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Blood Group</Text>
              <TextInput
                style={styles.input}
                value={bloodGroup}
                onChangeText={setBloodGroup}
                placeholder="e.g., O+, A-, B+"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        )}

        {/* Save Button at Bottom */}
        <TouchableOpacity
          style={[styles.bottomSaveButton, saving && styles.bottomSaveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.bottomSaveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  photoHint: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 15,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  bottomSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  bottomSaveButtonDisabled: {
    opacity: 0.6,
  },
  bottomSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditProfileScreen;

