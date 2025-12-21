/**
 * User Roles Constants
 * Production-ready role definitions for healthcare platform
 */

export const USER_ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  AMBULANCE_DRIVER: 'ambulance_driver',
  PHARMACY_SHOP: 'pharmacy_shop',
  ADMIN: 'admin',
};

/**
 * Role-based route mapping
 * Maps each role to its home screen route
 * NOTE: Patients use MainTabs (which contains Home, Explore, Consult, Medicine, Donor, Profile)
 */
export const ROLE_ROUTES = {
  [USER_ROLES.DOCTOR]: 'DoctorHome',
  [USER_ROLES.PATIENT]: 'MainTabs', // Patients get MainTabs with all bottom tabs
  [USER_ROLES.AMBULANCE_DRIVER]: 'AmbulanceHome',
  [USER_ROLES.PHARMACY_SHOP]: 'PharmacyHome',
  [USER_ROLES.ADMIN]: 'AdminDashboard',
};

/**
 * Get home route for a role
 */
export const getRoleHomeRoute = (role) => {
  return ROLE_ROUTES[role] || ROLE_ROUTES[USER_ROLES.PATIENT];
};

