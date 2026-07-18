import { PrismaClient, Notification, NotificationPreference } from "@prisma/client";

export class NotificationsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
  }): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type
      }
    });
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        emailMarketingEnabled: true,
        emailSecurityEnabled: true,
        emailRemindersEnabled: true,
        inAppAiSuggestion: true
      }
    });
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
    return this.prisma.notificationPreference.update({
      where: { userId },
      data
    });
  }
}
