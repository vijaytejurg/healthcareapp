import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Dummy articles data
const allArticles = [
  {
    id: '1',
    title: '10 Superfoods for Immunity',
    category: 'Nutrition',
    fileType: 'pdf',
    author: 'Dr. Sarah Johnson',
    date: '2024-01-15',
    views: 1234,
    description: 'Discover the top 10 superfoods that can boost your immune system naturally. Learn about their nutritional benefits and how to incorporate them into your daily diet.',
    content: 'Superfoods are nutrient-rich foods that are especially beneficial for health and well-being. This comprehensive guide covers the top 10 superfoods including blueberries, spinach, salmon, and more...',
  },
  {
    id: '2',
    title: 'Yoga for Beginners: Complete Guide',
    category: 'Fitness',
    fileType: 'docx',
    author: 'Dr. Michael Chen',
    date: '2024-01-12',
    views: 890,
    description: 'A beginner-friendly guide to starting your yoga journey. Includes basic poses, breathing techniques, and tips for maintaining a consistent practice.',
    content: 'Yoga is an ancient practice that combines physical postures, breathing exercises, and meditation. This guide will help you start your yoga journey with confidence...',
  },
  {
    id: '3',
    title: 'Sleep Hygiene Tips for Better Rest',
    category: 'Wellness',
    fileType: 'pdf',
    author: 'Dr. Emily Watson',
    date: '2024-01-10',
    views: 1567,
    description: 'Learn essential sleep hygiene practices to improve your sleep quality and overall health. Includes tips on creating the perfect sleep environment.',
    content: 'Good sleep hygiene is crucial for maintaining physical and mental health. This article provides evidence-based tips for improving your sleep quality...',
  },
  {
    id: '4',
    title: 'Mental Health Awareness and Support',
    category: 'Mental Health',
    fileType: 'xlsx',
    author: 'Dr. James Anderson',
    date: '2024-01-08',
    views: 2341,
    description: 'Understanding mental health, recognizing signs of mental health issues, and knowing when and how to seek help. A comprehensive resource guide.',
    content: 'Mental health is as important as physical health. This comprehensive guide covers various aspects of mental health awareness and provides resources for support...',
  },
  {
    id: '5',
    title: 'Cardiovascular Health: Prevention Guide',
    category: 'Cardiology',
    fileType: 'pdf',
    author: 'Dr. Robert Martinez',
    date: '2024-01-05',
    views: 987,
    description: 'Essential information about maintaining heart health, preventing cardiovascular diseases, and recognizing warning signs.',
    content: 'Cardiovascular health is vital for overall well-being. This guide covers risk factors, prevention strategies, and lifestyle modifications for heart health...',
  },
  {
    id: '6',
    title: 'Diabetes Management: Daily Practices',
    category: 'Endocrinology',
    fileType: 'docx',
    author: 'Dr. Lisa Thompson',
    date: '2024-01-03',
    views: 1456,
    description: 'Practical daily management strategies for people living with diabetes. Includes diet, exercise, and medication management tips.',
    content: 'Effective diabetes management requires a comprehensive approach. This article provides practical tips for daily diabetes care including blood sugar monitoring...',
  },
  {
    id: '7',
    title: 'Pediatric Care: Common Childhood Illnesses',
    category: 'Pediatrics',
    fileType: 'pdf',
    author: 'Dr. Maria Garcia',
    date: '2024-01-01',
    views: 2100,
    description: 'A parent\'s guide to recognizing and managing common childhood illnesses. When to see a doctor and home care tips.',
    content: 'Understanding common childhood illnesses helps parents provide better care. This guide covers symptoms, treatment options, and when to seek medical attention...',
  },
  {
    id: '8',
    title: 'Dermatology: Skin Care Essentials',
    category: 'Dermatology',
    fileType: 'pdf',
    author: 'Dr. David Kim',
    date: '2023-12-28',
    views: 1789,
    description: 'Essential skin care practices for healthy, glowing skin. Includes information about different skin types and recommended routines.',
    content: 'Proper skin care is essential for maintaining healthy skin. This comprehensive guide covers skincare routines, product selection, and common skin concerns...',
  },
  {
    id: '9',
    title: 'Orthopedic Health: Joint Care',
    category: 'Orthopedics',
    fileType: 'xlsx',
    author: 'Dr. Jennifer Lee',
    date: '2023-12-25',
    views: 1123,
    description: 'Maintaining joint health and preventing orthopedic issues. Exercises and lifestyle modifications for better joint function.',
    content: 'Joint health is crucial for mobility and quality of life. This article provides exercises and lifestyle tips for maintaining healthy joints...',
  },
  {
    id: '10',
    title: 'Women\'s Health: Reproductive Wellness',
    category: 'Gynecology',
    fileType: 'pdf',
    author: 'Dr. Amanda White',
    date: '2023-12-22',
    views: 1890,
    description: 'Comprehensive guide to women\'s reproductive health, including menstrual health, fertility, and preventive care.',
    content: 'Women\'s reproductive health requires special attention throughout different life stages. This guide covers various aspects of reproductive wellness...',
  },
  {
    id: '11',
    title: 'Neurology: Understanding Headaches',
    category: 'Neurology',
    fileType: 'docx',
    author: 'Dr. Christopher Brown',
    date: '2023-12-20',
    views: 1345,
    description: 'Different types of headaches, their causes, and treatment options. When to seek medical attention for headaches.',
    content: 'Headaches are one of the most common neurological complaints. This article helps you understand different types of headaches and their management...',
  },
  {
    id: '12',
    title: 'Oncology: Cancer Prevention Strategies',
    category: 'Oncology',
    fileType: 'pdf',
    author: 'Dr. Patricia Davis',
    date: '2023-12-18',
    views: 2567,
    description: 'Evidence-based strategies for cancer prevention. Lifestyle modifications and screening recommendations.',
    content: 'Cancer prevention involves multiple strategies including lifestyle modifications and regular screening. This comprehensive guide covers prevention strategies...',
  },
  {
    id: '13',
    title: 'Gastroenterology: Digestive Health',
    category: 'Gastroenterology',
    fileType: 'pdf',
    author: 'Dr. Mark Wilson',
    date: '2023-12-15',
    views: 1456,
    description: 'Maintaining digestive health through diet and lifestyle. Common digestive issues and their management.',
    content: 'Digestive health is fundamental to overall well-being. This article covers dietary recommendations and lifestyle practices for optimal digestive function...',
  },
  {
    id: '14',
    title: 'Pulmonology: Respiratory Health',
    category: 'Pulmonology',
    fileType: 'docx',
    author: 'Dr. Susan Taylor',
    date: '2023-12-12',
    views: 1234,
    description: 'Maintaining healthy lungs and respiratory system. Tips for people with respiratory conditions.',
    content: 'Respiratory health is essential for overall wellness. This guide provides information about maintaining lung health and managing respiratory conditions...',
  },
  {
    id: '15',
    title: 'Urology: Urinary Tract Health',
    category: 'Urology',
    fileType: 'pdf',
    author: 'Dr. Kevin Moore',
    date: '2023-12-10',
    views: 987,
    description: 'Preventing urinary tract infections and maintaining urinary system health. When to see a urologist.',
    content: 'Urinary tract health is important for overall well-being. This article covers prevention strategies and when to seek medical attention...',
  },
  {
    id: '16',
    title: 'Ophthalmology: Eye Care Essentials',
    category: 'Ophthalmology',
    fileType: 'pdf',
    author: 'Dr. Rachel Green',
    date: '2023-12-08',
    views: 1678,
    description: 'Protecting your vision and maintaining eye health. Common eye conditions and preventive measures.',
    content: 'Eye health is crucial for maintaining quality of life. This guide covers eye care practices and common eye conditions...',
  },
  {
    id: '17',
    title: 'ENT: Ear, Nose, and Throat Health',
    category: 'ENT',
    fileType: 'xlsx',
    author: 'Dr. Thomas Harris',
    date: '2023-12-05',
    views: 1123,
    description: 'Maintaining health of the ear, nose, and throat. Common ENT issues and their management.',
    content: 'ENT health affects many aspects of daily life. This article provides information about maintaining ear, nose, and throat health...',
  },
  {
    id: '18',
    title: 'Rheumatology: Arthritis Management',
    category: 'Rheumatology',
    fileType: 'pdf',
    author: 'Dr. Nancy Clark',
    date: '2023-12-03',
    views: 1456,
    description: 'Living with arthritis: pain management, exercise, and lifestyle modifications for better quality of life.',
    content: 'Arthritis management requires a comprehensive approach. This guide covers treatment options, exercise recommendations, and lifestyle modifications...',
  },
  {
    id: '19',
    title: 'Geriatrics: Healthy Aging',
    category: 'Geriatrics',
    fileType: 'docx',
    author: 'Dr. Frank Miller',
    date: '2023-12-01',
    views: 1890,
    description: 'Promoting healthy aging through lifestyle choices, preventive care, and maintaining independence.',
    content: 'Healthy aging involves multiple factors. This comprehensive guide covers strategies for maintaining health and independence as we age...',
  },
  {
    id: '20',
    title: 'Emergency Medicine: First Aid Basics',
    category: 'Emergency Medicine',
    fileType: 'pdf',
    author: 'Dr. Laura Adams',
    date: '2023-11-28',
    views: 2345,
    description: 'Essential first aid knowledge for common emergencies. When to call for emergency medical help.',
    content: 'First aid knowledge can save lives. This article covers essential first aid techniques for common emergencies...',
  },
];

const categories = [
  'All',
  'Nutrition',
  'Fitness',
  'Wellness',
  'Mental Health',
  'Cardiology',
  'Endocrinology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Gynecology',
  'Neurology',
  'Oncology',
  'Gastroenterology',
  'Pulmonology',
  'Urology',
  'Ophthalmology',
  'ENT',
  'Rheumatology',
  'Geriatrics',
  'Emergency Medicine',
];

const ArticlesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const filteredArticles = useMemo(() => {
    let filtered = allArticles;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((article) => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return 'document-text';
      case 'docx':
      case 'doc':
        return 'document';
      case 'xlsx':
      case 'xls':
        return 'grid';
      case 'pptx':
      case 'ppt':
        return 'easel';
      default:
        return 'document-text';
    }
  };

  const getFileColor = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return '#ff3b30';
      case 'docx':
      case 'doc':
        return '#007AFF';
      case 'xlsx':
      case 'xls':
        return '#34c759';
      case 'pptx':
      case 'ppt':
        return '#ff9500';
      default:
        return '#666';
    }
  };

  const handleArticlePress = (article) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
  };

  const handleShare = async (article) => {
    try {
      const result = await Share.share({
        message: `Check out this health article: ${article.title}\n\n${article.description}\n\nRead more in the Healthcare App.`,
        title: article.title,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Shared successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share article');
    }
  };

  const handleDownload = (article) => {
    setSelectedArticle(article);
    setShowDownloadModal(true);
  };

  const confirmDownload = async () => {
    setDownloading(true);
    setShowDownloadModal(false);

    // Simulate download
    setTimeout(() => {
      setDownloading(false);
      Alert.alert(
        'Download Complete',
        `${selectedArticle.title} has been downloaded successfully.`,
        [{ text: 'OK' }]
      );
      setSelectedArticle(null);
    }, 2000);
  };

  const renderArticle = ({ item }) => {
    const fileIcon = getFileIcon(item.fileType);
    const fileColor = getFileColor(item.fileType);

    return (
      <TouchableOpacity
        style={styles.articleCard}
        onPress={() => handleArticlePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.articleCardHeader}>
          <View style={[styles.fileIconContainer, { backgroundColor: fileColor + '20' }]}>
            <Ionicons name={fileIcon} size={22} color={fileColor} />
          </View>
          <View style={styles.articleCardInfo}>
            <Text style={styles.articleCategory}>{item.category}</Text>
            <Text style={styles.articleTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.articleMeta}>
              <Text style={styles.articleAuthor}>{item.author}</Text>
              <Text style={styles.articleDate}> • {item.date}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.articleDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.articleFooter}>
          <View style={styles.articleStats}>
            <Ionicons name="eye-outline" size={12} color="#666" />
            <Text style={styles.articleViews}>{item.views.toLocaleString()} views</Text>
          </View>
          <View style={styles.articleActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(item)}
            >
              <Ionicons name="share-outline" size={16} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDownload(item)}
            >
              <Ionicons name="download-outline" size={16} color="#34c759" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Articles</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryContent}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Articles List */}
      <FlatList
        data={filteredArticles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No articles found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />

      {/* Article View Modal */}
      <Modal
        visible={showArticleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowArticleModal(false);
          setSelectedArticle(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Article Details</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowArticleModal(false);
                  setSelectedArticle(null);
                }}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            {selectedArticle && (
              <ScrollView style={styles.articleContent} showsVerticalScrollIndicator={false}>
                <View style={styles.articleHeader}>
                  <View
                    style={[
                      styles.fileIconLarge,
                      { backgroundColor: getFileColor(selectedArticle.fileType) + '20' },
                    ]}
                  >
                    <Ionicons
                      name={getFileIcon(selectedArticle.fileType)}
                      size={40}
                      color={getFileColor(selectedArticle.fileType)}
                    />
                  </View>
                  <View style={styles.articleInfo}>
                    <Text style={styles.articleCategoryLarge}>{selectedArticle.category}</Text>
                    <Text style={styles.articleTitleLarge}>{selectedArticle.title}</Text>
                    <View style={styles.articleMetaLarge}>
                      <Text style={styles.articleAuthorLarge}>{selectedArticle.author}</Text>
                      <Text style={styles.articleDateLarge}> • {selectedArticle.date}</Text>
                    </View>
                    <View style={styles.articleStatsLarge}>
                      <Ionicons name="eye-outline" size={16} color="#666" />
                      <Text style={styles.articleViewsLarge}>
                        {selectedArticle.views.toLocaleString()} views
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.articleDescriptionLarge}>{selectedArticle.description}</Text>
                <Text style={styles.articleContentText}>{selectedArticle.content}</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.shareButton]}
                    onPress={() => handleShare(selectedArticle)}
                  >
                    <Ionicons name="share-outline" size={20} color="#fff" />
                    <Text style={styles.modalActionText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.downloadButton]}
                    onPress={() => {
                      setShowArticleModal(false);
                      handleDownload(selectedArticle);
                    }}
                  >
                    <Ionicons name="download-outline" size={20} color="#fff" />
                    <Text style={styles.modalActionText}>Download</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Download Confirmation Modal */}
      <Modal
        visible={showDownloadModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDownloadModal(false);
          setSelectedArticle(null);
        }}
      >
        <View style={styles.downloadModalOverlay}>
          <View style={styles.downloadModalContent}>
            <Ionicons name="download-outline" size={48} color="#34c759" />
            <Text style={styles.downloadModalTitle}>Download Article</Text>
            {selectedArticle && (
              <Text style={styles.downloadModalText}>
                Do you want to download "{selectedArticle.title}"?
              </Text>
            )}
            <View style={styles.downloadModalActions}>
              <TouchableOpacity
                style={[styles.downloadModalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDownloadModal(false);
                  setSelectedArticle(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.downloadModalButton, styles.confirmButton]}
                onPress={confirmDownload}
              >
                {downloading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Download</Text>
                )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerRight: {
    width: 34,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 5,
  },
  categoryContainer: {
    marginBottom: 8,
    paddingHorizontal: 15,
  },
  categoryContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginRight: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 12,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  articleCardHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  articleCardInfo: {
    flex: 1,
  },
  articleCategory: {
    fontSize: 9,
    color: '#007AFF',
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    lineHeight: 18,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleAuthor: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  articleDate: {
    fontSize: 11,
    color: '#999',
  },
  articleDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  articleStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleViews: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  articleActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    padding: 20,
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
    color: '#000',
  },
  articleContent: {
    flex: 1,
  },
  articleHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  fileIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  articleInfo: {
    flex: 1,
  },
  articleCategoryLarge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  articleTitleLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    lineHeight: 28,
  },
  articleMetaLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  articleAuthorLarge: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  articleDateLarge: {
    fontSize: 14,
    color: '#999',
  },
  articleStatsLarge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleViewsLarge: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  articleDescriptionLarge: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  articleContentText: {
    fontSize: 15,
    color: '#000',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  shareButton: {
    backgroundColor: '#007AFF',
  },
  downloadButton: {
    backgroundColor: '#34c759',
  },
  modalActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  downloadModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    alignItems: 'center',
  },
  downloadModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 12,
  },
  downloadModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  downloadModalActions: {
    flexDirection: 'row',
    width: '100%',
  },
  downloadModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#34c759',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ArticlesScreen;

