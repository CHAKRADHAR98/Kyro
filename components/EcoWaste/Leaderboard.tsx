import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { createSharedStyles } from '../../shared/Styles';
import { Colors, StyleConstants } from '../../constants/Colors';
import { DatabaseService } from '../../lib/database';
import { UserPoints } from '../../lib/supabase';
import { usePrivy } from '@privy-io/expo';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<UserPoints[]>([]);
  const [currentUserPoints, setCurrentUserPoints] = useState<UserPoints | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
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

  const fetchLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch leaderboard data
      const { success, data, error: dbError } = await DatabaseService.getLeaderboard(10);
      
      if (!success) {
        throw new Error(dbError || 'Failed to fetch leaderboard');
      }

      setLeaderboardData(data || []);

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const onRefresh = () => {
    fetchLeaderboard(true);
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '♻️';
    }
  };

  const renderCurrentUserCard = () => {
    if (!currentUserPoints) return null;

    const pointsNeeded = Math.max(0, 1000 - currentUserPoints.total_points);
    const isInTopTen = currentUserRank && currentUserRank <= 10;

    return (
      <View style={[sharedStyles.card, styles.currentUserCard]}>
        <Text style={styles.currentUserTitle}>Your Position</Text>
        <View style={styles.currentUserRow}>
          <Text style={styles.currentUserRank}>
            #{currentUserRank || '?'}
          </Text>
          <Text style={styles.currentUserName} numberOfLines={1}>
            {currentUserPoints.user_name}
          </Text>
          <Text style={styles.currentUserPoints}>
            {currentUserPoints.total_points} pts
          </Text>
        </View>
        <Text style={styles.currentUserHint}>
          {isInTopTen 
            ? "🌟 You're in the top 10! Keep it up!" 
            : pointsNeeded > 0 
            ? `Earn ${pointsNeeded} more points to reach 1000! 🚀`
            : "Amazing! You've reached 1000+ points! 🎉"
          }
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[sharedStyles.title, styles.sectionTitle]}>🏆 Top Recyclers</Text>
        <View style={[sharedStyles.card, styles.loadingCard]}>
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[sharedStyles.title, styles.sectionTitle]}>🏆 Top Recyclers</Text>
        <View style={[sharedStyles.card, styles.errorCard]}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchLeaderboard()}>
            <Text style={styles.retryButtonText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[sharedStyles.title, styles.sectionTitle]}>🏆 Top Recyclers</Text>
        <View style={[sharedStyles.card, styles.emptyCard]}>
          <Text style={styles.emptyText}>🌱 No recyclers yet!</Text>
          <Text style={styles.emptySubtext}>Be the first to schedule a pickup and earn points!</Text>
        </View>
        {renderCurrentUserCard()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[sharedStyles.title, styles.sectionTitle]}>🏆 Top Recyclers</Text>
      
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Main Leaderboard */}
        <View style={[sharedStyles.card, styles.leaderboardCard]}>
          {/* Header Row */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.headerText, styles.rankColumn]}>Rank</Text>
            <Text style={[styles.headerText, styles.nameColumn]}>Name</Text>
            <Text style={[styles.headerText, styles.pointsColumn]}>Points</Text>
          </View>

          {/* Leaderboard Entries */}
          {leaderboardData.map((user, index) => {
            const rank = index + 1;
            const currentUserName = getCurrentUserName();
            const isCurrentUser = currentUserName ? user.user_name === currentUserName : false;
            
            return (
              <View 
                key={user.id || index} 
                style={[
                  styles.row, 
                  styles.userRow,
                  isCurrentUser && styles.currentUserHighlight
                ]}
              >
                <View style={styles.rankSection}>
                  <Text style={styles.rankEmoji}>{getRankEmoji(rank)}</Text>
                  <Text style={styles.rankNumber}>{rank}</Text>
                </View>
                
                <Text style={[styles.userName, styles.nameColumn]} numberOfLines={1}>
                  {user.user_name}
                  {isCurrentUser && " (You)"}
                </Text>
                
                <Text style={[styles.userPoints, styles.pointsColumn]}>
                  {user.total_points} pts
                </Text>
              </View>
            );
          })}
        </View>

        {/* Stats Card */}
        <View style={[sharedStyles.card, styles.statsCard]}>
          <Text style={styles.statsTitle}>📊 Community Impact</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{leaderboardData.length}</Text>
              <Text style={styles.statLabel}>Active Recyclers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {leaderboardData.reduce((sum, user) => sum + user.total_points, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.floor(leaderboardData.reduce((sum, user) => sum + user.total_points, 0) / 20)}
              </Text>
              <Text style={styles.statLabel}>Kg Recycled*</Text>
            </View>
          </View>
          <Text style={styles.statsFootnote}>*Estimated based on average points per kg</Text>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>🔄 Refresh Leaderboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: StyleConstants.spacing.md,
    marginVertical: StyleConstants.spacing.lg,
  },
  sectionTitle: {
    marginBottom: StyleConstants.spacing.lg,
  },
  leaderboardCard: {
    paddingVertical: StyleConstants.spacing.lg,
    marginBottom: StyleConstants.spacing.md,
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: StyleConstants.spacing.xl,
  },
  loadingText: {
    fontSize: StyleConstants.fontSize.md,
    color: Colors.light.placeholder,
  },
  errorCard: {
    alignItems: 'center',
    paddingVertical: StyleConstants.spacing.xl,
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
  },
  errorText: {
    fontSize: StyleConstants.fontSize.md,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: StyleConstants.spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: StyleConstants.spacing.lg,
    paddingVertical: StyleConstants.spacing.sm,
    borderRadius: 20,
  },
  retryButtonText: {
    color: Colors.light.lightText,
    fontWeight: StyleConstants.fontWeight.semibold,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: StyleConstants.spacing.xl,
  },
  emptyText: {
    fontSize: StyleConstants.fontSize.lg,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.primary,
    marginBottom: StyleConstants.spacing.sm,
  },
  emptySubtext: {
    fontSize: StyleConstants.fontSize.md,
    color: Colors.light.placeholder,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: StyleConstants.spacing.sm,
    paddingHorizontal: StyleConstants.spacing.md,
  },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
    marginBottom: StyleConstants.spacing.sm,
    paddingBottom: StyleConstants.spacing.md,
  },
  headerText: {
    fontSize: StyleConstants.fontSize.md,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.primary,
  },
  userRow: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: StyleConstants.borderRadius,
    marginVertical: StyleConstants.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.secondary,
  },
  currentUserHighlight: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderLeftColor: Colors.light.accent,
    borderLeftWidth: 4,
  },
  rankColumn: {
    flex: 1,
  },
  nameColumn: {
    flex: 2,
  },
  pointsColumn: {
    flex: 1,
    textAlign: 'right',
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankEmoji: {
    fontSize: StyleConstants.fontSize.lg,
    marginRight: StyleConstants.spacing.sm,
  },
  rankNumber: {
    fontSize: StyleConstants.fontSize.md,
    fontWeight: StyleConstants.fontWeight.medium,
    color: Colors.light.text,
  },
  userName: {
    fontSize: StyleConstants.fontSize.md,
    color: Colors.light.text,
    fontWeight: StyleConstants.fontWeight.medium,
  },
  userPoints: {
    fontSize: StyleConstants.fontSize.md,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.accent,
    textAlign: 'right',
  },
  currentUserCard: {
    backgroundColor: Colors.light.primary,
    borderWidth: 2,
    borderColor: Colors.light.accent,
    marginBottom: StyleConstants.spacing.md,
  },
  currentUserTitle: {
    fontSize: StyleConstants.fontSize.lg,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.lightText,
    textAlign: 'center',
    marginBottom: StyleConstants.spacing.md,
  },
  currentUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: StyleConstants.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: StyleConstants.borderRadius,
    paddingHorizontal: StyleConstants.spacing.md,
    marginBottom: StyleConstants.spacing.sm,
  },
  currentUserRank: {
    fontSize: StyleConstants.fontSize.lg,
    fontWeight: StyleConstants.fontWeight.bold,
    color: Colors.light.accent,
  },
  currentUserName: {
    fontSize: StyleConstants.fontSize.md,
    fontWeight: StyleConstants.fontWeight.medium,
    color: Colors.light.lightText,
    flex: 1,
    marginHorizontal: StyleConstants.spacing.sm,
  },
  currentUserPoints: {
    fontSize: StyleConstants.fontSize.md,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.accent,
  },
  currentUserHint: {
    fontSize: StyleConstants.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    marginBottom: StyleConstants.spacing.md,
  },
  statsTitle: {
    fontSize: StyleConstants.fontSize.lg,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: StyleConstants.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: StyleConstants.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: StyleConstants.fontSize.xl,
    fontWeight: StyleConstants.fontWeight.bold,
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: StyleConstants.fontSize.sm,
    color: Colors.light.text,
    marginTop: StyleConstants.spacing.xs,
    textAlign: 'center',
  },
  statsFootnote: {
    fontSize: StyleConstants.fontSize.xs,
    color: Colors.light.placeholder,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  refreshButton: {
    backgroundColor: Colors.light.secondary,
    paddingVertical: StyleConstants.spacing.md,
    paddingHorizontal: StyleConstants.spacing.xl,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: StyleConstants.spacing.xl,
  },
  refreshButtonText: {
    color: Colors.light.lightText,
    fontSize: StyleConstants.fontSize.md,
    fontWeight: StyleConstants.fontWeight.semibold,
  },
});