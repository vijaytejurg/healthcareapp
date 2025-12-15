import React, { useState } from 'react';
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
const itemWidth = (width - 4) / 3;

const ExploreScreen = () => {
  const [activeTab, setActiveTab] = useState('all');

  const allContent = [
    { id: '1', type: 'post', image: 'https://via.placeholder.com/300', likes: 1234 },
    { id: '2', type: 'reel', image: 'https://via.placeholder.com/300', views: 5678 },
    { id: '3', type: 'article', image: 'https://via.placeholder.com/300', reads: 890 },
    { id: '4', type: 'post', image: 'https://via.placeholder.com/300', likes: 2341 },
    { id: '5', type: 'reel', image: 'https://via.placeholder.com/300', views: 1234 },
    { id: '6', type: 'post', image: 'https://via.placeholder.com/300', likes: 567 },
  ];

  const reels = allContent.filter((item) => item.type === 'reel');
  const posts = allContent.filter((item) => item.type === 'post');
  const articles = allContent.filter((item) => item.type === 'article');

  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <View style={styles.overlay}>
        {item.type === 'reel' && (
          <>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.overlayText}>{item.views}</Text>
          </>
        )}
        {item.type === 'post' && (
          <>
            <Ionicons name="heart" size={20} color="#fff" />
            <Text style={styles.overlayText}>{item.likes}</Text>
          </>
        )}
        {item.type === 'article' && (
          <>
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.overlayText}>{item.reads}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderReelItem = ({ item }) => (
    <View style={styles.reelContainer}>
      <Image source={{ uri: item.image }} style={styles.reelImage} />
      <View style={styles.reelOverlay}>
        <View style={styles.reelInfo}>
          <Ionicons name="play" size={24} color="#fff" />
          <Text style={styles.reelViews}>{item.views}</Text>
        </View>
      </View>
    </View>
  );

  const renderArticleItem = ({ item }) => (
    <TouchableOpacity style={styles.articleCard}>
      <Image source={{ uri: item.image }} style={styles.articleImage} />
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle}>Health Article Title</Text>
        <Text style={styles.articleExcerpt}>
          Brief description of the article content...
        </Text>
        <View style={styles.articleMeta}>
          <Ionicons name="eye" size={16} color="#666" />
          <Text style={styles.articleReads}>{item.reads} reads</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (activeTab === 'all') {
      return (
        <FlatList
          data={allContent}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      );
    } else if (activeTab === 'reels') {
      return (
        <FlatList
          data={reels}
          renderItem={renderReelItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      );
    } else if (activeTab === 'posts') {
      return (
        <FlatList
          data={posts}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      );
    } else if (activeTab === 'articles') {
      return (
        <FlatList
          data={articles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articlesList}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reels' && styles.activeTab]}
            onPress={() => setActiveTab('reels')}
          >
            <Text style={[styles.tabText, activeTab === 'reels' && styles.activeTabText]}>
              Reels
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
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
        </ScrollView>
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
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
  row: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: itemWidth,
    height: itemWidth,
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
  reelContainer: {
    width: (width - 6) / 2,
    height: 300,
    marginBottom: 2,
  },
  reelImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  reelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
  },
  reelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reelViews: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '600',
  },
  articlesList: {
    padding: 10,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleImage: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  articleContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  articleExcerpt: {
    fontSize: 13,
    color: '#666',
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
});

export default ExploreScreen;

