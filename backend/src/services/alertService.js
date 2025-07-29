import { supabase } from '../config/database.js';

// Function to fetch all alerts for a specific user
export async function getUserAlerts(userId, limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('alerts')
    .select('id, title, status, created_at')
    .eq('user_id', userId) // Filter by user_id
    .order('created_at', { ascending: false })  // Sort by latest alerts
    .limit(limit)  // Limit results
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return data;
}

// Create a new alert
export async function createAlert(title, status, type, userId) {
  const { data, error } = await supabase.from('alerts').insert([
    { title, status, type, user_id: userId }
  ]);

  if (error) throw new Error(error.message);

  return data;
}

// Update alert status (e.g., mark as 'read')
export async function updateAlertStatus(alertId, status) {
  const { data, error } = await supabase
    .from('alerts')
    .update({ status })
    .eq('id', alertId)
    .single(); // Only update the specific alert

  if (error) throw new Error(error.message);

  return data;
}

// Delete an alert
export async function deleteAlert(alertId) {
  const { data, error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', alertId)
    .single(); // Delete a single alert

  if (error) throw new Error(error.message);

  return data;
}