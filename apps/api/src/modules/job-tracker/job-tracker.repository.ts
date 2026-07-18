import { PrismaClient, JobEntry, JobStage, JobStageHistory } from "@prisma/client";

export class JobTrackerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    userId: string,
    data: {
      company: string;
      role: string;
      stage: JobStage;
      linkedResumeVersionId?: string;
      linkedCoverLetterId?: string;
      notes?: string;
      deadline?: Date;
      tags?: string[];
    }
  ): Promise<JobEntry> {
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.jobEntry.create({
        data: {
          userId,
          company: data.company,
          role: data.role,
          stage: data.stage,
          linkedResumeVersionId: data.linkedResumeVersionId || null,
          linkedCoverLetterId: data.linkedCoverLetterId || null,
          notes: data.notes || null,
          deadline: data.deadline || null,
          tags: data.tags ? data.tags : undefined
        }
      });

      await tx.jobStageHistory.create({
        data: {
          jobEntryId: entry.id,
          stage: data.stage
        }
      });

      return entry;
    });
  }

  async findById(id: string): Promise<(JobEntry & { history: JobStageHistory[] }) | null> {
    return this.prisma.jobEntry.findFirst({
      where: { id, deletedAt: null },
      include: {
        history: {
          orderBy: { transitionedAt: "desc" }
        }
      }
    });
  }

  async findByUser(userId: string): Promise<JobEntry[]> {
    return this.prisma.jobEntry.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: {
        history: {
          orderBy: { transitionedAt: "desc" }
        }
      }
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      company?: string;
      role?: string;
      stage?: JobStage;
      linkedResumeVersionId?: string | null;
      linkedCoverLetterId?: string | null;
      notes?: string;
      deadline?: Date | null;
      tags?: string[];
    }
  ): Promise<JobEntry> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.jobEntry.findFirst({
        where: { id, userId, deletedAt: null }
      });

      if (!existing) {
        throw new Error("Job entry not found");
      }

      const stageChanged = data.stage && data.stage !== existing.stage;

      const updatedData: any = {};
      if (data.company !== undefined) updatedData.company = data.company;
      if (data.role !== undefined) updatedData.role = data.role;
      if (data.stage !== undefined) updatedData.stage = data.stage;
      if (data.linkedResumeVersionId !== undefined) updatedData.linkedResumeVersionId = data.linkedResumeVersionId;
      if (data.linkedCoverLetterId !== undefined) updatedData.linkedCoverLetterId = data.linkedCoverLetterId;
      if (data.notes !== undefined) updatedData.notes = data.notes;
      if (data.deadline !== undefined) updatedData.deadline = data.deadline;
      if (data.tags !== undefined) updatedData.tags = data.tags ? data.tags : null;

      const updated = await tx.jobEntry.update({
        where: { id },
        data: updatedData
      });

      if (stageChanged) {
        await tx.jobStageHistory.create({
          data: {
            jobEntryId: id,
            stage: data.stage!
          }
        });
      }

      return updated;
    });
  }

  async softDelete(id: string, userId: string): Promise<JobEntry> {
    return this.prisma.jobEntry.update({
      where: { id, userId },
      data: {
        deletedAt: new Date()
      }
    });
  }
}
