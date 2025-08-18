import Constants from 'expo-constants';

export interface AIVerificationResult {
  isVerified: boolean;
  detectedItems: string[];
  confidence: number;
  reasoning: string;
}

export class AIService {
  private static readonly GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey;
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  static async verifyEWaste(
    base64Image: string, 
    expectedWasteType: string
  ): Promise<{ success: boolean; result?: AIVerificationResult; error?: string }> {
    try {
      if (!this.GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      const prompt = `
        You are an e-waste verification assistant. Analyze this image and determine if it contains "${expectedWasteType}".
        
        Respond with ONLY a valid JSON object in this exact format:
        {
          "isVerified": boolean,
          "detectedItems": ["item1", "item2"],
          "confidence": number (0-100),
          "reasoning": "brief explanation"
        }
        
        Rules:
        - isVerified: true only if you can clearly see items that match "${expectedWasteType}"
        - detectedItems: list what e-waste items you can identify
        - confidence: how confident you are (0-100)
        - reasoning: brief explanation of your decision
        
        E-waste categories:
        - Smartphones & Tablets: phones, tablets, mobile devices
        - Laptops & Computers: laptops, desktops, keyboards, mice
        - TVs & Monitors: televisions, computer monitors, displays
        - Batteries & Power Banks: batteries, power banks, UPS
        - Cables & Chargers: charging cables, adapters, power cables
        - Other Small Appliances: small electronic devices, gadgets
      `;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      };

      const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      
      // Try to parse JSON from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const result: AIVerificationResult = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (typeof result.isVerified !== 'boolean' || 
          !Array.isArray(result.detectedItems) ||
          typeof result.confidence !== 'number' ||
          typeof result.reasoning !== 'string') {
        throw new Error('Invalid AI response structure');
      }

      return { success: true, result };

    } catch (error) {
      console.error('AI Verification Error:', error);
      
      // Fallback for development/testing
      if (__DEV__) {
        console.log('Using fallback verification for development');
        return {
          success: true,
          result: {
            isVerified: Math.random() > 0.3, // 70% success rate for testing
            detectedItems: [expectedWasteType],
            confidence: Math.floor(Math.random() * 30) + 70, // 70-100% confidence
            reasoning: 'Development mode: simulated verification'
          }
        };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'AI verification failed' 
      };
    }
  }

  // Helper function to convert image URI to base64
  static async imageUriToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Failed to convert image to base64');
    }
  }
}