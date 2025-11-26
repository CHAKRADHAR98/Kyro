import React, { useState, useRef } from 'react';
import { View, Animated, StyleSheet, StatusBar } from 'react-native';
import { createSharedStyles } from '../../shared/Styles';
import Header from './Header';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import SchedulePickupForm from './SchedulePickupForm';
import Leaderboard from './Leaderboard';
import Rewards from './Rewards'; 
import WalletDrawer from '../Wallet/WalletDrawer';

export default function EcoWasteMainScreen() {
  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const sharedStyles = createSharedStyles('light');

  const handleScheduleClick = () => {
    console.log('Navigate to schedule');
  };

  const toggleWallet = () => {
    setIsWalletVisible(!isWalletVisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Header onWalletPress={toggleWallet} scrollY={scrollY} />
      
      <Animated.ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={sharedStyles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.contentPadding}>
          <Hero onScheduleClick={handleScheduleClick} />
          <HowItWorks />
          <SchedulePickupForm />
          <Leaderboard />
          <Rewards />
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      <WalletDrawer 
        visible={isWalletVisible} 
        onClose={() => setIsWalletVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  contentPadding: {
    paddingTop: 0, 
  }
});