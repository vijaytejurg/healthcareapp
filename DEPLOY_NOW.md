# 🚀 DEPLOY FIRESTORE RULES NOW

## Your rules file has been updated! Now deploy it:

### Method 1: Firebase Console (EASIEST - RECOMMENDED)

1. **Go to:** https://console.firebase.google.com/
2. **Select project:** `healthcare-287c1`
3. **Click:** Firestore Database (left menu)
4. **Click:** Rules tab
5. **Copy ALL the contents** from `firestore.rules` file
6. **Paste** into the rules editor
7. **Click:** Publish button
8. **Wait for:** "Rules published successfully" ✅

### Method 2: Firebase CLI (Terminal)

1. **Open PowerShell/Command Prompt**
2. **Run:**
   ```bash
   cd C:\Users\vijay\Desktop\MediDoc\healthcareapp
   firebase login
   ```
3. **Login in browser** when it opens
4. **Then run:**
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## ✅ After Deploying Rules:

1. **Refresh your browser** (F5)
2. **Try signup again**
3. **It should work now!**

The rules you provided allow:
- ✅ Any signed-in user to create their profile (`allow create: if isSignedIn()`)
- ✅ Users to read their own data
- ✅ Users to update/delete their own data

This should fix the signup issue!

