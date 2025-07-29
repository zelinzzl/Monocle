import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // 1. Check Supabase API is reachable
    const { error: authError } = await supabase.auth.getSession();
    if (authError) {
      return res.status(500).json({
        status: 'error',
        message: 'Supabase API unreachable',
        details: authError.message
      });
    }

    // 2. Check Database connectivity via health_check table
    const { data, error: dbError } = await supabase
      .from('health_check')
      .select('message')
      .limit(1);

    if (dbError) {
      return res.status(500).json({
        status: 'error',
        message: 'Database not reachable',
        details: dbError.message
      });
    }

    res.json({
      status: 'ok',
      message: 'Server, Supabase API, and Database are all healthy',
      dbCheck: data[0]?.message === 'OK'
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      details: err.message
    });
  }
});

// This just tests if the health check table is actually just read only
router.post('/test-write', async (req, res) => {
  try {
    const { error } = await supabase
      .from('health_check')
      .insert([{ message: 'TESTING_WRITE' }]);

    if (error) {
      return res.status(403).json({
        status: 'locked',
        message: 'Write access is correctly disabled on health_check table',
        details: error.message
      });
    }

    res.status(500).json({
      status: 'not_locked',
      message: 'Table is writable! Check your policies/permissions'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Route test failed',
      details: err.message
    });
  }
});

export default router;
