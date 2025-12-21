# Secure Chat System Documentation
## Doctor-Patient Restricted Chat Architecture

This document describes the secure, real-time chat system for the healthcare platform, supporting private conversations between patients, doctors, ambulance drivers, and delivery partners.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Firestore Structure](#firestore-structure)
3. [Chat Types](#chat-types)
4. [Security Rules](#security-rules)
5. [Implementation Examples](#implementation-examples)
6. [Real-Time Features](#real-time-features)

---

## 🏗️ Architecture Overview

The chat system is designed with the following principles:

1. **Security First**: Only chat participants can read/write messages
2. **Immutability**: Messages cannot be edited or deleted after send
3. **Real-Time**: Uses Firestore real-time listeners for instant updates
4. **Scalability**: Supports millions of messages with efficient queries
5. **Medical Compliance**: Consultation chats are linked to medical records

---

## 📊 Firestore Structure

### Chat Document: `chats/{chatId}`

```javascript
{
  // Participants (immutable after creation)
  participants: ['userId1', 'userId2'],  // Array of user IDs (2-10 participants)
  
  // Role mapping for each participant
  roles: {
    'userId1': 'patient',
    'userId2': 'doctor'
  },
  
  // Chat type determines access rules
  chatType: 'consultation' | 'normal' | 'ambulance' | 'delivery',
  
  // Link to consultation (if chatType is 'consultation')
  consultationId: string | null,
  
  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Last message info (for chat list)
  lastMessage: string | null,           // Preview of last message
  lastMessageTime: timestamp | null,
  lastMessageSenderId: string | null,
  
  // Status
  isActive: boolean,
  
  // Optional: Chat title/name
  title: string | null,
}
```

### Message Document: `chats/{chatId}/messages/{messageId}`

```javascript
{
  // Sender info (immutable)
  senderId: string,                     // User ID who sent (must match auth.uid)
  
  // Message content
  text: string,                          // Message text
  type: 'text' | 'image' | 'video' | 'file' | 'prescription',
  
  // Media/file attachments
  mediaURL: string | null,               // URL if type is media/file
  fileName: string | null,               // Original filename
  fileSize: number | null,               // File size in bytes
  mimeType: string | null,               // MIME type for files
  
  // Timestamp (immutable)
  createdAt: timestamp,                  // Message timestamp (validated on create)
  
  // Delivery status
  readBy: ['userId1'],                   // Array of user IDs who read
  deliveredTo: ['userId1', 'userId2'],   // Array of user IDs who received
  
  // Optional: Reply to another message
  replyTo: string | null,                // messageId of replied message
  
  // Optional: Message reactions
  reactions: {
    'userId1': '👍',                     // User ID -> emoji
    'userId2': '❤️'
  },
}
```

**Key Points**:
- Messages are **IMMUTABLE** after creation (no edit/delete)
- `senderId` must match `request.auth.uid` (prevents impersonation)
- `createdAt` is validated to be `request.time` (prevents timestamp manipulation)

---

## 💬 Chat Types

### 1. Consultation Chat (`chatType: 'consultation'`)

**Purpose**: Private chat between patient and doctor during consultation

**Participants**: 
- Patient (1)
- Doctor (1)

**Rules**:
- Linked to a `consultation` document via `consultationId`
- Only accessible during active consultation
- Messages are part of medical record (cannot be deleted)
- Supports prescription sharing

**Creation**:
```javascript
// Created automatically when consultation is accepted
const createConsultationChat = async (consultationId, patientId, doctorId) => {
  const chatsRef = collection(db, 'chats');
  const chatData = {
    participants: [patientId, doctorId],
    roles: {
      [patientId]: 'patient',
      [doctorId]: 'doctor'
    },
    chatType: 'consultation',
    consultationId: consultationId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
  };
  
  const docRef = await addDoc(chatsRef, chatData);
  return docRef.id;
};
```

### 2. Normal Chat (`chatType: 'normal'`)

**Purpose**: General chat between any users

**Participants**: 2-10 users

**Rules**:
- Any authenticated users can create
- All participants can read/write
- No medical data restrictions

### 3. Ambulance Chat (`chatType: 'ambulance'`)

**Purpose**: Emergency communication between patient and ambulance driver

**Participants**:
- Patient (1)
- Ambulance Driver (1)

**Rules**:
- Created when ambulance is dispatched
- High priority (notifications)
- Location sharing enabled

### 4. Delivery Chat (`chatType: 'delivery'`)

**Purpose**: Communication between patient and delivery partner

**Participants**:
- Patient (1)
- Delivery Partner (1)

**Rules**:
- Created when order is assigned
- Order tracking updates
- Delivery confirmation

---

## 🔒 Security Rules

### Chat Document Rules

```javascript
match /chats/{chatId} {
  // Only participants can read
  allow read: if request.auth != null 
    && request.auth.uid in resource.data.participants;
  
  // Only authenticated users can create
  // Must be a participant
  allow create: if request.auth != null
    && request.auth.uid in request.resource.data.participants
    && request.resource.data.participants.size() >= 2
    && request.resource.data.participants.size() <= 10;
  
  // Only participants can update
  // Participants array is immutable
  allow update: if request.auth != null 
    && request.auth.uid in resource.data.participants
    && request.resource.data.participants == resource.data.participants;
  
  // No deletions (chat history must be preserved)
  allow delete: if false;
}
```

### Message Rules

```javascript
match /chats/{chatId}/messages/{messageId} {
  // Only participants can read
  allow read: if request.auth != null 
    && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
  
  // Only participants can create
  // Sender must match auth.uid (prevents impersonation)
  // Timestamp must be current time (prevents manipulation)
  allow create: if request.auth != null 
    && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants
    && request.resource.data.senderId == request.auth.uid
    && request.resource.data.createdAt == request.time;
  
  // Messages are IMMUTABLE (no edit/delete)
  allow update: if false;
  allow delete: if false;
}
```

---

## 💻 Implementation Examples

### Create Chat

```javascript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/firebase';

const createChat = async (participantIds, chatType, consultationId = null) => {
  const chatsRef = collection(db, 'chats');
  
  // Get user roles
  const roles = {};
  for (const userId of participantIds) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    roles[userId] = userDoc.data().role;
  }
  
  const chatData = {
    participants: participantIds,
    roles: roles,
    chatType: chatType,
    consultationId: consultationId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: null,
    lastMessageTime: null,
    lastMessageSenderId: null,
    isActive: true,
  };
  
  const docRef = await addDoc(chatsRef, chatData);
  return docRef.id;
};
```

### Send Message

```javascript
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const sendMessage = async (chatId, text, type = 'text', mediaURL = null) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const chatRef = doc(db, 'chats', chatId);
  
  // Get chat to get participants
  const chatDoc = await getDoc(chatRef);
  const participants = chatDoc.data().participants;
  
  // Create message
  const messageData = {
    senderId: auth.currentUser.uid,
    text: text,
    type: type,
    mediaURL: mediaURL,
    createdAt: serverTimestamp(),
    readBy: [auth.currentUser.uid], // Sender has read their own message
    deliveredTo: participants, // All participants receive it
  };
  
  const messageRef = await addDoc(messagesRef, messageData);
  
  // Update chat's last message info
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: auth.currentUser.uid,
    updatedAt: serverTimestamp(),
  });
  
  return messageRef.id;
};
```

### Get User's Chats

```javascript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const getUserChats = async (userId) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Real-Time Chat Messages

```javascript
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const subscribeToChatMessages = (chatId, callback) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

// Usage
const unsubscribe = subscribeToChatMessages(chatId, (messages) => {
  console.log('New messages:', messages);
  // Update UI
});

// Cleanup
// unsubscribe();
```

### Mark Message as Read

```javascript
const markMessageAsRead = async (chatId, messageId, userId) => {
  const messageRef = doc(db, `chats/${chatId}/messages/${messageId}`);
  const messageDoc = await getDoc(messageRef);
  
  const currentReadBy = messageDoc.data().readBy || [];
  if (!currentReadBy.includes(userId)) {
    await updateDoc(messageRef, {
      readBy: [...currentReadBy, userId]
    });
  }
};
```

### Get Unread Message Count

```javascript
const getUnreadCount = async (chatId, userId) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const q = query(
    messagesRef,
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  let unreadCount = 0;
  
  snapshot.docs.forEach(doc => {
    const message = doc.data();
    if (message.senderId !== userId && !message.readBy?.includes(userId)) {
      unreadCount++;
    }
  });
  
  return unreadCount;
};
```

---

## 🔔 Real-Time Features

### Real-Time Chat List

```javascript
// Listen to user's chat list in real-time
const subscribeToUserChats = (userId, callback) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(chats);
  });
};
```

### Typing Indicators

```javascript
// Store typing status in chat document
const setTypingStatus = async (chatId, userId, isTyping) => {
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    [`typing.${userId}`]: isTyping ? serverTimestamp() : null
  });
};

// Listen to typing status
const subscribeToTypingStatus = (chatId, callback) => {
  const chatRef = doc(db, 'chats', chatId);
  return onSnapshot(chatRef, (doc) => {
    const typing = doc.data().typing || {};
    callback(typing);
  });
};
```

---

## 📊 Performance Optimization

1. **Pagination**: Use `limit()` and `startAfter()` for message history
2. **Indexes**: Create index on `chats` collection: `participants (array) + lastMessageTime (desc)`
3. **Caching**: Cache chat list and recent messages on client
4. **Lazy Loading**: Load older messages on scroll
5. **Batch Reads**: Use `getDocs()` for multiple documents

---

## 🔐 Security Best Practices

1. **Impersonation Prevention**: Always validate `senderId == auth.uid`
2. **Timestamp Validation**: Validate `createdAt == request.time`
3. **Participant Validation**: Check user is in participants array
4. **Message Immutability**: Never allow updates/deletes
5. **Medical Records**: Consultation chats are part of medical records

---

## 📈 Scalability Considerations

- **Message Limit**: Consider archiving old messages (> 6 months) to separate collection
- **Chat Limit**: Limit participants to 10 per chat
- **Real-Time Listeners**: Unsubscribe when not needed to reduce costs
- **Batch Operations**: Use transactions for critical operations
- **Offline Support**: Firestore SDK handles offline automatically

---

## 🚀 Future Enhancements

1. **Message Reactions**: Add emoji reactions to messages
2. **Message Forwarding**: Allow forwarding messages (with restrictions)
3. **Voice Messages**: Support audio message type
4. **Group Chats**: Support group consultations (multiple doctors)
5. **Message Search**: Implement full-text search for messages
6. **Message Encryption**: End-to-end encryption for sensitive medical chats

