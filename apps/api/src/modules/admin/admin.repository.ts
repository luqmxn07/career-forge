import { PrismaClient, AuditLog, FeedbackTicket } from "@prisma/client";

export class AdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getPlatformStats() {
    const [
      totalUsers,
      premiumUsers,
      totalScans,
      totalInterviews,
      feedbackGroups
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.count({
        where: { planTier: "PREMIUM", status: "ACTIVE" }
      }),
      this.prisma.atsScan.count(),
      this.prisma.interviewSession.count(),
      this.prisma.feedbackTicket.groupBy({
        by: ["status"],
        _count: { id: true }
      })
    ]);

    const feedbackStats = feedbackGroups.map((g) => ({
      status: g.status,
      count: g._count.id
    }));

    return {
      totalUsers,
      premiumUsers,
      totalScans,
      totalInterviews,
      feedbackStats
    };
  }

  async findAuditLogs(): Promise<any[]> {
    return this.prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            email: true,
            profile: {
              select: { fullName: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }

  async findFeedbackTickets(): Promise<any[]> {
    return this.prisma.feedbackTicket.findMany({
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: { fullName: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async findFeedbackTicketById(id: string): Promise<FeedbackTicket | null> {
    return this.prisma.feedbackTicket.findUnique({
      where: { id }
    });
  }

  async updateFeedbackStatus(id: string, status: string): Promise<FeedbackTicket> {
    return this.prisma.feedbackTicket.update({
      where: { id },
      data: { status }
    });
  }

  async writeAuditLog(data: {
    actorId: string;
    actionType: string;
    targetEntityType: string;
    targetEntityId?: string;
    beforeValue?: any;
    afterValue?: any;
    reasonCode?: string;
  }): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        actionType: data.actionType,
        targetEntityType: data.targetEntityType,
        targetEntityId: data.targetEntityId || null,
        beforeValue: data.beforeValue || undefined,
        afterValue: data.afterValue || undefined,
        reasonCode: data.reasonCode || null
      }
    });
  }
}
