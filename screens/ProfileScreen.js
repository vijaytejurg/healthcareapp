import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useFocusEffect, useNavigationContainerRef } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { navigationRef } from '../utils/navigationRef';

const ProfileScreen = ({ navigation }) => {
  const { userData, userName, userEmail, role, signOut, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  
  const route = useRoute();
  
  // AGGRESSIVE check: Default to hiding custom UI unless we're CERTAIN we're not in MainTabs
  // This prevents duplicate bottom tab bars
  const checkIfInsideMainTabs = React.useCallback(() => {
    try {
      const parent = navigation.getParent();
      if (!parent) {
        // No parent = we're a standalone screen, show custom UI
        return false;
      }
      
      const parentState = parent.getState();
      if (!parentState || !parentState.routes) {
        // Can't determine - default to hiding custom UI to prevent duplicates
        return true;
      }
      
      const routeNames = parentState.routes.map(r => r.name);
      
      // MainTabs has exactly these 6 routes - definitive check
      const requiredRoutes = ['Home', 'Explore', 'Profile', 'Consult', 'Medicine', 'Donor'];
      const hasAllRoutes = requiredRoutes.every(routeName => routeNames.includes(routeName));
      const hasCorrectCount = routeNames.length === 6;
      
      // If we have all routes and correct count, we're definitely in MainTabs
      if (hasAllRoutes && hasCorrectCount) {
        return true;
      }
      
      // If we have at least 3 of the MainTabs routes, assume we're in MainTabs
      // This is safer to prevent duplicates
      const matchingRoutes = requiredRoutes.filter(routeName => routeNames.includes(routeName));
      if (matchingRoutes.length >= 3) {
        return true;
      }
      
      // If route name is 'Profile' and parent has any MainTabs routes, assume MainTabs
      if (route?.name === 'Profile' && (routeNames.includes('Home') || routeNames.includes('Explore'))) {
        return true;
      }
      
      // Only return false if we're absolutely certain we're NOT in MainTabs
      // (i.e., parent has completely different routes)
      return false;
    } catch (e) {
      console.error('❌ Error checking isInsideMainTabs:', e);
      // On error, default to TRUE (hide custom UI) to prevent duplicates
      return true;
    }
  }, [navigation, route?.name]);
  
  // IMMEDIATE check on every render - this is the primary source of truth
  // This runs synchronously before any async state updates
  const isInsideMainTabsNow = checkIfInsideMainTabs();
  
  // State to track if inside MainTabs - used as backup and for force updates
  const [isInsideMainTabsState, setIsInsideMainTabsState] = React.useState(isInsideMainTabsNow);
  
  // Update state immediately if check changed
  React.useEffect(() => {
    if (isInsideMainTabsNow !== isInsideMainTabsState) {
      setIsInsideMainTabsState(isInsideMainTabsNow);
      console.log('🔍 State sync: Updated to:', isInsideMainTabsNow);
    }
  }, [isInsideMainTabsNow, isInsideMainTabsState]);
  
  // Use the immediate check OR state - if either says we're in MainTabs, hide custom UI
  // This is safer: err on the side of hiding to prevent duplicates
  // FORCE to true if either check is true, or if we're uncertain
  const isInsideMainTabs = isInsideMainTabsNow || isInsideMainTabsState;
  
  // FINAL SAFEGUARD: If we're on Profile route and have a parent with multiple routes,
  // assume we're in MainTabs (better to hide than show duplicate)
  const finalCheck = (() => {
    if (isInsideMainTabs) return true;
    
    // Additional safety check
    try {
      const parent = navigation.getParent();
      if (parent && route?.name === 'Profile') {
        const parentState = parent.getState();
        if (parentState?.routes && parentState.routes.length > 1) {
          // If we have a parent with multiple routes and we're on Profile, likely in MainTabs
          return true;
        }
      }
    } catch (e) {
      // Ignore
    }
    
    return isInsideMainTabs;
  })();
  
  // Update on focus (when tab is clicked) - CRITICAL for catching tab switches
  useFocusEffect(
    useCallback(() => {
      const check = checkIfInsideMainTabs();
      setIsInsideMainTabsState(check);
      console.log('🔍 useFocusEffect: Tab focused, set to:', check);
    }, [checkIfInsideMainTabs])
  );
  
  // Update when route changes
  React.useEffect(() => {
    const check = checkIfInsideMainTabs();
    setIsInsideMainTabsState(check);
    console.log('🔍 Route effect: Updated to:', check);
  }, [checkIfInsideMainTabs, route?.key, route?.name]);
  
  // Listen to navigation state changes
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const check = checkIfInsideMainTabs();
      setIsInsideMainTabsState(check);
      console.log('🔍 Navigation listener: Updated to:', check);
    });
    
    return unsubscribe;
  }, [navigation, checkIfInsideMainTabs]);
  
  // Handle logout - SIMPLIFIED DIRECT LOGOUT
  const handleLogout = async () => {
    console.log('🚪🚪🚪 LOGOUT BUTTON CLICKED - Starting logout NOW');
    
    // Show confirmation but proceed immediately
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('❌ Logout cancelled by user')
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('✅ User confirmed logout - executing immediately...');
            executeLogout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Direct logout execution - WAIT for Firebase signOut to complete
  const executeLogout = async () => {
    console.log('🔄🔄🔄 EXECUTING LOGOUT - STARTING NOW');
    console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
    
    try {
      // For web: Sign out FIRST, then reload
      if (typeof window !== 'undefined') {
        console.log('🌐 Web platform detected');
        
        // CRITICAL: Sign out from Firebase FIRST and WAIT for it
        console.log('Step 1: Signing out from Firebase Auth (WAITING for completion)...');
        try {
          await signOut();
          console.log('✅ Step 1: Firebase signOut COMPLETED successfully');
        } catch (signOutError) {
          console.error('❌ Step 1: Firebase signOut FAILED:', signOutError);
          console.log('⚠️ Continuing anyway...');
        }
        
        // Step 2: Clear all storage
        console.log('Step 2: Clearing ALL browser storage...');
        try {
          // Clear Firebase-specific items
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('firebase') || key.includes('auth') || key.includes('user'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          localStorage.clear();
          sessionStorage.clear();
          console.log('✅ Step 2: All storage cleared');
        } catch (storageError) {
          console.warn('⚠️ Step 2: Storage clear warning:', storageError);
        }
        
        // Step 3: Wait a moment to ensure everything is cleared
        console.log('Step 3: Waiting 200ms for state to clear...');
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Step 4: FORCE RELOAD - this is critical
        console.log('Step 4: FORCING PAGE RELOAD NOW...');
        console.log('🔄 Using window.location.href = "/"');
        
        // Use the most reliable method
        window.location.href = window.location.origin + '/';
        
        // Backup: if that doesn't work, reload after 500ms
        setTimeout(() => {
          console.log('🔄 Backup: window.location.reload()');
          window.location.reload();
        }, 500);
        
      } else {
        // Native: Sign out and navigate
        console.log('📱 Native platform detected');
        
        try {
          await signOut();
          console.log('✅ SignOut successful');
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          if (navigationRef?.isReady()) {
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    } catch (error) {
      console.error('❌ CRITICAL LOGOUT ERROR:', error);
      console.error('Error stack:', error.stack);
      
      // Last resort: force reload
      if (typeof window !== 'undefined') {
        console.log('🔄 Last resort: window.location.reload()');
        window.location.reload();
      }
    }
  };
  
  // Mock saved collections data - In real app, this would come from shared state/context
  const savedCollections = [
    {
      id: '1',
      name: 'Health Tips',
      icon: '💡',
      color: '#FF6B6B',
      posts: [
        { id: '1', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400', caption: 'Stay hydrated! Drink at least 8 glasses of water daily 💧' },
        { id: '3', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', caption: 'Daily exercise routine for better health 🏃‍♂️' },
      ],
    },
    {
      id: '2',
      name: 'Recipes',
      icon: '🍎',
      color: '#4ECDC4',
      posts: [
        { id: '2', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', caption: 'Healthy breakfast ideas for energy' },
      ],
    },
    {
      id: '3',
      name: 'Workouts',
      icon: '💪',
      color: '#45B7D1',
      posts: [],
    },
    {
      id: '4',
      name: 'Mental Health',
      icon: '🧘',
      color: '#96CEB4',
      posts: [
        { id: '4', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', caption: 'Mental health matters! Practice mindfulness daily 🧘‍♀️' },
      ],
    },
  ];

  // Get user data from AuthContext
  const user = {
    name: userName || 'User',
    username: `@${userEmail?.split('@')[0] || 'user'}`,
    email: userEmail || '',
    role: role || 'patient',
    avatar: '👤',
    bio: userData?.bio || `Healthcare ${role || 'user'}`,
    posts: userData?.stats?.postsCount || 0,
    followers: userData?.stats?.followersCount || 0,
    following: userData?.stats?.followingCount || 0,
    verified: userData?.verificationStatus === 'verified',
    isDoctor: role === 'doctor',
    specialty: userData?.specialization || '',
    experience: userData?.experience || '',
  };

  const posts = [
    { id: '1', image: 'https://via.placeholder.com/300', likes: 234, comments: 12 },
    { id: '2', image: 'https://via.placeholder.com/300', likes: 567, comments: 34 },
    { id: '3', image: 'https://via.placeholder.com/300', likes: 123, comments: 8 },
    { id: '4', image: 'https://via.placeholder.com/300', likes: 890, comments: 45 },
    { id: '5', image: 'https://via.placeholder.com/300', likes: 345, comments: 23 },
    { id: '6', image: 'https://via.placeholder.com/300', likes: 678, comments: 56 },
  ];

  const reels = [
    { id: '1', image: 'https://via.placeholder.com/300', views: 1234 },
    { id: '2', image: 'https://via.placeholder.com/300', views: 5678 },
    { id: '3', image: 'https://via.placeholder.com/300', views: 2345 },
  ];

  const articles = [
    {
      id: '1',
      title: 'Understanding Heart Health',
      image: 'https://via.placeholder.com/300',
      reads: 1234,
    },
    {
      id: '2',
      title: 'Daily Exercise Routine',
      image: 'https://via.placeholder.com/300',
      reads: 890,
    },
  ];

  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <View style={styles.overlay}>
        <Ionicons name="heart" size={16} color="#fff" />
        <Text style={styles.overlayText}>{item.likes || item.views || item.reads}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderReelItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <View style={styles.overlay}>
        <Ionicons name="play" size={16} color="#fff" />
        <Text style={styles.overlayText}>{item.views}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderArticleItem = ({ item }) => (
    <TouchableOpacity style={styles.articleCard}>
      <Image source={{ uri: item.image }} style={styles.articleImage} />
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle}>{item.title}</Text>
        <View style={styles.articleMeta}>
          <Ionicons name="eye" size={14} color="#666" />
          <Text style={styles.articleReads}>{item.reads} reads</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSavedCollection = ({ item: collection }) => (
    <View style={styles.collectionCard}>
      <View style={styles.collectionHeader}>
        <View style={[styles.collectionIconLarge, { backgroundColor: collection.color + '20' }]}>
          <Text style={styles.collectionIconEmoji}>{collection.icon}</Text>
        </View>
        <View style={styles.collectionInfo}>
          <Text style={styles.collectionTitle}>{collection.name}</Text>
          <Text style={styles.collectionCount}>{collection.posts.length} saved</Text>
        </View>
      </View>
      {collection.posts.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collectionPosts}>
          {collection.posts.map((post) => (
            <TouchableOpacity key={post.id} style={styles.savedPostItem}>
              <Image source={{ uri: post.image }} style={styles.savedPostImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyCollection}>
          <Text style={styles.emptyCollectionText}>No posts saved yet</Text>
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'posts') {
      return (
        <FlatList
          key={`posts-${activeTab}`}
          data={posts}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
        />
      );
    } else if (activeTab === 'reels') {
      return (
        <FlatList
          key={`reels-${activeTab}`}
          data={reels}
          renderItem={renderReelItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
        />
      );
    } else if (activeTab === 'articles') {
      return (
        <FlatList
          key={`articles-${activeTab}`}
          data={articles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      );
    } else if (activeTab === 'saved') {
      return (
        <FlatList
          key={`saved-${activeTab}`}
          data={savedCollections}
          renderItem={renderSavedCollection}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      );
    }
  };

  // Navigation helper function - handles navigation to tabs
  const navigateToTab = (tabName) => {
    try {
      console.log('🔄 Navigating to tab:', tabName);
      
      // Check if we're inside MainTabs navigator
      const parent = navigation.getParent();
      if (parent) {
        // If we're inside MainTabs, navigate within tabs
        console.log('📍 Inside MainTabs, navigating to:', tabName);
        navigation.navigate(tabName);
      } else {
        // If we're in Stack navigator, navigate to MainTabs with the tab
        console.log('📍 In Stack navigator, navigating to MainTabs ->', tabName);
        navigation.navigate('MainTabs', { screen: tabName });
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback: try using global navigation ref
      try {
        if (navigationRef?.isReady()) {
          navigationRef.navigate('MainTabs', { screen: tabName });
        } else {
          // Last resort: direct navigation
          navigation.navigate(tabName);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback navigation also failed:', fallbackError);
      }
    }
  };

  // Use React.useEffect to set header options when inside MainTabs
  React.useEffect(() => {
    if (isInsideMainTabs) {
      // Hide the default header title, but keep notification/message icons
      navigation.setOptions({
        headerTitle: '', // Hide title
        headerShown: true, // Keep header visible for icons
      });
    }
  }, [isInsideMainTabs, navigation]);

  // Use the final check - it runs on every render
  // This ensures we always hide custom UI when inside MainTabs
  const shouldHideCustomUI = finalCheck;
  
  // Debug log to verify the check is working
  console.log('🔍 ProfileScreen Render:', {
    isInsideMainTabsNow,
    isInsideMainTabsState,
    isInsideMainTabs,
    finalCheck,
    shouldHideCustomUI,
    willShowBottomTabBar: !shouldHideCustomUI,
    routeName: route?.name,
    routeKey: route?.key,
    parentRoutes: (() => {
      try {
        const parent = navigation.getParent();
        return parent?.getState()?.routes?.map(r => r.name) || [];
      } catch (e) {
        return [];
      }
    })(),
  });

  return (
    <View style={styles.container}>
      {/* Only show custom top header if NOT inside MainTabs */}
      {/* Removed notification and message icons - MainTabs header already provides them */}
      {!shouldHideCustomUI && (
        <View style={styles.topHeader}>
          <View style={styles.topHeaderLeft}>
            <Text style={styles.topHeaderTitle}>Profile</Text>
          </View>
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView 
        style={[styles.scrollContent, !shouldHideCustomUI && styles.scrollContentWithCustomHeader]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
        <View style={styles.profileHeader}>
          <Text style={styles.avatar}>{user.avatar}</Text>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.name}</Text>
              {user.verified && (
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              )}
            </View>
            <Text style={styles.username}>{user.username}</Text>
            {user.isDoctor && (
              <View style={styles.doctorBadge}>
                <Ionicons name="medical" size={14} color="#007AFF" />
                <Text style={styles.doctorText}>
                  {user.specialty} • {user.experience}
                </Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowEditModal(true)}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <Text style={styles.bio}>{user.bio}</Text>
        <View style={styles.stats}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{user.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          {role === 'doctor' && (
            <TouchableOpacity
              style={styles.doctorBoardButton}
              onPress={() => navigation.navigate('DoctorBoard')}
            >
              <Ionicons name="medical-outline" size={16} color="#007AFF" />
              <Text style={styles.doctorBoardButtonText}>Doctor Board</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Consult')}
          >
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Book Consultation</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              console.log('🔴🔴🔴 LOGOUT BUTTON PRESSED - Time:', new Date().toISOString());
              
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { 
                    text: 'Cancel', 
                    style: 'cancel',
                    onPress: () => console.log('❌ Logout cancelled')
                  },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                      console.log('✅ User clicked Logout in alert - calling executeLogout()');
                      executeLogout();
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color="#ff3b30" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
          
          {/* TEST BUTTON - Direct logout without alert for debugging */}
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: '#ff3b30', marginTop: 10, borderColor: '#ff3b30' }]}
            onPress={() => {
              console.log('🧪🧪🧪 TEST LOGOUT BUTTON PRESSED - Direct logout (no alert)');
              executeLogout();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={18} color="#fff" />
            <Text style={[styles.logoutButtonText, { color: '#fff' }]}>TEST LOGOUT (No Alert)</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Ionicons
            name="grid"
            size={20}
            color={activeTab === 'posts' ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reels' && styles.activeTab]}
          onPress={() => setActiveTab('reels')}
        >
          <Ionicons
            name="film"
            size={20}
            color={activeTab === 'reels' ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'articles' && styles.activeTab]}
          onPress={() => setActiveTab('articles')}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={activeTab === 'articles' ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Ionicons
            name="bookmark"
            size={20}
            color={activeTab === 'saved' ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>{renderContent()}</View>
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Name</Text>
                <TextInput style={styles.editInput} defaultValue={user.name} />
              </View>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Bio</Text>
                <TextInput
                  style={[styles.editInput, styles.bioInput]}
                  defaultValue={user.bio}
                  multiline
                  numberOfLines={4}
                />
              </View>
              <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      </ScrollView>

      {/* Only show custom bottom tab bar if NOT inside MainTabs */}
      {/* CRITICAL: This check runs on every render to prevent duplicate bottom tabs */}
      {/* FORCE HIDE if inside MainTabs - use null to completely remove from DOM */}
      {!shouldHideCustomUI ? (
        <View style={styles.bottomTabBar}>
          <TouchableOpacity
            style={styles.bottomTabItem}
            onPress={() => navigateToTab('Home')}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={24} color="#666" />
            <Text style={styles.bottomTabLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomTabItem}
            onPress={() => navigateToTab('Explore')}
            activeOpacity={0.7}
          >
            <Ionicons name="compass-outline" size={24} color="#666" />
            <Text style={styles.bottomTabLabel}>Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomTabItem}
            onPress={() => navigateToTab('Consult')}
            activeOpacity={0.7}
          >
            <Ionicons name="medical-outline" size={24} color="#666" />
            <Text style={styles.bottomTabLabel}>Consult</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomTabItem}
            onPress={() => navigateToTab('Medicine')}
            activeOpacity={0.7}
          >
            <Ionicons name="medkit-outline" size={24} color="#666" />
            <Text style={styles.bottomTabLabel}>Medicine</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomTabItem}
            onPress={() => navigateToTab('Donor')}
            activeOpacity={0.7}
          >
            <Ionicons name="water-outline" size={24} color="#666" />
            <Text style={styles.bottomTabLabel}>Donor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bottomTabItem, styles.bottomTabItemActive]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Ionicons name="person" size={24} color="#007AFF" />
            <Text style={[styles.bottomTabLabel, styles.bottomTabLabelActive]}>Profile</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Top Header Styles
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 1000,
    elevation: 5,
  },
  topHeaderLeft: {
    flex: 1,
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerIconButton: {
    padding: 5,
  },
  // Scrollable Content
  scrollContent: {
    flex: 1,
  },
  scrollContentWithCustomHeader: {
    // Additional padding when custom header is shown
  },
  header: {
    padding: 15,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  avatar: {
    fontSize: 70,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 5,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  doctorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  doctorText: {
    fontSize: 13,
    color: '#007AFF',
    marginLeft: 5,
    fontWeight: '600',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  actionButtons: {
    marginTop: 10,
    gap: 10,
  },
  doctorBoardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  doctorBoardButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3b30',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  content: {
    minHeight: 400,
    padding: 2,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '33%',
    aspectRatio: 1,
    marginBottom: 2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  overlay: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  overlayText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  articleImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 15,
  },
  articleContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleReads: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
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
  editField: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  collectionCard: {
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  collectionIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  collectionIconEmoji: {
    fontSize: 28,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 14,
    color: '#666',
  },
  collectionPosts: {
    marginTop: 10,
  },
  savedPostItem: {
    width: 120,
    height: 120,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  savedPostImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  emptyCollection: {
    padding: 30,
    alignItems: 'center',
  },
  emptyCollectionText: {
    fontSize: 14,
    color: '#999',
  },
  // Bottom Tab Bar Styles
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    zIndex: 1000,
    elevation: 5,
  },
  bottomTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 5,
  },
  bottomTabItemActive: {
    // Active state styling
  },
  bottomTabLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  bottomTabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ProfileScreen;

