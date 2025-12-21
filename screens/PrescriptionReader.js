import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
];

const PrescriptionReader = ({ prescriptionImages, onConfirm, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [extractedData, setExtractedData] = useState(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [processingSteps, setProcessingSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const processingStepsList = [
    { id: 1, text: 'Uploading images...', icon: 'cloud-upload' },
    { id: 2, text: 'Scanning prescription...', icon: 'scan' },
    { id: 3, text: 'Extracting text with OCR...', icon: 'text' },
    { id: 4, text: 'Identifying medicine names...', icon: 'flask' },
    { id: 5, text: 'Analyzing dosage information...', icon: 'medical' },
    { id: 6, text: 'Extracting frequency and timing...', icon: 'time' },
    { id: 7, text: 'Processing instructions...', icon: 'document-text' },
    { id: 8, text: 'Validating data...', icon: 'checkmark-circle' },
    { id: 9, text: 'Finalizing results...', icon: 'sparkles' },
  ];

  useEffect(() => {
    // Start processing immediately when component mounts
    if (isProcessing && prescriptionImages && prescriptionImages.length > 0) {
      startProcessing();
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [prescriptionImages]);

  const startProcessing = async () => {
    setProcessingSteps([]);
    setProgress(0);
    setCurrentStep(0);

    // Simulate real-time processing with step-by-step updates
    for (let i = 0; i < processingStepsList.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setCurrentStep(i);
      setProcessingSteps((prev) => [...prev, processingStepsList[i]]);
      setProgress(((i + 1) / processingStepsList.length) * 100);
    }

    // Final processing
    await new Promise((resolve) => setTimeout(resolve, 500));
    processPrescription();
  };

  const processPrescription = () => {
    // Simulated AI extraction - In real app, this would call an AI/OCR service
    // You can integrate with services like:
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Computer Vision
    // - Tesseract OCR
    // - Custom ML model

    const mockExtractedData = {
      doctorName: 'Dr. Rajesh Kumar',
      patientName: 'Patient Name',
      date: new Date().toLocaleDateString(),
      medicines: [
        {
          name: 'Paracetamol 500mg',
          dosage: '1 tablet',
          frequency: '2 times a day',
          duration: '5 days',
          timing: 'After meals',
          instructions: 'Take with water',
        },
        {
          name: 'Azithromycin 500mg',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '3 days',
          timing: 'Before meals',
          instructions: 'Complete the full course',
        },
        {
          name: 'Cetirizine 10mg',
          dosage: '1 tablet',
          frequency: 'Once daily',
          duration: '7 days',
          timing: 'At night',
          instructions: 'May cause drowsiness',
        },
      ],
      additionalNotes: 'Avoid alcohol during treatment. Complete the full course of antibiotics.',
    };

    setExtractedData(mockExtractedData);
    setIsProcessing(false);
    setProgress(100);
  };

  const translateText = (text, targetLang) => {
    // Simulated translation - In real app, use Google Translate API or similar
    const translations = {
      hi: {
        'Medicines': 'दवाएं',
        'Dosage': 'खुराक',
        'Frequency': 'आवृत्ति',
        'Duration': 'अवधि',
        'Timing': 'समय',
        'Instructions': 'निर्देश',
        'Doctor Name': 'डॉक्टर का नाम',
        'Patient Name': 'रोगी का नाम',
        'Date': 'तारीख',
        'Additional Notes': 'अतिरिक्त नोट्स',
        'times a day': 'दिन में बार',
        'Once daily': 'दिन में एक बार',
        'After meals': 'भोजन के बाद',
        'Before meals': 'भोजन से पहले',
        'At night': 'रात में',
        'Take with water': 'पानी के साथ लें',
        'Complete the full course': 'पूरा कोर्स पूरा करें',
        'May cause drowsiness': 'नींद आ सकती है',
      },
      ta: {
        'Medicines': 'மருந்துகள்',
        'Dosage': 'மருந்தளவு',
        'Frequency': 'அதிர்வெண்',
        'Duration': 'காலம்',
        'Timing': 'நேரம்',
        'Instructions': 'வழிமுறைகள்',
        'After meals': 'உணவுக்குப் பிறகு',
        'Before meals': 'உணவுக்கு முன்',
        'At night': 'இரவில்',
      },
      te: {
        'Medicines': 'మందులు',
        'Dosage': 'మోతాదు',
        'Frequency': 'పౌనఃపున్యం',
        'Duration': 'వ్యవధి',
        'Timing': 'సమయం',
        'Instructions': 'సూచనలు',
      },
      kn: {
        'Medicines': 'ಔಷಧಿಗಳು',
        'Dosage': 'ಮೊತ್ತ',
        'Frequency': 'ಆವರ್ತನ',
        'Duration': 'ಅವಧಿ',
        'Timing': 'ಸಮಯ',
        'Instructions': 'ಸೂಚನೆಗಳು',
      },
      ml: {
        'Medicines': 'മരുന്നുകൾ',
        'Dosage': 'ഡോസേജ്',
        'Frequency': 'ആവൃത്തി',
        'Duration': 'കാലാവധി',
        'Timing': 'സമയം',
        'Instructions': 'നിർദ്ദേശങ്ങൾ',
      },
      mr: {
        'Medicines': 'औषधे',
        'Dosage': 'डोस',
        'Frequency': 'वारंवारता',
        'Duration': 'कालावधी',
        'Timing': 'वेळ',
        'Instructions': 'सूचना',
      },
      gu: {
        'Medicines': 'દવાઓ',
        'Dosage': 'ડોઝ',
        'Frequency': 'આવર્તન',
        'Duration': 'અવધિ',
        'Timing': 'સમય',
        'Instructions': 'સૂચનાઓ',
      },
      bn: {
        'Medicines': 'ওষুধ',
        'Dosage': 'ডোজ',
        'Frequency': 'ফ্রিকোয়েন্সি',
        'Duration': 'সময়কাল',
        'Timing': 'সময়',
        'Instructions': 'নির্দেশনা',
      },
      pa: {
        'Medicines': 'ਦਵਾਈਆਂ',
        'Dosage': 'ਖੁਰਾਕ',
        'Frequency': 'ਆਵਰਤਨ',
        'Duration': 'ਮਿਆਦ',
        'Timing': 'ਸਮਾਂ',
        'Instructions': 'ਨਿਰਦੇਸ਼',
      },
      ur: {
        'Medicines': 'دوائیں',
        'Dosage': 'خوراک',
        'Frequency': 'تعدد',
        'Duration': 'مدت',
        'Timing': 'وقت',
        'Instructions': 'ہدایات',
      },
      or: {
        'Medicines': 'ଔଷଧ',
        'Dosage': 'ଡୋଜ୍',
        'Frequency': 'ଆବୃତ୍ତି',
        'Duration': 'ଅବଧି',
        'Timing': 'ସମୟ',
        'Instructions': 'ନିର୍ଦ୍ଦେଶ',
      },
    };

    return translations[targetLang]?.[text] || text;
  };

  const getTranslatedContent = () => {
    if (!extractedData) return null;

    if (selectedLanguage === 'en') {
      return extractedData;
    }

    // Return translated version
    return {
      ...extractedData,
      medicines: extractedData.medicines.map((med) => ({
        ...med,
        frequency: translateText(med.frequency, selectedLanguage) || med.frequency,
        timing: translateText(med.timing, selectedLanguage) || med.timing,
        instructions: translateText(med.instructions, selectedLanguage) || med.instructions,
      })),
    };
  };

  const handleConfirm = () => {
    if (extractedData) {
      onConfirm(extractedData);
    }
  };

  const translatedData = getTranslatedContent();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Prescription Reader</Text>
        <TouchableOpacity onPress={() => setShowLanguageSelector(true)}>
          <Ionicons name="language" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {isProcessing ? (
        <View style={styles.processingContainer}>
          {/* Prescription Images Preview */}
          {prescriptionImages && prescriptionImages.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.imagePreviewContainer}
            >
              {prescriptionImages.map((image, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <View style={styles.imageNumberBadge}>
                    <Text style={styles.imageNumberText}>{index + 1}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* AI Processing Animation */}
          <Animated.View
            style={[
              styles.aiIconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.aiIconCircle}>
              <Ionicons name="sparkles" size={60} color="#007AFF" />
            </View>
          </Animated.View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>

          {/* Processing Steps */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Processing Steps</Text>
            {processingStepsList.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <View key={step.id} style={styles.stepItem}>
                  <View style={styles.stepIconContainer}>
                    {isCompleted ? (
                      <View style={[styles.stepIcon, styles.stepIconCompleted]}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    ) : (
                      <View style={[styles.stepIcon, isCurrent && styles.stepIconCurrent]}>
                        {isCurrent ? (
                          <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                          <Ionicons name={step.icon} size={16} color="#ccc" />
                        )}
                      </View>
                    )}
                    {index < processingStepsList.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          isCompleted && styles.stepLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepText,
                        isCompleted && styles.stepTextCompleted,
                        isCurrent && styles.stepTextCurrent,
                      ]}
                    >
                      {step.text}
                    </Text>
                    {isCurrent && (
                      <View style={styles.loadingDots}>
                        <View style={[styles.dot, styles.dot1]} />
                        <View style={[styles.dot, styles.dot2]} />
                        <View style={[styles.dot, styles.dot3]} />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Success Message */}
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color="#34c759" />
            </View>
            <Text style={styles.successTitle}>Prescription Analyzed Successfully!</Text>
            <Text style={styles.successSubtitle}>
              Found {extractedData?.medicines.length} medicines
            </Text>
          </View>

          {/* Prescription Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Doctor Name</Text>
                <Text style={styles.infoValue}>{translatedData?.doctorName}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Patient Name</Text>
                <Text style={styles.infoValue}>{translatedData?.patientName}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{translatedData?.date}</Text>
              </View>
            </View>
          </View>

          {/* Extracted Medicines */}
          <View style={styles.medicinesCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Extracted Medicines</Text>
              <View style={styles.medicineCount}>
                <Text style={styles.medicineCountText}>
                  {translatedData?.medicines.length} medicines found
                </Text>
              </View>
            </View>

            {translatedData?.medicines.map((medicine, index) => (
              <View key={index} style={styles.medicineItem}>
                <View style={styles.medicineHeader}>
                  <View style={styles.medicineNumber}>
                    <Text style={styles.medicineNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                </View>

                <View style={styles.medicineDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="flask" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Dosage:</Text>
                    <Text style={styles.detailValue}>{medicine.dosage}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Frequency:</Text>
                    <Text style={styles.detailValue}>{medicine.frequency}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{medicine.duration}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="alarm" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Timing:</Text>
                    <Text style={styles.detailValue}>{medicine.timing}</Text>
                  </View>
                  {medicine.instructions && (
                    <View style={styles.instructionsRow}>
                      <Ionicons name="information-circle" size={16} color="#ff9500" />
                      <Text style={styles.instructionsText}>{medicine.instructions}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Additional Notes */}
          {translatedData?.additionalNotes && (
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>Additional Notes</Text>
              <Text style={styles.notesText}>{translatedData.additionalNotes}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>Send to Pharmacies</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <View style={styles.languageModal}>
          <View style={styles.languageModalContent}>
            <View style={styles.languageModalHeader}>
              <Text style={styles.languageModalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageSelector(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {INDIAN_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    selectedLanguage === lang.code && styles.languageItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedLanguage(lang.code);
                    setShowLanguageSelector(false);
                  }}
                >
                  <Text style={styles.languageName}>{lang.native}</Text>
                  <Text style={styles.languageEnglish}>{lang.name}</Text>
                  {selectedLanguage === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  processingContainer: {
    flex: 1,
    padding: 20,
  },
  imagePreviewContainer: {
    marginBottom: 20,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  imageNumberBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  aiIconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  aiIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  stepsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconCompleted: {
    backgroundColor: '#34c759',
  },
  stepIconCurrent: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginTop: 5,
  },
  stepLineCompleted: {
    backgroundColor: '#34c759',
  },
  stepContent: {
    flex: 1,
    paddingTop: 5,
  },
  stepText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  stepTextCompleted: {
    color: '#34c759',
    fontWeight: '600',
  },
  stepTextCurrent: {
    color: '#007AFF',
    fontWeight: '700',
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  successCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#34c759',
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34c759',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  medicinesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  medicineCount: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  medicineCountText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  medicineItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medicineNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  medicineName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  medicineDetails: {
    marginLeft: 40,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  instructionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 10,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    gap: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: '#ff6f00',
    fontStyle: 'italic',
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  languageModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  languageItemSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  languageEnglish: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
});

export default PrescriptionReader;
