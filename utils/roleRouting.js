/**
 * Role-Based Routing Utilities
 * Maps user roles to their home screens
 */

export const ROLE_ROUTES = {
  doctor: 'DoctorHome',
  patient: 'MainTabs',
  pharmacy: 'PharmacyHome',
  delivery: 'DeliveryHome',
  hospital: 'HospitalHome',
};

/**
 * Get home route for a user role
 * @param {string} role - User role
 * @returns {string} Route name
 */
export const getRoleHomeRoute = (role) => {
  if (!role) return 'MainTabs'; // Default to patient home
  
  const normalizedRole = role.toLowerCase();
  return ROLE_ROUTES[normalizedRole] || 'MainTabs';
};

/**
 * Check if role is valid
 * @param {string} role - User role
 * @returns {boolean}
 */
export const isValidRole = (role) => {
  const validRoles = ['doctor', 'patient', 'pharmacy', 'delivery', 'hospital'];
  return validRoles.includes(role?.toLowerCase());
};

