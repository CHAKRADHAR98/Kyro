import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';

interface HeroProps {
  onScheduleClick: () => void;
}

const { width } = Dimensions.get('window');

export default function Hero({ onScheduleClick }: HeroProps) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=2070&auto=format&fit=crop'
        }}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            
            {/* Original Title & Subtitle */}
            <Text style={styles.title}>Turn Your E-Waste Into Rewards</Text>
            
            <Text style={styles.subtitle}>
              Schedule a free pickup for your old electronics and earn points to redeem exciting coupons. 
              It's good for your wallet and the planet.
            </Text>

            <TouchableOpacity 
              style={styles.ctaButton} 
              onPress={onScheduleClick}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaText}>📱 Schedule a Pickup Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 480,
    width: width,
    marginBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 125, 50, 0.7)', // Green tint overlay
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 320,
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});