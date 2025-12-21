import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Modal,
  Alert,
  Animated,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { db } from '../src/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import PaymentScreen from './PaymentScreen';
import PrescriptionReader from './PrescriptionReader';

const MedicineScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showPharmacySelection, setShowPharmacySelection] = useState(false);
  const [prescriptionImages, setPrescriptionImages] = useState([]);
  const [showPrescriptionReader, setShowPrescriptionReader] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [orderStatus, setOrderStatus] = useState('pending'); // pending, pharmacies_notified, accepted, rejected
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('medicines'); // medicines, orders
  const [checkingAvailability, setCheckingAvailability] = useState({}); // { pharmacyId: true/false }
  const [availabilityStatus, setAvailabilityStatus] = useState({}); // { pharmacyId: 'checking' | 'available' | 'unavailable' }
  const fadeAnim = new Animated.Value(0);

  const medicines = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      brand: 'Crocin',
      price: 15.00,
      mrp: 20.00,
      discount: 25,
      image: 'https://via.placeholder.com/150',
      category: 'Pain Relief',
      inStock: true,
      dosage: '1 tablet 2 times a day',
      description: 'Effective pain relief and fever reducer',
      rating: 4.5,
      reviews: 1234,
    },
    {
      id: '2',
      name: 'Aspirin 100mg',
      brand: 'Disprin',
      price: 12.00,
      mrp: 18.00,
      discount: 33,
      image: 'https://via.placeholder.com/150',
      category: 'Pain Relief',
      inStock: true,
      dosage: '1 tablet as needed',
      description: 'Blood thinner and pain relief',
      rating: 4.3,
      reviews: 856,
    },
    {
      id: '3',
      name: 'Vitamin D3 60000 IU',
      brand: 'Calcirol',
      price: 25.00,
      mrp: 35.00,
      discount: 29,
      image: 'https://via.placeholder.com/150',
      category: 'Supplements',
      inStock: true,
      dosage: '1 capsule weekly',
      description: 'Essential vitamin for bone health',
      rating: 4.7,
      reviews: 2341,
    },
    {
      id: '4',
      name: 'Calcium Tablets',
      brand: 'Shelcal',
      price: 30.00,
      mrp: 45.00,
      discount: 33,
      image: 'https://via.placeholder.com/150',
      category: 'Supplements',
      inStock: true,
      dosage: '1 tablet daily',
      description: 'Calcium and vitamin D supplement',
      rating: 4.6,
      reviews: 1890,
    },
    {
      id: '5',
      name: 'Azithromycin 500mg',
      brand: 'Azee',
      price: 45.00,
      mrp: 60.00,
      discount: 25,
      image: 'https://via.placeholder.com/150',
      category: 'Antibiotics',
      inStock: true,
      dosage: '1 tablet daily for 3 days',
      description: 'Broad spectrum antibiotic',
      rating: 4.4,
      reviews: 567,
      prescriptionRequired: true,
    },
    {
      id: '6',
      name: 'Cetirizine 10mg',
      brand: 'Allegra',
      price: 18.00,
      mrp: 25.00,
      discount: 28,
      image: 'https://via.placeholder.com/150',
      category: 'Allergy',
      inStock: true,
      dosage: '1 tablet daily',
      description: 'Anti-allergic medication',
      rating: 4.5,
      reviews: 1456,
    },
  ];

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getLocation();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle navigation from notifications
  useEffect(() => {
    if (route?.params?.goToPayment && route?.params?.pharmacyAcceptance) {
      setSelectedPharmacy(route.params.pharmacyAcceptance);
      if (route.params.cart) {
        setCart(route.params.cart);
      }
      setShowPayment(true);
      // Clear route params
      navigation.setParams({ goToPayment: false, pharmacyAcceptance: null, cart: null });
    }
  }, [route?.params]);

  const getLocation = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => console.log('Location error:', error)
          );
        }
        return;
      }
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (medicine) => {
    if (medicine.prescriptionRequired && prescriptionImages.length === 0 && !prescriptionData) {
      Alert.alert(
        'Prescription Required',
        'This medicine requires a prescription. Please upload one first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upload Prescription', onPress: () => setShowPrescription(true) },
        ]
      );
      return;
    }

    const existingItem = cart.find((item) => item.id === medicine.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
    
    // Show success animation
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, change) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) {
            return null;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean)
    );
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getDeliveryFee = () => {
    return 25; // Fixed delivery fee
  };

  const getFinalTotal = () => {
    return getTotal() + getDeliveryFee();
  };

  const sendOrderToPharmacies = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setOrderStatus('pharmacies_notified');
    
    // Simulate nearby pharmacies
    const nearbyPharmacies = [
      {
        id: 'ph1',
        name: 'Apollo Pharmacy',
        distance: '1.2 km',
        rating: 4.8,
        deliveryTime: '30-45 min',
        price: getFinalTotal(),
        accepted: false,
        rejected: false,
        phone: '+91 9876543210',
        address: '123 Health Street, Medical Complex',
        ownerName: 'Dr. Rajesh Kumar',
        availabilityChecked: false,
        availabilityStatus: null,
      },
      {
        id: 'ph2',
        name: 'MedPlus Pharmacy',
        distance: '2.5 km',
        rating: 4.6,
        deliveryTime: '45-60 min',
        price: getFinalTotal() - 5,
        accepted: false,
        rejected: false,
        phone: '+91 9876543211',
        address: '456 Wellness Avenue, City Center',
        ownerName: 'Dr. Priya Sharma',
        availabilityChecked: false,
        availabilityStatus: null,
      },
      {
        id: 'ph3',
        name: 'Wellness Forever',
        distance: '3.1 km',
        rating: 4.7,
        deliveryTime: '60-75 min',
        price: getFinalTotal() + 10,
        accepted: false,
        rejected: false,
        phone: '+91 9876543212',
        address: '789 Care Road, Downtown',
        ownerName: 'Dr. Amit Singh',
        availabilityChecked: false,
        availabilityStatus: null,
      },
    ];

    setPharmacies(nearbyPharmacies);
    setShowCart(false);
    setShowPharmacySelection(true);

    // Simulate real-time pharmacy responses (they receive the request)
    // Pharmacies will check availability when user clicks "Check Availability"

    // Save order to Firebase
    try {
      const orderData = {
        items: cart,
        total: getTotal(),
        deliveryFee: getDeliveryFee(),
        finalTotal: getFinalTotal(),
        status: 'pharmacies_notified',
        timestamp: new Date(),
        userLocation: userLocation,
        pharmacies: nearbyPharmacies,
      };
      await addDoc(collection(db, 'orders'), orderData);
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const checkAvailability = async (pharmacyId) => {
    setCheckingAvailability((prev) => ({ ...prev, [pharmacyId]: true }));
    setAvailabilityStatus((prev) => ({ ...prev, [pharmacyId]: 'checking' }));

    // Simulate checking availability
    setTimeout(() => {
      const pharmacy = pharmacies.find((p) => p.id === pharmacyId);
      if (pharmacy) {
        // Simulate 80% chance of availability
        const isAvailable = Math.random() > 0.2;
        const newStatus = isAvailable ? 'available' : 'unavailable';
        
        setAvailabilityStatus((prev) => ({ ...prev, [pharmacyId]: newStatus }));
        setCheckingAvailability((prev) => ({ ...prev, [pharmacyId]: false }));

        // Update pharmacy in list
        setPharmacies((prev) =>
          prev.map((p) =>
            p.id === pharmacyId
              ? { ...p, availabilityChecked: true, availabilityStatus: newStatus, accepted: isAvailable }
              : p
          )
        );

        // Create notification if available
        if (isAvailable) {
          createPharmacyAcceptanceNotification(pharmacy);
        }
      }
    }, 2000);
  };

  const createPharmacyAcceptanceNotification = (pharmacy) => {
    // Save notification to Firebase
    try {
      const notificationData = {
        type: 'pharmacy_acceptance',
        title: 'Request Accepted',
        message: `Request accepted by ${pharmacy.name}`,
        pharmacy: pharmacy,
        cart: cart,
        timestamp: new Date(),
        read: false,
        icon: 'checkmark-circle',
        color: '#34c759',
      };
      addDoc(collection(db, 'notifications'), notificationData);
    } catch (error) {
      console.error('Error saving notification:', error);
    }

    // Show alert
    Alert.alert(
      'Request Accepted! 🎉',
      `Request accepted by ${pharmacy.name}. You can proceed with payment.`,
      [
        {
          text: 'View Notifications',
          onPress: () => navigation.navigate('Notifications', { 
            pharmacyAcceptance: pharmacy,
            cart: cart,
          }),
        },
        { 
          text: 'Proceed to Payment',
          onPress: () => {
            setSelectedPharmacy(pharmacy);
            setShowPharmacySelection(false);
            setShowPayment(true);
          },
        },
        { text: 'OK' },
      ]
    );
  };

  const handlePharmacySelection = (pharmacy) => {
    if (!pharmacy.availabilityChecked) {
      Alert.alert(
        'Check Availability First',
        'Please check availability status before selecting this pharmacy.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (pharmacy.availabilityStatus !== 'available') {
      Alert.alert(
        'Not Available',
        'This pharmacy does not have all the medicines in stock. Please select another pharmacy.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedPharmacy(pharmacy);
    setShowPharmacySelection(false);
    setShowPayment(true);
  };

  const callPharmacy = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handlePaymentComplete = () => {
    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      items: cart,
      status: 'confirmed',
      pharmacy: selectedPharmacy,
      total: getTotal(),
      deliveryFee: getDeliveryFee(),
      finalTotal: getFinalTotal(),
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setShowPayment(false);
    setOrderStatus('pending');
    setSelectedPharmacy(null);
    
    Alert.alert(
      'Order Confirmed!',
      `Your medicines are available at ${selectedPharmacy.name}. Order confirmed.`,
      [
        {
          text: 'Track Order',
          onPress: () => navigation.navigate('OrderTracking', { order: newOrder }),
        },
        { text: 'OK' },
      ]
    );
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Camera Not Available',
        'Real-time camera access is only available on mobile devices. Please use "Choose from Gallery" option or test on a mobile device.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required', 
        'Camera permission is needed to take photos. Please enable camera access in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      // Close the modal first to ensure camera opens properly
      setShowPrescription(false);
      
      // Small delay to ensure modal is closed before opening camera
      setTimeout(async () => {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false, // Disable editing to ensure real-time camera
          quality: 0.9,
          base64: false,
          exif: false,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          setPrescriptionImages((prev) => [...prev, result.assets[0].uri]);
          // Reopen the prescription modal to show the captured image
          setShowPrescription(true);
        } else if (result.canceled) {
          // User cancelled, reopen the modal
          setShowPrescription(true);
        }
      }, 300);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Camera Error',
        'Failed to open camera. Please make sure camera permissions are granted and try again.',
        [
          { text: 'OK', onPress: () => setShowPrescription(true) }
        ]
      );
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setPrescriptionImages([...prescriptionImages, ...newImages]);
      setShowUploadOptions(false);
    }
  };

  const showUploadMethodOptions = () => {
    Alert.alert(
      'Upload Prescription',
      'Choose how you want to upload',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
          icon: 'camera',
        },
        {
          text: 'Choose from Gallery',
          onPress: pickFromGallery,
          icon: 'images',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const removePrescriptionImage = (index) => {
    setPrescriptionImages(prescriptionImages.filter((_, i) => i !== index));
  };

  const processPrescription = () => {
    if (prescriptionImages.length === 0) {
      Alert.alert('Error', 'Please upload at least one prescription image');
      return;
    }
    setShowPrescription(false);
    setShowPrescriptionReader(true);
  };

  const handlePrescriptionConfirm = (data) => {
    setPrescriptionData(data);
    setShowPrescriptionReader(false);
    
    // Auto-add medicines to cart
    const medicinesToAdd = data.medicines.map((med) => {
      const foundMedicine = medicines.find(
        (m) => m.name.toLowerCase().includes(med.name.toLowerCase().split(' ')[0])
      );
      return foundMedicine || {
        id: Date.now().toString() + med.name,
        name: med.name,
        brand: 'Generic',
        price: 20.00,
        mrp: 25.00,
        discount: 20,
        image: 'https://via.placeholder.com/150',
        category: 'Prescription',
        inStock: true,
        dosage: med.dosage,
        quantity: 1,
      };
    });

    setCart([...cart, ...medicinesToAdd]);
    
    Alert.alert(
      'Prescription Processed',
      `Found ${data.medicines.length} medicines. They have been added to your cart. Do you want to send this prescription to nearby pharmacies?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send to Pharmacies',
          onPress: () => {
            Alert.alert(
              'Prescription Sent',
              'Your prescription has been sent to nearby pharmacies. You will be notified when they approve your request.'
            );
            setPrescriptionImages([]);
            setPrescriptionData(null);
          },
        },
      ]
    );
  };

  const renderMedicine = ({ item }) => {
    const cartItem = cart.find((cartItem) => cartItem.id === item.id);
    const isInCart = !!cartItem;
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
      <TouchableOpacity style={styles.medicineCard}>
        <View style={styles.medicineImageContainer}>
          <Image source={{ uri: item.image }} style={styles.medicineImage} />
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}% OFF</Text>
            </View>
          )}
          {item.prescriptionRequired && (
            <View style={styles.prescriptionBadge}>
              <Ionicons name="document-text" size={12} color="#ff3b30" />
              <Text style={styles.prescriptionText}>Rx</Text>
            </View>
          )}
        </View>
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineBrand}>{item.brand}</Text>
          <Text style={styles.medicineName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#ffc107" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviews}>({item.reviews})</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.medicinePrice}>₹{item.price.toFixed(2)}</Text>
            {item.mrp > item.price && (
              <Text style={styles.medicineMrp}>₹{item.mrp.toFixed(2)}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.addButton,
              isInCart && styles.addButtonInCart,
              !item.inStock && styles.addButtonDisabled,
            ]}
            onPress={() => {
              addToCart(item);
            }}
            disabled={!item.inStock}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={item.inStock ? (isInCart ? "checkmark-circle" : "add-circle") : "close-circle"} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.addButtonText}>
              {item.inStock ? (isInCart ? 'Added to Cart' : 'Add to Cart') : 'Out of Stock'}
            </Text>
            {isInCart && quantity > 0 && (
              <View style={styles.addButtonBadge}>
                <Text style={styles.addButtonBadgeText}>{quantity}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderTracking', { order: item })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'delivered' && styles.statusDelivered,
            item.status === 'confirmed' && styles.statusConfirmed,
            item.status === 'in-transit' && styles.statusInTransit,
          ]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      {item.pharmacy && (
        <View style={styles.pharmacyInfo}>
          <Ionicons name="storefront" size={16} color="#007AFF" />
          <Text style={styles.pharmacyName}>{item.pharmacy.name}</Text>
        </View>
      )}
      <Text style={styles.orderItems}>
        {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
      </Text>
      <Text style={styles.orderTotal}>₹{item.finalTotal.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, brands, or symptoms..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowPrescription(true)}
          >
            <Ionicons name="document-text" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Upload Rx</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cartButton, cart.length > 0 && styles.cartButtonActive]}
            onPress={() => {
              // If there's an accepted pharmacy, go to payment, otherwise show cart
              const acceptedPharmacy = pharmacies.find((p) => p.accepted && p.availabilityStatus === 'available');
              if (acceptedPharmacy && cart.length > 0) {
                setSelectedPharmacy(acceptedPharmacy);
                setShowCart(false);
                setShowPayment(true);
              } else {
                setShowCart(true);
              }
            }}
          >
            <Ionicons name="cart" size={20} color={cart.length > 0 ? "#fff" : "#007AFF"} />
            <Text style={[styles.cartButtonText, cart.length > 0 && styles.cartButtonTextActive]}>
              Cart ({cart.length})
            </Text>
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'medicines' && styles.activeTab]}
          onPress={() => setActiveTab('medicines')}
        >
          <Text style={[styles.tabText, activeTab === 'medicines' && styles.activeTabText]}>
            Medicines
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            My Orders
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'medicines' ? (
        <FlatList
          data={filteredMedicines}
          renderItem={renderMedicine}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.medicinesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No medicines found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No orders yet</Text>
              <Text style={styles.emptySubtext}>Your order history will appear here</Text>
            </View>
          }
        />
      )}

      {/* Cart Modal */}
      <Modal visible={showCart} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shopping Cart</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.cartItems}>
              {cart.length === 0 ? (
                <View style={styles.emptyCartContainer}>
                  <Ionicons name="cart-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyCart}>Your cart is empty</Text>
                </View>
              ) : (
                cart.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemBrand}>{item.brand}</Text>
                      <Text style={styles.cartItemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, -1)}
                      >
                        <Ionicons name="remove" size={20} color="#007AFF" />
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, 1)}
                      >
                        <Ionicons name="add" size={20} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.id)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="trash" size={20} color="#ff3b30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            {cart.length > 0 && (
              <View style={styles.cartFooter}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>₹{getTotal().toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Delivery Fee</Text>
                  <Text style={styles.totalValue}>₹{getDeliveryFee().toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.finalTotalRow]}>
                  <Text style={styles.finalTotalLabel}>Total</Text>
                  <Text style={styles.finalTotalValue}>₹{getFinalTotal().toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={sendOrderToPharmacies}
                >
                  <Text style={styles.checkoutButtonText}>Send Request to Pharmacies</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Pharmacy Selection Modal */}
      <Modal visible={showPharmacySelection} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Pharmacy</Text>
              <TouchableOpacity onPress={() => setShowPharmacySelection(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pharmacyList}>
              {pharmacies.map((pharmacy) => {
                const isChecking = checkingAvailability[pharmacy.id];
                const status = availabilityStatus[pharmacy.id] || pharmacy.availabilityStatus;
                const isAvailable = status === 'available';
                const isUnavailable = status === 'unavailable';

                return (
                  <View key={pharmacy.id} style={styles.pharmacyCard}>
                    <View style={styles.pharmacyHeader}>
                      <View style={styles.pharmacyIcon}>
                        <Ionicons name="storefront" size={24} color="#007AFF" />
                      </View>
                      <View style={styles.pharmacyDetails}>
                        <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                        <View style={styles.pharmacyRating}>
                          <Ionicons name="star" size={14} color="#ffc107" />
                          <Text style={styles.ratingText}>{pharmacy.rating}</Text>
                        </View>
                      </View>
                      <View style={styles.pharmacyPrice}>
                        <Text style={styles.priceText}>₹{pharmacy.price.toFixed(2)}</Text>
                      </View>
                    </View>
                    <View style={styles.pharmacyInfo}>
                      <View style={styles.infoItem}>
                        <Ionicons name="location" size={14} color="#666" />
                        <Text style={styles.infoText}>{pharmacy.distance}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Ionicons name="time" size={14} color="#666" />
                        <Text style={styles.infoText}>{pharmacy.deliveryTime}</Text>
                      </View>
                    </View>

                    {/* Pharmacy Contact Details (Always shown) */}
                    <View style={styles.pharmacyContactDetails}>
                      <View style={styles.contactRow}>
                        <Ionicons name="call" size={16} color="#007AFF" />
                        <Text style={styles.contactText}>{pharmacy.phone}</Text>
                        <TouchableOpacity
                          style={styles.callButton}
                          onPress={() => callPharmacy(pharmacy.phone)}
                        >
                          <Ionicons name="call" size={16} color="#fff" />
                          <Text style={styles.callButtonText}>Call</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.contactRow}>
                        <Ionicons name="location" size={16} color="#666" />
                        <Text style={styles.contactText}>{pharmacy.address}</Text>
                      </View>
                      <View style={styles.contactRow}>
                        <Ionicons name="person" size={16} color="#666" />
                        <Text style={styles.contactText}>Owner: {pharmacy.ownerName}</Text>
                      </View>
                    </View>

                    {/* Availability Status */}
                    {status && (
                      <View style={[
                        styles.availabilityBadge,
                        isAvailable && styles.availabilityBadgeAvailable,
                        isUnavailable && styles.availabilityBadgeUnavailable,
                      ]}>
                        <Ionicons 
                          name={isAvailable ? 'checkmark-circle' : 'close-circle'} 
                          size={16} 
                          color={isAvailable ? '#34c759' : '#ff3b30'} 
                        />
                        <Text style={[
                          styles.availabilityText,
                          isAvailable && styles.availabilityTextAvailable,
                          isUnavailable && styles.availabilityTextUnavailable,
                        ]}>
                          {isAvailable ? 'Available' : 'Not Available'}
                        </Text>
                      </View>
                    )}


                    {/* Action Buttons */}
                    <View style={styles.pharmacyActions}>
                      {!pharmacy.availabilityChecked ? (
                        <TouchableOpacity
                          style={[
                            styles.checkAvailabilityButton,
                            isChecking && styles.checkAvailabilityButtonDisabled,
                          ]}
                          onPress={() => checkAvailability(pharmacy.id)}
                          disabled={isChecking}
                        >
                          {isChecking ? (
                            <>
                              <ActivityIndicator size="small" color="#fff" />
                              <Text style={styles.checkAvailabilityButtonText}>Checking...</Text>
                            </>
                          ) : (
                            <>
                              <Ionicons name="search" size={18} color="#fff" />
                              <Text style={styles.checkAvailabilityButtonText}>Check Availability</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      ) : isAvailable ? (
                        <TouchableOpacity
                          style={styles.selectPharmacyButton}
                          onPress={() => handlePharmacySelection(pharmacy)}
                        >
                          <Ionicons name="checkmark-circle" size={18} color="#fff" />
                          <Text style={styles.selectPharmacyButtonText}>Select & Pay</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.unavailableButton}>
                          <Ionicons name="close-circle" size={18} color="#ff3b30" />
                          <Text style={styles.unavailableButtonText}>Not Available</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Prescription Upload Modal */}
      <Modal visible={showPrescription} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Prescription</Text>
              <TouchableOpacity onPress={() => {
                setShowPrescription(false);
                setPrescriptionImages([]);
              }}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.prescriptionScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.prescriptionContainer}>
                {prescriptionImages.length === 0 ? (
                  <View style={styles.uploadOptionsContainer}>
                    <TouchableOpacity
                      style={styles.uploadOption}
                      onPress={takePhoto}
                    >
                      <View style={styles.uploadOptionIcon}>
                        <Ionicons name="camera" size={40} color="#007AFF" />
                      </View>
                      <Text style={styles.uploadOptionText}>Take Photo</Text>
                      <Text style={styles.uploadOptionSubtext}>Capture prescription with camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.uploadOption}
                      onPress={pickFromGallery}
                    >
                      <View style={styles.uploadOptionIcon}>
                        <Ionicons name="images" size={40} color="#007AFF" />
                      </View>
                      <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
                      <Text style={styles.uploadOptionSubtext}>Select from your photos</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScrollView}>
                      {prescriptionImages.map((image, index) => (
                        <View key={index} style={styles.imageContainer}>
                          <Image source={{ uri: image }} style={styles.prescriptionImage} />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => removePrescriptionImage(index)}
                          >
                            <Ionicons name="close-circle" size={24} color="#ff3b30" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                    <View style={styles.addMoreContainer}>
                      <TouchableOpacity
                        style={styles.addMoreButton}
                        onPress={showUploadMethodOptions}
                      >
                        <Ionicons name="add-circle" size={20} color="#007AFF" />
                        <Text style={styles.addMoreText}>Add More Photos</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[styles.processButton, prescriptionImages.length === 0 && styles.processButtonDisabled]}
                      onPress={processPrescription}
                      disabled={prescriptionImages.length === 0}
                    >
                      <Ionicons name="sparkles" size={20} color="#fff" />
                      <Text style={styles.processButtonText}>Process with AI</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* AI Prescription Reader Modal */}
      {showPrescriptionReader && (
        <Modal visible={showPrescriptionReader} animationType="slide" transparent={false}>
          <PrescriptionReader
            prescriptionImages={prescriptionImages}
            onConfirm={handlePrescriptionConfirm}
            onCancel={() => {
              setShowPrescriptionReader(false);
              setShowPrescription(true);
            }}
          />
        </Modal>
      )}

      {/* Payment Modal */}
      {showPayment && selectedPharmacy && (
        <PaymentScreen
          visible={showPayment}
          onClose={() => setShowPayment(false)}
          order={{
            items: cart,
            total: getTotal(),
            deliveryFee: getDeliveryFee(),
            finalTotal: getFinalTotal(),
            pharmacy: selectedPharmacy,
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  cartButtonActive: {
    backgroundColor: '#007AFF',
  },
  cartButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cartButtonTextActive: {
    color: '#fff',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  medicinesList: {
    padding: 15,
    paddingBottom: 100,
  },
  ordersList: {
    padding: 15,
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '48%',
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
  },
  medicineImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  prescriptionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  prescriptionText: {
    color: '#ff3b30',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  medicineInfo: {
    padding: 12,
  },
  medicineBrand: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000',
    minHeight: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#000',
  },
  reviews: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  medicinePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginRight: 8,
  },
  medicineMrp: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    position: 'relative',
  },
  addButtonInCart: {
    backgroundColor: '#34c759',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addButtonBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#34c759',
  },
  addButtonBadgeText: {
    color: '#34c759',
    fontSize: 10,
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  pharmacyName: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ff9500',
  },
  statusDelivered: {
    backgroundColor: '#34c759',
  },
  statusConfirmed: {
    backgroundColor: '#007AFF',
  },
  statusInTransit: {
    backgroundColor: '#ffc107',
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  cartItems: {
    maxHeight: 400,
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyCart: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cartItemBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    padding: 4,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 10,
    padding: 4,
  },
  cartFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    marginTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  finalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    marginTop: 10,
  },
  finalTotalLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  finalTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  pharmacyList: {
    maxHeight: 500,
  },
  pharmacyCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  pharmacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pharmacyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pharmacyDetails: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  pharmacyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pharmacyPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  pharmacyInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  availabilityBadgeAvailable: {
    backgroundColor: '#d4edda',
  },
  availabilityBadgeUnavailable: {
    backgroundColor: '#f8d7da',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  availabilityTextAvailable: {
    color: '#34c759',
  },
  availabilityTextUnavailable: {
    color: '#ff3b30',
  },
  pharmacyContactDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34c759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pharmacyActions: {
    marginTop: 12,
  },
  checkAvailabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  checkAvailabilityButtonDisabled: {
    backgroundColor: '#999',
  },
  checkAvailabilityButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectPharmacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34c759',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  selectPharmacyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  unavailableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8d7da',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  unavailableButtonText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '600',
  },
  prescriptionContainer: {
    alignItems: 'center',
  },
  prescriptionScrollView: {
    maxHeight: 600,
  },
  uploadOptionsContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
    marginBottom: 20,
  },
  uploadOption: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  uploadOptionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  uploadOptionSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  imagesScrollView: {
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addMoreContainer: {
    width: '100%',
    marginBottom: 15,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  processButtonDisabled: {
    backgroundColor: '#ccc',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadArea: {
    width: '100%',
    height: 300,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f8ff',
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  uploadSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  prescriptionImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  changeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 15,
  },
  changeButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default MedicineScreen;
