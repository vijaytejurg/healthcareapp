import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([
    {
      id: '1',
      user: { name: 'Dr. Sarah Johnson', avatar: '👩‍⚕️', verified: true },
      image: 'https://via.placeholder.com/400',
      caption: 'Tips for maintaining a healthy lifestyle! 💪',
      likes: 1234,
      comments: 89,
      time: '2h ago',
      type: 'post',
    },
    {
      id: '2',
      user: { name: 'Health Magazine', avatar: '📰', verified: true },
      title: 'Understanding Diabetes',
      content: 'Diabetes is a chronic condition that affects how your body processes blood sugar...',
      image: 'https://via.placeholder.com/400',
      likes: 567,
      comments: 34,
      time: '5h ago',
      type: 'article',
    },
    {
      id: '3',
      user: { name: 'Dr. Michael Chen', avatar: '👨‍⚕️', verified: true },
      image: 'https://via.placeholder.com/400',
      caption: 'Daily exercise routine for better health 🏃‍♂️',
      likes: 2341,
      comments: 156,
      time: '8h ago',
      type: 'post',
    },
  ]);

  const renderPost = ({ item }) => {
    if (item.type === 'article') {
      return (
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <Text style={styles.avatar}>{item.user.avatar}</Text>
              <View>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{item.user.name}</Text>
                  {item.user.verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
                  )}
                </View>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </View>
            <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
          </View>
          <Image source={{ uri: item.image }} style={styles.postImage} />
          <View style={styles.postContent}>
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text style={styles.articleContent}>{item.content}</Text>
          </View>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color="#000" />
              <Text style={styles.actionText}>{item.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#000" />
              <Text style={styles.actionText}>{item.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { marginLeft: 'auto' }]}>
              <Ionicons name="bookmark-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.avatar}>{item.user.avatar}</Text>
            <View>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{item.user.name}</Text>
                {item.user.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
                )}
              </View>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
          <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
        </View>
        <Image source={{ uri: item.image }} style={styles.postImage} />
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={24} color="#000" />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#000" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { marginLeft: 'auto' }]}>
            <Ionicons name="bookmark-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            <Text style={styles.captionUser}>{item.user.name} </Text>
            {item.caption}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'articles' && styles.activeTab]}
          onPress={() => setActiveTab('articles')}
        >
          <Text style={[styles.tabText, activeTab === 'articles' && styles.activeTabText]}>
            Articles
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 32,
    marginRight: 10,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postImage: {
    width: width,
    height: width,
    backgroundColor: '#f0f0f0',
  },
  postContent: {
    padding: 15,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  articleContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  captionContainer: {
    paddingHorizontal: 15,
  },
  caption: {
    fontSize: 14,
  },
  captionUser: {
    fontWeight: '600',
  },
});

export default HomeScreen;

