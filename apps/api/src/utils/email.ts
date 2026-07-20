// @ts-ignore
import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

// Initialize Nodemailer transporter if SMTP settings exist in env
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  logger.info(`📧 Nodemailer SMTP transporter initialized (${process.env.SMTP_HOST})`);
} else {
  logger.info("ℹ️ SMTP environment credentials missing. Email notifications will operate in LOG/MOCK mode.");
}

export async function sendEmailNotification({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    const fromAddress = process.env.SMTP_FROM || '"CareerForge Notifications" <notifications@careerforge.com>';

    if (transporter) {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text: text || subject,
      });
      logger.info(`📧 Email sent successfully to ${to} [Message ID: ${info.messageId}]`);
      return true;
    } else {
      // Mock / Log mode when SMTP is not configured
      logger.info(`\n========== 📧 EMAIL NOTIFICATION (MOCK MODE) ==========`);
      logger.info(`TO: ${to}`);
      logger.info(`SUBJECT: ${subject}`);
      logger.info(`BODY HTML:\n${html}`);
      logger.info(`=======================================================\n`);
      return true;
    }
  } catch (error) {
    logger.error(`❌ Failed to send email to ${to}: ${(error as Error).message}`);
    return false;
  }
}
