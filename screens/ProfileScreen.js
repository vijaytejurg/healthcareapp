import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  
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

  const user = {
    name: 'Your Name',
    username: '@username',
    avatar: '👤',
    bio: 'Healthcare enthusiast | Doctor | Helping people live healthier lives',
    posts: 156,
    followers: 1234,
    following: 567,
    verified: true,
    isDoctor: true,
    specialty: 'Cardiology',
    experience: '10 years',
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
          data={articles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      );
    } else if (activeTab === 'saved') {
      return (
        <FlatList
          data={savedCollections}
          renderItem={renderSavedCollection}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Consult')}
          >
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Book Consultation</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
});

export default ProfileScreen;

