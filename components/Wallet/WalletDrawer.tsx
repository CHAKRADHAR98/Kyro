import React, { useState, useCallback, useEffect } from "react";
import { 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  StyleSheet,
  Modal,
  Animated,
  Dimensions 
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
import { createSharedStyles } from '../../shared/Styles';
import { Colors, StyleConstants } from '../../constants/Colors';

const { width } = Dimensions.get('window');

// Solana network configuration
const SOLANA_NETWORKS = {
  mainnet: "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  testnet: "https://api.testnet.solana.com",
};

interface WalletDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function WalletDrawer({ visible, onClose }: WalletDrawerProps) {
  const [currentNetwork, setCurrentNetwork] = useState<keyof typeof SOLANA_NETWORKS>("devnet");
  const [transactionHistory, setTransactionHistory] = useState<string[]>([]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [solAmount, setSolAmount] = useState("0.001");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(width));

  const { logout, user } = usePrivy();
  const { wallets, create } = useEmbeddedSolanaWallet();
  const account = getUserEmbeddedSolanaWallet(user);
  const sharedStyles = createSharedStyles('light');

  // Animation effect
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Copy wallet address to clipboard
  const copyWalletAddress = useCallback(async () => {
    if (!account?.address) return;
    
    try {
      await Clipboard.setStringAsync(account.address);
      Alert.alert("🎉 Copied!", "Wallet address copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("❌ Error", "Failed to copy address");
    }
  }, [account?.address]);

  // Get wallet balance
  const getBalance = useCallback(async () => {
    if (!account?.address) return;
    
    try {
      const connection = new Connection(SOLANA_NETWORKS[currentNetwork], "confirmed");
      const publicKey = new PublicKey(account.address);
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      Alert.alert("❌ Error", "Failed to fetch wallet balance");
    }
  }, [account?.address, currentNetwork]);

  // Request airdrop for testing
  const requestAirdrop = useCallback(async () => {
    if (!account?.address || currentNetwork === "mainnet") {
      Alert.alert("ℹ️ Info", "Airdrop only available on devnet/testnet");
      return;
    }
    
    setLoading(true);
    try {
      const connection = new Connection(SOLANA_NETWORKS[currentNetwork], "confirmed");
      const publicKey = new PublicKey(account.address);
      
      const signature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature);
      
      Alert.alert("🪂 Success!", "1 SOL airdropped to your wallet!");
      
      setTimeout(async () => {
        await getBalance();
      }, 2000);
      
    } catch (error) {
      console.error("Error requesting airdrop:", error);
      Alert.alert("❌ Error", "Failed to request airdrop. Try again later.");
    } finally {
      setLoading(false);
    }
  }, [account?.address, currentNetwork, getBalance]);

  // Validate Solana address
  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  // Send SOL transaction
  const sendSolTransaction = useCallback(async () => {
    if (!wallets || wallets.length === 0 || !account?.address || !recipientAddress || !solAmount) {
      Alert.alert("❌ Error", "Please fill all fields and ensure wallet is created");
      return;
    }

    if (!isValidSolanaAddress(recipientAddress)) {
      Alert.alert("❌ Error", "Invalid recipient address format");
      return;
    }

    if (parseFloat(solAmount) <= 0) {
      Alert.alert("❌ Error", "Amount must be greater than 0");
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
        const newTransaction = `Sent ${solAmount} SOL to ${recipientAddress.slice(0, 8)}... | ${result.signature.slice(0, 20)}...`;
        setTransactionHistory((prev) => [newTransaction, ...prev]);
        
        setRecipientAddress("");
        setSolAmount("0.001");
        
        setTimeout(async () => {
          await getBalance();
        }, 3000);
        
        Alert.alert(
          "🚀 Transaction Sent!", 
          `Successfully sent ${solAmount} SOL\n\nSignature: ${result.signature.slice(0, 20)}...`
        );
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      
      let errorMessage = "Failed to send transaction";
      if (error instanceof Error) {
        if (error.message.includes("insufficient")) {
          errorMessage = "💸 Insufficient balance for transaction";
        } else if (error.message.includes("blockhash")) {
          errorMessage = "🌐 Network error. Please try again";
        } else {
          errorMessage = `❌ Transaction failed: ${error.message}`;
        }
      }
      
      Alert.alert("Transaction Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [wallets, account?.address, recipientAddress, solAmount, currentNetwork, getBalance]);

  // Switch networks
  const switchNetwork = useCallback(async (network: keyof typeof SOLANA_NETWORKS) => {
    setCurrentNetwork(network);
    setWalletBalance(null);
    
    if (account?.address) {
      setTimeout(() => {
        getBalance();
      }, 1000);
    }
  }, [account?.address, getBalance]);

  // Create wallet
  const createWallet = useCallback(async () => {
    if (!create) {
      Alert.alert("❌ Error", "Wallet creation not available");
      return;
    }
    
    setLoading(true);
    try {
      await create();
      setTimeout(() => {
        getBalance();
      }, 2000);
    } catch (error) {
      console.error("Error creating wallet:", error);
      Alert.alert("❌ Error", "Failed to create wallet");
    } finally {
      setLoading(false);
    }
  }, [create, getBalance]);

  // Auto-fetch balance
  useEffect(() => {
    if (account?.address && visible) {
      getBalance();
    }
  }, [account?.address, currentNetwork, getBalance, visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.drawer, 
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>💰 Solana Wallet</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
            {/* Network Badge */}
            <View style={styles.networkBadge}>
              <Text style={styles.networkText}>🌐 {currentNetwork.toUpperCase()}</Text>
            </View>

            {/* Balance Card */}
            <View style={[sharedStyles.cardElevated, styles.balanceCard]}>
              <Text style={styles.balanceLabel}>Your Balance</Text>
              <Text style={styles.balanceAmount}>
                {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : "Loading..."}
              </Text>
              {account?.address && (
                <TouchableOpacity style={styles.refreshButton} onPress={getBalance}>
                  <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Wallet Card */}
            <View style={[sharedStyles.card, styles.walletCard]}>
              <Text style={[sharedStyles.heading, styles.cardTitle]}>🔐 Wallet Management</Text>
              {account?.address ? (
                <View>
                  <View style={styles.addressContainer}>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {account.address}
                    </Text>
                  </View>
                  
                  <TouchableOpacity style={sharedStyles.buttonPrimary} onPress={copyWalletAddress}>
                    <Text style={sharedStyles.buttonTextPrimary}>📋 Copy Address</Text>
                  </TouchableOpacity>

                  {currentNetwork !== "mainnet" && (
                    <TouchableOpacity 
                      style={[sharedStyles.buttonSecondary, loading && sharedStyles.buttonDisabled]} 
                      onPress={requestAirdrop}
                      disabled={loading}
                    >
                      <Text style={sharedStyles.buttonTextSecondary}>
                        {loading ? "🕒 Getting SOL..." : "🪂 Get Test SOL"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity 
                  style={[sharedStyles.buttonPrimary, loading && sharedStyles.buttonDisabled]}
                  onPress={createWallet}
                  disabled={loading}
                >
                  <Text style={sharedStyles.buttonTextPrimary}>
                    {loading ? "🕒 Creating..." : "✨ Create Wallet"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Network Selection */}
            <View style={[sharedStyles.card, styles.networkCard]}>
              <Text style={[sharedStyles.heading, styles.cardTitle]}>🌐 Network Selection</Text>
              <View style={styles.networkButtons}>
                {Object.keys(SOLANA_NETWORKS).map((network) => (
                  <TouchableOpacity
                    key={network}
                    style={[
                      styles.networkButton,
                      currentNetwork === network && styles.activeNetworkButton
                    ]}
                    onPress={() => switchNetwork(network as keyof typeof SOLANA_NETWORKS)}
                    disabled={currentNetwork === network}
                  >
                    <Text style={[
                      styles.networkButtonText,
                      currentNetwork === network && styles.activeNetworkButtonText
                    ]}>
                      {network} {currentNetwork === network ? "✓" : ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Send SOL Card */}
            <View style={[sharedStyles.card, styles.sendCard]}>
              <Text style={[sharedStyles.heading, styles.cardTitle]}>💸 Send SOL</Text>
              <TextInput
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                placeholder="Recipient address (e.g., 9WzDXw...)"
                style={[sharedStyles.input, styles.input]}
                placeholderTextColor={Colors.light.placeholder}
              />
              <TextInput
                value={solAmount}
                onChangeText={setSolAmount}
                placeholder="Amount in SOL"
                keyboardType="numeric"
                style={[sharedStyles.input, styles.input]}
                placeholderTextColor={Colors.light.placeholder}
              />
              <TouchableOpacity 
                style={[
                  sharedStyles.buttonSuccess,
                  (!recipientAddress || !account?.address || loading) && sharedStyles.buttonDisabled
                ]}
                onPress={sendSolTransaction}
                disabled={!recipientAddress || !account?.address || loading}
              >
                <Text style={sharedStyles.buttonTextPrimary}>
                  {loading ? "🕒 Sending..." : "🚀 Send SOL"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Transaction History */}
            {transactionHistory.length > 0 && (
              <View style={[sharedStyles.card, styles.historyCard]}>
                <Text style={[sharedStyles.heading, styles.cardTitle]}>📜 Recent Transactions</Text>
                {transactionHistory.slice(0, 5).map((tx, index) => (
                  <View key={index} style={styles.transactionItem}>
                    <Text style={styles.transactionText} numberOfLines={2}>
                      {tx}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.85,
    backgroundColor: Colors.light.background,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerHeader: {
    backgroundColor: Colors.light.primary,
    padding: StyleConstants.spacing.lg,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: StyleConstants.fontSize.xl,
    fontWeight: StyleConstants.fontWeight.bold,
    color: Colors.light.lightText,
  },
  closeButton: {
    padding: StyleConstants.spacing.sm,
  },
  closeButtonText: {
    fontSize: StyleConstants.fontSize.lg,
    color: Colors.light.lightText,
    fontWeight: StyleConstants.fontWeight.bold,
  },
  drawerContent: {
    flex: 1,
    padding: StyleConstants.spacing.md,
  },
  networkBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: StyleConstants.spacing.md,
    paddingVertical: StyleConstants.spacing.sm,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: StyleConstants.spacing.md,
  },
  networkText: {
    color: Colors.light.primary,
    fontSize: StyleConstants.fontSize.sm,
    fontWeight: StyleConstants.fontWeight.semibold,
  },
  balanceCard: {
    alignItems: 'center',
    marginBottom: StyleConstants.spacing.md,
  },
  balanceLabel: {
    fontSize: StyleConstants.fontSize.md,
    color: Colors.light.placeholder,
    marginBottom: StyleConstants.spacing.sm,
  },
  balanceAmount: {
    fontSize: StyleConstants.fontSize.xxl,
    fontWeight: StyleConstants.fontWeight.bold,
    color: Colors.light.primary,
    marginBottom: StyleConstants.spacing.md,
  },
  refreshButton: {
    backgroundColor: Colors.light.border,
    paddingHorizontal: StyleConstants.spacing.lg,
    paddingVertical: StyleConstants.spacing.sm,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: Colors.light.text,
    fontWeight: StyleConstants.fontWeight.semibold,
    fontSize: StyleConstants.fontSize.sm,
  },
  walletCard: {
    marginBottom: StyleConstants.spacing.md,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: StyleConstants.spacing.md,
  },
  addressContainer: {
    backgroundColor: Colors.light.background,
    padding: StyleConstants.spacing.md,
    borderRadius: StyleConstants.borderRadius,
    marginBottom: StyleConstants.spacing.md,
  },
  addressText: {
    fontFamily: 'monospace',
    fontSize: StyleConstants.fontSize.xs,
    color: Colors.light.text,
    textAlign: 'center',
  },
  networkCard: {
    marginBottom: StyleConstants.spacing.md,
  },
  networkButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: StyleConstants.spacing.sm,
  },
  networkButton: {
    backgroundColor: Colors.light.border,
    paddingHorizontal: StyleConstants.spacing.md,
    paddingVertical: StyleConstants.spacing.sm,
    borderRadius: 20,
    marginBottom: StyleConstants.spacing.sm,
  },
  activeNetworkButton: {
    backgroundColor: Colors.light.primary,
  },
  networkButtonText: {
    color: Colors.light.text,
    fontWeight: StyleConstants.fontWeight.semibold,
    fontSize: StyleConstants.fontSize.sm,
  },
  activeNetworkButtonText: {
    color: Colors.light.lightText,
  },
  sendCard: {
    marginBottom: StyleConstants.spacing.md,
  },
  input: {
    marginBottom: StyleConstants.spacing.sm,
  },
  historyCard: {
    marginBottom: StyleConstants.spacing.md,
  },
  transactionItem: {
    backgroundColor: Colors.light.background,
    padding: StyleConstants.spacing.md,
    borderRadius: StyleConstants.borderRadius,
    marginBottom: StyleConstants.spacing.sm,
  },
  transactionText: {
    fontFamily: 'monospace',
    fontSize: StyleConstants.fontSize.xs,
    color: Colors.light.text,
  },
  logoutButton: {
    backgroundColor: Colors.light.error,
    padding: StyleConstants.spacing.md,
    borderRadius: StyleConstants.borderRadius,
    alignItems: 'center',
    marginTop: StyleConstants.spacing.lg,
    marginBottom: StyleConstants.spacing.xl,
  },
  logoutButtonText: {
    color: Colors.light.lightText,
    fontSize: StyleConstants.fontSize.md,
    fontWeight: StyleConstants.fontWeight.semibold,
  },
});