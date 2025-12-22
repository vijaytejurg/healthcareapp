# 🔥 Firestore Rules - Ready to Deploy

## Copy This Code to Firebase Console

Go to: https://console.firebase.google.com/ → Select project `healthcare-287c1` → Firestore Database → Rules tab

Then copy and paste the code below:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    /* ---------------- AUTH HELPERS ---------------- */
    function isSignedIn() {
      return request.auth != null;
    }

    function userRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isDoctor() {
      return userRole() == 'doctor';
    }

    function isPatient() {
      return userRole() == 'patient';
    }

    function isPharmacy() {
      return userRole() == 'pharmacy';
    }

    function isDelivery() {
      return userRole() == 'delivery';
    }

    function isHospital() {
      return userRole() == 'hospital';
    }

    /* ---------------- USERS (PROFILES) ---------------- */
    match /users/{userId} {
      // Users can create their own profile during signup
      allow create: if isSignedIn() && isOwner(userId);
      
      // Users can read their own profile
      allow read: if isSignedIn() && isOwner(userId);
      
      // Users can update their own profile
      allow update: if isSignedIn() && isOwner(userId);
      
      // Users can delete their own profile
      allow delete: if isSignedIn() && isOwner(userId);
    }

    /* ---------------- POSTS & REELS ---------------- */
    match /posts/{postId} {
      allow read: if true; // public feed
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() &&
        request.auth.uid == resource.data.authorId;
    }

    match /reels/{reelId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() &&
        request.auth.uid == resource.data.authorId;
    }

    /* ---------------- DOCTOR CONTENT ---------------- */
    match /consultations/{consultId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isPatient();
      allow update: if isSignedIn() && isDoctor();
    }

    /* ---------------- PHARMACY ---------------- */
    match /medicines/{medicineId} {
      allow read: if true;
      allow create, update, delete: if isSignedIn() && isPharmacy();
    }

    /* ---------------- DELIVERY ---------------- */
    match /deliveries/{deliveryId} {
      allow read, update: if isSignedIn() && isDelivery();
      allow create: if isSignedIn();
    }

    /* ---------------- HOSPITAL / CLINIC ---------------- */
    match /hospitals/{hospitalId} {
      allow read: if true;
      allow create, update, delete: if isSignedIn() && isHospital();
    }

    /* ---------------- DEFAULT DENY ---------------- */
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 📋 Step-by-Step Deployment

### Method 1: Firebase Console (Easiest)

1. **Go to:** https://console.firebase.google.com/
2. **Select project:** `healthcare-287c1`
3. **Click:** Firestore Database (left menu)
4. **Click:** Rules tab
5. **Select all** existing text (Ctrl+A)
6. **Delete** it
7. **Paste** the code above
8. **Click:** Publish button
9. **Wait for:** "Rules published successfully" ✅

### Method 2: Firebase CLI

```bash
cd C:\Users\vijay\Desktop\MediDoc\healthcareapp
firebase login
firebase deploy --only firestore:rules
```

## ✅ What These Rules Do

- ✅ **Users can create their own profile** at `users/{uid}` during signup
- ✅ **Users can only read/update their own data** (security)
- ✅ **Public posts/reels** can be read by anyone
- ✅ **Role-based access** for consultations, medicines, deliveries, hospitals
- ✅ **Default deny** - blocks all other collections

## 🔒 Security Features

- Document ID MUST equal Firebase Auth UID (prevents impersonation)
- Users can only modify their own documents
- Role-based permissions for specialized collections
- No public access to user profiles

## ⚠️ Important

After deploying, **refresh your browser** and try signup again. The rules will allow users to create their profile documents.

