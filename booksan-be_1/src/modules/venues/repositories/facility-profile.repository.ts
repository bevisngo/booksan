import { Injectable } from '@nestjs/common';
import { FacilityProfile, FacilityPageTemplate, Facility } from '@prisma/client';
import { PrismaService } from '@/core/prisma/prisma.service';
import { BaseRepository } from '@/shared/repositories';

export interface CreateFacilityProfileData {
  facilityId: string;
  templateId?: string;
  customHtml?: string;
  customCss?: string;
  metaTitle?: string;
  metaKeywords?: string[];
  metaDescription?: string;
  openGraphTitle?: string;
  openGraphDesc?: string;
  openGraphImage?: string;
  isCustomized?: boolean;
}

export interface UpdateFacilityProfileData {
  templateId?: string;
  customHtml?: string;
  customCss?: string;
  metaTitle?: string;
  metaKeywords?: string[];
  metaDescription?: string;
  openGraphTitle?: string;
  openGraphDesc?: string;
  openGraphImage?: string;
  isCustomized?: boolean;
}

export interface FacilityProfileFilters {
  id?: string;
  facilityId?: string;
  templateId?: string;
  isCustomized?: boolean;
}

export interface CreateFacilityPageTemplateData {
  name: string;
  description?: string;
  htmlTemplate: string;
  cssTemplate: string;
  jsTemplate?: string;
  previewImage?: string;
  category?: 'BASIC' | 'MODERN' | 'CLASSIC' | 'SPORT_SPECIFIC' | 'PREMIUM';
  isPremium?: boolean;
  isActive?: boolean;
}

export interface UpdateFacilityPageTemplateData {
  name?: string;
  description?: string;
  htmlTemplate?: string;
  cssTemplate?: string;
  jsTemplate?: string;
  previewImage?: string;
  category?: 'BASIC' | 'MODERN' | 'CLASSIC' | 'SPORT_SPECIFIC' | 'PREMIUM';
  isPremium?: boolean;
  isActive?: boolean;
}

export interface FacilityPageTemplateFilters {
  id?: string;
  category?: string;
  isPremium?: boolean;
  isActive?: boolean;
}

type FacilityProfileWithRelations = FacilityProfile & {
  facility?: Facility;
  template?: FacilityPageTemplate | null;
};

@Injectable()
export class FacilityProfileRepository extends BaseRepository<
  FacilityProfile,
  CreateFacilityProfileData,
  UpdateFacilityProfileData,
  FacilityProfileFilters,
  'facilityProfile'
> {
  protected readonly modelName = 'facilityProfile' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByFacilityId(facilityId: string): Promise<FacilityProfileWithRelations | null> {
    return this.prisma.facilityProfile.findUnique({
      where: { facilityId },
      include: {
        facility: true,
        template: true,
      },
    });
  }

  async findByFacilitySlug(slug: string): Promise<FacilityProfileWithRelations | null> {
    return this.prisma.facilityProfile.findFirst({
      where: {
        facility: {
          slug,
        },
      },
      include: {
        facility: {
          include: {
            courts: true,
            openHours: true,
            owner: {
              select: {
                id: true,
                fullname: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        template: true,
      },
    });
  }

  async createForFacility(
    facilityId: string,
    data: Omit<CreateFacilityProfileData, 'facilityId'>,
  ): Promise<FacilityProfile> {
    return this.create({
      facilityId,
      ...data,
    });
  }

  async updateByFacilityId(
    facilityId: string,
    data: UpdateFacilityProfileData,
  ): Promise<FacilityProfile | null> {
    try {
      return await this.prisma.facilityProfile.update({
        where: { facilityId },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  async deleteByFacilityId(facilityId: string): Promise<boolean> {
    try {
      await this.prisma.facilityProfile.delete({
        where: { facilityId },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findProfilesWithTemplate(): Promise<FacilityProfileWithRelations[]> {
    return this.prisma.facilityProfile.findMany({
      where: {
        templateId: { not: null },
      },
      include: {
        facility: true,
        template: true,
      },
    });
  }

  async findCustomizedProfiles(): Promise<FacilityProfileWithRelations[]> {
    return this.prisma.facilityProfile.findMany({
      where: {
        isCustomized: true,
      },
      include: {
        facility: true,
        template: true,
      },
    });
  }
}

@Injectable()
export class FacilityPageTemplateRepository extends BaseRepository<
  FacilityPageTemplate,
  CreateFacilityPageTemplateData,
  UpdateFacilityPageTemplateData,
  FacilityPageTemplateFilters,
  'facilityPageTemplate'
> {
  protected readonly modelName = 'facilityPageTemplate' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findActiveTemplates(): Promise<FacilityPageTemplate[]> {
    return this.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }).then(result => result.data);
  }

  async findByCategory(
    category: 'BASIC' | 'MODERN' | 'CLASSIC' | 'SPORT_SPECIFIC' | 'PREMIUM',
  ): Promise<FacilityPageTemplate[]> {
    return this.findMany({
      where: { category, isActive: true },
      orderBy: { createdAt: 'desc' },
    }).then(result => result.data);
  }

  async findFreeTemplates(): Promise<FacilityPageTemplate[]> {
    return this.findMany({
      where: { isPremium: false, isActive: true },
      orderBy: { createdAt: 'desc' },
    }).then(result => result.data);
  }

  async findPremiumTemplates(): Promise<FacilityPageTemplate[]> {
    return this.findMany({
      where: { isPremium: true, isActive: true },
      orderBy: { createdAt: 'desc' },
    }).then(result => result.data);
  }

  async getTemplateUsageStats(templateId: string): Promise<{
    totalUsage: number;
    activeUsage: number;
  }> {
    const [totalUsage, activeUsage] = await Promise.all([
      this.prisma.facilityProfile.count({
        where: { templateId },
      }),
      this.prisma.facilityProfile.count({
        where: {
          templateId,
          facility: { isPublished: true },
        },
      }),
    ]);

    return { totalUsage, activeUsage };
  }
}
