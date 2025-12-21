# Firestore Query Examples
## Production-Ready Healthcare Social Platform

This document provides comprehensive query examples for the healthcare social platform, optimized for real-time feeds, pagination, and scalability.

---

## 📋 Table of Contents

1. [Posts Queries](#posts-queries)
2. [Reels Queries](#reels-queries)
3. [Feed Queries](#feed-queries)
4. [Chat Queries](#chat-queries)
5. [User Queries](#user-queries)
6. [Consultation Queries](#consultation-queries)

---

## 📸 Posts Queries

### Get Public Posts (Paginated)

```javascript
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase';

// Initial query - first page
const getPublicPosts = async (pageSize = 10) => {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  return {
    posts,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] // For pagination
  };
};

// Paginated query - next page
const getPublicPostsNextPage = async (lastDoc, pageSize = 10) => {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    startAfter(lastDoc),
    limit(pageSize)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Get Role-Restricted Posts

```javascript
// Get posts visible only to doctors
const getDoctorPosts = async (pageSize = 10) => {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('visibility', '==', 'role-restricted'),
    where('ownerRole', '==', 'doctor'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Get Posts by User

```javascript
// Get all posts by a specific user
const getUserPosts = async (userId, pageSize = 10) => {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Get Trending Posts (By Engagement)

```javascript
// Get posts sorted by likes (engagement)
const getTrendingPosts = async (pageSize = 10) => {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('visibility', '==', 'public'),
    orderBy('likesCount', 'desc'),
    orderBy('createdAt', 'desc'), // Secondary sort
    limit(pageSize)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Real-Time Posts Feed

```javascript
import { onSnapshot } from 'firebase/firestore';

// Real-time listener for public posts
const subscribeToPosts = (callback, pageSize = 10) => {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(posts);
  });
};
```

---

## 🎬 Reels Queries

### Get Public Reels (Paginated)

```javascript
const getPublicReels = async (pageSize = 10) => {
  const reelsRef = collection(db, 'reels');
  const q = query(
    reelsRef,
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Get Trending Reels (By Views)

```javascript
// Get reels sorted by views
const getTrendingReels = async (pageSize = 10) => {
  const reelsRef = collection(db, 'reels');
  const q = query(
    reelsRef,
    where('visibility', '==', 'public'),
    orderBy('viewsCount', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

---

## 📱 Feed Queries

### Combined Feed (Posts + Reels)

```javascript
// Get combined feed with posts and reels
// Note: Firestore doesn't support union queries, so fetch separately and merge
const getCombinedFeed = async (pageSize = 10) => {
  const postsRef = collection(db, 'posts');
  const reelsRef = collection(db, 'reels');
  
  // Fetch posts
  const postsQuery = query(
    postsRef,
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  // Fetch reels
  const reelsQuery = query(
    reelsRef,
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  const [postsSnapshot, reelsSnapshot] = await Promise.all([
    getDocs(postsQuery),
    getDocs(reelsQuery)
  ]);
  
  const posts = postsSnapshot.docs.map(doc => ({
    id: doc.id,
    type: 'post',
    ...doc.data()
  }));
  
  const reels = reelsSnapshot.docs.map(doc => ({
    id: doc.id,
    type: 'reel',
    ...doc.data()
  }));
  
  // Merge and sort by createdAt
  const feed = [...posts, ...reels].sort((a, b) => {
    return b.createdAt.toMillis() - a.createdAt.toMillis();
  });
  
  return feed.slice(0, pageSize);
};
```

### Personalized Feed (By Followed Users)

```javascript
// Get feed from followed users
// Requires a 'follows' collection: follows/{followerId}/following/{followedId}
const getPersonalizedFeed = async (userId, pageSize = 10) => {
  // First, get list of followed users
  const followsRef = collection(db, `follows/${userId}/following`);
  const followsSnapshot = await getDocs(followsRef);
  const followedUserIds = followsSnapshot.docs.map(doc => doc.id);
  
  if (followedUserIds.length === 0) {
    return [];
  }
  
  // Get posts from followed users (Firestore 'in' query limit is 10)
  // For more than 10 followed users, need to batch queries
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('ownerId', 'in', followedUserIds.slice(0, 10)), // Firestore limit
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

---

## 💬 Chat Queries

### Get User's Chats

```javascript
// Get all chats where user is a participant
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
// Real-time listener for chat messages
const subscribeToChatMessages = (chatId, callback) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const q = query(
    messagesRef,
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};
```

### Get Consultation Chat

```javascript
// Get chat linked to a consultation
const getConsultationChat = async (consultationId) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('chatType', '==', 'consultation'),
    where('consultationId', '==', consultationId),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  
  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data()
  };
};
```

---

## 👥 User Queries

### Get Doctors by Specialty

```javascript
// Get verified doctors by specialization
const getDoctorsBySpecialty = async (specialty) => {
  const doctorsRef = collection(db, 'users/doctors');
  const q = query(
    doctorsRef,
    where('specialization', '==', specialty),
    where('verified', '==', true),
    orderBy('rating', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Search Users

```javascript
// Search users by name (requires Algolia or similar for full-text search)
// For basic prefix search, use Firestore (limited)
const searchUsers = async (searchTerm, limitCount = 20) => {
  // Note: Firestore doesn't support full-text search natively
  // For production, use Algolia, Elasticsearch, or similar
  // This is a basic example using name prefix
  
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    orderBy('name'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  const allUsers = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Client-side filtering (not scalable, use search service for production)
  return allUsers.filter(user => 
    user.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  );
};
```

---

## 🏥 Consultation Queries

### Get Patient Consultations

```javascript
// Get all consultations for a patient
const getPatientConsultations = async (patientId) => {
  const consultationsRef = collection(db, 'consultations');
  const q = query(
    consultationsRef,
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Get Doctor Consultations

```javascript
// Get all consultations for a doctor
const getDoctorConsultations = async (doctorId) => {
  const consultationsRef = collection(db, 'consultations');
  const q = query(
    consultationsRef,
    where('doctorId', '==', doctorId),
    orderBy('scheduledAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

### Get Upcoming Consultations

```javascript
// Get upcoming consultations for a doctor
const getUpcomingConsultations = async (doctorId) => {
  const consultationsRef = collection(db, 'consultations');
  const now = new Date();
  const q = query(
    consultationsRef,
    where('doctorId', '==', doctorId),
    where('status', 'in', ['pending', 'accepted', 'in_progress']),
    where('scheduledAt', '>=', now),
    orderBy('scheduledAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

---

## 🔍 Advanced Queries

### Pagination Helper

```javascript
// Reusable pagination helper
class PaginationHelper {
  constructor(collectionName, queryConstraints = [], pageSize = 10) {
    this.collectionName = collectionName;
    this.queryConstraints = queryConstraints;
    this.pageSize = pageSize;
    this.lastDoc = null;
  }
  
  async getNextPage() {
    const ref = collection(db, this.collectionName);
    let q = query(ref, ...this.queryConstraints);
    
    if (this.lastDoc) {
      q = query(ref, ...this.queryConstraints, startAfter(this.lastDoc));
    }
    
    q = query(q, limit(this.pageSize));
    
    const snapshot = await getDocs(q);
    this.lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    
    return {
      data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      hasMore: snapshot.docs.length === this.pageSize,
      lastDoc: this.lastDoc
    };
  }
  
  reset() {
    this.lastDoc = null;
  }
}

// Usage
const postsPagination = new PaginationHelper(
  'posts',
  [
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc')
  ],
  10
);

const firstPage = await postsPagination.getNextPage();
const secondPage = await postsPagination.getNextPage();
```

---

## ⚡ Performance Tips

1. **Use Indexes**: Create composite indexes for all queries with multiple `where` and `orderBy` clauses
2. **Limit Results**: Always use `limit()` to prevent large data transfers
3. **Pagination**: Implement cursor-based pagination for large datasets
4. **Denormalization**: Use denormalized counts (likesCount, commentsCount) instead of counting subcollections
5. **Real-time Listeners**: Use `onSnapshot` for real-time updates, but unsubscribe when not needed
6. **Batch Operations**: Use `batch()` for multiple writes to reduce costs
7. **Caching**: Cache frequently accessed data on the client side

---

## 📊 Query Costs

- **Read**: 1 document read = 1 read operation
- **Write**: 1 document write = 1 write operation
- **Real-time Listener**: Initial read + 1 read per document change
- **Composite Query**: Multiple reads if indexes are not set up

**Optimization**:
- Use pagination to limit reads
- Cache data on client
- Use denormalized counts
- Set up proper indexes

