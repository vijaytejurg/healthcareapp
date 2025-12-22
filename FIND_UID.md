# 🔍 How to Find Your UID

## Understanding UID
- **UID = User ID** - A unique identifier for each user
- **UID is created** when a user signs up or logs in
- **No UID exists** until someone creates an account

---

## Method 1: Find UID After Signup (Easiest)

### Step 1: Sign Up in Your App
1. Open your app in browser (localhost)
2. Fill the signup form
3. Click "Create Account"
4. **Open browser console** (F12 → Console tab)
5. Look for: `✅ Account created successfully! User ID: [YOUR_UID_HERE]`

### Step 2: UID is in Console Logs
After signup, you'll see logs like:
```
✅ Account created successfully!
   User ID: abc123xyz456789  ← THIS IS YOUR UID
   Email: test@example.com
   Role: doctor
```

---

## Method 2: Find UID in Firebase Console

### Step 1: Create an Account First
- You MUST sign up at least once to have a UID

### Step 2: Check Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select project: **healthcare-287c1**
3. Click **Authentication** (left menu)
4. Click **Users** tab
5. **You'll see all users here with their UIDs**

If you see "No users yet" → You need to sign up first!

---

## Method 3: Get UID from Browser Console (If Already Logged In)

### Open Browser Console and Run:
```javascript
// Check if you're logged in
import { auth } from './src/firebase';
console.log('Current User:', auth.currentUser);
console.log('UID:', auth.currentUser?.uid);
```

Or in the app console, look for:
```
✅ Firebase Auth user detected: [YOUR_UID]
```

---

## Method 4: Check Firestore for UID

1. Go to Firebase Console
2. **Firestore Database** → **Data** tab
3. Look for `users` collection
4. Click on any user document
5. The **document ID** is the UID
6. Or check the `uid` field inside the document

---

## Quick Test: Create a Test Account

If you don't have a UID yet, create one:

1. **Open your app** (localhost)
2. **Fill signup form:**
   - Name: Test User
   - Email: test@example.com
   - Password: test1234
   - Role: Doctor
3. **Click "Create Account"**
4. **Open console (F12)** - You'll see your UID immediately!

---

## What Your UID Looks Like

UIDs look like this:
- `abc123xyz456789`
- `K8mN3pQrS2tUvWxYz`
- `user_1234567890abcdef`

They are **long random strings** unique to each user.

---

## Still Can't Find It?

**Check these:**
1. ✅ Did you actually sign up? (No signup = No UID)
2. ✅ Check browser console for error messages
3. ✅ Check Firebase Console → Authentication → Users
4. ✅ Check if signup is working (deploy Firestore rules first!)

