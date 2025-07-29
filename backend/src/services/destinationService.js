import { supabase } from '../config/database.js';

class DestinationService {
  /**
   * Get all destinations for a user
   */
  static async getUserDestinations(userId) {
    const { data, error } = await supabase
      .from('monitored_destinations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch destinations');
    }

    return data;
  }

  /**
   * Get single destination by ID (with user ownership check)
   */
  static async getDestinationById(destinationId, userId) {
    const { data, error } = await supabase
      .from('monitored_destinations')
      .select('*')
      .eq('id', destinationId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error('Failed to fetch destination');
    }

    return data;
  }

  /**
   * Create new destination
   */
  static async createDestination(userId, destinationData) {
    const { location, riskLevel } = destinationData;

    const { data, error } = await supabase
      .from('monitored_destinations')
      .insert([{
        user_id: userId,
        location: location.trim(),
        risk_level: riskLevel,
        last_checked: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to create destination');
    }

    return data;
  }

  /**
   * Update destination - FIXED VERSION
   */
  static async updateDestination(destinationId, userId, updateData) {
    const { location, riskLevel } = updateData;
    
    const updateObject = {
      updated_at: new Date().toISOString()
    };
    
    // Only update fields that are provided
    if (location !== undefined) {
      updateObject.location = location.trim();
    }
    if (riskLevel !== undefined) {
      updateObject.risk_level = riskLevel;
    }

    const { data, error } = await supabase
      .from('monitored_destinations')
      .update(updateObject)
      .eq('id', destinationId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error('Failed to update destination');
    }

    return data;
  }

  /**
   * Delete destination
   */
  static async deleteDestination(destinationId, userId) {
    const { error } = await supabase
      .from('monitored_destinations')
      .delete()
      .eq('id', destinationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to delete destination');
    }

    return true;
  }

  /**
   * Update last checked timestamp
   */
  static async updateLastChecked(destinationId, userId) {
    const { data, error } = await supabase
      .from('monitored_destinations')
      .update({ 
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', destinationId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to update last checked');
    }

    return data;
  }
}

export default DestinationService;