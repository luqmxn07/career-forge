import { Router } from "express";
import { JobTrackerController } from "./job-tracker.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createJobEntrySchema, updateJobEntrySchema } from "./job-tracker.dto.js";

export const createJobTrackerRouter = (jobTrackerController: JobTrackerController): Router => {
  const router = Router();

  router.use(authMiddleware);

  router.post("/", validate({ body: createJobEntrySchema }), jobTrackerController.create);
  router.get("/", jobTrackerController.getEntries);
  router.post("/search", jobTrackerController.searchLiveJobs);
  router.get("/:id", jobTrackerController.getEntry);
  router.put("/:id", validate({ body: updateJobEntrySchema }), jobTrackerController.update);
  router.patch("/:id", validate({ body: updateJobEntrySchema }), jobTrackerController.update);
  router.post("/:id/notify-email", jobTrackerController.notifyEmail);
  router.delete("/:id", jobTrackerController.delete);

  return router;
};
