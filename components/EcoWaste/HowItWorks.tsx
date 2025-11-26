import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HowItWorks() {
  const steps = [
    {
      icon: 'document-text-outline',
      title: '1. Schedule Pickup',
      desc: 'Fill a simple form with your details and e-waste items. Use our AI to identify your items from a photo!',
      color: '#E8F5E9',
      iconColor: '#2E7D32'
    },
    {
      icon: 'bus-outline',
      title: '2. We Collect',
      desc: 'Our team will collect the e-waste from your doorstep at your convenience, completely free of charge.',
      color: '#FFF3E0',
      iconColor: '#EF6C00'
    },
    {
      icon: 'trophy-outline',
      title: '3. Earn Rewards',
      desc: 'Once verified, points are added to your account. Climb the leaderboard and redeem amazing coupons.',
      color: '#E3F2FD',
      iconColor: '#1565C0'
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.line} />
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={width * 0.8 + 16}
      >
        {steps.map((step, index) => (
          <View key={index} style={[styles.stepCard, { backgroundColor: step.color }]}>
            <View style={[styles.iconCircle, { backgroundColor: 'white' }]}>
              <Ionicons name={step.icon as any} size={28} color={step.iconColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginRight: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  stepCard: {
    width: width * 0.8,
    height: 220,
    padding: 24,
    borderRadius: 24,
    marginRight: 16,
    justifyContent: 'flex-start',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  textContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  stepDesc: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
});