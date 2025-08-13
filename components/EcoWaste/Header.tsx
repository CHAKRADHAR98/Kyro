import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createSharedStyles } from '../../shared/Styles';
import { Colors, StyleConstants } from '../../constants/Colors';

interface HeaderProps {
  onWalletPress: () => void;
}

export default function Header({ onWalletPress }: HeaderProps) {
  const sharedStyles = createSharedStyles('light');

  return (
    <View style={styles.header}>
      <Text style={styles.logo}>♻️ EcoCycle</Text>
      
      {/* Wallet Button */}
      <TouchableOpacity 
        style={styles.walletButton} 
        onPress={onWalletPress}
        activeOpacity={0.7}
      >
        <Text style={styles.walletButtonText}>💰 Wallet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.light.card,
    paddingTop: 50,
    paddingBottom: StyleConstants.spacing.md,
    paddingHorizontal: StyleConstants.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  logo: {
    fontSize: StyleConstants.fontSize.xl,
    fontWeight: StyleConstants.fontWeight.bold,
    color: Colors.light.primary,
  },
  walletButton: {
    backgroundColor: Colors.light.accent,
    paddingVertical: StyleConstants.spacing.sm,
    paddingHorizontal: StyleConstants.spacing.md,
    borderRadius: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  walletButtonText: {
    color: Colors.light.text,
    fontSize: StyleConstants.fontSize.sm,
    fontWeight: StyleConstants.fontWeight.semibold,
  },
});