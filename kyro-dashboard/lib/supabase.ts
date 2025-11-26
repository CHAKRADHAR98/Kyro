import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types based on your SQL schema
export interface PickupRequest {
  id: number;
  user_name: string;
  user_address: string;
  waste_type: string;
  quantity_kg: number;
  calculated_points: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  image_url: string;
  created_at: string;
  ai_verification_result?: any;
}

export interface UserPoints {
  id: number;
  user_name: string;
  total_points: number;
}