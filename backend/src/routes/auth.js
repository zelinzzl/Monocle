import express from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadProfilePhoto, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 login attempts per IP per window
  message: {
    success: false,
    error: 'Too many login attempts. Please try again later.',
    retryAfter: '15 minutes'
  }
});

// Rate limiting for profile updates
const profileLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 profile updates per IP per window
  message: {
    success: false,
    error: 'Too many profile update attempts. Please try again later.',
    retryAfter: '5 minutes'
  }
});

// Public routes (no authentication required)
router.post('/register', authLimiter, (req, res) => AuthController.register(req, res));
router.post('/login', loginLimiter, (req, res) => AuthController.login(req, res));
router.post('/refresh', authLimiter, (req, res) => AuthController.refreshToken(req, res));

// Protected routes (authentication required)
router.post('/logout', authenticateToken, (req, res) => AuthController.logout(req, res));
router.get('/verify', authenticateToken, (req, res) => AuthController.verify(req, res));
router.get('/profile', authenticateToken, (req, res) => AuthController.getProfile(req, res));

// Profile update with optional file upload
router.put('/profile', 
  authenticateToken,           // Auth first
  uploadProfilePhoto,          // Upload middleware (with 10MB limit)
  handleUploadError,           // Error handling
  profileLimiter,              // Rate limit for profile updates
  (req, res) => AuthController.updateProfile(req, res)
);

// Settings update
router.put('/settings', authenticateToken, profileLimiter, (req, res) => AuthController.updateSettings(req, res));

// Password change
router.put('/change-password', authenticateToken, profileLimiter, (req, res) => AuthController.changePassword(req, res));

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

// Add this temporary debug endpoint to your auth routes to test storage
// Add to routes/auth.js

router.post('/debug-storage', authenticateToken, uploadProfilePhoto, handleUploadError, async (req, res) => {
  try {
    console.log('File received:', req.file);
    
    if (!req.file) {
      return res.json({
        success: false,
        error: 'No file uploaded',
        debug: {
          hasFile: !!req.file,
          bodyKeys: Object.keys(req.body)
        }
      });
    }

    // Test Supabase connection
    const { supabase } = await import('../config/database.js');
    
    // List buckets to test connection
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return res.json({
        success: false,
        error: 'Supabase storage connection failed',
        debug: {
          error: bucketsError,
          hasFile: !!req.file,
          fileInfo: req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
          } : null
        }
      });
    }

    // Check if profile-photos bucket exists
    const profileBucket = buckets.find(b => b.name === 'profile-photos');
    
    if (!profileBucket) {
      return res.json({
        success: false,
        error: 'profile-photos bucket not found',
        debug: {
          availableBuckets: buckets.map(b => b.name),
          hasFile: !!req.file
        }
      });
    }

    // Try uploading the file
    const fileName = `test-${Date.now()}.${req.file.originalname.split('.').pop()}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      return res.json({
        success: false,
        error: 'Upload failed',
        debug: {
          uploadError,
          fileName,
          fileInfo: {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            bufferLength: req.file.buffer?.length
          }
        }
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    res.json({
      success: true,
      message: 'Storage test successful',
      debug: {
        uploadData,
        publicUrl: urlData.publicUrl,
        fileName,
        buckets: buckets.map(b => b.name)
      }
    });

  } catch (error) {
    console.error('Debug storage error:', error);
    res.json({
      success: false,
      error: 'Debug test failed',
      debug: {
        errorMessage: error.message,
        errorStack: error.stack,
        hasFile: !!req.file
      }
    });
  }
});

// Updated debug endpoint with correct Supabase syntax
router.get('/debug-db', async (req, res) => {
  try {
    const { supabase } = await import('../config/database.js');
    
    // Test simple query - just get one user record
    const { data, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .limit(1);
    
    if (error) {
      return res.json({
        success: false,
        error: 'Database query failed',
        details: error
      });
    }
    
    res.json({
      success: true,
      message: 'Database connection working',
      userCount: data ? data.length : 0,
      data
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: 'Database connection failed',
      message: error.message
    });
  }
});

export default router;