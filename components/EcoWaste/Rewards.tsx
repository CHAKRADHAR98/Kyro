import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, RefreshControl, ScrollView } from 'react-native';
import { createSharedStyles } from '../../shared/Styles';
import { Colors, StyleConstants } from '../../constants/Colors';
import { DatabaseService } from '../../lib/database';
import { UserPoints } from '../../lib/supabase';
import { usePrivy } from '@privy-io/expo';

const mockRewards = [
  { id: 1, title: "₹100 Zomato Voucher", points: 250, brandLogo: "🍴", available: true },
  { id: 2, title: "₹200 Myntra Coupon", points: 450, brandLogo: "👗", available: true },
  { id: 3, title: "1 Month Gaana Plus", points: 500, brandLogo: "🎵", available: true },
  { id: 4, title: "₹500 Amazon Gift Card", points: 1000, brandLogo: "📦", available: true },
  { id: 5, title: "₹1000 Flipkart Voucher", points: 2000, brandLogo: "🛒", available: true },
  { id: 6, title: "Apple AirPods", points: 5000, brandLogo: "🎧", available: false },
];

export default function Rewards() {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sharedStyles = createSharedStyles('light');
  const { user } = usePrivy();

  // Get current user name (dynamic based on Privy user)
  const getCurrentUserName = (): string => {
    // Try to get user name from Privy authentication
    if (user?.linked_accounts) {
      const emailAccount = user.linked_accounts.find(account => account.type === 'email');
      if (emailAccount && 'address' in emailAccount && emailAccount.address) {
        // Extract name from email or use email prefix
        const email = emailAccount.address;
        // If the email looks like a name, use the part before @
        const namePart = email.split('@')[0];
        
        // Convert common email formats to readable names
        // e.g., "komati.chakradhar@email.com" -> "Komati Chakradhar"
        if (namePart.includes('.')) {
          return namePart.split('.').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          ).join(' ');
        }
        
        return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
      }
      
      // Fallback to other account types
      const firstAccount = user.linked_accounts[0];
      if (firstAccount) {
        if ('phoneNumber' in firstAccount && firstAccount.phoneNumber) return firstAccount.phoneNumber;
        if ('username' in firstAccount && firstAccount.username) return firstAccount.username;
        if ('custom_user_id' in firstAccount && firstAccount.custom_user_id) return firstAccount.custom_user_id;
        if ('address' in firstAccount && firstAccount.address) return firstAccount.address;
      }
    }
    
    // For testing: if no Privy user, use the name from your database
    // This ensures it works even during testing
    return 'Komati Chakradhar'; // This matches your database entry
  };

  const fetchUserPoints = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const currentUserName = getCurrentUserName();
      const { success, data, error: dbError } = await DatabaseService.getUserPoints(currentUserName);
      
      if (!success) {
        throw new Error(dbError || 'Failed to fetch user points');
      }

      setUserPoints(data?.total_points || 0);
    } catch (err) {
      console.error('Error fetching user points:', err);
      setError(err instanceof Error ? err.message : 'Failed to load points');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserPoints();
  }, [user]);

  const onRefresh = () => {
    fetchUserPoints(true);
  };

  const handleRedeem = (reward: typeof mockRewards[0]) => {
    if (userPoints < reward.points) {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.points - userPoints} more points to redeem this reward.\n\nCurrent points: ${userPoints}\nRequired points: ${reward.points}`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Do you want to redeem ${reward.title} for ${reward.points} points?\n\nYour current points: ${userPoints}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Redeem', 
          onPress: async () => {
            try {
              // In a real app, you would:
              // 1. Call API to process the redemption
              // 2. Deduct points from user account
              // 3. Send reward details to user's email
              
              // For now, simulate the redemption
              const newPoints = userPoints - reward.points;
              
              // Update user points in database
              const currentUserName = getCurrentUserName();
              const updateResult = await DatabaseService.updateUserPoints(currentUserName, -reward.points);
              
              if (updateResult.success) {
                setUserPoints(newPoints);
                Alert.alert(
                  'Success!', 
                  `Your reward has been redeemed!\n\n${reward.title}\n\nRemaining points: ${newPoints}\n\nCheck your email for details.`
                );
              } else {
                throw new Error('Failed to update points');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to redeem reward. Please try again.');
            }
          }
        },
      ]
    );
  };

  const canRedeem = (points: number) => userPoints >= points;

  const renderUserPointsCard = () => (
    <View style={[sharedStyles.cardElevated, styles.pointsCard]}>
      <Text style={styles.pointsLabel}>Your Points</Text>
      {loading ? (
        <Text style={styles.pointsValue}>Loading...</Text>
      ) : error ? (
        <Text style={[styles.pointsValue, { color: Colors.light.error }]}>Error</Text>
      ) : (
        <Text style={styles.pointsValue}>{userPoints} pts</Text>
      )}
      <Text style={styles.pointsHint}>Keep recycling to earn more points! 🌱</Text>
      
      {!loading && !error && (
        <TouchableOpacity style={styles.refreshPointsButton} onPress={onRefresh}>
          <Text style={styles.refreshPointsText}>🔄 Refresh</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[sharedStyles.title, styles.sectionTitle]}>🎁 Claim Your Rewards</Text>
      
      {/* User Points Display */}
      {renderUserPointsCard()}

      {/* Rewards Grid */}
      <View style={styles.rewardsGrid}>
        {mockRewards.map((reward) => {
          const isRedeemable = canRedeem(reward.points) && reward.available && !loading;
          const pointsNeeded = Math.max(0, reward.points - userPoints);
          
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
                disabled={!isRedeemable || loading}
              >
                <Text style={[
                  isRedeemable ? sharedStyles.buttonTextSecondary : { color: '#666' },
                  styles.redeemButtonText
                ]}>
                  {loading 
                    ? 'Loading...'
                    : !reward.available 
                    ? 'Coming Soon' 
                    : isRedeemable 
                    ? 'Redeem' 
                    : `Need ${pointsNeeded} more`
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
          <Text style={styles.tip}>📱 Schedule regular e-waste pickups (+50-100 pts per request)</Text>
          <Text style={styles.tip}>📷 Use AI photo verification for bonus accuracy</Text>
          <Text style={styles.tip}>🏆 Climb the leaderboard for recognition</Text>
          <Text style={styles.tip}>👥 Refer friends to earn extra points (coming soon)</Text>
          <Text style={styles.tip}>♻️ Larger quantities = more points!</Text>
        </View>
      </View>

      {/* Points History */}
      {userPoints > 0 && (
        <View style={[sharedStyles.card, styles.historyCard]}>
          <Text style={styles.historyTitle}>📊 Your Progress</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{userPoints}</Text>
              <Text style={styles.progressLabel}>Total Points</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{Math.floor(userPoints / 50)}</Text>
              <Text style={styles.progressLabel}>Estimated Pickups</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>{Math.floor(userPoints / 25)}</Text>
              <Text style={styles.progressLabel}>Kg Recycled*</Text>
            </View>
          </View>
          <Text style={styles.progressNote}>*Estimated based on average points per kg</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: StyleConstants.spacing.md,
    marginVertical: StyleConstants.spacing.lg,
    backgroundColor: 'rgba(232, 245, 233, 0.3)',
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
    marginBottom: StyleConstants.spacing.md,
  },
  refreshPointsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: StyleConstants.spacing.lg,
    paddingVertical: StyleConstants.spacing.sm,
    borderRadius: 20,
  },
  refreshPointsText: {
    color: Colors.light.lightText,
    fontWeight: StyleConstants.fontWeight.semibold,
    fontSize: StyleConstants.fontSize.sm,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: StyleConstants.spacing.md,
  },
  rewardCard: {
    width: '47%',
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
    minHeight: 40,
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
  historyCard: {
    marginTop: StyleConstants.spacing.lg,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  historyTitle: {
    fontSize: StyleConstants.fontSize.lg,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: StyleConstants.spacing.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: StyleConstants.spacing.sm,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: StyleConstants.fontSize.xl,
    fontWeight: StyleConstants.fontWeight.bold,
    color: Colors.light.primary,
  },
  progressLabel: {
    fontSize: StyleConstants.fontSize.sm,
    color: Colors.light.text,
    marginTop: StyleConstants.spacing.xs,
    textAlign: 'center',
  },
  progressNote: {
    fontSize: StyleConstants.fontSize.xs,
    color: Colors.light.placeholder,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});