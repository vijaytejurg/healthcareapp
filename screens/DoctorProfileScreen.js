import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
        <Text style={styles.avatar}>{doctor.avatar}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{doctor.name}</Text>
          {doctor.verified && (
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          )}
        </View>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
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
  avatar: {
    fontSize: 80,
    marginBottom: 15,
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

