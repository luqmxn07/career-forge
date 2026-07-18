import { PrismaClient, CoverLetter } from "@prisma/client";

export class CoverLetterRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createCoverLetter(data: {
    userId: string;
    title: string;
    company: string;
    role: string;
    jobDescriptionText?: string;
    tone: string;
    content: string;
  }): Promise<CoverLetter> {
    return this.prisma.coverLetter.create({
      data: {
        userId: data.userId,
        title: data.title,
        company: data.company,
        role: data.role,
        jobDescriptionText: data.jobDescriptionText,
        tone: data.tone,
        content: data.content
      }
    });
  }

  async findCoverLetterById(id: string): Promise<CoverLetter | null> {
    return this.prisma.coverLetter.findFirst({
      where: { id, deletedAt: null }
    });
  }

  async findCoverLettersByUser(userId: string): Promise<CoverLetter[]> {
    return this.prisma.coverLetter.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" }
    });
  }

  async updateCoverLetter(
    id: string,
    data: {
      title?: string;
      content?: string;
      tone?: string;
    }
  ): Promise<CoverLetter> {
    return this.prisma.coverLetter.update({
      where: { id },
      data
    });
  }

  async softDelete(id: string): Promise<CoverLetter> {
    return this.prisma.coverLetter.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
