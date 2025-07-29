import bcrypt from "bcryptjs";
import { supabase } from "../config/database.js";
import JWTUtils from "../utils/jwt.js";

class AuthService {
  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Check if user exists by email (with profile data)
   */
  static async findUserByEmail(email) {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id, 
        email, 
        first_name, 
        last_name, 
        profile_photo, 
        created_at,
        user_profile (
          bio,
          profile_picture_url
        )
      `)
      .eq("email", email.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error("Database error while finding user");
    }

    return data;
  }

  /**
   * Check if user exists by email with password hash (for login)
   */
  static async findUserByEmailWithPassword(email) {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id, 
        email, 
        first_name, 
        last_name, 
        password_hash, 
        profile_photo, 
        created_at,
        user_profile (
          bio,
          profile_picture_url
        )
      `)
      .eq("email", email.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error("Database error while finding user");
    }

    return data;
  }

  /**
   * Find user by ID (with profile data)
   */
  static async findUserById(userId) {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id, 
        email, 
        first_name, 
        last_name, 
        profile_photo, 
        created_at,
        user_profile (
          bio,
          profile_picture_url
        ),
        user_settings (
          theme,
          email_notifications,
          two_factor_enabled
        )
      `)
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error("Database error while finding user");
    }

    return data;
  }

  /**
   * Create new user (with profile and settings)
   */
  static async createUser(userData) {
    const { email, password, name } = userData;

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Parse name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Insert user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase(),
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
        },
      ])
      .select("id, email, first_name, last_name, profile_photo, created_at")
      .single();

    if (userError) {
      if (userError.code === "23505") {
        throw new Error("User with this email already exists");
      }
      throw new Error("Failed to create user");
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from("user_profile")
      .insert([
        {
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
        },
      ]);

    if (profileError) {
      console.warn("Failed to create user profile:", profileError);
    }

    // Create user settings with defaults
    const { error: settingsError } = await supabase
      .from("user_settings")
      .insert([
        {
          user_id: user.id,
          theme: 'dark',
          email_notifications: true,
          two_factor_enabled: false,
        },
      ]);

    if (settingsError) {
      console.warn("Failed to create user settings:", settingsError);
    }

    return user;
  }

  /**
   * Update user profile (handles both users table and user_profile table)
   */
  static async updateProfile(userId, updateData) {
    const usersTableFields = ['email', 'firstName', 'lastName', 'profilePhoto'];
    const profileTableFields = ['bio', 'profilePictureUrl'];
    
    const usersUpdate = { updated_at: new Date().toISOString() };
    const profileUpdate = { updated_at: new Date().toISOString() };

    // Map frontend field names to database column names for users table
    const usersFieldMapping = {
      firstName: 'first_name',
      lastName: 'last_name',
      profilePhoto: 'profile_photo'
    };

    // Map frontend field names to database column names for profile table
    const profileFieldMapping = {
      profilePictureUrl: 'profile_picture_url'
    };

    // Separate updates for different tables
    let hasUsersUpdate = false;
    let hasProfileUpdate = false;

    Object.keys(updateData).forEach(key => {
      if (usersTableFields.includes(key) && updateData[key] !== undefined) {
        const dbField = usersFieldMapping[key] || key;
        if (key === 'email') {
          usersUpdate[dbField] = updateData[key].toLowerCase();
        } else {
          usersUpdate[dbField] = updateData[key];
        }
        hasUsersUpdate = true;
      } else if (profileTableFields.includes(key) && updateData[key] !== undefined) {
        const dbField = profileFieldMapping[key] || key;
        profileUpdate[dbField] = updateData[key];
        hasProfileUpdate = true;
      }
    });

    // Update users table if needed
    if (hasUsersUpdate) {
      const { error: usersError } = await supabase
        .from("users")
        .update(usersUpdate)
        .eq("id", userId);

      if (usersError) {
        if (usersError.code === "23505") {
          throw new Error("Email is already taken by another user");
        }
        throw new Error("Failed to update user information");
      }
    }

    // Update user_profile table if needed
    if (hasProfileUpdate) {
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from("user_profile")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: profileError } = await supabase
          .from("user_profile")
          .update(profileUpdate)
          .eq("user_id", userId);

        if (profileError) {
          console.warn("Failed to update user profile:", profileError);
        }
      } else {
        // Create new profile
        const { error: profileError } = await supabase
          .from("user_profile")
          .insert([{ user_id: userId, ...profileUpdate }]);

        if (profileError) {
          console.warn("Failed to create user profile:", profileError);
        }
      }
    }

    // Return updated user data
    return await this.findUserById(userId);
  }

  /**
   * Update user settings
   */
  static async updateSettings(userId, settingsData) {
    const allowedFields = ['theme', 'emailNotifications', 'twoFactorEnabled'];
    const updateObject = { updated_at: new Date().toISOString() };

    const fieldMapping = {
      emailNotifications: 'email_notifications',
      twoFactorEnabled: 'two_factor_enabled'
    };

    Object.keys(settingsData).forEach(key => {
      if (allowedFields.includes(key) && settingsData[key] !== undefined) {
        const dbField = fieldMapping[key] || key;
        updateObject[dbField] = settingsData[key];
      }
    });

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from("user_settings")
        .update(updateObject)
        .eq("user_id", userId)
        .select("*")
        .single();

      if (error) {
        throw new Error("Failed to update user settings");
      }
      return data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from("user_settings")
        .insert([{ user_id: userId, ...updateObject }])
        .select("*")
        .single();

      if (error) {
        throw new Error("Failed to create user settings");
      }
      return data;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(userId, newPassword) {
    const passwordHash = await this.hashPassword(newPassword);

    const { error } = await supabase
      .from("users")
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (error) {
      throw new Error("Failed to update password");
    }

    return true;
  }

  /**
   * Store refresh token
   */
  static async storeRefreshToken(userId, refreshToken) {
    const tokenHash = await this.hashPassword(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { error } = await supabase.from("refresh_tokens").insert([
      {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      },
    ]);

    if (error) {
      throw new Error("Failed to store refresh token");
    }
  }

  /**
   * Validate refresh token
   */
  static async validateRefreshToken(userId, refreshToken) {
    const { data: tokens, error } = await supabase
      .from("refresh_tokens")
      .select("token_hash, expires_at")
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString());

    if (error || !tokens || tokens.length === 0) {
      return false;
    }

    // Check if any stored token matches
    for (const token of tokens) {
      const isValid = await this.comparePassword(
        refreshToken,
        token.token_hash
      );
      if (isValid) {
        return true;
      }
    }

    return false;
  }

  /**
   * Remove refresh tokens for user (logout)
   */
  static async removeRefreshTokens(userId) {
    const { error } = await supabase
      .from("refresh_tokens")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing refresh tokens:", error);
    }
  }

  /**
   * Clean expired refresh tokens
   */
  static async cleanExpiredTokens() {
    const { error } = await supabase
      .from("refresh_tokens")
      .delete()
      .lt("expires_at", new Date().toISOString());

    if (error) {
      console.error("Error cleaning expired tokens:", error);
    }
  }

  /**
   * Generate auth tokens for user
   */
  static generateTokens(user) {
    const accessToken = JWTUtils.generateAccessToken(user.id, user.email);
    const refreshToken = JWTUtils.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }
}

export default AuthService;