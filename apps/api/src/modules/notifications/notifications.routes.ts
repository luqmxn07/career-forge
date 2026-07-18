import { Router } from "express";
import { NotificationsController } from "./notifications.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updatePreferenceSchema } from "./notifications.dto.js";

export const createNotificationsRouter = (notificationsController: NotificationsController): Router => {
  const router = Router();

  router.use(authMiddleware);

  router.get("/", notificationsController.list);
  router.post("/read-all", notificationsController.markAllRead);
  router.post("/:id/read", notificationsController.markRead);
  router.get("/preferences", notificationsController.getPreferences);
  router.put("/preferences", validate({ body: updatePreferenceSchema }), notificationsController.updatePreferences);

  return router;
};
