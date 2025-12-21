/**
 * Create Dummy Doctor Account
 * Run this to create a doctor account for testing
 */

import { createUserAccount } from './userService';
import { USER_ROLES } from './constants';

export const createDummyDoctor = async () => {
  const email = 'doctor@test.com';
  const password = 'doctor123';
  
  const userData = {
    name: 'Dr. John Smith',
    role: USER_ROLES.DOCTOR,
    specialization: 'Cardiology',
    licenseNumber: 'DOC123456',
    hospitalName: 'City General Hospital',
  };

  try {
    console.log('🚀 Creating doctor account...');
    const result = await createUserAccount(email, password, userData);
    console.log('✅ Doctor account created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 User ID:', result.user.uid);
    console.log('🏥 Specialization:', userData.specialization);
    return {
      success: true,
      email,
      password,
      user: result.user,
    };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Doctor account already exists.');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      return {
        success: true,
        exists: true,
        email,
        password,
      };
    }
    console.error('❌ Error:', error.message);
    throw error;
  }
};

