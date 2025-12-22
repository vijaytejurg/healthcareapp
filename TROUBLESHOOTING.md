# 🔧 TROUBLESHOOTING GUIDE - Signup Not Working

## Step-by-Step Fix

### Step 1: Check Browser Console for Errors

1. Open your app in browser (localhost:19006 or whatever port)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try to signup
5. **Copy ALL error messages** (especially red ones)

### Step 2: Verify Firebase Connection

Open browser console and run:
```javascript
// Check if Firebase is connected
console.log('Firebase Auth:', firebase?.auth?.currentUser);
```

### Step 3: Check Firestore Rules

**IMPORTANT:** Your Firestore rules might be blocking signup!

1. Go to: https://console.firebase.google.com/
2. Select project: `healthcare-287c1`
3. Go to **Firestore Database** → **Rules**
4. Check if rules are deployed

**If rules show "allow read, write: if false" - that's the problem!**

**Quick Fix - Temporary Open Rules (FOR TESTING ONLY):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING:** These are OPEN rules for testing. Replace with proper rules later!

### Step 4: Test Signup Flow Manually

1. Fill signup form
2. Click "Create Account"
3. Watch console for these messages:
   - "🚀 Starting signup process..."
   - "✅ Account created successfully!"
   - "✅ Firebase Auth confirmed"
   - "🔄 Reloading page..."

### Step 5: Check What Happens After Reload

After page reloads, check console for:
- "✅ Firebase Auth user detected"
- "✅ User document found"
- "🔄 Navigation effect triggered"
- "🏠 User authenticated! Navigating to MainTabs"

### Step 6: Common Issues & Fixes

#### Issue 1: "Permission denied" error
**Fix:** Deploy Firestore rules (see Step 3)

#### Issue 2: Page reloads but stays on Signup screen
**Fix:** Check if `isAuthenticated` is true in console

#### Issue 3: "User document not found"
**Fix:** Check Firestore console - is the document created?

#### Issue 4: Navigation doesn't work
**Fix:** Check if `MainTabs` route exists in App.js

### Step 7: Manual Test - Check Firebase Console

1. Go to Firebase Console
2. **Authentication** → **Users** tab
   - Is your user account created?
3. **Firestore Database** → **Data** tab
   - Look for `users` collection
   - Is your user document there?

### Step 8: If Still Not Working

**Share these details:**
1. All console error messages (screenshot or copy)
2. Screenshot of Firebase Console → Authentication → Users
3. Screenshot of Firebase Console → Firestore → Data
4. What happens when you click "Create Account"?
   - Does it show loading?
   - Does it show success message?
   - Does page reload?
   - What screen do you see after reload?

## Quick Test Script

Open browser console and run:
```javascript
// Test Firebase connection
import { auth, db } from './src/firebase';
console.log('Auth:', auth);
console.log('DB:', db);
console.log('Current User:', auth.currentUser);

// Test if you can write to Firestore
import { doc, setDoc } from 'firebase/firestore';
const testRef = doc(db, 'test', 'test123');
setDoc(testRef, { test: true })
  .then(() => console.log('✅ Firestore write works!'))
  .catch(err => console.error('❌ Firestore write failed:', err));
```

