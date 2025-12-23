import React, { useEffect, Suspense } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Image } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { navigationRef as globalNavRef } from './utils/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getRoleHomeRoute } from './utils/roleRouting';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Lazy load screens with error boundaries
const createLazyScreen = (importFn, fallbackName) => {
  const LazyComponent = React.lazy(importFn);
  return (props) => (
    <Suspense fallback={
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading {fallbackName}...</Text>
      </View>
    }>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy load all screens
const LoginScreen = createLazyScreen(() => import('./screens/LoginScreen'), 'Login');
const SignupScreen = createLazyScreen(() => import('./screens/SignupScreen'), 'Signup');
const SetupUserScreen = createLazyScreen(() => import('./screens/SetupUserScreen'), 'SetupUser');
const CompleteProfileScreen = createLazyScreen(() => import('./screens/CompleteProfileScreen'), 'CompleteProfile');
const HomeScreen = createLazyScreen(() => import('./screens/HomeScreen'), 'Home');
const ExploreScreen = createLazyScreen(() => import('./screens/ExploreScreen'), 'Explore');
const ConsultScreen = createLazyScreen(() => import('./screens/ConsultScreen'), 'Consult');
const MedicineScreen = createLazyScreen(() => import('./screens/MedicineScreen'), 'Medicine');
const DonorScreen = createLazyScreen(() => import('./screens/DonorScreen'), 'Donor');
const ProfileScreen = createLazyScreen(() => import('./screens/ProfileScreen'), 'Profile');
const NotificationsScreen = createLazyScreen(() => import('./screens/NotificationsScreen'), 'Notifications');
const MessagesScreen = createLazyScreen(() => import('./screens/MessagesScreen'), 'Messages');
const ChatScreen = createLazyScreen(() => import('./screens/ChatScreen'), 'Chat');
const DoctorProfileScreen = createLazyScreen(() => import('./screens/DoctorProfileScreen'), 'DoctorProfile');
const UserProfileScreen = createLazyScreen(() => import('./screens/UserProfileScreen'), 'UserProfile');
const ConsultationChatScreen = createLazyScreen(() => import('./screens/ConsultationChatScreen'), 'ConsultationChat');
const MedicineOrderScreen = createLazyScreen(() => import('./screens/MedicineOrderScreen'), 'MedicineOrder');
const OrderTrackingScreen = createLazyScreen(() => import('./screens/OrderTrackingScreen'), 'OrderTracking');
const HospitalBookingScreen = createLazyScreen(() => import('./screens/HospitalBookingScreen'), 'HospitalBooking');
const AmbulanceScreen = createLazyScreen(() => import('./screens/AmbulanceScreen'), 'Ambulance');
const ArticlesScreen = createLazyScreen(() => import('./screens/ArticlesScreen'), 'Articles');
const DoctorHomeScreen = createLazyScreen(() => import('./screens/DoctorHomeScreen'), 'DoctorHome');
const PharmacyHomeScreen = createLazyScreen(() => import('./screens/PharmacyHomeScreen'), 'PharmacyHome');
const DeliveryHomeScreen = createLazyScreen(() => import('./screens/DeliveryHomeScreen'), 'DeliveryHome');
const HospitalHomeScreen = createLazyScreen(() => import('./screens/HospitalHomeScreen'), 'HospitalHome');
const AmbulanceHomeScreen = createLazyScreen(() => import('./screens/AmbulanceHomeScreen'), 'AmbulanceHome');
const AdminDashboardScreen = createLazyScreen(() => import('./screens/AdminDashboardScreen'), 'AdminDashboard');
const DoctorBoardScreen = createLazyScreen(() => import('./screens/DoctorBoardScreen'), 'DoctorBoard');
const EditProfileScreen = createLazyScreen(() => import('./screens/EditProfileScreen'), 'EditProfile');

function MainTabs({ navigation }) {
  const { isAuthenticated, userData } = useAuth();
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [isAuthenticated, navigation]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => {
        // Get profile photo from userData
        const profilePhoto = userData?.profilePhoto;
        
        return {
          tabBarIcon: ({ focused, color, size }) => {
          // For Profile tab, show profile photo if available
          if (route.name === 'Profile') {
            if (profilePhoto && profilePhoto.trim()) {
              return (
                <Image 
                  source={{ uri: profilePhoto }} 
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: focused ? 2 : 0,
                    borderColor: color,
                    backgroundColor: '#e0e0e0',
                  }}
                  onError={(error) => {
                    console.error('❌ Profile photo failed to load in tab bar:', error);
                  }}
                />
              );
            }
            // Fallback to icon if no photo
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
          }
          
          // For other tabs, show icons
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
          }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: true,
          headerTitle: route.name === 'Profile' ? '' : route.name,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={{ marginLeft: 15, padding: 5 }}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={28} color="#000" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Messages')}
              style={{ marginRight: 15, padding: 5 }}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#000" />
            </TouchableOpacity>
          ),
        };
      }}
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

function AppNavigator() {
  const { isAuthenticated, loading, userData } = useAuth();
  const navigationRef = useNavigationContainerRef();
  
  useEffect(() => {
    if (navigationRef && globalNavRef) {
      Object.setPrototypeOf(globalNavRef, navigationRef);
      Object.assign(globalNavRef, navigationRef);
    }
  }, [navigationRef]);

  useEffect(() => {
    if (loading) return;
    
    const checkAndNavigate = () => {
      if (!navigationRef?.isReady()) {
        setTimeout(checkAndNavigate, 100);
        return;
      }

      const currentRoute = navigationRef.getCurrentRoute()?.name;

      if (isAuthenticated && userData) {
        const profileCompleted = userData.profileCompleted === true;
        
        if (!profileCompleted && currentRoute !== 'CompleteProfile') {
          try {
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Navigation error:', error);
          }
          return;
        }
        
        if (profileCompleted) {
          const userRole = userData.role;
          const homeRoute = getRoleHomeRoute(userRole);
          
          if (currentRoute !== homeRoute && currentRoute !== 'MainTabs') {
            try {
              navigationRef.reset({
                index: 0,
                routes: [{ name: homeRoute }],
              });
            } catch (error) {
              console.error('Navigation error:', error);
              try {
                navigationRef.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              } catch (fallbackError) {
                console.error('Fallback navigation failed:', fallbackError);
              }
            }
          }
        }
      } else {
        if (currentRoute !== 'Login' && currentRoute !== 'Signup' && currentRoute !== 'CompleteProfile') {
          try {
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }
      }
    };

    checkAndNavigate();
  }, [isAuthenticated, loading, userData, navigationRef]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={(ref) => {
      if (ref) {
        if (navigationRef) {
          Object.assign(navigationRef, ref);
        }
        if (globalNavRef) {
          Object.assign(globalNavRef, ref);
        }
      }
    }}>
      <StatusBar style="auto" />
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="SetupUser" component={SetupUserScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        
        <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PharmacyHome" component={PharmacyHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DeliveryHome" component={DeliveryHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HospitalHome" component={HospitalHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AmbulanceHome" component={AmbulanceHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
        
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        
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
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error);
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

if (typeof window !== 'undefined') {
  if (!window.__errorHandlersAdded) {
    window.addEventListener('error', (event) => {
      console.error('Global Error:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    });
    
    window.__errorHandlersAdded = true;
  }
}

export default function App() {
  console.log('🚀 App starting with lazy loading...');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}
