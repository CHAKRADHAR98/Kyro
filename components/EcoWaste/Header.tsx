import React from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface HeaderProps {
  onWalletPress: () => void;
  scrollY: Animated.Value;
}

export default function Header({ onWalletPress, scrollY }: HeaderProps) {
  // Animations based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerShadow = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 4],
    extrapolate: 'clamp',
  });

  const textColor = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: ['#FFFFFF', Colors.light.primary],
  });

  const buttonBg = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: ['rgba(255,255,255,0.2)', Colors.light.accent],
  });

  return (
    <Animated.View style={[
      styles.headerContainer, 
      { 
        backgroundColor: headerOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: ['transparent', 'rgba(255,255,255,0.98)']
        }),
        shadowOpacity: headerOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.1]
        }),
        elevation: headerShadow
      }
    ]}>
      <View style={styles.headerContent}>
        <Animated.Text style={[styles.logo, { color: textColor }]}>
          Kyro<Text style={styles.logoDot}>.</Text>
        </Animated.Text>
        
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={onWalletPress}
        >
          <Animated.View style={[styles.walletButton, { backgroundColor: buttonBg }]}>
            <Ionicons name="wallet-outline" size={18} color="white" style={{ marginRight: 6 }} />
            <Text style={styles.walletButtonText}>Wallet</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoDot: {
    color: Colors.light.accent,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  walletButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});