import { Notification, NotificationPreference } from "@prisma/client";
import { NotificationsRepository } from "./notifications.repository.js";

export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "AI_SUGGESTION"
  ): Promise<Notification | null> {
    const prefs = await this.notificationsRepository.getPreferences(userId);

    // If type is AI suggestion and user disabled it, skip creation
    if (type === "AI_SUGGESTION" && !prefs.inAppAiSuggestion) {
      return null;
    }

    // If type is deadline reminder (warning) and user disabled email/inapp reminders, skip if needed,
    // though here we assume in-app reminders are active by default.
    if (type === "WARNING" && !prefs.emailRemindersEnabled) {
      // Still log in-app notifications, but skip email notifications.
    }

    return this.notificationsRepository.create({
      userId,
      title,
      message,
      type
    });
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.findByUser(userId);
  }

  async markNotificationAsRead(id: string, userId: string): Promise<Notification> {
    return this.notificationsRepository.markRead(id, userId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.markAllRead(userId);
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    return this.notificationsRepository.getPreferences(userId);
  }

  async updatePreferences(
    userId: string,
    data: {
      emailMarketingEnabled?: boolean;
      emailSecurityEnabled?: boolean;
      emailRemindersEnabled?: boolean;
      inAppAiSuggestion?: boolean;
    }
  ): Promise<NotificationPreference> {
    return this.notificationsRepository.updatePreferences(userId, data);
  }
}
