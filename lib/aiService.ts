import Constants from 'expo-constants';
import { Alert } from 'react-native';
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIVerificationResult {
  isVerified: boolean;
  detectedItems: string[];
  confidence: number;
  reasoning: string;
}

export class AIService {
  private static readonly GEMINI_API_KEY = 
    Constants.expoConfig?.extra?.geminiApiKey || 
    process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  static async verifyEWaste(
    base64Image: string, 
    expectedWasteType: string
  ): Promise<{ success: boolean; result?: AIVerificationResult; error?: string }> {
    
    if (!this.GEMINI_API_KEY) {
      Alert.alert("Error", "API Key Missing in .env.local");
      return { success: false, error: 'API Key missing' };
    }

    // UPDATED: Using models explicitly found in your logs
    const MODELS_TO_TRY = [
      "gemini-2.5-flash",      // Found in your logs!
      "gemini-flash-latest",   // Found in your logs!
      "gemini-2.0-flash-001"   // Found in your logs!
    ];

    // Initialize SDK
    const genAI = new GoogleGenerativeAI(this.GEMINI_API_KEY);

    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`📡 Attempting AI with model: ${modelName}...`);
        
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
          You are an e-waste verification assistant. Analyze this image and determine if it contains "${expectedWasteType}".
          
          Respond with ONLY a valid JSON object in this exact format (no markdown):
          {
            "isVerified": boolean,
            "detectedItems": ["item1", "item2"],
            "confidence": number (0-100),
            "reasoning": "brief explanation"
          }
        `;

        const imagePart = {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg",
          },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const textResponse = response.text();

        console.log(`✅ Success with ${modelName}!`);
        // console.log("📝 Response:", textResponse.substring(0, 50) + "...");

        // Clean and Parse JSON
        const cleanJson = textResponse
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
          
        const parsedResult: AIVerificationResult = JSON.parse(cleanJson);
        
        return { success: true, result: parsedResult };

      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Failed with ${modelName}`);
        
        // If this was the last model, throw the error
        if (modelName === MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
           throw error;
        }
      }
    }

    return { success: false, error: "All models failed" };
  }

  static async imageUriToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to convert blob to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Failed to convert image to base64');
    }
  }
}