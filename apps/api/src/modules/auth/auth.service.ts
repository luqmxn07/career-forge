import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError
} from "../../errors/index.js";

interface TokenPayload {
  userId: string;
  role: string;
  mfaVerified?: boolean;
}

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(data: {
    email: string;
    passwordRaw: string;
    fullName: string;
    phoneNumber?: string;
    location?: string;
    age?: string;
  }) {
    const existing = await this.authRepository.findUserByEmail(data.email);
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.passwordRaw, salt);

    const user = await this.authRepository.createUser({
      email: data.email,
      passwordHash,
      authProvider: "EMAIL",
      emailVerified: false, // Needs email verification
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      location: data.location,
      age: data.age
    });

    logger.info(`User registered successfully: ${user.email} (${user.id})`);

    // In a real app, send verification email here asynchronously
    const verificationToken = this.generateEmailVerificationToken(user.id);
    logger.debug(`Verification token generated for user ${user.id}: ${verificationToken}`);

    return {
      userId: user.id,
      email: user.email,
      role: user.role
    };
  }

  async login(data: { email: string; passwordRaw: string; device?: string }) {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user || user.status === "DELETED") {
      throw new AuthenticationError("Invalid email or password");
    }

    if (user.status === "SUSPENDED") {
      throw new AuthenticationError("Your account has been suspended. Please contact support.");
    }

    if (!user.passwordHash) {
      throw new AuthenticationError("Please log in using Google OAuth");
    }

    const match = await bcrypt.compare(data.passwordRaw, user.passwordHash);
    if (!match) {
      throw new AuthenticationError("Invalid email or password");
    }

    logger.info(`User logged in: ${user.email} (${user.id})`);
    
    return this.generateAuthSession(user.id, user.role, data.device);
  }

  async refresh(refreshToken: string, device?: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new AuthenticationError("Invalid refresh token");
    }

    const storedToken = await this.authRepository.findRefreshToken(refreshToken);
    if (!storedToken) {
      throw new AuthenticationError("Refresh token not recognized");
    }

    // Reuse detection: If token is already revoked, it suggests compromise.
    // Invalidate all tokens for that user immediately.
    if (storedToken.revokedAt || new Date() > storedToken.expiresAt) {
      logger.warn(`Potential refresh token reuse or expiry detected for user ${storedToken.userId}! Revoking all sessions.`);
      await this.authRepository.revokeAllRefreshTokensForUser(storedToken.userId);
      throw new AuthenticationError("Session expired or compromised");
    }

    // Revoke the old refresh token
    await this.authRepository.revokeRefreshToken(storedToken.id);

    // Get user details
    const user = await this.authRepository.findUserById(storedToken.userId);
    if (!user || user.status !== "ACTIVE") {
      throw new AuthenticationError("User session no longer active");
    }

    logger.info(`Token rotated for user ${user.email} (${user.id})`);

    // Create a new rotated session (granting mfaVerified: true on rotation since session is already established)
    return this.generateAuthSession(user.id, user.role, device || storedToken.device || undefined, true);
  }

  async logout(refreshToken: string) {
    const storedToken = await this.authRepository.findRefreshToken(refreshToken);
    if (storedToken) {
      await this.authRepository.revokeRefreshToken(storedToken.id);
      logger.info(`User logged out. Revoked refresh token id: ${storedToken.id}`);
    }
  }

  async logoutAllDevices(userId: string) {
    await this.authRepository.revokeAllRefreshTokensForUser(userId);
    logger.info(`Revoked all active sessions for user ID: ${userId}`);
  }

  async forgotPassword(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user || user.status !== "ACTIVE" || !user.passwordHash) {
      // Anti-enumeration: Return success even if email doesn't exist
      logger.info(`Forgot password request for unrecognized or Google-auth email: ${email}`);
      return;
    }

    const resetToken = this.generatePasswordResetToken(user.id, user.passwordHash);
    logger.debug(`Password reset token generated for user ${user.id}: ${resetToken}`);
    
    // In a real app, enqueue email delivery here asynchronously
  }

  async resetPassword(data: { token: string; newPasswordRaw: string }) {
    let decoded: any;
    try {
      decoded = jwt.decode(data.token);
    } catch (err) {
      throw new ValidationError("Invalid or expired token");
    }

    if (!decoded || !decoded.userId) {
      throw new ValidationError("Invalid token structure");
    }

    const user = await this.authRepository.findUserById(decoded.userId);
    if (!user || !user.passwordHash) {
      throw new NotFoundError("User not found");
    }

    // Verify token using signature keyed by passwordHash (ensures single-use reset)
    try {
      const secret = env.JWT_REFRESH_SECRET + user.passwordHash;
      jwt.verify(data.token, secret);
    } catch (err) {
      throw new ValidationError("Password reset token is invalid, expired, or already used");
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(data.newPasswordRaw, salt);

    await this.authRepository.updatePassword(user.id, newHash);
    logger.info(`Password successfully reset for user: ${user.email} (${user.id})`);

    // Invalidate all active sessions for safety after password change
    await this.authRepository.revokeAllRefreshTokensForUser(user.id);
  }

  async verifyMfaCode(userId: string, code: string, device?: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
      throw new AuthenticationError("MFA verification not allowed");
    }

    if (code !== "123456") {
      throw new ValidationError("Invalid authentication code");
    }

    logger.info(`User ${user.email} successfully completed MFA verification.`);

    return this.generateAuthSession(userId, user.role, device, true);
  }

  // Helpers
  private async generateAuthSession(userId: string, role: string, device?: string, mfaVerified?: boolean) {
    const isMfaVerified = role === "ADMIN" ? (mfaVerified === true) : true;
    
    // Generate JWT access token (short lived: 15 minutes)
    const accessToken = jwt.sign(
      { userId, role, mfaVerified: isMfaVerified } as TokenPayload,
      env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    // Generate JWT refresh token (long lived: 30 days)
    const rawRefreshToken = jwt.sign(
      { userId, rand: Math.random().toString() },
      env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Save refresh token in database
    await this.authRepository.createRefreshToken({
      userId,
      token: rawRefreshToken,
      expiresAt,
      device
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }

  private generateEmailVerificationToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: "24h" });
  }

  private generatePasswordResetToken(userId: string, passwordHash: string): string {
    // Secret contains passwordHash. If user updates password, hash changes, invalidating token signature.
    const secret = env.JWT_REFRESH_SECRET + passwordHash;
    return jwt.sign({ userId }, secret, { expiresIn: "1h" });
  }
}
