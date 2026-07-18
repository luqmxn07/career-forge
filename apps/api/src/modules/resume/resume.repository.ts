import { PrismaClient, Resume, ResumeVersion } from "@prisma/client";

export class ResumeRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Retrieves all non-deleted resumes for a user.
   */
  public async findManyActiveByUserId(userId: string): Promise<Resume[]> {
    return this.prisma.resume.findMany({
      where: {
        userId,
        deletedAt: null
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  /**
   * Finds a resume by ID.
   */
  public async findById(id: string): Promise<Resume | null> {
    return this.prisma.resume.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        template: true,
        versions: {
          orderBy: {
            createdAt: "desc"
          },
          take: 10
        }
      }
    });
  }

  /**
   * Counts the number of active (non-deleted) resumes for a user.
   */
  public async countActiveByUserId(userId: string): Promise<number> {
    return this.prisma.resume.count({
      where: {
        userId,
        deletedAt: null
      }
    });
  }

  /**
   * Creates a new resume database record.
   */
  public async create(userId: string, data: { templateId: string; title: string; themeSettings: any; content: any }): Promise<Resume> {
    return this.prisma.resume.create({
      data: {
        userId,
        templateId: data.templateId,
        title: data.title,
        themeSettings: data.themeSettings,
        content: data.content
      }
    });
  }

  /**
   * Updates an existing resume record.
   */
  public async update(id: string, data: any): Promise<Resume> {
    return this.prisma.resume.update({
      where: { id },
      data
    });
  }

  /**
   * Soft deletes a resume by setting its deletedAt timestamp.
   */
  public async softDelete(id: string): Promise<Resume> {
    return this.prisma.resume.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }

  /**
   * Records a history version checkpoint for a resume.
   */
  public async createVersion(resumeId: string, contentSnapshot: any, changeSummary?: string): Promise<ResumeVersion> {
    return this.prisma.resumeVersion.create({
      data: {
        resumeId,
        contentSnapshot,
        changeSummary: changeSummary || "Update resume checkpoint"
      }
    });
  }

  /**
   * Retrieves all templates.
   */
  public async findTemplates() {
    return this.prisma.template.findMany({
      orderBy: { name: "asc" }
    });
  }
}
