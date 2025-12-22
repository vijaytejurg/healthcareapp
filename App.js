import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { navigationRef as globalNavRef } from './utils/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getRoleHomeRoute } from './utils/roleRouting';

// Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SetupUserScreen from './screens/SetupUserScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import ConsultScreen from './screens/ConsultScreen';
import MedicineScreen from './screens/MedicineScreen';
import DonorScreen from './screens/DonorScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import MessagesScreen from './screens/MessagesScreen';
import ChatScreen from './screens/ChatScreen';
import DoctorProfileScreen from './screens/DoctorProfileScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import ConsultationChatScreen from './screens/ConsultationChatScreen';
import MedicineOrderScreen from './screens/MedicineOrderScreen';
import OrderTrackingScreen from './screens/OrderTrackingScreen';
import HospitalBookingScreen from './screens/HospitalBookingScreen';
import AmbulanceScreen from './screens/AmbulanceScreen';
import ArticlesScreen from './screens/ArticlesScreen';

// Role-specific home screens
import DoctorHomeScreen from './screens/DoctorHomeScreen';
import PharmacyHomeScreen from './screens/PharmacyHomeScreen';
import DeliveryHomeScreen from './screens/DeliveryHomeScreen';
import HospitalHomeScreen from './screens/HospitalHomeScreen';
import AmbulanceHomeScreen from './screens/AmbulanceHomeScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import DoctorBoardScreen from './screens/DoctorBoardScreen';

// Utils - removed unused imports

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ navigation }) {
  const { isAuthenticated } = useAuth();
  
  // Protect tabs - redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [isAuthenticated, navigation]);
  
  if (!isAuthenticated) {
    return null; // Will redirect
  }
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Consult') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Medicine') {
            iconName = focused ? 'medkit' : 'medkit-outline';
          } else if (route.name === 'Donor') {
            iconName = focused ? 'water' : 'water-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        // For Profile screen, hide title but keep icons
        headerTitle: route.name === 'Profile' ? '' : route.name,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={{ marginLeft: 15, padding: 5 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={28}
              color="#000"
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Messages')}
            style={{ marginRight: 15, padding: 5 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={28}
              color="#000"
            />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Consult" component={ConsultScreen} />
      <Tab.Screen name="Medicine" component={MedicineScreen} />
      <Tab.Screen name="Donor" component={DonorScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Navigator with Auth Protection
function AppNavigator() {
  const { isAuthenticated, loading, userData } = useAuth();
  const navigationRef = useNavigationContainerRef();
  
  // Sync with global navigation ref whenever it changes
  useEffect(() => {
    if (navigationRef && globalNavRef) {
      // Update global ref with current navigation ref
      Object.setPrototypeOf(globalNavRef, navigationRef);
      Object.assign(globalNavRef, navigationRef);
    }
  }, [navigationRef]);

  // Handle navigation when auth state changes
  useEffect(() => {
    console.log('🔄 Navigation effect triggered:', { 
      loading, 
      isAuthenticated, 
      hasUserData: !!userData,
      userRole: userData?.role,
      navReady: navigationRef?.isReady?.() 
    });
    
    if (loading) {
      console.log('⏳ Auth still loading...');
      return;
    }

    // Wait for navigation to be ready
    const checkAndNavigate = () => {
      if (!navigationRef?.isReady()) {
        console.log('⏳ Navigation not ready, retrying in 100ms...');
        setTimeout(checkAndNavigate, 100);
        return;
      }

      const currentRoute = navigationRef.getCurrentRoute()?.name;
      console.log('📍 Current route:', currentRoute);
      console.log('🔐 isAuthenticated:', isAuthenticated);
      console.log('👤 User data:', userData ? { role: userData.role, name: userData.name } : 'null');

      if (isAuthenticated && userData) {
        // Check if profile is completed
        const profileCompleted = userData.profileCompleted === true;
        
        // If profile is not completed, navigate to CompleteProfile screen
        if (!profileCompleted && currentRoute !== 'CompleteProfile') {
          console.log('📝 Profile not completed, navigating to CompleteProfile...');
          try {
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'CompleteProfile' }],
            });
            console.log('✅ Navigated to CompleteProfile screen');
            return;
          } catch (error) {
            console.error('❌ Navigation error:', error);
          }
        }
        
        // If profile is completed, navigate to role-based home screen
        if (profileCompleted) {
          const userRole = userData.role;
          const homeRoute = getRoleHomeRoute(userRole);
          
          console.log('🏠 User authenticated and profile completed!');
          console.log('   Role:', userRole);
          console.log('   Home Route:', homeRoute);
          console.log('   Current Route:', currentRoute);
          
          // Navigate if not already on the home route
          // Allow navigation even if coming from CompleteProfile
          if (currentRoute !== homeRoute) {
            console.log(`🏠 Navigating to ${homeRoute}...`);
            try {
              // Verify route exists before navigating
              const routeExists = navigationRef.getState()?.routes?.some(r => r.name === homeRoute) || 
                                 ['Login', 'Signup', 'MainTabs', 'DoctorHome', 'PharmacyHome', 'DeliveryHome', 'HospitalHome', 'AmbulanceHome', 'AdminDashboard'].includes(homeRoute);
              
              if (routeExists) {
                navigationRef.reset({
                  index: 0,
                  routes: [{ name: homeRoute }],
                });
                console.log(`✅✅✅ Successfully navigated to ${homeRoute}!`);
              } else {
                console.error(`❌ Route ${homeRoute} does not exist! Falling back to MainTabs`);
                navigationRef.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              }
            } catch (error) {
              console.error('❌ Navigation error:', error);
              console.error('Error details:', error.message);
              // Fallback to MainTabs if navigation fails
              try {
                navigationRef.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              } catch (fallbackError) {
                console.error('❌ Fallback navigation also failed:', fallbackError);
              }
            }
          } else {
            console.log(`✅ Already on ${homeRoute}`);
          }
        }
      } else {
        // User not authenticated - immediately navigate to Login
        console.log('🔐🔐🔐 USER NOT AUTHENTICATED - Navigating to Login immediately');
        console.log('   Current route:', currentRoute);
        console.log('   isAuthenticated:', isAuthenticated);
        console.log('   hasUserData:', !!userData);
        
        // Always navigate to Login if not authenticated (unless already there)
        if (currentRoute !== 'Login' && currentRoute !== 'Signup' && currentRoute !== 'CompleteProfile') {
          try {
            console.log('🔄 App.js: Resetting navigation to Login...');
            // Immediate navigation for real-time logout
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
            console.log('✅✅✅ App.js: Successfully navigated to Login screen');
          } catch (error) {
            console.error('❌ App.js: Navigation error:', error);
            console.error('Error details:', error.message);
            // Retry navigation if it fails
            setTimeout(() => {
              try {
                console.log('🔄 App.js: Retrying navigation to Login...');
                navigationRef.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
                console.log('✅ App.js: Retry navigation successful');
              } catch (retryError) {
                console.error('❌ App.js: Retry navigation also failed:', retryError);
                // Last resort: reload page for web
                if (typeof window !== 'undefined') {
                  console.log('🌐 App.js: Last resort - reloading page...');
                  window.location.reload();
                }
              }
            }, 300);
          }
        } else {
          console.log('✅ App.js: Already on Login/Signup/CompleteProfile screen');
        }
      }
    };

    // Start checking immediately
    checkAndNavigate();
  }, [isAuthenticated, loading, userData]);

  // Loading timeout effect - must be called before any conditional returns
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('⚠️ Loading timeout after 3 seconds - this might indicate an issue');
        console.log('   isAuthenticated:', isAuthenticated);
        console.log('   hasUserData:', !!userData);
      }, 3000); // 3 second warning
      
      return () => clearTimeout(timeout);
    }
  }, [loading, isAuthenticated, userData]);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
        <Text style={{ marginTop: 5, color: '#999', fontSize: 12 }}>Checking authentication...</Text>
      </View>
    );
  }
  
  // If not loading and not authenticated, ensure Login screen is shown
  if (!loading && !isAuthenticated) {
    console.log('✅ App ready - User not authenticated, should show Login screen');
  }

  return (
    <NavigationContainer ref={(ref) => {
      if (ref) {
        if (navigationRef) {
          // @ts-ignore
          Object.assign(navigationRef, ref);
        }
        if (globalNavRef) {
          // @ts-ignore
          Object.assign(globalNavRef, ref);
        }
      }
    }}>
      <StatusBar style="auto" />
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName="Login"
      >
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="SetupUser" component={SetupUserScreen} />
          <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
          
          {/* Role-Specific Home Screens */}
          <Stack.Screen 
            name="DoctorHome" 
            component={DoctorHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PharmacyHome" 
            component={PharmacyHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DeliveryHome" 
            component={DeliveryHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="HospitalHome" 
            component={HospitalHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AmbulanceHome" 
            component={AmbulanceHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboardScreen}
            options={{ headerShown: false }}
          />
          
          {/* Main Tabs (Patient default) */}
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          
          {/* Common Screens */}
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Messages" component={MessagesScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="ConsultationChat" component={ConsultationChatScreen} />
          <Stack.Screen name="MedicineOrder" component={MedicineOrderScreen} />
          <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
          <Stack.Screen name="HospitalBooking" component={HospitalBookingScreen} />
          <Stack.Screen name="Ambulance" component={AmbulanceScreen} />
          <Stack.Screen name="Articles" component={ArticlesScreen} />
          <Stack.Screen name="DoctorBoard" component={DoctorBoardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

// Root App Component with AuthProvider
// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌❌❌ APP ERROR:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#ff3b30' }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' }}>
            {this.state.error?.message || 'An error occurred'}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
            onPress={() => {
              this.setState({ hasError: false, error: null });
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Reload App</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  try {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('❌ CRITICAL APP ERROR:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 18, color: '#ff3b30' }}>App failed to load</Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 10 }}>{error.message}</Text>
      </View>
    );
  }
}
