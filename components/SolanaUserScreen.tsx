import React, { useState, useCallback, useEffect } from "react";
import { 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  StyleSheet,
  Linking 
} from "react-native";
import { 
  Connection, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  Transaction,
  SystemProgram
} from "@solana/web3.js";
import * as Clipboard from 'expo-clipboard';
import {
  usePrivy,
  useEmbeddedSolanaWallet,
  getUserEmbeddedSolanaWallet,
} from "@privy-io/expo";

// Solana network configuration
const SOLANA_NETWORKS = {
  mainnet: "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  testnet: "https://api.testnet.solana.com",
};

export const SolanaUserScreen = () => {
  // CHANGED: Default to "testnet" which is often more stable than "devnet"
  const [currentNetwork, setCurrentNetwork] = useState<keyof typeof SOLANA_NETWORKS>("testnet");
  const [transactionHistory, setTransactionHistory] = useState<string[]>([]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [solAmount, setSolAmount] = useState("0.001");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { logout, user } = usePrivy();
  const { wallets, create } = useEmbeddedSolanaWallet();
  const account = getUserEmbeddedSolanaWallet(user);

  const copyWalletAddress = useCallback(async () => {
    if (!account?.address) return;
    try {
      await Clipboard.setStringAsync(account.address);
      Alert.alert("🎉 Copied!", "Wallet address copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  }, [account?.address]);

  const getBalance = useCallback(async () => {
    if (!account?.address) return;
    
    try {
      const connection = new Connection(SOLANA_NETWORKS[currentNetwork], "confirmed");
      const publicKey = new PublicKey(account.address);
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error: any) {
      // Silently fail on 429/Network errors to avoid annoying the user
      const errStr = String(error);
      if (errStr.includes("429") || errStr.includes("Network request failed")) {
        console.log(`[Silent] Balance fetch skipped due to network limit (${currentNetwork})`);
        return;
      }
      console.error("Error fetching balance:", error);
    }
  }, [account?.address, currentNetwork]);

  const requestAirdrop = useCallback(async () => {
    if (!account?.address || currentNetwork === "mainnet") {
      Alert.alert("ℹ️ Info", "Airdrop only available on devnet/testnet");
      return;
    }
    
    setLoading(true);
    try {
      const connection = new Connection(SOLANA_NETWORKS[currentNetwork], "confirmed");
      const publicKey = new PublicKey(account.address);
      
      console.log("Requesting airdrop...");
      const signature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature);
      
      Alert.alert("🪂 Success!", "1 SOL airdropped to your wallet!");
      
      setTimeout(async () => {
        await getBalance();
      }, 2000);
      
    } catch (error: any) {
      console.log("Airdrop error details:", error);
      const errorString = String(error);
      
      if (errorString.includes("429") || errorString.includes("limit")) {
        Alert.alert(
          "⏳ Faucet Limit", 
          "The public faucet is overloaded. Please try again in 24 hours."
        );
      } else {
        // Offer web alternative if in-app fails
        Alert.alert(
          "⚠️ Request Failed",
          "The in-app faucet is struggling. Try the web faucet?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open Web Faucet", 
              onPress: () => Linking.openURL("https://faucet.solana.com/") 
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  }, [account?.address, currentNetwork, getBalance]);

  const sendSolTransaction = useCallback(async () => {
    if (!wallets || wallets.length === 0 || !account?.address || !recipientAddress || !solAmount) {
      Alert.alert("❌ Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const provider = await wallets[0].getProvider();
      const connection = new Connection(SOLANA_NETWORKS[currentNetwork], "confirmed");
      
      const fromPubkey = new PublicKey(account.address);
      const toPubkey = new PublicKey(recipientAddress);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubkey,
          toPubkey: toPubkey,
          lamports: Math.floor(parseFloat(solAmount) * LAMPORTS_PER_SOL),
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const result = await provider.request({
        method: "signAndSendTransaction",
        params: {
          transaction: transaction,
          connection: connection
        },
      });
      
      if (result && result.signature) {
        const newTransaction = `Sent ${solAmount} SOL | ${result.signature.slice(0, 20)}...`;
        setTransactionHistory((prev) => [newTransaction, ...prev]);
        setRecipientAddress("");
        setSolAmount("0.001");
        
        setTimeout(getBalance, 3000);
        Alert.alert("🚀 Sent!", "Transaction successful");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      Alert.alert("Transaction Failed", "Check balance and connection");
    } finally {
      setLoading(false);
    }
  }, [wallets, account?.address, recipientAddress, solAmount, currentNetwork, getBalance]);

  const createWallet = useCallback(async () => {
    if (!create) return;
    setLoading(true);
    try {
      await create();
      setTimeout(getBalance, 2000);
    } catch (error) {
      console.error("Error creating wallet:", error);
    } finally {
      setLoading(false);
    }
  }, [create, getBalance]);

  // Auto-fetch balance with a slight delay to prevent race conditions on mount
  useEffect(() => {
    if (account?.address) {
      const timer = setTimeout(() => {
        getBalance();
      }, 1000); // 1-second delay before fetching
      return () => clearTimeout(timer);
    }
  }, [account?.address, currentNetwork, getBalance]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Solana Wallet</Text>
        <View style={styles.networkBadge}>
          <Text style={styles.networkText}>🌐 {currentNetwork.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>
            {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : "---"}
          </Text>
          {account?.address && (
            <TouchableOpacity style={styles.refreshButton} onPress={getBalance}>
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Wallet Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔐 Wallet Management</Text>
          {account?.address ? (
            <View>
              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                  {account.address}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.primaryButton} onPress={copyWalletAddress}>
                <Text style={styles.primaryButtonText}>📋 Copy Address</Text>
              </TouchableOpacity>

              {currentNetwork !== "mainnet" && (
                <TouchableOpacity 
                  style={[styles.secondaryButton, loading && styles.disabledButton]} 
                  onPress={requestAirdrop}
                  disabled={loading}
                >
                  <Text style={styles.secondaryButtonText}>
                    {loading ? "Wait..." : "🪂 Get Test SOL"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={createWallet}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? "Creating..." : "✨ Create Wallet"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Network Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐 Network</Text>
          <View style={styles.networkButtons}>
            {Object.keys(SOLANA_NETWORKS).map((network) => (
              <TouchableOpacity
                key={network}
                style={[
                  styles.networkButton,
                  currentNetwork === network && styles.activeNetworkButton
                ]}
                onPress={() => {
                  setCurrentNetwork(network as keyof typeof SOLANA_NETWORKS);
                  setWalletBalance(null);
                }}
                disabled={currentNetwork === network}
              >
                <Text style={[
                  styles.networkButtonText,
                  currentNetwork === network && styles.activeNetworkButtonText
                ]}>
                  {network}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Send SOL Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💸 Send SOL</Text>
          <TextInput
            value={recipientAddress}
            onChangeText={setRecipientAddress}
            placeholder="Recipient Address"
            style={styles.textInput}
            placeholderTextColor="#999"
          />
          <TextInput
            value={solAmount}
            onChangeText={setSolAmount}
            placeholder="Amount"
            keyboardType="numeric"
            style={styles.textInput}
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!recipientAddress || !account?.address || loading) && styles.disabledButton
            ]}
            onPress={sendSolTransaction}
            disabled={!recipientAddress || !account?.address || loading}
          >
            <Text style={styles.sendButtonText}>
              {loading ? "Sending..." : "🚀 Send SOL"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  networkBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  networkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#4a5568',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  addressContainer: {
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addressText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#4a5568',
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFC107',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  networkButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  networkButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  activeNetworkButton: {
    backgroundColor: '#2E7D32',
  },
  networkButtonText: {
    color: '#4a5568',
    fontWeight: '600',
  },
  activeNetworkButtonText: {
    color: 'white',
  },
  textInput: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a0aec0',
  },
  logoutButton: {
    backgroundColor: '#e53e3e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 60,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});