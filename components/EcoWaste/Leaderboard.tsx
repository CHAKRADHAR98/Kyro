import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { createSharedStyles } from '../../shared/Styles';
import { Colors, StyleConstants } from '../../constants/Colors';
import { DatabaseService } from '../../lib/database';
import { UserPoints } from '../../lib/supabase';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<UserPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sharedStyles = createSharedStyles('light');

  const fetchLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

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
  }, []);

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
      >
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
            return (
              <View key={user.id || index} style={[styles.row, styles.userRow]}>
                <View style={styles.rankSection}>
                  <Text style={styles.rankEmoji}>{getRankEmoji(rank)}</Text>
                  <Text style={styles.rankNumber}>{rank}</Text>
                </View>
                
                <Text style={[styles.userName, styles.nameColumn]} numberOfLines={1}>
                  {user.user_name}
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
          </View>
        </View>
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
  },
});