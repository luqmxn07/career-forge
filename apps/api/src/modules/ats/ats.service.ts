import crypto from "crypto";
import { AtsRepository } from "./ats.repository.js";
import { ResumeRepository } from "../resume/resume.repository.js";
import { CreditsService } from "../credits/credits.service.js";
import { AiGatewayService, AtsScanResult } from "../ai-gateway/ai-gateway.service.js";
import { NotFoundError, AppError } from "../../errors/index.js";
import { logger } from "../../utils/logger.js";
import { AtsScan } from "@prisma/client";

export class AtsService {
  constructor(
    private readonly atsRepository: AtsRepository,
    private readonly resumeRepository: ResumeRepository,
    private readonly creditsService: CreditsService,
    private readonly aiGatewayService: AiGatewayService
  ) {}

  /**
   * Run the ATS hybrid analysis pipeline
   */
  async scanResume(userId: string, resumeId: string, jdText: string, jobRole?: string): Promise<AtsScan> {
    const resume = await this.resumeRepository.findById(resumeId);
    if (!resume || resume.userId !== userId) {
      throw new NotFoundError("Resume not found or not owned by user");
    }

    // Embed jobRole at the beginning of jobDescriptionText if provided
    let fullJdText = jdText.trim();
    if (jobRole && jobRole.trim() && !fullJdText.toLowerCase().includes(jobRole.trim().toLowerCase())) {
      fullJdText = `Target Role: ${jobRole.trim()}\n\n${fullJdText}`;
    }

    // Hash the Job Description for cache check
    const jdHash = crypto.createHash("md5").update(fullJdText).digest("hex");

    // 1. Check for recent cache hit (within 60s)
    const recentScan = await this.atsRepository.findRecentScan(resumeId, jdHash);
    if (recentScan) {
      logger.info(`[ATS Service] Cache hit for resume ${resumeId} and JD hash ${jdHash}`);
      return recentScan;
    }

    // 2. Perform baseline deterministic local processing
    const resumeText = this.extractResumeText(resume.content);
    const localKeywords = this.calculateLocalKeywords(resumeText, jdText);
    const localFormatting = this.calculateLocalFormatting(resume);

    // 3. Deduct AI Credits
    const SCAN_CREDIT_COST = 5;
    await this.creditsService.deductCredits(userId, SCAN_CREDIT_COST, "ATS_SCAN");

    let aiResult: AtsScanResult | null = null;
    let isDegraded = false;

    // 4. Try AI Scanner Analysis
    try {
      aiResult = await this.aiGatewayService.analyzeAtsScan(resumeText, jdText);
    } catch (err: any) {
      logger.error(`[ATS Service] AI Gateway scan failure: ${err.message}. Degrading to deterministic scoring.`);
      isDegraded = true;
      // Refund credits since AI analysis failed
      await this.creditsService.refundCredits(userId, SCAN_CREDIT_COST, "ATS_SCAN_FAILURE_REFUND");
    }

    // 5. Build final score and feedback (merging AI or baseline)
    let score: number;
    let subScores: { keywords: number; formatting: number };
    let missingKeywords: string[];
    let formattingIssues: any[];
    let feedback: string;

    if (aiResult && !isDegraded) {
      score = aiResult.overallScore;
      subScores = aiResult.subScores;
      missingKeywords = aiResult.missingKeywords;
      formattingIssues = aiResult.formattingIssues;
      feedback = aiResult.feedback;
    } else {
      // Fallback baseline scoring
      const keywordsScore = Math.round(localKeywords.matchRatio * 100);
      const formattingScore = localFormatting.score;
      score = Math.round((keywordsScore + formattingScore) / 2);
      subScores = { keywords: keywordsScore, formatting: formattingScore };
      missingKeywords = localKeywords.missing;
      formattingIssues = localFormatting.issues;
      feedback = "Baseline Analysis: The AI evaluation service is temporarily unavailable. We have provided a baseline analysis of keywords match frequency and standard resume structure guidelines. Please try scanning again later for full AI recommendations.";
    }

    // 6. Persist to database
    const scan = await this.atsRepository.createScan({
      userId,
      resumeId,
      jobDescriptionHash: jdHash,
      jobDescriptionText: jdText,
      overallScore: score,
      subScores,
      missingKeywords,
      formattingIssues,
      feedback
    });

    try {
      const { container } = await import("../../config/di-container.js");
      await container.dashboardService.invalidateDashboardCache(userId);
    } catch (e) {}

    return scan;
  }

  async getScan(userId: string, id: string): Promise<AtsScan> {
    const scan = await this.atsRepository.findScanById(id);
    if (!scan || scan.userId !== userId) {
      throw new NotFoundError("ATS scan not found");
    }
    return scan;
  }

  async deleteScan(userId: string, id: string): Promise<void> {
    const scan = await this.getScan(userId, id);
    await this.atsRepository.deleteScan(scan.id);
  }

  async getScansByUser(userId: string): Promise<AtsScan[]> {
    return this.atsRepository.findScansByUser(userId);
  }

  async getScansByResume(userId: string, resumeId: string): Promise<AtsScan[]> {
    const resume = await this.resumeRepository.findById(resumeId);
    if (!resume || resume.userId !== userId) {
      throw new NotFoundError("Resume not found");
    }
    return this.atsRepository.findScansByResume(resumeId);
  }

  // --- Local Scoring Helpers ---

  private extractResumeText(content: any): string {
    if (!content) return "";
    let text = "";
    
    if (content.personalInfo) {
      const { fullName, email, phoneNumber, location } = content.personalInfo;
      text += `${fullName || ""} ${email || ""} ${phoneNumber || ""} ${location || ""}\n`;
    }
    if (content.summary) text += `${content.summary}\n`;
    
    if (Array.isArray(content.skills)) {
      text += content.skills.map((s: any) => s.name || s).join(", ") + "\n";
    }
    
    if (Array.isArray(content.experience)) {
      content.experience.forEach((e: any) => {
        text += `${e.title || ""} ${e.company || ""} ${e.location || ""} ${e.description || ""}\n`;
      });
    }
    
    if (Array.isArray(content.education)) {
      content.education.forEach((edu: any) => {
        text += `${edu.degree || ""} ${edu.institution || ""} ${edu.fieldOfStudy || ""} ${edu.description || ""}\n`;
      });
    }
    
    if (Array.isArray(content.projects)) {
      content.projects.forEach((p: any) => {
        text += `${p.title || ""} ${p.description || ""}\n`;
      });
    }
    
    return text;
  }

  private calculateLocalKeywords(resumeText: string, jdText: string): { matchRatio: number; missing: string[] } {
    const stopWords = new Set([
      "the", "and", "of", "to", "in", "a", "for", "is", "with", "on", "at", "by", "an", "this", "that", "as", "are", "be", "it", "or", "from",
      "your", "our", "their", "we", "you", "they", "i", "he", "she", "it", "us", "them", "me", "him", "her"
    ]);

    const cleanWords = (txt: string): string[] => {
      return txt
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));
    };

    const resumeWords = new Set(cleanWords(resumeText));
    const jdWords = cleanWords(jdText);
    const uniqueJdWords = Array.from(new Set(jdWords));

    if (uniqueJdWords.length === 0) return { matchRatio: 0, missing: [] };

    let matches = 0;
    const missing: string[] = [];

    uniqueJdWords.forEach(word => {
      if (resumeWords.has(word)) {
        matches++;
      } else {
        missing.push(word);
      }
    });

    return {
      matchRatio: matches / uniqueJdWords.length,
      missing: missing.slice(0, 15) // Return up to top 15 missing words
    };
  }

  private calculateLocalFormatting(resume: any): { score: number; issues: any[] } {
    const issues: any[] = [];
    let score = 100;
    const content = resume.content || {};

    // 1. Check sections
    if (!content.personalInfo?.fullName) {
      issues.push({
        category: "Structure",
        issue: "Missing full name",
        severity: "HIGH",
        suggestion: "Ensure you provide your full name in the personal contact section."
      });
      score -= 20;
    }

    if (!content.personalInfo?.email) {
      issues.push({
        category: "Structure",
        issue: "Missing email address",
        severity: "HIGH",
        suggestion: "Add a professional email address so recruiters can contact you."
      });
      score -= 15;
    }

    if (!content.summary || content.summary.length < 50) {
      issues.push({
        category: "Length",
        issue: "Summary is too short or missing",
        severity: "MEDIUM",
        suggestion: "Draft a 2-3 sentence summary section capturing your core value statement."
      });
      score -= 10;
    }

    const skillsCount = Array.isArray(content.skills) ? content.skills.length : 0;
    if (skillsCount < 3) {
      issues.push({
        category: "Content",
        issue: "Too few skills listed",
        severity: "MEDIUM",
        suggestion: "List at least 5-10 core skills related to your domain."
      });
      score -= 10;
    }

    const expCount = Array.isArray(content.experience) ? content.experience.length : 0;
    if (expCount === 0) {
      issues.push({
        category: "Structure",
        issue: "Work experience section is empty",
        severity: "HIGH",
        suggestion: "Detail your internships, project work, or full-time roles to show your experience."
      });
      score -= 25;
    }

    return {
      score: Math.max(score, 30), // Minimum score floor
      issues
    };
  }
}
