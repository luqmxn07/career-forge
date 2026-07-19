import { CoverLetterRepository } from "./cover-letter.repository.js";
import { ResumeRepository } from "../resume/resume.repository.js";
import { ProfileRepository } from "../profile/profile.repository.js";
import { CreditsService } from "../credits/credits.service.js";
import { AiGatewayService } from "../ai-gateway/ai-gateway.service.js";
import { NotFoundError } from "../../errors/index.js";
import { CoverLetter } from "@prisma/client";
import { logger } from "../../utils/logger.js";

export class CoverLetterService {
  constructor(
    private readonly coverLetterRepository: CoverLetterRepository,
    private readonly resumeRepository: ResumeRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly creditsService: CreditsService,
    private readonly aiGatewayService: AiGatewayService
  ) {}

  /**
   * Generates a cover letter using AI context builder
   */
  async generateCoverLetter(
    userId: string,
    data: {
      resumeId?: string;
      jobDescription: string;
      company?: string;
      role?: string;
      tone?: string;
    }
  ): Promise<CoverLetter> {
    const targetCompany = data.company && data.company.trim() ? data.company : "Target Company";
    const targetRole = data.role && data.role.trim() ? data.role : "Target Role";
    const targetTone = data.tone || "Professional";

    let fullName = "Candidate";
    let summary = "";
    const highlights: string[] = [];

    // 1. Resolve user profile/name
    const profileData = await this.profileRepository.getProfileData(userId);
    if (profileData && profileData.profile) {
      fullName = profileData.profile.fullName;
      summary = profileData.profile.summary || "";
    }

    // 2. If resumeId is provided, extract experience highlights
    if (data.resumeId) {
      const resume = await this.resumeRepository.findById(data.resumeId);
      if (!resume || resume.userId !== userId) {
        throw new NotFoundError("Resume not found or not owned by user");
      }

      // Parse experience bullet descriptions
      const content = resume.content as any;
      if (content && Array.isArray(content.experience)) {
        content.experience.forEach((exp: any) => {
          if (exp.description) {
            highlights.push(`${exp.title || ""} at ${exp.company || ""}: ${exp.description}`);
          }
        });
      }
    }

    // Fallback if no resume highlights exist, read experience from user profile schema if needed
    if (highlights.length === 0 && profileData && Array.isArray(profileData.experience)) {
      profileData.experience.forEach((exp: any) => {
        if (exp.description) {
          highlights.push(`${exp.title || ""} at ${exp.company || ""}: ${exp.description}`);
        }
      });
    }

    // 3. Deduct AI Credits (Cover Letter generation costs 10 credits)
    const GENERATION_CREDIT_COST = 10;
    await this.creditsService.deductCredits(userId, GENERATION_CREDIT_COST, "COVER_LETTER_GENERATION");

    // 4. Generate cover letter content via AI Gateway
    try {
      const aiResult = await this.aiGatewayService.generateCoverLetter({
        fullName,
        summary,
        highlights: highlights.slice(0, 5), // Send top 5 highlights to keep context clean
        jobDescriptionText: data.jobDescription,
        companyName: targetCompany,
        roleTitle: targetRole,
        tone: targetTone
      });

      // 5. Store Cover Letter in database
      const title = `${targetRole} Cover Letter — ${targetCompany}`;
      return await this.coverLetterRepository.createCoverLetter({
        userId,
        title,
        company: targetCompany,
        role: targetRole,
        jobDescriptionText: data.jobDescription,
        tone: targetTone,
        content: aiResult.content
      });
    } catch (err: any) {
      logger.error(`[Cover Letter Service] AI Generation failed: ${err.message}`);
      // Refund credits since generation failed
      await this.creditsService.refundCredits(userId, GENERATION_CREDIT_COST, "COVER_LETTER_GENERATION_FAILURE_REFUND");
      throw err;
    }
  }

  async getCoverLetter(userId: string, id: string): Promise<CoverLetter> {
    const coverLetter = await this.coverLetterRepository.findCoverLetterById(id);
    if (!coverLetter || coverLetter.userId !== userId) {
      throw new NotFoundError("Cover letter not found");
    }
    return coverLetter;
  }

  async getCoverLettersByUser(userId: string): Promise<CoverLetter[]> {
    return this.coverLetterRepository.findCoverLettersByUser(userId);
  }

  async updateCoverLetter(userId: string, id: string, content: string): Promise<CoverLetter> {
    const coverLetter = await this.coverLetterRepository.findCoverLetterById(id);
    if (!coverLetter || coverLetter.userId !== userId) {
      throw new NotFoundError("Cover letter not found");
    }
    return this.coverLetterRepository.updateCoverLetter(id, { content });
  }

  async deleteCoverLetter(userId: string, id: string): Promise<CoverLetter> {
    const coverLetter = await this.coverLetterRepository.findCoverLetterById(id);
    if (!coverLetter || coverLetter.userId !== userId) {
      throw new NotFoundError("Cover letter not found");
    }
    return this.coverLetterRepository.softDelete(id);
  }
}
