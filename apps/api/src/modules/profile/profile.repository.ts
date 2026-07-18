import { PrismaClient, UserProfile, Education, Experience, Skill, Language, SocialLink } from "@prisma/client";

export class ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getProfileData(userId: string) {
    const [profile, education, experience, skills, languages, socialLinks] = await Promise.all([
      this.prisma.userProfile.findUnique({ where: { userId } }),
      this.prisma.education.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } }),
      this.prisma.experience.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } }),
      this.prisma.skill.findMany({ where: { userId } }),
      this.prisma.language.findMany({ where: { userId } }),
      this.prisma.socialLink.findMany({ where: { userId } })
    ]);

    return {
      profile,
      education,
      experience,
      skills,
      languages,
      socialLinks
    };
  }

  async updateProfile(userId: string, data: Partial<Omit<UserProfile, "id" | "userId" | "updatedAt">>): Promise<UserProfile> {
    return this.prisma.userProfile.update({
      where: { userId },
      data
    });
  }

  // Education entries
  async addEducation(userId: string, data: Omit<Education, "id" | "userId" | "sortOrder">): Promise<Education> {
    const count = await this.prisma.education.count({ where: { userId } });
    return this.prisma.education.create({
      data: {
        ...data,
        userId,
        sortOrder: count
      }
    });
  }

  async updateEducation(userId: string, id: string, data: Partial<Omit<Education, "id" | "userId" | "sortOrder">>): Promise<Education> {
    return this.prisma.education.update({
      where: { id, userId },
      data
    });
  }

  async deleteEducation(userId: string, id: string): Promise<Education> {
    return this.prisma.education.delete({
      where: { id, userId }
    });
  }

  async reorderEducation(userId: string, ids: string[]): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.education.update({
          where: { id, userId },
          data: { sortOrder: index }
        })
      )
    );
  }

  // Experience entries
  async addExperience(userId: string, data: Omit<Experience, "id" | "userId" | "sortOrder">): Promise<Experience> {
    const count = await this.prisma.experience.count({ where: { userId } });
    return this.prisma.experience.create({
      data: {
        ...data,
        userId,
        sortOrder: count
      }
    });
  }

  async updateExperience(userId: string, id: string, data: Partial<Omit<Experience, "id" | "userId" | "sortOrder">>): Promise<Experience> {
    return this.prisma.experience.update({
      where: { id, userId },
      data
    });
  }

  async deleteExperience(userId: string, id: string): Promise<Experience> {
    return this.prisma.experience.delete({
      where: { id, userId }
    });
  }

  async reorderExperience(userId: string, ids: string[]): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.experience.update({
          where: { id, userId },
          data: { sortOrder: index }
        })
      )
    );
  }

  // Skills
  async upsertSkill(userId: string, data: Omit<Skill, "id" | "userId">): Promise<Skill> {
    return this.prisma.skill.upsert({
      where: {
        userId_name: { userId, name: data.name }
      },
      update: {
        category: data.category,
        level: data.level
      },
      create: {
        ...data,
        userId
      }
    });
  }

  async deleteSkill(userId: string, name: string): Promise<Skill> {
    return this.prisma.skill.delete({
      where: {
        userId_name: { userId, name }
      }
    });
  }

  // Languages
  async upsertLanguage(userId: string, data: Omit<Language, "id" | "userId">): Promise<Language> {
    return this.prisma.language.upsert({
      where: {
        userId_name: { userId, name: data.name }
      },
      update: {
        proficiency: data.proficiency
      },
      create: {
        ...data,
        userId
      }
    });
  }

  async deleteLanguage(userId: string, name: string): Promise<Language> {
    return this.prisma.language.delete({
      where: {
        userId_name: { userId, name }
      }
    });
  }

  // Social Links
  async upsertSocialLink(userId: string, data: Omit<SocialLink, "id" | "userId">): Promise<SocialLink> {
    return this.prisma.socialLink.upsert({
      where: {
        userId_platform: { userId, platform: data.platform }
      },
      update: {
        url: data.url
      },
      create: {
        ...data,
        userId
      }
    });
  }

  async deleteSocialLink(userId: string, platform: string): Promise<SocialLink> {
    return this.prisma.socialLink.delete({
      where: {
        userId_platform: { userId, platform }
      }
    });
  }
}
