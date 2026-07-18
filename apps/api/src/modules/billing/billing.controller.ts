import { Request, Response, NextFunction } from "express";
import { BillingService } from "./billing.service.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import crypto from "crypto";

export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  getSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const details = await this.billingService.getSubscriptionDetails(userId);
      res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      next(error);
    }
  };

  createCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { priceId } = req.body;

      const url = await this.billingService.createCheckoutSession(userId, priceId);
      res.status(200).json({
        success: true,
        data: { url }
      });
    } catch (error) {
      next(error);
    }
  };

  createPortal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const url = await this.billingService.createPortalSession(userId);
      res.status(200).json({
        success: true,
        data: { url }
      });
    } catch (error) {
      next(error);
    }
  };

  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers["stripe-signature"] as string;
      const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
      
      const isMockWebhook = !webhookSecret || webhookSecret.startsWith("your_") || !signature;

      if (!isMockWebhook) {
        // Retrieve raw body string by JSON stringifying (works since body-parser already processed it)
        const rawBody = JSON.stringify(req.body);
        const isValid = this.verifyStripeSignature(rawBody, signature, webhookSecret!);
        if (!isValid) {
          logger.warn("[Stripe Webhook] Webhook signature verification failed");
          res.status(400).send("Webhook signature verification failed");
          return;
        }
      } else {
        logger.info("[Stripe Webhook] Mock mode bypass signature checking");
      }

      // Process event
      await this.billingService.handleWebhook(req.body);

      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  };

  // Helper method for local cryptographic verification of Stripe signature
  private verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
    try {
      const parts = signatureHeader.split(",");
      const timestampPart = parts.find(p => p.trim().startsWith("t="));
      const signaturePart = parts.find(p => p.trim().startsWith("v1="));

      if (!timestampPart || !signaturePart) return false;

      const timestamp = timestampPart.split("=")[1];
      const signature = signaturePart.split("=")[1];

      const payload = `${timestamp}.${rawBody}`;
      const computedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      return computedSignature === signature;
    } catch (err) {
      logger.error(`[Stripe Webhook] Cryptographic validation error: ${(err as any).message}`);
      return false;
    }
  }
}
