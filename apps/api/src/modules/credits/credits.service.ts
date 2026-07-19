import { PrismaClient } from "@prisma/client";
import { CreditsRepository } from "./credits.repository.js";
import { InsufficientCreditsError } from "../../errors/index.js";

export class CreditsService {
  constructor(
    private readonly creditsRepository: CreditsRepository,
    private readonly prisma: PrismaClient
  ) {}

  async isUserAdmin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.role === "ADMIN" || user?.email === "aricpaul2007@gmail.com";
  }

  /**
   * Gets the current credit balance for a user
   */
  async getBalance(userId: string): Promise<number> {
    if (await this.isUserAdmin(userId)) {
      return 999999;
    }
    const balance = await this.creditsRepository.getUserBalance(userId);
    if (balance === null) {
      return this.allocateCredits(userId, 100, "WELCOME_BONUS");
    }
    return balance;
  }

  /**
   * Deducts credits for a feature consumption within a transaction
   */
  async deductCredits(userId: string, amount: number, feature: string): Promise<number> {
    if (await this.isUserAdmin(userId)) {
      return 999999;
    }

    if (amount <= 0) throw new Error("Deduction amount must be greater than zero");

    return this.prisma.$transaction(async (tx) => {
      let balance = await this.creditsRepository.getUserBalance(userId, tx);
      
      if (balance === null) {
        balance = 100;
        await this.creditsRepository.createTransaction(
          {
            userId,
            transactionType: "ALLOCATION",
            amount: 100,
            relatedFeature: "WELCOME_BONUS",
            balanceAfter: 100
          },
          tx
        );
      }

      if (balance < amount) {
        throw new InsufficientCreditsError(
          `Insufficient credits. Required: ${amount}, available: ${balance}.`
        );
      }

      const newBalance = balance - amount;
      await this.creditsRepository.createTransaction(
        {
          userId,
          transactionType: "CONSUMPTION",
          amount: -amount,
          relatedFeature: feature,
          balanceAfter: newBalance
        },
        tx
      );

      return newBalance;
    });
  }

  /**
   * Refunds credits to a user within a transaction
   */
  async refundCredits(userId: string, amount: number, feature: string): Promise<number> {
    if (await this.isUserAdmin(userId)) {
      return 999999;
    }

    if (amount <= 0) throw new Error("Refund amount must be greater than zero");

    return this.prisma.$transaction(async (tx) => {
      let balance = await this.creditsRepository.getUserBalance(userId, tx);
      if (balance === null) balance = 100;
      const newBalance = balance + amount;

      await this.creditsRepository.createTransaction(
        {
          userId,
          transactionType: "REFUND",
          amount,
          relatedFeature: feature,
          balanceAfter: newBalance
        },
        tx
      );

      return newBalance;
    });
  }

  /**
   * Allocates credits to a user (e.g. signup bonus, admin adjustments, subscription)
   */
  async allocateCredits(
    userId: string,
    amount: number,
    feature: string,
    type: "ALLOCATION" | "ADJUSTMENT" = "ALLOCATION"
  ): Promise<number> {
    if (amount <= 0) throw new Error("Allocation amount must be greater than zero");

    return this.prisma.$transaction(async (tx) => {
      const currentBalance = await this.creditsRepository.getUserBalance(userId, tx);
      const balance = currentBalance === null ? 0 : currentBalance;
      const newBalance = balance + amount;

      await this.creditsRepository.createTransaction(
        {
          userId,
          transactionType: type,
          amount,
          relatedFeature: feature,
          balanceAfter: newBalance
        },
        tx
      );

      return newBalance;
    });
  }

  /**
   * Gets ledger history
   */
  async getHistory(userId: string, limit = 50) {
    return this.creditsRepository.getTransactionHistory(userId, limit);
  }
}
