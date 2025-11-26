import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { DatabaseService } from '../../lib/database';
import { AIService } from '../../lib/aiService';
import { calculatePoints } from '../../lib/supabase';
import { usePrivy } from '@privy-io/expo';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const EWASTE_CATEGORIES = [
  'Smartphones & Tablets',
  'Laptops & Computers',
  'TVs & Monitors',
  'Batteries & Power Banks',
  'Cables & Chargers',
  'Other Small Appliances',
];

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
  const [estimatedPoints, setEstimatedPoints] = useState<number>(0);
  const [successMode, setSuccessMode] = useState(false);

  const { user } = usePrivy();

  React.useEffect(() => {
    const points = calculatePoints(formData.category, formData.weight);
    setEstimatedPoints(points);
  }, [formData.category, formData.weight]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFormData(prev => ({ ...prev, photo: result.assets[0] }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  }, []);

  const analyzeAndVerifyImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const { success, result, error } = await AIService.verifyEWaste(
        base64Image, 
        formData.category
      );
      
      if (!success || !result) throw new Error(error || 'AI verification failed');
      return { verified: result.isVerified, aiResult: result };
    } catch (error) {
      Alert.alert("AI Error", error instanceof Error ? error.message : "Unknown error");
      return { verified: false, aiResult: null };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.address || !formData.photo) {
      Alert.alert('Wait!', 'Please fill in all fields and add a photo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const base64Image = await AIService.imageUriToBase64(formData.photo.uri);
      const imageUrl = await DatabaseService.uploadImage(base64Image);
      
      if (!imageUrl) throw new Error('Image upload failed');

      const createResult = await DatabaseService.createPickupRequest({
        user_name: formData.name,
        user_address: formData.address,
        waste_type: formData.category,
        quantity_kg: formData.weight,
        image_url: imageUrl
      });

      if (!createResult.success || !createResult.data) throw new Error('Database error');

      const { verified, aiResult } = await analyzeAndVerifyImage(base64Image);

      await DatabaseService.updatePickupVerification(
        createResult.data.id!,
        verified ? 'verified' : 'rejected',
        aiResult
      );

      if (verified) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setSuccessMode(true);
      } else {
        Alert.alert("Verification Failed", "The AI could not match the image to the category.");
      }

    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  if (successMode) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.successCard]}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color="white" />
          </View>
          <Text style={styles.successTitle}>Pickup Scheduled!</Text>
          <Text style={styles.successText}>
            You've earned <Text style={{fontWeight:'bold', color: Colors.light.primary}}>{estimatedPoints} Points</Text> pending pickup.
          </Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              setSuccessMode(false);
              setFormData(prev => ({...prev, photo: null, address: ''}));
            }}
          >
            <Text style={styles.resetText}>Schedule Another</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Schedule Pickup</Text>
      
      <View style={styles.card}>
        {/* Category Select */}
        <TouchableOpacity 
          style={styles.categorySelector}
          onPress={() => {
            Alert.alert('Select Category', '', EWASTE_CATEGORIES.map(cat => ({
              text: cat, onPress: () => handleInputChange('category', cat)
            })));
          }}
        >
          <View>
            <Text style={styles.label}>E-Waste Category</Text>
            <Text style={styles.selectedValue}>{formData.category}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {/* Weight Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Approx. Weight ({formData.weight} kg)</Text>
          <View style={styles.weightRow}>
            {[1, 5, 10, 15].map(w => (
              <TouchableOpacity 
                key={w} 
                style={[styles.weightBtn, formData.weight === w && styles.weightBtnActive]}
                onPress={() => handleInputChange('weight', w)}
              >
                <Text style={[styles.weightText, formData.weight === w && styles.weightTextActive]}>{w}kg</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(t) => handleInputChange('name', t)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Pickup Address"
            value={formData.address}
            onChangeText={(t) => handleInputChange('address', t)}
            multiline
          />
        </View>

        {/* Photo Upload */}
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          {formData.photo ? (
            <Image source={{ uri: formData.photo.uri }} style={styles.previewImage} />
          ) : (
            <>
              <View style={styles.photoIconCircle}>
                <Ionicons name="camera" size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.photoText}>Tap to AI Verify Photo</Text>
            </>
          )}
          {formData.photo && (
            <View style={styles.changePhotoOverlay}>
              <Ionicons name="refresh" size={20} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {/* Points Badge */}
        <View style={styles.pointsBadge}>
          <Ionicons name="trophy" size={16} color="#F57C00" />
          <Text style={styles.pointsText}>Est. Rewards: {estimatedPoints} pts</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity 
          style={[styles.submitBtn, (isSubmitting || isAnalyzing) && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={isSubmitting || isAnalyzing}
        >
          {isSubmitting || isAnalyzing ? (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <ActivityIndicator color="white" />
              <Text style={styles.submitText}>
                {isAnalyzing ? "AI Verifying..." : "Uploading..."}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitText}>Confirm Pickup Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  weightRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  weightBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  weightBtnActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  weightText: {
    fontSize: 14,
    color: '#666',
  },
  weightTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16,
    paddingVertical: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  photoButton: {
    height: 140,
    backgroundColor: '#F0F8F0',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  photoIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
  },
  pointsText: {
    color: '#F57C00',
    fontWeight: '700',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: {
    backgroundColor: '#A5D6A7',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.success,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
  },
  resetText: {
    color: '#666',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 10,
  }
});