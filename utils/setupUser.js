/**
 * Setup User Account
 * Creates the user account: vijaytejurg@gmail.com
 * Run this once to create the account
 */

import { createUserAccount } from './userService';

export const setupDefaultUser = async () => {
  const email = 'vijaytejurg@gmail.com';
  const password = 'vijaytejurg@one8';
  
  const userData = {
    name: 'Vijay Tejurg',
    role: 'patient',
    age: 25,
    gender: 'Male',
    bloodGroup: 'O+',
  };

  try {
    console.log('🚀 Creating user account...');
    const result = await createUserAccount(email, password, userData);
    console.log('✅ User account created successfully!');
    console.log('Email:', email);
    console.log('User ID:', result.user.uid);
    return result;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ User already exists. You can login with these credentials.');
      return { exists: true };
    }
    console.error('❌ Error:', error.message);
    throw error;
  }
};

// Auto-run on import (for testing)
// setupDefaultUser();

