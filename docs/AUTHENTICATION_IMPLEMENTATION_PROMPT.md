# 🔐 AUTHENTICATION IMPLEMENTATION PROMPT

## CONTEXT
You are working on an existing React Native Expo app (healthcareapp) that currently opens directly to the Home screen without authentication. The app uses Firebase (Auth + Firestore) and React Navigation.

**Current State:**
- App opens directly to `MainTabs` (Home screen)
- No login/signup screens are shown
- All tabs are accessible without authentication
- Firebase is already configured in `src/firebase.js`
- Firestore is set up and working

## TASK
Implement a **complete, production-ready authentication system** where:

### 1️⃣ AUTHENTICATION FLOW
- **On App Launch:**
  - Check if user is logged in (Firebase Auth state)
  - If NOT logged in → Show Login screen
  - If logged in → Show Home screen (MainTabs)
  - This must work on app refresh, reopen, and navigation

### 2️⃣ LOGIN SCREEN
- Location: `screens/LoginScreen.js` (already exists)
- Fields: Email, Password
- Features:
  - Email/password validation
  - Show/hide password toggle
  - "Forgot Password?" link (can be placeholder)
  - "Sign Up" link to navigate to SignupScreen
  - Loading state during login
  - Error handling with user-friendly messages
- On successful login → Navigate to Home screen automatically

### 3️⃣ SIGNUP SCREEN
- Location: `screens/SignupScreen.js` (already exists)
- Fields Required:
  - Full Name
  - Email
  - Password (min 6 characters)
  - Confirm Password
  - Role selection (dropdown/buttons):
    - `doctor`
    - `patient`
    - `pharmacy`
    - `delivery_partner`
    - `hospital_clinic`
- Features:
  - Form validation
  - Password strength check
  - Role selection UI
  - Loading state
  - Error handling
- On successful signup → Create Firebase Auth user + Firestore document → Navigate to Home

### 4️⃣ FIREBASE AUTHENTICATION
- Use Firebase Authentication (already configured)
- On Signup:
  1. Create user with `createUserWithEmailAndPassword(auth, email, password)`
  2. Update auth profile with displayName
  3. Create Firestore document at `users/{uid}` with:
     ```javascript
     {
       uid: user.uid,
       email: email.toLowerCase().trim(),
       name: fullName.trim(),
       role: selectedRole, // Cannot be changed after creation
       profileCompleted: false,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     }
     ```
- On Login:
  - Use `signInWithEmailAndPassword(auth, email, password)`
  - Verify user document exists in Firestore
  - If document doesn't exist → Show error

### 5️⃣ AUTH STATE MANAGEMENT
- Create/Update `contexts/AuthContext.js`:
  - Use `onAuthStateChanged` to listen to Firebase Auth state
  - Use `onSnapshot` to listen to Firestore user document (real-time)
  - Provide global state:
    ```javascript
    {
      user: Firebase Auth user object,
      userData: Firestore user document data,
      loading: boolean (initial auth check),
      isAuthenticated: boolean,
      role: string,
      userName: string,
      userEmail: string,
      signOut: function
    }
  ```
- Wrap App with `AuthProvider`

### 6️⃣ APP.JS UPDATES
- Location: `App.js`
- Changes:
  - Import and use `AuthContext`
  - Show loading screen while checking auth state
  - Conditional navigation:
    - `loading === true` → Show loading spinner
    - `isAuthenticated === false` → Show Login screen
    - `isAuthenticated === true` → Show MainTabs (Home)
  - Remove direct access to MainTabs without auth

### 7️⃣ ROLE-BASED TABS (OPTIONAL ENHANCEMENT)
- Update `MainTabs` component to show different tabs based on role:
  - `patient`: Home, Explore, Consult, Medicine, Donor, Profile
  - `doctor`: Home, Consult, Profile
  - `pharmacy`: Home, Medicine, Orders, Profile
  - `delivery_partner`: Home, Orders, Profile
  - `hospital_clinic`: Home, Consult, Donor, Profile

### 8️⃣ PROFILE SCREEN LOGOUT
- Location: `screens/ProfileScreen.js`
- Add logout button:
  - Show user data from `AuthContext` (name, email, role)
  - Logout button with confirmation dialog
  - On logout → Call `signOut()` from AuthContext → Redirect to Login

### 9️⃣ FIRESTORE SECURITY RULES
- Location: `firestore.rules`
- Ensure rules allow:
  - Users can read/write their own `users/{uid}` document
  - Users can create their own document during signup
  - Role field cannot be changed after creation
  - Email and uid must match authenticated user

### 🔟 ERROR HANDLING
- Create `services/authService.js` with:
  - `signUp(email, password, name, role)` function
  - `signIn(email, password)` function
  - `getAuthErrorMessage(error)` helper for user-friendly messages
- Handle all Firebase Auth errors:
  - `auth/user-not-found`
  - `auth/wrong-password`
  - `auth/email-already-in-use`
  - `auth/weak-password`
  - `auth/invalid-email`
  - `auth/too-many-requests`
  - `auth/network-request-failed`

## REQUIREMENTS
✅ **MUST WORK:**
- Login with email/password
- Signup with email/password + role selection
- Persistent login (stays logged in on refresh)
- Automatic redirect based on auth state
- Logout functionality
- Real-time user data updates from Firestore
- Error handling with clear messages
- Loading states during auth operations

✅ **MUST NOT:**
- Break existing Home/Explore/Consult/Medicine/Donor/Profile screens
- Hardcode user data
- Skip authentication checks
- Allow access to protected routes without auth

## FILES TO CREATE/MODIFY
1. `contexts/AuthContext.js` - Create/Update auth state management
2. `services/authService.js` - Create auth service functions
3. `screens/LoginScreen.js` - Update with Firebase Auth
4. `screens/SignupScreen.js` - Update with signup flow + role selection
5. `screens/ProfileScreen.js` - Add logout + show user data
6. `App.js` - Add auth protection + conditional navigation
7. `firestore.rules` - Update security rules (if needed)

## TESTING CHECKLIST
- [ ] App shows Login screen when not logged in
- [ ] Can create new account with all roles
- [ ] Can login with existing account
- [ ] Stays logged in after page refresh
- [ ] Redirects to Home after login
- [ ] Redirects to Login after logout
- [ ] Profile screen shows correct user data
- [ ] Logout works and clears session
- [ ] Error messages are user-friendly
- [ ] Loading states work properly

## DELIVERABLE
A fully working authentication system where:
- Users must login to access the app
- Users can signup with role selection
- Login persists across sessions
- All routes are protected
- User data is displayed correctly
- Logout works properly

---

**IMPORTANT NOTES:**
- Use existing Firebase configuration from `src/firebase.js`
- Don't break existing screens - only add auth protection
- Follow React Native/Expo best practices
- Use TypeScript-style JSDoc comments
- Handle all edge cases (network errors, missing documents, etc.)
- Make it production-ready (not a demo)

