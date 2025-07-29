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
   * Check if user exists by email
   */
  static async findUserByEmail(email) {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, password_hash, created_at")
      .eq("email", email.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      throw new Error("Database error while finding user");
    }

    return data;
  }

  /**
   * Find user by ID
   */
  static async findUserById(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, created_at")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error("Database error while finding user");
    }

    return data;
  }

  /**
   * Create new user
   */
  static async createUser(userData) {
    const { email, password, name } = userData;

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Insert user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase(),
          password_hash: passwordHash,
          first_name: name.split(" ")[0] || name, // Use first_name
          last_name: name.split(" ")[1] || "", // Use last_name
        },
      ])
      .select("id, email, first_name, last_name, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new Error("User with this email already exists");
      }
      throw new Error("Failed to create user");
    }

    return data;
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
      // Don't throw - logout should succeed even if cleanup fails
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
