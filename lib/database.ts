import { supabase, PickupRequest, UserPoints, calculatePoints } from './supabase';

export class DatabaseService {
  // Create a new pickup request
  static async createPickupRequest(data: {
    user_name: string;
    user_address: string;
    waste_type: string;
    quantity_kg: number;
  }): Promise<{ success: boolean; data?: PickupRequest; error?: string }> {
    try {
      const calculated_points = calculatePoints(data.waste_type, data.quantity_kg);
      
      const { data: result, error } = await supabase
        .from('pickup_requests')
        .insert({
          ...data,
          calculated_points,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { success: false, error: 'Failed to create pickup request' };
    }
  }

  // Update pickup request after AI verification
  static async updatePickupVerification(
    id: number, 
    verification_status: 'verified' | 'rejected',
    ai_verification_result?: any
  ): Promise<{ success: boolean; data?: PickupRequest; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('pickup_requests')
        .update({
          verification_status,
          ai_verification_result,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // If verified, update user points
      if (verification_status === 'verified') {
        await this.updateUserPoints(data.user_name, data.calculated_points);
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update verification' };
    }
  }

  // Update user total points
  static async updateUserPoints(
    user_name: string, 
    points_to_add: number
  ): Promise<{ success: boolean; data?: UserPoints; error?: string }> {
    try {
      // First, try to get existing user points
      const { data: existingUser } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_name', user_name)
        .single();

      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('user_points')
          .update({
            total_points: existingUser.total_points + points_to_add,
            updated_at: new Date().toISOString()
          })
          .eq('user_name', user_name)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data };
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('user_points')
          .insert({
            user_name,
            total_points: points_to_add
          })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data };
      }
    } catch (error) {
      return { success: false, error: 'Failed to update user points' };
    }
  }

  // Get user total points
  static async getUserPoints(user_name: string): Promise<{ success: boolean; data?: UserPoints; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_name', user_name)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { success: false, error: error.message };
      }

      return { success: true, data: data || { user_name, total_points: 0 } };
    } catch (error) {
      return { success: false, error: 'Failed to get user points' };
    }
  }

  // Get user pickup history
  static async getUserPickupHistory(user_name: string): Promise<{ success: boolean; data?: PickupRequest[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*')
        .eq('user_name', user_name)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get pickup history' };
    }
  }

  // Get leaderboard data
  static async getLeaderboard(limit: number = 10): Promise<{ success: boolean; data?: UserPoints[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get leaderboard' };
    }
  }
}