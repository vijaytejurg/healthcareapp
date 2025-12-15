import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const MedicineScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [orders, setOrders] = useState([
    {
      id: '1',
      date: '2024-01-15',
      items: ['Paracetamol 500mg', 'Aspirin 100mg'],
      status: 'delivered',
      total: 45.00,
    },
    {
      id: '2',
      date: '2024-01-20',
      items: ['Vitamin D3', 'Calcium Tablets'],
      status: 'in-transit',
      total: 78.50,
    },
  ]);

  const medicines = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      price: 15.00,
      image: 'https://via.placeholder.com/150',
      category: 'Pain Relief',
      inStock: true,
    },
    {
      id: '2',
      name: 'Aspirin 100mg',
      price: 12.00,
      image: 'https://via.placeholder.com/150',
      category: 'Pain Relief',
      inStock: true,
    },
    {
      id: '3',
      name: 'Vitamin D3',
      price: 25.00,
      image: 'https://via.placeholder.com/150',
      category: 'Supplements',
      inStock: true,
    },
    {
      id: '4',
      name: 'Calcium Tablets',
      price: 30.00,
      image: 'https://via.placeholder.com/150',
      category: 'Supplements',
      inStock: true,
    },
    {
      id: '5',
      name: 'Antibiotic 250mg',
      price: 45.00,
      image: 'https://via.placeholder.com/150',
      category: 'Antibiotics',
      inStock: false,
    },
  ];

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (medicine) => {
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
    Alert.alert('Success', 'Medicine added to cart');
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

  const handleCheckout = () => {
    setShowCart(false);
    setShowPayment(true);
  };

  const handlePayment = () => {
    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      items: cart.map((item) => item.name),
      status: 'pending',
      total: getTotal(),
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setShowPayment(false);
    Alert.alert('Success', 'Order placed successfully!');
    navigation.navigate('OrderTracking', { order: newOrder });
  };

  const pickPrescription = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPrescriptionImage(result.assets[0].uri);
    }
  };

  const uploadPrescription = async () => {
    if (!prescriptionImage) {
      Alert.alert('Error', 'Please select a prescription image');
      return;
    }
    // Simulate sending to nearby shops
    Alert.alert(
      'Prescription Sent',
      'Your prescription has been sent to nearby pharmacies. You will be notified when they approve your request.'
    );
    setShowPrescription(false);
  };

  const renderMedicine = ({ item }) => (
    <View style={styles.medicineCard}>
      <Image source={{ uri: item.image }} style={styles.medicineImage} />
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName}>{item.name}</Text>
        <Text style={styles.medicineCategory}>{item.category}</Text>
        <View style={styles.medicineFooter}>
          <Text style={styles.medicinePrice}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={[
              styles.addButton,
              !item.inStock && styles.addButtonDisabled,
            ]}
            onPress={() => addToCart(item)}
            disabled={!item.inStock}
          >
            <Text
              style={[
                styles.addButtonText,
                !item.inStock && styles.addButtonTextDisabled,
              ]}
            >
              {item.inStock ? 'Add' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderTracking', { order: item })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>Order #{item.id.slice(0, 8)}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'delivered' && styles.statusDelivered,
            item.status === 'in-transit' && styles.statusInTransit,
          ]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.orderItems}>{item.items.join(', ')}</Text>
      <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowPrescription(true)}
        >
          <Ionicons name="document-text" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Upload Prescription</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowCart(true)}
        >
          <Ionicons name="cart" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>
            Cart ({cart.length})
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>All Medicines</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Previous Orders</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicine}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.ordersSection}>
            <Text style={styles.sectionTitle}>Previous Orders</Text>
            <FlatList
              data={orders}
              renderItem={renderOrder}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        }
      />
      <Modal visible={showCart} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cart</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.cartItems}>
              {cart.length === 0 ? (
                <Text style={styles.emptyCart}>Your cart is empty</Text>
              ) : (
                cart.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, -1)}
                      >
                        <Ionicons name="remove-circle" size={24} color="#007AFF" />
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, 1)}
                      >
                        <Ionicons name="add-circle" size={24} color="#007AFF" />
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
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>${getTotal().toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={handleCheckout}
                >
                  <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Modal visible={showPayment} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment</Text>
              <TouchableOpacity onPress={() => setShowPayment(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.paymentDetails}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Subtotal</Text>
                <Text style={styles.paymentValue}>${getTotal().toFixed(2)}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Delivery Fee</Text>
                <Text style={styles.paymentValue}>$5.00</Text>
              </View>
              <View style={[styles.paymentRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${(getTotal() + 5).toFixed(2)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayment}
            >
              <Text style={styles.payButtonText}>
                Pay ${(getTotal() + 5).toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showPrescription} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Prescription</Text>
              <TouchableOpacity onPress={() => setShowPrescription(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.prescriptionContainer}>
              {prescriptionImage ? (
                <Image
                  source={{ uri: prescriptionImage }}
                  style={styles.prescriptionImage}
                />
              ) : (
                <TouchableOpacity
                  style={styles.uploadArea}
                  onPress={pickPrescription}
                >
                  <Ionicons name="camera" size={50} color="#007AFF" />
                  <Text style={styles.uploadText}>Tap to upload prescription</Text>
                </TouchableOpacity>
              )}
              {prescriptionImage && (
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={pickPrescription}
                >
                  <Text style={styles.changeButtonText}>Change Image</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={uploadPrescription}
                disabled={!prescriptionImage}
              >
                <Text style={styles.uploadButtonText}>Send to Pharmacies</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  ordersSection: {
    marginBottom: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginLeft: 15,
    width: 280,
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
  orderDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ff9500',
  },
  statusDelivered: {
    backgroundColor: '#34c759',
  },
  statusInTransit: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  orderItems: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '48%',
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  medicineInfo: {
    padding: 10,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  medicineCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  medicineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicinePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: '#999',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cartItems: {
    maxHeight: 400,
  },
  emptyCart: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 15,
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
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  paymentDetails: {
    marginVertical: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#666',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  prescriptionContainer: {
    alignItems: 'center',
  },
  uploadArea: {
    width: '100%',
    height: 300,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  prescriptionImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  changeButton: {
    paddingVertical: 10,
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
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MedicineScreen;

