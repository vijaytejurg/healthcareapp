# Complete App Flow - Healthcare Platform

## 🔄 Complete User Flow

### 1. **Signup Flow**
- User opens app → **Login Screen**
- Clicks "Sign Up" → **Signup Screen**
- Fills in:
  - Full Name
  - Email
  - Password
  - Confirm Password
  - **Role Selection** (Doctor, Patient, Pharmacy, Delivery, Hospital)
  
#### **Doctor-Specific Signup (India Medical Data)**
When user selects "Doctor" role, additional fields appear:
- **Medical Specialization** (e.g., Cardiology, General Medicine)
- **Medical License Number** (MCI/State Medical Council)
- **Hospital/Clinic Name**
- **Years of Experience**
- **Qualifications** (comma-separated, e.g., MBBS, MD)

- Clicks "Create Account"
- Account created in Firebase Auth + Firestore
- User is authenticated
- **Profile is NOT completed yet** (`profileCompleted: false`)

---

### 2. **Login Flow**
- User enters email and password
- Clicks "Login"
- Firebase authenticates user
- App checks if `profileCompleted === true`

#### **If Profile NOT Completed:**
- Navigate to **Complete Profile Screen**
- User must fill in:
  - Phone Number
  - Address, City, State, Pincode
  - **Role-specific fields** (based on their role)
  
#### **If Profile IS Completed:**
- Navigate directly to **Role-Based Home Screen**

---

### 3. **Complete Profile Screen**
Shows different fields based on user role:

#### **Doctor:**
- Contact Information (Phone, Address, etc.)
- Medical Information:
  - Specialization
  - License Number
  - Hospital Name
  - Experience
  - Qualifications

#### **Patient:**
- Contact Information
- Health Information:
  - Age
  - Gender
  - Blood Group

#### **Pharmacy:**
- Contact Information
- Pharmacy Information:
  - Shop Name
  - Pharmacy License Number
  - Service Area

#### **Delivery Partner:**
- Contact Information
- Delivery Information:
  - Vehicle Number
  - Service Area

#### **Hospital:**
- Contact Information
- Hospital Information:
  - Hospital License Number
  - Hospital Type
  - Number of Beds

- User clicks "Complete Profile"
- `profileCompleted` set to `true` in Firestore
- Navigate to **Role-Based Home Screen**

---

### 4. **Role-Based Home Screens**

After profile completion, users are redirected to their role-specific home:

| Role | Home Screen |
|------|-------------|
| **Doctor** | `DoctorHomeScreen` |
| **Patient** | `MainTabs` (Home, Explore, Consult, Medicine, Donor, Profile) |
| **Pharmacy** | `PharmacyHomeScreen` |
| **Delivery** | `DeliveryHomeScreen` |
| **Hospital** | `HospitalHomeScreen` |

---

### 5. **Tabs Navigation (For Patients)**

Patients see bottom tabs:
- **Home**: Feed with posts, reels, articles
- **Explore**: Discover content
- **Consult**: Book consultations with doctors
- **Medicine**: Order medicines, view prescriptions
- **Donor**: Blood donation requests
- **Profile**: User profile, settings, logout

**All tabs work realistically:**
- Home shows healthcare posts and content
- Consult shows available doctors, booking calendar
- Medicine shows pharmacy listings, cart, orders
- Donor shows blood donation requests, map
- Profile shows user info, stats, logout

---

### 6. **Logout Flow**

- User goes to **Profile Screen**
- Scrolls down to find **Logout Button** (red button with logout icon)
- Clicks "Logout"
- Confirmation alert appears
- User confirms
- **Real-time logout:**
  - Firebase `signOut()` called
  - Local state cleared immediately (`user` and `userData` set to `null`)
  - Navigation resets to **Login Screen**
  - User must login again to access app

---

## 🔐 Security & Data Flow

### Firebase Authentication
- Email/Password authentication
- Persistent sessions (stays logged in on refresh)
- Real-time auth state listener

### Firestore Structure
```
users/{uid}
  - email
  - name
  - role (immutable)
  - profileCompleted (boolean)
  - createdAt (serverTimestamp)
  - updatedAt (serverTimestamp)
  - [role-specific fields]
```

### Profile Completion Check
- App checks `userData.profileCompleted` on every login
- If `false` → Navigate to Complete Profile
- If `true` → Navigate to Role-Based Home

---

## ✅ Features Working

1. ✅ **Signup with role-specific data** (especially doctors with medical info)
2. ✅ **Login with authentication**
3. ✅ **Profile completion screen** (shows after login if incomplete)
4. ✅ **Role-based navigation** (each role goes to their home screen)
5. ✅ **Tabs work realistically** (Home, Medicine, Consult, Donor all functional)
6. ✅ **Real-time logout** (immediate state clearing and redirect)

---

## 🎯 User Experience

- **Signup**: Collects essential data upfront (especially for doctors)
- **Login**: Quick authentication, then profile completion if needed
- **Profile Setup**: One-time setup to complete profile
- **Home**: Role-specific dashboard with relevant features
- **Tabs**: Realistic functionality for each tab
- **Logout**: Instant logout with proper state clearing

---

## 📱 Flow Diagram

```
App Start
  ↓
Login Screen
  ↓
[Signup] → Signup Screen → Create Account → Complete Profile Screen → Role-Based Home
  ↓
[Login] → Check Profile Completed?
  ↓
  ├─ No → Complete Profile Screen → Role-Based Home
  └─ Yes → Role-Based Home
         ↓
    [Tabs Navigation] (Patients only)
         ↓
    Home / Medicine / Consult / Donor / Profile
         ↓
    [Logout] → Login Screen
```

---

This flow ensures:
- ✅ All essential data collected (especially medical data for doctors in India)
- ✅ Profile completion before accessing app
- ✅ Role-based access and navigation
- ✅ Realistic tab functionality
- ✅ Proper logout with real-time state clearing

