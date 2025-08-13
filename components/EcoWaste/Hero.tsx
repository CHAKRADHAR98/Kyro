import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { createSharedStyles } from '../../shared/Styles';
import { Colors, StyleConstants } from '../../constants/Colors';

interface HeroProps {
  onScheduleClick: () => void;
}

export default function Hero({ onScheduleClick }: HeroProps) {
  const sharedStyles = createSharedStyles('light');

  return (
    <View style={styles.heroContainer}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=2070&auto=format&fit=crop'
        }}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Turn Your E-Waste Into Rewards</Text>
            <Text style={styles.heroSubtitle}>
              Schedule a free pickup for your old electronics and earn points to redeem exciting coupons. 
              It's good for your wallet and the planet.
            </Text>
            <TouchableOpacity 
              style={[sharedStyles.buttonSecondary, styles.ctaButton]} 
              onPress={onScheduleClick}
              activeOpacity={0.8}
            >
              <Text style={sharedStyles.buttonTextSecondary}>📱 Schedule a Pickup Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 350,
    marginHorizontal: StyleConstants.spacing.md,
    marginVertical: StyleConstants.spacing.md,
    borderRadius: StyleConstants.borderRadius,
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    borderRadius: StyleConstants.borderRadius,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 125, 50, 0.85)', // Green overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: StyleConstants.spacing.lg,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  heroTitle: {
    fontSize: StyleConstants.fontSize.xxl + 4,
    fontWeight: StyleConstants.fontWeight.bold,
    color: Colors.light.lightText,
    textAlign: 'center',
    marginBottom: StyleConstants.spacing.md,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: StyleConstants.fontSize.md,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: StyleConstants.spacing.xl,
    fontWeight: '300',
  },
  ctaButton: {
    paddingHorizontal: StyleConstants.spacing.xl,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});