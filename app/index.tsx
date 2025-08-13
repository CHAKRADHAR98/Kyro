import { SafeAreaView, Text, View } from "react-native";
import Constants from "expo-constants";
import LoginScreen from "@/components/LoginScreen";
import { usePrivy } from "@privy-io/expo";
import EcoWasteMainScreen from "@/components/EcoWaste/EcoWasteMainScreen";
import { createSharedStyles } from "@/shared/Styles";

export default function Index() {
  const { user } = usePrivy();
  const sharedStyles = createSharedStyles('light');

  // Check if Privy configuration is valid
  if ((Constants.expoConfig?.extra?.privyAppId as string).length !== 25) {
    return (
      <SafeAreaView style={sharedStyles.safeArea}>
        <View style={sharedStyles.center}>
          <Text style={sharedStyles.body}>
            You have not set a valid `privyAppId` in app.json
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    !(Constants.expoConfig?.extra?.privyClientId as string).startsWith(
      "client-"
    )
  ) {
    return (
      <SafeAreaView style={sharedStyles.safeArea}>
        <View style={sharedStyles.center}>
          <Text style={sharedStyles.body}>
            You have not set a valid `privyClientId` in app.json
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main app routing: show LoginScreen if not authenticated, EcoWasteMainScreen if authenticated
  return !user ? <LoginScreen /> : <EcoWasteMainScreen />;
}