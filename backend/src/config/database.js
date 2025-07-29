import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.error('Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};