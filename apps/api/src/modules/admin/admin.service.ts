import { PrismaClient, FeedbackTicket } from "@prisma/client";
import { AdminRepository } from "./admin.repository.js";
import { NotFoundError, ValidationError } from "../../errors/index.js";
import { logger } from "../../utils/logger.js";

export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly prisma: PrismaClient
  ) {}

  async getAnalyticsSummary(adminUserId: string) {
    logger.info(`Admin ${adminUserId} requested platform statistics`);
    return this.adminRepository.getPlatformStats();
  }

  async getPlatformAuditLogs(adminUserId: string) {
    logger.info(`Admin ${adminUserId} requested system audit trail`);
    return this.adminRepository.findAuditLogs();
  }

  async getFeedbackTickets(adminUserId: string) {
    logger.info(`Admin ${adminUserId} requested support feedback tickets`);
    return this.adminRepository.findFeedbackTickets();
  }

  async resolveFeedbackTicket(adminUserId: string, ticketId: string, status: string): Promise<FeedbackTicket> {
    const existing = await this.adminRepository.findFeedbackTicketById(ticketId);
    if (!existing) {
      throw new NotFoundError("Feedback ticket not found");
    }

    const updated = await this.adminRepository.updateFeedbackStatus(ticketId, status);

    await this.adminRepository.writeAuditLog({
      actorId: adminUserId,
      actionType: "UPDATE_TICKET",
      targetEntityType: "FEEDBACK_TICKET",
      targetEntityId: ticketId,
      beforeValue: { status: existing.status },
      afterValue: { status },
      reasonCode: "ADMIN_RESOLVE_FLOW"
    });

    logger.info(`Admin ${adminUserId} updated ticket ${ticketId} status from ${existing.status} to ${status}`);
    return updated;
  }

  async adjustUserCredits(
    adminUserId: string,
    targetUserId: string,
    amount: number,
    reason: string
  ): Promise<any> {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      throw new NotFoundError("Target user not found");
    }

    return this.prisma.$transaction(async (tx) => {
      const latestLedger = await tx.aiCreditLedger.findFirst({
        where: { userId: targetUserId },
        orderBy: { createdAt: "desc" }
      });

      const currentBalance = latestLedger?.balanceAfter || 0;
      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        throw new ValidationError("User balance cannot be adjusted below 0 credits");
      }

      const ledgerEntry = await tx.aiCreditLedger.create({
        data: {
          userId: targetUserId,
          transactionType: "ADJUSTMENT",
          amount: amount,
          relatedFeature: "ADMIN_MANUAL_ADJUSTMENT",
          balanceAfter: newBalance
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminUserId,
          actionType: "ADJUST_CREDITS",
          targetEntityType: "USER",
          targetEntityId: targetUserId,
          beforeValue: { credits: currentBalance },
          afterValue: { credits: newBalance },
          reasonCode: reason
        }
      });

      logger.info(
        `Admin ${adminUserId} adjusted user ${targetUserId} credits by ${amount}. ` +
        `Balance changed from ${currentBalance} to ${newBalance}. Reason: ${reason}`
      );

      return ledgerEntry;
    });
  }
}
