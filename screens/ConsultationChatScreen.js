import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const ConsultationChatScreen = ({ route, navigation }) => {
  const { doctor, user, notification } = route.params || {};
  const chatUser = doctor || user || {
    name: 'Dr. Sarah Johnson',
    avatar: '👩‍⚕️',
    verified: true,
    specialty: 'Cardiology',
  };

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'other',
      time: '10:00 AM',
      type: 'text',
    },
    {
      id: '2',
      text: 'I have been experiencing chest pain for the past few days.',
      sender: 'me',
      time: '10:05 AM',
      type: 'text',
    },
    {
      id: '3',
      text: 'I understand. Can you describe the pain in more detail?',
      sender: 'other',
      time: '10:06 AM',
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerTitle}
          onPress={() => navigation.navigate('DoctorProfile', { doctor: chatUser })}
        >
          <Text style={styles.headerAvatar}>{chatUser.avatar}</Text>
          <View>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName}>{chatUser.name}</Text>
              {chatUser.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
              )}
            </View>
            <Text style={styles.headerStatus}>
              {chatUser.specialty || 'Online'}
            </Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, chatUser]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'me',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: 'text',
      };
      setMessages([...messages, newMessage]);
      setInputText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newMessage = {
        id: Date.now().toString(),
        image: result.assets[0].uri,
        sender: 'me',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: 'image',
      };
      setMessages([...messages, newMessage]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const newMessage = {
        id: Date.now().toString(),
        document: result.assets[0].name,
        sender: 'me',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: 'document',
      };
      setMessages([...messages, newMessage]);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      Alert.alert('Video', 'Video attachment feature');
    }
  };

  const showAttachmentOptions = () => {
    Alert.alert(
      'Attach File',
      'Choose an option',
      [
        { text: 'Photo', onPress: pickImage },
        { text: 'Document/PDF', onPress: pickDocument },
        { text: 'Video', onPress: pickVideo },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderMessage = ({ item }) => {
    if (item.type === 'image') {
      return (
        <View
          style={[
            styles.messageContainer,
            item.sender === 'me' ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Image source={{ uri: item.image }} style={styles.messageImage} />
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
      );
    }

    if (item.type === 'document') {
      return (
        <View
          style={[
            styles.messageContainer,
            item.sender === 'me' ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <View style={styles.documentContainer}>
            <Ionicons name="document" size={24} color="#007AFF" />
            <Text style={styles.documentName}>{item.document}</Text>
          </View>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.sender === 'me' ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.sender === 'me' ? styles.myMessageText : styles.otherMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text style={styles.messageTime}>{item.time}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.consultationBanner}>
        <Ionicons name="medical" size={20} color="#007AFF" />
        <Text style={styles.bannerText}>
          Consultation Session - Share your symptoms, reports, and concerns
        </Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={showAttachmentOptions}
        >
          <Ionicons name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() ? '#007AFF' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  consultationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bannerText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    fontSize: 32,
    marginRight: 10,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    maxWidth: '75%',
    marginBottom: 15,
    padding: 12,
    borderRadius: 18,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 5,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  documentName: {
    marginLeft: 10,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachButton: {
    marginRight: 10,
    marginBottom: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    marginBottom: 5,
  },
});

export default ConsultationChatScreen;

