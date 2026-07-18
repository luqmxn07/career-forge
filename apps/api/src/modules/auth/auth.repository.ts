import { PrismaClient, User, RefreshToken, UserStatus, Role } from "@prisma/client";

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string | null;
    authProvider?: "EMAIL" | "GOOGLE";
    emailVerified?: boolean;
    fullName: string;
    phoneNumber?: string;
    location?: string;
    age?: string;
  }): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          authProvider: data.authProvider || "EMAIL",
          emailVerified: data.emailVerified || false,
          status: "ACTIVE",
          role: "USER"
        }
      });

      // Initialize profile with input details
      await tx.userProfile.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber || null,
          location: data.location || null,
          age: data.age || null
        }
      });

      // Initialize default notification preferences
      await tx.notificationPreference.create({
        data: {
          userId: user.id
        }
      });

      // Initialize free subscription entitlement
      await tx.subscription.create({
        data: {
          userId: user.id,
          planTier: "FREE",
          status: "ACTIVE"
        }
      });

      // Seed initial free AI credits (e.g. 50 credits)
      await tx.aiCreditLedger.create({
        data: {
          userId: user.id,
          transactionType: "ALLOCATION",
          amount: 50,
          relatedFeature: "SIGNUP_BONUS",
          balanceAfter: 50
        }
      });

      return user;
    });
  }

  async updateUserVerification(id: string, verified: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { emailVerified: verified }
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash }
    });
  }

  async createRefreshToken(data: {
    userId: string;
    token: string;
    expiresAt: Date;
    device?: string;
  }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token }
    });
  }

  async revokeRefreshToken(id: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() }
    });
  }

  async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
}
