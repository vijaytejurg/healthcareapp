import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './src/firebase';
import { UserProvider } from './contexts/UserContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SetupUserScreen from './screens/SetupUserScreen';
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
import AmbulanceHomeScreen from './screens/AmbulanceHomeScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';

// Utils
import { getRoleHomeRoute } from './utils/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ navigation }) {
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
        headerLeft: () => (
          <Ionicons
            name="notifications-outline"
            size={28}
            color="#000"
            style={{ marginLeft: 15 }}
            onPress={() => navigation.navigate('Notifications')}
          />
        ),
        headerRight: () => (
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={28}
            color="#000"
            style={{ marginRight: 15 }}
            onPress={() => navigation.navigate('Messages')}
          />
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

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? firebaseUser.uid : 'signed out');
      
      if (firebaseUser) {
        // User is authenticated
        console.log('✅ User authenticated:', firebaseUser.uid);
        
        // Fetch user role from Firestore for role-based routing
        let userRole = 'patient'; // Default role
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userRole = userData.role || 'patient';
            console.log('✅ User role fetched:', userRole);
          } else {
            console.log('⚠️ User document does not exist. User may need to complete signup.');
          }
        } catch (error) {
          console.error('❌ Error checking user document:', error);
        }
        
        setUser(firebaseUser);
        
        // Navigate to role-specific home screen
        const roleHomeRoute = getRoleHomeRoute(userRole);
        console.log('🏠 Navigating to role home:', roleHomeRoute);
        
        setTimeout(() => {
          if (navigationRef.isReady()) {
            try {
              navigationRef.reset({
                index: 0,
                routes: [{ name: roleHomeRoute }],
              });
              console.log('✅ Successfully navigated to:', roleHomeRoute);
            } catch (error) {
              console.error('Navigation error:', error);
              // Fallback to MainTabs
              try {
                navigationRef.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              } catch (fallbackError) {
                console.error('Fallback navigation error:', fallbackError);
              }
            }
          }
        }, 100);
      } else {
        // User is signed out
        console.log('👋 User signed out');
        setUser(null);
        
        // Navigate to Login when user signs out
        setTimeout(() => {
          if (navigationRef.isReady()) {
            try {
              navigationRef.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }
        }, 100);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [navigationRef]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <UserProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName={user ? "MainTabs" : "Login"}
        >
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="SetupUser" component={SetupUserScreen} />
          
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
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
