import { Router } from "express";
import { AdminController } from "./admin.controller.js";
import { authMiddleware, adminMfaMiddleware } from "../../middleware/auth.middleware.js";
import { rbacMiddleware } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { adjustCreditsSchema, updateFeedbackStatusSchema } from "./admin.dto.js";

export const createAdminRouter = (adminController: AdminController): Router => {
  const router = Router();

  // Enforce session security checks on all admin paths
  router.use(authMiddleware);
  router.use(rbacMiddleware(["ADMIN"]));
  router.use(adminMfaMiddleware);

  router.get("/stats", adminController.getStats);
  router.get("/audit-logs", adminController.getAuditLogs);
  router.get("/feedback", adminController.getFeedback);
  
  router.patch(
    "/feedback/:id",
    validate({ body: updateFeedbackStatusSchema }),
    adminController.resolveTicket
  );
  
  router.post(
    "/credits/adjust",
    validate({ body: adjustCreditsSchema }),
    adminController.adjustCredits
  );

  return router;
};
