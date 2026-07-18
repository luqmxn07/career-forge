import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { CreditsService } from "../credits/credits.service.js";
import { NotFoundError } from "../../errors/index.js";

export class BillingService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly creditsService: CreditsService
  ) {}

  /**
   * Gets user subscription status and credit details
   */
  async getSubscriptionDetails(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId }
    });
    const credits = await this.creditsService.getBalance(userId);
    return {
      planTier: subscription?.planTier || "FREE",
      status: subscription?.status || "ACTIVE",
      renewsAt: subscription?.renewsAt || null,
      credits
    };
  }

  /**
   * Generates a checkout session URL from Stripe or placeholder for local mock billing
   */
  async createCheckoutSession(userId: string, priceId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user) throw new NotFoundError("User not found");

    const stripeKey = env.STRIPE_SECRET_KEY;
    const isMock = !stripeKey || stripeKey.startsWith("your_") || stripeKey === "";

    if (isMock) {
      logger.info(`[Billing Service] Stripe Key not configured. Generating mockup Checkout URL for user ${userId}.`);
      // Return a frontend URL with query params to simulate checkout completion locally
      return `${env.FRONTEND_URL}/billing?mock_success=true&user_id=${userId}`;
    }

    try {
      const formBody = new URLSearchParams({
        success_url: `${env.FRONTEND_URL}/billing?success=true`,
        cancel_url: `${env.FRONTEND_URL}/billing?cancel=true`,
        mode: "subscription",
        client_reference_id: userId,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1"
      });

      if (user.subscription?.stripeCustomerId) {
        formBody.set("customer", user.subscription.stripeCustomerId);
      } else {
        formBody.set("customer_email", user.email);
      }

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody.toString()
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Stripe Checkout Session API error: ${errText}`);
      }

      const session = await response.json();
      return session.url;
    } catch (err: any) {
      logger.error(`[Billing Service] Stripe checkout session generation failed: ${err.message}`);
      throw new Error(`Failed to initialize payment gateway: ${err.message}`);
    }
  }

  /**
   * Generates Stripe Customer Portal URL for self-service subscription management
   */
  async createPortalSession(userId: string): Promise<string> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error("No billing customer profile found. Please purchase a subscription first.");
    }

    const stripeKey = env.STRIPE_SECRET_KEY;
    const isMock = !stripeKey || stripeKey.startsWith("your_") || stripeKey === "";

    if (isMock) {
      logger.info(`[Billing Service] Mock customer portal redirect for user ${userId}`);
      return `${env.FRONTEND_URL}/billing?mock_portal=true`;
    }

    try {
      const formBody = new URLSearchParams({
        customer: subscription.stripeCustomerId,
        return_url: `${env.FRONTEND_URL}/billing`
      });

      const response = await fetch("https://api.stripe.com/v1/billing/portal/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody.toString()
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Stripe Customer Portal API error: ${errText}`);
      }

      const session = await response.json();
      return session.url;
    } catch (err: any) {
      logger.error(`[Billing Service] Stripe customer portal generation failed: ${err.message}`);
      throw new Error(`Failed to open billing settings: ${err.message}`);
    }
  }

  /**
   * Handles dynamic Stripe Webhook trigger events
   */
  async handleWebhook(event: any): Promise<void> {
    const { type, data } = event;
    logger.info(`[Billing Service Webhook] Received event type: ${type}`);

    switch (type) {
      case "checkout.session.completed": {
        const session = data.object;
        const userId = session.client_reference_id;
        const stripeCustomerId = session.customer;
        const stripeSubscriptionId = session.subscription;

        if (!userId) {
          logger.warn("[Billing Service Webhook] checkout.session.completed missing client_reference_id");
          return;
        }

        await this.activatePremiumSubscription(userId, stripeCustomerId, stripeSubscriptionId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = data.object;
        const subId = subscription.id;
        await this.cancelSubscription(subId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = data.object;
        const subId = subscription.id;
        const status = subscription.status.toUpperCase();
        await this.updateSubscriptionStatus(subId, status);
        break;
      }

      default:
        logger.debug(`[Billing Service Webhook] Unhandled Stripe event type: ${type}`);
    }
  }

  /**
   * Activates Premium tier + Allocates 500 AI credits transactionally
   */
  async activatePremiumSubscription(userId: string, customerId: string, subscriptionId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Update subscription status
      await tx.subscription.upsert({
        where: { userId },
        update: {
          planTier: "PREMIUM",
          status: "ACTIVE",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        create: {
          userId,
          planTier: "PREMIUM",
          status: "ACTIVE",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      // 2. Allocate AI Credits (Standard Premium credit bundle: 500 credits)
      const ALLOCATION_AMOUNT = 500;
      const currentBalance = await tx.aiCreditLedger.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
      });

      const newBalance = (currentBalance?.balanceAfter || 0) + ALLOCATION_AMOUNT;

      await tx.aiCreditLedger.create({
        data: {
          userId,
          transactionType: "ALLOCATION",
          amount: ALLOCATION_AMOUNT,
          relatedFeature: "PREMIUM_SUBSCRIPTION_BENEFIT",
          balanceAfter: newBalance
        }
      });

      logger.info(`[Billing Service] Premium subscription activated successfully for user ${userId}. Allocated ${ALLOCATION_AMOUNT} credits.`);
    });

    try {
      const { container } = await import("../../config/di-container.js");
      await container.notificationsService.createNotification(
        userId,
        "Subscription Upgraded",
        "Welcome to CareerForge Premium! 500 AI credits have been successfully allocated to your account.",
        "SUCCESS"
      );
    } catch (notifierErr) {
      logger.error(`Failed to trigger notification on subscription upgrade: ${(notifierErr as any).message}`);
    }
  }

  /**
   * Cancels subscription, downgrades plan to Free
   */
  private async cancelSubscription(subId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subId }
    });

    if (!subscription) {
      logger.warn(`[Billing Service] Cancel subscription request failed: Subscription id ${subId} not found.`);
      return;
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planTier: "FREE",
        status: "CANCELED"
      }
    });

    logger.info(`[Billing Service] Downgraded user ${subscription.userId} to FREE tier due to subscription cancel.`);
  }

  /**
   * Updates Stripe subscription statuses
   */
  private async updateSubscriptionStatus(subId: string, status: any): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subId }
    });

    if (!subscription) {
      logger.warn(`[Billing Service] Update subscription status failed: Subscription id ${subId} not found.`);
      return;
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: status // INCOMPLETE, PAST_DUE, UNPAID, etc.
      }
    });

    logger.info(`[Billing Service] Updated subscription status to ${status} for user ${subscription.userId}.`);
  }
}
