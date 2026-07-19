import { PrismaClient, AiCreditLedger, CreditTransactionType } from "@prisma/client";

export class CreditsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Gets the latest balanceAfter value for a user.
   * If no transactions exist, returns 0.
   */
  async getUserBalance(userId: string, tx?: any): Promise<number | null> {
    const client = tx || this.prisma;
    const lastTx = await client.aiCreditLedger.findFirst({
      where: { userId },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }
      ]
    });
    return lastTx ? lastTx.balanceAfter : null;
  }

  /**
   * Adds a new transaction ledger record.
   * Must be called within a database transaction if updating running balance.
   */
  async createTransaction(
    data: {
      userId: string;
      transactionType: CreditTransactionType;
      amount: number;
      relatedFeature?: string;
      balanceAfter: number;
    },
    tx?: any
  ): Promise<AiCreditLedger> {
    const client = tx || this.prisma;
    return client.aiCreditLedger.create({
      data: {
        userId: data.userId,
        transactionType: data.transactionType,
        amount: data.amount,
        relatedFeature: data.relatedFeature,
        balanceAfter: data.balanceAfter
      }
    });
  }

  /**
   * Retrieves credit ledger transaction history for a user
   */
  async getTransactionHistory(userId: string, limit = 50): Promise<AiCreditLedger[]> {
    return this.prisma.aiCreditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }
}
