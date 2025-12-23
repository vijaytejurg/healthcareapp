import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  RefreshControl,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const BANNER_HEIGHT = (height || 600) * 0.35;
const QUICK_ACTION_SIZE = 70;

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [postLikes, setPostLikes] = useState({});
  const [postComments, setPostComments] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState(null);
  const [collections, setCollections] = useState([
    { id: '1', name: 'Health Tips', icon: '💡', color: '#FF6B6B' },
    { id: '2', name: 'Recipes', icon: '🍎', color: '#4ECDC4' },
    { id: '3', name: 'Workouts', icon: '💪', color: '#45B7D1' },
    { id: '4', name: 'Mental Health', icon: '🧘', color: '#96CEB4' },
  ]);
  const [savedPostsData, setSavedPostsData] = useState({}); // { postId: { collectionId: true } }
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const scrollViewRef = useRef(null);
  const bannerScrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const banners = [
    {
      id: '1',
      title: 'Book Any Hospital Nearby',
      subtitle: 'Find & book hospitals instantly',
      description: 'Real-time availability, token booking, and instant confirmation',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
      route: 'HospitalBooking',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      id: '2',
      title: 'Call an Ambulance',
      subtitle: 'Emergency medical assistance',
      description: 'Get instant ambulance service with live tracking',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
      route: 'Ambulance',
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      id: '3',
      title: 'Medicine Delivery',
      subtitle: 'Order medicines online',
      description: 'Fast delivery from nearby pharmacies',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
      route: 'Medicine',
      gradient: ['#4facfe', '#00f2fe'],
    },
    {
      id: '4',
      title: 'Online Consultation',
      subtitle: 'Consult doctors online',
      description: 'Video consultations with certified doctors',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      route: 'Consult',
      gradient: ['#43e97b', '#38f9d7'],
    },
    {
      id: '5',
      title: 'Blood Donor',
      subtitle: 'Find blood donors nearby',
      description: 'Connect with verified blood donors instantly',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      route: 'Donor',
      gradient: ['#fa709a', '#fee140'],
    },
  ];

  const quickActions = [
    { id: '1', icon: '🏥', label: 'Hospital', route: 'HospitalBooking', color: '#667eea' },
    { id: '2', icon: '🚑', label: 'Ambulance', route: 'Ambulance', color: '#f5576c' },
    { id: '3', icon: '💊', label: 'Medicine', route: 'Medicine', color: '#4facfe' },
    { id: '4', icon: '🩸', label: 'Donor', route: 'Donor', color: '#fa709a' },
    { id: '5', icon: '👨‍⚕️', label: 'Consult', route: 'Consult', color: '#43e97b' },
  ];

  const horizontalSections = [
    {
      id: 'trending',
      title: 'Trending Health Articles',
      data: [
        {
          id: '1',
          title: '10 Superfoods for Immunity',
          fileType: 'pdf',
          category: 'Nutrition',
        },
        {
          id: '2',
          title: 'Yoga for Beginners',
          fileType: 'docx',
          category: 'Fitness',
        },
        {
          id: '3',
          title: 'Sleep Hygiene Tips',
          fileType: 'pdf',
          category: 'Wellness',
        },
        {
          id: '4',
          title: 'Mental Health Awareness',
          fileType: 'xlsx',
          category: 'Mental Health',
        },
        {
          id: '5',
          title: 'Cardiovascular Health Guide',
          fileType: 'pdf',
          category: 'Cardiology',
        },
        {
          id: '6',
          title: 'Diabetes Management',
          fileType: 'docx',
          category: 'Endocrinology',
        },
      ],
    },
  ];

  const feedPosts = [
    {
      id: '1',
      user: { name: 'Dr. Sarah Johnson', avatar: '👩‍⚕️', verified: true },
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
      caption: 'Stay hydrated! Drink at least 8 glasses of water daily 💧 #HealthTips',
      likes: 1234,
      comments: 89,
      time: '2h ago',
      type: 'tip',
    },
    {
      id: '2',
      user: { name: 'Health Alert', avatar: '🚨', verified: true },
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
      caption: '⚠️ Emergency: Blood donors urgently needed for O+ blood group. Please help!',
      likes: 567,
      comments: 34,
      time: '5h ago',
      type: 'alert',
    },
    {
      id: '3',
      user: { name: 'Dr. Michael Chen', avatar: '👨‍⚕️', verified: true },
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      caption: 'Daily exercise routine for better health 🏃‍♂️ Start with 30 minutes of walking!',
      likes: 2341,
      comments: 156,
      time: '8h ago',
      type: 'tip',
    },
    {
      id: '4',
      user: { name: 'Wellness Guide', avatar: '🧘', verified: true },
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      caption: 'Mental health matters! Practice mindfulness and meditation daily 🧘‍♀️',
      likes: 890,
      comments: 67,
      time: '12h ago',
      type: 'tip',
    },
    {
      id: '5',
      user: { name: 'Apollo Hospitals', avatar: '🏥', verified: true },
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
      caption: 'New cardiology department now open! Book your consultation today.',
      likes: 456,
      comments: 23,
      time: '1d ago',
      type: 'highlight',
    },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Auto-scroll banner
    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const next = (prev + 1) % banners.length;
        if (bannerScrollRef.current) {
          bannerScrollRef.current.scrollTo({
            x: next * width,
            animated: true,
          });
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(bannerInterval);
  }, [banners.length]);

  useEffect(() => {
    Animated.timing(bannerAnim, {
      toValue: currentBannerIndex,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentBannerIndex]);

  const handleLike = (postId) => {
    const isLiked = likedPosts.has(postId);
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        // Decrease like count
        setPostLikes((prevLikes) => ({
          ...prevLikes,
          [postId]: (prevLikes[postId] || 0) - 1,
        }));
      } else {
        newSet.add(postId);
        // Increase like count
        setPostLikes((prevLikes) => ({
          ...prevLikes,
          [postId]: (prevLikes[postId] || 0) + 1,
        }));
      }
      return newSet;
    });
  };

  const handleComment = (postId) => {
    setSelectedPostId(postId);
    setShowCommentModal(true);
  };

  const submitComment = () => {
    if (commentText.trim()) {
      setPostComments((prev) => ({
        ...prev,
        [selectedPostId]: (prev[selectedPostId] || 0) + 1,
      }));
      setCommentText('');
      setShowCommentModal(false);
      setSelectedPostId(null);
    }
  };

  const handleShare = async (postId) => {
    // Simulate sharing functionality
    const post = feedPosts.find((p) => p.id === postId);
    if (post) {
      // In a real app, this would use the Share API
      if (Platform.OS === 'web') {
        if (navigator.share) {
          try {
            await navigator.share({
              title: post.user.name,
              text: post.caption,
              url: window.location.href,
            });
          } catch (error) {
            console.log('Share cancelled');
          }
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(`${post.user.name}: ${post.caption}`);
          alert('Post link copied to clipboard!');
        }
      }
    }
  };

  const handleSave = (postId) => {
    setPostToSave(postId);
    setShowSaveModal(true);
  };

  const saveToCollection = (collectionId) => {
    if (!postToSave) return;
    
    setSavedPostsData((prev) => {
      const newData = { ...prev };
      if (!newData[postToSave]) {
        newData[postToSave] = {};
      }
      
      // Toggle save in collection
      if (newData[postToSave][collectionId]) {
        delete newData[postToSave][collectionId];
        // If no collections left, remove from saved
        if (Object.keys(newData[postToSave]).length === 0) {
          delete newData[postToSave];
          setSavedPosts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(postToSave);
            return newSet;
          });
        }
      } else {
        newData[postToSave][collectionId] = true;
        setSavedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.add(postToSave);
          return newSet;
        });
      }
      return newData;
    });
    
    setShowSaveModal(false);
    setPostToSave(null);
  };

  const createNewCollection = () => {
    if (newCollectionName.trim()) {
      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName.trim(),
        icon: '📁',
        color: '#007AFF',
      };
      setCollections((prev) => [...prev, newCollection]);
      setNewCollectionName('');
      setShowNewCollectionInput(false);
    }
  };

  const renderBanner = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.bannerTouchable}
        onPress={() => navigation && navigation.navigate(item.route)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.bannerImage} />
        <View style={styles.bannerOverlay}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            <Text style={styles.bannerDescription}>{item.description}</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Explore Now</Text>
              <View style={{ marginLeft: 8 }}>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={() => navigation.navigate(item.route)}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.quickActionEmoji}>{item.icon}</Text>
      </View>
      <Text style={styles.quickActionLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

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
        return '#ff3b30'; // Red for PDF
      case 'docx':
      case 'doc':
        return '#007AFF'; // Blue for Word
      case 'xlsx':
      case 'xls':
        return '#34c759'; // Green for Excel
      case 'pptx':
      case 'ppt':
        return '#ff9500'; // Orange for PowerPoint
      default:
        return '#666';
    }
  };

  const renderHorizontalCard = ({ item }, sectionId) => {
    if (sectionId === 'trending') {
      const fileIcon = getFileIcon(item.fileType);
      const fileColor = getFileColor(item.fileType);
      return (
        <TouchableOpacity style={styles.articleCard}>
          <View style={styles.articleCardContent}>
            <View style={[styles.articleFileIcon, { backgroundColor: fileColor + '20' }]}>
              <Ionicons name={fileIcon} size={24} color={fileColor} />
            </View>
            <View style={styles.articleCardInfo}>
              <Text style={styles.articleCardCategory}>{item.category}</Text>
              <Text style={styles.articleCardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.articleFileType}>{item.fileType?.toUpperCase()}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else if (sectionId === 'hospitals') {
      return (
        <TouchableOpacity
          style={styles.horizontalCard}
          onPress={() => navigation.navigate('HospitalBooking')}
        >
          <Image source={{ uri: item.image }} style={styles.horizontalCardImage} />
          <View style={styles.horizontalCardOverlay}>
            <View style={styles.hospitalRating}>
              <Ionicons name="star" size={14} color="#ffc107" />
              <Text style={styles.hospitalRatingText}>{item.rating}</Text>
            </View>
            <Text style={styles.horizontalCardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.hospitalDistance}>{item.distance}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (sectionId === 'ambulances') {
      return (
        <TouchableOpacity
          style={styles.horizontalCard}
          onPress={() => navigation.navigate('Ambulance')}
        >
          <Image source={{ uri: item.image }} style={styles.horizontalCardImage} />
          <View style={styles.horizontalCardOverlay}>
            <View style={styles.ambulanceType}>
              <Text style={styles.ambulanceTypeText}>{item.type}</Text>
            </View>
            <Text style={styles.ambulanceETA}>ETA: {item.eta}</Text>
            <Text style={styles.ambulanceDistance}>{item.distance}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.horizontalCard}
          onPress={() => navigation.navigate('Donor')}
        >
          <Image source={{ uri: item.image }} style={styles.horizontalCardImage} />
          <View style={styles.horizontalCardOverlay}>
            <View style={styles.bloodGroupBadge}>
              <Text style={styles.bloodGroupText}>{item.bloodGroup}</Text>
            </View>
            <Text style={styles.donorDistance}>{item.distance}</Text>
            {item.available && (
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Available</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }
  };

  const renderFeedPost = ({ item }) => {
    const isLiked = likedPosts.has(item.id);
    const isSaved = savedPosts.has(item.id);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const currentLikes = postLikes[item.id] !== undefined ? postLikes[item.id] : item.likes;
    const currentComments = postComments[item.id] !== undefined ? postComments[item.id] : item.comments;

    const handleLikePress = () => {
      handleLike(item.id);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return (
      <View style={styles.feedPost}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.avatar}>{item.user.avatar}</Text>
            <View>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{item.user.name}</Text>
                {item.user.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#007AFF" style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleSave(item.id)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />

        <View style={styles.postActions}>
          <View style={styles.postActionsLeft}>
            <TouchableOpacity 
              onPress={handleLikePress} 
              activeOpacity={0.7}
              style={[styles.actionButton, styles.likeButton, isLiked && styles.likeButtonActive]}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isLiked ? '#fff' : '#ff3040'}
                />
              </Animated.View>
              <Text style={[styles.actionButtonText, isLiked && styles.actionButtonTextActive]}>
                Like
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleComment(item.id)}
              activeOpacity={0.7}
              style={[styles.actionButton, styles.commentButton]}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
              <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>Comment</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleShare(item.id)}
              activeOpacity={0.7}
              style={[styles.actionButton, styles.shareButton]}
            >
              <Ionicons name="paper-plane-outline" size={20} color="#34c759" />
              <Text style={[styles.actionButtonText, { color: '#34c759' }]}>Share</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => handleSave(item.id)}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isSaved ? '#007AFF' : '#000'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.postLikes}>
          <Text style={styles.likesText}>
            {currentLikes.toLocaleString()} {currentLikes === 1 ? 'like' : 'likes'}
          </Text>
        </View>

        <View style={styles.postCaption}>
          <Text style={styles.caption}>
            <Text style={styles.captionUser}>{item.user.name} </Text>
            {item.caption}
          </Text>
        </View>

        {currentComments > 0 && (
          <TouchableOpacity onPress={() => handleComment(item.id)}>
            <Text style={styles.viewComments}>
              View all {currentComments} {currentComments === 1 ? 'comment' : 'comments'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentBannerIndex(index);
            }}
          >
            {banners.map((item, index) => (
              <View key={item.id} style={styles.bannerSlide}>
                {renderBanner({ item, index })}
              </View>
            ))}
          </ScrollView>
          <View style={styles.bannerIndicators}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentBannerIndex === index && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsList}>
            {quickActions.map((item) => (
              <View key={item.id} style={{ marginRight: 15 }}>
                {renderQuickAction({ item })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Horizontal Scroll Sections */}
        {horizontalSections.map((section) => (
          <View key={section.id} style={styles.horizontalSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Articles')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {section.data.map((item) => (
                <View key={item.id}>
                  {renderHorizontalCard({ item }, section.id)}
                </View>
              ))}
            </ScrollView>
          </View>
        ))}

        {/* Instagram-Style Feed */}
        <View style={styles.feedContainer}>
          {feedPosts.map((item) => (
            <View key={item.id}>
              {renderFeedPost({ item })}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCommentModal(false);
          setCommentText('');
          setSelectedPostId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add a Comment</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCommentModal(false);
                  setCommentText('');
                  setSelectedPostId(null);
                }}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor="#999"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              autoFocus
            />
            <TouchableOpacity
              style={[styles.submitButton, !commentText.trim() && styles.submitButtonDisabled]}
              onPress={submitComment}
              disabled={!commentText.trim()}
            >
              <Text style={[styles.submitButtonText, !commentText.trim() && styles.submitButtonTextDisabled]}>
                Post Comment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Save to Collection Modal */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowSaveModal(false);
          setPostToSave(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save to Collection</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSaveModal(false);
                  setPostToSave(null);
                }}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.collectionsList}>
              {collections.map((collection) => {
                const isSaved = postToSave && savedPostsData[postToSave]?.[collection.id];
                return (
                  <TouchableOpacity
                    key={collection.id}
                    style={styles.collectionItem}
                    onPress={() => saveToCollection(collection.id)}
                  >
                    <View style={[styles.collectionIcon, { backgroundColor: collection.color + '20' }]}>
                      <Text style={styles.collectionIconEmoji}>{collection.icon}</Text>
                    </View>
                    <Text style={styles.collectionName}>{collection.name}</Text>
                    {isSaved && (
                      <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                );
              })}
              
              {showNewCollectionInput ? (
                <View style={styles.newCollectionInput}>
                  <TextInput
                    style={styles.collectionNameInput}
                    placeholder="Collection name"
                    placeholderTextColor="#999"
                    value={newCollectionName}
                    onChangeText={setNewCollectionName}
                    autoFocus
                  />
                  <View style={styles.newCollectionActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowNewCollectionInput(false);
                        setNewCollectionName('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.createButton, !newCollectionName.trim() && styles.createButtonDisabled]}
                      onPress={createNewCollection}
                      disabled={!newCollectionName.trim()}
                    >
                      <Text style={[styles.createButtonText, !newCollectionName.trim() && styles.createButtonTextDisabled]}>
                        Create
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addCollectionButton}
                  onPress={() => setShowNewCollectionInput(true)}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                  <Text style={styles.addCollectionText}>Create New Collection</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bannerContainer: {
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  bannerSlide: {
    width: width,
    height: BANNER_HEIGHT,
  },
  bannerTouchable: {
    width: '100%',
    height: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerContent: {
    maxWidth: '90%',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    opacity: 0.9,
  },
  bannerDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 16,
    opacity: 0.8,
    lineHeight: 20,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bannerIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  quickActionsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderBottomWidth: 0,
  },
  quickActionsList: {
    paddingHorizontal: 15,
    paddingRight: 15,
  },
  quickAction: {
    alignItems: 'center',
    width: QUICK_ACTION_SIZE,
  },
  quickActionIcon: {
    width: QUICK_ACTION_SIZE,
    height: QUICK_ACTION_SIZE,
    borderRadius: QUICK_ACTION_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 32,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  horizontalSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 15,
  },
  horizontalCard: {
    width: width * 0.32,
    height: width * 0.4,
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  horizontalCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  horizontalCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
  horizontalCardCategory: {
    fontSize: 9,
    color: '#007AFF',
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  horizontalCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 16,
  },
  articleCard: {
    width: width * 0.5,
    marginRight: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  articleCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  articleFileIcon: {
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
  articleCardCategory: {
    fontSize: 8,
    color: '#007AFF',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  articleCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    lineHeight: 14,
    marginBottom: 4,
  },
  articleFileType: {
    fontSize: 8,
    color: '#666',
    fontWeight: '500',
  },
  hospitalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  hospitalRatingText: {
    fontSize: 12,
    color: '#ffc107',
    fontWeight: '700',
  },
  hospitalDistance: {
    fontSize: 11,
    color: '#fff',
    marginTop: 4,
    opacity: 0.8,
  },
  ambulanceType: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  ambulanceTypeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  ambulanceETA: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  ambulanceDistance: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.8,
  },
  bloodGroupBadge: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  bloodGroupText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  donorDistance: {
    fontSize: 11,
    color: '#fff',
    marginBottom: 4,
    opacity: 0.8,
  },
  availableBadge: {
    backgroundColor: '#34c759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  availableText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  feedContainer: {
    backgroundColor: '#fff',
    marginTop: 0,
  },
  feedPost: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderBottomWidth: 0,
    paddingBottom: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 28,
    marginRight: 10,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  time: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  postImage: {
    width: width,
    height: width * 0.5,
    backgroundColor: '#f0f0f0',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  postActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    marginRight: 6,
  },
  likeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff3040',
  },
  likeButtonActive: {
    backgroundColor: '#ff3040',
    borderColor: '#ff3040',
  },
  commentButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  shareButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#34c759',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    color: '#000',
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  postLikes: {
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  likesText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  postCaption: {
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  caption: {
    fontSize: 13,
    color: '#000',
    lineHeight: 18,
  },
  captionUser: {
    fontWeight: '700',
  },
  viewComments: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 12,
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
    color: '#000',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    minHeight: 100,
    maxHeight: 200,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  collectionsList: {
    maxHeight: 400,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  collectionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  collectionIconEmoji: {
    fontSize: 24,
  },
  collectionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  addCollectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  addCollectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 10,
  },
  newCollectionInput: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  collectionNameInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  newCollectionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  createButtonTextDisabled: {
    color: '#999',
  },
});

export default HomeScreen;
