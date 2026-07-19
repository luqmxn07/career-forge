import { PrismaClient, AtsScan } from "@prisma/client";

export class AtsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createScan(data: {
    userId: string;
    resumeId: string;
    jobDescriptionHash: string;
    jobDescriptionText: string;
    overallScore: number;
    subScores: any;
    missingKeywords: any;
    formattingIssues: any;
    feedback: string;
  }): Promise<AtsScan> {
    return this.prisma.atsScan.create({
      data: {
        userId: data.userId,
        resumeId: data.resumeId,
        jobDescriptionHash: data.jobDescriptionHash,
        jobDescriptionText: data.jobDescriptionText,
        overallScore: data.overallScore,
        subScores: data.subScores,
        missingKeywords: data.missingKeywords,
        formattingIssues: data.formattingIssues,
        feedback: data.feedback
      }
    });
  }

  async findScanById(id: string): Promise<AtsScan | null> {
    return this.prisma.atsScan.findUnique({
      where: { id }
    });
  }

  async deleteScan(id: string): Promise<AtsScan> {
    return this.prisma.atsScan.delete({
      where: { id }
    });
  }

  async findScansByUser(userId: string): Promise<AtsScan[]> {
    return this.prisma.atsScan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async findScansByResume(resumeId: string): Promise<AtsScan[]> {
    return this.prisma.atsScan.findMany({
      where: { resumeId },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Find most recent scan for a given resume and JD hash
   */
  async findRecentScan(resumeId: string, jdHash: string): Promise<AtsScan | null> {
    return this.prisma.atsScan.findFirst({
      where: {
        resumeId,
        jobDescriptionHash: jdHash,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000) // Within last 60 seconds
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
}
