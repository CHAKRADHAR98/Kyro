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

  const sharedStyles = createSharedStyles('light');

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = useCallback(async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, photo: result.assets[0] }));
        analyzeImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  }, []);

  const analyzeImage = useCallback(async (asset: ImagePicker.ImagePickerAsset) => {
    setIsAnalyzing(true);
    setMessage({ type: 'info', text: 'AI is analyzing your e-waste... 🤖' });
    
    try {
      // Note: In a real implementation, you would:
      // 1. Upload the image to your backend
      // 2. Process it with Gemini API on your server
      // 3. Return the results
      // For this demo, we'll simulate the analysis
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Mock AI response
      const mockAnalysis = {
        category: EWASTE_CATEGORIES[Math.floor(Math.random() * EWASTE_CATEGORIES.length)],
        estimatedWeight: Math.floor(Math.random() * 20) + 1,
      };
      
      setFormData(prev => ({
        ...prev,
        category: mockAnalysis.category,
        weight: mockAnalysis.estimatedWeight,
      }));
      
      setMessage({ type: 'success', text: 'AI analysis complete! Please verify the details.' });
    } catch (error) {
      console.error('Error analyzing image:', error);
      setMessage({ type: 'error', text: 'AI analysis failed. Please enter details manually.' });
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.address) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: 'info', text: 'Submitting your request...' });

    try {
      // Mock API call - in real implementation, send to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Form Submitted:', formData);
      
      setMessage({ type: 'success', text: 'Success! Your pickup is scheduled. We will contact you shortly.' });
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        category: EWASTE_CATEGORIES[0],
        weight: 5,
        photo: null,
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({ type: 'error', text: 'Failed to submit request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

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

        {/* Photo Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upload Photo (Optional, for AI analysis)</Text>
          <TouchableOpacity 
            style={styles.photoUploadButton} 
            onPress={pickImage}
            disabled={isAnalyzing}
          >
            <Text style={styles.photoUploadText}>
              {isAnalyzing 
                ? '🤖 Analyzing...' 
                : formData.photo 
                ? `📷 Selected: ${formData.photo.fileName || 'Image'}` 
                : '📷 Click to upload an image'
              }
            </Text>
          </TouchableOpacity>
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

        {/* Message Display */}
        {renderMessage()}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            sharedStyles.buttonPrimary,
            (isSubmitting || isAnalyzing) && sharedStyles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || isAnalyzing}
        >
          <Text style={sharedStyles.buttonTextPrimary}>
            {isSubmitting ? '🕒 Submitting...' : '📱 Request Pickup'}
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
});