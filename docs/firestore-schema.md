# Firestore Schema Documentation
## Production-Ready Healthcare Social Platform

This document defines the complete Firestore schema for the healthcare social platform with role-based access control and medical data protection.

---

## 📋 Table of Contents

1. [Users Collection](#users-collection)
2. [Posts Collection](#posts-collection)
3. [Reels Collection](#reels-collection)
4. [Chats & Messages](#chats--messages)
5. [Consultations](#consultations)
6. [Medical Records](#medical-records)
7. [Orders](#orders)
8. [Notifications](#notifications)

---

## 👥 Users Collection

### Main Users Collection: `users/{userId}`

**Purpose**: Quick lookup with basic info and role

```javascript
{
  uid: string,                    // Firebase Auth UID (immutable)
  email: string,                  // User email (immutable)
  name: string,                   // Full name
  role: string,                   // 'doctor' | 'patient' | 'blood_donor' | 'medicine_delivery' | 'ambulance_driver' | 'admin' (immutable)
  profilePhoto: string | null,    // Profile photo URL
  createdAt: timestamp,           // Account creation time
  updatedAt: timestamp,           // Last update time
  lastLoginAt: timestamp,         // Last login time
  isActive: boolean,              // Account status
  verificationStatus: string,     // 'pending' | 'verified' | 'rejected' (immutable for users)
}
```

### Role-Based Subcollections

#### `users/patients/{userId}`
```javascript
{
  uid: string,
  email: string,
  name: string,
  age: number,
  gender: string,
  bloodGroup: string,
  medicalHistory: array,         // Array of medical condition IDs
  allergies: array,               // Array of allergy strings
  emergencyContact: {
    name: string,
    phone: string,
    relation: string,
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp,
}
```

#### `users/doctors/{userId}`
```javascript
{
  uid: string,
  email: string,
  name: string,
  specialization: string,         // e.g., 'Cardiology', 'Pediatrics'
  licenseNumber: string,
  hospitalName: string,
  yearsOfExperience: number,
  bio: string,
  consultationFee: number,
  rating: number,                 // Average rating (0-5)
  totalConsultations: number,
  verified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt: timestamp,
}
```

---

## 📸 Posts Collection

### `posts/{postId}`

**Purpose**: Instagram-like image posts with role-based visibility

```javascript
{
  ownerId: string,                // User ID who created the post (immutable)
  ownerRole: string,              // Role of the owner (immutable)
  contentType: string,            // 'general' | 'medical_advice' | 'health_tip' | 'alert'
  mediaURL: string,              // Image/video URL
  caption: string,                // Post caption
  visibility: string,             // 'public' | 'role-restricted'
  createdAt: timestamp,           // Post creation time
  updatedAt: timestamp,           // Last update time
  likesCount: number,             // Total likes (denormalized)
  commentsCount: number,          // Total comments (denormalized)
  sharesCount: number,            // Total shares
  tags: array,                    // Array of tag strings
  location: {                     // Optional location data
    latitude: number,
    longitude: number,
    address: string,
  } | null,
}
```

### Subcollections

#### `posts/{postId}/likes/{likeId}`
```javascript
{
  userId: string,                 // User who liked
  createdAt: timestamp,
}
```

#### `posts/{postId}/comments/{commentId}`
```javascript
{
  userId: string,                 // User who commented
  text: string,                   // Comment text
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

**Permission Logic**:
- **Public posts**: All authenticated users can read
- **Role-restricted posts**: Only users with matching role can read
- **Medical advice**: Only verified doctors can create
- **Owner**: Can update/delete their own posts

---

## 🎬 Reels Collection

### `reels/{reelId}`

**Purpose**: Short-form video content (Instagram Reels style)

```javascript
{
  ownerId: string,                // User ID who created the reel (immutable)
  ownerRole: string,              // Role of the owner (immutable)
  contentType: string,            // 'general' | 'medical_advice' | 'health_tip' | 'tutorial'
  mediaURL: string,               // Video URL
  thumbnailURL: string,           // Thumbnail image URL
  caption: string,                // Reel caption
  visibility: string,            // 'public' | 'role-restricted'
  duration: number,               // Video duration in seconds
  createdAt: timestamp,
  updatedAt: timestamp,
  likesCount: number,
  commentsCount: number,
  sharesCount: number,
  viewsCount: number,             // Total views
  tags: array,
}
```

### Subcollections

#### `reels/{reelId}/likes/{likeId}`
```javascript
{
  userId: string,
  createdAt: timestamp,
}
```

#### `reels/{reelId}/comments/{commentId}`
```javascript
{
  userId: string,
  text: string,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

**Permission Logic**: Same as posts

---

## 💬 Chats & Messages

### `chats/{chatId}`

**Purpose**: Chat metadata and participants

```javascript
{
  participants: array,            // Array of user IDs (immutable after creation)
  roles: {                        // Role mapping for each participant
    [userId]: string,              // 'doctor' | 'patient' | etc.
  },
  chatType: string,               // 'consultation' | 'normal' | 'ambulance' | 'delivery'
  consultationId: string | null,  // If chatType is 'consultation', link to consultation
  createdAt: timestamp,
  updatedAt: timestamp,
  lastMessage: string | null,     // Last message preview
  lastMessageTime: timestamp | null,
  lastMessageSenderId: string | null,
  isActive: boolean,              // Chat active status
}
```

### `chats/{chatId}/messages/{messageId}`

**Purpose**: Individual chat messages (IMMUTABLE after send)

```javascript
{
  senderId: string,               // User ID who sent (immutable)
  text: string,                   // Message text
  type: string,                   // 'text' | 'image' | 'video' | 'file' | 'prescription'
  mediaURL: string | null,        // URL if type is media/file
  fileName: string | null,        // Original filename for files
  fileSize: number | null,        // File size in bytes
  createdAt: timestamp,           // Message timestamp (immutable)
  readBy: array,                  // Array of user IDs who read the message
  deliveredTo: array,             // Array of user IDs who received the message
}
```

**Security Rules**:
- Only chat participants can read/write messages
- Messages are **IMMUTABLE** after creation (no edit/delete)
- Prevents impersonation by validating senderId matches auth.uid

**Chat Types**:
- **consultation**: Patient ↔ Doctor (linked to consultation)
- **normal**: General chat between users
- **ambulance**: Patient ↔ Ambulance Driver
- **delivery**: Patient ↔ Delivery Partner

---

## 🏥 Consultations

### `consultations/{consultId}`

**Purpose**: Doctor-patient consultation records

```javascript
{
  patientId: string,              // Patient user ID
  doctorId: string,               // Doctor user ID
  status: string,                 // 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  scheduledAt: timestamp,         // Consultation time
  createdAt: timestamp,
  updatedAt: timestamp,
  symptoms: string,               // Patient symptoms
  diagnosis: string | null,        // Doctor's diagnosis
  prescription: string | null,     // Prescription text
  notes: string | null,           // Additional notes
  fee: number,                    // Consultation fee
  paymentStatus: string,          // 'pending' | 'paid' | 'refunded'
  rating: number | null,          // Patient rating (1-5)
  review: string | null,          // Patient review
}
```

**Security Rules**:
- Patients can read their own consultations
- Doctors can read consultations assigned to them
- No deletions (medical records must be preserved)

---

## 🏥 Medical Records

### `medicalRecords/{recordId}`

**Purpose**: Protected medical data

```javascript
{
  patientId: string,              // Patient user ID
  doctorId: string,               // Doctor who created the record
  consultationId: string | null,  // Linked consultation (if applicable)
  recordType: string,             // 'diagnosis' | 'prescription' | 'lab_result' | 'xray' | 'other'
  title: string,
  description: string,
  attachments: array,              // Array of file URLs
  createdAt: timestamp,
  updatedAt: timestamp,
  isArchived: boolean,
}
```

**Security Rules**:
- Patients can read/write only their own records
- Doctors can read only records they created
- **No public access**
- **No deletions** (medical records must be preserved)

---

## 💊 Orders

### `orders/{orderId}`

**Purpose**: Medicine orders

```javascript
{
  userId: string,                 // Patient user ID
  items: array,                   // Array of medicine items
  totalAmount: number,
  status: string,                 // 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  deliveryAddress: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
  },
  deliveryPartnerId: string | null, // Assigned delivery partner
  createdAt: timestamp,
  updatedAt: timestamp,
  deliveredAt: timestamp | null,
}
```

---

## 🔔 Notifications

### `notifications/{notificationId}`

**Purpose**: User notifications

```javascript
{
  userId: string,                 // Target user ID
  type: string,                   // 'consultation' | 'order' | 'message' | 'donor' | 'follow'
  title: string,
  body: string,
  data: object,                   // Additional data (consultationId, orderId, etc.)
  isRead: boolean,
  createdAt: timestamp,
}
```

---

## 🔍 Indexes Required

For optimal query performance, create these composite indexes:

### Posts Collection
```javascript
// For feed queries (sorted by recency)
- Field: createdAt (Descending)
- Field: visibility (Ascending)

// For role-based queries
- Field: ownerRole (Ascending)
- Field: createdAt (Descending)

// For engagement-based queries
- Field: likesCount (Descending)
- Field: createdAt (Descending)
```

### Reels Collection
```javascript
// Same as posts
- Field: createdAt (Descending)
- Field: visibility (Ascending)
- Field: ownerRole (Ascending)
- Field: createdAt (Descending)
- Field: viewsCount (Descending)
- Field: createdAt (Descending)
```

### Chats Collection
```javascript
// For user's chat list
- Field: participants (Array)
- Field: lastMessageTime (Descending)
```

### Messages Collection
```javascript
// For chat messages (sorted by time)
- Field: createdAt (Ascending)
```

---

## 📊 Query Examples

See `docs/firestore-queries.md` for detailed query examples.

---

## 🔒 Security Considerations

1. **Medical Data**: Never publicly readable
2. **Impersonation Prevention**: All writes validate `request.auth.uid`
3. **Role Immutability**: Users cannot change their role
4. **Message Immutability**: Chat messages cannot be edited/deleted
5. **Medical Record Preservation**: No deletions allowed
6. **Verified Doctors Only**: Medical advice posts require verified doctor status

---

## 📈 Scalability Notes

- Use denormalized counts (likesCount, commentsCount) for performance
- Implement pagination for all feed queries
- Use composite indexes for complex queries
- Consider sharding for very large collections (millions of documents)
- Use Cloud Functions for complex operations (aggregations, notifications)

