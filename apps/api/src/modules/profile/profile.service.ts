import { ProfileRepository } from "./profile.repository.js";
import { NotFoundError } from "../../errors/index.js";
import {
  UpdateProfileDto,
  EducationDto,
  ExperienceDto,
  SkillDto,
  LanguageDto,
  SocialLinkDto
} from "./profile.dto.js";

export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: string) {
    const data = await this.profileRepository.getProfileData(userId);
    const completionScore = this.calculateCompletionPercentage(data);

    return {
      id: data.profile?.id,
      email: data.user?.email || "",
      fullName: data.profile?.fullName || data.user?.email?.split("@")[0] || "",
      summary: data.profile?.summary || "",
      phoneNumber: data.profile?.phoneNumber || "",
      location: data.profile?.location || "",
      age: data.age || data.profile?.age || "",
      avatarUrl: data.profile?.avatarUrl || "",
      education: data.education.map((edu: any) => ({
        id: edu.id,
        institution: edu.institution,
        school: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        board: edu.board,
        level: edu.level,
        marks: edu.marks,
        yearOfPassing: edu.yearOfPassing,
        cityState: edu.cityState,
        startDate: edu.startDate ? new Date(edu.startDate).getFullYear().toString() : "",
        endDate: edu.endDate ? new Date(edu.endDate).getFullYear().toString() : ""
      })),
      experiences: data.experience.map((exp: any) => ({
        id: exp.id,
        company: exp.company,
        role: exp.title,
        startDate: exp.startDate ? new Date(exp.startDate).getFullYear().toString() : "",
        endDate: exp.endDate ? new Date(exp.endDate).getFullYear().toString() : "Present",
        description: exp.description
      })),
      skills: data.skills.map((s: any) => s.name),
      languages: data.languages,
      socialLinks: data.socialLinks,
      completionScore
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    return this.profileRepository.updateProfile(userId, data);
  }

  // Education CRUD
  async addEducation(userId: string, data: EducationDto) {
    return this.profileRepository.addEducation(userId, {
      institution: data.institution,
      degree: data.degree,
      fieldOfStudy: data.fieldOfStudy || null,
      board: data.board || null,
      level: data.level || null,
      marks: data.marks || null,
      yearOfPassing: data.yearOfPassing || null,
      cityState: data.cityState || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      isCurrent: data.isCurrent,
      gpa: data.gpa || null,
      description: data.description || null
    });
  }

  async updateEducation(userId: string, id: string, data: Partial<EducationDto>) {
    const profile = await this.profileRepository.getProfileData(userId);
    const exists = profile.education.some(edu => edu.id === id);
    if (!exists) {
      throw new NotFoundError("Education entry not found");
    }

    return this.profileRepository.updateEducation(userId, id, {
      ...(data.institution && { institution: data.institution }),
      ...(data.degree && { degree: data.degree }),
      fieldOfStudy: data.fieldOfStudy !== undefined ? data.fieldOfStudy : undefined,
      startDate: data.startDate,
      endDate: data.endDate !== undefined ? data.endDate : undefined,
      isCurrent: data.isCurrent,
      gpa: data.gpa !== undefined ? data.gpa : undefined,
      description: data.description !== undefined ? data.description : undefined
    });
  }

  async deleteEducation(userId: string, id: string) {
    const profile = await this.profileRepository.getProfileData(userId);
    const exists = profile.education.some(edu => edu.id === id);
    if (!exists) {
      throw new NotFoundError("Education entry not found");
    }

    return this.profileRepository.deleteEducation(userId, id);
  }

  async reorderEducation(userId: string, ids: string[]) {
    return this.profileRepository.reorderEducation(userId, ids);
  }

  // Experience CRUD
  async addExperience(userId: string, data: ExperienceDto) {
    return this.profileRepository.addExperience(userId, {
      company: data.company,
      title: data.title,
      location: data.location || null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      isCurrent: data.isCurrent,
      description: data.description || null
    });
  }

  async updateExperience(userId: string, id: string, data: Partial<ExperienceDto>) {
    const profile = await this.profileRepository.getProfileData(userId);
    const exists = profile.experience.some(exp => exp.id === id);
    if (!exists) {
      throw new NotFoundError("Experience entry not found");
    }

    return this.profileRepository.updateExperience(userId, id, {
      ...(data.company && { company: data.company }),
      ...(data.title && { title: data.title }),
      location: data.location !== undefined ? data.location : undefined,
      startDate: data.startDate,
      endDate: data.endDate !== undefined ? data.endDate : undefined,
      isCurrent: data.isCurrent,
      description: data.description !== undefined ? data.description : undefined
    });
  }

  async deleteExperience(userId: string, id: string) {
    const profile = await this.profileRepository.getProfileData(userId);
    const exists = profile.experience.some(exp => exp.id === id);
    if (!exists) {
      throw new NotFoundError("Experience entry not found");
    }

    return this.profileRepository.deleteExperience(userId, id);
  }

  async reorderExperience(userId: string, ids: string[]) {
    return this.profileRepository.reorderExperience(userId, ids);
  }

  // Skills
  async upsertSkill(userId: string, data: SkillDto) {
    return this.profileRepository.upsertSkill(userId, {
      name: data.name,
      category: data.category || null,
      level: data.level || null
    });
  }

  async deleteSkill(userId: string, name: string) {
    return this.profileRepository.deleteSkill(userId, name);
  }

  // Languages
  async upsertLanguage(userId: string, data: LanguageDto) {
    return this.profileRepository.upsertLanguage(userId, {
      name: data.name,
      proficiency: data.proficiency
    });
  }

  async deleteLanguage(userId: string, name: string) {
    return this.profileRepository.deleteLanguage(userId, name);
  }

  // Social Links
  async upsertSocialLink(userId: string, data: SocialLinkDto) {
    return this.profileRepository.upsertSocialLink(userId, {
      platform: data.platform,
      url: data.url
    });
  }

  async deleteSocialLink(userId: string, platform: string) {
    return this.profileRepository.deleteSocialLink(userId, platform);
  }

  // Helper calculation
  private calculateCompletionPercentage(data: any): number {
    let score = 0;

    // 1. Profile Core (fullName is default so we check if location/summary/phone exists)
    if (data.profile?.fullName) score += 10;
    if (data.profile?.summary && data.profile.summary.length > 10) score += 10;
    if (data.profile?.phoneNumber) score += 5;
    if (data.profile?.location) score += 5;

    // 2. Experience (25%)
    if (data.experience && data.experience.length > 0) {
      score += 25;
    }

    // 3. Education (20%)
    if (data.education && data.education.length > 0) {
      score += 20;
    }

    // 4. Skills (15%) - 5% per skill, capped at 15%
    if (data.skills && data.skills.length > 0) {
      score += Math.min(15, data.skills.length * 5);
    }

    // 5. Social links (5%)
    if (data.socialLinks && data.socialLinks.length > 0) {
      score += 5;
    }

    // 6. Languages (5%)
    if (data.languages && data.languages.length > 0) {
      score += 5;
    }

    return score;
  }
}
