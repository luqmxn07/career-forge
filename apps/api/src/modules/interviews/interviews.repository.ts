import { PrismaClient, InterviewSession, InterviewQuestion, InterviewAnswer } from "@prisma/client";

export class InterviewsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createSession(data: {
    userId: string;
    type: string;
    difficulty: string;
    status: string;
    sourceResumeId?: string;
    jobDescriptionText?: string;
  }): Promise<InterviewSession> {
    return this.prisma.interviewSession.create({
      data: {
        userId: data.userId,
        type: data.type,
        difficulty: data.difficulty,
        status: data.status,
        sourceResumeId: data.sourceResumeId,
        jobDescriptionText: data.jobDescriptionText
      }
    });
  }

  async findSessionById(id: string) {
    return this.prisma.interviewSession.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            answers: {
              orderBy: { createdAt: "desc" }
            }
          }
        }
      }
    });
  }

  async findSessionsByUser(userId: string): Promise<InterviewSession[]> {
    return this.prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" }
    });
  }

  async createQuestion(data: {
    sessionId: string;
    question: string;
    sortOrder: number;
  }): Promise<InterviewQuestion> {
    return this.prisma.interviewQuestion.create({
      data: {
        sessionId: data.sessionId,
        question: data.question,
        sortOrder: data.sortOrder
      }
    });
  }

  async createAnswer(data: {
    questionId: string;
    answerText: string;
    score: number;
    rubricBreakdown: any;
    feedback: string;
    attemptNumber: number;
  }): Promise<InterviewAnswer> {
    return this.prisma.interviewAnswer.create({
      data: {
        questionId: data.questionId,
        answerText: data.answerText,
        score: data.score,
        rubricBreakdown: data.rubricBreakdown,
        feedback: data.feedback,
        attemptNumber: data.attemptNumber
      }
    });
  }

  async updateSessionStatus(id: string, status: string, completedAt?: Date): Promise<InterviewSession> {
    return this.prisma.interviewSession.update({
      where: { id },
      data: {
        status,
        ...(completedAt && { completedAt })
      }
    });
  }

  async deleteSession(id: string): Promise<InterviewSession> {
    return this.prisma.interviewSession.delete({
      where: { id }
    });
  }
}
