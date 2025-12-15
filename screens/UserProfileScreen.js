import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserProfileScreen = ({ route, navigation }) => {
  const { user } = route.params || {
    user: {
      name: 'John Smith',
      username: '@johnsmith',
      avatar: '👨',
      bio: 'Healthcare enthusiast',
      verified: false,
      followers: 234,
      following: 567,
      posts: 45,
    },
  };

  const [isFollowing, setIsFollowing] = useState(false);

  const posts = [
    { id: '1', image: 'https://via.placeholder.com/300', likes: 234 },
    { id: '2', image: 'https://via.placeholder.com/300', likes: 567 },
    { id: '3', image: 'https://via.placeholder.com/300', likes: 123 },
  ];

  const renderPost = ({ item }) => (
    <TouchableOpacity style={styles.postItem}>
      <View style={styles.postImage}>
        <View style={styles.overlay}>
          <Ionicons name="heart" size={16} color="#fff" />
          <Text style={styles.overlayText}>{item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileSection}>
        <Text style={styles.avatar}>{user.avatar}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
          {user.verified && (
            <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
          )}
        </View>
        <Text style={styles.username}>{user.username}</Text>
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
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followingButton,
          ]}
          onPress={() => setIsFollowing(!isFollowing)}
        >
          <Text
            style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText,
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>Posts</Text>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.postRow}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    fontSize: 80,
    marginBottom: 15,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
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
  followButton: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#e0e0e0',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  followingButtonText: {
    color: '#666',
  },
  postsSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  postRow: {
    justifyContent: 'space-between',
  },
  postItem: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
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
});

export default UserProfileScreen;

