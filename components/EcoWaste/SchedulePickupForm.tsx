import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createSharedStyles } from '../../shared/Styles';
import { Colors, StyleConstants } from '../../constants/Colors';
import { DatabaseService } from '../../lib/database';
import { AIService } from '../../lib/aiService';
import { calculatePoints } from '../../lib/supabase';
import { usePrivy } from '@privy-io/expo';

const EWASTE_CATEGORIES = [
  'Smartphones & Tablets',
  'Laptops & Computers',
  'TVs & Monitors',
  'Batteries & Power Banks',
  'Cables & Chargers',
  'Other Small Appliances',
];

interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

export default function SchedulePickupForm() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    category: EWASTE_CATEGORIES[0],
    weight: 5,
    photo: null as ImagePicker.ImagePickerAsset | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [estimatedPoints, setEstimatedPoints] = useState<number>(0);

  const sharedStyles = createSharedStyles('light');
  const { user } = usePrivy();

  // Get current user name (same logic as other components)
  const getCurrentUserName = (): string => {
    if (user?.linked_accounts) {
      const emailAccount = user.linked_accounts.find(account => account.type === 'email');
      if (emailAccount && 'address' in emailAccount && emailAccount.address) {
        const email = emailAccount.address;
        const namePart = email.split('@')[0];
        
        if (namePart.includes('.')) {
          return namePart.split('.').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          ).join(' ');
        }
        
        return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
      }
      
      const firstAccount = user.linked_accounts[0];
      if (firstAccount) {
        if ('phoneNumber' in firstAccount && firstAccount.phoneNumber) return firstAccount.phoneNumber;
        if ('username' in firstAccount && firstAccount.username) return firstAccount.username;
        if ('custom_user_id' in firstAccount && firstAccount.custom_user_id) return firstAccount.custom_user_id;
        if ('address' in firstAccount && firstAccount.address) return firstAccount.address;
      }
    }
    
    return 'Komati Chakradhar'; // Fallback to your database entry
  };

  // Auto-fill user name when component loads
  React.useEffect(() => {
    const userName = getCurrentUserName();
    setFormData(prev => ({ ...prev, name: userName }));
  }, [user]);

  // Calculate points whenever category or weight changes
  React.useEffect(() => {
    const points = calculatePoints(formData.category, formData.weight);
    setEstimatedPoints(points);
  }, [formData.category, formData.weight]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Reduce quality for faster upload
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, photo: result.assets[0] }));
        setMessage({ type: 'info', text: 'Photo selected. Ready for verification!' });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  }, []);

  const analyzeAndVerifyImage = useCallback(async (photoUri: string) => {
    setIsAnalyzing(true);
    setMessage({ type: 'info', text: 'AI is verifying your e-waste... 🤖' });
    
    try {
      // Convert image to base64
      const base64Image = await AIService.imageUriToBase64(photoUri);
      
      // Get AI verification
      const { success, result, error } = await AIService.verifyEWaste(
        base64Image, 
        formData.category
      );
      
      if (!success || !result) {
        throw new Error(error || 'AI verification failed');
      }
      
      if (result.isVerified) {
        setMessage({ 
          type: 'success', 
          text: `✅ Verification successful! Confidence: ${result.confidence}%` 
        });
        return { verified: true, aiResult: result };
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ Verification failed: ${result.reasoning}` 
        });
        return { verified: false, aiResult: result };
      }
    } catch (error) {
      console.error('Error during AI verification:', error);
      setMessage({ 
        type: 'error', 
        text: 'AI verification failed. Please try again or contact support.' 
      });
      return { verified: false, aiResult: null };
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData.category]);

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!formData.name.trim() || !formData.address.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (!formData.photo) {
      Alert.alert('Photo Required', 'Please upload a photo for verification');
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: 'info', text: 'Processing your request...' });

    try {
      // Step 1: Create pickup request in database
      const createResult = await DatabaseService.createPickupRequest({
        user_name: formData.name.trim(),
        user_address: formData.address.trim(),
        waste_type: formData.category,
        quantity_kg: formData.weight,
      });

      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.error || 'Failed to create pickup request');
      }

      const pickupRequestId = createResult.data.id!;

      // Step 2: Verify image with AI
      const { verified, aiResult } = await analyzeAndVerifyImage(formData.photo.uri);

      // Step 3: Update pickup request with verification result
      const updateResult = await DatabaseService.updatePickupVerification(
        pickupRequestId,
        verified ? 'verified' : 'rejected',
        aiResult
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update verification');
      }

      // Step 4: Show success message
      if (verified) {
        setMessage({ 
          type: 'success', 
          text: `🎉 Success! Your pickup is scheduled and you've earned ${estimatedPoints} points!` 
        });
        
        // Reset form
        setFormData({
          name: '',
          address: '',
          category: EWASTE_CATEGORIES[0],
          weight: 5,
          photo: null,
        });
        
        Alert.alert(
          'Pickup Scheduled!', 
          `Your e-waste pickup has been verified and scheduled.\n\nPoints earned: ${estimatedPoints}\n\nWe will contact you shortly to arrange the pickup.`
        );
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Verification failed. Your pickup request has been recorded but points will not be awarded until verification passes.' 
        });
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to submit request. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, estimatedPoints, analyzeAndVerifyImage]);

  const renderMessage = () => {
    if (!message) return null;

    const messageStyle = message.type === 'success' 
      ? sharedStyles.messageSuccess 
      : message.type === 'error' 
      ? sharedStyles.messageError 
      : sharedStyles.messageInfo;

    const textStyle = message.type === 'success'
      ? sharedStyles.messageTextSuccess
      : message.type === 'error'
      ? sharedStyles.messageTextError
      : sharedStyles.messageTextInfo;

    return (
      <View style={messageStyle}>
        <Text style={textStyle}>{message.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={sharedStyles.title}>Schedule a Free Pickup</Text>
      
      <View style={[sharedStyles.cardElevated, styles.formCard]}>
        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[sharedStyles.input, styles.input]}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.light.placeholder}
          />
        </View>

        {/* Address Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Address *</Text>
          <TextInput
            style={[sharedStyles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            placeholder="Enter your complete address"
            placeholderTextColor={Colors.light.placeholder}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-Waste Category</Text>
          <TouchableOpacity 
            style={[sharedStyles.input, styles.pickerContainer]}
            onPress={() => {
              Alert.alert(
                'Select Category',
                'Choose e-waste category',
                EWASTE_CATEGORIES.map((cat) => ({
                  text: cat,
                  onPress: () => handleInputChange('category', cat)
                }))
              );
            }}
          >
            <View style={styles.pickerButton}>
              <Text style={styles.pickerText}>{formData.category}</Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Weight Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Estimated Weight: {formData.weight} kg</Text>
          
          <View style={styles.weightButtons}>
            {[1, 5, 10, 15, 25, 50].map(weight => (
              <TouchableOpacity
                key={weight}
                style={[
                  styles.weightButton,
                  formData.weight === weight && styles.weightButtonActive
                ]}
                onPress={() => handleInputChange('weight', weight)}
              >
                <Text style={[
                  styles.weightButtonText,
                  formData.weight === weight && styles.weightButtonTextActive
                ]}>
                  {weight}kg
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Points Preview */}
        <View style={styles.pointsPreview}>
          <Text style={styles.pointsText}>
            🏆 Estimated Points: {estimatedPoints}
          </Text>
        </View>

        {/* Photo Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upload Photo for Verification *</Text>
          <TouchableOpacity 
            style={styles.photoUploadButton} 
            onPress={pickImage}
            disabled={isAnalyzing || isSubmitting}
          >
            <Text style={styles.photoUploadText}>
              {formData.photo 
                ? `📷 Selected: ${formData.photo.fileName || 'Image'}` 
                : '📷 Click to upload an image'
              }
            </Text>
          </TouchableOpacity>
        </View>

        {/* Message Display */}
        {renderMessage()}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            sharedStyles.buttonPrimary,
            (isSubmitting || isAnalyzing || !formData.photo) && sharedStyles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || isAnalyzing || !formData.photo}
        >
          <Text style={sharedStyles.buttonTextPrimary}>
            {isSubmitting 
              ? '🕒 Processing...' 
              : isAnalyzing 
              ? '🤖 Analyzing...' 
              : '📱 Request Pickup'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: StyleConstants.spacing.md,
    marginVertical: StyleConstants.spacing.lg,
  },
  formCard: {
    padding: StyleConstants.spacing.xl,
  },
  inputGroup: {
    marginBottom: StyleConstants.spacing.lg,
  },
  label: {
    fontSize: StyleConstants.fontSize.md,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: StyleConstants.spacing.sm,
  },
  input: {
    minHeight: 50,
  },
  textArea: {
    minHeight: 80,
    paddingTop: StyleConstants.spacing.md,
  },
  photoUploadButton: {
    borderWidth: 2,
    borderColor: Colors.light.secondary,
    borderStyle: 'dashed',
    borderRadius: StyleConstants.borderRadius,
    padding: StyleConstants.spacing.xl,
    alignItems: 'center',
    backgroundColor: '#F0FFF0',
  },
  photoUploadText: {
    fontSize: StyleConstants.fontSize.md,
    color: Colors.light.secondary,
    fontWeight: '500',
  },
  pickerContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: StyleConstants.spacing.md,
    paddingVertical: StyleConstants.spacing.md,
  },
  pickerText: {
    fontSize: StyleConstants.fontSize.md,
    color: Colors.light.text,
  },
  pickerArrow: {
    fontSize: StyleConstants.fontSize.sm,
    color: Colors.light.placeholder,
  },
  weightButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: StyleConstants.spacing.sm,
    marginTop: StyleConstants.spacing.md,
  },
  weightButton: {
    paddingHorizontal: StyleConstants.spacing.md,
    paddingVertical: StyleConstants.spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.light.border,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: 60,
    alignItems: 'center',
  },
  weightButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  weightButtonText: {
    fontSize: StyleConstants.fontSize.sm,
    color: Colors.light.text,
    fontWeight: '500',
  },
  weightButtonTextActive: {
    color: Colors.light.lightText,
  },
  pointsPreview: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: StyleConstants.spacing.md,
    borderRadius: StyleConstants.borderRadius,
    marginBottom: StyleConstants.spacing.md,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: StyleConstants.fontSize.lg,
    fontWeight: StyleConstants.fontWeight.semibold,
    color: Colors.light.primary,
  },
});