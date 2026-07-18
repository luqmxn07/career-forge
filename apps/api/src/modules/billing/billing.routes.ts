import { Router } from "express";
import { BillingController } from "./billing.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createCheckoutSessionSchema } from "./billing.dto.js";

export const createBillingRouter = (billingController: BillingController): Router => {
  const router = Router();

  // Webhook is public (auth handled cryptographically inside controller via signature check)
  router.post("/webhook", billingController.handleWebhook);

  // Protected customer checkout and billing settings actions
  router.post("/checkout", authMiddleware, validate({ body: createCheckoutSessionSchema }), billingController.createCheckout);
  router.post("/portal", authMiddleware, billingController.createPortal);
  router.get("/subscription", authMiddleware, billingController.getSubscription);

  return router;
};
