import AuthService from '../services/authService.js';
import { validateInput, validationSchemas } from '../utils/validation.js';
import JWTUtils from '../utils/jwt.js';

class AuthController {
  /**
   * Register new user
   */
  static async register(req, res) {
    try {
      // Validate input
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

      // Return success response
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
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
      // Validate input
      const validation = validateInput(validationSchemas.login, req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const { email, password } = validation.data;

      // Find user
      const user = await AuthService.findUserByEmail(email);
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
            name: user.name
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

      // Remove all refresh tokens for user
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
      // User is attached by middleware
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
            name: user.name,
            createdAt: user.created_at
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
}

export default AuthController;