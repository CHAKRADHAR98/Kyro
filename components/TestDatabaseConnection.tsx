import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { DatabaseService } from '../lib/database';
import { supabase } from '../lib/supabase';
import { createSharedStyles } from '../shared/Styles';
import { Colors, StyleConstants } from '../constants/Colors';

export default function TestDatabaseConnection() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sharedStyles = createSharedStyles('light');

  const addTestResult = (message: string) => {
    console.log('Test:', message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test 1: Basic Supabase Connection
  const testSupabaseConnection = async () => {
    try {
      addTestResult('🔄 Testing Supabase connection...');
      
      const { data, error } = await supabase
        .from('pickup_requests')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      addTestResult('✅ Supabase connection successful!');
      addTestResult(`📊 Found ${data?.length || 0} records in pickup_requests table`);
    } catch (error) {
      addTestResult(`❌ Supabase connection failed: ${error}`);
    }
  };

  // Test 2: Database Service Functions
  const testDatabaseService = async () => {
    try {
      addTestResult('🔄 Testing DatabaseService.getLeaderboard...');
      
      const result = await DatabaseService.getLeaderboard(5);
      
      if (result.success) {
        addTestResult('✅ DatabaseService.getLeaderboard successful!');
        addTestResult(`📊 Found ${result.data?.length || 0} users in leaderboard`);
        
        if (result.data && result.data.length > 0) {
          addTestResult(`👑 Top user: ${result.data[0].user_name} with ${result.data[0].total_points} points`);
        }
      } else {
        addTestResult(`❌ DatabaseService.getLeaderboard failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ DatabaseService test failed: ${error}`);
    }
  };

  // Test 3: Create Test Pickup Request
  const testCreatePickupRequest = async () => {
    try {
      addTestResult('🔄 Testing pickup request creation...');
      
      const testData = {
        user_name: `TestUser_${Date.now()}`,
        user_address: '123 Test Street, Test City',
        waste_type: 'Smartphones & Tablets',
        quantity_kg: 2
      };
      
      const result = await DatabaseService.createPickupRequest(testData);
      
      if (result.success) {
        addTestResult('✅ Pickup request created successfully!');
        addTestResult(`📝 Request ID: ${result.data?.id}`);
        addTestResult(`🏆 Calculated points: ${result.data?.calculated_points}`);
        
        // Test verification update
        if (result.data?.id) {
          await testVerificationUpdate(result.data.id);
        }
      } else {
        addTestResult(`❌ Pickup request creation failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Pickup request test failed: ${error}`);
    }
  };

  // Test 4: Update Verification
  const testVerificationUpdate = async (requestId: number) => {
    try {
      addTestResult('🔄 Testing verification update...');
      
      const result = await DatabaseService.updatePickupVerification(
        requestId,
        'verified',
        { isVerified: true, confidence: 95, reasoning: 'Test verification' }
      );
      
      if (result.success) {
        addTestResult('✅ Verification update successful!');
        addTestResult(`✅ Status: ${result.data?.verification_status}`);
      } else {
        addTestResult(`❌ Verification update failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Verification test failed: ${error}`);
    }
  };

  // Test 5: Points System
  const testPointsSystem = async () => {
    try {
      addTestResult('🔄 Testing points system...');
      
      const testUser = `PointsTestUser_${Date.now()}`;
      
      // Add points
      const result = await DatabaseService.updateUserPoints(testUser, 100);
      
      if (result.success) {
        addTestResult('✅ Points addition successful!');
        addTestResult(`🏆 User: ${result.data?.user_name} now has ${result.data?.total_points} points`);
        
        // Test getting user points
        const getResult = await DatabaseService.getUserPoints(testUser);
        if (getResult.success) {
          addTestResult(`✅ Retrieved points: ${getResult.data?.total_points}`);
        }
      } else {
        addTestResult(`❌ Points system test failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Points test failed: ${error}`);
    }
  };

  // Run All Tests
  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addTestResult('🚀 Starting comprehensive database tests...');
    
    await testSupabaseConnection();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await testDatabaseService();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testCreatePickupRequest();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPointsSystem();
    
    addTestResult('🎉 All tests completed!');
    setIsLoading(false);
  };

  // Auto-run basic test on component mount
  useEffect(() => {
    addTestResult('📱 Test component loaded');
    testSupabaseConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[sharedStyles.title, styles.title]}>🧪 Database Tests</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[sharedStyles.buttonPrimary, styles.button]} 
          onPress={runAllTests}
          disabled={isLoading}
        >
          <Text style={sharedStyles.buttonTextPrimary}>
            {isLoading ? '🔄 Running Tests...' : '🚀 Run All Tests'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[sharedStyles.buttonSecondary, styles.button]} 
          onPress={() => setTestResults([])}
        >
          <Text style={sharedStyles.buttonTextSecondary}>🗑️ Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={[sharedStyles.card, styles.resultsContainer]}>
        <Text style={styles.resultsTitle}>📊 Test Results:</Text>
        <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
          {testResults.length === 0 ? (
            <Text style={styles.noResults}>No test results yet. Run tests above.</Text>
          ) : (
            testResults.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultText}>{result}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View style={[sharedStyles.card, styles.infoCard]}>
        <Text style={styles.infoTitle}>💡 What These Tests Check:</Text>
        <Text style={styles.infoText}>• Database connection to Supabase</Text>
        <Text style={styles.infoText}>• Table access and permissions</Text>
        <Text style={styles.infoText}>• Pickup request creation</Text>
        <Text style={styles.infoText}>• Points calculation system</Text>
        <Text style={styles.infoText}>• Verification workflow</Text>
        <Text style={styles.infoText}>• Leaderboard data retrieval</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: StyleConstants.spacing.md,
    backgroundColor: Colors.light.background,
  },
  title: {
    marginBottom: StyleConstants.spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: StyleConstants.spacing.md,
    marginBottom: StyleConstants.spacing.lg,
  },
  button: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    maxHeight: 400,
  },
  resultsTitle: {
    fontSize: StyleConstants.fontSize.lg,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.primary,
    marginBottom: StyleConstants.spacing.md,
  },
  resultsScroll: {
    flex: 1,
  },
  noResults: {
    textAlign: 'center',
    color: Colors.light.placeholder,
    fontStyle: 'italic',
    marginTop: StyleConstants.spacing.lg,
  },
  resultItem: {
    backgroundColor: Colors.light.background,
    padding: StyleConstants.spacing.sm,
    marginBottom: StyleConstants.spacing.xs,
    borderRadius: StyleConstants.borderRadius,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.secondary,
  },
  resultText: {
    fontSize: StyleConstants.fontSize.sm,
    color: Colors.light.text,
    fontFamily: 'monospace',
  },
  infoCard: {
    marginTop: StyleConstants.spacing.md,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  infoTitle: {
    fontSize: StyleConstants.fontSize.md,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.primary,
    marginBottom: StyleConstants.spacing.sm,
  },
  infoText: {
    fontSize: StyleConstants.fontSize.sm,
    color: Colors.light.text,
    marginBottom: StyleConstants.spacing.xs,
  },
});