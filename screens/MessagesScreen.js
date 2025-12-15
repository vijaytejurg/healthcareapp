import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MessagesScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');

  const allMessages = [
    {
      id: '1',
      type: 'consultation',
      name: 'Dr. Sarah Johnson',
      avatar: '👩‍⚕️',
      lastMessage: 'Thank you for the consultation. Take care!',
      time: '2h ago',
      unread: 2,
      verified: true,
    },
    {
      id: '2',
      type: 'normal',
      name: 'John Smith',
      avatar: '👨',
      lastMessage: 'Hey, are you available for blood donation?',
      time: '5h ago',
      unread: 0,
      verified: false,
    },
    {
      id: '3',
      type: 'consultation',
      name: 'Dr. Michael Chen',
      avatar: '👨‍⚕️',
      lastMessage: 'Please share your recent test reports',
      time: '1d ago',
      unread: 1,
      verified: true,
    },
    {
      id: '4',
      type: 'normal',
      name: 'Sarah Davis',
      avatar: '👩',
      lastMessage: 'Thanks for the help!',
      time: '2d ago',
      unread: 0,
      verified: false,
    },
    {
      id: '5',
      type: 'donor',
      name: 'Mike Wilson',
      avatar: '👨',
      lastMessage: 'I can help with blood donation',
      time: '3d ago',
      unread: 0,
      verified: false,
    },
  ];

  const consultationMessages = allMessages.filter((msg) => msg.type === 'consultation');
  const normalMessages = allMessages.filter((msg) => msg.type === 'normal' || msg.type === 'donor');

  const filteredMessages =
    activeTab === 'all'
      ? allMessages
      : activeTab === 'consultation'
      ? consultationMessages
      : normalMessages;

  const handleMessagePress = (message) => {
    if (message.type === 'consultation') {
      navigation.navigate('ConsultationChat', { user: message });
    } else {
      navigation.navigate('Chat', { user: message });
    }
  };

  const renderMessage = ({ item }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => handleMessagePress(item)}
    >
      <Text style={styles.avatar}>{item.avatar}</Text>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
            )}
            {item.type === 'consultation' && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>Consultation</Text>
              </View>
            )}
          </View>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.lastMessage,
              item.unread > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#999"
        />
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'consultation' && styles.activeTab]}
          onPress={() => setActiveTab('consultation')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'consultation' && styles.activeTabText,
            ]}
          >
            Consultation
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'normal' && styles.activeTab]}
          onPress={() => setActiveTab('normal')}
        >
          <Text
            style={[styles.tabText, activeTab === 'normal' && styles.activeTabText]}
          >
            Normal
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredMessages}
        renderItem={renderMessage}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  messageItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    fontSize: 40,
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  typeBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 5,
  },
  typeBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#000',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 10,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default MessagesScreen;

