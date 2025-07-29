import AuthService from '../services/authService.js';
import StorageService from '../services/storageService.js';
import { validateInput, validationSchemas } from '../utils/validation.js';
import JWTUtils from '../utils/jwt.js';

class AuthController {
  /**
   * Register new user
   */
  static async register(req, res) {
    try {
      const validation = validateInput(validationSchemas.register, req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const { email, password, name } = validation.data;

      // Check if user already exists
      const existingUser = await AuthService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Create user
      const user = await AuthService.createUser({ email, password, name });

      // Generate tokens
      const tokens = AuthService.generateTokens(user);

      // Store refresh token
      await AuthService.storeRefreshToken(user.id, tokens.refreshToken);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            profilePhoto: user.profile_photo,
            createdAt: user.created_at
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: '1h'
          }
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  /**
   * Login user
   */
  static async login(req, res) {
    try {
      const validation = validateInput(validationSchemas.login, req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const { email, password } = validation.data;

      // Find user with password for authentication
      const user = await AuthService.findUserByEmailWithPassword(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await AuthService.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate tokens
      const tokens = AuthService.generateTokens(user);

      // Store refresh token
      await AuthService.storeRefreshToken(user.id, tokens.refreshToken);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            profilePhoto: user.profile_photo,
            profilePictureUrl: user.user_profile?.[0]?.profile_picture_url,
            bio: user.user_profile?.[0]?.bio
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: '1h'
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req, res) {
    try {
      const validation = validateInput(validationSchemas.refreshToken, req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const { refreshToken } = validation.data;

      // Verify refresh token
      const decoded = JWTUtils.verifyToken(refreshToken);
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      // Validate refresh token in database
      const isValidRefreshToken = await AuthService.validateRefreshToken(decoded.userId, refreshToken);
      if (!isValidRefreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired refresh token'
        });
      }

      // Get user
      const user = await AuthService.findUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Generate new access token
      const newAccessToken = JWTUtils.generateAccessToken(user.id, user.email);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          expiresIn: '1h'
        }
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Token refresh failed',
        message: error.message
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req, res) {
    try {
      const userId = req.user.id;
      await AuthService.removeRefreshTokens(userId);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: error.message
      });
    }
  }

  /**
   * Verify token and get user info
   */
  static async verify(req, res) {
    try {
      res.json({
        success: true,
        data: {
          valid: true,
          user: req.user
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Verification failed'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      const user = await AuthService.findUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            profilePhoto: user.profile_photo,
            profilePictureUrl: user.user_profile?.[0]?.profile_picture_url,
            bio: user.user_profile?.[0]?.bio,
            createdAt: user.created_at,
            settings: {
              theme: user.user_settings?.[0]?.theme,
              emailNotifications: user.user_settings?.[0]?.email_notifications,
              twoFactorEnabled: user.user_settings?.[0]?.two_factor_enabled
            }
          }
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    let profilePhotoUrl = null; // Declare at function scope
    
    try {
      const userId = req.user.id;
      
      // Handle file upload if present
      let oldPhotoFileName = null;
      
      if (req.file) {
        // Get current user to find old photo
        const currentUser = await AuthService.findUserById(userId);
        if (currentUser.profile_photo) {
          oldPhotoFileName = StorageService.extractFileNameFromUrl(currentUser.profile_photo);
        }

        // Upload new photo to Supabase Storage
        const uploadResult = await StorageService.uploadProfilePhoto(userId, req.file);
        profilePhotoUrl = uploadResult.publicUrl;
      }

      // Prepare update data
      const updateData = { ...req.body };
      if (profilePhotoUrl) {
        updateData.profilePhoto = profilePhotoUrl;
      }

      // Validate input
      const validation = validateInput(validationSchemas.updateProfile, updateData);
      if (!validation.isValid) {
        // Clean up uploaded file if validation fails
        if (profilePhotoUrl) {
          const fileName = StorageService.extractFileNameFromUrl(profilePhotoUrl);
          await StorageService.deleteProfilePhoto(fileName);
        }
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Check if email is being changed and if it's already taken
      if (validation.data.email) {
        const existingUser = await AuthService.findUserByEmail(validation.data.email);
        if (existingUser && existingUser.id !== userId) {
          // Clean up uploaded file if email is taken
          if (profilePhotoUrl) {
            const fileName = StorageService.extractFileNameFromUrl(profilePhotoUrl);
            await StorageService.deleteProfilePhoto(fileName);
          }
          
          return res.status(409).json({
            success: false,
            error: 'Email is already taken by another user'
          });
        }
      }

      // Update user profile
      const updatedUser = await AuthService.updateProfile(userId, validation.data);

      // Delete old profile photo if we uploaded a new one
      if (profilePhotoUrl && oldPhotoFileName) {
        await StorageService.deleteProfilePhoto(oldPhotoFileName);
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.first_name,
            lastName: updatedUser.last_name,
            profilePhoto: updatedUser.profile_photo,
            profilePictureUrl: updatedUser.user_profile?.[0]?.profile_picture_url,
            bio: updatedUser.user_profile?.[0]?.bio,
            updatedAt: updatedUser.updated_at
          }
        }
      });

    } catch (error) {
      // Clean up uploaded file if there was an error
      if (req.file && profilePhotoUrl) {
        const fileName = StorageService.extractFileNameFromUrl(profilePhotoUrl);
        await StorageService.deleteProfilePhoto(fileName);
      }
      
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        message: error.message
      });
    }
  }

  /**
   * Update user settings
   */
  static async updateSettings(req, res) {
    try {
      const userId = req.user.id;
      
      const validation = validateInput(validationSchemas.updateSettings, req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const updatedSettings = await AuthService.updateSettings(userId, validation.data);

      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: {
          settings: {
            theme: updatedSettings.theme,
            emailNotifications: updatedSettings.email_notifications,
            twoFactorEnabled: updatedSettings.two_factor_enabled
          }
        }
      });

    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update settings',
        message: error.message
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      
      const validation = validateInput(validationSchemas.changePassword, req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const { currentPassword, newPassword } = validation.data;

      // Get user with password hash
      const user = await AuthService.findUserByEmailWithPassword(req.user.email);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await AuthService.comparePassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      await AuthService.updatePassword(userId, newPassword);

      // Remove all refresh tokens to force re-login
      await AuthService.removeRefreshTokens(userId);

      res.json({
        success: true,
        message: 'Password changed successfully. Please log in again.'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password',
        message: error.message
      });
    }
  }
}

export default AuthController;