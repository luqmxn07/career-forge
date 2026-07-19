import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { z } from "zod";

// Structured schemas for validation
export const AtsScanResultSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  subScores: z.object({
    keywords: z.number().int().min(0).max(100),
    formatting: z.number().int().min(0).max(100)
  }),
  missingKeywords: z.array(z.string()),
  formattingIssues: z.array(z.object({
    category: z.string(),
    issue: z.string(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
    suggestion: z.string()
  })),
  feedback: z.string()
});

export type AtsScanResult = z.infer<typeof AtsScanResultSchema>;

export const CoverLetterResultSchema = z.object({
  content: z.string()
});

export type CoverLetterResult = z.infer<typeof CoverLetterResultSchema>;

export interface CoverLetterContext {
  fullName: string;
  summary?: string;
  highlights: string[];
  jobDescriptionText: string;
  companyName: string;
  roleTitle: string;
  tone: string;
}

export const InterviewQuestionResultSchema = z.object({
  question: z.string()
});

export type InterviewQuestionResult = z.infer<typeof InterviewQuestionResultSchema>;

export const InterviewAnswerGradingSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string(),
  rubricBreakdown: z.object({
    relevance: z.number().int().min(0).max(100),
    evidence: z.number().int().min(0).max(100),
    structure: z.number().int().min(0).max(100)
  })
});

export type InterviewAnswerGrading = z.infer<typeof InterviewAnswerGradingSchema>;

export class AiGatewayService {
  private readonly omnirouteUrl = env.OMNIROUTE_URL || "http://localhost:3000/v1";
  private readonly geminiKey = env.GEMINI_API_KEY;
  private readonly openaiKey = env.OPENAI_API_KEY;

  /**
   * Universal fetch caller with retry and failover fallback across OmniRoute, Gemini, and OpenAI
   */
  private async callLlm(
    prompt: string,
    systemInstruction: string,
    schema?: z.ZodSchema
  ): Promise<string> {
    const runAttempt = async (provider: "omniroute" | "gemini" | "openai"): Promise<string> => {
      if (provider === "omniroute") {
        logger.info(`[AI Gateway] Attempting call with OmniRoute AI Gateway (${this.omnirouteUrl})...`);
        const url = `${this.omnirouteUrl.replace(/\/$/, "")}/chat/completions`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "auto",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            response_format: schema ? { type: "json_object" } : { type: "text" }
          })
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`OmniRoute API returned status ${response.status}: ${body}`);
        }

        const data = await response.json();
        const outputText = data.choices?.[0]?.message?.content;
        if (!outputText) throw new Error("OmniRoute API output is empty");

        return outputText;
      } else if (provider === "gemini") {
        if (!this.geminiKey) throw new Error("GEMINI_API_KEY is not configured");
        
        logger.info("[AI Gateway] Attempting call with Google Gemini API...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;
        
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemInstruction}\n\nUser Input:\n${prompt}` }]
              }
            ],
            generationConfig: {
              responseMimeType: schema ? "application/json" : "text/plain"
            }
          })
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Gemini API returned status ${response.status}: ${body}`);
        }

        const data = await response.json();
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!outputText) throw new Error("Gemini API output is empty");
        
        return outputText;
      } else {
        if (!this.openaiKey) throw new Error("OPENAI_API_KEY is not configured");

        logger.info("[AI Gateway] Attempting call with OpenAI API (gpt-4o-mini)...");
        const url = "https://api.openai.com/v1/chat/completions";

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            response_format: schema ? { type: "json_object" } : { type: "text" }
          })
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`OpenAI API returned status ${response.status}: ${body}`);
        }

        const data = await response.json();
        const outputText = data.choices?.[0]?.message?.content;
        if (!outputText) throw new Error("OpenAI API output is empty");
        
        return outputText;
      }
    };

    // Retry configuration: OmniRoute first (90+ free providers), fallback to Gemini, then OpenAI
    const providers: Array<"omniroute" | "gemini" | "openai"> = [];
    if (this.omnirouteUrl) providers.push("omniroute");
    if (this.geminiKey) providers.push("gemini");
    if (this.openaiKey) providers.push("openai");

    if (providers.length === 0) {
      throw new Error("No AI providers configured in environment variables (.env)");
    }

    let lastError: any = null;

    // Try primary provider, with exactly 1 retry, then failover to fallback
    for (const provider of providers) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          // Timeout wrapping of 6 seconds
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const result = await Promise.race([
            runAttempt(provider),
            new Promise<string>((_, reject) => {
              controller.signal.addEventListener("abort", () => {
                reject(new Error(`AI Provider (${provider}) call timed out (6s budget exceeded)`));
              });
            })
          ]);

          clearTimeout(timeoutId);
          return result;
        } catch (err: any) {
          lastError = err;
          logger.warn(`[AI Gateway] Provider ${provider} attempt ${attempt} failed: ${err.message}`);
          if (attempt === 2) {
            logger.warn(`[AI Gateway] Provider ${provider} exhausted. Switching to fallback provider if available.`);
          }
        }
      }
    }

    throw lastError || new Error("All AI providers failed to return a response");
  }

  /**
   * Analyzes resume text against a job description for ATS scoring
   */
  async analyzeAtsScan(resumeText: string, jdText: string): Promise<AtsScanResult> {
    const systemInstruction = `You are a professional Applicant Tracking System (ATS) parsing scanner. 
Analyze the candidate's resume against the target job description.
Return a structured JSON output strictly matching this schema:
{
  "overallScore": number (0 to 100),
  "subScores": {
    "keywords": number (0 to 100 representing keyword matching compatibility),
    "formatting": number (0 to 100 representing template and reading alignment)
  },
  "missingKeywords": ["string", "string", ...],
  "formattingIssues": [
    {
      "category": "string (e.g. Structure, Length, Typography)",
      "issue": "description of the issue",
      "severity": "LOW" | "MEDIUM" | "HIGH",
      "suggestion": "how the user should rephrase or modify their resume to resolve this issue"
    }
  ],
  "feedback": "comprehensive feedback text summarizing match suitability, top strengths, and clear call-to-actions"
}

Analyze objectively. Do not hallucinate match results. Extract actual missing keywords that appear in the job description but are absent or poorly detailed in the resume.`;

    const prompt = `--- TARGET JOB DESCRIPTION ---
${jdText}

--- CANDIDATE RESUME TEXT ---
${resumeText}`;

    const rawJson = await this.callLlm(prompt, systemInstruction, AtsScanResultSchema);
    
    try {
      const parsed = JSON.parse(rawJson);
      return AtsScanResultSchema.parse(parsed);
    } catch (error) {
      logger.error("[AI Gateway] ATS Scan structured JSON output parse failure:", rawJson);
      throw new Error("AI provider returned invalid JSON structure for ATS Scan");
    }
  }

  /**
   * Generates a cover letter based on user profile and resume highlights
   */
  async generateCoverLetter(ctx: CoverLetterContext): Promise<CoverLetterResult> {
    const systemInstruction = `You are an expert career consultant. 
Generate a professional, highly-tailored cover letter based on the target company, role, job description context, and the candidate's highlighted experience bullets.
CRITICAL RULE: Rely ONLY on the experience highlights and summary facts provided. Do NOT fabricate employers, dates, college names, or specific achievements. Elaborate on facts present, but do not invent credentials.
Return a structured JSON output strictly matching this schema:
{
  "content": "string (The complete cover letter formatted with placeholders for dates/addressing if necessary. Use standard formal or requested tone.)"
}

Tone parameter requested: "${ctx.tone}"`;

    const prompt = `--- CANDIDATE INFORMATION ---
Name: ${ctx.fullName}
Profile Summary: ${ctx.summary || "Not provided"}

--- CANDIDATE WORK EXPERIENCE HIGHLIGHTS ---
${ctx.highlights.map(h => `- ${h}`).join("\n")}

--- TARGET APPLICATION ---
Company: ${ctx.companyName}
Role: ${ctx.roleTitle}

--- TARGET JOB DESCRIPTION ---
${ctx.jobDescriptionText}`;

    const rawJson = await this.callLlm(prompt, systemInstruction, CoverLetterResultSchema);

    try {
      const parsed = JSON.parse(rawJson);
      return CoverLetterResultSchema.parse(parsed);
    } catch (error) {
      logger.error("[AI Gateway] Cover Letter structured JSON output parse failure:", rawJson);
      throw new Error("AI provider returned invalid JSON structure for Cover Letter");
    }
  }

  /**
   * Generates next question for interview session incrementally
   */
  async generateInterviewQuestion(ctx: {
    type: string;
    difficulty: string;
    history: { question: string; answer?: string }[];
    resumeContent?: string;
    jobDescription?: string;
  }): Promise<InterviewQuestionResult> {
    const systemInstruction = `You are a professional interviewer. 
Your goal is to generate the next interview question for a candidate.
Generate a single, realistic question matching the specified type (${ctx.type}) and difficulty level (${ctx.difficulty}).

Interview Type Guide:
- HR: Behavioral, cultural fit, basic info.
- Technical: System design, coding principles, language features, architectural choices.
- Behavioral: STAR-based situational questions.
- Resume: Specific deep dives probing items in the candidate's Resume details.
- JD: Targeting requirements, skills, and expectations listed in the Job Description.

Ensure you do NOT repeat questions already asked. Look at the session history and build upon the conversation.
Return a structured JSON output strictly matching this schema:
{
  "question": "string"
}`;

    const prompt = `--- SESSION SETTING ---
Type: ${ctx.type}
Difficulty: ${ctx.difficulty}

--- TARGET JOB DESCRIPTION (IF APPLICABLE) ---
${ctx.jobDescription || "Not provided"}

--- CANDIDATE RESUME DETAILS (IF APPLICABLE) ---
${ctx.resumeContent || "Not provided"}

--- INTERVIEW HISTORY (PAST QUESTIONS & CANDIDATE ANSWERS) ---
${ctx.history.map((h, i) => `[Question ${i + 1}]: ${h.question}\n[Candidate Answer ${i + 1}]: ${h.answer || "No answer provided"}`).join("\n\n")}

Generate the next question.`;

    const rawJson = await this.callLlm(prompt, systemInstruction, InterviewQuestionResultSchema);

    try {
      const parsed = JSON.parse(rawJson);
      return InterviewQuestionResultSchema.parse(parsed);
    } catch (error) {
      logger.error("[AI Gateway] Interview Question output parse failure:", rawJson);
      throw new Error("AI provider returned invalid JSON structure for Interview Question");
    }
  }

  /**
   * Evaluates candidate's answer and compiles scores
   */
  async gradeInterviewAnswer(ctx: {
    question: string;
    answer: string;
    difficulty: string;
  }): Promise<InterviewAnswerGrading> {
    const systemInstruction = `You are an expert interviewer grading a candidate's response.
Evaluate the candidate's answer to the question under the difficulty standard of "${ctx.difficulty}".
Rate the answer out of 100 on three sub-rubrics:
- relevance: How directly does the answer address the question?
- evidence: Did the candidate provide concrete examples, metrics, or details?
- structure: Is the answer structured, clear, and logical (e.g. STAR method)?

Return a structured JSON output strictly matching this schema:
{
  "score": 0-100,
  "feedback": "string",
  "rubricBreakdown": {
    "relevance": 0-100,
    "evidence": 0-100,
    "structure": 0-100
  }
}`;

    const prompt = `--- DIFFICULTY STANDARD ---
${ctx.difficulty}

--- QUESTION ASKED ---
${ctx.question}

--- CANDIDATE RESPONSE ---
${ctx.answer}`;

    const rawJson = await this.callLlm(prompt, systemInstruction, InterviewAnswerGradingSchema);

    try {
      const parsed = JSON.parse(rawJson);
      return InterviewAnswerGradingSchema.parse(parsed);
    } catch (error) {
      logger.error("[AI Gateway] Interview grading output parse failure:", rawJson);
      throw new Error("AI provider returned invalid JSON structure for Interview grading");
    }
  }

  /**
   * Generates role-tailored resume content (summary, experience STAR bullets, categorized skills)
   */
  async tailorResumeForRole(ctx: {
    targetRole: string;
    fullName?: string;
    summary?: string;
    experiences?: any[];
    skills?: any[];
  }): Promise<{
    summary: string;
    experience: any[];
    skills: { technical: string[]; tools: string[]; soft: string[] };
  }> {
    const systemInstruction = `You are a high-level executive resume writer and career coach.
Your job is to take a candidate's background and tailor it specifically for the role of "${ctx.targetRole}".
Do NOT just copy-paste raw input. 
Rewrite the professional summary to sound compelling, metric-driven, and focused on "${ctx.targetRole}".
Rewrite experience descriptions into strong STAR-method action bullet points (starting with strong action verbs like Designed, Architected, Engineered, Implemented, Scaled).
Categorize skills into technical (programming/frameworks), tools (platforms/IDEs/cloud), and soft skills (leadership, agile).

Return JSON matching this format:
{
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["bullet 1", "bullet 2"]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "soft": ["soft1", "soft2"]
  }
}`;

    const prompt = `--- TARGET JOB ROLE ---
${ctx.targetRole}

--- CANDIDATE RAW SUMMARY ---
${ctx.summary || "Not provided"}

--- CANDIDATE EXPERIENCES ---
${JSON.stringify(ctx.experiences || [], null, 2)}

--- CANDIDATE SKILLS ---
${JSON.stringify(ctx.skills || [], null, 2)}`;

    try {
      const rawJson = await this.callLlm(prompt, systemInstruction);
      const parsed = JSON.parse(rawJson);
      return {
        summary: parsed.summary || `Results-driven ${ctx.targetRole} with hands-on experience building scalable applications and driving project success.`,
        experience: Array.isArray(parsed.experience) ? parsed.experience : (ctx.experiences || []),
        skills: {
          technical: parsed.skills?.technical || (ctx.skills?.map((s: any) => typeof s === "string" ? s : s.name) || []),
          tools: parsed.skills?.tools || ["Git", "VS Code", "Postman", "Docker"],
          soft: parsed.skills?.soft || ["Problem Solving", "Team Collaboration", "Agile Execution"]
        }
      };
    } catch (e) {
      logger.warn("[AI Gateway] Using rule-based fallback for role tailoring due to AI response format:", e);
      return {
        summary: `Ambitious and detail-oriented ${ctx.targetRole} with strong technical fundamentals and hands-on experience building web applications. Dedicated to writing clean code, optimizing performance, and delivering high-quality software solutions.`,
        experience: (ctx.experiences || []).map((exp: any) => ({
          company: exp.company || exp.institution || "Technology Company",
          position: exp.title || exp.position || ctx.targetRole,
          startDate: exp.startDate || "",
          endDate: exp.endDate || "Present",
          bullets: [
            `Engineered core features and API endpoints aligned with ${ctx.targetRole} best practices.`,
            `Collaborated with cross-functional teams to deliver high-quality scalable software components.`,
            `Optimized workflow performance, reducing latency and enhancing user interface responsiveness.`
          ]
        })),
        skills: {
          technical: (ctx.skills || []).map((s: any) => typeof s === "string" ? s : s.name).slice(0, 8),
          tools: ["Git", "GitHub", "VS Code", "Postman"],
          soft: ["Problem Solving", "Team Collaboration", "Agile Execution"]
        }
      };
    }
  }
}
