/**
 * Setup User Screen
 * One-time screen to create the default user account
 * Can be accessed from LoginScreen for initial setup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setupDefaultUser } from '../utils/setupUser';
import { createDummyDoctor } from '../utils/createDoctorAccount';

export default function SetupUserScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [creatingDoctor, setCreatingDoctor] = useState(false);
  const [created, setCreated] = useState(false);
  const [createdType, setCreatedType] = useState(null); // 'patient' or 'doctor'

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      const result = await setupDefaultUser();
      if (result.exists) {
        Alert.alert(
          'User Exists',
          'The user account already exists. You can login with:\n\nEmail: vijaytejurg@gmail.com\nPassword: vijaytejurg@one8',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
            { text: 'OK' },
          ]
        );
      } else {
        setCreated(true);
        setCreatedType('patient');
        Alert.alert(
          'Success!',
          'User account created successfully!\n\nEmail: vijaytejurg@gmail.com\nPassword: vijaytejurg@one8\n\nYou can now login.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create user account');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async () => {
    setCreatingDoctor(true);
    try {
      const result = await createDummyDoctor();
      if (result.exists) {
        Alert.alert(
          'Doctor Account Exists',
          'The doctor account already exists. You can login with:\n\nEmail: doctor@test.com\nPassword: doctor123',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
            { text: 'OK' },
          ]
        );
      } else {
        setCreated(true);
        setCreatedType('doctor');
        Alert.alert(
          'Success!',
          'Doctor account created successfully!\n\nEmail: doctor@test.com\nPassword: doctor123\n\nYou can now login.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create doctor account');
    } finally {
      setCreatingDoctor(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-add" size={80} color="#007AFF" />
        <Text style={styles.title}>Setup User Account</Text>
        <Text style={styles.subtitle}>
          Create the default user account for testing
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Ionicons name="mail" size={24} color="#007AFF" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>vijaytejurg@gmail.com</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="lock-closed" size={24} color="#007AFF" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Password</Text>
            <Text style={styles.infoValue}>vijaytejurg@one8</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="person" size={24} color="#007AFF" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>Patient</Text>
          </View>
        </View>
      </View>

      {created ? (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={60} color="#34C759" />
          <Text style={styles.successText}>Account Created!</Text>
          <Text style={styles.successDetails}>
            {createdType === 'doctor' 
              ? 'Email: doctor@test.com\nPassword: doctor123'
              : 'Email: vijaytejurg@gmail.com\nPassword: vijaytejurg@one8'
            }
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateUser}
            disabled={loading || creatingDoctor}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Create Patient Account</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.buttonDoctor, creatingDoctor && styles.buttonDisabled]}
            onPress={handleCreateDoctor}
            disabled={loading || creatingDoctor}
          >
            {creatingDoctor ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="medical" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Create Doctor Account</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.doctorInfo}>
            <Text style={styles.doctorInfoTitle}>Doctor Account Details:</Text>
            <Text style={styles.doctorInfoText}>📧 Email: doctor@test.com</Text>
            <Text style={styles.doctorInfoText}>🔑 Password: doctor123</Text>
            <Text style={styles.doctorInfoText}>👨‍⚕️ Name: Dr. John Smith</Text>
            <Text style={styles.doctorInfoText}>🏥 Specialization: Cardiology</Text>
          </View>
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34C759',
    marginTop: 15,
    marginBottom: 20,
  },
  backButton: {
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#666',
  },
  buttonDoctor: {
    backgroundColor: '#FF3B30',
  },
  successDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 20,
  },
  doctorInfo: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  doctorInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  doctorInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

