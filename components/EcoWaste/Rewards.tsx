import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createSharedStyles } from '../../shared/Styles';
import { Colors, StyleConstants } from '../../constants/Colors';

const mockRewards = [
  { id: 1, title: "₹100 Zomato Voucher", points: 250, brandLogo: "🍴", available: true },
  { id: 2, title: "₹200 Myntra Coupon", points: 450, brandLogo: "👗", available: true },
  { id: 3, title: "1 Month Gaana Plus", points: 500, brandLogo: "🎵", available: true },
  { id: 4, title: "₹500 Amazon Gift Card", points: 1000, brandLogo: "📦", available: false },
];

// Mock user points - in real app, this would come from user state
const USER_POINTS = 420;

export default function Rewards() {
  const sharedStyles = createSharedStyles('light');

  const handleRedeem = (reward: typeof mockRewards[0]) => {
    if (USER_POINTS < reward.points) {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.points - USER_POINTS} more points to redeem this reward.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Do you want to redeem ${reward.title} for ${reward.points} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Redeem', 
          onPress: () => {
            // In real app, call API to redeem reward
            Alert.alert('Success!', 'Your reward has been redeemed. Check your email for details.');
          }
        },
      ]
    );
  };

  const canRedeem = (points: number) => USER_POINTS >= points;

  return (
    <View style={styles.container}>
      <Text style={[sharedStyles.title, styles.sectionTitle]}>🎁 Claim Your Rewards</Text>
      
      {/* User Points Display */}
      <View style={[sharedStyles.card, styles.pointsCard]}>
        <Text style={styles.pointsLabel}>Your Points</Text>
        <Text style={styles.pointsValue}>{USER_POINTS} pts</Text>
        <Text style={styles.pointsHint}>Keep recycling to earn more points! 🌱</Text>
      </View>

      {/* Rewards Grid */}
      <View style={styles.rewardsGrid}>
        {mockRewards.map((reward) => {
          const isRedeemable = canRedeem(reward.points) && reward.available;
          
          return (
            <View key={reward.id} style={[sharedStyles.card, styles.rewardCard]}>
              <Text style={styles.brandLogo}>{reward.brandLogo}</Text>
              
              <Text style={[sharedStyles.heading, styles.rewardTitle]}>
                {reward.title}
              </Text>
              
              <Text style={styles.rewardPoints}>
                {reward.points} Points
              </Text>
              
              {!reward.available && (
                <Text style={styles.unavailableText}>Coming Soon</Text>
              )}
              
              <TouchableOpacity
                style={[
                  isRedeemable ? sharedStyles.buttonSecondary : sharedStyles.buttonDisabled,
                  styles.redeemButton
                ]}
                onPress={() => handleRedeem(reward)}
                disabled={!isRedeemable}
              >
                <Text style={[
                  isRedeemable ? sharedStyles.buttonTextSecondary : { color: '#666' },
                  styles.redeemButtonText
                ]}>
                  {!reward.available 
                    ? 'Coming Soon' 
                    : isRedeemable 
                    ? 'Redeem' 
                    : `Need ${reward.points - USER_POINTS} more`
                  }
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Additional Info */}
      <View style={[sharedStyles.card, styles.infoCard]}>
        <Text style={styles.infoTitle}>💡 How to Earn More Points</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tip}>📱 Schedule regular e-waste pickups</Text>
          <Text style={styles.tip}>📷 Use AI photo analysis for bonus points</Text>
          <Text style={styles.tip}>🏆 Climb the leaderboard for weekly bonuses</Text>
          <Text style={styles.tip}>👥 Refer friends to earn extra points</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: StyleConstants.spacing.md,
    marginVertical: StyleConstants.spacing.lg,
    backgroundColor: 'rgba(232, 245, 233, 0.3)', // Light green background
    borderRadius: StyleConstants.borderRadius,
    marginHorizontal: StyleConstants.spacing.md,
    paddingVertical: StyleConstants.spacing.xl,
  },
  sectionTitle: {
    marginBottom: StyleConstants.spacing.lg,
  },
  pointsCard: {
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    marginBottom: StyleConstants.spacing.lg,
  },
  pointsLabel: {
    fontSize: StyleConstants.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: StyleConstants.spacing.sm,
  },
  pointsValue: {
    fontSize: StyleConstants.fontSize.xxl + 8,
    fontWeight: StyleConstants.fontWeight.bold,
    color: Colors.light.accent,
    marginBottom: StyleConstants.spacing.sm,
  },
  pointsHint: {
    fontSize: StyleConstants.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: StyleConstants.spacing.md,
  },
  rewardCard: {
    width: '47%', // Two cards per row with gap
    alignItems: 'center',
    paddingVertical: StyleConstants.spacing.xl,
    minHeight: 200,
  },
  brandLogo: {
    fontSize: 48,
    marginBottom: StyleConstants.spacing.md,
  },
  rewardTitle: {
    textAlign: 'center',
    marginBottom: StyleConstants.spacing.sm,
    minHeight: 40, // Consistent height for all titles
  },
  rewardPoints: {
    fontSize: StyleConstants.fontSize.lg,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.accent,
    marginBottom: StyleConstants.spacing.md,
  },
  unavailableText: {
    fontSize: StyleConstants.fontSize.sm,
    color: Colors.light.placeholder,
    fontStyle: 'italic',
    marginBottom: StyleConstants.spacing.sm,
  },
  redeemButton: {
    paddingHorizontal: StyleConstants.spacing.lg,
    minWidth: 120,
  },
  redeemButtonText: {
    fontSize: StyleConstants.fontSize.sm,
    textAlign: 'center',
  },
  infoCard: {
    marginTop: StyleConstants.spacing.lg,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  infoTitle: {
    fontSize: StyleConstants.fontSize.lg,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: StyleConstants.spacing.md,
  },
  tipsList: {
    gap: StyleConstants.spacing.sm,
  },
  tip: {
    fontSize: StyleConstants.fontSize.sm,
    color: Colors.light.text,
    paddingLeft: StyleConstants.spacing.md,
  },
});