import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { createSharedStyles } from '../../shared/Styles';
import { Colors } from '../../constants/Colors';
import Header from './Header';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import SchedulePickupForm from './SchedulePickupForm';
import Leaderboard from './Leaderboard';
import Rewards from './Rewards'; 
import WalletDrawer from '../Wallet/WalletDrawer';
import TestDatabaseConnection from '../TestDatabaseConnection';


export default function EcoWasteMainScreen() {
  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const sharedStyles = createSharedStyles('light');

  const handleScheduleClick = () => {
    // Scroll to schedule section - you can implement smooth scrolling if needed
    console.log('Navigate to schedule section');
  };

  const toggleWallet = () => {
    setIsWalletVisible(!isWalletVisible);
  };

  return (
    <View style={sharedStyles.container}>
      <Header onWalletPress={toggleWallet} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={sharedStyles.scrollContainer}
      >

        <Hero onScheduleClick={handleScheduleClick} />
        <HowItWorks />
        <SchedulePickupForm />
        <Leaderboard />
        <Rewards />
      </ScrollView>

      {/* Wallet Drawer */}
      <WalletDrawer 
        visible={isWalletVisible} 
        onClose={() => setIsWalletVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});