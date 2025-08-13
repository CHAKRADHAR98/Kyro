import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { createSharedStyles } from '../../shared/Styles';
import { Colors, StyleConstants } from '../../constants/Colors';

const mockLeaderboard = [
  { rank: 1, name: "Anita Sharma", points: 1250, avatar: '🥇' },
  { rank: 2, name: "Ben Carter", points: 1100, avatar: '🥈' },
  { rank: 3, name: "Chen Wei", points: 980, avatar: '🥉' },
  { rank: 4, name: "Diana Prince", points: 850, avatar: '♻️' },
  { rank: 5, name: "Leo Gonzalez", points: 720, avatar: '♻️' },
];

export default function Leaderboard() {
  const sharedStyles = createSharedStyles('light');

  return (
    <View style={styles.container}>
      <Text style={[sharedStyles.title, styles.sectionTitle]}>🏆 Top Recyclers</Text>
      
      <View style={[sharedStyles.card, styles.leaderboardCard]}>
        {/* Header Row */}
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.headerText, styles.rankColumn]}>Rank</Text>
          <Text style={[styles.headerText, styles.nameColumn]}>Name</Text>
          <Text style={[styles.headerText, styles.pointsColumn]}>Points</Text>
        </View>

        {/* Leaderboard Entries */}
        {mockLeaderboard.map((user, index) => (
          <View key={user.rank} style={[styles.row, styles.userRow]}>
            <View style={styles.rankSection}>
              <Text style={styles.rankEmoji}>{user.avatar}</Text>
              <Text style={styles.rankNumber}>{user.rank}</Text>
            </View>
            
            <Text style={[styles.userName, styles.nameColumn]}>{user.name}</Text>
            
            <Text style={[styles.userPoints, styles.pointsColumn]}>
              {user.points} pts
            </Text>
          </View>
        ))}
      </View>

      {/* Current User Status (Mock) */}
      <View style={[sharedStyles.card, styles.currentUserCard]}>
        <Text style={styles.currentUserTitle}>Your Position</Text>
        <View style={styles.currentUserRow}>
          <Text style={styles.currentUserRank}>#12</Text>
          <Text style={styles.currentUserName}>You</Text>
          <Text style={styles.currentUserPoints}>420 pts</Text>
        </View>
        <Text style={styles.currentUserHint}>
          Earn 130 more points to reach top 10! 🚀
        </Text>
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
    marginBottom: StyleConstants.spacing.lg,
  },
  leaderboardCard: {
    paddingVertical: StyleConstants.spacing.lg,
    marginBottom: StyleConstants.spacing.md,
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
  currentUserCard: {
    backgroundColor: Colors.light.primary,
    borderWidth: 2,
    borderColor: Colors.light.accent,
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
});