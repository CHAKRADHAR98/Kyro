import { TouchableOpacity, Text, View, StyleSheet, Linking, ScrollView } from "react-native";
import { useLogin } from "@privy-io/expo/ui";
import Constants from "expo-constants";
import { useState } from "react";
import * as Application from "expo-application";
import { createSharedStyles } from "../shared/Styles";
import { Colors, StyleConstants } from "../constants/Colors";

export default function LoginScreen() {
  const [error, setError] = useState("");
  const { login } = useLogin();
  const sharedStyles = createSharedStyles('light');

  return (
    <View style={styles.container}>
      {/* Header with green gradient */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>♻️ EcoCycle</Text>
        <Text style={styles.subtitle}>Turn E-Waste Into Rewards</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={[sharedStyles.cardElevated, styles.welcomeCard]}>
          <Text style={styles.welcomeTitle}>🌱 Welcome to EcoCycle!</Text>
          <Text style={[sharedStyles.bodyCenter, styles.welcomeText]}>
            Schedule e-waste pickups, earn reward points, and help save the planet. 
            Your crypto wallet is built right in!
          </Text>
        </View>

        {/* Login Card */}
        <View style={[sharedStyles.card, styles.loginCard]}>
          <Text style={[sharedStyles.heading, styles.loginTitle]}>Get Started</Text>
          
          {/* Email Login */}
          <TouchableOpacity
            style={sharedStyles.buttonPrimary}
            onPress={() => {
              login({ loginMethods: ["email"] })
                .then((session) => {
                  console.log("User logged in", session.user);
                  setError("");
                })
                .catch((err) => {
                  setError(JSON.stringify(err.error) as string);
                });
            }}
          >
            <Text style={sharedStyles.buttonTextPrimary}>📧 Continue with Email</Text>
          </TouchableOpacity>
        </View>

        {/* Features Preview */}
        <View style={[sharedStyles.card, styles.featuresCard]}>
          <Text style={[sharedStyles.heading, styles.featuresTitle]}>✨ What you can do:</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={[sharedStyles.body, styles.featureText]}>Schedule e-waste pickups</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={[sharedStyles.body, styles.featureText]}>Earn reward points</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎁</Text>
              <Text style={[sharedStyles.body, styles.featureText]}>Redeem brand coupons</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💰</Text>
              <Text style={[sharedStyles.body, styles.featureText]}>Built-in Solana wallet</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={[sharedStyles.body, styles.featureText]}>AI-powered item recognition</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌍</Text>
              <Text style={[sharedStyles.body, styles.featureText]}>Help save the environment</Text>
            </View>
          </View>
        </View>

        {/* Configuration Info */}
        <View style={[sharedStyles.card, styles.configCard]}>
          <Text style={[sharedStyles.heading, styles.configTitle]}>📱 App Configuration</Text>
          <Text style={[sharedStyles.caption, styles.configText]}>
            App ID: {Application.applicationId}
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `https://dashboard.privy.io/apps/${Constants.expoConfig?.extra?.privyAppId}/settings?setting=clients`
              )
            }
          >
            <Text style={styles.configLink}>🔧 Configure Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={sharedStyles.messageError}>
            <Text style={sharedStyles.messageTextError}>⚠️ {error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: StyleConstants.spacing.lg,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: StyleConstants.fontSize.xxl + 8,
    fontWeight: StyleConstants.fontWeight.bold,
    color: Colors.light.lightText,
    marginBottom: StyleConstants.spacing.sm,
  },
  subtitle: {
    fontSize: StyleConstants.fontSize.md,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
    padding: StyleConstants.spacing.md,
  },
  welcomeCard: {
    alignItems: 'center',
    marginBottom: StyleConstants.spacing.lg,
  },
  welcomeTitle: {
    fontSize: StyleConstants.fontSize.xl,
    fontWeight: StyleConstants.fontWeight.bold,
    color: Colors.light.primary,
    marginBottom: StyleConstants.spacing.md,
  },
  welcomeText: {
    marginBottom: StyleConstants.spacing.sm,
  },
  loginCard: {
    marginBottom: StyleConstants.spacing.lg,
  },
  loginTitle: {
    textAlign: 'center',
  },
  featuresCard: {
    marginBottom: StyleConstants.spacing.lg,
  },
  featuresTitle: {
    textAlign: 'center',
  },
  featuresList: {
    gap: StyleConstants.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: StyleConstants.fontSize.lg,
    marginRight: StyleConstants.spacing.md,
    width: 28,
  },
  featureText: {
    flex: 1,
  },
  configCard: {
    marginBottom: StyleConstants.spacing.lg,
  },
  configTitle: {
    textAlign: 'center',
  },
  configText: {
    marginBottom: StyleConstants.spacing.sm,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  configLink: {
    fontSize: StyleConstants.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: StyleConstants.fontWeight.semibold,
    textAlign: 'center',
  },
});