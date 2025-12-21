import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Screens
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
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
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
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
  );
}

