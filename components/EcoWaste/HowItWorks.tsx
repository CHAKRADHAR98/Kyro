import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createSharedStyles } from '../../shared/Styles';
import { Colors, StyleConstants } from '../../constants/Colors';

export default function HowItWorks() {
  const sharedStyles = createSharedStyles('light');

  const steps = [
    {
      icon: '📝',
      title: '1. Schedule Pickup',
      description: 'Fill a simple form with your details and e-waste items. Use our AI to identify your items from a photo!',
    },
    {
      icon: '🚚',
      title: '2. We Collect',
      description: 'Our team will collect the e-waste from your doorstep at your convenience, completely free of charge.',
    },
    {
      icon: '🏆',
      title: '3. Earn Rewards',
      description: 'Once verified, points are added to your account. Climb the leaderboard and redeem amazing coupons.',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[sharedStyles.title, styles.sectionTitle]}>How It Works</Text>
      
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={[sharedStyles.card, styles.stepCard]}>
            <Text style={styles.stepIcon}>{step.icon}</Text>
            <Text style={[sharedStyles.heading, styles.stepTitle]}>{step.title}</Text>
            <Text style={[sharedStyles.bodyCenter, styles.stepDescription]}>
              {step.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: StyleConstants.spacing.md,
    marginVertical: StyleConstants.spacing.lg,
  },
  sectionTitle: {
    marginBottom: StyleConstants.spacing.xl,
  },
  stepsContainer: {
    gap: StyleConstants.spacing.md,
  },
  stepCard: {
    alignItems: 'center',
    paddingVertical: StyleConstants.spacing.xl,
  },
  stepIcon: {
    fontSize: 48,
    marginBottom: StyleConstants.spacing.md,
    color: Colors.light.secondary,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: StyleConstants.spacing.sm,
  },
  stepDescription: {
    color: Colors.light.text,
    opacity: 0.8,
  },
});