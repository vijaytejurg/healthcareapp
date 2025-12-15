# Healthcare Platform - React Native App

A comprehensive healthcare application featuring online doctor consultations, medicine delivery, and blood donor services.

## Features

### 🏠 Home Page
- Instagram-like post feed
- Articles section
- Like, comment, and share functionality

### 🔍 Explore Page
- **All**: Display all posts, reels, and articles
- **Reels**: Video content in reel format
- **Posts**: Image posts in 3-column grid
- **Articles**: Health articles with read counts

### 👨‍⚕️ Consult Page
- Browse doctors by specialty
- Doctor profiles with ratings and followers
- Real-time calendar booking
- Payment integration
- Consultation chat with file attachments (photos, PDFs, videos)

### 💊 Medicine Page
- Browse and search medicines
- Shopping cart functionality
- Prescription upload feature
- Order tracking with real-time status
- Previous orders history
- Payment processing

### 🩸 Donor Page
- Real-time blood donor locations
- Interactive maps with live location
- Filter by blood type
- Chat with donors
- Navigation to donor location

### 👤 Profile Page
- Instagram-like profile layout
- Posts, reels, and articles tabs
- Followers/following count
- Book consultation feature
- Edit profile functionality

### 🔔 Notifications
- Real-time notifications for:
  - Consultation reminders
  - Medicine order updates
  - Blood donor availability
  - New followers
  - Prescription approvals

### 💬 Messages
- Bifurcated messages (Consultation vs Normal)
- Real-time chat functionality
- File attachments (photos, PDFs, videos)
- Profile navigation from chat

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Copy your Firebase config to `config/firebase.js`
   - Enable Authentication, Firestore, and Storage

3. Run the app:
```bash
npm start
```

For iOS:
```bash
npm run ios
```

For Android:
```bash
npm run android
```

## Tech Stack

- **React Native** with Expo
- **React Navigation** for navigation
- **Firebase** for backend services
- **React Native Maps** for location features
- **React Native Calendars** for booking
- **Expo Image Picker** for file uploads
- **Expo Document Picker** for document selection
- **Expo Location** for GPS features

## Project Structure

```
├── App.js                 # Main app component with navigation
├── screens/              # All screen components
│   ├── HomeScreen.js
│   ├── ExploreScreen.js
│   ├── ConsultScreen.js
│   ├── MedicineScreen.js
│   ├── DonorScreen.js
│   ├── ProfileScreen.js
│   ├── NotificationsScreen.js
│   ├── MessagesScreen.js
│   ├── ChatScreen.js
│   ├── ConsultationChatScreen.js
│   ├── DoctorProfileScreen.js
│   ├── UserProfileScreen.js
│   ├── MedicineOrderScreen.js
│   └── OrderTrackingScreen.js
├── config/
│   └── firebase.js       # Firebase configuration
└── package.json
```

## Features in Detail

### Real-time Features
- Live notifications
- Real-time chat messaging
- Live donor location tracking
- Order status updates

### Payment Integration
- Consultation payment flow
- Medicine order payment
- Order confirmation

### File Attachments
- Photo uploads
- PDF/document sharing
- Video attachments (consultation chat)

### Maps & Location
- Real-time donor location
- Navigation to donor
- Distance calculation

## Configuration

### Firebase Setup
1. Enable Authentication (Email/Password)
2. Create Firestore database
3. Enable Storage for file uploads
4. Set up security rules

### Permissions
The app requires:
- Camera (for photo uploads)
- Location (for donor maps)
- Storage (for file access)

## Future Enhancements

- Video call integration for consultations
- Push notifications
- Payment gateway integration (Stripe/PayPal)
- Advanced search filters
- Rating and review system
- Appointment reminders

## License

This project is licensed under the MIT License.

