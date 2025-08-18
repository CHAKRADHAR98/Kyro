import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface PickupRequest {
  id?: number;
  user_name: string;
  user_address: string;
  waste_type: string;
  quantity_kg: number;
  calculated_points: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  ai_verification_result?: any;
  created_at?: string;
  updated_at?: string;
}

export interface UserPoints {
  id?: number;
  user_name: string;
  total_points: number;
  updated_at?: string;
}

// Points calculation system
export const POINTS_PER_KG = {
  'Smartphones & Tablets': 50,
  'Laptops & Computers': 30,
  'TVs & Monitors': 25,
  'Batteries & Power Banks': 40,
  'Cables & Chargers': 20,
  'Other Small Appliances': 15,
} as const;

export const calculatePoints = (wasteType: string, quantityKg: number): number => {
  const pointsPerKg = POINTS_PER_KG[wasteType as keyof typeof POINTS_PER_KG] || 10;
  return Math.floor(pointsPerKg * quantityKg);
};