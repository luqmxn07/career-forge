import { PrismaClient } from "@prisma/client";
import { AuthRepository } from "../modules/auth/auth.repository.js";
import { AuthService } from "../modules/auth/auth.service.js";
import { AuthController } from "../modules/auth/auth.controller.js";
import { ProfileRepository } from "../modules/profile/profile.repository.js";
import { ProfileService } from "../modules/profile/profile.service.js";
import { ProfileController } from "../modules/profile/profile.controller.js";
import { ResumeRepository } from "../modules/resume/resume.repository.js";
import { ResumeService } from "../modules/resume/resume.service.js";
import { ResumeController } from "../modules/resume/resume.controller.js";

// Import new modules for Milestone 2
import { AiGatewayService } from "../modules/ai-gateway/ai-gateway.service.js";
import { CreditsRepository } from "../modules/credits/credits.repository.js";
import { CreditsService } from "../modules/credits/credits.service.js";
import { CreditsController } from "../modules/credits/credits.controller.js";
import { AtsRepository } from "../modules/ats/ats.repository.js";
import { AtsService } from "../modules/ats/ats.service.js";
import { AtsController } from "../modules/ats/ats.controller.js";
import { CoverLetterRepository } from "../modules/cover-letter/cover-letter.repository.js";
import { CoverLetterService } from "../modules/cover-letter/cover-letter.service.js";
import { CoverLetterController } from "../modules/cover-letter/cover-letter.controller.js";
import { BillingService } from "../modules/billing/billing.service.js";
import { BillingController } from "../modules/billing/billing.controller.js";

// Import new modules for Milestone 3
import { InterviewsRepository } from "../modules/interviews/interviews.repository.js";
import { InterviewsService } from "../modules/interviews/interviews.service.js";
import { InterviewsController } from "../modules/interviews/interviews.controller.js";
import { JobTrackerRepository } from "../modules/job-tracker/job-tracker.repository.js";
import { JobTrackerService } from "../modules/job-tracker/job-tracker.service.js";
import { JobTrackerController } from "../modules/job-tracker/job-tracker.controller.js";

// Import new modules for Milestone 4
import { NotificationsRepository } from "../modules/notifications/notifications.repository.js";
import { NotificationsService } from "../modules/notifications/notifications.service.js";
import { NotificationsController } from "../modules/notifications/notifications.controller.js";
import { DashboardService } from "../modules/dashboard/dashboard.service.js";
import { DashboardController } from "../modules/dashboard/dashboard.controller.js";

// Import new modules for Milestone 5
import { AdminRepository } from "../modules/admin/admin.repository.js";
import { AdminService } from "../modules/admin/admin.service.js";
import { AdminController } from "../modules/admin/admin.controller.js";

class DIContainer {
  private static instance: DIContainer;
  
  public readonly prisma: PrismaClient;
  public readonly authRepository: AuthRepository;
  public readonly authService: AuthService;
  public readonly authController: AuthController;
  
  public readonly profileRepository: ProfileRepository;
  public readonly profileService: ProfileService;
  public readonly profileController: ProfileController;

  public readonly resumeRepository: ResumeRepository;
  public readonly resumeService: ResumeService;
  public readonly resumeController: ResumeController;

  // Milestone 2 declarations
  public readonly aiGatewayService: AiGatewayService;
  
  public readonly creditsRepository: CreditsRepository;
  public readonly creditsService: CreditsService;
  public readonly creditsController: CreditsController;

  public readonly atsRepository: AtsRepository;
  public readonly atsService: AtsService;
  public readonly atsController: AtsController;

  public readonly coverLetterRepository: CoverLetterRepository;
  public readonly coverLetterService: CoverLetterService;
  public readonly coverLetterController: CoverLetterController;

  public readonly billingService: BillingService;
  public readonly billingController: BillingController;

  // Milestone 3 declarations
  public readonly interviewsRepository: InterviewsRepository;
  public readonly interviewsService: InterviewsService;
  public readonly interviewsController: InterviewsController;

  public readonly jobTrackerRepository: JobTrackerRepository;
  public readonly jobTrackerService: JobTrackerService;
  public readonly jobTrackerController: JobTrackerController;

  // Milestone 4 declarations
  public readonly notificationsRepository: NotificationsRepository;
  public readonly notificationsService: NotificationsService;
  public readonly notificationsController: NotificationsController;

  public readonly dashboardService: DashboardService;
  public readonly dashboardController: DashboardController;

  // Milestone 5 declarations
  public readonly adminRepository: AdminRepository;
  public readonly adminService: AdminService;
  public readonly adminController: AdminController;

  private constructor() {
    // Instantiate database client
    this.prisma = new PrismaClient();

    // Wire Authentication Module
    this.authRepository = new AuthRepository(this.prisma);
    this.authService = new AuthService(this.authRepository);
    this.authController = new AuthController(this.authService);

    // Wire Profile Module
    this.profileRepository = new ProfileRepository(this.prisma);
    this.profileService = new ProfileService(this.profileRepository);
    this.profileController = new ProfileController(this.profileService);

    // Wire Resume Module
    this.resumeRepository = new ResumeRepository(this.prisma);
    this.resumeService = new ResumeService(this.resumeRepository, this.prisma);
    this.resumeController = new ResumeController(this.resumeService);

    // Wire Milestone 2 Modules
    this.aiGatewayService = new AiGatewayService();

    this.creditsRepository = new CreditsRepository(this.prisma);
    this.creditsService = new CreditsService(this.creditsRepository, this.prisma);
    this.creditsController = new CreditsController(this.creditsService);

    this.atsRepository = new AtsRepository(this.prisma);
    this.atsService = new AtsService(
      this.atsRepository,
      this.resumeRepository,
      this.creditsService,
      this.aiGatewayService
    );
    this.atsController = new AtsController(this.atsService);

    this.coverLetterRepository = new CoverLetterRepository(this.prisma);
    this.coverLetterService = new CoverLetterService(
      this.coverLetterRepository,
      this.resumeRepository,
      this.profileRepository,
      this.creditsService,
      this.aiGatewayService
    );
    this.coverLetterController = new CoverLetterController(this.coverLetterService);

    this.billingService = new BillingService(this.prisma, this.creditsService);
    this.billingController = new BillingController(this.billingService);

    // Wire Milestone 3 Modules
    this.interviewsRepository = new InterviewsRepository(this.prisma);
    this.interviewsService = new InterviewsService(
      this.interviewsRepository,
      this.resumeRepository,
      this.creditsService,
      this.aiGatewayService,
      this.prisma
    );
    this.interviewsController = new InterviewsController(this.interviewsService);

    this.jobTrackerRepository = new JobTrackerRepository(this.prisma);
    this.jobTrackerService = new JobTrackerService(this.jobTrackerRepository, this.prisma);
    this.jobTrackerController = new JobTrackerController(this.jobTrackerService);

    // Wire Milestone 4 Modules
    this.notificationsRepository = new NotificationsRepository(this.prisma);
    this.notificationsService = new NotificationsService(this.notificationsRepository);
    this.notificationsController = new NotificationsController(this.notificationsService);

    this.dashboardService = new DashboardService(this.prisma);
    this.dashboardController = new DashboardController(this.dashboardService);

    // Wire Milestone 5 Modules
    this.adminRepository = new AdminRepository(this.prisma);
    this.adminService = new AdminService(this.adminRepository, this.prisma);
    this.adminController = new AdminController(this.adminService);
  }

  public static get(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}

export const container = DIContainer.get();
export const prisma = container.prisma;

