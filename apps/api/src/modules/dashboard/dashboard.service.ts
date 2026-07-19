import { PrismaClient } from "@prisma/client";
import { redisClient } from "../../utils/redis.js";
import { logger } from "../../utils/logger.js";
import { container } from "../../config/di-container.js";

export class DashboardService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Retrieves overall stats for the user, cached in Redis for 60 seconds.
   */
  async getDashboardStats(userId: string): Promise<any> {
    const cacheKey = `dashboard:stats:${userId}`;

    // 1. Attempt to fetch from Redis cache
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.info(`[Dashboard Service] Cache hit for user ${userId}`);
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error(`[Dashboard Service] Redis read failure: ${(err as any).message}`);
    }

    logger.info(`[Dashboard Service] Cache miss. Generating fresh statistics for user ${userId}`);

    // 2. Query DB metrics in parallel
    const [resumesCount, atsScans, jobStageGroups, interviewsCount, latestLedger] = await Promise.all([
      this.prisma.resume.count({
        where: { userId }
      }),
      this.prisma.atsScan.aggregate({
        where: { userId },
        _avg: { overallScore: true }
      }),
      this.prisma.jobEntry.groupBy({
        where: { userId, deletedAt: null },
        by: ["stage"],
        _count: { id: true }
      }),
      this.prisma.interviewSession.count({
        where: { userId }
      }),
      this.prisma.aiCreditLedger.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
      })
    ]);

    // Map stage counts to a structured array
    const jobTrackerStages = jobStageGroups.map((group) => ({
      stage: group.stage,
      count: group._count.id
    }));

    const userCredits = await container.creditsService.getBalance(userId);

    const stats = {
      resumesCount,
      averageAtsScore: Math.round(atsScans._avg.overallScore || 0),
      jobTrackerStages,
      interviewsCount,
      credits: userCredits
    };

    // 3. Write back to Redis with 60s TTL
    try {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(stats));
    } catch (err) {
      logger.error(`[Dashboard Service] Redis write failure: ${(err as any).message}`);
    }

    return stats;
  }

  /**
   * Invalidates Redis cache for a user
   */
  async invalidateDashboardCache(userId: string): Promise<void> {
    const cacheKey = `dashboard:stats:${userId}`;
    try {
      await redisClient.del(cacheKey);
      logger.info(`[Dashboard Service] Invalidated dashboard stats cache for user ${userId}`);
    } catch (err) {
      logger.error(`[Dashboard Service] Redis invalidation failure: ${(err as any).message}`);
    }
  }
}
