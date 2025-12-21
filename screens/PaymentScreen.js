import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PaymentScreen = ({ visible, onClose, order, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentStep, setPaymentStep] = useState('method'); // method, details, confirm
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      icon: 'phone-portrait',
      color: '#007AFF',
      methods: [
        { id: 'gpay', name: 'Google Pay', icon: 'logo-google', color: '#4285F4' },
        { id: 'phonepe', name: 'PhonePe', icon: 'phone-portrait', color: '#5F259F' },
        { id: 'paytm', name: 'Paytm', icon: 'wallet', color: '#00BAF2' },
        { id: 'bhim', name: 'BHIM UPI', icon: 'card', color: '#FF6B35' },
      ],
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'card',
      color: '#FF6B35',
      methods: [
        { id: 'visa', name: 'Visa', icon: 'card', color: '#1A1F71' },
        { id: 'mastercard', name: 'Mastercard', icon: 'card', color: '#EB001B' },
        { id: 'rupay', name: 'RuPay', icon: 'card', color: '#0066CC' },
      ],
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: 'business',
      color: '#34C759',
      methods: [
        { id: 'sbi', name: 'State Bank of India', icon: 'business', color: '#003D82' },
        { id: 'hdfc', name: 'HDFC Bank', icon: 'business', color: '#E41E2E' },
        { id: 'icici', name: 'ICICI Bank', icon: 'business', color: '#FF6600' },
        { id: 'axis', name: 'Axis Bank', icon: 'business', color: '#E41E2E' },
        { id: 'kotak', name: 'Kotak Mahindra', icon: 'business', color: '#FF6600' },
      ],
    },
    {
      id: 'wallet',
      name: 'Wallets',
      icon: 'wallet',
      color: '#FF9500',
      methods: [
        { id: 'paytm_wallet', name: 'Paytm Wallet', icon: 'wallet', color: '#00BAF2' },
        { id: 'mobikwik', name: 'MobiKwik', icon: 'wallet', color: '#FF6B00' },
        { id: 'freecharge', name: 'Freecharge', icon: 'wallet', color: '#00AEEF' },
      ],
    },
    {
      id: 'paylater',
      name: 'Pay Later / EMI',
      icon: 'calendar',
      color: '#AF52DE',
      methods: [
        { id: 'paylater', name: 'Pay Later', icon: 'calendar', color: '#AF52DE' },
        { id: 'emi', name: 'EMI Options', icon: 'calendar', color: '#AF52DE' },
      ],
    },
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setPaymentStep('details');
  };

  const handlePayment = () => {
    // Simulate payment processing
    setPaymentStep('confirm');
    setTimeout(() => {
      onPaymentComplete();
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setPaymentStep('method');
    setSelectedMethod(null);
    setUpiId('');
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setSelectedBank(null);
    setSelectedWallet(null);
    onClose();
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{order.total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹{order.deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{order.finalTotal.toFixed(2)}</Text>
            </View>
          </View>

          {paymentStep === 'method' && (
            <ScrollView style={styles.methodsList} showsVerticalScrollIndicator={false}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={styles.methodCard}
                  onPress={() => handleMethodSelect(method)}
                >
                  <View style={[styles.methodIcon, { backgroundColor: `${method.color}15` }]}>
                    <Ionicons name={method.icon} size={24} color={method.color} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodSubtext}>
                      {method.id === 'upi' && 'Pay using UPI apps'}
                      {method.id === 'card' && 'Credit or Debit Card'}
                      {method.id === 'netbanking' && 'Internet Banking'}
                      {method.id === 'wallet' && 'Digital Wallets'}
                      {method.id === 'paylater' && 'Pay later or EMI'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {paymentStep === 'details' && selectedMethod && (
            <ScrollView style={styles.detailsContainer}>
              <View style={styles.backButtonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setPaymentStep('method')}
                >
                  <Ionicons name="arrow-back" size={20} color="#007AFF" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              </View>

              {selectedMethod.id === 'upi' && (
                <View style={styles.paymentForm}>
                  <Text style={styles.formTitle}>Select UPI App</Text>
                  <View style={styles.upiApps}>
                    {selectedMethod.methods.map((app) => (
                      <TouchableOpacity
                        key={app.id}
                        style={styles.upiAppCard}
                        onPress={() => {
                          setSelectedWallet(app);
                          handlePayment();
                        }}
                      >
                        <View style={[styles.appIcon, { backgroundColor: `${app.color}15` }]}>
                          <Ionicons name={app.icon} size={32} color={app.color} />
                        </View>
                        <Text style={styles.appName}>{app.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Enter UPI ID</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="yourname@upi"
                        value={upiId}
                        onChangeText={setUpiId}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                    <TouchableOpacity
                      style={[styles.payButton, !upiId && styles.payButtonDisabled]}
                      onPress={handlePayment}
                      disabled={!upiId}
                    >
                      <Text style={styles.payButtonText}>Pay ₹{order.finalTotal.toFixed(2)}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {selectedMethod.id === 'card' && (
                <View style={styles.paymentForm}>
                  <Text style={styles.formTitle}>Card Details</Text>
                  <View style={styles.cardPreview}>
                    <View style={styles.cardChip} />
                    <Text style={styles.cardNumberPreview}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardNamePreview}>{cardName || 'CARDHOLDER NAME'}</Text>
                      <Text style={styles.cardExpiryPreview}>{cardExpiry || 'MM/YY'}</Text>
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Card Number</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                        keyboardType="number-pad"
                        maxLength={19}
                      />
                      <Ionicons name="card" size={20} color="#666" />
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Cardholder Name</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        value={cardName}
                        onChangeText={setCardName}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.inputLabel}>Expiry Date</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                          keyboardType="number-pad"
                          maxLength={5}
                        />
                      </View>
                    </View>
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          placeholder="123"
                          value={cardCvv}
                          onChangeText={(text) => setCardCvv(text.replace(/\D/g, '').slice(0, 3))}
                          keyboardType="number-pad"
                          maxLength={3}
                          secureTextEntry
                        />
                        <Ionicons name="lock-closed" size={16} color="#666" />
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.payButton,
                      (!cardNumber || !cardName || !cardExpiry || !cardCvv) && styles.payButtonDisabled,
                    ]}
                    onPress={handlePayment}
                    disabled={!cardNumber || !cardName || !cardExpiry || !cardCvv}
                  >
                    <Text style={styles.payButtonText}>Pay ₹{order.finalTotal.toFixed(2)}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedMethod.id === 'netbanking' && (
                <View style={styles.paymentForm}>
                  <Text style={styles.formTitle}>Select Bank</Text>
                  <View style={styles.bankList}>
                    {selectedMethod.methods.map((bank) => (
                      <TouchableOpacity
                        key={bank.id}
                        style={[
                          styles.bankCard,
                          selectedBank?.id === bank.id && styles.bankCardSelected,
                        ]}
                        onPress={() => setSelectedBank(bank)}
                      >
                        <View style={[styles.bankIcon, { backgroundColor: `${bank.color}15` }]}>
                          <Ionicons name={bank.icon} size={24} color={bank.color} />
                        </View>
                        <Text style={styles.bankName}>{bank.name}</Text>
                        {selectedBank?.id === bank.id && (
                          <Ionicons name="checkmark-circle" size={24} color="#34c759" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.payButton, !selectedBank && styles.payButtonDisabled]}
                    onPress={handlePayment}
                    disabled={!selectedBank}
                  >
                    <Text style={styles.payButtonText}>Continue to Bank</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedMethod.id === 'wallet' && (
                <View style={styles.paymentForm}>
                  <Text style={styles.formTitle}>Select Wallet</Text>
                  <View style={styles.walletList}>
                    {selectedMethod.methods.map((wallet) => (
                      <TouchableOpacity
                        key={wallet.id}
                        style={[
                          styles.walletCard,
                          selectedWallet?.id === wallet.id && styles.walletCardSelected,
                        ]}
                        onPress={() => {
                          setSelectedWallet(wallet);
                          handlePayment();
                        }}
                      >
                        <View style={[styles.walletIcon, { backgroundColor: `${wallet.color}15` }]}>
                          <Ionicons name={wallet.icon} size={32} color={wallet.color} />
                        </View>
                        <Text style={styles.walletName}>{wallet.name}</Text>
                        {selectedWallet?.id === wallet.id && (
                          <Ionicons name="checkmark-circle" size={24} color="#34c759" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {selectedMethod.id === 'paylater' && (
                <View style={styles.paymentForm}>
                  <Text style={styles.formTitle}>Pay Later Options</Text>
                  <View style={styles.payLaterOptions}>
                    <TouchableOpacity
                      style={styles.payLaterCard}
                      onPress={handlePayment}
                    >
                      <Ionicons name="calendar" size={32} color="#AF52DE" />
                      <View style={styles.payLaterInfo}>
                        <Text style={styles.payLaterTitle}>Pay Later</Text>
                        <Text style={styles.payLaterSubtext}>Pay within 14 days</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.payLaterCard}
                      onPress={handlePayment}
                    >
                      <Ionicons name="calendar-outline" size={32} color="#AF52DE" />
                      <View style={styles.payLaterInfo}>
                        <Text style={styles.payLaterTitle}>EMI Options</Text>
                        <Text style={styles.payLaterSubtext}>3, 6, 9, 12 months</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {paymentStep === 'confirm' && (
            <View style={styles.confirmContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={80} color="#34c759" />
              </View>
              <Text style={styles.successTitle}>Payment Successful!</Text>
              <Text style={styles.successMessage}>
                Your order has been confirmed and will be delivered soon.
              </Text>
            </View>
          )}

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#34c759" />
            <Text style={styles.securityText}>Secure Payment • SSL Encrypted</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  orderSummary: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  methodsList: {
    maxHeight: 500,
    padding: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodSubtext: {
    fontSize: 14,
    color: '#666',
  },
  detailsContainer: {
    maxHeight: 500,
    padding: 20,
  },
  backButtonContainer: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  paymentForm: {
    flex: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  cardPreview: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    height: 180,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: '#ffc107',
    borderRadius: 4,
  },
  cardNumberPreview: {
    fontSize: 20,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardNamePreview: {
    fontSize: 14,
    color: '#fff',
    textTransform: 'uppercase',
  },
  cardExpiryPreview: {
    fontSize: 14,
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
  },
  upiApps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  upiAppCard: {
    width: (width - 80) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#666',
  },
  bankList: {
    gap: 12,
    marginBottom: 20,
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  bankCardSelected: {
    borderColor: '#34c759',
    backgroundColor: '#f0fdf4',
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  bankName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  walletList: {
    gap: 12,
    marginBottom: 20,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  walletCardSelected: {
    borderColor: '#34c759',
    backgroundColor: '#f0fdf4',
  },
  walletIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  walletName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  payLaterOptions: {
    gap: 12,
    marginBottom: 20,
  },
  payLaterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  payLaterInfo: {
    flex: 1,
    marginLeft: 15,
  },
  payLaterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  payLaterSubtext: {
    fontSize: 14,
    color: '#666',
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  confirmContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 300,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: '#000',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0fdf4',
    marginHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#34c759',
    fontWeight: '600',
  },
});

export default PaymentScreen;

