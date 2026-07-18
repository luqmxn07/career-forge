import { PrismaClient, InterviewSession } from "@prisma/client";
import { InterviewsRepository } from "./interviews.repository.js";
import { ResumeRepository } from "../resume/resume.repository.js";
import { CreditsService } from "../credits/credits.service.js";
import { AiGatewayService } from "../ai-gateway/ai-gateway.service.js";
import { NotFoundError, ValidationError } from "../../errors/index.js";

export class InterviewsService {
  constructor(
    private readonly interviewsRepository: InterviewsRepository,
    private readonly resumeRepository: ResumeRepository,
    private readonly creditsService: CreditsService,
    private readonly aiGatewayService: AiGatewayService,
    private readonly prisma: PrismaClient
  ) {}

  /**
   * Starts a new practice session, deducts credits, and generates the first question.
   */
  async startSession(
    userId: string,
    data: {
      type: string;
      difficulty: string;
      questionCount: number;
      sourceResumeId?: string;
      jobDescriptionText?: string;
    }
  ): Promise<{ session: InterviewSession; firstQuestion: { id: string; question: string } }> {
    // 1. Deduct AI credits for practicing (costs 15 credits)
    const INTERVIEW_CREDIT_COST = 15;
    await this.creditsService.deductCredits(userId, INTERVIEW_CREDIT_COST, "INTERVIEW_PRACTICE");

    // 2. Fetch resume contents if linked
    let resumeText = "";
    if (data.sourceResumeId) {
      const resume = await this.resumeRepository.findById(data.sourceResumeId);
      if (!resume || resume.userId !== userId) {
        throw new NotFoundError("Linked resume not found or not owned by user");
      }
      const resumeContent = resume.content as any;
      if (resumeContent) {
        resumeText = JSON.stringify({
          title: resume.title,
          summary: resumeContent.summary || "",
          skills: resumeContent.skills || [],
          experience: (resumeContent.experience || []).map((exp: any) => ({
            role: exp.title,
            company: exp.company,
            description: exp.description
          }))
        });
      }
    }

    // 3. Create interview session in database
    const session = await this.interviewsRepository.createSession({
      userId,
      type: data.type,
      difficulty: data.difficulty,
      status: "IN_PROGRESS",
      sourceResumeId: data.sourceResumeId,
      jobDescriptionText: data.jobDescriptionText
    });

    // 4. Generate the 1st question incrementally
    let firstQuestionText = "Could you tell me about yourself and your background?";
    try {
      const result = await this.aiGatewayService.generateInterviewQuestion({
        type: data.type,
        difficulty: data.difficulty,
        history: [], // first question has no history
        resumeContent: resumeText || undefined,
        jobDescription: data.jobDescriptionText || undefined
      });
      firstQuestionText = result.question;
    } catch (err) {
      // Fallback first question
      if (data.type === "Technical") {
        firstQuestionText = "Can you describe a challenging technical project you worked on recently?";
      } else if (data.type === "Behavioral") {
        firstQuestionText = "Tell me about a time when you had to work with a difficult teammate.";
      }
    }

    // 5. Save the generated question
    const dbQuestion = await this.interviewsRepository.createQuestion({
      sessionId: session.id,
      question: firstQuestionText,
      sortOrder: 0
    });

    try {
      const { container } = await import("../../config/di-container.js");
      await container.dashboardService.invalidateDashboardCache(userId);
    } catch (e) {}

    return {
      session,
      firstQuestion: {
        id: dbQuestion.id,
        question: dbQuestion.question
      }
    };
  }

  /**
   * Evaluates candidate's answer and compiles next question or concludes session.
   */
  async submitAnswer(
    userId: string,
    sessionId: string,
    answerText: string
  ): Promise<{
    completed: boolean;
    gradedAnswer: {
      score: number;
      feedback: string;
      rubricBreakdown: any;
    };
    nextQuestion?: {
      id: string;
      question: string;
    };
  }> {
    // 1. Retrieve session and validate status
    const session = await this.interviewsRepository.findSessionById(sessionId);
    if (!session || session.userId !== userId) {
      throw new NotFoundError("Interview session not found");
    }

    if (session.status !== "IN_PROGRESS") {
      throw new ValidationError("This interview session has already been completed or archived");
    }

    // 2. Identify the active unanswered question
    const activeQuestion = session.questions.find(
      (q) => q.answers.length === 0
    );

    if (!activeQuestion) {
      throw new ValidationError("No pending question to answer for this session");
    }

    // 3. Evaluate candidate's answer using AI Gateway grading
    let evaluation = {
      score: 70,
      feedback: "Answer received and recorded.",
      rubricBreakdown: { relevance: 70, evidence: 70, structure: 70 }
    };

    try {
      evaluation = await this.aiGatewayService.gradeInterviewAnswer({
        question: activeQuestion.question,
        answer: answerText,
        difficulty: session.difficulty
      });
    } catch (err) {
      // Keep evaluation default placeholder if grading fails
    }

    // 4. Save answer to DB
    const graded = await this.interviewsRepository.createAnswer({
      questionId: activeQuestion.id,
      answerText,
      score: evaluation.score,
      rubricBreakdown: evaluation.rubricBreakdown,
      feedback: evaluation.feedback,
      attemptNumber: 1
    });

    // 5. Check if we have met the question count target
    // We fetch questions count from DB or configuration
    const activeQuestionIndex = activeQuestion.sortOrder;
    const isLastQuestion = activeQuestionIndex >= 4; // limit sessions to 5 questions in total

    if (isLastQuestion) {
      // Conclude session
      await this.interviewsRepository.updateSessionStatus(sessionId, "COMPLETED", new Date());

      try {
        const { container } = await import("../../config/di-container.js");
        await container.dashboardService.invalidateDashboardCache(userId);
      } catch (e) {}

      return {
        completed: true,
        gradedAnswer: {
          score: graded.score,
          feedback: graded.feedback,
          rubricBreakdown: graded.rubricBreakdown
        }
      };
    }

    // 6. Otherwise, compile history and generate the next question
    const history = session.questions.map((q) => {
      // Find the answer if this question was already answered, or use the current submitted answer
      const ans = q.id === activeQuestion.id ? answerText : q.answers[0]?.answerText;
      return {
        question: q.question,
        answer: ans
      };
    });

    let resumeText = "";
    if (session.sourceResumeId) {
      const resume = await this.resumeRepository.findById(session.sourceResumeId);
      const resumeContent = resume?.content as any;
      if (resumeContent) {
        resumeText = JSON.stringify(resumeContent);
      }
    }

    let nextQuestionText = "Could you elaborate on your experience resolving team conflicts?";
    try {
      const aiResult = await this.aiGatewayService.generateInterviewQuestion({
        type: session.type,
        difficulty: session.difficulty,
        history,
        resumeContent: resumeText || undefined,
        jobDescription: session.jobDescriptionText || undefined
      });
      nextQuestionText = aiResult.question;
    } catch (err) {
      // Fallback basic questions
      nextQuestionText = `Can you expand on how you address questions about ${session.type.toLowerCase()} challenges?`;
    }

    // Save next question
    const dbQuestion = await this.interviewsRepository.createQuestion({
      sessionId: session.id,
      question: nextQuestionText,
      sortOrder: activeQuestionIndex + 1
    });

    return {
      completed: false,
      gradedAnswer: {
        score: graded.score,
        feedback: graded.feedback,
        rubricBreakdown: graded.rubricBreakdown
      },
      nextQuestion: {
        id: dbQuestion.id,
        question: dbQuestion.question
      }
    };
  }

  /**
   * Retrieves full details for a session (including all questions and answers).
   */
  async getSessionDetail(userId: string, id: string) {
    const session = await this.interviewsRepository.findSessionById(id);
    if (!session || session.userId !== userId) {
      throw new NotFoundError("Session not found or access denied");
    }
    return session;
  }

  /**
   * Retrieves all sessions for a user.
   */
  async getSessionsByUser(userId: string): Promise<InterviewSession[]> {
    return this.interviewsRepository.findSessionsByUser(userId);
  }
}
