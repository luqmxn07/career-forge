import { PrismaClient, Resume, ResumeVersion } from "@prisma/client";
import { ResumeRepository } from "./resume.repository.js";
import { AuthorizationError, NotFoundError, AppError } from "../../errors/index.js";
import { CreateResumeDto, UpdateResumeDto } from "./resume.dto.js";
import { logger } from "../../utils/logger.js";
import { pdfQueue } from "../pdf/pdf.queue.js";

import { AiGatewayService } from "../ai-gateway/ai-gateway.service.js";

export class ResumeService {
  constructor(
    private resumeRepository: ResumeRepository,
    private prisma: PrismaClient,
    private aiGatewayService?: AiGatewayService
  ) {}

  /**
   * Asserts whether a user is allowed to create another resume.
   * Free tier limits users to a maximum of 2 active resumes.
   */
  private async validateUserLimits(userId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId }
    });
    const tier = subscription?.planTier || "FREE";

    if (tier === "FREE") {
      const activeCount = await this.resumeRepository.countActiveByUserId(userId);
      if (activeCount >= 2) {
        throw new AuthorizationError("Free tier is limited to a maximum of 2 active resumes. Upgrade to Premium for unlimited resumes.");
      }
    }
  }

  /**
   * Fetches active resumes for a user.
   */
  public async getResumesForUser(userId: string): Promise<Resume[]> {
    return this.resumeRepository.findManyActiveByUserId(userId);
  }

  /**
   * Fetches a single resume, verifying ownership.
   */
  public async getResumeById(id: string, userId: string): Promise<Resume> {
    const resume = await this.resumeRepository.findById(id);
    if (!resume || resume.deletedAt) {
      throw new NotFoundError("Resume not found");
    }
    if (resume.userId !== userId) {
      throw new AuthorizationError("You do not have permission to access this resume");
    }
    return resume;
  }

  /**
   * Creates a new resume and stores its initial version.
   */
  public async createResume(userId: string, data: CreateResumeDto): Promise<Resume> {
    await this.validateUserLimits(userId);

    // Verify template exists
    const template = await this.prisma.template.findUnique({
      where: { id: data.templateId }
    });
    if (!template) {
      throw new NotFoundError("Template not found");
    }

    // Load profile elements to auto-fill resume content
    const [profile, education, experiences, skills, languages] = await Promise.all([
      this.prisma.userProfile.findUnique({ where: { userId } }),
      this.prisma.education.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } }),
      this.prisma.experience.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } }),
      this.prisma.skill.findMany({ where: { userId } }),
      this.prisma.language.findMany({ where: { userId } })
    ]);
    const userObj = await this.prisma.user.findUnique({ where: { id: userId } });

    const mergedContent = {
      personalInfo: {
        fullName: profile?.fullName || userObj?.email.split("@")[0] || "",
        email: userObj?.email || "",
        phoneNumber: profile?.phoneNumber || "",
        location: profile?.location || "",
        age: profile?.age || "",
        ...(data.content?.personalInfo || {})
      },
      summary: data.content?.summary || profile?.summary || "",
      experience: (data.content?.experience && data.content.experience.length > 0)
        ? data.content.experience
        : experiences.map(e => ({
            company: e.company,
            role: e.title,
            location: e.location || "",
            startDate: e.startDate ? e.startDate.toISOString() : "",
            endDate: e.endDate ? e.endDate.toISOString() : "",
            isCurrent: e.isCurrent,
            description: e.description || ""
          })),
      education: (data.content?.education && data.content.education.length > 0)
        ? data.content.education
        : education.map(ed => ({
            school: ed.institution,
            degree: ed.degree,
            fieldOfStudy: ed.fieldOfStudy || "",
            startDate: ed.startDate ? ed.startDate.toISOString() : "",
            endDate: ed.endDate ? ed.endDate.toISOString() : "",
            isCurrent: ed.isCurrent,
            gpa: ed.gpa || "",
            description: ed.description || ""
          })),
      skills: (data.content?.skills && data.content.skills.length > 0)
        ? data.content.skills
        : skills.map(s => s.name),
      languages: (data.content?.languages && data.content.languages.length > 0)
        ? data.content.languages
        : languages.map(l => ({ name: l.name, proficiency: l.proficiency })),
      projects: data.content?.projects || []
    };

    const resume = await this.resumeRepository.create(userId, {
      templateId: data.templateId,
      title: data.title,
      themeSettings: data.themeSettings,
      content: mergedContent
    });

    // Save initial version
    await this.resumeRepository.createVersion(resume.id, mergedContent, "Initial version");
    
    logger.info(`Resume "${data.title}" successfully created for user ${userId}`);
    return resume;
  }

  /**
   * Updates an existing resume, auto-creating a new version checkpoint if content changed.
   */
  public async updateResume(id: string, userId: string, data: UpdateResumeDto, changeSummary?: string): Promise<Resume> {
    const resume = await this.getResumeById(id, userId);

    if (resume.isLocked && data.content) {
      throw new AuthorizationError("Cannot modify content of a locked resume. Unlock it first.");
    }

    const updated = await this.resumeRepository.update(id, data);

    // If content was updated, create a historical version
    if (data.content) {
      await this.resumeRepository.createVersion(id, data.content, changeSummary || "User update");
    }

    logger.info(`Resume ID ${id} updated by user ${userId}`);
    return updated;
  }

  /**
   * Duplicates an existing resume.
   */
  public async duplicateResume(id: string, userId: string, newTitle: string): Promise<Resume> {
    await this.validateUserLimits(userId);
    const sourceResume = await this.getResumeById(id, userId);

    const duplicated = await this.resumeRepository.create(userId, {
      templateId: sourceResume.templateId,
      title: newTitle,
      themeSettings: sourceResume.themeSettings || {},
      content: sourceResume.content || {}
    });

    // Save initial version of duplicated resume
    await this.resumeRepository.createVersion(duplicated.id, sourceResume.content, `Duplicated from "${sourceResume.title}"`);

    logger.info(`Duplicated resume ID ${id} as new ID ${duplicated.id} for user ${userId}`);
    return duplicated;
  }

  /**
   * Soft deletes a resume.
   */
  public async deleteResume(id: string, userId: string): Promise<void> {
    const resume = await this.getResumeById(id, userId);
    await this.resumeRepository.softDelete(id);
    logger.info(`Resume ID ${id} soft-deleted by user ${userId}`);
  }

  /**
   * Retrieves all available templates.
   */
  public async getTemplates() {
    return this.resumeRepository.findTemplates();
  }

  /**
   * Injects data into the template structure, preparing the HTML document for rendering.
   */
  private compileResumeHtml(resume: Resume, template: any, themeSettings: any): string {
    const content = (resume.content as any) || {};
    const personalInfo = content.personalInfo || {};
    
    // Flatten data for the template compiler
    const compileData = {
      ...content,
      ...personalInfo,
      title: resume.title
    };

    // 1. Compile the body
    let bodyHtml = template.htmlStructure;

    // Process loops: {{#each list}}...{{/each}}
    const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    bodyHtml = bodyHtml.replace(eachRegex, (match: string, listName: string, innerHtml: string) => {
      const list = compileData[listName];
      if (!Array.isArray(list) || list.length === 0) {
        return "";
      }
      return list.map((item: any) => {
        let compiledItem = innerHtml;
        for (const [key, val] of Object.entries(item)) {
          let displayVal = val === null || val === undefined ? "" : String(val);
          if ((key === "startDate" || key === "endDate") && val) {
            try {
              displayVal = new Date(val as string).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short"
              });
            } catch (e) {
              displayVal = String(val);
            }
          }
          compiledItem = compiledItem.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), displayVal);
        }
        // Replace any remaining unused fields
        compiledItem = compiledItem.replace(/\{\{[^}]+\}\}/g, "");
        return compiledItem;
      }).join("");
    });

    // Process conditionals: {{#if variable}}...{{/if}}
    const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    bodyHtml = bodyHtml.replace(ifRegex, (match: string, varName: string, innerHtml: string) => {
      const val = compileData[varName];
      if (val && (!Array.isArray(val) || val.length > 0)) {
        return innerHtml;
      }
      return "";
    });

    // Process direct variables: {{variable}}
    for (const [key, val] of Object.entries(compileData)) {
      if (val !== null && val !== undefined && typeof val !== "object") {
        bodyHtml = bodyHtml.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(val));
      }
    }

    // Clean remaining placeholders
    bodyHtml = bodyHtml.replace(/\{\{#if\s+\w+\}\}/g, "");
    bodyHtml = bodyHtml.replace(/\{\{\/if\}\}/g, "");
    bodyHtml = bodyHtml.replace(/\{\{[^}]+\}\}/g, "");

    // 2. Build the final HTML document with injected CSS variables
    const primaryColor = themeSettings.primaryColor || "#0284c7";
    const textColor = themeSettings.textColor || "#1f2937";
    const fontSize = themeSettings.fontSize || "10pt";
    const fontFamily = themeSettings.fontFamily || "Inter";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: ${primaryColor};
      --text-color: ${textColor};
      --font-size: ${fontSize};
      --font-family: '${fontFamily}', sans-serif;
    }
    ${template.cssStyles}
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
  }

  /**
   * Triggers export process. Saves current state first, compiles HTML, and enqueues BullMQ job.
   */
  public async exportResume(id: string, userId: string, updateData?: any): Promise<string> {
    let resume = await this.getResumeById(id, userId);

    if (updateData) {
      resume = await this.updateResume(id, userId, updateData, "Pre-export auto-save");
    }

    // Edge Case 14: Check minimum content sections
    const content = (resume.content as any) || {};
    const personalInfo = content.personalInfo || {};
    const hasName = personalInfo.fullName && personalInfo.fullName.trim().length > 0;
    const hasSectionContent = 
      (content.summary && content.summary.trim().length > 0) ||
      (content.experience && content.experience.length > 0) ||
      (content.education && content.education.length > 0) ||
      (content.skills && content.skills.length > 0);

    if (!hasName || !hasSectionContent) {
      throw new AppError("Resume must contain a name and at least one content section to be exported.", 422, "EXPORT_ERROR");
    }

    // Retrieve template structure
    const template = await this.prisma.template.findUnique({
      where: { id: resume.templateId }
    });
    if (!template) {
      throw new NotFoundError("Template not found");
    }

    const htmlContent = this.compileResumeHtml(resume, template, resume.themeSettings || {});
    const filename = `${resume.title}_${personalInfo.fullName || "Resume"}`;

    if (!pdfQueue) {
      throw new AppError("PDF queue is not initialized. Please try again later.", 503, "QUEUE_ERROR");
    }

    const job = await pdfQueue.add("render", { htmlContent, filename, userId, title: resume.title });
    if (!job.id) {
      throw new AppError("Failed to queue PDF generation job", 500, "INTERNAL_ERROR");
    }

    return job.id;
  }

  /**
   * Retrieves status of a PDF export job.
   */
  public async getExportStatus(jobId: string) {
    if (!pdfQueue) {
      throw new AppError("PDF queue is not initialized.", 503, "QUEUE_ERROR");
    }

    const job = await pdfQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundError("Export job not found");
    }

    if (await job.isCompleted()) {
      return { status: "completed", fileUrl: job.returnvalue?.secureUrl };
    }

    if (await job.isFailed()) {
      return { status: "failed", error: job.failedReason };
    }

    return { status: "pending" };
  }

  /**
   * Tailors a resume for a target role using AI Gateway.
   */
  public async tailorResume(id: string, userId: string, targetRole: string) {
    const resume = await this.getResumeById(id, userId);

    let userBackground = null;
    try {
      userBackground = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, education: true, experience: true, skills: true },
      });
    } catch (e) {
      // User background is optional
    }

    let parsedContent: any = {};
    try {
      parsedContent = typeof resume.content === "string" ? JSON.parse(resume.content) : (resume.content || {});
    } catch (e) {
      parsedContent = {};
    }

    const gateway = this.aiGatewayService || new AiGatewayService();
    return await gateway.tailorResumeForRole({
      targetRole,
      userProfile: userBackground,
      resumeContent: parsedContent,
    });
  }

  /**
   * Enhances skills specifically for a job role and optional job description context.
   */
  public async enhanceSkills(id: string, userId: string, targetRole: string, jobDescription?: string) {
    const resume = await this.getResumeById(id, userId);

    let parsedContent: any = {};
    try {
      parsedContent = typeof resume.content === "string" ? JSON.parse(resume.content) : (resume.content || {});
    } catch (e) {
      parsedContent = {};
    }

    const gateway = this.aiGatewayService || new AiGatewayService();
    return await gateway.enhanceSkillsForRole({
      targetRole,
      jobDescription,
      currentSkills: parsedContent.skills,
    });
  }
}
