import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../src/firebase';

const DoctorProfileScreen = ({ route, navigation }) => {
  const { doctor } = route.params || {
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      avatar: '👩‍⚕️',
      rating: 4.8,
      patients: 1234,
      experience: '10 years',
      verified: true,
      followers: 5678,
      following: 234,
      bio: 'Experienced cardiologist with expertise in heart diseases and preventive care.',
      education: 'MD, Harvard Medical School',
      languages: ['English', 'Spanish'],
    },
  };

  const [isFollowing, setIsFollowing] = useState(false);
  const [doctorStatus, setDoctorStatus] = useState({
    online: false,
    lastActiveAt: null,
  });

  // Real-time listener for doctor online status
  useEffect(() => {
    if (!doctor?.id) return;
    
    const doctorRef = doc(db, 'doctors', doctor.id);
    const unsubscribe = onSnapshot(doctorRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDoctorStatus({
          online: data.online === true,
          lastActiveAt: data.lastActiveAt?.toDate?.() || data.lastActiveAt || null,
        });
      }
    }, (error) => {
      console.error('Error listening to doctor status:', error);
    });

    return () => unsubscribe();
  }, [doctor?.id]);

  // Format last active time
  const formatLastActive = (lastActiveAt) => {
    if (!lastActiveAt) return 'Never';
    
    const now = new Date();
    const lastActive = lastActiveAt instanceof Date ? lastActiveAt : new Date(lastActiveAt);
    const diffMs = now - lastActive;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return lastActive.toLocaleDateString();
  };

  const posts = [
    { id: '1', image: 'https://via.placeholder.com/300', likes: 234 },
    { id: '2', image: 'https://via.placeholder.com/300', likes: 567 },
    { id: '3', image: 'https://via.placeholder.com/300', likes: 123 },
  ];

  const renderPost = ({ item }) => (
    <TouchableOpacity style={styles.postItem}>
      <View style={styles.postImage}>
        <View style={styles.overlay}>
          <Ionicons name="heart" size={16} color="#fff" />
          <Text style={styles.overlayText}>{item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{doctor.avatar}</Text>
          {doctorStatus.online && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{doctor.name}</Text>
          {doctor.verified && (
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          )}
        </View>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
        <View style={styles.availabilitySection}>
          <View style={[styles.statusBadge, doctorStatus.online ? styles.statusOnline : styles.statusOffline]}>
            <View style={[styles.statusDot, { backgroundColor: doctorStatus.online ? '#34C759' : '#999' }]} />
            <Text style={styles.statusText}>
              {doctorStatus.online ? 'Online' : 'Offline'}
            </Text>
          </View>
          {!doctorStatus.online && doctorStatus.lastActiveAt && (
            <Text style={styles.lastActiveText}>
              Last active: {formatLastActive(doctorStatus.lastActiveAt)}
            </Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={18} color="#FFD700" />
          <Text style={styles.rating}>{doctor.rating}</Text>
          <Text style={styles.patients}>({doctor.patients} patients)</Text>
        </View>
        <View style={styles.stats}>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{doctor.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{doctor.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followingButton,
            ]}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text
              style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.consultButton}
            onPress={() => navigation.navigate('Consult')}
          >
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.consultButtonText}>Book Consultation</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{doctor.bio}</Text>
          <View style={styles.detailRow}>
            <Ionicons name="school" size={18} color="#666" />
            <Text style={styles.detailText}>{doctor.education}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time" size={18} color="#666" />
            <Text style={styles.detailText}>{doctor.experience} experience</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="language" size={18} color="#666" />
            <Text style={styles.detailText}>
              {doctor.languages.join(', ')}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>Posts</Text>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.postRow}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    fontSize: 80,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    borderWidth: 3,
    borderColor: '#fff',
  },
  availabilitySection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  statusOnline: {
    backgroundColor: '#E8F5E9',
  },
  statusOffline: {
    backgroundColor: '#F5F5F5',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  lastActiveText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  specialty: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rating: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 5,
    marginRight: 5,
  },
  patients: {
    fontSize: 14,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 30,
  },
  followButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    marginRight: 10,
  },
  followingButton: {
    backgroundColor: '#e0e0e0',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  followingButtonText: {
    color: '#666',
  },
  consultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  consultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  aboutSection: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  postsSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  postRow: {
    justifyContent: 'space-between',
  },
  postItem: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  overlay: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  overlayText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default DoctorProfileScreen;

